package ma.solide.studentservice.config;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

@Component
public class MusterTestDataInitializer implements ApplicationRunner {
    private final DataSource dataSource;
    private final boolean enabled;

    public MusterTestDataInitializer(DataSource dataSource,
            @Value("${muster.test-data.enabled:false}") boolean enabled) {
        this.dataSource = dataSource;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        execute("muster-test-data-cleanup.sql");
        if (enabled) execute("muster-test-data.sql");
    }

    private void execute(String resource) {
        new ResourceDatabasePopulator(new ClassPathResource(resource)).execute(dataSource);
    }
}
