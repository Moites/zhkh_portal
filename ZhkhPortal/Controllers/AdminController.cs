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

    [HttpPost("appoint_worker")]
    public async Task<IActionResult> AppointWorker([FromBody] AppointWorkerDto dto)
    {
        var request = await db.ServiceRequests.FindAsync(dto.RequestId);
        var worker = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == dto.WorkerId && u.Role == UserRole.worker);

        if (request is null)
        {
            if (worker is null)
                return NotFound(new { error = "Работник не найден" });
            request.AssignedWorkerId = dto.WorkerId;
            await db.SaveChangesAsync();
            return Ok("Работник успешно назначен на заявку");
        }
        else
        {
            return NotFound(new { error = "Заявка не найдена" });
        }
    }

    public class UpdateRequestDtoValidator : AbstractValidator<UpdateRequestDto>
    {
        public UpdateRequestDtoValidator()
        {
            RuleFor(X => x.request)
                .IsInEnum().WithMessage("Заявка не найдена");

            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Недопустимый статус");

            RuleFor(x => x.Priority)
                .IsInEnum().WithMessage("Недопустимый приоритет");

            RuleFor(x => x.Complexity)
                .IsInEnum().WithMessage("Недопустимая сложность");

            RuleFor(x => x.Specialization)
                .IsInEnum().WithMessage("Недопустимая специальность");
        }
    }

    [HttpPost("change_information")]
    public async Task<IActionResult> ChangeStatus([FromBody] ChangeStatusDto dto, IValidator<UpdateRequestDto> validator)
    {
        var result = await validator.ValidateAsync(dto);
        if (!result.IsValid)
            return BadRequest(result.ToDictionary());

        var request = await db.ServiceRequests.FindAsync(dto.RequestId);
        if (request is null)
        {
            return NotFound(new { error = "Заявка не найдена" });
        }
        else
        {
            var status = (RequestStatus)dto.Status;
            var priority = (RequestPriority)dto.Priority;
            var complexity = (RequestComplexity)dto.Complexity;
            var specialization = (SpecializationType)dto.SpecializationType;
            request.Status = status;
            request.DoneAt = status is RequestStatus.Assigned or RequestStatus.InProgress
                ? (request.DoneAt == default ? DateTime.UtcNow : request.DoneAt)
                : default;
            await db.SaveChangesAsync();
            return Ok("Статус заявки успешно изменен");
        }
    }
}