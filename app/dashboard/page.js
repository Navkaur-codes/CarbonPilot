'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../lib/hooks';
import { getRecommendations } from '../../lib/recommendationEngine';
import { getBreakdownAndOpportunity, calculateCompleteness } from '../../lib/carbonCalculator';
import { loadDemoData, clearAllCarbonData } from '../../lib/storage';
import { exportResultsToJson } from '../../lib/exportResults';
import ChartSection from '../../components/ChartSection';
import RecommendationCard from '../../components/RecommendationCard';
import EmptyState from '../../components/EmptyState';
import ScoreExplanation from '../../components/ScoreExplanation';

export default function Dashboard() {
  const [profile, setProfile] = useLocalStorage('carbon_profile', null);
  const [history, setHistory] = useLocalStorage('carbon_history', []);
  const [streak, setStreak] = useLocalStorage('carbon_streak', 0);
  const [goals, setGoals] = useLocalStorage('carbon_goals', []);

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    // Short simulated loader for smooth transition
    setTimeout(() => {
      loadDemoData();
      // Reload states by accessing localStorage values manually to trigger refresh
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 300);
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

  // Toggle goal check box
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

  // Load calculations from latest history entry
  const latestLog = history[history.length - 1];
  const completeness = calculateCompleteness(profile || {});
  const { percentages, topOpportunity } = getBreakdownAndOpportunity(latestLog.categories, latestLog.totalMonthly);

  // Generate dynamic achievements list based on history values
  const achievements = [
    {
      id: 'ach-first',
      title: 'First Step',
      desc: 'Completed your first carbon assessment log.',
      unlocked: history.length >= 1,
      icon: '🌱',
    },
    {
      id: 'ach-eco-conscious',
      title: 'Eco Conscious',
      desc: 'Yearly footprint is below the US average (16 tons).',
      unlocked: latestLog.totalYearly < 16000,
      icon: '🛡️',
    },
    {
      id: 'ach-green-commute',
      title: 'Green Commuter',
      desc: 'Drive less than 50 km per week.',
      unlocked: parseFloat(profile?.carKmPerWeek) < 50,
      icon: '🚴',
    },
    {
      id: 'ach-diet-champ',
      title: 'Green Diet Champion',
      desc: 'Have 0 weekly meat meals.',
      unlocked: parseFloat(profile?.meatMealsPerWeek) === 0,
      icon: '🥗',
    },
    {
      id: 'ach-recycler',
      title: 'Zero Waste Hero',
      desc: 'Recycle all eligible household products.',
      unlocked: profile?.recyclingHabits === 'all',
      icon: '♻️',
    },
    {
      id: 'ach-streaker',
      title: 'Super Streaker',
      desc: 'Improve footprint across 3 consecutive assessments.',
      unlocked: streak >= 3,
      icon: '🔥',
    }
  ];

  // Dynamic recommendations based on latest log
  const recommendations = getRecommendations(profile || {}, latestLog, completeness);

  // Recharts Breakdown data formatting
  const breakdownChartData = [
    { name: 'Transport', value: latestLog.categories.transport },
    { name: 'Energy', value: latestLog.categories.electricity },
    { name: 'Food', value: latestLog.categories.food },
    { name: 'Shopping', value: latestLog.categories.shopping },
    { name: 'Waste', value: latestLog.categories.waste },
  ].filter(item => item.value > 0);

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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-505 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center gap-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            aria-label="Export carbon assessment results as a JSON report"
          >
            <span>📥</span> Export Report (.json)
          </button>
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-1 focus:ring-2 focus:ring-slate-400 focus:outline-none"
            aria-label="Reset and delete all local carbon data"
          >
            <span>🗑️</span> Reset Data
          </button>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Footprint Stats Summary">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Latest Footprint
          </span>
          <span className="block text-3xl font-black text-emerald-600 dark:text-emerald-450">
            {latestLog.totalMonthly.toFixed(1)} <span className="text-sm font-semibold text-slate-400">kg/mo</span>
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Yearly Projection
          </span>
          <span className="block text-3xl font-black text-emerald-600 dark:text-emerald-450">
            {(latestLog.totalYearly / 1000).toFixed(2)} <span className="text-sm font-semibold text-slate-400">tons/yr</span>
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Reduction Streak
          </span>
          <span className="block text-3xl font-black text-emerald-600 dark:text-emerald-450 flex items-center gap-1.5">
            🔥 {streak} <span className="text-sm font-semibold text-slate-400">logs improved</span>
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Form Confidence
          </span>
          <span className="block text-3xl font-black text-emerald-600 dark:text-emerald-450">
            {completeness}% <span className="text-sm font-semibold text-slate-400">High</span>
          </span>
        </div>
      </section>

      {/* Chart Section */}
      <section className="grid lg:grid-cols-2 gap-8" aria-label="Emissions Analytics Charts">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-150">
            Assessment History Trend
          </h3>
          <ChartSection data={history} type="trend" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-150">
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

      {/* Weekly Goal Planner */}
      {goals && goals.length > 0 && (
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6" aria-labelledby="goals-heading">
          <div className="space-y-1">
            <h3 id="goals-heading" className="text-xl font-bold text-slate-800 dark:text-slate-150">
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
                        ? 'line-through text-slate-405' 
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {goal.title}
                  </label>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {goal.action}
                  </p>
                  <span className="inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md mt-1">
                    Target: {goal.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Coaching Recommendations */}
      <section className="space-y-6" aria-labelledby="coach-recommendations">
        <div className="space-y-1">
          <h3 id="coach-recommendations" className="text-xl font-bold text-slate-800 dark:text-slate-150">
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

      {/* Achievements Wall */}
      <section className="space-y-6" aria-labelledby="achievements-heading">
        <div className="space-y-1">
          <h3 id="achievements-heading" className="text-xl font-bold text-slate-800 dark:text-slate-150">
            🏆 Achievements & Badges
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Unlock credentials as you make eco-friendly reductions and log carbon metrics.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div 
              key={ach.id} 
              className={`p-5 rounded-2xl border transition duration-150 text-center flex flex-col items-center justify-center space-y-2 ${
                ach.unlocked 
                  ? 'bg-emerald-500/5 border-emerald-100 dark:border-emerald-900/30' 
                  : 'bg-slate-50/20 border-slate-100 dark:border-slate-900/40 opacity-40 grayscale'
              }`}
            >
              <span className="text-4xl" role="img" aria-label={ach.title}>{ach.icon}</span>
              <div>
                <span className="block font-bold text-sm text-slate-800 dark:text-slate-150">{ach.title}</span>
                <span className="block text-[11px] text-slate-450 mt-0.5">{ach.desc}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                ach.unlocked 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {ach.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
