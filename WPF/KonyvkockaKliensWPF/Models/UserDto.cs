namespace KonyvkockaKliensWPF.Models
{
    /// <summary>
    /// Alap felhasználó DTO a listázáshoz
    /// </summary>
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? LastLoginDate { get; set; }
        public bool IsSubscriber { get; set; }
        public int Level { get; set; }
    }
}
