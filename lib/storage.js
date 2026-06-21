/**
 * CARBONPILOT - SSR-safe LocalStorage Storage Helpers with Schema Validation
 */

import { STORAGE_KEYS, DEFAULT_PROFILE, VALIDATION_LIMITS } from './constants';

const CURRENT_VERSION = 1;

/**
 * Safe client-only logging utility to remove production console noise.
 */
const logger = {
  error: (msg, err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(msg, err);
    }
  },
  warn: (msg) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(msg);
    }
  }
};

/**
 * Wraps storage values inside a versioned object schema.
 */
function wrapVersion(data) {
  return {
    version: CURRENT_VERSION,
    data: data
  };
}

/**
 * Unwraps and migrates legacy/versioned data.
 */
function unwrapVersion(parsedItem) {
  if (parsedItem && typeof parsedItem === 'object' && 'version' in parsedItem && 'data' in parsedItem) {
    return parsedItem.data;
  }
  return parsedItem; // Migrate legacy (raw unversioned format)
}

/**
 * Validates and sanitizes a profile object.
 * Returns safe defaults if corrupted.
 */
export function validateAndSanitizeProfile(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ...DEFAULT_PROFILE };
  }

  const sanitizeNumField = (val, max) => {
    if (val === undefined || val === null || val === '') return '';
    const cleanStr = typeof val === 'string' ? val.trim() : String(val);
    const num = Number(cleanStr);
    if (isNaN(num) || !Number.isFinite(num) || num < 0) return '';
    return Math.min(num, max).toString();
  };

  return {
    carKmPerWeek: sanitizeNumField(data.carKmPerWeek, VALIDATION_LIMITS.carKmPerWeek.max),
    publicTripsPerWeek: sanitizeNumField(data.publicTripsPerWeek, VALIDATION_LIMITS.publicTripsPerWeek.max),
    electricityKwhPerMonth: sanitizeNumField(data.electricityKwhPerMonth, VALIDATION_LIMITS.electricityKwhPerMonth.max),
    meatMealsPerWeek: sanitizeNumField(data.meatMealsPerWeek, VALIDATION_LIMITS.meatMealsPerWeek.max),
    purchasesPerMonth: sanitizeNumField(data.purchasesPerMonth, VALIDATION_LIMITS.purchasesPerMonth.max),
    recyclingHabits: ['all', 'some', 'none'].includes(data.recyclingHabits) ? data.recyclingHabits : 'none',
  };
}

/**
 * Validates and sanitizes a history array.
 * Replaces invalid elements or returns empty array if structure is corrupted.
 */
export function validateAndSanitizeHistory(data) {
  if (!Array.isArray(data)) return [];
  return data
    .map(entry => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;

      const date = typeof entry.date === 'string' 
        ? entry.date.trim() 
        : 'Unknown';
        
      const totalMonthly = Math.max(0, Number(entry.totalMonthly) || 0);
      const totalYearly = Math.max(0, Number(entry.totalYearly) || 0);
      const completeness = Math.max(0, Math.min(100, Number(entry.completeness) || 0));

      const cats = entry.categories || {};
      const categories = {
        transport: Math.max(0, Number(cats.transport) || 0),
        electricity: Math.max(0, Number(cats.electricity) || 0),
        food: Math.max(0, Number(cats.food) || 0),
        shopping: Math.max(0, Number(cats.shopping) || 0),
        waste: Math.max(0, Number(cats.waste) || 0),
      };

      if (!Number.isFinite(totalMonthly) || !Number.isFinite(totalYearly)) return null;

      return {
        date,
        totalMonthly,
        totalYearly,
        categories,
        completeness,
      };
    })
    .filter(Boolean)
    .slice(-50); // Limit history growth to protect local storage capacity
}

/**
 * Validates and sanitizes the streak number.
 * Returns 0 if invalid or negative.
 */
export function validateAndSanitizeStreak(data) {
  const num = Number(data);
  if (isNaN(num) || !Number.isFinite(num) || num < 0 || !Number.isInteger(num)) return 0;
  return num;
}

/**
 * Validates and sanitizes weekly goals.
 * Filters out malformed entries.
 */
export function validateAndSanitizeGoals(data) {
  if (!Array.isArray(data)) return [];
  return data
    .map(goal => {
      if (!goal || typeof goal !== 'object' || Array.isArray(goal)) return null;
      const week = Number(goal.week) || 1;
      const title = typeof goal.title === 'string' ? goal.title.trim() : '';
      const action = typeof goal.action === 'string' ? goal.action.trim() : '';
      const target = typeof goal.target === 'string' ? goal.target.trim() : '';
      const completed = goal.completed === true || goal.completed === 'true';

      if (!title || !action || !Number.isFinite(week)) return null;

      return { week, title, action, target, completed };
    })
    .filter(Boolean);
}

/**
 * Reads from LocalStorage safely with schema validation.
 */
export function getStorageItem(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    const unwrapped = unwrapVersion(parsed);

    // Apply strict schema validation depending on key
    if (key === STORAGE_KEYS.PROFILE) {
      return validateAndSanitizeProfile(unwrapped);
    }
    if (key === STORAGE_KEYS.HISTORY) {
      return validateAndSanitizeHistory(unwrapped);
    }
    if (key === STORAGE_KEYS.STREAK) {
      return validateAndSanitizeStreak(unwrapped);
    }
    if (key === STORAGE_KEYS.GOALS) {
      return validateAndSanitizeGoals(unwrapped);
    }

    return unwrapped;
  } catch (error) {
    logger.error(`Error reading key "${key}" from localStorage:`, error);
    
    // Recovery with safe schema defaults on exception
    if (key === STORAGE_KEYS.PROFILE) return validateAndSanitizeProfile(null);
    if (key === STORAGE_KEYS.HISTORY) return validateAndSanitizeHistory(null);
    if (key === STORAGE_KEYS.STREAK) return validateAndSanitizeStreak(null);
    if (key === STORAGE_KEYS.GOALS) return validateAndSanitizeGoals(null);

    return defaultValue;
  }
}

/**
 * Writes to LocalStorage safely with sanitization.
 */
export function setStorageItem(key, value) {
  if (typeof window === 'undefined') return;
  try {
    let sanitized = value;
    if (key === STORAGE_KEYS.PROFILE) {
      sanitized = validateAndSanitizeProfile(value);
    } else if (key === STORAGE_KEYS.HISTORY) {
      sanitized = validateAndSanitizeHistory(value);
    } else if (key === STORAGE_KEYS.STREAK) {
      sanitized = validateAndSanitizeStreak(value);
    } else if (key === STORAGE_KEYS.GOALS) {
      sanitized = validateAndSanitizeGoals(value);
    }

    const wrapped = wrapVersion(sanitized);
    window.localStorage.setItem(key, JSON.stringify(wrapped));
  } catch (error) {
    logger.error(`Error writing key "${key}" to localStorage:`, error);
  }
}

/**
 * Clears keys safely.
 */
export function removeStorageItem(key) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    logger.error(`Error removing key "${key}" from localStorage:`, error);
  }
}

/**
 * Resets all CarbonPilot user storage data.
 */
export function clearAllCarbonData() {
  if (typeof window === 'undefined') return;
  removeStorageItem(STORAGE_KEYS.PROFILE);
  removeStorageItem(STORAGE_KEYS.HISTORY);
  removeStorageItem(STORAGE_KEYS.STREAK);
  removeStorageItem(STORAGE_KEYS.GOALS);
}

/**
 * Generates and saves mock demo data for testing and validation.
 */
export function loadDemoData() {
  const mockProfile = {
    carKmPerWeek: '120',
    publicTripsPerWeek: '8',
    electricityKwhPerMonth: '250',
    meatMealsPerWeek: '6',
    purchasesPerMonth: '5',
    recyclingHabits: 'some'
  };

  const mockHistory = [
    {
      date: 'Feb 2026',
      totalMonthly: 410.5,
      totalYearly: 4926.0,
      categories: { transport: 210, electricity: 125, food: 45, shopping: 20, waste: 10.5 },
      completeness: 85,
    },
    {
      date: 'Mar 2026',
      totalMonthly: 380.0,
      totalYearly: 4560.0,
      categories: { transport: 180, electricity: 125, food: 40, shopping: 25, waste: 10.0 },
      completeness: 100,
    },
    {
      date: 'Apr 2026',
      totalMonthly: 350.2,
      totalYearly: 4202.4,
      categories: { transport: 160, electricity: 110, food: 35, shopping: 35, waste: 10.2 },
      completeness: 100,
    },
    {
      date: 'May 2026',
      totalMonthly: 310.8,
      totalYearly: 3729.6,
      categories: { transport: 130, electricity: 110, food: 30, shopping: 30, waste: 10.8 },
      completeness: 100,
    }
  ];

  const mockGoals = [
    {
      week: 1,
      title: 'Week 1: Focus on Transport',
      action: 'Reduce car travel by 10% or substitute 2 short drives with biking/walking.',
      target: '10% reduction in transport carbon',
      completed: true,
    },
    {
      week: 2,
      title: 'Week 2: Focus on Energy',
      action: 'Unplug standby electronics, switch off idle lights, and optimize thermostat by 1°C.',
      target: '10% reduction in electricity consumption',
      completed: false,
    },
    {
      week: 3,
      title: 'Week 3: Maintain and Benchmark',
      action: 'Review your total footprint, log a new weekly entry on the CarbonPilot, and lock in your new baseline.',
      target: 'Consolidate new eco-habits',
      completed: false,
    }
  ];

  setStorageItem(STORAGE_KEYS.PROFILE, mockProfile);
  setStorageItem(STORAGE_KEYS.HISTORY, mockHistory);
  setStorageItem(STORAGE_KEYS.STREAK, 3);
  setStorageItem(STORAGE_KEYS.GOALS, mockGoals);
}
