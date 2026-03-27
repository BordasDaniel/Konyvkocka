namespace KonyvkockaAPI.DTO.Request
{
    public class AuthRegisterDTO
    {
        public string Username { get; set; }
        public string Email { get; set; }
        /// <summary>
        /// A kliens által generált SHA256 hash (jelszóból)
        /// </summary>
        public string PasswordHash { get; set; }
        /// <summary>
        /// A kliens által generált salt
        /// </summary>
        public string PasswordSalt { get; set; }
    }
}
