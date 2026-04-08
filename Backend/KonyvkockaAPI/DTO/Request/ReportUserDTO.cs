namespace KonyvkockaAPI.DTO.Request
{
    public class ReportUserDTO
    {
        // SPAM | HARASSMENT | FRAUD | IMPERSONATION | HATE_SPEECH | THREAT_VIOLENCE | INAPPROPRIATE_CONTENT | FAKE_PROFILE | OTHER
        public string Reason { get; set; } = string.Empty;

        public string Details { get; set; } = string.Empty;
    }
}
