import React from 'react';
import { DISCLAIMER } from '../lib/carbonCalculator';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">🌱 CarbonPilot</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Your Personal Carbon Footprint Coach. Made with Next.js & LocalStorage.
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center sm:text-right">
            <span className="font-semibold block text-slate-650 dark:text-slate-350">
              Disclaimer: {DISCLAIMER}
            </span>
            <p className="mt-1">
              Calculations are based on simplified parameters from international guidelines (EPA, DEFRA).
            </p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
          <span>&copy; {new Date().getFullYear()} CarbonPilot. All rights reserved.</span>
          <div className="flex gap-4">
            <a 
              href="https://www.epa.gov/greenhouse-gases-equivalencies-calculator" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded"
            >
              EPA Equivalents
            </a>
            <a 
              href="https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded"
            >
              DEFRA Coefficients
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
