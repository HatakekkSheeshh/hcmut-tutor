# Test Cases Documentation

This directory contains comprehensive test cases for the HCMUT Tutor Support System.

## Test Case Organization

### 1. Authentication Test Cases (`01-authentication.md`)
- Login scenarios
- Registration scenarios
- Token refresh
- Logout
- Password validation
- JWT token validation

### 2. User Management Test Cases (`02-user-management.md`)
- User CRUD operations
- Profile updates
- Role-based access
- User search and filtering
- Student/Tutor/Management specific operations

### 3. Session Management Test Cases (`03-session-management.md`)
- Session booking
- Session cancellation
- Session rescheduling
- Session status transitions
- Session filtering and search
- Group sessions
- Session requests

### 4. Class & Enrollment Test Cases (`04-class-enrollment.md`)
- Class creation and management
- Enrollment operations
- Class status management
- Session generation from classes
- Enrollment status transitions

### 5. Notification Test Cases (`05-notifications.md`)
- Notification creation
- Notification queue processing
- Notification retrieval
- Mark as read/unread
- Notification filtering
- Cron job processing

### 6. Conversation & Messaging Test Cases (`06-conversations.md`)
- Conversation creation
- Message sending
- Message retrieval
- Real-time messaging (WebSocket)
- Unread count tracking
- Conversation deletion

### 7. Forum Test Cases (`07-forum.md`)
- Post creation and management
- Comment operations
- Post likes
- Post filtering and search
- Forum moderation

### 8. Management Features Test Cases (`08-management.md`)
- Approval requests
- Permission management
- Resource allocation
- Reports and analytics
- Training credits
- Document management
- Community management

### 9. Library & Progress Test Cases (`09-library-progress.md`)
- Library resource management
- Progress tracking
- Progress reports
- Evaluation system

### 10. Integration Test Cases (`10-integration.md`)
- End-to-end workflows
- Multi-user scenarios
- System integration points
- Error handling and recovery

## Test Case Format

Each test case follows this structure:

```markdown
### Test Case ID: TC-XXX-YYY
**Feature:** Feature Name
**Priority:** High/Medium/Low
**Preconditions:** 
- Condition 1
- Condition 2

**Test Steps:**
1. Step 1
2. Step 2
3. Step 3

**Test Data:**
- Input: ...
- Expected Output: ...

**Expected Result:**
- Expected behavior

**Actual Result:**
- [To be filled during testing]

**Status:** Not Tested / Pass / Fail / Blocked

**Notes:**
- Additional notes
```

## Running Tests

Test cases can be executed manually or integrated with automated testing frameworks. Refer to individual test case files for specific test scenarios.

## Test Coverage

- **Functional Testing:** All API endpoints
- **Authorization Testing:** Role-based access control
- **Validation Testing:** Input validation and error handling
- **Integration Testing:** Cross-feature workflows
- **Edge Cases:** Boundary conditions and error scenarios

