# Requirement - Mobile UI for Super Admin QDish

## Overview
Currently, the Super Admin interface of QDish console is not optimized for mobile screens. Tables are overflowed horizontally, requiring scrolling, tabs wrap awkwardly, and search/filter panels break. The goal is to provide a first-class responsive mobile experience.

## Detailed Requirements

### 1. Layout & Breakpoints
- **Mobile breakpoint**: `< 640px` (standard `sm` in Tailwind).
- **Tablet breakpoint**: `640px` to `1024px` (Tailwind `sm` and `md`).
- **Desktop breakpoint**: `>= 1024px` (Tailwind `lg` and above).
- There must be **no horizontal scrolling** on the main body of the page.

### 2. Tab Navigation
- Mobile should display tabs either as a horizontal scrolling tab bar (with hidden scrollbars) or a mobile dropdown selector (e.g., "Danh sách nhà hàng ▼").
- Active tab must be highly visible and visually distinct.

### 3. Tab-Specific Content Refactoring
- **Restaurants Tab**:
  - Desktop: Keep the table view.
  - Mobile: Switch to a card-based list. Card must show: Name, Owner Name, Username, Contact info (Email/Phone), Active status toggle, and action buttons (Edit, Reset password).
- **Owners Tab**:
  - Desktop: Keep the table view.
  - Mobile: Switch to a card-based list. Card must show: Full Name, Username, Contact info, Email verification badge, Subscription Plan badge, Subscription status, number of managed restaurants, and action buttons (Edit, Reset password, Override Plan, Toggle Active).
- **SaaS Plans Tab**:
  - Desktop: Keep the table view.
  - Mobile: Switch to a card-based list. Card must show: Plan name & code, monthly/yearly prices, limits (hiding `-1` or showing "Không giới hạn"), status toggle, and edit/delete actions.
- **SaaS Stats Tab**:
  - KPI Cards: Stack to 1 column on mobile.
  - Charts & tables: Ensure charts are responsive and do not overflow container. Subscription transaction table must convert to card list on mobile.
- **Ingredients Tab**:
  - Refine card lists on mobile so that spacing, action buttons, and labels are touch-friendly.
  - Stack the search bar, category dropdown, and source dropdown vertically.

### 4. Search & Filter Toolbars
- Stack input fields, select elements, and action buttons vertically on mobile.
- Set width to `100%` on mobile view.

### 5. Modals
- Modal width should be `100%` with maximum height `90vh`.
- Enable internal scrolling if content is long.
- Keep footer actions sticky if possible or make sure they do not overflow the viewport.

### 6. Interactive States
- Make button touch targets at least `44px` high/wide on mobile.
- Add clear hover and active states for list cards and dropdown items.
