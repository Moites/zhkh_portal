using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ZhkhPortal.Api.Services;
using ZhkhPortal.Api.Domain;

namespace ZhkhPortal.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(UserManager<User> users, TokenService tokens) : ControllerBase
{
    public record RegisterDto(string Phone, string Password, string FirstName, string LastName, string? MiddleName, DateOnly? DateOfBirth);
    public record LoginDto(string Phone, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var phone = NormalizePhone(dto.Phone);
        if (phone is null)
            return BadRequest(new { error = "Некорректный номер телефона" });
        if (string.IsNullOrWhiteSpace(dto.FirstName))
            return BadRequest(new { error = "Укажите имя" });
        if (string.IsNullOrWhiteSpace(dto.LastName))
            return BadRequest(new { error = "Укажите фамилию" });
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            return BadRequest(new { error = "Пароль должен быть не менее 6 символов" });

        var user = new User
        {
            UserName = phone,
            PhoneNumber = phone,
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            MiddleName = dto.MiddleName?.Trim(),
            DateOfBirth = dto.DateOfBirth,
            Role = UserRole.citizen
        };

        var result = await users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        return Ok(new { token = tokens.Create(user), user = ToDto(user) });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var phone = NormalizePhone(dto.Phone);
        var user = phone is null ? null : await users.FindByNameAsync(phone);

        if (user is null || !await users.CheckPasswordAsync(user, dto.Password))
            return Unauthorized(new { error = "Неверный номер или пароль" });

        return Ok(new { token = tokens.Create(user), user = ToDto(user) });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = id is null ? null : await users.FindByIdAsync(id);
        return user is null ? Unauthorized() : Ok(ToDto(user));
    }

    private static object ToDto(User u) =>
        new { u.Id, u.FirstName, u.LastName, u.MiddleName, u.DateOfBirth, phone = u.PhoneNumber, role = u.Role.ToString() };
    private static string? NormalizePhone(string? raw)
    {
        var digits = new string((raw ?? "").Where(char.IsDigit).ToArray());
        return digits.Length is >= 10 and <= 15 ? digits : null;
    }

    [HttpPost("register_worker")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> RegisterWorker(RegisterDto dto)
    {
        var phone = NormalizePhone(dto.Phone);
        if (phone is null)
            return BadRequest(new { error = "Некорректный номер телефона" });
        if (string.IsNullOrWhiteSpace(dto.FirstName))
            return BadRequest(new { error = "Укажите имя" });
        if (string.IsNullOrWhiteSpace(dto.LastName))
            return BadRequest(new { error = "Укажите фамилию" });
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            return BadRequest(new { error = "Пароль должен быть не менее 6 символов" });
        if (dto.DateOfBirth is null)
            return BadRequest(new { error = "Укажите дату рождения" });

        var user = new User
        {
            UserName = phone,
            PhoneNumber = phone,
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            MiddleName = dto.MiddleName?.Trim(),
            DateOfBirth = dto.DateOfBirth,
            Role = UserRole.worker
        };

        var result = await users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        return Ok(new { token = tokens.Create(user), user = ToDto(user) });
    }
}