import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBadges } from '../hooks/useBadges.js';

const empty = { totalQuestions: 0, bySubject: {}, streak: 0, usedTelugu: false, learnedEarly: false };

describe('useBadges', () => {
  it('returns no earned badges for a child who has not asked any questions', () => {
    const { result } = renderHook(() => useBadges(empty));
    expect(result.current.earned).toHaveLength(0);
    expect(result.current.locked).toHaveLength(8);
  });

  it('earned + locked always adds up to total badge count', () => {
    const { result } = renderHook(() => useBadges({ ...empty, totalQuestions: 1 }));
    expect(result.current.earned.length + result.current.locked.length).toBe(8);
  });

  it('unlocks first_question badge when totalQuestions reaches 1', () => {
    const { result } = renderHook(() => useBadges({ ...empty, totalQuestions: 1 }));
    expect(result.current.earned.map((b) => b.id)).toContain('first_question');
  });

  it('does not set justUnlocked on the initial render even if badges are already earned', () => {
    // Badges present on mount are "silently" recorded, not celebrated
    const { result } = renderHook(() => useBadges({ ...empty, totalQuestions: 1 }));
    expect(result.current.justUnlocked).toBeNull();
  });

  it('sets justUnlocked when a badge is earned after the initial render', () => {
    const { result, rerender } = renderHook(
      ({ stats }) => useBadges(stats),
      { initialProps: { stats: empty } },
    );
    act(() => { rerender({ stats: { ...empty, totalQuestions: 1 } }); });
    expect(result.current.justUnlocked).not.toBeNull();
    expect(result.current.justUnlocked.id).toBe('first_question');
  });

  it('only fires justUnlocked once per badge (no repeat celebrations)', () => {
    const { result, rerender } = renderHook(
      ({ stats }) => useBadges(stats),
      { initialProps: { stats: empty } },
    );
    act(() => { rerender({ stats: { ...empty, totalQuestions: 1 } }); });
    act(() => { result.current.clearUnlocked(); });
    // Trigger another re-render with the same badge already earned
    act(() => { rerender({ stats: { ...empty, totalQuestions: 2 } }); });
    expect(result.current.justUnlocked).toBeNull();
  });

  it('clearUnlocked sets justUnlocked back to null', () => {
    const { result, rerender } = renderHook(
      ({ stats }) => useBadges(stats),
      { initialProps: { stats: empty } },
    );
    act(() => { rerender({ stats: { ...empty, totalQuestions: 1 } }); });
    act(() => { result.current.clearUnlocked(); });
    expect(result.current.justUnlocked).toBeNull();
  });

  it('unlocks the streak_5 badge when streak reaches 5', () => {
    const { result } = renderHook(() => useBadges({ ...empty, streak: 5 }));
    expect(result.current.earned.map((b) => b.id)).toContain('streak_5');
  });

  it('unlocks the trilingual badge when usedTelugu is true', () => {
    const { result } = renderHook(() => useBadges({ ...empty, usedTelugu: true }));
    expect(result.current.earned.map((b) => b.id)).toContain('trilingual');
  });

  it('unlocks math_lover when Math subject count reaches 10', () => {
    const { result } = renderHook(() => useBadges({ ...empty, bySubject: { Math: 10 } }));
    expect(result.current.earned.map((b) => b.id)).toContain('math_lover');
  });

  it('exposes allBadges with all 8 badges', () => {
    const { result } = renderHook(() => useBadges(empty));
    expect(result.current.allBadges).toHaveLength(8);
  });
});
