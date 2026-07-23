package ma.solide.finance_manager.tenant;

public final class TenantContext {

    private static final ThreadLocal<String> TENANT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setTenantId(String tenantId) {
        TENANT.set(tenantId);
    }

    public static String getRequiredTenantId() {
        String tenantId = TENANT.get();
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalStateException("Missing tenant context");
        }
        return tenantId;
    }

    public static void clear() {
        TENANT.remove();
    }
}

