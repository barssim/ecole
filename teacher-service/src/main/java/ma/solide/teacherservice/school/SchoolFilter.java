package ma.solide.teacherservice.school;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SchoolFilter extends OncePerRequestFilter {

    private static final String SCHOOL_HEADER = "X-School-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String schoolId = request.getHeader(SCHOOL_HEADER);
        if (schoolId == null || schoolId.isBlank()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing X-School-Id header");
            return;
        }

        try {
            SchoolContext.setSchoolId(schoolId.trim().toLowerCase());
            filterChain.doFilter(request, response);
        } finally {
            SchoolContext.clear();
        }
    }
}

