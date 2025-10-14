# VKM (Vrije Keuze Module) Feature Documentation

## Overview

This document describes the VKM (Vrije Keuze Module) feature implementation following Clean/Onion Architecture principles. The feature allows users to browse, favorite, and receive recommendations for elective modules, while admins can perform full CRUD operations.

## Architecture Structure

```
src/
├── core/vkm/
│   └── entities/
│       └── vkm.entity.ts                    # Domain entity
├── application/vkm/
│   ├── dtos/
│   │   └── vkm.dto.ts                       # Data Transfer Objects
│   ├── ports/
│   │   └── vkm-repository.port.ts           # Repository interface
│   ├── use-cases/
│   │   ├── get-all-vkms.use-case.ts
│   │   ├── get-vkm-by-id.use-case.ts
│   │   ├── create-vkm.use-case.ts
│   │   ├── update-vkm.use-case.ts
│   │   ├── delete-vkm.use-case.ts
│   │   ├── deactivate-vkm.use-case.ts
│   │   ├── toggle-favorite-vkm.use-case.ts
│   │   └── get-vkm-recommendations.use-case.ts
│   └── vkm.module.ts                        # Application module
├── infrastructure/vkm/
│   └── database/
│       ├── schemas/
│       │   └── vkm.schema.ts                # MongoDB schema
│       ├── repositories/
│       │   └── mongo-vkm.repository.ts      # Repository implementation
│       └── vkm-database.module.ts           # Database module
└── presentation/
    ├── auth/guards/
    │   └── admin.guard.ts                   # Admin role guard
    └── vkm/controllers/
        └── vkm.controller.ts                # HTTP controller
```

## API Endpoints

### Public/User Endpoints

#### Get All VKMs
```http
GET /vkm?location=Den%20Bosch&level=NLQF5&studyCredit=15&isActive=true
```
Returns all VKMs with optional filters. If authenticated, includes `isFavorited` field.

**Query Parameters:**
- `location` (optional): Filter by location
- `level` (optional): Filter by education level
- `studyCredit` (optional): Filter by study credits
- `isActive` (optional): Filter by active status (default: true)

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Kennismaking met Psychologie",
    "shortDescription": "Brein, gedragsbeinvloeding, ontwikkelingspsychologie...",
    "description": "In deze module leer je hoe je gedrag...",
    "content": "...",
    "studyCredit": 15,
    "location": "Den Bosch",
    "contactId": "58",
    "level": "NLQF5",
    "learningOutcomes": "A. Je beantwoordt vragen...",
    "isActive": true,
    "isFavorited": false,
    "createdAt": "2025-10-14T10:00:00.000Z",
    "updatedAt": "2025-10-14T10:00:00.000Z"
  }
]
```

#### Get Single VKM
```http
GET /vkm/:id
```
Returns a single VKM by ID. If authenticated, includes `isFavorited` field.

#### Get Recommendations
```http
GET /vkm/recommendations/me?limit=10
Authorization: Bearer <token>
```
Returns personalized VKM recommendations (requires authentication).

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 10)

#### Toggle Favorite
```http
POST /vkm/:id/favorite
Authorization: Bearer <token>
```
Toggles favorite status for a VKM (requires authentication).

**Response:**
```json
{
  "isFavorited": true,
  "message": "VKM added to favorites"
}
```

### Admin Endpoints

All admin endpoints require authentication and admin role.

#### Create VKM
```http
POST /vkm
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New VKM Module",
  "shortDescription": "Short description here",
  "description": "Full description here",
  "content": "Detailed content here",
  "studyCredit": 15,
  "location": "Den Bosch",
  "contactId": "58",
  "level": "NLQF5",
  "learningOutcomes": "Learning outcomes here"
}
```

#### Update VKM
```http
PUT /vkm/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated name",
  "isActive": false
}
```

#### Delete VKM
```http
DELETE /vkm/:id
Authorization: Bearer <token>
```
Permanently deletes a VKM. Returns 204 No Content on success.

#### Deactivate VKM
```http
PATCH /vkm/:id/deactivate
Authorization: Bearer <token>
```
Soft deletes a VKM by setting `isActive` to false. Returns the updated VKM.

## Database Schema

### VKM Collection
```typescript
{
  _id: ObjectId,
  name: String,
  shortDescription: String,
  description: String,
  content: String,
  studyCredit: Number,
  location: String,
  contactId: String,
  level: String,
  learningOutcomes: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `location`: For location-based queries
- `level`: For level-based queries
- `studyCredit`: For credit-based queries
- `isActive`: For filtering active/inactive modules
- Text index on `name`, `shortDescription`, `description` for search

### User Collection Updates
Added field:
```typescript
{
  favoriteVkmIds: ObjectId[] // Array of VKM IDs
}
```

## Role-Based Access Control

### Roles
- **Student** (default): Can view VKMs, favorite them, and receive recommendations
- **Admin**: All student permissions + create, update, delete, and deactivate VKMs

### Guards
- `JwtAuthGuard`: Validates JWT token and extracts user information
- `AdminGuard`: Ensures user has admin role (use after JwtAuthGuard)

## Business Rules

1. **Active by Default**: New VKMs are active by default
2. **Soft Delete**: Use deactivate endpoint for soft deletes; delete endpoint for hard deletes
3. **Favorites**: Users can favorite/unfavorite VKMs; toggle endpoint handles both
4. **Recommendations**: Basic implementation returns active VKMs sorted by study credit (can be enhanced with ML)
5. **Public Access**: VKM listing and details are accessible without authentication
6. **Filter Defaults**: When no `isActive` filter is provided, only active VKMs are returned

## Testing the Implementation

### Create an Admin User
First, you need an admin user to test admin endpoints. You can either:
1. Manually update a user in MongoDB to set `role: "admin"`
2. Modify the register endpoint temporarily to allow admin registration
3. Use MongoDB Compass or shell to update a user:
```javascript
db.userdocuments.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Test Sequence

1. **Register/Login as regular user**
   ```bash
   POST /auth/register
   POST /auth/login
   ```

2. **View all VKMs**
   ```bash
   GET /vkm
   ```

3. **Favorite a VKM**
   ```bash
   POST /vkm/:id/favorite
   ```

4. **Get recommendations**
   ```bash
   GET /vkm/recommendations/me
   ```

5. **Login as admin and create VKM**
   ```bash
   POST /auth/login (with admin credentials)
   POST /vkm (with VKM data)
   ```

## Future Enhancements

1. **Advanced Recommendations**
   - Machine learning-based recommendations
   - Collaborative filtering
   - Content-based filtering using NLP

2. **Search Functionality**
   - Full-text search across VKM fields
   - Faceted search with multiple filters

3. **Rating & Reviews**
   - Allow students to rate and review VKMs
   - Calculate average ratings

4. **Enrollment Tracking**
   - Track which students enrolled in which VKMs
   - Enrollment limits and waitlists

5. **Analytics**
   - Popular VKMs dashboard
   - Enrollment statistics
   - User engagement metrics

6. **Notifications**
   - Notify users when new VKMs matching their interests are added
   - Remind users about enrollment deadlines

## Error Handling

The API uses standard HTTP status codes:
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `204 No Content`: Resource deleted successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Dependencies Added

No new dependencies required! The implementation uses existing packages:
- `@nestjs/common`
- `@nestjs/mongoose`
- `mongoose`
- `class-validator`
- `class-transformer`

## Notes

- All dates are stored in ISO 8601 format
- MongoDB ObjectIds are converted to strings in API responses
- Passwords are never exposed in any API response
- The architecture follows the same pattern as the auth module for consistency
- All use cases are properly isolated and testable
- Repository pattern ensures database implementation can be swapped easily
