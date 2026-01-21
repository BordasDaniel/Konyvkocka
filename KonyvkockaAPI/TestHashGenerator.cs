//using System;
//using System.Security.Cryptography;
//using System.Text;

//// Használat: dotnet run TestHashGenerator.cs <password> <salt>
//// Példa: dotnet run TestHashGenerator.cs "Password123" "s@1tAlice"

//class TestHashGenerator
//{
//    static void Main(string[] args)
//    {
//        if (args.Length < 2)
//        {
//            Console.WriteLine("Használat: dotnet run <password> <salt>");
//            Console.WriteLine("Példa: dotnet run Password123 testSalt");
//            return;
//        }

//        string password = args[0];
//        string salt = args[1];

//        // 1. lépés: kliens oldali hash (password + salt)
//        string clientHash = CreateSHA256(password + salt);
//        Console.WriteLine($"Password: {password}");
//        Console.WriteLine($"Salt: {salt}");
//        Console.WriteLine($"Kliens küld (Hash): {clientHash}");

//        // 2. lépés: szerver oldali double-hash (amit az adatbázisban tárolunk)
//        string serverHash = CreateSHA256(clientHash);
//        Console.WriteLine($"Szerver tárolja (PasswordHash): {serverHash}");
//        Console.WriteLine();
//        Console.WriteLine($"SQL INSERT példa:");
//        Console.WriteLine($"INSERT INTO user (Username, Email, PasswordHash, PasswordSalt, CountryCode, ProfilePic, Premium, CreationDate, LastLoginDate, Level, BookPoints, SeriesPoints, MoviePoints, DayStreak, ReadTimeMin, WatchTimeMin)");
//        Console.WriteLine($"VALUES ('testuser', 'test@example.com', '{serverHash}', '{salt}', 'HU', '/imgs/defaultUser.jpg', 0, NOW(), NOW(), 1, 0, 0, 0, 0, 0, 0);");
//    }

//    static string CreateSHA256(string input)
//    {
//        using (SHA256 sha256 = SHA256.Create())
//        {
//            byte[] data = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
//            StringBuilder sbuilder = new StringBuilder();

//            for (int i = 0; i < data.Length; i++)
//            {
//                sbuilder.Append(data[i].ToString("x2"));
//            }

//            return sbuilder.ToString();
//        }
//    }
//}
