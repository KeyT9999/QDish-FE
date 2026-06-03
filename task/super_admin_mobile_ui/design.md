# Design Specs - Mobile UI for Super Admin QDish

This document outlines the UI/UX design specifications for the Super Admin mobile views.

## 1. Typography & Colors
- Maintain the current theme (Green-600 / Emerald primary, Neutrals for surface and text).
- Font sizes on mobile:
  - Page title: `text-xl` or `text-2xl font-bold` (reduced from `text-3xl` on desktop).
  - Card text: `text-xs` (primary details) and `text-[10px]` (meta-info/labels).
  - Badges: `text-[10px]` or `text-[9px]` font-bold.

## 2. Responsive Mobile Tab Switcher
- Instead of wrapping buttons in multiple rows, we will use a **horizontal scrollable tab list** with custom styles:
  ```html
  <div className="flex gap-2 border-b border-gray-200 pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
    <!-- Tab buttons with whitespace-nowrap -->
  </div>
  ```
  This allows horizontal swipe gestures on mobile, preserving screen height.

## 3. Card View Structures (Mobile `< 640px`)

### Restaurant Mobile Card
```
+-----------------------------------------------------------+
| [Rest Name]                                  [Switch]     |
| [Status Badge]                                            |
|                                                           |
| Owner: [Owner Name]                                       |
| Username: [Username]                                      |
| Contact: [Email] | [Phone]                                |
|                                                           |
| +-------------------------------------------------------+ |
| | [Button: Edit]          [Button: Reset Password]       | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

### Owner Mobile Card
```
+-----------------------------------------------------------+
| [Full Name]                                  [Switch]     |
| @[Username]                                               |
|                                                           |
| Plan: [PLAN NAME] (Subscription Status)                   |
| Verified: [Email Verified Status]                         |
| Contact: [Email] | [Phone]                                |
| Branches: [Count] managed ([Branch 1], [Branch 2])        |
|                                                           |
| +-------------------------------------------------------+ |
| | [Button: Đổi gói]   [Button: Edit]  [Button: Reset]   | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

### Plan Mobile Card
```
+-----------------------------------------------------------+
| [Plan Name]                                  [Switch]     |
| [CODE] [HOT Badge]                                        |
|                                                           |
| Price: [PriceMonthly]/mo | [PriceYearly]/yr               |
| Limits:                                                   |
| - Chi nhánh: [Limit/Không giới hạn]                       |
| - Bàn ăn: [Limit/Không giới hạn]                          |
| - Món ăn: [Limit/Không giới hạn]                          |
| - Nhân viên: [Limit/Không giới hạn]                       |
|                                                           |
| +-------------------------------------------------------+ |
| | [Button: Edit]                        [Button: Delete] | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

## 4. Modal Optimization
- `DialogContent` max width: `w-full max-w-lg sm:max-w-md`.
- Added classes `max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl` so the modal displays as a clean bottom sheet on mobile and normal dialog on desktop.
- Inputs, Selects, and Buttons must span `w-full`.
