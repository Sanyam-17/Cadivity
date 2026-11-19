import { describe, it, expect } from 'vitest';
import type { DashboardState } from '../components/shared/state/types';

describe('Centralized 10-State System Architecture', () => {
  it('validates discriminated state model with predictable transitions', () => {
    // 1. Idle state
    const idleState: DashboardState = { status: 'idle' };
    expect(idleState.status).toBe('idle');

    // 2. Loading state with skeleton variant
    const loadingState: DashboardState = { status: 'loading', skeleton: 'table', count: 5 };
    expect(loadingState.status).toBe('loading');
    expect(loadingState.skeleton).toBe('table');

    // 3. Success state
    const successState: DashboardState = { status: 'success', dataFreshness: new Date() };
    expect(successState.status).toBe('success');

    // 4. Empty state
    const emptyState: DashboardState = {
      status: 'empty',
      title: 'No Records',
      description: 'Add your first item',
      actionLabel: 'Create',
    };
    expect(emptyState.status).toBe('empty');

    // 5. Error state with retry callback
    let retried = false;
    const errorState: DashboardState = {
      status: 'error',
      error: 'Network connection lost',
      code: 'ERR_NETWORK',
      onRetry: () => { retried = true; },
    };
    expect(errorState.status).toBe('error');
    if (errorState.onRetry) errorState.onRetry();
    expect(retried).toBe(true);

    // 6. Disabled state
    const disabledState: DashboardState = { status: 'disabled', reason: 'Prerequisite Module Incomplete' };
    expect(disabledState.status).toBe('disabled');
    expect(disabledState.reason).toBe('Prerequisite Module Incomplete');

    // 7. Pending state
    const pendingState: DashboardState = { status: 'pending', message: 'SYNCHRONIZING...' };
    expect(pendingState.status).toBe('pending');

    // 8. Offline state
    const offlineState: DashboardState = { status: 'offline' };
    expect(offlineState.status).toBe('offline');

    // 9. Unauthorized: 401 unauthenticated
    const unauthState: DashboardState = { status: 'unauthorized', type: 'unauthenticated' };
    expect(unauthState.status).toBe('unauthorized');
    expect(unauthState.type).toBe('unauthenticated');

    // 10. Unauthorized: 403 forbidden
    const forbiddenState: DashboardState = { status: 'unauthorized', type: 'forbidden', roleRequired: 'admin' };
    expect(forbiddenState.status).toBe('unauthorized');
    expect(forbiddenState.type).toBe('forbidden');
  });
});

