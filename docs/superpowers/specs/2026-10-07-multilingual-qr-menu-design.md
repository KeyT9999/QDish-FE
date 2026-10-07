# Multilingual QR Menu — Design

**Status:** Draft for user review
**Date:** 2026-10-07
**Owner:** QDish product and engineering

## Goal

Let a guest read and order from a restaurant menu in Vietnamese, English, or Simplified Chinese. Restaurant staff can generate English and Chinese drafts with xKiro and Qwen3.8 Max, edit them, and approve them before guests see them.

## Current project context

- The backend stores one Vietnamese `name`, `description`, and `category` on each MenuItem. Category names also live in a separate Category collection.
- Public menu and category reads are unauthenticated. The dashboard currently uses the same menu read route to load unavailable items.
- The customer menu, cart, and menu components contain Vietnamese-only strings. The project has no general-purpose frontend i18n framework.
- Order submission sends menu item IDs and quantities. The backend stores the canonical Vietnamese item name on the order, which lets staff continue to work in Vietnamese.

## Product decisions

1. Supported guest locales are `vi`, `en`, and `zh-CN`; Chinese means Simplified Chinese.
2. Vietnamese remains the canonical source language. AI creates English and Simplified Chinese drafts.
3. A guest can change language from a visible selector. The selection is saved per restaurant in browser storage. New visitors default to Vietnamese.
4. The first release has one-item and one-category translation actions. Bulk translation is out of scope.
5. A restaurant owner/admin reviews and edits each generated translation before publishing it. Guests only receive approved translations.
6. If a translation is missing or stale, the guest sees Vietnamese for that text.
7. Translate the guest ordering flow's interface labels with a small local dictionary. The owner dashboard remains Vietnamese.
8. Do not use AI to create or change allergen, ingredient, nutrition, or food-safety claims. Localize their fixed labels from application dictionaries while keeping the underlying codes and data unchanged.
9. AI calls happen only from the management interface. Guest menu reads never incur model calls.

## Data model

MenuItem keeps its current Vietnamese fields and gains `en` and `zhCN` locale entries. Each locale entry has an optional approved value containing `name`, `description`, and status `APPROVED` or `STALE`, plus an optional draft value containing editable `name`, `description`, and generation time.

Category keeps its Vietnamese `name` and gains locale entries with an optional approved `name` and an optional draft `name`. Category translations live on Category so labels stay consistent across every dish in that category.

The dashboard derives the display state `DRAFT` when a draft exists; otherwise it shows the approved value's state. Generating a replacement draft never removes the current approved value. Publishing promotes the draft to the approved value and clears the draft. Editing the Vietnamese MenuItem name/description or Category name marks the approved value `STALE` and clears any draft. Stale text is not served publicly.

The public API returns a locale's approved text only when its approved state is `APPROVED`. Protected management reads include the approved value, draft value, and derived display state so the owner can compare, edit, and publish them.

Public item translations have the shape `translations.en = { name, description }` and `translations.zhCN = { name, description }`; public category translations contain `{ name }`. Unavailable locales are omitted. Management responses use the separate `{ approved?, draft?, displayStatus }` shape. Keeping these response types distinct makes draft publication state unavailable to guests by construction.

## Interaction design

### Visual direction

- Use UI UX Pro Max's mobile-first, focused layout guidance for the guest selector and translation editor. Keep controls compact and content-led so they fit the existing menu and dashboard flows.
- Retain the existing QDish green/warm-neutral palette and Inter/Outfit type tokens in `src/index.css`; the generated red/gold and Playfair suggestions would conflict with the established product identity.
- Use existing semantic components, visible keyboard focus, readable contrast, and short color transitions. Respect reduced-motion preferences and check narrow mobile through desktop layouts.

### Restaurant dashboard

- Keep the Vietnamese source fields as the primary dish/category form. Put English and Simplified Chinese in clearly labeled adjacent sections or tabs.
- For a saved dish or category, “AI dịch” generates both target-language drafts and opens them in editable fields. Disable the action while the record is unsaved, while a request is running, or when xKiro is unavailable.
- Provide separate “Lưu nháp” and “Duyệt & xuất bản” actions. Saving edited text keeps it private. Publishing explicitly promotes that locale's edited draft.
- Show a draft-pending indicator alongside the currently published version when both exist, with helper text that the current approved version remains visible to guests until the new draft is published.
- Show provider, validation, and save errors beside the translation editor with a retry path. A failed generation must leave stored draft and approved values untouched.

### Guest QR menu

- Place a compact VI / EN / 中文 selector near the restaurant name and table badge, accessible on narrow mobile screens.
- Changing language updates the menu in place and persists the choice for that restaurant. The first visit starts in Vietnamese.
- Translate menu/category text and guest controls, including search, cart, checkout, fixed allergen labels, and order history. Keep currency in VND and format it for the selected locale.
- If a text has no approved translation, show its Vietnamese source. Keep category selection and menu item identity keyed by canonical IDs.

## API and AI flow

- `GET /api/menu?restaurantId=...` and `GET /api/categories?restaurantId=...` remain public and return Vietnamese source fields plus approved translations only. Public `translations` values are plain text objects; omit status, draft, and stale values entirely.
- Add protected management reads for the dashboard: `GET /api/menu/manage` and `GET /api/categories/manage`. They require an authenticated restaurant owner/admin, derive restaurant scope from the authenticated identity, and return translation statuses. They do not trust a client-supplied restaurant ID.
- Add `POST /api/menu/:id/translations/draft` and `POST /api/categories/:id/translations/draft`. Each looks up the source record using the authenticated restaurant scope, calls xKiro, validates the result, and saves drafts.
- Add locale-specific update/approval routes for MenuItem and Category. Saving edited text without publishing leaves it as `DRAFT`; an explicit publish action marks it `APPROVED`.
- Use xKiro's OpenAI-compatible Chat Completions endpoint at `https://api.xkiro.com/v1/chat/completions`. The default model ID is `qwen/qwen3.8-max`; `XKIRO_MODEL_ID` can override it. `XKIRO_API_KEY` stays in backend environment configuration and is never sent to the browser.
- The generation prompt asks for strict JSON, natural menu wording, preservation of proper dish names where useful, and no invented ingredients or claims. Validate the response shape before writing any draft. A provider or parse failure leaves stored translations unchanged.
- Only public menu content is sent to xKiro. Do not include customer data, order history, or private restaurant data in prompts.

## Guest experience

The language selector is available on the QR menu. The selected language controls menu item names and descriptions, category labels, search text, cart item labels, and guest ordering interface strings. Currency remains VND and is formatted with the selected locale.

The guest menu resolves each field in this order: approved selected-language translation, Vietnamese source value. Category filtering uses the canonical category ID so translated labels do not alter filtering behavior.

Order submission continues to send item IDs and quantities only. The backend keeps the Vietnamese item-name snapshot for kitchen and staff views. Existing order history can display a translated name when the corresponding menu item is available locally; otherwise it falls back to the Vietnamese order snapshot.

## Security, errors, and operations

- Draft generation, management reads, edits, and publication require `RESTAURANT_OWNER` or `RESTAURANT_ADMIN`.
- Every management read/write query scopes records by the restaurant resolved from the authenticated identity. A client-supplied restaurant ID cannot grant cross-restaurant access.
- Public serializers strip `DRAFT` and `STALE` text even when those fields exist in MongoDB.
- Missing xKiro configuration returns a clear server error without exposing configuration values. Provider failures and invalid JSON do not save partial results. Logs contain request IDs and safe error codes, not API keys or full prompts.
- The production backend must receive `XKIRO_API_KEY` as a secret before the AI action is enabled. A per-key spending limit should be configured in xKiro.
- No new frontend or backend dependency is required; the backend can use Node's native fetch and the frontend can use a typed local dictionary.

## Acceptance criteria

- A guest can switch among VI, EN, and Simplified Chinese; the choice persists for that restaurant.
- Approved translations appear in the matching menu, category, item detail, and cart views. Missing/stale translations fall back to Vietnamese.
- The owner/admin can generate, edit, save as draft, and explicitly approve each dish/category translation.
- Public endpoints never return draft or stale translation text. Cross-restaurant translation operations are denied.
- Provider errors, invalid model output, and missing server configuration do not overwrite existing translations.
- Orders still contain canonical Vietnamese names for staff and kitchen views.
- AI translation does not create or alter allergen and nutrition data.
- The guest-facing menu and ordering controls needed to select language and place an order are understandable in all three supported locales.

## Known risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Dish names can be culturally specific and literal translations can be confusing. | Keep Vietnamese source visible in the review form; owner edits before approval; instruct the model to preserve proper names. |
| A source edit can make a published translation inaccurate. | Mark affected translation entries stale and fall back to Vietnamese until reviewed again. |
| A public endpoint could accidentally expose drafts. | Separate protected management reads from public reads and test serializers directly. |
| Provider outage or malformed output interrupts translation. | Validate before persistence; preserve the prior translation and show a retryable UI error. |
| A key leak or uncontrolled spend creates account exposure. | Store the key only on the backend, use a dedicated xKiro key with a monthly spend cap, and never log the key. |

## Scope exclusions

- Automatic translation on every guest menu request.
- Bulk translation of all restaurant menus in one action.
- Full localization of the owner dashboard or staff dashboard.
- AI-generated ingredient, allergen, nutrition, or health claims.
- Changes to order pricing, order payload semantics, payment, or kitchen workflow.
