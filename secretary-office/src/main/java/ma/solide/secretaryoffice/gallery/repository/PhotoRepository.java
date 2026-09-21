package ma.solide.secretaryoffice.gallery.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.gallery.model.Photo;

public interface PhotoRepository extends JpaRepository<Photo, Integer> {

    List<Photo> findAllByAlbumIdAndSchoolIdOrderByCreatedAtDesc(Integer albumId, String schoolId);

    Optional<Photo> findByIdAndSchoolId(Integer id, String schoolId);

    long countByAlbumIdAndSchoolId(Integer albumId, String schoolId);
}
