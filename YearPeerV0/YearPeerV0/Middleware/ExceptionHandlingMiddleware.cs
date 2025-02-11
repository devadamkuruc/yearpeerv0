using YearPeerV0.Exceptions;
using YearPeerV0.Models;

namespace YearPeerV0.Middleware;

// Middleware/ExceptionHandlingMiddleware.cs
public class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger,
    IWebHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during request processing");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = exception switch
        {
            BaseApiException apiException => HandleApiException(apiException),
            _ => HandleUnknownException(exception)
        };

        context.Response.StatusCode = response.StatusCode;
        await context.Response.WriteAsJsonAsync(response.Response);
    }

    private (int StatusCode, ApiResponse<object> Response) HandleApiException(BaseApiException exception)
    {
        return (exception.StatusCode, ApiResponse<object>.Fail(exception.Message));
    }

    private (int StatusCode, ApiResponse<object> Response) HandleUnknownException(Exception exception)
    {
        var message = env.IsDevelopment()
            ? exception.Message
            : "An unexpected error occurred.";

        return (StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail(message));
    }
}