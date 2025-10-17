# KiesCompass Backend Architecture

## Overview

This is a **NestJS + TypeScript + MongoDB** backend application following a **strict layered architecture** pattern inspired by traditional MVC and service-oriented design principles.

## Architecture Pattern: Onion Architecture (adapted)

This project now follows the **Onion Architecture** principle with a small, pragmatic adaptation so the repo remains readable.

Core rule enforced: Dependencies always point inward. Inner layers do not know outer layers.

Layers (inner → outer):

- Domain Layer: Entities & Value Objects (pure business logic)
- Application Layer: Use-cases / Service interfaces (defines ports)
- Interface Layer: Controllers, Presenters (depends on application ports)
- Infrastructure Layer: Database, external APIs, DAO implementations (implements ports)

The key change vs a simple layered design is that the application layer now defines small "ports" (TypeScript interfaces + DI tokens) that express required behavior (for example `USER_REPOSITORY`, `VKM_REPOSITORY`, `PASSWORD_SERVICE` and `JWT_SERVICE`). Outer layers (DAO, adapters) implement those ports and are bound in Nest modules. This enforces dependency inversion without heavily changing folder names.

---

## Directory Structure (after minimal Onion changes)

```
src/
├── controllers/              # HTTP request handlers
│   ├── auth.controller.ts    # Auth endpoints
│   └── vkm.controller.ts     # VKM endpoints
│
├── services/                 # Application layer - Use cases / Services
│   ├── auth.service.ts       # Auth business logic (depends on ports)
│   └── vkm.service.ts        # VKM business logic (depends on ports)
│
├── infrastructure/dao/       # Infrastructure implementations (DAOs)
│   ├── user.dao.ts           # User database queries (implements USER_REPOSITORY)
│   └── vkm.dao.ts            # VKM database queries (implements VKM_REPOSITORY)
│
├── db/                       # Database configuration
│   ├── schemas/              # Mongoose schemas
│   │   ├── user.schema.ts
│   │   └── vkm.schema.ts
│   └── database.module.ts    # Database module
│
├── middleware/               # Guards & strategies
│   ├── jwt-auth.guard.ts     # JWT authentication guard
│   ├── admin.guard.ts        # Admin authorization guard
│   └── jwt.strategy.ts       # Passport JWT strategy
│
├── util/                     # Utilities & shared code
│   ├── dtos/                 # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   └── vkm.dto.ts
│   ├── security/             # Security utilities
│   │   ├── bcrypt-password.service.ts
│   │   └── jwt.service.ts
│   └── decorators/
│       └── current-user.decorator.ts
│
├── modules/                  # NestJS feature modules (composition roots)
│   ├── auth.module.ts        # Binds tokens to concrete implementations
  │   └── vkm.module.ts
│
├── app/                      # Root application
│   ├── app.module.ts
│   ├── app.controller.ts
│   └── app.service.ts
│
└── main.ts                   # Application entry point
```

---

## Layer Responsibilities

### 1. **Controller Layer** (`/controllers`)

**Purpose:** Handle HTTP requests and responses

**Responsibilities:**
- Receive HTTP requests (GET, POST, PUT, DELETE, etc.)
- Validate request data using DTOs
- Call appropriate service methods
- Return HTTP responses
- Apply guards for authentication/authorization

**Rules:**
- ✅ Can call Service layer
- ❌ Cannot call DAO layer directly
- ❌ Cannot contain business logic
- ❌ Cannot execute database queries

**Example:**
```typescript
@Controller('vkm')
export class VkmController {
  constructor(private readonly vkmService: VkmService) {}

  @Get()
  async getAllVkms(@Query() query: GetAllVkmsQueryDto): Promise<VkmResponseDto[]> {
    return this.vkmService.getAllVkms(query);  // Calls service
  }
}
```

---

### 2. **Application Layer** (`/services`)

**Purpose:** Implement business logic and orchestrate operations

**Responsibilities:**
- Validate business rules
- Coordinate multiple DAO operations
- Handle complex workflows
- Transform data between layers
- Throw business exceptions

**Rules:**
- ✅ Services depend on *ports* (interfaces) defined by the application/domain layer
- ✅ Services orchestrate business logic
- ❌ Services must not import infrastructure implementations directly

**Example:**
```typescript
@Injectable()
export class VkmService {
  constructor(
    private readonly vkmDao: VkmDao,
    private readonly userDao: UserDao,
  ) {}

  async getAllVkms(query: GetAllVkmsQueryDto, userId?: string): Promise<VkmResponseDto[]> {
    // Business logic
    const vkms = await this.vkmDao.findAll(query);  // Calls DAO
    
    if (userId) {
      const favorites = await this.userDao.getFavoriteVkmIds(userId);  // Calls another DAO
      // Transform and return
    }
    
    return vkms.map(this.mapToDto);
  }
}
```

---

### 3. **Infrastructure Layer** (`/infrastructure/dao`, `db`)

**Purpose:** Execute database operations (Data Access Object pattern)

**Responsibilities:**
- Execute MongoDB queries
- CRUD operations
- Database-specific logic
- Return raw data or documents

**Rules:**
- ✅ Infrastructure provides concrete implementations of ports defined in the application layer
- ✅ Can interact with database (Mongoose models)
- ❌ Should not import application internals other than the port interfaces

Note: The DAOs are located under `src/infrastructure/dao` to make the infrastructure boundary explicit.

**Example:**
```typescript
@Injectable()
export class VkmDao {
  constructor(
    @InjectModel(VkmDocument.name)
    private readonly vkmModel: Model<VkmDocument>,
  ) {}

  async findAll(filters?: VkmFilters): Promise<any[]> {
    const query: any = {};
    if (filters?.location) query.location = filters.location;
    return this.vkmModel.find(query).lean().exec();  // Database query
  }
}
```

---

## Data Flow Example

### Example: Get All VKMs

```
1. HTTP GET /vkm?location=Den%20Bosch
   ↓
2. VkmController.getAllVkms()
   - Validates query parameters
   - Extracts user from JWT (if authenticated)
   ↓
3. VkmService.getAllVkms(query, userId)
  - Calls `VKM_REPOSITORY.findAll(filters)` (port)
  - Calls `USER_REPOSITORY.getFavoriteVkmIds(userId)` (port)
   - Merges data & applies business logic
   ↓
4. VkmDao.findAll() & UserDao.getFavoriteVkmIds()
  - Execute MongoDB queries (infrastructure implementations)
  - Return raw data / domain entities
   ↓
5. Response flows back up:
   DAO → Service → Controller → HTTP Response
```

---

## Authentication & Authorization

### JWT Authentication Flow

```
1. User logs in → AuthController.login()
2. AuthService validates credentials
3. UserDao queries database
4. JWT token generated & returned
5. Subsequent requests include JWT in header
6. JwtAuthGuard validates token
7. JwtStrategy extracts user info
8. User info available in controller via @CurrentUser()
```

### Guards

- **JwtAuthGuard**: Protects routes requiring authentication
- **AdminGuard**: Ensures user has admin role

---

## Module Organization

Each feature has its own module that wires everything together:

### AuthModule (composition root - example)
```typescript
@Module({
  imports: [DatabaseModule, JwtModule, PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserDao,
    { provide: USER_REPOSITORY, useClass: UserDao },
    BcryptPasswordService,
    { provide: PASSWORD_SERVICE, useClass: BcryptPasswordService },
    JwtServiceAdapter,
    { provide: JWT_SERVICE, useClass: JwtServiceAdapter },
    JwtStrategy,
  ],
  exports: [AuthService, UserDao, USER_REPOSITORY],
})
export class AuthModule {}
```

### VkmModule
```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [VkmController],
  providers: [VkmService, VkmDao, UserDao],
  exports: [VkmService, VkmDao],
})
export class VkmModule {}
```

---

## Key Design Decisions

### 1. **Onion Architecture (adapted)**
- **Chosen:** Onion-style dependency inversion enforced via small, explicit ports and DI tokens
- **Why:** Keep code readable while preventing inward dependency violations; minimal changes to folder structure
- **Trade-off:** Slightly more indirection (tokens/interfaces) but improved testability and decoupling

### 2. **DAO Pattern**
- **Chosen:** Explicit DAO layer
- **Why:** Clear separation of data access from business logic
- **Benefit:** Easy to mock for testing, database-agnostic

### 3. **MongoDB with Mongoose**
- **Chosen:** Mongoose ODM
- **Why:** Strong typing with TypeScript, schema validation
- **Structure:** Schemas in `/db`, accessed via DAOs

### Indexing note

Removed duplicate Mongoose index warnings by centralizing index declarations in the schema files. Field-level `unique: true` flags were removed for `username` and `email` in `src/db/schemas/user.schema.ts` and replaced by explicit `UserSchema.index(...)` calls with case-insensitive collation. This avoids duplicate-index warnings at startup.

### 4. **DTOs (Data Transfer Objects)**
- **Location:** `/util/dtos`
- **Purpose:** Validate incoming requests, document API contracts
- **Library:** `class-validator` for validation

---

## API Endpoints

### Auth Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login & get JWT token
- `GET /auth/profile` - Get current user profile (authenticated)

### VKM Endpoints
- `GET /vkm` - Get all VKMs (with filters)
- `GET /vkm/:id` - Get VKM by ID
- `GET /vkm/favorites` - Get user's favorites (authenticated)
- `GET /vkm/recommendations/me` - Get recommendations (authenticated)
- `POST /vkm/:id/favorite` - Toggle favorite (authenticated)
- `POST /vkm` - Create VKM (admin only)
- `PUT /vkm/:id` - Update VKM (admin only)
- `DELETE /vkm/:id` - Delete VKM (admin only)
- `PATCH /vkm/:id/deactivate` - Deactivate VKM (admin only)

---

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/kiescompass
JWT_SECRET=your-secret-key-here
PORT=3000
```

---

## Testing Strategy

### Unit Tests
- **Services:** Mock DAOs, test business logic
- **DAOs:** Use in-memory MongoDB or mocked Mongoose models
- **Controllers:** Mock services, test HTTP handling

### Integration Tests
- Test full request flow: Controller → Service → DAO → Database

---

## Future Enhancements

1. **Caching Layer** - Add Redis for frequently accessed data
2. **Event-Driven** - Implement event emitters for decoupled operations
3. **CQRS** - Separate read/write models for complex queries
4. **Repository Pattern** - Abstract DAO layer further if needed
5. **Microservices** - Split into separate services if scale requires

---

## Summary

This architecture provides:
- ✅ **Clear separation of concerns**
- ✅ **Easy to test** (each layer can be mocked)
- ✅ **Maintainable** (find code easily)
- ✅ **Scalable** (add features without breaking existing code)
- ✅ **NestJS best practices** (modules, dependency injection)
- ✅ **Type-safe** (TypeScript throughout)

**Remember:** Controllers ask Services, Services depend on *ports* (interfaces) defined inward, and DI binds infrastructure implementations outward. Dependencies must always point inward.
