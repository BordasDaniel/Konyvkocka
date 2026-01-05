-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026.   Jan 05.  
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12
--
-- VÉGLEGES VERZIÓ v3 - Trailer + Könyvtár filterek (FIXED)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ========================================
-- ADATBÁZIS LÉTREHOZÁSA
-- ========================================

CREATE DATABASE IF NOT EXISTS `konyvkocka` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `konyvkocka`;

-- ========================================
-- ALAP TÁBLÁK (függőség nélküli)
-- ========================================

-- --------------------------------------------------------
-- Felhasználók
-- --------------------------------------------------------

CREATE TABLE `user` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(128) NOT NULL,
  `Email` varchar(128) NOT NULL,
  `PasswordHash` text NOT NULL,
  `PasswordSalt` text NOT NULL,
  `CountryCode` char(2) NOT NULL,
  `ProfilePic` varchar(2048) NOT NULL,
  `Premium` tinyint(1) NOT NULL DEFAULT 0,
  `CreationDate` date NOT NULL,
  `LastLoginDate` date NOT NULL,
  `Level` int(11) NOT NULL DEFAULT 1,
  `BookPoints` int(11) NOT NULL DEFAULT 0,
  `SeriesPoints` int(11) NOT NULL DEFAULT 0,
  `MoviePoints` int(11) NOT NULL DEFAULT 0,
  `DayStreak` int(11) NOT NULL DEFAULT 0,
  `ReadTimeMin` int(11) NOT NULL DEFAULT 0,
  `WatchTimeMin` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Username` (`Username`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Szerzők
-- --------------------------------------------------------

CREATE TABLE `author` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(128) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Korhatár besorolások
-- --------------------------------------------------------

CREATE TABLE `age_rating` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(32) NOT NULL,
  `MinAge` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Műfajok
-- --------------------------------------------------------

CREATE TABLE `genre` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(64) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name` (`Name`),
  KEY `idx_genre_name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------
-- Tartalom kategóriák (Nyelv, Adaptáció, Formátum)
-- --------------------------------------------------------

CREATE TABLE `content_category` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(64) NOT NULL,
  `Type` enum('LANGUAGE','ADAPTATION','FORMAT') NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name` (`Name`),
  KEY `idx_category_name_type` (`Name`, `Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------
-- Címkék (jövőbeli bővítéshez)
-- --------------------------------------------------------

CREATE TABLE `tag` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(128) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TARTALOM TÁBLÁK
-- ========================================

-- --------------------------------------------------------
-- Könyvek (Book + Audiobook + eBook)
-- --------------------------------------------------------

CREATE TABLE `book` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(128) NOT NULL,
  `Released` year(4) NOT NULL,
  `PageNum` int(4) NOT NULL,
  `Rating` decimal(3,1) NOT NULL DEFAULT 0.0,
  `Description` text NOT NULL,
  `CoverApiName` varchar(2048) NOT NULL,
  `AgeRatingId` int(11) DEFAULT NULL,
  `Type` enum('BOOK','AUDIOBOOK','EBOOK') NOT NULL DEFAULT 'BOOK',
  `PdfURL` varchar(2048) DEFAULT NULL,
  `AudioURL` varchar(2048) DEFAULT NULL,
  `EpubURL` varchar(2048) DEFAULT NULL,
  `AudioLength` int(11) DEFAULT NULL,
  `NarratorName` varchar(128) DEFAULT NULL,
  `IsOfflineAvailable` tinyint(1) NOT NULL DEFAULT 0,
  `OriginalLanguage` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `CoverApiName` (`CoverApiName`) USING HASH,
  KEY `AgeRatingId` (`AgeRatingId`),
  KEY `idx_book_type` (`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Filmek
-- --------------------------------------------------------

CREATE TABLE `movie` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(128) NOT NULL,
  `Released` year(4) NOT NULL,
  `Length` int(4) NOT NULL,
  `Rating` decimal(3,1) NOT NULL DEFAULT 0.0,
  `Description` text NOT NULL,
  `StreamURL` varchar(2048) NOT NULL,
  `PosterApiName` varchar(2048) NOT NULL,
  `AgeRatingId` int(11) DEFAULT NULL,
  `TrailerURL` varchar(2048) DEFAULT NULL,
  `HasSubtitles` tinyint(1) NOT NULL DEFAULT 0,
  `IsOriginalLanguage` tinyint(1) NOT NULL DEFAULT 0,
  `IsOfflineAvailable` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `PosterApiName` (`PosterApiName`) USING HASH,
  UNIQUE KEY `StreamURL` (`StreamURL`) USING HASH,
  KEY `AgeRatingId` (`AgeRatingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Sorozatok
-- --------------------------------------------------------

CREATE TABLE `series` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(128) NOT NULL,
  `Released` int(4) NOT NULL,
  `Rating` decimal(3,1) NOT NULL DEFAULT 0.0,
  `Description` text NOT NULL,
  `PosterApiName` varchar(2048) NOT NULL,
  `AgeRatingId` int(11) DEFAULT NULL,
  `TrailerURL` varchar(2048) DEFAULT NULL,
  `HasSubtitles` tinyint(1) NOT NULL DEFAULT 0,
  `IsOriginalLanguage` tinyint(1) NOT NULL DEFAULT 0,
  `IsOfflineAvailable` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `PosterApiName` (`PosterApiName`) USING HASH,
  KEY `AgeRatingId` (`AgeRatingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Epizódok
-- --------------------------------------------------------

CREATE TABLE `episode` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `SeriesId` int(11) NOT NULL,
  `SeasonNum` int(11) NOT NULL,
  `EpisodeNum` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `StreamURL` varchar(2048) NOT NULL,
  `Length` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `SeriesId` (`SeriesId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- KAPCSOLÓTÁBLÁK (Tartalom-Szerző)
-- ========================================

CREATE TABLE `book_author` (
  `BookId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL,
  PRIMARY KEY (`BookId`,`AuthorId`),
  KEY `AuthorId` (`AuthorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `movie_author` (
  `MovieId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL,
  PRIMARY KEY (`MovieId`,`AuthorId`),
  KEY `AuthorId` (`AuthorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `series_author` (
  `SeriesId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL,
  PRIMARY KEY (`SeriesId`,`AuthorId`),
  KEY `AuthorId` (`AuthorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- KAPCSOLÓTÁBLÁK (Tartalom-Műfaj)
-- ========================================

CREATE TABLE `book_genre` (
  `BookId` int(11) NOT NULL,
  `GenreId` int(11) NOT NULL,
  PRIMARY KEY (`BookId`, `GenreId`),
  KEY `GenreId` (`GenreId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `movie_genre` (
  `MovieId` int(11) NOT NULL,
  `GenreId` int(11) NOT NULL,
  PRIMARY KEY (`MovieId`, `GenreId`),
  KEY `GenreId` (`GenreId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `series_genre` (
  `SeriesId` int(11) NOT NULL,
  `GenreId` int(11) NOT NULL,
  PRIMARY KEY (`SeriesId`, `GenreId`),
  KEY `GenreId` (`GenreId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- KAPCSOLÓTÁBLÁK (Tartalom-Kategória)
-- ========================================

CREATE TABLE `book_category` (
  `BookId` int(11) NOT NULL,
  `CategoryId` int(11) NOT NULL,
  PRIMARY KEY (`BookId`, `CategoryId`),
  KEY `CategoryId` (`CategoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `movie_category` (
  `MovieId` int(11) NOT NULL,
  `CategoryId` int(11) NOT NULL,
  PRIMARY KEY (`MovieId`, `CategoryId`),
  KEY `CategoryId` (`CategoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `series_category` (
  `SeriesId` int(11) NOT NULL,
  `CategoryId` int(11) NOT NULL,
  PRIMARY KEY (`SeriesId`, `CategoryId`),
  KEY `CategoryId` (`CategoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- FELHASZNÁLÓI TARTALOM TÁBLÁK (Könyvtár)
-- ========================================

CREATE TABLE `user_book` (
  `UserId` int(11) NOT NULL,
  `BookId` int(11) NOT NULL,
  `Status` enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED') DEFAULT NULL,
  `Favorite` tinyint(1) NOT NULL DEFAULT 0,
  `IsRead` tinyint(1) NOT NULL DEFAULT 0,
  `Rating` decimal(3,1) DEFAULT NULL,
  `AddedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CompletedAt` datetime DEFAULT NULL,
  `LastSeen` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CurrentPage` int(11) DEFAULT 0,
  `CurrentAudioPosition` int(11) DEFAULT 0,
  PRIMARY KEY (`UserId`,`BookId`),
  KEY `BookId` (`BookId`),
  KEY `idx_user_book_status` (`Status`),
  KEY `idx_user_book_favorite` (`Favorite`),
  KEY `idx_user_book_added` (`AddedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_movie` (
  `UserId` int(11) NOT NULL,
  `MovieId` int(11) NOT NULL,
  `Status` enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED') DEFAULT NULL,
  `Favorite` tinyint(1) NOT NULL DEFAULT 0,
  `Rating` decimal(3,1) DEFAULT NULL,
  `AddedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CompletedAt` datetime DEFAULT NULL,
  `LastSeen` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CurrentPosition` int(11) DEFAULT 0,
  PRIMARY KEY (`UserId`,`MovieId`),
  KEY `MovieId` (`MovieId`),
  KEY `idx_user_movie_status` (`Status`),
  KEY `idx_user_movie_favorite` (`Favorite`),
  KEY `idx_user_movie_added` (`AddedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_series` (
  `UserId` int(11) NOT NULL,
  `SeriesId` int(11) NOT NULL,
  `Status` enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED') DEFAULT NULL,
  `Favorite` tinyint(1) NOT NULL DEFAULT 0,
  `Rating` decimal(3,1) DEFAULT NULL,
  `AddedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CompletedAt` datetime DEFAULT NULL,
  `LastSeen` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CurrentSeason` int(11) DEFAULT 1,
  `CurrentEpisode` int(11) DEFAULT 1,
  `CurrentPosition` int(11) DEFAULT 0,
  PRIMARY KEY (`UserId`,`SeriesId`),
  KEY `SeriesId` (`SeriesId`),
  KEY `idx_user_series_status` (`Status`),
  KEY `idx_user_series_favorite` (`Favorite`),
  KEY `idx_user_series_added` (`AddedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- GAMIFIKÁCIÓ TÁBLÁK
-- ========================================

CREATE TABLE `achievement` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Description` text NOT NULL,
  `LogoURL` varchar(2048) NOT NULL,
  `AchieveDate` date NOT NULL,
  `Rarity` tinyint(1) NOT NULL,
  `Category` varchar(128) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `challenge` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(128) NOT NULL,
  `Description` text NOT NULL,
  `IconURL` varchar(2048) DEFAULT NULL,
  `Type` enum('BOOK','MOVIE','SERIES','READING_TIME','WATCH_TIME','STREAK','SOCIAL','MIXED') NOT NULL,
  `TargetValue` int(11) NOT NULL,
  `RewardXP` int(11) NOT NULL DEFAULT 0,
  `RewardType` enum('XP','ACHIEVEMENT','BADGE','PREMIUM_DAYS') DEFAULT 'XP',
  `Difficulty` enum('EASY','MEDIUM','HARD','EPIC') NOT NULL DEFAULT 'EASY',
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `IsRepeatable` tinyint(1) NOT NULL DEFAULT 0,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `idx_type_active` (`Type`, `IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `user_challenge` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) NOT NULL,
  `ChallengeId` int(11) NOT NULL,
  `CurrentValue` int(11) NOT NULL DEFAULT 0,
  `Status` enum('NOT_STARTED','IN_PROGRESS','COMPLETED','CLAIMED') NOT NULL DEFAULT 'NOT_STARTED',
  `StartedAt` datetime DEFAULT NULL,
  `CompletedAt` datetime DEFAULT NULL,
  `ClaimedAt` datetime DEFAULT NULL,
  `LastUpdated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `user_challenge_unique` (`UserId`, `ChallengeId`),
  KEY `UserId` (`UserId`),
  KEY `ChallengeId` (`ChallengeId`),
  KEY `idx_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- KOMMUNIKÁCIÓ ÉS TRANZAKCIÓK
-- ========================================

CREATE TABLE `mail` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ReceiverId` int(11) NOT NULL,
  `SenderId` int(11) DEFAULT NULL,
  `Type` enum('ALL','SYSTEM','FRIEND','CHALLENGE','PURCHASE') NOT NULL,
  `Subject` varchar(255) NOT NULL,
  `Message` text NOT NULL,
  `IsRead` tinyint(1) DEFAULT 0,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `ReceiverId` (`ReceiverId`),
  KEY `SenderId` (`SenderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `purchase` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) NOT NULL,
  `Price` int(11) DEFAULT NULL,
  `PurchaseStatus` varchar(128) DEFAULT NULL,
  `PurchaseDate` date DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- FOREIGN KEY MEGKÖTÉSEK
-- ========================================

ALTER TABLE `book`
  ADD CONSTRAINT `book_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

ALTER TABLE `movie`
  ADD CONSTRAINT `movie_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

ALTER TABLE `series`
  ADD CONSTRAINT `series_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

ALTER TABLE `episode`
  ADD CONSTRAINT `episode_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE;

ALTER TABLE `book_author`
  ADD CONSTRAINT `book_author_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_author_author_fk` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`Id`) ON DELETE CASCADE;

ALTER TABLE `movie_author`
  ADD CONSTRAINT `movie_author_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movie_author_author_fk` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`Id`) ON DELETE CASCADE;

ALTER TABLE `series_author`
  ADD CONSTRAINT `series_author_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `series_author_author_fk` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`Id`) ON DELETE CASCADE;

ALTER TABLE `book_genre`
  ADD CONSTRAINT `book_genre_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_genre_genre_fk` FOREIGN KEY (`GenreId`) REFERENCES `genre` (`Id`) ON DELETE CASCADE;

ALTER TABLE `movie_genre`
  ADD CONSTRAINT `movie_genre_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movie_genre_genre_fk` FOREIGN KEY (`GenreId`) REFERENCES `genre` (`Id`) ON DELETE CASCADE;

ALTER TABLE `series_genre`
  ADD CONSTRAINT `series_genre_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `series_genre_genre_fk` FOREIGN KEY (`GenreId`) REFERENCES `genre` (`Id`) ON DELETE CASCADE;

ALTER TABLE `book_category`
  ADD CONSTRAINT `book_category_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_category_category_fk` FOREIGN KEY (`CategoryId`) REFERENCES `content_category` (`Id`) ON DELETE CASCADE;

ALTER TABLE `movie_category`
  ADD CONSTRAINT `movie_category_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movie_category_category_fk` FOREIGN KEY (`CategoryId`) REFERENCES `content_category` (`Id`) ON DELETE CASCADE;

ALTER TABLE `series_category`
  ADD CONSTRAINT `series_category_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `series_category_category_fk` FOREIGN KEY (`CategoryId`) REFERENCES `content_category` (`Id`) ON DELETE CASCADE;

ALTER TABLE `user_book`
  ADD CONSTRAINT `user_book_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_book_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE;

ALTER TABLE `user_movie`
  ADD CONSTRAINT `user_movie_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_movie_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE;

ALTER TABLE `user_series`
  ADD CONSTRAINT `user_series_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_series_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE;

ALTER TABLE `achievement`
  ADD CONSTRAINT `achievement_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `user_challenge`
  ADD CONSTRAINT `user_challenge_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_challenge_challenge_fk` FOREIGN KEY (`ChallengeId`) REFERENCES `challenge` (`Id`) ON DELETE CASCADE;

ALTER TABLE `mail`
  ADD CONSTRAINT `mail_receiver_fk` FOREIGN KEY (`ReceiverId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mail_sender_fk` FOREIGN KEY (`SenderId`) REFERENCES `user` (`Id`) ON DELETE SET NULL;

ALTER TABLE `purchase`
  ADD CONSTRAINT `purchase_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

-- ========================================
-- ALAPÉRTELMEZETT ADATOK BESZÚRÁSA
-- ========================================

INSERT INTO `age_rating` (`Name`, `MinAge`) VALUES
('Minden', 0),
('Gyerek', 0),
('12+', 12),
('16+', 16),
('18+', 18);

INSERT INTO `genre` (`Name`) VALUES
('Akció'),
('Vígjáték'),
('Horror'),
('Életrajzi'),
('Kaland'),
('Romantikus'),
('Thriller'),
('Dokumentum'),
('Krimi'),
('Sci-fi'),
('Családi'),
('Mese'),
('Dráma'),
('Fantasy'),
('Történelmi');

INSERT INTO `content_category` (`Name`, `Type`) VALUES
('Magyar', 'LANGUAGE'),
('Külföldi', 'LANGUAGE'),
('Filmadaptáció', 'ADAPTATION'),
('Képregény alapú', 'ADAPTATION'),
('Animációs', 'FORMAT'),
('Feliratos', 'FORMAT');

INSERT INTO `challenge` (`Title`, `Description`, `Type`, `TargetValue`, `RewardXP`, `Difficulty`) VALUES
('Első lépések', 'Olvass el 5 könyvet a platformon. ', 'BOOK', 5, 250, 'EASY'),
('Film maraton', 'Nézz meg 10 filmet.', 'MOVIE', 10, 500, 'MEDIUM'),
('Sorozat guru', 'Nézz meg 3 teljes sorozatot.', 'SERIES', 3, 750, 'HARD'),
('Olvasó bajnok', 'Tölts el 1000 percet olvasással.', 'READING_TIME', 1000, 1000, 'HARD'),
('Hétvégi maraton', 'Nézz 300 perc tartalmat.', 'WATCH_TIME', 300, 400, 'MEDIUM'),
('Kitartás', 'Érj el 7 napos sorozatot.', 'STREAK', 7, 350, 'MEDIUM'),
('30 napos kihívás', 'Érj el 30 napos sorozatot.', 'STREAK', 30, 2000, 'EPIC');

COMMIT;