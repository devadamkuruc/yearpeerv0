namespace YearPeerV0.Models.DAL;

public class Goal
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public required string Color { get; set; }
    public int Impact { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual ICollection<UsersTask> Tasks { get; set; } = [];
}