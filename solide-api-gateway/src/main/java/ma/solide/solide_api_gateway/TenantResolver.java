package ma.solide.solide_api_gateway;

public final class TenantResolver {

    private TenantResolver() {
    }

    public static String resolve(String tenantHeader, String host) {
        if (tenantHeader != null && !tenantHeader.isBlank()) {
            return sanitizeTenant(tenantHeader);
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

        return sanitizeTenant(parts[0]);
    }

    private static String sanitizeTenant(String rawTenant) {
        String sanitized = rawTenant.trim().toLowerCase().replaceAll("[^a-z0-9_-]", "");
        return sanitized.isBlank() ? null : sanitized;
    }
}

