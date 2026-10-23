import React from 'react';
import { RiskTrustAuditReport } from '../types/risktrust';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
  Lock,
  Compass,
  Activity
} from 'lucide-react';

interface RiskTrustReliabilityCardProps {
  auditReport: RiskTrustAuditReport;
}

export const RiskTrustReliabilityCard: React.FC<RiskTrustReliabilityCardProps> = ({ auditReport }) => {
  const {
    overallReliabilityStatus,
    calibration,
    uncertainty,
    inputReliability,
    explanationStability,
    counterfactual,
    modelDisagreementRate,
    summaryRecommendation
  } = auditReport;

  const isReliable = overallReliabilityStatus === 'High Reliability';
  const isCaution = overallReliabilityStatus === 'Caution: High Uncertainty / OOD';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              RiskTrust Reliability Engine
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">5-Dimension Audit</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Prediction Reliability & Uncertainty Audit
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluating probability calibration, credible intervals, input OOD likelihood, and explanation stability
          </p>
        </div>

        {/* Overall Badge */}
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto ${
          isReliable
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : isCaution
            ? 'bg-rose-50 text-rose-800 border-rose-300'
            : 'bg-amber-50 text-amber-800 border-amber-300'
        }`}>
          {isReliable ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
          <span>{overallReliabilityStatus}</span>
        </div>
      </div>

      {/* 5-Dimensional Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Dim 1: Calibration & Uncertainty Interval */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-700 mb-1">
              <span className="font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                1. Prediction Uncertainty
              </span>
              <span className="text-[10px] font-mono text-slate-500">95% Credible Interval</span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold font-mono text-slate-900">
                [{(uncertainty.uncertaintyInterval[0] * 100).toFixed(0)}% — {(uncertainty.uncertaintyInterval[1] * 100).toFixed(0)}%]
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Variance Status: <strong className={uncertainty.isHighUncertainty ? 'text-rose-600' : 'text-emerald-700'}>{uncertainty.uncertaintyTier}</strong>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
            Platt-calibrated Brier Score: <span className="font-mono font-bold text-slate-800">{calibration.brierScore}</span> (ECE: {calibration.expectedCalibrationError}).
          </div>
        </div>

        {/* Dim 2: Input Reliability & OOD Detection */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-700 mb-1">
              <span className="font-bold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                2. Input & OOD Reliability
              </span>
              <span className="text-[10px] font-mono text-slate-500">Centroid Distance</span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold font-mono text-slate-900">
                {inputReliability.mahalanobisDistanceScore}σ
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Distribution: <strong className={inputReliability.isOutlier ? 'text-rose-600' : 'text-emerald-700'}>{inputReliability.dataQualityTier}</strong>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
            {inputReliability.plausibilityWarnings.length > 0
              ? inputReliability.plausibilityWarnings[0]
              : 'All inputs fall within standard training epidemiological distributions.'}
          </div>
        </div>

        {/* Dim 3: Model Disagreement */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-700 mb-1">
              <span className="font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                3. Model Consensus
              </span>
              <span className="text-[10px] font-mono text-slate-500">Cross-Architecture</span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold font-mono text-slate-900">
                {Math.round(modelDisagreementRate * 100)}% Max Spread
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Consensus: <strong className={modelDisagreementRate > 0.20 ? 'text-amber-700' : 'text-emerald-700'}>{modelDisagreementRate > 0.20 ? 'Moderate Disagreement' : 'Strong Agreement'}</strong>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
            Evaluates prediction divergence between linear (Logistic) and non-linear (XGBoost, RF, SVM) boundaries.
          </div>
        </div>

        {/* Dim 4: Explanation Stability (Lipschitz Audit) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-700 mb-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                4. Explanation Stability
              </span>
              <span className="text-[10px] font-mono text-slate-500">Lipschitz Ratio</span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold font-mono text-slate-900">
                {(explanationStability.stabilityScore * 100).toFixed(0)}% Stable
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Rank Invariance: <strong className={explanationStability.topFeaturesRankPreserved ? 'text-emerald-700' : 'text-amber-700'}>{explanationStability.topFeaturesRankPreserved ? 'Preserved under ±3% noise' : 'Minor rank shift'}</strong>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
            Confirms top contributing SHAP factors do not fluctuate arbitrarily under minor measurement noise.
          </div>
        </div>

        {/* Dim 5: Constrained Counterfactual Feasibility */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between col-span-1 md:col-span-2">
          <div>
            <div className="flex items-center justify-between text-slate-700 mb-1">
              <span className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-600" />
                5. Constrained Counterfactual Feasibility
              </span>
              <span className="text-[10px] font-mono text-slate-500">Immutable Locks Active</span>
            </div>
            <div className="mt-2 flex items-center gap-4">
              <div>
                <span className="text-lg font-bold font-mono text-slate-900">
                  L₁ Effort: {counterfactual.l1Distance}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Feasibility: <strong className="text-emerald-700">{counterfactual.isFeasible ? 'Valid & Re-verified' : 'Infeasible'}</strong> ({counterfactual.sparsity} features modified)
                </div>
              </div>
              <div className="text-[11px] text-slate-500 border-l border-slate-200 pl-4 hidden sm:block">
                Immutable Locks: <strong>Age, Biological Sex, Family Genetics</strong> strictly preserved.
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
            Model confirmed risk reduction from current score to {(counterfactual.achievedRisk * 100).toFixed(0)}% without violating biological constraints.
          </div>
        </div>
      </div>

      {/* Summary Decision Support Guidance */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
        isCaution ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong>RiskTrust Decision-Support Synthesis:</strong> {summaryRecommendation}
        </div>
      </div>
    </div>
  );
};
