using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class UserRankCache
{
    public int UserId { get; set; }

    public int TotalPoints { get; set; }

    public int BookPoints { get; set; }

    public int MediaPoints { get; set; }

    public int? GlobalRankTotal { get; set; }

    public int? CountryRankTotal { get; set; }

    public int? GlobalRankBook { get; set; }

    public int? CountryRankBook { get; set; }

    public int? GlobalRankMedia { get; set; }

    public int? CountryRankMedia { get; set; }

    public DateTime? LastUpdated { get; set; }

    public virtual User User { get; set; } = null!;
}
