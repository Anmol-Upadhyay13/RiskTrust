import React from 'react';
import { FullAssessmentResult, AlgorithmType } from '../types/diabetes';
import { SHAPWaterfall } from './SHAPWaterfall';
import { RadarChart } from './RadarChart';
import { WhatIfSimulator } from './WhatIfSimulator';
import { ConstrainedCounterfactualView } from './ConstrainedCounterfactualView';
import { RiskTrustReliabilityCard } from './RiskTrustReliabilityCard';
import { ClinicalScorecards } from './ClinicalScorecards';
import { PartialDependenceView } from './PartialDependenceView';
import { SHAPBeeswarmPlot } from './SHAPBeeswarmPlot';
import { BENCHMARK_MODELS, normalizeGlucoseToMgDl } from '../ml/mlEngine';
import { runRiskTrustReliabilityAudit } from '../ml/reliabilityEngine';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Stethoscope,
  Info
} from 'lucide-react';

interface ExplainableResultsProps {
  assessment: FullAssessmentResult;
  onNavigateToPrevention: () => void;
  onNavigateToDiagnostic?: () => void;
  onSelectModel: (algo: AlgorithmType) => void;
}

export const ExplainableResults: React.FC<ExplainableResultsProps> = ({
  assessment,
  onNavigateToPrevention,
  onNavigateToDiagnostic,
  onSelectModel
}) => {
  const { primaryPrediction, allModelPredictions, shapContributions, domainScores, baseRisk, patientData } = assessment;
  const isHigh = primaryPrediction.riskLevel === 'High';
  const isMod = primaryPrediction.riskLevel === 'Moderate';
  const isLow = primaryPrediction.riskLevel === 'Low';

  const riskScorePct = Math.round(primaryPrediction.riskScore * 100);

  // Top 3 risk contributors
  const riskDrivers = shapContributions.filter(c => c.direction === 'increase').slice(0, 4);
  const protectiveDrivers = shapContributions.filter(c => c.direction === 'decrease').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Risk Level Hero Card */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isHigh
          ? 'bg-rose-50/70 border-rose-200'
          : isMod
          ? 'bg-amber-50/70 border-amber-200'
          : 'bg-emerald-50/70 border-emerald-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-xl ${
              isHigh
                ? 'bg-rose-600 text-white'
                : isMod
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              {isHigh ? <ShieldAlert className="w-8 h-8" /> : isMod ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  ML Risk Stratification
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-mono text-slate-600">Model: {primaryPrediction.modelName.split(' ')[0]}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Risk Classification: <span className={isHigh ? 'text-rose-700' : isMod ? 'text-amber-700' : 'text-emerald-700'}>
                  {primaryPrediction.riskLevel} Risk
                </span>
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed">
                {isHigh
                  ? 'Your screening indicators indicate elevated metabolic markers for type-2 diabetes risk. This is an early screening assessment, not a formal medical diagnosis. Targeted interventions and doctor follow-up can significantly delay or prevent onset.'
                  : isMod
                  ? 'Your profile reflects moderate metabolic vulnerability, primarily driven by lifestyle and glycemic factors. Early lifestyle modifications have the highest efficacy at this stage.'
                  : 'Your assessed metabolic baseline is in the healthy low-risk range. Continue maintaining your balanced physical activity, nutrition, and periodic wellness checks.'}
              </p>
            </div>
          </div>

          {/* Large Metric Gauge */}
          <div className="flex flex-row md:flex-col items-center justify-center p-4 bg-white/90 rounded-xl border border-slate-200/80 shadow-xs min-w-[150px]">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900">
              {riskScorePct}%
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
              Assessed Risk Probability
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Confidence: {primaryPrediction.confidence}%
            </div>
          </div>
        </div>

        {/* Quick Clinical Disclaimer Ribbon */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span><strong>Clinical Notice:</strong> DiaCare XAI is a preventive risk stratification tool. It does not replace medical diagnostics.</span>
          </span>
          <button
            onClick={onNavigateToPrevention}
            className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 ml-3 cursor-pointer"
          >
            Personalized Prevention Plan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Core Differentiator: RiskTrust 5-Dimensional Reliability Audit */}
      <RiskTrustReliabilityCard
        auditReport={assessment.reliabilityAudit || runRiskTrustReliabilityAudit(patientData, assessment.selectedModel, primaryPrediction, shapContributions)}
      />

      {/* Multi-Model Consensus Comparison */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Multi-Model Cross-Validation Consensus</h3>
            <p className="text-xs text-slate-500">Comparing risk predictions across 5 independent ML architectures for this patient</p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Current Active: <strong className="text-slate-800">{primaryPrediction.modelName.split(' ')[0]}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.keys(allModelPredictions) as AlgorithmType[]).map((algo) => {
            const pred = allModelPredictions[algo];
            const isSelected = algo === assessment.selectedModel;
            const pct = Math.round(pred.riskScore * 100);

            return (
              <button
                key={algo}
                onClick={() => onSelectModel(algo)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-600 truncate">
                  {BENCHMARK_MODELS[algo].name.split(' ')[0]}
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                  {pct}%
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className={`font-medium ${
                    pred.riskLevel === 'High' ? 'text-rose-600' : pred.riskLevel === 'Moderate' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {pred.riskLevel}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">AUC {BENCHMARK_MODELS[algo].rocAuc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Scorecards Benchmark (ML vs FINDRISC vs ADA) */}
      <ClinicalScorecards
        clinicalScores={assessment.clinicalScores}
        prediction={primaryPrediction}
        glucoseMgDl={normalizeGlucoseToMgDl(patientData.bloodGlucose, patientData.glucoseUnit)}
      />

      {/* "Why this risk?" Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h3 className="text-base font-bold text-slate-900">Why This Risk? Primary Contributing Factors</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explainable AI (XAI) decomposes the black-box risk prediction into individualized biological and lifestyle drivers.
          </p>
        </div>

        {/* Highlighted Factors Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Top Risk Accelerators */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              Major Risk Accelerators (+Δ Impact)
            </h4>
            <div className="space-y-2.5">
              {riskDrivers.length > 0 ? (
                riskDrivers.map((driver, i) => (
                  <div key={i} className="flex items-start justify-between text-xs bg-white p-2.5 rounded-lg border border-rose-100">
                    <div>
                      <div className="font-semibold text-slate-800">{driver.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{driver.description}</div>
                    </div>
                    <span className="font-mono font-bold text-rose-600 shrink-0 ml-3">
                      +{Math.round(driver.impactValue * 100)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">No significant risk accelerators detected.</div>
              )}
            </div>
          </div>

          {/* Protective Buffers */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Protective Metabolic Buffers (-Δ Impact)
            </h4>
            <div className="space-y-2.5">
              {protectiveDrivers.length > 0 ? (
                protectiveDrivers.map((buffer, i) => (
                  <div key={i} className="flex items-start justify-between text-xs bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div>
                      <div className="font-semibold text-slate-800">{buffer.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{buffer.description}</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 shrink-0 ml-3">
                      {Math.round(buffer.impactValue * 100)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Sedentary habits or elevated markers leave few active metabolic buffers.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SHAP Waterfall Plot */}
        <SHAPWaterfall
          baseRisk={baseRisk}
          finalRisk={primaryPrediction.riskScore}
          contributions={shapContributions}
        />
      </div>

      {/* Multidimensional Domain Radar & Counterfactual Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Analysis */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Metabolic Risk Radar</h4>
            <p className="text-xs text-slate-500 mb-4">6-Domain physiological exposure footprint</p>
            <RadarChart scores={domainScores} />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Scores reflect standardized deviations from target clinical baseline values (0 = optimal, 100 = critical exposure).
          </div>
        </div>

        {/* What-If Simulator */}
        <div className="lg:col-span-7">
          <WhatIfSimulator
            initialPatient={patientData}
            selectedModel={assessment.selectedModel}
          />
        </div>
      </div>

      {/* Constrained Counterfactuals with Immutable Locks & Revalidation */}
      <ConstrainedCounterfactualView
        initialPatient={patientData}
        selectedModel={assessment.selectedModel}
      />

      {/* Advanced XAI: Partial Dependence Curvature & Population SHAP Beeswarm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PartialDependenceView
          patient={patientData}
          selectedModel={assessment.selectedModel}
        />
        <SHAPBeeswarmPlot />
      </div>

      {/* Bottom CTA to Prevention Plan & Diagnostic Tool */}
      <div className="p-5 bg-slate-900 text-white rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold">Next Steps: Prevention Plan or Real-Time Diagnostic Correlation</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            View targeted lifestyle guidance, or run the live continuous glucose telemetry (CGM) and ADA laboratory diagnostic criteria evaluator.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigateToDiagnostic && (
            <button
              onClick={onNavigateToDiagnostic}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Real-Time Diagnostic Tool</span>
            </button>
          )}
          <button
            onClick={onNavigateToPrevention}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>View Prevention Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
