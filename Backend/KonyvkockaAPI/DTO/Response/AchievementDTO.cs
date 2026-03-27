namespace KonyvkockaAPI.DTO.Response
{
    public class AchievementDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public DateTime AchieveDate { get; set; }
        public int Rarity { get; set; }
        public string Category { get; set; }
    }
}
