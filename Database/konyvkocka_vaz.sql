-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2026 at 04:21 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `konyvkocka`
--
CREATE DATABASE IF NOT EXISTS `konyvkocka` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `konyvkocka`;

-- --------------------------------------------------------

--
-- Table structure for table `age_rating`
--

CREATE TABLE `age_rating` (
  `Id` int(11) NOT NULL,
  `Name` varchar(32) NOT NULL,
  `MinAge` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Table structure for table `article`
--

CREATE TABLE `article` (
  `Id` int(11) NOT NULL,
  `Title` varchar(256) NOT NULL,
  `Content` text NOT NULL,
  `EventTag` enum('UPDATE','ANNOUNCEMENT','EVENT','FUNCTION') NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Table structure for table `badge`
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

-- --------------------------------------------------------

--
-- Table structure for table `book`
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
-- Triggers `book`
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
-- Table structure for table `book_tag`
--

CREATE TABLE `book_tag` (
  `BookId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `challenge`
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

-- --------------------------------------------------------

--
-- Table structure for table `deleted_user`
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

-- --------------------------------------------------------

--
-- Table structure for table `episode`
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

-- --------------------------------------------------------

--
-- Table structure for table `mail`
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

-- --------------------------------------------------------

--
-- Table structure for table `movie`
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

-- --------------------------------------------------------

--
-- Table structure for table `movie_tag`
--

CREATE TABLE `movie_tag` (
  `MovieId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase`
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

-- --------------------------------------------------------

--
-- Table structure for table `security_audit_log`
--

CREATE TABLE `security_audit_log` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  `Action` varchar(255) NOT NULL,
  `Status` enum('VERIFIED','SUSPICIOUS') NOT NULL,
  `Details` text DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `series`
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

-- --------------------------------------------------------

--
-- Table structure for table `series_tag`
--

CREATE TABLE `series_tag` (
  `SeriesId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

CREATE TABLE `tag` (
  `Id` int(11) NOT NULL,
  `Name` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `title`
--

CREATE TABLE `title` (
  `Id` int(11) NOT NULL,
  `Name` varchar(128) NOT NULL,
  `Description` text DEFAULT NULL,
  `Rarity` enum('COMMON','RARE','EPIC','LEGENDARY') NOT NULL DEFAULT 'COMMON'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
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
-- Triggers `user`
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
-- Table structure for table `user_badge`
--

CREATE TABLE `user_badge` (
  `UserId` int(11) NOT NULL,
  `BadgeId` int(11) NOT NULL,
  `EarnedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_book`
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
-- Triggers `user_book`
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
-- Table structure for table `user_challenge`
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
-- Triggers `user_challenge`
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
-- Table structure for table `user_movie`
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
-- Triggers `user_movie`
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
-- Table structure for table `user_rank_cache`
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

-- --------------------------------------------------------

--
-- Table structure for table `user_series`
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
-- Triggers `user_series`
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
-- Table structure for table `user_title`
--

CREATE TABLE `user_title` (
  `UserId` int(11) NOT NULL,
  `TitleId` int(11) NOT NULL,
  `EarnedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `IsActive` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `age_rating`
--
ALTER TABLE `age_rating`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Name` (`Name`);

--
-- Indexes for table `article`
--
ALTER TABLE `article`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_article_event_tag` (`EventTag`),
  ADD KEY `idx_article_created` (`CreatedAt`);

--
-- Indexes for table `badge`
--
ALTER TABLE `badge`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_badge_category` (`Category`);

--
-- Indexes for table `book`
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
-- Indexes for table `book_tag`
--
ALTER TABLE `book_tag`
  ADD PRIMARY KEY (`BookId`,`TagId`),
  ADD KEY `TagId` (`TagId`),
  ADD KEY `idx_book_tag_tag_book` (`TagId`,`BookId`);

--
-- Indexes for table `challenge`
--
ALTER TABLE `challenge`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_type_active` (`Type`,`IsActive`),
  ADD KEY `idx_user_challenge_active_difficulty` (`IsActive`,`Difficulty`),
  ADD KEY `challenge_badge_fk` (`RewardBadgeId`),
  ADD KEY `challenge_title_fk` (`RewardTitleId`);

--
-- Indexes for table `deleted_user`
--
ALTER TABLE `deleted_user`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `episode`
--
ALTER TABLE `episode`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `unique_series_season_episode` (`SeriesId`,`SeasonNum`,`EpisodeNum`),
  ADD KEY `SeriesId` (`SeriesId`);

--
-- Indexes for table `mail`
--
ALTER TABLE `mail`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `ReceiverId` (`ReceiverId`),
  ADD KEY `SenderId` (`SenderId`),
  ADD KEY `idx_mail_receiver_read` (`ReceiverId`,`IsRead`),
  ADD KEY `idx_mail_created` (`CreatedAt`);

--
-- Indexes for table `movie`
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
-- Indexes for table `movie_tag`
--
ALTER TABLE `movie_tag`
  ADD PRIMARY KEY (`MovieId`,`TagId`),
  ADD KEY `TagId` (`TagId`),
  ADD KEY `idx_movie_tag_tag_movie` (`TagId`,`MovieId`);

--
-- Indexes for table `purchase`
--
ALTER TABLE `purchase`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `UserId` (`UserId`),
  ADD KEY `idx_purchase_user_date` (`UserId`,`PurchaseDate`),
  ADD KEY `idx_purchase_status` (`PurchaseStatus`),
  ADD KEY `idx_purchase_updated` (`updated_at`);

--
-- Indexes for table `security_audit_log`
--
ALTER TABLE `security_audit_log`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_security_audit_user` (`UserId`),
  ADD KEY `idx_security_audit_action` (`Action`),
  ADD KEY `idx_security_audit_created` (`CreatedAt`);

--
-- Indexes for table `series`
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
-- Indexes for table `series_tag`
--
ALTER TABLE `series_tag`
  ADD PRIMARY KEY (`SeriesId`,`TagId`),
  ADD KEY `TagId` (`TagId`),
  ADD KEY `idx_series_tag_tag_series` (`TagId`,`SeriesId`);

--
-- Indexes for table `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `unique_tag_name` (`Name`);

--
-- Indexes for table `title`
--
ALTER TABLE `title`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `user`
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
-- Indexes for table `user_badge`
--
ALTER TABLE `user_badge`
  ADD PRIMARY KEY (`UserId`,`BadgeId`),
  ADD KEY `BadgeId` (`BadgeId`);

--
-- Indexes for table `user_book`
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
-- Indexes for table `user_challenge`
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
-- Indexes for table `user_movie`
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
-- Indexes for table `user_rank_cache`
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
-- Indexes for table `user_series`
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
-- Indexes for table `user_title`
--
ALTER TABLE `user_title`
  ADD PRIMARY KEY (`UserId`,`TitleId`),
  ADD KEY `TitleId` (`TitleId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `age_rating`
--
ALTER TABLE `age_rating`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `article`
--
ALTER TABLE `article`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `badge`
--
ALTER TABLE `badge`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book`
--
ALTER TABLE `book`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `challenge`
--
ALTER TABLE `challenge`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `episode`
--
ALTER TABLE `episode`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mail`
--
ALTER TABLE `mail`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `movie`
--
ALTER TABLE `movie`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase`
--
ALTER TABLE `purchase`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `security_audit_log`
--
ALTER TABLE `security_audit_log`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `series`
--
ALTER TABLE `series`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tag`
--
ALTER TABLE `tag`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `title`
--
ALTER TABLE `title`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_challenge`
--
ALTER TABLE `user_challenge`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `book`
--
ALTER TABLE `book`
  ADD CONSTRAINT `book_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

--
-- Constraints for table `book_tag`
--
ALTER TABLE `book_tag`
  ADD CONSTRAINT `book_tag_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `book_tag_tag_fk` FOREIGN KEY (`TagId`) REFERENCES `tag` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `challenge`
--
ALTER TABLE `challenge`
  ADD CONSTRAINT `challenge_badge_fk` FOREIGN KEY (`RewardBadgeId`) REFERENCES `badge` (`Id`) ON DELETE SET NULL,
  ADD CONSTRAINT `challenge_title_fk` FOREIGN KEY (`RewardTitleId`) REFERENCES `title` (`Id`) ON DELETE SET NULL;

--
-- Constraints for table `episode`
--
ALTER TABLE `episode`
  ADD CONSTRAINT `episode_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `mail`
--
ALTER TABLE `mail`
  ADD CONSTRAINT `mail_receiver_fk` FOREIGN KEY (`ReceiverId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mail_sender_fk` FOREIGN KEY (`SenderId`) REFERENCES `user` (`Id`);

--
-- Constraints for table `movie`
--
ALTER TABLE `movie`
  ADD CONSTRAINT `movie_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

--
-- Constraints for table `movie_tag`
--
ALTER TABLE `movie_tag`
  ADD CONSTRAINT `movie_tag_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `movie_tag_tag_fk` FOREIGN KEY (`TagId`) REFERENCES `tag` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchase`
--
ALTER TABLE `purchase`
  ADD CONSTRAINT `purchase_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `security_audit_log`
--
ALTER TABLE `security_audit_log`
  ADD CONSTRAINT `security_audit_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE SET NULL;

--
-- Constraints for table `series`
--
ALTER TABLE `series`
  ADD CONSTRAINT `series_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

--
-- Constraints for table `series_tag`
--
ALTER TABLE `series_tag`
  ADD CONSTRAINT `series_tag_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `series_tag_tag_fk` FOREIGN KEY (`TagId`) REFERENCES `tag` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_badge`
--
ALTER TABLE `user_badge`
  ADD CONSTRAINT `user_badge_badge_fk` FOREIGN KEY (`BadgeId`) REFERENCES `badge` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_badge_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_book`
--
ALTER TABLE `user_book`
  ADD CONSTRAINT `user_book_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_book_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `user_challenge`
--
ALTER TABLE `user_challenge`
  ADD CONSTRAINT `user_challenge_challenge_fk` FOREIGN KEY (`ChallengeId`) REFERENCES `challenge` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_challenge_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `user_movie`
--
ALTER TABLE `user_movie`
  ADD CONSTRAINT `user_movie_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_movie_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `user_rank_cache`
--
ALTER TABLE `user_rank_cache`
  ADD CONSTRAINT `user_rank_cache_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `user_series`
--
ALTER TABLE `user_series`
  ADD CONSTRAINT `user_series_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_series_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `user_title`
--
ALTER TABLE `user_title`
  ADD CONSTRAINT `user_title_title_fk` FOREIGN KEY (`TitleId`) REFERENCES `title` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_title_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

DELIMITER $$
--
-- Events
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
