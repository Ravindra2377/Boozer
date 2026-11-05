#!/usr/bin/env bash
# ==============================================================================
# BOOZER · ONE-CLICK DEVELOPER ORCHESTRATION SCRIPT
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
COMMAND="${1:-status}"

GOLD='\033[0;33m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

case "$COMMAND" in
  start)
    echo -e "${GOLD}Starting BOOZER full stack via Docker Compose...${NC}"
    docker compose up -d
    echo -e "${GREEN}✓ Full stack started!${NC}"
    echo -e "Web Portal:       ${CYAN}http://localhost:3000${NC} (or http://localhost:5173 for Vite)"
    echo -e "Backend REST API: ${CYAN}http://localhost:8080/api/v1${NC}"
    echo -e "Adminer DB UI:    ${CYAN}http://localhost:8085${NC}"
    ;;
  stop)
    echo -e "${GOLD}Stopping Docker services...${NC}"
    docker compose down
    echo -e "${GREEN}✓ Stopped.${NC}"
    ;;
  test)
    echo -e "${GOLD}Running Web and Mobile build verification...${NC}"
    cd "${DIR}/web" && npm run build
    cd "${DIR}/mobile" && npx tsc --noEmit
    echo -e "${GREEN}✓ Web & Mobile verified successfully!${NC}"
    ;;
  e2e)
    "${DIR}/scripts/test-e2e.sh" "${2:-http://localhost:8080/api/v1}"
    ;;
  status|*)
    echo -e "${GOLD}====================================================${NC}"
    echo -e "${GOLD}   BOOZER SYSTEM STATUS & QUICK LINKS               ${NC}"
    echo -e "${GOLD}====================================================${NC}"
    echo -e "Web Portal (Vite):     ${GREEN}http://localhost:5173${NC}"
    echo -e "Docker Web (Nginx):    ${CYAN}http://localhost:3000${NC}"
    echo -e "Spring Boot Backend:   ${CYAN}http://localhost:8080/api/v1${NC}"
    echo -e "Adminer Database UI:   ${CYAN}http://localhost:8085${NC}"
    echo -e "PostgreSQL 16:         ${CYAN}localhost:5432 (boozer_db)${NC}"
    echo -e "Redis 7:               ${CYAN}localhost:6379${NC}"
    echo ""
    echo -e "Usage:"
    echo -e "  ./boozer.sh start   - Start full stack in Docker"
    echo -e "  ./boozer.sh stop    - Stop all containers"
    echo -e "  ./boozer.sh test    - Run build and typecheck tests"
    echo -e "  ./boozer.sh e2e     - Run end-to-end API test suite"
    echo -e "  ./boozer.sh status  - Show this status dashboard"
    ;;
esac
