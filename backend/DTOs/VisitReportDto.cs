namespace StajYonetim.API.DTOs
{
    public class VisitReportDto
    {
        public int StudentId { get; set; }
        public int CompanyId { get; set; }
        public DateTime VisitDate { get; set; }
        public string? Note { get; set; }
    }
}
