import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateAndSanitizeProfile,
  validateAndSanitizeHistory,
  validateAndSanitizeGoals,
  validateAndSanitizeStreak,
  getStorageItem,
  setStorageItem
} from '../lib/storage';
import { validateCarbonInputs } from '../lib/validation';
import { DEFAULT_PROFILE, STORAGE_KEYS } from '../lib/constants';

// Lightweight in-memory localStorage mock for node environment
if (typeof window === 'undefined') {
  const store = {};
  global.window = {
    localStorage: {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => {
        for (const key in store) {
          delete store[key];
        }
      }
    }
  };
}

describe('Security & Schema Validation Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('correctly handles empty/null profile storage', () => {
    const res = validateAndSanitizeProfile(null);
    expect(res).toEqual(DEFAULT_PROFILE);
  });

  it('coerces negative values and filters bad inputs in profile validation', () => {
    const badProfile = {
      carKmPerWeek: '-100', // negative
      publicTripsPerWeek: 'abc', // not a number
      electricityKwhPerMonth: '150', // fine
      meatMealsPerWeek: '999', // exceeds max 50
      purchasesPerMonth: '-5', // negative
      recyclingHabits: 'malicious-string' // invalid enum
    };

    const res = validateAndSanitizeProfile(badProfile);
    expect(res.carKmPerWeek).toBe('');
    expect(res.publicTripsPerWeek).toBe('');
    expect(res.electricityKwhPerMonth).toBe('150');
    expect(res.meatMealsPerWeek).toBe('50'); // capped at max
    expect(res.purchasesPerMonth).toBe('');
    expect(res.recyclingHabits).toBe('none'); // fallback to none
  });

  it('recovers from broken JSON strings in getStorageItem', () => {
    const storageSpy = vi.spyOn(window.localStorage, 'getItem');
    storageSpy.mockReturnValueOnce('{"corrupted_json... }');

    const res = getStorageItem(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    expect(res).toEqual(DEFAULT_PROFILE);

    storageSpy.mockRestore();
  });

  it('validates history entries array with corrupted/null entries', () => {
    const corruptedHistory = [
      {
        date: 'Feb 2026',
        totalMonthly: 250.5,
        totalYearly: -3000, // negative totalYearly
        categories: { transport: 100, electricity: 'invalid-val' }, // broken nested
        completeness: 150 // over 100
      },
      null, // null entry
      'not-an-object' // invalid entry type
    ];

    const clean = validateAndSanitizeHistory(corruptedHistory);
    expect(clean.length).toBe(1);
    expect(clean[0].totalYearly).toBe(0); // coerced to >= 0
    expect(clean[0].categories.electricity).toBe(0); // fallback to 0
    expect(clean[0].completeness).toBe(100); // capped at 100
    expect(clean[0].date).toBe('Feb 2026');
  });

  it('validates and sanitizes streak values', () => {
    expect(validateAndSanitizeStreak(-5)).toBe(0);
    expect(validateAndSanitizeStreak('not-a-number')).toBe(0);
    expect(validateAndSanitizeStreak(3.5)).toBe(0); // non-integer
    expect(validateAndSanitizeStreak(12)).toBe(12); // fine
  });

  it('validates goals array and handles missing or empty title/action', () => {
    const badGoals = [
      { week: 1, title: '', action: 'Reduce driving', target: '10%' }, // empty title
      { week: 2, title: 'Energy Goal', action: '', target: '10%' }, // empty action
      { week: 3, title: 'Waste Goal', action: 'Recycle all items', target: 'Diversion', completed: 'true' } // string completed
    ];

    const res = validateAndSanitizeGoals(badGoals);
    expect(res.length).toBe(1);
    expect(res[0].title).toBe('Waste Goal');
    expect(res[0].completed).toBe(true); // coerced to boolean
  });

  it('harsher input validation rejects negative numbers', () => {
    const badInputs = {
      carKmPerWeek: '-10',
      publicTripsPerWeek: '12',
      recyclingHabits: 'some'
    };
    const validation = validateCarbonInputs(badInputs);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.carKmPerWeek).toContain('cannot be negative');
  });

  it('saves and retrieves sanitized entries to check persistence', () => {
    const profileData = {
      carKmPerWeek: '200',
      publicTripsPerWeek: '5',
      electricityKwhPerMonth: '150',
      meatMealsPerWeek: '4',
      purchasesPerMonth: '3',
      recyclingHabits: 'all'
    };
    
    setStorageItem(STORAGE_KEYS.PROFILE, profileData);
    const retrieved = getStorageItem(STORAGE_KEYS.PROFILE, null);
    
    expect(retrieved).toEqual(profileData);
  });
});
