using System.Windows;
using System.Windows.Input;

namespace KonyvkockaKliensWPF
{
    public partial class LoginWindow : Window
    {
        private const string ValidUsername = "admin";
        private const string ValidPassword = "admin123";
        private int attemptsLeft = 3;

        public LoginWindow()
        {
            InitializeComponent();
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

        private void AttemptLogin()
        {
            string username = UsernameTextBox.Text;
            string password = PasswordBox.Password;

            if (username == ValidUsername && password == ValidPassword)
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
                    ErrorMessageTextBlock.Text = "Hibás felhasználónév vagy jelszó!";
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
