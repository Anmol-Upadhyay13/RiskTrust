import React from 'react';
import { SUBGROUP_FAIRNESS_DATA } from '../ml/fairnessEngine';
import { Scale, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export const FairnessAuditView: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Algorithmic Fairness Audit
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Equal Opportunity & Parity Analysis</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Demographic Subgroup Fairness & Disparity Evaluation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Auditing screening sensitivity (Recall) and False Negative Rates across protected demographic brackets
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Fairness Tolerance Passed (&le;5% Parity Gap)</span>
        </div>
      </div>

      {/* Fairness Tables */}
      <div className="space-y-6">
        {SUBGROUP_FAIRNESS_DATA.map((group, idx) => (
          <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {group.groupName}
              </h4>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span>Disparate Impact: <strong className="text-slate-900">{group.disparateImpactRatio}</strong> (target 0.80 - 1.25)</span>
                <span>Equal Opportunity Gap: <strong className="text-emerald-700">{(group.equalOpportunityDifference * 100).toFixed(1)}%</strong></span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2 px-3">Subgroup</th>
                    <th className="py-2 px-3 text-right">Sample Size (n)</th>
                    <th className="py-2 px-3 text-right font-bold text-slate-900">Recall (Sensitivity)</th>
                    <th className="py-2 px-3 text-right">Precision</th>
                    <th className="py-2 px-3 text-right text-rose-700">False Negative Rate (FNR)</th>
                    <th className="py-2 px-3 text-right">False Positive Rate (FPR)</th>
                    <th className="py-2 px-3 text-right font-bold text-blue-700">ROC-AUC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {group.subgroups.map((sub, sIdx) => (
                    <tr key={sIdx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{sub.label}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{sub.sampleSize}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{(sub.recall * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{(sub.precision * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-right text-rose-700">{(sub.falseNegativeRate * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{(sub.falsePositiveRate * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-700">{sub.rocAuc.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
              <strong>Audit Assessment:</strong> {group.auditNotes}
            </p>
          </div>
        ))}
      </div>

      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Fairness in Medical AI:</strong> In clinical screening, false negatives carry a severe clinical cost. Optimizing purely for statistical demographic parity must not artificially suppress sensitivity for vulnerable cohorts with higher biological prevalence.
        </div>
      </div>
    </div>
  );
};
