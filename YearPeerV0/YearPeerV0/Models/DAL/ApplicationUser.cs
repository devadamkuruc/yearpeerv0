using Microsoft.AspNetCore.Identity;

namespace YearPeerV0.Models.DAL;

public class ApplicationUser : IdentityUser
{
    public string? GoogleId { get; set; }
    
    public string? FirstName { get; set; }
    
    public string? LastName { get; set; }
    
    public string? PictureUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    public virtual ICollection<Goal> Goals { get; set; } = new List<Goal>();
    
    // Add this line to match the relationship in DbContext
    public virtual ICollection<UsersTask> Tasks { get; set; } = new List<UsersTask>();
}
