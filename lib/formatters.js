/**
 * CARBONPILOT - Pure Formatting Utilities
 */

/**
 * Rounds a number to a specific decimal precision.
 * @param {number|string} val - The input value to round
 * @param {number} decimals - Precision decimal points
 * @returns {number} The rounded number
 */
export function formatDecimal(val, decimals = 1) {
  const num = Number(val);
  if (isNaN(num)) return 0;
  return parseFloat(num.toFixed(decimals));
}

/**
 * Formats carbon in kg to tons.
 * @param {number} kg - The weight in kilograms
 * @returns {string} Formatted string in tons
 */
export function formatKgToTons(kg) {
  const tons = (Number(kg) || 0) / 1000;
  return tons.toFixed(2);
}

/**
 * Clean and format dates consistently.
 * @param {string|Date} dateVal - Date value
 * @returns {string} Short formatted month & year (e.g., 'Feb 2026')
 */
export function formatDateShort(dateVal) {
  const date = dateVal ? new Date(dateVal) : new Date();
  if (isNaN(date.getTime())) return 'Unknown Date';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (typeof str !== 'string' || !str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
