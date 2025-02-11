using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using YearPeerV0.Models.DAL;

namespace YearPeerV0.Services;

public interface IAuthService
{
    Task<ApplicationUser> AuthenticateGoogleUserAsync(ClaimsPrincipal googleUser);
    Task<ApplicationUser> GetUserAsync(string userId);
    Task UpdateUserAsync(ApplicationUser user);
}

public class AuthService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ILogger<AuthService> logger)
    : IAuthService
{
    public async Task<ApplicationUser> AuthenticateGoogleUserAsync(ClaimsPrincipal googleUser)
    {
        var googleId = googleUser.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = googleUser.FindFirstValue(ClaimTypes.Email);

        if (string.IsNullOrEmpty(email))
        {
            throw new InvalidOperationException("Email claim not found in Google user data");
        }

        var user = await userManager.FindByEmailAsync(email);
        
        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FirstName = googleUser.FindFirstValue(ClaimTypes.GivenName),
                LastName = googleUser.FindFirstValue(ClaimTypes.Surname),
                GoogleId = googleId,
                PictureUrl = googleUser.FindFirstValue("picture"),
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                throw new Exception($"Failed to create user: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
            }
            logger.LogInformation("Created new user {Email} with Google authentication", email);
        }
        else
        {
            user.FirstName = googleUser.FindFirstValue(ClaimTypes.GivenName);
            user.LastName = googleUser.FindFirstValue(ClaimTypes.Surname);
            user.PictureUrl = googleUser.FindFirstValue("picture");
            user.GoogleId = googleId;
            user.UpdatedAt = DateTime.UtcNow;

            await userManager.UpdateAsync(user);
            logger.LogInformation("Updated existing user {Email} with Google authentication", email);
        }

        await signInManager.SignInAsync(user, isPersistent: true);

        return user;
    }

    public async Task<ApplicationUser> GetUserAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            logger.LogWarning("User with ID {UserId} not found", userId);
            throw new KeyNotFoundException("User not found");
        }
        
        return user;
    }

    public async Task UpdateUserAsync(ApplicationUser user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        var result = await userManager.UpdateAsync(user);
        
        if (!result.Succeeded)
        {
            logger.LogError("Failed to update user {UserId}: {Errors}", 
                user.Id, 
                string.Join(", ", result.Errors.Select(e => e.Description)));
                
            throw new Exception($"Failed to update user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }
    }
}