#!/bin/sh
set -e

RAW_URL="${SPRING_DATASOURCE_URL:-$DATABASE_URL}"

if [ -n "$RAW_URL" ]; then
    case "$RAW_URL" in
        postgresql://*|postgres://*)
            PROTO_REMOVED="${RAW_URL#*://}"
            case "$PROTO_REMOVED" in
                *@*)
                    USERINFO="${PROTO_REMOVED%%@*}"
                    HOST_PORT_DB="${PROTO_REMOVED#*@}"
                    
                    USER="${USERINFO%%:*}"
                    PASS="${USERINFO#*:}"
                    
                    export SPRING_DATASOURCE_USERNAME="$USER"
                    export SPRING_DATASOURCE_PASSWORD="$PASS"
                    export SPRING_DATASOURCE_URL="jdbc:postgresql://$HOST_PORT_DB"
                    ;;
                *)
                    export SPRING_DATASOURCE_URL="jdbc:$RAW_URL"
                    ;;
            esac
            ;;
    esac
fi

exec java $JAVA_OPTS -jar app.jar
