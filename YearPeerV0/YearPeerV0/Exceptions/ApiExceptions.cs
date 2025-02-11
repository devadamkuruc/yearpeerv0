namespace YearPeerV0.Exceptions;

// Exceptions/BaseApiException.cs
public abstract class BaseApiException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

// Exceptions/NotFoundException.cs
public class NotFoundException(string message) : BaseApiException(message, StatusCodes.Status404NotFound);

// Exceptions/ValidationException.cs
public class ValidationException(string message) : BaseApiException(message, StatusCodes.Status400BadRequest);

// Exceptions/UnauthorizedException.cs
public class UnauthorizedException(string message) : BaseApiException(message, StatusCodes.Status401Unauthorized);