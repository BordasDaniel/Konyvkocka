using System.Windows;
using System.Windows.Input;
using KonyvkockaKliensWPF.Services;

namespace KonyvkockaKliensWPF
{
    public partial class LoginWindow : Window
    {
        private readonly ApiService _apiService;
        private int attemptsLeft = 3;

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
            string email = UsernameTextBox.Text.Trim();
            string password = PasswordBox.Password;

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                ErrorMessageTextBlock.Text = "Email és jelszó megadása kötelező!";
                return;
            }

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
                MessageBox.Show($"Hiba: {ex.Message}\n\nEllenőrizd, hogy az API fut-e (https://localhost:7058)!", 
                    "Kapcsolódási hiba", MessageBoxButton.OK, MessageBoxImage.Error);
            }
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

