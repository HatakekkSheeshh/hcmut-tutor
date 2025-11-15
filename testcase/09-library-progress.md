# Library & Progress Test Cases

## TC-LIB-001: List Library Resources
**Feature:** Library - List Resources
**Priority:** High
**Preconditions:**
- User is logged in
- Library resources exist

**Test Steps:**
1. Send GET request to `/api/library`
2. Include query parameters
3. Verify response

**Test Data:**
- Query: `?type=book&subject=Mathematics&page=1&limit=10`

**Expected Result:**
- Status code: 200
- Response contains array of resources
- Resources filtered by criteria
- Pagination metadata included

**Status:** Not Tested

---

## TC-LIB-002: Get Library Resource by ID
**Feature:** Library - Get Resource
**Priority:** High
**Preconditions:**
- Resource exists

**Test Steps:**
1. Send GET request to `/api/library/{resourceId}`
2. Verify response

**Test Data:**
- URL: `/api/library/lib_abc123`

**Expected Result:**
- Status code: 200
- Response contains full resource details
- Includes: title, type, subject, description, url, fileUrl, tags

**Status:** Not Tested

---

## TC-LIB-003: Search Library Resources
**Feature:** Library - Search
**Priority:** High
**Preconditions:**
- Resources exist

**Test Steps:**
1. Send GET request to `/api/library/search`
2. Include search query
3. Verify response

**Test Data:**
- Query: `?q=calculus&type=book`

**Expected Result:**
- Status code: 200
- Resources matching search query returned
- Search matches title, description, tags

**Status:** Not Tested

---

## TC-LIB-004: Filter Resources by Type
**Feature:** Library - Filtering
**Priority:** Medium
**Preconditions:**
- Resources of different types exist

**Test Steps:**
1. Send GET request with type filter
2. Verify response

**Test Data:**
- Query: `?type=video`

**Expected Result:**
- Status code: 200
- Only resources of specified type returned
- Other types filtered out

**Status:** Not Tested

---

## TC-LIB-005: Filter Resources by Subject
**Feature:** Library - Subject Filter
**Priority:** Medium
**Preconditions:**
- Resources for different subjects exist

**Test Steps:**
1. Send GET request with subject filter
2. Verify response

**Test Data:**
- Query: `?subject=Mathematics`

**Expected Result:**
- Status code: 200
- Only resources for specified subject returned

**Status:** Not Tested

---

## TC-LIB-006: Resource View Tracking
**Feature:** Library - View Tracking
**Priority:** Low
**Preconditions:**
- Resource exists

**Test Steps:**
1. User views resource
2. Verify view count incremented

**Test Data:**
- Resource view action

**Expected Result:**
- views field incremented
- View tracked for analytics

**Status:** Not Tested

---

## TC-LIB-007: Resource Download Tracking
**Feature:** Library - Download Tracking
**Priority:** Low
**Preconditions:**
- Resource exists with file

**Test Steps:**
1. User downloads resource
2. Verify download count incremented

**Test Data:**
- Resource download action

**Expected Result:**
- downloads field incremented
- Download tracked

**Status:** Not Tested

---

## TC-PROG-001: List Progress Entries
**Feature:** Progress - List Progress
**Priority:** High
**Preconditions:**
- User is logged in
- Progress entries exist

**Test Steps:**
1. Send GET request to `/api/progress`
2. Include filters
3. Verify response

**Test Data:**
- Query: `?studentId=stu_123&subject=Mathematics`

**Expected Result:**
- Status code: 200
- Response contains array of progress entries
- Entries filtered by criteria
- User can only see their own progress (unless tutor/management)

**Status:** Not Tested

---

## TC-PROG-002: Create Progress Entry
**Feature:** Progress - Create Entry
**Priority:** High
**Preconditions:**
- Tutor is logged in
- Student exists

**Test Steps:**
1. Send POST request to `/api/progress`
2. Include progress data
3. Verify response

**Test Data:**
```json
{
  "studentId": "stu_abc123",
  "sessionId": "ses_xyz789",
  "subject": "Mathematics",
  "topic": "Calculus",
  "notes": "Student showed good understanding",
  "score": 85,
  "improvements": ["Practice more problems"],
  "challenges": ["Time management"],
  "nextSteps": ["Review derivatives"]
}
```

**Expected Result:**
- Status code: 201
- Progress entry created
- Entry ID generated
- Student can view their progress

**Status:** Not Tested

---

## TC-PROG-003: Get Progress Entry by ID
**Feature:** Progress - Get Entry
**Priority:** Medium
**Preconditions:**
- Progress entry exists
- User is logged in

**Test Steps:**
1. Send GET request to `/api/progress/{progressId}`
2. Verify response

**Test Data:**
- URL: `/api/progress/prog_abc123`

**Expected Result:**
- Status code: 200
- Response contains full progress entry details
- User can only access their own progress (unless tutor/management)

**Status:** Not Tested

---

## TC-PROG-004: Get Progress Statistics
**Feature:** Progress - Statistics
**Priority:** High
**Preconditions:**
- Student exists
- Progress entries exist

**Test Steps:**
1. Send GET request to `/api/progress/stats/{studentId}`
2. Verify response

**Test Data:**
- URL: `/api/progress/stats/stu_abc123`

**Expected Result:**
- Status code: 200
- Response contains progress statistics
- Includes: totalSessions, totalHours, subjectStats, favoriteSubjects

**Status:** Not Tested

---

## TC-PROG-005: Progress Authorization
**Feature:** Progress - Authorization
**Priority:** High
**Preconditions:**
- Progress entry exists
- User A is logged in
- Progress belongs to User B

**Test Steps:**
1. User A tries to access User B's progress
2. Verify response

**Test Data:**
- URL: `/api/progress/{userB_progressId}`
- Headers: `Authorization: Bearer <userA_token>`

**Expected Result:**
- Status code: 403 or 404
- Error message indicating access denied
- Or access allowed if User A is tutor/management

**Status:** Not Tested

---

## TC-PROG-006: Filter Progress by Subject
**Feature:** Progress - Filtering
**Priority:** Medium
**Preconditions:**
- Progress entries for different subjects exist

**Test Steps:**
1. Send GET request with subject filter
2. Verify response

**Test Data:**
- Query: `?subject=Mathematics`

**Expected Result:**
- Status code: 200
- Only progress entries for specified subject returned

**Status:** Not Tested

---

## TC-PROG-007: Filter Progress by Date Range
**Feature:** Progress - Date Filtering
**Priority:** Medium
**Preconditions:**
- Progress entries across different dates exist

**Test Steps:**
1. Send GET request with date range
2. Verify response

**Test Data:**
- Query: `?startDate=2025-01-01&endDate=2025-01-31`

**Expected Result:**
- Status code: 200
- Only progress entries within date range returned

**Status:** Not Tested

---

## TC-EVAL-001: List Evaluations
**Feature:** Evaluations - List Evaluations
**Priority:** High
**Preconditions:**
- User is logged in
- Evaluations exist

**Test Steps:**
1. Send GET request to `/api/evaluations`
2. Include filters
3. Verify response

**Test Data:**
- Query: `?sessionId=ses_123&studentId=stu_123`

**Expected Result:**
- Status code: 200
- Response contains array of evaluations
- Evaluations filtered by criteria

**Status:** Not Tested

---

## TC-EVAL-002: Create Evaluation
**Feature:** Evaluations - Create Evaluation
**Priority:** High
**Preconditions:**
- Session exists and is completed
- Student is logged in

**Test Steps:**
1. Send POST request to `/api/evaluations`
2. Include evaluation data
3. Verify response

**Test Data:**
```json
{
  "sessionId": "ses_abc123",
  "tutorId": "tut_xyz789",
  "rating": 5,
  "comment": "Excellent tutor, very helpful",
  "aspects": {
    "communication": 5,
    "knowledge": 5,
    "helpfulness": 5,
    "punctuality": 4
  },
  "improvements": ["Could provide more examples"],
  "recommend": true
}
```

**Expected Result:**
- Status code: 201
- Evaluation created
- Tutor rating updated
- Tutor notified

**Status:** Not Tested

---

## TC-EVAL-003: Get Evaluation by ID
**Feature:** Evaluations - Get Evaluation
**Priority:** Medium
**Preconditions:**
- Evaluation exists
- User is logged in

**Test Steps:**
1. Send GET request to `/api/evaluations/{evaluationId}`
2. Verify response

**Test Data:**
- URL: `/api/evaluations/eval_abc123`

**Expected Result:**
- Status code: 200
- Response contains full evaluation details
- User can only access their own evaluations (unless tutor/management)

**Status:** Not Tested

---

## TC-EVAL-004: Update Evaluation
**Feature:** Evaluations - Update Evaluation
**Priority:** Medium
**Preconditions:**
- Evaluation exists
- Student is logged in and is author

**Test Steps:**
1. Send PUT request to `/api/evaluations/{evaluationId}`
2. Include updated data
3. Verify response

**Test Data:**
```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

**Expected Result:**
- Status code: 200
- Evaluation updated
- Tutor rating recalculated

**Status:** Not Tested

---

## TC-EVAL-005: Delete Evaluation
**Feature:** Evaluations - Delete Evaluation
**Priority:** Low
**Preconditions:**
- Evaluation exists
- Student is logged in and is author

**Test Steps:**
1. Send DELETE request to `/api/evaluations/{evaluationId}`
2. Verify response

**Test Data:**
- URL: `/api/evaluations/eval_abc123`

**Expected Result:**
- Status code: 200 or 204
- Evaluation deleted
- Tutor rating recalculated

**Status:** Not Tested

---

## TC-EVAL-006: Evaluation Validation
**Feature:** Evaluations - Validation
**Priority:** Medium
**Preconditions:**
- Session exists

**Test Steps:**
1. Send POST request with invalid data
2. Verify validation errors

**Test Data:**
```json
{
  "rating": 10,
  "sessionId": "invalid_session"
}
```

**Expected Result:**
- Status code: 400
- Validation error messages
- Evaluation not created

**Status:** Not Tested

---

## TC-EVAL-007: Duplicate Evaluation Prevention
**Feature:** Evaluations - Duplicate Prevention
**Priority:** High
**Preconditions:**
- Evaluation already exists for session
- Student is logged in

**Test Steps:**
1. Attempt to create duplicate evaluation
2. Verify response

**Test Data:**
```json
{
  "sessionId": "ses_already_evaluated"
}
```

**Expected Result:**
- Status code: 400 or 409
- Error message indicating already evaluated
- Evaluation not created

**Status:** Not Tested

