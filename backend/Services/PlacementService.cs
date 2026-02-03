using Microsoft.EntityFrameworkCore;
using StajYonetim.API.Data;
using StajYonetim.API.DTOs;
using StajYonetim.API.Models;
using System.Text.Json;

namespace StajYonetim.API.Services
{
    public class PlacementService
    {
        private readonly AppDbContext _context;

        public PlacementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult> CreatePlacementAsync(PlacementCreateDto dto)
        {
            // 1. Fetch Entities
            var student = await _context.Students.Include(s => s.Documents).FirstOrDefaultAsync(s => s.Id == dto.StudentId);
            var company = await _context.Companies.FindAsync(dto.CompanyId);

            if (student == null) return ServiceResult.Fail("Öğrenci bulunamadı.");
            if (company == null) return ServiceResult.Fail("İşletme bulunamadı.");

            // 2. Constraint: Document (ISG)
            // Assuming Type "ISG" or similar is required.
            if (!student.HasInsuranceDocument) 
            {
                // Double check if file exists
                if (!student.Documents.Any(d => d.Type == "ISG"))
                    return ServiceResult.Fail("Öğrencinin İSG belgesi yok. Atama yapılamaz.");
            }

            // 3. Constraint: Field Match
            // normalized check
            bool fieldMatch = company.AcceptedFields.Any(f => f.Equals(student.FieldOfStudy, StringComparison.OrdinalIgnoreCase));
            if (!fieldMatch)
                return ServiceResult.Fail($"Alan uyumsuzluğu. Öğrenci: {student.FieldOfStudy}, İşletme kabul: {string.Join(", ", company.AcceptedFields)}");

            // 4. Constraint: Days Schedule
            // Student School Days overlap with desired Intern Days?
            var overlapWithSchool = dto.InternDays.Intersect(student.SchoolDays).Any();
            if (overlapWithSchool)
                return ServiceResult.Fail("Seçilen staj günleri öğrencinin okul günleri ile çakışıyor.");

            // Desired Intern Days inside Company Operating Days?
            var invalidDays = dto.InternDays.Except(company.OperatingDays).Any();
            if (invalidDays)
                return ServiceResult.Fail("İşletme seçilen günlerde çalışmıyor.");

            // 5. Constraint: Student Double Booking
            // Check existing placements for overlap in Date Range
            var studentConflict = await _context.Placements
                .AnyAsync(p => p.StudentId == dto.StudentId && 
                               ( (dto.StartDate >= p.StartDate && dto.StartDate <= p.EndDate) || 
                                 (dto.EndDate >= p.StartDate && dto.EndDate <= p.EndDate) ||
                                 (dto.StartDate <= p.StartDate && dto.EndDate >= p.EndDate) ));
            
            if (studentConflict)
                return ServiceResult.Fail("Öğrencinin bu tarih aralığında başka bir ataması mevcut.");

            // 6. Constraint: Company Quota
            // Count active placements in this range for this company
            var activePlacementsCount = await _context.Placements
                .CountAsync(p => p.CompanyId == dto.CompanyId &&
                               ( (dto.StartDate >= p.StartDate && dto.StartDate <= p.EndDate) || 
                                 (dto.EndDate >= p.StartDate && dto.EndDate <= p.EndDate) ||
                                 (dto.StartDate <= p.StartDate && dto.EndDate >= p.EndDate) ));

            if (activePlacementsCount >= company.Quota)
                return ServiceResult.Fail($"İşletme kontenjanı ({company.Quota}) bu tarih aralığında dolu.");

            // All Good -> Create
            var placement = new Placement
            {
                StudentId = dto.StudentId,
                CompanyId = dto.CompanyId,
                TeacherId = dto.TeacherId,
                StartDate = dto.StartDate, 
                EndDate = dto.EndDate,
                InternDays = dto.InternDays
            };

            _context.Placements.Add(placement);
            
            // Audit Log
            _context.AuditLogs.Add(new AuditLog
            {
                ActorId = dto.TeacherId,
                Action = "Create",
                EntityName = "Placement",
                Metadata = JsonSerializer.Serialize(dto)
            });

            await _context.SaveChangesAsync();
            
            // Update Audit with ID?
            // simplified.

            return ServiceResult.Ok("Atama başarıyla oluşturuldu.", placement.Id);
        }
    }
}
