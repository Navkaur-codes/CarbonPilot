/**
 * CARBONPILOT - Math and Calculation Engine
 * Estimates for educational awareness only.
 */

export const COEFFICIENTS = {
  CAR_KM_WEEK: 0.20,         // kg CO2 per km
  PUBLIC_TRIP_WEEK: 0.75,    // kg CO2 per trip
  ELECTRICITY_KWH_MONTH: 0.50, // kg CO2 per kWh
  MEAT_MEAL_WEEK: 3.00,      // kg CO2 per meal/week (converted to monthly footprint)
  SHOPPING_ITEM: 10.00,      // kg CO2 per item purchased
  WASTE_BASELINE: 30.00,     // kg CO2 baseline monthly waste
};

export const WASTE_REDUCTIONS = {
  all: 0.70,   // 70% reduction if recycling all
  some: 0.30,  // 30% reduction if recycling some
  none: 0.00,  // 0% reduction if no recycling
};

export const DISCLAIMER = "Estimates for educational awareness only.";

/**
 * Calculates the monthly carbon footprint in kg CO2.
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
      transport: parseFloat(transportTotal.toFixed(1)),
      electricity: parseFloat(electricityTotal.toFixed(1)),
      food: parseFloat(foodTotal.toFixed(1)),
      shopping: parseFloat(shoppingTotal.toFixed(1)),
      waste: parseFloat(wasteTotal.toFixed(1)),
    },
    totalMonthly: parseFloat(totalMonthly.toFixed(1)),
    totalYearly: parseFloat((totalMonthly * 12).toFixed(1)),
  };
}

/**
 * Calculates the percentage of completed inputs.
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
 */
export function getConfidenceLevel(completeness) {
  if (completeness >= 90) return 'High';
  if (completeness >= 50) return 'Medium';
  return 'Low';
}

/**
 * Calculates category percentages and determines the top improvement opportunity.
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
 */
export function getEquivalenceExplanation(totalYearlyKg) {
  const totalTons = totalYearlyKg / 1000;
  // Standard equivalence metrics:
  // 1 tree absorbs ~22 kg CO2 per year
  // 1 car drive round-trip across US (approx 9000 km at 0.20 kg/km) is ~1800 kg (1.8 tons)
  const treesCount = Math.round(totalYearlyKg / 22);
  const averageComparison = (totalTons / 16.0) * 100; // US Average ~16 tons, Global Average ~4.5 tons

  return {
    trees: treesCount,
    averagePercentage: Math.round(averageComparison),
    averageComparisonText: totalTons > 4.5 
      ? `higher than the global sustainable average (4.5 tons).`
      : `lower than the global average. Great job!`,
  };
}
