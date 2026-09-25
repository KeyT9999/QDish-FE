# Owner tables UI redesign

## Status

Approved by the user on 2026-09-25.

## Goal

Fix horizontal overflow on `/owner?tab=tables` and make table management easier to scan and operate without changing routes, APIs, or billing behavior.

## Design read

This is a restaurant-owner operations console, not a marketing page. The visual direction is status-first, compact, calm, and action-oriented, using the existing neutral and emerald palette.

The taste skill is applied selectively. Its landing-page and GSAP requirements are out of scope for this dense product table. The applicable parts are audit-first redesign, consistent spacing, clear hierarchy, responsive collapse, intentional motion, and accessible controls.

## Root cause

The desktop table reserves `340px` for actions, but the QR, view-bill, and payment buttons plus their gaps require more space. The long order URL also participates in the table's minimum-content sizing. Because the component only switches to cards below `640px`, tablet and smaller desktop widths can still overflow.

## Chosen approach

- Keep the table for screens at least `1024px` wide.
- Use status cards below `1024px` so tablet and mobile never depend on horizontal scrolling.
- Keep one compact QR action visible on desktop and move secondary actions into a menu.
- Use a two-column action grid on compact cards, with each control at least `44px` high.
- Add a small status summary for vacant, occupied, and payment-pending tables.
- Render a shortened order URL while preserving the complete value in the title attribute.
- Preserve existing callbacks, API calls, modal behavior, labels, and route structure.

## Visual system

- One light theme using the existing neutral background and emerald accent.
- Existing soft radius scale, with restrained borders and shadows.
- Status is conveyed by text plus an icon, never color alone.
- Motion is limited to hover, active, and menu feedback. No scroll animation is needed.
- Existing `lucide-react` icons are retained because the project already depends on them.

## Acceptance criteria

1. At viewport widths `320px`, `768px`, `1024px`, and `1440px`, the page has no horizontal document overflow caused by the tables tab.
2. At widths below `1024px`, every table is fully readable as a card and actions do not wrap into clipped controls.
3. At widths at least `1024px`, the table actions fit within the content canvas without a horizontal scrollbar.
4. QR preview, bill viewing, payment, table syncing, loading states, empty states, and payment refresh continue to work.
5. The page builds and lint checks without new dependencies or console errors.
