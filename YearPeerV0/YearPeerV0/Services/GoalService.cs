using Microsoft.EntityFrameworkCore;
using YearPeerV0.Data;
using YearPeerV0.Exceptions;
using YearPeerV0.Models.DAL;
using YearPeerV0.Models.DTOs;
using YearPeerV0.Validation;
using Task = System.Threading.Tasks.Task;
using ValidationException = System.ComponentModel.DataAnnotations.ValidationException;

namespace YearPeerV0.Services;

public interface IGoalService
{
    Task<IEnumerable<Goal>> GetGoalsAsync(GoalQueryParams queryParams);
    Task<Goal> GetGoalByIdAsync(Guid id, string userId);
    Task<Goal> CreateGoalAsync(string userId, GoalDto goalDto);
    Task<Goal> UpdateGoalAsync(Guid id, string userId, GoalDto goalDto);
    Task DeleteGoalAsync(Guid id, string userId);
    Task<bool> HasOverlappingGoalsAsync(DateTime startDate, DateTime endDate, string userId, Guid? excludeGoalId = null);
}

public class GoalService : IGoalService
{
    private readonly ApplicationDbContext _context;
    private readonly GoalOverlapValidator _overlapValidator;

    public GoalService(ApplicationDbContext context, GoalOverlapValidator overlapValidator)
    {
        _context = context;
        _overlapValidator = overlapValidator;
    }

    public async Task<IEnumerable<Goal>> GetGoalsAsync(GoalQueryParams queryParams)
    {
        var query = _context.Goals
            .Include(g => g.Tasks)
            .Where(g => g.UserId == queryParams.UserId);

        if (queryParams.StartDate.HasValue && queryParams.EndDate.HasValue)
        {
            query = query.Where(g =>
                g.StartDate <= queryParams.EndDate.Value &&
                g.EndDate >= queryParams.StartDate.Value);
        }
        else if (queryParams.Year > 0)
        {
            var startDate = new DateTime(queryParams.Year, 1, 1);
            var endDate = startDate.AddYears(1).AddDays(-1);
            query = query.Where(g =>
                g.StartDate.Year == queryParams.Year ||
                g.EndDate.Year == queryParams.Year);
        }

        return await query.ToListAsync();
    }

    public async Task<Goal> GetGoalByIdAsync(Guid id, string userId)
    {
        var goal = await _context.Goals
            .Include(g => g.Tasks)
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

        if (goal == null)
            throw new NotFoundException($"Goal with ID {id} not found");

        return goal;
    }

    public async Task<Goal> CreateGoalAsync(string userId, GoalDto goalDto)
    {
        if (await _overlapValidator.HasOverlap(goalDto.StartDate, goalDto.EndDate, userId))
            throw new ValidationException("A goal already exists during this time period");

        var goal = new Goal
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = goalDto.Title,
            Description = goalDto.Description,
            StartDate = goalDto.StartDate,
            EndDate = goalDto.EndDate,
            Color = goalDto.Color,
            Impact = goalDto.Impact
        };

        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        return goal;
    }

    public async Task<Goal> UpdateGoalAsync(Guid id, string userId, GoalDto goalDto)
    {
        var goal = await GetGoalByIdAsync(id, userId);

        if (await _overlapValidator.HasOverlap(goalDto.StartDate, goalDto.EndDate, userId, id))
            throw new ValidationException("A goal already exists during this time period");

        goal.Title = goalDto.Title;
        goal.Description = goalDto.Description;
        goal.StartDate = goalDto.StartDate;
        goal.EndDate = goalDto.EndDate;
        goal.Color = goalDto.Color;
        goal.Impact = goalDto.Impact;

        await _context.SaveChangesAsync();
        return goal;
    }

    public async Task DeleteGoalAsync(Guid id, string userId)
    {
        var goal = await GetGoalByIdAsync(id, userId);
        _context.Goals.Remove(goal);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> HasOverlappingGoalsAsync(DateTime startDate, DateTime endDate, string userId, Guid? excludeGoalId = null)
    {
        return await _overlapValidator.HasOverlap(startDate, endDate, userId, excludeGoalId);
    }
}