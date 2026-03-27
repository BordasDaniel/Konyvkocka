using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Challenge
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string? IconUrl { get; set; }

    public string Type { get; set; } = null!;

    public int TargetValue { get; set; }

    public int RewardXp { get; set; }

    public string? RewardType { get; set; }

    public string Difficulty { get; set; } = null!;

    public bool? IsActive { get; set; }

    public bool IsRepeatable { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<UserChallenge> UserChallenges { get; set; } = new List<UserChallenge>();
}
