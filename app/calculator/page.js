'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '../../lib/hooks';
import { STORAGE_KEYS, DEFAULT_PROFILE, VALIDATION_LIMITS } from '../../lib/constants';
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
import InputField from '../../components/InputField';
import CalculatorPreview from '../../components/CalculatorPreview';

/**
 * Main Carbon Calculator Page
 */
export default function Calculator() {
  const router = useRouter();
  const [profile, setProfile] = useLocalStorage(STORAGE_KEYS.PROFILE, { ...DEFAULT_PROFILE });
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.HISTORY, []);
  const [streak, setStreak] = useLocalStorage(STORAGE_KEYS.STREAK, 0);
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.GOALS, []);

  const [formValues, setFormValues] = useState({ ...DEFAULT_PROFILE });
  const [errors, setErrors] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load existing profile values into local form state upon mount
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

  // Real-time calculation previews
  const calculations = calculateFootprint(formValues);
  const completeness = calculateCompleteness(formValues);
  const { percentages, topOpportunity } = getBreakdownAndOpportunity(calculations.categories, calculations.totalMonthly);
  const equivalents = getEquivalenceExplanation(calculations.totalYearly);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
    
    // Final check validation
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

    // Simulated loading delay
    setTimeout(() => {
      setProfile(formValues);

      const formattedDate = new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      const newLog = {
        date: formattedDate,
        totalMonthly: calculations.totalMonthly,
        totalYearly: calculations.totalYearly,
        categories: calculations.categories,
        completeness
      };

      // Determine streak: increment if carbon footprint decreases relative to the previous history log
      let nextStreak = streak;
      if (history && history.length > 0) {
        const lastLog = history[history.length - 1];
        if (newLog.totalMonthly < lastLog.totalMonthly) {
          nextStreak += 1;
        } else if (newLog.totalMonthly > lastLog.totalMonthly) {
          nextStreak = 0; // reset streak if footprint increases
        }
      } else {
        nextStreak = 1;
      }

      setStreak(nextStreak);
      setHistory(prevHistory => [...(prevHistory || []), newLog]);

      // Generate customized actionable goals
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
      {/* Header section */}
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
          {/* Form container */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleFormSubmit} className="space-y-8" noValidate>
              
              {/* Transport section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>🚗</span> Transport Habits
                </legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputField
                    id="carKmPerWeek"
                    name="carKmPerWeek"
                    label="Car Mileage (km/week)"
                    value={formValues.carKmPerWeek}
                    onChange={handleInputChange}
                    placeholder="e.g. 150"
                    error={errors.carKmPerWeek}
                    max={VALIDATION_LIMITS.carKmPerWeek.max}
                    icon="🚗"
                  />
                  <InputField
                    id="publicTripsPerWeek"
                    name="publicTripsPerWeek"
                    label="Public Transit (trips/week)"
                    value={formValues.publicTripsPerWeek}
                    onChange={handleInputChange}
                    placeholder="e.g. 10"
                    error={errors.publicTripsPerWeek}
                    max={VALIDATION_LIMITS.publicTripsPerWeek.max}
                    icon="🚇"
                  />
                </div>
              </fieldset>

              {/* Energy section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>💡</span> Household Energy
                </legend>
                <InputField
                  id="electricityKwhPerMonth"
                  name="electricityKwhPerMonth"
                  label="Electricity consumption (kWh/month)"
                  value={formValues.electricityKwhPerMonth}
                  onChange={handleInputChange}
                  placeholder="e.g. 250"
                  error={errors.electricityKwhPerMonth}
                  max={VALIDATION_LIMITS.electricityKwhPerMonth.max}
                  icon="💡"
                />
              </fieldset>

              {/* Food & Diet section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>🍲</span> Food & Diet
                </legend>
                <InputField
                  id="meatMealsPerWeek"
                  name="meatMealsPerWeek"
                  label="Meat meals consumed (meals/week)"
                  value={formValues.meatMealsPerWeek}
                  onChange={handleInputChange}
                  placeholder="e.g. 7"
                  error={errors.meatMealsPerWeek}
                  max={VALIDATION_LIMITS.meatMealsPerWeek.max}
                  icon="🍲"
                />
              </fieldset>

              {/* Shopping & Waste section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>🛍️</span> Shopping & Waste
                </legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputField
                    id="purchasesPerMonth"
                    name="purchasesPerMonth"
                    label="New Purchases (items/month)"
                    value={formValues.purchasesPerMonth}
                    onChange={handleInputChange}
                    placeholder="e.g. 5"
                    error={errors.purchasesPerMonth}
                    max={VALIDATION_LIMITS.purchasesPerMonth.max}
                    icon="🛍️"
                  />
                  <div className="space-y-1.5 w-full">
                    <label htmlFor="recyclingHabits" className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      <span>♻️</span> Recycling Habits
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
            <CalculatorPreview
              calculations={calculations}
              completeness={completeness}
              percentages={percentages}
              equivalents={equivalents}
            />
          </div>
        </div>
      )}

      {/* Score Explanation */}
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
