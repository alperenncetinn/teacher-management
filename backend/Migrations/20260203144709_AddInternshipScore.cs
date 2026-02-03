using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StajYonetim.API.Migrations
{
    /// <inheritdoc />
    public partial class AddInternshipScore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InternshipScore",
                table: "Students",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InternshipScore",
                table: "Students");
        }
    }
}
