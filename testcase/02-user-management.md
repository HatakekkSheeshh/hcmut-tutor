# User Management Test Cases

## TC-USER-001: List All Users (Management)
**Feature:** User Management - List Users
**Priority:** High
**Preconditions:**
- Management user is logged in
- Multiple users exist in the system

**Test Steps:**
1. Send GET request to `/api/users`
2. Include Authorization header with management token
3. Verify response

**Test Data:**
- Headers: `Authorization: Bearer <management_token>`
- Query params: `?page=1&limit=10`

**Expected Result:**
- Status code: 200
- Response contains array of users
- Pagination metadata included
- Users do not contain password field

**Status:** Not Tested

---

## TC-USER-002: List Users as Non-Management
**Feature:** User Management - Authorization
**Priority:** High
**Preconditions:**
- Student or Tutor is logged in

**Test Steps:**
1. Send GET request to `/api/users` as student/tutor
2. Include Authorization header
3. Verify response

**Test Data:**
- Headers: `Authorization: Bearer <student_token>`

**Expected Result:**
- Status code: 403
- Error message indicating insufficient permissions

**Status:** Not Tested

---

## TC-USER-003: Get User by ID
**Feature:** User Management - Get User
**Priority:** High
**Preconditions:**
- User exists in the system
- Management user is logged in

**Test Steps:**
1. Send GET request to `/api/users/{userId}`
2. Include Authorization header
3. Verify response

**Test Data:**
- URL: `/api/users/stu_abc123`
- Headers: `Authorization: Bearer <management_token>`

**Expected Result:**
- Status code: 200
- Response contains user object
- Password field is not included

**Status:** Not Tested

---

## TC-USER-004: Get Non-existent User
**Feature:** User Management - Error Handling
**Priority:** Medium
**Preconditions:**
- Management user is logged in

**Test Steps:**
1. Send GET request to `/api/users/{nonExistentId}`
2. Verify response

**Test Data:**
- URL: `/api/users/nonexistent_id_123`

**Expected Result:**
- Status code: 404
- Error message indicating user not found

**Status:** Not Tested

---

## TC-USER-005: Update User Profile
**Feature:** User Management - Update User
**Priority:** High
**Preconditions:**
- User is logged in
- User exists in the system

**Test Steps:**
1. Send PUT/PATCH request to `/api/users/{userId}`
2. Include updated user data
3. Verify response

**Test Data:**
```json
{
  "name": "Updated Name",
  "phone": "0123456789",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Expected Result:**
- Status code: 200
- Response contains updated user object
- User data is updated in the system
- updatedAt timestamp is changed

**Status:** Not Tested

---

## TC-USER-006: Update User as Different User
**Feature:** User Management - Authorization
**Priority:** High
**Preconditions:**
- User A is logged in
- User B exists in the system

**Test Steps:**
1. User A tries to update User B's profile
2. Send PUT request to `/api/users/{userBId}`
3. Verify response

**Test Data:**
- URL: `/api/users/{userBId}`
- Headers: `Authorization: Bearer <userA_token>`

**Expected Result:**
- Status code: 403
- Error message indicating insufficient permissions
- User B's data is not modified

**Status:** Not Tested

---

## TC-USER-007: Delete User (Management)
**Feature:** User Management - Delete User
**Priority:** High
**Preconditions:**
- Management user is logged in
- User exists in the system

**Test Steps:**
1. Send DELETE request to `/api/users/{userId}`
2. Verify response
3. Verify user is deleted

**Test Data:**
- URL: `/api/users/stu_abc123`
- Headers: `Authorization: Bearer <management_token>`

**Expected Result:**
- Status code: 200 or 204
- Success message
- User is removed from the system
- Related data (sessions, etc.) handled appropriately

**Status:** Not Tested

---

## TC-USER-008: Delete User as Non-Management
**Feature:** User Management - Authorization
**Priority:** High
**Preconditions:**
- Student/Tutor is logged in

**Test Steps:**
1. Send DELETE request to `/api/users/{userId}`
2. Verify response

**Test Data:**
- Headers: `Authorization: Bearer <student_token>`

**Expected Result:**
- Status code: 403
- Error message indicating insufficient permissions

**Status:** Not Tested

---

## TC-USER-009: List Tutors
**Feature:** User Management - List Tutors
**Priority:** High
**Preconditions:**
- User is logged in
- Tutors exist in the system

**Test Steps:**
1. Send GET request to `/api/tutors`
2. Include query parameters for filtering
3. Verify response

**Test Data:**
- Query: `?subject=Mathematics&rating=4&page=1&limit=10`

**Expected Result:**
- Status code: 200
- Response contains array of tutors
- Tutors filtered by subject and rating
- Each tutor includes: id, name, subjects, rating, bio, availability

**Status:** Not Tested

---

## TC-USER-010: Get Tutor by ID
**Feature:** User Management - Get Tutor
**Priority:** High
**Preconditions:**
- Tutor exists in the system

**Test Steps:**
1. Send GET request to `/api/tutors/{tutorId}`
2. Verify response

**Test Data:**
- URL: `/api/tutors/tut_abc123`

**Expected Result:**
- Status code: 200
- Response contains tutor details
- Includes: subjects, rating, totalSessions, bio, availability, verified status

**Status:** Not Tested

---

## TC-USER-011: Get Tutor Reviews
**Feature:** User Management - Tutor Reviews
**Priority:** Medium
**Preconditions:**
- Tutor exists
- Tutor has evaluations/reviews

**Test Steps:**
1. Send GET request to `/api/tutors/{tutorId}/reviews`
2. Verify response

**Test Data:**
- URL: `/api/tutors/tut_abc123/reviews`

**Expected Result:**
- Status code: 200
- Response contains array of reviews/evaluations
- Each review includes: rating, comment, aspects, student info

**Status:** Not Tested

---

## TC-USER-012: Get Student by ID
**Feature:** User Management - Get Student
**Priority:** High
**Preconditions:**
- Student exists in the system

**Test Steps:**
1. Send GET request to `/api/students/{studentId}`
2. Verify response

**Test Data:**
- URL: `/api/students/stu_abc123`

**Expected Result:**
- Status code: 200
- Response contains student details
- Includes: major, year, interests, preferredSubjects, trainingCredits

**Status:** Not Tested

---

## TC-USER-013: Get Student Sessions
**Feature:** User Management - Student Sessions
**Priority:** Medium
**Preconditions:**
- Student exists
- Student has sessions

**Test Steps:**
1. Send GET request to `/api/students/{studentId}/sessions`
2. Include query parameters
3. Verify response

**Test Data:**
- URL: `/api/students/stu_abc123/sessions?status=confirmed`

**Expected Result:**
- Status code: 200
- Response contains array of sessions
- Sessions filtered by status
- Each session includes full details

**Status:** Not Tested

---

## TC-USER-014: Update Student Profile
**Feature:** User Management - Update Student Profile
**Priority:** High
**Preconditions:**
- Student is logged in

**Test Steps:**
1. Send PUT request to `/api/users/{studentId}`
2. Update student-specific fields
3. Verify response

**Test Data:**
```json
{
  "name": "Updated Name",
  "major": "Software Engineering",
  "year": 3,
  "interests": ["Web Development", "AI"],
  "preferredSubjects": ["Mathematics", "Programming"]
}
```

**Expected Result:**
- Status code: 200
- Student profile updated
- All fields saved correctly

**Status:** Not Tested

---

## TC-USER-015: Update Tutor Profile
**Feature:** User Management - Update Tutor Profile
**Priority:** High
**Preconditions:**
- Tutor is logged in

**Test Steps:**
1. Send PUT request to `/api/users/{tutorId}`
2. Update tutor-specific fields
3. Verify response

**Test Data:**
```json
{
  "name": "Updated Tutor Name",
  "bio": "Experienced tutor in Mathematics",
  "subjects": ["Mathematics", "Physics"],
  "credentials": ["PhD in Mathematics"]
}
```

**Expected Result:**
- Status code: 200
- Tutor profile updated
- Subjects and credentials saved

**Status:** Not Tested

---

## TC-USER-016: Search Users with Filters
**Feature:** User Management - User Search
**Priority:** Medium
**Preconditions:**
- Management user is logged in
- Multiple users exist

**Test Steps:**
1. Send GET request to `/api/users` with search parameters
2. Filter by role, name, email
3. Verify response

**Test Data:**
- Query: `?role=student&search=John&page=1&limit=10`

**Expected Result:**
- Status code: 200
- Response contains filtered users
- Only users matching criteria returned
- Pagination works correctly

**Status:** Not Tested

---

## TC-USER-017: Update User with Invalid Data
**Feature:** User Management - Validation
**Priority:** Medium
**Preconditions:**
- User is logged in

**Test Steps:**
1. Send PUT request with invalid data
2. Verify validation errors

**Test Data:**
```json
{
  "email": "invalid-email",
  "year": -1,
  "rating": 10
}
```

**Expected Result:**
- Status code: 400
- Validation error messages
- User data not updated

**Status:** Not Tested

---

## TC-USER-018: Update User Role (Management Only)
**Feature:** User Management - Role Management
**Priority:** High
**Preconditions:**
- Management user is logged in

**Test Steps:**
1. Send PUT request to update user role
2. Verify response

**Test Data:**
```json
{
  "role": "tutor"
}
```

**Expected Result:**
- Status code: 200 (if allowed)
- User role updated
- Or 403 if role changes not allowed via this endpoint

**Status:** Not Tested

