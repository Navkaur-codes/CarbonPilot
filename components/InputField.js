import React from 'react';

/**
 * Reusable, accessible input field component.
 */
export default function InputField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  icon,
  description,
  max,
  min = 0,
  type = 'number'
}) {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
          {icon && <span className="mr-1.5" aria-hidden="true">{icon}</span>}
          {label}
        </label>
        {max !== undefined && (
          <span className="text-[10px] font-semibold text-slate-400/80 uppercase">Max: {max}</span>
        )}
      </div>
      
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm ${
          error 
            ? 'border-rose-400 focus:ring-rose-500 dark:border-rose-900/60' 
            : 'border-slate-200 dark:border-slate-700/80'
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : (description ? `${id}-desc` : undefined)}
      />
      
      {error && (
        <span id={`${id}-error`} className="text-xs text-rose-500 block font-semibold animate-fadeIn">
          {error}
        </span>
      )}
      
      {!error && description && (
        <p id={`${id}-desc`} className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
          {description}
        </p>
      )}
    </div>
  );
}
