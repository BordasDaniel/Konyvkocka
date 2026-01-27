# JWT / Bearer Token Tesztelési Útmutató

## 1. Teszt felhasználók létrehozása

Futtasd le a `GenerateTestUsers.sql` fájlt az adatbázisban (phpMyAdmin / MySQL Workbench / CLI).

Ez 5 teszt felhasználót hoz létre + javítja az `alice` felhasználó hash-ét.

## 2. Teszt felhasználók

| Username | Password | Salt | Premium | Level |
|----------|----------|------|---------|-------|
| **alice** | Password123 | s@1tAlice | ❌ | 1 |
| **testuser1** | test123 | saltABC | ❌ | 1 |
| **premium** | prem123 | premSalt | ✅ | 5 |
| **admin** | admin | admin | ✅ | 99 |
| **simple** | pass | s | ❌ | 1 |
| **mini** | 123 | abc | ❌ | 1 |

## 3. API Hívás lépések

### 3.1. Salt lekérdezése
```http
GET http://localhost:5269/api/Login/GetSalt?username=testuser1
```

**Válasz:**
```
saltABC
```

### 3.2. Kliens oldali hash számítása (PowerShell példa)

```powershell
$password = "test123"
$salt = "saltABC"
$combined = $password + $salt
$bytes = [System.Text.Encoding]::UTF8.GetBytes($combined)
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hash = $sha256.ComputeHash($bytes)
$clientHash = -join ($hash | ForEach-Object { $_.ToString("x2") })
Write-Host "Kliens Hash: $clientHash"
```

**Eredmény:**
```
Kliens Hash: 656bca9ee4f53b3376681537058b2c4dbfd6bbe65f431f955a1be689ed940055
```

### 3.3. Login (POST)

```http
POST http://localhost:5269/api/Login/Login
Content-Type: application/json

{
  "Username": "testuser1",
  "Hash": "656bca9ee4f53b3376681537058b2c4dbfd6bbe65f431f955a1be689ed940055"
}
```

**Válasz (JWT Token):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlcjEiLCJ1c2VySWQiOiIxIiwicHJlbWl1bSI6IkZhbHNlIiwianRpIjoiYWJjZC0xMjM0LWVmZ2gtNTY3OCIsImV4cCI6MTczNzQ4OTYwMCwiaXNzIjoiS29ueXZrb2NrYUFQSSIsImF1ZCI6Iktvbnl2a29ja2FDbGllbnQifQ.SIGNATURE
```

### 3.4. Védett végpontok használata

A visszakapott JWT tokent használd az `Authorization` headerben:

```http
GET http://localhost:5269/api/Protected/SomeEndpoint
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Swagger tesztelés

1. Navigálj a Swagger UI-ra: `http://localhost:5269/swagger`
2. Hívd meg a `GET /api/Login/GetSalt` végpontot
3. Számold ki a kliens hash-t (lásd fent PowerShell példa)
4. Hívd meg a `POST /api/Login/Login` végpontot a helyes JSON-nel
5. Másold ki a visszakapott JWT tokent
6. Kattints a Swagger jobb felső sarkában az **🔒 Authorize** gombra
7. Add meg: `Bearer <token>` (pl. `Bearer eyJhbGci...`)
8. Most már bármely `[Authorize]` védett végpontot meghívhatod

## 5. Gyors teszt példák (másolható JSON-ök)

### alice
```json
{
  "Username": "alice",
  "Hash": "b119a38daecc797a7c327ddcca3d0aabe987f43fccb66b5f1dbda81b810a5457"
}
```

### testuser1
```json
{
  "Username": "testuser1",
  "Hash": "656bca9ee4f53b3376681537058b2c4dbfd6bbe65f431f955a1be689ed940055"
}
```

### admin
```json
{
  "Username": "admin",
  "Hash": "d82494f05d6917ba02f7aaa29689ccb444bb73f20380876cb05d1f37537b7892"
}
```

### simple
```json
{
  "Username": "simple",
  "Hash": "d9af2db0dcb2499edee364f94d572fb87c8eeb35649d3f048690081c55b3d44b"
}
```

### mini
```json
{
  "Username": "mini",
  "Hash": "dd130a849d7b29e5541b05d2f7f86a4acd4f1ec598c1c9438783f56bc4f0ff80"
}
```

## 6. PowerShell Hash Generator függvény

Másold be ezt a PowerShell parancssorba, és könnyen generálhatsz hash-t bármilyen password + salt párosra:

```powershell
function Get-ClientHash {
    param([string]$password, [string]$salt)
    $combined = $password + $salt
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($combined)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hash = $sha256.ComputeHash($bytes)
    $clientHash = -join ($hash | ForEach-Object { $_.ToString("x2") })
    return $clientHash
}

# Használat:
Get-ClientHash "test123" "saltABC"
```

## 7. Hibaelhárítás

### "Nincs megfelelő felhasználó!"
- ✅ Ellenőrizd, hogy a Username pontosan egyezik
- ✅ Ellenőrizd, hogy a Hash pontosan 64 karakter hosszú (SHA-256 hex)
- ✅ Ellenőrizd, hogy a helyes salt-tal számoltad ki a hash-t
- ✅ Futtattad le a `GenerateTestUsers.sql`-t az adatbázisban?

### 404 Not Found
- ✅ Helyes URL: `http://localhost:5269/api/Login/Login` (POST)
- ✅ Helyes Content-Type: `application/json`
- ✅ Az API fut? Nézd meg: `http://localhost:5269/swagger`

### 401 Unauthorized (védett végpontoknál)
- ✅ Helyes Authorization header formátum: `Bearer <token>`
- ✅ A token nem járt le? (alapból 60 perc a `JwtSettings.ExpirityMinutes`)

## 8. C# Tesztelési példa (xUnit / MSTest)

```csharp
[Fact]
public async Task Login_WithValidCredentials_ReturnsJwtToken()
{
    // Arrange
    var client = _factory.CreateClient();
    var loginDto = new LoginDTO
    {
        Username = "testuser1",
        Hash = "656bca9ee4f53b3376681537058b2c4dbfd6bbe65f431f955a1be689ed940055"
    };

    // Act
    var response = await client.PostAsJsonAsync("/api/Login/Login", loginDto);

    // Assert
    response.EnsureSuccessStatusCode();
    var token = await response.Content.ReadAsStringAsync();
    Assert.False(string.IsNullOrEmpty(token));
    Assert.StartsWith("eyJ", token); // JWT típusú token
}
```

## 9. JavaScript / TypeScript példa (frontend)

```typescript
async function loginUser(username: string, password: string): Promise<string> {
    // 1. Salt lekérdezése
    const saltResponse = await fetch(`http://localhost:5269/api/Login/GetSalt?username=${username}`);
    const salt = await saltResponse.text();

    // 2. Kliens hash számítása (SHA-256)
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const clientHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 3. Login
    const loginResponse = await fetch('http://localhost:5269/api/Login/Login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Username: username,
            Hash: clientHash
        })
    });

    const token = await loginResponse.text();
    return token;
}

// Használat:
const token = await loginUser('testuser1', 'test123');
console.log('JWT Token:', token);

// Védett végpont hívás:
const response = await fetch('http://localhost:5269/api/Protected/Data', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

---

**Készítette:** Dudás Ádám / GitHub Copilot  
**Dátum:** 2025-01-21
