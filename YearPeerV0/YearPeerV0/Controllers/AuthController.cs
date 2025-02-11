using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using YearPeerV0.Models.DAL;
using YearPeerV0.Models.DTOs;
using YearPeerV0.Services;

namespace YearPeerV0.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    IAuthService authService,
    ILogger<AuthController> logger)
    : ControllerBase
{
    [HttpGet("login")]
    public IActionResult Login()
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = "/api/auth/callback",
            IsPersistent = true,
            Items =
            {
                { ".AuthScheme", GoogleDefaults.AuthenticationScheme },
            },
            AllowRefresh = true
        };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        try
        {
            var authenticateResult = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
            if (!authenticateResult.Succeeded)
            {
                logger.LogError("Google authentication failed");
                return Unauthorized();
            }

            await authService.AuthenticateGoogleUserAsync(authenticateResult.Principal);
            return Redirect("http://localhost:5173");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in Google callback");
            return StatusCode(500, "Authentication failed");
        }
    }
    
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetUser()
    {
        try
        {
            var user = await authService.GetUserAsync(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                PictureUrl = user.PictureUrl,
                CreatedAt = user.CreatedAt,
            });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting user details");
            return StatusCode(500, "Error retrieving user information");
        }
    }

    [Authorize]
    [HttpGet("user")]
    public async Task<ActionResult<ApplicationUser>> GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        try
        {
            var user = await authService.GetUserAsync(userId);
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            await HttpContext.SignOutAsync(IdentityConstants.ApplicationScheme);
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during logout");
            return StatusCode(500, "Error during logout");
        }
    }
}