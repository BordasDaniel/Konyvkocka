-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Dec 17. 18:20
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
  `Rating` decimal(3,1) NOT NULL,
  `Description` text NOT NULL,
  `PdfURL` varchar(2048) NOT NULL,
  `CoverApiName` varchar(2048) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `bookauthor`
--

CREATE TABLE `bookauthor` (
  `BookId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `movieauthor`
--

CREATE TABLE `movieauthor` (
  `MovieId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `seriesauthor`
--

CREATE TABLE `seriesauthor` (
  `SeriesId` int(11) NOT NULL,
  `AuthorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tags`
--

CREATE TABLE `tags` (
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
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT a táblához `episodes`
--
ALTER TABLE `episodes`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `movie`
--
ALTER TABLE `movie`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `series`
--
ALTER TABLE `series`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `tags`
--
ALTER TABLE `tags`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `user`
--
ALTER TABLE `user`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

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
-- Megkötések a táblához `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`Id`) REFERENCES `achievement` (`UserId`) ON DELETE CASCADE ON UPDATE CASCADE;

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
