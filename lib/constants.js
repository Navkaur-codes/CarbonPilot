/**
 * CARBONPILOT - Centralized Application Constants
 */

export const COEFFICIENTS = {
  CAR_KM_WEEK: 0.20,           // kg CO2 per km
  PUBLIC_TRIP_WEEK: 0.75,      // kg CO2 per trip
  ELECTRICITY_KWH_MONTH: 0.50, // kg CO2 per kWh
  MEAT_MEAL_WEEK: 3.00,        // kg CO2 per meat meal per week (converted to monthly)
  SHOPPING_ITEM: 10.00,        // kg CO2 per item purchased
  WASTE_BASELINE: 30.00,       // kg CO2 baseline monthly waste
};

export const WASTE_REDUCTIONS = {
  all: 0.70,   // 70% reduction if recycling all possible materials
  some: 0.30,  // 30% reduction if recycling some materials
  none: 0.00,  // 0% reduction if no consistent recycling
};

export const VALIDATION_LIMITS = {
  carKmPerWeek: { max: 10000, label: 'Car mileage' },
  publicTripsPerWeek: { max: 100, label: 'Public transit trips' },
  electricityKwhPerMonth: { max: 10000, label: 'Electricity usage' },
  meatMealsPerWeek: { max: 50, label: 'Meat meals' },
  purchasesPerMonth: { max: 500, label: 'Shopping purchases' },
};

export const DISCLAIMER = "Estimates for educational awareness only.";

export const DEFAULT_PROFILE = {
  carKmPerWeek: '',
  publicTripsPerWeek: '',
  electricityKwhPerMonth: '',
  meatMealsPerWeek: '',
  purchasesPerMonth: '',
  recyclingHabits: 'none',
};

export const STORAGE_KEYS = {
  PROFILE: 'carbon_profile',
  HISTORY: 'carbon_history',
  STREAK: 'carbon_streak',
  GOALS: 'carbon_goals',
};
