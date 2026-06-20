'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../lib/hooks';
import { calculateFootprint } from '../../lib/carbonCalculator';
import ChartSection from '../../components/ChartSection';

export default function Simulator() {
  const [profile] = useLocalStorage('carbon_profile', null);
  const [mounted, setMounted] = useState(false);

  // Simulator adjustments state - declared at the top to satisfy React's Hook rules
  const [carSwapPct, setCarSwapPct] = useState(0);       // 0% to 100% car travel replaced by biking/walking
  const [meatMealsCut, setMeatMealsCut] = useState(0);    // 0 to baseline meat meals/week
  const [electricityCutPct, setElectricityCutPct] = useState(0); // 0% to 50% electricity reduction
  const [recycleAll, setRecycleAll] = useState(false);    // If true, recycling habit is upgraded to 'all'

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Reset inputs if baseline changes
    setCarSwapPct(0);
    setMeatMealsCut(0);
    setElectricityCutPct(0);
    setRecycleAll(false);
  }, [profile]);

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 py-12 animate-pulse" aria-hidden="true">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded mt-6"></div>
      </div>
    );
  }

  // Default values to use if user has not completed the assessment yet
  const defaultBaseline = {
    carKmPerWeek: '150',
    publicTripsPerWeek: '6',
    electricityKwhPerMonth: '300',
    meatMealsPerWeek: '7',
    purchasesPerMonth: '6',
    recyclingHabits: 'none'
  };

  const baseline = profile || defaultBaseline;

  // Cap meat meal cuts to baseline values
  const maxMeatMeals = parseFloat(baseline.meatMealsPerWeek) || 0;



  // Calculations
  const currentFootprint = calculateFootprint(baseline);

  // Derive simulated inputs based on adjustments
  const simulatedInputs = {
    carKmPerWeek: Math.max(0, (parseFloat(baseline.carKmPerWeek) || 0) * (1 - carSwapPct / 100)).toString(),
    // Assume substituted car kilometers become public transit trips if they don't walk/bike (or keep it simple, public transport stays same)
    publicTripsPerWeek: baseline.publicTripsPerWeek,
    electricityKwhPerMonth: Math.max(0, (parseFloat(baseline.electricityKwhPerMonth) || 0) * (1 - electricityCutPct / 100)).toString(),
    meatMealsPerWeek: Math.max(0, maxMeatMeals - meatMealsCut).toString(),
    purchasesPerMonth: baseline.purchasesPerMonth,
    recyclingHabits: recycleAll ? 'all' : baseline.recyclingHabits
  };

  const simulatedFootprint = calculateFootprint(simulatedInputs);

  // Savings Metrics
  const monthlySavings = Math.max(0, currentFootprint.totalMonthly - simulatedFootprint.totalMonthly);
  const yearlySavings = monthlySavings * 12;
  const reductionPercentage = currentFootprint.totalMonthly > 0
    ? Math.round((monthlySavings / currentFootprint.totalMonthly) * 100)
    : 0;

  // Equivalences
  const treesEquivalent = Math.round(yearlySavings / 22);
  const gasSavedEquivalent = Math.round(yearlySavings * 0.1125); // ~0.1125 gallons per kg CO2 saved

  // Format data for Recharts side-by-side comparison
  const comparisonChartData = [
    { name: 'Baseline Footprint', value: Math.round(currentFootprint.totalMonthly) },
    { name: 'Simulated Footprint', value: Math.round(simulatedFootprint.totalMonthly) }
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title Header */}
      <section className="space-y-3 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          What-If Habit Simulator
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400">
          Adjust travel habits, dietary choices, and home efficiency sliders to project carbon footprint reductions.
        </p>
      </section>

      {!profile && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <span>⚠️</span>
          <span>
            You haven't completed a carbon assessment yet. We are displaying a <strong>national average baseline</strong>. Complete the <a href="/calculator" className="underline font-bold">Calculator Form</a> to simulate adjustments on your real footprint.
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sliders panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-150 border-b border-slate-50 dark:border-slate-800 pb-3">
            Simulation Control panel
          </h3>

          {/* Slider 1: Travel Substitution */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="carSwap" className="font-bold text-slate-700 dark:text-slate-200">
                🚴 Replaced driving mileage: {carSwapPct}%
              </label>
              <span className="text-xs text-slate-400">
                Current mileage: {baseline.carKmPerWeek || 0} km/week
              </span>
            </div>
            <input
              type="range"
              id="carSwap"
              min="0"
              max="100"
              step="5"
              value={carSwapPct}
              onChange={(e) => setCarSwapPct(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Substitute driving with walking, biking, or public transit.
            </p>
          </div>

          {/* Slider 2: Food / Diet swap */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="meatMealsCut" className="font-bold text-slate-700 dark:text-slate-200">
                🍲 Cut weekly meat meals: {meatMealsCut} / {maxMeatMeals}
              </label>
              <span className="text-xs text-slate-400">
                Current diet: {maxMeatMeals} meat meals/week
              </span>
            </div>
            <input
              type="range"
              id="meatMealsCut"
              min="0"
              max={maxMeatMeals}
              step="1"
              value={meatMealsCut}
              disabled={maxMeatMeals === 0}
              onChange={(e) => setMeatMealsCut(Number(e.target.value))}
              className={`w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 ${
                maxMeatMeals === 0 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Swap red meat dishes for low-carbon plant alternatives (lentils, beans).
            </p>
          </div>

          {/* Slider 3: Electricity optimization */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="electricityCut" className="font-bold text-slate-700 dark:text-slate-200">
                💡 Reduce energy footprint: {electricityCutPct}%
              </label>
              <span className="text-xs text-slate-400">
                Current usage: {baseline.electricityKwhPerMonth || 0} kWh/month
              </span>
            </div>
            <input
              type="range"
              id="electricityCut"
              min="0"
              max="50"
              step="5"
              value={electricityCutPct}
              onChange={(e) => setElectricityCutPct(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Cut electricity waste through thermostat adjustment and standby shutdowns. Max reduction 50%.
            </p>
          </div>

          {/* Toggle 4: Waste/Recycling Upgrade */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="recycleAll"
                checked={recycleAll}
                disabled={baseline.recyclingHabits === 'all'}
                onChange={(e) => setRecycleAll(e.target.checked)}
                className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="recycleAll" className="font-semibold text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                ♻️ Upgrade recycling intensity to ALL
              </label>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {baseline.recyclingHabits === 'all' 
                  ? 'Your baseline recycling habit is already set to maximum!'
                  : 'Separates all plastics, glass, paper, and metal products from household trash.'}
              </p>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Simulation Results
            </span>

            <div className="text-center py-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-900/60 space-y-1">
              <span className="block text-5xl font-black text-emerald-600 dark:text-emerald-400">
                -{reductionPercentage}%
              </span>
              <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Footprint Reduced
              </span>
              <p className="text-xs text-slate-550 dark:text-slate-400 pt-2 font-medium">
                Simulated Footprint: <strong>{simulatedFootprint.totalMonthly.toFixed(1)} kg/mo</strong> <br />
                Baseline Footprint: <strong>{currentFootprint.totalMonthly.toFixed(1)} kg/mo</strong>
              </p>
            </div>

            {/* Savings equivalence blocks */}
            {yearlySavings > 0 ? (
              <div className="space-y-4 pt-4 border-t border-slate-55 dark:border-slate-800/40 text-xs">
                <span className="block font-bold text-slate-400 uppercase tracking-wider">
                  Equivalencies Saved
                </span>
                
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label="Trees">🌳</span>
                  <div>
                    <span className="block font-bold text-slate-700 dark:text-slate-200">
                      {treesEquivalent} Mature Trees
                    </span>
                    <span className="text-slate-400 block text-[11px]">
                      Equivalent to growing trees for 10 years.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label="Gasoline">⛽</span>
                  <div>
                    <span className="block font-bold text-slate-700 dark:text-slate-200">
                      {gasSavedEquivalent} Gallons of Gas
                    </span>
                    <span className="text-slate-400 block text-[11px]">
                      Fossil fuel combustion avoided.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                Adjust sliders to simulate habits and view reductions.
              </p>
            )}

            {/* Comparison Bar chart */}
            <div className="pt-4 border-t border-slate-55 dark:border-slate-800/40">
              <ChartSection data={comparisonChartData} type="breakdown" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
