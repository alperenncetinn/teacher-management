using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StajYonetim.API.Data;
using StajYonetim.API.Models;

namespace StajYonetim.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public StudentsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Full list for Teachers/Admins
            var students = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Documents)
                .Include(s => s.Placements)
                .ToListAsync();
                
            return Ok(students);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Documents)
                .Include(s => s.Placements)
                .FirstOrDefaultAsync(s => s.Id == id);
            
            if (student == null) return NotFound();
            return Ok(student);
        }

        [HttpPost("{id}/documents")]
        public async Task<IActionResult> UploadDocument(int id, IFormFile file, [FromQuery] string type = "ISG")
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound("Student not found");

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Save file
            var uploadsFolder = Path.Combine(_env.ContentRootPath, "Uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create Document Record
            var doc = new Document
            {
                StudentId = id,
                FileName = file.FileName,
                FilePath = fileName,
                ContentType = file.ContentType,
                Type = type
            };
            _context.Documents.Add(doc);

            // Update Flag if ISG
            if (type == "ISG")
            {
                student.HasInsuranceDocument = true;
            }

            await _context.SaveChangesAsync();
            return Ok(doc);
        }
        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Create([FromBody] StajYonetim.API.DTOs.StudentCreateDto dto)
        {
            // 1. Check if email exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email already exists.");

            // 2. Create User
            var user = new User
            {
                Email = dto.Email,
                FullName = dto.FullName,
                Role = UserRole.Student,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // to get User.Id

            // 3. Create Student
            var student = new Student
            {
                Id = user.Id, // One-to-One shared PK
                User = user,
                SchoolNumber = dto.SchoolNumber,
                FieldOfStudy = dto.FieldOfStudy,
                SubField = dto.SubField,
                ClassName = dto.ClassName,
                SchoolDays = dto.SchoolDays,
                HasInsuranceDocument = false
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return Ok(student);
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var student = await _context.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
            if (student == null) return NotFound();

            // Cascade delete handles Documents/Placements if configured in DB, 
            // but let's be safe and rely on EF Core Cascade.
            // Student record delete -> User record delete (if shared PK? No, Student has FK to User).
            // Actually Student Key is same as User Key in this design: Id = user.Id
            
            // So we need to delete the User record, which will cascade delete the Student record
            var user = student.User;
            _context.Users.Remove(user); 
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPatch("{id}/toggle-doc")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> ToggleDocumentStatus(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound();

            student.HasInsuranceDocument = !student.HasInsuranceDocument;
            await _context.SaveChangesAsync();
            return Ok(new { hasInsuranceDocument = student.HasInsuranceDocument });
        }
        [HttpPatch("{id}/score")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateScore(int id, [FromBody] int score)
        {
            if (score < 0 || score > 100) return BadRequest("Score must be between 0 and 100.");

            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound();

            student.InternshipScore = score;
            await _context.SaveChangesAsync();
            return Ok(new { score = student.InternshipScore });
        }
    }
}
