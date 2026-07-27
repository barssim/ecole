package ma.solide.solide_api_gateway;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class TenantHeaderGlobalFilter implements GlobalFilter, Ordered {

    private static final String TENANT_HEADER = "X-Tenant-Id";
    private static final String ROLE_HEADER   = "X-User-Roles";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }

        String host = exchange.getRequest().getHeaders().getFirst("Host");
        String tenantHeader = exchange.getRequest().getHeaders().getFirst(TENANT_HEADER);
        String tenantId = TenantResolver.resolve(tenantHeader, host);

        if (tenantId == null) {
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.BAD_REQUEST);
            return response.setComplete();
        }

        // Preserve the role header that was sent by the client so downstream
        // services can perform their own role-based checks.
        final String existingRoleHeader = exchange.getRequest().getHeaders().getFirst(ROLE_HEADER);

        ServerHttpRequest request = exchange.getRequest().mutate()
                .headers(headers -> {
                    headers.set(TENANT_HEADER, tenantId);
                    // Re-set to guarantee it survives the immutable-header wrapping in
                    // some Spring Cloud Gateway versions.
                    if (existingRoleHeader != null && !existingRoleHeader.isBlank()) {
                        headers.set(ROLE_HEADER, existingRoleHeader);
                    }
                })
                .build();

        return chain.filter(exchange.mutate().request(request).build());
    }

    @Override
    public int getOrder() {
        return -1;
    }
}

