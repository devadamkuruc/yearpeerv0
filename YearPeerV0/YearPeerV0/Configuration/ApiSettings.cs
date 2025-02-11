namespace YearPeerV0.Configuration;

public class ApiSettings
{
    public int TaskLimit { get; set; } = 5;
    public int MaxGoalsPerYear { get; set; } = 50;
    public int MaxDescriptionLength { get; set; } = 2000;
}