using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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
    public record ChangeInformationDto(
        Guid RequestId,
        int Status,
        int Priority,
        int Complexity,
        int Specialization,
        string? Title = null,
        string? Description = null,
        string? Address = null);

    public record PromoteWorkerDto(Guid UserId, int Specialization);
    public record CreateWorkerDto(
        string FirstName,
        string LastName,
        string? MiddleName,
        DateOnly DateOfBirth,
        string Phone,
        string Password,
        int Specialization);

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

    private readonly record struct DobAdapter(DateOnly Value)
    {
        public static implicit operator DateOnly(DobAdapter a) => a.Value;
        public static implicit operator DateTime(DobAdapter a) => a.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
    }

    private static TUser NewUser<TUser>(DbSet<TUser> _) where TUser : class, new() => new();

    private UserManager<TUser> ResolveUserManager<TUser>(DbSet<TUser> _) where TUser : class
        => HttpContext.RequestServices.GetRequiredService<UserManager<TUser>>();

    [HttpGet("workers")]
    public async Task<IActionResult> GetWorkers()
    {
        var workers = await db.Users
            .AsNoTracking()
            .Where(u => u.Role == UserRole.worker)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.MiddleName,
                u.DateOfBirth,
                Phone = u.UserName ?? u.PhoneNumber ?? "",
                Role = u.Role.ToString(),
                Specialization = u.Specialization != null ? u.Specialization.ToString() : null
            })
            .ToListAsync();

        return Ok(workers);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await db.Users
            .AsNoTracking()
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.MiddleName,
                u.DateOfBirth,
                Phone = u.UserName ?? u.PhoneNumber ?? "",
                Role = u.Role.ToString(),
                Specialization = u.Specialization != null ? u.Specialization.ToString() : null
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("create_worker")]
    public async Task<IActionResult> CreateWorker([FromBody] CreateWorkerDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) ||
            string.IsNullOrWhiteSpace(dto.LastName) ||
            string.IsNullOrWhiteSpace(dto.Phone) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { error = "Заполните все обязательные поля" });
        }

        if (!Enum.IsDefined(typeof(SpecializationType), dto.Specialization))
            return BadRequest(new { error = "Недопустимая специальность" });

        var phone = dto.Phone.Trim();
        var exists = await db.Users.AnyAsync(u => u.UserName == phone || u.PhoneNumber == phone);
        if (exists)
            return Conflict(new { error = "Пользователь с таким номером телефона уже зарегистрирован" });

        var user = NewUser(db.Users);
        user.Id = Guid.NewGuid();
        user.UserName = phone;
        user.PhoneNumber = phone;
        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        user.MiddleName = string.IsNullOrWhiteSpace(dto.MiddleName) ? string.Empty : dto.MiddleName.Trim();
        user.DateOfBirth = new DobAdapter(dto.DateOfBirth);
        user.Role = UserRole.worker;
        user.Specialization = (SpecializationType)dto.Specialization;

        var userManager = ResolveUserManager(db.Users);
        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errorMsg = string.Join("; ", result.Errors.Select(e => e.Description));
            return BadRequest(new { error = string.IsNullOrWhiteSpace(errorMsg) ? "Не удалось создать сотрудника" : errorMsg });
        }

        return Ok(new { message = "Сотрудник успешно создан", id = user.Id });
    }

    [HttpPost("promote_worker")]
    public async Task<IActionResult> PromoteWorker([FromBody] PromoteWorkerDto dto)
    {
        if (!Enum.IsDefined(typeof(SpecializationType), dto.Specialization))
            return BadRequest(new { error = "Недопустимая специальность" });

        var user = await db.Users.FindAsync(dto.UserId);
        if (user is null)
            return NotFound(new { error = "Пользователь не найден" });

        user.Role = UserRole.worker;
        user.Specialization = (SpecializationType)dto.Specialization;

        await db.SaveChangesAsync();
        return Ok(new { message = "Настройки сотрудника сохранены" });
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

        if (!string.IsNullOrWhiteSpace(dto.Title))
            request.Title = dto.Title.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Description))
            request.Description = dto.Description.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Address))
            request.Address = dto.Address.Trim();

        var status = (RequestStatus)dto.Status;
        var newSpec = (SpecializationType)dto.Specialization;
        var specChanged = request.Specialization != newSpec;

        request.Status = status;
        request.Priority = (RequestPriority)dto.Priority;
        request.Complexity = (RequestComplexity)dto.Complexity;
        request.Specialization = newSpec;
        request.NeedsReview = false;

        // Если заявка не отменена и не завершена, но нет работника (или сменилась специальность) — автоназначаем самого свободного
        if (status is not (RequestStatus.Completed or RequestStatus.Rejected) &&
            (request.AssignedWorkerId is null || specChanged))
        {
            var leastLoadedWorker = await db.Users
                .AsNoTracking()
                .Where(u => u.Role == UserRole.worker && u.Specialization == newSpec)
                .Select(u => new
                {
                    u.Id,
                    ActiveCount = db.ServiceRequests.Count(r =>
                        r.AssignedWorkerId == u.Id &&
                        (r.Status == RequestStatus.Assigned || r.Status == RequestStatus.InProgress)),
                    TotalCount = db.ServiceRequests.Count(r => r.AssignedWorkerId == u.Id)
                })
                .OrderBy(w => w.ActiveCount)
                .ThenBy(w => w.TotalCount)
                .FirstOrDefaultAsync();

            if (leastLoadedWorker is not null)
            {
                request.AssignedWorkerId = leastLoadedWorker.Id;
                if (request.Status == RequestStatus.New)
                    request.Status = RequestStatus.Assigned;
            }
        }

        request.DoneAt = status is RequestStatus.Completed or RequestStatus.Rejected
            ? request.DoneAt ?? DateTime.UtcNow
            : null;

        await db.SaveChangesAsync();
        return Ok(new { message = "Заявка обновлена" });
    }
}