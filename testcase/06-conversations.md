# Conversation & Messaging Test Cases

## TC-CONV-001: List Conversations
**Feature:** Conversations - List Conversations
**Priority:** High
**Preconditions:**
- User is logged in
- Conversations exist

**Test Steps:**
1. Send GET request to `/api/conversations`
2. Verify response

**Test Data:**
- Headers: `Authorization: Bearer <token>`

**Expected Result:**
- Status code: 200
- Response contains array of conversations
- Only conversations where user is participant returned
- Each conversation includes lastMessage and unreadCount

**Status:** Not Tested

---

## TC-CONV-002: Create Conversation
**Feature:** Conversations - Create Conversation
**Priority:** High
**Preconditions:**
- User is logged in
- Target user exists

**Test Steps:**
1. Send POST request to `/api/conversations`
2. Include participant IDs
3. Verify response

**Test Data:**
```json
{
  "participants": ["stu_abc123", "tut_xyz789"]
}
```

**Expected Result:**
- Status code: 201
- Conversation created
- Conversation ID generated
- Both participants can access conversation

**Status:** Not Tested

---

## TC-CONV-003: Get Conversation by ID
**Feature:** Conversations - Get Conversation
**Priority:** High
**Preconditions:**
- Conversation exists
- User is logged in and is participant

**Test Steps:**
1. Send GET request to `/api/conversations/{conversationId}`
2. Verify response

**Test Data:**
- URL: `/api/conversations/conv_abc123`

**Expected Result:**
- Status code: 200
- Response contains conversation details
- Includes participants, lastMessage, unreadCount

**Status:** Not Tested

---

## TC-CONV-004: Get Conversation as Non-Participant
**Feature:** Conversations - Authorization
**Priority:** High
**Preconditions:**
- Conversation exists
- User is logged in but not participant

**Test Steps:**
1. User tries to access conversation they're not part of
2. Verify response

**Test Data:**
- URL: `/api/conversations/{other_user_conversationId}`

**Expected Result:**
- Status code: 403 or 404
- Error message indicating access denied

**Status:** Not Tested

---

## TC-CONV-005: Delete Conversation
**Feature:** Conversations - Delete Conversation
**Priority:** Medium
**Preconditions:**
- Conversation exists
- User is logged in and is participant

**Test Steps:**
1. Send DELETE request to `/api/conversations/{conversationId}`
2. Verify response

**Test Data:**
- URL: `/api/conversations/conv_abc123`

**Expected Result:**
- Status code: 200 or 204
- Conversation deleted
- Messages may be deleted or archived

**Status:** Not Tested

---

## TC-MSG-001: Get Messages
**Feature:** Messages - List Messages
**Priority:** High
**Preconditions:**
- Conversation exists
- Messages exist in conversation
- User is logged in and is participant

**Test Steps:**
1. Send GET request to `/api/conversations/{conversationId}/messages`
2. Include pagination
3. Verify response

**Test Data:**
- URL: `/api/conversations/conv_abc123/messages?page=1&limit=50`

**Expected Result:**
- Status code: 200
- Response contains array of messages
- Messages ordered by createdAt (newest first or oldest first)
- Pagination metadata included

**Status:** Not Tested

---

## TC-MSG-002: Send Message
**Feature:** Messages - Send Message
**Priority:** High
**Preconditions:**
- Conversation exists
- User is logged in and is participant

**Test Steps:**
1. Send POST request to `/api/conversations/{conversationId}/messages`
2. Include message content
3. Verify response

**Test Data:**
```json
{
  "content": "Hello, how are you?",
  "type": "text"
}
```

**Expected Result:**
- Status code: 201
- Message created
- Message ID generated
- Message appears in conversation
- Unread count updated for receiver
- Real-time notification sent via WebSocket

**Status:** Not Tested

---

## TC-MSG-003: Send Message with File
**Feature:** Messages - File Messages
**Priority:** Medium
**Preconditions:**
- Conversation exists
- User is logged in

**Test Steps:**
1. Send POST request with file
2. Include fileUrl
3. Verify response

**Test Data:**
```json
{
  "content": "Here's the document",
  "type": "file",
  "fileUrl": "https://example.com/document.pdf"
}
```

**Expected Result:**
- Status code: 201
- Message created with file
- File URL stored
- Message type is "file"

**Status:** Not Tested

---

## TC-MSG-004: Send Message with Image
**Feature:** Messages - Image Messages
**Priority:** Medium
**Preconditions:**
- Conversation exists
- User is logged in

**Test Steps:**
1. Send POST request with image
2. Include image URL
3. Verify response

**Test Data:**
```json
{
  "content": "Check this out",
  "type": "image",
  "fileUrl": "https://example.com/image.jpg"
}
```

**Expected Result:**
- Status code: 201
- Message created with image
- Image URL stored
- Message type is "image"

**Status:** Not Tested

---

## TC-MSG-005: Mark Message as Read
**Feature:** Messages - Read Status
**Priority:** High
**Preconditions:**
- Message exists
- User is receiver

**Test Steps:**
1. User views message
2. Message read status updated
3. Verify unread count decreases

**Test Data:**
- Message retrieval or WebSocket read event

**Expected Result:**
- Message read field updated to true
- Unread count in conversation decreases
- Sender can see message was read (if implemented)

**Status:** Not Tested

---

## TC-MSG-006: Message Pagination
**Feature:** Messages - Pagination
**Priority:** Medium
**Preconditions:**
- Conversation has many messages (>50)

**Test Steps:**
1. Send GET request with pagination
2. Verify pagination works

**Test Data:**
- Query: `?page=1&limit=50`
- Query: `?page=2&limit=50`

**Expected Result:**
- Status code: 200
- Correct page of messages returned
- Pagination metadata included
- Messages load correctly

**Status:** Not Tested

---

## TC-MSG-007: Real-time Message Delivery (WebSocket)
**Feature:** Messages - WebSocket
**Priority:** High
**Preconditions:**
- WebSocket server running
- Users connected via WebSocket

**Test Steps:**
1. User A sends message via API
2. Verify User B receives message via WebSocket
3. Verify message appears in real-time

**Test Data:**
- WebSocket connection established
- Message sent via REST API

**Expected Result:**
- Message delivered instantly via WebSocket
- Receiver sees message without refresh
- Message appears in conversation
- Unread count updates in real-time

**Status:** Not Tested

---

## TC-MSG-008: WebSocket Connection Authentication
**Feature:** Messages - WebSocket Auth
**Priority:** High
**Preconditions:**
- WebSocket server running

**Test Steps:**
1. Connect to WebSocket with JWT token
2. Verify connection accepted
3. Try connecting without token
4. Verify connection rejected

**Test Data:**
- WebSocket connection with token
- WebSocket connection without token

**Expected Result:**
- Connection with valid token: accepted
- Connection without token: rejected
- Invalid token: connection rejected

**Status:** Not Tested

---

## TC-MSG-009: WebSocket Room Management
**Feature:** Messages - WebSocket Rooms
**Priority:** Medium
**Preconditions:**
- WebSocket server running
- Users connected

**Test Steps:**
1. User joins conversation room
2. Send message to room
3. Verify all room participants receive message

**Test Data:**
- WebSocket room join event
- Message sent to room

**Expected Result:**
- User successfully joins room
- Message broadcasted to all room participants
- Non-participants do not receive message

**Status:** Not Tested

---

## TC-MSG-010: Unread Count Tracking
**Feature:** Messages - Unread Count
**Priority:** High
**Preconditions:**
- Conversation exists
- Messages exist

**Test Steps:**
1. Check unread count in conversation
2. Mark messages as read
3. Verify unread count updates

**Test Data:**
- Conversation with unread messages

**Expected Result:**
- Unread count accurate
- Count decreases when messages read
- Count increases when new messages received

**Status:** Not Tested

---

## TC-MSG-011: Message Timestamp
**Feature:** Messages - Timestamps
**Priority:** Low
**Preconditions:**
- Message created

**Test Steps:**
1. Send message
2. Verify timestamp

**Test Data:**
- Message creation

**Expected Result:**
- createdAt field set to current timestamp
- Timestamp in ISO format
- Timestamp accurate

**Status:** Not Tested

---

## TC-MSG-012: Message Validation
**Feature:** Messages - Input Validation
**Priority:** Medium
**Preconditions:**
- Conversation exists

**Test Steps:**
1. Send message with empty content
2. Send message with invalid type
3. Verify validation errors

**Test Data:**
```json
{
  "content": "",
  "type": "invalid_type"
}
```

**Expected Result:**
- Status code: 400
- Validation error messages
- Message not created

**Status:** Not Tested

---

## TC-MSG-013: Message Authorization
**Feature:** Messages - Authorization
**Priority:** High
**Preconditions:**
- Conversation exists
- User is not participant

**Test Steps:**
1. User tries to send message to conversation they're not part of
2. Verify response

**Test Data:**
- URL: `/api/conversations/{other_conversationId}/messages`

**Expected Result:**
- Status code: 403
- Error message indicating access denied
- Message not created

**Status:** Not Tested

---

## TC-MSG-014: Conversation Auto-creation
**Feature:** Conversations - Auto Creation
**Priority:** Medium
**Preconditions:**
- Two users exist

**Test Steps:**
1. User A sends message to User B
2. Verify conversation auto-created if doesn't exist
3. Verify both users can access conversation

**Test Data:**
- First message between two users

**Expected Result:**
- Conversation created automatically
- Both users added as participants
- Message sent successfully

**Status:** Not Tested

---

## TC-MSG-015: Online Status (WebSocket)
**Feature:** Messages - Online Status
**Priority:** Medium
**Preconditions:**
- WebSocket server running

**Test Steps:**
1. User connects via WebSocket
2. Verify online status updated
3. User disconnects
4. Verify offline status updated

**Test Data:**
- WebSocket connection/disconnection

**Expected Result:**
- Online status tracked
- Status updates in real-time
- Other users see status changes

**Status:** Not Tested

