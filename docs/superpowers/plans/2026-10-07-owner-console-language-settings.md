# Owner Console Language Settings Implementation Plan

> **For agentic workers:** Execute this plan inline with `executing-plans`, one task at a time. The two repositories already have matching `feat/owner-console-language-settings` branches.

**Goal:** Add persistent Vietnamese, English, and Simplified Chinese interface language settings for restaurant owners across the QDish owner console.

**Architecture:** Store `preferredLanguage` on the authenticated Mongo `User` and expose owner-only preference endpoints under `/api/auth`. In the FE, a role-gated locale provider supplies a typed static catalog and translation function to the owner shell and all owner screens; the settings card updates the provider immediately and persists the choice.

**Tech Stack:** React, TypeScript, Vite, Tailwind, Express, Mongoose, JWT authentication.

## Global Constraints

- Supported values are exactly `vi`, `en`, and `zh-CN`.
- Existing accounts and missing/unavailable preference reads fall back to `vi`.
- Only `RESTAURANT_OWNER` uses the persisted locale; all other roles remain Vietnamese.
- Preference is account-scoped and independent of selected restaurant/branch.
- Do not translate business data, user-entered text, or customer-facing menu copy.
- Do not add a runtime translation API or third-party dependency.
- Keep the existing QDish emerald/white/neutral design and support keyboard and mobile use.

---

### Task 1: Persist owner language preference in the backend

**Files:**
- Modify: `QR_FOOD_ORDER_BE/src/models/User.ts`
- Modify: `QR_FOOD_ORDER_BE/src/routes/authRoutes.ts`

**Interfaces:**
- Add `UserLanguage = 'vi' | 'en' | 'zh-CN'` as a backend enum/type and optional/defaulted `preferredLanguage` field on `IUser`/`UserSchema`.
- Add `GET /api/auth/preferences` → `{ preferredLanguage: UserLanguage }`.
- Add `PATCH /api/auth/preferences` with `{ preferredLanguage: UserLanguage }` → `{ preferredLanguage: UserLanguage }`.

- [x] Validate `req.auth.sub`, then load the current user by that id; never accept a target user id from input.
- [x] Require `RESTAURANT_OWNER` on both endpoints; return 401 for missing identity, 403 for other roles, 404 for a missing user, and 400 for an unsupported value.
- [x] Default missing persisted values to `vi`; save the update and return the canonical saved value.

**Acceptance:** Existing Mongo documents resolve to Vietnamese; only an authenticated owner can read or update their own preference; invalid values do not mutate the document.

**Verify:** `npm run build` in `QR_FOOD_ORDER_BE`.

**Dependencies:** None.

---

### Task 2: Add typed locale catalogs and owner preference client

**Files:**
- Create: `QR_FOOD_ORDER_FE/src/i18n/ownerConsoleCatalog.ts`
- Create: `QR_FOOD_ORDER_FE/src/i18n/OwnerConsoleLocaleContext.tsx`
- Create: `QR_FOOD_ORDER_FE/src/services/ownerConsolePreferenceService.ts`
- Create: `QR_FOOD_ORDER_FE/src/types/ownerConsoleLocale.ts`

**Interfaces:**

```ts
export type OwnerConsoleLanguage = 'vi' | 'en' | 'zh-CN';
export interface OwnerConsoleLocaleValue {
  language: OwnerConsoleLanguage;
  isSaving: boolean;
  t: (key: OwnerConsoleTranslationKey, values?: Record<string, string | number>) => string;
  setLanguage: (language: OwnerConsoleLanguage) => Promise<boolean>;
}
```

- [x] Define Vietnamese copy as the key source and require each catalog entry to provide its English and Simplified Chinese values through the typed message catalog.
- [x] Support named interpolation values such as `{restaurantName}` without changing user-provided values.
- [x] Fetch and update the authenticated preference through `apiFetch`; normalize absent legacy data to `vi`.
- [x] Scope cached locale by owner id; ignore cache for non-owner roles.
- [x] Load server preference on mount, optimistically update on change, and restore the prior locale if PATCH fails.
- [x] Update `document.documentElement.lang` only while an owner console is mounted.

**Acceptance:** Translation keys are type-checked across all three catalogs; owner locale survives route/tab renders; non-owner roles always get Vietnamese.

**Verify:** `npm run build` in `QR_FOOD_ORDER_FE`.

**Dependencies:** Task 1 API contract.

---

### Task 3: Connect locale provider and add the settings control

**Files:**
- Modify: `QR_FOOD_ORDER_FE/src/components/layout/DashboardLayout.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantSettingsTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/pages/Dashboard.tsx`

- [x] Wrap the authenticated dashboard layout with the locale provider without changing the existing owner workspace provider behavior.
- [x] Add a clearly separated “Interface language” account card to settings; render the native names “Tiếng Việt”, “English”, and “简体中文”.
- [x] Show selected and saving states with semantic labels and keyboard-operable controls; prevent duplicate saves while a request is pending.
- [x] Translate this settings area and the existing settings-page headings using the active locale; keep restaurant, email, bank, and payment fields intact.

**Acceptance:** An owner can change language from settings on desktop and mobile; the change applies immediately and survives reload; a save failure reverts and reports an error.

**Verify:** `npm run lint` and `npm run build` in FE; manually check the three settings states at mobile width.

**Dependencies:** Tasks 1-2.

---

### Task 4: Localize the owner console shell and owner-level pages

**Files:**
- Modify: `QR_FOOD_ORDER_FE/src/components/layout/DashboardLayout.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/pages/OwnerDashboard.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/pages/RestaurantDetail.tsx`
- Modify: owner notification components under `QR_FOOD_ORDER_FE/src/components/notification/`

- [x] Replace owner sidebar labels, active-tab breadcrumbs, branch selector labels, account role label, logout copy, and owner header copy with catalog keys.
- [x] Localize owner home, restaurant empty/archive/restore states, subscription/billing, notification center and owner-created notification form.
- [x] Keep role-based shell copy Vietnamese for restaurant admins, staff, and super admins.
- [x] Localize owner-facing toast messages and loading/error states in these views.

**Acceptance:** Owner home, billing, notifications, branch switching and restaurant detail have no fixed Vietnamese UI copy when English/Chinese is active; dynamic names remain unchanged.

**Verify:** `npm run lint` and `npm run build` in FE; manually switch locale and visit each owner-level tab.

**Dependencies:** Tasks 2-3.

---

### Task 5: Localize restaurant workspace tabs and dialogs

**Files:**
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantOverviewTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/MerchantInsightsTab.tsx` and `merchant-insights/*`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantCustomersTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantOrdersTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantBillsTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantMenuTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantCategoriesTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantIngredientsTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantTablesTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantStaffTab.tsx`
- Modify: owner-visible dialogs in `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/modals/`

- [x] Localize fixed section titles, table headers, filters, buttons, form labels, empty/loading/error states and confirmation text for each management tab.
- [x] Localize chart legends and insight section headings while preserving measured restaurant data and menu content.
- [x] Localize dialog labels and interface feedback for menu/category/staff/table/bill/payment/email/bank actions.
- [x] Keep the customer-facing menu translation editor's EN/ZH content distinct from the owner console locale; translate only its fixed control copy when opened in the owner console.
- [x] Reuse shared catalog keys for repeated actions and statuses; avoid duplicate strings and preserve interpolation values.

**Acceptance:** Every fixed control label on owner workspace tabs and dialogs follows the chosen locale; API data and customer menu language values remain unchanged; restaurant-admin screens stay Vietnamese.

**Verify:** `npm run lint` and `npm run build` in FE; manually review each owner workspace tab in VI/EN/ZH at desktop and mobile widths.

**Dependencies:** Tasks 2-4.

---

### Task 6: Finish formatting, review boundaries, and verify both repositories

**Files:**
- Modify: shared FE formatting utilities only where locale-aware formatting can be applied without changing stored values.
- Modify: owner UI components missed during Tasks 3-5, based on a fixed-copy scan.

- [x] Make date, number, and currency presentation locale-aware where applicable; keep all money in VND and preserve backend units.
- [x] Scan owner-only render paths for fixed Vietnamese UI labels and keep all English/Chinese entries type-checked against the Vietnamese keys.
- [x] Check that customer `menuLocale`, non-owner roles, notification/user-entered content and account separation are unchanged.
- [x] Run FE encoding check, lint, type-check, and `test:ci`; run BE build and `test:ci`.
- [x] Confirm FE and BE GitHub Actions checks on the PR heads.
- [ ] Manually exercise persistence, rollback, reload, branch switching, non-owner fallback, and customer menu independence.

Verification note: FE encoding check, type-check, lint, and `test:ci` pass (lint reports 254 warnings and 0 errors); BE build and `test:ci` pass. Hosted GitHub Actions pass on FE PR head `3c9d35acb6b1d8e4464305afe8cb2dd26be2aac1` and BE PR head `90181faba1942989485a1d374d4124013d34ebd0`. The review fixed the ESM-incompatible `__dirname` usage in `vite.config.ts`. FE build still panics in Rolldown on this Windows environment, while the hosted Linux build passes. Production deployment jobs are skipped for PR events. Manual browser exercise remains outstanding.

**Acceptance:** Spec success criteria are met with no untranslated fixed owner-console strings or locale leakage across roles/accounts.

**Verify:** FE `npm run lint`, FE `npm run build`, and BE `npm run build`.

**Dependencies:** Tasks 1-5.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Shared components also render for restaurant admins | Locale could leak to roles outside scope | Provider returns `vi` unless the authenticated role is `RESTAURANT_OWNER` |
| Large set of nested components contains hard-coded copy | Incomplete language coverage | Inventory the owner render tree and run a fixed-copy review per tab |
| Cached preferences bleed across accounts | Wrong interface language after account switch | Key local cache by authenticated owner id and treat server value as authoritative |
| Owner preference gets mixed with customer menu locale | Owner changes could alter public menu language | Use a separate owner locale context and keep existing `menuLocale` state untouched |
| API persistence fails during selection | UI and server state diverge | Optimistic render with rollback and localized feedback |

## Progress

- [x] Feature branches created from current `main` in FE and BE.
- [x] Design and implementation plan written.
- [x] Backend persistence.
- [x] FE locale provider and settings selector.
- [x] Owner-console catalogs and screen migration.
- [x] Hosted FE and BE CI checks pass; local FE tests/lint/encoding and BE tests/build pass.
- [ ] Manual browser verification (the local Windows Vite build still panics in Rolldown).
