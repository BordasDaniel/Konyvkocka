namespace KonyvkockaKliensWPF.Models
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
    }

    public class LoginResponseDto
    {
        public UserDto User { get; set; } = null!;
        public string Token { get; set; } = null!;
    }
}
