using Microsoft.AspNetCore.Mvc;

namespace KonyvkockaAPI.Controllers
{
    [ApiController]
    [Route("api/proxy")]
    public class ProxyController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ProxyController> _logger;

        public ProxyController(IHttpClientFactory httpClientFactory, ILogger<ProxyController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet("pdf")]
        public async Task<IActionResult> GetPdf([FromQuery] string url, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                return BadRequest("Missing url query parameter.");
            }

            if (!Uri.TryCreate(url, UriKind.Absolute, out var targetUri)
                || (targetUri.Scheme != Uri.UriSchemeHttp && targetUri.Scheme != Uri.UriSchemeHttps))
            {
                return BadRequest("Invalid PDF URL.");
            }

            var client = _httpClientFactory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Get, targetUri);
            request.Headers.UserAgent.ParseAdd("KonyvkockaAPI/1.0");
            request.Headers.Accept.ParseAdd("application/pdf");

            using var response = await client.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode);
            }

            var contentType = response.Content.Headers.ContentType?.MediaType ?? "application/octet-stream";
            if (!contentType.Contains("pdf", StringComparison.OrdinalIgnoreCase)
                && !contentType.Equals("application/octet-stream", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Proxy fetched non-PDF content type from {Url}: {ContentType}", targetUri, contentType);
            }

            var bytes = await response.Content.ReadAsByteArrayAsync(cancellationToken);
            if (bytes.Length < 5
                || bytes[0] != 0x25
                || bytes[1] != 0x50
                || bytes[2] != 0x44
                || bytes[3] != 0x46
                || bytes[4] != 0x2D)
            {
                _logger.LogWarning("Proxy fetched non-PDF payload from {Url}. First bytes: {B0:X2} {B1:X2} {B2:X2} {B3:X2} {B4:X2}",
                    targetUri,
                    bytes.Length > 0 ? bytes[0] : (byte)0,
                    bytes.Length > 1 ? bytes[1] : (byte)0,
                    bytes.Length > 2 ? bytes[2] : (byte)0,
                    bytes.Length > 3 ? bytes[3] : (byte)0,
                    bytes.Length > 4 ? bytes[4] : (byte)0);

                return BadRequest("The provided URL did not return a valid PDF file.");
            }

            return File(bytes, "application/pdf", enableRangeProcessing: false);
        }
    }
}
