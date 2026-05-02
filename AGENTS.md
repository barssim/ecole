   cd /home/ahmed-ubuntu/myWork/ecole/usermanagement
   ./mvnw test -Dtest=AuthControllerTest# AGENTS.md - Ecole Microservices Platform

## Architecture Overview

This is a **microservices-based school management system** with a React frontend, Spring Boot/Spring Cloud backends, and a central API Gateway. All services are **containerized with Docker** and orchestrated via `docker-compose.yml`.

### Core Components:
- **ecole-portal**: React SPA frontend (port 3000) - handles UI for students/teachers/admins
- **solide-api-gateway**: Spring Cloud Gateway (port 8085) - routes all requests to microservices
- **usermanagement**: Spring Boot service (port 8091) - user auth, roles, profiles
- **finance-manager**: Spring Boot service (port 8094) - invoices, payments, PDF generation
- **aichatservice**: Spring Boot service (port 8093) - OpenAI integration for chat queries
- **eureka-server**: Service registry (port 8761) - service discovery
- **MySQL databases**: Three separate DBs (userDB, finDB, aiDB) for data isolation

### Data Flow:
```
React Frontend (3000) 
  → solide-api-gateway (8085)
    → [usermanagement|finance-manager|aichatservice] (8091|8094|8093)
      → MySQL (3306, 3307, 3308)
```

## Build & Deployment Workflow

### Full Stack Build
```bash
cd /home/ahmed-ubuntu/myWork/ecole
docker-compose up --build
```

### Individual Service Build (Java Services)
Spring Boot services use Maven. Build with WAR packaging:
```bash
cd <service-name>  # e.g., cd finance-manager
./mvnw clean install  # Builds to target/*.war
```

### React Frontend Build
```bash
cd ecole-portal
npm install
npm run build  # Creates optimized production build in build/
npm start      # Development server (watches for changes)
```

### Docker Multi-stage Builds
- **ecole-portal**: Dockerfile has `dev`, `test`, and `prod` targets - compose picks based on SERVICE_ENV
- **Java services**: Use `eclipse-temurin:17-jdk-alpine` base, copy WAR, run with Java

### Environment Configuration
- Root `.env` file defines `DB_PASSWORD` (required for all MySQL containers)
- Each service has `application.yml` in `src/main/resources/` configuring ports, datasources, profiles
- React dev server expects `REACT_APP_API_GATEWAY_URL` env var pointing to gateway

## Service-Specific Patterns

### Spring Boot REST Controllers
Controllers use `@RestController` + `@RequestMapping` with CORS enabled:
```java
@RestController
@RequestMapping("/api/facture")  // Base path for endpoint group
@CrossOrigin(origins = "*")       // Allow frontend access
public class SchoolInvoiceController { ... }
```

**Key ports and paths:**
- **usermanagement** (8091): `/api/auth/*`, `/api/users/*`
- **finance-manager** (8094): `/api/facture/*` (POST /generate for PDF invoices)
- **aichatservice** (8093): `/api/ai/*` (POST /ask for OpenAI queries)

### React Frontend Structure
- **src/pages/**: Full-page components (Login, Menu, Classes, etc.)
- **src/components/**: Reusable components (Header, Footer, PostInvoice)
- **src/locales/**: i18n JSON files (fr.json, en.json, ar.json) - app supports French/English/Arabic
- **src/mocks/**: Mock Service Worker setup for testing without real API
- **Authentication**: JWT token stored in `sessionStorage` as `jwt_token`; user roles in `localStorage` as `user_roles` (JSON array)

### Role-Based Access Control
Use `ProtectedRoute` wrapper component:
```javascript
<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
  <TeacherCoursesPage />
</ProtectedRoute>
```

## Critical Developer Workflows

### Run Development Environment
```bash
docker-compose up  # All services in dev mode
# Frontend: http://localhost:3000
# Gateway: http://localhost:8085
# Eureka: http://localhost:8761
```

### Debug MySQL
```bash
# Connect to user database
docker exec -it mysql-user mysql -u root -p${DB_PASSWORD} userDB

# Check table structure
SHOW TABLES;
DESCRIBE users;  # or your table name
```

### Frontend Development (Hot Reload)
```bash
cd ecole-portal
npm start  # Starts dev server with live reload on file changes
```

### Backend Debugging
- Spring Boot logs available via `docker logs <container-name>`
- Check service health at `http://localhost:<PORT>/actuator/health`
- aichatservice logs OpenAI API responses (useful for AI integration debugging)

## Project Conventions

### Naming Conventions
- **Java packages**: `ma.solide.<service-name>` (e.g., `ma.solide.finance_manager`)
- **API paths**: `/api/<resource>/*` (e.g., `/api/facture/generate`)
- **React component files**: PascalCase `.js` (e.g., `Header.js`, `StudentSchedulePage.js`)
- **Database schema**: Hibernate auto-generates with `ddl-auto: update`

### Database Isolation Pattern
Each service has its own MySQL database to enforce loose coupling:
- **usermanagement** ↔ userDB (port 3309)
- **finance-manager** ↔ finDB (port 3307)
- **aichatservice** ↔ aiDB (port 3308)

No direct DB-to-DB queries; all cross-service communication goes through REST APIs via gateway.

### Internationalization (i18n)
React app supports 3 languages. Content defined in JSON:
- `src/locales/fr.json`, `en.json`, `ar.json`
- UI direction adjusts with `language === "ar" ? "row-reverse" : "row"` for RTL support

## Integration Points & External Dependencies

### OpenAI Integration (aichatservice)
- **Config**: `spring.ai.openai.api-key` in application.yml
- **Endpoint**: POST `/api/ai/ask` with `{ "prompt": "..." }` body
- **Service interface**: `AiQueryService` with method `handleQuery(String prompt)`
- **Note**: API key currently in application.yml (security anti-pattern - should use vault/secrets)

### PDF Generation (finance-manager)
- **Library**: iTextPDF 5.5.13.3
- **Service**: `SchoolInvoicePdfService.generateInvoice(...)`
- **Controller endpoint**: POST `/api/facture/generate` returns PDF stream
- **Request body**: `{ "studentName", "className", "items": [...] }`

### Keycloak Authentication (Configured in React)
- Config file: `ecole-portal/keycloak.js`
- Package: `@react-keycloak/web`, `keycloak-js`
- Currently appears partially integrated; fallback is JWT in sessionStorage

### Spring Cloud Gateway Routing
- **Gateway config**: `solide-api-gateway/src/main/resources/application.yml`
- Routes incoming requests to microservices based on path patterns
- CORS enabled to allow frontend requests

## Testing & Quality

### React Testing
- **Framework**: Jest + React Testing Library
- **Mock API**: Mock Service Worker (mockServiceWorker.js in public/)
- **Run tests**: `npm test`
- **Test environment**: Uses `REACT_APP_API_GATEWAY_URL=http://localhost:8888/mock-api`

### Spring Boot Testing
- **Framework**: JUnit 5 (via spring-boot-starter-test)
- **Run tests**: `./mvnw test` in service directories
- Maven surefire plugin generates reports in `target/surefire-reports/`

## Common Pitfalls & Solutions

1. **Service won't connect to MySQL**: Ensure `docker-compose up` runs with `--build` and DB_PASSWORD is set in `.env`
2. **CORS errors on frontend**: Check `@CrossOrigin` annotations on controllers; gateway CORS config may need adjustment
3. **JWT token not working**: Verify token is stored in `sessionStorage.jwt_token`, not elsewhere; check token expiry
4. **Port conflicts**: Ensure ports 3000, 3306, 3307, 3308, 8085, 8091, 8093, 8094, 8761 are free before running compose
5. **AI service returns errors**: Check OpenAI API key validity and account balance/rate limits

## File Structure Reference

```
ecole/
├── docker-compose.yml          # Define all services + networks
├── .env                         # DB_PASSWORD and other secrets
├── ecole-portal/               # React frontend
│   ├── src/
│   │   ├── App.js              # Main router, language toggle
│   │   ├── pages/              # Full-page components
│   │   ├── components/         # Reusable UI components
│   │   ├── locales/            # i18n JSON files (fr, en, ar)
│   │   └── mocks/              # Mock Service Worker config
│   ├── Dockerfile              # Multi-stage build (dev/test/prod)
│   └── package.json            # Dependencies, scripts
├── solide-api-gateway/         # Spring Cloud Gateway
│   ├── pom.xml
│   └── src/main/java/ma/solide/solide_api_gateway/
├── usermanagement/             # User auth microservice
├── finance-manager/            # Finance operations microservice
├── aichatservice/              # AI chat microservice
└── eureka-server/              # Service discovery
```

