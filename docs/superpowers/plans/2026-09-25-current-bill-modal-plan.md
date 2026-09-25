# Current Bill Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inline current-bill summary with a responsive modal containing complete bill, session, order, item, and payment information.

**Architecture:** Keep bill fetching and payment orchestration in `RestaurantTablesTab`, but move bill presentation into a focused `CurrentBillModal` component. The table tab will store the full current-bill response so the modal can render `bill`, `session`, and `orders` without a second request.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, existing Base UI Dialog wrappers, lucide-react, Playwright.

## Global Constraints

- Reuse the existing Dialog, Button, Card, and icon components.
- Add no new dependency.
- Preserve `/api/bills/current` and `BillPaymentModal` behavior.
- Keep the modal responsive at 320, 768, 1024, and 1440px.
- Keep the existing no-bill toast and bill refresh behavior.

---

### Task 1: Add the modal behavior regression test

**Files:**
- Modify: `tests/owner-tables-layout.spec.ts:48-150`
- Test config: `playwright.owner-tables.config.ts`

**Interfaces:**
- Consumes the existing mocked `/api/bills/current` response.
- Produces assertions for the modal title, complete bill fields, and close behavior.

- [ ] **Step 1: Extend the mocked bill fixture**

Return a session, bill, one item, and one order from `/api/bills/current`, including `billCode`, `tableNumber`, `sessionCode`, `totalItems`, `subtotal`, `serviceFee`, `taxAmount`, and `totalAmount`.

- [ ] **Step 2: Write the failing modal test**

After clicking `Xem bill`, assert:

```ts
await expect(page.getByRole('dialog')).toBeVisible();
await expect(page.getByRole('heading', { name: 'Bill hiện tại · Bàn 10' })).toBeVisible();
await expect(page.getByText('Phở bò', { exact: true })).toBeVisible();
await expect(page.getByText('Chi tiết tiền')).toBeVisible();
await page.getByRole('button', { name: 'Đóng bill' }).click();
await expect(page.getByRole('dialog')).toBeHidden();
```

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```powershell
$env:E2E_BASE_URL = 'http://127.0.0.1:4177'
npx playwright test --config=playwright.owner-tables.config.ts -g "bill modal"
```

Expected: FAIL because the table tab currently renders an inline summary card and does not render a Dialog.

### Task 2: Build the focused CurrentBillModal component

**Files:**
- Create: `src/components/dashboard/restaurant/modals/CurrentBillModal.tsx`
- Reference: `src/components/ui/dialog.tsx`, `src/components/dashboard/restaurant/modals/QRPreviewModal.tsx`

**Interfaces:**
- Consumes `{ open, details, onOpenChange, onPay }` where `details` contains `{ bill: Bill; session: TableSession | null; orders: Order[] }`.
- Produces an accessible Dialog with `role="dialog"`, a labelled title, close action, complete bill information, and optional payment action.

- [ ] **Step 1: Define the props and formatting helpers**

Use the existing `Bill`, `Order`, `TableSession`, `BillStatus`, and `formatCurrency` types. Add local status and date formatters with safe fallbacks for missing session or order data.

- [ ] **Step 2: Implement the modal structure**

Use `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, and `DialogFooter`. Make the content `max-h-[90vh]`, keep the body `overflow-y-auto`, and add `scroll-mt` only to internal sections if needed.

- [ ] **Step 3: Render the complete bill view**

Render the bill header, session summary grid, item rows, order rows, financial breakdown, and responsive footer. Use text plus icons for status so color is not the only state signal.

- [ ] **Step 4: Run the focused test and verify the component renders**

The test remains RED until the table tab passes the full details object into the new component.

### Task 3: Wire modal state and payment flow into the table tab

**Files:**
- Modify: `src/components/dashboard/restaurant/RestaurantTablesTab.tsx:1-430`

**Interfaces:**
- `billService.getCurrentBill` remains the only current-bill fetch.
- `CurrentBillModal` receives the current response and an `onPay` callback.

- [ ] **Step 1: Replace selected bill state with full response state**

Store `CurrentBillResponse | null`, keep `orders` and `session`, and set it after a successful `getCurrentBill` call. Preserve the fallback toast when `result.bill` is null.

- [ ] **Step 2: Remove the inline bill summary and scroll behavior**

Delete the old card/ref/effect used to render the bill below the table. Render `CurrentBillModal` near `BillPaymentModal` instead.

- [ ] **Step 3: Connect modal payment and close behavior**

When `Thanh toán bill` is selected inside the modal, close the detail modal and open the existing `BillPaymentModal`. On success, clear the detail state and refresh tables.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the same Playwright command from Task 1. Expected: modal data and close assertions pass.

### Task 4: Verify responsive behavior and finish

**Files:**
- Modify: `tests/owner-tables-layout.spec.ts` only if a missing responsive assertion is discovered.

- [ ] **Step 1: Run all owner table browser tests**

```powershell
$env:E2E_BASE_URL = 'http://127.0.0.1:4177'
npx playwright test --config=playwright.owner-tables.config.ts
```

- [ ] **Step 2: Run the project checks**

```powershell
npm run test:ci
npm run build
npx eslint src/components/dashboard/restaurant/RestaurantTablesTab.tsx src/components/dashboard/restaurant/modals/CurrentBillModal.tsx tests/owner-tables-layout.spec.ts playwright.owner-tables.config.ts
```

- [ ] **Step 3: Review the diff and commit**

```powershell
git diff --check
git add src/components/dashboard/restaurant/RestaurantTablesTab.tsx src/components/dashboard/restaurant/modals/CurrentBillModal.tsx tests/owner-tables-layout.spec.ts
git commit -m "feat: show current bill in modal"
```
