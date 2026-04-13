using System.Windows;
using System.Windows.Input;
using KonyvkockaKliensWPF.Services;
using System.Text.RegularExpressions;

namespace KonyvkockaKliensWPF
{
    public partial class LoginWindow : Window
    {
        private readonly ApiService _apiService;
        private int attemptsLeft = 3;
        private bool _isLoggingIn;

        public LoginWindow()
        {
            InitializeComponent();
            _apiService = ApiService.Instance;
            UsernameTextBox.Focus();
        }

        private void LoginButton_Click(object sender, RoutedEventArgs e)
        {
            AttemptLogin();
        }

        private void TextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                PasswordBox.Focus();
            }
        }

        private void PasswordBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                AttemptLogin();
            }
        }

        private async void AttemptLogin()
        {
            if (_isLoggingIn)
            {
                return;
            }

            string email = UsernameTextBox.Text.Trim();
            string password = ShowPasswordCheckBox.IsChecked == true
                ? VisiblePasswordTextBox.Text
                : PasswordBox.Password;

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                ErrorMessageTextBlock.Text = "Email és jelszó megadása kötelező!";
                return;
            }

            if (!Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                ErrorMessageTextBlock.Text = "Adj meg egy érvényes email címet!";
                return;
            }

            SetLoginState(true, "Bejelentkezés folyamatban...");
            ErrorMessageTextBlock.Text = string.Empty;

            try
            {
                bool success = await _apiService.LoginAsync(email, password);

                if (success)
                {
                    MainWindow mainWindow = new();
                    mainWindow.Show();
                    this.Close();
                }
                else
                {
                    attemptsLeft--;

                    if (attemptsLeft > 0)
                    {
                        ErrorMessageTextBlock.Text = "Hibás email vagy jelszó!";
                        AttemptsTextBlock.Text = $"Hátralévő próbálkozások: {attemptsLeft}";
                        PasswordBox.Clear();
                        VisiblePasswordTextBox.Clear();
                        LoginStatusTextBlock.Text = "Sikertelen bejelentkezés";
                        UsernameTextBox.Focus();
                    }
                    else
                    {
                        MessageBox.Show(
                            "Túl sok sikertelen bejelentkezési próbálkozás!\nAz alkalmazás bezáródik.",
                            "Bejelentkezés sikertelen",
                            MessageBoxButton.OK,
                            MessageBoxImage.Error);
                        Application.Current.Shutdown();
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessageTextBlock.Text = "Hiba a bejelentkezés során!";
                LoginStatusTextBlock.Text = "A bejelentkezés megszakadt.";
                MessageBox.Show($"Hiba: {ex.Message}\n\nEllenőrizd, hogy az API fut-e (https://localhost:7058)!", 
                    "Kapcsolódási hiba", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                SetLoginState(false);
            }
        }

        private void ShowPasswordCheckBox_Changed(object sender, RoutedEventArgs e)
        {
            bool showPassword = ShowPasswordCheckBox.IsChecked == true;

            if (showPassword)
            {
                VisiblePasswordTextBox.Text = PasswordBox.Password;
                PasswordBox.Visibility = Visibility.Collapsed;
                VisiblePasswordTextBox.Visibility = Visibility.Visible;
                VisiblePasswordTextBox.Focus();
                VisiblePasswordTextBox.CaretIndex = VisiblePasswordTextBox.Text.Length;
            }
            else
            {
                PasswordBox.Password = VisiblePasswordTextBox.Text;
                VisiblePasswordTextBox.Visibility = Visibility.Collapsed;
                PasswordBox.Visibility = Visibility.Visible;
                PasswordBox.Focus();
            }
        }

        private void SetLoginState(bool isLoggingIn, string statusMessage = "")
        {
            _isLoggingIn = isLoggingIn;

            LoginButton.IsEnabled = !isLoggingIn;
            UsernameTextBox.IsEnabled = !isLoggingIn;
            PasswordBox.IsEnabled = !isLoggingIn;
            VisiblePasswordTextBox.IsEnabled = !isLoggingIn;
            ShowPasswordCheckBox.IsEnabled = !isLoggingIn;

            LoginStatusTextBlock.Text = statusMessage;
        }

        protected override void OnClosing(System.ComponentModel.CancelEventArgs e)
        {
            base.OnClosing(e);

            if (Application.Current.MainWindow == null || !Application.Current.MainWindow.IsVisible)
            {
                MessageBox.Show(
                    "Sikertelen bejelentkezés!\nAz alkalmazás bezáródik.",
                    "Bejelentkezés megszakítva",
                    MessageBoxButton.OK,
                    MessageBoxImage.Warning);
                Application.Current.Shutdown();
            }
        }
    }
}

