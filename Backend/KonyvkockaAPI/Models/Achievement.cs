using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Achievement
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string LogoUrl { get; set; } = null!;

    public DateTime AchieveDate { get; set; }

    public bool Rarity { get; set; }

    public string Category { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
