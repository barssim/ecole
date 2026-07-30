package ma.solide.usermanagement.service;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

@Component
public class CustomerVersionPolicy {

    public static final String TESTVERSION = "testversion";
    public static final String BRONZVERSION = "bronzversion";
    public static final String SILBER = "silber";
    public static final String GOLD = "gold";

    @Value("${customer-version.max-users.testversion:5}")
    private int testversionMaxUsers = 5;

    @Value("${customer-version.max-users.bronzversion:20}")
    private int bronzversionMaxUsers = 20;

    @Value("${customer-version.max-users.silber:50}")
    private int silberMaxUsers = 50;

    public String resolveVersion(long userCount) {
        if (userCount <= testversionMaxUsers) {
            return TESTVERSION;
        }
        if (userCount <= bronzversionMaxUsers) {
            return BRONZVERSION;
        }
        if (userCount <= silberMaxUsers) {
            return SILBER;
        }
        return GOLD;
    }

    public long resolveMaxUsers(String customerVersion) {
        String normalizedVersion = normalizeVersion(customerVersion);
        return switch (normalizedVersion) {
            case TESTVERSION -> testversionMaxUsers;
            case BRONZVERSION -> bronzversionMaxUsers;
            case SILBER -> silberMaxUsers;
            case GOLD -> Long.MAX_VALUE;
            default -> throw new IllegalArgumentException("Unsupported customer version: " + customerVersion);
        };
    }

    public boolean isKnownVersion(String customerVersion) {
        String normalizedVersion = normalizeVersion(customerVersion);
        return TESTVERSION.equals(normalizedVersion)
                || BRONZVERSION.equals(normalizedVersion)
                || SILBER.equals(normalizedVersion)
                || GOLD.equals(normalizedVersion);
    }

    public String normalizeVersion(String customerVersion) {
        return String.valueOf(customerVersion).trim().toLowerCase();
    }
}

