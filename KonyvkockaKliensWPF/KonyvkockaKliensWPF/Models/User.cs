namespace KonyvkockaKliensWPF.Models
{
    /// <summary>
    /// Rövid felhasználó DTO listázáshoz
    /// </summary>
    public class UserListDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string LastLoginDate { get; set; } = null!;
        public bool IsSubscriber { get; set; }
        public int Level { get; set; }
    }
}
