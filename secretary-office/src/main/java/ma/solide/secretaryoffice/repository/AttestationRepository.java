package ma.solide.secretaryoffice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.Attestation;

public interface AttestationRepository extends JpaRepository<Attestation, Integer> {

    List<Attestation> findAllByOrderByDateDesc();

    List<Attestation> findByTitleContainingIgnoreCaseOrderByDateDesc(String search);

    List<Attestation> findByUserIdOrderByDateDesc(Integer userId);

    List<Attestation> findByUserIdAndTitleContainingIgnoreCaseOrderByDateDesc(Integer userId, String search);

    boolean existsByUserIdAndTypeAndStatus(Integer userId, String type, String status);
}

