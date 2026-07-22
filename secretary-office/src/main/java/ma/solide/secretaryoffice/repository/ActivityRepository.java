package ma.solide.secretaryoffice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.Activity;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    List<Activity> findAllByOrderByDateAscIdAsc();
    List<Activity> findByTypeOrderByDateAscIdAsc(String type);
    List<Activity> findByTypeAndClassNameInOrderByDateAscIdAsc(String type, List<String> classNames);
    List<Activity> findByClassNameInOrderByDateAscIdAsc(List<String> classNames);
}

