import React from 'react';
import { DATASET_SHIFT_BENCHMARK } from '../ml/datasetShiftEngine';
import { Globe, AlertTriangle, ArrowRight, BarChart2, ShieldAlert } from 'lucide-react';

export const DatasetShiftView: React.FC = () => {
  const {
    primaryDatasetName,
    externalDatasetName,
    primaryMetrics,
    externalMetrics,
    populationStabilityIndex,
    covariateShiftSummary,
    generalizationVerdict
  } = DATASET_SHIFT_BENCHMARK;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              External Validation & Dataset Shift
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Generalization Audit</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Generalization Under Population & Covariate Shift
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluating model robustness when deployed to an independent external national surveillance dataset
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 self-start sm:self-auto font-mono">
          <span>PSI: {populationStabilityIndex} (Moderate Shift)</span>
        </div>
      </div>

      {/* Dataset Comparison Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Cohort */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-900 text-xs">Primary Clinical Development Cohort</span>
            <span className="text-[10px] font-mono text-slate-500">n = {primaryMetrics.sampleSize}</span>
          </div>
          <p className="text-[11px] text-slate-500">{primaryDatasetName}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans block">Accuracy</span>
              <strong className="text-slate-900">{(primaryMetrics.accuracy * 100).toFixed(1)}%</strong>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans block">Recall</span>
              <strong className="text-slate-900">{(primaryMetrics.recall * 100).toFixed(1)}%</strong>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans block">ROC-AUC</span>
              <strong className="text-blue-700 font-bold">{primaryMetrics.rocAuc.toFixed(3)}</strong>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans block">Brier Score</span>
              <strong className="text-slate-900">{primaryMetrics.brierScore}</strong>
            </div>
          </div>
        </div>

        {/* External Cohort */}
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
            <span className="font-bold text-purple-950 text-xs">External Validation Cohort</span>
            <span className="text-[10px] font-mono text-purple-700">n = {externalMetrics.sampleSize}</span>
          </div>
          <p className="text-[11px] text-purple-800/80">{externalDatasetName}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="p-2 bg-white rounded-lg border border-purple-200">
              <span className="text-[10px] text-slate-400 font-sans block">Accuracy</span>
              <strong className="text-slate-900">{(externalMetrics.accuracy * 100).toFixed(1)}%</strong>
            </div>
            <div className="p-2 bg-white rounded-lg border border-purple-200">
              <span className="text-[10px] text-slate-400 font-sans block">Recall</span>
              <strong className="text-slate-900">{(externalMetrics.recall * 100).toFixed(1)}%</strong>
            </div>
            <div className="p-2 bg-white rounded-lg border border-purple-200">
              <span className="text-[10px] text-slate-400 font-sans block">ROC-AUC</span>
              <strong className="text-purple-700 font-bold">{externalMetrics.rocAuc.toFixed(3)}</strong>
            </div>
            <div className="p-2 bg-white rounded-lg border border-purple-200">
              <span className="text-[10px] text-slate-400 font-sans block">Brier Score</span>
              <strong className="text-slate-900">{externalMetrics.brierScore}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Covariate Drift Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Covariate Feature Drift Audit:
        </h4>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Feature Name</th>
                <th className="py-2.5 px-3 text-right">Primary Cohort Mean</th>
                <th className="py-2.5 px-3 text-right">External Cohort Mean</th>
                <th className="py-2.5 px-3 text-right">Shift Magnitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {covariateShiftSummary.map((cov, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{cov.feature}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{cov.primaryMean}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{cov.externalMean}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      cov.shiftMagnitude === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : cov.shiftMagnitude === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {cov.shiftMagnitude} Drift
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scientific Verdict */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed space-y-1">
        <strong className="text-slate-900 block font-semibold">Generalization Verdict:</strong>
        <p>{generalizationVerdict}</p>
      </div>
    </div>
  );
};
