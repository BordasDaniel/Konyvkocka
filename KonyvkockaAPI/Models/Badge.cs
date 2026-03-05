using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Badge
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string? IconUrl { get; set; }

    public string Category { get; set; } = null!;

    public string Rarity { get; set; } = null!;

    public bool IsHidden { get; set; }

    public virtual ICollection<Challenge> Challenges { get; set; } = new List<Challenge>();

    public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}
