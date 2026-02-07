namespace KonyvkockaAPI.DTO.Response
{
    public class NotificationDTO
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsRead { get; set; }
        public string Icon { get; set; }
    }
}
