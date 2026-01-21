using KonyvkockaAPI.DTO;
using KonyvkockaAPI.Models;
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
    public class LoginController : ControllerBase
    {
        private readonly JwtSettings _jwtSettings;
        private readonly KonyvkockaContext _context;

        public LoginController(JwtSettings jwtSettings, KonyvkockaContext context)
        {
            _jwtSettings = jwtSettings;
            _context = context;
        }

        [HttpGet("GetSalt")]
        public IActionResult GetSalt(string username)
        {
            try
            {
                if (_context.Users.Any(u => u.Username == username))
                {
                    return Ok(_context.Users.First(u => u.Username == username).PasswordSalt);
                }
                else
                {
                    return BadRequest("Nincs ilyen felhasználónév!");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Hiba: " + ex.Message);
            }
        }

        [HttpPost("Login")]
        public IActionResult Login(LoginDTO loginDTO)
        {
            try
            {
                string doubleHash = CreateSHA256(loginDTO.Hash);
                User user = _context.Users.FirstOrDefault(u => u.Username == loginDTO.Username && u.PasswordHash == doubleHash);
                
                if (user == null)
                {
                    return NotFound("Nincs megfelelő felhasználó! A belépés sikertelen!");
                }

                // Frissítjük a LastLoginDate-et
                user.LastLoginDate = DateTime.Now;
                _context.SaveChanges();

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

                return Ok(new JwtSecurityTokenHandler().WriteToken(token));
            }
            catch (Exception ex)
            {
                return BadRequest($"Hiba a bejelentkezés során: {ex.Message}");
            }
        }

        public static string GenerateSalt()
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

        public static string CreateSHA256(string input)
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
    }
}
