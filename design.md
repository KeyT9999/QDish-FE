# Design Specifications - Owner Dashboard Mobile UI

## 1. Breakpoint Mapping
- **Mobile (< 640px)**: Grid cards, full-width sheet forms, large 44px min-height buttons.
- **Tablet (640px - 1024px)**: Compact layouts.
- **Desktop (> 1024px)**: Complete multi-column data tables.

## 2. Card View Layouts
### Bills Card View
- Outer: 1px light border, `rounded-2xl` corners, subtle shadow.
- Top: Bold Table number on left, status badge on right.
- Fields: 2-column info grid (Bill Code, Session ID, Total Items, Total Amount).
- Bottom: Full-width `h-11` (44px) action buttons.

### Menu Item Card View
- Outer: Flex-row with food image on the left (`w-24 h-24 rounded-xl`), and metadata details on the right.
- Metadata: Name, category badge, and calories/macronutrient list.
- Bottom: Status toggle switch on the bottom-right, large price tag on the bottom-left.

### Tables Grid Card View
- Grid columns: 1 column on mobile, 2 columns on tablet.
- Badge indicators:
  - `⚪ Bàn trống` (Vacant)
  - `🟢 Đang sử dụng` (Occupied)
  - `🟡 Chờ thanh toán` (Awaiting Payment)
- Actions: Large visual buttons (QR, View Bill, Pay Bill).

### Staff Profile Card View
- Outer: Card structure with `👤 Staff Name` header, status toggles, and direct `h-11` action triggers.

## 3. Topbar/Sidebar Adjustments
- Breadcrumbs are hidden on mobile viewports.
- The restaurant name (`restaurantName`) is displayed as a bold title next to the hamburger trigger (`☰`).
