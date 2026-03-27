namespace KonyvkockaAPI.DTO.Response
{
    public class UserMeDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Avatar { get; set; }
        public bool IsSubscriber { get; set; }

        /// <summary>
        /// Jogosultsági szint: "USER" | "MODERATOR" | "ADMIN"
        /// </summary>
        public string PermissionLevel { get; set; } = "USER";
    }
}
