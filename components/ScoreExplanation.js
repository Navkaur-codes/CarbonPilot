import React from 'react';

export default function ScoreExplanation({ categories, totalMonthly, percentages, topOpportunity }) {
  if (!totalMonthly || totalMonthly <= 0) return null;

  const explMap = {
    Transport: {
      title: 'Transport is your primary carbon driver',
      desc: `Your car commutes and public transit trips drive ${percentages.transport}% of your monthly greenhouse gas emissions. Biking, walking, or swapping to public transit has the highest expected impact.`,
      advice: 'By reducing car usage by just 20 km per week, you can save roughly 208 kg of CO2 annually.',
      color: 'border-blue-200 bg-blue-50/50 text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-300',
      icon: '🚗',
    },
    Energy: {
      title: 'Home heating & electricity dominates your footprint',
      desc: `Electricity usage makes up ${percentages.electricity}% of your carbon score. Lowering standby usage, installing LED bulbs, and tweaking your thermostat by 1°C are your best savings pathways.`,
      advice: 'Turning down space heaters by 1 degree typically cuts your home electricity carbon footprint by up to 10%.',
      color: 'border-yellow-200 bg-yellow-50/50 text-yellow-800 dark:border-yellow-900/30 dark:bg-yellow-950/20 dark:text-yellow-300',
      icon: '💡',
    },
    Food: {
      title: 'Meat consumption drives a high share of emissions',
      desc: `Meat-heavy dishes are resource-intensive, comprising ${percentages.food}% of your carbon profile. Shifting toward plant-based recipes or poultry is extremely effective.`,
      advice: 'Implementing two "Meatless Mondays" a month can lower your dietary carbon index by approximately 24%.',
      color: 'border-red-200 bg-red-50/50 text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300',
      icon: '🍲',
    },
    Shopping: {
      title: 'New purchases contribute heavily to landfill and manufacture carbon',
      desc: `Your monthly buying habits represent ${percentages.shopping}% of your footprint. Curbing impulse shopping through a 30-day waiting period has high carbon mitigation potential.`,
      advice: 'Buying secondhand or refurbished items saves up to 90% of the emissions embedded in manufacturing.',
      color: 'border-purple-200 bg-purple-50/50 text-purple-800 dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-300',
      icon: '🛍️',
    },
    Waste: {
      title: 'Trash baseline emissions are high',
      desc: `Your lack of consistent recycling represents ${percentages.waste}% of your score. Landfill decay of unsorted trash generates methane. Starting a sorting bin reduces this.`,
      advice: 'Recycling all eligible paper, plastic, and aluminum can drop your waste footprint by up to 70%.',
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300',
      icon: '♻️',
    },
  };

  const expl = explMap[topOpportunity] || {
    title: 'Your carbon footprint is well-balanced',
    desc: 'No single category dominates your score. Maintaining a balanced conservation strategy is recommended.',
    advice: 'Try completing the What-If Simulator to fine-tune your carbon output.',
    color: 'border-slate-200 bg-slate-50/50 text-slate-800 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-350',
    icon: '🌱',
  };

  return (
    <div className={`p-5 rounded-2xl border ${expl.color} flex flex-col sm:flex-row gap-4 items-start`}>
      <span className="text-3xl p-2 bg-white/70 dark:bg-slate-900/70 rounded-xl shadow-sm" role="img" aria-label="Opportunity Icon">
        {expl.icon}
      </span>
      <div className="space-y-1">
        <h4 className="font-semibold text-base sm:text-lg flex items-center gap-2">
          Explain My Score: {expl.title}
        </h4>
        <p className="text-sm opacity-90 leading-relaxed">
          {expl.desc}
        </p>
        <div className="pt-2 text-xs font-medium border-t border-current/10 flex items-center gap-1.5 opacity-80">
          <span>💡</span>
          <span>{expl.advice}</span>
        </div>
      </div>
    </div>
  );
}
