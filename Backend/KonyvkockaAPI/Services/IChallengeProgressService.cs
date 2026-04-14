namespace KonyvkockaAPI.Services
{
    public interface IChallengeProgressService
    {
        Task RecalculateForUserAsync(int userId, CancellationToken cancellationToken = default);
    }
}