using System.Linq;
using KonyvkockaAPI.Models;

namespace KonyvkockaAPI.Extensions;

public static class LibraryQueryExtensions
{
    public static IQueryable<UserBook> ApplyFilters(
        this IQueryable<UserBook> source,
        string? query,
        string[]? status,
        bool? favorite)
    {
        if (!string.IsNullOrWhiteSpace(query))
            source = source.Where(x => x.Book.Title.Contains(query));

        if (status is { Length: > 0 })
        {
            var normalized = status
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.Trim().ToUpperInvariant())
                .ToArray();

            if (normalized.Length > 0)
                source = source.Where(x => normalized.Contains((x.Status ?? string.Empty).ToUpper()));
        }

        if (favorite.HasValue)
            source = source.Where(x => x.Favorite == favorite.Value);

        return source;
    }

    public static IQueryable<UserMovie> ApplyFilters(
        this IQueryable<UserMovie> source,
        string? query,
        string[]? status,
        bool? favorite)
    {
        if (!string.IsNullOrWhiteSpace(query))
            source = source.Where(x => x.Movie.Title.Contains(query));

        if (status is { Length: > 0 })
        {
            var normalized = status
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.Trim().ToUpperInvariant())
                .ToArray();

            if (normalized.Length > 0)
                source = source.Where(x => normalized.Contains((x.Status ?? string.Empty).ToUpper()));
        }

        if (favorite.HasValue)
            source = source.Where(x => x.Favorite == favorite.Value);

        return source;
    }

    public static IQueryable<UserSeries> ApplyFilters(
        this IQueryable<UserSeries> source,
        string? query,
        string[]? status,
        bool? favorite)
    {
        if (!string.IsNullOrWhiteSpace(query))
            source = source.Where(x => x.Series.Title.Contains(query));

        if (status is { Length: > 0 })
        {
            var normalized = status
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.Trim().ToUpperInvariant())
                .ToArray();

            if (normalized.Length > 0)
                source = source.Where(x => normalized.Contains((x.Status ?? string.Empty).ToUpper()));
        }

        if (favorite.HasValue)
            source = source.Where(x => x.Favorite == favorite.Value);

        return source;
    }
}
