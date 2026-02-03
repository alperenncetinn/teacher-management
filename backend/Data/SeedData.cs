using StajYonetim.API.Models;
using BCrypt.Net;

namespace StajYonetim.API.Data
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            if (context.Users.Any()) return; // DB has been seeded

            var passwordHash = BCrypt.Net.BCrypt.HashPassword("admin123");

            // 1. Admin
            var admin = new User { 
                Email = "admin@staj.com", 
                PasswordHash = passwordHash, 
                FullName = "Admin User", 
                Role = UserRole.Admin,
                 InspectionDays = new List<DayOfWeek>() // Admin doesn't do inspection usually, or default empty
            };
            context.Users.Add(admin);
            context.SaveChanges();
        }
    }
}
