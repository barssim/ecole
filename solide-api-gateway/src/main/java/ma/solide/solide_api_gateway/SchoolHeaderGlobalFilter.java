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
public class SchoolHeaderGlobalFilter implements GlobalFilter, Ordered {

    private static final String SCHOOL_HEADER = "X-School-Id";
    private static final String ROLE_HEADER   = "X-User-Roles";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }

        String host = exchange.getRequest().getHeaders().getFirst("Host");
        String schoolHeader = exchange.getRequest().getHeaders().getFirst(SCHOOL_HEADER);
        String schoolId = SchoolResolver.resolve(schoolHeader, host);

        if (schoolId == null) {
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.BAD_REQUEST);
            return response.setComplete();
        }

        // Preserve the role header that was sent by the client so downstream
        // services can perform their own role-based checks.
        final String existingRoleHeader = exchange.getRequest().getHeaders().getFirst(ROLE_HEADER);

        ServerHttpRequest request = exchange.getRequest().mutate()
                .headers(headers -> {
                    headers.set(SCHOOL_HEADER, schoolId);
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
