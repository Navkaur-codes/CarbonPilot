/**
 * CARBONPILOT - JSON Exporter
 * Generates and downloads a .json report of carbon footprint data.
 */

export function exportResultsToJson(profile, calculations, recommendations, topOpportunity) {
  if (typeof window === 'undefined') return;

  const dataObj = {
    appName: 'CarbonPilot',
    exportDate: new Date().toISOString(),
    profileInputs: profile || {},
    calculations: {
      totalMonthlyKgCO2: calculations?.totalMonthly || 0,
      totalYearlyKgCO2: calculations?.totalYearly || 0,
      categoryBreakdown: calculations?.categories || { transport: 0, electricity: 0, food: 0, shopping: 0, waste: 0 },
    },
    topImprovementOpportunity: topOpportunity || 'None',
    activeRecommendations: (recommendations || []).map(r => ({
      title: r.title,
      whySuggested: r.whySuggested,
      expectedImpact: r.expectedImpact,
      difficulty: r.difficulty,
      estimatedCost: r.estimatedCost,
      priorityScore: r.priorityScore,
      confidence: r.confidence,
      category: r.category,
    })),
  };

  try {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataObj, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `carbonpilot_report_${new Date().getFullYear()}.json`);
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  } catch (error) {
    console.error('Failed to export carbon data report:', error);
  }
}
