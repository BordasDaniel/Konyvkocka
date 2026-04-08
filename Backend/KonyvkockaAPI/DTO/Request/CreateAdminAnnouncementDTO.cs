namespace KonyvkockaAPI.DTO.Request
{
    public class CreateAdminAnnouncementDTO
    {
        // all | subscribers | free | specific
        public string Target { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        // Csak target=specific esetén használjuk
        public List<string>? Usernames { get; set; }
    }
}
