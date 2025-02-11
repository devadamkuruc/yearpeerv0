using System.ComponentModel.DataAnnotations;

namespace YearPeerV0.Models.DTOs;

public record GoalDto
{
    [Required]
    [StringLength(255)]
    public required string Title { get; init; }

    public string? Description { get; init; }

    [Required]
    public DateTime StartDate { get; init; }

    [Required]
    public DateTime EndDate { get; init; }

    [Required]
    [RegularExpression("^#[0-9A-Fa-f]{6}$", ErrorMessage = "Color must be a valid hex color code")]
    public required string Color { get; init; }

    [Range(1, 5)]
    public int Impact { get; init; }
}