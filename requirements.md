# Requirements & Audit - Ingredients Management Redesign

## 1. Audit of the Current Module

### Components Currently in Use
- **`RestaurantIngredientsTab.tsx`**: Renders the main dashboard for merchants, containing the page title, "Add Ingredient" button, filter toolbar, main data table, and pagination controls.
- **`SuperAdminIngredientsTab.tsx`**: Renders the global admin view, providing the same CRUD interface but scoped to system-level verified ingredients.
- **`IngredientModal.tsx`**: Renders the popup dialog containing the ingredient form (name, category, default unit, grams conversion, macros, micros, allergens).
- **`ingredientService.ts`**: Frontend API service wrapper handling communication with the Express backend.

### UI Library & Icons
- Built using **Tailwind CSS** (wrapped inside Vite + React environment).
- Utilizes Radix-based UI primitives (`@/components/ui/...`): Card, Button, Input, Select, Table, Dialog, DropdownMenu, Label.
- Uses **Lucide React** for icons (`Plus`, `Edit2`, `Trash2`, `Search`, `MoreHorizontal`, `Apple`, `ShieldCheck`, `UserCheck`, `RefreshCw`, `ChevronLeft`, `ChevronRight`).
- Uses **Sonner** for notifications.

### API Data Contracts
All payloads and queries interact with `/api/ingredients`:
- **List query**: `GET /api/ingredients?page=...&limit=...&search=...&category=...&type=...`
- **Creation**: `POST /api/ingredients` -> body containing Name, Category, Default Unit, Grams/Unit, Macros/Micros, Allergens.
- **Update**: `PATCH /api/ingredients/:id` -> body containing fields to update.
- **Deletion**: `DELETE /api/ingredients/:id`

### UX Pain Points & Flaws
- **Aesthetic Overload**: Single long scroll modal with all 7 numeric inputs for nutrition side-by-side, creating high cognitive friction.
- **Dry Table Layout**: Simple grid lacking visual hierarchy; macro information (`Protein/Carb/Fat`) is shown as flat numbers (`2.8g / 7g / 0.4g`).
- **Weak Visual Hierarchy**: Lack of color coding, icons, or prominent sections to separate basic data, nutrient info, and allergen warnings.
- **Lack of SaaS Feel**: Looks like a generic, plain back-office database CRUD admin tool rather than a premium, modern food intelligence dashboard.
- **Poor Empty State**: When no ingredients match or exist, a plain gray table cell is shown, which is unengaging and provides a poor onboarding path.
- **No Mobile Optimization**: Table columns shrink and overflow on mobile devices.

---

## 2. Redesign Objectives

### Phase 2: Premium Form Modal
- **Sizing**: Desktop width increased to `900px - 1000px` for a spacious feel.
- **Border Radius**: Large `24px` roundness.
- **Shadow**: Modern premium SaaS ambient drop shadow.
- **Navigation Tabs**:
  - **Tab 1: Basic Information**: Name, Category, Default Unit, and Grams conversion in a clean 2-column layout.
  - **Tab 2: Nutrition Cards**: 7 distinct, visually engaging cards for Calories, Protein, Carb, Fat, Fiber, Sugar, Sodium, each complete with custom emojis/icons, distinct borders, and specific inputs.
  - **Tab 3: Allergen Selector**: Accessible layout using modern selectable chips. Toggled allergens feature a soft green background, green border, and check icon.

### Phase 3: Premium Data Table
- Replace generic rows with beautiful, responsive rows.
- **Visual Nutrient Column**: Distinctly show Calories (e.g. `34 kcal`) and a secondary line for macros: `P:2.8 • C:7 • F:0.4` with bold indicators.
- **Visual Source Badges**:
  - `🟢 Hệ thống` (System)
  - `🔵 Nhà hàng` (Restaurant)
  - `🟣 Chủ nhà hàng` (Restaurant Owner)
- **Compact & Premium Action Menu**: Clean popovers/tooltips for View, Edit, and Delete actions.

### Phase 4: Modern Toolbar
- Spacious search bar on the left.
- Sophisticated filters for Category, Source, and a clean Refresh button on the right.

### Phase 5: Delightful Empty State
- Engaging illustration/emoji (🥦).
- Helpful copywriting instructing users to register their first ingredient.
- Direct Call-to-Action button to open the creation modal.

### Phase 6: Mobile Responsiveness
- Collapses table rows into structured card lists on viewport sizes below `768px`.
- Form modal becomes a sleek full-screen sheet on mobile.
- Nutrition grid wraps automatically to 2 columns on mobile.

### Phase 7: Optimization & Performance
- Prevent unnecessary re-renders using optimized React hooks (`useCallback`, `useMemo`).
- Limit fetches to filter transitions and pagination clicks.
