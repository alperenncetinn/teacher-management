using StajYonetim.API.Models;
using BCrypt.Net;

namespace StajYonetim.API.Data
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            if (context.Users.Any()) return; // DB has been seeded

            var passwordHash = BCrypt.Net.BCrypt.HashPassword("123456");

            // 1. Admin
            var admin = new User { Email = "admin@staj.com", PasswordHash = passwordHash, FullName = "Admin User", Role = UserRole.Admin };
            context.Users.Add(admin);

            // 2. Teachers
            var teacher1 = new User { Email = "teacher1@staj.com", PasswordHash = passwordHash, FullName = "Ayse Teacher", Role = UserRole.Teacher };
            var teacher2 = new User { Email = "teacher2@staj.com", PasswordHash = passwordHash, FullName = "Mehmet Teacher", Role = UserRole.Teacher };
            context.Users.AddRange(teacher1, teacher2);

            // 3. Companies
            var comp1 = new Company { Name = "Tech Corp", Address = "Teknopark", Quota = 2, AcceptedFields = new() { "Bilişim" }, OperatingDays = new() { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday } };
            var comp2 = new Company { Name = "Electro San", Address = "OSB", Quota = 5, AcceptedFields = new() { "Elektrik", "Elektronik" }, OperatingDays = new() { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday } };
            var comp3 = new Company { Name = "Soft House", Address = "Plaza", Quota = 1, AcceptedFields = new() { "Bilişim" }, OperatingDays = new() { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday } };
            context.Companies.AddRange(comp1, comp2, comp3);
            context.SaveChanges();

            // 4. Company Users
            var cu1 = new User { Email = "comp1@staj.com", PasswordHash = passwordHash, FullName = "Tech Manager", Role = UserRole.CompanyUser };
            var cu2 = new User { Email = "comp2@staj.com", PasswordHash = passwordHash, FullName = "Electro Boss", Role = UserRole.CompanyUser };
            context.Users.AddRange(cu1, cu2);
            context.SaveChanges();

            context.CompanyUsers.Add(new CompanyUser { UserId = cu1.Id, CompanyId = comp1.Id });
            context.CompanyUsers.Add(new CompanyUser { UserId = cu2.Id, CompanyId = comp2.Id });

            // 5. Students
            var students = new List<Student>();
            for (int i = 1; i <= 10; i++)
            {
                var sDir = i <= 5 ? "Bilişim" : "Elektrik";
                var u = new User { Email = $"student{i}@staj.com", PasswordHash = passwordHash, FullName = $"Student {i}", Role = UserRole.Student };
                context.Users.Add(u);
                context.SaveChanges();

                students.Add(new Student 
                { 
                    UserId = u.Id, 
                    SchoolNumber = $"2024{i:000}", 
                    FieldOfStudy = sDir, 
                    SubField = "Genel", 
                    ClassName = "12-A",
                    SchoolDays = new() { DayOfWeek.Monday, DayOfWeek.Tuesday } // School Mon/Tue, so free Wed/Thu/Fri
                });
            }
            context.Students.AddRange(students);
            context.SaveChanges();
        }
    }
}
