using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ZhkhPortal.Api.Domain;

namespace ZhkhPortal.Api.Infrastructure;

public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>().HasIndex(u => u.PhoneNumber).IsUnique();

        builder.Entity<ServiceRequest>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(4000);
            e.Property(x => x.Address).HasMaxLength(300);

            e.HasOne(x => x.Author).WithMany()
                .HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.AssignedWorker).WithMany()
                .HasForeignKey(x => x.AssignedWorkerId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
