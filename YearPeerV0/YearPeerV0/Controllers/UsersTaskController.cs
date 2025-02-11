using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YearPeerV0.Models.DAL;
using YearPeerV0.Models.DTOs;
using YearPeerV0.Services;

namespace YearPeerV0.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class UsersTaskController(IUsersTaskService taskService, ILogger<UsersTaskController> logger)
    : ControllerBase
{
    private readonly ILogger<UsersTaskController> _logger = logger;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsersTask>>> GetTasks(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var queryParams = new TaskQueryParams
        {
            UserId = userId,
            StartDate = startDate,
            EndDate = endDate
        };

        var tasks = await taskService.GetTasksAsync(queryParams);
        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UsersTask>> GetTask(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var task = await taskService.GetTaskByIdAsync(id, userId);
        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<UsersTask>> CreateTask(UsersTaskDto taskDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var task = await taskService.CreateTaskAsync(userId, taskDto);
        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<UsersTask>> UpdateTask(Guid id, UsersTaskDto taskDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var task = await taskService.UpdateTaskAsync(id, userId, taskDto);
        return Ok(task);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTask(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        await taskService.DeleteTaskAsync(id, userId);
        return NoContent();
    }
}