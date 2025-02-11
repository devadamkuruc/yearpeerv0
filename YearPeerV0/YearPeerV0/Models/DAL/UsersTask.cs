namespace YearPeerV0.Models.DAL;

public class UsersTask
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public Guid? GoalId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public bool Completed { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual Goal? Goal { get; set; }
}