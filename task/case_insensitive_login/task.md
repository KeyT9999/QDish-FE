# Task Checklist - Case-Insensitive Login for QDish

- [x] Task 1: Update Database Schemas
  - [x] Add `lowercase: true` and `trim: true` to `username` & `email` in [User.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/models/User.ts)
  - [x] Add `lowercase: true` and `trim: true` to `username` in [Restaurant.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/models/Restaurant.ts)
  - [x] Add `lowercase: true` and `trim: true` to `username` in [OwnerRegisterToken.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/models/OwnerRegisterToken.ts)

- [x] Task 2: Refactor Login and Registration Authentication Routes
  - [x] Normalize queries in [authRoutes.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/routes/authRoutes.ts)

- [x] Task 3: Refactor Other User-Creation Routes (Owner, Restaurant Admin, Staff)
  - [x] Normalize queries and user creations in [ownerRoutes.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/routes/ownerRoutes.ts)
  - [x] Normalize queries and user creations in [restaurantRoutes.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/routes/restaurantRoutes.ts)
  - [x] Normalize queries and user creations in [staffRoutes.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/routes/staffRoutes.ts)
  - [x] Normalize queries and user creations in [ownerRestaurantRoutes.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/routes/ownerRestaurantRoutes.ts)
  - [x] Normalize username in [createSuperAdmin.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/scripts/createSuperAdmin.ts)

- [x] Task 4: Implement Database Migration Script
  - [x] Create [migrateUsernamesToLowercase.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/scripts/migrateUsernamesToLowercase.ts)
  - [x] Run migration script on the database and confirm active records are in lowercase

- [x] Task 5: Update Frontend Login Form
  - [x] Trim the username input field in [Login.tsx](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_FE/src/pages/Login.tsx) when submitting

- [x] Task 6: Testing & Verification
  - [x] Verify logins with casing variations: `chunhahangqr`, `CHUNHAHANGQR`, `ChUnHaHaNgQr`, ` chunhahangqr `
  - [x] Verify duplicate validation: registration of `CHUNHAHANGQR` fails with "already exists" error
  - [x] Confirm logins for Super Admin, Owner, Restaurant, and Staff roles
  - [x] Compile and build FE & BE to verify there are no TypeScript errors

- [x] Task 7: Generate Report
  - [x] Create `CASE_INSENSITIVE_LOGIN_REPORT.md`
