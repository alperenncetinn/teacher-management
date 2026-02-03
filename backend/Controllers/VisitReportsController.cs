using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StajYonetim.API.Data;
using StajYonetim.API.Models;
using System.Security.Claims;

namespace StajYonetim.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VisitReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VisitReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var query = _context.VisitReports
                .Include(v => v.Teacher)
                .Include(v => v.Student).ThenInclude(s => s.User)
                .Include(v => v.Company)
                .AsQueryable();

            if (role == "Teacher")
            {
                query = query.Where(v => v.TeacherId == userId);
            }

            var list = await query.OrderBy(v => v.VisitDate).ToListAsync();
            return Ok(list);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Create([FromBody] StajYonetim.API.DTOs.VisitReportDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var visit = new VisitReport
            {
                TeacherId = userId,
                StudentId = dto.StudentId,
                CompanyId = dto.CompanyId,
                VisitDate = dto.VisitDate,
                Note = dto.Note ?? string.Empty
            };

            _context.VisitReports.Add(visit);
            await _context.SaveChangesAsync();

            var result = await _context.VisitReports
                .Include(v => v.Teacher)
                .Include(v => v.Student).ThenInclude(s => s.User)
                .Include(v => v.Company)
                .FirstOrDefaultAsync(v => v.Id == visit.Id);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var visit = await _context.VisitReports.FindAsync(id);
            if (visit == null) return NotFound();

            _context.VisitReports.Remove(visit);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
