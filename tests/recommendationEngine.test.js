import { describe, it, expect } from 'vitest';
import { getRecommendations } from '../lib/recommendationEngine';

describe('Recommendation engine tests', () => {
  it('triggers travel recommendations when driving mileage is high', () => {
    const inputs = {
      carKmPerWeek: '150', // High driving mileage
      publicTripsPerWeek: '0',
      electricityKwhPerMonth: '50',
      meatMealsPerWeek: '1',
      purchasesPerMonth: '1',
      recyclingHabits: 'all'
    };

    const calculations = {
      categories: { transport: 130, electricity: 25, food: 13, shopping: 10, waste: 9 },
      totalMonthly: 187
    };

    const recs = getRecommendations(inputs, calculations, 100);

    const transportRecs = recs.filter(r => r.category === 'Transport');
    expect(transportRecs.length).toBeGreaterThan(0);
    expect(transportRecs[0].title).toContain('Bike or Walk Short Commutes');
  });

  it('triggers diet recommendations when meat consumption is high', () => {
    const inputs = {
      carKmPerWeek: '10',
      publicTripsPerWeek: '0',
      electricityKwhPerMonth: '50',
      meatMealsPerWeek: '8', // High meat meals
      purchasesPerMonth: '1',
      recyclingHabits: 'all'
    };

    const calculations = {
      categories: { transport: 8.7, electricity: 25, food: 104, shopping: 10, waste: 9 },
      totalMonthly: 156.7
    };

    const recs = getRecommendations(inputs, calculations, 100);

    const foodRecs = recs.filter(r => r.category === 'Food');
    expect(foodRecs.length).toBeGreaterThan(0);
    expect(foodRecs[0].title).toContain('Meatless Mondays');
  });

  it('triggers waste recommendations when recycling is none', () => {
    const inputs = {
      carKmPerWeek: '10',
      publicTripsPerWeek: '0',
      electricityKwhPerMonth: '50',
      meatMealsPerWeek: '1',
      purchasesPerMonth: '1',
      recyclingHabits: 'none' // No recycling
    };

    const calculations = {
      categories: { transport: 8.7, electricity: 25, food: 13, shopping: 10, waste: 30 },
      totalMonthly: 86.7
    };

    const recs = getRecommendations(inputs, calculations, 100);

    const wasteRecs = recs.filter(r => r.category === 'Waste');
    expect(wasteRecs.length).toBeGreaterThan(0);
    expect(wasteRecs[0].title).toContain('Home Recycling Station');
  });
});
