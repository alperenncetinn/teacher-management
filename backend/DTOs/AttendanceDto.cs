using System;
using System.Collections.Generic;
using StajYonetim.API.Models;
using StajYonetim.API.DTOs;

namespace StajYonetim.API.DTOs
{
    public class AttendanceDto
    {
        public int StudentId { get; set; }
        public DateTime Date { get; set; }
        public bool IsPresent { get; set; }
        public string Note { get; set; } = string.Empty;
    }
}
