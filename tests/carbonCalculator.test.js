import { describe, it, expect } from 'vitest';
import { 
  calculateFootprint, 
  calculateCompleteness, 
  getBreakdownAndOpportunity, 
  getConfidenceLevel 
} from '../lib/carbonCalculator';

describe('Carbon calculation tests', () => {
  it('correctly calculates footprint with zero inputs', () => {
    const inputs = {
      carKmPerWeek: '',
      publicTripsPerWeek: '',
      electricityKwhPerMonth: '',
      meatMealsPerWeek: '',
      purchasesPerMonth: '',
      recyclingHabits: 'none'
    };

    const res = calculateFootprint(inputs);

    // Expect category values to be 0 except for waste baseline of 30.0
    expect(res.categories.transport).toBe(0);
    expect(res.categories.electricity).toBe(0);
    expect(res.categories.food).toBe(0);
    expect(res.categories.shopping).toBe(0);
    expect(res.categories.waste).toBe(30.0);
    expect(res.totalMonthly).toBe(30.0);
    expect(res.totalYearly).toBe(360.0);
  });

  it('correctly calculates footprint with standard values', () => {
    const inputs = {
      carKmPerWeek: '100', // 100 * 0.20 * 4.3333 = 86.7
      publicTripsPerWeek: '4', // 4 * 0.75 * 4.3333 = 13.0
      electricityKwhPerMonth: '200', // 200 * 0.50 = 100
      meatMealsPerWeek: '7', // 7 * 3.00 * 4.3333 = 91.0
      purchasesPerMonth: '5', // 5 * 10 = 50
      recyclingHabits: 'all' // 30 * 0.3 = 9.0
    };

    const res = calculateFootprint(inputs);

    expect(res.categories.transport).toBeCloseTo(99.7, 0); // 86.7 + 13
    expect(res.categories.electricity).toBe(100.0);
    expect(res.categories.food).toBeCloseTo(91.0, 0);
    expect(res.categories.shopping).toBe(50.0);
    expect(res.categories.waste).toBe(9.0);
  });

  it('evaluates completeness & confidence levels accurately', () => {
    const halfInputs = {
      carKmPerWeek: '100',
      publicTripsPerWeek: '',
      electricityKwhPerMonth: '200',
      meatMealsPerWeek: '',
      purchasesPerMonth: '5',
      recyclingHabits: ''
    };

    const comp = calculateCompleteness(halfInputs);
    expect(comp).toBe(50); // 3 of 6 fields completed
    expect(getConfidenceLevel(comp)).toBe('Medium');

    const fullInputs = {
      carKmPerWeek: '100',
      publicTripsPerWeek: '2',
      electricityKwhPerMonth: '200',
      meatMealsPerWeek: '2',
      purchasesPerMonth: '5',
      recyclingHabits: 'some'
    };

    const fullComp = calculateCompleteness(fullInputs);
    expect(fullComp).toBe(100);
    expect(getConfidenceLevel(fullComp)).toBe('High');
  });

  it('determines the breakdown percentage and top improvement opportunities', () => {
    const categories = {
      transport: 200,
      electricity: 100,
      food: 50,
      shopping: 25,
      waste: 25
    };
    const total = 400;

    const { percentages, topOpportunity } = getBreakdownAndOpportunity(categories, total);

    expect(percentages.transport).toBe(50); // 200/400
    expect(percentages.electricity).toBe(25); // 100/400
    expect(topOpportunity).toBe('Transport');
  });
});
