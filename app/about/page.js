'use client';

import React from 'react';
import { COEFFICIENTS, DISCLAIMER } from '../../lib/carbonCalculator';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn">
      {/* Page Title */}
      <section className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          About & Methodology
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400">
          Understand the mathematics, guidelines, and core data driving CarbonPilot footprint estimates.
        </p>
      </section>

      {/* Calculator coefficients table */}
      <section className="space-y-4" aria-labelledby="coefficients-heading">
        <h2 id="coefficients-heading" className="text-xl font-bold text-slate-800 dark:text-slate-150">
          Emission Factors & Source Parameters
        </h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Coefficient Value</th>
                <th className="px-6 py-4">Scope Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-350">
              <tr>
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-150">🚗 Private Car</td>
                <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-450">{COEFFICIENTS.CAR_KM_WEEK.toFixed(2)} kg</td>
                <td className="px-6 py-4">CO₂ emissions per kilometer driven</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-150">🚇 Public Transit</td>
                <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-450">{COEFFICIENTS.PUBLIC_TRIP_WEEK.toFixed(2)} kg</td>
                <td className="px-6 py-4">CO₂ emissions per single transit trip</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-150">💡 Electricity</td>
                <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-450">{COEFFICIENTS.ELECTRICITY_KWH_MONTH.toFixed(2)} kg</td>
                <td className="px-6 py-4">CO₂ grid intensity per kilowatt-hour (kWh)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-150">🍲 Dietary Habits</td>
                <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-450">{COEFFICIENTS.MEAT_MEAL_WEEK.toFixed(2)} kg</td>
                <td className="px-6 py-4">CO₂ premium per weekly meat-based meal</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-150">🛍️ Physical Goods</td>
                <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-450">{COEFFICIENTS.SHOPPING_ITEM.toFixed(2)} kg</td>
                <td className="px-6 py-4">Lifecycle manufacturing CO₂ per purchase item</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-150">♻️ Solid Waste</td>
                <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-450">{COEFFICIENTS.WASTE_BASELINE.toFixed(2)} kg</td>
                <td className="px-6 py-4">Monthly garbage baseline (reduced by recycling)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          Disclaimer: {DISCLAIMER} Coefficients represent average figures modeled after reports from the EPA (Environmental Protection Agency) and DEFRA (UK Department for Environment, Food & Rural Affairs).
        </p>
      </section>

      {/* Global guidelines and targets */}
      <section className="space-y-4" aria-labelledby="targets-heading">
        <h2 id="targets-heading" className="text-xl font-bold text-slate-800 dark:text-slate-150">
          The Carbon Footprint Target (Why &lt;2 Tons?)
        </h2>
        <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6 space-y-3">
          <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
            Currently, the average carbon footprint for a person in the United States is around <strong>16 tons of CO₂ per year</strong> (global average is ~4.5 tons). 
          </p>
          <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
            To hold global warming below 2°C (in alignment with the Paris Climate Agreement), the global average footprint needs to drop to <strong>under 2 tons of CO₂ per year</strong> by 2050. Small changes in travel, dietary choices, and waste sorting represent immediate ways individuals can help bridge this gap.
          </p>
        </div>
      </section>

      {/* Privacy Guarantee */}
      <section className="space-y-4" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading" className="text-xl font-bold text-slate-800 dark:text-slate-150">
          Privacy-First Architecture
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          CarbonPilot does not collect, sell, or transmit your behavioral metrics to any cloud database or analytics platform. 100% of calculations and records are saved client-side in your web browser's <code>localStorage</code> database. You can clear your entire profile cache at any point from the Dashboard page.
        </p>
      </section>
    </div>
  );
}
