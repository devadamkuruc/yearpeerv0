namespace YearPeerV0.Models.DTOs;

public record TaskQueryParams
{
    public required string UserId { get; init; }
    public required DateTime StartDate { get; init; }
    public required DateTime EndDate { get; init; }
}