namespace KonyvkockaAPI.DTO.Request
{
    public class UpdateProfileSettingsDTO
    {
        /// <summary>
        /// Profilkép – base64 kódolt kép, null ha nem változik
        /// </summary>
        public string? Avatar { get; set; }

        /// <summary>
        /// Országkód (pl. "HU"), null/üres esetén nincs ország beállítva
        /// </summary>
        public string? CountryCode { get; set; }

        /// <summary>
        /// Új jelszó SHA256 hash – a frontend hash-eli, null ha nem változik
        /// </summary>
        public string? NewPasswordHash { get; set; }

        /// <summary>
        /// Új salt – a frontend generálja, kötelező ha NewPasswordHash meg van adva
        /// </summary>
        public string? NewPasswordSalt { get; set; }

        /// <summary>
        /// Maximum 3 aktív rangcím ID-ja (csak a saját megszerzett title-jei közül)
        /// </summary>
        public List<int> ActiveTitleIds { get; set; } = new();
    }
}
