package ma.solide.secretaryoffice.gallery.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.gallery.model.Album;

public interface AlbumRepository extends JpaRepository<Album, Integer> {

    List<Album> findAllBySchoolIdOrderByCreatedAtDesc(String schoolId);

    Optional<Album> findByIdAndSchoolId(Integer id, String schoolId);
}
