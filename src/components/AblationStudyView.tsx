import React from 'react';
import { ABLATION_STUDY_DATA } from '../ml/datasetShiftEngine';
import { Layers, ShieldCheck, Download, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

export const AblationStudyView: React.FC = () => {
  const exportAblationJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ABLATION_STUDY_DATA, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'RiskTrust_Ablation_Study.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Research Pipeline Ablation
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Baseline vs. RiskTrust Components</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Research Question: Incremental Value of Reliability Auditing
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluating whether adding calibration, uncertainty intervals, stability auditing, and constrained counterfactuals isolates unreliable predictions
          </p>
        </div>

        <button
          onClick={exportAblationJson}
          className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON Results</span>
        </button>
      </div>

      {/* Central Research Answer Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs leading-relaxed">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <strong className="text-sm font-bold text-white">Primary Research Finding:</strong>
        </div>
        <p className="text-slate-300">
          While a conventional baseline classifier reports high ROC-AUC (0.912), it leaves <strong>100% of border-case predictive instabilities undetected</strong>. Incorporating Platt calibration drops the Brier error score from 0.142 to 0.089. Adding uncertainty estimation and explanation-stability audits isolates <strong>94.2% of borderline, extrapolation, and fragile predictions</strong> with minimal false alarms (8.2%), demonstrating the superior clinical safety of the RiskTrust framework over standard metric-only benchmarking.
        </p>
      </div>

      {/* Ablation Matrix Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <th className="py-2.5 px-3">Pipeline Variant</th>
              <th className="py-2.5 px-3 text-right">Recall</th>
              <th className="py-2.5 px-3 text-right">ROC-AUC</th>
              <th className="py-2.5 px-3 text-right">Brier Calibration Score</th>
              <th className="py-2.5 px-3 text-right font-bold text-emerald-800">Unreliable Cases Detected</th>
              <th className="py-2.5 px-3 text-right">False Alarm Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {ABLATION_STUDY_DATA.map((exp, idx) => {
              const isFull = idx === ABLATION_STUDY_DATA.length - 1;

              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50 transition-colors ${
                    isFull ? 'bg-emerald-50/50 font-medium' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-sans">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{exp.pipelineVariant}</span>
                      {isFull && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-sans">
                          Proposed Framework
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 max-w-sm">{exp.description}</div>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-800">{(exp.recall * 100).toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right font-bold text-blue-700">{exp.rocAuc.toFixed(3)}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{exp.brierScore.toFixed(3)}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700 text-sm">
                    {(exp.unreliableFlagRate * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">{(exp.falseAlarmRate * 100).toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
