using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZhkhPortal.Api.Domain;
using ZhkhPortal.Api.Infrastructure;
using ZhkhPortal.Api.Services;

namespace ZhkhPortal.Api.Controllers;

[ApiController]
[Route("api/request")]
[Authorize]
public class RequestController(AppDbContext db, MlClient mlClient) : ControllerBase
{
    public record CreateRequestDto(string Title, string Description, string Address);

    public record RequestDto(Guid Id, DateTime CreatedAt, DateTime? DoneAt, string Title, string Description, string Address, 
    string Status, string Priority, string Complexity, string Specialization, Guid? AuthorId, Guid? AssignedWorkerId);

    private static RequestDto ToDto(ServiceRequest request) => new(
        request.Id,
        request.CreatedAt,
        request.DoneAt,
        request.Title,
        request.Description,
        request.Address,
        request.Status.ToString(),
        request.Priority.ToString(),
        request.Complexity.ToString(),
        request.Specialization?.ToString() ?? "General",
        request.AuthorId,
        request.AssignedWorkerId
    );

    private const string SpecializationClaimType = "specialization_type";

    private Guid? GetUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var id) ? id : null;
    }

    private SpecializationType? GetWorkerSpecializationType()
    {
        var specialization = User.FindFirstValue(SpecializationClaimType);
        if (string.IsNullOrWhiteSpace(specialization))
            return null;

        return Enum.TryParse<SpecializationType>(specialization.Trim(), true, out var specializationType)
            ? specializationType
            : null;
    }

    [HttpGet("get_requests")]
    public async Task<IActionResult> GetUserRequests()
    {
        if (GetUserId() is not Guid userId) return Unauthorized(new { error = "Пользователь не аутентифицирован" });

        var requests = await db.ServiceRequests
            .Where(r => r.AuthorId == userId)
            .ToListAsync();
        return Ok(requests.Select(ToDto));
    }

    [HttpGet("get_requests/worker")]
    [Authorize(Roles = "worker")]
    public async Task<IActionResult> GetWorkerRequests()
    {
        if (GetUserId() is not Guid userId) return Unauthorized(new { error = "Пользователь не аутентифицирован" });

        var requests = await db.ServiceRequests
            .Where(r => r.AssignedWorkerId == userId)
            .ToListAsync();
        return Ok(requests.Select(ToDto));
    }

    [HttpGet("get_requests/worker_spec")]
    [Authorize(Roles = "worker")]
    public async Task<IActionResult> GetWorkerSpecializationRequests()
    {
        if (GetUserId() is not Guid userId) return Unauthorized(new { error = "Пользователь не аутентифицирован" });
        if (GetWorkerSpecializationType() is not SpecializationType specialization) return Unauthorized(new { error = "У работника нет специальности" });

        var requests = await db.ServiceRequests
            .Where(r => r.Specialization == specialization)
            .ToListAsync();
        return Ok(requests.Select(ToDto));
    }


    [HttpGet("get_requests/admin")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAdminRequests()
    {
        var requests = await db.ServiceRequests
            .ToListAsync();
        return Ok(requests.Select(ToDto));
    }

    [HttpGet("get_requests/admin_review")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAdminReviewRequests()
    {
        var requests = await db.ServiceRequests
            .Where(r => r.NeedsReview == true)
            .ToListAsync();
        return Ok(requests.Select(ToDto));
    }

    [HttpPost("create_request")]
    public async Task<IActionResult> CreateRequest(CreateRequestDto dto)
    {
        if (GetUserId() is not Guid userId) return Unauthorized(new { error = "Пользователь не аутентифицирован" });

        var title = dto.Title?.Trim() ?? "";
        var description = dto.Description?.Trim() ?? "";
        var address = dto.Address?.Trim() ?? "";

        if (title.Length < 10 || title.Length > 150)
            return BadRequest(new { error = "Заголовок должен содержать от 10 до 150 символов" });
        if (description.Length < 50 || description.Length > 800)
            return BadRequest(new { error = "Описание должно содержать от 50 до 800 символов" });
        if (address.Length < 10 || address.Length > 200)
            return BadRequest(new { error = "Адрес должен содержать от 10 до 200 символов" });

        var request = new ServiceRequest
        {
            AuthorId = userId,
            Title = title,
            Description = description,
            Address = address
        };

        var ml = await mlClient.PredictAsync(title, description);
        if (ml is not null)
        {
            if (Enum.TryParse<RequestPriority>(ml.Priority, out var p)) request.Priority = p;
            if (Enum.TryParse<RequestComplexity>(ml.Complexity, out var c)) request.Complexity = c;
            if (Enum.TryParse<SpecializationType>(ml.Specialization, out var s)) request.Specialization = s;
        }

        request.NeedsReview = ml is null || ml.NeedsReview;
        if (!request.NeedsReview)
            request.Status = RequestStatus.Assigned;

        db.ServiceRequests.Add(request);
        await db.SaveChangesAsync();
        return Ok(ToDto(request));
    }
}
