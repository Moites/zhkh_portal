using Microsoft.AspNetCore.Identity;

namespace ZhkhPortal.Api.Domain

{
    public class User : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? MiddleName { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public UserRole Role { get; set; }
        public SpecializationType? Specialization { get; set; }
    }
}