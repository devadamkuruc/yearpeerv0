namespace YearPeerV0.Models.DTOs;

public class MessageDto
{
    public List<string> To { get; set; }
    public string Subject { get; set; }
    public string Content { get; set; }

    public MessageDto(string to, string subject, string content)
    {
        ValidateEmail(to);
        ValidateSubject(subject);
        
        To = new List<string> { to };
        Subject = subject;
        Content = content;
    }

    public MessageDto(IEnumerable<string> to, string subject, string content)
    {
        if (to == null || !to.Any())
            throw new ArgumentException("At least one recipient is required", nameof(to));
            
        foreach (var email in to)
        {
            ValidateEmail(email);
        }
        
        ValidateSubject(subject);
        
        To = to.ToList();
        Subject = subject;
        Content = content;
    }

    private void ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty", nameof(email));
            
        if (!email.Contains("@"))
            throw new ArgumentException("Invalid email format", nameof(email));
    }

    private void ValidateSubject(string subject)
    {
        if (string.IsNullOrWhiteSpace(subject))
            throw new ArgumentException("Subject cannot be empty", nameof(subject));
    }
}