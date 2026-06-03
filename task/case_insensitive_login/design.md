# Design Specs - Case-Insensitive Login for QDish

This document outlines the design and technical logic to implement case-insensitive authentication and registration in the QDish platform.

## 1. Schema Modifications

We will configure Mongoose to automatically enforce lowercase and trim constraints on the database level:

### User Schema (`User.ts`)
```typescript
username: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true
},
email: {
  type: String,
  unique: true,
  sparse: true,
  lowercase: true,
  trim: true
}
```

### Restaurant Schema (`Restaurant.ts`)
```typescript
username: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true
}
```

### OwnerRegisterToken Schema (`OwnerRegisterToken.ts`)
```typescript
username: {
  type: String,
  required: true,
  lowercase: true,
  trim: true
}
```

## 2. API / Route Normalization

All inputs from client bodies (`req.body`) representing usernames or emails must be explicitly normalized before running Mongoose queries.

### Normalization Logic:
```typescript
const normalizedUsername = username.trim().toLowerCase();
const normalizedEmail = email.trim().toLowerCase();
```

Apply this normalization to:
1. **Login API** (`/api/auth/login`): Try to find the user using `normalizedUsername` or search restaurant using `normalizedEmail` (when login username is an email).
2. **Registration APIs** (`/api/auth/register-owner/...`): Unique verification queries must use normalized values.
3. **Owner Management APIs** (`/api/owners`): Owner creation and update operations must normalize usernames and emails.
4. **Restaurant Management APIs** (`/api/restaurants` and `/api/owner/restaurants`): Restaurant creation and user creation must normalize the `username` field.
5. **Staff Management APIs** (`/api/staff`): Staff account creation and update queries must normalize the `username` field.
6. **Scripts**: Super admin creation script (`createSuperAdmin.ts`) must normalize `username`.

## 3. Unique Constraint Checks

To prevent duplicate registrations under different casings (e.g., `chunhahangqr` and `CHUNHAHANGQR`):
- All uniqueness lookup queries (e.g. `User.findOne({ username: input.trim().toLowerCase() })`) must normalize the input before querying the database.
- If a match is found, standard HTTP `400 Bad Request` or `409 Conflict` status must be returned with an error message: `"Tên đăng nhập đã tồn tại"` or `"Email đã được đăng ký bởi tài khoản khác"`.

## 4. Migration Strategy

A command-line script will be created to clean existing records:
- **Script File**: `src/scripts/migrateUsernamesToLowercase.ts`
- **Execution**: Run with ts-node or compiled JS to connect to the database.
- **Workflow**:
  1. Retrieve all user and restaurant documents.
  2. For each document:
     - Check if `username` or `email` contains uppercase letters.
     - Convert values to lowercase.
     - Save back to the database.
     - If a uniqueness conflict arises (e.g., two entries result in the same lowercase string), append a suffix to the conflicting entry (e.g. `ownerabc-duplicate`) and log a warning to ensure no records are deleted or lost during migration.

## 5. Frontend UI Submission

- **File**: `src/pages/Login.tsx`
- **Form Submit**: Pass `username.trim()` when calling the `authService.login()` method. Do not force lowercase in the UI input value so the user's typing experience remains unaltered.
