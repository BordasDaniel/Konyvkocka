namespace KonyvkockaAPI.DTO.Response
{
    public class SuccessResponseDTO<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
    }
}
