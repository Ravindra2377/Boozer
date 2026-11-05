# BOOZER · Legal Alcohol Delivery with a Safe Ride Home Built-in

> **Complete MVP Architecture, Backend Modular Monolith, Web Portal & Mobile Application**  
> Complies with Indian State Excise Regulations & the Digital Personal Data Protection (DPDP) Act 2023.

---

## 📦 Project Layout

```text
boozer/
├── backend/                       # Spring Boot 3.3 (Java 21) Modular Monolith
│   ├── Dockerfile                 # Multi-stage Dockerfile (Temurin 21 + Alpine)
│   ├── pom.xml                    # Maven build file with JPA, Flyway, Redis, JJWT, Testcontainers
│   └── src/main/java/com/boozer/
│       ├── BoozerApplication.java
│       ├── auth/                  # Phone OTP request & JWT token generation
│       ├── users/                 # Profile and trusted emergency contact management
│       ├── kyc/                   # DigiLocker integration & age (>= 21) verification
│       ├── catalog/               # Catalog with statutory legal MRPs & store stock
│       ├── orders/                # Order creation, OrderStateMachine & "Get Help" support
│       ├── payments/              # Razorpay escrow integration & webhook processing
│       ├── deliveries/            # Rider GPS tracking & doorstep age verification OTP
│       ├── rides/                 # Built-in ₹150 Safe Ride vouchers & Uber/Ola dispatch
│       ├── safety/                # 2-sec hold SOS trigger & trusted contact emergency broadcast
│       ├── compliance/excise/     # Statutory Dry Days calendar & 6.5km Geofencing
│       ├── retailer/              # Retailer store queue, dispatch & inventory toggles
│       ├── admin/                 # Pilot KPIs, KYC approval queue & compliance audit trail
│       ├── audit/                 # Immutable compliance audit logging engine
│       └── common/                # SecurityConfig, CORS, GlobalExceptionHandler, ApiResponse
├── web/                           # Customer App, Retailer Portal & Admin Command Centre (React + Vite)
│   ├── Dockerfile                 # Multi-stage Dockerfile with Nginx Alpine
│   ├── nginx.conf                 # SPA routing configuration
│   └── src/                       # Midnight Gold × Neon Luxury design system (10 complete screens)
├── mobile/                        # React Native + Expo SDK 58 Mobile Application
│   └── src/                       # 5-tab pill navigation, Persistent SOS, Cart & Safe Ride store
├── database/                      # PostgreSQL 16 DDL & Seed Migrations
├── docs/
│   ├── architecture.md            # Detailed system design, Mermaid diagrams & data flow
│   ├── api-specification.md       # REST API contract reference with sample payloads
│   └── openapi.yaml               # OpenAPI 3.0 specification for Swagger / Postman
├── .github/workflows/ci.yml       # GitHub Actions CI for Backend, Web, and Mobile verification
├── docker-compose.yml             # Full-stack orchestrator (Postgres 16, Redis 7, Backend, Web, Adminer)
├── Boozer_App_Build_Plan.pdf      # Original product roadmap & pilot specification
└── README.md
```

---

## 🚀 Quickstart: Full Stack Local Orchestration

### Option 1: Spin up the entire Full Stack with Docker
```bash
docker compose up -d
```
- **Web App / Retailer / Admin Portal:** `http://localhost:3000` (or `http://localhost:5173` in Vite dev mode)
- **Spring Boot REST Backend:** `http://localhost:8080/api/v1`
- **PostgreSQL 16:** `localhost:5432` (`boozer_db` / `boozer_user` / `boozer_dev_password`)
- **Redis 7:** `localhost:6379`
- **Adminer DB UI:** `http://localhost:8085`

### Option 2: Run Individual Components
- **Web Portal (Vite):**
  ```bash
  cd web && npm install && npm run dev
  ```
- **Mobile App (Expo SDK 58):**
  ```bash
  cd mobile && npm install && npx expo start
  ```
- **Backend (Spring Boot 3.3):**
  ```bash
  cd backend && mvn spring-boot:run
  ```

---

## 🛡️ Core Compliance Rules Enforced in Code

1. **KYC Gatekeeper:** Orders cannot be instantiated unless `users.kyc_status == 'VERIFIED'` and user age is verified $\ge 21$.
2. **Statutory Legal MRP:** No algorithmic discounting or surge pricing is permitted on alcoholic products; statutory legal MRP is strictly enforced.
3. **Doorstep Age Gate:** Transition from `ARRIVED` to `DELIVERED` is physically blocked in [OrderStateMachine.java](file:///home/kpanviravindra/boozer/backend/src/main/java/com/boozer/orders/domain/OrderStateMachine.java) until `age_check_at_door_verified == true`.
4. **Data Minimization (DPDP Act 2023):** Raw Aadhaar/Govt ID documents are never stored; only cryptographic verification references, masked tokens (`DL-TS092015XXXX4819`), and non-repudiation hashes are persisted.
5. **Orders vs Safety SOS Boundary:** The Orders and tracking screens feature **"Get Help"** for order support, keeping emergency SOS isolated in the dedicated **Safety Centre** tab.
6. **Built-in Safe Ride Home:** Every completed alcohol order provisions an automatic **₹150 Safe Ride voucher credit** valid for 24 hours across Uber and Ola.
7. **Statutory Dry Days Calendar:** Orders are automatically blocked on National & State statutory dry days (Republic Day, Gandhi Jayanti, Independence Day, etc.) under Section 17 of the State Excise Act.
8. **6.5 km Excise Zone Geofencing:** Orders outside the licensed retailer's boundary (calculated via the spherical Haversine formula) are legally rejected to prevent inter-zone distribution violations.

---

## 🗺️ Key Documents & Architecture
- [System Architecture](file:///home/kpanviravindra/boozer/docs/architecture.md)
- [REST API Specifications](file:///home/kpanviravindra/boozer/docs/api-specification.md)
- [OpenAPI 3.0 YAML Contract](file:///home/kpanviravindra/boozer/docs/openapi.yaml)
- [Database Schema (Flyway V1)](file:///home/kpanviravindra/boozer/backend/src/main/resources/db/migration/V1__initial_schema.sql)
- [Seed Data (Flyway V2)](file:///home/kpanviravindra/boozer/backend/src/main/resources/db/migration/V2__seed_data.sql)
