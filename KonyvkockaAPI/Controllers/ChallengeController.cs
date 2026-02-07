using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.DTO.Request;
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

        /// <summary>
        /// Kihívások listája
        /// GET /api/challenges
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetChallenges(
            [FromQuery] string? type = null,
            [FromQuery] string? difficulty = null,
            [FromQuery] string? status = null)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var challenges = await _context.Challenges
                    .Where(c => c.IsActive == true)
                    .Select(c => new ChallengeDTO
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Description = c.Description,
                        Icon = c.IconUrl,
                        Category = c.Type,
                        Rarity = MapDifficultyToRarity(c.Difficulty),
                        Rewards = new { xp = c.RewardXp },
                        Progress = 0, // TODO: Get from user_challenge
                        Goal = c.TargetValue,
                        ProgressLabel = $"0/{c.TargetValue}",
                        IsCompleted = false,
                        ExpiresAt = null
                    })
                    .ToListAsync();

                if (!string.IsNullOrEmpty(type))
                    challenges = challenges.Where(c => c.Category.ToLower() == type.ToLower()).ToList();

                if (!string.IsNullOrEmpty(difficulty))
                    challenges = challenges.Where(c => c.Rarity.ToLower() == difficulty.ToLower()).ToList();

                return Ok(new { challenges, total = challenges.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        /// <summary>
        /// Kihívás frissítése (progress)
        /// POST /api/challenges/{challengeId}/progress
        /// </summary>
        [HttpPost("{challengeId}/progress")]
        public async Task<IActionResult> UpdateChallengeProgress(int challengeId, KonyvkockaAPI.DTO.Request.UpdateProgressDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var userChallenge = await _context.UserChallenges
                    .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChallengeId == challengeId);

                if (userChallenge == null)
                {
                    userChallenge = new UserChallenge
                    {
                        UserId = userId,
                        ChallengeId = challengeId,
                        CurrentValue = dto.Increment,
                        Status = "IN_PROGRESS",
                        StartedAt = DateTime.Now,
                        LastUpdated = DateTime.Now
                    };
                    _context.UserChallenges.Add(userChallenge);
                }
                else
                {
                    userChallenge.CurrentValue += dto.Increment;
                    userChallenge.LastUpdated = DateTime.Now;
                }

                await _context.SaveChangesAsync();

                var challenge = await _context.Challenges.FindAsync(challengeId);
                var isCompleted = userChallenge.CurrentValue >= challenge.TargetValue;

                return Ok(new
                {
                    challenge = new
                    {
                        id = challengeId,
                        progress = userChallenge.CurrentValue,
                        goal = challenge.TargetValue,
                        isCompleted
                    },
                    message = "Előrehaladás frissítve"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        private string MapDifficultyToRarity(string difficulty)
        {
            return difficulty.ToUpper() switch
            {
                "EASY" => "common",
                "MEDIUM" => "uncommon",
                "HARD" => "rare",
                "EPIC" => "legendary",
                _ => "common"
            };
        }
    }
}