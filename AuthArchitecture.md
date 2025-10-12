# KiesCompass Backend - Onion Architecture

## 🏗️ Architecture Overview

This project follows the **Onion Architecture** (Clean Architecture) pattern, which organizes code into distinct layers with clear dependency rules.

### Dependency Rule
**Dependencies point inward**: Outer layers can depend on inner layers, but inner layers must never depend on outer layers.

```
┌─────────────────────────────────────────┐
│      Presentation Layer (Controllers)   │
│  ┌───────────────────────────────────┐  │
│  │   Infrastructure Layer (MongoDB)  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Application Layer (Use     │  │  │
│  │  │  Cases, Ports)              │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │   Domain Layer        │  │  │  │
│  │  │  │   (Entities, Value    │  │  │  │
│  │  │  │   Objects)            │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── domain/                          # 🎯 Core Business Logic (No Dependencies)
│   ├── entities/                    # Business entities
│   │   └── user.entity.ts
│   └── value-objects/               # Domain value objects
│       ├── email.value-object.ts
│       └── password.value-object.ts
│
├── application/                     # 🔧 Use Cases & Interfaces
│   ├── ports/                       # Interface definitions (Dependency Inversion)
│   │   ├── user-repository.port.ts
│   │   ├── password-service.port.ts
│   │   └── jwt-service.port.ts
│   ├── use-cases/                   # Business use cases
│   │   └── auth/
│   │       ├── register.use-case.ts
│   │       ├── login.use-case.ts
│   │       └── get-user-profile.use-case.ts
│   ├── dtos/                        # Data Transfer Objects
│   │   └── auth.dto.ts
│   └── auth.module.ts               # Application module
│
├── infrastructure/                  # 🔌 External Implementations
│   ├── database/
│   │   └── mongodb/
│   │       ├── schemas/
│   │       │   └── user.schema.ts
│   │       ├── repositories/
│   │       │   └── mongo-user.repository.ts
│   │       └── database.module.ts
│   └── security/
│       ├── bcrypt-password.service.ts
│       ├── jwt.service.ts
│       ├── jwt.strategy.ts
│       └── security.module.ts
│
├── presentation/                    # 🌐 HTTP Layer
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── decorators/
│       └── current-user.decorator.ts
│
├── app.module.ts                    # Root module
└── main.ts                          # Application bootstrap
```

## 🔄 Layer Responsibilities

### 1. Domain Layer (Core)
- **Pure business logic** - No framework dependencies
- Contains entities and value objects
- Defines what the application does
- Example: `UserEntity`, `Email`, `Password`

### 2. Application Layer
- **Use cases** - Application-specific business rules
- **Ports (Interfaces)** - Defines contracts for external services
- **DTOs** - Data transfer between layers
- Example: `RegisterUseCase`, `IUserRepository`

### 3. Infrastructure Layer
- **Adapters** - Implements application layer interfaces
- **External concerns** - Database, security, external APIs
- **Concrete implementations** - MongoDB repositories, JWT service
- Example: `MongoUserRepository`, `BcryptPasswordService`

### 4. Presentation Layer
- **HTTP handling** - Controllers, guards, decorators
- **Request/Response** - Transform HTTP to application layer calls
- **Authentication** - Guards and strategies
- Example: `AuthController`, `JwtAuthGuard`

## 🔐 Authentication Flow

### Registration
1. `AuthController` receives HTTP POST `/auth/register`
2. Validates `RegisterDto` using class-validator
3. Calls `RegisterUseCase.execute()`
4. Use case checks if email exists via `IUserRepository`
5. Password is hashed via `IPasswordService`
6. User is created and stored in MongoDB
7. Returns `UserResponseDto` (without password)

### Login
1. `AuthController` receives HTTP POST `/auth/login`
2. Validates `LoginDto`
3. Calls `LoginUseCase.execute()`
4. Finds user via `IUserRepository`
5. Verifies password via `IPasswordService`
6. Generates JWT via `IJwtService`
7. Returns `AuthResponseDto` with access token

### Protected Routes
1. Client sends request with `Authorization: Bearer <token>`
2. `JwtAuthGuard` intercepts request
3. `JwtStrategy` validates token
4. User info attached to request
5. `@CurrentUser()` decorator extracts user info
6. Controller executes use case with user context

## 🛠️ Key Benefits

### ✅ Testability
- Each layer can be tested in isolation
- Use cases don't depend on frameworks
- Easy to mock interfaces (ports)

### ✅ Maintainability
- Clear separation of concerns
- Changes in one layer don't affect others
- Easy to locate where logic belongs

### ✅ Flexibility
- Easy to swap implementations (e.g., PostgreSQL instead of MongoDB)
- Add new features without modifying existing code
- Framework-independent core logic

### ✅ Domain-Driven Design
- Business logic is protected in the core
- Domain entities contain business rules
- Value objects enforce invariants

## 🚀 API Endpoints

### POST `/auth/register`
Register a new user account

**Request Body:**
```json
{
  "username": "user",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "user",
  "role": "student", // default student, admin also available
  "email": "user@example.com",
  "createdAt": "2025-01-12T10:30:00.000Z",
  "updatedAt": "2025-01-12T10:30:00.000Z"
}
```

### POST `/auth/login`
Authenticate and receive JWT token

**Request Body:**
```json
{
  "username": "user",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "adf8qauidqwd8asd78uhbjha bla bla bla..."
}
```

### GET `/auth/profile`
Get current user profile (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username":"user",
  "role":"student",
  "email": "user@example.com",
  "createdAt": "2025-01-12T10:30:00.000Z",
  "updatedAt": "2025-01-12T10:30:00.000Z"
}
```

## 🔧 Environment Variables

```env
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
APP_URL=http://localhost:3000
```

## 📚 Tech Stack

- **Framework:** NestJS
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger/OpenAPI

## 🏃 Running the Application

```bash
# Install dependencies
npm install

# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Tests
npm run test
```

## 📖 API Documentation

Access the interactive API documentation at: `http://localhost:3001/api`

---

**Architecture Pattern:** Onion Architecture (Clean Architecture)  
**Last Updated:** January 2025
