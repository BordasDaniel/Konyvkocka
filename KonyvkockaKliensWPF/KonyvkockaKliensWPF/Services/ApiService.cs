using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Windows;
using KonyvkockaKliensWPF.Models;

namespace KonyvkockaKliensWPF.Services
{
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://localhost:7058/api";
        private string? _authToken;

        public ApiService()
        {
            var handler = new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
            };

            _httpClient = new HttpClient(handler) 
            { 
                BaseAddress = new Uri(BaseUrl),
                Timeout = TimeSpan.FromSeconds(30)
            };

            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(
                new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
        }

        public void SetAuthToken(string token)
        {
            _authToken = token;
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        }

        // Bejelentkezés
        public async Task<bool> LoginAsync(string email, string password)
        {
            try
            {
                var request = new LoginRequestDto { Email = email, Password = password };
                var response = await _httpClient.PostAsJsonAsync($"{BaseUrl}/Auth/login", request);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        // Regisztráció
        public async Task<bool> RegisterAsync(string username, string email, string password)
        {
            var request = new RegisterRequestDto 
            { 
                Username = username, 
                Email = email, 
                Password = password,
                CountryCode = "HU"
            };

            var response = await _httpClient.PostAsJsonAsync($"{BaseUrl}/Auth/register", request);
            return response.IsSuccessStatusCode;
        }

        // Felhasználók listázása (alap DTO)
        public async Task<List<UserDto>> GetUsersAsync(int page = 1, int pageSize = 20)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{BaseUrl}/Users/MindenFelhasznalo?page={page}&pageSize={pageSize}");

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var users = JsonSerializer.Deserialize<List<UserDto>>(content, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    return users ?? new List<UserDto>();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error fetching users: {ex.Message}");
            }
                
            return new List<UserDto>();
        }

        // Egyedi felhasználó részletes lekérése (teljes DTO)
        public async Task<UserDetailDto?> GetUserByIdAsync(int id)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{BaseUrl}/Users/Felhasznalo/{id}");

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<UserDetailDto>(new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error fetching user {id}: {ex.Message}");
            }

            return null;
        }

        // Felhasználó törlése
        public async Task<bool> DeleteUserAsync(int id)
        {
            try
            {
                var response = await _httpClient.DeleteAsync($"{BaseUrl}/Users/FelhasznaloTorlese/{id}");
                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show("Felhasználó sikeresen törölve.", "Siker", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    MessageBox.Show("Hiba történt a felhasználó törlése közben.", "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
                }

                return response.IsSuccessStatusCode;
                
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error deleting user {id}: {ex.Message}");
                return false;
            }
        }

        // Felhasználó módosítása (teljes DTO-val)
        public async Task<bool> UpdateUserAsync(int id, UserDetailDto user)
        {
            try
            {
                var response = await _httpClient.PutAsJsonAsync($"{BaseUrl}/Users/FelhasznaloModositasa/{id}", user);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error updating user {id}: {ex.Message}");
                return false;
            }
        }
    }
}

