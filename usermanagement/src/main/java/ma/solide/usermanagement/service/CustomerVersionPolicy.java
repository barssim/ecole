package ma.solide.usermanagement.service;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

@Component
public class CustomerVersionPolicy {

    public static final String TRIAL = "Trial";
    public static final String BRONZE = "Bronze";
    public static final String SILVER = "Silver";
    public static final String GOLD = "Gold";

    @Value("${customer-version.max-users.trial:10}")
    private int trialMaxUsers;

    @Value("${customer-version.max-users.bronze:100}")
    private int bronzeMaxUsers;

    @Value("${customer-version.max-users.silver:500}")
    private int silverMaxUsers;

    @Value("${customer-version.max-users.gold:2000}")
    private int goldMaxUsers;

    public String resolveVersion(long userCount) {
        if (userCount <= trialMaxUsers) {
            return TRIAL;
        }
        if (userCount <= bronzeMaxUsers) {
            return BRONZVERSION;
        }
        if (userCount <= silverMaxUsers) {
            return SILVER;
        }
        return GOLD;
    }

    public long resolveMaxUsers(String customerVersion) {
        String normalizedVersion = normalizeVersion(customerVersion);
        return switch (normalizedVersion) {
            case TRIAL -> trialMaxUsers;
            case BRONZE -> bronzeMaxUsers;
            case SILVER -> silverMaxUsers;
            case GOLD -> goldMaxUsers;
            default -> throw new IllegalArgumentException("Unsupported customer version: " + customerVersion);
        };
    }

    public boolean isKnownVersion(String customerVersion) {
        String normalizedVersion = normalizeVersion(customerVersion);
        return TRIAL.equals(normalizedVersion)
                || BRONZE.equals(normalizedVersion)
                || SILVER.equals(normalizedVersion)
                || GOLD.equals(normalizedVersion);
    }

    public String normalizeVersion(String customerVersion) {
        return String.valueOf(customerVersion).trim().toLowerCase();
    }
}

