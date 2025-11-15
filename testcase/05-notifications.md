# Notification Test Cases

## TC-NOTIF-001: Get Notifications
**Feature:** Notifications - List Notifications
**Priority:** High
**Preconditions:**
- User is logged in
- Notifications exist for user

**Test Steps:**
1. Send GET request to `/api/notifications`
2. Include query parameters
3. Verify response

**Test Data:**
- Query: `?read=false&type=session_booking&page=1&limit=10`

**Expected Result:**
- Status code: 200
- Response contains array of notifications
- Notifications filtered by criteria
- Only user's own notifications returned
- Pagination metadata included

**Status:** Not Tested

---

## TC-NOTIF-002: Mark Notification as Read
**Feature:** Notifications - Mark as Read
**Priority:** High
**Preconditions:**
- Notification exists
- User is logged in
- Notification belongs to user

**Test Steps:**
1. Send PATCH request to `/api/notifications/{notificationId}`
2. Include read status
3. Verify response

**Test Data:**
```json
{
  "read": true
}
```

**Expected Result:**
- Status code: 200
- Notification marked as read
- read field updated to true

**Status:** Not Tested

---

## TC-NOTIF-003: Delete Notification
**Feature:** Notifications - Delete Notification
**Priority:** Medium
**Preconditions:**
- Notification exists
- User is logged in

**Test Steps:**
1. Send DELETE request to `/api/notifications/{notificationId}`
2. Verify response

**Test Data:**
- URL: `/api/notifications/notif_abc123`

**Expected Result:**
- Status code: 200 or 204
- Notification deleted
- Notification no longer appears in list

**Status:** Not Tested

---

## TC-NOTIF-004: Notification Creation (Session Booking)
**Feature:** Notifications - Auto Creation
**Priority:** High
**Preconditions:**
- Session booking occurs

**Test Steps:**
1. Create a new session
2. Verify notification is queued/created
3. Check notification queue

**Test Data:**
- Session booking via POST `/api/sessions`

**Expected Result:**
- Notification job added to queue
- Notification type: "session_booking"
- Notification sent to tutor
- Notification processed by cron job

**Status:** Not Tested

---

## TC-NOTIF-005: Notification Queue Processing
**Feature:** Notifications - Cron Job Processing
**Priority:** High
**Preconditions:**
- Notification jobs exist in queue
- Cron job is running

**Test Steps:**
1. Add notification job to queue with future processAt time
2. Wait for cron job to run
3. Verify notification is created

**Test Data:**
- Queue entry in `notification_queue.json`:
```json
{
  "id": "job_123",
  "processAt": "2025-01-15T10:00:00Z",
  "data": {
    "userId": "stu_abc123",
    "type": "session_reminder",
    "title": "Upcoming session",
    "message": "Your session starts in 1 hour"
  }
}
```

**Expected Result:**
- Cron job processes queue
- Notification created when processAt time reached
- Job removed from queue after processing
- Notification appears in user's notification list

**Status:** Not Tested

---

## TC-NOTIF-006: Notification Types
**Feature:** Notifications - Different Types
**Priority:** Medium
**Preconditions:**
- Various system events occur

**Test Steps:**
1. Trigger different system events
2. Verify correct notification types created

**Test Data:**
- Session booking → "session_booking"
- Session cancellation → "session_cancelled"
- New message → "new_message"
- Approval request → "approval_request"
- System update → "system"

**Expected Result:**
- Each event creates appropriate notification type
- Notification title and message match type
- Correct users receive notifications

**Status:** Not Tested

---

## TC-NOTIF-007: Filter Notifications by Type
**Feature:** Notifications - Filtering
**Priority:** Medium
**Preconditions:**
- User has notifications of different types

**Test Steps:**
1. Send GET request with type filter
2. Verify response

**Test Data:**
- Query: `?type=session_booking`

**Expected Result:**
- Status code: 200
- Only notifications of specified type returned
- Other types filtered out

**Status:** Not Tested

---

## TC-NOTIF-008: Filter Unread Notifications
**Feature:** Notifications - Unread Filter
**Priority:** High
**Preconditions:**
- User has mix of read and unread notifications

**Test Steps:**
1. Send GET request with read=false filter
2. Verify response

**Test Data:**
- Query: `?read=false`

**Expected Result:**
- Status code: 200
- Only unread notifications returned
- Read notifications filtered out

**Status:** Not Tested

---

## TC-NOTIF-009: Notification Pagination
**Feature:** Notifications - Pagination
**Priority:** Medium
**Preconditions:**
- User has many notifications (>10)

**Test Steps:**
1. Send GET request with pagination
2. Verify pagination works correctly

**Test Data:**
- Query: `?page=1&limit=10`
- Query: `?page=2&limit=10`

**Expected Result:**
- Status code: 200
- Correct page of results returned
- Pagination metadata includes total count
- Next/previous page links work

**Status:** Not Tested

---

## TC-NOTIF-010: Notification Authorization
**Feature:** Notifications - Authorization
**Priority:** High
**Preconditions:**
- User A is logged in
- Notification belongs to User B

**Test Steps:**
1. User A tries to access User B's notification
2. Verify response

**Test Data:**
- URL: `/api/notifications/{userB_notificationId}`
- Headers: `Authorization: Bearer <userA_token>`

**Expected Result:**
- Status code: 403 or 404
- Error message indicating access denied
- User A cannot access User B's notifications

**Status:** Not Tested

---

## TC-NOTIF-011: Batch Notification Creation
**Feature:** Notifications - Batch Notifications
**Priority:** Medium
**Preconditions:**
- Multiple users exist

**Test Steps:**
1. Create notification for multiple users
2. Verify all users receive notification

**Test Data:**
- System notification to all students

**Expected Result:**
- Notifications created for all target users
- Each user receives their own notification
- All notifications queued/created successfully

**Status:** Not Tested

---

## TC-NOTIF-012: Notification with Metadata
**Feature:** Notifications - Metadata
**Priority:** Low
**Preconditions:**
- Notification created with metadata

**Test Steps:**
1. Create notification with metadata
2. Verify metadata is stored

**Test Data:**
```json
{
  "userId": "stu_abc123",
  "type": "approval_request",
  "title": "Approval Request",
  "message": "Your request needs approval",
  "metadata": {
    "approvalRequestId": "appr_123",
    "type": "resource_allocation"
  }
}
```

**Expected Result:**
- Status code: 200 (if direct creation)
- Notification includes metadata field
- Metadata accessible when retrieving notification

**Status:** Not Tested

---

## TC-NOTIF-013: Notification Link
**Feature:** Notifications - Links
**Priority:** Medium
**Preconditions:**
- Notification created with link

**Test Steps:**
1. Create notification with link
2. Verify link is stored and accessible

**Test Data:**
```json
{
  "link": "/sessions/ses_abc123"
}
```

**Expected Result:**
- Notification includes link field
- Link points to relevant resource
- Frontend can use link for navigation

**Status:** Not Tested

---

## TC-NOTIF-014: Notification Queue Error Handling
**Feature:** Notifications - Error Handling
**Priority:** Medium
**Preconditions:**
- Invalid job in queue

**Test Steps:**
1. Add invalid job to queue
2. Run cron job
3. Verify error handling

**Test Data:**
- Invalid job data in queue

**Expected Result:**
- Cron job handles error gracefully
- Invalid job logged or removed
- Valid jobs still processed
- System continues functioning

**Status:** Not Tested

---

## TC-NOTIF-015: Notification Timestamp
**Feature:** Notifications - Timestamps
**Priority:** Low
**Preconditions:**
- Notification created

**Test Steps:**
1. Create notification
2. Verify createdAt timestamp

**Test Data:**
- Notification creation

**Expected Result:**
- createdAt field set to current timestamp
- Timestamp in ISO format
- Timestamp accurate

**Status:** Not Tested

