import { describe, it, expect } from 'vitest';
import { calculateFootprint } from '../lib/carbonCalculator';

describe('Simulator logic tests', () => {
  it('correctly simulates a 50% reduction in driving mileage', () => {
    const baseline = {
      carKmPerWeek: '200',
      publicTripsPerWeek: '0',
      electricityKwhPerMonth: '0',
      meatMealsPerWeek: '0',
      purchasesPerMonth: '0',
      recyclingHabits: 'none'
    };

    // Calculate baseline
    const current = calculateFootprint(baseline);

    // Apply simulation: 50% driving mileage cut (200 * 0.5 = 100 km)
    const simulatedInputs = {
      ...baseline,
      carKmPerWeek: '100'
    };

    const simulated = calculateFootprint(simulatedInputs);

    // Verify savings
    const monthlySavings = current.totalMonthly - simulated.totalMonthly;
    const expectedCarSavings = (100 * 0.20 * 52) / 12; // 100 * 0.2 * 4.3333 = 86.666
    
    expect(monthlySavings).toBeCloseTo(expectedCarSavings, 0);
    expect(simulated.categories.transport).toBeCloseTo(current.categories.transport / 2, 0);
  });

  it('correctly simulates diet optimization and waste reduction changes', () => {
    const baseline = {
      carKmPerWeek: '0',
      publicTripsPerWeek: '0',
      electricityKwhPerMonth: '0',
      meatMealsPerWeek: '6',
      purchasesPerMonth: '0',
      recyclingHabits: 'none'
    };

    const current = calculateFootprint(baseline);

    // Simulate: cut 3 meat meals and recycle everything
    const simulatedInputs = {
      ...baseline,
      meatMealsPerWeek: '3', // 6 - 3
      recyclingHabits: 'all' // none -> all
    };

    const simulated = calculateFootprint(simulatedInputs);

    // Baseline food = 6 * 3 * 4.3333 = 78. Waste = 30. Total = 108.
    // Simulated food = 3 * 3 * 4.3333 = 39. Waste = 9. Total = 48.
    expect(current.categories.food).toBeCloseTo(78.0, 1);
    expect(current.categories.waste).toBe(30.0);

    expect(simulated.categories.food).toBeCloseTo(39.0, 1);
    expect(simulated.categories.waste).toBe(9.0);
  });
});
