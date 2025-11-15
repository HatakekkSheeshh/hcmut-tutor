# Management Features Test Cases

## TC-MGMT-001: List Approval Requests
**Feature:** Management - Approval Requests
**Priority:** High
**Preconditions:**
- Management user is logged in
- Approval requests exist

**Test Steps:**
1. Send GET request to `/api/management/approvals`
2. Include filters
3. Verify response

**Test Data:**
- Query: `?status=pending&type=resource_allocation`

**Expected Result:**
- Status code: 200
- Response contains array of approval requests
- Requests filtered by criteria
- Only management can access

**Status:** Not Tested

---

## TC-MGMT-002: Create Approval Request
**Feature:** Management - Create Approval Request
**Priority:** High
**Preconditions:**
- User is logged in (tutor/student)

**Test Steps:**
1. Send POST request to `/api/management/approvals`
2. Include request data
3. Verify response

**Test Data:**
```json
{
  "type": "resource_allocation",
  "title": "Request room allocation",
  "description": "Need room for offline session",
  "metadata": {
    "sessionId": "ses_abc123",
    "roomId": "room_xyz"
  }
}
```

**Expected Result:**
- Status code: 201
- Approval request created
- Status set to "pending"
- Notification sent to management

**Status:** Not Tested

---

## TC-MGMT-003: Approve Approval Request
**Feature:** Management - Approve Request
**Priority:** High
**Preconditions:**
- Approval request exists with status "pending"
- Management user is logged in

**Test Steps:**
1. Send POST request to `/api/management/approvals/{requestId}/approve`
2. Include approval notes
3. Verify response

**Test Data:**
```json
{
  "notes": "Approved. Room allocated."
}
```

**Expected Result:**
- Status code: 200
- Request status changed to "approved"
- Related resources allocated
- Requester notified

**Status:** Not Tested

---

## TC-MGMT-004: Reject Approval Request
**Feature:** Management - Reject Request
**Priority:** High
**Preconditions:**
- Approval request exists
- Management user is logged in

**Test Steps:**
1. Send POST request to `/api/management/approvals/{requestId}/reject`
2. Include rejection reason
3. Verify response

**Test Data:**
```json
{
  "reason": "Room not available at requested time"
}
```

**Expected Result:**
- Status code: 200
- Request status changed to "rejected"
- Rejection reason saved
- Requester notified

**Status:** Not Tested

---

## TC-MGMT-005: Request Clarification
**Feature:** Management - Request Clarification
**Priority:** Medium
**Preconditions:**
- Approval request exists
- Management user is logged in

**Test Steps:**
1. Send POST request to request clarification
2. Include clarification questions
3. Verify response

**Test Data:**
```json
{
  "questions": "Please provide more details about room requirements"
}
```

**Expected Result:**
- Status code: 200
- Clarification requested
- Requester notified
- Request status may change

**Status:** Not Tested

---

## TC-MGMT-006: List Users with Permissions
**Feature:** Management - Permissions
**Priority:** High
**Preconditions:**
- Management user is logged in

**Test Steps:**
1. Send GET request to `/api/management/permissions`
2. Verify response

**Test Data:**
- Headers: `Authorization: Bearer <management_token>`

**Expected Result:**
- Status code: 200
- Response contains users with permissions
- Each user includes permission details

**Status:** Not Tested

---

## TC-MGMT-007: Get User Permissions
**Feature:** Management - Get User Permissions
**Priority:** High
**Preconditions:**
- Management user is logged in
- User exists

**Test Steps:**
1. Send GET request to `/api/management/permissions/{userId}`
2. Verify response

**Test Data:**
- URL: `/api/management/permissions/stu_abc123`

**Expected Result:**
- Status code: 200
- Response contains user's permissions
- Includes permission types and scopes

**Status:** Not Tested

---

## TC-MGMT-008: Update User Permissions
**Feature:** Management - Update Permissions
**Priority:** High
**Preconditions:**
- Management user is logged in
- User exists

**Test Steps:**
1. Send PUT request to `/api/management/permissions/{userId}`
2. Include updated permissions
3. Verify response

**Test Data:**
```json
{
  "permissions": ["read_reports", "manage_users"]
}
```

**Expected Result:**
- Status code: 200
- User permissions updated
- User notified of permission changes

**Status:** Not Tested

---

## TC-MGMT-009: Revoke User Permissions
**Feature:** Management - Revoke Permissions
**Priority:** High
**Preconditions:**
- Management user is logged in
- User has permissions

**Test Steps:**
1. Send DELETE request to revoke permissions
2. Verify response

**Test Data:**
```json
{
  "permissions": ["read_reports"]
}
```

**Expected Result:**
- Status code: 200
- Permissions revoked
- User notified

**Status:** Not Tested

---

## TC-MGMT-010: Get Resource Overview
**Feature:** Management - Resource Management
**Priority:** High
**Preconditions:**
- Management user is logged in

**Test Steps:**
1. Send GET request to `/api/management/resources/overview`
2. Verify response

**Test Data:**
- Headers: `Authorization: Bearer <management_token>`

**Expected Result:**
- Status code: 200
- Response contains resource allocation overview
- Includes room usage, equipment usage, etc.

**Status:** Not Tested

---

## TC-MGMT-011: Optimize Resource Allocation
**Feature:** Management - Resource Optimization
**Priority:** Medium
**Preconditions:**
- Management user is logged in
- Resources exist

**Test Steps:**
1. Send POST request to optimize resources
2. Verify response

**Test Data:**
```json
{
  "optimizationType": "room_allocation",
  "dateRange": {
    "start": "2025-01-15",
    "end": "2025-01-31"
  }
}
```

**Expected Result:**
- Status code: 200
- Optimization plan generated
- Suggestions provided
- Can be applied or overridden

**Status:** Not Tested

---

## TC-MGMT-012: Apply Optimization
**Feature:** Management - Apply Optimization
**Priority:** Medium
**Preconditions:**
- Optimization plan exists
- Management user is logged in

**Test Steps:**
1. Send POST request to apply optimization
2. Verify response

**Test Data:**
```json
{
  "optimizationId": "opt_abc123",
  "changes": [...]
}
```

**Expected Result:**
- Status code: 200
- Optimization applied
- Resources reallocated
- Affected users notified

**Status:** Not Tested

---

## TC-MGMT-013: List Progress Reports
**Feature:** Management - Reports
**Priority:** High
**Preconditions:**
- Management user is logged in
- Reports exist

**Test Steps:**
1. Send GET request to `/api/management/reports/progress`
2. Verify response

**Test Data:**
- Query: `?studentId=stu_123&dateRange=2025-01`

**Expected Result:**
- Status code: 200
- Response contains progress reports
- Reports filtered by criteria

**Status:** Not Tested

---

## TC-MGMT-014: Create Progress Report
**Feature:** Management - Create Report
**Priority:** High
**Preconditions:**
- Management user is logged in

**Test Steps:**
1. Send POST request to `/api/management/reports/progress`
2. Include report data
3. Verify response

**Test Data:**
```json
{
  "studentId": "stu_abc123",
  "period": "2025-01",
  "summary": "Good progress in Mathematics",
  "recommendations": ["Continue practice", "Focus on calculus"]
}
```

**Expected Result:**
- Status code: 201
- Progress report created
- Report ID generated
- Student notified (if applicable)

**Status:** Not Tested

---

## TC-MGMT-015: Get Performance Analysis
**Feature:** Management - Analytics
**Priority:** High
**Preconditions:**
- Management user is logged in

**Test Steps:**
1. Send GET request to `/api/management/analytics/performance`
2. Include filters
3. Verify response

**Test Data:**
- Query: `?tutorId=tut_123&dateRange=2025-01`

**Expected Result:**
- Status code: 200
- Response contains performance analysis
- Includes KPIs, trends, comparisons

**Status:** Not Tested

---

## TC-MGMT-016: Generate Performance Analysis
**Feature:** Management - Generate Analysis
**Priority:** Medium
**Preconditions:**
- Management user is logged in

**Test Steps:**
1. Send POST request to generate analysis
2. Include parameters
3. Verify response

**Test Data:**
```json
{
  "type": "tutor_performance",
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "metrics": ["rating", "sessions_completed", "student_satisfaction"]
}
```

**Expected Result:**
- Status code: 200
- Analysis generated
- Report available for download/view

**Status:** Not Tested

---

## TC-MGMT-017: Award Training Credits
**Feature:** Management - Training Credits
**Priority:** High
**Preconditions:**
- Management user is logged in
- Student exists

**Test Steps:**
1. Send POST request to `/api/management/credits/award`
2. Include credit data
3. Verify response

**Test Data:**
```json
{
  "studentId": "stu_abc123",
  "amount": 10,
  "reason": "Excellent performance in Mathematics"
}
```

**Expected Result:**
- Status code: 200
- Credits awarded
- Student's trainingCredits incremented
- Student notified

**Status:** Not Tested

---

## TC-MGMT-018: Get Eligible Students for Credits
**Feature:** Management - Credit Eligibility
**Priority:** Medium
**Preconditions:**
- Management user is logged in

**Test Steps:**
1. Send GET request to `/api/management/credits/eligible`
2. Include criteria
3. Verify response

**Test Data:**
- Query: `?minSessions=10&minRating=4.5`

**Expected Result:**
- Status code: 200
- Response contains eligible students
- Students meet specified criteria

**Status:** Not Tested

---

## TC-MGMT-019: Upload Document
**Feature:** Management - Document Management
**Priority:** High
**Preconditions:**
- Management user is logged in

**Test Steps:**
1. Send POST request to upload document
2. Include document data
3. Verify response

**Test Data:**
```json
{
  "title": "Course Syllabus",
  "type": "document",
  "fileUrl": "https://example.com/syllabus.pdf",
  "subject": "Mathematics",
  "tags": ["syllabus", "course"]
}
```

**Expected Result:**
- Status code: 201
- Document uploaded
- Document ID generated
- Document accessible in library

**Status:** Not Tested

---

## TC-MGMT-020: Share Document
**Feature:** Management - Document Sharing
**Priority:** Medium
**Preconditions:**
- Document exists
- Management user is logged in

**Test Steps:**
1. Send POST request to share document
2. Include sharing settings
3. Verify response

**Test Data:**
```json
{
  "documentId": "doc_abc123",
  "sharedWith": ["stu_123", "stu_456"],
  "permissions": ["read", "download"]
}
```

**Expected Result:**
- Status code: 200
- Document shared
- Users notified
- Access permissions set

**Status:** Not Tested

---

## TC-MGMT-021: Management Authorization
**Feature:** Management - Authorization
**Priority:** High
**Preconditions:**
- Non-management user is logged in

**Test Steps:**
1. Non-management user tries to access management endpoint
2. Verify response

**Test Data:**
- URL: `/api/management/approvals`
- Headers: `Authorization: Bearer <student_token>`

**Expected Result:**
- Status code: 403
- Error message indicating insufficient permissions
- Access denied

**Status:** Not Tested

