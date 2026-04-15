using KonyvkockaAPI.Models;
using System.Net;
using System.Net.Mail;

namespace KonyvkockaAPI.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(EmailSettings emailSettings, ILogger<SmtpEmailService> logger)
        {
            _emailSettings = emailSettings;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var smtpHost = Normalize(_emailSettings.SmtpHost);
            var fromEmail = Normalize(_emailSettings.FromEmail);
            var fromName = Normalize(_emailSettings.FromName);
            var smtpUsername = Normalize(_emailSettings.SmtpUsername);
            var smtpPassword = Normalize(_emailSettings.SmtpPassword);

            if (string.Equals(smtpHost, "smtp.gmail.com", StringComparison.OrdinalIgnoreCase))
            {
                // Gmail app passwords are often copied with spaces for readability.
                smtpPassword = smtpPassword.Replace(" ", string.Empty);
            }

            if (string.IsNullOrWhiteSpace(smtpHost) ||
                string.IsNullOrWhiteSpace(fromEmail) ||
                string.IsNullOrWhiteSpace(smtpUsername) ||
                string.IsNullOrWhiteSpace(smtpPassword))
            {
                _logger.LogWarning("Email settings are incomplete. Skipping email send.");
                return false;
            }

            try
            {
                using var smtpClient = new SmtpClient(smtpHost, _emailSettings.SmtpPort)
                {
                    EnableSsl = _emailSettings.EnableSsl,
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword)
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                await smtpClient.SendMailAsync(mailMessage);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                return false;
            }
        }

        private static string Normalize(string? value)
        {
            return (value ?? string.Empty).Trim().Trim('"');
        }
    }
}
