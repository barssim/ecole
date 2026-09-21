package ma.solide.notification_service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SchoolEmailService {

    private static final Logger log = LoggerFactory.getLogger(SchoolEmailService.class);

    private final JdbcTemplate jdbcTemplate;

    public SchoolEmailService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String resolveSchoolEmail(String schoolId) {
        if (schoolId == null || schoolId.isBlank()) {
            return null;
        }

        try {
            return jdbcTemplate.queryForObject(
                    "SELECT school_email FROM tb_school WHERE school_id = ?",
                    String.class,
                    schoolId
            );
        } catch (Exception ex) {
            log.warn("No school email found for schoolId={}, fallback to default sender", schoolId, ex);
            return null;
        }
    }
}
