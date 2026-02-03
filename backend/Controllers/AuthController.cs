using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StajYonetim.API.Data;
using StajYonetim.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StajYonetim.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public record LoginDto(string Email, string Password);

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            bool isValid = false;
            
            if (user != null) {
                // Verify hash (using simple check for seeded non-hashed or bcrypt)
                // In SeedData we hashed "123456"
                if (BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                {
                    isValid = true;
                }
            }

            if (!isValid) return Unauthorized("Invalid credentials");

            // Generate Token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user!.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                    new Claim(ClaimTypes.Name, user.FullName)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { Token = tokenString, User = new { user.Id, user.Email, user.Role, user.FullName } });
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            // Get ID from claims
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null) return Unauthorized();

            var id = int.Parse(idClaim.Value);
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            return Ok(new { user.Id, user.Email, user.Role, user.FullName });
        }
    }
}
