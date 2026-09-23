package ma.solide.usermanagement.model;

import java.util.LinkedHashMap;
import java.util.Map;

public final class UserNames {

    private UserNames() {
    }

    public static Map<String, String> firstnames(User user) {
        Map<String, String> names = new LinkedHashMap<>();
        names.put("en", fallback(user.getFirstnameEn(), user.getFirstname()));
        names.put("fr", fallback(user.getFirstnameFr(), user.getFirstname()));
        names.put("ar", fallback(user.getFirstnameAr(), user.getFirstname()));
        return names;
    }

    public static Map<String, String> fullNames(User user) {
        Map<String, String> names = new LinkedHashMap<>();
        boolean usesFirstnameAsSurname = fallback(user.getFirstname(), "")
                .equalsIgnoreCase(fallback(user.getSurname(), ""));
        firstnames(user).forEach((language, firstname) ->
                names.put(language, usesFirstnameAsSurname
                        ? firstname
                        : fullName(firstname, user.getSurname())));
        return names;
    }

    private static String fallback(String localized, String legacy) {
        return localized == null || localized.isBlank()
                ? String.valueOf(legacy == null ? "" : legacy).trim()
                : localized.trim();
    }

    private static String fullName(String firstname, String surname) {
        String normalizedSurname = String.valueOf(surname == null ? "" : surname).trim();
        if (firstname.equalsIgnoreCase(normalizedSurname)) {
            return firstname;
        }
        return (firstname + " " + normalizedSurname).trim();
    }
}
