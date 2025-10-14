# VKM Feature - Setup & Testing Guide

## ✅ Implementation Complete!

The VKM (Vrije Keuze Module) feature has been successfully implemented following your clean architecture pattern. All components are in place and the code compiles without errors.

## 📁 Files Created

### Core Layer (Domain)
- ✅ `src/core/vkm/entities/vkm.entity.ts`

### Application Layer
- ✅ `src/application/vkm/dtos/vkm.dto.ts`
- ✅ `src/application/vkm/ports/vkm-repository.port.ts`
- ✅ `src/application/vkm/use-cases/get-all-vkms.use-case.ts`
- ✅ `src/application/vkm/use-cases/get-vkm-by-id.use-case.ts`
- ✅ `src/application/vkm/use-cases/create-vkm.use-case.ts`
- ✅ `src/application/vkm/use-cases/update-vkm.use-case.ts`
- ✅ `src/application/vkm/use-cases/delete-vkm.use-case.ts`
- ✅ `src/application/vkm/use-cases/deactivate-vkm.use-case.ts`
- ✅ `src/application/vkm/use-cases/toggle-favorite-vkm.use-case.ts`
- ✅ `src/application/vkm/use-cases/get-vkm-recommendations.use-case.ts`
- ✅ `src/application/vkm/vkm.module.ts`

### Infrastructure Layer
- ✅ `src/infrastructure/vkm/database/schemas/vkm.schema.ts`
- ✅ `src/infrastructure/vkm/database/repositories/mongo-vkm.repository.ts`
- ✅ `src/infrastructure/vkm/database/vkm-database.module.ts`
- ✅ Updated `src/infrastructure/auth/database/schemas/user.schema.ts` (added favoriteVkmIds)
- ✅ Updated `src/infrastructure/auth/database/repositories/mongo-user.repository.ts` (added favorite methods)

### Presentation Layer
- ✅ `src/presentation/auth/guards/admin.guard.ts`
- ✅ `src/presentation/vkm/controllers/vkm.controller.ts`

### Additional Files
- ✅ Updated `src/application/auth/ports/user-repository.port.ts` (added favorite methods)
- ✅ Updated `src/app/app.module.ts` (imported VKM module)
- ✅ `src/scripts/migrate-vkm.ts` (CSV import script)
- ✅ `VKM_FEATURE.md` (comprehensive documentation)

## 🚀 Getting Started

### 1. Start the Development Server

```powershell
npm run start:dev
```

The server should start without errors at `http://localhost:3001` (or your configured port).

### 2. Create an Admin User

First, create a regular user via the API:

```powershell
# Register a new user
curl -X POST http://localhost:3001/auth/register -H "Content-Type: application/json" -d '{\"username\":\"admin\",\"email\":\"admin@example.com\",\"password\":\"Admin123!\"}'
```

Then, manually update this user to be an admin using MongoDB:

**Option A: Using MongoDB Compass**
1. Connect to your MongoDB database
2. Find the `userdocuments` collection
3. Find the user with email `admin@example.com`
4. Edit the document and change `role` from `"student"` to `"admin"`
5. Save

**Option B: Using MongoDB Shell**
```javascript
use kiescompass; // or your database name
db.userdocuments.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

**Option C: Using PowerShell with MongoDB**
```powershell
mongo "mongodb://localhost:27017/kiescompass" --eval 'db.userdocuments.updateOne({email:"admin@example.com"},{$set:{role:"admin"}})'
```

### 3. Login and Get Token

```powershell
# Login as admin
curl -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d '{\"username\":\"admin\",\"password\":\"Admin123!\"}'
```

Save the JWT token from the response. You'll need it for authenticated requests.

### 4. Import VKM Data from CSV

```powershell
npm run migrate:vkm
```

This will import all VKM data from your CSV file into MongoDB.

## 🧪 Testing the API

### User Endpoints (No Authentication Required)

#### 1. Get All VKMs
```powershell
curl http://localhost:3001/vkm
```

#### 2. Get VKMs with Filters
```powershell
curl "http://localhost:3001/vkm?location=Den%20Bosch&level=NLQF5&studyCredit=15"
```

#### 3. Get Single VKM
```powershell
curl http://localhost:3001/vkm/{vkm-id}
```

### Authenticated User Endpoints

Replace `<your-jwt-token>` with the actual token from login.

#### 4. Favorite a VKM
```powershell
curl -X POST http://localhost:3001/vkm/{vkm-id}/favorite -H "Authorization: Bearer <your-jwt-token>"
```

#### 5. Get Recommendations
```powershell
curl http://localhost:3001/vkm/recommendations/me -H "Authorization: Bearer <your-jwt-token>"
```

### Admin Endpoints

#### 6. Create a VKM
```powershell
curl -X POST http://localhost:3001/vkm -H "Authorization: Bearer <your-jwt-token>" -H "Content-Type: application/json" -d '{\"name\":\"Test VKM\",\"shortDescription\":\"A test module\",\"description\":\"Full description\",\"content\":\"Detailed content\",\"studyCredit\":15,\"location\":\"Den Bosch\",\"contactId\":\"58\",\"level\":\"NLQF5\",\"learningOutcomes\":\"You will learn...\"}'
```

#### 7. Update a VKM
```powershell
curl -X PUT http://localhost:3001/vkm/{vkm-id} -H "Authorization: Bearer <your-jwt-token>" -H "Content-Type: application/json" -d '{\"name\":\"Updated VKM Name\"}'
```

#### 8. Deactivate a VKM
```powershell
curl -X PATCH http://localhost:3001/vkm/{vkm-id}/deactivate -H "Authorization: Bearer <your-jwt-token>"
```

#### 9. Delete a VKM
```powershell
curl -X DELETE http://localhost:3001/vkm/{vkm-id} -H "Authorization: Bearer <your-jwt-token>"
```

## 🧪 Using Postman/Insomnia

### Import Collection

Create a new collection with these requests:

1. **Register User** - POST `/auth/register`
2. **Login** - POST `/auth/login`
3. **Get All VKMs** - GET `/vkm`
4. **Get Single VKM** - GET `/vkm/:id`
5. **Get Recommendations** - GET `/vkm/recommendations/me` (Auth required)
6. **Toggle Favorite** - POST `/vkm/:id/favorite` (Auth required)
7. **Create VKM** - POST `/vkm` (Admin required)
8. **Update VKM** - PUT `/vkm/:id` (Admin required)
9. **Deactivate VKM** - PATCH `/vkm/:id/deactivate` (Admin required)
10. **Delete VKM** - DELETE `/vkm/:id` (Admin required)

### Setting Up Auth in Postman

1. Login and copy the JWT token
2. In Postman, go to Authorization tab
3. Select "Bearer Token"
4. Paste your JWT token

## ✨ Features Implemented

### ✅ User Features
- [x] Get all VKMs with optional filters (location, level, study credit, active status)
- [x] Get single VKM by ID
- [x] Favorite/unfavorite VKMs
- [x] Get personalized recommendations
- [x] See favorite status on VKMs when authenticated

### ✅ Admin Features
- [x] Create new VKMs
- [x] Update existing VKMs
- [x] Delete VKMs (hard delete)
- [x] Deactivate VKMs (soft delete)
- [x] Full CRUD operations

### ✅ Technical Features
- [x] Clean Architecture implementation
- [x] Role-based access control (Student/Admin)
- [x] JWT authentication
- [x] MongoDB integration with Mongoose
- [x] Input validation with class-validator
- [x] Proper error handling
- [x] TypeScript strict mode compliance
- [x] RESTful API design

## 📊 Database Collections

### `vkmdocuments`
Stores all VKM modules with full details.

### `userdocuments`
Updated to include `favoriteVkmIds` array for tracking user favorites.

## 🔍 Verification Checklist

- [ ] Server starts without errors
- [ ] Can register a new user
- [ ] Can login and receive JWT token
- [ ] Can make admin user manually
- [ ] Can import VKM data from CSV
- [ ] Can view all VKMs as anonymous user
- [ ] Can view single VKM as anonymous user
- [ ] Can favorite a VKM as authenticated user
- [ ] Can get recommendations as authenticated user
- [ ] Can create VKM as admin
- [ ] Can update VKM as admin
- [ ] Can deactivate VKM as admin
- [ ] Can delete VKM as admin
- [ ] Cannot perform admin actions as regular user

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution:** Run `npm install` to ensure all dependencies are installed.

### Issue: MongoDB connection errors
**Solution:** 
1. Check your `.env` file has correct `MONGODB_URI`
2. Ensure MongoDB is running
3. Check connection string format

### Issue: JWT authentication fails
**Solution:**
1. Ensure `JWT_SECRET` is set in `.env`
2. Check token is being sent in Authorization header
3. Verify token hasn't expired

### Issue: Admin endpoints return 403
**Solution:**
1. Verify user has `role: "admin"` in database
2. Check JWT token is valid and contains user info
3. Ensure both `JwtAuthGuard` and `AdminGuard` are working

### Issue: CSV import fails
**Solution:**
1. Check CSV file exists at root of project
2. Verify CSV format matches expected structure
3. Check MongoDB connection is working

## 📚 Next Steps

1. **Test all endpoints** using Postman or curl
2. **Import CSV data** using the migration script
3. **Review the code** to understand the architecture
4. **Customize recommendations** algorithm based on your needs
5. **Add more features** from the future enhancements list in VKM_FEATURE.md

## 📖 Documentation

For detailed API documentation, architecture details, and future enhancements, see:
- `VKM_FEATURE.md` - Complete feature documentation
- `AuthArchitecture.md` - Architecture overview

## 🎉 You're All Set!

The VKM feature is now fully integrated into your application following clean architecture principles. All user requirements have been implemented:

✅ Users can get all VKMs  
✅ Users can get a single VKM  
✅ Users can favorite a VKM  
✅ Users can receive recommendations  
✅ Admins can create a VKM  
✅ Admins can update a VKM  
✅ Admins can delete a VKM  
✅ Admins can deactivate a VKM  

Happy coding! 🚀
