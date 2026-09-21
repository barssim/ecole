package ma.solide.schoolactivity.repository;

import java.util.List;
import java.util.Optional;

import ma.solide.schoolactivity.model.SchoolActivity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolActivityRepository extends JpaRepository<SchoolActivity, Integer> {

    List<SchoolActivity> findAllBySchoolIdOrderByDateAscIdAsc(String schoolId);

    List<SchoolActivity> findBySchoolIdAndTypeOrderByDateAscIdAsc(String schoolId, String type);

    Optional<SchoolActivity> findByIdAndSchoolId(Integer id, String schoolId);
}
