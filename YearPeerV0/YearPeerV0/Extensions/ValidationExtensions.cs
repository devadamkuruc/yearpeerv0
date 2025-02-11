using YearPeerV0.Validation;

namespace YearPeerV0.Extentions;

public static class ValidationExtensions
{
    public static IServiceCollection AddValidators(this IServiceCollection services)
    {
        services.AddScoped<GoalOverlapValidator>();
        services.AddScoped<TaskLimitValidator>();
        return services;
    }
}