using KonyvkockaAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Services
{
    public class ChallengeProgressService : IChallengeProgressService
    {
        private readonly KonyvkockaContext _context;

        public ChallengeProgressService(KonyvkockaContext context)
        {
            _context = context;
        }

        public async Task RecalculateForUserAsync(int userId, CancellationToken cancellationToken = default)
        {
            if (userId <= 0)
                return;

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (user == null)
                return;

            var activeChallenges = await _context.Challenges
                .Where(c => c.IsActive == true)
                .ToListAsync(cancellationToken);

            if (activeChallenges.Count == 0)
                return;

            var userChallengeList = await _context.UserChallenges
                .Where(uc => uc.UserId == userId)
                .ToListAsync(cancellationToken);

            var userChallengeMap = userChallengeList.ToDictionary(uc => uc.ChallengeId);

            var completedBooks = await _context.UserBooks
                .CountAsync(ub => ub.UserId == userId && ub.Status == "COMPLETED", cancellationToken);

            var completedMovies = await _context.UserMovies
                .CountAsync(um => um.UserId == userId && um.Status == "COMPLETED", cancellationToken);

            var completedSeries = await _context.UserSeries
                .CountAsync(us => us.UserId == userId && us.Status == "COMPLETED", cancellationToken);

            var metrics = new ChallengeMetricSnapshot
            {
                CompletedBooks = completedBooks,
                CompletedMovies = completedMovies,
                CompletedSeries = completedSeries,
                ReadMinutes = Math.Max(0, user.ReadTimeMin),
                WatchMinutes = Math.Max(0, user.WatchTimeMin),
                DayStreak = Math.Max(0, user.DayStreak)
            };

            var now = DateTime.Now;
            var hasChanges = false;

            foreach (var challenge in activeChallenges)
            {
                var nextProgress = ResolveProgressValue(challenge, metrics);
                if (!nextProgress.HasValue)
                    continue;

                var progressValue = Math.Min(Math.Max(0, nextProgress.Value), Math.Max(1, challenge.TargetValue));

                if (userChallengeMap.TryGetValue(challenge.Id, out var existing))
                {
                    if (ApplyProgress(existing, challenge, progressValue, now))
                        hasChanges = true;

                    continue;
                }

                if (progressValue <= 0)
                    continue;

                var initialStatus = ResolveStatus(progressValue, challenge.TargetValue);

                var userChallenge = new UserChallenge
                {
                    UserId = userId,
                    ChallengeId = challenge.Id,
                    CurrentValue = progressValue,
                    Status = initialStatus,
                    StartedAt = initialStatus == "NOT_STARTED" ? null : now,
                    CompletedAt = initialStatus == "COMPLETED" ? now : null,
                    ClaimedAt = null
                };

                _context.UserChallenges.Add(userChallenge);
                hasChanges = true;
            }

            if (hasChanges)
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        private static bool ApplyProgress(UserChallenge userChallenge, Challenge challenge, int nextProgress, DateTime now)
        {
            var hasChanges = false;
            var isClaimed = string.Equals(userChallenge.Status, "CLAIMED", StringComparison.OrdinalIgnoreCase);

            if (isClaimed)
            {
                if (nextProgress > userChallenge.CurrentValue)
                {
                    userChallenge.CurrentValue = nextProgress;
                    hasChanges = true;
                }

                return hasChanges;
            }

            if (userChallenge.CurrentValue != nextProgress)
            {
                userChallenge.CurrentValue = nextProgress;
                hasChanges = true;
            }

            var nextStatus = ResolveStatus(nextProgress, challenge.TargetValue);
            if (!string.Equals(userChallenge.Status, nextStatus, StringComparison.OrdinalIgnoreCase))
            {
                userChallenge.Status = nextStatus;
                hasChanges = true;
            }

            if (nextStatus == "IN_PROGRESS" && userChallenge.StartedAt == null)
            {
                userChallenge.StartedAt = now;
                hasChanges = true;
            }

            if (nextStatus == "COMPLETED")
            {
                if (userChallenge.StartedAt == null)
                {
                    userChallenge.StartedAt = now;
                    hasChanges = true;
                }

                if (userChallenge.CompletedAt == null)
                {
                    userChallenge.CompletedAt = now;
                    hasChanges = true;
                }
            }

            return hasChanges;
        }

        private static string ResolveStatus(int currentValue, int targetValue)
        {
            var threshold = Math.Max(1, targetValue);

            if (currentValue >= threshold)
                return "COMPLETED";

            if (currentValue > 0)
                return "IN_PROGRESS";

            return "NOT_STARTED";
        }

        private static int? ResolveProgressValue(Challenge challenge, ChallengeMetricSnapshot metrics)
        {
            var type = (challenge.Type ?? string.Empty).Trim().ToUpperInvariant();
            var descriptor = $"{challenge.Title} {challenge.Description}".ToLowerInvariant();

            return type switch
            {
                "READ" => metrics.CompletedBooks,
                "WATCH" => ResolveWatchMetric(descriptor, metrics),
                "DEDICATION" => ResolveDedicationMetric(descriptor, metrics),
                "MIXED" => metrics.CompletedBooks + metrics.CompletedMovies + metrics.CompletedSeries,
                _ => null
            };
        }

        private static int ResolveWatchMetric(string descriptor, ChallengeMetricSnapshot metrics)
        {
            if (ContainsAny(descriptor, "sorozat"))
                return metrics.CompletedSeries;

            if (ContainsAny(descriptor, "film", "mozi"))
                return metrics.CompletedMovies;

            return metrics.CompletedMovies + metrics.CompletedSeries;
        }

        private static int ResolveDedicationMetric(string descriptor, ChallengeMetricSnapshot metrics)
        {
            if (ContainsAny(descriptor, "napos", "streak", "sorozatot", "sorozat"))
                return metrics.DayStreak;

            if (ContainsAny(descriptor, "olvas", "konyv", "read"))
                return metrics.ReadMinutes;

            if (ContainsAny(descriptor, "nez", "watch", "perc", "film", "tartalom"))
                return metrics.WatchMinutes;

            return metrics.ReadMinutes + metrics.WatchMinutes;
        }

        private static bool ContainsAny(string value, params string[] needles)
        {
            foreach (var needle in needles)
            {
                if (value.Contains(needle, StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }

        private sealed class ChallengeMetricSnapshot
        {
            public int CompletedBooks { get; init; }
            public int CompletedMovies { get; init; }
            public int CompletedSeries { get; init; }
            public int ReadMinutes { get; init; }
            public int WatchMinutes { get; init; }
            public int DayStreak { get; init; }
        }
    }
}