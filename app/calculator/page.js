'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '../../lib/hooks';
import { 
  calculateFootprint, 
  calculateCompleteness, 
  getBreakdownAndOpportunity, 
  getEquivalenceExplanation 
} from '../../lib/carbonCalculator';
import { validateCarbonInputs, sanitizeString } from '../../lib/validation';
import { generateWeeklyPlan } from '../../lib/goalPlanner';
import LoadingCard from '../../components/LoadingCard';
import ScoreExplanation from '../../components/ScoreExplanation';
import ErrorState from '../../components/ErrorState';

export default function Calculator() {
  const router = useRouter();
  const [profile, setProfile] = useLocalStorage('carbon_profile', {
    carKmPerWeek: '',
    publicTripsPerWeek: '',
    electricityKwhPerMonth: '',
    meatMealsPerWeek: '',
    purchasesPerMonth: '',
    recyclingHabits: 'none'
  });
  
  const [history, setHistory] = useLocalStorage('carbon_history', []);
  const [streak, setStreak] = useLocalStorage('carbon_streak', 0);
  const [goals, setGoals] = useLocalStorage('carbon_goals', []);

  const [formValues, setFormValues] = useState({
    carKmPerWeek: '',
    publicTripsPerWeek: '',
    electricityKwhPerMonth: '',
    meatMealsPerWeek: '',
    purchasesPerMonth: '',
    recyclingHabits: 'none'
  });

  // Load existing profile values into local form state upon client mount
  useEffect(() => {
    if (profile) {
      setFormValues({
        carKmPerWeek: profile.carKmPerWeek || '',
        publicTripsPerWeek: profile.publicTripsPerWeek || '',
        electricityKwhPerMonth: profile.electricityKwhPerMonth || '',
        meatMealsPerWeek: profile.meatMealsPerWeek || '',
        purchasesPerMonth: profile.purchasesPerMonth || '',
        recyclingHabits: profile.recyclingHabits || 'none'
      });
    }
  }, [profile]);

  const [errors, setErrors] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time calculation preview
  const calculations = calculateFootprint(formValues);
  const completeness = calculateCompleteness(formValues);
  const { percentages, topOpportunity } = getBreakdownAndOpportunity(calculations.categories, calculations.totalMonthly);
  const equivalents = getEquivalenceExplanation(calculations.totalYearly);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize string value
    const sanitizedVal = sanitizeString(value);
    
    const updatedValues = {
      ...formValues,
      [name]: sanitizedVal
    };
    
    setFormValues(updatedValues);

    // Validate in real time
    const validation = validateCarbonInputs(updatedValues);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, [name]: validation.errors[name] }));
    } else {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Submit assessment and save to storage
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Perform final check
    const validation = validateCarbonInputs(formValues);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSubmissionError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setSubmissionError(false);
    setCalculating(true);

    // Simulate polished 450ms calculation load
    setTimeout(() => {
      // Save profile inputs
      setProfile(formValues);

      // Write to history log
      const formattedDate = new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      
      const newLog = {
        date: formattedDate,
        totalMonthly: calculations.totalMonthly,
        totalYearly: calculations.totalYearly,
        categories: calculations.categories,
        completeness
      };

      // Determine streak: increment if current footprint is lower than the previous log
      let nextStreak = streak;
      if (history.length > 0) {
        const lastLog = history[history.length - 1];
        if (newLog.totalMonthly < lastLog.totalMonthly) {
          nextStreak += 1;
        } else if (newLog.totalMonthly > lastLog.totalMonthly) {
          nextStreak = 0; // reset streak if emissions increased
        }
      } else {
        nextStreak = 1; // start first streak
      }

      setStreak(nextStreak);
      setHistory(prevHistory => [...prevHistory, newLog]);

      // Generate actionable weekly goals automatically
      const generatedGoals = generateWeeklyPlan(calculations.categories);
      setGoals(generatedGoals);

      setCalculating(false);
      router.push('/dashboard');
    }, 450);
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 py-12 animate-pulse" aria-hidden="true">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded mt-6"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Page Title */}
      <section className="space-y-3 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          Carbon Assessment Calculator
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400">
          Enter your lifestyle parameters below. Values are calculated instantly as you type.
        </p>
      </section>

      {submissionError && (
        <ErrorState 
          title="Validation Failure" 
          message="Please resolve all negative numbers or text errors in the form inputs before logging calculations." 
          onReset={() => setSubmissionError(false)} 
        />
      )}

      {calculating ? (
        <div className="max-w-xl mx-auto space-y-6 py-12">
          <p className="text-center font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
            🤖 Coach Pilot is calculating carbon breakdowns and prioritizing recommendations...
          </p>
          <LoadingCard count={2} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleFormSubmit} className="space-y-8" noValidate>
              
              {/* Transport section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>🚗</span> Transport Habits
                </legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="carKmPerWeek" className="block text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                      Car Mileage (km/week)
                    </label>
                    <input
                      type="number"
                      id="carKmPerWeek"
                      name="carKmPerWeek"
                      value={formValues.carKmPerWeek}
                      onChange={handleInputChange}
                      placeholder="e.g. 150"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm"
                      aria-invalid={!!errors.carKmPerWeek}
                      aria-describedby={errors.carKmPerWeek ? "carKm-error" : undefined}
                    />
                    {errors.carKmPerWeek && (
                      <span id="carKm-error" className="text-xs text-red-500 block font-medium">
                        {errors.carKmPerWeek}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="publicTripsPerWeek" className="block text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                      Public Transit (trips/week)
                    </label>
                    <input
                      type="number"
                      id="publicTripsPerWeek"
                      name="publicTripsPerWeek"
                      value={formValues.publicTripsPerWeek}
                      onChange={handleInputChange}
                      placeholder="e.g. 10"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm"
                      aria-invalid={!!errors.publicTripsPerWeek}
                      aria-describedby={errors.publicTripsPerWeek ? "publicTrips-error" : undefined}
                    />
                    {errors.publicTripsPerWeek && (
                      <span id="publicTrips-error" className="text-xs text-red-500 block font-medium">
                        {errors.publicTripsPerWeek}
                      </span>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Energy section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>💡</span> Household Energy
                </legend>
                <div className="space-y-1">
                  <label htmlFor="electricityKwhPerMonth" className="block text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                    Electricity consumption (kWh/month)
                  </label>
                  <input
                    type="number"
                    id="electricityKwhPerMonth"
                    name="electricityKwhPerMonth"
                    value={formValues.electricityKwhPerMonth}
                    onChange={handleInputChange}
                    placeholder="e.g. 250"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm"
                    aria-invalid={!!errors.electricityKwhPerMonth}
                    aria-describedby={errors.electricityKwhPerMonth ? "electricity-error" : undefined}
                  />
                  {errors.electricityKwhPerMonth && (
                    <span id="electricity-error" className="text-xs text-red-500 block font-medium">
                      {errors.electricityKwhPerMonth}
                    </span>
                  )}
                </div>
              </fieldset>

              {/* Food & Diet Section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>🍲</span> Food & Diet
                </legend>
                <div className="space-y-1">
                  <label htmlFor="meatMealsPerWeek" className="block text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                    Meat meals consumed (meals/week)
                  </label>
                  <input
                    type="number"
                    id="meatMealsPerWeek"
                    name="meatMealsPerWeek"
                    value={formValues.meatMealsPerWeek}
                    onChange={handleInputChange}
                    placeholder="e.g. 7"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm"
                    aria-invalid={!!errors.meatMealsPerWeek}
                    aria-describedby={errors.meatMealsPerWeek ? "meat-error" : undefined}
                  />
                  {errors.meatMealsPerWeek && (
                    <span id="meat-error" className="text-xs text-red-500 block font-medium">
                      {errors.meatMealsPerWeek}
                    </span>
                  )}
                </div>
              </fieldset>

              {/* Shopping & waste section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>🛍️</span> Shopping & Waste
                </legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="purchasesPerMonth" className="block text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                      New Purchases (items/month)
                    </label>
                    <input
                      type="number"
                      id="purchasesPerMonth"
                      name="purchasesPerMonth"
                      value={formValues.purchasesPerMonth}
                      onChange={handleInputChange}
                      placeholder="e.g. 5"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm"
                      aria-invalid={!!errors.purchasesPerMonth}
                      aria-describedby={errors.purchasesPerMonth ? "purchases-error" : undefined}
                    />
                    {errors.purchasesPerMonth && (
                      <span id="purchases-error" className="text-xs text-red-500 block font-medium">
                        {errors.purchasesPerMonth}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="recyclingHabits" className="block text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                      Recycling Habits
                    </label>
                    <select
                      id="recyclingHabits"
                      name="recyclingHabits"
                      value={formValues.recyclingHabits}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm font-medium"
                    >
                      <option value="none">No consistent recycling</option>
                      <option value="some">Recycle some materials</option>
                      <option value="all">Recycle all possible materials</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={Object.keys(errors).length > 0}
                className={`w-full py-4 rounded-2xl font-bold shadow-md transition focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  Object.keys(errors).length > 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                }`}
              >
                Log Assessment & View Dashboard
              </button>
            </form>
          </div>

          {/* Real-time Side Preview */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 sticky top-24">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                ⚡ Real-time preview
              </span>
              
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-900/60">
                <span className="block text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400">
                  {calculations.totalMonthly.toFixed(1)}
                </span>
                <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                  kg CO₂ / month
                </span>
                <span className="block text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Yearly Projection: <strong className="text-slate-700 dark:text-slate-300">{calculations.totalYearly.toFixed(1)} kg</strong>
                </span>
              </div>

              {/* Completeness / Confidence */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                  <span>Confidence Level:</span>
                  <span className="text-emerald-500">{completeness}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${completeness}%` }}
                  ></div>
                </div>
              </div>

              {/* Breakdown Percentages */}
              {calculations.totalMonthly > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800/40">
                  <span className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                    Breakdown
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">🚗 Transport</span>
                      <span className="font-bold">{percentages.transport}%</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">💡 Energy</span>
                      <span className="font-bold">{percentages.electricity}%</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">🍲 Food</span>
                      <span className="font-bold">{percentages.food}%</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">🛍️ Shopping</span>
                      <span className="font-bold">{percentages.shopping}%</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">♻️ Waste</span>
                      <span className="font-bold">{percentages.waste}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Equivalence Visual */}
              {calculations.totalYearly > 0 && (
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800/40 text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-emerald-500/5 p-4 rounded-xl">
                  <span className="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                    Equivalence
                  </span>
                  <p>
                    Your yearly carbon footprint requires <strong>{equivalents.trees} mature trees</strong> growing for 10 years to absorb.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Explainer Panel on the bottom for calculated users */}
      {!calculating && calculations.totalMonthly > 0 && (
        <section className="mt-8">
          <ScoreExplanation 
            categories={calculations.categories} 
            totalMonthly={calculations.totalMonthly} 
            percentages={percentages} 
            topOpportunity={topOpportunity} 
          />
        </section>
      )}
    </div>
  );
}
