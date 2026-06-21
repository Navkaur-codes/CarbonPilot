import React from 'react';

/**
 * Reusable dashboard KPI statistics card component.
 */
export default function StatCard({ title, value, unit, highlightText, icon }) {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-1 hover:shadow-md transition duration-150">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {title}
      </span>
      
      <div className="block text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5">
        {icon && <span className="mr-0.5 select-none" aria-hidden="true">{icon}</span>}
        <span>{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
      </div>
      
      {highlightText && (
        <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
          {highlightText}
        </span>
      )}
    </div>
  );
}
