'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';

export default function ChartSection({ data, type = 'trend' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-72 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400">
        Loading analytics charts...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-72 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
        No active data to plot.
      </div>
    );
  }

  // Trend line chart
  if (type === 'trend') {
    return (
      <div className="w-full h-72" role="img" aria-label="Line chart showing your carbon footprint trend over the last entries.">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit=" kg"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                borderRadius: '12px', 
                border: 'none',
                color: '#fff',
                fontSize: '13px'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="totalMonthly" 
              name="Monthly CO2"
              stroke="#10b981" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Breakdown bar chart
  const barColors = {
    Transport: '#3b82f6',
    Energy: '#eab308',
    Food: '#ef4444',
    Shopping: '#a855f7',
    Waste: '#10b981',
  };

  return (
    <div className="w-full h-72" role="img" aria-label="Bar chart displaying carbon footprint breakdown by category.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            unit=" kg"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              borderRadius: '12px', 
              border: 'none',
              color: '#fff',
              fontSize: '13px'
            }}
          />
          <Bar dataKey="value" name="Emissions" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColors[entry.name] || '#10b981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
