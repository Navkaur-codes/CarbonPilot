import React from 'react';

export default function RecommendationCard({ rec }) {
  const { title, whySuggested, expectedImpact, difficulty, estimatedCost, priorityScore, confidence, category } = rec;

  const categoryIcons = {
    Transport: '🚗',
    Energy: '💡',
    Food: '🍲',
    Shopping: '🛍️',
    Waste: '♻️',
    General: '🌱',
  };

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
    Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
    Hard: 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400',
  };

  const impactColors = {
    High: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400',
    Medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
    Low: 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  };

  return (
    <div 
      className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition duration-200"
      role="article" 
      aria-label={`Recommendation: ${title}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span>{categoryIcons[category] || '🌱'}</span>
          <span>{category}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400">
            Priority {priorityScore}/10
          </span>
        </div>
      </div>

      <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
        {title}
      </h4>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        {whySuggested}
      </p>

      {/* Attributes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/40 text-xs">
        <div>
          <span className="block text-slate-400 dark:text-slate-500 mb-1">Impact</span>
          <span className={`inline-block font-semibold px-2.5 py-0.5 rounded-full ${impactColors[expectedImpact] || 'bg-slate-100'}`}>
            {expectedImpact}
          </span>
        </div>
        
        <div>
          <span className="block text-slate-400 dark:text-slate-500 mb-1">Difficulty</span>
          <span className={`inline-block font-semibold px-2.5 py-0.5 rounded-full ${difficultyColors[difficulty] || 'bg-slate-100'}`}>
            {difficulty}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="block text-slate-400 dark:text-slate-500 mb-1">Cost</span>
          <span className="inline-block font-semibold text-slate-700 dark:text-slate-350 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            {estimatedCost}
          </span>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/30 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <span>⭐</span> Confidence Meter
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {confidence}
        </span>
      </div>
    </div>
  );
}
