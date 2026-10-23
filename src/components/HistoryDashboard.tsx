import React from 'react';
import { FullAssessmentResult } from '../types/diabetes';
import { History, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar, Trash2, RotateCcw } from 'lucide-react';

interface HistoryDashboardProps {
  history: FullAssessmentResult[];
  onSelectAssessment: (assessment: FullAssessmentResult) => void;
  onClearHistory: () => void;
  onSeedDemoHistory: () => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  history,
  onSelectAssessment,
  onClearHistory,
  onSeedDemoHistory
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Longitudinal Risk History & Tracking</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track risk progression over time as lifestyle modifications are implemented
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSeedDemoHistory}
            className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load 3-Visit Demo Trend</span>
          </button>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs font-medium px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Assessment Records Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Complete the questionnaire to record your first risk screening, or load sample multi-visit records to explore the trend visualization.
          </p>
          <button
            onClick={onSeedDemoHistory}
            className="text-xs font-semibold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Load 3-Visit Patient History
          </button>
        </div>
      ) : (
        <>
          {/* Risk Progression Timeline Visual */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Longitudinal Risk Score Trajectory:
            </h3>

            <div className="relative pt-6 pb-2">
              <div className="flex items-center justify-between relative z-10">
                {history.map((item, idx) => {
                  const pct = Math.round(item.primaryPrediction.riskScore * 100);
                  const isHigh = item.primaryPrediction.riskLevel === 'High';
                  const isMod = item.primaryPrediction.riskLevel === 'Moderate';

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectAssessment(item)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className={`w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center text-xs font-bold font-mono transition-transform group-hover:scale-110 ${
                        isHigh ? 'bg-rose-600 text-white' : isMod ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        {pct}%
                      </div>
                      <span className="text-xs font-bold text-slate-800 mt-2">
                        Visit {idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        BMI: {item.patientData.bmi} · {item.patientData.bloodGlucose} mg/dL
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Connecting line */}
              <div className="absolute top-12 left-8 right-8 h-1 bg-slate-200 z-0"></div>
            </div>
          </div>

          {/* Detailed Screening History List */}
          <div className="space-y-3">
            {history.map((item, idx) => {
              const pct = Math.round(item.primaryPrediction.riskScore * 100);
              const isHigh = item.primaryPrediction.riskLevel === 'High';
              const isMod = item.primaryPrediction.riskLevel === 'Moderate';

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                      isHigh ? 'bg-rose-100 text-rose-700' : isMod ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {pct}%
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Visit Record #{history.length - idx}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                        <span>Risk: <strong className={isHigh ? 'text-rose-600' : isMod ? 'text-amber-600' : 'text-emerald-600'}>{item.primaryPrediction.riskLevel}</strong></span>
                        <span>Glucose: <strong>{item.patientData.bloodGlucose} {item.patientData.glucoseUnit}</strong></span>
                        <span>BMI: <strong>{item.patientData.bmi}</strong></span>
                        <span>Activity: <strong>{item.patientData.physicalActivityMinutes} min/wk</strong></span>
                        <span className="text-slate-400 font-mono">({item.selectedModel})</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectAssessment(item)}
                    className="text-xs font-semibold px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer self-end sm:self-center shrink-0"
                  >
                    View XAI Breakdown
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
