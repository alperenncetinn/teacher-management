using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StajYonetim.API.Data;
using StajYonetim.API.Models;
using StajYonetim.API.DTOs;

namespace StajYonetim.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttendanceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{studentId}")]
        public async Task<IActionResult> GetStudentAttendance(int studentId)
        {
            var records = await _context.Attendances
                .Where(a => a.StudentId == studentId)
                .OrderByDescending(a => a.Date)
                .ToListAsync();
            return Ok(records);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Teacher,CompanyUser")]
        public async Task<IActionResult> Create([FromBody] AttendanceDto dto)
        {
            // Only allow one record per day per student
            var exists = await _context.Attendances
                .AnyAsync(a => a.StudentId == dto.StudentId && a.Date.Date == dto.Date.Date);
            
            if (exists) return BadRequest("Attendance for this date already exists.");

            var attendance = new Attendance
            {
                StudentId = dto.StudentId,
                Date = dto.Date,
                IsPresent = dto.IsPresent,
                Note = dto.Note
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();
            return Ok(attendance);
        }
        
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var record = await _context.Attendances.FindAsync(id);
            if (record == null) return NotFound();
            
            _context.Attendances.Remove(record);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
