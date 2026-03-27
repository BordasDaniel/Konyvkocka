using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class DeletedUser
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string PasswordSalt { get; set; } = null!;

    public string CountryCode { get; set; } = null!;

    public byte[] ProfilePic { get; set; } = null!;

    public bool Premium { get; set; }

    public DateTime? PremiumExpiresAt { get; set; }

    public string PermissionLevel { get; set; } = null!;

    public DateTime CreationDate { get; set; }

    public DateTime LastLoginDate { get; set; }

    public int Level { get; set; }

    public int Xp { get; set; }

    public int BookPoints { get; set; }

    public int SeriesPoints { get; set; }

    public int MoviePoints { get; set; }

    public int DayStreak { get; set; }

    public int ReadTimeMin { get; set; }

    public int WatchTimeMin { get; set; }
}
