package com.boozer.audit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Writes an immutable audit trail entry to audit_log table.
     */
    public void logAction(
            UUID actorId,
            String actorRole,
            String action,
            String entity,
            String entityId,
            Map<String, Object> oldState,
            Map<String, Object> newState
    ) {
        try {
            String sql = """
                INSERT INTO audit_log (actor_id, actor_role, action, entity, entity_id, old_state, new_state, created_at)
                VALUES (?, ?::actor_role, ?, ?, ?, ?::jsonb, ?::jsonb, NOW())
            """;
            
            String oldJson = oldState != null ? mapToJson(oldState) : null;
            String newJson = newState != null ? mapToJson(newState) : null;

            jdbcTemplate.update(sql, actorId, actorRole, action, entity, entityId, oldJson, newJson);
        } catch (Exception e) {
            log.error("Failed to write audit log for entity {}: {}", entityId, e.getMessage());
        }
    }

    private String mapToJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        map.forEach((k, v) -> sb.append("\"").append(k).append("\":\"").append(v).append("\","));
        if (sb.length() > 1) sb.deleteCharAt(sb.length() - 1);
        sb.append("}");
        return sb.toString();
    }
}
