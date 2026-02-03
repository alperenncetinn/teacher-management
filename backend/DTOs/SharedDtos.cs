using System;
using System.Collections.Generic;
using StajYonetim.API.Models;

namespace StajYonetim.API.DTOs
{
    public class PlacementCreateDto
    {
        public int StudentId { get; set; }
        public int CompanyId { get; set; }
        public int TeacherId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<DayOfWeek> InternDays { get; set; } = new();
    }

    public class ServiceResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }

        public static ServiceResult Ok(string msg = "", object? data = null) => new() { Success = true, Message = msg, Data = data };
        public static ServiceResult Fail(string msg) => new() { Success = false, Message = msg };
    }
    public class StudentCreateDto
    {
        // User Info
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;

        // Student Info
        public string SchoolNumber { get; set; } = string.Empty;
        public string FieldOfStudy { get; set; } = string.Empty;
        public string SubField { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public List<DayOfWeek> SchoolDays { get; set; } = new();
    }
    public class TeacherCreateDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }
}
