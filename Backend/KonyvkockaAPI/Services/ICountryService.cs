namespace KonyvkockaAPI.Services
{
    public interface ICountryService
    {
        string GetCountryName(string countryCode);
        string GetCountryFlag(string countryCode);
        string GetContinentCode(string countryCode);
    }

    public class CountryService : ICountryService
    {
        private static readonly Dictionary<string, (string Name, string Flag, string Continent)> CountryData = new()
        {
            { "HU", ("Magyarország", "🇭🇺", "EU") },
            { "DE", ("Németország", "🇩🇪", "EU") },
            { "EN", ("Anglia", "🇬🇧", "EU") },
            { "FR", ("Franciaország", "🇫🇷", "EU") },
            { "US", ("Egyesült Államok", "🇺🇸", "NA") },
            { "ES", ("Spanyolország", "🇪🇸", "EU") },
            { "IT", ("Olaszország", "🇮🇹", "EU") },
            { "PL", ("Lengyelország", "🇵🇱", "EU") },
            { "RO", ("Románia", "🇷🇴", "EU") },
            { "CZ", ("Csehország", "🇨🇿", "EU") }
        };

        public string GetCountryName(string countryCode)
        {
            return CountryData.TryGetValue(countryCode?.ToUpper() ?? "", out var data) ? data.Name : countryCode;
        }

        public string GetCountryFlag(string countryCode)
        {
            return CountryData.TryGetValue(countryCode?.ToUpper() ?? "", out var data) ? data.Flag : "🌍";
        }

        public string GetContinentCode(string countryCode)
        {
            return CountryData.TryGetValue(countryCode?.ToUpper() ?? "", out var data) ? data.Continent : "XX";
        }
    }
}