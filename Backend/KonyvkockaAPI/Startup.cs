using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using KonyvkockaAPI.Models;
using KonyvkockaAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI
{
    public class Startup
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration.GetConnectionString("KonyvkockaConnection") ?? string.Empty;
            var databaseUrl = builder.Configuration["DATABASE_URL"] ?? builder.Configuration["DB_URL"];

            if (!string.IsNullOrWhiteSpace(databaseUrl))
            {
                connectionString = BuildConnectionStringFromDatabaseUrl(databaseUrl);
            }

            var dbHost = builder.Configuration["DB_HOST"];
            if (string.IsNullOrWhiteSpace(databaseUrl) && !string.IsNullOrWhiteSpace(dbHost))
            {
                var dbPort = builder.Configuration["DB_PORT"] ?? "3306";
                var dbName = builder.Configuration["DB_NAME"] ?? "konyvkocka";
                var dbUser = builder.Configuration["DB_USER"] ?? "root";
                var dbPassword = builder.Configuration["DB_PASSWORD"] ?? string.Empty;
                connectionString = $"Server={dbHost};Port={dbPort};Database={dbName};Uid={dbUser};Pwd={dbPassword};";
            }

            // Add services to the container.
            builder.Services.AddDbContext<KonyvkockaContext>(options => 
                options.UseMySQL(connectionString));

            // Register custom services
            builder.Services.AddSingleton<ICountryService, CountryService>();
            builder.Services.AddScoped<IChallengeProgressService, ChallengeProgressService>();
            builder.Services.AddHttpClient();

            builder.Services.AddControllers().AddJsonOptions(x => 
                x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

            // JWT Settings
            var jwtSettings = new JwtSettings();
            builder.Configuration.GetSection("JwtSettings").Bind(jwtSettings);
            builder.Services.AddSingleton(jwtSettings);

            var emailSettings = new EmailSettings();
            builder.Configuration.GetSection("EmailSettings").Bind(emailSettings);
            builder.Services.AddSingleton(emailSettings);

            var appUrlSettings = new AppUrlSettings();
            builder.Configuration.GetSection("AppUrlSettings").Bind(appUrlSettings);
            builder.Services.AddSingleton(appUrlSettings);

            builder.Services.AddScoped<IEmailService, SmtpEmailService>();

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateIssuerSigningKey = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,

                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecurityKey))
                };
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter token",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "Bearer"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });

            builder.Services.AddCors(c => { 
                c.AddPolicy("AllowOrigin", options => options.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()); 
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseCors(options => options.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.MapControllers();
            app.MapFallbackToFile("index.html");

            app.Run();
        }

        private static string BuildConnectionStringFromDatabaseUrl(string databaseUrl)
        {
            if (!databaseUrl.StartsWith("mysql://", StringComparison.OrdinalIgnoreCase))
            {
                return databaseUrl;
            }

            var uri = new Uri(databaseUrl);
            var userInfoParts = uri.UserInfo.Split(':', 2, StringSplitOptions.TrimEntries);
            var user = userInfoParts.Length > 0 ? Uri.UnescapeDataString(userInfoParts[0]) : string.Empty;
            var password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : string.Empty;
            var dbName = uri.AbsolutePath.Trim('/');

            var queryValues = ParseQueryString(uri.Query);
            var sslModeValue = queryValues.TryGetValue("ssl-mode", out var sslMode)
                ? sslMode
                : (queryValues.TryGetValue("sslmode", out var altSslMode) ? altSslMode : string.Empty);

            var connectionString = $"Server={uri.Host};Port={uri.Port};Database={dbName};Uid={user};Pwd={password};";
            if (!string.IsNullOrWhiteSpace(sslModeValue))
            {
                connectionString += $"SslMode={NormalizeSslMode(sslModeValue)};";
            }

            return connectionString;
        }

        private static Dictionary<string, string> ParseQueryString(string query)
        {
            var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            if (string.IsNullOrWhiteSpace(query))
            {
                return result;
            }

            var trimmedQuery = query.StartsWith('?') ? query[1..] : query;
            var parameters = trimmedQuery.Split('&', StringSplitOptions.RemoveEmptyEntries);
            foreach (var parameter in parameters)
            {
                var keyValue = parameter.Split('=', 2);
                if (keyValue.Length == 0 || string.IsNullOrWhiteSpace(keyValue[0]))
                {
                    continue;
                }

                var key = Uri.UnescapeDataString(keyValue[0]);
                var value = keyValue.Length > 1 ? Uri.UnescapeDataString(keyValue[1]) : string.Empty;
                result[key] = value;
            }

            return result;
        }

        private static string NormalizeSslMode(string sslMode)
        {
            return sslMode.Trim().ToUpperInvariant() switch
            {
                "DISABLED" => "None",
                "PREFERRED" => "Preferred",
                "REQUIRED" => "Required",
                "VERIFYCA" => "VerifyCA",
                "VERIFY-CA" => "VerifyCA",
                "VERIFYIDENTITY" => "VerifyFull",
                "VERIFY-IDENTITY" => "VerifyFull",
                _ => "Required"
            };
        }
    }
}
