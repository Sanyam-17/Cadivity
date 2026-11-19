# Design Specification: Dashboards Engineering-Editorial Blueprint Unification & Centralized State System

**Date:** 2026-11-03  
**Status:** Approved by User  
**Author:** Senior System Designer (Cadivity Architecture)  
**Topic:** Dashboards Public Blueprint Styling Parity & Centralized 10-State Response Architecture  

---

## 1. Overview & Objectives

### 1.1 Goal
Unify all three dashboards (**Admin**, **Instructor**, and **Student**) under Cadivity's public **"Engineering-Editorial Blueprint"** design system, while introducing a robust, accessible, and centralized **10-State Response System** across page, section, table, card, and form interaction layers.

### 1.2 Non-Functional Invariants & Constraints
- **Design-System Parity Without Functional Rewrites**: All existing Prisma models, database queries, backend routes, authentication (`requireAuth`, `requireAdmin`, `requireInstructor`), session management (`authClient.useSession`), business logic, table filters, search, pagination, and forms MUST be preserved without functional disruption.
- **Single Visual Identity**: No unnecessary dark/light theme complexity. The Cadivity Engineering-Editorial Blueprint serves as the single unified visual brand identity.
- **Component Reusability**: Existing components will be visually aligned using CSS variables and utility classes, with dynamic views wrapped in the new state architecture.

---

## 2. Design Token & Visual System Architecture

### 2.1 Cadivity Public Blueprint Tokens
All dashboards will consume the public token definitions established in `app/globals.css`:

```css
/* Core Public Palette */
--cad-navy-950: #070B14;   /* Deep Blueprint Navy (canvas/headers/sidebars) */
--cad-cobalt:   #183F7F;   /* Primary Structural Blue */
--cad-sky:      #4AB8EA;   /* Technical Accent & Selection Sky */
--cad-teal:     #2A7A9B;   /* Secondary Structural Teal */
--cad-amber:    #F2A63B;   /* Primary Interactive Action / CTA */
--cad-cream:    #F4F0E8;   /* Warm Paper Canvas */
--cad-sand:     #E5E1DA;   /* Technical Grid Sand */
--cad-ice:      #D3E9EF;   /* Soft Ice Metric Highlight */
--cad-ink:      #0E1624;   /* High-Contrast Foreground Text */
--cad-muted:    #5B6B7F;   /* Secondary Technical Text */
--cad-hairline: rgba(14, 22, 36, 0.15); /* 1px Blueprint Border */
--cad-error:    #D64545;   /* Diagnostic Rust Red */
--cad-success:  #2E8B57;   /* Technical Verification Green */
```

### 2.2 Theme File Harmonization (`admin.css`, `instructor.css`, `student.css`)
- Remove legacy indigo/purple (`hsl(245 58% 52%)`) and bubbly radii (`rounded-2xl`, `rounded-[20px]`).
- Map `--background`, `--card`, `--border`, `--primary`, `--secondary`, and `--accent` to Cadivity Blueprint tokens:
  - Surface Background: `#F8F9FA` with `--cad-cream` / `--cad-sand` undertone.
  - Cards & Panels: `#FFFFFF` with `1px solid var(--cad-hairline)` and micro-radius (`2px` to `4px`).
  - Metric Eyebrows & Tags: JetBrains Mono (`font-mono`, `11px`, `tracking-[0.12em]`, uppercase).
  - Headings: Manrope (`font-display`, `font-bold`, tight tracking `-0.03em`).
  - Primary Action Buttons: Amber background (`#F2A63B`), navy text (`#070B14`), monospace uppercase.

### 2.3 Shared Dashboard Layout Components
- **`DashboardHero` (`components/shared/dashboard-hero.tsx`)**:
  - Deep Navy (`--cad-navy-950`) with subtle radial blueprint lighting.
  - JetBrains Mono uppercase eyebrow (`cad-eyebrow`).
  - Amber primary action button + hairline secondary outline button.
  - Micro-metric pills with JetBrains Mono numbers.
- **Sidebars & Navigation**:
  - Admin & Instructor sidebars styled with deep navy background, hairline divider (`rgba(255,255,255,0.12)`), and sky-blue active indicator pills.
  - Student top navigation unified with the same sharp geometric lines and blueprint identity.

---

## 3. Centralized State System Architecture (`@/components/shared/state/`)

### 3.1 Discriminated State Model
To eliminate conflicting booleans (`isLoading && isError && isEmpty`), state management uses a predictable discriminated union:

```typescript
// Explicit 10-State Taxonomy:
// 1. idle, 2. loading, 3. success, 4. empty, 5. error, 6. disabled, 7. pending, 8. offline,
// 9. unauthenticated (401), 10. forbidden / unauthorized (403)
// Recovery (Retry) is the operational self-healing mechanism for error/offline.
export type DashboardState =
  | { status: 'idle' }
  | { status: 'loading'; skeleton?: 'table' | 'card' | 'stat' | 'form' | 'detail'; count?: number }
  | { status: 'success'; dataFreshness?: Date; message?: string }
  | { status: 'empty'; title: string; description: string; actionLabel?: string; onAction?: () => void }
  | { status: 'error'; error: Error | string; code?: string | number; onRetry?: () => void; isRetrying?: boolean }
  | { status: 'disabled'; reason?: string }
  | { status: 'pending'; message?: string }
  | { status: 'offline'; onReconnect?: () => void }
  | { status: 'unauthorized'; type: 'unauthenticated' | 'forbidden'; roleRequired?: string; redirectUrl?: string };
```

### 3.2 Granular, Independent Component Responsibilities

1. **`<StateView>` (Master Orchestrator)**:
   - Evaluates the discriminated state.
   - Preserves previously rendered children during background refetches (stale-while-revalidate), overlaying a subtle non-blocking status indicator instead of blanking out content.
   - Enforces ARIA attributes (`aria-busy={status === 'loading' || status === 'pending'}`).

2. **`<EmptyState>`**:
   - Blueprint dashed hairline container (`border border-dashed border-[var(--cad-hairline)]`).
   - Technical icon, mono eyebrow, descriptive title/subtitle, and Amber action CTA (`cad-btn-amber`).

3. **`<ErrorState>`**:
   - Distinct from offline errors.
   - Cadivity Rust hairline alert (`bg-red-50/80 border-l-4 border-l-[#D64545] border-[var(--cad-hairline)]`).
   - Shows human-readable diagnosis + optional technical code badge (`ERR_QUERY_FAILED`).
   - Pairs with `<RetryButton>` invoking the exact failed operation without page reload.
   - Role: `role="alert"` and `aria-live="assertive"`.

4. **`<LoadingSkeleton>`**:
   - Blueprint grid shimmer matching component geometry (stat cards, table rows, course grid cards).
   - `aria-busy="true"` and `aria-label="Loading content..."`.

5. **`<OfflineBanner>`**:
   - Global network monitor mounted in dashboard layouts via `window.addEventListener('online')` and `'offline'`.
   - Distinguishes network disconnect from API 500s or timeouts.
   - Deep navy floating pill with sky-blue beacon.
   - Pauses non-idempotent mutations.
   - On reconnection, triggers auto-refresh **strictly for eligible queries**, never re-posting mutations.

6. **`<UnauthorizedNotice>`**:
   - Differentiates:
     - **401 Unauthenticated**: Session expired or missing login; provides a "Sign In" button returning to current URL.
     - **403 Forbidden**: Insufficient role permissions (e.g. Student attempting to access Admin route); provides a "Return to Dashboard" or "Switch Account" action.
   - `role="status"` and `aria-live="polite"`.

7. **`<PendingIndicator>` / `<PendingOverlay>`**:
   - For mutations and form submissions.
   - Informs screen readers (`aria-live="polite"`, `aria-busy="true"`).
   - Amber technical spinner with mono status (e.g. "SYNCING CATALOG...").

8. **`<DisabledWrapper>`**:
   - 40% opacity gating, `pointer-events-none`, and `aria-disabled="true"`.
   - Displays a mono tooltip or badge explaining why the control is locked and what prerequisite unlocks it.

9. **`<RetryButton>`**:
   - Dedicated Amber CTA button (`#F2A63B`).
   - Prevents duplicate/rapid retry spam using internal throttling/debounce.
   - Shows loading spinner when `isRetrying` is active.

---

## 4. State Transitions & Interaction Matrix

| Interaction Level | Target States & Behavior |
|---|---|
| **Page-Level** (e.g. `/dashboard/admin`) | Hero metrics, whole-dashboard offline banner, 401/403 authorization guard barrier, page-level loading shimmer. |
| **Section-Level** (e.g. Course Library list, Enrollment chart) | Independent section error recovery; if chart fails to load, stats and tables remain visible and functional. |
| **Table-Level** (e.g. Students table, Instructors table) | Loading skeleton rows matching column widths; Empty state when search/filter returns 0 items; localized inline error row with retry button; pagination preserved. |
| **Card-Level** (e.g. Student Course Card, Stat Card) | Micro-skeleton pulse during refresh; disabled status badge when course is locked; pending progress update indicator. |
| **Form-Level** (e.g. Course create form, Instructor edit) | Field-level validation errors; pending submit state with locked inputs; disabled save button when untouched or invalid; error recovery toast. |

---

## 5. Accessibility (a11y) & UX Engineering
- `aria-live="polite"` for non-critical updates (empty states, pending indicators, query success).
- `aria-live="assertive"` for critical failures (errors, connection drops).
- `aria-busy="true"` on elements undergoing active async loads.
- Full keyboard focusability (`tabIndex={0}`, focus rings in `--cad-sky` with `outline-offset: 2px`).
- Minimum touch/click target size: 44px on interactive controls.
- Color contrast ratio >= 4.5:1 against text and backgrounds across all states.

---

## 6. Implementation Stages & Verification Plan

### Phase 1: CSS Token Alignment
- Update `app/styles/admin.css`, `app/styles/instructor.css`, and `app/styles/student.css` to consume Cadivity public CSS variables.
- Standardize radius tokens to `2px - 4px` micro-geometry.

### Phase 2: Core State Primitives
- Create `components/shared/state/`:
  - `state-view.tsx`
  - `empty-state.tsx`
  - `error-state.tsx`
  - `loading-skeleton.tsx`
  - `offline-banner.tsx`
  - `unauthorized-notice.tsx`
  - `pending-indicator.tsx`
  - `disabled-wrapper.tsx`
  - `retry-button.tsx`
  - `index.ts`

### Phase 3: Layouts & Dashboard Harmonization
- Update `components/shared/dashboard-hero.tsx` with blueprint typography, styling, and amber CTA.
- Mount `<OfflineBanner />` in Admin, Instructor, and Student layout wrappers.
- Update Admin, Instructor, and Student main dashboard pages with `<StateView>` and blueprint styling.

### Phase 4: Sub-pages, Tables & Cards
- Update Admin sub-pages (`/courses`, `/instructors`, `/students`) with table skeletons, empty filters, and inline retry handlers.
- Update Instructor sub-pages (`/courses`) and preview cards.
- Update Student dashboard (`/dashboard/student`) continue-learning and course cards with blueprint tokens.

### Phase 5: Verification & Validation
- Verify compilation with Next.js build / TypeScript check.
- Validate each of the 10 states across page, section, table, card, and form contexts.
- Verify zero regression on existing APIs, database operations, and authentication guards.
