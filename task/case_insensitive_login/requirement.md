# Requirement - Case-Insensitive Login for QDish

## 1. Overview
Currently, the username field in the database is case-sensitive, which means users who sign up as `chunhahangqr` fail to login if they type `CHUNHAHANGQR` or `Chunhahangqr`. This causes poor UX. The goal of this task is to ensure all logins (username and email) are case-insensitive across all QDish roles (Super Admin, Restaurant Owner, Restaurant Admin, Staff).

## 2. Requirements

### 1. Case-Insensitive Sign-In
- When logging in, the username/email input must be case-insensitive.
- Extra leading/trailing spaces must be stripped (trimmed).
- The system must query in a case-insensitive manner.

### 2. Case-Insensitive Registration & Unique Constraint Checks
- Usernames and emails must always be stored in lowercase in the database.
- Any check for user/email existence (during sign up, branch admin creation, or staff creation) must reject new registrations if the username already exists under a different casing (e.g. creating `CHUNHAHANGQR` must fail if `chunhahangqr` exists).

### 3. All Roles Supported
- **SUPER_ADMIN**: Username case-insensitive.
- **RESTAURANT_OWNER**: Username & email case-insensitive.
- **RESTAURANT_ADMIN**: Username & email case-insensitive.
- **STAFF**: Username case-insensitive.

### 4. Database Schema Standardization
- Define `lowercase: true` and `trim: true` for the `username` and `email` fields in the `User` schema.
- Define `lowercase: true` and `trim: true` for the `username` field in the `Restaurant` schema.
- Define `lowercase: true` and `trim: true` for the `username` field in the `OwnerRegisterToken` schema.

### 5. Database Migration
- Provide a database migration script to convert all existing database usernames and emails to lowercase.
- The script must run without data loss and handle any naming collisions (if any) gracefully.

### 6. Frontend Normalization
- On the login form, the username input must be trimmed (`.trim()`) before submitting.
- Do not force lowercase on the frontend form field so users can type naturally; validation/handling must be done at the API level.
