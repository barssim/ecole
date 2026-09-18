package ma.solide.notification_service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class TenantEmailService {

    private static final Logger log = LoggerFactory.getLogger(TenantEmailService.class);

    private final JdbcTemplate jdbcTemplate;

    public TenantEmailService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String resolveTenantEmail(String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            return null;
        }

        try {
            return jdbcTemplate.queryForObject(
                    "SELECT tenant_email FROM tb_tenant WHERE tenant_id = ?",
                    String.class,
                    tenantId
            );
        } catch (Exception ex) {
            log.warn("No tenant email found for tenantId={}, fallback to default sender", tenantId, ex);
            return null;
        }
    }
}
