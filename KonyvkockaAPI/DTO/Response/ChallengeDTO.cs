namespace KonyvkockaAPI.DTO.Response
{
    public class ChallengeDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Difficulty { get; set; }
        public string Type { get; set; }
        public int TargetValue { get; set; }
        public int CurrentValue { get; set; }
        public string Status { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? ClaimedAt { get; set; }
        public ChallengeRewardsDTO Rewards { get; set; }
    }

    public class ChallengeRewardsDTO
    {
        public int Xp { get; set; }
        public ChallengeTitleRewardDTO? Title { get; set; }
        public ChallengeBadgeRewardDTO? Badge { get; set; }
    }

    public class ChallengeTitleRewardDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Rarity { get; set; }
    }

    public class ChallengeBadgeRewardDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? IconURL { get; set; }
        public string Rarity { get; set; }
    }
}
