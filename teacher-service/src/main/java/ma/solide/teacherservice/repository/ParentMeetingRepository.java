package ma.solide.teacherservice.repository;

import java.util.List;

import ma.solide.teacherservice.model.ParentMeeting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentMeetingRepository extends JpaRepository<ParentMeeting, Long> {

    List<ParentMeeting> findAllByTenantIdOrderByMeetingDateAsc(String tenantId);
}

