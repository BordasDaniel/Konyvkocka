using KonyvkockaKliensWPF.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Windows;

namespace KonyvkockaKliensWPF.Services
{
    public class ApiService
    {
        private static ApiService? _instance;
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://localhost:7058/api";
        private string? _authToken;

        private ApiService()
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

        public static ApiService Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new ApiService();
                }
                return _instance;
            }
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

                if (response.IsSuccessStatusCode)
                {
                    var loginResponse = await response.Content.ReadFromJsonAsync<LoginResponseDto>(new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (loginResponse != null && !string.IsNullOrEmpty(loginResponse.Token))
                    {
                        SetAuthToken(loginResponse.Token);
                        return true;
                    }
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        // Regisztráció
        public async Task<bool> RegisterAsync(string username, string email, string password)
        {
            try
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
            catch
            {
                return false;
            }
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
                string toSend = JsonSerializer.Serialize(user, JsonSerializerOptions.Default);
                var content = new StringContent(toSend, Encoding.UTF8, "application/json");
                var response = await _httpClient.PutAsync($"{BaseUrl}/Users/FelhasznaloFrissitese/{id}", content);
                if (!response.IsSuccessStatusCode)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error updating user {id}: {ex.Message}");
                return false;
            }
            
        }
    }
}

