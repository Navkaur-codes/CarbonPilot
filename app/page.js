'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  // Impact stories numbers
  const numUsers = 100;
  const targetReductionPct = 10;
  const avgFootprintTons = 16; // US average tons/year
  
  const totalReductionTons = ((numUsers * avgFootprintTons) * (targetReductionPct / 100)).toFixed(0);
  const treesPlantedEquivalent = Math.round((totalReductionTons * 1000) / 22).toLocaleString();
  const gasGallonsEquivalent = Math.round(totalReductionTons * 112.5).toLocaleString(); // roughly 112.5 gallons per ton

  return (
    <div className="space-y-12 sm:space-y-16 animate-fadeIn">
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-8 sm:p-12 md:p-16 shadow-lg"
        aria-labelledby="hero-title"
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md text-emerald-100 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-white/5">
            🌍 Meet Your Carbon Pilot
          </span>
          <h1 
            id="hero-title"
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
          >
            Take Control of Your <br className="hidden sm:inline" />
            <span className="text-emerald-300">Environmental Footprint</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-emerald-100/90 leading-relaxed font-medium">
            Measure your footprint, simulate habit adjustments, and receive personalized coaching—securely in your browser.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/calculator"
              className="px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-800 font-bold rounded-xl shadow-md transition focus:ring-2 focus:ring-emerald-300 focus:outline-none"
            >
              Start Carbon Assessment
            </Link>
            <Link
              href="/simulator"
              className="px-6 py-3 bg-emerald-700/50 hover:bg-emerald-700/70 border border-emerald-500/20 text-white font-semibold rounded-xl shadow-md transition focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              Habit Simulator
            </Link>
          </div>
        </div>

        {/* Decorative SVG shapes for premium styling */}
        <div className="absolute right-4 bottom-4 top-4 w-1/3 hidden md:flex items-center justify-center opacity-20 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className="w-64 h-64 text-white">
            <circle cx="50" cy="50" r="45" strokeDasharray="4 4" className="opacity-60" />
            <circle cx="50" cy="50" r="38" />
            <path d="M50 22 C62 32 62 55 50 68 C38 55 38 32 50 22 Z" fill="currentColor" stroke="none" />
            <path d="M50 68 L50 76" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* Feature Spotlights */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-labelledby="features-title">
        <h2 id="features-title" className="sr-only">App Features</h2>
        
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-3">
          <div className="text-3xl" aria-hidden="true">🧮</div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">1. Carbon Calculator</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Record commute, public transit, energy, diet, and shopping inputs to project your footprint by category.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-3">
          <div className="text-3xl" aria-hidden="true">🤖</div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">2. Smart Recommendations</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Get rule-based coaching tips dynamically prioritized by impact and your profile completeness level.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-3">
          <div className="text-3xl" aria-hidden="true">🔄</div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">3. What-If Habit Simulator</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Adjust virtual sliders for transit, diet, recycling, and energy to see simulated carbon reductions in real time.
          </p>
        </div>
      </section>

      {/* Coach Introduction */}
      <section className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6" aria-labelledby="coach-title">
        <div className="text-5xl select-none" role="img" aria-label="Avatar of Eco-Coach">🤖</div>
        <div className="space-y-2 text-center md:text-left">
          <h3 id="coach-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Meet Pilot, Your Personal Eco-Coach
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            &quot;I analyze your routines to recommend simple lifestyle shifts. No cloud servers are used—your data stays 100% private in LocalStorage. Let&apos;s make small changes that trigger major savings!&quot;
          </p>
        </div>
      </section>

      {/* Impact Stories (Tiny static community calculations) */}
      <section className="space-y-6" aria-labelledby="impact-title">
        <div className="text-center space-y-2">
          <h2 id="impact-title" className="text-2xl font-black text-slate-800 dark:text-slate-100">
            Collective Community Impact
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Small individual shifts trigger significant collective improvements at scale.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
            <span className="block text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
              {totalReductionTons} Tons
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              CO₂ Saved Annually
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assuming {numUsers} users reduce footprints by {targetReductionPct}%.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
            <span className="block text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
              {treesPlantedEquivalent}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Trees Grown For 10 Yrs
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Carbon volume equivalent absorbed over a decade.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
            <span className="block text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
              {gasGallonsEquivalent}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Gallons of Gas Avoided
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fossil fuel consumption equivalent avoided.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
