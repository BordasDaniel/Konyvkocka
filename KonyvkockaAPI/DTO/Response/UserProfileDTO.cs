namespace KonyvkockaAPI.DTO.Response
{
    public class UserProfileDTO
    {
        public string Username { get; set; }
        public string Avatar { get; set; }
        public string Country { get; set; }
        public string CountryFlag { get; set; }
        public int Level { get; set; }
        public decimal LevelProgress { get; set; }
        public bool IsSubscriber { get; set; }
        public string Email { get; set; }
        public UserStatsDTO Stats { get; set; }
    }
}
