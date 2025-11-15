# Authentication Test Cases

## TC-AUTH-001: Successful Login
**Feature:** User Authentication - Login
**Priority:** High
**Preconditions:**
- User exists in the system
- User has valid email and password

**Test Steps:**
1. Send POST request to `/api/auth/login`
2. Include email and password in request body
3. Verify response

**Test Data:**
```json
{
  "email": "student@hcmut.edu.vn",
  "password": "password123"
}
```

**Expected Result:**
- Status code: 200
- Response contains: user object (without password), token, refreshToken
- Token is valid JWT format
- User object contains: id, email, name, role, hcmutId

**Status:** Not Tested

---

## TC-AUTH-002: Login with Invalid Email
**Feature:** User Authentication - Login Validation
**Priority:** High
**Preconditions:**
- User does not exist in the system

**Test Steps:**
1. Send POST request to `/api/auth/login`
2. Include non-existent email and any password
3. Verify response

**Test Data:**
```json
{
  "email": "nonexistent@hcmut.edu.vn",
  "password": "anypassword"
}
```

**Expected Result:**
- Status code: 401
- Error message: "Email hoặc mật khẩu không đúng"

**Status:** Not Tested

---

## TC-AUTH-003: Login with Invalid Password
**Feature:** User Authentication - Password Validation
**Priority:** High
**Preconditions:**
- User exists in the system

**Test Steps:**
1. Send POST request to `/api/auth/login`
2. Include valid email but incorrect password
3. Verify response

**Test Data:**
```json
{
  "email": "student@hcmut.edu.vn",
  "password": "wrongpassword"
}
```

**Expected Result:**
- Status code: 401
- Error message: "Email hoặc mật khẩu không đúng"

**Status:** Not Tested

---

## TC-AUTH-004: Login with Missing Email
**Feature:** User Authentication - Input Validation
**Priority:** Medium
**Preconditions:** None

**Test Steps:**
1. Send POST request to `/api/auth/login`
2. Include only password in request body
3. Verify response

**Test Data:**
```json
{
  "password": "password123"
}
```

**Expected Result:**
- Status code: 400 or 401
- Error message indicating missing email

**Status:** Not Tested

---

## TC-AUTH-005: Login with Missing Password
**Feature:** User Authentication - Input Validation
**Priority:** Medium
**Preconditions:** None

**Test Steps:**
1. Send POST request to `/api/auth/login`
2. Include only email in request body
3. Verify response

**Test Data:**
```json
{
  "email": "student@hcmut.edu.vn"
}
```

**Expected Result:**
- Status code: 400 or 401
- Error message indicating missing password

**Status:** Not Tested

---

## TC-AUTH-006: Successful Registration
**Feature:** User Authentication - Registration
**Priority:** High
**Preconditions:**
- Email does not exist in the system

**Test Steps:**
1. Send POST request to `/api/auth/register`
2. Include all required user information
3. Verify response

**Test Data:**
```json
{
  "email": "newstudent@hcmut.edu.vn",
  "password": "password123",
  "name": "New Student",
  "hcmutId": "B20XXXXX",
  "role": "student",
  "major": "Computer Science",
  "year": 2
}
```

**Expected Result:**
- Status code: 201 or 200
- Response contains: user object, token, refreshToken
- User is created in the system
- Password is hashed (not plain text)

**Status:** Not Tested

---

## TC-AUTH-007: Registration with Duplicate Email
**Feature:** User Authentication - Registration Validation
**Priority:** High
**Preconditions:**
- User with email already exists

**Test Steps:**
1. Send POST request to `/api/auth/register`
2. Include email that already exists
3. Verify response

**Test Data:**
```json
{
  "email": "existing@hcmut.edu.vn",
  "password": "password123",
  "name": "Duplicate User",
  "hcmutId": "B20YYYYY",
  "role": "student"
}
```

**Expected Result:**
- Status code: 400 or 409
- Error message indicating email already exists

**Status:** Not Tested

---

## TC-AUTH-008: Get Current User (Me)
**Feature:** User Authentication - Get Current User
**Priority:** High
**Preconditions:**
- User is logged in
- Valid JWT token available

**Test Steps:**
1. Send GET request to `/api/auth/me`
2. Include Authorization header with Bearer token
3. Verify response

**Test Data:**
- Headers: `Authorization: Bearer <valid_token>`

**Expected Result:**
- Status code: 200
- Response contains current user information
- User object matches token payload

**Status:** Not Tested

---

## TC-AUTH-009: Get Current User without Token
**Feature:** User Authentication - Authorization
**Priority:** High
**Preconditions:** None

**Test Steps:**
1. Send GET request to `/api/auth/me`
2. Do not include Authorization header
3. Verify response

**Test Data:**
- No Authorization header

**Expected Result:**
- Status code: 401
- Error message: "No authentication token provided"

**Status:** Not Tested

---

## TC-AUTH-010: Get Current User with Invalid Token
**Feature:** User Authentication - Token Validation
**Priority:** High
**Preconditions:** None

**Test Steps:**
1. Send GET request to `/api/auth/me`
2. Include Authorization header with invalid token
3. Verify response

**Test Data:**
- Headers: `Authorization: Bearer invalid_token_12345`

**Expected Result:**
- Status code: 401
- Error message: "Invalid or expired token"

**Status:** Not Tested

---

## TC-AUTH-011: Refresh Token
**Feature:** User Authentication - Token Refresh
**Priority:** Medium
**Preconditions:**
- User has valid refresh token

**Test Steps:**
1. Send POST request to `/api/auth/refresh`
2. Include refreshToken in request body
3. Verify response

**Test Data:**
```json
{
  "refreshToken": "<valid_refresh_token>"
}
```

**Expected Result:**
- Status code: 200
- Response contains new token and refreshToken
- New token is valid

**Status:** Not Tested

---

## TC-AUTH-012: Refresh Token with Invalid Token
**Feature:** User Authentication - Token Refresh Validation
**Priority:** Medium
**Preconditions:** None

**Test Steps:**
1. Send POST request to `/api/auth/refresh`
2. Include invalid refreshToken
3. Verify response

**Test Data:**
```json
{
  "refreshToken": "invalid_refresh_token"
}
```

**Expected Result:**
- Status code: 401
- Error message indicating invalid refresh token

**Status:** Not Tested

---

## TC-AUTH-013: Logout
**Feature:** User Authentication - Logout
**Priority:** Medium
**Preconditions:**
- User is logged in
- Valid JWT token available

**Test Steps:**
1. Send POST request to `/api/auth/logout`
2. Include Authorization header with Bearer token
3. Verify response

**Test Data:**
- Headers: `Authorization: Bearer <valid_token>`

**Expected Result:**
- Status code: 200
- Success message
- Token should be invalidated (if token blacklist implemented)

**Status:** Not Tested

---

## TC-AUTH-014: Login with Different User Roles
**Feature:** User Authentication - Role-based Login
**Priority:** High
**Preconditions:**
- Users with different roles exist (student, tutor, management)

**Test Steps:**
1. Login as student
2. Login as tutor
3. Login as management
4. Verify each login returns correct role

**Test Data:**
- Student: `{"email": "student@hcmut.edu.vn", "password": "..."}`
- Tutor: `{"email": "tutor@hcmut.edu.vn", "password": "..."}`
- Management: `{"email": "management@hcmut.edu.vn", "password": "..."}`

**Expected Result:**
- All logins successful (200)
- Each token contains correct role
- User object has correct role field

**Status:** Not Tested

---

## TC-AUTH-015: Token Expiration Handling
**Feature:** User Authentication - Token Expiration
**Priority:** Medium
**Preconditions:**
- User has expired token

**Test Steps:**
1. Use expired token to access protected endpoint
2. Verify response
3. Use refresh token to get new access token

**Test Data:**
- Expired JWT token
- Valid refresh token

**Expected Result:**
- Expired token returns 401
- Refresh token successfully generates new access token

**Status:** Not Tested

