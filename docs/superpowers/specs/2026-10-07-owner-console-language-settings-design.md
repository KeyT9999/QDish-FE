# Spec: Owner Console Language Settings

## Objective

Let a restaurant owner use the QDish management console in Vietnamese, English, or Simplified Chinese. The selected language is an account preference, takes effect immediately, and is restored on the owner's next login or device. This language preference is independent from customer-facing menu translations.

## Users and Scope

- In scope: `RESTAURANT_OWNER` accounts and the console screens rendered for that role.
- In scope: the sidebar, workspace header and breadcrumbs, owner home, billing, notifications, restaurant management tabs, settings, forms, dialogs, empty/loading/error states, and interface-generated feedback.
- Out of scope: `RESTAURANT_ADMIN`, `STAFF`, `SUPER_ADMIN`, public/customer menu language, automatic translation of restaurant-entered data, and translation of names or business content returned by APIs.

## User Behavior

1. An owner opens the existing **Thiết lập** screen and sees a **Ngôn ngữ giao diện** preference with three native-name options: **Tiếng Việt**, **English**, **简体中文**.
2. Choosing an option updates all fixed console copy immediately without a page reload.
3. The choice is saved to the authenticated owner account, not the currently selected restaurant. It remains the same after branch switching, logout/login, or using another device.
4. Existing users without a stored preference use Vietnamese.
5. If saving fails, restore the previous language and show an error in that previous language. If loading the preference fails, render Vietnamese and allow a later change.
6. Restaurant names, owner names, dish names/descriptions, prices, notification content, and other business data remain as stored. Customer menu language remains separately controlled by its existing menu selector.

## Architecture

- Backend: add `preferredLanguage` to the Mongo `User` document with the supported values `vi`, `en`, and `zh-CN`, defaulting to `vi` for existing and new users.
- Backend API: `GET /api/auth/preferences` returns `{ preferredLanguage }`; `PATCH /api/auth/preferences` accepts `{ preferredLanguage }` and returns the saved value. Both require authentication and the `RESTAURANT_OWNER` role. Invalid values return HTTP 400; non-owners receive HTTP 403.
- Frontend: add an owner-console locale context and statically maintained, typed catalogs. The context is active only for owners; other roles resolve to Vietnamese. No runtime machine translation or external translation service is used.
- Frontend API contract:

```ts
type OwnerConsoleLanguage = 'vi' | 'en' | 'zh-CN';
type OwnerConsolePreference = { preferredLanguage: OwnerConsoleLanguage };
```

- Translation calls use stable keys and optional named interpolation values. Every catalog has the same key set so missing EN/ZH copy fails type checking rather than silently shipping untranslated UI.
- Locale state is scoped by authenticated owner id. A cached value may initialize the console while the server preference loads, but server state is authoritative and cache keys must not cross accounts.
- Set `document.documentElement.lang` to `vi`, `en`, or `zh-CN` while the owner console is active; restore the previous document language outside it.

## UI and Accessibility

- Add a distinct account-preference section to the existing settings screen; keep restaurant profile, email/security, and payment settings intact.
- Use the existing emerald, white, and neutral console tokens; show the three language names in their native scripts.
- Use labeled, keyboard-operable radio/select controls, visible selected and pending states, focus styles, and an announced save/error result. The layout must fit mobile widths without horizontal scrolling.
- Language change must not move the owner to another tab or restaurant.

## Formatting

- Keep monetary values in Vietnamese đồng; localize number/date presentation only where shared formatter APIs can do so without changing the underlying value.
- Never translate user-entered values or infer locale from restaurant/customer menu language.

## Commands and Verification

- Frontend build: `npm run build`
- Frontend lint: `npm run lint`
- Backend build: `npm run build`
- Manual flow: authenticate as an owner, switch VI → EN → ZH, verify sidebar, current page, settings, reload persistence, branch switch persistence, and save failure rollback; then verify non-owner roles stay Vietnamese and customer menu selector remains independent.

## Boundaries

- Always: validate the language at the API boundary; authorize by authenticated user role; preserve existing data and customer menu locale behavior; provide Vietnamese fallback.
- Ask first: adding a third-party localization dependency or expanding localization to non-owner roles/customer flows.
- Never: store an API key for translation, call an AI translation API at runtime, translate user content, or accept a user id from the request body as the preference owner.

## Success Criteria

- Owners can choose and persist all three supported languages.
- Fixed copy throughout the owner console follows the selected language after the next render, including nested management views and their interface feedback.
- Existing owners with no value remain in Vietnamese.
- Non-owner roles and customer-facing menu language behavior are unchanged.
- API rejects unsupported language values and non-owner updates.
- Lint and build pass in both repositories.

## Assumptions

- The preference belongs to the owner account, not a restaurant or branch.
- Vietnamese is the default for existing accounts and for a failed preference read.
- Interface translations are reviewed static copy, not generated per session.
