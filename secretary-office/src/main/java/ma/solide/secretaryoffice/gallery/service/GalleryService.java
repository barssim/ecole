package ma.solide.secretaryoffice.gallery.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.gallery.dto.AlbumRequestDTO;
import ma.solide.secretaryoffice.gallery.dto.AlbumResponseDTO;
import ma.solide.secretaryoffice.gallery.dto.PhotoResponseDTO;
import ma.solide.secretaryoffice.gallery.model.Album;
import ma.solide.secretaryoffice.gallery.model.Photo;
import ma.solide.secretaryoffice.gallery.repository.AlbumRepository;
import ma.solide.secretaryoffice.gallery.repository.PhotoRepository;
import ma.solide.secretaryoffice.school.SchoolContext;

@Service
public class GalleryService {

    private static final Set<String> MANAGE_ROLES = Set.of("admin", "manager");

    private final AlbumRepository albumRepository;
    private final PhotoRepository photoRepository;
    private final GalleryStorageService storageService;

    public GalleryService(AlbumRepository albumRepository, PhotoRepository photoRepository,
                           GalleryStorageService storageService) {
        this.albumRepository = albumRepository;
        this.photoRepository = photoRepository;
        this.storageService = storageService;
    }

    public void requireManager(String rolesHeader) {
        if (!hasAnyRole(rolesHeader, MANAGE_ROLES)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin or manager can manage the gallery");
        }
    }

    public List<AlbumResponseDTO> getAlbums() {
        String schoolId = SchoolContext.getRequiredSchoolId();
        return albumRepository.findAllBySchoolIdOrderByCreatedAtDesc(schoolId).stream()
                .map(this::toAlbumResponse)
                .toList();
    }

    public AlbumResponseDTO createAlbum(AlbumRequestDTO dto, String createdBy) {
        if (dto == null || !StringUtils.hasText(dto.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        String schoolId = SchoolContext.getRequiredSchoolId();
        Album album = Album.builder()
                .schoolId(schoolId)
                .title(dto.getTitle().trim())
                .description(StringUtils.hasText(dto.getDescription()) ? dto.getDescription().trim() : null)
                .createdBy(StringUtils.hasText(createdBy) ? createdBy.trim() : "admin")
                .createdAt(LocalDateTime.now())
                .build();
        return toAlbumResponse(albumRepository.save(album));
    }

    public void deleteAlbum(Integer albumId) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        Album album = findAlbum(schoolId, albumId);
        album.getPhotos().forEach(photo -> storageService.delete(photo.getObjectKey()));
        albumRepository.delete(album);
    }

    public List<PhotoResponseDTO> getPhotos(Integer albumId) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        findAlbum(schoolId, albumId);
        return photoRepository.findAllByAlbumIdAndSchoolIdOrderByCreatedAtDesc(albumId, schoolId).stream()
                .map(this::toPhotoResponse)
                .toList();
    }

    public PhotoResponseDTO addPhoto(Integer albumId, MultipartFile file, String caption, String createdBy) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        Album album = findAlbum(schoolId, albumId);

        var stored = storageService.store(file);
        Photo photo = Photo.builder()
                .schoolId(schoolId)
                .album(album)
                .url(stored.get("url"))
                .objectKey(stored.get("objectKey"))
                .caption(StringUtils.hasText(caption) ? caption.trim() : null)
                .createdBy(StringUtils.hasText(createdBy) ? createdBy.trim() : "admin")
                .createdAt(LocalDateTime.now())
                .build();
        Photo saved = photoRepository.save(photo);

        if (!StringUtils.hasText(album.getCoverPhotoUrl())) {
            album.setCoverPhotoUrl(saved.getUrl());
            albumRepository.save(album);
        }

        return toPhotoResponse(saved);
    }

    public void deletePhoto(Integer photoId) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        Photo photo = photoRepository.findByIdAndSchoolId(photoId, schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));
        Album album = photo.getAlbum();
        storageService.delete(photo.getObjectKey());
        photoRepository.delete(photo);

        if (album.getCoverPhotoUrl() != null && album.getCoverPhotoUrl().equals(photo.getUrl())) {
            List<Photo> remaining = photoRepository.findAllByAlbumIdAndSchoolIdOrderByCreatedAtDesc(album.getId(), schoolId);
            album.setCoverPhotoUrl(remaining.isEmpty() ? null : remaining.get(0).getUrl());
            albumRepository.save(album);
        }
    }

    private Album findAlbum(String schoolId, Integer albumId) {
        return albumRepository.findByIdAndSchoolId(albumId, schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found"));
    }

    private AlbumResponseDTO toAlbumResponse(Album album) {
        return AlbumResponseDTO.builder()
                .id(album.getId())
                .title(album.getTitle())
                .description(album.getDescription())
                .coverPhotoUrl(album.getCoverPhotoUrl())
                .photoCount((int) photoRepository.countByAlbumIdAndSchoolId(album.getId(), album.getSchoolId()))
                .createdBy(album.getCreatedBy())
                .createdAt(album.getCreatedAt())
                .build();
    }

    private PhotoResponseDTO toPhotoResponse(Photo photo) {
        return PhotoResponseDTO.builder()
                .id(photo.getId())
                .albumId(photo.getAlbum().getId())
                .url(photo.getUrl())
                .caption(photo.getCaption())
                .createdBy(photo.getCreatedBy())
                .createdAt(photo.getCreatedAt())
                .build();
    }

    private boolean hasAnyRole(String rolesHeader, Set<String> expectedRoles) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return false;
        }
        String[] rawRoles = rolesHeader.split(",");
        for (String rawRole : rawRoles) {
            String role = rawRole.trim().toLowerCase(Locale.ROOT);
            if (role.isEmpty()) {
                continue;
            }
            for (String expected : expectedRoles) {
                if (role.equals(expected) || role.equals("role_" + expected) || role.endsWith("_" + expected)) {
                    return true;
                }
            }
        }
        return false;
    }
}
