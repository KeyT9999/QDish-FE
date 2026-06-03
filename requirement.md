# Requirements - Owner Dashboard Mobile UI Redesign

## 1. Context and Goals
The QDish Owner Dashboard works well on Desktop, but when loaded on mobile viewports (e.g. iPhone, Android), the tables break, overflow horizontally, and have cut-off labels. The goal is to provide a premium, mobile-first SaaS POS console layout matching standard PWA guidelines.

## 2. Redesign Scope
We will redesign the following 4 tabs in the Owner Dashboard:
- **Bills Tab (`/owner?tab=bills`)**: Redesign table into distinct list cards.
- **Menu Tab (`/owner?tab=menu`)**: Redesign table into visually rich food items with image, category, calories, status switch, and options dropdown.
- **Tables Tab (`/owner?tab=tables`)**: Redesign table into status cards (Vacant, Occupied, Awaiting payment) with clear emojis and direct action buttons.
- **Staff Tab (`/owner?tab=staff`)**: Redesign table into clean crew profiles with switch status and quick action controls.
- **Topbar & Sidebar**: Clean up top-header breadcrumbs on mobile viewports.

## 3. Business Logic & Constraints
- **Conditional Breakpoint Rendering**: Ensure we do not render both the Desktop Table and the Mobile Cards at the same time to maintain performance. Breakpoint threshold is `640px` (standard Tailwind `sm` boundary).
- **Touch Targets**: All interactive elements (buttons, inputs, switches) must have a touch height of at least `44px` on mobile viewports to prevent click errors.
- **Action Menus**: Group secondary buttons into a clean triple-dot action dropdown (`MoreHorizontal` icon).
