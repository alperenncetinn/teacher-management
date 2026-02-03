using System;
using System.ComponentModel.DataAnnotations;

namespace StajYonetim.API.Models
{
    public class Placement : BaseEntity
    {
        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;

        public int CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public int TeacherId { get; set; } // Coordinator Teacher
        public User Teacher { get; set; } = null!;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public List<DayOfWeek> InternDays { get; set; } = new(); // Days student goes to internship

        // Student's evaluation of the company
        public int? StudentRating { get; set; } // 1-5 Stars
        public string? StudentComment { get; set; }
    }

    public class Document : BaseEntity
    {
        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;

        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        
        // Types: "ISG", "Contract", "Other"
        public string Type { get; set; } = string.Empty; 
    }

    public class Attendance : BaseEntity
    {
        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;

        public DateTime Date { get; set; }
        public bool IsPresent { get; set; } = true;
        public string Note { get; set; } = string.Empty;
    }

    public class VisitReport : BaseEntity
    {
        public int TeacherId { get; set; }
        public User Teacher { get; set; } = null!;

        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;

        public int CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public DateTime VisitDate { get; set; }
        public string Note { get; set; } = string.Empty;
    }

    public class Evaluation : BaseEntity
    {
        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;

        public int CompanyUserId { get; set; }
        public CompanyUser CompanyUser { get; set; } = null!;

        public string Period { get; set; } = string.Empty; // e.g., "Fall 2023"
        public int Score { get; set; } // 0-100
        public string Comment { get; set; } = string.Empty;
    }

    public class AuditLog : BaseEntity
    {
        public int? ActorId { get; set; } // User ID
        public string Action { get; set; } = string.Empty; // "Create", "Update", "Delete"
        public string EntityName { get; set; } = string.Empty; // "Placement"
        public int EntityId { get; set; }
        public string Metadata { get; set; } = string.Empty; // JSON details
    }
}
