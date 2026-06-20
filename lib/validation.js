/**
 * CARBONPILOT - Input Validation & Sanitization Engine
 */

/**
 * Sanitizes a string input by removing HTML tags and trimming whitespace.
 */
export function sanitizeString(val) {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validates carbon form numerical inputs.
 * Returns an object with { isValid, errors } where errors has specific field warnings.
 */
export function validateCarbonInputs(inputs) {
  const errors = {};
  let isValid = true;

  // Max thresholds to prevent overflow and unreasonable mock values
  const limits = {
    carKmPerWeek: { max: 10000, label: 'Car mileage' },
    publicTripsPerWeek: { max: 100, label: 'Public transit trips' },
    electricityKwhPerMonth: { max: 10000, label: 'Electricity usage' },
    meatMealsPerWeek: { max: 50, label: 'Meat meals' },
    purchasesPerMonth: { max: 500, label: 'Shopping purchases' },
  };

  Object.entries(limits).forEach(([field, limit]) => {
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
