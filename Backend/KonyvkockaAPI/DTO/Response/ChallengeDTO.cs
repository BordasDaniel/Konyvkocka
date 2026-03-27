namespace KonyvkockaAPI.DTO.Response
{
    public class ChallengeDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public string Category { get; set; }
        public string Rarity { get; set; }
        public object Rewards { get; set; }
        public int Progress { get; set; }
        public int Goal { get; set; }
        public string ProgressLabel { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}
