import React from 'react';

export default function LoadingCard({ count = 3 }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm animate-pulse"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
          </div>
          
          <div className="flex gap-4 pt-2 border-t border-slate-50 dark:border-slate-800/40">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
