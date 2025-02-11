using System.ComponentModel.DataAnnotations;

namespace YearPeerV0.Models.DTOs;

public record UsersTaskDto
{
    [Required]
    [StringLength(255)]
    public required string Title { get; init; }

    public string? Description { get; init; }

    [Required]
    public DateTime Date { get; init; }

    public Guid? GoalId { get; init; }

    public bool Completed { get; init; }
}