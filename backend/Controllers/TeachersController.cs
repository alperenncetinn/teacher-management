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
    [Authorize(Roles = "Admin")]
    public class TeachersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TeachersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var teachers = await _context.Users
                .Where(u => u.Role == UserRole.Teacher)
                .Select(u => new 
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.CreatedAt
                })
                .ToListAsync();
                
            return Ok(teachers);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TeacherCreateDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email already exists.");

            var user = new User
            {
                Email = dto.Email,
                FullName = dto.FullName,
                Role = UserRole.Teacher,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.Role != UserRole.Teacher) return NotFound();

            // Check if teacher has any placements (optional business rule)
            var hasPlacements = await _context.Placements.AnyAsync(p => p.TeacherId == id);
            if (hasPlacements)
                return BadRequest("Bu öğretmene bağlı staj atamaları var. Önce atamaları silmelisiniz.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
