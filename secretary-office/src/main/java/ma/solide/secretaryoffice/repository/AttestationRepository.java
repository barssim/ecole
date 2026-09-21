package ma.solide.secretaryoffice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.Attestation;

public interface AttestationRepository extends JpaRepository<Attestation, Integer> {

    List<Attestation> findAllBySchoolIdOrderByDateDesc(String schoolId);

    List<Attestation> findBySchoolIdAndTitleContainingIgnoreCaseOrderByDateDesc(String schoolId, String search);

    List<Attestation> findBySchoolIdAndUserIdOrderByDateDesc(String schoolId, Integer userId);

    List<Attestation> findBySchoolIdAndUserIdAndTitleContainingIgnoreCaseOrderByDateDesc(String schoolId, Integer userId, String search);

    boolean existsBySchoolIdAndUserIdAndTypeAndStatus(String schoolId, Integer userId, String type, String status);

    java.util.Optional<Attestation> findByIdAndSchoolId(Integer id, String schoolId);
}


