package com.boozer.common.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Automatically detects cloud PostgreSQL connection URIs (e.g. from Render, Heroku)
 * in the form 'postgresql://user:pass@host:port/database' and converts them into
 * standard Spring Boot JDBC properties with 'jdbc:postgresql://host:port/database'.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawUrl = environment.getProperty("SPRING_DATASOURCE_URL");
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = environment.getProperty("DATABASE_URL");
        }

        if (rawUrl != null && (rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://"))) {
            try {
                URI uri = URI.create(rawUrl);
                String userInfo = uri.getUserInfo();
                String username = null;
                String password = null;
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                if (path != null && path.startsWith("/")) {
                    path = path.substring(1);
                }

                String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + path;

                Map<String, Object> overrides = new HashMap<>();
                overrides.put("spring.datasource.url", jdbcUrl);
                if (username != null) {
                    overrides.put("spring.datasource.username", username);
                }
                if (password != null) {
                    overrides.put("spring.datasource.password", password);
                }

                environment.getPropertySources().addFirst(
                        new MapPropertySource("renderDatabaseUrlProperties", overrides)
                );
            } catch (Exception ignored) {
                // If URI parsing fails, allow Spring Boot default parsing to continue
            }
        }
    }
}
