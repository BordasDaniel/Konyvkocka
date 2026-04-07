using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public bool IsEmailVerified { get; set; }

    public string? EmailVerificationTokenHash { get; set; }

    public DateTime? EmailVerificationTokenExpiresAt { get; set; }

    public DateTime? EmailVerifiedAt { get; set; }

    public string PasswordHash { get; set; } = null!;

    public string PasswordSalt { get; set; } = null!;

    public string CountryCode { get; set; } = null!;

    public byte[]? ProfilePic { get; set; }

    public bool Premium { get; set; }

    public DateTime? PremiumExpiresAt { get; set; }

    public DateTime CreationDate { get; set; }

    public DateTime LastLoginDate { get; set; }

    public int Level { get; set; }

    /// <summary>
    /// XP a jelenlegi szinten belül (0–999).
    /// 1000 XP felett a DB trigger automatikusan szintet lép és nulla-ra állítja.
    /// </summary>
    public int Xp { get; set; }

    public int BookPoints { get; set; }

    public int SeriesPoints { get; set; }

    public int MoviePoints { get; set; }

    public int DayStreak { get; set; }

    public int ReadTimeMin { get; set; }

    public int WatchTimeMin { get; set; }

    /// <summary>
    /// Jogosultsági szint: "USER" | "MODERATOR" | "ADMIN" | "BANNED"
    /// </summary>
    public string PermissionLevel { get; set; } = "USER";

    public virtual ICollection<Mail> MailReceivers { get; set; } = new List<Mail>();

    public virtual ICollection<Mail> MailSenders { get; set; } = new List<Mail>();

    public virtual ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();

    public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();

    public virtual ICollection<UserTitle> UserTitles { get; set; } = new List<UserTitle>();

    public virtual ICollection<UserBook> UserBooks { get; set; } = new List<UserBook>();

    public virtual ICollection<UserChallenge> UserChallenges { get; set; } = new List<UserChallenge>();

    public virtual ICollection<UserMovie> UserMovies { get; set; } = new List<UserMovie>();

    public virtual ICollection<UserSeries> UserSeries { get; set; } = new List<UserSeries>();
}
