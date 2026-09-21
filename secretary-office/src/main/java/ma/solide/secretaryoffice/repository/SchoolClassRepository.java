package ma.solide.secretaryoffice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import ma.solide.secretaryoffice.model.SchoolClass;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Integer> {

    List<SchoolClass> findAllBySchoolIdOrderByNameAsc(String schoolId);

    @Query("""
            select distinct c
            from SchoolClass c
            join c.teachers t
            where c.schoolId = :schoolId
              and lower(trim(t)) = lower(trim(:teacherName))
            order by c.name asc
            """)
    List<SchoolClass> findAllBySchoolIdAndTeacherNameOrderByNameAsc(
            @Param("schoolId") String schoolId,
            @Param("teacherName") String teacherName
    );

    boolean existsBySchoolIdAndNameIgnoreCase(String schoolId, String name);

    java.util.Optional<SchoolClass> findByIdAndSchoolId(Integer id, String schoolId);

    boolean existsByIdAndSchoolId(Integer id, String schoolId);
}


