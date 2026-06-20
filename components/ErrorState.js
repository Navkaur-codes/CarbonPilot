import React from 'react';

export default function ErrorState({
  title = "Something went wrong",
  message = "We encountered an issue processing your inputs or calculating emissions. Please check for negative numbers or missing selections.",
  onReset,
  resetText = "Go Back & Retry"
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl max-w-lg mx-auto my-8">
      {/* SVG Warning Icon */}
      <div className="w-16 h-16 mb-4 text-red-500 dark:text-red-400" aria-hidden="true">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
        {title}
      </h3>
      <p className="text-sm text-red-600/80 dark:text-red-400/80 max-w-sm mb-6">
        {message}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl shadow-sm transition focus:ring-2 focus:ring-red-400 focus:outline-none"
        >
          {resetText}
        </button>
      )}
    </div>
  );
}
