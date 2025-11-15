# Forum Test Cases

## TC-FORUM-001: List Forum Posts
**Feature:** Forum - List Posts
**Priority:** High
**Preconditions:**
- User is logged in
- Forum posts exist

**Test Steps:**
1. Send GET request to `/api/forum/posts`
2. Include query parameters
3. Verify response

**Test Data:**
- Query: `?page=1&limit=10&subject=Mathematics`

**Expected Result:**
- Status code: 200
- Response contains array of posts
- Posts filtered by criteria
- Pagination metadata included
- Each post includes: id, title, author, likes, comments count

**Status:** Not Tested

---

## TC-FORUM-002: Create Forum Post
**Feature:** Forum - Create Post
**Priority:** High
**Preconditions:**
- User is logged in

**Test Steps:**
1. Send POST request to `/api/forum/posts`
2. Include post data
3. Verify response

**Test Data:**
```json
{
  "title": "Question about Calculus",
  "content": "I need help with derivatives...",
  "subject": "Mathematics",
  "tags": ["calculus", "help"]
}
```

**Expected Result:**
- Status code: 201
- Post created
- Post ID generated
- authorId set to current user
- Post appears in forum list

**Status:** Not Tested

---

## TC-FORUM-003: Get Post by ID
**Feature:** Forum - Get Post
**Priority:** High
**Preconditions:**
- Post exists

**Test Steps:**
1. Send GET request to `/api/forum/posts/{postId}`
2. Verify response

**Test Data:**
- URL: `/api/forum/posts/post_abc123`

**Expected Result:**
- Status code: 200
- Response contains full post details
- Includes author information, content, likes, comments

**Status:** Not Tested

---

## TC-FORUM-004: Update Post
**Feature:** Forum - Update Post
**Priority:** Medium
**Preconditions:**
- Post exists
- User is logged in and is post author

**Test Steps:**
1. Send PUT request to `/api/forum/posts/{postId}`
2. Include updated data
3. Verify response

**Test Data:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Expected Result:**
- Status code: 200
- Post updated
- updatedAt timestamp changed

**Status:** Not Tested

---

## TC-FORUM-005: Update Post as Non-Author
**Feature:** Forum - Authorization
**Priority:** High
**Preconditions:**
- Post exists
- User is logged in but not author

**Test Steps:**
1. User tries to update another user's post
2. Verify response

**Test Data:**
- URL: `/api/forum/posts/{other_user_postId}`

**Expected Result:**
- Status code: 403
- Error message indicating insufficient permissions
- Post not updated

**Status:** Not Tested

---

## TC-FORUM-006: Delete Post
**Feature:** Forum - Delete Post
**Priority:** Medium
**Preconditions:**
- Post exists
- User is logged in and is post author (or management)

**Test Steps:**
1. Send DELETE request to `/api/forum/posts/{postId}`
2. Verify response

**Test Data:**
- URL: `/api/forum/posts/post_abc123`

**Expected Result:**
- Status code: 200 or 204
- Post deleted
- Related comments may be deleted or archived

**Status:** Not Tested

---

## TC-FORUM-007: Like Post
**Feature:** Forum - Like Post
**Priority:** Medium
**Preconditions:**
- Post exists
- User is logged in

**Test Steps:**
1. Send POST request to `/api/forum/posts/{postId}/like`
2. Verify response

**Test Data:**
- URL: `/api/forum/posts/post_abc123/like`

**Expected Result:**
- Status code: 200
- Post liked
- Like count incremented
- User added to likes array
- Cannot like same post twice

**Status:** Not Tested

---

## TC-FORUM-008: Unlike Post
**Feature:** Forum - Unlike Post
**Priority:** Medium
**Preconditions:**
- Post exists
- User has liked the post

**Test Steps:**
1. Send DELETE request to `/api/forum/posts/{postId}/like`
2. Verify response

**Test Data:**
- URL: `/api/forum/posts/post_abc123/like`

**Expected Result:**
- Status code: 200
- Like removed
- Like count decremented
- User removed from likes array

**Status:** Not Tested

---

## TC-FORUM-009: Get Comments
**Feature:** Forum - List Comments
**Priority:** High
**Preconditions:**
- Post exists
- Comments exist for post

**Test Steps:**
1. Send GET request to `/api/forum/posts/{postId}/comments`
2. Verify response

**Test Data:**
- URL: `/api/forum/posts/post_abc123/comments`

**Expected Result:**
- Status code: 200
- Response contains array of comments
- Comments ordered by createdAt
- Each comment includes author information

**Status:** Not Tested

---

## TC-FORUM-010: Create Comment
**Feature:** Forum - Create Comment
**Priority:** High
**Preconditions:**
- Post exists
- User is logged in

**Test Steps:**
1. Send POST request to `/api/forum/posts/{postId}/comments`
2. Include comment content
3. Verify response

**Test Data:**
```json
{
  "content": "Great question! Here's my answer..."
}
```

**Expected Result:**
- Status code: 201
- Comment created
- Comment ID generated
- authorId set to current user
- Comment appears in post comments
- Post author notified (if implemented)

**Status:** Not Tested

---

## TC-FORUM-011: Delete Comment
**Feature:** Forum - Delete Comment
**Priority:** Medium
**Preconditions:**
- Comment exists
- User is logged in and is comment author (or management)

**Test Steps:**
1. Send DELETE request to `/api/forum/comments/{commentId}`
2. Verify response

**Test Data:**
- URL: `/api/forum/comments/comment_abc123`

**Expected Result:**
- Status code: 200 or 204
- Comment deleted
- Comment removed from post

**Status:** Not Tested

---

## TC-FORUM-012: Filter Posts by Subject
**Feature:** Forum - Filtering
**Priority:** Medium
**Preconditions:**
- Posts exist with different subjects

**Test Steps:**
1. Send GET request with subject filter
2. Verify response

**Test Data:**
- Query: `?subject=Mathematics`

**Expected Result:**
- Status code: 200
- Only posts with specified subject returned
- Other subjects filtered out

**Status:** Not Tested

---

## TC-FORUM-013: Search Posts
**Feature:** Forum - Search
**Priority:** Medium
**Preconditions:**
- Posts exist with various content

**Test Steps:**
1. Send GET request with search query
2. Verify response

**Test Data:**
- Query: `?search=calculus`

**Expected Result:**
- Status code: 200
- Posts matching search query returned
- Search matches title and content

**Status:** Not Tested

---

## TC-FORUM-014: Post Validation
**Feature:** Forum - Input Validation
**Priority:** Medium
**Preconditions:**
- User is logged in

**Test Steps:**
1. Send POST request with invalid data
2. Verify validation errors

**Test Data:**
```json
{
  "title": "",
  "content": ""
}
```

**Expected Result:**
- Status code: 400
- Validation error messages
- Post not created

**Status:** Not Tested

---

## TC-FORUM-015: Comment Validation
**Feature:** Forum - Comment Validation
**Priority:** Medium
**Preconditions:**
- Post exists

**Test Steps:**
1. Send POST request with empty comment
2. Verify validation errors

**Test Data:**
```json
{
  "content": ""
}
```

**Expected Result:**
- Status code: 400
- Validation error message
- Comment not created

**Status:** Not Tested

---

## TC-FORUM-016: Post Pagination
**Feature:** Forum - Pagination
**Priority:** Low
**Preconditions:**
- Many posts exist (>10)

**Test Steps:**
1. Send GET request with pagination
2. Verify pagination works

**Test Data:**
- Query: `?page=1&limit=10`
- Query: `?page=2&limit=10`

**Expected Result:**
- Status code: 200
- Correct page of posts returned
- Pagination metadata included

**Status:** Not Tested

---

## TC-FORUM-017: Post Timestamps
**Feature:** Forum - Timestamps
**Priority:** Low
**Preconditions:**
- Post created

**Test Steps:**
1. Create post
2. Verify timestamps

**Test Data:**
- Post creation

**Expected Result:**
- createdAt field set
- updatedAt field set (if updated)
- Timestamps in ISO format

**Status:** Not Tested

---

## TC-FORUM-018: Forum Moderation (Management)
**Feature:** Forum - Moderation
**Priority:** Medium
**Preconditions:**
- Management user is logged in
- Post exists

**Test Steps:**
1. Management user deletes inappropriate post
2. Verify post deleted
3. Verify author notified (if implemented)

**Test Data:**
- Management user action

**Expected Result:**
- Post deleted successfully
- Management can moderate all posts
- Appropriate notifications sent

**Status:** Not Tested

