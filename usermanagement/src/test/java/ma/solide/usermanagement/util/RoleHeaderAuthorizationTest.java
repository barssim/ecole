package ma.solide.usermanagement.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RoleHeaderAuthorizationTest {

    @Test
    void shouldMatchManagerRoleFromSimpleHeader() {
        assertTrue(RoleHeaderAuthorization.hasAnyRole("student,manager,parent", "manager"));
    }

    @Test
    void shouldMatchManagerRoleWithRolePrefix() {
        assertTrue(RoleHeaderAuthorization.hasAnyRole("ROLE_MANAGER", "manager"));
    }

    @Test
    void shouldReturnFalseWhenRoleMissing() {
        assertFalse(RoleHeaderAuthorization.hasAnyRole("student,parent", "manager"));
    }

    @Test
    void shouldReturnFalseForEmptyHeader() {
        assertFalse(RoleHeaderAuthorization.hasAnyRole("", "manager"));
    }
}

