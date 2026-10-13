using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZhkhPortal.Api.Domain;
using ZhkhPortal.Api.Infrastructure;

namespace ZhkhPortal.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController(AppDbContext db) : ControllerBase
{
    public record AppointWorkerDto(Guid RequestId, Guid WorkerId);
    public record ChangeInformationDto(Guid RequestId, int Status, int Priority, int Complexity, int Specialization);

    public class ChangeInformationDtoValidator : AbstractValidator<ChangeInformationDto>
    {
        public ChangeInformationDtoValidator()
        {
            RuleFor(x => x.RequestId).NotEmpty().WithMessage("Укажите заявку");
            RuleFor(x => x.Status).Must(v => Enum.IsDefined(typeof(RequestStatus), v))
                .WithMessage("Недопустимый статус");
            RuleFor(x => x.Priority).Must(v => Enum.IsDefined(typeof(RequestPriority), v))
                .WithMessage("Недопустимый приоритет");
            RuleFor(x => x.Complexity).Must(v => Enum.IsDefined(typeof(RequestComplexity), v))
                .WithMessage("Недопустимая сложность");
            RuleFor(x => x.Specialization).Must(v => Enum.IsDefined(typeof(SpecializationType), v))
                .WithMessage("Недопустимая специальность");
        }
    }

    [HttpPost("appoint_worker")]
    public async Task<IActionResult> AppointWorker([FromBody] AppointWorkerDto dto)
    {
        var request = await db.ServiceRequests.FindAsync(dto.RequestId);
        if (request is null)
            return NotFound(new { error = "Заявка не найдена" });

        var worker = await db.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == dto.WorkerId && u.Role == UserRole.worker);
        if (worker is null)
            return NotFound(new { error = "Работник не найден" });

        request.AssignedWorkerId = worker.Id;
        if (request.Status == RequestStatus.New)
            request.Status = RequestStatus.Assigned;

        await db.SaveChangesAsync();
        return Ok(new { message = "Работник назначен на заявку" });
    }

    [HttpPost("change_information")]
    public async Task<IActionResult> ChangeInformation(
        [FromBody] ChangeInformationDto dto,
        [FromServices] IValidator<ChangeInformationDto> validator)
    {
        var result = await validator.ValidateAsync(dto);
        if (!result.IsValid)
            return BadRequest(result.ToDictionary());

        var request = await db.ServiceRequests.FindAsync(dto.RequestId);
        if (request is null)
            return NotFound(new { error = "Заявка не найдена" });

        var status = (RequestStatus)dto.Status;
        request.Status = status;
        request.Priority = (RequestPriority)dto.Priority;
        request.Complexity = (RequestComplexity)dto.Complexity;
        request.Specialization = (SpecializationType)dto.Specialization;
        request.NeedsReview = false;
        request.DoneAt = status is RequestStatus.Completed or RequestStatus.Rejected
            ? request.DoneAt ?? DateTime.UtcNow
            : null;

        await db.SaveChangesAsync();
        return Ok(new { message = "Заявка обновлена" });
    }
}