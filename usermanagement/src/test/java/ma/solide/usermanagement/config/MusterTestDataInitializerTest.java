package ma.solide.usermanagement.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MusterTestDataInitializerTest {

    @Test
    void definesExpectedUniqueUsersByRole() {
        var users = MusterTestDataInitializer.seedUsers();

        assertThat(users).hasSize(23);
        assertThat(users).extracting(MusterTestDataInitializer.SeedUser::username)
                .doesNotHaveDuplicates();
        assertThat(users).extracting(MusterTestDataInitializer.SeedUser::email)
                .doesNotHaveDuplicates();
        assertThat(users).filteredOn(user -> user.role().equals("teacher")).hasSize(5);
        assertThat(users).filteredOn(user -> user.role().equals("student")).hasSize(12);
        assertThat(users).filteredOn(user -> user.role().equals("secretary")).hasSize(3);
        assertThat(users).filteredOn(user -> user.role().equals("finance")).hasSize(1);
        assertThat(users).filteredOn(user -> user.role().equals("manager")).hasSize(2);
        assertThat(users).extracting(MusterTestDataInitializer.SeedUser::civilite)
                .containsOnly("Mr.", "Mme.");
        assertThat(users).allSatisfy(user -> {
            assertThat(user.firstnameEn()).isNotBlank();
            assertThat(user.firstnameFr()).isNotBlank();
            assertThat(user.firstnameAr()).isNotBlank();
            assertThat(user.firstnameEn().substring(0, 1))
                    .isEqualTo(user.firstnameEn().substring(0, 1).toLowerCase());
            assertThat(user.firstnameFr().substring(0, 1))
                    .isEqualTo(user.firstnameFr().substring(0, 1).toLowerCase());
        });
    }
}
