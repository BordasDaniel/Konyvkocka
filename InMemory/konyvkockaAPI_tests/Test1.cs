using KonyvkockaAPI.Controllers;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace konyvkockaAPI_tests;

[TestClass]
public class ContentAndNewsControllerTests
{
    [TestMethod]
    public async Task GetNews_ValidFilter_ReturnsFilteredOrderedArticles()
    {
        await using var context = CreateInMemoryContext();

        context.Articles.AddRange(
            new Article
            {
                Id = 1,
                Title = "Régi update",
                EventTag = "UPDATE",
                Content = "Régebbi frissítés",
                CreatedAt = new DateTime(2024, 01, 10)
            },
            new Article
            {
                Id = 2,
                Title = "Új update",
                EventTag = "UPDATE",
                Content = "Legújabb frissítés",
                CreatedAt = new DateTime(2024, 04, 11)
            },
            new Article
            {
                Id = 3,
                Title = "Event hír",
                EventTag = "EVENT",
                Content = "Esemény leírás",
                CreatedAt = new DateTime(2024, 03, 01)
            });

        await context.SaveChangesAsync();

        var controller = new NewsController(context);

        var actionResult = await controller.GetNews("update", 1, 10);

        var okResult = actionResult as OkObjectResult;
        Assert.IsNotNull(okResult);
        Assert.IsNotNull(okResult.Value);

        var total = GetProperty<int>(okResult.Value, "total");
        var articles = GetProperty<List<NewsArticleDTO>>(okResult.Value, "articles");

        Assert.AreEqual(2, total);
        Assert.AreEqual(2, articles.Count);
        Assert.AreEqual("Új update", articles[0].Title);
        Assert.AreEqual("Régi update", articles[1].Title);
    }

    [TestMethod]
    public async Task GetNews_InvalidFilter_ReturnsBadRequest()
    {
        await using var context = CreateInMemoryContext();
        var controller = new NewsController(context);

        var actionResult = await controller.GetNews("invalid-filter", 1, 20);

        Assert.IsInstanceOfType<BadRequestObjectResult>(actionResult);
    }

    [TestMethod]
    public async Task SearchContent_ByTypeAndTags_ReturnsOnlyMatchingBooks()
    {
        await using var context = CreateInMemoryContext();

        var age12 = new AgeRating { Id = 1, Name = "12+", MinAge = 12 };
        var age16 = new AgeRating { Id = 2, Name = "16+", MinAge = 16 };

        var fantasy = new Tag { Id = 1, Name = "Fantasy" };
        var drama = new Tag { Id = 2, Name = "Dráma" };

        var matchingBook = new Book
        {
            Id = 1,
            Title = "Alma könyve",
            Released = 2025,
            PageNum = 280,
            Rating = 4.7m,
            Description = "Fantasy történet",
            CoverApiName = "alma.jpg",
            Type = "BOOK",
            RewardXp = 10,
            RewardPoints = 5,
            AgeRating = age12,
            Tags = new List<Tag> { fantasy }
        };

        var nonMatchingBook = new Book
        {
            Id = 2,
            Title = "Körte könyve",
            Released = 2023,
            PageNum = 320,
            Rating = 3.9m,
            Description = "Más műfaj",
            CoverApiName = "korte.jpg",
            Type = "BOOK",
            RewardXp = 10,
            RewardPoints = 5,
            AgeRating = age16,
            Tags = new List<Tag> { drama }
        };

        var movie = new Movie
        {
            Id = 1,
            Title = "Alma film",
            Released = 2025,
            Length = 110,
            Rating = 4.8m,
            Description = "Film leírás",
            StreamUrl = "https://stream/alma",
            PosterApiName = "alma-film.jpg",
            RewardXp = 10,
            RewardPoints = 5,
            AgeRating = age12,
            Tags = new List<Tag> { fantasy }
        };

        context.AgeRatings.AddRange(age12, age16);
        context.Tags.AddRange(fantasy, drama);
        context.Books.AddRange(matchingBook, nonMatchingBook);
        context.Movies.Add(movie);

        await context.SaveChangesAsync();

        var controller = new ContentController(context);

        var actionResult = await controller.SearchContent(
            q: "Alma",
            type: "book",
            ageRatings: "12+",
            tags: "Fantasy",
            sort: "relevancia",
            limit: 20,
            offset: 0);

        var okResult = actionResult as OkObjectResult;
        Assert.IsNotNull(okResult);

        var response = okResult.Value as SearchResponseDTO;
        Assert.IsNotNull(response);
        Assert.AreEqual(1, response.Total);
        Assert.AreEqual(1, response.Items.Count);
        Assert.AreEqual("Alma könyve", response.Items[0].Title);
        Assert.AreEqual("book", response.Items[0].Type);
    }

    private static KonyvkockaContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<KonyvkockaContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new KonyvkockaContext(options);
    }

    private static T GetProperty<T>(object source, string propertyName)
    {
        var property = source.GetType().GetProperty(propertyName);
        Assert.IsNotNull(property, $"A(z) '{propertyName}' property nem található.");

        var value = property.GetValue(source);
        Assert.IsNotNull(value, $"A(z) '{propertyName}' property értéke null.");

        return (T)value;
    }
}
