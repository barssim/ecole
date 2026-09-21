package ma.solide.secretaryoffice.gallery.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import ma.solide.secretaryoffice.gallery.dto.AlbumRequestDTO;
import ma.solide.secretaryoffice.gallery.dto.AlbumResponseDTO;
import ma.solide.secretaryoffice.gallery.dto.PhotoResponseDTO;
import ma.solide.secretaryoffice.gallery.service.GalleryService;
import ma.solide.secretaryoffice.gallery.service.GalleryStorageService;

@RestController
@RequestMapping("/api/gallery")
public class GalleryController {

    private final GalleryService galleryService;
    private final GalleryStorageService storageService;

    public GalleryController(GalleryService galleryService, GalleryStorageService storageService) {
        this.galleryService = galleryService;
        this.storageService = storageService;
    }

    @GetMapping("/albums")
    public ResponseEntity<List<AlbumResponseDTO>> getAlbums() {
        return ResponseEntity.ok(galleryService.getAlbums());
    }

    @PostMapping("/albums")
    @ResponseStatus(HttpStatus.CREATED)
    public AlbumResponseDTO createAlbum(
            @RequestBody AlbumRequestDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader,
            @RequestHeader(value = "X-User-Name", required = false) String userNameHeader) {
        galleryService.requireManager(rolesHeader);
        return galleryService.createAlbum(dto, userNameHeader);
    }

    @DeleteMapping("/albums/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAlbum(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        galleryService.requireManager(rolesHeader);
        galleryService.deleteAlbum(id);
    }

    @GetMapping("/albums/{id}/photos")
    public ResponseEntity<List<PhotoResponseDTO>> getPhotos(@PathVariable Integer id) {
        return ResponseEntity.ok(galleryService.getPhotos(id));
    }

    @PostMapping(value = "/albums/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PhotoResponseDTO addPhoto(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader,
            @RequestHeader(value = "X-User-Name", required = false) String userNameHeader) {
        galleryService.requireManager(rolesHeader);
        return galleryService.addPhoto(id, file, caption, userNameHeader);
    }

    @DeleteMapping("/photos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePhoto(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        galleryService.requireManager(rolesHeader);
        galleryService.deletePhoto(id);
    }

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> download(@PathVariable String filename) {
        Resource resource = storageService.load(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/uploads")
    public ResponseEntity<?> downloadByKey(@RequestParam("key") String key) {
        if (storageService.usesS3()) {
            return ResponseEntity.status(302)
                    .location(URI.create(storageService.presignedUrl(key)))
                    .build();
        }
        Resource resource = storageService.load(key);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
