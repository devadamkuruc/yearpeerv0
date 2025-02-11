namespace YearPeerV0.Models.DTOs;

public class UserDto
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string? PictureUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}