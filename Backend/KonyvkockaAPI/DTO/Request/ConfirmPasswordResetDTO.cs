namespace KonyvkockaAPI.DTO.Request
{
    public class ConfirmPasswordResetDTO
    {
        public int UserId { get; set; }
        public string Token { get; set; }
        public string NewPasswordHash { get; set; }
        public string NewPasswordSalt { get; set; }
    }
}
