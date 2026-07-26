package ma.solide.usermanagement.util;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public final class RoleHeaderAuthorization {

    private RoleHeaderAuthorization() {
    }

    public static boolean hasAnyRole(String userRolesHeader, String... expectedRoles) {
        if (userRolesHeader == null || userRolesHeader.trim().isEmpty() || expectedRoles == null || expectedRoles.length == 0) {
            return false;
        }

        Set<String> assignedRoles = Arrays.stream(userRolesHeader.split(","))
                .map(role -> String.valueOf(role).trim().toLowerCase())
                .filter(role -> !role.isEmpty())
                .collect(Collectors.toSet());

        for (String expectedRole : expectedRoles) {
            String expected = String.valueOf(expectedRole).trim().toLowerCase();
            if (expected.isEmpty()) {
                continue;
            }

            for (String assigned : assignedRoles) {
                if (matchesRole(assigned, expected)) {
                    return true;
                }
            }
        }
        return false;
    }

    private static boolean matchesRole(String assignedRole, String expectedRole) {
        return assignedRole.equals(expectedRole)
                || assignedRole.equals("role_" + expectedRole)
                || assignedRole.endsWith("_" + expectedRole);
    }
}

