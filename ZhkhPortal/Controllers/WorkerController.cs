using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZhkhPortal.Api.Domain;
using ZhkhPortal.Api.Infrastructure;
using ZhkhPortal.Api.Services;

namespace ZhkhPortal.Api.Controllers;

[ApiController]
[Route("api/worker")]
[Authorize(Roles = "worker")]
public class WorkerController(AppDbContext db) : ControllerBase
{
    public record ExecutionRequest (Guid RequestId);

    private Guid? GetUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var id) ? id : null;
    }

    [HttpPost("execution_request")]
    public async Task<IActionResult> PostExecutionRequest([FromBody] ExecutionRequest dto, CancellationToken ct)
    {
        if (GetUserId() is not Guid userId) return Unauthorized(new { error = "Пользователь не аутентифицирован" });

        var affected = await db.ServiceRequests
            .Where(r => r.Id == dto.RequestId
                     && r.AssignedWorkerId == null
                     && r.Status == RequestStatus.New)
            .ExecuteUpdateAsync(s => s
                .SetProperty(r => r.AssignedWorkerId, userId)
                .SetProperty(r => r.Status, RequestStatus.InProgress), ct);

        if (affected == 1)
            return Ok(new { message = "Заявка взята в работу" });

        var exists = await db.ServiceRequests.AnyAsync(r => r.Id == dto.RequestId, ct);
        return exists
            ? Conflict(new { error = "Заявка уже назначена на другого работника" })
            : NotFound(new { error = "Заявка не найдена" });
    }

    [HttpPost("taking_request")]
    public async Task<IActionResult> PostTakingRequest([FromBody] ExecutionRequest dto, CancellationToken ct)
    {
        if (GetUserId() is not Guid userId) return Unauthorized(new { error = "Пользователь не аутентифицирован" });

        var request = await db.ServiceRequests
            .FirstOrDefaultAsync(r => r.Id == dto.RequestId, ct);

        if (request is null)
            return NotFound(new { error = "Заявка не найдена" });

        if (request.AssignedWorkerId != userId)
            return StatusCode(StatusCodes.Status403Forbidden,
                new { error = "Эта заявка закреплена за другим работником" });

        if (request.Status != RequestStatus.InProgress)
            return Conflict(new { error = "Заявка не находится в работе" });

        request.Status = RequestStatus.Completed;
        request.DoneAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return Ok(new { message = "Заявка выполнена" });
    }
}
