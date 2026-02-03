using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StajYonetim.API.Data;
using StajYonetim.API.DTOs;
using StajYonetim.API.Services;
using System.Security.Claims;

namespace StajYonetim.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlacementsController : ControllerBase
    {
        private readonly PlacementService _service;
        private readonly AppDbContext _context;

        public PlacementsController(PlacementService service, AppDbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Create([FromBody] PlacementCreateDto dto)
        {
            // Set TeacherId from Header if not sent, or validate
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            // If Teacher is creating, they are the coordinator
            dto.TeacherId = userId; 

            var result = await _service.CreatePlacementAsync(dto);
            if (!result.Success) return BadRequest(result);

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // MVP: Return all or filter by Role
            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var query = _context.Placements
                .Include(p => p.Student).ThenInclude(s => s.User)
                .Include(p => p.Company)
                .Include(p => p.Teacher)
                .AsQueryable();

            if (role == "Student")
            {
                // Find StudentId from UserId
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student != null) query = query.Where(p => p.StudentId == student.Id);
            }
            else if (role == "CompanyUser")
            {
                var cu = await _context.CompanyUsers.FirstOrDefaultAsync(c => c.UserId == userId);
                if (cu != null) query = query.Where(p => p.CompanyId == cu.CompanyId);
            }
            // Teachers/Admins see all

            var list = await query.ToListAsync();
            return Ok(list);
        }

        [HttpPost("{id}/rate")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> RateCompany(int id, [FromBody] StajYonetim.API.DTOs.RateCompanyDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            
            if (student == null) return Unauthorized();

            var placement = await _context.Placements.FirstOrDefaultAsync(p => p.Id == id && p.StudentId == student.Id);
            if (placement == null) return NotFound("Placement not found or unauthorized.");

            placement.StudentRating = dto.Rating;
            placement.StudentComment = dto.Comment;

            await _context.SaveChangesAsync();
            return Ok(placement);
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdatePlacement(int id, [FromBody] PlacementUpdateDto dto)
        {
            var placement = await _context.Placements.FindAsync(id);
            if (placement == null) return NotFound();

            if (dto.CompanyId.HasValue)
                placement.CompanyId = dto.CompanyId.Value;
            
            if (dto.StartDate.HasValue)
                placement.StartDate = dto.StartDate.Value;
            
            if (dto.EndDate.HasValue)
                placement.EndDate = dto.EndDate.Value;

            await _context.SaveChangesAsync();
            
            // Return updated placement with includes
            var updated = await _context.Placements
                .Include(p => p.Student).ThenInclude(s => s.User)
                .Include(p => p.Company)
                .Include(p => p.Teacher)
                .FirstOrDefaultAsync(p => p.Id == id);
            
            return Ok(updated);
        }
    }
}
