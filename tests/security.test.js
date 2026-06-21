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
import InputField from '../components/InputField';
import MilestoneCard from '../components/MilestoneCard';
import StatCard from '../components/StatCard';

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
      { week: 3, title: 'Waste Goal', action: 'Recycle all items', target: 'Diversion', completed: 'true' }, // string completed
      { week: 4, title: 'Travel Goal', action: 'Walk more', target: 'Fitness', completed: 'false' } // string false
    ];

    const res = validateAndSanitizeGoals(badGoals);
    expect(res.length).toBe(2);
    expect(res[0].title).toBe('Waste Goal');
    expect(res[0].completed).toBe(true); // coerced to true
    expect(res[1].title).toBe('Travel Goal');
    expect(res[1].completed).toBe(false); // coerced to false
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

  it('saves and retrieves versioned entries to check persistence and migration', () => {
    const profileData = {
      carKmPerWeek: '200',
      publicTripsPerWeek: '5',
      electricityKwhPerMonth: '150',
      meatMealsPerWeek: '4',
      purchasesPerMonth: '3',
      recyclingHabits: 'all'
    };
    
    setStorageItem(STORAGE_KEYS.PROFILE, profileData);
    
    // Check that it's physically stored as versioned JSON wrapping
    const rawVal = window.localStorage.getItem(STORAGE_KEYS.PROFILE);
    expect(rawVal).toContain('"version":1');
    expect(rawVal).toContain('"data":{');

    const retrieved = getStorageItem(STORAGE_KEYS.PROFILE, null);
    expect(retrieved).toEqual(profileData);
  });

  it('caps history growth to latest 50 logs', () => {
    const logs = Array.from({ length: 65 }).map((_, i) => ({
      date: `Month ${i}`,
      totalMonthly: 100 + i,
      totalYearly: 1200 + i * 12,
      categories: { transport: 40, electricity: 30, food: 10, shopping: 10, waste: 10 },
      completeness: 100
    }));

    const sanitized = validateAndSanitizeHistory(logs);
    expect(sanitized.length).toBe(50);
    expect(sanitized[0].date).toBe('Month 15'); // first 15 sliced out
    expect(sanitized[49].date).toBe('Month 64');
  });

  it('detects and rejects non-finite number values', () => {
    const badProfile = {
      carKmPerWeek: 'Infinity',
      publicTripsPerWeek: '1e999',
      electricityKwhPerMonth: 'NaN',
      meatMealsPerWeek: '15'
    };

    const sanitized = validateAndSanitizeProfile(badProfile);
    expect(sanitized.carKmPerWeek).toBe('');
    expect(sanitized.publicTripsPerWeek).toBe('');
    expect(sanitized.electricityKwhPerMonth).toBe('');
    expect(sanitized.meatMealsPerWeek).toBe('15');
  });

  it('tests keyboard accessibility attributes on InputField virtual DOM representation', () => {
    const elementWithError = InputField({
      id: 'km-input',
      name: 'carKmPerWeek',
      label: 'Mileage',
      value: '200',
      error: 'Cannot exceed max limit',
      description: 'Weekly mileage count'
    });

    // Check props on input element
    const labelWithError = elementWithError.props.children[0].props.children[0];
    expect(labelWithError.props.htmlFor).toBe('km-input');

    const inputWithErr = elementWithError.props.children[1];
    expect(inputWithErr.props.id).toBe('km-input');
    expect(inputWithErr.props['aria-invalid']).toBe(true);
    expect(inputWithErr.props['aria-describedby']).toBe('km-input-error');

    const elementWithDesc = InputField({
      id: 'transit-input',
      name: 'publicTripsPerWeek',
      label: 'Transit',
      value: '10',
      description: 'Trips count'
    });

    const inputWithDesc = elementWithDesc.props.children[1];
    expect(inputWithDesc.props['aria-invalid']).toBe(false);
    expect(inputWithDesc.props['aria-describedby']).toBe('transit-input-desc');
  });

  it('tests accessibility attributes on MilestoneCard virtual DOM representation', () => {
    const ach = { title: 'First Assessment', desc: 'Completed!', unlocked: true, icon: '🌱' };
    const res = MilestoneCard({ ach });
    
    // Check that emoji icon has role="img" and matching aria-label
    const iconSpan = res.props.children[0];
    expect(iconSpan.props.role).toBe('img');
    expect(iconSpan.props['aria-label']).toBe('First Assessment');
  });

  it('tests accessibility attributes on StatCard virtual DOM representation', () => {
    const card = StatCard({ title: 'Total Footprint', value: '4.2', unit: 'tons', highlightText: '10% reduction', icon: '🌍' });
    
    // Check that icon is hidden from screen readers since it is decorative
    const iconSpan = card.props.children[1].props.children[0];
    expect(iconSpan.props['aria-hidden']).toBe('true');
  });
});
