using System.Windows;
using System.Windows.Controls;
using KonyvkockaKliensWPF.Models;
using KonyvkockaKliensWPF.Services;

namespace KonyvkockaKliensWPF
{
    public partial class MainWindow : Window
    {
        private readonly ApiService _apiService;
        private List<UserDto> _users = new();

        public MainWindow()
        {
            InitializeComponent();
            _apiService = new ApiService();
            Loaded += MainWindow_Loaded;

            EditUserComboBox.SelectionChanged += EditUserComboBox_SelectionChanged;
            DeleteUserComboBox.SelectionChanged += DeleteUserComboBox_SelectionChanged;
        }

        private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            await LoadUsersAsync();
        }

        // 1. Felhasználók betöltése
        private async Task LoadUsersAsync()
        {
            try
            {
                _users = await _apiService.GetUsersAsync(page: 1, pageSize: 20);
                UsersDataGrid.ItemsSource = _users;

                EditUserComboBox.ItemsSource = _users;
                EditUserComboBox.DisplayMemberPath = "Username";
                EditUserComboBox.SelectedValuePath = "Id";

                DeleteUserComboBox.ItemsSource = _users;
                DeleteUserComboBox.DisplayMemberPath = "Username";
                DeleteUserComboBox.SelectedValuePath = "Id";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Hiba a felhasználók betöltése közben: {ex.Message}", 
                    "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        // 2. Új felhasználó létrehozása
        private async void CreateUserButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string username = NewUsernameTextBox.Text.Trim();
                string email = NewEmailTextBox.Text.Trim();
                string password = NewPasswordBox.Password;

                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    MessageBox.Show("Minden mező kitöltése kötelező!", "Figyelmeztetés", 
                        MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                bool success = await _apiService.RegisterAsync(username, email, password);

                if (success)
                {
                    MessageBox.Show("Felhasználó sikeresen létrehozva!", "Siker", 
                        MessageBoxButton.OK, MessageBoxImage.Information);

                    NewUsernameTextBox.Clear();
                    NewEmailTextBox.Clear();
                    NewPasswordBox.Clear();

                    await LoadUsersAsync();
                }
                else
                {
                    MessageBox.Show("Hiba történt a felhasználó létrehozása közben!", "Hiba", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Hiba: {ex.Message}", "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        // 3. Felhasználó kiválasztása módosításhoz
        private async void EditUserComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (EditUserComboBox.SelectedValue is int userId)
            {
                try
                {
                    var user = await _apiService.GetUserByIdAsync(userId);

                    if (user != null)
                    {
                        EditUsernameTextBox.Text = user.Username;
                        EditEmailTextBox.Text = user.Email;
                        EditLevelTextBox.Text = user.Level.ToString();
                        EditIsPremiumCheckBox.IsChecked = user.IsSubscriber;
                        EditProfilePictureTextBox.Text = user.Avatar ?? "";
                        EditCountryTextBox.Text = user.CountryCode ?? "";
                        EditBookPointsTextBox.Text = user.BookPoints.ToString();
                        EditSeriesPointsTextBox.Text = user.SeriesPoints.ToString();
                        EditFilmPointsTextBox.Text = user.MoviePoints.ToString();
                        EditDayStreakTextBox.Text = user.DayStreak.ToString();
                        EditReadingTimeTextBox.Text = user.ReadTimeMin.ToString();
                        EditWatchingTimeTextBox.Text = user.WatchTimeMin.ToString();
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Hiba: {ex.Message}", "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        // 4. Felhasználó módosítása
        private async void UpdateUserButton_Click(object sender, RoutedEventArgs e)
        {
            if (EditUserComboBox.SelectedValue is not int userId)
            {
                MessageBox.Show("Válassz ki egy felhasználót!", "Figyelmeztetés", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var user = new UserDetailDto
                {
                    Id = userId,
                    Username = EditUsernameTextBox.Text.Trim(),
                    Email = EditEmailTextBox.Text.Trim(),
                    Level = int.TryParse(EditLevelTextBox.Text, out int level) ? level : 0,
                    IsSubscriber = EditIsPremiumCheckBox.IsChecked ?? false,
                    Avatar = EditProfilePictureTextBox.Text.Trim(),
                    CountryCode = EditCountryTextBox.Text.Trim(),
                    BookPoints = int.TryParse(EditBookPointsTextBox.Text, out int bp) ? bp : 0,
                    SeriesPoints = int.TryParse(EditSeriesPointsTextBox.Text, out int sp) ? sp : 0,
                    MoviePoints = int.TryParse(EditFilmPointsTextBox.Text, out int mp) ? mp : 0,
                    DayStreak = int.TryParse(EditDayStreakTextBox.Text, out int ds) ? ds : 0,
                    ReadTimeMin = int.TryParse(EditReadingTimeTextBox.Text, out int rt) ? rt : 0,
                    WatchTimeMin = int.TryParse(EditWatchingTimeTextBox.Text, out int wt) ? wt : 0
                };

                bool success = await _apiService.UpdateUserAsync(userId, user);

                if (success)
                {
                    MessageBox.Show("Felhasználó sikeresen módosítva!", "Siker", 
                        MessageBoxButton.OK, MessageBoxImage.Information);
                    await LoadUsersAsync();
                }
                else
                {
                    MessageBox.Show("Hiba történt a módosítás közben!", "Hiba", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Hiba: {ex.Message}", "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        // 5. Felhasználó törlése
        private async void DeleteUserButton_Click(object sender, RoutedEventArgs e)
        {
            if (DeleteUserComboBox.SelectedValue == null)
            {
                MessageBox.Show("Válassz ki egy felhasználót!", "Figyelmeztetés", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            UserDto userToDelete = (UserDto)DeleteUserComboBox.SelectedItem;

            var result = MessageBox.Show(
                "Biztosan törölni szeretnéd ezt a felhasználót?", 
                "Megerősítés", 
                MessageBoxButton.YesNo, 
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                MessageBox.Show($"Felhasználó törlése: {userToDelete.Username}:{userToDelete.Id}");
                try
                {
                    bool success = await _apiService.DeleteUserAsync(userToDelete.Id);

                    if (success)
                    {
                        MessageBox.Show("Felhasználó sikeresen törölve!", "Siker", 
                            MessageBoxButton.OK, MessageBoxImage.Information);
                        DeleteUserComboBox.SelectedIndex = -1;
                        await LoadUsersAsync();
                    }
                    else
                    {
                        MessageBox.Show("Hiba történt a törlés közben!", "Hiba", 
                            MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Hiba: {ex.Message}", "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private void DeleteUserComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {

        }
    }
}
