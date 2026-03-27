using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChallengeController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public ChallengeController(KonyvkockaContext context)
        {
            _context = context;
        }

        // ================================================================
        // GET /api/challenge
        // Az összes aktív kihívás + a bejelentkezett user haladása
        //
        // Query paraméterek:
        //   status – "active" | "completed" | "events" | "all" (alapértelmezett: all)
        //   type   – Challenge.Type értéke (pl. "BOOK", "STREAK", stb.) | "all"
        // ================================================================
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
                        Id           = c.Id,
                        Title        = c.Title,
                        Description  = c.Description,
                        Difficulty   = c.Difficulty,
                        Type         = c.Type,
                        TargetValue  = c.TargetValue,
                        CurrentValue = uc?.CurrentValue ?? 0,
                        Status       = uc?.Status ?? "NOT_STARTED",
                        CompletedAt  = uc?.CompletedAt,
                        ClaimedAt    = uc?.ClaimedAt,
                        Rewards = new ChallengeRewardsDTO
                        {
                            Xp    = c.RewardXp,
                            Title = c.RewardTitle != null ? new ChallengeTitleRewardDTO
                            {
                                Id     = c.RewardTitle.Id,
                                Name   = c.RewardTitle.Name,
                                Rarity = c.RewardTitle.Rarity
                            } : null,
                            Badge = c.RewardBadge != null ? new ChallengeBadgeRewardDTO
                            {
                                Id      = c.RewardBadge.Id,
                                Name    = c.RewardBadge.Name,
                                IconURL = c.RewardBadge.IconUrl,
                                Rarity  = c.RewardBadge.Rarity
                            } : null
                        }
                    };
                }).ToList();

                // Szűrés előtti darabszámok
                var counts = new
                {
                    all       = challengeDtos.Count,
                    active    = challengeDtos.Count(c => c.Status is "NOT_STARTED" or "IN_PROGRESS"),
                    completed = challengeDtos.Count(c => c.Status is "COMPLETED" or "CLAIMED"),
                    events    = challengeDtos.Count(c => c.Type == "EVENT")
                };

                // Status szűrő
                if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
                {
                    challengeDtos = status.ToLower() switch
                    {
                        "active"    => challengeDtos.Where(c => c.Status is "NOT_STARTED" or "IN_PROGRESS").ToList(),
                        "completed" => challengeDtos.Where(c => c.Status is "COMPLETED" or "CLAIMED").ToList(),
                        "events"    => challengeDtos.Where(c => c.Type == "EVENT").ToList(),
                        _           => challengeDtos
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

        // ================================================================
        // GET /api/challenge/{id}/status
        // Egy adott kihívás részletes státusza a bejelentkezett usernek
        // ================================================================
        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetChallengeStatus(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var challenge = await _context.Challenges.FindAsync(id);
                if (challenge == null)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A kihívás nem található" });

                var userChallenge = await _context.UserChallenges
                    .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChallengeId == id);

                return Ok(new
                {
                    challengeId  = id,
                    targetValue  = challenge.TargetValue,
                    currentValue = userChallenge?.CurrentValue ?? 0,
                    status       = userChallenge?.Status ?? "NOT_STARTED",
                    startedAt    = userChallenge?.StartedAt,
                    completedAt  = userChallenge?.CompletedAt,
                    claimedAt    = userChallenge?.ClaimedAt,
                    canClaim     = userChallenge?.Status == "COMPLETED" && userChallenge.ClaimedAt == null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // POST /api/challenge/{id}/claim
        // Jutalom igénylése egy COMPLETED státuszú kihíváshoz.
        // A ClaimedAt beállítása után a DB trigger elvégzi:
        //   - XP jóváírás a usernek
        //   - Badge hozzáadás (ha van)
        //   - Title hozzáadás (ha van)
        //   - Státusz CLAIMED-re állítás
        // ================================================================
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
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A kihívás nem található" });

                var userChallenge = await _context.UserChallenges
                    .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChallengeId == id);

                // Null-check ELŐSZÖR
                if (userChallenge == null)
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "NotCompleted",
                        Message = "A kihívást először teljesíteni kell az igénylés előtt."
                    });

                // Már igényelt kihívás ellenőrzése (ClaimedAt vagy CLAIMED státusz)
                if (userChallenge.ClaimedAt != null || userChallenge.Status == "CLAIMED")
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "AlreadyClaimed",
                        Message = "A kihívás jutalma már igényelve lett."
                    });

                // Csak COMPLETED státuszú kihívás igényelhető
                if (userChallenge.Status != "COMPLETED")
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "NotCompleted",
                        Message = "A kihívást először teljesíteni kell az igénylés előtt."
                    });

                // ClaimedAt beállítása – a DB trigger elvégzi a jutalom kiosztást
                userChallenge.ClaimedAt = DateTime.Now;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message     = "Kihívás jutalom sikeresen igényelve!",
                    challengeId = id,
                    rewards = new
                    {
                        xp    = challenge.RewardXp,
                        badge = challenge.RewardBadge != null ? new
                        {
                            id      = challenge.RewardBadge.Id,
                            name    = challenge.RewardBadge.Name,
                            iconUrl = challenge.RewardBadge.IconUrl,
                            rarity  = challenge.RewardBadge.Rarity
                        } : (object?)null,
                        title = challenge.RewardTitle != null ? new
                        {
                            id     = challenge.RewardTitle.Id,
                            name   = challenge.RewardTitle.Name,
                            rarity = challenge.RewardTitle.Rarity
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
