namespace YearPeerV0.Configuration;

public static class ApiConfig
{
    private static ApiSettings? _settings;

    public static void Initialize(IConfiguration configuration)
    {
        _settings = configuration.GetSection("ApiSettings").Get<ApiSettings>() ?? new ApiSettings();
    }

    public static int TaskLimit => _settings?.TaskLimit ?? 5;
    public static int MaxGoalsPerYear => _settings?.MaxGoalsPerYear ?? 50;
    public static int MaxDescriptionLength => _settings?.MaxDescriptionLength ?? 2000;
}