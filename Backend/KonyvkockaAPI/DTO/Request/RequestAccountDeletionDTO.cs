using System.ComponentModel.DataAnnotations;

namespace KonyvkockaAPI.DTO.Request
{
    public class RequestAccountDeletionDTO
    {
        /// <summary>
        /// A kliens által küldött SHA256 jelszó hash (plain password hash).
        /// A szerver ezt a tárolt salt-tal újra hash-eli és ellenőrzi.
        /// </summary>
        [Required]
        public string PasswordHash { get; set; } = null!;
    }
}
