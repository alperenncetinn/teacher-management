using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StajYonetim.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StudentComment",
                table: "Placements",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StudentRating",
                table: "Placements",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StudentComment",
                table: "Placements");

            migrationBuilder.DropColumn(
                name: "StudentRating",
                table: "Placements");
        }
    }
}
