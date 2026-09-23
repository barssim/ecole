package ma.solide.usermanagement.config;

import java.util.List;
import java.util.stream.IntStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ma.solide.usermanagement.model.User;
import ma.solide.usermanagement.repository.UserRepository;

@Component
public class MusterTestDataInitializer implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(MusterTestDataInitializer.class);
    private static final String SCHOOL_ID = "muster";
    private static final String DEFAULT_PASSWORD = "333333";
    private static final int FIRST_USER_ID = 10001;

    private static final List<SeedUser> SEED_USERS = List.of(
            new SeedUser("Bouchra", "Mme.", "bouchra", "bouchra", "بشرى", "manager", "admin@muster-school.com", "Management Office"),
            new SeedUser("Ahmed", "Mr.", "ahmed", "ahmed", "أحمد", "manager", "manager2@muster.test", "Management Office"),
            new SeedUser("Hamid", "Mr.", "hamid", "hamid", "حميد", "teacher", "teacher1@muster.test", "Mathematics"),
            new SeedUser("Fatima", "Mme.", "fatima", "fatima", "فاطمة", "teacher", "teacher2@muster.test", "German"),
            new SeedUser("Omar", "Mr.", "omar", "omar", "عمر", "teacher", "teacher3@muster.test", "English"),
            new SeedUser("Salma", "Mme.", "salma", "salma", "سلمى", "teacher", "teacher4@muster.test", "Science"),
            new SeedUser("Karim", "Mr.", "karim", "karim", "كريم", "teacher", "teacher5@muster.test", "Sports"),
            new SeedUser("Adam", "Mr.", "adam", "adam", "آدم", "student", "student1@muster.test", "Class 1A"),
            new SeedUser("Amira", "Mme.", "amira", "amira", "أميرة", "student", "student2@muster.test", "Class 1A"),
            new SeedUser("Bilal", "Mr.", "bilal", "bilal", "بلال", "student", "student3@muster.test", "Class 1A"),
            new SeedUser("Chaima", "Mme.", "chaima", "chaïma", "شيماء", "student", "student4@muster.test", "Class 1A"),
            new SeedUser("Ilyas", "Mr.", "ilyas", "elias", "إلياس", "student", "student5@muster.test", "Class 1A"),
            new SeedUser("Dunia", "Mme.", "dunia", "dounia", "دنيا", "student", "student6@muster.test", "Class 1A"),
            new SeedUser("Hamza", "Mr.", "hamza", "hamza", "حمزة", "student", "student7@muster.test", "Class 1B"),
            new SeedUser("Iman", "Mme.", "iman", "imane", "إيمان", "student", "student8@muster.test", "Class 1B"),
            new SeedUser("Yassin", "Mr.", "yassin", "yassine", "ياسين", "student", "student9@muster.test", "Class 1B"),
            new SeedUser("Layla", "Mme.", "layla", "leïla", "ليلى", "student", "student10@muster.test", "Class 1B"),
            new SeedUser("Nuh", "Mr.", "nuh", "nouh", "نوح", "student", "student11@muster.test", "Class 1B"),
            new SeedUser("Safa", "Mme.", "safa", "safa", "صفاء", "student", "student12@muster.test", "Class 1B"),
            new SeedUser("Nadia", "Mme.", "nadia", "nadia", "نادية", "secretary", "secretary1@muster.test", "Secretary Office"),
            new SeedUser("Khalid", "Mr.", "khalid", "khaled", "خالد", "secretary", "secretary2@muster.test", "Secretary Office"),
            new SeedUser("Hana", "Mme.", "hana", "hana", "هناء", "secretary", "secretary3@muster.test", "Secretary Office"),
            new SeedUser("Tariq", "Mr.", "tariq", "tarek", "طارق", "finance", "finance@muster.test", "Finance Office"));

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;

    public MusterTestDataInitializer(
            UserRepository userRepository,
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder,
            @Value("${muster.test-data.enabled:false}") boolean enabled) {
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<String> seedEmails = SEED_USERS.stream().map(SeedUser::email).toList();
        List<User> existingSeedUsers = userRepository.findAllBySchoolIdAndEmailIn(SCHOOL_ID, seedEmails);

        if (!enabled) {
            userRepository.deleteAll(existingSeedUsers);
            if (!existingSeedUsers.isEmpty()) {
                LOGGER.info("Removed {} Muster test users", existingSeedUsers.size());
            }
            return;
        }

        userRepository.deleteAll(existingSeedUsers);
        userRepository.flush();
        String encodedPassword = passwordEncoder.encode(DEFAULT_PASSWORD);
        IntStream.range(0, SEED_USERS.size()).forEach(index ->
                insertUser(SEED_USERS.get(index), FIRST_USER_ID + index, encodedPassword));
        LOGGER.info("Initialized {} Muster test users", SEED_USERS.size());
    }

    static List<SeedUser> seedUsers() {
        return SEED_USERS;
    }

    private void insertUser(SeedUser seed, int userId, String encodedPassword) {
        jdbcTemplate.update("""
                INSERT INTO tb_user
                    (userno, school_id, civilite, surname, firstname, firstname_en,
                     firstname_fr, firstname_ar, email, adresse, password, role)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                userId, SCHOOL_ID, seed.civilite(), seed.username(), seed.firstnameEn(),
                seed.firstnameEn(), seed.firstnameFr(), seed.firstnameAr(), seed.email(),
                seed.address(), encodedPassword, seed.role());
    }

    record SeedUser(
            String username,
            String civilite,
            String firstnameEn,
            String firstnameFr,
            String firstnameAr,
            String role,
            String email,
            String address) {
    }
}
