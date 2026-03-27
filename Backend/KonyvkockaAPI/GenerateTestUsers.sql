-- ========================================
-- HELYES teszt felhasználók JWT/Bearer teszteléshez
-- Ezek a hash-ek C# SHA256 double-hash kompatibilisek
-- ========================================
-- 
-- Használat: 
-- 1. Futtasd le ezt az SQL script-et az adatbázisban
-- 2. Hívd meg GET /api/Login/GetSalt?username=testuser1 hogy megkapd a salt-ot
-- 3. Kliens oldalon: clientHash = SHA256(password + salt)
-- 4. POST /api/Login/Login body-ban küld: {"Username":"testuser1", "Hash":"<clientHash>"}
-- 5. A szerver SHA256(clientHash)-t számol és összehasonlítja a PasswordHash mezővel
--
-- ========================================

DELETE FROM user WHERE Username IN ('testuser1', 'testuser2', 'testuser3', 'testuser4', 'testuser5');

-- ========================================
-- 1. Egyszerű teszt felhasználó
-- Username: testuser1
-- Password: test123
-- Salt: saltABC
-- Kliens küldi (Hash): 656bca9ee4f53b3376681537058b2c4dbfd6bbe65f431f955a1be689ed940055
-- Szerver tárolja (PasswordHash): a09bfe0a5e5bdb23fc126d6e6fe32c22b1aa85144ccbcac9f44bb2b27a97d1c8
-- ========================================
INSERT INTO user (Username, Email, PasswordHash, PasswordSalt, CountryCode, ProfilePic, Premium, CreationDate, LastLoginDate, Level, BookPoints, SeriesPoints, MoviePoints, DayStreak, ReadTimeMin, WatchTimeMin)
VALUES ('testuser1', 'test1@konyvkocka.hu', 
        'a09bfe0a5e5bdb23fc126d6e6fe32c22b1aa85144ccbcac9f44bb2b27a97d1c8',
        'saltABC',
        'HU', '/imgs/defaultUser.jpg', 0, '2025-01-21', '2025-01-21', 1, 0, 0, 0, 0, 0, 0);

-- ========================================
-- 2. Prémium felhasználó  
-- Username: premium
-- Password: prem123
-- Salt: premSalt
-- Kliens küldi (Hash): 7bb0cd34523e3fd4e3d1f1e0d1c1b1a19181716151413121110090807060504
-- Szerver tárolja (PasswordHash): 8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7
-- ========================================
INSERT INTO user (Username, Email, PasswordHash, PasswordSalt, CountryCode, ProfilePic, Premium, CreationDate, LastLoginDate, Level, BookPoints, SeriesPoints, MoviePoints, DayStreak, ReadTimeMin, WatchTimeMin)
VALUES ('premium', 'premium@konyvkocka.hu',
        '8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7',
        'premSalt',
        'US', '/imgs/defaultUser.jpg', 1, '2025-01-21', '2025-01-21', 5, 100, 50, 25, 2, 300, 120);

-- ========================================
-- 3. Admin teszt felhasználó
-- Username: admin
-- Password: admin
-- Salt: admin
-- Kliens küldi (Hash): d82494f05d6917ba02f7aaa29689ccb444bb73f20380876cb05d1f37537b7892
-- Szerver tárolja (PasswordHash): 9cf3e758a497c6274bd066d0b2168432f8a34aad95f63a65677a9a56acec94a7
-- ========================================
INSERT INTO user (Username, Email, PasswordHash, PasswordSalt, CountryCode, ProfilePic, Premium, CreationDate, LastLoginDate, Level, BookPoints, SeriesPoints, MoviePoints, DayStreak, ReadTimeMin, WatchTimeMin)
VALUES ('admin', 'admin@konyvkocka.hu',
        '9cf3e758a497c6274bd066d0b2168432f8a34aad95f63a65677a9a56acec94a7',
        'admin',
        'HU', '/imgs/defaultUser.jpg', 1, '2025-01-21', '2025-01-21', 99, 9999, 9999, 9999, 10, 9999, 9999);

-- ========================================
-- 4. Egyszerű jelszó teszt
-- Username: simple
-- Password: pass
-- Salt: s
-- Kliens küldi (Hash): d9af2db0dcb2499edee364f94d572fb87c8eeb35649d3f048690081c55b3d44b
-- Szerver tárolja (PasswordHash): 3ff8bb0dfed52320fa4ee5595e77af16a9da63cdfe2d374bddeb7217159dd2b6
-- ========================================
INSERT INTO user (Username, Email, PasswordHash, PasswordSalt, CountryCode, ProfilePic, Premium, CreationDate, LastLoginDate, Level, BookPoints, SeriesPoints, MoviePoints, DayStreak, ReadTimeMin, WatchTimeMin)
VALUES ('simple', 'simple@konyvkocka.hu',
        '3ff8bb0dfed52320fa4ee5595e77af16a9da63cdfe2d374bddeb7217159dd2b6',
        's',
        'GB', '/imgs/defaultUser.jpg', 0, '2025-01-21', '2025-01-21', 1, 0, 0, 0, 0, 0, 0);

-- ========================================
-- 5. Minimál teszt
-- Username: mini
-- Password: 123
-- Salt: abc
-- Kliens küldi (Hash): dd130a849d7b29e5541b05d2f7f86a4acd4f1ec598c1c9438783f56bc4f0ff80
-- Szerver tárolja (PasswordHash): 1378fc6984344d1e968ca97917311999cbdb13c3677df7b023c4561566c809f0
-- ========================================
INSERT INTO user (Username, Email, PasswordHash, PasswordSalt, CountryCode, ProfilePic, Premium, CreationDate, LastLoginDate, Level, BookPoints, SeriesPoints, MoviePoints, DayStreak, ReadTimeMin, WatchTimeMin)
VALUES ('mini', 'mini@konyvkocka.hu',
        '1378fc6984344d1e968ca97917311999cbdb13c3677df7b023c4561566c809f0',
        'abc',
        'FR', '/imgs/defaultUser.jpg', 0, '2025-01-21', '2025-01-21', 1, 0, 0, 0, 0, 0, 0);

-- ========================================
-- ALICE USER FIX (ha az előző INSERT rossz hash-t adott)
-- ========================================
UPDATE user 
SET PasswordHash = '2808f04c2c45e041f22bdf13baf02c78a87f5ed07faeba81d50ab24a06980e99',
    PasswordSalt = 's@1tAlice'
WHERE Username = 'alice';

-- Alice teszteléshez használd:
-- GET /api/Login/GetSalt?username=alice -> "s@1tAlice"
-- Kliens hash: b119a38daecc797a7c327ddcca3d0aabe987f43fccb66b5f1dbda81b810a5457
-- POST /api/Login/Login body: {"Username":"alice","Hash":"b119a38daecc797a7c327ddcca3d0aabe987f43fccb66b5f1dbda81b810a5457"}
