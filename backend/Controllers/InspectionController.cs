using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StajYonetim.API.Data;
using System.Security.Claims;

namespace StajYonetim.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InspectionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InspectionController(AppDbContext context)
        {
            _context = context;
        }

        // Get teacher's inspection schedule
        [HttpGet("schedule")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetMySchedule()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            var teacher = await _context.Users.FindAsync(userId);
            if (teacher == null) return NotFound();

            var placements = await _context.Placements
                .Include(p => p.Student).ThenInclude(s => s.User)
                .Include(p => p.Company)
                .Where(p => p.TeacherId == userId)
                .ToListAsync();

            return Ok(new
            {
                InspectionDays = teacher.InspectionDays,
                AssignedPlacements = placements
            });
        }

        // Update teacher's inspection days
        [HttpPatch("schedule")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateSchedule([FromBody] StajYonetim.API.DTOs.UpdateInspectionDaysDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            var teacher = await _context.Users.FindAsync(userId);
            if (teacher == null) return NotFound();

            teacher.InspectionDays = dto.InspectionDays.Select(d => (DayOfWeek)d).ToList();
            await _context.SaveChangesAsync();

            return Ok(new { InspectionDays = teacher.InspectionDays });
        }

        // Get all teachers with their inspection schedules (for admin)
        [HttpGet("all-schedules")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllSchedules()
        {
            var teachers = await _context.Users
                .Where(u => u.Role == Models.UserRole.Teacher)
                .ToListAsync();

            var result = new List<object>();

            foreach (var teacher in teachers)
            {
                var placements = await _context.Placements
                    .Include(p => p.Student).ThenInclude(s => s.User)
                    .Include(p => p.Company)
                    .Where(p => p.TeacherId == teacher.Id)
                    .ToListAsync();

                result.Add(new
                {
                    TeacherId = teacher.Id,
                    TeacherName = teacher.FullName,
                    InspectionDays = teacher.InspectionDays,
                    AssignedCompanies = placements.Select(p => new
                    {
                        CompanyId = p.CompanyId,
                        CompanyName = p.Company.Name,
                        StudentName = p.Student.User.FullName
                    }).ToList()
                });
            }

            return Ok(result);
        }
    }
}
