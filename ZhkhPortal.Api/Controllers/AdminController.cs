using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        if (request != null)
        {
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
        var request = await db.ServiceRequests.FindAsync(dto.RequestId);

        if (request != null)
        {
            request.Status = Enum.Parse<RequestStatus>(dto.Status.ToString());
            await db.SaveChangesAsync();
            return Ok("Статус заявки успешно изменен");
        }
        else
        {
            return NotFound(new { error = "Заявка не найдена" });
        }
    }
}