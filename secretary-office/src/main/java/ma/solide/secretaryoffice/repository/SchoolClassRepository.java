package ma.solide.secretaryoffice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.SchoolClass;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Integer> {

    List<SchoolClass> findAllByOrderByNameAsc();
}

