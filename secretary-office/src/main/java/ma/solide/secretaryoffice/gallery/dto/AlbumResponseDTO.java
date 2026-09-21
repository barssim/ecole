package ma.solide.secretaryoffice.gallery.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumResponseDTO {
    private Integer id;
    private String title;
    private String description;
    private String coverPhotoUrl;
    private int photoCount;
    private String createdBy;
    private LocalDateTime createdAt;
}
