using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Models;

public partial class KonyvkockaContext : DbContext
{
    public KonyvkockaContext()
    {
    }

    public KonyvkockaContext(DbContextOptions<KonyvkockaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AgeRating> AgeRatings { get; set; }

    public virtual DbSet<Article> Articles { get; set; }

    public virtual DbSet<Badge> Badges { get; set; }

    public virtual DbSet<Book> Books { get; set; }

    public virtual DbSet<Challenge> Challenges { get; set; }

    public virtual DbSet<DeletedUser> DeletedUsers { get; set; }

    public virtual DbSet<Episode> Episodes { get; set; }

    public virtual DbSet<Mail> Mail { get; set; }

    public virtual DbSet<Movie> Movies { get; set; }

    public virtual DbSet<Purchase> Purchases { get; set; }

    public virtual DbSet<SecurityAuditLog> SecurityAuditLogs { get; set; }

    public virtual DbSet<Series> Series { get; set; }

    public virtual DbSet<Tag> Tags { get; set; }

    public virtual DbSet<Title> Titles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserBadge> UserBadges { get; set; }

    public virtual DbSet<UserBook> UserBooks { get; set; }

    public virtual DbSet<UserChallenge> UserChallenges { get; set; }

    public virtual DbSet<UserMovie> UserMovies { get; set; }

    public virtual DbSet<UserRankCache> UserRankCaches { get; set; }

    public virtual DbSet<UserSeries> UserSeries { get; set; }

    public virtual DbSet<UserTitle> UserTitles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySQL("SERVER=localhost;PORT=3306;DATABASE=konyvkocka;USER=root;PASSWORD=;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AgeRating>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("age_rating");

            entity.HasIndex(e => e.Name, "Name").IsUnique();

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.MinAge).HasColumnType("int(11)");
            entity.Property(e => e.Name).HasMaxLength(32);
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("article");

            entity.HasIndex(e => e.CreatedAt, "idx_article_created");

            entity.HasIndex(e => e.EventTag, "idx_article_event_tag");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Content).HasColumnType("text");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.EventTag).HasColumnType("enum('UPDATE','ANNOUNCEMENT','EVENT','FUNCTION')");
            entity.Property(e => e.Title).HasMaxLength(256);
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<Badge>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("badge");

            entity.HasIndex(e => e.Category, "idx_badge_category");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Category).HasColumnType("enum('EVENT','STREAK','READING','WATCHING','SOCIAL','SPECIAL')");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.IconUrl)
                .HasMaxLength(512)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("IconURL");
            entity.Property(e => e.Name).HasMaxLength(128);
            entity.Property(e => e.Rarity)
                .HasDefaultValueSql("'''COMMON'''")
                .HasColumnType("enum('COMMON','RARE','EPIC','LEGENDARY')");
        });

        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("book");

            entity.HasIndex(e => e.AgeRatingId, "AgeRatingId");

            entity.HasIndex(e => e.CoverApiName, "CoverApiName").IsUnique();

            entity.HasIndex(e => e.OriginalLanguage, "idx_book_language");

            entity.HasIndex(e => e.IsOfflineAvailable, "idx_book_offline");

            entity.HasIndex(e => e.Rating, "idx_book_rating");

            entity.HasIndex(e => e.Released, "idx_book_released");

            entity.HasIndex(e => e.Type, "idx_book_type");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.AgeRatingId)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.AudioLength)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.AudioUrl)
                .HasMaxLength(512)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("AudioURL");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.EpubUrl)
                .HasMaxLength(512)
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
                .HasMaxLength(512)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("PdfURL");
            entity.Property(e => e.Rating).HasPrecision(3, 1);
            entity.Property(e => e.Released).HasColumnType("year(4)");
            entity.Property(e => e.RewardPoints)
                .HasDefaultValueSql("'50'")
                .HasColumnType("int(11)");
            entity.Property(e => e.RewardXp)
                .HasDefaultValueSql("'100'")
                .HasColumnType("int(11)")
                .HasColumnName("RewardXP");
            entity.Property(e => e.Title).HasMaxLength(128);
            entity.Property(e => e.Type)
                .HasDefaultValueSql("'''BOOK'''")
                .HasColumnType("enum('BOOK','AUDIOBOOK','EBOOK')");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.AgeRating).WithMany(p => p.Books)
                .HasForeignKey(d => d.AgeRatingId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("book_age_rating_fk");

            entity.HasMany(d => d.Tags).WithMany(p => p.Books)
                .UsingEntity<Dictionary<string, object>>(
                    "BookTag",
                    r => r.HasOne<Tag>().WithMany()
                        .HasForeignKey("TagId")
                        .HasConstraintName("book_tag_tag_fk"),
                    l => l.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .HasConstraintName("book_tag_book_fk"),
                    j =>
                    {
                        j.HasKey("BookId", "TagId").HasName("PRIMARY");
                        j.ToTable("book_tag");
                        j.HasIndex(new[] { "TagId" }, "TagId");
                        j.HasIndex(new[] { "TagId", "BookId" }, "idx_book_tag_tag_book");
                        j.IndexerProperty<int>("BookId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("TagId").HasColumnType("int(11)");
                    });
        });

        modelBuilder.Entity<Challenge>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("challenge");

            entity.HasIndex(e => e.RewardBadgeId, "challenge_badge_fk");

            entity.HasIndex(e => e.RewardTitleId, "challenge_title_fk");

            entity.HasIndex(e => new { e.Type, e.IsActive }, "idx_type_active");

            entity.HasIndex(e => new { e.IsActive, e.Difficulty }, "idx_user_challenge_active_difficulty");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.Difficulty)
                .HasDefaultValueSql("'''EASY'''")
                .HasColumnType("enum('EASY','MEDIUM','HARD','EPIC')");
            entity.Property(e => e.IconUrl)
                .HasMaxLength(512)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("IconURL");
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValueSql("'1'");
            entity.Property(e => e.RewardBadgeId)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.RewardTitleId)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.RewardXp)
                .HasColumnType("int(11)")
                .HasColumnName("RewardXP");
            entity.Property(e => e.TargetValue).HasColumnType("int(11)");
            entity.Property(e => e.Title).HasMaxLength(128);
            entity.Property(e => e.Type).HasColumnType("enum('READ','WATCH','SOCIAL','MIXED','DEDICATION','EVENT')");

            entity.HasOne(d => d.RewardBadge).WithMany(p => p.Challenges)
                .HasForeignKey(d => d.RewardBadgeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("challenge_badge_fk");

            entity.HasOne(d => d.RewardTitle).WithMany(p => p.Challenges)
                .HasForeignKey(d => d.RewardTitleId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("challenge_title_fk");
        });

        modelBuilder.Entity<DeletedUser>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("deleted_user");

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
            entity.Property(e => e.PermissionLevel)
                .HasDefaultValueSql("'''USER'''")
                .HasColumnType("enum('USER','MODERATOR','ADMIN')");
            entity.Property(e => e.PremiumExpiresAt)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.ProfilePic).HasMaxLength(512);
            entity.Property(e => e.ReadTimeMin).HasColumnType("int(11)");
            entity.Property(e => e.SeriesPoints).HasColumnType("int(11)");
            entity.Property(e => e.Username).HasMaxLength(128);
            entity.Property(e => e.WatchTimeMin).HasColumnType("int(11)");
            entity.Property(e => e.Xp)
                .HasColumnType("int(11)")
                .HasColumnName("XP");
        });

        modelBuilder.Entity<Episode>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("episode");

            entity.HasIndex(e => e.SeriesId, "SeriesId");

            entity.HasIndex(e => new { e.SeriesId, e.SeasonNum, e.EpisodeNum }, "unique_series_season_episode").IsUnique();

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.EpisodeNum).HasColumnType("int(11)");
            entity.Property(e => e.Length).HasColumnType("int(11)");
            entity.Property(e => e.SeasonNum).HasColumnType("int(11)");
            entity.Property(e => e.SeriesId).HasColumnType("int(11)");
            entity.Property(e => e.StreamUrl)
                .HasMaxLength(512)
                .HasColumnName("StreamURL");
            entity.Property(e => e.Title).HasMaxLength(128);
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Series).WithMany(p => p.Episodes)
                .HasForeignKey(d => d.SeriesId)
                .HasConstraintName("episode_series_fk");
        });

        modelBuilder.Entity<Mail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("mail");

            entity.HasIndex(e => e.ReceiverId, "ReceiverId");

            entity.HasIndex(e => e.SenderId, "SenderId");

            entity.HasIndex(e => e.CreatedAt, "idx_mail_created");

            entity.HasIndex(e => new { e.ReceiverId, e.IsRead }, "idx_mail_receiver_read");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.IsRead).HasDefaultValueSql("'0'");
            entity.Property(e => e.Message).HasColumnType("text");
            entity.Property(e => e.ReceiverId).HasColumnType("int(11)");
            entity.Property(e => e.SenderId)
                .HasDefaultValueSql("'1'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Subject).HasMaxLength(255);
            entity.Property(e => e.Type).HasColumnType("enum('SYSTEM','FRIEND','CHALLENGE','PURCHASE')");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Receiver).WithMany(p => p.MailReceivers)
                .HasForeignKey(d => d.ReceiverId)
                .HasConstraintName("mail_receiver_fk");

            entity.HasOne(d => d.Sender).WithMany(p => p.MailSenders)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("mail_sender_fk");
        });

        modelBuilder.Entity<Movie>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("movie");

            entity.HasIndex(e => e.AgeRatingId, "AgeRatingId");

            entity.HasIndex(e => e.PosterApiName, "PosterApiName").IsUnique();

            entity.HasIndex(e => e.StreamUrl, "StreamURL").IsUnique();

            entity.HasIndex(e => e.IsOfflineAvailable, "idx_movie_offline");

            entity.HasIndex(e => e.Rating, "idx_movie_rating");

            entity.HasIndex(e => e.Released, "idx_movie_released");

            entity.HasIndex(e => new { e.HasSubtitles, e.IsOriginalLanguage }, "idx_movie_subtitle_language");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.AgeRatingId)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.Length).HasColumnType("int(4)");
            entity.Property(e => e.PosterApiName).HasMaxLength(512);
            entity.Property(e => e.Rating).HasPrecision(3, 1);
            entity.Property(e => e.Released).HasColumnType("year(4)");
            entity.Property(e => e.RewardPoints)
                .HasDefaultValueSql("'40'")
                .HasColumnType("int(11)");
            entity.Property(e => e.RewardXp)
                .HasDefaultValueSql("'80'")
                .HasColumnType("int(11)")
                .HasColumnName("RewardXP");
            entity.Property(e => e.StreamUrl)
                .HasMaxLength(512)
                .HasColumnName("StreamURL");
            entity.Property(e => e.Title).HasMaxLength(128);
            entity.Property(e => e.TrailerUrl)
                .HasMaxLength(512)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("TrailerURL");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.AgeRating).WithMany(p => p.Movies)
                .HasForeignKey(d => d.AgeRatingId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("movie_age_rating_fk");

            entity.HasMany(d => d.Tags).WithMany(p => p.Movies)
                .UsingEntity<Dictionary<string, object>>(
                    "MovieTag",
                    r => r.HasOne<Tag>().WithMany()
                        .HasForeignKey("TagId")
                        .HasConstraintName("movie_tag_tag_fk"),
                    l => l.HasOne<Movie>().WithMany()
                        .HasForeignKey("MovieId")
                        .HasConstraintName("movie_tag_movie_fk"),
                    j =>
                    {
                        j.HasKey("MovieId", "TagId").HasName("PRIMARY");
                        j.ToTable("movie_tag");
                        j.HasIndex(new[] { "TagId" }, "TagId");
                        j.HasIndex(new[] { "TagId", "MovieId" }, "idx_movie_tag_tag_movie");
                        j.IndexerProperty<int>("MovieId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("TagId").HasColumnType("int(11)");
                    });
        });

        modelBuilder.Entity<Purchase>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("purchase");

            entity.HasIndex(e => e.UserId, "UserId");

            entity.HasIndex(e => e.PurchaseStatus, "idx_purchase_status");

            entity.HasIndex(e => e.UpdatedAt, "idx_purchase_updated");

            entity.HasIndex(e => new { e.UserId, e.PurchaseDate }, "idx_purchase_user_date");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Price)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.PurchaseDate)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("date");
            entity.Property(e => e.PurchaseStatus)
                .HasDefaultValueSql("'''PENDING'''")
                .HasColumnType("enum('PENDING','SUCCESS','FAILED','REFUNDED')");
            entity.Property(e => e.Tier)
                .HasDefaultValueSql("'''ONE_M'''")
                .HasColumnType("enum('ONE_M','QUARTER_Y','FULL_Y')");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserId).HasColumnType("int(11)");

            entity.HasOne(d => d.User).WithMany(p => p.Purchases)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("purchase_user_fk");
        });

        modelBuilder.Entity<SecurityAuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("security_audit_log");

            entity.HasIndex(e => e.Action, "idx_security_audit_action");

            entity.HasIndex(e => e.CreatedAt, "idx_security_audit_created");

            entity.HasIndex(e => e.UserId, "idx_security_audit_user");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.Details)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("text");
            entity.Property(e => e.Status).HasColumnType("enum('VERIFIED','SUSPICIOUS')");
            entity.Property(e => e.UserId)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");

            entity.HasOne(d => d.User).WithMany(p => p.SecurityAuditLogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("security_audit_user_fk");
        });

        modelBuilder.Entity<Series>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("series");

            entity.HasIndex(e => e.AgeRatingId, "AgeRatingId");

            entity.HasIndex(e => e.PosterApiName, "PosterApiName").IsUnique();

            entity.HasIndex(e => e.IsOfflineAvailable, "idx_series_offline");

            entity.HasIndex(e => e.Rating, "idx_series_rating");

            entity.HasIndex(e => e.Released, "idx_series_released");

            entity.HasIndex(e => new { e.HasSubtitles, e.IsOriginalLanguage }, "idx_series_subtitles_language");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.AgeRatingId)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.PosterApiName).HasMaxLength(512);
            entity.Property(e => e.Rating).HasPrecision(3, 1);
            entity.Property(e => e.Released).HasColumnType("int(4)");
            entity.Property(e => e.RewardPoints)
                .HasDefaultValueSql("'75'")
                .HasColumnType("int(11)");
            entity.Property(e => e.RewardXp)
                .HasDefaultValueSql("'150'")
                .HasColumnType("int(11)")
                .HasColumnName("RewardXP");
            entity.Property(e => e.Title).HasMaxLength(128);
            entity.Property(e => e.TrailerUrl)
                .HasMaxLength(512)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("TrailerURL");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.AgeRating).WithMany(p => p.Series)
                .HasForeignKey(d => d.AgeRatingId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("series_age_rating_fk");

            entity.HasMany(d => d.Tags).WithMany(p => p.Series)
                .UsingEntity<Dictionary<string, object>>(
                    "SeriesTag",
                    r => r.HasOne<Tag>().WithMany()
                        .HasForeignKey("TagId")
                        .HasConstraintName("series_tag_tag_fk"),
                    l => l.HasOne<Series>().WithMany()
                        .HasForeignKey("SeriesId")
                        .HasConstraintName("series_tag_series_fk"),
                    j =>
                    {
                        j.HasKey("SeriesId", "TagId").HasName("PRIMARY");
                        j.ToTable("series_tag");
                        j.HasIndex(new[] { "TagId" }, "TagId");
                        j.HasIndex(new[] { "TagId", "SeriesId" }, "idx_series_tag_tag_series");
                        j.IndexerProperty<int>("SeriesId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("TagId").HasColumnType("int(11)");
                    });
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("tag");

            entity.HasIndex(e => e.Name, "unique_tag_name").IsUnique();

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Name).HasMaxLength(128);
        });

        modelBuilder.Entity<Title>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("title");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Description)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("text");
            entity.Property(e => e.Name).HasMaxLength(128);
            entity.Property(e => e.Rarity)
                .HasDefaultValueSql("'''COMMON'''")
                .HasColumnType("enum('COMMON','RARE','EPIC','LEGENDARY')");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("user");

            entity.HasIndex(e => e.Email, "Email").IsUnique();

            entity.HasIndex(e => e.Username, "Username").IsUnique();

            entity.HasIndex(e => e.CreationDate, "idx_user_creation_date");

            entity.HasIndex(e => e.LastLoginDate, "idx_user_last_login");

            entity.HasIndex(e => e.Premium, "idx_user_premium");

            entity.HasIndex(e => e.PremiumExpiresAt, "idx_user_premium_expires");

            entity.HasIndex(e => e.UpdatedAt, "idx_user_updated");

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
            entity.Property(e => e.PermissionLevel)
                .HasDefaultValueSql("'''USER'''")
                .HasColumnType("enum('USER','MODERATOR','ADMIN')");
            entity.Property(e => e.PremiumExpiresAt)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.ProfilePic).HasMaxLength(512);
            entity.Property(e => e.ReadTimeMin).HasColumnType("int(11)");
            entity.Property(e => e.SeriesPoints).HasColumnType("int(11)");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.Username).HasMaxLength(128);
            entity.Property(e => e.WatchTimeMin).HasColumnType("int(11)");
            entity.Property(e => e.Xp)
                .HasColumnType("int(11)")
                .HasColumnName("XP");
        });

        modelBuilder.Entity<UserBadge>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.BadgeId }).HasName("PRIMARY");

            entity.ToTable("user_badge");

            entity.HasIndex(e => e.BadgeId, "BadgeId");

            entity.Property(e => e.UserId).HasColumnType("int(11)");
            entity.Property(e => e.BadgeId).HasColumnType("int(11)");
            entity.Property(e => e.EarnedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Badge).WithMany(p => p.UserBadges)
                .HasForeignKey(d => d.BadgeId)
                .HasConstraintName("user_badge_badge_fk");

            entity.HasOne(d => d.User).WithMany(p => p.UserBadges)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_badge_user_fk");
        });

        modelBuilder.Entity<UserBook>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.BookId }).HasName("PRIMARY");

            entity.ToTable("user_book");

            entity.HasIndex(e => e.BookId, "BookId");

            entity.HasIndex(e => e.AddedAt, "idx_user_book_added");

            entity.HasIndex(e => e.Favorite, "idx_user_book_favorite");

            entity.HasIndex(e => e.Status, "idx_user_book_status");

            entity.HasIndex(e => new { e.UserId, e.Favorite }, "idx_user_book_user_favorite");

            entity.HasIndex(e => new { e.UserId, e.LastSeen }, "idx_user_book_user_lastseen");

            entity.HasIndex(e => new { e.UserId, e.Status }, "idx_user_book_user_status");

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
            entity.Property(e => e.RemainingCompletions)
                .HasDefaultValueSql("'3'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED')");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

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

            entity.HasIndex(e => new { e.UserId, e.Status }, "idx_user_challenge_user_status");

            entity.HasIndex(e => e.UserId, "idx_user_challenge_user_updated");

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
            entity.Property(e => e.StartedAt)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'''NOT_STARTED'''")
                .HasColumnType("enum('NOT_STARTED','IN_PROGRESS','COMPLETED','CLAIMED')");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
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

            entity.HasIndex(e => new { e.UserId, e.Favorite }, "idx_user_movie_user_favorite");

            entity.HasIndex(e => new { e.UserId, e.LastSeen }, "idx_user_movie_user_lastseen");

            entity.HasIndex(e => new { e.UserId, e.Status }, "idx_user_movie_user_status");

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
            entity.Property(e => e.RemainingCompletions)
                .HasDefaultValueSql("'3'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED')");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Movie).WithMany(p => p.UserMovies)
                .HasForeignKey(d => d.MovieId)
                .HasConstraintName("user_movie_movie_fk");

            entity.HasOne(d => d.User).WithMany(p => p.UserMovies)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_movie_user_fk");
        });

        modelBuilder.Entity<UserRankCache>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PRIMARY");

            entity.ToTable("user_rank_cache");

            entity.HasIndex(e => e.CountryRankBook, "idx_country_rank_book");

            entity.HasIndex(e => e.CountryRankMedia, "idx_country_rank_media");

            entity.HasIndex(e => e.CountryRankTotal, "idx_country_rank_total");

            entity.HasIndex(e => e.GlobalRankBook, "idx_global_rank_book");

            entity.HasIndex(e => e.GlobalRankMedia, "idx_global_rank_media");

            entity.HasIndex(e => e.GlobalRankTotal, "idx_global_rank_total");

            entity.HasIndex(e => e.TotalPoints, "idx_total_points");

            entity.Property(e => e.UserId).HasColumnType("int(11)");
            entity.Property(e => e.BookPoints).HasColumnType("int(11)");
            entity.Property(e => e.CountryRankBook)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)")
                .HasColumnName("CountryRank_Book");
            entity.Property(e => e.CountryRankMedia)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)")
                .HasColumnName("CountryRank_Media");
            entity.Property(e => e.CountryRankTotal)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)")
                .HasColumnName("CountryRank_Total");
            entity.Property(e => e.GlobalRankBook)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)")
                .HasColumnName("GlobalRank_Book");
            entity.Property(e => e.GlobalRankMedia)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)")
                .HasColumnName("GlobalRank_Media");
            entity.Property(e => e.GlobalRankTotal)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)")
                .HasColumnName("GlobalRank_Total");
            entity.Property(e => e.LastUpdated)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");
            entity.Property(e => e.MediaPoints).HasColumnType("int(11)");
            entity.Property(e => e.TotalPoints).HasColumnType("int(11)");

            entity.HasOne(d => d.User).WithOne(p => p.UserRankCache)
                .HasForeignKey<UserRankCache>(d => d.UserId)
                .HasConstraintName("user_rank_cache_user_fk");
        });

        modelBuilder.Entity<UserSeries>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.SeriesId }).HasName("PRIMARY");

            entity.ToTable("user_series");

            entity.HasIndex(e => e.SeriesId, "SeriesId");

            entity.HasIndex(e => e.AddedAt, "idx_user_series_added");

            entity.HasIndex(e => e.Favorite, "idx_user_series_favorite");

            entity.HasIndex(e => e.Status, "idx_user_series_status");

            entity.HasIndex(e => new { e.UserId, e.Favorite }, "idx_user_series_user_favorite");

            entity.HasIndex(e => new { e.UserId, e.LastSeen }, "idx_user_series_user_lastseen");

            entity.HasIndex(e => new { e.UserId, e.Status }, "idx_user_series_user_status");

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
            entity.Property(e => e.RemainingCompletions)
                .HasDefaultValueSql("'3'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("enum('WATCHING','COMPLETED','PAUSED','DROPPED','PLANNED','ARCHIVED')");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Series).WithMany(p => p.UserSeries)
                .HasForeignKey(d => d.SeriesId)
                .HasConstraintName("user_series_series_fk");

            entity.HasOne(d => d.User).WithMany(p => p.UserSeries)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_series_user_fk");
        });

        modelBuilder.Entity<UserTitle>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.TitleId }).HasName("PRIMARY");

            entity.ToTable("user_title");

            entity.HasIndex(e => e.TitleId, "TitleId");

            entity.Property(e => e.UserId).HasColumnType("int(11)");
            entity.Property(e => e.TitleId).HasColumnType("int(11)");
            entity.Property(e => e.EarnedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Title).WithMany(p => p.UserTitles)
                .HasForeignKey(d => d.TitleId)
                .HasConstraintName("user_title_title_fk");

            entity.HasOne(d => d.User).WithMany(p => p.UserTitles)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_title_user_fk");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
