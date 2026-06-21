import React from 'react';

/**
 * Real-time calculator feedback sidebar.
 */
export default function CalculatorPreview({
  calculations,
  completeness,
  percentages,
  equivalents
}) {
  const showBreakdown = calculations.totalMonthly > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 sticky top-24">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        ⚡ Real-time preview
      </span>
      
      {/* Monthly Output Card */}
      <div className="text-center py-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-900/60">
        <span className="block text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400">
          {calculations.totalMonthly.toFixed(1)}
        </span>
        <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
          kg CO₂ / month
        </span>
        <span className="block text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Yearly Projection: <strong className="text-slate-700 dark:text-slate-300">{(calculations.totalMonthly * 12).toFixed(1)} kg</strong>
        </span>
      </div>

      {/* Completeness / Confidence Tracker */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
          <span>Confidence Level:</span>
          <span className="text-emerald-500 font-bold">{completeness}% Complete</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
            style={{ width: `${completeness}%` }}
          ></div>
        </div>
      </div>

      {/* Breakdown Percentages list */}
      {showBreakdown && (
        <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800/40">
          <span className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
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

      {/* Equivalence Visual card */}
      {calculations.totalMonthly > 0 && equivalents && (
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
  );
}
