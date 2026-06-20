/**
 * CARBONPILOT - SSR-safe LocalStorage Storage Helpers
 */

/**
 * Checks if the execution is happening on the client.
 */
export const isClient = typeof window !== 'undefined';

/**
 * Reads from LocalStorage safely.
 */
export function getStorageItem(key, defaultValue) {
  if (!isClient) return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading key "${key}" from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Writes to LocalStorage safely.
 */
export function setStorageItem(key, value) {
  if (!isClient) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing key "${key}" to localStorage:`, error);
  }
}

/**
 * Clears keys.
 */
export function removeStorageItem(key) {
  if (!isClient) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
  }
}

/**
 * Resets all CarbonPilot user storage data.
 */
export function clearAllCarbonData() {
  if (!isClient) return;
  removeStorageItem('carbon_profile');
  removeStorageItem('carbon_history');
  removeStorageItem('carbon_streak');
  removeStorageItem('carbon_goals');
}

/**
 * Generates and saves mock demo data for testing and valuation.
 */
export function loadDemoData() {
  const mockProfile = {
    carKmPerWeek: '120',
    publicTripsPerWeek: '8',
    electricityKwhPerMonth: '250',
    meatMealsPerWeek: '6',
    purchasesPerMonth: '5',
    recyclingHabits: 'some'
  };

  // Mock historical logs for Recharts
  const mockHistory = [
    {
      date: 'Feb 2026',
      totalMonthly: 410.5,
      totalYearly: 4926.0,
      categories: { transport: 210, electricity: 125, food: 45, shopping: 20, waste: 10.5 },
      completeness: 85,
    },
    {
      date: 'Mar 2026',
      totalMonthly: 380.0,
      totalYearly: 4560.0,
      categories: { transport: 180, electricity: 125, food: 40, shopping: 25, waste: 10.0 },
      completeness: 100,
    },
    {
      date: 'Apr 2026',
      totalMonthly: 350.2,
      totalYearly: 4202.4,
      categories: { transport: 160, electricity: 110, food: 35, shopping: 35, waste: 10.2 },
      completeness: 100,
    },
    {
      date: 'May 2026',
      totalMonthly: 310.8,
      totalYearly: 3729.6,
      categories: { transport: 130, electricity: 110, food: 30, shopping: 30, waste: 10.8 },
      completeness: 100,
    }
  ];

  const mockGoals = [
    {
      week: 1,
      title: 'Week 1: Focus on Transport',
      action: 'Reduce car travel by 10% or substitute 2 short drives with biking/walking.',
      target: '10% reduction in transport carbon',
      completed: true,
    },
    {
      week: 2,
      title: 'Week 2: Focus on Energy',
      action: 'Unplug standby electronics, switch off idle lights, and optimize thermostat by 1°C.',
      target: '10% reduction in electricity consumption',
      completed: false,
    },
    {
      week: 3,
      title: 'Week 3: Maintain and Benchmark',
      action: 'Review your total footprint, log a new weekly entry on the CarbonPilot, and lock in your new baseline.',
      target: 'Consolidate new eco-habits',
      completed: false,
    }
  ];

  setStorageItem('carbon_profile', mockProfile);
  setStorageItem('carbon_history', mockHistory);
  setStorageItem('carbon_streak', 3);
  setStorageItem('carbon_goals', mockGoals);
}
