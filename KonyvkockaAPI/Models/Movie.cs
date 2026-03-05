using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Movie
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public int Released { get; set; }

    /// <summary>
    /// Film hossza percben
    /// </summary>
    public int Length { get; set; }

    public decimal Rating { get; set; }

    public string Description { get; set; } = null!;

    public string StreamUrl { get; set; } = null!;

    public string PosterApiName { get; set; } = null!;

    public int? AgeRatingId { get; set; }

    public string? TrailerUrl { get; set; }

    public int RewardXp { get; set; }

    public int RewardPoints { get; set; }

    public bool HasSubtitles { get; set; }

    public bool IsOriginalLanguage { get; set; }

    public bool IsOfflineAvailable { get; set; }

    public virtual AgeRating? AgeRating { get; set; }

    public virtual ICollection<ContentCategory> Categories { get; set; } = new List<ContentCategory>();

    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();

    public virtual ICollection<UserMovie> UserMovies { get; set; } = new List<UserMovie>();
}
