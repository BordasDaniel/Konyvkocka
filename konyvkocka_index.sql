-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Jan 21. 11:22
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.0.30

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
CREATE DATABASE IF NOT EXISTS `konyvkocka` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `konyvkocka`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `achievement`
--

CREATE TABLE `achievement` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Description` text NOT NULL,
  `LogoURL` varchar(512) NOT NULL,
  `AchieveDate` date NOT NULL,
  `Rarity` tinyint(1) NOT NULL,
  `Category` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `age_rating`
--

CREATE TABLE `age_rating` (
  `Id` int(11) NOT NULL,
  `Name` varchar(32) NOT NULL,
  `MinAge` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Tábla szerkezet ehhez a táblához `author`
--

CREATE TABLE `author` (
  `Id` int(11) NOT NULL,
  `Name` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `NarratorName` varchar(128) DEFAULT NULL,
  `IsOfflineAvailable` tinyint(1) NOT NULL DEFAULT 0,
  `OriginalLanguage` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `book_author`
--

CREATE TABLE `book_author` (
  `BookId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `book_category`
--

CREATE TABLE `book_category` (
  `BookId` int(11) NOT NULL,
  `CategoryId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `book_genre`
--

CREATE TABLE `book_genre` (
  `BookId` int(11) NOT NULL,
  `GenreId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `challenge`
--

CREATE TABLE `challenge` (
  `Id` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Description` text NOT NULL,
  `IconURL` varchar(512) DEFAULT NULL,
  `Type` enum('BOOK','MOVIE','SERIES','READING_TIME','WATCH_TIME','STREAK','SOCIAL','MIXED') NOT NULL,
  `TargetValue` int(11) NOT NULL,
  `RewardXP` int(11) NOT NULL DEFAULT 0,
  `RewardType` enum('XP','ACHIEVEMENT','BADGE','PREMIUM_DAYS') DEFAULT 'XP',
  `Difficulty` enum('EASY','MEDIUM','HARD','EPIC') NOT NULL DEFAULT 'EASY',
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `IsRepeatable` tinyint(1) NOT NULL DEFAULT 0,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `challenge`
--

INSERT INTO `challenge` (`Id`, `Title`, `Description`, `IconURL`, `Type`, `TargetValue`, `RewardXP`, `RewardType`, `Difficulty`, `IsActive`, `IsRepeatable`, `CreatedAt`) VALUES
(1, 'Első lépések', 'Olvass el 5 könyvet a platformon. ', NULL, 'BOOK', 5, 250, 'XP', 'EASY', 1, 0, '2026-01-14 07:22:12'),
(2, 'Film maraton', 'Nézz meg 10 filmet.', NULL, 'MOVIE', 10, 500, 'XP', 'MEDIUM', 1, 0, '2026-01-14 07:22:12'),
(3, 'Sorozat guru', 'Nézz meg 3 teljes sorozatot.', NULL, 'SERIES', 3, 750, 'XP', 'HARD', 1, 0, '2026-01-14 07:22:12'),
(4, 'Olvasó bajnok', 'Tölts el 1000 percet olvasással.', NULL, 'READING_TIME', 1000, 1000, 'XP', 'HARD', 1, 0, '2026-01-14 07:22:12'),
(5, 'Hétvégi maraton', 'Nézz 300 perc tartalmat.', NULL, 'WATCH_TIME', 300, 400, 'XP', 'MEDIUM', 1, 0, '2026-01-14 07:22:12'),
(6, 'Kitartás', 'Érj el 7 napos sorozatot.', NULL, 'STREAK', 7, 350, 'XP', 'MEDIUM', 1, 0, '2026-01-14 07:22:12'),
(7, '30 napos kihívás', 'Érj el 30 napos sorozatot.', NULL, 'STREAK', 30, 2000, 'XP', 'EPIC', 1, 0, '2026-01-14 07:22:12');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `content_category`
--

CREATE TABLE `content_category` (
  `Id` int(11) NOT NULL,
  `Name` varchar(64) NOT NULL,
  `Type` enum('LANGUAGE','ADAPTATION','FORMAT') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `content_category`
--

INSERT INTO `content_category` (`Id`, `Name`, `Type`) VALUES
(5, 'Animációs', 'FORMAT'),
(6, 'Feliratos', 'FORMAT'),
(3, 'Filmadaptáció', 'ADAPTATION'),
(4, 'Képregény alapú', 'ADAPTATION'),
(2, 'Külföldi', 'LANGUAGE'),
(1, 'Magyar', 'LANGUAGE');

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
  `CountryCode` char(2) NOT NULL,
  `ProfilePic` varchar(512) NOT NULL,
  `Premium` tinyint(1) NOT NULL DEFAULT 0,
  `CreationDate` date NOT NULL,
  `LastLoginDate` date NOT NULL,
  `Level` int(11) NOT NULL DEFAULT 1,
  `BookPoints` int(11) NOT NULL DEFAULT 0,
  `SeriesPoints` int(11) NOT NULL DEFAULT 0,
  `MoviePoints` int(11) NOT NULL DEFAULT 0,
  `DayStreak` int(11) NOT NULL DEFAULT 0,
  `ReadTimeMin` int(11) NOT NULL DEFAULT 0,
  `WatchTimeMin` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

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
  `Length` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `genre`
--

CREATE TABLE `genre` (
  `Id` int(11) NOT NULL,
  `Name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `genre`
--

INSERT INTO `genre` (`Id`, `Name`) VALUES
(1, 'Akció'),
(11, 'Családi'),
(8, 'Dokumentum'),
(13, 'Dráma'),
(4, 'Életrajzi'),
(14, 'Fantasy'),
(3, 'Horror'),
(5, 'Kaland'),
(9, 'Krimi'),
(12, 'Mese'),
(6, 'Romantikus'),
(10, 'Sci-fi'),
(7, 'Thriller'),
(15, 'Történelmi'),
(2, 'Vígjáték');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `mail`
--

CREATE TABLE `mail` (
  `Id` int(11) NOT NULL,
  `ReceiverId` int(11) NOT NULL,
  `SenderId` int(11) DEFAULT NULL,
  `Type` enum('ALL','SYSTEM','FRIEND','CHALLENGE','PURCHASE') NOT NULL,
  `Subject` varchar(255) NOT NULL,
  `Message` text NOT NULL,
  `IsRead` tinyint(1) DEFAULT 0,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `HasSubtitles` tinyint(1) NOT NULL DEFAULT 0,
  `IsOriginalLanguage` tinyint(1) NOT NULL DEFAULT 0,
  `IsOfflineAvailable` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `movie_author`
--

CREATE TABLE `movie_author` (
  `MovieId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `movie_category`
--

CREATE TABLE `movie_category` (
  `MovieId` int(11) NOT NULL,
  `CategoryId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `movie_genre`
--

CREATE TABLE `movie_genre` (
  `MovieId` int(11) NOT NULL,
  `GenreId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `purchase`
--

CREATE TABLE `purchase` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Price` int(11) DEFAULT NULL,
  `PurchaseStatus` varchar(128) DEFAULT NULL,
  `PurchaseDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `HasSubtitles` tinyint(1) NOT NULL DEFAULT 0,
  `IsOriginalLanguage` tinyint(1) NOT NULL DEFAULT 0,
  `IsOfflineAvailable` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `series_author`
--

CREATE TABLE `series_author` (
  `SeriesId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `series_category`
--

CREATE TABLE `series_category` (
  `SeriesId` int(11) NOT NULL,
  `CategoryId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `series_genre`
--

CREATE TABLE `series_genre` (
  `SeriesId` int(11) NOT NULL,
  `GenreId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tag`
--

CREATE TABLE `tag` (
  `Id` int(11) NOT NULL,
  `Name` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user`
--

CREATE TABLE `user` (
  `Id` int(11) NOT NULL,
  `Username` varchar(128) NOT NULL,
  `Email` varchar(128) NOT NULL,
  `PasswordHash` text NOT NULL,
  `PasswordSalt` text NOT NULL,
  `CountryCode` char(2) NOT NULL,
  `ProfilePic` varchar(512) NOT NULL,
  `Premium` tinyint(1) NOT NULL DEFAULT 0,
  `CreationDate` date NOT NULL,
  `LastLoginDate` date NOT NULL,
  `Level` int(11) NOT NULL DEFAULT 1,
  `BookPoints` int(11) NOT NULL DEFAULT 0,
  `SeriesPoints` int(11) NOT NULL DEFAULT 0,
  `MoviePoints` int(11) NOT NULL DEFAULT 0,
  `DayStreak` int(11) NOT NULL DEFAULT 0,
  `ReadTimeMin` int(11) NOT NULL DEFAULT 0,
  `WatchTimeMin` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eseményindítók `user`
--
DELIMITER $$
CREATE TRIGGER `deleting_user` AFTER DELETE ON `user` FOR EACH ROW BEGIN
    INSERT INTO deleted_user (
        Id, Username, Email, PasswordHash, PasswordSalt, 
        CountryCode, ProfilePic, Premium, CreationDate, 
        LastLoginDate, Level, BookPoints, SeriesPoints, 
        MoviePoints, DayStreak, ReadTimeMin, WatchTimeMin
    )
    VALUES (
        OLD.Id, 
        OLD.Username,
        CONCAT('deleted_', OLD.Id, '@anon.local'),
        NULL,                                     
        NULL,                                     
        OLD.CountryCode, 
        OLD.ProfilePic, 
        OLD.Premium, 
        OLD.CreationDate, 
        OLD.LastLoginDate, 
        OLD.Level, 
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

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_book`
--

CREATE TABLE `user_book` (
  `UserId` int(11) NOT NULL,
  `BookId` int(11) NOT NULL,
  `Status` enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED') DEFAULT NULL,
  `Favorite` tinyint(1) NOT NULL DEFAULT 0,
  `IsRead` tinyint(1) NOT NULL DEFAULT 0,
  `Rating` decimal(3,1) DEFAULT NULL,
  `AddedAt` datetime DEFAULT current_timestamp(),
  `CompletedAt` datetime DEFAULT NULL,
  `LastSeen` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `CurrentPage` int(11) DEFAULT 0,
  `CurrentAudioPosition` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `LastUpdated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `LastSeen` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `CurrentPosition` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `LastSeen` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `CurrentSeason` int(11) DEFAULT 1,
  `CurrentEpisode` int(11) DEFAULT 1,
  `CurrentPosition` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `achievement`
--
ALTER TABLE `achievement`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `UserId` (`UserId`);

--
-- A tábla indexei `age_rating`
--
ALTER TABLE `age_rating`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Name` (`Name`);

--
-- A tábla indexei `author`
--
ALTER TABLE `author`
  ADD PRIMARY KEY (`Id`);

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
-- A tábla indexei `book_author`
--
ALTER TABLE `book_author`
  ADD PRIMARY KEY (`BookId`,`AuthorId`),
  ADD KEY `AuthorId` (`AuthorId`);

--
-- A tábla indexei `book_category`
--
ALTER TABLE `book_category`
  ADD PRIMARY KEY (`BookId`,`CategoryId`),
  ADD KEY `CategoryId` (`CategoryId`),
  ADD KEY `idx_book_category_category_book` (`CategoryId`,`BookId`);

--
-- A tábla indexei `book_genre`
--
ALTER TABLE `book_genre`
  ADD PRIMARY KEY (`BookId`,`GenreId`),
  ADD KEY `GenreId` (`GenreId`),
  ADD KEY `idx_book_genre_genre_book` (`GenreId`,`BookId`);

--
-- A tábla indexei `challenge`
--
ALTER TABLE `challenge`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_type_active` (`Type`,`IsActive`),
  ADD KEY `idx_user_challenge_active_difficulty` (`IsActive`,`Difficulty`);

--
-- A tábla indexei `content_category`
--
ALTER TABLE `content_category`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Name` (`Name`),
  ADD KEY `idx_category_name_type` (`Name`,`Type`);

--
-- A tábla indexei `episode`
--
ALTER TABLE `episode`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `SeriesId` (`SeriesId`);

--
-- A tábla indexei `genre`
--
ALTER TABLE `genre`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Name` (`Name`),
  ADD KEY `idx_genre_name` (`Name`);

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
-- A tábla indexei `movie_author`
--
ALTER TABLE `movie_author`
  ADD PRIMARY KEY (`MovieId`,`AuthorId`),
  ADD KEY `AuthorId` (`AuthorId`);

--
-- A tábla indexei `movie_category`
--
ALTER TABLE `movie_category`
  ADD PRIMARY KEY (`MovieId`,`CategoryId`),
  ADD KEY `CategoryId` (`CategoryId`),
  ADD KEY `idx_movie_category_category_movie` (`CategoryId`,`MovieId`);

--
-- A tábla indexei `movie_genre`
--
ALTER TABLE `movie_genre`
  ADD PRIMARY KEY (`MovieId`,`GenreId`),
  ADD KEY `GenreId` (`GenreId`),
  ADD KEY `idx_movie_genre_genre_movie` (`GenreId`,`MovieId`);

--
-- A tábla indexei `purchase`
--
ALTER TABLE `purchase`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `UserId` (`UserId`),
  ADD KEY `idx_purchase_user_date` (`UserId`,`PurchaseDate`),
  ADD KEY `idx_purchase_status` (`PurchaseStatus`);

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
-- A tábla indexei `series_author`
--
ALTER TABLE `series_author`
  ADD PRIMARY KEY (`SeriesId`,`AuthorId`),
  ADD KEY `AuthorId` (`AuthorId`);

--
-- A tábla indexei `series_category`
--
ALTER TABLE `series_category`
  ADD PRIMARY KEY (`SeriesId`,`CategoryId`),
  ADD KEY `CategoryId` (`CategoryId`),
  ADD KEY `idx_series_category_category_series` (`CategoryId`,`SeriesId`);

--
-- A tábla indexei `series_genre`
--
ALTER TABLE `series_genre`
  ADD PRIMARY KEY (`SeriesId`,`GenreId`),
  ADD KEY `GenreId` (`GenreId`),
  ADD KEY `idx_series_genre_genre_series` (`GenreId`,`SeriesId`);

--
-- A tábla indexei `tag`
--
ALTER TABLE `tag`
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
  ADD KEY `idx_user_premium` (`Premium`);

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
  ADD KEY `idx_user_challenge_user_updated` (`UserId`,`LastUpdated`);

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
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `achievement`
--
ALTER TABLE `achievement`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `age_rating`
--
ALTER TABLE `age_rating`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `author`
--
ALTER TABLE `author`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `book`
--
ALTER TABLE `book`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `challenge`
--
ALTER TABLE `challenge`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT a táblához `content_category`
--
ALTER TABLE `content_category`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `episode`
--
ALTER TABLE `episode`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `genre`
--
ALTER TABLE `genre`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT a táblához `mail`
--
ALTER TABLE `mail`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `movie`
--
ALTER TABLE `movie`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `purchase`
--
ALTER TABLE `purchase`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `series`
--
ALTER TABLE `series`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `tag`
--
ALTER TABLE `tag`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `user`
--
ALTER TABLE `user`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `user_challenge`
--
ALTER TABLE `user_challenge`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `achievement`
--
ALTER TABLE `achievement`
  ADD CONSTRAINT `achievement_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `book`
--
ALTER TABLE `book`
  ADD CONSTRAINT `book_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `book_author`
--
ALTER TABLE `book_author`
  ADD CONSTRAINT `book_author_author_fk` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_author_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `book_category`
--
ALTER TABLE `book_category`
  ADD CONSTRAINT `book_category_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_category_category_fk` FOREIGN KEY (`CategoryId`) REFERENCES `content_category` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `book_genre`
--
ALTER TABLE `book_genre`
  ADD CONSTRAINT `book_genre_book_fk` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_genre_genre_fk` FOREIGN KEY (`GenreId`) REFERENCES `genre` (`Id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `mail_sender_fk` FOREIGN KEY (`SenderId`) REFERENCES `user` (`Id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `movie`
--
ALTER TABLE `movie`
  ADD CONSTRAINT `movie_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `movie_author`
--
ALTER TABLE `movie_author`
  ADD CONSTRAINT `movie_author_author_fk` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movie_author_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `movie_category`
--
ALTER TABLE `movie_category`
  ADD CONSTRAINT `movie_category_category_fk` FOREIGN KEY (`CategoryId`) REFERENCES `content_category` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movie_category_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `movie_genre`
--
ALTER TABLE `movie_genre`
  ADD CONSTRAINT `movie_genre_genre_fk` FOREIGN KEY (`GenreId`) REFERENCES `genre` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movie_genre_movie_fk` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `purchase`
--
ALTER TABLE `purchase`
  ADD CONSTRAINT `purchase_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `series`
--
ALTER TABLE `series`
  ADD CONSTRAINT `series_age_rating_fk` FOREIGN KEY (`AgeRatingId`) REFERENCES `age_rating` (`Id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `series_author`
--
ALTER TABLE `series_author`
  ADD CONSTRAINT `series_author_author_fk` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `series_author_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `series_category`
--
ALTER TABLE `series_category`
  ADD CONSTRAINT `series_category_category_fk` FOREIGN KEY (`CategoryId`) REFERENCES `content_category` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `series_category_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `series_genre`
--
ALTER TABLE `series_genre`
  ADD CONSTRAINT `series_genre_genre_fk` FOREIGN KEY (`GenreId`) REFERENCES `genre` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `series_genre_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE;

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
-- Megkötések a táblához `user_series`
--
ALTER TABLE `user_series`
  ADD CONSTRAINT `user_series_series_fk` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_series_user_fk` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
