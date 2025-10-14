# VKM API Quick Reference

## Base URL
```
http://localhost:3001
```

## Authentication
Include JWT token in header for authenticated endpoints:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 📖 Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vkm` | Get all VKMs (with optional filters) |
| GET | `/vkm/:id` | Get single VKM by ID |

**Query Parameters for GET /vkm:**
- `location` - Filter by location (e.g., "Den Bosch")
- `level` - Filter by level (e.g., "NLQF5")
- `studyCredit` - Filter by study credits (e.g., 15)
- `isActive` - Filter by active status (true/false, default: true)

### 🔐 User Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vkm/recommendations/me` | Get personalized recommendations |
| POST | `/vkm/:id/favorite` | Toggle favorite status |

### 👑 Admin Endpoints (Authentication + Admin Role Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vkm` | Create new VKM |
| PUT | `/vkm/:id` | Update VKM |
| PATCH | `/vkm/:id/deactivate` | Deactivate VKM (soft delete) |
| DELETE | `/vkm/:id` | Delete VKM (hard delete) |

## Request/Response Examples

### Get All VKMs
```bash
GET /vkm?location=Den%20Bosch&level=NLQF5

Response: 200 OK
[
  {
    "id": "...",
    "name": "Kennismaking met Psychologie",
    "shortDescription": "...",
    "studyCredit": 15,
    "location": "Den Bosch",
    "level": "NLQF5",
    "isActive": true,
    "isFavorited": false
  }
]
```

### Toggle Favorite
```bash
POST /vkm/:id/favorite
Authorization: Bearer <token>

Response: 200 OK
{
  "isFavorited": true,
  "message": "VKM added to favorites"
}
```

### Create VKM (Admin)
```bash
POST /vkm
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New Module",
  "shortDescription": "Brief description",
  "description": "Full description",
  "content": "Detailed content",
  "studyCredit": 15,
  "location": "Den Bosch",
  "contactId": "58",
  "level": "NLQF5",
  "learningOutcomes": "Learning outcomes"
}

Response: 201 Created
{
  "id": "...",
  "name": "New Module",
  ...
}
```

### Update VKM (Admin)
```bash
PUT /vkm/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": false
}

Response: 200 OK
{
  "id": "...",
  "name": "Updated Name",
  "isActive": false,
  ...
}
```

### Deactivate VKM (Admin)
```bash
PATCH /vkm/:id/deactivate
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "id": "...",
  "isActive": false,
  ...
}
```

### Delete VKM (Admin)
```bash
DELETE /vkm/:id
Authorization: Bearer <admin-token>

Response: 204 No Content
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Resource deleted |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Admin access required |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

## Validation Rules

### Create/Update VKM
- `name`: 3-200 characters, required
- `shortDescription`: 10-500 characters, required
- `description`: min 10 characters, required
- `content`: min 10 characters, required
- `studyCredit`: positive number, required
- `location`: min 2 characters, required
- `contactId`: required
- `level`: required
- `learningOutcomes`: required

## NPM Scripts

```bash
npm run start:dev        # Start development server
npm run build           # Build for production
npm run migrate:vkm     # Import VKM data from CSV
```

## Quick Start Commands

```bash
# 1. Start server
npm run start:dev

# 2. Register user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'

# 3. Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123!"}'

# 4. Get all VKMs
curl http://localhost:3001/vkm

# 5. Favorite a VKM (use token from step 3)
curl -X POST http://localhost:3001/vkm/{vkm-id}/favorite \
  -H "Authorization: Bearer <your-token>"
```

## Database Collections

- `vkmdocuments` - VKM modules
- `userdocuments` - User accounts with favorite VKM IDs

## Architecture Layers

```
Presentation → Application → Core
     ↓              ↓          ↓
Controllers    Use Cases   Entities
  Guards         DTOs     
              Repository
                Ports
                  ↑
            Infrastructure
             (MongoDB)
```
