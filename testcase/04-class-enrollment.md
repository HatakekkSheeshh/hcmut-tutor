# Class & Enrollment Test Cases

## TC-CLASS-001: List Classes
**Feature:** Class Management - List Classes
**Priority:** High
**Preconditions:**
- User is logged in
- Classes exist in the system

**Test Steps:**
1. Send GET request to `/api/classes`
2. Include query parameters
3. Verify response

**Test Data:**
- Query: `?status=active&subject=Mathematics&page=1&limit=10`

**Expected Result:**
- Status code: 200
- Response contains array of classes
- Classes filtered by criteria
- Pagination metadata included

**Status:** Not Tested

---

## TC-CLASS-002: Create Class
**Feature:** Class Management - Create Class
**Priority:** High
**Preconditions:**
- Tutor is logged in

**Test Steps:**
1. Send POST request to `/api/classes`
2. Include class data
3. Verify response

**Test Data:**
```json
{
  "code": "C01",
  "subject": "Mathematics",
  "description": "Advanced Calculus",
  "day": "monday",
  "startTime": "08:00",
  "endTime": "10:00",
  "duration": 120,
  "maxStudents": 30,
  "semesterStart": "2025-01-15",
  "semesterEnd": "2025-05-15",
  "isOnline": false,
  "location": "Room A101"
}
```

**Expected Result:**
- Status code: 201
- Class created with status "active"
- Class ID generated
- tutorId set to current user

**Status:** Not Tested

---

## TC-CLASS-003: Get Class by ID
**Feature:** Class Management - Get Class
**Priority:** High
**Preconditions:**
- Class exists

**Test Steps:**
1. Send GET request to `/api/classes/{classId}`
2. Verify response

**Test Data:**
- URL: `/api/classes/cls_abc123`

**Expected Result:**
- Status code: 200
- Response contains full class details
- Includes enrollment count

**Status:** Not Tested

---

## TC-CLASS-004: Update Class
**Feature:** Class Management - Update Class
**Priority:** High
**Preconditions:**
- Class exists
- Tutor is logged in (class owner)

**Test Steps:**
1. Send PUT request to `/api/classes/{classId}`
2. Include updated data
3. Verify response

**Test Data:**
```json
{
  "description": "Updated description",
  "maxStudents": 35
}
```

**Expected Result:**
- Status code: 200
- Class updated
- updatedAt timestamp changed

**Status:** Not Tested

---

## TC-CLASS-005: Delete Class
**Feature:** Class Management - Delete Class
**Priority:** High
**Preconditions:**
- Class exists
- Tutor is logged in (class owner)

**Test Steps:**
1. Send DELETE request to `/api/classes/{classId}`
2. Verify response

**Test Data:**
- URL: `/api/classes/cls_abc123`

**Expected Result:**
- Status code: 200 or 204
- Class deleted
- Related enrollments handled appropriately

**Status:** Not Tested

---

## TC-CLASS-006: Generate Sessions from Class
**Feature:** Class Management - Generate Sessions
**Priority:** High
**Preconditions:**
- Class exists
- Tutor is logged in

**Test Steps:**
1. Send POST request to `/api/classes/{classId}/generate-sessions`
2. Include date range
3. Verify response

**Test Data:**
```json
{
  "startDate": "2025-01-15",
  "endDate": "2025-05-15"
}
```

**Expected Result:**
- Status code: 200
- Sessions generated for class schedule
- Each session linked to class via classId
- Sessions created for each class day in date range

**Status:** Not Tested

---

## TC-CLASS-007: Update Class Status
**Feature:** Class Management - Status Management
**Priority:** Medium
**Preconditions:**
- Class exists

**Test Steps:**
1. Send PUT request to update status
2. Verify response

**Test Data:**
```json
{
  "status": "full"
}
```

**Expected Result:**
- Status code: 200
- Class status updated
- New enrollments prevented if status is "full"

**Status:** Not Tested

---

## TC-ENROLL-001: List Enrollments
**Feature:** Enrollment Management - List Enrollments
**Priority:** High
**Preconditions:**
- Enrollments exist

**Test Steps:**
1. Send GET request to `/api/enrollments`
2. Include filters
3. Verify response

**Test Data:**
- Query: `?studentId=stu_123&status=active`

**Expected Result:**
- Status code: 200
- Response contains enrollments
- Filtered by criteria

**Status:** Not Tested

---

## TC-ENROLL-002: Create Enrollment
**Feature:** Enrollment Management - Create Enrollment
**Priority:** High
**Preconditions:**
- Class exists
- Student is logged in
- Class has available spots

**Test Steps:**
1. Send POST request to `/api/enrollments`
2. Include enrollment data
3. Verify response

**Test Data:**
```json
{
  "classId": "cls_abc123",
  "notes": "Interested in advanced topics"
}
```

**Expected Result:**
- Status code: 201
- Enrollment created with status "active"
- Class enrollment count incremented
- Student notified

**Status:** Not Tested

---

## TC-ENROLL-003: Create Enrollment for Full Class
**Feature:** Enrollment Management - Capacity Validation
**Priority:** High
**Preconditions:**
- Class exists with status "full"
- Student is logged in

**Test Steps:**
1. Send POST request to enroll in full class
2. Verify response

**Test Data:**
```json
{
  "classId": "cls_full_class"
}
```

**Expected Result:**
- Status code: 400 or 409
- Error message indicating class is full
- Enrollment not created

**Status:** Not Tested

---

## TC-ENROLL-004: Get Enrollment by ID
**Feature:** Enrollment Management - Get Enrollment
**Priority:** Medium
**Preconditions:**
- Enrollment exists

**Test Steps:**
1. Send GET request to `/api/enrollments/{enrollmentId}`
2. Verify response

**Test Data:**
- URL: `/api/enrollments/enr_abc123`

**Expected Result:**
- Status code: 200
- Response contains enrollment details
- Includes class and student information

**Status:** Not Tested

---

## TC-ENROLL-005: Update Enrollment
**Feature:** Enrollment Management - Update Enrollment
**Priority:** Medium
**Preconditions:**
- Enrollment exists

**Test Steps:**
1. Send PUT request to `/api/enrollments/{enrollmentId}`
2. Include updated data
3. Verify response

**Test Data:**
```json
{
  "notes": "Updated notes",
  "status": "completed"
}
```

**Expected Result:**
- Status code: 200
- Enrollment updated
- Status transition handled appropriately

**Status:** Not Tested

---

## TC-ENROLL-006: Delete Enrollment (Drop)
**Feature:** Enrollment Management - Drop Enrollment
**Priority:** High
**Preconditions:**
- Enrollment exists
- Student is logged in

**Test Steps:**
1. Send DELETE request to `/api/enrollments/{enrollmentId}`
2. Verify response

**Test Data:**
- URL: `/api/enrollments/enr_abc123`

**Expected Result:**
- Status code: 200
- Enrollment status changed to "dropped"
- Class enrollment count decremented
- Student notified

**Status:** Not Tested

---

## TC-ENROLL-007: Complete Enrollment
**Feature:** Enrollment Management - Complete Enrollment
**Priority:** Medium
**Preconditions:**
- Enrollment exists with status "active"

**Test Steps:**
1. Update enrollment status to "completed"
2. Verify response

**Test Data:**
```json
{
  "status": "completed"
}
```

**Expected Result:**
- Status code: 200
- Enrollment status updated
- completedAt timestamp set
- Training credits awarded (if applicable)

**Status:** Not Tested

---

## TC-ENROLL-008: Cancel Enrollment
**Feature:** Enrollment Management - Cancel Enrollment
**Priority:** Medium
**Preconditions:**
- Enrollment exists

**Test Steps:**
1. Update enrollment status to "cancelled"
2. Verify response

**Test Data:**
```json
{
  "status": "cancelled"
}
```

**Expected Result:**
- Status code: 200
- Enrollment cancelled
- cancelledAt timestamp set
- Related sessions handled appropriately

**Status:** Not Tested

---

## TC-ENROLL-009: Duplicate Enrollment Prevention
**Feature:** Enrollment Management - Validation
**Priority:** High
**Preconditions:**
- Student already enrolled in class

**Test Steps:**
1. Attempt to create duplicate enrollment
2. Verify response

**Test Data:**
```json
{
  "classId": "cls_already_enrolled"
}
```

**Expected Result:**
- Status code: 400 or 409
- Error message indicating already enrolled
- Enrollment not created

**Status:** Not Tested

---

## TC-ENROLL-010: Enrollment Authorization
**Feature:** Enrollment Management - Authorization
**Priority:** High
**Preconditions:**
- User A is logged in
- User B exists

**Test Steps:**
1. User A tries to create enrollment for User B
2. Verify response

**Test Data:**
```json
{
  "classId": "cls_abc123",
  "studentId": "stu_userB"
}
```

**Expected Result:**
- Status code: 403
- Error message indicating insufficient permissions
- Or enrollment created with current user's ID (if studentId ignored)

**Status:** Not Tested

