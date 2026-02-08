using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class ChallengeController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public ChallengeController(KonyvkockaContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Kihívások listája
        /// GET /Challenge?status={status}&type={type}
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetChallenges(
            [FromQuery] string? status = null,
            [FromQuery] string? type = null)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var allChallenges = await _context.Challenges
                    .Where(c => c.IsActive == true)
                    .Include(c => c.RewardBadge)
                    .Include(c => c.RewardTitle)
                    .ToListAsync();

                var userChallenges = await _context.UserChallenges
                    .Where(uc => uc.UserId == userId)
                    .ToListAsync();

                var userChallengeDict = userChallenges.ToDictionary(uc => uc.ChallengeId);

                var challengeDtos = allChallenges.Select(c =>
                {
                    userChallengeDict.TryGetValue(c.Id, out var uc);

                    return new ChallengeDTO
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Description = c.Description,
                        Difficulty = c.Difficulty,
                        Type = c.Type,
                        TargetValue = c.TargetValue,
                        CurrentValue = uc?.CurrentValue ?? 0,
                        Status = uc?.Status ?? "NOT_STARTED",
                        CompletedAt = uc?.CompletedAt,
                        ClaimedAt = uc?.ClaimedAt,
                        Rewards = new ChallengeRewardsDTO
                        {
                            Xp = c.RewardXp,
                            Title = c.RewardTitle != null ? new ChallengeTitleRewardDTO
                            {
                                Id = c.RewardTitle.Id,
                                Name = c.RewardTitle.Name,
                                Rarity = c.RewardTitle.Rarity
                            } : null,
                            Badge = c.RewardBadge != null ? new ChallengeBadgeRewardDTO
                            {
                                Id = c.RewardBadge.Id,
                                Name = c.RewardBadge.Name,
                                IconURL = c.RewardBadge.IconUrl,
                                Rarity = c.RewardBadge.Rarity
                            } : null
                        }
                    };
                }).ToList();

                // Counts számítása szűrés előtt
                var counts = new
                {
                    all = challengeDtos.Count,
                    active = challengeDtos.Count(c => c.Status == "NOT_STARTED" || c.Status == "IN_PROGRESS"),
                    completed = challengeDtos.Count(c => c.Status == "COMPLETED" || c.Status == "CLAIMED"),
                    events = challengeDtos.Count(c => c.Type == "EVENT")
                };

                // Status szűrő
                if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
                {
                    challengeDtos = status.ToLower() switch
                    {
                        "active" => challengeDtos.Where(c => c.Status == "NOT_STARTED" || c.Status == "IN_PROGRESS").ToList(),
                        "completed" => challengeDtos.Where(c => c.Status == "COMPLETED" || c.Status == "CLAIMED").ToList(),
                        "events" => challengeDtos.Where(c => c.Type == "EVENT").ToList(),
                        _ => challengeDtos
                    };
                }

                // Type szűrő
                if (!string.IsNullOrEmpty(type) && type.ToLower() != "all")
                {
                    challengeDtos = challengeDtos
                        .Where(c => c.Type.Equals(type, StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                return Ok(new { counts, challenges = challengeDtos });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        /// <summary>
        /// DEBUG: User challenge státusz lekérdezése
        /// GET /Challenge/{id}/status
        /// </summary>
        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetChallengeStatus(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var challenge = await _context.Challenges.FindAsync(id);
                var userChallenge = await _context.UserChallenges
                    .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChallengeId == id);

                return Ok(new
                {
                    userId,
                    challengeExists = challenge != null,
                    challengeId = id,
                    targetValue = challenge?.TargetValue,
                    userChallengeExists = userChallenge != null,
                    currentValue = userChallenge?.CurrentValue,
                    status = userChallenge?.Status,
                    completedAt = userChallenge?.CompletedAt,
                    claimedAt = userChallenge?.ClaimedAt,
                    canClaim = userChallenge != null && userChallenge.Status == "COMPLETED" && userChallenge.ClaimedAt == null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Kihívás jutalom igénylése
        /// POST /Challenge/{id}/claim
        /// </summary>
        [HttpPost("{id}/claim")]
        public async Task<IActionResult> ClaimChallenge(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var challenge = await _context.Challenges
                    .Include(c => c.RewardBadge)
                    .Include(c => c.RewardTitle)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (challenge == null)
                {
                    return NotFound(new { error = "Not Found", message = "Kihívás nem található" });
                }

                var userChallenge = await _context.UserChallenges
                    .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChallengeId == id);

                if (userChallenge.ClaimedAt != null)
                {
                    return BadRequest(new { error = "Bad Request", message = "A kihívás jutalma már igényelve lett" });
                }

                if (userChallenge == null || userChallenge.Status != "COMPLETED")
                {
                    return NotFound(new { error = "Not Found", message = "Kihívás nem található" });
                }

                

                // ClaimedAt beállítása – a DB trigger elvégzi a jutalmak kiosztását és a CLAIMED státusz beállítását
                userChallenge.ClaimedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Kihívás jutalom sikeresen igényelve!",
                    challengeId = id,
                    rewards = new
                    {
                        xp = challenge.RewardXp,
                        title = challenge.RewardTitle != null ? new
                        {
                            id = challenge.RewardTitle.Id,
                            name = challenge.RewardTitle.Name,
                            rarity = challenge.RewardTitle.Rarity
                        } : (object?)null,
                        badge = challenge.RewardBadge != null ? new
                        {
                            id = challenge.RewardBadge.Id,
                            name = challenge.RewardBadge.Name,
                            iconURL = challenge.RewardBadge.IconUrl,
                            rarity = challenge.RewardBadge.Rarity
                        } : (object?)null
                    },
                    claimedAt = userChallenge.ClaimedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }
    }
}