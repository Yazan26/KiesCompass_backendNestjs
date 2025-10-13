# KiesCompass Backend - Onion/Clean Architecture

## Overview

This repository implements a Clean/Onion architecture for the authentication subsystem. I updated this document to reflect the actual folder structure and filenames in the codebase so it's a reliable reference for contributors.

### Dependency rule
Dependencies point inward: outer layers (presentation, infra) depend on inner layers (application, core). Inner layers must not import from outer layers.

## Actual project structure (auth-focused)

The layout below mirrors the repository at the time of this update. Paths shown are relative to `src/`.

```
src/
├── main.ts
├── app/
│   ├── app.module.ts
│   └── app.service.ts
├── application/
│   └── auth/
│       ├── dtos/
│       │   └── auth.dto.ts
│       ├── ports/
│       │   ├── jwt-service.port.ts
│       │   ├── password-service.port.ts
│       │   └── user-repository.port.ts
│       └── use-cases/
│           ├── get-user-profile.use-case.ts
│           ├── login.use-case.ts
│           └── register.use-case.ts
├── core/
│   └── auth/
│       ├── entities/
│       │   └── user.entity.ts
│       └── value-objects/
│           ├── email.value-object.ts
│           ├── password.value-object.ts
│           └── username.value-object.ts
├── infrastructure/
│   └── auth/
│       ├── database/
│       │   ├── database.module.ts
│       │   ├── repositories/
│       │   │   └── mongo-user.repository.ts
│       │   └── schemas/
│       │       └── user.schema.ts
│       └── security/
│           ├── bcrypt-password.service.ts
│           ├── jwt.service.ts
│           ├── jwt.strategy.ts
│           └── security.module.ts
├── presentation/
│   └── auth/
│       ├── controllers/
│       │   └── auth.controller.ts
│       ├── decorators/
│       │   └── current-user.decorator.ts
│       └── guards/
│           └── jwt-auth.guard.ts
└── (other modules...)
```

##  Layer responsibilities (mapped to repo)

- Core (`src/core/auth`): domain entities and value objects (pure business rules). Example: `user.entity.ts`, `email.value-object.ts`.
- Application (`src/application/auth`): use-cases and ports (interfaces). Example: `register.use-case.ts`, `IUserRepository` port.
- Infrastructure (`src/infrastructure/auth`): adapters and concrete implementations (Mongo repository, password & JWT services).
- Presentation (`src/presentation/auth`): Nest controllers, guards and decorators that translate HTTP requests into application calls.

##  Authentication flow (implementation highlights)

Registration
- `POST /auth/register` handled by `src/presentation/auth/controllers/auth.controller.ts`.
- Controller validates DTO (`src/application/auth/dtos/auth.dto.ts`) and calls `RegisterUseCase` (`src/application/auth/use-cases/register.use-case.ts`).
- Use-case checks repository (`user-repository.port.ts`), hashes the password using the password service (`bcrypt-password.service.ts`), and persists via `MongoUserRepository`.

Login
- `POST /auth/login` → controller → `LoginUseCase`.
- Use-case verifies credentials with the password service and creates a JWT using the JWT service (`src/infrastructure/auth/security/jwt.service.ts`).

Protected routes
- `JwtAuthGuard` (`src/presentation/auth/guards/jwt-auth.guard.ts`) uses `JwtStrategy` (`src/infrastructure/auth/security/jwt.strategy.ts`) to validate tokens. A `@CurrentUser()` decorator extracts user info.

##  API Endpoints (quick reference)

- POST `/auth/register` — register a new user (username, email, password)
- POST `/auth/login` — authenticate and receive JWT (username, password)
- GET `/auth/profile` — returns current user profile (requires Authorization header)

Example request/response bodies remain the same as before; see concrete DTOs under `src/application/auth/dtos` for exact shapes.

## 🔧 Environment variables (used by the app)

```
PORT=3001
MONGODB_URI=<your-mongo-uri>
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=15m
APP_URL=http://localhost:3000
```

## �️ Why this doc was updated

What's changed:
- Replaced the generic `src/` structure with the actual repository paths and filenames.
- Pointed to the real locations of controllers, use-cases, ports, entities and infra services.
- Added a short "implementation highlights" section so contributors can quickly find the auth code.

##  Notes & next steps

- If you rename or move files, please update this doc to keep it accurate.
- Consider adding a small README inside `src/application/auth` and `src/infrastructure/auth` that documents public ports and DTO shapes.

---

**Architecture Pattern:** Onion / Clean Architecture  
**Last Updated:** 2025-10-13
