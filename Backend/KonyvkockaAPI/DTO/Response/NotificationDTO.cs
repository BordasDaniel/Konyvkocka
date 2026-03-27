namespace KonyvkockaAPI.DTO.Response
{
    public class NotificationDTO
    {
        public int Id { get; set; }

        /// <summary>
        /// Típus: "ALL" | "SYSTEM" | "FRIEND" | "CHALLENGE" | "PURCHASE"
        /// </summary>
        public string Type { get; set; } = null!;

        public string Subject { get; set; } = null!;
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime? CreatedAt { get; set; }

        /// <summary>
        /// Küldő neve, null ha rendszer üzenet (SenderId = null)
        /// </summary>
        public string? SenderUsername { get; set; }
    }
}
