namespace KonyvkockaAPI.DTO.Response
{
    public class RegisterResponseDTO
    {
        public string Message { get; set; } = string.Empty;
        public bool RequiresEmailVerification { get; set; } = true;
    }
}
