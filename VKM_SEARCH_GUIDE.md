# VKM Enhanced Search & Filtering Guide

## Overview
The VKM search endpoint now supports flexible, accurate filtering across all major fields. Text fields use **partial matching** (case-insensitive) while categorical fields use **exact matching**.

## Endpoint
**GET** `/vkm`

All query parameters are **optional** - you can use any combination or none at all.

---

## Filter Parameters

### Text Search (Partial Match, Case-Insensitive)
These fields support partial text matching using regex. Search for any substring within the field.

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `name` | string | `learning` | Search VKM names containing "learning" |
| `location` | string | `bosch` | Search locations containing "bosch" (matches "Den Bosch") |
| `shortDescription` | string | `verpleegkunde` | Search short descriptions |
| `description` | string | `stage` | Search full descriptions |
| `content` | string | `student` | Search content text |
| `learningOutcomes` | string | `professioneel` | Search learning outcomes |

### Exact Match Filters
These fields require exact values.

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `level` | string | `NLQF5` | Education level (NLQF5, NLQF6, etc.) |
| `studyCredit` | number | `15` | Study credits (EC) |
| `contactId` | string | `58` | Contact person ID |
| `isActive` | boolean | `true` | Active status (true/false) |

---

## Example Queries

### 1. Search by Name (Partial Match)
Find all VKMs with "learning" in the name:
```bash
GET /vkm?name=learning
```

### 2. Filter by Location
Find VKMs in "Den Bosch" (also matches "den bosch", "BOSCH", etc.):
```bash
GET /vkm?location=bosch
```

### 3. Filter by Education Level
Find all NLQF5 level courses:
```bash
GET /vkm?level=NLQF5
```

### 4. Filter by Study Credits
Find all 15 EC courses:
```bash
GET /vkm?studyCredit=15
```

### 5. Search in Description
Find VKMs mentioning "stage" (internship):
```bash
GET /vkm?description=stage
```

### 6. Search in Learning Outcomes
Find VKMs with specific learning outcomes:
```bash
GET /vkm?learningOutcomes=professioneel
```

### 7. Combine Multiple Filters
Find 15 EC VKMs in Den Bosch at NLQF5 level:
```bash
GET /vkm?studyCredit=15&location=bosch&level=NLQF5
```

### 8. Search Across Content
Find VKMs mentioning "student" in content AND "verpleegkunde" in description:
```bash
GET /vkm?content=student&shortDescription=verpleegkunde
```

### 9. Find Active VKMs Only
Filter for active modules:
```bash
GET /vkm?isActive=true
```

### 10. Complex Search
Find active VKMs in Den Bosch about "learning" with "international" in the description:
```bash
GET /vkm?name=learning&location=bosch&description=international&isActive=true
```

---

## PowerShell Examples

### Basic Search
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/vkm?name=learning" -Method Get
```

### Filter by Location and Level
```powershell
$params = @{
    location = "Den Bosch"
    level = "NLQF5"
}
$queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
Invoke-RestMethod -Uri "http://localhost:3000/vkm?$queryString" -Method Get
```

### Search with Authentication (for favorited status)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:3000/vkm?name=learning" -Headers $headers -Method Get
```

### Complex Multi-Filter Search
```powershell
$filters = @{
    name = "learning"
    location = "bosch"
    studyCredit = 15
    isActive = "true"
}
$query = ($filters.GetEnumerator() | ForEach-Object { "$($_.Key)=$([System.Uri]::EscapeDataString($_.Value))" }) -join "&"
Invoke-RestMethod -Uri "http://localhost:3000/vkm?$query" -Method Get
```

---

## Response Format

Each VKM in the response includes:
```json
{
  "id": "68ed766ca5d5dc8235d7ce66",
  "name": "Learning and working abroad",
  "shortDescription": "Internationaal, persoonlijke ontwikkeling, verpleegkunde",
  "description": "Studenten kiezen binnen de (stam) van de opleiding...",
  "content": "Full content text...",
  "studyCredit": 15,
  "location": "Den Bosch",
  "contactId": "58",
  "level": "NLQF5",
  "learningOutcomes": "De student toont professioneel gedrag...",
  "isActive": true,
  "createdAt": "2025-10-14T10:00:00.000Z",
  "updatedAt": "2025-10-14T10:00:00.000Z",
  "isFavorited": false
}
```

**Note:** `isFavorited` is only populated when the request includes a valid JWT token.

---

## Key Improvements Over Old Search

### Before (Old Search)
- ❌ Required fields made searching inflexible
- ❌ Only exact matching on limited fields (location, level, studyCredit, isActive)
- ❌ No text search in name, description, or content
- ❌ Difficult to find VKMs by keywords

### After (New Enhanced Search)
- ✅ All filters are optional - use any combination
- ✅ Partial text matching on all text fields (name, descriptions, content, learning outcomes)
- ✅ Case-insensitive search - "bosch" matches "Den Bosch"
- ✅ Exact matching for categorical fields (level, credits, contact)
- ✅ Combine multiple filters for precise results
- ✅ Similar to admin user search - familiar API pattern

---

## Use Cases

### Student Searching for VKMs
```bash
# "I want something related to nursing in Den Bosch"
GET /vkm?shortDescription=verpleegkunde&location=bosch

# "I need 15 EC courses"
GET /vkm?studyCredit=15

# "Show me international opportunities"
GET /vkm?name=international
```

### Admin Filtering VKMs
```bash
# "Show inactive modules"
GET /vkm?isActive=false

# "Find all NLQF6 courses"
GET /vkm?level=NLQF6

# "Find courses with specific contact person"
GET /vkm?contactId=58
```

### Developer Testing
```bash
# "Get all VKMs" (no filters)
GET /vkm

# "Test partial matching"
GET /vkm?name=learn  # matches "Learning and working abroad"
```

---

## Tips for Best Results

1. **Use Partial Keywords**: Search `"learn"` instead of `"learning and working abroad"` for broader results
2. **Combine Filters**: Use multiple parameters to narrow results: `?name=learn&location=bosch&studyCredit=15`
3. **Case Doesn't Matter**: `bosch`, `Bosch`, and `BOSCH` all work the same
4. **URL Encoding**: Spaces and special characters in queries should be URL-encoded (`%20` for space)
5. **Start Broad, Then Narrow**: Begin with general searches, then add filters to refine

---

## Technical Details

### Implementation
- **Text Search**: Uses MongoDB regex queries with case-insensitive flag (`/pattern/i`)
- **Exact Match**: Direct equality comparison for categorical fields
- **Performance**: Indexed fields (location, level, studyCredit, isActive) provide fast filtering
- **Text Index**: Full-text search index on name, shortdescription, and description fields

### Database Query Example
When you search with `?name=learning&location=bosch&studyCredit=15`:
```javascript
{
  name: /learning/i,           // Regex - partial match
  location: /bosch/i,          // Regex - partial match
  studycredit: 15              // Exact match
}
```

---

## Migration Notes

If you were using the old search endpoint:
- **Old**: Required specific field patterns
- **New**: All parameters optional, more flexible
- **Backward Compatible**: Existing queries still work
- **Enhancement**: Add new parameters gradually to improve search accuracy

No breaking changes - the new system is a pure enhancement! 🎉
