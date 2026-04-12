-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Ápr 12. 21:21
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `konyvkocka`
--
CREATE DATABASE IF NOT EXISTS `konyvkocka` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `konyvkocka`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `age_rating`
--

CREATE TABLE `age_rating` (
  `Id` int(11) NOT NULL,
  `Name` varchar(32) NOT NULL,
  `MinAge` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `age_rating`
--

INSERT INTO `age_rating` (`Id`, `Name`, `MinAge`) VALUES
(1, 'Minden', 0),
(2, 'Gyerek', 0),
(3, '12+', 12),
(4, '16+', 16),
(5, '18+', 18);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `article`
--

CREATE TABLE `article` (
  `Id` int(11) NOT NULL,
  `Title` varchar(256) NOT NULL,
  `Content` text NOT NULL,
  `EventTag` enum('UPDATE','ANNOUNCEMENT','EVENT','FUNCTION') NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `article`
--

INSERT INTO `article` (`Id`, `Title`, `Content`, `EventTag`, `CreatedAt`, `updated_at`) VALUES
(1, 'Üdvözlünk a KönyvKockán!', 'Örömmel üdvözlünk platformunkon! Fedezd fel a könyvek, filmek és sorozatok világát.', 'ANNOUNCEMENT', '2026-01-01 10:00:00', '2026-02-05 10:40:53'),
(2, 'Új funkció: Hangoskönyvek', 'Mostantól hangoskönyveket is hallgathatsz a platformon!', 'FUNCTION', '2026-01-15 14:30:00', '2026-04-04 21:17:53'),
(3, 'Rendszerkarbantartás', 'Január 20-án 02:00-04:00 között karbantartást végzünk.', 'ANNOUNCEMENT', '2026-01-18 09:00:00', '2026-02-05 10:41:13'),
(4, 'Heti toplista frissítve', 'Nézd meg a hét legnépszerűbb tartalmait!', 'UPDATE', '2026-01-28 12:00:00', '2026-02-05 10:41:30'),
(5, 'Új magyar tartalmak érkeztek', 'Bővült a magyar nyelvű könyvek és filmek kínálata!', 'UPDATE', '2026-01-29 16:00:00', '2026-02-05 10:41:37'),
(6, 'KönyvKocka 1.0 Launch Esemény - Csatlakozz hozzánk!\r\n', 'Ünnepeld velünk a KönyvKocka 1.0 megjelenését egy különleges online eseményen! Bemutatjuk az új funkciókat, és exkluzív kedvezményeket kínálunk.\r\n\r\n', 'EVENT', '2026-02-05 10:20:30', '2026-02-05 10:41:44');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `badge`
--

CREATE TABLE `badge` (
  `Id` int(11) NOT NULL,
  `Name` varchar(128) NOT NULL,
  `Description` text NOT NULL,
  `IconURL` varchar(512) DEFAULT NULL,
  `Category` enum('EVENT','STREAK','READING','WATCHING','SOCIAL','SPECIAL') NOT NULL,
  `Rarity` enum('COMMON','RARE','EPIC','LEGENDARY') NOT NULL DEFAULT 'COMMON',
  `IsHidden` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `badge`
--

INSERT INTO `badge` (`Id`, `Name`, `Description`, `IconURL`, `Category`, `Rarity`, `IsHidden`, `created_at`) VALUES
(1, 'Tavaszi kihívó', 'Részt vettél a tavaszi eseményen', 'https://assets.ppy.sh/medals/web/all-secret-hourbeforethedawn@2x.png', 'EVENT', 'RARE', 0, '2026-02-05 11:08:03'),
(2, 'Nyári maraton', 'Teljesítetted a nyári maratont', 'https://assets.ppy.sh/medals/web/all-secret-lightsout@2x.png', 'EVENT', 'RARE', 0, '2026-02-05 11:08:03'),
(3, 'Őszi fesztivál', 'Részt vettél az őszi fesztiválon', 'https://assets.ppy.sh/medals/web/all-secret-deciduousarborist@2x.png', 'EVENT', 'RARE', 0, '2026-02-05 11:08:03'),
(4, 'Vissza a kezdetekhez', 'Elveszítetted a sorozatodat és újrakezdted', 'https://assets.ppy.sh/medals/web/osu-secret-causality@2x.png', 'STREAK', 'COMMON', 0, '2026-02-05 11:08:03'),
(5, '7 nap', 'Elértél 7 napos sorozatot', 'https://assets.ppy.sh/medals/web/all-secret-consolation_prize@2x.png', 'STREAK', 'COMMON', 0, '2026-02-05 11:08:03'),
(6, '30 nap', 'Elértél 30 napos sorozatot', 'https://assets.ppy.sh/medals/web/all-secret-improved@2x.png', 'STREAK', 'RARE', 0, '2026-02-05 11:08:03'),
(7, '100 nap', 'Elértél 100 napos sorozatot', 'https://assets.ppy.sh/medals/web/all-secret-dancer@2x.png', 'STREAK', 'EPIC', 0, '2026-02-05 11:08:03'),
(8, 'Könyvmoly medál', 'Elolvastál 50 könyvet', 'https://assets.ppy.sh/medals/web/all-secret-true-north.png', 'READING', 'EPIC', 0, '2026-02-05 11:08:03'),
(9, 'Első könyv', 'Elolvastad az első könyvedet', 'https://assets.ppy.sh/medals/web/all-secret-unseen-heights.png', 'READING', 'COMMON', 0, '2026-02-05 11:08:03'),
(10, 'Film rajongó', 'Megnéztél 100 filmet', 'https://assets.ppy.sh/medals/web/all-secret-obsessed.png', 'WATCHING', 'EPIC', 0, '2026-02-05 11:08:03'),
(11, 'Sorozat függő', 'Befejezted az első sorozatodat', 'https://assets.ppy.sh/medals/web/all-secret-elite.png', 'WATCHING', 'COMMON', 0, '2026-02-05 11:08:03');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `book`
--

CREATE TABLE `book` (
  `Id` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Released` year(4) NOT NULL,
  `PageNum` int(4) NOT NULL,
  `Rating` decimal(3,1) NOT NULL DEFAULT 0.0,
  `Description` text NOT NULL,
  `CoverApiName` varchar(255) NOT NULL,
  `AgeRatingId` int(11) DEFAULT NULL,
  `Type` enum('BOOK','AUDIOBOOK','EBOOK') NOT NULL DEFAULT 'BOOK',
  `PdfURL` varchar(512) DEFAULT NULL,
  `AudioURL` varchar(512) DEFAULT NULL,
  `EpubURL` varchar(512) DEFAULT NULL,
  `AudioLength` int(11) DEFAULT NULL,
  `RewardXP` int(11) NOT NULL DEFAULT 100,
  `RewardPoints` int(11) NOT NULL DEFAULT 50,
  `NarratorName` varchar(128) DEFAULT NULL,
  `IsOfflineAvailable` tinyint(1) NOT NULL DEFAULT 0,
  `OriginalLanguage` varchar(64) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `book`
--

INSERT INTO `book` (`Id`, `Title`, `Released`, `PageNum`, `Rating`, `Description`, `CoverApiName`, `AgeRatingId`, `Type`, `PdfURL`, `AudioURL`, `EpubURL`, `AudioLength`, `RewardXP`, `RewardPoints`, `NarratorName`, `IsOfflineAvailable`, `OriginalLanguage`, `updated_at`) VALUES
(1, 'Egri csillagok', '1901', 584, 9.2, 'Gárdonyi Géza monumentális történelmi regénye az egri vár 1552-es ostromáról.', 'egri_csillagok.jpg', 3, 'BOOK', 'https://www.literart.org.ro/files/Egri-csillagok.pdf', NULL, 'egri_csillagok.epub', NULL, 200, 100, NULL, 1, 'Magyar', '2026-04-09 15:08:57'),
(2, 'A Pál utcai fiúk', '1906', 232, 8.9, 'Molnár Ferenc ifjúsági regénye a Grund-ról és a pesti utcai csatározásokról.', 'pal_utcai_fiuk.jpg', 2, 'BOOK', 'https://www.literart.org.ro/files/pal_utcai_fiuk.pdf', 'https://www.youtube.com/watch?v=rB66Fx4G1Hw', NULL, 325, 120, 60, 'Sandberg USB Microphone Kit', 0, 'Magyar', '2026-04-12 12:56:12'),
(3, 'Abigél', '1970', 166, 9.5, 'Szabó Magda regénye egy lányról, aki egy bentlakásos iskolába kerül a háború idején.', 'https://covers.openlibrary.org/b/id/14756391-L.jpg', 3, 'EBOOK', 'http://inlap.jate.u-szeged.hu/bemutat/konyvtar/konyvek/szabo_magda_abigel.pdf', NULL, 'http://inlap.jate.u-szeged.hu/bemutat/konyvtar/konyvek/szabo_magda_abigel.pdf', NULL, 150, 75, NULL, 1, 'Magyar', '2026-04-06 17:17:18'),
(4, 'Psycho Cute', '2020', 312, 8.1, 'Karalyos Gábor krimisorozatának első része, amely bűnügyi nyomozó és popkulturális elemeket vegyít.', 'psycho_cute.jpg', 5, 'BOOK', NULL, NULL, NULL, NULL, 130, 65, NULL, 0, 'Magyar', '2026-02-05 20:46:10'),
(5, 'A rém', '2012', 424, 8.7, 'Krasznahorkai László különleges hangvételű regénye apokaliptikus hangulattal.', 'a_rem.jpg', 4, 'BOOK', NULL, NULL, NULL, NULL, 180, 90, NULL, 0, 'Magyar', '2026-02-05 20:46:10'),
(6, '1984', '1949', 328, 9.4, 'George Orwell disztópiája a totalitárius rendszerről és a gondolatrendőrségről.', '1984.jpg', 4, 'BOOK', 'https://elso.xyz/konyvek/orwell-1984.pdf', NULL, '1984.epub', NULL, 140, 70, NULL, 1, 'Angol', '2026-04-09 15:12:21'),
(7, 'Harry Potter és a bölcsek köve', '1997', 336, 9.6, 'J.K. Rowling varázslatos világa, ahol egy fiatal varázsló felfedezi származását.', 'harry_potter_1.jpg', 2, 'BOOK', NULL, NULL, NULL, NULL, 150, 75, NULL, 0, 'Angol', '2026-02-05 20:46:10'),
(8, 'A Gyűrűk Ura: A gyűrű szövetsége', '1954', 423, 9.8, 'J.R.R. Tolkien fantasy eposzának első része Középfölde megmentéséről.', 'lotr_1.jpg', 3, 'BOOK', NULL, NULL, 'lotr_1.epub', NULL, 250, 125, NULL, 1, 'Angol', '2026-02-05 20:46:10'),
(9, 'Sapiens', '2011', 443, 9.1, 'Yuval Noah Harari könyve az emberiség történetéről és fejlődéséről.', 'sapiens.jpg', 3, 'AUDIOBOOK', NULL, 'sapiens.mp3', NULL, 900, 180, 90, 'Kiss János', 1, 'Héber', '2026-02-05 20:46:10'),
(10, 'A kis herceg', '1943', 96, 9.3, 'Antoine de Saint-Exupéry mesés története egy idegen bolygóról érkező hercegről.', 'kis_herceg.jpg', 1, 'EBOOK', 'https://almabooks.com/wp-content/uploads/2016/10/Little-Prince-final-text.pdf', '', 'https://almabooks.com/wp-content/uploads/2016/10/Little-Prince-final-text.pdf', 120, 100, 50, 'Nagy Péter', 1, 'Francia', '2026-03-26 21:27:39'),
(11, 'Steve Jobs', '2011', 656, 8.8, 'Walter Isaacson életrajza az Apple alapítójáról.', 'steve_jobs.jpg', 3, 'EBOOK', NULL, NULL, 'steve_jobs.epub', NULL, 200, 100, NULL, 1, 'Angol', '2026-02-05 20:46:10'),
(12, 'Tűzből vár', '2014', 288, 8.4, 'Nádas Péter regénye családi történetekről és társadalmi változásokról.', 'tuzbol_var.jpg', 4, 'EBOOK', NULL, NULL, 'tuzbol_var.epub', NULL, 130, 65, NULL, 0, 'Magyar', '2026-02-05 20:46:10'),
(13, 'Dűne', '1965', 688, 9.5, 'Frank Herbert sci-fi remekműve egy sivatagi bolygóról és az ottani hatalmi harcokról.', 'dune.jpg', 4, 'BOOK', NULL, NULL, 'dune.epub', NULL, 300, 150, NULL, 1, 'Angol', '2026-02-05 20:46:10'),
(14, 'Neuromancer', '1984', 271, 8.9, 'William Gibson cyberpunk klasszikusa a kibertérről.', 'neuromancer.jpg', 5, 'BOOK', NULL, NULL, NULL, NULL, 140, 70, NULL, 0, 'Angol', '2026-02-05 20:46:10'),
(15, 'A lány a vonaton', '2015', 325, 8.2, 'Paula Hawkins thrillere egy nőről, aki tanúja lesz egy rejtélyes eseménynek.', 'lany_vonaton.jpg', 4, 'BOOK', NULL, NULL, 'lany_vonaton.epub', NULL, 140, 70, NULL, 1, 'Angol', '2026-02-05 20:46:10'),
(16, 'Millennium 1 - Férfiak, akik gyűlölik a nőket', '2005', 533, 9.0, 'Stieg Larsson krimisorozatának első része.', 'millennium_1.jpg', 5, 'BOOK', NULL, NULL, NULL, NULL, 220, 110, NULL, 0, 'Svéd', '2026-02-05 20:46:10'),
(17, 'Büszkeség és balítélet', '0000', 432, 9.2, 'Jane Austen klasszikus romantikus regénye.', 'buszkeseg_es_balitelet.jpg', 2, 'BOOK', NULL, NULL, 'pride_prejudice.epub', NULL, 160, 80, NULL, 1, 'Angol', '2026-02-05 20:46:10'),
(18, 'Egy nap', '2009', 435, 8.5, 'David Nicholls romantikus története két ember 20 éves kapcsolatáról.', 'egy_nap.jpg', 3, 'BOOK', NULL, NULL, NULL, NULL, 150, 75, NULL, 0, 'Angol', '2026-02-05 20:46:10'),
(19, 'Tündér Lala', '1920', 176, 8.6, 'Csáth Géza novellái gyermekkorról és fantasztikumról.', 'tunder_lala.jpg', 1, 'BOOK', NULL, NULL, NULL, NULL, 90, 45, NULL, 0, 'Magyar', '2026-02-05 20:46:10'),
(20, 'A kőszívű ember fiai', '0000', 552, 8.8, 'Jókai Mór történelmi regénye a szabadságharcról.', 'koszivuember.jpg', 3, 'BOOK', NULL, NULL, 'koszivuember.epub', NULL, 190, 95, NULL, 1, 'Magyar', '2026-02-05 20:46:10');

--
-- Eseményindítók `book`
--
DELIMITER $$
CREATE TRIGGER `tg_book_year_check_insert` BEFORE INSERT ON `book` FOR EACH ROW BEGIN
    IF NEW.Released > YEAR(CURRENT_DATE) + 1 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Hiba: A kiadási év nem lehet a távoli jövőben!';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tg_book_year_check_update` BEFORE UPDATE ON `book` FOR EACH ROW BEGIN
    IF NEW.Released > YEAR(CURRENT_DATE) + 1 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Hiba: A kiadási év nem lehet a távoli jövőben!';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `book_tag`
--

CREATE TABLE `book_tag` (
  `BookId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `book_tag`
--

INSERT INTO `book_tag` (`BookId`, `TagId`) VALUES
(1, 15),
(1, 26),
(1, 27),
(1, 32),
(2, 25),
(2, 27),
(2, 32),
(3, 15),
(3, 17),
(3, 27),
(3, 29),
(3, 32),
(4, 7),
(4, 9),
(4, 28),
(4, 32),
(5, 19),
(5, 21),
(5, 32),
(6, 10),
(6, 19),
(6, 21),
(6, 25),
(6, 26),
(6, 27),
(6, 33),
(7, 5),
(7, 14),
(7, 27),
(7, 29),
(7, 33),
(8, 5),
(8, 14),
(8, 26),
(8, 27),
(8, 33),
(9, 4),
(9, 21),
(9, 27),
(9, 33),
(9, 37),
(10, 12),
(10, 17),
(10, 25),
(10, 33),
(10, 37),
(11, 4),
(11, 21),
(11, 33),
(11, 38),
(12, 13),
(12, 21),
(12, 32),
(12, 38),
(13, 5),
(13, 10),
(13, 21),
(13, 27),
(13, 33),
(14, 7),
(14, 10),
(14, 19),
(14, 33),
(15, 7),
(15, 16),
(15, 23),
(15, 29),
(15, 33),
(16, 7),
(16, 9),
(16, 23),
(16, 33),
(17, 6),
(17, 17),
(17, 25),
(17, 27),
(17, 33),
(18, 6),
(18, 17),
(18, 33),
(19, 12),
(19, 25),
(19, 32),
(20, 15),
(20, 25),
(20, 27),
(20, 32);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `challenge`
--

CREATE TABLE `challenge` (
  `Id` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Description` text NOT NULL,
  `IconURL` varchar(512) DEFAULT NULL,
  `Type` enum('READ','WATCH','SOCIAL','MIXED','DEDICATION','EVENT') NOT NULL,
  `TargetValue` int(11) NOT NULL,
  `RewardXP` int(11) NOT NULL DEFAULT 0,
  `RewardBadgeId` int(11) DEFAULT NULL,
  `RewardTitleId` int(11) DEFAULT NULL,
  `Difficulty` enum('EASY','MEDIUM','HARD','EPIC') NOT NULL DEFAULT 'EASY',
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `IsRepeatable` tinyint(1) NOT NULL DEFAULT 0,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `challenge`
--

INSERT INTO `challenge` (`Id`, `Title`, `Description`, `IconURL`, `Type`, `TargetValue`, `RewardXP`, `RewardBadgeId`, `RewardTitleId`, `Difficulty`, `IsActive`, `IsRepeatable`, `CreatedAt`) VALUES
(1, 'Első lépések', 'Olvass el 5 könyvet a platformon. ', NULL, 'READ', 5, 250, 9, NULL, 'EASY', 1, 0, '2026-01-14 07:22:12'),
(2, 'Film maraton', 'Nézz meg 10 filmet.', NULL, 'WATCH', 10, 500, 10, NULL, 'MEDIUM', 1, 0, '2026-01-14 07:22:12'),
(3, 'Sorozat guru', 'Nézz meg 3 teljes sorozatot.', NULL, 'WATCH', 3, 750, 11, NULL, 'HARD', 1, 0, '2026-01-14 07:22:12'),
(4, 'Olvasó bajnok', 'Tölts el 1000 percet olvasással.', NULL, 'DEDICATION', 1000, 1000, NULL, 1, 'HARD', 1, 0, '2026-01-14 07:22:12'),
(5, 'Hétvégi maraton', 'Nézz 300 perc tartalmat.', NULL, 'DEDICATION', 300, 400, NULL, NULL, 'MEDIUM', 1, 0, '2026-01-14 07:22:12'),
(6, 'Kitartás', 'Érj el 7 napos sorozatot.', NULL, 'DEDICATION', 7, 350, 5, NULL, 'MEDIUM', 1, 0, '2026-01-14 07:22:12'),
(7, '30 napos kihívás', 'Érj el 30 napos sorozatot.', NULL, 'DEDICATION', 30, 2000, 6, 2, 'EASY', 1, 0, '2026-01-14 07:22:12');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `deleted_user`
--

CREATE TABLE `deleted_user` (
  `Id` int(11) NOT NULL,
  `Username` varchar(128) NOT NULL,
  `Email` varchar(128) NOT NULL,
  `PasswordHash` text NOT NULL,
  `PasswordSalt` text NOT NULL,
  `CountryCode` char(2) DEFAULT NULL,
  `ProfilePic` mediumblob NOT NULL,
  `Premium` tinyint(1) NOT NULL DEFAULT 0,
  `PremiumExpiresAt` datetime DEFAULT NULL,
  `PermissionLevel` enum('USER','MODERATOR','ADMIN','BANNED') NOT NULL DEFAULT 'USER',
  `CreationDate` date NOT NULL,
  `LastLoginDate` date NOT NULL,
  `Level` int(11) NOT NULL DEFAULT 1,
  `XP` int(11) NOT NULL DEFAULT 0,
  `BookPoints` int(11) NOT NULL DEFAULT 0,
  `SeriesPoints` int(11) NOT NULL DEFAULT 0,
  `MoviePoints` int(11) NOT NULL DEFAULT 0,
  `DayStreak` int(11) NOT NULL DEFAULT 0,
  `ReadTimeMin` int(11) NOT NULL DEFAULT 0,
  `WatchTimeMin` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `deleted_user`
--

INSERT INTO `deleted_user` (`Id`, `Username`, `Email`, `PasswordHash`, `PasswordSalt`, `CountryCode`, `ProfilePic`, `Premium`, `PremiumExpiresAt`, `PermissionLevel`, `CreationDate`, `LastLoginDate`, `Level`, `XP`, `BookPoints`, `SeriesPoints`, `MoviePoints`, `DayStreak`, `ReadTimeMin`, `WatchTimeMin`) VALUES
(20, 'fadopoc537', 'deleted_20@anon.local', '', '', 'ZZ', 0x64656661756c742e706e67, 1, '2026-07-08 12:31:09', 'USER', '2026-04-08', '2026-04-08', 1, 0, 0, 0, 0, 0, 0, 0),
(100, 'DeletedUser1', 'deleted_100@anon.local', '', '', 'HU', 0x64656661756c742e706e67, 0, NULL, 'USER', '2024-03-10', '2025-08-15', 3, 200, 800, 400, 300, 0, 900, 600),
(101, 'FormerPremium', 'deleted_101@anon.local', '', '', 'US', 0x64656661756c742e706e67, 1, '2025-12-31 00:00:00', 'USER', '2023-06-20', '2025-11-10', 7, 500, 3500, 2000, 1500, 0, 3000, 2500),
(102, 'GDPR_Removed', 'deleted_102@anon.local', '', '', 'DE', 0x64656661756c742e706e67, 0, NULL, 'USER', '2025-01-01', '2025-12-20', 2, 50, 200, 100, 80, 0, 250, 150);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `episode`
--

CREATE TABLE `episode` (
  `Id` int(11) NOT NULL,
  `SeriesId` int(11) NOT NULL,
  `SeasonNum` int(11) NOT NULL,
  `EpisodeNum` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `StreamURL` varchar(512) NOT NULL,
  `Length` int(11) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `episode`
--

INSERT INTO `episode` (`Id`, `SeriesId`, `SeasonNum`, `EpisodeNum`, `Title`, `StreamURL`, `Length`, `updated_at`) VALUES
(1, 1, 1, 1, 'Bevezető', 'stream/bb_s01e01.mp4', 58, '2026-04-12 13:14:25'),
(2, 1, 1, 2, 'A macska a zsákban', 'stream/bb_s01e02.mp4', 48, '2026-04-12 13:14:52'),
(3, 1, 1, 3, 'A zsák pedig a folyóban', 'stream/bb_s01e03.mp4', 48, '2026-04-12 13:15:15'),
(4, 1, 1, 4, 'A rák dilemmája', 'stream/bb_s01e04.mp4', 48, '2026-04-12 13:15:39'),
(5, 1, 1, 5, 'Szürkeállomány', 'stream/bb_s01e05.mp4', 48, '2026-04-12 13:16:03'),
(6, 1, 1, 6, 'Sok hűhó a nagy semmiért', 'stream/bb_s01e06.mp4', 48, '2026-04-12 13:16:33'),
(7, 1, 1, 7, 'Csak semmi erőszak', 'stream/bb_s01e07.mp4', 48, '2026-04-12 13:16:53'),
(8, 2, 1, 1, 'Közeleg a tél', 'stream/got_s01e01.mp4', 62, '2026-04-12 13:18:45'),
(9, 2, 1, 2, 'A Királyi út', 'stream/got_s01e02.mp4', 56, '2026-04-12 13:19:10'),
(10, 2, 1, 3, 'Havas uraság', 'stream/got_s01e03.mp4', 58, '2026-04-12 13:19:24'),
(11, 2, 1, 4, 'Nyomorékok, fattyak és összetört dolgok', 'stream/got_s01e04.mp4', 56, '2026-04-12 13:20:20'),
(12, 2, 1, 5, 'A farkas és az oroszlán', 'stream/got_s01e05.mp4', 55, '2026-04-12 13:20:42'),
(13, 2, 1, 6, 'Az aranykorona', 'stream/got_s01e06.mp4', 53, '2026-04-12 13:20:59'),
(14, 2, 1, 7, 'Győzöl vagy meghalsz', 'stream/got_s01e07.mp4', 58, '2026-04-12 13:21:32'),
(15, 2, 1, 8, 'A hegyes vége', 'stream/got_s01e08.mp4', 59, '2026-04-12 13:21:55'),
(16, 2, 1, 9, 'Baelor', 'stream/got_s01e09.mp4', 57, '2026-02-05 20:46:10'),
(17, 2, 1, 10, 'Tűz és vér', 'stream/got_s01e10.mp4', 53, '2026-04-12 13:22:28'),
(18, 3, 1, 1, 'Első fejezet: Will Byers eltűnése', 'stream/st_s01e01.mp4', 49, '2026-04-12 13:24:04'),
(19, 3, 1, 2, 'Második fejezet: A Juharfa utcai különc', 'stream/st_s01e02.mp4', 56, '2026-04-12 13:24:34'),
(20, 3, 1, 3, 'Harmadik fejezet: Ünnepi hangulat', 'stream/st_s01e03.mp4', 52, '2026-04-12 13:25:04'),
(21, 3, 1, 4, 'Negyedik fejezet: A test', 'stream/st_s01e04.mp4', 50, '2026-04-12 13:25:24'),
(22, 3, 1, 5, 'Ötödik fejezet: A bolha és az akrobata', 'stream/st_s01e05.mp4', 53, '2026-04-12 13:25:58'),
(23, 3, 1, 6, 'Hatodik fejezet: A szörny', 'stream/st_s01e06.mp4', 47, '2026-04-12 13:26:18'),
(24, 3, 1, 7, 'Hetedik fejezet: A fürdőkád', 'stream/st_s01e07.mp4', 43, '2026-04-12 13:26:51'),
(25, 3, 1, 8, 'Nyolcadik fejezet: Fejjel lefelé', 'stream/st_s01e08.mp4', 55, '2026-04-12 13:27:14'),
(26, 4, 1, 1, 'Pilot', 'stream/office_s01e01.mp4', 23, '2026-02-05 20:46:10'),
(27, 4, 1, 2, 'Diversity Day', 'stream/office_s01e02.mp4', 22, '2026-02-05 20:46:10'),
(28, 4, 1, 3, 'Health Care', 'stream/office_s01e03.mp4', 22, '2026-02-05 20:46:10'),
(29, 4, 1, 4, 'The Alliance', 'stream/office_s01e04.mp4', 22, '2026-02-05 20:46:10'),
(30, 4, 1, 5, 'Basketball', 'stream/office_s01e05.mp4', 22, '2026-02-05 20:46:10'),
(31, 4, 1, 6, 'Hot Girl', 'stream/office_s01e06.mp4', 22, '2026-02-05 20:46:10'),
(32, 5, 1, 1, 'A Study in Pink', 'stream/sherlock_s01e01.mp4', 88, '2026-02-05 20:46:10'),
(33, 5, 1, 2, 'The Blind Banker', 'stream/sherlock_s01e02.mp4', 89, '2026-02-05 20:46:10'),
(34, 5, 1, 3, 'The Great Game', 'stream/sherlock_s01e03.mp4', 90, '2026-02-05 20:46:10'),
(35, 6, 1, 1, 'The National Anthem', 'stream/bm_s01e01.mp4', 44, '2026-02-05 20:46:10'),
(36, 6, 1, 2, 'Fifteen Million Merits', 'stream/bm_s01e02.mp4', 62, '2026-02-05 20:46:10'),
(37, 6, 1, 3, 'The Entire History of You', 'stream/bm_s01e03.mp4', 50, '2026-02-05 20:46:10'),
(38, 7, 1, 1, 'The Boy in the Iceberg', 'stream/avatar_s01e01.mp4', 24, '2026-02-05 20:46:10'),
(39, 7, 1, 2, 'The Avatar Returns', 'stream/avatar_s01e02.mp4', 24, '2026-02-05 20:46:10'),
(40, 7, 1, 3, 'The Southern Air Temple', 'stream/avatar_s01e03.mp4', 24, '2026-02-05 20:46:10'),
(41, 7, 1, 4, 'The Warriors of Kyoshi', 'stream/avatar_s01e04.mp4', 24, '2026-02-05 20:46:10'),
(42, 7, 1, 5, 'The King of Omashu', 'stream/avatar_s01e05.mp4', 24, '2026-02-05 20:46:10'),
(43, 8, 1, 1, '1. rész', 'stream/bk_s01e01.mp4', 25, '2026-02-05 20:46:10'),
(44, 8, 1, 2, '2. rész', 'stream/bk_s01e02.mp4', 25, '2026-02-05 20:46:10'),
(45, 8, 1, 3, '3. rész', 'stream/bk_s01e03.mp4', 25, '2026-02-05 20:46:10'),
(46, 8, 1, 4, '4. rész', 'stream/bk_s01e04.mp4', 25, '2026-02-05 20:46:10'),
(47, 8, 1, 5, '5. rész', 'stream/bk_s01e05.mp4', 25, '2026-02-05 20:46:10');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `mail`
--

CREATE TABLE `mail` (
  `Id` int(11) NOT NULL,
  `ReceiverId` int(11) NOT NULL,
  `SenderId` int(11) NOT NULL DEFAULT 1,
  `Type` enum('SYSTEM','FRIEND','CHALLENGE','PURCHASE') NOT NULL,
  `Subject` varchar(255) NOT NULL,
  `Message` text NOT NULL,
  `IsRead` tinyint(1) DEFAULT 0,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `mail`
--

INSERT INTO `mail` (`Id`, `ReceiverId`, `SenderId`, `Type`, `Subject`, `Message`, `IsRead`, `CreatedAt`, `updated_at`) VALUES
(1, 2, 1, 'SYSTEM', 'Üdvözlünk a KönyvKockán!', 'Köszöntünk Admin! Fedezd fel a platform összes funkcióját.', 1, '2025-01-01 10:00:00', '2026-02-05 20:46:10'),
(2, 3, 1, 'SYSTEM', 'Üdvözlünk a KönyvKockán!', 'Köszöntünk ModeratorAnna! Fedezd fel a platform összes funkcióját.', 1, '2025-03-15 09:00:00', '2026-02-05 20:46:10'),
(3, 4, 1, 'SYSTEM', 'Üdvözlünk a KönyvKockán!', 'Köszöntünk BookLover123! Fedezd fel a könyvek világát.', 1, '2025-06-10 08:00:00', '2026-02-05 20:46:10'),
(4, 5, 1, 'SYSTEM', 'Üdvözlünk a KönyvKockán!', 'Köszöntünk FilmFan88! Nézd meg a legújabb filmeket.', 1, '2025-07-20 10:00:00', '2026-02-05 20:46:10'),
(5, 6, 1, 'SYSTEM', 'Üdvözlünk a KönyvKockán!', 'Köszöntünk SeriesAddict! Indulhat a maratonozás!', 1, '2025-08-05 11:00:00', '2026-02-05 20:46:10'),
(6, 7, 1, 'SYSTEM', 'Üdvözlünk a KönyvKockán!', 'Köszöntünk CasualReader! Jó olvasást!', 1, '2025-09-12 09:00:00', '2026-02-05 20:46:10'),
(7, 8, 1, 'SYSTEM', 'Üdvözlünk a KönyvKockán!', 'Köszöntünk MovieNight! Kellemes filmezést!', 1, '2025-10-01 08:00:00', '2026-02-05 20:46:10'),
(8, 9, 1, 'SYSTEM', 'Üdvözlünk a KönyvKockán!', 'Köszöntünk NewUser2026! Kezd el a kalandot!', 0, '2026-01-15 14:00:00', '2026-02-05 20:46:10'),
(9, 4, 1, 'PURCHASE', 'Prémium aktiválva!', 'Gratulálunk! A prémium tagságod aktív 2026-03-10-ig.', 1, '2025-09-10 12:00:00', '2026-02-05 20:46:10'),
(10, 5, 1, 'PURCHASE', 'Prémium aktiválva!', 'Gratulálunk! A prémium tagságod aktív 2026-04-15-ig.', 1, '2025-10-15 11:00:00', '2026-02-05 20:46:10'),
(11, 6, 1, 'PURCHASE', 'Prémium aktiválva!', 'Gratulálunk! A prémium tagságod aktív 2026-05-01-ig.', 1, '2025-11-01 10:00:00', '2026-02-05 20:46:10'),
(12, 13, 1, 'PURCHASE', 'Prémium aktiválva!', 'Gratulálunk! A prémium tagságod aktív 2026-08-01-ig.', 1, '2025-11-01 09:00:00', '2026-02-05 20:46:10'),
(13, 4, 1, 'CHALLENGE', 'Kihívás teljesítve!', 'Gratulálunk! Teljesítetted az \"Első lépések\" kihívást. Ne felejtsd el átvenni a jutalmat!', 1, '2025-10-20 19:05:00', '2026-04-05 20:11:27'),
(14, 5, 1, 'CHALLENGE', 'Kihívás teljesítve!', 'Gratulálunk! Teljesítetted a \"Hétvégi maraton\" kihívást. Ne felejtsd el átvenni a jutalmat!', 0, '2025-11-17 21:05:00', '2026-02-05 20:46:10'),
(15, 6, 1, 'CHALLENGE', 'Kihívás teljesítve!', 'Gratulálunk! Teljesítetted a \"Sorozat guru\" kihívást. Ne felejtsd el átvenni a jutalmat!', 1, '2025-11-05 22:05:00', '2026-04-06 17:18:40'),
(16, 6, 1, 'CHALLENGE', 'Kihívás teljesítve!', 'Gratulálunk! Teljesítetted a \"Kitartás\" kihívást. Ne felejtsd el átvenni a jutalmat!', 1, '2025-08-07 23:59:59', '2026-04-06 17:18:40'),
(17, 13, 1, 'CHALLENGE', 'Kihívás teljesítve!', 'Gratulálunk! Teljesítetted a \"Kitartás\" kihívást. Ne felejtsd el átvenni a jutalmat!', 0, '2025-10-07 23:59:59', '2026-02-05 20:46:10'),
(18, 4, 6, 'FRIEND', 'Szia!', 'Hello BookLover! Láttam, hogy te is szereted a fantasy könyveket. Olvastad már a Dűnét?', 1, '2025-11-01 14:00:00', '2026-02-05 20:46:10'),
(19, 6, 4, 'FRIEND', 'RE: Szia!', 'Igen, imádtam! Épp a folytatást tervezem elkezdeni. Te is olvastad?', 1, '2025-11-01 15:30:00', '2026-02-05 20:46:10'),
(20, 4, 6, 'FRIEND', 'RE: RE: Szia!', 'Még nem, de most felkerült a listámra! Köszi a tippet!', 1, '2025-11-01 16:00:00', '2026-02-05 20:46:10'),
(21, 5, 8, 'FRIEND', 'Film ajánló', 'Hey MovieNight! Láttad már az Interstellar-t? Szerintem tetszeni fog!', 1, '2025-12-01 18:00:00', '2026-02-05 20:46:10'),
(22, 8, 5, 'FRIEND', 'RE: Film ajánló', 'Még nem, de hozzáadtam a listához! Köszi!', 0, '2025-12-01 20:00:00', '2026-02-05 20:46:10'),
(23, 16, 2, 'SYSTEM', 'Gratulálunk a teljesítményhez!', 'PowerUser, te vagy az egyik legaktívabb tagunk! Köszönjük, hogy velünk vagy!', 1, '2025-06-01 10:00:00', '2026-04-03 10:44:05'),
(24, 7, 1, 'SYSTEM', 'Új könyvek érkeztek!', 'Nézd meg a legújabb magyar könyveket a platformon!', 0, '2026-02-04 09:00:00', '2026-02-05 20:46:10'),
(25, 8, 1, 'SYSTEM', 'Hétvégi film maraton!', 'Ne maradj le a hétvégi akciókról! Dupla pont minden filmért!', 0, '2026-02-05 08:00:00', '2026-02-05 20:46:10'),
(26, 4, 3, 'SYSTEM', 'Rendszerbejelentés', 'Szia', 1, '2026-04-04 20:32:00', '2026-04-05 20:11:27'),
(27, 3, 3, 'SYSTEM', 'Rendszerbejelentés', 'Én vagyok az', 1, '2026-04-04 20:32:41', '2026-04-08 11:28:43'),
(28, 2, 3, 'SYSTEM', 'Rendszerbejelentés', 'Tessék?', 0, '2026-04-04 20:33:25', '2026-04-04 22:33:25'),
(29, 3, 3, 'SYSTEM', 'Rendszerbejelentés', 'Tessék?', 1, '2026-04-04 20:33:25', '2026-04-08 11:28:43'),
(30, 4, 3, 'SYSTEM', 'Rendszerbejelentés', 'Tessék?', 1, '2026-04-04 20:33:25', '2026-04-05 20:11:27'),
(31, 5, 3, 'SYSTEM', 'Rendszerbejelentés', 'Tessék?', 0, '2026-04-04 20:33:25', '2026-04-04 22:33:25'),
(32, 6, 3, 'SYSTEM', 'Rendszerbejelentés', 'Tessék?', 1, '2026-04-04 20:33:25', '2026-04-06 17:18:40'),
(33, 13, 3, 'SYSTEM', 'Rendszerbejelentés', 'Tessék?', 0, '2026-04-04 20:33:25', '2026-04-04 22:33:25'),
(34, 16, 3, 'SYSTEM', 'Rendszerbejelentés', 'Tessék?', 0, '2026-04-04 20:33:25', '2026-04-04 22:33:25'),
(35, 1, 3, 'SYSTEM', 'Rendszerbejelentés', 'test', 0, '2026-04-04 20:33:45', '2026-04-04 22:33:45'),
(36, 7, 3, 'SYSTEM', 'Rendszerbejelentés', 'test', 0, '2026-04-04 20:33:45', '2026-04-04 22:33:45'),
(37, 8, 3, 'SYSTEM', 'Rendszerbejelentés', 'test', 0, '2026-04-04 20:33:45', '2026-04-04 22:33:45'),
(38, 9, 3, 'SYSTEM', 'Rendszerbejelentés', 'test', 0, '2026-04-04 20:33:45', '2026-04-04 22:33:45'),
(39, 10, 3, 'SYSTEM', 'Rendszerbejelentés', 'test', 0, '2026-04-04 20:33:45', '2026-04-04 22:33:45'),
(40, 11, 3, 'SYSTEM', 'Rendszerbejelentés', 'test', 0, '2026-04-04 20:33:45', '2026-04-04 22:33:45'),
(41, 12, 3, 'SYSTEM', 'Rendszerbejelentés', 'test', 0, '2026-04-04 20:33:45', '2026-04-04 22:33:45'),
(42, 14, 3, 'SYSTEM', 'Rendszerbejelentés', 'test', 0, '2026-04-04 20:33:45', '2026-04-04 22:33:45'),
(43, 15, 3, 'SYSTEM', 'Rendszerbejelentés', 'test', 0, '2026-04-04 20:33:45', '2026-04-04 22:33:45'),
(44, 17, 3, 'SYSTEM', 'Rendszerbejelentés', 'test', 0, '2026-04-04 20:33:45', '2026-04-04 22:33:45'),
(45, 1, 7, 'SYSTEM', 'Felhasználói jelentés • Spam / hirdetés', 'Jelentett felhasználó: PowerUser (ID: 16)\nBejelentő: CasualReader (ID: 7)\nOk: Spam / hirdetés\n\nRészletes indoklás:\nButa volt szegény', 0, '2026-04-08 09:16:26', '2026-04-08 11:16:26'),
(46, 2, 7, 'SYSTEM', 'Felhasználói jelentés • Spam / hirdetés', 'Jelentett felhasználó: PowerUser (ID: 16)\nBejelentő: CasualReader (ID: 7)\nOk: Spam / hirdetés\n\nRészletes indoklás:\nButa volt szegény', 0, '2026-04-08 09:16:26', '2026-04-08 11:16:26'),
(47, 3, 7, 'SYSTEM', 'Felhasználói jelentés • Spam / hirdetés', 'Jelentett felhasználó: PowerUser (ID: 16)\nBejelentő: CasualReader (ID: 7)\nOk: Spam / hirdetés\n\nRészletes indoklás:\nButa volt szegény', 1, '2026-04-08 09:16:26', '2026-04-08 11:28:43'),
(48, 1, 3, 'SYSTEM', 'Felhasználói jelentés • Egyéb', 'Jelentett felhasználó: PowerUser (ID: 16)\nBejelentő: ModeratorAnna (ID: 3)\nOk: Egyéb\n\nRészletes indoklás:\nA KURVA ANYÁDAT TE', 0, '2026-04-08 09:28:30', '2026-04-08 11:28:30'),
(49, 2, 3, 'SYSTEM', 'Felhasználói jelentés • Egyéb', 'Jelentett felhasználó: PowerUser (ID: 16)\nBejelentő: ModeratorAnna (ID: 3)\nOk: Egyéb\n\nRészletes indoklás:\nA KURVA ANYÁDAT TE', 0, '2026-04-08 09:28:30', '2026-04-08 11:28:30');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `movie`
--

CREATE TABLE `movie` (
  `Id` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Released` year(4) NOT NULL,
  `Length` int(4) NOT NULL,
  `Rating` decimal(3,1) NOT NULL DEFAULT 0.0,
  `Description` text NOT NULL,
  `StreamURL` varchar(512) NOT NULL,
  `PosterApiName` varchar(512) NOT NULL,
  `AgeRatingId` int(11) DEFAULT NULL,
  `TrailerURL` varchar(512) DEFAULT NULL,
  `RewardXP` int(11) NOT NULL DEFAULT 80,
  `RewardPoints` int(11) NOT NULL DEFAULT 40,
  `HasSubtitles` tinyint(1) NOT NULL DEFAULT 0,
  `IsOriginalLanguage` tinyint(1) NOT NULL DEFAULT 0,
  `IsOfflineAvailable` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `movie`
--

INSERT INTO `movie` (`Id`, `Title`, `Released`, `Length`, `Rating`, `Description`, `StreamURL`, `PosterApiName`, `AgeRatingId`, `TrailerURL`, `RewardXP`, `RewardPoints`, `HasSubtitles`, `IsOriginalLanguage`, `IsOfflineAvailable`, `updated_at`) VALUES
(1, 'The Dark Knight', '2008', 152, 9.0, 'Christopher Nolan Batman-filmje a Jokerre összpontosítva.', 'stream/dark_knight.mp4', 'dark_knight.jpg', 4, 'https://youtube.com/trailer1', 80, 40, 1, 0, 1, '2026-02-05 20:46:10'),
(2, 'Inception', '2010', 148, 8.8, 'Christopher Nolan sci-fi thrillere álmokról és valóságról.', 'stream/inception.mp4', 'inception.jpg', 4, 'https://youtube.com/trailer2', 80, 40, 1, 0, 1, '2026-02-05 20:46:10'),
(3, 'Mad Max: Fury Road', '2015', 120, 8.1, 'George Miller posztapokaliptikus akció-remekműve.', 'stream/mad_max.mp4', 'mad_max.jpg', 5, 'https://youtube.com/trailer3', 70, 35, 1, 0, 0, '2026-02-05 20:46:10'),
(4, 'The Shawshank Redemption', '1994', 142, 9.3, 'Frank Darabont börtöndráma-klasszikusa reményről és barátságról.', 'stream/shawshank.mp4', 'shawshank.jpg', 4, 'https://youtube.com/trailer4', 85, 42, 1, 0, 1, '2026-02-05 20:46:10'),
(5, 'Forrest Gump', '1994', 142, 8.8, 'Robert Zemeckis filmje egy különleges emberről, aki történelmet ír.', 'stream/forrest_gump.mp4', 'forrest_gump.jpg', 3, 'https://youtube.com/trailer5', 80, 40, 1, 0, 1, '2026-02-05 20:46:10'),
(6, 'The Grand Budapest Hotel', '2014', 99, 8.1, 'Wes Anderson vizuálisan lenyűgöző vígjátéka egy szállodáról.', 'stream/budapest_hotel.mp4', 'budapest_hotel.jpg', 3, 'https://youtube.com/trailer6', 70, 35, 1, 0, 0, '2026-02-05 20:46:10'),
(7, 'Superbad', '2007', 113, 7.6, 'Greg Mottola tinédzser-vígjátéka barátságról és bulizásról.', 'stream/superbad.mp4', 'superbad.jpg', 5, 'https://youtube.com/trailer7', 65, 32, 1, 0, 0, '2026-02-05 20:46:10'),
(8, 'Interstellar', '2014', 169, 8.6, 'Christopher Nolan epikus űrutazása az emberiség megmentéséért.', 'stream/interstellar.mp4', 'interstellar.jpg', 3, 'https://youtube.com/trailer8', 90, 45, 1, 0, 1, '2026-02-05 20:46:10'),
(9, 'The Matrix', '1999', 136, 8.7, 'Wachowski testvérek kultikus sci-fi-je a valóság természetéről.', 'stream/matrix.mp4', 'matrix.jpg', 4, 'https://youtube.com/trailer9', 80, 40, 1, 0, 1, '2026-02-05 20:46:10'),
(10, 'Spirited Away', '2001', 125, 8.6, 'Hayao Miyazaki anime remekműve egy lány kalandjairól a szellemek világában.', 'stream/spirited_away.mp4', 'spirited_away.jpg', 2, 'https://youtube.com/trailer10', 75, 37, 1, 0, 1, '2026-02-05 20:46:10'),
(11, 'Toy Story', '1995', 81, 8.3, 'Pixar első nagyjátékfilmje játékok titkos életéről.', 'https://videa.hu/player?v=4589MF2aMJm2reT9&autoplay=1&enableJsApi=1&apiKey=PKeut6dEjAJYKYRp', 'https://image.tmdb.org/t/p/original/4rbcp3ng8n1MKHjpeqW0L7Fnpzz.jpg', 1, 'https://youtu.be/xNWSGRD5CzU', 60, 30, 1, 0, 1, '2026-03-26 20:36:12'),
(12, 'The Shining', '1980', 146, 8.4, 'Stanley Kubrick horror-klasszikusa egy elszigetelt szállodában.', 'stream/shining.mp4', 'shining.jpg', 5, 'https://youtube.com/trailer12', 80, 40, 1, 0, 0, '2026-02-05 20:46:10'),
(13, 'Kontroll', '2003', 105, 7.6, 'Antal Nimród thrillere a budapesti metróban.', 'stream/kontroll.mp4', 'kontroll.jpg', 4, 'https://youtube.com/trailer13', 70, 35, 0, 1, 1, '2026-02-05 20:46:10'),
(14, 'Taxidermia', '2006', 91, 7.0, 'Pálfi György szürreális filmje három generációról.', 'stream/taxidermia.mp4', 'taxidermia.jpg', 5, 'https://youtube.com/trailer14', 65, 32, 0, 1, 0, '2026-02-05 20:46:10'),
(15, 'The Lion King', '1994', 88, 8.5, 'Disney klasszikus animációs filmje egy oroszlánkölyökről.', 'stream/lion_king.mp4', 'lion_king.jpg', 1, 'https://youtube.com/trailer15', 60, 30, 1, 0, 1, '2026-02-05 20:46:10');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `movie_tag`
--

CREATE TABLE `movie_tag` (
  `MovieId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `movie_tag`
--

INSERT INTO `movie_tag` (`MovieId`, `TagId`) VALUES
(1, 1),
(1, 13),
(1, 16),
(1, 27),
(2, 1),
(2, 10),
(2, 21),
(2, 27),
(3, 1),
(3, 10),
(3, 36),
(4, 13),
(4, 17),
(4, 20),
(4, 26),
(4, 27),
(5, 13),
(5, 17),
(5, 20),
(5, 24),
(5, 27),
(6, 2),
(6, 21),
(6, 27),
(7, 2),
(7, 18),
(7, 36),
(8, 10),
(8, 13),
(8, 21),
(8, 27),
(9, 1),
(9, 10),
(9, 21),
(9, 27),
(10, 5),
(10, 14),
(10, 17),
(10, 27),
(11, 5),
(11, 11),
(11, 18),
(11, 24),
(11, 27),
(11, 34),
(12, 3),
(12, 19),
(12, 23),
(12, 36),
(13, 7),
(13, 13),
(13, 32),
(14, 19),
(14, 21),
(14, 32),
(14, 36),
(15, 5),
(15, 11),
(15, 17),
(15, 27),
(15, 34);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `purchase`
--

CREATE TABLE `purchase` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Price` int(11) DEFAULT NULL,
  `Tier` enum('ONE_M','QUARTER_Y','FULL_Y') NOT NULL DEFAULT 'ONE_M',
  `PurchaseStatus` enum('PENDING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
  `PurchaseDate` date DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `purchase`
--

INSERT INTO `purchase` (`Id`, `UserId`, `Price`, `Tier`, `PurchaseStatus`, `PurchaseDate`, `updated_at`) VALUES
(1, 2, 2990, 'QUARTER_Y', 'SUCCESS', '2025-01-01', '2026-02-05 20:46:10'),
(2, 3, 990, 'ONE_M', 'SUCCESS', '2025-03-15', '2026-02-05 20:46:10'),
(3, 4, 2990, 'QUARTER_Y', 'SUCCESS', '2025-09-10', '2026-02-05 20:46:10'),
(4, 5, 2990, 'QUARTER_Y', 'SUCCESS', '2025-10-15', '2026-02-05 20:46:10'),
(5, 6, 2990, 'QUARTER_Y', 'SUCCESS', '2025-11-01', '2026-02-05 20:46:10'),
(6, 13, 9990, 'FULL_Y', 'SUCCESS', '2025-11-01', '2026-02-05 20:46:10'),
(7, 16, 9990, 'FULL_Y', 'SUCCESS', '2024-01-01', '2026-02-05 20:46:10'),
(8, 16, 9990, 'FULL_Y', 'SUCCESS', '2025-01-01', '2026-02-05 20:46:10'),
(9, 7, 990, 'ONE_M', 'FAILED', '2025-10-05', '2026-02-05 20:46:10'),
(10, 8, 2990, 'QUARTER_Y', 'FAILED', '2025-11-10', '2026-02-05 20:46:10'),
(11, 10, 990, 'ONE_M', 'REFUNDED', '2025-08-01', '2026-02-05 20:46:10'),
(12, 9, 990, 'ONE_M', 'PENDING', '2026-02-05', '2026-02-05 20:46:10'),
(13, 12, 2990, 'QUARTER_Y', 'PENDING', '2026-02-04', '2026-02-05 20:46:10'),
(14, 8, 2990, 'ONE_M', 'SUCCESS', '2026-04-08', '2026-04-08 14:09:00'),
(15, 7, 2990, 'ONE_M', 'SUCCESS', '2026-04-08', '2026-04-08 14:12:18'),
(16, 4, 7490, 'QUARTER_Y', 'SUCCESS', '2026-04-08', '2026-04-08 14:13:33'),
(17, 9, 2990, 'ONE_M', 'SUCCESS', '2026-04-08', '2026-04-08 14:19:17'),
(18, 10, 2990, 'ONE_M', 'SUCCESS', '2026-04-08', '2026-04-08 14:20:28'),
(20, 11, 2990, 'ONE_M', 'SUCCESS', '2026-04-08', '2026-04-08 14:37:39');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `security_audit_log`
--

CREATE TABLE `security_audit_log` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  `Action` varchar(255) NOT NULL,
  `Status` enum('VERIFIED','SUSPICIOUS') NOT NULL,
  `Details` text DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `security_audit_log`
--

INSERT INTO `security_audit_log` (`Id`, `UserId`, `Action`, `Status`, `Details`, `CreatedAt`) VALUES
(1, 2, 'PREMIUM_UPGRADE', 'VERIFIED', 'Prémium vásárlás megerősítve. Lejár: 2026-04-01 00:00:00', '2025-01-01 12:00:00'),
(2, 3, 'PREMIUM_UPGRADE', 'VERIFIED', 'Prémium vásárlás megerősítve. Lejár: 2025-04-15 00:00:00', '2025-03-15 10:00:00'),
(3, 4, 'PREMIUM_UPGRADE', 'VERIFIED', 'Prémium vásárlás megerősítve. Lejár: 2026-03-10 00:00:00', '2025-09-10 12:05:00'),
(4, 5, 'PREMIUM_UPGRADE', 'VERIFIED', 'Prémium vásárlás megerősítve. Lejár: 2026-04-15 00:00:00', '2025-10-15 11:05:00'),
(5, 6, 'PREMIUM_UPGRADE', 'VERIFIED', 'Prémium vásárlás megerősítve. Lejár: 2026-05-01 00:00:00', '2025-11-01 10:05:00'),
(6, 13, 'PREMIUM_UPGRADE', 'VERIFIED', 'Prémium vásárlás megerősítve. Lejár: 2026-08-01 00:00:00', '2025-11-01 09:05:00'),
(7, 16, 'PREMIUM_UPGRADE', 'VERIFIED', 'Prémium vásárlás megerősítve. Lejár: 2025-01-01 00:00:00', '2024-01-01 08:05:00'),
(8, 16, 'PREMIUM_UPGRADE', 'VERIFIED', 'Prémium vásárlás megerősítve. Lejár: 2027-12-31 23:59:59', '2025-01-01 08:05:00'),
(9, 3, 'PREMIUM_EXPIRED', 'VERIFIED', 'Prémium lejárt. Utolsó lejárati dátum: 2025-04-15 00:00:00', '2025-04-15 03:00:00'),
(10, 3, 'PREMIUM_UPGRADE', 'VERIFIED', 'Prémium vásárlás megerősítve. Lejár: 2026-06-01 00:00:00', '2025-05-01 10:00:00'),
(11, 10, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 'Prémium státusz engedélyezve vásárlás nélkül. Szint: 2, Lejár: NULL', '2025-07-15 14:30:00'),
(12, NULL, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 'Ismeretlen user próbált prémiumot aktiválni API-n keresztül.', '2025-09-20 02:15:00'),
(13, 16, 'PREMIUM_UPGRADE', 'VERIFIED', 'Admin által jóváhagyott extra prémium idő (+30 nap kompenzáció).', '2025-06-01 10:00:00'),
(14, 10, 'PREMIUM_EXPIRED', 'VERIFIED', 'Prémium lejárt. Utolsó lejárati dátum: 2025-09-01 00:00:00', '2025-09-01 03:00:00'),
(15, 17, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 'Prémium státusz engedélyezve vásárlás nélkül. Szint: 2, Lejár: NULL', '2026-04-05 18:49:01'),
(16, 17, 'PREMIUM_EXPIRED', 'VERIFIED', 'Prémium lejárt. Utolsó lejárati dátum: NULL', '2026-04-05 18:49:24'),
(17, 4, 'PREMIUM_EXPIRED', 'VERIFIED', 'Prémium lejárt. Utolsó lejárati dátum: 2026-03-10 00:00:00', '2026-04-08 13:58:37'),
(18, 8, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 'Prémium státusz engedélyezve vásárlás nélkül. Szint: 3, Lejár: 2026-05-08 12:09:00', '2026-04-08 14:09:00'),
(19, 7, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 'Prémium státusz engedélyezve vásárlás nélkül. Szint: 4, Lejár: 2026-05-08 12:12:18', '2026-04-08 14:12:18'),
(20, 4, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 'Prémium státusz engedélyezve vásárlás nélkül. Szint: 9, Lejár: 2026-07-08 12:13:33', '2026-04-08 14:13:33'),
(21, 9, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 'Prémium státusz engedélyezve vásárlás nélkül. Szint: 1, Lejár: 2026-05-08 12:19:17', '2026-04-08 14:19:17'),
(22, 10, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 'Prémium státusz engedélyezve vásárlás nélkül. Szint: 2, Lejár: 2026-05-08 12:20:28', '2026-04-08 14:20:28'),
(23, NULL, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 'Prémium státusz engedélyezve vásárlás nélkül. Szint: 1, Lejár: 2026-07-08 12:31:09', '2026-04-08 14:31:09'),
(24, 11, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 'Prémium státusz engedélyezve vásárlás nélkül. Szint: 1, Lejár: 2026-05-08 12:37:39', '2026-04-08 14:37:39');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `series`
--

CREATE TABLE `series` (
  `Id` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Released` int(4) NOT NULL,
  `Rating` decimal(3,1) NOT NULL DEFAULT 0.0,
  `Description` text NOT NULL,
  `PosterApiName` varchar(512) NOT NULL,
  `AgeRatingId` int(11) DEFAULT NULL,
  `TrailerURL` varchar(512) DEFAULT NULL,
  `RewardXP` int(11) NOT NULL DEFAULT 150,
  `RewardPoints` int(11) NOT NULL DEFAULT 75,
  `HasSubtitles` tinyint(1) NOT NULL DEFAULT 0,
  `IsOriginalLanguage` tinyint(1) NOT NULL DEFAULT 0,
  `IsOfflineAvailable` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `series`
--

INSERT INTO `series` (`Id`, `Title`, `Released`, `Rating`, `Description`, `PosterApiName`, `AgeRatingId`, `TrailerURL`, `RewardXP`, `RewardPoints`, `HasSubtitles`, `IsOriginalLanguage`, `IsOfflineAvailable`, `updated_at`) VALUES
(1, 'Breaking Bad', 2008, 9.5, 'Vince Gilligan drámasorozata egy kémiatanárról, aki metamfetamin-főzésbe kezd.', 'breaking_bad.jpg', 5, 'https://youtube.com/bb_trailer', 200, 100, 1, 0, 1, '2026-02-05 20:46:10'),
(2, 'Game of Thrones', 2011, 9.3, 'HBO fantasy eposzahét királyságokért folyó hatalmi harcról.', 'game_of_thrones.jpg', 5, 'https://youtube.com/got_trailer', 250, 125, 1, 0, 1, '2026-02-05 20:46:10'),
(3, 'Stranger Things', 2016, 8.7, 'Netflix sci-fi horror sorozata 80-as évekbeli gyerekekről és természetfeletti erőkről.', 'stranger_things.jpg', 4, 'https://youtube.com/st_trailer', 150, 75, 1, 0, 1, '2026-02-05 20:46:10'),
(4, 'The Office (US)', 2005, 9.0, 'Mockumentary stílusú vígjáték egy papírgyár dolgozóiról.', 'office_us.jpg', 3, 'https://youtube.com/office_trailer', 120, 60, 1, 0, 0, '2026-02-05 20:46:10'),
(5, 'Sherlock', 2010, 9.1, 'BBC modern adaptációja Sherlock Holmes történetekről.', 'sherlock.jpg', 3, 'https://youtube.com/sherlock_trailer', 150, 75, 1, 0, 1, '2026-02-05 20:46:10'),
(6, 'Black Mirror', 2011, 8.7, 'Brit antológia sorozat a technológia sötét oldaláról.', 'black_mirror.jpg', 5, 'https://youtube.com/bm_trailer', 140, 70, 1, 0, 0, '2026-02-05 20:46:10'),
(7, 'Avatar: The Last Airbender', 2005, 9.3, 'Nickelodeon animációs sorozata egy világ megmentéséről.', 'avatar_tla.jpg', 2, 'https://youtube.com/avatar_trailer', 130, 65, 1, 0, 1, '2026-02-05 20:46:10'),
(8, 'Barátok közt', 1998, 6.5, 'Magyar szappanopera hétköznapi emberek életéről.', 'baratok_kozt.jpg', 3, NULL, 80, 40, 0, 1, 0, '2026-02-05 20:46:10');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `series_tag`
--

CREATE TABLE `series_tag` (
  `SeriesId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `series_tag`
--

INSERT INTO `series_tag` (`SeriesId`, `TagId`) VALUES
(1, 9),
(1, 13),
(1, 21),
(1, 23),
(1, 24),
(1, 27),
(2, 1),
(2, 13),
(2, 14),
(2, 19),
(2, 27),
(2, 36),
(3, 3),
(3, 10),
(3, 16),
(3, 27),
(4, 2),
(4, 18),
(4, 22),
(4, 27),
(5, 9),
(5, 16),
(5, 21),
(5, 27),
(6, 7),
(6, 10),
(6, 19),
(6, 21),
(7, 5),
(7, 11),
(7, 14),
(7, 27),
(7, 34),
(8, 13),
(8, 22),
(8, 32);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tag`
--

CREATE TABLE `tag` (
  `Id` int(11) NOT NULL,
  `Name` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tag`
--

INSERT INTO `tag` (`Id`, `Name`) VALUES
(36, '18+'),
(31, 'Adaptáció'),
(27, 'Ajánlott'),
(1, 'Akció'),
(24, 'Bestseller'),
(34, 'Családbarát'),
(11, 'Családi'),
(26, 'Díjnyertes'),
(8, 'Dokumentum'),
(13, 'Dráma'),
(38, 'E-book elérhető'),
(4, 'Életrajzi'),
(21, 'Elgondolkodtató'),
(14, 'Fantasy'),
(20, 'Felemelő'),
(40, 'Feliratos'),
(35, 'Felnőtt tartalom'),
(23, 'Feszült'),
(37, 'Hangoskönyv elérhető'),
(3, 'Horror'),
(16, 'Izgalmas'),
(5, 'Kaland'),
(25, 'Klasszikus'),
(22, 'Könnyű olvasmány'),
(9, 'Krimi'),
(33, 'Külföldi szerző'),
(32, 'Magyar szerző'),
(17, 'Megható'),
(12, 'Mese'),
(29, 'Népszerű'),
(39, 'Offline elérhető'),
(6, 'Romantikus'),
(10, 'Sci-fi'),
(30, 'Sorozat része'),
(19, 'Sötét'),
(41, 'Szinkronizált'),
(7, 'Thriller'),
(15, 'Történelmi'),
(28, 'Új'),
(18, 'Vicces'),
(2, 'Vígjáték');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `title`
--

CREATE TABLE `title` (
  `Id` int(11) NOT NULL,
  `Name` varchar(128) NOT NULL,
  `Description` text DEFAULT NULL,
  `Rarity` enum('COMMON','RARE','EPIC','LEGENDARY') NOT NULL DEFAULT 'COMMON'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `title`
--

INSERT INTO `title` (`Id`, `Name`, `Description`, `Rarity`) VALUES
(1, 'Könyvmoly', 'Elolvastál 50 könyvet', 'EPIC'),
(2, 'Maratonista', 'Teljesítettél egy maratont', 'RARE'),
(3, 'Veterán', '1 éve regisztrált tag', 'COMMON'),
(4, 'Felfedező', '10 különböző műfajt kipróbáltál', 'RARE');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user`
--

CREATE TABLE `user` (
  `Id` int(11) NOT NULL,
  `Username` varchar(128) NOT NULL,
  `Email` varchar(128) NOT NULL,
  `IsEmailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `EmailVerificationTokenHash` varchar(128) DEFAULT NULL,
  `EmailVerificationTokenExpiresAt` datetime DEFAULT NULL,
  `EmailVerifiedAt` datetime DEFAULT NULL,
  `PasswordHash` text NOT NULL,
  `PasswordSalt` text NOT NULL,
  `CountryCode` char(2) DEFAULT NULL,
  `ProfilePic` mediumblob DEFAULT NULL,
  `Premium` tinyint(1) NOT NULL DEFAULT 0,
  `PremiumExpiresAt` datetime DEFAULT NULL,
  `PermissionLevel` enum('USER','MODERATOR','ADMIN','BANNED') NOT NULL DEFAULT 'USER',
  `CreationDate` date NOT NULL,
  `LastLoginDate` date NOT NULL,
  `Level` int(11) NOT NULL DEFAULT 1,
  `XP` int(11) NOT NULL DEFAULT 0,
  `BookPoints` int(11) NOT NULL DEFAULT 0,
  `SeriesPoints` int(11) NOT NULL DEFAULT 0,
  `MoviePoints` int(11) NOT NULL DEFAULT 0,
  `DayStreak` int(11) NOT NULL DEFAULT 0,
  `ReadTimeMin` int(11) NOT NULL DEFAULT 0,
  `WatchTimeMin` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `user`
--

INSERT INTO `user` (`Id`, `Username`, `Email`, `IsEmailVerified`, `EmailVerificationTokenHash`, `EmailVerificationTokenExpiresAt`, `EmailVerifiedAt`, `PasswordHash`, `PasswordSalt`, `CountryCode`, `ProfilePic`, `Premium`, `PremiumExpiresAt`, `PermissionLevel`, `CreationDate`, `LastLoginDate`, `Level`, `XP`, `BookPoints`, `SeriesPoints`, `MoviePoints`, `DayStreak`, `ReadTimeMin`, `WatchTimeMin`, `updated_at`) VALUES
(1, 'System', 'system@konyvkocka.local', 1, NULL, NULL, '2026-04-07 15:34:57', 'b6cece4a7e64997e1e0bcf2d5a8bd5e1f9ca6903dbeb4ec806c477773a6bee0d', 'a1b2c3d4e5f6789012345678abcdef00', 'HU', NULL, 0, NULL, 'ADMIN', '2026-02-05', '2026-03-01', 1, 0, 0, 0, 0, 0, 0, 0, '2026-04-08 12:57:17'),
(2, 'Admin', 'admin@konyvkocka.local', 1, NULL, NULL, '2026-04-07 15:34:57', '4214c9e1815525ef2d72353b9b6f3e03c5fa47c15114f2905bbb93b2173ebea1', '1a2b3c4d5e6f7890abcdef1234567890', 'HU', NULL, 1, '2027-01-01 00:00:00', 'ADMIN', '2025-01-01', '2026-04-08', 10, 500, 5000, 3000, 2000, 151, 5000, 3000, '2026-04-08 16:02:01'),
(3, 'ModeratorAnna', 'anna@konyvkocka.local', 1, NULL, NULL, '2026-04-07 15:34:57', '1fafbc13da806cbcdc111d421cf2d84cf3f3219350fedcfc458a28e68be42bf1', 'vt5XKpPihnFP7EosvqcwAqCSDI1zNOfMbBD1Qiu273urDb1aeLg5xKwNUphqf7Yu', 'HU', NULL, 1, '2026-06-01 00:00:00', 'MODERATOR', '2025-03-15', '2026-04-08', 5, 800, 2500, 1500, 1000, 45, 2023, 1500, '2026-04-08 16:19:50'),
(4, 'KönyvImádó123', 'konyvimado@gmail.com', 1, NULL, NULL, '2026-04-07 15:34:57', '6621061ffcd85587c8eb41b058605c9d20f28cd168437aff6c3829f9c8f5a063', '3c4d5e6f7890ab12cdef345678901234', 'HU', NULL, 1, '2026-07-08 12:13:33', 'USER', '2025-06-10', '2026-04-08', 9, 550, 4200, 1800, 1500, 91, 4020, 2200, '2026-04-12 13:31:35'),
(5, 'FilmFan88', 'filmfan@gmail.com', 1, NULL, NULL, '2026-04-07 15:34:57', '0468060223a2423c52bcec93589841021d713427eae1e91234d143ab891aa954', '4d5e6f7890ab1234def4567890123456', 'HU', NULL, 1, '2026-04-15 00:00:00', 'USER', '2025-07-20', '2026-04-01', 6, 650, 1800, 2500, 3200, 60, 1500, 4000, '2026-04-07 15:34:57'),
(6, 'SorozatFüggő', 'sorozatfuggo@yahoo.com', 1, NULL, NULL, '2026-04-07 15:34:57', 'ca2c4bfea4d2fefac949e8124fd8b1a9e7437a75a1792c6ac71cc0a502db0107', '5e6f7890ab123456ef56789012345678', 'GB', NULL, 1, '2026-05-01 00:00:00', 'USER', '2025-08-05', '2026-04-06', 8, 450, 2175, 3800, 2900, 75, 2006, 5000, '2026-04-12 13:32:07'),
(7, 'AlkalmiOlvasó', 'alkalmiolvaso@outlook.com', 1, NULL, NULL, '2026-04-07 15:34:57', '9498ac81de8954cc7f65f71e417318d228a573b7a1fdf7496d4e036593439d9d', '890ab1234567890178901234567890ef', 'HU', NULL, 1, '2026-05-08 12:12:18', 'USER', '2025-09-12', '2026-04-08', 4, 450, 1500, 800, 600, 30, 1200, 900, '2026-04-12 13:33:00'),
(8, 'FilmEst', 'filmest@gmail.com', 1, NULL, NULL, '2026-04-07 15:34:57', '0bb0751fa05c5c90a78e28230876fc8cb51db304e2d05af889c0abae3b96fda2', '90ab12345678901289012345678901ab', 'DE', NULL, 1, '2026-05-08 12:09:00', 'USER', '2025-10-01', '2026-04-08', 3, 720, 600, 1200, 1500, 21, 500, 2000, '2026-04-12 13:33:25'),
(9, 'UjFelhasználó2026', 'ujfelhasznalo@gmail.com', 1, NULL, NULL, '2026-04-07 15:34:57', '7faf416b88661bafba14953f02b07b0cea376c0c408e9f5a3d5aab3d1b96f973', '0ab123456789012390123456789012cd', 'FR', NULL, 1, '2026-05-08 12:19:17', 'USER', '2026-01-15', '2026-04-08', 1, 50, 100, 50, 30, 4, 100, 50, '2026-04-12 13:33:59'),
(10, 'RégiFelhasználó', 'regifelhasználó@gmail.com', 1, NULL, NULL, '2026-04-07 15:34:57', '6026b582ff3ed87f5ef12be2d2d608fe4057f8362b17630b8936b9b8812d5f93', 'ab1234567890123401234567890123ef', 'HU', NULL, 1, '2026-05-08 12:20:28', 'USER', '2024-05-10', '2026-04-08', 2, 150, 300, 200, 150, 1, 400, 300, '2026-04-12 13:34:26'),
(11, 'LustaOlvasó', 'lusta@gmail.com', 1, '143bf5f58bc2fbc9f274463f4b1c562753efc46c660b6f580ed67bd58a115434', '2026-04-08 13:16:35', '2026-04-07 15:34:57', 'b05eb68e4148667e1f6a904f2324967b696809b29b969c9ab57d54dc06a77edf', 'b12345678901234512345678901234ab', 'HU', NULL, 1, '2026-05-08 12:37:39', 'USER', '2025-11-20', '2026-04-08', 1, 20, 50, 30, 20, 1, 80, 40, '2026-04-12 13:34:45'),
(12, 'PolishFan', 'polish@gmail.com', 1, NULL, NULL, '2026-04-07 15:34:57', '498dc93b12a942338ec40009cd44b2c25135b352f4acacecc789e3596c57d973', 'c1234567890123456234567890123cd', 'PL', NULL, 0, NULL, 'USER', '2025-12-01', '2026-02-02', 2, 300, 500, 300, 200, 15, 600, 400, '2026-04-08 12:57:17'),
(13, 'SpanishReader', 'spanish@gmail.com', 1, NULL, NULL, '2026-04-07 15:34:57', 'ed65190cd6fd74946839691e2e118669955382b18751dc21c96ee36b45cba157', '6f7890ab12345678f6789012345678ab', 'ES', NULL, 1, '2026-08-01 00:00:00', 'USER', '2025-04-20', '2026-02-05', 5, 100, 2000, 1000, 800, 50, 1800, 1200, '2026-04-08 12:57:17'),
(14, 'AussieViewer', 'aussie@gmail.com', 1, NULL, NULL, '2026-04-07 15:34:57', '7489e92e56b229e1abf6410a38d56ee8fda564cf362dca6f27e1ec82053deabc', 'd23456789012345673456789012345ef', 'AU', NULL, 0, NULL, 'USER', '2025-07-10', '2026-01-30', 3, 500, 800, 1500, 1200, 10, 700, 2000, '2026-04-08 12:57:17'),
(15, 'NoActivity', 'noactivity@gmail.com', 1, NULL, NULL, '2026-04-07 15:34:57', 'ad413c9a15af9c7fa559d833685aa8a4295270295c80ff79e69372808411a76a', 'e345678901234567845678901234567ab', 'HU', NULL, 0, NULL, 'USER', '2025-01-05', '2025-01-05', 1, 0, 0, 0, 0, 0, 0, 0, '2026-04-08 12:57:17'),
(16, 'PowerUser', 'poweruser@gmail.com', 1, NULL, NULL, '2026-04-07 15:34:57', 'ab14d07881b0bbc4ca71983b6c96e27501763f6644c82177b70731c21470bb22', '7890ab123456789067890123456789cd', 'HU', NULL, 1, '2027-12-31 23:59:59', 'BANNED', '2024-01-01', '2026-04-03', 15, 999, 10000, 8000, 7000, 365, 15000, 12000, '2026-04-08 12:57:17'),
(17, 'tts', 'tts@tts.com', 1, NULL, NULL, '2026-04-07 15:34:57', 'aaaf37aebd92d869f3751ae16488dfac309743d583e730e4e5ded90d6cd1f9f3', 'AglxÓŰtsj4jláVóT039dűbcőUSÜrŐzaAOaúSsÜ05CJK3EWlqDXmIDxuQWóvt2OtC', NULL, NULL, 0, NULL, 'BANNED', '2026-03-01', '2026-03-01', 1, 0, 0, 0, 0, 0, 0, 0, '2026-04-08 12:57:17'),
(18, 'kisaxev', 'test@stm.co', 1, NULL, NULL, '2026-04-07 15:36:19', '0aaef4a5d173d9955949f40c7d20e1b7976ff438f60de0e667720a4a262a9a4f', '3dBOWQ64CnXpRvHXCnla2u89byHwgK04bG7XevzgmSNjEWYVpASm2AqNA7O8jK7y', NULL, NULL, 0, NULL, 'USER', '2026-04-07', '2026-04-07', 1, 0, 0, 0, 0, 0, 0, 0, '2026-04-08 12:19:28'),
(19, 'vayimal', 'vayimal514@bpotogo.com', 1, NULL, NULL, '2026-04-07 15:45:29', '8081e369b60da468af1e9c27327bba1e5ebc0b71d1bb898867e1b6552574cdb7', 'eUul1WosYmCCrTSaCLLGEVw6tjpfyG2LYFZM8Y8zikBaS2xTcW4IazFiJwGjsjRW', NULL, NULL, 0, NULL, 'USER', '2026-04-07', '2026-04-08', 1, 150, 75, 0, 0, 0, 5, 0, '2026-04-08 13:34:45');

--
-- Eseményindítók `user`
--
DELIMITER $$
CREATE TRIGGER `after_user_insert` AFTER INSERT ON `user` FOR EACH ROW BEGIN
    -- Új user cache bejegyzés létrehozása
    
    INSERT INTO user_rank_cache (UserId, TotalPoints, BookPoints, MediaPoints)
    VALUES (
        NEW.Id,
        NEW.BookPoints + NEW.SeriesPoints + NEW.MoviePoints,
        NEW.BookPoints,
        NEW.SeriesPoints + NEW.MoviePoints
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_user_points_update` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    -- Ha változtak a pontok
    
    IF OLD.BookPoints != NEW.BookPoints 
       OR OLD.SeriesPoints != NEW.SeriesPoints 
       OR OLD.MoviePoints != NEW.MoviePoints THEN
        
        -- Csak a pontokat mentjük a cache-be
        
        INSERT INTO user_rank_cache (UserId, TotalPoints, BookPoints, MediaPoints)
        VALUES (
            NEW.Id,
            NEW.BookPoints + NEW.SeriesPoints + NEW.MoviePoints,
            NEW.BookPoints,
            NEW.SeriesPoints + NEW.MoviePoints
        )
        ON DUPLICATE KEY UPDATE
            TotalPoints = NEW.BookPoints + NEW.SeriesPoints + NEW.MoviePoints,
            BookPoints = NEW.BookPoints,
            MediaPoints = NEW.SeriesPoints + NEW.MoviePoints;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_user_premium_check` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    -- Ha prémium lett (0 → 1)
    IF OLD.Premium = 0 AND NEW.Premium = 1 THEN
        
        -- Ellenőrzi, hogy van-e friss sikeres vásárlás
        IF NOT EXISTS (
            SELECT 1 FROM `purchase` 
            WHERE UserId = NEW.Id 
              AND PurchaseStatus = 'SUCCESS'
              AND PurchaseDate >= NOW() - INTERVAL 5 MINUTE
        ) THEN
            -- GYANÚS: Prémium lett, de nincs vásárlás
            INSERT INTO `security_audit_log` (UserId, Action, Status, Details)
            VALUES (NEW.Id, 'PREMIUM_UPGRADE', 'SUSPICIOUS', 
                    CONCAT('Prémium státusz engedélyezve vásárlás nélkül. Szint: ', NEW.Level, ', Lejár: ', IFNULL(NEW.PremiumExpiresAt, 'NULL')));
        ELSE
            -- RENDBEN: Legális vásárlás
            INSERT INTO `security_audit_log` (UserId, Action, Status, Details)
            VALUES (NEW.Id, 'PREMIUM_UPGRADE', 'VERIFIED', 
                    CONCAT('Prémium vásárlás megerősítve. Lejár: ', NEW.PremiumExpiresAt));
        END IF;
        
    END IF;
    
    -- Ha prémium lejárt (1 → 0)
    IF OLD.Premium = 1 AND NEW.Premium = 0 THEN
        INSERT INTO `security_audit_log` (UserId, Action, Status, Details)
        VALUES (NEW.Id, 'PREMIUM_EXPIRED', 'VERIFIED', 
                CONCAT('Prémium lejárt. Utolsó lejárati dátum: ', IFNULL(OLD.PremiumExpiresAt, 'NULL')));
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_user_xp_update` BEFORE UPDATE ON `user` FOR EACH ROW BEGIN
    -- Ha az XP elérte vagy túllépte az 1000-et
    IF NEW.XP >= 1000 THEN
        -- Szintlépés számítása (hányszor van benne 1000)
        SET NEW.Level = NEW.Level + FLOOR(NEW.XP / 1000);
        
        -- XP maradék (modulo 1000)
        SET NEW.XP = NEW.XP % 1000;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_user_delete_mail_sender_fix` BEFORE DELETE ON `user` FOR EACH ROW BEGIN
IF OLD.Id <> 1 AND EXISTS (SELECT 1 FROM user WHERE Id = 1) THEN
UPDATE mail
SET SenderId = 1
WHERE SenderId = OLD.Id;
ELSE
DELETE FROM mail
WHERE SenderId = OLD.Id;
END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `deleting_user` AFTER DELETE ON `user` FOR EACH ROW BEGIN
INSERT INTO deleted_user (
Id, Username, Email, PasswordHash, PasswordSalt,
CountryCode, ProfilePic, Premium, PremiumExpiresAt, PermissionLevel,
CreationDate, LastLoginDate, Level, XP, BookPoints,
SeriesPoints, MoviePoints, DayStreak, ReadTimeMin, WatchTimeMin
)
VALUES (
OLD.Id,
OLD.Username,
CONCAT('deleted_', OLD.Id, '@anon.local'),
'',
'',
COALESCE(OLD.CountryCode, 'ZZ'),
IFNULL(OLD.ProfilePic, 0x64656661756c742e706e67),
OLD.Premium,
OLD.PremiumExpiresAt,
OLD.PermissionLevel,
OLD.CreationDate,
OLD.LastLoginDate,
OLD.Level,
OLD.XP,
OLD.BookPoints,
OLD.SeriesPoints,
OLD.MoviePoints,
OLD.DayStreak,
OLD.ReadTimeMin,
OLD.WatchTimeMin
);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_user_daily_streak_on_login` BEFORE UPDATE ON `user` FOR EACH ROW BEGIN
    IF NEW.LastLoginDate = CURDATE()
       AND (OLD.LastLoginDate IS NULL OR OLD.LastLoginDate < CURDATE()) THEN
        SET NEW.DayStreak = OLD.DayStreak + 1;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_badge`
--

CREATE TABLE `user_badge` (
  `UserId` int(11) NOT NULL,
  `BadgeId` int(11) NOT NULL,
  `EarnedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user_badge`
--

INSERT INTO `user_badge` (`UserId`, `BadgeId`, `EarnedAt`) VALUES
(2, 1, '2025-04-11 12:00:00'),
(2, 2, '2025-04-19 20:00:00'),
(2, 3, '2025-04-25 10:00:00'),
(2, 4, '2025-04-29 08:00:00'),
(2, 5, '2025-02-07 12:00:00'),
(2, 6, '2025-03-07 17:00:00'),
(2, 7, '2025-05-06 09:00:00'),
(2, 8, '2025-05-18 16:00:00'),
(2, 9, '2025-02-10 18:00:00'),
(2, 10, '2025-02-10 11:00:00'),
(2, 11, '2025-03-15 22:00:00'),
(4, 5, '2025-07-07 12:00:00'),
(4, 6, '2025-08-06 00:00:00'),
(4, 9, '2025-07-15 18:30:00'),
(5, 5, '2025-08-07 12:00:00'),
(5, 9, '2025-10-15 20:00:00'),
(6, 5, '2026-04-06 16:24:44'),
(6, 6, '2025-09-06 00:00:00'),
(6, 11, '2025-08-20 22:00:00'),
(7, 4, '2025-11-01 08:00:00'),
(7, 9, '2025-10-18 16:00:00'),
(13, 5, '2025-06-07 12:00:00'),
(13, 9, '2025-06-08 18:00:00'),
(16, 5, '2024-01-08 12:00:00'),
(16, 6, '2024-01-31 00:00:00'),
(16, 7, '2024-04-10 00:00:00'),
(16, 8, '2024-12-01 18:00:00'),
(16, 9, '2024-01-05 20:00:00'),
(16, 10, '2025-06-15 21:00:00'),
(16, 11, '2024-01-20 22:00:00');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_book`
--

CREATE TABLE `user_book` (
  `UserId` int(11) NOT NULL,
  `BookId` int(11) NOT NULL,
  `Status` enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED') DEFAULT NULL,
  `Favorite` tinyint(1) NOT NULL DEFAULT 0,
  `Rating` decimal(3,1) DEFAULT NULL,
  `AddedAt` datetime DEFAULT current_timestamp(),
  `CompletedAt` datetime DEFAULT NULL,
  `RemainingCompletions` int(11) NOT NULL DEFAULT 3,
  `LastSeen` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `CurrentPage` int(11) DEFAULT 0,
  `CurrentAudioPosition` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `user_book`
--

INSERT INTO `user_book` (`UserId`, `BookId`, `Status`, `Favorite`, `Rating`, `AddedAt`, `CompletedAt`, `RemainingCompletions`, `LastSeen`, `updated_at`, `CurrentPage`, `CurrentAudioPosition`) VALUES
(2, 1, 'COMPLETED', 1, 9.0, '2025-02-01 10:00:00', '2025-02-10 18:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 584, 0),
(2, 6, 'COMPLETED', 1, 9.5, '2025-03-01 09:00:00', '2025-03-08 20:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 328, 0),
(2, 9, 'WATCHING', 0, NULL, '2025-11-01 14:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 0, 5400),
(3, 3, 'WATCHING', 1, 9.0, '2025-05-01 10:00:00', '2025-05-10 19:00:00', 2, '2026-04-08 15:59:21', '2026-04-08 15:59:20', 0, 0),
(3, 17, 'WATCHING', 1, NULL, '2025-12-01 11:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 200, 0),
(4, 1, 'COMPLETED', 1, 9.5, '2025-07-01 10:00:00', '2025-07-15 18:30:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 584, 0),
(4, 3, 'WATCHING', 0, NULL, '2026-04-06 14:30:40', NULL, 0, '2026-04-08 15:22:23', '2026-04-08 15:22:23', 5, 0),
(4, 6, 'WATCHING', 1, 9.0, '2025-08-01 09:00:00', '2025-08-10 20:15:00', 2, '2026-04-06 15:03:30', '2026-04-06 15:03:30', 328, 0),
(4, 8, 'WATCHING', 0, NULL, '2025-09-01 14:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 234, 0),
(4, 13, 'WATCHING', 1, NULL, '2026-01-05 12:00:00', NULL, 3, '2026-04-06 15:13:59', '2026-04-06 15:13:58', 0, 0),
(4, 17, 'COMPLETED', 1, 8.5, '2025-10-01 11:00:00', '2025-10-20 19:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 432, 0),
(5, 11, 'COMPLETED', 0, 8.5, '2025-10-01 09:00:00', '2025-10-15 20:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 656, 0),
(6, 3, 'COMPLETED', 0, NULL, '2026-04-06 16:45:52', '2026-04-06 17:45:03', 2, '2026-04-07 15:18:06', '2026-04-07 15:18:06', 166, 0),
(6, 4, 'PLANNED', 0, NULL, '2026-04-06 17:09:49', NULL, 0, '2026-04-06 17:16:11', '2026-04-06 17:16:11', NULL, NULL),
(6, 7, 'WATCHING', 1, NULL, '2026-01-10 15:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 120, 0),
(6, 18, 'PLANNED', 0, NULL, '2026-02-01 09:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 0, 0),
(7, 2, 'COMPLETED', 0, 8.0, '2025-10-15 13:00:00', '2025-10-18 16:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 232, 0),
(7, 3, 'WATCHING', 0, NULL, '2026-04-06 16:15:42', NULL, 0, '2026-04-06 16:15:42', '2026-04-06 16:15:42', 0, 0),
(7, 7, 'WATCHING', 1, NULL, '2025-11-01 10:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 150, 0),
(7, 10, 'COMPLETED', 0, 9.0, '2025-12-01 08:00:00', '2025-12-01 12:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 96, 7200),
(8, 14, 'WATCHING', 0, NULL, '2025-12-20 11:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 95, 0),
(9, 7, 'WATCHING', 1, NULL, '2026-01-20 13:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 45, 0),
(10, 2, 'COMPLETED', 0, 7.5, '2024-08-01 14:00:00', '2024-08-05 16:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 232, 0),
(10, 19, 'PAUSED', 0, NULL, '2025-09-01 10:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 50, 0),
(11, 10, 'PLANNED', 0, NULL, '2026-01-20 11:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 0, 0),
(12, 8, 'WATCHING', 1, NULL, '2025-12-15 10:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 89, 0),
(13, 6, 'COMPLETED', 1, 9.0, '2025-06-01 10:00:00', '2025-06-08 18:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 328, 0),
(13, 15, 'WATCHING', 0, NULL, '2025-11-15 12:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 180, 0),
(14, 16, 'PLANNED', 0, NULL, '2026-01-25 14:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 0, 0),
(15, 7, 'PLANNED', 0, NULL, '2025-01-10 10:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 0, 0),
(16, 1, 'COMPLETED', 1, 10.0, '2024-03-01 10:00:00', '2024-03-05 20:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 584, 0),
(16, 2, 'COMPLETED', 1, 9.0, '2024-03-10 10:00:00', '2024-03-12 18:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 232, 0),
(16, 3, 'COMPLETED', 1, 9.5, '2024-04-01 09:00:00', '2024-04-05 21:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 368, 0),
(16, 4, 'COMPLETED', 0, 8.0, '2024-05-01 11:00:00', '2024-05-07 19:00:00', 1, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 312, 0),
(16, 5, 'COMPLETED', 0, 8.5, '2024-06-01 10:00:00', '2024-06-10 20:00:00', 1, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 424, 0),
(16, 6, 'COMPLETED', 1, 9.5, '2024-07-01 08:00:00', '2024-07-08 17:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 328, 0),
(16, 8, 'COMPLETED', 1, 10.0, '2024-08-01 09:00:00', '2024-08-15 22:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 423, 0),
(16, 13, 'COMPLETED', 1, 9.0, '2024-09-01 10:00:00', '2024-09-20 19:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 688, 0),
(19, 3, 'COMPLETED', 0, NULL, '2026-04-08 13:25:11', '2026-04-08 13:34:45', 2, '2026-04-08 13:34:45', '2026-04-08 13:34:45', 166, 0);

--
-- Eseményindítók `user_book`
--
DELIMITER $$
CREATE TRIGGER `after_user_book_complete` BEFORE UPDATE ON `user_book` FOR EACH ROW BEGIN
    DECLARE book_xp INT DEFAULT 0;
    DECLARE book_points INT DEFAULT 0;
    DECLARE book_total_pages INT DEFAULT 0;

    -- Once completed, do not allow downgrade through normal flow
    IF IFNULL(OLD.Status, '') = 'COMPLETED'
       AND IFNULL(NEW.Status, '') <> 'COMPLETED' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A COMPLETED statusz nem allithato vissza.';
    END IF;

    -- Completion requires full reading progress
    IF IFNULL(OLD.Status, '') <> 'COMPLETED'
       AND IFNULL(NEW.Status, '') = 'COMPLETED' THEN

        SELECT PageNum, RewardXP, RewardPoints
          INTO book_total_pages, book_xp, book_points
          FROM book
         WHERE Id = NEW.BookId;

        IF IFNULL(NEW.CurrentPage, 0) < IFNULL(book_total_pages, 0) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Konyv csak teljes elorehaladas eseten jelolheto COMPLETED-re.';
        END IF;

        IF OLD.CompletedAt IS NULL THEN
            SET NEW.CompletedAt = NOW();

            IF NEW.RemainingCompletions > 0 THEN
                SET NEW.RemainingCompletions = NEW.RemainingCompletions - 1;

                UPDATE user
                SET
                    XP = XP + book_xp,
                    BookPoints = BookPoints + book_points
                WHERE Id = NEW.UserId;
            END IF;
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_challenge`
--

CREATE TABLE `user_challenge` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `ChallengeId` int(11) NOT NULL,
  `CurrentValue` int(11) NOT NULL DEFAULT 0,
  `Status` enum('NOT_STARTED','IN_PROGRESS','COMPLETED','CLAIMED') NOT NULL DEFAULT 'NOT_STARTED',
  `StartedAt` datetime DEFAULT NULL,
  `CompletedAt` datetime DEFAULT NULL,
  `ClaimedAt` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user_challenge`
--

INSERT INTO `user_challenge` (`Id`, `UserId`, `ChallengeId`, `CurrentValue`, `Status`, `StartedAt`, `CompletedAt`, `ClaimedAt`, `updated_at`) VALUES
(1, 16, 1, 5, 'CLAIMED', '2024-01-01 10:00:00', '2024-01-10 18:00:00', '2024-01-10 18:05:00', '2026-02-05 20:46:10'),
(2, 16, 2, 10, 'CLAIMED', '2024-02-01 10:00:00', '2024-02-20 20:00:00', '2024-02-20 20:10:00', '2026-02-05 20:46:10'),
(3, 16, 3, 3, 'CLAIMED', '2024-03-01 10:00:00', '2024-03-25 22:00:00', '2024-03-25 22:15:00', '2026-02-05 20:46:10'),
(4, 16, 7, 30, 'CLAIMED', '2024-01-01 00:00:00', '2024-01-30 23:59:59', '2024-01-31 10:00:00', '2026-02-05 20:46:10'),
(5, 4, 1, 5, 'CLAIMED', '2025-07-01 10:00:00', '2025-10-20 19:00:00', '2026-03-05 10:31:02', '2026-03-05 10:31:02'),
(6, 4, 4, 1000, 'CLAIMED', '2025-06-01 09:00:00', '2026-04-08 13:45:57', '2026-04-08 13:46:53', '2026-04-08 13:46:53'),
(7, 5, 2, 8, 'IN_PROGRESS', '2025-08-01 10:00:00', NULL, NULL, '2026-02-05 20:46:10'),
(8, 5, 5, 320, 'COMPLETED', '2025-11-15 18:00:00', '2025-11-17 21:00:00', NULL, '2026-02-05 20:46:10'),
(9, 6, 3, 3, 'CLAIMED', '2025-08-01 10:00:00', '2025-11-05 22:00:00', '2026-04-05 19:39:06', '2026-04-05 19:39:06'),
(10, 6, 6, 7, 'CLAIMED', '2025-08-01 00:00:00', '2025-08-07 23:59:59', '2026-04-06 16:24:44', '2026-04-06 16:24:44'),
(11, 7, 1, 2, 'IN_PROGRESS', '2025-10-15 10:00:00', NULL, NULL, '2026-02-05 20:46:10'),
(12, 8, 2, 3, 'IN_PROGRESS', '2025-11-01 10:00:00', NULL, NULL, '2026-04-08 14:09:00'),
(13, 2, 1, 5, 'CLAIMED', '2025-02-01 10:00:00', '2025-02-15 18:00:00', '2025-02-15 18:10:00', '2026-02-05 20:46:10'),
(14, 2, 6, 7, 'CLAIMED', '2025-03-01 00:00:00', '2025-03-07 23:59:59', '2025-03-08 09:00:00', '2026-02-05 20:46:10'),
(15, 3, 1, 0, 'NOT_STARTED', '2025-05-01 10:00:00', NULL, NULL, '2026-04-08 15:59:20'),
(16, 3, 5, 300, 'COMPLETED', '2025-11-01 18:00:00', '2026-04-08 15:22:50', NULL, '2026-04-08 15:22:50'),
(17, 13, 1, 4, 'IN_PROGRESS', '2025-06-01 10:00:00', NULL, NULL, '2026-02-05 20:46:10'),
(18, 13, 6, 7, 'COMPLETED', '2025-10-01 00:00:00', '2025-10-07 23:59:59', NULL, '2026-02-05 20:46:10'),
(19, 14, 2, 6, 'IN_PROGRESS', '2025-09-15 10:00:00', NULL, NULL, '2026-02-05 20:46:10'),
(20, 14, 5, 200, 'IN_PROGRESS', '2025-12-01 18:00:00', NULL, NULL, '2026-02-05 20:46:10'),
(21, 9, 1, 0, 'NOT_STARTED', NULL, NULL, NULL, '2026-02-05 20:46:10'),
(22, 10, 1, 1, 'IN_PROGRESS', '2024-08-01 10:00:00', NULL, NULL, '2026-02-05 20:46:10'),
(23, 12, 1, 2, 'IN_PROGRESS', '2025-12-01 10:00:00', NULL, NULL, '2026-02-05 20:46:10'),
(24, 19, 4, 5, 'IN_PROGRESS', '2026-04-08 13:11:15', NULL, NULL, '2026-04-08 13:29:13'),
(25, 19, 1, 1, 'IN_PROGRESS', '2026-04-08 13:18:35', NULL, NULL, '2026-04-08 13:34:45'),
(26, 4, 5, 300, 'COMPLETED', '2026-04-08 13:45:57', '2026-04-08 13:45:57', NULL, '2026-04-08 13:45:57'),
(27, 4, 6, 7, 'COMPLETED', '2026-04-08 13:45:57', '2026-04-08 13:45:57', NULL, '2026-04-08 13:45:57'),
(28, 4, 7, 30, 'COMPLETED', '2026-04-08 13:45:57', '2026-04-08 13:45:57', NULL, '2026-04-08 13:45:57'),
(29, 8, 4, 500, 'IN_PROGRESS', '2026-04-08 14:09:00', NULL, NULL, '2026-04-08 14:09:00'),
(30, 8, 5, 300, 'COMPLETED', '2026-04-08 14:09:00', '2026-04-08 14:09:00', NULL, '2026-04-08 14:09:00'),
(31, 8, 6, 7, 'COMPLETED', '2026-04-08 14:09:00', '2026-04-08 14:09:00', NULL, '2026-04-08 14:09:00'),
(32, 8, 7, 20, 'IN_PROGRESS', '2026-04-08 14:09:00', NULL, NULL, '2026-04-08 14:09:00'),
(33, 7, 4, 1000, 'COMPLETED', '2026-04-08 14:12:18', '2026-04-08 14:12:18', NULL, '2026-04-08 14:12:18'),
(34, 7, 5, 300, 'COMPLETED', '2026-04-08 14:12:18', '2026-04-08 14:12:18', NULL, '2026-04-08 14:12:18'),
(35, 7, 6, 7, 'COMPLETED', '2026-04-08 14:12:18', '2026-04-08 14:12:18', NULL, '2026-04-08 14:12:18'),
(36, 7, 7, 30, 'COMPLETED', '2026-04-08 14:12:18', '2026-04-08 14:12:18', NULL, '2026-04-08 14:12:18'),
(37, 9, 4, 100, 'IN_PROGRESS', '2026-04-08 14:19:16', NULL, NULL, '2026-04-08 14:19:16'),
(38, 9, 5, 50, 'IN_PROGRESS', '2026-04-08 14:19:16', NULL, NULL, '2026-04-08 14:19:16'),
(39, 9, 6, 3, 'IN_PROGRESS', '2026-04-08 14:19:16', NULL, NULL, '2026-04-08 14:19:16'),
(40, 9, 7, 3, 'IN_PROGRESS', '2026-04-08 14:19:16', NULL, NULL, '2026-04-08 14:19:16'),
(41, 10, 4, 400, 'IN_PROGRESS', '2026-04-08 14:20:28', NULL, NULL, '2026-04-08 14:20:28'),
(42, 10, 5, 300, 'COMPLETED', '2026-04-08 14:20:28', '2026-04-08 14:20:28', NULL, '2026-04-08 14:20:28'),
(43, 11, 4, 80, 'IN_PROGRESS', '2026-04-08 14:36:43', NULL, NULL, '2026-04-08 14:36:43'),
(44, 11, 5, 40, 'IN_PROGRESS', '2026-04-08 14:36:43', NULL, NULL, '2026-04-08 14:36:43'),
(45, 11, 6, 1, 'IN_PROGRESS', '2026-04-08 14:37:39', NULL, NULL, '2026-04-08 14:37:39'),
(46, 11, 7, 1, 'IN_PROGRESS', '2026-04-08 14:37:39', NULL, NULL, '2026-04-08 14:37:39'),
(47, 3, 4, 1000, 'COMPLETED', '2026-04-08 15:22:50', '2026-04-08 15:22:50', NULL, '2026-04-08 15:22:50'),
(48, 3, 6, 7, 'COMPLETED', '2026-04-08 15:22:50', '2026-04-08 15:22:50', NULL, '2026-04-08 15:22:50'),
(49, 3, 7, 30, 'COMPLETED', '2026-04-08 15:22:50', '2026-04-08 15:22:50', NULL, '2026-04-08 15:22:50'),
(50, 2, 2, 2, 'IN_PROGRESS', '2026-04-08 16:02:01', NULL, NULL, '2026-04-08 16:02:01'),
(51, 2, 3, 1, 'IN_PROGRESS', '2026-04-08 16:02:01', NULL, NULL, '2026-04-08 16:02:01'),
(52, 2, 4, 1000, 'COMPLETED', '2026-04-08 16:02:01', '2026-04-08 16:02:01', NULL, '2026-04-08 16:02:01'),
(53, 2, 5, 300, 'COMPLETED', '2026-04-08 16:02:01', '2026-04-08 16:02:01', NULL, '2026-04-08 16:02:01'),
(54, 2, 7, 30, 'COMPLETED', '2026-04-08 16:02:01', '2026-04-08 16:02:01', NULL, '2026-04-08 16:02:01');

--
-- Eseményindítók `user_challenge`
--
DELIMITER $$
CREATE TRIGGER `after_challenge_claim` BEFORE UPDATE ON `user_challenge` FOR EACH ROW BEGIN
    DECLARE challenge_xp INT DEFAULT 0;
    DECLARE challenge_badge_id INT DEFAULT NULL;
    DECLARE challenge_title_id INT DEFAULT NULL;
    
    -- ✅ Ha ClaimedAt most lett beállítva (NULL → NOT NULL)
    -- ÉS a Status COMPLETED (tehát tényleg teljesítette)
    IF OLD.ClaimedAt IS NULL 
       AND NEW.ClaimedAt IS NOT NULL 
       AND OLD.Status = 'COMPLETED' THEN
        
        -- ✅ Status frissítése CLAIMED-re
        SET NEW.Status = 'CLAIMED';
        
        -- ✅ Kihívás jutalmainak lekérése
        SELECT 
            RewardXP,
            RewardBadgeId,
            RewardTitleId
        INTO 
            challenge_xp,
            challenge_badge_id,
            challenge_title_id
        FROM challenge
        WHERE Id = NEW.ChallengeId;
        
        -- ✅ User XP frissítése
        IF challenge_xp > 0 THEN
            UPDATE user
            SET XP = XP + challenge_xp
            WHERE Id = NEW.UserId;
        END IF;
        
        -- ✅ Badge hozzáadása (ha van)
        IF challenge_badge_id IS NOT NULL THEN
            INSERT IGNORE INTO user_badge (UserId, BadgeId, EarnedAt)
            VALUES (NEW.UserId, challenge_badge_id, NOW());
        END IF;
        
        -- ✅ Title hozzáadása (ha van)
        IF challenge_title_id IS NOT NULL THEN
            INSERT IGNORE INTO user_title (UserId, TitleId, EarnedAt, IsActive)
            VALUES (NEW.UserId, challenge_title_id, NOW(), 0);
        END IF;
        
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_movie`
--

CREATE TABLE `user_movie` (
  `UserId` int(11) NOT NULL,
  `MovieId` int(11) NOT NULL,
  `Status` enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED') DEFAULT NULL,
  `Favorite` tinyint(1) NOT NULL DEFAULT 0,
  `Rating` decimal(3,1) DEFAULT NULL,
  `AddedAt` datetime DEFAULT current_timestamp(),
  `CompletedAt` datetime DEFAULT NULL,
  `RemainingCompletions` int(11) NOT NULL DEFAULT 3,
  `LastSeen` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `CurrentPosition` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `user_movie`
--

INSERT INTO `user_movie` (`UserId`, `MovieId`, `Status`, `Favorite`, `Rating`, `AddedAt`, `CompletedAt`, `RemainingCompletions`, `LastSeen`, `updated_at`, `CurrentPosition`) VALUES
(2, 1, 'COMPLETED', 1, 9.0, '2025-04-01 19:00:00', '2025-04-01 21:35:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 9120),
(2, 13, 'COMPLETED', 1, 8.0, '2025-06-15 20:00:00', '2025-06-15 21:50:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 6300),
(4, 10, 'WATCHING', 1, 9.0, '2025-12-20 18:00:00', '2025-12-20 20:10:00', 2, '2026-04-06 15:16:07', '2026-04-06 15:16:06', 7500),
(4, 11, 'WATCHING', 0, NULL, '2026-04-06 15:03:22', NULL, 0, '2026-04-06 15:16:10', '2026-04-06 15:16:09', 0),
(5, 1, 'COMPLETED', 1, 9.5, '2025-08-01 19:00:00', '2025-08-01 21:35:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 9120),
(5, 2, 'COMPLETED', 1, 9.0, '2025-08-05 20:00:00', '2025-08-05 22:30:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 8880),
(5, 4, 'WATCHING', 0, NULL, '2026-01-15 20:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 4800),
(5, 8, 'COMPLETED', 1, 9.0, '2025-09-01 18:00:00', '2025-09-01 21:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 10140),
(5, 9, 'COMPLETED', 1, 8.5, '2025-09-10 19:00:00', '2025-09-10 21:20:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 8160),
(6, 5, 'COMPLETED', 1, 8.0, '2025-10-10 19:00:00', '2025-10-10 21:25:00', 2, '2026-04-06 17:16:27', '2026-04-06 17:16:27', 8520),
(7, 11, 'WATCHING', 1, 8.0, '2025-12-05 17:00:00', '2025-12-05 18:25:00', 2, '2026-04-06 16:16:39', '2026-04-06 16:16:39', 4860),
(8, 3, 'COMPLETED', 0, 8.0, '2025-11-05 19:30:00', '2025-11-05 21:30:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 7200),
(8, 6, 'COMPLETED', 1, 8.5, '2025-11-20 18:00:00', '2025-11-20 19:45:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 5940),
(8, 11, 'COMPLETED', 0, 7.5, '2025-12-10 17:00:00', '2025-12-10 18:25:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 4860),
(8, 15, 'WATCHING', 1, NULL, '2026-01-20 19:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 3000),
(9, 15, 'PLANNED', 0, NULL, '2026-01-25 18:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 0),
(10, 14, 'PAUSED', 0, NULL, '2025-08-20 20:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 3000),
(12, 9, 'WATCHING', 1, NULL, '2026-01-10 19:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 5000),
(13, 6, 'COMPLETED', 1, 8.5, '2025-11-01 19:00:00', '2025-11-01 20:45:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 5940),
(14, 7, 'COMPLETED', 0, 7.5, '2025-09-15 20:00:00', '2025-09-15 21:55:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 6780),
(14, 12, 'COMPLETED', 0, 8.0, '2025-10-20 19:00:00', '2025-10-20 21:30:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 8760),
(14, 15, 'WATCHING', 1, NULL, '2026-02-01 18:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 2500),
(16, 1, 'COMPLETED', 1, 10.0, '2024-02-01 19:00:00', '2024-02-01 21:35:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 9120),
(16, 2, 'COMPLETED', 1, 9.5, '2024-02-10 20:00:00', '2024-02-10 22:30:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 8880),
(16, 4, 'COMPLETED', 1, 9.0, '2024-03-01 18:00:00', '2024-03-01 20:25:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 8520),
(16, 8, 'COMPLETED', 1, 9.5, '2024-04-01 19:00:00', '2024-04-01 22:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 10140),
(16, 9, 'COMPLETED', 1, 9.0, '2024-05-01 20:00:00', '2024-05-01 22:20:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 8160);

--
-- Eseményindítók `user_movie`
--
DELIMITER $$
CREATE TRIGGER `after_user_movie_complete` BEFORE UPDATE ON `user_movie` FOR EACH ROW BEGIN
    DECLARE movie_xp INT;
    DECLARE movie_points INT;
    
    IF OLD.Status != 'COMPLETED' 
       AND NEW.Status = 'COMPLETED' 
       AND NEW.RemainingCompletions > 0 THEN
        
        IF OLD.CompletedAt IS NULL THEN
            SET NEW.CompletedAt = NOW();
        END IF;
        
        SET NEW.RemainingCompletions = NEW.RemainingCompletions - 1;
        
        SELECT RewardXP, RewardPoints INTO movie_xp, movie_points
        FROM movie
        WHERE Id = NEW.MovieId;
        
        UPDATE user
        SET 
            XP = XP + movie_xp,
            MoviePoints = MoviePoints + movie_points
        WHERE Id = NEW.UserId;
        
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_rank_cache`
--

CREATE TABLE `user_rank_cache` (
  `UserId` int(11) NOT NULL,
  `TotalPoints` int(11) NOT NULL DEFAULT 0,
  `BookPoints` int(11) NOT NULL DEFAULT 0,
  `MediaPoints` int(11) NOT NULL DEFAULT 0,
  `GlobalRank_Total` int(11) DEFAULT NULL,
  `CountryRank_Total` int(11) DEFAULT NULL,
  `GlobalRank_Book` int(11) DEFAULT NULL,
  `CountryRank_Book` int(11) DEFAULT NULL,
  `GlobalRank_Media` int(11) DEFAULT NULL,
  `CountryRank_Media` int(11) DEFAULT NULL,
  `LastUpdated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user_rank_cache`
--

INSERT INTO `user_rank_cache` (`UserId`, `TotalPoints`, `BookPoints`, `MediaPoints`, `GlobalRank_Total`, `CountryRank_Total`, `GlobalRank_Book`, `CountryRank_Book`, `GlobalRank_Media`, `CountryRank_Media`, `LastUpdated`) VALUES
(1, 0, 0, 0, 16, 9, 16, 9, 15, 9, '2026-04-08 13:47:02'),
(2, 10000, 5000, 5000, 2, 2, 2, 2, 4, 3, '2026-04-08 12:47:02'),
(3, 5000, 2500, 2500, 6, 5, 4, 4, 8, 5, '2026-04-08 12:47:02'),
(4, 7500, 4200, 3300, 4, 3, 3, 3, 5, 4, '2026-04-08 12:47:02'),
(5, 7500, 1800, 5700, 5, 4, 7, 5, 3, 2, '2026-04-08 12:47:02'),
(6, 8875, 2175, 6700, 3, 1, 5, 1, 2, 1, '2026-04-06 17:45:03'),
(7, 2900, 1500, 1400, 10, 6, 8, 6, 10, 6, '2026-04-08 12:47:02'),
(8, 3300, 600, 2700, 9, 1, 10, 1, 6, 1, '2026-02-05 20:46:10'),
(9, 180, 100, 80, 13, 1, 13, 1, 13, 1, '2026-02-05 20:46:10'),
(10, 650, 300, 350, 12, 7, 12, 7, 12, 7, '2026-04-08 12:47:02'),
(11, 100, 50, 50, 14, 8, 15, 8, 14, 8, '2026-04-08 13:47:02'),
(12, 1000, 500, 500, 11, 1, 11, 1, 11, 1, '2026-02-05 20:46:10'),
(13, 3800, 2000, 1800, 7, 1, 6, 1, 9, 1, '2026-02-05 20:46:10'),
(14, 3500, 800, 2700, 8, 1, 9, 1, 7, 1, '2026-02-05 20:46:10'),
(15, 0, 0, 0, 17, 10, 17, 10, 16, 10, '2026-04-08 13:47:02'),
(16, 25000, 10000, 15000, 1, 1, 1, 1, 1, 1, '2026-02-05 20:46:10'),
(17, 0, 0, 0, 18, 1, 18, 1, 17, 1, '2026-04-08 13:47:02'),
(18, 0, 0, 0, 19, 1, 19, 1, 18, 1, '2026-04-08 13:47:02'),
(19, 75, 75, 0, 15, 1, 14, 1, 19, 1, '2026-04-08 13:47:02');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_series`
--

CREATE TABLE `user_series` (
  `UserId` int(11) NOT NULL,
  `SeriesId` int(11) NOT NULL,
  `Status` enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED') DEFAULT NULL,
  `Favorite` tinyint(1) NOT NULL DEFAULT 0,
  `Rating` decimal(3,1) DEFAULT NULL,
  `AddedAt` datetime DEFAULT current_timestamp(),
  `CompletedAt` datetime DEFAULT NULL,
  `RemainingCompletions` int(11) NOT NULL DEFAULT 3,
  `LastSeen` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `CurrentSeason` int(11) DEFAULT 1,
  `CurrentEpisode` int(11) DEFAULT 1,
  `CurrentPosition` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user_series`
--

INSERT INTO `user_series` (`UserId`, `SeriesId`, `Status`, `Favorite`, `Rating`, `AddedAt`, `CompletedAt`, `RemainingCompletions`, `LastSeen`, `updated_at`, `CurrentSeason`, `CurrentEpisode`, `CurrentPosition`) VALUES
(2, 1, 'COMPLETED', 1, 9.5, '2025-03-01 18:00:00', '2025-03-15 22:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 7, 2880),
(2, 8, 'WATCHING', 0, NULL, '2025-12-01 19:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 2, 900),
(3, 3, 'WATCHING', 1, NULL, '2025-11-15 20:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 4, 2000),
(4, 1, 'WATCHING', 0, NULL, '2026-04-06 15:33:53', NULL, 0, '2026-04-06 15:33:53', '2026-04-06 15:33:53', 1, 1, 0),
(4, 5, 'WATCHING', 1, NULL, '2026-01-05 19:00:00', NULL, 3, '2026-04-06 15:14:12', '2026-04-06 15:14:11', 1, 1, 3000),
(5, 3, 'WATCHING', 0, NULL, '2025-12-15 19:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 3, 1200),
(6, 1, 'COMPLETED', 1, 9.5, '2025-08-01 18:00:00', '2025-08-20 22:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 7, 2880),
(6, 2, 'COMPLETED', 1, 9.0, '2025-09-01 19:00:00', '2025-10-15 23:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 10, 3180),
(6, 3, 'WATCHING', 1, NULL, '2026-01-10 20:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 5, 1800),
(6, 5, 'COMPLETED', 1, 9.0, '2025-11-01 18:00:00', '2025-11-05 22:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 3, 5400),
(7, 4, 'WATCHING', 0, NULL, '2025-12-20 18:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 3, 900),
(8, 6, 'PLANNED', 0, NULL, '2026-02-01 19:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 1, 0),
(9, 7, 'PLANNED', 1, NULL, '2026-01-28 18:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 1, 0),
(10, 8, 'PAUSED', 0, NULL, '2025-07-01 19:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 1, 600),
(12, 3, 'WATCHING', 1, NULL, '2026-01-15 20:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 2, 1500),
(13, 7, 'COMPLETED', 1, 9.0, '2025-09-01 17:00:00', '2025-09-06 20:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 5, 1440),
(14, 4, 'COMPLETED', 1, 9.0, '2025-10-01 18:00:00', '2025-10-03 21:00:00', 2, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 6, 1380),
(14, 6, 'WATCHING', 0, NULL, '2026-01-20 20:00:00', NULL, 3, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 2, 1800),
(16, 1, 'COMPLETED', 1, 10.0, '2024-01-01 18:00:00', '2024-01-15 22:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 7, 2880),
(16, 2, 'COMPLETED', 1, 9.5, '2024-02-01 19:00:00', '2024-03-01 23:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 10, 3180),
(16, 3, 'COMPLETED', 1, 9.0, '2024-04-01 20:00:00', '2024-04-10 22:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 8, 3300),
(16, 4, 'COMPLETED', 1, 9.5, '2024-05-01 18:00:00', '2024-05-08 21:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 6, 1380),
(16, 7, 'COMPLETED', 1, 9.0, '2024-06-01 17:00:00', '2024-06-07 20:00:00', 0, '2026-02-05 20:46:10', '2026-02-05 20:46:10', 1, 5, 1440);

--
-- Eseményindítók `user_series`
--
DELIMITER $$
CREATE TRIGGER `after_user_series_complete` BEFORE UPDATE ON `user_series` FOR EACH ROW BEGIN
    DECLARE series_xp INT;
    DECLARE series_points INT;
    
    IF OLD.Status != 'COMPLETED' 
       AND NEW.Status = 'COMPLETED' 
       AND NEW.RemainingCompletions > 0 THEN
        
        IF OLD.CompletedAt IS NULL THEN
            SET NEW.CompletedAt = NOW();
        END IF;
        
        SET NEW.RemainingCompletions = NEW.RemainingCompletions - 1;
        
        SELECT RewardXP, RewardPoints INTO series_xp, series_points
        FROM series
        WHERE Id = NEW.SeriesId;
        
        UPDATE user
        SET 
            XP = XP + series_xp,
            SeriesPoints = SeriesPoints + series_points
        WHERE Id = NEW.UserId;
        
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_title`
--

CREATE TABLE `user_title` (
  `UserId` int(11) NOT NULL,
  `TitleId` int(11) NOT NULL,
  `EarnedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `IsActive` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user_title`
--

INSERT INTO `user_title` (`UserId`, `TitleId`, `EarnedAt`, `IsActive`) VALUES
(2, 1, '2025-01-02 10:00:00', 1),
(2, 2, '2025-01-14 22:00:00', 1),
(2, 3, '2026-01-01 14:00:00', 1),
(2, 4, '2025-01-20 16:00:00', 1),
(4, 1, '2026-04-08 13:46:53', 1),
(4, 3, '2026-01-01 00:00:00', 1),
(5, 4, '2025-12-01 20:00:00', 1),
(6, 2, '2025-11-05 22:15:00', 1),
(13, 3, '2026-01-01 00:00:00', 1),
(16, 1, '2024-12-01 18:00:00', 1),
(16, 2, '2024-03-25 22:15:00', 0),
(16, 3, '2025-01-01 00:00:00', 0),
(16, 4, '2024-10-15 19:00:00', 0);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `age_rating`
--
ALTER TABLE `age_rating`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Name` (`Name`);

--
-- A tábla indexei `article`
--
ALTER TABLE `article`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_article_event_tag` (`EventTag`),
  ADD KEY `idx_article_created` (`CreatedAt`);

--
-- A tábla indexei `badge`
--
ALTER TABLE `badge`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_badge_category` (`Category`);

--
-- A tábla indexei `book`
--
ALTER TABLE `book`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `CoverApiName` (`CoverApiName`),
  ADD KEY `AgeRatingId` (`AgeRatingId`),
  ADD KEY `idx_book_type` (`Type`),
  ADD KEY `idx_book_released` (`Released`),
  ADD KEY `idx_book_rating` (`Rating`),
  ADD KEY `idx_book_language` (`OriginalLanguage`),
  ADD KEY `idx_book_offline` (`IsOfflineAvailable`);

--
-- A tábla indexei `book_tag`
--
ALTER TABLE `book_tag`
  ADD PRIMARY KEY (`BookId`,`TagId`),
  ADD KEY `TagId` (`TagId`),
  ADD KEY `idx_book_tag_tag_book` (`TagId`,`BookId`);

--
-- A tábla indexei `challenge`
--
ALTER TABLE `challenge`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_type_active` (`Type`,`IsActive`),
  ADD KEY `idx_user_challenge_active_difficulty` (`IsActive`,`Difficulty`),
  ADD KEY `challenge_badge_fk` (`RewardBadgeId`),
  ADD KEY `challenge_title_fk` (`RewardTitleId`);

--
-- A tábla indexei `deleted_user`
--
ALTER TABLE `deleted_user`
  ADD PRIMARY KEY (`Id`);

--
-- A tábla indexei `episode`
--
ALTER TABLE `episode`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `unique_series_season_episode` (`SeriesId`,`SeasonNum`,`EpisodeNum`),
  ADD KEY `SeriesId` (`SeriesId`);

--
-- A tábla indexei `mail`
--
ALTER TABLE `mail`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `ReceiverId` (`ReceiverId`),
  ADD KEY `SenderId` (`SenderId`),
  ADD KEY `idx_mail_receiver_read` (`ReceiverId`,`IsRead`),
  ADD KEY `idx_mail_created` (`CreatedAt`);

--
-- A tábla indexei `movie`
--
ALTER TABLE `movie`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `PosterApiName` (`PosterApiName`),
  ADD UNIQUE KEY `StreamURL` (`StreamURL`),
  ADD KEY `AgeRatingId` (`AgeRatingId`),
  ADD KEY `idx_movie_released` (`Released`),
  ADD KEY `idx_movie_rating` (`Rating`),
  ADD KEY `idx_movie_subtitle_language` (`HasSubtitles`,`IsOriginalLanguage`),
  ADD KEY `idx_movie_offline` (`IsOfflineAvailable`);

--
-- A tábla indexei `movie_tag`
--
ALTER TABLE `movie_tag`
  ADD PRIMARY KEY (`MovieId`,`TagId`),
  ADD KEY `TagId` (`TagId`),
  ADD KEY `idx_movie_tag_tag_movie` (`TagId`,`MovieId`);

--
-- A tábla indexei `purchase`
--
ALTER TABLE `purchase`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `UserId` (`UserId`),
  ADD KEY `idx_purchase_user_date` (`UserId`,`PurchaseDate`),
  ADD KEY `idx_purchase_status` (`PurchaseStatus`),
  ADD KEY `idx_purchase_updated` (`updated_at`);

--
-- A tábla indexei `security_audit_log`
--
ALTER TABLE `security_audit_log`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_security_audit_user` (`UserId`),
  ADD KEY `idx_security_audit_action` (`Action`),
  ADD KEY `idx_security_audit_created` (`CreatedAt`);

--
-- A tábla indexei `series`
--
ALTER TABLE `series`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `PosterApiName` (`PosterApiName`),
  ADD KEY `AgeRatingId` (`AgeRatingId`),
  ADD KEY `idx_series_released` (`Released`),
  ADD KEY `idx_series_rating` (`Rating`),
  ADD KEY `idx_series_subtitles_language` (`HasSubtitles`,`IsOriginalLanguage`),
  ADD KEY `idx_series_offline` (`IsOfflineAvailable`);

--
-- A tábla indexei `series_tag`
--
ALTER TABLE `series_tag`
  ADD PRIMARY KEY (`SeriesId`,`TagId`),
  ADD KEY `TagId` (`TagId`),
  ADD KEY `idx_series_tag_tag_series` (`TagId`,`SeriesId`);

--
-- A tábla indexei `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `unique_tag_name` (`Name`);

--
-- A tábla indexei `title`
--
ALTER TABLE `title`
  ADD PRIMARY KEY (`Id`);

--
-- A tábla indexei `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `idx_user_creation_date` (`CreationDate`),
  ADD KEY `idx_user_last_login` (`LastLoginDate`),
  ADD KEY `idx_user_premium` (`Premium`),
  ADD KEY `idx_user_updated` (`updated_at`),
  ADD KEY `idx_user_premium_expires` (`PremiumExpiresAt`);

--
-- A tábla indexei `user_badge`
--
ALTER TABLE `user_badge`
  ADD PRIMARY KEY (`UserId`,`BadgeId`),
  ADD KEY `BadgeId` (`BadgeId`);

--
-- A tábla indexei `user_book`
--
ALTER TABLE `user_book`
  ADD PRIMARY KEY (`UserId`,`BookId`),
  ADD KEY `BookId` (`BookId`),
  ADD KEY `idx_user_book_status` (`Status`),
  ADD KEY `idx_user_book_favorite` (`Favorite`),
  ADD KEY `idx_user_book_added` (`AddedAt`),
  ADD KEY `idx_user_book_user_status` (`UserId`,`Status`),
  ADD KEY `idx_user_book_user_favorite` (`UserId`,`Favorite`),
  ADD KEY `idx_user_book_user_lastseen` (`UserId`,`LastSeen`);

--
-- A tábla indexei `user_challenge`
--
ALTER TABLE `user_challenge`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `user_challenge_unique` (`UserId`,`ChallengeId`),
  ADD KEY `UserId` (`UserId`),
  ADD KEY `ChallengeId` (`ChallengeId`),
  ADD KEY `idx_status` (`Status`),
  ADD KEY `idx_user_challenge_user_status` (`UserId`,`Status`),
  ADD KEY `idx_user_challenge_user_updated` (`UserId`);

--
-- A tábla indexei `user_movie`
--
ALTER TABLE `user_movie`
  ADD PRIMARY KEY (`UserId`,`MovieId`),
  ADD KEY `MovieId` (`MovieId`),
  ADD KEY `idx_user_movie_status` (`Status`),
  ADD KEY `idx_user_movie_favorite` (`Favorite`),
  ADD KEY `idx_user_movie_added` (`AddedAt`),
  ADD KEY `idx_user_movie_user_status` (`UserId`,`Status`),
  ADD KEY `idx_user_movie_user_favorite` (`UserId`,`Favorite`),
  ADD KEY `idx_user_movie_user_lastseen` (`UserId`,`LastSeen`);

--
-- A tábla indexei `user_rank_cache`
--
ALTER TABLE `user_rank_cache`
  ADD PRIMARY KEY (`UserId`),
  ADD KEY `idx_global_rank_total` (`GlobalRank_Total`),
  ADD KEY `idx_country_rank_total` (`CountryRank_Total`),
  ADD KEY `idx_global_rank_book` (`GlobalRank_Book`),
  ADD KEY `idx_country_rank_book` (`CountryRank_Book`),
  ADD KEY `idx_global_rank_media` (`GlobalRank_Media`),
  ADD KEY `idx_country_rank_media` (`CountryRank_Media`),
  ADD KEY `idx_total_points` (`TotalPoints`);

--
-- A tábla indexei `user_series`
--
ALTER TABLE `user_series`
  ADD PRIMARY KEY (`UserId`,`SeriesId`),
  ADD KEY `SeriesId` (`SeriesId`),
  ADD KEY `idx_user_series_status` (`Status`),
  ADD KEY `idx_user_series_favorite` (`Favorite`),
  ADD KEY `idx_user_series_added` (`AddedAt`),
  ADD KEY `idx_user_series_user_status` (`UserId`,`Status`),
  ADD KEY `idx_user_series_user_favorite` (`UserId`,`Favorite`),
  ADD KEY `idx_user_series_user_lastseen` (`UserId`,`LastSeen`);

--
-- A tábla indexei `user_title`
--
ALTER TABLE `user_title`
  ADD PRIMARY KEY (`UserId`,`TitleId`),
  ADD KEY `TitleId` (`TitleId`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `age_rating`
--
ALTER TABLE `age_rating`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `article`
--
ALTER TABLE `article`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT a táblához `badge`
--
ALTER TABLE `badge`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT a táblához `book`
--
ALTER TABLE `book`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT a táblához `challenge`
--
ALTER TABLE `challenge`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT a táblához `episode`
--
ALTER TABLE `episode`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT a táblához `mail`
--
ALTER TABLE `mail`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT a táblához `movie`
--
ALTER TABLE `movie`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT a táblához `purchase`
--
ALTER TABLE `purchase`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT a táblához `security_audit_log`
--
ALTER TABLE `security_audit_log`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT a táblához `series`
--
ALTER TABLE `series`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT a táblához `tag`
--
ALTER TABLE `tag`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT a táblához `title`
--
ALTER TABLE `title`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT a táblához `user`
--
ALTER TABLE `user`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT a táblához `user_challenge`
--
ALTER TABLE `user_challenge`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `book`
--
ALTER TABLE `book`
  ADD CONSTRAINT `book_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `book_tag`
--
ALTER TABLE `book_tag`
  ADD CONSTRAINT `book_tag_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `book_tag_tag_fk` FOREIGN KEY (`TagId`) REFERENCES `tag` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `challenge`
--
ALTER TABLE `challenge`
  ADD CONSTRAINT `challenge_badge_fk` FOREIGN KEY (`RewardBadgeId`) REFERENCES `badge` (`Id`) ON DELETE SET NULL,
  ADD CONSTRAINT `challenge_title_fk` FOREIGN KEY (`RewardTitleId`) REFERENCES `title` (`Id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `episode`
--
ALTER TABLE `episode`
  ADD CONSTRAINT `episode_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `mail`
--
ALTER TABLE `mail`
  ADD CONSTRAINT `mail_receiver_fk` FOREIGN KEY (`ReceiverId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mail_sender_fk` FOREIGN KEY (`SenderId`) REFERENCES `user` (`Id`);

--
-- Megkötések a táblához `movie`
--
ALTER TABLE `movie`
  ADD CONSTRAINT `movie_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `movie_tag`
--
ALTER TABLE `movie_tag`
  ADD CONSTRAINT `movie_tag_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `movie_tag_tag_fk` FOREIGN KEY (`TagId`) REFERENCES `tag` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `purchase`
--
ALTER TABLE `purchase`
  ADD CONSTRAINT `purchase_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `security_audit_log`
--
ALTER TABLE `security_audit_log`
  ADD CONSTRAINT `security_audit_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `series`
--
ALTER TABLE `series`
  ADD CONSTRAINT `series_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `series_tag`
--
ALTER TABLE `series_tag`
  ADD CONSTRAINT `series_tag_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `series_tag_tag_fk` FOREIGN KEY (`TagId`) REFERENCES `tag` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `user_badge`
--
ALTER TABLE `user_badge`
  ADD CONSTRAINT `user_badge_badge_fk` FOREIGN KEY (`BadgeId`) REFERENCES `badge` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_badge_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `user_book`
--
ALTER TABLE `user_book`
  ADD CONSTRAINT `user_book_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_book_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `user_challenge`
--
ALTER TABLE `user_challenge`
  ADD CONSTRAINT `user_challenge_challenge_fk` FOREIGN KEY (`ChallengeId`) REFERENCES `challenge` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_challenge_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `user_movie`
--
ALTER TABLE `user_movie`
  ADD CONSTRAINT `user_movie_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_movie_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `user_rank_cache`
--
ALTER TABLE `user_rank_cache`
  ADD CONSTRAINT `user_rank_cache_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `user_series`
--
ALTER TABLE `user_series`
  ADD CONSTRAINT `user_series_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_series_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `user_title`
--
ALTER TABLE `user_title`
  ADD CONSTRAINT `user_title_title_fk` FOREIGN KEY (`TitleId`) REFERENCES `title` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_title_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

DELIMITER $$
--
-- Események
--
CREATE DEFINER=`root`@`localhost` EVENT `refresh_all_ranks` ON SCHEDULE EVERY 1 HOUR STARTS '2026-04-08 12:47:02' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    -- ==========================================
    -- OSSZES USER RANGJANAK UJRASZAMOLASA
    -- ==========================================

    -- Atmeneti tablak letrehozasa a gyorsabb szamitashoz
    DROP TEMPORARY TABLE IF EXISTS temp_global_ranks_total;
    DROP TEMPORARY TABLE IF EXISTS temp_country_ranks_total;
    DROP TEMPORARY TABLE IF EXISTS temp_global_ranks_book;
    DROP TEMPORARY TABLE IF EXISTS temp_country_ranks_book;
    DROP TEMPORARY TABLE IF EXISTS temp_global_ranks_media;
    DROP TEMPORARY TABLE IF EXISTS temp_country_ranks_media;

    -- GLOBALIS RANGOK - OSSZES
    CREATE TEMPORARY TABLE temp_global_ranks_total AS
    SELECT
        u.Id as UserId,
        @rank := @rank + 1 as GlobalRank_Total
    FROM user u, (SELECT @rank := 0) r
    ORDER BY (u.BookPoints + u.SeriesPoints + u.MoviePoints) DESC, u.Id ASC;

    -- ORSZAGOS RANGOK - OSSZES
    CREATE TEMPORARY TABLE temp_country_ranks_total AS
    SELECT
        UserId,
        CountryRank_Total
    FROM (
        SELECT
            u.Id as UserId,
            u.CountryCode,
            @rank := IF(@country = u.CountryCode, @rank + 1, 1) as CountryRank_Total,
            @country := u.CountryCode
        FROM user u, (SELECT @rank := 0, @country := '' COLLATE utf8mb4_hungarian_ci) r
        ORDER BY u.CountryCode, (u.BookPoints + u.SeriesPoints + u.MoviePoints) DESC, u.Id ASC
    ) ranked;

    -- GLOBALIS RANGOK - KONYV
    CREATE TEMPORARY TABLE temp_global_ranks_book AS
    SELECT
        u.Id as UserId,
        @rank := @rank + 1 as GlobalRank_Book
    FROM user u, (SELECT @rank := 0) r
    ORDER BY u.BookPoints DESC, u.Id ASC;

    -- ORSZAGOS RANGOK - KONYV
    CREATE TEMPORARY TABLE temp_country_ranks_book AS
    SELECT
        UserId,
        CountryRank_Book
    FROM (
        SELECT
            u.Id as UserId,
            u.CountryCode,
            @rank := IF(@country = u.CountryCode, @rank + 1, 1) as CountryRank_Book,
            @country := u.CountryCode
        FROM user u, (SELECT @rank := 0, @country := '' COLLATE utf8mb4_hungarian_ci) r
        ORDER BY u.CountryCode, u.BookPoints DESC, u.Id ASC
    ) ranked;

    -- GLOBALIS RANGOK - MEDIA
    CREATE TEMPORARY TABLE temp_global_ranks_media AS
    SELECT
        u.Id as UserId,
        @rank := @rank + 1 as GlobalRank_Media
    FROM user u, (SELECT @rank := 0) r
    ORDER BY (u.SeriesPoints + u.MoviePoints) DESC, u.Id ASC;

    -- ORSZAGOS RANGOK - MEDIA
    CREATE TEMPORARY TABLE temp_country_ranks_media AS
    SELECT
        UserId,
        CountryRank_Media
    FROM (
        SELECT
            u.Id as UserId,
            u.CountryCode,
            @rank := IF(@country = u.CountryCode, @rank + 1, 1) as CountryRank_Media,
            @country := u.CountryCode
        FROM user u, (SELECT @rank := 0, @country := '' COLLATE utf8mb4_hungarian_ci) r
        ORDER BY u.CountryCode, (u.SeriesPoints + u.MoviePoints) DESC, u.Id ASC
    ) ranked;

    -- RANGOK FRISSITESE A CACHE TABLABAN
    UPDATE user_rank_cache urc
    LEFT JOIN temp_global_ranks_total grt ON urc.UserId = grt.UserId
    LEFT JOIN temp_country_ranks_total crt ON urc.UserId = crt.UserId
    LEFT JOIN temp_global_ranks_book grb ON urc.UserId = grb.UserId
    LEFT JOIN temp_country_ranks_book crb ON urc.UserId = crb.UserId
    LEFT JOIN temp_global_ranks_media grm ON urc.UserId = grm.UserId
    LEFT JOIN temp_country_ranks_media crm ON urc.UserId = crm.UserId
    SET
        urc.GlobalRank_Total = grt.GlobalRank_Total,
        urc.CountryRank_Total = crt.CountryRank_Total,
        urc.GlobalRank_Book = grb.GlobalRank_Book,
        urc.CountryRank_Book = crb.CountryRank_Book,
        urc.GlobalRank_Media = grm.GlobalRank_Media,
        urc.CountryRank_Media = crm.CountryRank_Media;

    -- Atmeneti tablak torlese
    DROP TEMPORARY TABLE IF EXISTS temp_global_ranks_total;
    DROP TEMPORARY TABLE IF EXISTS temp_country_ranks_total;
    DROP TEMPORARY TABLE IF EXISTS temp_global_ranks_book;
    DROP TEMPORARY TABLE IF EXISTS temp_country_ranks_book;
    DROP TEMPORARY TABLE IF EXISTS temp_global_ranks_media;
    DROP TEMPORARY TABLE IF EXISTS temp_country_ranks_media;
END$$

CREATE DEFINER=`root`@`localhost` EVENT `check_premium_expiration` ON SCHEDULE EVERY 1 DAY STARTS '2026-02-06 03:00:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    -- ==========================================
    -- Lejart premiumok automatikus elvetele
    -- ==========================================

    UPDATE user
    SET
        Premium = 0,
        PremiumExpiresAt = NULL
    WHERE Premium = 1
      AND PremiumExpiresAt IS NOT NULL
      AND PremiumExpiresAt <= NOW();
END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
