# KiesCompass Backend Architecture

## Overview

This is a **NestJS + TypeScript + MongoDB** backend application following a **strict layered architecture** pattern inspired by traditional MVC and service-oriented design principles.

## Architecture Pattern: Layered Architecture

The application follows a **3-tier layered architecture** with strict separation of concerns:

```
┌─────────────────────────────────────────────┐
│         CONTROLLER LAYER (HTTP)             │
│  Handles HTTP requests/responses            │
│  Cannot execute queries directly            │
└──────────────────┬──────────────────────────┘
                   │ calls
                   ▼
┌─────────────────────────────────────────────┐
│         SERVICE LAYER (Business Logic)      │
│  Contains business rules & validation       │
│  Orchestrates data operations               │
└──────────────────┬──────────────────────────┘
                   │ calls
                   ▼
┌─────────────────────────────────────────────┐
│         DAO LAYER (Data Access)             │
│  Executes database queries                  │
│  Direct interaction with MongoDB            │
└─────────────────────────────────────────────┘
```

### Core Principle: **Dependency Flow**

**Lower layers NEVER call higher layers**
- ✅ Controller → Service → DAO ✓
- ❌ DAO → Service ✗
- ❌ Service → Controller ✗

---

## Directory Structure

```
src/
├── controllers/              # HTTP request handlers
│   ├── auth.controller.ts    # Auth endpoints
│   └── vkm.controller.ts     # VKM endpoints
│
├── services/                 # Business logic layer
│   ├── auth.service.ts       # Auth business logic
│   └── vkm.service.ts        # VKM business logic
│
├── dao/                      # Data Access Objects
│   ├── user.dao.ts           # User database queries
│   └── vkm.dao.ts            # VKM database queries
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
├── modules/                  # NestJS feature modules
│   ├── auth.module.ts
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

### 2. **Service Layer** (`/services`)

**Purpose:** Implement business logic and orchestrate operations

**Responsibilities:**
- Validate business rules
- Coordinate multiple DAO operations
- Handle complex workflows
- Transform data between layers
- Throw business exceptions

**Rules:**
- ✅ Can call DAO layer
- ✅ Can call other services
- ❌ Cannot be called by DAO layer
- ❌ Cannot directly execute database queries

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

### 3. **DAO Layer** (`/dao`)

**Purpose:** Execute database operations (Data Access Object pattern)

**Responsibilities:**
- Execute MongoDB queries
- CRUD operations
- Database-specific logic
- Return raw data or documents

**Rules:**
- ✅ Can interact with database (Mongoose models)
- ❌ Cannot call Service layer
- ❌ Cannot call Controller layer
- ❌ Cannot contain business logic

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
   - Calls VkmDao.findAll(filters)
   - Calls UserDao.getFavoriteVkmIds(userId)
   - Merges data & applies business logic
   ↓
4. VkmDao.findAll() & UserDao.getFavoriteVkmIds()
   - Execute MongoDB queries
   - Return raw data
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

### AuthModule
```typescript
@Module({
  imports: [DatabaseModule, JwtModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, UserDao, BcryptPasswordService, JwtServiceAdapter, JwtStrategy],
  exports: [AuthService, UserDao],
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

### 1. **Layered Architecture vs Onion/Hexagonal**
- **Chosen:** Layered Architecture
- **Why:** Simpler, more maintainable for small-to-medium projects
- **Trade-off:** Less flexible than Onion, but easier to understand

### 2. **DAO Pattern**
- **Chosen:** Explicit DAO layer
- **Why:** Clear separation of data access from business logic
- **Benefit:** Easy to mock for testing, database-agnostic

### 3. **MongoDB with Mongoose**
- **Chosen:** Mongoose ODM
- **Why:** Strong typing with TypeScript, schema validation
- **Structure:** Schemas in `/db`, accessed via DAOs

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

**Remember:** Controllers ask Services, Services ask DAOs, DAOs query the database. Never the other way around!
