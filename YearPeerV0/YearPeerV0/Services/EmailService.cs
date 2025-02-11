using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using YearPeerV0.Models.DTOs;

namespace YearPeerV0.Services;

public interface IEmailService
{
    Task SendEmailAsync(MessageDto message);

    Task SendEmailAsync(string toEmail, string subject, string message);
}

public class EmailService : IEmailService
{
    private readonly IAmazonSimpleEmailService _sesClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IAmazonSimpleEmailService sesClient, IConfiguration configuration,
        ILogger<EmailService> logger)
    {
        _sesClient = sesClient;
        _configuration = configuration;
        _logger = logger;

        // Log AWS configuration
        _logger.LogInformation($"AWS Region: {_configuration["AWS:Region"]}");
        _logger.LogInformation($"SES From Email: {_configuration["SES:FromEmail"]}");
    }

    public async Task SendEmailAsync(MessageDto message)
    {
        if (message == null)
            throw new ArgumentNullException(nameof(message));

        if (message.To.Count > 1)
        {
            await SendBulkEmailAsync(message);
            return;
        }

        await SendEmailAsync(message.To.First(), message.Subject, message.Content);
    }

    public async Task SendEmailAsync(string toEmail, string subject, string message)
    {
        try
        {
            var sendRequest = CreateEmailRequest(toEmail, subject, message);

            _logger.LogInformation($"Sending email to {toEmail}");
            var response = await _sesClient.SendEmailAsync(sendRequest);
            _logger.LogInformation($"Email sent successfully. MessageId: {response.MessageId}");
        }
        catch (AmazonSimpleEmailServiceException ex)
        {
            _logger.LogError(ex, $"AWS SES error sending email to {toEmail}: {ex.Message}");
            throw new Exception("Failed to send email through AWS SES", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Unexpected error sending email to {toEmail}");
            throw new Exception("An unexpected error occurred while sending email", ex);
        }
    }

    public async Task SendBulkEmailAsync(MessageDto message)
    {
        try
        {
            _logger.LogInformation($"Sending bulk email to {message.To.Count} recipients");

            var tasks = message.To.Select(recipient =>
                SendEmailAsync(recipient, message.Subject, message.Content));

            await Task.WhenAll(tasks);

            _logger.LogInformation("Bulk email sent successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending bulk email");
            throw new Exception("Failed to send bulk email", ex);
        }
    }

    private SendEmailRequest CreateEmailRequest(string toEmail, string subject, string messageContent)
    {
        return new SendEmailRequest
        {
            Source = _configuration["SES:FromEmail"],
            Destination = new Destination
            {
                ToAddresses = new List<string> { toEmail }
            },
            Message = new Message
            {
                Subject = new Content(subject),
                Body = new Body
                {
                    Html = new Content
                    {
                        Charset = "UTF-8",
                        Data = messageContent
                    }
                }
            }
        };
    }
}