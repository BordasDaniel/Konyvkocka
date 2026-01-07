using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class UserChallenge
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int ChallengeId { get; set; }

    public int CurrentValue { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? StartedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime? ClaimedAt { get; set; }

    public DateTime? LastUpdated { get; set; }

    public virtual Challenge Challenge { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
