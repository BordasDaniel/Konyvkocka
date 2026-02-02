namespace KonyvkockaAPI.DTO.Response
{
    public class ErrorResponseDTO
    {
        public string Error { get; set; }
        public string Message { get; set; }
        public object? Details { get; set; }
        public int StatusCode { get; set; }
    }
}
