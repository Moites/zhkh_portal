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
    public record ChangeStatusDto(Guid RequestId, int Status);

    [HttpPost("appoint_worker")]
    public async Task<IActionResult> AppointWorker([FromBody] AppointWorkerDto dto)
    {
        var request = await db.ServiceRequests.FindAsync(dto.RequestId);
        var worker = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == dto.WorkerId && u.Role == UserRole.worker);

        if (request != null)
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

    [HttpPost("change_status")]
    public async Task<IActionResult> ChangeStatus([FromBody] ChangeStatusDto dto)
    {
        if (!Enum.IsDefined(typeof(RequestStatus), dto.Status))
        {
            return BadRequest(new { error = "Недопустимый статус заявки" });
        }

        var request = await db.ServiceRequests.FindAsync(dto.RequestId);
        if (request is null)
        {
            return NotFound(new { error = "Заявка не найдена" });
        }
        else
        {
            var status = (RequestStatus)dto.Status;
            request.Status = status;
            request.DoneAt = status is RequestStatus.Assigned or RequestStatus.InProgress
                ? (request.DoneAt == default ? DateTime.UtcNow : request.DoneAt)
                : default;
            await db.SaveChangesAsync();
            return Ok("Статус заявки успешно изменен");
        }
    }
}