# Authentication Feature

## 1) Problem the Feature Solves

- Users need a secure way to create accounts and sign in to access protected features such as placing orders and viewing order history.
- The system needs to distinguish between **customer** and **admin** roles to protect sensitive admin-only endpoints.
- Short-lived access tokens minimize the damage window if a token is compromised, while refresh tokens maintain a seamless user session without requiring frequent re-login.

---

## 2) Scope — Project Boundaries for this Feature

**In Scope:**
- User registration with name, email, and password
- Login returning a short-lived Access Token (15 min) and a long-lived Refresh Token (14 days)
- Refresh Token rotation — issuing a new Access Token via `/auth/refresh`
- Logout — invalidating the Refresh Token
- `GET /auth/me` — returning the currently authenticated user
- JWT Auth Middleware — protecting private routes
- Role Middleware — restricting routes to admin users only

**Out of Scope:**
- Social login (Google / Facebook)
- Forgot password / Reset password flow
- Email verification
- Two-factor authentication (2FA)
- Refresh Token family tracking / reuse detection

---

## 3) Deliverables

**Backend:**
| Deliverable | Description |
|---|---|
| `POST /api/auth/register` | Create a new user account |
| `POST /api/auth/login` | Authenticate user, return Access + Refresh tokens |
| `POST /api/auth/refresh` | Issue a new Access Token using a valid Refresh Token |
| `POST /api/auth/logout` | Invalidate the Refresh Token |
| `GET /api/auth/me` | Return the currently authenticated user's data |
| `User` Mongoose Model | Schema with name, email, passwordHash, role, refreshToken |
| `auth.middleware.ts` | Verifies Access Token on protected routes |
| `admin.middleware.ts` | Verifies user role === "admin" |

---

## 4) User Stories

- "As a new user, I want to register with my name, email, and password so I can create an account."
- "As a registered user, I want to log in so I can access my profile and orders."
- "As a logged-in user, I want my session to stay active without re-logging in every 15 minutes."
- "As a logged-in user, I want to log out so my session ends securely on this device."
- "As an admin, I want my role verified on every request so unauthorized users cannot access admin features."

---

## 5) Functional Requirements

### 5.1 Register

**Description:** Allows a new user to create an account.

**Preconditions:**
- The email address is not already registered.
- Validation rules are active.

**Main Flow:**
1. User submits `name`, `email`, and `password`.
2. System checks the email is not already in use.
3. System hashes the password using bcrypt (salt rounds = 10).
4. System saves the user record with `role = "customer"`.
5. System generates an Access Token (15 min) and a Refresh Token (14 days).
6. System stores the hashed Refresh Token on the user document.
7. System returns both tokens and the user object.

**Alternative Flows:**
- A1: Email already exists → `409 Conflict` — `"Email already exists"`
- A2: Password less than 8 characters → `400 Bad Request` — Mongoose validation error
- A3: Missing required fields → `400 Bad Request`

**Postconditions:**
- User record is stored in the database.
- Access Token and Refresh Token are returned to the client.

**Business Rules:**
- BR-001: Email must be unique.
- BR-002: Password must be at least 8 characters.
- BR-003: Password is always stored as a bcrypt hash — never plain text.
- BR-004: Default role is always `"customer"`.
- BR-005: Refresh Token is stored as a bcrypt hash on the user document.

**Data Requirements:**
- `name` — string, required
- `email` — string, required, valid email format
- `password` — string, required, min 8 characters

---

### 5.2 Login

**Description:** Authenticates an existing user and issues tokens.

**Preconditions:**
- The user exists in the database.

**Main Flow:**
1. User submits `email` and `password`.
2. System finds the user by email (including password field).
3. System compares the submitted password with the stored hash.
4. System generates a new Access Token (15 min) and Refresh Token (14 days).
5. System stores the hashed Refresh Token on the user document.
6. System returns both tokens and the user object.

**Alternative Flows:**
- A1: Email not found or wrong password → `401 Unauthorized` — `"Invalid credentials"`

**Business Rules:**
- BR-006: The same error message is returned whether the email or the password is wrong — this prevents user enumeration attacks.
- BR-007: A new Refresh Token is generated on every login (previous one is overwritten).

**Data Requirements:**
- `email` — string, required
- `password` — string, required

---

### 5.3 Refresh Token

**Description:** Issues a new Access Token using a valid Refresh Token.

**Main Flow:**
1. Client sends the Refresh Token in the request body.
2. System verifies the token signature using `REFRESH_TOKEN_SECRET`.
3. System finds the user by ID from the token payload.
4. System compares the submitted token with the stored hash.
5. System generates and returns a new Access Token (15 min).

**Alternative Flows:**
- A1: Token missing or malformed → `401 Unauthorized`
- A2: Token signature invalid → `403 Forbidden`
- A3: User not found → `403 Forbidden`
- A4: Token does not match stored hash → `403 Forbidden`

**Business Rules:**
- BR-008: Refresh Token is verified against the stored hash — raw token is never stored.
- BR-009: Only the Access Token is rotated; Refresh Token remains the same until logout or re-login.

---

### 5.4 Logout

**Description:** Invalidates the user's Refresh Token.

**Main Flow:**
1. Client sends the Refresh Token in the request body.
2. System verifies the token and finds the user.
3. System clears the stored Refresh Token from the user document.
4. System returns `204 No Content`.

**Alternative Flows:**
- A1: Token missing → `400 Bad Request`
- A2: Token invalid or user not found → `204 No Content` (fail silently — logout should always succeed from the client's perspective)

**Business Rules:**
- BR-010: After logout the Refresh Token is nullified — any subsequent refresh attempts will fail.

---

### 5.5 Get Me

**Description:** Returns the currently authenticated user's profile.

**Preconditions:**
- Valid Access Token is present in the Authorization header.

**Main Flow:**
1. `protect` middleware verifies the Access Token.
2. System attaches the user object to `req.user`.
3. Controller returns `req.user` without the password field.

**Alternative Flows:**
- A1: No token → `401 Unauthorized` — `"You are not logged in"`
- A2: Expired or invalid token → `401 Unauthorized`

---

### 5.6 Auth Middleware (protect)

**Description:** Protects private routes by verifying the Access Token.

**Main Flow:**
1. Extracts the Bearer token from the `Authorization` header.
2. Verifies the token using `JWT_ACCESS_SECRET`.
3. Queries the database to confirm the user still exists.
4. Attaches the user to `req.user` and calls `next()`.

---

### 5.7 Role Middleware (restrictTo)

**Description:** Restricts access to specific roles.

**Main Flow:**
1. Reads `req.user.role`.
2. If role is not in the allowed list → `403 Forbidden`.
3. Otherwise calls `next()`.

---

## 6) Non-Functional Requirements

- Passwords are hashed with **bcrypt** at salt rounds = 10.
- Refresh Tokens are stored as **bcrypt hashes** — never raw values.
- All secrets (`JWT_ACCESS_SECRET`, `REFRESH_TOKEN_SECRET`) are loaded from `.env` — never hardcoded.
- Error messages never expose sensitive internal details.
- Auth middleware must resolve in under **50ms**.
- The `password` and `refreshToken` fields are excluded from all API responses via `select: false`.

---

## 7) Acceptance Criteria

```
✅ POST /api/auth/register with valid data       → 201 + accessToken + refreshToken
✅ POST /api/auth/register with duplicate email  → 409
✅ POST /api/auth/register with password < 8     → 400
✅ POST /api/auth/login with valid credentials   → 200 + accessToken + refreshToken
✅ POST /api/auth/login with wrong password      → 401 "Invalid credentials"
✅ POST /api/auth/refresh with valid token       → 200 + new accessToken
✅ POST /api/auth/refresh with expired token     → 403
✅ POST /api/auth/logout with valid token        → 204
✅ GET  /api/auth/me with valid accessToken      → 200 + user data
✅ GET  /api/auth/me without token               → 401
✅ Admin endpoint with customer token            → 403
✅ password and refreshToken never appear in any response
```

---

## 8) Priority

🔴 **Must-Have** — Authentication is the foundation all other features depend on.
