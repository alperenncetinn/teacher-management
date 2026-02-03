using Microsoft.EntityFrameworkCore;
using StajYonetim.API.Models;

namespace StajYonetim.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<CompanyUser> CompanyUsers { get; set; }
        public DbSet<Placement> Placements { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<VisitReport> VisitReports { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Enums as strings
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            // Complex Types / JSON
            // For MVP lists, usually we normalize or use JSONb in Postgres.
            // EF Core 8 supports primitive collections.
            modelBuilder.Entity<Student>()
                 .Property(e => e.SchoolDays)
                 .HasColumnType("integer[]"); // Stored as array of ints (DayOfWeek enum values)

            modelBuilder.Entity<Company>()
                .Property(e => e.AcceptedFields)
                .HasColumnType("text[]");

            modelBuilder.Entity<Company>()
                .Property(e => e.OperatingDays)
                .HasColumnType("integer[]");

            modelBuilder.Entity<Placement>()
                .Property(e => e.InternDays)
                .HasColumnType("integer[]");

            modelBuilder.Entity<User>()
                .Property(e => e.InspectionDays)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<DayOfWeek>>(v, (System.Text.Json.JsonSerializerOptions)null) ?? new List<DayOfWeek>()
                );

            // Relationships
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<Student>()
                .HasOne(s => s.User)
                .WithOne(u => u.StudentProfile)
                .HasForeignKey<Student>(s => s.UserId);

            modelBuilder.Entity<CompanyUser>()
                .HasOne(c => c.User)
                .WithOne(u => u.CompanyUserProfile)
                .HasForeignKey<CompanyUser>(c => c.UserId);
        }
    }
}
