namespace KonyvkockaAPI.DTO.Response
{
    //Part of AUTH DTOs
    public class UserMeDTO
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Avatar { get; set; }
        public bool IsSubscriber { get; set; }
        public string PermissionLevel { get; set; }
       
    }
}
