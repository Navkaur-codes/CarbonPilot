/**
 * CARBONPILOT - Math and Calculation Engine
 * Estimates for educational awareness only.
 */

import { COEFFICIENTS, WASTE_REDUCTIONS, DISCLAIMER } from './constants';
import { formatDecimal } from './formatters';

export { COEFFICIENTS, WASTE_REDUCTIONS, DISCLAIMER };

/**
 * Calculates the monthly carbon footprint in kg CO2.
 * @param {Object} inputs - The raw profile input object.
 * @returns {Object} Calculated totals and sector category values.
 */
export function calculateFootprint(inputs) {
  const carKm = parseFloat(inputs.carKmPerWeek) || 0;
  const publicTrips = parseFloat(inputs.publicTripsPerWeek) || 0;
  const electricity = parseFloat(inputs.electricityKwhPerMonth) || 0;
  const meatMeals = parseFloat(inputs.meatMealsPerWeek) || 0;
  const purchases = parseFloat(inputs.purchasesPerMonth) || 0;
  const recycling = inputs.recyclingHabits || 'none';

  // Weekly values converted to monthly (using 52 weeks / 12 months = 4.3333 weeks/month)
  const WEEKS_PER_MONTH = 52 / 12;

  const transportCar = carKm * COEFFICIENTS.CAR_KM_WEEK * WEEKS_PER_MONTH;
  const transportPublic = publicTrips * COEFFICIENTS.PUBLIC_TRIP_WEEK * WEEKS_PER_MONTH;
  const transportTotal = transportCar + transportPublic;

  const electricityTotal = electricity * COEFFICIENTS.ELECTRICITY_KWH_MONTH;

  const foodTotal = meatMeals * COEFFICIENTS.MEAT_MEAL_WEEK * WEEKS_PER_MONTH;

  const shoppingTotal = purchases * COEFFICIENTS.SHOPPING_ITEM;

  const wasteReduction = WASTE_REDUCTIONS[recycling] ?? 0;
  const wasteTotal = COEFFICIENTS.WASTE_BASELINE * (1 - wasteReduction);

  const totalMonthly = transportTotal + electricityTotal + foodTotal + shoppingTotal + wasteTotal;

  return {
    categories: {
      transport: formatDecimal(transportTotal, 1),
      electricity: formatDecimal(electricityTotal, 1),
      food: formatDecimal(foodTotal, 1),
      shopping: formatDecimal(shoppingTotal, 1),
      waste: formatDecimal(wasteTotal, 1),
    },
    totalMonthly: formatDecimal(totalMonthly, 1),
    totalYearly: formatDecimal(totalMonthly * 12, 1),
  };
}

/**
 * Calculates the percentage of completed inputs.
 * @param {Object} inputs - User inputs.
 * @returns {number} Completeness percentage (0-100).
 */
export function calculateCompleteness(inputs) {
  const fields = [
    inputs.carKmPerWeek,
    inputs.publicTripsPerWeek,
    inputs.electricityKwhPerMonth,
    inputs.meatMealsPerWeek,
    inputs.purchasesPerMonth,
    inputs.recyclingHabits
  ];
  const filled = fields.filter(val => val !== undefined && val !== null && val !== '').length;
  return Math.round((filled / fields.length) * 100);
}

/**
 * Translates completeness percentage to a Confidence level.
 * @param {number} completeness - Completeness percentage.
 * @returns {string} Confidence label (Low, Medium, High).
 */
export function getConfidenceLevel(completeness) {
  if (completeness >= 90) return 'High';
  if (completeness >= 50) return 'Medium';
  return 'Low';
}

/**
 * Calculates category percentages and determines the top improvement opportunity.
 * @param {Object} categories - Calculated carbon category values.
 * @param {number} totalMonthly - Total monthly emissions.
 * @returns {Object} Category percentages and the top opportunities key name.
 */
export function getBreakdownAndOpportunity(categories, totalMonthly) {
  if (!totalMonthly || totalMonthly <= 0) {
    return {
      percentages: { transport: 0, electricity: 0, food: 0, shopping: 0, waste: 0 },
      topOpportunity: 'None',
    };
  }

  const percentages = {};
  let maxVal = -1;
  let topOpportunity = 'None';

  const opportunityMapping = {
    transport: 'Transport',
    electricity: 'Energy',
    food: 'Food',
    shopping: 'Shopping',
    waste: 'Waste',
  };

  Object.entries(categories).forEach(([key, val]) => {
    const pct = Math.round((val / totalMonthly) * 100);
    percentages[key] = pct;
    if (val > maxVal) {
      maxVal = val;
      topOpportunity = opportunityMapping[key] || key;
    }
  });

  return { percentages, topOpportunity };
}

/**
 * Returns a simple, accessible equivalence message for the monthly footprint.
 * @param {number} totalYearlyKg - Projected annual footprint in kg.
 * @returns {Object} Tree equivalents count and average comparison stats.
 */
export function getEquivalenceExplanation(totalYearlyKg) {
  const totalTons = totalYearlyKg / 1000;
  // Standard equivalence metrics:
  // 1 tree absorbs ~22 kg CO2 per year
  const treesCount = Math.round(totalYearlyKg / 22);
  const averageComparison = (totalTons / 16.0) * 100; // US Average ~16 tons

  return {
    trees: treesCount,
    averagePercentage: Math.round(averageComparison),
    averageComparisonText: totalTons > 4.5 
      ? `higher than the global sustainable average (4.5 tons).`
      : `lower than the global average. Great job!`,
  };
}
