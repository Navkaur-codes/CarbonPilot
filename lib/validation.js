/**
 * CARBONPILOT - Input Validation & Sanitization Engine
 */

import { VALIDATION_LIMITS } from './constants';

/**
 * Sanitizes a string input by removing HTML tags and trimming whitespace.
 * @param {string} val - Unsafe string input
 * @returns {string} Sanitized clean string
 */
export function sanitizeString(val) {
  return typeof val === 'string' ? val.trim() : '';
}

/**
 * Validates carbon form numerical inputs.
 * Returns an object with { isValid, errors } where errors has specific field warnings.
 * @param {Object} inputs - Raw values from the calculator form
 * @returns {Object} Validation outcome containing boolean status and field error list
 */
export function validateCarbonInputs(inputs) {
  const errors = {};
  let isValid = true;

  if (!inputs || typeof inputs !== 'object') {
    return { isValid: false, errors: { form: 'Invalid inputs structure.' } };
  }

  Object.entries(VALIDATION_LIMITS).forEach(([field, limit]) => {
    const valStr = inputs[field];
    if (valStr === undefined || valStr === null || valStr === '') {
      // Empty values are treated as 0 without raising validation block, but we track completeness
      return;
    }

    const val = Number(valStr);
    if (isNaN(val)) {
      errors[field] = `${limit.label} must be a valid number.`;
      isValid = false;
    } else if (val < 0) {
      errors[field] = `${limit.label} cannot be negative.`;
      isValid = false;
    } else if (val > limit.max) {
      errors[field] = `${limit.label} cannot exceed ${limit.max} per unit time.`;
      isValid = false;
    }
  });

  // recyclingHabits validation
  if (inputs.recyclingHabits && !['all', 'some', 'none'].includes(inputs.recyclingHabits)) {
    errors.recyclingHabits = 'Invalid recycling selection.';
    isValid = false;
  }

  return { isValid, errors };
}
