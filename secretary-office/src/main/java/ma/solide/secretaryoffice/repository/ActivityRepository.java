package ma.solide.secretaryoffice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.Activity;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    List<Activity> findAllBySchoolIdOrderByDateAscIdAsc(String schoolId);
    List<Activity> findBySchoolIdAndTypeOrderByDateAscIdAsc(String schoolId, String type);
    List<Activity> findBySchoolIdAndTypeAndClassNameInOrderByDateAscIdAsc(String schoolId, String type, List<String> classNames);
    List<Activity> findBySchoolIdAndClassNameInOrderByDateAscIdAsc(String schoolId, List<String> classNames);
    java.util.Optional<Activity> findByIdAndSchoolId(Integer id, String schoolId);
    boolean existsByIdAndSchoolId(Integer id, String schoolId);
}


