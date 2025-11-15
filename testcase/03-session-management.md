# Session Management Test Cases

## TC-SESSION-001: List Sessions
**Feature:** Session Management - List Sessions
**Priority:** High
**Preconditions:**
- User is logged in
- Sessions exist in the system

**Test Steps:**
1. Send GET request to `/api/sessions`
2. Include query parameters for filtering
3. Verify response

**Test Data:**
- Query: `?status=confirmed&studentId=stu_123&page=1&limit=10`

**Expected Result:**
- Status code: 200
- Response contains array of sessions
- Sessions filtered by criteria
- User can only see their own sessions (unless management)
- Pagination metadata included

**Status:** Not Tested

---

## TC-SESSION-002: Create Session (Book Session)
**Feature:** Session Management - Create Session
**Priority:** High
**Preconditions:**
- Student is logged in
- Tutor exists
- Tutor has availability

**Test Steps:**
1. Send POST request to `/api/sessions`
2. Include session booking data
3. Verify response

**Test Data:**
```json
{
  "tutorId": "tut_abc123",
  "subject": "Mathematics",
  "topic": "Calculus",
  "startTime": "2025-01-20T10:00:00Z",
  "endTime": "2025-01-20T11:00:00Z",
  "duration": 60,
  "isOnline": true,
  "meetingLink": "https://meet.example.com/room123"
}
```

**Expected Result:**
- Status code: 201 or 200
- Session created with status "pending" or "confirmed"
- Session ID generated
- Notification sent to tutor
- Session appears in tutor's session list

**Status:** Not Tested

---

## TC-SESSION-003: Create Session with Invalid Tutor
**Feature:** Session Management - Validation
**Priority:** High
**Preconditions:**
- Student is logged in

**Test Steps:**
1. Send POST request with non-existent tutorId
2. Verify response

**Test Data:**
```json
{
  "tutorId": "tut_nonexistent",
  "subject": "Mathematics",
  "startTime": "2025-01-20T10:00:00Z",
  "endTime": "2025-01-20T11:00:00Z"
}
```

**Expected Result:**
- Status code: 404 or 400
- Error message indicating tutor not found

**Status:** Not Tested

---

## TC-SESSION-004: Create Session with Time Conflict
**Feature:** Session Management - Conflict Detection
**Priority:** High
**Preconditions:**
- Tutor has existing session at same time
- Student is logged in

**Test Steps:**
1. Send POST request to create session
2. Use time slot that conflicts with existing session
3. Verify response

**Test Data:**
```json
{
  "tutorId": "tut_abc123",
  "startTime": "2025-01-20T10:00:00Z",
  "endTime": "2025-01-20T11:00:00Z"
}
```

**Expected Result:**
- Status code: 400 or 409
- Error message indicating time conflict
- Session not created

**Status:** Not Tested

---

## TC-SESSION-005: Get Session by ID
**Feature:** Session Management - Get Session
**Priority:** High
**Preconditions:**
- Session exists
- User is logged in

**Test Steps:**
1. Send GET request to `/api/sessions/{sessionId}`
2. Verify response

**Test Data:**
- URL: `/api/sessions/ses_abc123`

**Expected Result:**
- Status code: 200
- Response contains full session details
- User can only access their own sessions (unless management)

**Status:** Not Tested

---

## TC-SESSION-006: Get Session as Unauthorized User
**Feature:** Session Management - Authorization
**Priority:** High
**Preconditions:**
- Session exists
- User A is logged in
- Session belongs to User B

**Test Steps:**
1. User A tries to access User B's session
2. Send GET request to `/api/sessions/{sessionId}`
3. Verify response

**Test Data:**
- URL: `/api/sessions/{userB_sessionId}`
- Headers: `Authorization: Bearer <userA_token>`

**Expected Result:**
- Status code: 403 or 404
- Error message indicating access denied

**Status:** Not Tested

---

## TC-SESSION-007: Update Session
**Feature:** Session Management - Update Session
**Priority:** High
**Preconditions:**
- Session exists
- Tutor is logged in (or session owner)

**Test Steps:**
1. Send PUT/PATCH request to `/api/sessions/{sessionId}`
2. Include updated session data
3. Verify response

**Test Data:**
```json
{
  "topic": "Updated Topic",
  "description": "Updated description",
  "notes": "Additional notes"
}
```

**Expected Result:**
- Status code: 200
- Session updated
- updatedAt timestamp changed
- Notification sent to students (if applicable)

**Status:** Not Tested

---

## TC-SESSION-008: Cancel Session
**Feature:** Session Management - Cancel Session
**Priority:** High
**Preconditions:**
- Session exists with status "confirmed" or "pending"
- User is logged in (tutor or student)

**Test Steps:**
1. Send POST request to `/api/sessions/{sessionId}/cancel`
2. Include cancel reason
3. Verify response

**Test Data:**
```json
{
  "reason": "Tutor unavailable"
}
```

**Expected Result:**
- Status code: 200
- Session status changed to "cancelled"
- cancelledBy field set
- cancelReason saved
- Notification sent to affected users

**Status:** Not Tested

---

## TC-SESSION-009: Reschedule Session
**Feature:** Session Management - Reschedule Session
**Priority:** High
**Preconditions:**
- Session exists
- User is logged in

**Test Steps:**
1. Send POST request to `/api/sessions/{sessionId}/reschedule`
2. Include new time
3. Verify response

**Test Data:**
```json
{
  "newStartTime": "2025-01-21T10:00:00Z",
  "newEndTime": "2025-01-21T11:00:00Z",
  "reason": "Schedule conflict"
}
```

**Expected Result:**
- Status code: 200
- Session time updated
- rescheduledFrom field set
- Status may change to "rescheduled"
- Notification sent to affected users

**Status:** Not Tested

---

## TC-SESSION-010: Create Group Session
**Feature:** Session Management - Group Sessions
**Priority:** High
**Preconditions:**
- Tutor exists
- Multiple students exist

**Test Steps:**
1. Send POST request to create session
2. Include multiple studentIds
3. Verify response

**Test Data:**
```json
{
  "tutorId": "tut_abc123",
  "studentIds": ["stu_123", "stu_456", "stu_789"],
  "subject": "Mathematics",
  "startTime": "2025-01-20T10:00:00Z",
  "endTime": "2025-01-20T11:00:00Z"
}
```

**Expected Result:**
- Status code: 201
- Session created with multiple students
- All students notified
- Session appears in all students' lists

**Status:** Not Tested

---

## TC-SESSION-011: Filter Sessions by Status
**Feature:** Session Management - Filtering
**Priority:** Medium
**Preconditions:**
- Multiple sessions with different statuses exist

**Test Steps:**
1. Send GET request with status filter
2. Verify response

**Test Data:**
- Query: `?status=confirmed`

**Expected Result:**
- Status code: 200
- Only sessions with "confirmed" status returned
- Other statuses filtered out

**Status:** Not Tested

---

## TC-SESSION-012: Filter Sessions by Date Range
**Feature:** Session Management - Date Filtering
**Priority:** Medium
**Preconditions:**
- Sessions exist across different dates

**Test Steps:**
1. Send GET request with date range
2. Verify response

**Test Data:**
- Query: `?startDate=2025-01-01&endDate=2025-01-31`

**Expected Result:**
- Status code: 200
- Only sessions within date range returned
- Sessions outside range filtered out

**Status:** Not Tested

---

## TC-SESSION-013: Create Session Request (Cancel Request)
**Feature:** Session Management - Session Requests
**Priority:** High
**Preconditions:**
- Session exists
- Student is logged in

**Test Steps:**
1. Send POST request to `/api/session-requests`
2. Create cancel request
3. Verify response

**Test Data:**
```json
{
  "sessionId": "ses_abc123",
  "type": "cancel",
  "reason": "Unexpected emergency"
}
```

**Expected Result:**
- Status code: 201
- Request created with status "pending"
- Notification sent to tutor
- Request appears in tutor's approval list

**Status:** Not Tested

---

## TC-SESSION-014: Create Session Request (Reschedule Request)
**Feature:** Session Management - Reschedule Request
**Priority:** High
**Preconditions:**
- Session exists
- Student is logged in

**Test Steps:**
1. Send POST request to create reschedule request
2. Include new time
3. Verify response

**Test Data:**
```json
{
  "sessionId": "ses_abc123",
  "type": "reschedule",
  "newStartTime": "2025-01-21T10:00:00Z",
  "newEndTime": "2025-01-21T11:00:00Z",
  "reason": "Schedule conflict"
}
```

**Expected Result:**
- Status code: 201
- Reschedule request created
- Notification sent to tutor
- Alternative sessions suggested (if applicable)

**Status:** Not Tested

---

## TC-SESSION-015: Approve Session Request
**Feature:** Session Management - Approve Request
**Priority:** High
**Preconditions:**
- Session request exists with status "pending"
- Tutor is logged in

**Test Steps:**
1. Send POST request to `/api/session-requests/{requestId}/approve`
2. Verify response

**Test Data:**
- URL: `/api/session-requests/req_abc123/approve`

**Expected Result:**
- Status code: 200
- Request status changed to "approved"
- Session updated accordingly (cancelled or rescheduled)
- Notification sent to student

**Status:** Not Tested

---

## TC-SESSION-016: Reject Session Request
**Feature:** Session Management - Reject Request
**Priority:** High
**Preconditions:**
- Session request exists
- Tutor is logged in

**Test Steps:**
1. Send POST request to `/api/session-requests/{requestId}/reject`
2. Include rejection reason
3. Verify response

**Test Data:**
```json
{
  "reason": "Time slot not available"
}
```

**Expected Result:**
- Status code: 200
- Request status changed to "rejected"
- Session remains unchanged
- Notification sent to student

**Status:** Not Tested

---

## TC-SESSION-017: Get Course Contents
**Feature:** Session Management - Course Contents
**Priority:** Medium
**Preconditions:**
- Session exists
- User is logged in

**Test Steps:**
1. Send GET request to `/api/sessions/{sessionId}/course-contents`
2. Verify response

**Test Data:**
- URL: `/api/sessions/ses_abc123/course-contents`

**Expected Result:**
- Status code: 200
- Response contains array of course contents
- Each content includes: title, description, materials, order

**Status:** Not Tested

---

## TC-SESSION-018: Create Course Content
**Feature:** Session Management - Create Course Content
**Priority:** Medium
**Preconditions:**
- Session exists
- Tutor is logged in

**Test Steps:**
1. Send POST request to `/api/sessions/{sessionId}/course-contents`
2. Include content data
3. Verify response

**Test Data:**
```json
{
  "title": "Introduction to Calculus",
  "description": "Basic concepts",
  "materials": ["https://example.com/material1.pdf"],
  "order": 1
}
```

**Expected Result:**
- Status code: 201
- Course content created
- Content appears in session materials

**Status:** Not Tested

---

## TC-SESSION-019: Get Quizzes
**Feature:** Session Management - Quizzes
**Priority:** Medium
**Preconditions:**
- Session exists
- Quizzes exist for session

**Test Steps:**
1. Send GET request to `/api/sessions/{sessionId}/quizzes`
2. Verify response

**Test Data:**
- URL: `/api/sessions/ses_abc123/quizzes`

**Expected Result:**
- Status code: 200
- Response contains array of quizzes
- Each quiz includes: questions, timeLimit, totalPoints

**Status:** Not Tested

---

## TC-SESSION-020: Submit Quiz
**Feature:** Session Management - Quiz Submission
**Priority:** High
**Preconditions:**
- Quiz exists
- Student is logged in

**Test Steps:**
1. Send POST request to `/api/sessions/{sessionId}/quizzes/{quizId}/submit`
2. Include answers
3. Verify response

**Test Data:**
```json
{
  "answers": [
    {"questionId": "q1", "answer": "A"},
    {"questionId": "q2", "answer": "B"}
  ]
}
```

**Expected Result:**
- Status code: 200
- Quiz submission created
- Score calculated
- Submission appears in tutor's view

**Status:** Not Tested

---

## TC-SESSION-021: Get Assignments
**Feature:** Session Management - Assignments
**Priority:** Medium
**Preconditions:**
- Session exists
- Assignments exist

**Test Steps:**
1. Send GET request to `/api/sessions/{sessionId}/assignments`
2. Verify response

**Test Data:**
- URL: `/api/sessions/ses_abc123/assignments`

**Expected Result:**
- Status code: 200
- Response contains array of assignments
- Each assignment includes: title, description, dueDate, points

**Status:** Not Tested

---

## TC-SESSION-022: Submit Assignment
**Feature:** Session Management - Assignment Submission
**Priority:** High
**Preconditions:**
- Assignment exists
- Student is logged in

**Test Steps:**
1. Send POST request to `/api/sessions/{sessionId}/assignments/{assignmentId}/submit`
2. Include submission data
3. Verify response

**Test Data:**
```json
{
  "fileUrl": "https://example.com/submission.pdf",
  "notes": "My assignment submission"
}
```

**Expected Result:**
- Status code: 200
- Assignment submission created
- Submission appears in tutor's grading view

**Status:** Not Tested

---

## TC-SESSION-023: Get Grades
**Feature:** Session Management - Grades
**Priority:** Medium
**Preconditions:**
- Session exists
- Grades exist

**Test Steps:**
1. Send GET request to `/api/sessions/{sessionId}/grades`
2. Verify response

**Test Data:**
- URL: `/api/sessions/ses_abc123/grades`

**Expected Result:**
- Status code: 200
- Response contains grades for quizzes and assignments
- Students can see their own grades
- Tutors can see all grades

**Status:** Not Tested

---

## TC-SESSION-024: Add Student to Session
**Feature:** Session Management - Add Student
**Priority:** Medium
**Preconditions:**
- Session exists
- Tutor is logged in
- Student exists

**Test Steps:**
1. Send POST request to `/api/sessions/{sessionId}/students`
2. Include studentId
3. Verify response

**Test Data:**
```json
{
  "studentId": "stu_abc123"
}
```

**Expected Result:**
- Status code: 200
- Student added to session
- Student notified
- Session studentIds updated

**Status:** Not Tested

---

## TC-SESSION-025: Remove Student from Session
**Feature:** Session Management - Remove Student
**Priority:** Medium
**Preconditions:**
- Session exists with multiple students
- Tutor is logged in

**Test Steps:**
1. Send DELETE request to `/api/sessions/{sessionId}/students/{studentId}`
2. Verify response

**Test Data:**
- URL: `/api/sessions/ses_abc123/students/stu_abc123`

**Expected Result:**
- Status code: 200
- Student removed from session
- Student notified
- Session studentIds updated

**Status:** Not Tested

