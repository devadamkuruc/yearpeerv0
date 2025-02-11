using Microsoft.EntityFrameworkCore;
using YearPeerV0.Data;

namespace YearPeerV0.Validation;

public class GoalOverlapValidator
{
    private readonly ApplicationDbContext _context;

    public GoalOverlapValidator(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> HasOverlap(DateTime start, DateTime end, string userId, Guid? excludeGoalId = null)
    {
        var query = _context.Goals
            .Where(g => g.UserId == userId);

        if (excludeGoalId.HasValue)
        {
            query = query.Where(g => g.Id != excludeGoalId.Value);
        }

        return await query.AnyAsync(g =>
            (start <= g.EndDate && end >= g.StartDate));
    }
}