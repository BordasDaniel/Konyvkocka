-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Dec 28. 12:42
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

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `achievement`
--

CREATE TABLE `achievement` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Description` text NOT NULL,
  `LogoURL` varchar(2048) NOT NULL,
  `AchieveDate` date NOT NULL,
  `Rarity` tinyint(1) NOT NULL,
  `Category` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `achievement`
--

INSERT INTO `achievement` (`Id`, `UserId`, `Title`, `Description`, `LogoURL`, `AchieveDate`, `Rarity`, `Category`) VALUES
(1, 1, 'Első Könyv', 'Gratulálunk!', 'gold.png', '2023-01-15', 1, 'Reading'),
(2, 2, 'Kezdő', 'Üdv nálunk!', 'welcome.png', '2023-05-16', 1, 'Social');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `author`
--

CREATE TABLE `author` (
  `Id` int(11) NOT NULL,
  `Name` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `author`
--

INSERT INTO `author` (`Id`, `Name`) VALUES
(1, 'J.K. Rowling'),
(2, 'Stephen King'),
(3, 'George R.R. Martin'),
(4, 'Frank Herbert'),
(5, 'Isaac Asimov'),
(6, 'Christopher Nolan'),
(7, 'Quentin Tarantino'),
(8, 'Lana Wachowski'),
(9, 'Lilly Wachowski'),
(10, 'Vince Gilligan'),
(11, 'The Duffer Brothers'),
(12, 'Johan Renck'),
(13, 'Jon Favreau'),
(14, 'Charlie Brooker');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `book`
--

CREATE TABLE `book` (
  `Id` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Released` year(4) NOT NULL,
  `PageNum` int(4) NOT NULL,
  `Rating` decimal(3,1) NOT NULL,
  `Description` text NOT NULL,
  `PdfURL` varchar(2048) NOT NULL,
  `CoverApiName` varchar(2048) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `book`
--

INSERT INTO `book` (`Id`, `Title`, `Released`, `PageNum`, `Rating`, `Description`, `PdfURL`, `CoverApiName`) VALUES
(1, 'Harry Potter', '1997', 332, 4.8, 'Varázslat.', 'hp1.pdf', 'hp_cover'),
(2, 'A ragyogás', '1977', 447, 4.5, 'Horror.', 'shining.pdf', 'shining_cover'),
(3, 'Trónok harca', '1996', 694, 4.7, 'Fantasy.', 'got1.pdf', 'got_cover'),
(4, 'Dűne', '1965', 412, 4.9, 'Sci-fi.', 'dune.pdf', 'dune_cover'),
(5, 'Alapítvány', '1951', 255, 4.6, 'Galaxis.', 'foun.pdf', 'foun_cover');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `bookauthor`
--

CREATE TABLE `bookauthor` (
  `BookId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `bookauthor`
--

INSERT INTO `bookauthor` (`BookId`, `AuthorId`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `episodes`
--

CREATE TABLE `episodes` (
  `Id` int(11) NOT NULL,
  `SeriesId` int(11) NOT NULL,
  `SeasonNum` int(11) NOT NULL,
  `EpisodeNum` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `StreamURL` varchar(2048) NOT NULL,
  `Length` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `episodes`
--

INSERT INTO `episodes` (`Id`, `SeriesId`, `SeasonNum`, `EpisodeNum`, `Title`, `StreamURL`, `Length`) VALUES
(12, 1, 1, 1, 'Pilot', 's1e1_url', 58),
(13, 1, 1, 2, 'Cat\'s in the Bag...', 's1e2_url', 48),
(14, 1, 1, 3, '...And the Bag\'s in the River', 's1e3_url', 48),
(15, 2, 1, 1, 'Chapter One: The Vanishing of Will Byers', 's2e1_url', 50),
(16, 3, 1, 1, '1:23:45', 's3e1_url', 60);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `movie`
--

CREATE TABLE `movie` (
  `Id` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Released` year(4) NOT NULL,
  `Length` int(4) NOT NULL,
  `Rating` decimal(3,1) NOT NULL,
  `Description` text NOT NULL,
  `StreamURL` varchar(2048) NOT NULL,
  `PosterApiName` varchar(2048) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `movie`
--

INSERT INTO `movie` (`Id`, `Title`, `Released`, `Length`, `Rating`, `Description`, `StreamURL`, `PosterApiName`) VALUES
(1, 'Eredet', '2010', 148, 8.8, 'Álmokon belüli rablás.', 'inception_url', 'inception_poster'),
(2, 'Ponyvaregény', '1994', 154, 8.9, 'Alvilági történetek összefonódása.', 'pulp_fiction_url', 'pulp_poster'),
(3, 'Interstellar', '2014', 169, 8.7, 'Utazás a csillagok közé az emberiség megmentéséért.', 'interstellar_url', 'interstellar_poster'),
(4, 'A sötét lovag', '2008', 152, 9.0, 'Batman harca Joker ellen.', 'dark_knight_url', 'batman_poster'),
(5, 'Mátrix', '1999', 136, 8.7, 'A valóság csak egy szimuláció.', 'matrix_url', 'matrix_poster');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `movieauthor`
--

CREATE TABLE `movieauthor` (
  `MovieId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `movieauthor`
--

INSERT INTO `movieauthor` (`MovieId`, `AuthorId`) VALUES
(1, 6),
(2, 7),
(3, 6),
(4, 6),
(5, 8),
(5, 9);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `purchases`
--

CREATE TABLE `purchases` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Price` int(11) DEFAULT NULL,
  `PurchaseStatus` varchar(128) DEFAULT NULL,
  `PurchaseDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `purchases`
--

INSERT INTO `purchases` (`Id`, `UserId`, `Price`, `PurchaseStatus`, `PurchaseDate`) VALUES
(1, 1, 2990, 'Success', '2023-01-10'),
(2, 3, 4500, 'Success', '2023-02-20'),
(3, 4, 2990, 'Success', '2023-08-01'),
(4, 1, 1500, 'Success', '2023-05-10'),
(5, 2, 990, 'Pending', '2023-12-15');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `series`
--

CREATE TABLE `series` (
  `Id` int(11) NOT NULL,
  `Title` varchar(128) NOT NULL,
  `Released` int(4) NOT NULL,
  `Rating` decimal(3,1) NOT NULL,
  `Description` text NOT NULL,
  `PosterApiName` varchar(2048) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `series`
--

INSERT INTO `series` (`Id`, `Title`, `Released`, `Rating`, `Description`, `PosterApiName`) VALUES
(1, 'Breaking Bad', 2008, 9.5, 'Kémiatanárból drogkirály.', 'bb_poster'),
(2, 'Stranger Things', 2016, 8.7, 'Természetfeletti jelenségek egy kisvárosban.', 'st_poster'),
(3, 'Csernobil', 2019, 9.4, 'Az 1986-os atomkatasztrófa története.', 'chernobyl_poster'),
(4, 'A mandalóri', 2019, 8.7, 'Fejvadász kalandjai a Star Wars univerzumban.', 'mando_poster'),
(5, 'Fekete tükör', 2011, 8.7, 'A technológia sötét oldala.', 'blackmirror_poster');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `seriesauthor`
--

CREATE TABLE `seriesauthor` (
  `SeriesId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `seriesauthor`
--

INSERT INTO `seriesauthor` (`SeriesId`, `AuthorId`) VALUES
(1, 10),
(2, 11),
(3, 12),
(4, 13),
(5, 14);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tags`
--

CREATE TABLE `tags` (
  `Id` int(11) NOT NULL,
  `Name` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tags`
--

INSERT INTO `tags` (`Id`, `Name`) VALUES
(6, 'Fantasy'),
(7, 'Sci-Fi'),
(8, 'Dráma'),
(9, 'Akció'),
(10, 'Horror');

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
  `ProfilePic` varchar(2048) NOT NULL,
  `Premium` tinyint(1) NOT NULL,
  `CreationDate` date NOT NULL,
  `LastLoginDate` date NOT NULL,
  `Level` int(11) NOT NULL,
  `BookPoints` int(11) NOT NULL,
  `SeriesPoints` int(11) NOT NULL,
  `MoviePoints` int(11) NOT NULL,
  `DayStreak` int(11) NOT NULL,
  `ReadTimeMin` int(11) NOT NULL,
  `WatchTimeMin` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user`
--

INSERT INTO `user` (`Id`, `Username`, `Email`, `PasswordHash`, `PasswordSalt`, `CountryCode`, `ProfilePic`, `Premium`, `CreationDate`, `LastLoginDate`, `Level`, `BookPoints`, `SeriesPoints`, `MoviePoints`, `DayStreak`, `ReadTimeMin`, `WatchTimeMin`) VALUES
(1, 'OlvasoElemer', 'elemer@example.com', 'hash1', 'salt1', 'HU', 'pic1.jpg', 1, '2023-01-10', '2023-12-20', 10, 500, 200, 150, 5, 1200, 600),
(2, 'KonyvMoly99', 'moly@example.com', 'hash2', 'salt2', 'HU', 'pic2.jpg', 0, '2023-05-15', '2023-12-18', 5, 250, 50, 80, 2, 600, 300),
(3, 'MoziOrult', 'mozi@example.com', 'hash3', 'salt3', 'US', 'pic3.jpg', 1, '2023-02-20', '2023-12-25', 15, 100, 600, 1200, 10, 200, 4500),
(4, 'SorozatFuggo', 'series@example.com', 'hash4', 'salt4', 'UK', 'pic4.jpg', 1, '2023-08-01', '2023-12-27', 12, 150, 900, 400, 20, 300, 2800),
(5, 'TesztElek', 'teszt@example.com', 'hash5', 'salt5', 'HU', 'pic5.jpg', 0, '2023-11-11', '2023-12-26', 2, 20, 10, 15, 1, 50, 40);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `userbooks`
--

CREATE TABLE `userbooks` (
  `UserId` int(11) NOT NULL,
  `BookId` int(11) NOT NULL,
  `Read` tinyint(1) DEFAULT NULL,
  `Favorite` tinyint(1) DEFAULT NULL,
  `Rating` decimal(3,1) DEFAULT NULL,
  `Status` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `userbooks`
--

INSERT INTO `userbooks` (`UserId`, `BookId`, `Read`, `Favorite`, `Rating`, `Status`) VALUES
(1, 1, 1, 1, 5.0, 'Completed'),
(1, 4, 0, 0, NULL, 'Reading'),
(2, 1, 1, 0, 4.0, 'Completed'),
(3, 5, 1, 1, 5.0, 'Completed'),
(5, 2, 0, 0, NULL, 'Dropped');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `usermovies`
--

CREATE TABLE `usermovies` (
  `UserId` int(11) NOT NULL,
  `MovieId` int(11) NOT NULL,
  `Saw` tinyint(1) DEFAULT NULL,
  `Favorite` tinyint(1) DEFAULT NULL,
  `Rating` decimal(3,1) DEFAULT NULL,
  `Status` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `usermovies`
--

INSERT INTO `usermovies` (`UserId`, `MovieId`, `Saw`, `Favorite`, `Rating`, `Status`) VALUES
(2, 3, 0, 1, 5.0, 'Watching'),
(5, 2, 1, 0, 4.0, 'Completed');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `userseries`
--

CREATE TABLE `userseries` (
  `UserId` int(11) NOT NULL,
  `SeriesId` int(11) NOT NULL,
  `Saw` tinyint(1) DEFAULT NULL,
  `Favorite` tinyint(1) DEFAULT NULL,
  `Rating` decimal(3,1) DEFAULT NULL,
  `Status` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `userseries`
--

INSERT INTO `userseries` (`UserId`, `SeriesId`, `Saw`, `Favorite`, `Rating`, `Status`) VALUES
(1, 3, 1, 1, 5.0, 'Completed'),
(2, 1, 0, 0, NULL, 'Plan to Watch'),
(3, 5, 1, 0, 4.0, 'Completed'),
(4, 1, 1, 1, 5.0, 'Completed'),
(4, 2, 1, 0, 4.5, 'Completed');

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
-- A tábla indexei `author`
--
ALTER TABLE `author`
  ADD PRIMARY KEY (`Id`);

--
-- A tábla indexei `book`
--
ALTER TABLE `book`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `PdfURL` (`PdfURL`) USING HASH,
  ADD UNIQUE KEY `CoverApiName` (`CoverApiName`) USING HASH;

--
-- A tábla indexei `bookauthor`
--
ALTER TABLE `bookauthor`
  ADD PRIMARY KEY (`BookId`,`AuthorId`),
  ADD KEY `AuthorId` (`AuthorId`);

--
-- A tábla indexei `episodes`
--
ALTER TABLE `episodes`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `SeriesId` (`SeriesId`);

--
-- A tábla indexei `movie`
--
ALTER TABLE `movie`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `PosterApiName` (`PosterApiName`) USING HASH,
  ADD UNIQUE KEY `StreamURL` (`StreamURL`) USING HASH;

--
-- A tábla indexei `movieauthor`
--
ALTER TABLE `movieauthor`
  ADD PRIMARY KEY (`MovieId`,`AuthorId`),
  ADD KEY `AuthorId` (`AuthorId`);

--
-- A tábla indexei `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `UserId` (`UserId`);

--
-- A tábla indexei `series`
--
ALTER TABLE `series`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `PosterApiName` (`PosterApiName`) USING HASH;

--
-- A tábla indexei `seriesauthor`
--
ALTER TABLE `seriesauthor`
  ADD PRIMARY KEY (`SeriesId`,`AuthorId`),
  ADD KEY `AuthorId` (`AuthorId`);

--
-- A tábla indexei `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`Id`);

--
-- A tábla indexei `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`Id`);

--
-- A tábla indexei `userbooks`
--
ALTER TABLE `userbooks`
  ADD PRIMARY KEY (`UserId`,`BookId`),
  ADD KEY `BookId` (`BookId`);

--
-- A tábla indexei `usermovies`
--
ALTER TABLE `usermovies`
  ADD PRIMARY KEY (`UserId`,`MovieId`),
  ADD KEY `MovieId` (`MovieId`);

--
-- A tábla indexei `userseries`
--
ALTER TABLE `userseries`
  ADD PRIMARY KEY (`UserId`,`SeriesId`),
  ADD KEY `SeriesId` (`SeriesId`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `achievement`
--
ALTER TABLE `achievement`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `author`
--
ALTER TABLE `author`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT a táblához `book`
--
ALTER TABLE `book`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `episodes`
--
ALTER TABLE `episodes`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT a táblához `movie`
--
ALTER TABLE `movie`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `purchases`
--
ALTER TABLE `purchases`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `series`
--
ALTER TABLE `series`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `tags`
--
ALTER TABLE `tags`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT a táblához `user`
--
ALTER TABLE `user`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `achievement`
--
ALTER TABLE `achievement`
  ADD CONSTRAINT `achievement_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `bookauthor`
--
ALTER TABLE `bookauthor`
  ADD CONSTRAINT `bookauthor_ibfk_1` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`),
  ADD CONSTRAINT `bookauthor_ibfk_2` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`Id`);

--
-- Megkötések a táblához `episodes`
--
ALTER TABLE `episodes`
  ADD CONSTRAINT `episodes_ibfk_1` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`);

--
-- Megkötések a táblához `movieauthor`
--
ALTER TABLE `movieauthor`
  ADD CONSTRAINT `movieauthor_ibfk_1` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`),
  ADD CONSTRAINT `movieauthor_ibfk_2` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`Id`);

--
-- Megkötések a táblához `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`);

--
-- Megkötések a táblához `seriesauthor`
--
ALTER TABLE `seriesauthor`
  ADD CONSTRAINT `seriesauthor_ibfk_1` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`),
  ADD CONSTRAINT `seriesauthor_ibfk_2` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`Id`);

--
-- Megkötések a táblához `userbooks`
--
ALTER TABLE `userbooks`
  ADD CONSTRAINT `userbooks_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`),
  ADD CONSTRAINT `userbooks_ibfk_2` FOREIGN KEY (`BookId`) REFERENCES `book` (`Id`);

--
-- Megkötések a táblához `usermovies`
--
ALTER TABLE `usermovies`
  ADD CONSTRAINT `usermovies_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`),
  ADD CONSTRAINT `usermovies_ibfk_2` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`Id`);

--
-- Megkötések a táblához `userseries`
--
ALTER TABLE `userseries`
  ADD CONSTRAINT `userseries_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`),
  ADD CONSTRAINT `userseries_ibfk_2` FOREIGN KEY (`SeriesId`) REFERENCES `series` (`Id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
