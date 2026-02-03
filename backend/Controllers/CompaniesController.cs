using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StajYonetim.API.Data;

namespace StajYonetim.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CompaniesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CompaniesController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var companies = await _context.Companies
                .Include(c => c.Placements)
                .ToListAsync();
            
            // Calculate average rating for each company
            var result = companies.Select(c => new
            {
                c.Id,
                c.Name,
                c.Address,
                c.AcceptedFields,
                c.OperatingDays,
                c.Quota,
                AverageRating = c.Placements
                    .Where(p => p.StudentRating.HasValue)
                    .Select(p => p.StudentRating!.Value)
                    .DefaultIfEmpty(0)
                    .Average(),
                RatingCount = c.Placements.Count(p => p.StudentRating.HasValue)
            });

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Create([FromBody] StajYonetim.API.Models.Company company)
        {
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();
            return Ok(company);
        }
    }
}
