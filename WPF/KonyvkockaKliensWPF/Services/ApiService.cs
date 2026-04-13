using KonyvkockaKliensWPF.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Cryptography;
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
            string passwordHash = ComputeSha256(password);
            var request = new LoginRequestDto { Email = email, PasswordHash = passwordHash };
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

        private static string ComputeSha256(string value)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(value);
            byte[] hash = SHA256.HashData(bytes);
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        // Felhasználók listázása (alap DTO)
        public async Task<List<UserDto>> GetUsersAsync(int page = 1, int pageSize = 20)
        {
            try
            {
                var response = await _httpClient.GetAsync($"/api/admin/users?page={page}&pageSize={pageSize}");

                if (response.IsSuccessStatusCode)
                {
                    var payload = await response.Content.ReadFromJsonAsync<UsersListResponseDto>(new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    return payload?.Users ?? new List<UserDto>();
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException(
                    $"Felhasználók listázása sikertelen ({(int)response.StatusCode}): {errorContent}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error fetching users: {ex.Message}");
                throw;
            }
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
                var response = await _httpClient.DeleteAsync($"/api/admin/users/{id}");
                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show("Felhasználó sikeresen törölve.", "Siker", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    string errorContent = await response.Content.ReadAsStringAsync();
                    MessageBox.Show(
                        $"Hiba történt a felhasználó törlése közben.\nStátusz: {(int)response.StatusCode}\n{errorContent}",
                        "Hiba",
                        MessageBoxButton.OK,
                        MessageBoxImage.Error);
                }

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error deleting user {id}: {ex.Message}");
                return false;
            }
        }

        // Felhasználó módosítása (admin DTO-val)
        public async Task<bool> UpdateUserAsync(int id, UpdateAdminUserRequestDto user)
        {
            try
            {
                var response = await _httpClient.PutAsJsonAsync($"/api/admin/users/{id}", user);
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    System.Diagnostics.Debug.WriteLine($"Error updating user {id}: {errorContent}");
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

