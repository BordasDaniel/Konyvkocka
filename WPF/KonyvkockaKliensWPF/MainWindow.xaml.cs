using System.Windows;
using System.Windows.Controls;
using KonyvkockaKliensWPF.Models;
using KonyvkockaKliensWPF.Services;

namespace KonyvkockaKliensWPF
{
    public partial class MainWindow : Window
    {
        private readonly ApiService _apiService;
        private List<UserDto> _users = [];
        private UserDto? _selectedUserForEdit;
        private UserDto? _selectedUserForDelete;

        public MainWindow()
        {
            InitializeComponent();
            _apiService = ApiService.Instance;
            Loaded += MainWindow_Loaded;

            EditPermissionComboBox.ItemsSource = new[] { "USER", "MODERATOR", "ADMIN", "BANNED" };
            EditSubscriptionTypeComboBox.ItemsSource = new[] { "FREE", "PREMIUM" };

            EditUserComboBox.SelectionChanged += EditUserComboBox_SelectionChanged;
            EditSubscriptionTypeComboBox.SelectionChanged += EditSubscriptionTypeComboBox_SelectionChanged;
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
                UsersDataGrid.SelectedItem = null;
                ClearSelectedUserDetails();

                EditUserComboBox.ItemsSource = _users;
                EditUserComboBox.DisplayMemberPath = "Username";
                EditUserComboBox.SelectedValuePath = "Id";

                DeleteUserComboBox.ItemsSource = _users;
                DeleteUserComboBox.DisplayMemberPath = "Username";
                DeleteUserComboBox.SelectedValuePath = "Id";
                DeleteUserComboBox.SelectedItem = null;
                _selectedUserForDelete = null;
                DeleteConfirmTextBox.Clear();
                DeleteValidationTextBlock.Text = string.Empty;
                DeletePreviewTextBlock.Text = "Nincs kijelölt felhasználó.";
                DeleteUserButton.IsEnabled = false;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Hiba a felhasználók betöltése közben: {ex.Message}", 
                    "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        // 2. Felhasználó kiválasztása módosításhoz
        private void EditUserComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (EditUserComboBox.SelectedItem is UserDto user)
            {
                _selectedUserForEdit = user;
                EditUsernameTextBox.Text = user.Username;
                EditEmailTextBox.Text = user.Email;
                EditLevelTextBox.Text = user.Level.ToString();
                EditPermissionComboBox.SelectedItem = user.PermissionLevel;
                EditSubscriptionTypeComboBox.SelectedItem = user.Premium ? "PREMIUM" : "FREE";
                EditPremiumExpiresDatePicker.SelectedDate = user.PremiumExpiresAt?.Date;
                EditResetProfilePictureCheckBox.IsChecked = false;
                EditCountryTextBox.Text = user.CountryCode ?? "";
                EditBookPointsTextBox.Text = user.BookPoints.ToString();
                EditSeriesPointsTextBox.Text = user.SeriesPoints.ToString();
                EditFilmPointsTextBox.Text = user.MoviePoints.ToString();
                EditDayStreakTextBox.Text = user.DayStreak.ToString();
                EditReadingTimeTextBox.Text = user.ReadTimeMin.ToString();
                EditWatchingTimeTextBox.Text = user.WatchTimeMin.ToString();
            }
        }

        private void EditSubscriptionTypeComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            bool isPremium = string.Equals(EditSubscriptionTypeComboBox.SelectedItem as string, "PREMIUM", StringComparison.OrdinalIgnoreCase);
            EditPremiumExpiresDatePicker.IsEnabled = isPremium;

            if (!isPremium)
            {
                EditPremiumExpiresDatePicker.SelectedDate = null;
            }
        }

        private void UsersDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (UsersDataGrid.SelectedItem is UserDto user)
            {
                UpdateSelectedUserDetails(user);
                return;
            }

            ClearSelectedUserDetails();
        }

        private void UpdateSelectedUserDetails(UserDto user)
        {
            DetailsPlaceholderTextBlock.Text = "";
            DetailsIdTextBlock.Text = user.Id.ToString();
            DetailsUsernameTextBlock.Text = user.Username;
            DetailsEmailTextBlock.Text = user.Email;
            DetailsPermissionTextBlock.Text = user.PermissionLevel;
            DetailsSubscriptionTextBlock.Text = user.Premium
                ? $"PREMIUM (lejárat: {FormatDate(user.PremiumExpiresAt)})"
                : "FREE";
            DetailsLevelXpTextBlock.Text = $"{user.Level} / {user.Xp}";
            DetailsPointsTextBlock.Text = $"Könyv: {user.BookPoints}, Sorozat: {user.SeriesPoints}, Film: {user.MoviePoints}";
            DetailsStreakTextBlock.Text = $"{user.DayStreak} nap";
            DetailsActivityTextBlock.Text = $"Olvasás: {user.ReadTimeMin} perc, Nézés: {user.WatchTimeMin} perc";
            DetailsLastLoginTextBlock.Text = FormatDate(user.LastLoginDate);
        }

        private void ClearSelectedUserDetails()
        {
            DetailsPlaceholderTextBlock.Text = "Nincs kijelölt felhasználó.";
            DetailsIdTextBlock.Text = "-";
            DetailsUsernameTextBlock.Text = "-";
            DetailsEmailTextBlock.Text = "-";
            DetailsPermissionTextBlock.Text = "-";
            DetailsSubscriptionTextBlock.Text = "-";
            DetailsLevelXpTextBlock.Text = "-";
            DetailsPointsTextBlock.Text = "-";
            DetailsStreakTextBlock.Text = "-";
            DetailsActivityTextBlock.Text = "-";
            DetailsLastLoginTextBlock.Text = "-";
        }

        private static string FormatDate(DateTime? date)
        {
            return date.HasValue ? date.Value.ToString("yyyy.MM.dd HH:mm") : "n/a";
        }

        private static string FormatDate(DateTime date)
        {
            return date.ToString("yyyy.MM.dd HH:mm");
        }

        // 3. Felhasználó módosítása
        private async void UpdateUserButton_Click(object sender, RoutedEventArgs e)
        {
            if (EditUserComboBox.SelectedValue is not int userId)
            {
                MessageBox.Show("Válassz ki egy felhasználót!", "Figyelmeztetés", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (_selectedUserForEdit == null || _selectedUserForEdit.Id != userId)
            {
                MessageBox.Show("A felhasználó nem található!", "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            try
            {
                if (!int.TryParse(EditLevelTextBox.Text, out int level) || level < 1)
                {
                    MessageBox.Show("A szint legalabb 1 kell legyen.", "Figyelmeztetés", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                int ParseNonNegativeOrCurrent(TextBox textBox, int currentValue)
                {
                    if (!int.TryParse(textBox.Text, out int parsed) || parsed < 0)
                    {
                        return currentValue;
                    }

                    return parsed;
                }

                string countryCode = EditCountryTextBox.Text.Trim().ToUpperInvariant();
                countryCode = string.IsNullOrWhiteSpace(countryCode) ? string.Empty : countryCode;

                string permissionLevel = (EditPermissionComboBox.SelectedItem as string ?? _selectedUserForEdit.PermissionLevel).Trim().ToUpperInvariant();
                bool isPremiumPlan = string.Equals(EditSubscriptionTypeComboBox.SelectedItem as string, "PREMIUM", StringComparison.OrdinalIgnoreCase);
                DateTime? premiumExpiresAt = isPremiumPlan ? EditPremiumExpiresDatePicker.SelectedDate : null;

                if (isPremiumPlan && !premiumExpiresAt.HasValue)
                {
                    MessageBox.Show("Prémium csomag esetén add meg az előfizetés lejáratának dátumát.", "Figyelmeztetés", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                UpdateAdminUserRequestDto user = new()
                {
                    PermissionLevel = permissionLevel,
                    ResetProfilePicture = EditResetProfilePictureCheckBox.IsChecked ?? false,
                    Premium = isPremiumPlan,
                    PremiumExpiresAt = premiumExpiresAt,
                    Level = level,
                    Xp = _selectedUserForEdit.Xp,
                    CountryCode = countryCode,
                    DayStreak = ParseNonNegativeOrCurrent(EditDayStreakTextBox, _selectedUserForEdit.DayStreak),
                    ReadTimeMin = ParseNonNegativeOrCurrent(EditReadingTimeTextBox, _selectedUserForEdit.ReadTimeMin),
                    WatchTimeMin = ParseNonNegativeOrCurrent(EditWatchingTimeTextBox, _selectedUserForEdit.WatchTimeMin),
                    BookPoints = ParseNonNegativeOrCurrent(EditBookPointsTextBox, _selectedUserForEdit.BookPoints),
                    SeriesPoints = ParseNonNegativeOrCurrent(EditSeriesPointsTextBox, _selectedUserForEdit.SeriesPoints),
                    MoviePoints = ParseNonNegativeOrCurrent(EditFilmPointsTextBox, _selectedUserForEdit.MoviePoints)
                };

                bool result = await _apiService.UpdateUserAsync(userId, user);
                

                if (result)
                {
                    MessageBox.Show("Felhasználó sikeresen módosítva!", "Siker", 
                        MessageBoxButton.OK, MessageBoxImage.Information);
                    await LoadUsersAsync();
                    EditUserComboBox.SelectedValue = userId;
                    EditResetProfilePictureCheckBox.IsChecked = false;
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

        // 4. Felhasználó törlése
        private async void DeleteUserButton_Click(object sender, RoutedEventArgs e)
        {
            if (_selectedUserForDelete == null)
            {
                MessageBox.Show("Válassz ki egy felhasználót!", "Figyelmeztetés", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string typedConfirmation = DeleteConfirmTextBox.Text.Trim();
            if (!string.Equals(typedConfirmation, _selectedUserForDelete.Username, StringComparison.Ordinal))
            {
                DeleteValidationTextBlock.Text = "A megerősítő név nem egyezik a kiválasztott felhasználó nevével.";
                DeleteUserButton.IsEnabled = false;
                return;
            }

            UserDto userToDelete = _selectedUserForDelete;

            var result = MessageBox.Show(
                $"Biztosan törölni szeretnéd ezt a felhasználót?\n\n{userToDelete.Username} ({userToDelete.Email})", 
                "Megerősítés", 
                MessageBoxButton.YesNo, 
                MessageBoxImage.Warning);

            if (result == MessageBoxResult.Yes)
            {
                try
                {
                    bool success = await _apiService.DeleteUserAsync(userToDelete.Id);

                    if (success)
                    {
                        DeleteUserComboBox.SelectedIndex = -1;
                        DeleteConfirmTextBox.Clear();
                        DeleteValidationTextBlock.Text = string.Empty;
                        DeletePreviewTextBlock.Text = "Nincs kijelölt felhasználó.";
                        DeleteUserButton.IsEnabled = false;
                        await LoadUsersAsync();
                    }
                    else
                    {
                        MessageBox.Show("A felhasználó törlése nem sikerült.", "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
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
            _selectedUserForDelete = DeleteUserComboBox.SelectedItem as UserDto;
            DeleteConfirmTextBox.Clear();
            DeleteValidationTextBlock.Text = string.Empty;

            if (_selectedUserForDelete == null)
            {
                DeletePreviewTextBlock.Text = "Nincs kijelölt felhasználó.";
                DeleteUserButton.IsEnabled = false;
                return;
            }

            DeletePreviewTextBlock.Text =
                $"ID: {_selectedUserForDelete.Id}\n" +
                $"Felhasználónév: {_selectedUserForDelete.Username}\n" +
                $"Email: {_selectedUserForDelete.Email}\n" +
                $"Szerepkör: {_selectedUserForDelete.PermissionLevel}\n" +
                $"Előfizetés: {(_selectedUserForDelete.Premium ? "PREMIUM" : "FREE")}";

            DeleteUserButton.IsEnabled = false;
            DeleteValidationTextBlock.Text = "A törlés aktiválásához írd be a felhasználónevet.";
        }

        private void DeleteConfirmTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (_selectedUserForDelete == null)
            {
                DeleteValidationTextBlock.Text = "Először válassz ki egy felhasználót.";
                DeleteUserButton.IsEnabled = false;
                return;
            }

            string typedConfirmation = DeleteConfirmTextBox.Text.Trim();
            bool matches = string.Equals(typedConfirmation, _selectedUserForDelete.Username, StringComparison.Ordinal);

            DeleteUserButton.IsEnabled = matches;
            DeleteValidationTextBlock.Text = matches
                ? "Megerősítés érvényes. A törlés gomb aktív."
                : "A megadott névnek pontosan egyeznie kell a felhasználónévvel.";
        }

    }
}
