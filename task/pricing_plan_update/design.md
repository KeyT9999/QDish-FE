# Design Specs - Pricing/Subscription Plan UI & Logic Update

This document outlines the technical design specifications to change the subscription plan model, seeding configurations, and UI representation.

## 1. Backend Database Design

### Plan Schema (`Plan.ts`)
Add the following fields:
```typescript
scanLimitMonthly: {
  type: Number,
  required: true,
  default: -1 // -1 means unlimited
},
fitScoreEnabled: {
  type: Boolean,
  default: false
},
foodAttributesEnabled: {
  type: Boolean,
  default: false
},
recommendationEnabled: {
  type: Boolean,
  default: false
},
personalizedMenuEnabled: {
  type: Boolean,
  default: false
},
advancedAnalyticsEnabled: {
  type: Boolean,
  default: false
},
customerInsightsEnabled: {
  type: Boolean,
  default: false
}
```

### Plan Seeding (`seedPlans.ts`)
Map the new values for each plan code:
- **FREE**: `scanLimitMonthly: 500`, `restaurantLimit: 1`, `tableLimit: 5`, `menuItemLimit: 10`, `staffLimit: 3`. AI flags all `false`.
- **PLUS**: `scanLimitMonthly: 5000`, `restaurantLimit: 3`, `tableLimit: 30`, `menuItemLimit: 150`, `staffLimit: 15`, `recommendationEnabled: true`, `personalizedMenuEnabled: true`, `fitScoreEnabled: true`, `foodAttributesEnabled: true`.
- **PRO**: `scanLimitMonthly: -1`, `restaurantLimit: -1`, `tableLimit: -1`, `menuItemLimit: -1`, `staffLimit: -1`, `recommendationEnabled: true`, `personalizedMenuEnabled: true`, `fitScoreEnabled: true`, `foodAttributesEnabled: true`, `advancedAnalyticsEnabled: true`, `customerInsightsEnabled: true`.

---

## 2. Frontend Design

### Pricing Page (`Pricing.tsx`)
- Display cards with custom border classes dynamically based on `plan.code`:
  - **FREE**: `border-emerald-500/80` or `border-green-500/80`
  - **PLUS**: `border-blue-500/85` or `border-sky-500/85`
  - **PRO**: `border-purple-500` or `border-violet-500` with absolute positioned Ribbon text `"KHUYÊN DÙNG"` at the top.
- Display large scans count:
  - If `plan.scanLimitMonthly === -1`: Display `Vô hạn` (large bold text) and subtitle `50.000+ scans/tháng`.
  - Else: Display formatted number (e.g. `500` or `5.000`) and label `scans / tháng`.
- Hide the tables, items, and staff counts section. Show a refined features listing based on the updated description.

### Owner Dashboard Billing Tab (`OwnerDashboard.tsx`)
- Apply identical display logic to pricing cards listed under "Gói có thể nâng cấp" to keep consistency across both pages.
- Ensure limits for table, staff, and dishes are removed from the main display cards.

### Super Admin edit modal (`PlanModal.tsx`)
- Expose input fields for `scanLimitMonthly` and switch toggles for the AI and analytics flags.
- Map the state keys to database fields during payload construction.
