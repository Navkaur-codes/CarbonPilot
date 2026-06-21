'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../../lib/hooks';
import { STORAGE_KEYS } from '../../lib/constants';
import { getRecommendations } from '../../lib/recommendationEngine';
import { getBreakdownAndOpportunity, calculateCompleteness, getConfidenceLevel } from '../../lib/carbonCalculator';
import { loadDemoData, clearAllCarbonData, getStorageItem } from '../../lib/storage';
import { exportResultsToJson } from '../../lib/exportResults';
import { formatDecimal, formatKgToTons } from '../../lib/formatters';
import ChartSection from '../../components/ChartSection';
import RecommendationCard from '../../components/RecommendationCard';
import EmptyState from '../../components/EmptyState';
import ScoreExplanation from '../../components/ScoreExplanation';
import StatCard from '../../components/StatCard';
import MilestoneCard from '../../components/MilestoneCard';

/**
 * Main Carbon Pilot Dashboard Page
 */
export default function Dashboard() {
  const [profile, setProfile] = useLocalStorage(STORAGE_KEYS.PROFILE, null);
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.HISTORY, []);
  const [streak, setStreak] = useLocalStorage(STORAGE_KEYS.STREAK, 0);
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.GOALS, []);

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const latestLog = useMemo(() => {
    return history && history.length > 0 
      ? history[history.length - 1] 
      : { categories: { transport: 0, electricity: 0, food: 0, shopping: 0, waste: 0 }, totalMonthly: 0, totalYearly: 0 };
  }, [history]);

  const completeness = useMemo(() => {
    return calculateCompleteness(profile || {});
  }, [profile]);

  const confidence = useMemo(() => {
    return getConfidenceLevel(completeness);
  }, [completeness]);

  const { percentages, topOpportunity } = useMemo(() => {
    return getBreakdownAndOpportunity(latestLog.categories, latestLog.totalMonthly);
  }, [latestLog]);

  // Dynamic recommendations based on latest log
  const recommendations = useMemo(() => {
    return getRecommendations(profile || {}, latestLog, completeness);
  }, [profile, latestLog, completeness]);

  // Recharts Breakdown data formatting
  const breakdownChartData = useMemo(() => {
    return [
      { name: 'Transport', value: latestLog.categories.transport },
      { name: 'Energy', value: latestLog.categories.electricity },
      { name: 'Food', value: latestLog.categories.food },
      { name: 'Shopping', value: latestLog.categories.shopping },
      { name: 'Waste', value: latestLog.categories.waste },
    ].filter(item => item.value > 0);
  }, [latestLog]);

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 py-12 animate-pulse" aria-hidden="true">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded mt-6"></div>
      </div>
    );
  }

  // Trigger Demo Data loading
  const handleLoadDemo = () => {
    setLoading(true);
    loadDemoData();
    setProfile(getStorageItem(STORAGE_KEYS.PROFILE, null));
    setHistory(getStorageItem(STORAGE_KEYS.HISTORY, []));
    setStreak(getStorageItem(STORAGE_KEYS.STREAK, 0));
    setGoals(getStorageItem(STORAGE_KEYS.GOALS, []));
    setLoading(false);
  };

  // Reset all carbon logs
  const handleResetData = () => {
    if (confirm('Are you sure you want to delete all assessments, history, and goals? This action cannot be undone.')) {
      clearAllCarbonData();
      setProfile(null);
      setHistory([]);
      setStreak(0);
      setGoals([]);
    }
  };

  // Toggle goal check box status
  const toggleGoal = (index) => {
    const nextGoals = [...goals];
    nextGoals[index].completed = !nextGoals[index].completed;
    setGoals(nextGoals);
  };

  // Export JSON Report wrapper
  const handleExport = () => {
    if (!profile) return;
    const completeness = calculateCompleteness(profile);
    const lastHistory = history[history.length - 1] || { categories: { transport: 0, electricity: 0, food: 0, shopping: 0, waste: 0 }, totalMonthly: 0 };
    const { topOpportunity } = getBreakdownAndOpportunity(lastHistory.categories, lastHistory.totalMonthly);
    const activeRecommendations = getRecommendations(profile, lastHistory, completeness);

    exportResultsToJson(profile, lastHistory, activeRecommendations, topOpportunity);
  };



  // Empty state handling
  if (!history || history.length === 0) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
        <section className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Footprint Coach Dashboard
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            Analytics and tracking will unlock once you fill in your first calculator entry.
          </p>
        </section>

        <EmptyState 
          title="No Carbon Logs Found" 
          description="We need at least one carbon assessment to draw trends, map breakdown charts, and unlock custom recommendation coaching." 
          actionText="Complete First Assessment"
          actionHref="/calculator"
        />

        <div className="flex justify-center pt-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl text-center space-y-4 max-w-sm shadow-sm">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 block">
              Prefer to see it in action immediately?
            </span>
            <button
              onClick={handleLoadDemo}
              className="w-full py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl transition focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              ⚡ Load Demo Data
            </button>
          </div>
        </div>
      </div>
    );
  }



  // Calculate dynamic insights if history has at least 2 entries
  let pctTotalChange = 0;
  let maxCatName = '';
  let catChangeDirection = '↓';
  let catChangePct = 0;

  if (history.length >= 2) {
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    const diffTotal = previous.totalMonthly - current.totalMonthly;
    pctTotalChange = previous.totalMonthly > 0 ? Math.round((diffTotal / previous.totalMonthly) * 100) : 0;

    let maxCatDiff = -1;
    const categoryMapping = {
      transport: 'Transport',
      electricity: 'Energy',
      food: 'Food',
      shopping: 'Shopping',
      waste: 'Waste'
    };

    Object.keys(current.categories).forEach(cat => {
      const prevVal = previous.categories[cat] || 0;
      const currVal = current.categories[cat] || 0;
      const diff = prevVal - currVal;
      if (Math.abs(diff) > maxCatDiff) {
        maxCatDiff = Math.abs(diff);
        maxCatName = categoryMapping[cat] || cat;
        catChangeDirection = diff >= 0 ? '↓' : '↑';
        catChangePct = prevVal > 0 ? Math.round((Math.abs(diff) / prevVal) * 100) : 0;
      }
    });
  }

  // Generate dynamic achievements list based on logs history
  const milestones = [
    {
      id: 'ach-first',
      title: 'Completed First Assessment',
      desc: 'Logged at least one footprint profile entry.',
      unlocked: history.length >= 1,
      icon: '🌱',
    },
    {
      id: 'ach-eco-conscious',
      title: 'Generated First Plan',
      desc: 'Structured a personalized weekly goals planner.',
      unlocked: goals && goals.length > 0,
      icon: '🛡️',
    },
    {
      id: 'ach-green-commute',
      title: 'Ran First Simulation',
      desc: 'Adjusted habit sliders inside the Simulator.',
      unlocked: history.length >= 1,
      icon: '🚴',
    }
  ];



  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title Header with Export/Reset actions */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Footprint Coach Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track historical trends, complete weekly milestones, and view customized recommendations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center gap-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            aria-label="Export carbon assessment results as a JSON report"
          >
            <span>📥</span> Export Report (.json)
          </button>
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-1 focus:ring-2 focus:ring-slate-400 focus:outline-none"
            aria-label="Reset and delete all local carbon data"
          >
            <span>🗑️</span> Reset Data
          </button>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Footprint Stats Summary">
        <StatCard 
          title="Latest Footprint" 
          value={latestLog.totalMonthly.toFixed(1)} 
          unit=" kg/mo" 
        />
        <StatCard 
          title="Yearly Projection" 
          value={formatKgToTons(latestLog.totalYearly)} 
          unit=" tons/yr" 
        />
        <StatCard 
          title="Reduction Streak" 
          value={streak} 
          unit=" logs improved" 
          icon="🔥 " 
        />
        <StatCard 
          title="Form Confidence" 
          value={`${completeness}%`} 
          unit={` ${confidence}`} 
        />
      </section>

      {/* Dynamic Insights Panel */}
      {history.length >= 2 && (
        <section className="p-6 bg-emerald-500/5 border border-emerald-100 dark:border-slate-800 rounded-2xl space-y-2" aria-label="Carbon Intelligence Insights">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-base">
            <span>💡</span> Carbon Intelligence Insights
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Your carbon footprint is{' '}
            <strong className={pctTotalChange >= 0 ? "text-emerald-600" : "text-rose-600 font-bold"}>
              {Math.abs(pctTotalChange)}% {pctTotalChange >= 0 ? 'lower' : 'higher'}
            </strong>{' '}
            than your previous estimate.
          </p>
          {maxCatName && (
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Largest sector shift: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{maxCatName} {catChangeDirection} {catChangePct}%</span>
            </div>
          )}
        </section>
      )}

      {/* Chart Section */}
      <section className="grid lg:grid-cols-2 gap-8" aria-label="Emissions Analytics Charts">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Assessment History Trend
          </h3>
          <ChartSection data={history} type="trend" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Category Breakdown (kg CO₂)
          </h3>
          <ChartSection data={breakdownChartData} type="breakdown" />
        </div>
      </section>

      {/* Score Explanation panel */}
      <section aria-label="Assessment Feedback Explainer">
        <ScoreExplanation 
          categories={latestLog.categories} 
          totalMonthly={latestLog.totalMonthly} 
          percentages={percentages} 
          topOpportunity={topOpportunity} 
        />
      </section>

      {/* Weekly Goal Tracker */}
      {goals && goals.length > 0 && (
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6" aria-labelledby="goals-heading">
          <div className="space-y-1">
            <h3 id="goals-heading" className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Personalized 3-Week Goal Tracker
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Actions customized to tackle your primary emissions sources. Check weekly goals to track your progress!
            </p>
          </div>

          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div 
                key={index} 
                className={`flex gap-4 p-4 rounded-2xl border transition duration-150 ${
                  goal.completed 
                    ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800 opacity-60' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    id={`goal-checkbox-${index}`}
                    checked={goal.completed}
                    onChange={() => toggleGoal(index)}
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                    aria-label={`Mark as completed: ${goal.title}`}
                  />
                </div>
                <div className="space-y-1">
                  <label 
                    htmlFor={`goal-checkbox-${index}`} 
                    className={`font-semibold text-sm sm:text-base cursor-pointer ${
                      goal.completed 
                        ? 'line-through text-slate-400' 
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {goal.title}
                  </label>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {goal.action}
                  </p>
                  <span className="inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md mt-1">
                    Target: {goal.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Coaching Suggestions */}
      <section className="space-y-6" aria-labelledby="coach-recommendations">
        <div className="space-y-1">
          <h3 id="coach-recommendations" className="text-xl font-bold text-slate-800 dark:text-slate-100">
            🤖 Active Coaching Suggestions
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Real-time rule-based insights triggered by your consumption footprint parameters.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      </section>

      {/* Progress & Milestones Wall */}
      <section className="space-y-6" aria-labelledby="milestones-heading">
        <div className="space-y-1">
          <h3 id="milestones-heading" className="text-xl font-bold text-slate-800 dark:text-slate-100">
            🏆 Milestones & Progress
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Track your milestones as you build eco-friendly routines and log carbon profiles.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {milestones.map((ach) => (
            <MilestoneCard key={ach.id} ach={ach} />
          ))}
        </div>
      </section>
    </div>
  );
}
