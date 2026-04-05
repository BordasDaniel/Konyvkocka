using KonyvkockaAPI.DTO.Request;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly KonyvkockaContext _context;
        private readonly JwtSettings _jwtSettings;

        public AuthController(KonyvkockaContext context, JwtSettings jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings;
        }

        /// <summary>
        /// Session ellenőrzés – visszaadja a bejelentkezett user adatait
        /// GET /api/auth/me
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "Unauthorized",
                        Message = "Érvénytelen vagy lejárt token"
                    });

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "Unauthorized",
                        Message = "Érvénytelen vagy lejárt token"
                    });

                return Ok(BuildUserMeDTO(user));
            }
            catch (Exception)
            {
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "InternalError",
                    Message = "A munkamenet ellenőrzése sikertelen"
                });
            }
        }

        /// <summary>
        /// Bejelentkezés
        /// POST /api/auth/login
        /// Body: AuthLoginDTO { Email, PasswordHash }
        /// A kliens SHA256(jelszó)-t küld, a szerver SHA256(clientHash + storedSalt)-ot ellenőriz
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthLoginDTO loginDto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (user == null)
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "InvalidCredentials",
                        Message = "Hibás email vagy jelszó"
                    });

                if (IsSuspendedPermissionLevel(user.PermissionLevel))
                    return StatusCode(403, new ErrorResponseDTO
                    {
                        Error = "AccountSuspended",
                        Message = "Sikertelen bejelentkezés: a felhasználói fiók fel van függesztve"
                    });

                string doubleHash = CreateSHA256(loginDto.PasswordHash + user.PasswordSalt);

                if (user.PasswordHash != doubleHash)
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "InvalidCredentials",
                        Message = "Hibás email vagy jelszó"
                    });

                user.LastLoginDate = DateTime.Now;
                await _context.SaveChangesAsync();

                return Ok(new AuthResponseDTO
                {
                    User  = BuildUserMeDTO(user),
                    Token = GenerateJwtToken(user)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "InternalError",
                    Message = ex.InnerException?.Message ?? ex.Message
                });
            }
        }

        /// <summary>
        /// Regisztráció
        /// POST /api/auth/register
        /// Body: AuthRegisterDTO { Username, Email, PasswordHash, PasswordSalt }
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AuthRegisterDTO registerDto)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "ValidationError",
                        Message = "A felhasználónév már használatban van"
                    });

                if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "ValidationError",
                        Message = "Az email cím már használatban van"
                    });

                string doubleHash = CreateSHA256(registerDto.PasswordHash + registerDto.PasswordSalt);

                var user = new User
                {
                    Username         = registerDto.Username,
                    Email            = registerDto.Email,
                    PasswordHash     = doubleHash,
                    PasswordSalt     = registerDto.PasswordSalt,
                    CountryCode      = "ZZ",
                    ProfilePic       = null,
                    Premium          = false,
                    PremiumExpiresAt = null,
                    CreationDate     = DateTime.Now,
                    LastLoginDate    = DateTime.Now,
                    Level            = 1,
                    Xp               = 0,
                    BookPoints       = 0,
                    SeriesPoints     = 0,
                    MoviePoints      = 0,
                    DayStreak        = 0,
                    ReadTimeMin      = 0,
                    WatchTimeMin     = 0,
                    PermissionLevel  = "USER"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return StatusCode(201, new AuthResponseDTO
                {
                    User  = BuildUserMeDTO(user),
                    Token = GenerateJwtToken(user)
                });
            }
            catch (Exception)
            {
                return BadRequest(new ErrorResponseDTO
                {
                    Error = "ValidationError",
                    Message = "Hiba történt a regisztráció során"
                });
            }
        }

        /// <summary>
        /// Kijelentkezés – JWT alapú, a token törlése kliens oldalon történik
        /// POST /api/auth/logout
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            return Ok(new MessageResponseDTO { Message = "Sikeres kijelentkezés" });
        }

        /// <summary>
        /// DEBUG: Hash ellenőrzés – csak ADMIN érheti el, élesben törölni!
        /// POST /api/auth/debug-hash
        /// </summary>
        [HttpPost("debug-hash")]
        [Authorize]
        public async Task<IActionResult> DebugHash([FromBody] AuthLoginDTO loginDto)
        {
            if (User.FindFirst("permissionLevel")?.Value != "ADMIN")
                return Forbid();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null)
                return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

            string calculated = CreateSHA256(loginDto.PasswordHash + user.PasswordSalt);

            return Ok(new
            {
                email            = user.Email,
                storedSalt       = user.PasswordSalt,
                storedHash       = user.PasswordHash,
                clientSentHash   = loginDto.PasswordHash,
                serverCalculated = calculated,
                match            = user.PasswordHash == calculated
            });
        }

        #region Helpers

        private static UserMeDTO BuildUserMeDTO(User user) => new()
        {
            Id              = user.Id,
            Username        = user.Username,
            Email           = user.Email,
            Avatar          = user.ProfilePic != null ? Convert.ToBase64String(user.ProfilePic) : null,
            IsSubscriber    = user.Premium,
            PermissionLevel = user.PermissionLevel ?? "USER"
        };

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim("userId",          user.Id.ToString()),
                new Claim("premium",         user.Premium.ToString()),
                new Claim("permissionLevel", user.PermissionLevel ?? "USER"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecurityKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer:             _jwtSettings.Issuer,
                audience:           _jwtSettings.Audience,
                claims:             claims,
                expires:            DateTime.Now.AddMinutes(_jwtSettings.ExpirityMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string CreateSHA256(string input)
        {
            using SHA256 sha256 = SHA256.Create();
            byte[] data = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
            var sb = new StringBuilder();
            foreach (byte b in data) sb.Append(b.ToString("x2"));
            return sb.ToString();
        }

        private static bool IsSuspendedPermissionLevel(string? permissionLevel)
        {
            var normalized = permissionLevel?.Trim().ToUpperInvariant();
            return normalized is "BANNED" or "SUSPENDED" or "RESTRICTED" or "KORLATOZOTT";
        }

        #endregion
    }
}
