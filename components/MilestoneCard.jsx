import React from 'react';

/**
 * Reusable milestone achievement card component.
 */
export default function MilestoneCard({ ach }) {
  const { title, desc, unlocked, icon } = ach;
  
  return (
    <div 
      className={`p-5 rounded-2xl border transition duration-150 text-center flex flex-col items-center justify-center space-y-2 ${
        unlocked 
          ? 'bg-emerald-500/5 border-emerald-100 dark:border-emerald-900/30' 
          : 'bg-slate-50/20 border-slate-100 dark:border-slate-900/40 opacity-40 grayscale'
      }`}
    >
      <span className="text-4xl select-none" role="img" aria-label={title}>{icon}</span>
      <div>
        <span className="block font-bold text-sm text-slate-800 dark:text-slate-100">{title}</span>
        <span className="block text-[11px] text-slate-450 mt-0.5">{desc}</span>
      </div>
      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
        unlocked 
          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-400' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-455'
      }`}>
        {unlocked ? 'Reached' : 'Pending'}
      </span>
    </div>
  );
}
