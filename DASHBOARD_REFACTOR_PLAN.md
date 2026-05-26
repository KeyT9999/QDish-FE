# DASHBOARD_REFACTOR_PLAN.md

> **Xem chi tiết đầy đủ tại**: implementation_plan.md (artifact)

## Tổng quan Audit

### Dashboard.tsx — 2270 dòng → Mục tiêu ≤ 500 dòng
- **8 tabs**: overview, orders, menu, categories, tables, staff, settings, notifications
- **7 modals inline**: MenuItemModal, CategoryModal, QRPreviewModal, StaffModal, PaymentCompletionModal, EmailChangeOtpModal, BankChangeOtpModal
- **4 charts inline**: RevenueChart (Area), PeakHourChart (Bar), CategoryRevenueChart (Pie), TopSellingItemsTable
- **~40 useState**, 7 data loaders, 15+ CRUD handlers
- **Realtime Socket.IO** order alerts (giữ ở parent)

### SuperAdmin.tsx — 1379 dòng → Mục tiêu ≤ 400 dòng
- **5 tabs**: restaurants, owners, stats, plans, notifications
- **6 modals inline**: RestaurantModal, ResetPasswordModal (×2), OwnerModal, PlanModal, OwnerPlanOverrideModal
- **2 charts inline**: TopRestaurantsChart (Bar), SubscriptionTransactionsTable
- **~30 useState**, 4 data loaders, 10+ CRUD handlers

## State dùng chung giữa các tab
- `restaurant` (profile) — dùng ở overview, settings, tables (QR URL)
- `categories` — dùng ở menu tab + categories tab
- `restaurantId` — dùng ở mọi tab
- `activeTab` — routing (URL param)

## Cấu trúc thư mục đề xuất

```
src/components/dashboard/
├── restaurant/
│   ├── RestaurantOverviewTab.tsx
│   ├── RestaurantOrdersTab.tsx
│   ├── RestaurantMenuTab.tsx
│   ├── RestaurantCategoriesTab.tsx
│   ├── RestaurantTablesTab.tsx
│   ├── RestaurantStaffTab.tsx
│   ├── RestaurantSettingsTab.tsx
│   ├── RestaurantNotificationsTab.tsx
│   ├── modals/
│   │   ├── MenuItemModal.tsx
│   │   ├── CategoryModal.tsx
│   │   ├── QRPreviewModal.tsx
│   │   ├── StaffModal.tsx
│   │   ├── PaymentCompletionModal.tsx
│   │   ├── EmailChangeOtpModal.tsx
│   │   └── BankChangeOtpModal.tsx
│   └── charts/
│       ├── RevenueChart.tsx
│       ├── PeakHourChart.tsx
│       ├── CategoryRevenueChart.tsx
│       └── TopSellingItemsTable.tsx
│
├── super-admin/
│   ├── SuperAdminStatsTab.tsx
│   ├── RestaurantsTab.tsx
│   ├── OwnersTab.tsx
│   ├── PlansTab.tsx
│   ├── AdminNotificationsTab.tsx
│   ├── modals/
│   │   ├── RestaurantModal.tsx
│   │   ├── ResetPasswordModal.tsx
│   │   ├── OwnerModal.tsx
│   │   ├── PlanModal.tsx
│   │   └── OwnerPlanOverrideModal.tsx
│   └── charts/
│       ├── TopRestaurantsChart.tsx
│       └── SubscriptionTransactionsTable.tsx
```

## Thứ tự thực hiện an toàn

1. **Phase 1**: Dashboard Modals (7 files) → build
2. **Phase 2**: Dashboard Charts (4 files) → build
3. **Phase 3**: Dashboard Tabs (8 files) + refactor Dashboard.tsx → build + test
4. **Phase 4**: SuperAdmin Modals (5 files) → build
5. **Phase 5**: SuperAdmin Charts + Tabs (7 files) + refactor SuperAdmin.tsx → build + test

## Nguyên tắc
- ❌ Không đổi UI/UX
- ❌ Không phá API call, Socket.IO, PayOS, notification, role/permission
- ✅ Mỗi modal nhận props: open, onClose, initialData, onSubmit
- ✅ Mỗi chart chỉ nhận data qua props
- ✅ State local cho modal → chuyển vào modal
- ✅ State dùng chung → giữ ở parent
- ✅ Build check sau mỗi phase
