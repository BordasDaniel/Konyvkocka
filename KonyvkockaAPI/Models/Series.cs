using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Series
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public int Released { get; set; }

    public decimal Rating { get; set; }

    public string Description { get; set; } = null!;

    public string PosterApiName { get; set; } = null!;

    public int? AgeRatingId { get; set; }

    public string? TrailerUrl { get; set; }

    public int RewardXp { get; set; }

    public int RewardPoints { get; set; }

    public bool HasSubtitles { get; set; }

    public bool IsOriginalLanguage { get; set; }

    public bool IsOfflineAvailable { get; set; }

    public virtual AgeRating? AgeRating { get; set; }

    public virtual ICollection<Author> Authors { get; set; } = new List<Author>();

    public virtual ICollection<Genre> Genres { get; set; } = new List<Genre>();

    public virtual ICollection<ContentCategory> Categories { get; set; } = new List<ContentCategory>();

    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();

    public virtual ICollection<Episode> Episodes { get; set; } = new List<Episode>();

    public virtual ICollection<UserSeries> UserSeries { get; set; } = new List<UserSeries>();
}
