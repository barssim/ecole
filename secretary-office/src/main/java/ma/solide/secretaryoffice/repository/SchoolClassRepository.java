package ma.solide.secretaryoffice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import ma.solide.secretaryoffice.model.SchoolClass;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Integer> {

    List<SchoolClass> findAllByTenantIdOrderByNameAsc(String tenantId);

    @Query("""
            select distinct c
            from SchoolClass c
            join c.teachers t
            where c.tenantId = :tenantId
              and lower(trim(t)) = lower(trim(:teacherName))
            order by c.name asc
            """)
    List<SchoolClass> findAllByTenantIdAndTeacherNameOrderByNameAsc(
            @Param("tenantId") String tenantId,
            @Param("teacherName") String teacherName
    );

    boolean existsByTenantIdAndNameIgnoreCase(String tenantId, String name);

    java.util.Optional<SchoolClass> findByIdAndTenantId(Integer id, String tenantId);

    boolean existsByIdAndTenantId(Integer id, String tenantId);
}

