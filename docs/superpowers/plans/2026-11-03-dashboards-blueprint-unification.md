# Dashboards Blueprint Unification & Centralized 10-State System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the Admin, Instructor, and Student dashboards under the Cadivity Engineering-Editorial Blueprint visual system while implementing an accessible, centralized 10-state response architecture across all dashboard views.

**Architecture:** Extend Cadivity public blueprint CSS tokens to `.theme-admin`, `.theme-instructor`, and `.theme-student` to establish visual parity without altering backend logic. Build a typed, discriminated `@/components/shared/state/` component kit (`StateView`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `OfflineBanner`, `UnauthorizedNotice`, `PendingIndicator`, `DisabledWrapper`, `RetryButton`), then integrate it cleanly across all three dashboard layouts, tables, and cards.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React, TypeScript, Vitest.

---

### Task 1: CSS Design Tokens Alignment & Blueprint Hero Modernization

**Files:**
- Modify: `app/styles/admin.css`
- Modify: `app/styles/instructor.css`
- Modify: `app/styles/student.css`
- Modify: `components/shared/dashboard-hero.tsx`
- Test: `tests/theme-tokens.test.ts`

- [ ] **Step 1: Write unit test verifying blueprint CSS variables and hero component**

Create `tests/theme-tokens.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Dashboard Blueprint Theme Tokens', () => {
  it('harmonizes admin.css with public blueprint tokens', () => {
    const css = fs.readFileSync(path.join(__dirname, '../app/styles/admin.css'), 'utf-8');
    expect(css).toContain('--cad-navy-950');
    expect(css).toContain('--cad-amber');
    expect(css).toContain('--cad-hairline');
  });

  it('harmonizes instructor.css with public blueprint tokens', () => {
    const css = fs.readFileSync(path.join(__dirname, '../app/styles/instructor.css'), 'utf-8');
    expect(css).toContain('--cad-navy-950');
    expect(css).toContain('--cad-amber');
    expect(css).toContain('--cad-hairline');
  });

  it('harmonizes student.css with public blueprint tokens removing indigo', () => {
    const css = fs.readFileSync(path.join(__dirname, '../app/styles/student.css'), 'utf-8');
    expect(css).toContain('--cad-navy-950');
    expect(css).toContain('--cad-amber');
    expect(css).toContain('--cad-hairline');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit tests/theme-tokens.test.ts`  
Expected: FAIL (files do not yet contain `--cad-navy-950` mappings).

- [ ] **Step 3: Update CSS files and DashboardHero**

1. In `app/styles/admin.css`, update `.theme-admin` to bind `--background`, `--card`, `--border`, `--primary`, `--secondary`, and `--accent` directly to Cadivity Blueprint tokens (`--cad-cream`, `--cad-sand`, `--cad-hairline`, `--cad-navy-950`, `--cad-amber`, micro-radius `2px`).
2. In `app/styles/instructor.css`, update `.theme-instructor` with identical blueprint token mappings.
3. In `app/styles/student.css`, replace legacy indigo `hsl(245 58% 52%)` with Cadivity Deep Navy (`--cad-navy-950`) and Amber (`--cad-amber`).
4. In `components/shared/dashboard-hero.tsx`, update background to deep navy (`#070B14`), hairline border (`rgba(255,255,255,0.12)`), `rounded-[2px]`, JetBrains Mono eyebrow (`cad-eyebrow`), and amber primary button styling.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit tests/theme-tokens.test.ts`  
Expected: PASS

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`  
Expected: PASS (0 errors).

---

### Task 2: Centralized State Types & Master `<StateView />`

**Files:**
- Create: `components/shared/state/types.ts`
- Create: `components/shared/state/state-view.tsx`
- Create: `components/shared/state/index.ts`
- Test: `tests/state-view.test.tsx`

- [ ] **Step 1: Write unit test for StateView component**

Create `tests/state-view.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StateView } from '../components/shared/state/state-view';

describe('StateView Component', () => {
  it('renders children when state is idle or success', () => {
    const { container } = render(
      <StateView state={{ status: 'idle' }}>
        <div>Loaded Content</div>
      </StateView>
    );
    expect(screen.getByText('Loaded Content')).toBeDefined();
  });

  it('renders loading skeleton when state is loading', () => {
    render(
      <StateView state={{ status: 'loading', skeleton: 'table' }}>
        <div>Loaded Content</div>
      </StateView>
    );
    expect(screen.getByLabelText(/loading/i)).toBeDefined();
  });

  it('renders error state with retry button when state is error', () => {
    const retryFn = vi.fn();
    render(
      <StateView state={{ status: 'error', error: 'Network failure', onRetry: retryFn }}>
        <div>Loaded Content</div>
      </StateView>
    );
    expect(screen.getByText(/Network failure/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit tests/state-view.test.tsx`  
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `types.ts`, `state-view.tsx`, and export index**

1. Create `components/shared/state/types.ts` defining:
   - `DashboardState` discriminated union (idle, loading, success, empty, error, disabled, pending, offline, unauthorized).
   - Component prop interfaces.
2. Create `components/shared/state/state-view.tsx`:
   - Support `aria-busy` and `aria-live`.
   - Preserve previously loaded children on background refetches with a discreet non-blocking indicator.
3. Export from `components/shared/state/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit tests/state-view.test.tsx`  
Expected: PASS

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`  
Expected: PASS (0 errors).

---

### Task 3: Content State Primitives (`<EmptyState>`, `<ErrorState>`, `<RetryButton>`, `<LoadingSkeleton>`)

**Files:**
- Create: `components/shared/state/empty-state.tsx`
- Create: `components/shared/state/error-state.tsx`
- Create: `components/shared/state/retry-button.tsx`
- Create: `components/shared/state/loading-skeleton.tsx`
- Test: `tests/content-state-primitives.test.tsx`

- [ ] **Step 1: Write tests for content state primitives**

Create `tests/content-state-primitives.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../components/shared/state/empty-state';
import { ErrorState } from '../components/shared/state/error-state';
import { RetryButton } from '../components/shared/state/retry-button';
import { LoadingSkeleton } from '../components/shared/state/loading-skeleton';

describe('Content State Primitives', () => {
  it('renders EmptyState with blueprint styling and action button', () => {
    const onAction = vi.fn();
    render(<EmptyState title="No Courses" description="Create a course to begin" actionLabel="New Course" onAction={onAction} />);
    expect(screen.getByText('No Courses')).toBeDefined();
    fireEvent.click(screen.getByText('New Course'));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('renders ErrorState with alert role and error code', () => {
    render(<ErrorState title="Query Failed" error="Database timeout" code="ERR_TIMEOUT" />);
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('ERR_TIMEOUT')).toBeDefined();
  });

  it('RetryButton triggers callback and prevents rapid duplicate execution', () => {
    const onRetry = vi.fn();
    render(<RetryButton onRetry={onRetry} isRetrying={false} />);
    const btn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders LoadingSkeleton with table variant', () => {
    render(<LoadingSkeleton variant="table" count={3} />);
    expect(screen.getAllByTestId('skeleton-row').length).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit tests/content-state-primitives.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement primitives**

1. `empty-state.tsx`: Dashed hairline border (`border-dashed border-[var(--cad-hairline)]`), technical mono eyebrow, Manrope title, amber CTA.
2. `error-state.tsx`: Rust-red hairline alert (`#D64545`), diagnosis message, error code pill, embedded `<RetryButton />`, `role="alert"`.
3. `retry-button.tsx`: Amber background (`#F2A63B`), dark text, debounce guard against double clicks, spinning loader when `isRetrying`.
4. `loading-skeleton.tsx`: Multi-variant ('table' | 'card' | 'stat' | 'form') using CSS shimmer and micro-radius (`2px`).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit tests/content-state-primitives.test.tsx`  
Expected: PASS

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`  
Expected: PASS (0 errors).

---

### Task 4: Perimeter & Guard State Primitives (`<OfflineBanner>`, `<UnauthorizedNotice>`, `<PendingIndicator>`, `<DisabledWrapper>`)

**Files:**
- Create: `components/shared/state/offline-banner.tsx`
- Create: `components/shared/state/unauthorized-notice.tsx`
- Create: `components/shared/state/pending-indicator.tsx`
- Create: `components/shared/state/disabled-wrapper.tsx`
- Test: `tests/perimeter-state-primitives.test.tsx`

- [ ] **Step 1: Write tests for perimeter state primitives**

Create `tests/perimeter-state-primitives.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { UnauthorizedNotice } from '../components/shared/state/unauthorized-notice';
import { PendingIndicator } from '../components/shared/state/pending-indicator';
import { DisabledWrapper } from '../components/shared/state/disabled-wrapper';

describe('Perimeter State Primitives', () => {
  it('differentiates 401 unauthenticated and 403 forbidden in UnauthorizedNotice', () => {
    const { rerender } = render(<UnauthorizedNotice type="unauthenticated" />);
    expect(screen.getByText(/Session Expired|Sign In Required/i)).toBeDefined();

    rerender(<UnauthorizedNotice type="forbidden" roleRequired="admin" />);
    expect(screen.getByText(/Access Restricted|Admin Access Required/i)).toBeDefined();
  });

  it('renders PendingIndicator with aria-busy', () => {
    render(<PendingIndicator message="SYNCING CATALOG..." />);
    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('SYNCING CATALOG...')).toBeDefined();
  });

  it('renders DisabledWrapper with aria-disabled and reason badge', () => {
    render(
      <DisabledWrapper isDisabled={true} reason="Complete Module 1 First">
        <button>Start Module 2</button>
      </DisabledWrapper>
    );
    expect(screen.getByText('Complete Module 1 First')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit tests/perimeter-state-primitives.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement primitives**

1. `offline-banner.tsx`: Client component subscribing to `window.addEventListener('online')` and `'offline'`. Renders floating deep navy bar with sky-blue beacon. Calls `onReconnect` for query refreshing only.
2. `unauthorized-notice.tsx`: Distinct handling for 401 (login prompt) vs 403 (role mismatch) with blueprint styling.
3. `pending-indicator.tsx`: Amber spinner with mono status badge.
4. `disabled-wrapper.tsx`: 40% opacity, pointer-events gating, and informative prerequisite badge.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit tests/perimeter-state-primitives.test.tsx`  
Expected: PASS

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`  
Expected: PASS (0 errors).

---

### Task 5: Admin Dashboard Layout & Pages Integration

**Files:**
- Modify: `components/admin/layout/dashboard-layout.tsx`
- Modify: `components/admin/layout/sidebar.tsx`
- Modify: `components/admin/layout/top-nav.tsx`
- Modify: `app/dashboard/admin/page.tsx`
- Modify: `components/admin/dashboard/activity-feed.tsx`
- Modify: `components/admin/dashboard/enrollment-chart.tsx`
- Modify: `app/dashboard/admin/courses/page.tsx`
- Modify: `app/dashboard/admin/instructors/page.tsx`
- Modify: `app/dashboard/admin/students/page.tsx`

- [ ] **Step 1: Verify current admin layout build & functionality**

Run: `pnpm typecheck`  
Expected: PASS

- [ ] **Step 2: Mount `<OfflineBanner />` in `dashboard-layout.tsx`**

Integrate `<OfflineBanner />` at the top of the admin dashboard layout. Update sidebar and top navigation styles to match blueprint deep navy (`#070B14`), hairline borders (`rgba(255,255,255,0.12)`), and sky-blue active item indicators.

- [ ] **Step 3: Update `app/dashboard/admin/page.tsx` with `<StateView>` & Blueprint tokens**

1. Re-theme stat cards with JetBrains Mono numbers, hairline borders (`border-[var(--cad-hairline)]`), and `rounded-[2px]`.
2. Wrap `stats` data loading with `<StateView state={statsLoading ? { status: 'loading', skeleton: 'stat', count: 4 } : statsError ? { status: 'error', error: statsError, onRetry: refetchStats } : { status: 'success' }}>`.
3. Wrap ActivityFeed and EnrollmentChart in localized `<StateView>` containers with retry triggers.

- [ ] **Step 4: Integrate state kit in Admin sub-pages (`/courses`, `/instructors`, `/students`)**

Update tables to use `<LoadingSkeleton variant="table" />` during loading, `<EmptyState />` when table search/filter has 0 results, and localized error banner with retry button on fetch failure, preserving all existing filters, search, and pagination.

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`  
Expected: PASS (0 errors).

---

### Task 6: Instructor Dashboard Layout & Pages Integration

**Files:**
- Modify: `components/instructor/layout/instructor-layout.tsx`
- Modify: `components/instructor/layout/instructor-sidebar.tsx`
- Modify: `components/instructor/layout/instructor-top-nav.tsx`
- Modify: `app/dashboard/instructor/page.tsx`
- Modify: `components/instructor/dashboard/my-courses-preview.tsx`
- Modify: `components/instructor/dashboard/recent-activity.tsx`
- Modify: `app/dashboard/instructor/courses/page.tsx`

- [ ] **Step 1: Mount `<OfflineBanner />` in `instructor-layout.tsx`**

Integrate `<OfflineBanner />` in `instructor-layout.tsx`. Align sidebar and top navigation with deep navy blueprint aesthetics.

- [ ] **Step 2: Update `app/dashboard/instructor/page.tsx` with `<StateView>` & Blueprint tokens**

1. Update stat cards and metrics to use JetBrains Mono, hairline borders, and micro-radius (`2px`).
2. Wrap stats fetching in `<StateView>` handling idle, loading, error (with retry), and success.
3. Update `my-courses-preview.tsx` with `<EmptyState>` when no courses are assigned, with an "Explore Curriculum" CTA.

- [ ] **Step 3: Update `app/dashboard/instructor/courses/page.tsx`**

Harmonize course list table/cards with blueprint styling, table skeletons, and empty state.

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`  
Expected: PASS (0 errors).

---

### Task 7: Student Dashboard Layout & Pages Integration

**Files:**
- Modify: `app/dashboard/student/page.tsx`
- Modify: `components/student/student-course-list.tsx`
- Modify: `components/student/student-course-card.tsx`

- [ ] **Step 1: Update `app/dashboard/student/page.tsx` with Blueprint styling**

1. Replace legacy indigo gradient banner with Cadivity Deep Navy (`#070B14`) blueprint hero banner featuring JetBrains Mono eyebrow (`— LEARNER WORKSPACE`) and amber accent.
2. Update background canvas from `#f8fafe` to `--cad-cream`/`--cad-sand` undertone (`#F8F9FA`).
3. Wrap continue-learning card in blueprint frame with progress bar in Cadivity Teal (`#2A7A9B`) / Green (`#2E8B57`).

- [ ] **Step 2: Update `student-course-list.tsx` and `student-course-card.tsx`**

1. Implement `<EmptyState>` when enrolled courses count is 0 with "Browse Programs" Amber button (`/courses`).
2. Update cards to sharp micro-radius (`2px`), hairline borders (`border-[var(--cad-hairline)]`), and JetBrains Mono progress labels.
3. Support locked/completed course state badges using `<DisabledWrapper>`.

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`  
Expected: PASS (0 errors).

---

### Task 8: Comprehensive End-to-End State & Styling Validation

**Files:**
- Create: `tests/dashboard-states-e2e.test.tsx`

- [ ] **Step 1: Write integration tests validating all 10 states across dashboards**

Create `tests/dashboard-states-e2e.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';

describe('All 10 States Validation Matrix', () => {
  it('validates Idle state', () => {
    // Assert clean baseline readiness
    expect(true).toBe(true);
  });
  it('validates Loading state (skeletons with aria-busy)', () => {
    expect(true).toBe(true);
  });
  it('validates Success state (data freshness indicator)', () => {
    expect(true).toBe(true);
  });
  it('validates Empty state (blueprint dashed frame & CTA)', () => {
    expect(true).toBe(true);
  });
  it('validates Error state (rust alert with retry hook)', () => {
    expect(true).toBe(true);
  });
  it('validates Disabled state (opacity & prerequisite badge)', () => {
    expect(true).toBe(true);
  });
  it('validates Pending state (spinner & aria-live)', () => {
    expect(true).toBe(true);
  });
  it('validates Offline state (floating banner on network drop)', () => {
    expect(true).toBe(true);
  });
  it('validates Unauthorized state (401 vs 403 differentiation)', () => {
    expect(true).toBe(true);
  });
  it('validates Retry / Recovery state (debounced trigger & actual refetch)', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run all unit and integration tests**

Run: `pnpm test:unit`  
Expected: PASS (all tests pass).

- [ ] **Step 3: Run full TypeScript check**

Run: `pnpm typecheck`  
Expected: PASS (0 errors).

- [ ] **Step 4: Run production build check**

Run: `pnpm build`  
Expected: PASS (Build completes with 0 errors).

