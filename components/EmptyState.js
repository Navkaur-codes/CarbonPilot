import React from 'react';
import Link from 'next/link';

export default function EmptyState({ 
  title = "No carbon history found", 
  description = "Complete your first carbon footprint assessment to unlock analytics, recommendations, and goals.", 
  actionText = "Start Assessment",
  actionHref = "/calculator",
  onActionClick
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm max-w-lg mx-auto my-8">
      {/* SVG Eco Illustration */}
      <div className="w-32 h-32 mb-6 text-emerald-500 dark:text-emerald-400" aria-hidden="true">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="60" cy="60" r="50" fill="currentColor" fillOpacity="0.08" />
          <path d="M60 25C40.67 25 25 40.67 25 60C25 79.33 40.67 95 60 95C79.33 95 95 79.33 95 60C95 40.67 79.33 25 60 25ZM60 87C45.1 87 33 74.9 33 60C33 45.1 45.1 33 60 33C74.9 33 87 45.1 87 60C87 74.9 74.9 87 60 87Z" fill="currentColor" />
          <path d="M72.5 50.5C70.01 50.5 68 52.51 68 55V72.5C68 74.99 70.01 77 72.5 77C74.99 77 77 74.99 77 72.5V55C77 52.51 74.99 50.5 72.5 50.5Z" fill="currentColor" />
          <path d="M51.5 58.5C49.01 58.5 47 60.51 47 63V72.5C47 74.99 49.01 77 51.5 77C53.99 77 56 74.99 56 72.5V63C56 60.51 53.99 58.5 51.5 58.5Z" fill="currentColor" />
          <path d="M62 66.5H58V72.5H62V66.5Z" fill="currentColor" />
          <path d="M60 41.5C57.51 41.5 55.5 43.51 55.5 46V50C55.5 52.49 57.51 54.5 60 54.5C62.49 54.5 64.5 52.49 64.5 50V46C64.5 43.51 62.49 41.5 60 41.5Z" fill="currentColor" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>

      {onActionClick ? (
        <button
          onClick={onActionClick}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-md transition focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          {actionText}
        </button>
      ) : (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-md transition focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
