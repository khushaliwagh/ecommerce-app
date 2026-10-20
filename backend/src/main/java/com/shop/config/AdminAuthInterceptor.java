package com.shop.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Guards every /api/admin/** route. The caller must send the secret in an
 * {@code X-Admin-Key} header. The secret comes from the ADMIN_KEY environment variable.
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthInterceptor.class);
    static final String DEV_DEFAULT = "admin123";

    private final byte[] key;

    public AdminAuthInterceptor(@Value("${shop.admin.key:}") String key) {
        this.key = key == null ? new byte[0] : key.getBytes(StandardCharsets.UTF_8);
        if (DEV_DEFAULT.equals(key)) {
            log.warn("ADMIN_KEY is the insecure development default '{}'. Set ADMIN_KEY before deploying!", DEV_DEFAULT);
        }
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true; // CORS preflight carries no credentials
        }
        if (key.length == 0) {
            return reject(response, 403, "Admin is disabled. Set the ADMIN_KEY environment variable on the server.");
        }
        String provided = request.getHeader("X-Admin-Key");
        boolean ok = provided != null
                && MessageDigest.isEqual(key, provided.getBytes(StandardCharsets.UTF_8)); // constant-time compare
        return ok || reject(response, 401, "Invalid admin key");
    }

    private boolean reject(HttpServletResponse response, int status, String message) throws Exception {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"status\":" + status + ",\"message\":\"" + message.replace("\"", "'") + "\"}");
        return false;
    }
}
