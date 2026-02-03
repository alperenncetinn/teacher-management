using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace StajYonetim.API.Models
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    public enum UserRole
    {
        Admin,
        Teacher,
        CompanyUser,
        Student,
        Parent
    }

    public class User : BaseEntity
    {
        [Required]
        public string Email { get; set; } = string.Empty;
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public UserRole Role { get; set; }

        // For Teachers: Which days they inspect companies (e.g., Monday, Wednesday)
        public List<DayOfWeek> InspectionDays { get; set; } = new();

        // Navigation properties
        public Student? StudentProfile { get; set; }
        public CompanyUser? CompanyUserProfile { get; set; }
    }

    public class Student : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string SchoolNumber { get; set; } = string.Empty;
        public string FieldOfStudy { get; set; } = string.Empty; // Alan
        public string SubField { get; set; } = string.Empty; // Dal
        public string ClassName { get; set; } = string.Empty; // Sınıf

        // "Mon,Tue" format or bitmask. Let's use string for MVP simplicity or JSON.
        // Schools days: Days when student is at school.
        public List<DayOfWeek> SchoolDays { get; set; } = new(); 

        public int? ParentId { get; set; }
        public User? Parent { get; set; }

        // Documents status
        public bool HasInsuranceDocument { get; set; } // ISG/Sigorta

        public List<Placement> Placements { get; set; } = new();
        public List<Document> Documents { get; set; } = new();
        public List<Attendance> Attendances { get; set; } = new();

        public int? InternshipScore { get; set; } // 0-100 Teacher Score
    }

    public class Company : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        
        // Allowed Fields mapping (JSON or related table).
        // MVP: List<string> stored as JSON in Postgres or simple string match
        public List<string> AcceptedFields { get; set; } = new(); // e.g. ["Bilişim", "Elektrik"]

        // Operating days (Days company is open/accepting interns)
        public List<DayOfWeek> OperatingDays { get; set; } = new();

        public int Quota { get; set; }

        public List<CompanyUser> CompanyUsers { get; set; } = new();
        public List<Placement> Placements { get; set; } = new();
    }

    public class CompanyUser : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int CompanyId { get; set; }
        public Company Company { get; set; } = null!;
    }
}
