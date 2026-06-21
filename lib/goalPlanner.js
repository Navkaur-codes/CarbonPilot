/**
 * Generates automated weekly actionable milestones based on footprint breakdown.
 * @param {Object} categories - Carbon categories footprint breakdown.
 * @returns {Array<Object>} List of structured weekly goals.
 */
export function generateWeeklyPlan(categories) {
  // Sort categories by footprint values (descending)
  const sorted = Object.entries(categories)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  const primaryCategory = sorted[0]?.category || 'transport';
  const secondaryCategory = sorted[1]?.category || 'electricity';

  const categoryDetails = {
    transport: {
      name: 'Transport',
      action: 'Reduce car travel by 10% or substitute 2 short drives with biking/walking.',
      target: '10% reduction in transport carbon',
    },
    electricity: {
      name: 'Energy',
      action: 'Unplug standby electronics, switch off idle lights, and optimize thermostat by 1°C.',
      target: '10% reduction in electricity consumption',
    },
    food: {
      name: 'Food',
      action: 'Replace 2 red meat meals with plant-based alternatives or poultry.',
      target: 'Reduce food emissions by swapping meat meals',
    },
    shopping: {
      name: 'Shopping',
      action: 'Delay all non-essential purchases for 7 days or choose secondhand options.',
      target: 'Curb impulse consumption footprint',
    },
    waste: {
      name: 'Waste',
      action: 'Ensure all paper and plastic products are clean and segregated in recycling bins.',
      target: 'Maximize waste diversion rates',
    },
  };

  const week1Details = categoryDetails[primaryCategory] || categoryDetails.transport;
  const week2Details = categoryDetails[secondaryCategory] || categoryDetails.electricity;

  return [
    {
      week: 1,
      title: `Week 1: Focus on ${week1Details.name}`,
      action: week1Details.action,
      target: week1Details.target,
      completed: false,
    },
    {
      week: 2,
      title: `Week 2: Focus on ${week2Details.name}`,
      action: week2Details.action,
      target: week2Details.target,
      completed: false,
    },
    {
      week: 3,
      title: 'Week 3: Maintain and Benchmark',
      action: 'Review your total footprint, log a new weekly entry on the CarbonPilot, and lock in your new baseline.',
      target: 'Consolidate new eco-habits',
      completed: false,
    },
  ];
}
