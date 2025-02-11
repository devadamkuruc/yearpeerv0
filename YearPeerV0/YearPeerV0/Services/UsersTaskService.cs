using Microsoft.EntityFrameworkCore;
using YearPeerV0.Configuration;
using YearPeerV0.Data;
using YearPeerV0.Exceptions;
using YearPeerV0.Models.DAL;
using YearPeerV0.Models.DTOs;
using YearPeerV0.Validation;

namespace YearPeerV0.Services;

public interface IUsersTaskService
{
    Task<IEnumerable<UsersTask>> GetTasksAsync(TaskQueryParams queryParams);
    Task<UsersTask> GetTaskByIdAsync(Guid id, string userId);
    Task<UsersTask> CreateTaskAsync(string userId, UsersTaskDto taskDto);
    Task<UsersTask> UpdateTaskAsync(Guid id, string userId, UsersTaskDto taskDto);
    Task DeleteTaskAsync(Guid id, string userId);
    Task<bool> ValidateTaskLimitAsync(DateTime date, string userId, int additionalTasks = 1);
    Task<Dictionary<string, IEnumerable<UsersTask>>> GetTasksByDateRangeAsync(string userId, DateTime startDate, DateTime endDate);
}

public class UsersTaskService : IUsersTaskService
{
    private readonly ApplicationDbContext _context;
    private readonly TaskLimitValidator _taskLimitValidator;
    private const int MaxTasksPerDay = 5; // Match the constant from TaskLimitValidator

    public UsersTaskService(ApplicationDbContext context, TaskLimitValidator taskLimitValidator)
    {
        _context = context;
        _taskLimitValidator = taskLimitValidator;
    }

    public async Task<IEnumerable<UsersTask>> GetTasksAsync(TaskQueryParams queryParams)
    {
        return await _context.Tasks
            .Include(t => t.Goal)
            .Where(t => 
                t.UserId == queryParams.UserId &&
                t.Date >= queryParams.StartDate &&
                t.Date <= queryParams.EndDate)
            .OrderBy(t => t.Date)
            .ToListAsync();
    }

    public async Task<UsersTask> GetTaskByIdAsync(Guid id, string userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Goal)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task == null)
            throw new NotFoundException($"Task with ID {id} not found");

        return task;
    }

    public async Task<UsersTask> CreateTaskAsync(string userId, UsersTaskDto taskDto)
    {
        // Validate task limit
        if (!await _taskLimitValidator.ValidateTaskLimit(taskDto.Date, userId, 1))
            throw new ValidationException($"Cannot exceed {MaxTasksPerDay} tasks per day");

        var task = new UsersTask
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = taskDto.Title,
            Description = taskDto.Description,
            Date = taskDto.Date,
            GoalId = taskDto.GoalId,
            Completed = taskDto.Completed
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<UsersTask> UpdateTaskAsync(Guid id, string userId, UsersTaskDto taskDto)
    {
        var task = await GetTaskByIdAsync(id, userId);
        var oldDate = task.Date.Date;
        var newDate = taskDto.Date.Date;
        var dateIsChanging = oldDate != newDate;

        // If date is changing, validate task limit for new date
        if (dateIsChanging)
        {
            if (!await _taskLimitValidator.ValidateTaskLimit(taskDto.Date, userId, 1))
                throw new ValidationException($"Cannot exceed {MaxTasksPerDay} tasks per day");
        }

        // Update task properties
        task.Title = taskDto.Title;
        task.Description = taskDto.Description;
        task.Date = taskDto.Date;
        task.GoalId = taskDto.GoalId;
        task.Completed = taskDto.Completed;

        await _context.SaveChangesAsync();
        return task;
    }

    public async Task DeleteTaskAsync(Guid id, string userId)
    {
        var task = await GetTaskByIdAsync(id, userId);
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ValidateTaskLimitAsync(DateTime date, string userId, int additionalTasks = 1)
    {
        return await _taskLimitValidator.ValidateTaskLimit(date, userId, additionalTasks);
    }

    public async Task<Dictionary<string, IEnumerable<UsersTask>>> GetTasksByDateRangeAsync(
        string userId, DateTime startDate, DateTime endDate)
    {
        var tasks = await _context.Tasks
            .Include(t => t.Goal)
            .Where(t => 
                t.UserId == userId &&
                t.Date >= startDate &&
                t.Date <= endDate)
            .OrderBy(t => t.Date)
            .ToListAsync();

        return tasks.GroupBy(t => t.Date.Date.ToString("yyyy-MM-dd"))
            .ToDictionary(g => g.Key, g => g.AsEnumerable());
    }
}