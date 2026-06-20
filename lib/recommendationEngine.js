/**
 * CARBONPILOT - Smart Recommendation Engine
 * Generates rule-based suggestions depending on user footprints.
 */

import { getConfidenceLevel } from './carbonCalculator';

/**
 * Returns dynamic recommendations based on calculation results.
 */
export function getRecommendations(inputs, calculations, completeness) {
  const recommendations = [];
  const confidence = getConfidenceLevel(completeness) + ` (${completeness}%)`;

  const carKm = parseFloat(inputs.carKmPerWeek) || 0;
  const electricity = parseFloat(inputs.electricityKwhPerMonth) || 0;
  const meatMeals = parseFloat(inputs.meatMealsPerWeek) || 0;
  const purchases = parseFloat(inputs.purchasesPerMonth) || 0;
  const recycling = inputs.recyclingHabits || 'none';

  const cats = calculations.categories || { transport: 0, electricity: 0, food: 0, shopping: 0, waste: 0 };
  const total = calculations.totalMonthly || 1;

  // Rule 1: Transport Car
  if (carKm > 80 || (cats.transport / total) > 0.35) {
    recommendations.push({
      id: 'rec-transport-short',
      title: 'Bike or Walk Short Commutes',
      whySuggested: 'Transport is your largest emission contributor. Biking or walking for trips under 5 km cuts tailpipe emissions completely.',
      expectedImpact: 'High',
      difficulty: 'Easy',
      estimatedCost: 'Saves Money',
      priorityScore: 9,
      confidence,
      category: 'Transport',
    });

    recommendations.push({
      id: 'rec-transport-carpool',
      title: 'Initiate Carpooling or Public Transit Swaps',
      whySuggested: 'Your weekly driving distance is high. Sharing rides or taking public transit once or twice a week significantly divides commute carbon.',
      expectedImpact: 'High',
      difficulty: 'Medium',
      estimatedCost: 'Low Cost',
      priorityScore: 8,
      confidence,
      category: 'Transport',
    });
  }

  // Rule 2: Home Electricity
  if (electricity > 200 || (cats.electricity / total) > 0.30) {
    recommendations.push({
      id: 'rec-energy-thermostat',
      title: 'Optimize Thermostat & Appliance Settings',
      whySuggested: 'Your monthly electricity consumption is high. Adjusting heating/cooling by 1-2°C and turning off standby appliances reduces baseline load.',
      expectedImpact: 'Medium',
      difficulty: 'Easy',
      estimatedCost: 'Zero Cost',
      priorityScore: 8,
      confidence,
      category: 'Energy',
    });

    recommendations.push({
      id: 'rec-energy-led',
      title: 'Upgrade to Smart LED Lighting',
      whySuggested: 'Swapping remaining incandescent bulbs for LEDs reduces electricity used for lighting by up to 75%.',
      expectedImpact: 'Medium',
      difficulty: 'Easy',
      estimatedCost: 'Low Cost',
      priorityScore: 7,
      confidence,
      category: 'Energy',
    });
  }

  // Rule 3: Food
  if (meatMeals > 4 || (cats.food / total) > 0.25) {
    recommendations.push({
      id: 'rec-food-meatless',
      title: 'Adopt "Meatless Mondays"',
      whySuggested: 'Meat production (especially beef and lamb) carries high greenhouse emissions. Skipping meat just 1 day per week reduces food footprint.',
      expectedImpact: 'Medium',
      difficulty: 'Easy',
      estimatedCost: 'Saves Money',
      priorityScore: 8,
      confidence,
      category: 'Food',
    });

    recommendations.push({
      id: 'rec-food-poultry',
      title: 'Swap Red Meat for Poultry or Plants',
      whySuggested: 'Poultry and plant protein sources (lentils, beans) have up to 80% lower lifecycle emissions compared to beef.',
      expectedImpact: 'High',
      difficulty: 'Medium',
      estimatedCost: 'Zero Cost',
      priorityScore: 7,
      confidence,
      category: 'Food',
    });
  }

  // Rule 4: Shopping
  if (purchases > 4 || (cats.shopping / total) > 0.20) {
    recommendations.push({
      id: 'rec-shopping-delay',
      title: 'Apply the 30-Day Purchase Rule',
      whySuggested: 'Manufacturing new consumer items has high embedded energy. Waiting 30 days helps curb impulse buys and physical waste.',
      expectedImpact: 'Medium',
      difficulty: 'Medium',
      estimatedCost: 'Saves Money',
      priorityScore: 7,
      confidence,
      category: 'Shopping',
    });

    recommendations.push({
      id: 'rec-shopping-secondhand',
      title: 'Buy Pre-Owned or Refurbished',
      whySuggested: 'Purchasing secondhand clothing or electronics extends product lifecycles and saves up to 90% of raw material manufacturing carbon.',
      expectedImpact: 'Medium',
      difficulty: 'Easy',
      estimatedCost: 'Low Cost',
      priorityScore: 6,
      confidence,
      category: 'Shopping',
    });
  }

  // Rule 5: Waste Baseline / Habits
  if (recycling === 'none' || recycling === 'some') {
    recommendations.push({
      id: 'rec-waste-recycle',
      title: 'Set Up a Clean Home Recycling Station',
      whySuggested: 'You indicated minimal recycling habits. Separating paper, plastics, and glass diverts carbon-intensive waste from landfill decomposition.',
      expectedImpact: 'Medium',
      difficulty: 'Easy',
      estimatedCost: 'Low Cost',
      priorityScore: 8,
      confidence,
      category: 'Waste',
    });

    recommendations.push({
      id: 'rec-waste-compost',
      title: 'Compost Kitchen Organic waste',
      whySuggested: 'Organic waste rotting in anaerobic landfill conditions produces methane. Composting transforms waste into nutrient-dense soil.',
      expectedImpact: 'High',
      difficulty: 'Medium',
      estimatedCost: 'Low Cost',
      priorityScore: 7,
      confidence,
      category: 'Waste',
    });
  }

  // Fallback default recommendations if user has a very low footprint
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-default-share',
      title: 'Become a Carbon Coach Advocate',
      whySuggested: 'Your carbon footprint is exceptionally low. Share your strategies with family or coworkers to multiply your impact.',
      expectedImpact: 'High',
      difficulty: 'Easy',
      estimatedCost: 'Zero Cost',
      priorityScore: 9,
      confidence,
      category: 'General',
    });
  }

  // Sort by priorityScore descending
  return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
}
