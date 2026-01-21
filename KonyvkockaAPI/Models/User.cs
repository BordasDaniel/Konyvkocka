using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string PasswordSalt { get; set; } = null!;

    public string CountryCode { get; set; } = null!;

    public string ProfilePic { get; set; } = null!;

    public bool Premium { get; set; }

    public DateTime CreationDate { get; set; }

    public DateTime LastLoginDate { get; set; }

    public int Level { get; set; }

    public int BookPoints { get; set; }

    public int SeriesPoints { get; set; }

    public int MoviePoints { get; set; }

    public int DayStreak { get; set; }

    public int ReadTimeMin { get; set; }

    public int WatchTimeMin { get; set; }

    public virtual ICollection<Achievement> Achievements { get; set; } = new List<Achievement>();

    public virtual ICollection<Mail> MailReceivers { get; set; } = new List<Mail>();

    public virtual ICollection<Mail> MailSenders { get; set; } = new List<Mail>();

    public virtual ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();

    public virtual ICollection<UserBook> UserBooks { get; set; } = new List<UserBook>();

    public virtual ICollection<UserChallenge> UserChallenges { get; set; } = new List<UserChallenge>();

    public virtual ICollection<UserMovie> UserMovies { get; set; } = new List<UserMovie>();

    public virtual ICollection<UserSeries> UserSeries { get; set; } = new List<UserSeries>();
}
