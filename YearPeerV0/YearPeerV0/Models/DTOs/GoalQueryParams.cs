namespace YearPeerV0.Models.DTOs;

public record GoalQueryParams
{
    public required string UserId { get; init; }
    public int Year { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}
