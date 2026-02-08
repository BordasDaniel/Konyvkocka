using KonyvkockaAPI.DTO;
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
    [Route("[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly KonyvkockaContext _context;
        private readonly JwtSettings _jwtSettings;

        public AuthController(KonyvkockaContext context, JwtSettings jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings;
        }

        /// <summary>
        /// Bejelentkezés ellenőrzése (Session Check)
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
                {
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "Unauthorized",
                        Message = "Érvénytelen vagy lejárt token"
                    });
                }

                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "Unauthorized",
                        Message = "Érvénytelen vagy lejárt token"
                    });
                }

                var response = new UserMeDTO
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Avatar = user.ProfilePic,
                    IsSubscriber = user.Premium,
                    PermissionLevel = user.PermissionLevel,
                    
                };

                return Ok(response);
            }
            catch (Exception)
            {
                return Unauthorized(new ErrorResponseDTO
                {
                    Error = "Unauthorized",
                    Message = "Érvénytelen vagy lejárt token"
                });
            }
        }

        /// <summary>
        /// DEBUG: Hash teszt - ÉLESBEN TÖRÖLNI!
        /// POST /api/auth/debug-hash
        /// </summary>
        [HttpPost("debug-hash")]
        public async Task<IActionResult> DebugHash(AuthLoginDTO loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            string calculatedDoubleHash = CreateSHA256(loginDto.PasswordHash + user.PasswordSalt);

            return Ok(new
            {
                email = user.Email,
                storedSalt = user.PasswordSalt,
                storedHash = user.PasswordHash,
                clientSentHash = loginDto.PasswordHash,
                serverCalculated = $"SHA256({loginDto.PasswordHash} + {user.PasswordSalt})",
                match = user.PasswordHash == calculatedDoubleHash
            });
        }

        /// <summary>
        /// Bejelentkezés email és jelszó alapján
        /// POST /api/auth/login
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login(AuthLoginDTO loginDto)
        {
            try
            {
                // Felhasználó keresése email alapján
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (user == null)
                {
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "Invalid credentials",
                        Message = "Hibás email vagy jelszó"
                    });
                }

                // Hash ellenőrzése: 
                // - Kliens küldi: SHA256(password)
                // - Szerver számítja: SHA256(clientHash + storedSalt) = doubleHash
                // - Összehasonlítjuk a tárolt doubleHash-sel
                string doubleHash = CreateSHA256(loginDto.PasswordHash + user.PasswordSalt);

                if (user.PasswordHash != doubleHash)
                {
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "Invalid credentials",
                        Message = "Hibás email vagy jelszó"
                    });
                }

                // LastLoginDate frissítése
                user.LastLoginDate = DateTime.Now;
                await _context.SaveChangesAsync();

                // JWT token generálása
                var token = GenerateJwtToken(user);

                // Válasz összeállítása
                var response = new AuthResponseDTO
                {
                    User = new UserMeDTO
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        Avatar = user.ProfilePic,
                        IsSubscriber = user.Premium
                    },
                    Token = token
                };

                return Ok(response);
            }
            catch (Exception)
            {
                return Unauthorized(new ErrorResponseDTO
                {
                    Error = "Invalid credentials",
                    Message = "Hibás email vagy jelszó"
                });
            }
        }

        /// <summary>
        /// Regisztráció
        /// POST /api/auth/register
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register(AuthRegisterDTO registerDto)
        {
            try
            {
                // Ellenőrizzük, hogy a felhasználónév foglalt-e
                if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "Validation error",
                        Message = "A felhasználónév már használatban van"
                    });
                }

                // Ellenőrizzük, hogy az email foglalt-e
                if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "Validation error",
                        Message = "Az email cím már használatban van"
                    });
                }

                // A kliens küldi a hash-t (SHA256(password)) és a salt-ot
                // A szerver újra hash-eli: SHA256(clientHash + clientSalt) = doubleHash
                string doubleHash = CreateSHA256(registerDto.PasswordHash + registerDto.PasswordSalt);

                var user = new User
                {
                    Username = registerDto.Username,
                    Email = registerDto.Email,
                    PasswordHash = doubleHash,
                    PasswordSalt = registerDto.PasswordSalt,
                    CountryCode = "ZZ",
                    ProfilePic = "default_avatar.png",
                    Premium = false,
                    CreationDate = DateTime.Now,
                    LastLoginDate = DateTime.Now,
                    Level = 1,
                    BookPoints = 0,
                    SeriesPoints = 0,
                    MoviePoints = 0,
                    DayStreak = 0,
                    ReadTimeMin = 0,
                    WatchTimeMin = 0
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // JWT token generálása
                var token = GenerateJwtToken(user);

                // Válasz összeállítása
                var response = new AuthResponseDTO
                {
                    User = new UserMeDTO
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        Avatar = user.ProfilePic,
                        IsSubscriber = user.Premium
                    },
                    Token = token
                };

                return StatusCode(201, response);
            }
            catch (Exception)
            {
                return BadRequest(new ErrorResponseDTO
                {
                    Error = "Validation error",
                    Message = "Hiba történt a regisztráció során"
                });
            }
        }

        /// <summary>
        /// Kijelentkezés
        /// POST /api/auth/logout
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // JWT token alapú autentikációnál a kijelentkezés kliens oldalon történik
            // (token törlése), a szerver oldalon nincs teendő
            return Ok(new MessageResponseDTO
            {
                Message = "Sikeres kijelentkezés"
            });
        }

        #region Helper Methods

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim("userId", user.Id.ToString()),
                new Claim("premium", user.Premium.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecurityKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(_jwtSettings.ExpirityMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateSalt()
        {
            Random random = new Random();
            string karakterek = "qwertzuiopasdfghjklyxcvbnmQWERTZUIOPASDFGHJKLYXCVBNM1234567890";
            string salt = "";
            for (int i = 0; i < 64; i++)
            {
                salt += karakterek[random.Next(karakterek.Length)];
            }
            return salt;
        }

        private static string CreateSHA256(string input)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] data = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
                StringBuilder sbuilder = new();

                for (int i = 0; i < data.Length; i++)
                {
                    sbuilder.Append(data[i].ToString("x2"));
                }

                return sbuilder.ToString();
            }
        }

        #endregion
    }
}
