namespace KonyvkockaAPI.DTO.Response
{
    public class EpisodeDTO
    {
        public int Id { get; set; }
        public int SeasonNum { get; set; }
        public int EpisodeNum { get; set; }
        public string Title { get; set; }
        public string StreamUrl { get; set; }
        public int Length { get; set; }  // percben
    }
}
