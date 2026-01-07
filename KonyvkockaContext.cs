using System;
using System.Collections.Generic;
using KonyvkockaAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI;

public partial class KonyvkockaContext : DbContext
{
    public KonyvkockaContext()
    {
    }

    public KonyvkockaContext(DbContextOptions<KonyvkockaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Achievement> Achievements { get; set; }

    public virtual DbSet<AgeRating> AgeRatings { get; set; }

    public virtual DbSet<Author> Authors { get; set; }

    public virtual DbSet<Book> Books { get; set; }

    public virtual DbSet<Challenge> Challenges { get; set; }

    public virtual DbSet<ContentCategory> ContentCategories { get; set; }

    public virtual DbSet<Episode> Episodes { get; set; }

    public virtual DbSet<Genre> Genres { get; set; }

    public virtual DbSet<Mail> Mail { get; set; }

    public virtual DbSet<Movie> Movies { get; set; }

    public virtual DbSet<Purchase> Purchases { get; set; }

    public virtual DbSet<Series> Series { get; set; }

    public virtual DbSet<Tag> Tags { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserBook> UserBooks { get; set; }

    public virtual DbSet<UserChallenge> UserChallenges { get; set; }

    public virtual DbSet<UserMovie> UserMovies { get; set; }

    public virtual DbSet<UserSeries> UserSeries { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySQL("SERVER=localhost;PORT=3306;DATABASE=konyvkocka;USER=root;PASSWORD=;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Achievement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("achievement");

            entity.HasIndex(e => e.UserId, "UserId");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.AchieveDate).HasColumnType("date");
            entity.Property(e => e.Category).HasMaxLength(128);
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.LogoUrl)
                .HasMaxLength(2048)
                .HasColumnName("LogoURL");
            entity.Property(e => e.Title).HasMaxLength(128);
            entity.Property(e => e.UserId).HasColumnType("int(11)");

            entity.HasOne(d => d.User).WithMany(p => p.Achievements)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("achievement_user_fk");
        });

        modelBuilder.Entity<AgeRating>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("age_rating");

            entity.HasIndex(e => e.Name, "Name").IsUnique();

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.MinAge).HasColumnType("int(11)");
            entity.Property(e => e.Name).HasMaxLength(32);
        });

        modelBuilder.Entity<Author>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("author");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Name).HasMaxLength(128);
        });

        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("book");

            entity.HasIndex(e => e.AgeRatingId, "AgeRatingId");

            entity.HasIndex(e => e.CoverApiName, "CoverApiName").IsUnique();

            entity.HasIndex(e => e.Type, "idx_book_type");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.AgeRatingId)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.AudioLength)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.AudioUrl)
                .HasMaxLength(2048)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("AudioURL");
            entity.Property(e => e.CoverApiName).HasMaxLength(2048);
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.EpubUrl)
                .HasMaxLength(2048)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("EpubURL");
            entity.Property(e => e.NarratorName)
                .HasMaxLength(128)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.OriginalLanguage)
                .HasMaxLength(64)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.PageNum).HasColumnType("int(4)");
            entity.Property(e => e.PdfUrl)
                .HasMaxLength(2048)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("PdfURL");
            entity.Property(e => e.Rating).HasPrecision(3, 1);
            entity.Property(e => e.Released).HasColumnType("year(4)");
            entity.Property(e => e.Title).HasMaxLength(128);
            entity.Property(e => e.Type)
                .HasDefaultValueSql("'''BOOK'''")
                .HasColumnType("enum('BOOK','AUDIOBOOK','EBOOK')");

            entity.HasOne(d => d.AgeRating).WithMany(p => p.Books)
                .HasForeignKey(d => d.AgeRatingId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("book_age_rating_fk");

            entity.HasMany(d => d.Authors).WithMany(p => p.Books)
                .UsingEntity<Dictionary<string, object>>(
                    "BookAuthor",
                    r => r.HasOne<Author>().WithMany()
                        .HasForeignKey("AuthorId")
                        .HasConstraintName("book_author_author_fk"),
                    l => l.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .HasConstraintName("book_author_book_fk"),
                    j =>
                    {
                        j.HasKey("BookId", "AuthorId").HasName("PRIMARY");
                        j.ToTable("book_author");
                        j.HasIndex(new[] { "AuthorId" }, "AuthorId");
                        j.IndexerProperty<int>("BookId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("AuthorId").HasColumnType("int(11)");
                    });

            entity.HasMany(d => d.Categories).WithMany(p => p.Books)
                .UsingEntity<Dictionary<string, object>>(
                    "BookCategory",
                    r => r.HasOne<ContentCategory>().WithMany()
                        .HasForeignKey("CategoryId")
                        .HasConstraintName("book_category_category_fk"),
                    l => l.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .HasConstraintName("book_category_book_fk"),
                    j =>
                    {
                        j.HasKey("BookId", "CategoryId").HasName("PRIMARY");
                        j.ToTable("book_category");
                        j.HasIndex(new[] { "CategoryId" }, "CategoryId");
                        j.IndexerProperty<int>("BookId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("CategoryId").HasColumnType("int(11)");
                    });

            entity.HasMany(d => d.Genres).WithMany(p => p.Books)
                .UsingEntity<Dictionary<string, object>>(
                    "BookGenre",
                    r => r.HasOne<Genre>().WithMany()
                        .HasForeignKey("GenreId")
                        .HasConstraintName("book_genre_genre_fk"),
                    l => l.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .HasConstraintName("book_genre_book_fk"),
                    j =>
                    {
                        j.HasKey("BookId", "GenreId").HasName("PRIMARY");
                        j.ToTable("book_genre");
                        j.HasIndex(new[] { "GenreId" }, "GenreId");
                        j.IndexerProperty<int>("BookId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("GenreId").HasColumnType("int(11)");
                    });
        });

        modelBuilder.Entity<Challenge>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("challenge");

            entity.HasIndex(e => new { e.Type, e.IsActive }, "idx_type_active");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.Difficulty)
                .HasDefaultValueSql("'''EASY'''")
                .HasColumnType("enum('EASY','MEDIUM','HARD','EPIC')");
            entity.Property(e => e.IconUrl)
                .HasMaxLength(2048)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("IconURL");
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValueSql("'1'");
            entity.Property(e => e.RewardType)
                .HasDefaultValueSql("'''XP'''")
                .HasColumnType("enum('XP','ACHIEVEMENT','BADGE','PREMIUM_DAYS')");
            entity.Property(e => e.RewardXp)
                .HasColumnType("int(11)")
                .HasColumnName("RewardXP");
            entity.Property(e => e.TargetValue).HasColumnType("int(11)");
            entity.Property(e => e.Title).HasMaxLength(128);
            entity.Property(e => e.Type).HasColumnType("enum('BOOK','MOVIE','SERIES','READING_TIME','WATCH_TIME','STREAK','SOCIAL','MIXED')");
        });

        modelBuilder.Entity<ContentCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("content_category");

            entity.HasIndex(e => e.Name, "Name").IsUnique();

            entity.HasIndex(e => new { e.Name, e.Type }, "idx_category_name_type");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Name).HasMaxLength(64);
            entity.Property(e => e.Type).HasColumnType("enum('LANGUAGE','ADAPTATION','FORMAT')");
        });

        modelBuilder.Entity<Episode>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("episode");

            entity.HasIndex(e => e.SeriesId, "SeriesId");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.EpisodeNum).HasColumnType("int(11)");
            entity.Property(e => e.Length).HasColumnType("int(11)");
            entity.Property(e => e.SeasonNum).HasColumnType("int(11)");
            entity.Property(e => e.SeriesId).HasColumnType("int(11)");
            entity.Property(e => e.StreamUrl)
                .HasMaxLength(2048)
                .HasColumnName("StreamURL");
            entity.Property(e => e.Title).HasMaxLength(128);

            entity.HasOne(d => d.Series).WithMany(p => p.Episodes)
                .HasForeignKey(d => d.SeriesId)
                .HasConstraintName("episode_series_fk");
        });

        modelBuilder.Entity<Genre>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("genre");

            entity.HasIndex(e => e.Name, "Name").IsUnique();

            entity.HasIndex(e => e.Name, "idx_genre_name");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Name).HasMaxLength(64);
        });

        modelBuilder.Entity<Mail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("mail");

            entity.HasIndex(e => e.ReceiverId, "ReceiverId");

            entity.HasIndex(e => e.SenderId, "SenderId");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.IsRead).HasDefaultValueSql("'0'");
            entity.Property(e => e.Message).HasColumnType("text");
            entity.Property(e => e.ReceiverId).HasColumnType("int(11)");
            entity.Property(e => e.SenderId)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Subject).HasMaxLength(255);
            entity.Property(e => e.Type).HasColumnType("enum('ALL','SYSTEM','FRIEND','CHALLENGE','PURCHASE')");

            entity.HasOne(d => d.Receiver).WithMany(p => p.MailReceivers)
                .HasForeignKey(d => d.ReceiverId)
                .HasConstraintName("mail_receiver_fk");

            entity.HasOne(d => d.Sender).WithMany(p => p.MailSenders)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("mail_sender_fk");
        });

        modelBuilder.Entity<Movie>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("movie");

            entity.HasIndex(e => e.AgeRatingId, "AgeRatingId");

            entity.HasIndex(e => e.PosterApiName, "PosterApiName").IsUnique();

            entity.HasIndex(e => e.StreamUrl, "StreamURL").IsUnique();

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.AgeRatingId)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.Length).HasColumnType("int(4)");
            entity.Property(e => e.PosterApiName).HasMaxLength(2048);
            entity.Property(e => e.Rating).HasPrecision(3, 1);
            entity.Property(e => e.Released).HasColumnType("year(4)");
            entity.Property(e => e.StreamUrl)
                .HasMaxLength(2048)
                .HasColumnName("StreamURL");
            entity.Property(e => e.Title).HasMaxLength(128);
            entity.Property(e => e.TrailerUrl)
                .HasMaxLength(2048)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("TrailerURL");

            entity.HasOne(d => d.AgeRating).WithMany(p => p.Movies)
                .HasForeignKey(d => d.AgeRatingId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("movie_age_rating_fk");

            entity.HasMany(d => d.Authors).WithMany(p => p.Movies)
                .UsingEntity<Dictionary<string, object>>(
                    "MovieAuthor",
                    r => r.HasOne<Author>().WithMany()
                        .HasForeignKey("AuthorId")
                        .HasConstraintName("movie_author_author_fk"),
                    l => l.HasOne<Movie>().WithMany()
                        .HasForeignKey("MovieId")
                        .HasConstraintName("movie_author_movie_fk"),
                    j =>
                    {
                        j.HasKey("MovieId", "AuthorId").HasName("PRIMARY");
                        j.ToTable("movie_author");
                        j.HasIndex(new[] { "AuthorId" }, "AuthorId");
                        j.IndexerProperty<int>("MovieId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("AuthorId").HasColumnType("int(11)");
                    });

            entity.HasMany(d => d.Categories).WithMany(p => p.Movies)
                .UsingEntity<Dictionary<string, object>>(
                    "MovieCategory",
                    r => r.HasOne<ContentCategory>().WithMany()
                        .HasForeignKey("CategoryId")
                        .HasConstraintName("movie_category_category_fk"),
                    l => l.HasOne<Movie>().WithMany()
                        .HasForeignKey("MovieId")
                        .HasConstraintName("movie_category_movie_fk"),
                    j =>
                    {
                        j.HasKey("MovieId", "CategoryId").HasName("PRIMARY");
                        j.ToTable("movie_category");
                        j.HasIndex(new[] { "CategoryId" }, "CategoryId");
                        j.IndexerProperty<int>("MovieId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("CategoryId").HasColumnType("int(11)");
                    });

            entity.HasMany(d => d.Genres).WithMany(p => p.Movies)
                .UsingEntity<Dictionary<string, object>>(
                    "MovieGenre",
                    r => r.HasOne<Genre>().WithMany()
                        .HasForeignKey("GenreId")
                        .HasConstraintName("movie_genre_genre_fk"),
                    l => l.HasOne<Movie>().WithMany()
                        .HasForeignKey("MovieId")
                        .HasConstraintName("movie_genre_movie_fk"),
                    j =>
                    {
                        j.HasKey("MovieId", "GenreId").HasName("PRIMARY");
                        j.ToTable("movie_genre");
                        j.HasIndex(new[] { "GenreId" }, "GenreId");
                        j.IndexerProperty<int>("MovieId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("GenreId").HasColumnType("int(11)");
                    });
        });

        modelBuilder.Entity<Purchase>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("purchase");

            entity.HasIndex(e => e.UserId, "UserId");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Price)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.PurchaseDate)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("date");
            entity.Property(e => e.PurchaseStatus)
                .HasMaxLength(128)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.UserId).HasColumnType("int(11)");

            entity.HasOne(d => d.User).WithMany(p => p.Purchases)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("purchase_user_fk");
        });

        modelBuilder.Entity<Series>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("series");

            entity.HasIndex(e => e.AgeRatingId, "AgeRatingId");

            entity.HasIndex(e => e.PosterApiName, "PosterApiName").IsUnique();

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.AgeRatingId)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.PosterApiName).HasMaxLength(2048);
            entity.Property(e => e.Rating).HasPrecision(3, 1);
            entity.Property(e => e.Released).HasColumnType("int(4)");
            entity.Property(e => e.Title).HasMaxLength(128);
            entity.Property(e => e.TrailerUrl)
                .HasMaxLength(2048)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("TrailerURL");

            entity.HasOne(d => d.AgeRating).WithMany(p => p.Series)
                .HasForeignKey(d => d.AgeRatingId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("series_age_rating_fk");

            entity.HasMany(d => d.Authors).WithMany(p => p.Series)
                .UsingEntity<Dictionary<string, object>>(
                    "SeriesAuthor",
                    r => r.HasOne<Author>().WithMany()
                        .HasForeignKey("AuthorId")
                        .HasConstraintName("series_author_author_fk"),
                    l => l.HasOne<Series>().WithMany()
                        .HasForeignKey("SeriesId")
                        .HasConstraintName("series_author_series_fk"),
                    j =>
                    {
                        j.HasKey("SeriesId", "AuthorId").HasName("PRIMARY");
                        j.ToTable("series_author");
                        j.HasIndex(new[] { "AuthorId" }, "AuthorId");
                        j.IndexerProperty<int>("SeriesId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("AuthorId").HasColumnType("int(11)");
                    });

            entity.HasMany(d => d.Categories).WithMany(p => p.Series)
                .UsingEntity<Dictionary<string, object>>(
                    "SeriesCategory",
                    r => r.HasOne<ContentCategory>().WithMany()
                        .HasForeignKey("CategoryId")
                        .HasConstraintName("series_category_category_fk"),
                    l => l.HasOne<Series>().WithMany()
                        .HasForeignKey("SeriesId")
                        .HasConstraintName("series_category_series_fk"),
                    j =>
                    {
                        j.HasKey("SeriesId", "CategoryId").HasName("PRIMARY");
                        j.ToTable("series_category");
                        j.HasIndex(new[] { "CategoryId" }, "CategoryId");
                        j.IndexerProperty<int>("SeriesId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("CategoryId").HasColumnType("int(11)");
                    });

            entity.HasMany(d => d.Genres).WithMany(p => p.Series)
                .UsingEntity<Dictionary<string, object>>(
                    "SeriesGenre",
                    r => r.HasOne<Genre>().WithMany()
                        .HasForeignKey("GenreId")
                        .HasConstraintName("series_genre_genre_fk"),
                    l => l.HasOne<Series>().WithMany()
                        .HasForeignKey("SeriesId")
                        .HasConstraintName("series_genre_series_fk"),
                    j =>
                    {
                        j.HasKey("SeriesId", "GenreId").HasName("PRIMARY");
                        j.ToTable("series_genre");
                        j.HasIndex(new[] { "GenreId" }, "GenreId");
                        j.IndexerProperty<int>("SeriesId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("GenreId").HasColumnType("int(11)");
                    });
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("tag");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Name).HasMaxLength(128);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("user");

            entity.HasIndex(e => e.Email, "Email").IsUnique();

            entity.HasIndex(e => e.Username, "Username").IsUnique();

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.BookPoints).HasColumnType("int(11)");
            entity.Property(e => e.CountryCode)
                .HasMaxLength(2)
                .IsFixedLength();
            entity.Property(e => e.CreationDate).HasColumnType("date");
            entity.Property(e => e.DayStreak).HasColumnType("int(11)");
            entity.Property(e => e.Email).HasMaxLength(128);
            entity.Property(e => e.LastLoginDate).HasColumnType("date");
            entity.Property(e => e.Level)
                .HasDefaultValueSql("'1'")
                .HasColumnType("int(11)");
            entity.Property(e => e.MoviePoints).HasColumnType("int(11)");
            entity.Property(e => e.PasswordHash).HasColumnType("text");
            entity.Property(e => e.PasswordSalt).HasColumnType("text");
            entity.Property(e => e.ProfilePic).HasMaxLength(2048);
            entity.Property(e => e.ReadTimeMin).HasColumnType("int(11)");
            entity.Property(e => e.SeriesPoints).HasColumnType("int(11)");
            entity.Property(e => e.Username).HasMaxLength(128);
            entity.Property(e => e.WatchTimeMin).HasColumnType("int(11)");
        });

        modelBuilder.Entity<UserBook>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.BookId }).HasName("PRIMARY");

            entity.ToTable("user_book");

            entity.HasIndex(e => e.BookId, "BookId");

            entity.HasIndex(e => e.AddedAt, "idx_user_book_added");

            entity.HasIndex(e => e.Favorite, "idx_user_book_favorite");

            entity.HasIndex(e => e.Status, "idx_user_book_status");

            entity.Property(e => e.UserId).HasColumnType("int(11)");
            entity.Property(e => e.BookId).HasColumnType("int(11)");
            entity.Property(e => e.AddedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.CompletedAt)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.CurrentAudioPosition)
                .HasDefaultValueSql("'0'")
                .HasColumnType("int(11)");
            entity.Property(e => e.CurrentPage)
                .HasDefaultValueSql("'0'")
                .HasColumnType("int(11)");
            entity.Property(e => e.LastSeen)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.Rating)
                .HasPrecision(3, 1)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED')");

            entity.HasOne(d => d.Book).WithMany(p => p.UserBooks)
                .HasForeignKey(d => d.BookId)
                .HasConstraintName("user_book_book_fk");

            entity.HasOne(d => d.User).WithMany(p => p.UserBooks)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_book_user_fk");
        });

        modelBuilder.Entity<UserChallenge>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("user_challenge");

            entity.HasIndex(e => e.ChallengeId, "ChallengeId");

            entity.HasIndex(e => e.UserId, "UserId");

            entity.HasIndex(e => e.Status, "idx_status");

            entity.HasIndex(e => new { e.UserId, e.ChallengeId }, "user_challenge_unique").IsUnique();

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.ChallengeId).HasColumnType("int(11)");
            entity.Property(e => e.ClaimedAt)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.CompletedAt)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.CurrentValue).HasColumnType("int(11)");
            entity.Property(e => e.LastUpdated)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.StartedAt)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'''NOT_STARTED'''")
                .HasColumnType("enum('NOT_STARTED','IN_PROGRESS','COMPLETED','CLAIMED')");
            entity.Property(e => e.UserId).HasColumnType("int(11)");

            entity.HasOne(d => d.Challenge).WithMany(p => p.UserChallenges)
                .HasForeignKey(d => d.ChallengeId)
                .HasConstraintName("user_challenge_challenge_fk");

            entity.HasOne(d => d.User).WithMany(p => p.UserChallenges)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_challenge_user_fk");
        });

        modelBuilder.Entity<UserMovie>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.MovieId }).HasName("PRIMARY");

            entity.ToTable("user_movie");

            entity.HasIndex(e => e.MovieId, "MovieId");

            entity.HasIndex(e => e.AddedAt, "idx_user_movie_added");

            entity.HasIndex(e => e.Favorite, "idx_user_movie_favorite");

            entity.HasIndex(e => e.Status, "idx_user_movie_status");

            entity.Property(e => e.UserId).HasColumnType("int(11)");
            entity.Property(e => e.MovieId).HasColumnType("int(11)");
            entity.Property(e => e.AddedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.CompletedAt)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.CurrentPosition)
                .HasDefaultValueSql("'0'")
                .HasColumnType("int(11)");
            entity.Property(e => e.LastSeen)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.Rating)
                .HasPrecision(3, 1)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED')");

            entity.HasOne(d => d.Movie).WithMany(p => p.UserMovies)
                .HasForeignKey(d => d.MovieId)
                .HasConstraintName("user_movie_movie_fk");

            entity.HasOne(d => d.User).WithMany(p => p.UserMovies)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_movie_user_fk");
        });

        modelBuilder.Entity<UserSeries>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.SeriesId }).HasName("PRIMARY");

            entity.ToTable("user_series");

            entity.HasIndex(e => e.SeriesId, "SeriesId");

            entity.HasIndex(e => e.AddedAt, "idx_user_series_added");

            entity.HasIndex(e => e.Favorite, "idx_user_series_favorite");

            entity.HasIndex(e => e.Status, "idx_user_series_status");

            entity.Property(e => e.UserId).HasColumnType("int(11)");
            entity.Property(e => e.SeriesId).HasColumnType("int(11)");
            entity.Property(e => e.AddedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.CompletedAt)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.CurrentEpisode)
                .HasDefaultValueSql("'1'")
                .HasColumnType("int(11)");
            entity.Property(e => e.CurrentPosition)
                .HasDefaultValueSql("'0'")
                .HasColumnType("int(11)");
            entity.Property(e => e.CurrentSeason)
                .HasDefaultValueSql("'1'")
                .HasColumnType("int(11)");
            entity.Property(e => e.LastSeen)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.Rating)
                .HasPrecision(3, 1)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED')");

            entity.HasOne(d => d.Series).WithMany(p => p.UserSeries)
                .HasForeignKey(d => d.SeriesId)
                .HasConstraintName("user_series_series_fk");

            entity.HasOne(d => d.User).WithMany(p => p.UserSeries)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_series_user_fk");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
