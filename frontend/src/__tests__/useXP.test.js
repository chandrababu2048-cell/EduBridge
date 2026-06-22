import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useXP } from '../hooks/useXP.js';

describe('useXP', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts at 0 XP and level 1 when no saved state exists', () => {
    const { result } = renderHook(() => useXP());
    expect(result.current.xp).toBe(0);
    expect(result.current.level).toBe(1);
    expect(result.current.showLevelUp).toBe(false);
  });

  it('restores XP and level from localStorage on mount', () => {
    localStorage.setItem('edubridge_xp', '250');
    const { result } = renderHook(() => useXP());
    expect(result.current.xp).toBe(250);
    expect(result.current.level).toBe(3); // Knowledge Ninja at 250 XP
  });

  it('falls back to 0 when localStorage contains a non-numeric value', () => {
    localStorage.setItem('edubridge_xp', 'corrupted');
    const { result } = renderHook(() => useXP());
    expect(result.current.xp).toBe(0);
  });

  it('addXP increases the XP total', () => {
    const { result } = renderHook(() => useXP());
    act(() => { result.current.addXP(50); });
    expect(result.current.xp).toBe(50);
  });

  it('addXP accumulates across multiple calls', () => {
    const { result } = renderHook(() => useXP());
    act(() => { result.current.addXP(30); });
    act(() => { result.current.addXP(20); });
    expect(result.current.xp).toBe(50);
  });

  it('persists XP to localStorage after addXP', () => {
    const { result } = renderHook(() => useXP());
    act(() => { result.current.addXP(100); });
    expect(localStorage.getItem('edubridge_xp')).toBe('100');
  });

  it('sets showLevelUp to true when crossing a level threshold', () => {
    const { result } = renderHook(() => useXP());
    act(() => { result.current.addXP(100); }); // 0 → 100 XP, level 1 → 2
    expect(result.current.showLevelUp).toBe(true);
    expect(result.current.level).toBe(2);
  });

  it('does not set showLevelUp when XP stays within the same level', () => {
    const { result } = renderHook(() => useXP());
    act(() => { result.current.addXP(10); }); // stays at level 1
    expect(result.current.showLevelUp).toBe(false);
  });

  it('setShowLevelUp(false) clears the level-up flag', () => {
    const { result } = renderHook(() => useXP());
    act(() => { result.current.addXP(100); });
    expect(result.current.showLevelUp).toBe(true);
    act(() => { result.current.setShowLevelUp(false); });
    expect(result.current.showLevelUp).toBe(false);
  });

  it('exposes LEVELS array', () => {
    const { result } = renderHook(() => useXP());
    expect(Array.isArray(result.current.LEVELS)).toBe(true);
    expect(result.current.LEVELS.length).toBe(6);
  });

  it('nextLevelXP reflects the XP needed for the next level', () => {
    const { result } = renderHook(() => useXP());
    // At level 1, next level (Brain Explorer) requires 100 XP
    expect(result.current.nextLevelXP).toBe(100);
  });

  it('levelData contains the current level object', () => {
    localStorage.setItem('edubridge_xp', '500');
    const { result } = renderHook(() => useXP());
    expect(result.current.levelData.level).toBe(4);
    expect(result.current.levelData.name).toBe('Science Star');
  });
});
