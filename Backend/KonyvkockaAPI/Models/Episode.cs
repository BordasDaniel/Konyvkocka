using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Episode
{
    public int Id { get; set; }

    public int SeriesId { get; set; }

    public int SeasonNum { get; set; }

    public int EpisodeNum { get; set; }

    public string Title { get; set; } = null!;

    /// <summary>
    /// Stream URL – DB oszlopneve: StreamURL
    /// </summary>
    public string StreamUrl { get; set; } = null!;

    /// <summary>
    /// Epizód hossza percben
    /// </summary>
    public int Length { get; set; }

    public virtual Series Series { get; set; } = null!;
}
