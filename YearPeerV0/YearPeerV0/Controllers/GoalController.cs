using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YearPeerV0.Models.DAL;
using YearPeerV0.Models.DTOs;
using YearPeerV0.Services;

namespace YearPeerV0.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GoalsController(IGoalService goalService, ILogger<GoalsController> logger) : ControllerBase
{
    private readonly ILogger<GoalsController> _logger = logger;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Goal>>> GetGoals(
        [FromQuery] int year,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var queryParams = new GoalQueryParams
        {
            UserId = userId,
            Year = year,
            StartDate = startDate,
            EndDate = endDate
        };

        var goals = await goalService.GetGoalsAsync(queryParams);
        return Ok(goals);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Goal>> GetGoal(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var goal = await goalService.GetGoalByIdAsync(id, userId);
        return Ok(goal);
    }

    [HttpPost]
    public async Task<ActionResult<Goal>> CreateGoal(GoalDto goalDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var goal = await goalService.CreateGoalAsync(userId, goalDto);
        return CreatedAtAction(nameof(GetGoal), new { id = goal.Id }, goal);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Goal>> UpdateGoal(Guid id, GoalDto goalDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var goal = await goalService.UpdateGoalAsync(id, userId, goalDto);
        return Ok(goal);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteGoal(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        await goalService.DeleteGoalAsync(id, userId);
        return NoContent();
    }
}
