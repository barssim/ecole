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
public class PhotoResponseDTO {
    private Integer id;
    private Integer albumId;
    private String url;
    private String caption;
    private String createdBy;
    private LocalDateTime createdAt;
}
