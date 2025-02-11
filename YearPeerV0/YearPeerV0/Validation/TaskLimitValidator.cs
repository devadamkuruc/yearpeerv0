using Microsoft.EntityFrameworkCore;
using YearPeerV0.Data;

namespace YearPeerV0.Validation;

public class TaskLimitValidator
{
    private readonly ApplicationDbContext _context;
    private const int MaxTasksPerDay = 5;

    public TaskLimitValidator(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ValidateTaskLimit(DateTime date, string userId, int newTaskCount)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

        var existingTaskCount = await _context.Tasks
            .CountAsync(t => 
                t.UserId == userId && 
                t.Date >= startOfDay && 
                t.Date <= endOfDay);

        return (existingTaskCount + newTaskCount) <= MaxTasksPerDay;
    }
}