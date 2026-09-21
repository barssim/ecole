package ma.solide.solide_api_gateway;

public final class SchoolResolver {

    private SchoolResolver() {
    }

    public static String resolve(String schoolHeader, String host) {
        if (schoolHeader != null && !schoolHeader.isBlank()) {
            return sanitizeSchool(schoolHeader);
        }

        if (host == null || host.isBlank()) {
            return null;
        }

        String normalizedHost = host.toLowerCase();
        int colonIndex = normalizedHost.indexOf(':');
        if (colonIndex > -1) {
            normalizedHost = normalizedHost.substring(0, colonIndex);
        }

        if ("localhost".equals(normalizedHost) || normalizedHost.startsWith("127.")) {
            return "default";
        }

        String[] parts = normalizedHost.split("\\.");
        if (parts.length < 3) {
            return null;
        }

        return sanitizeSchool(parts[0]);
    }

    private static String sanitizeSchool(String rawSchool) {
        String sanitized = rawSchool.trim().toLowerCase().replaceAll("[^a-z0-9_-]", "");
        return sanitized.isBlank() ? null : sanitized;
    }
}
