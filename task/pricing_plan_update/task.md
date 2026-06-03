# Task Checklist - Pricing/Subscription Plan UI & Logic Update

- [x] Task 1: Update Backend Plan Model
  - [x] Add new fields (`scanLimitMonthly`, AI flags, and analytics flags) to the IPlan interface in [Plan.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/models/Plan.ts)
  - [x] Add corresponding fields to the Mongoose Schema in [Plan.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/models/Plan.ts)

- [x] Task 2: Update Seed Plans Script & Run Database Seed
  - [x] Reconfigure the mock data in [seedPlans.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_BE/src/scripts/seedPlans.ts) to define limits, descriptions, and feature lists according to the specs
  - [x] Run the seed script: `npx tsx src/scripts/seedPlans.ts` and verify database entries are successfully updated

- [x] Task 3: Update Frontend Type Definitions
  - [x] Add the new fields to the Plan interface in [types/index.ts](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_FE/src/types/index.ts)

- [ ] Task 4: Redesign Frontend Pricing Cards
  - [ ] Update [Pricing.tsx](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_FE/src/pages/Pricing.tsx) grid to match layout:
    - [ ] FREE: green border, 500 scans / tháng, description
    - [ ] PLUS: blue border, 5.000 scans / tháng, description
    - [ ] PRO: purple border, Vô hạn / 50.000+ scans/tháng, ribbon "KHUYÊN DÙNG", description
    - [ ] Hide tables, staff, items limits from main cards

- [ ] Task 5: Redesign Billing Section
  - [ ] Update [OwnerDashboard.tsx](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_FE/src/pages/OwnerDashboard.tsx) billing tab cards to hide primary table/staff limits and match the layout of the Pricing page

- [ ] Task 6: Update Super Admin Plan Management
  - [ ] Update [PlanModal.tsx](file:///f:/LEARN%20K%C3%8C%207/QR_FOOD_ORDER/QR_FOOD_ORDER_FE/src/components/dashboard/super-admin/modals/PlanModal.tsx) to expose fields for `scanLimitMonthly` and the new AI/Analytics toggles
  - [ ] Verify that Super Admin can view and save these new settings correctly

- [ ] Task 7: Testing & Verification
  - [ ] Run build tests (`npm run build`) on frontend and backend
  - [ ] Confirm pricing cards display scans/month limits and colors correctly
  - [ ] Generate report `SCAN_AI_PLAN_UI_UPDATE_REPORT.md`
