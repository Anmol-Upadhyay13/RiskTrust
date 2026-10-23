import React from 'react';
import { ClinicalScores, ModelPrediction } from '../types/diabetes';
import { ShieldCheck, Award, HeartHandshake, Activity, Zap, Info } from 'lucide-react';

interface ClinicalScorecardsProps {
  clinicalScores: ClinicalScores;
  prediction: ModelPrediction;
  glucoseMgDl: number;
}

export const ClinicalScorecards: React.FC<ClinicalScorecardsProps> = ({
  clinicalScores,
  prediction,
  glucoseMgDl
}) => {
  const { findrisc, ada, homaIr, ascvd10YearRiskPct, estimatedA1c } = clinicalScores;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Clinical Benchmark Comparison
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            ML Prediction vs. International Medical Scorecards (ADA & FINDRISC)
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Gold-standard epidemiological alignment
        </div>
      </div>

      {/* Grid of Clinical Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        {/* Card 1: Machine Learning Engine */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-600" />
                DiaCare ML Prediction
              </span>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                Non-Linear
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono text-blue-950">
                {Math.round(prediction.riskScore * 100)}%
              </div>
              <div className="font-semibold text-blue-800 text-xs mt-0.5">
                {prediction.riskLevel} Risk Stratification
              </div>
            </div>
          </div>
          <p className="text-[11px] text-blue-800/80 mt-3 pt-2 border-t border-blue-200/60 leading-relaxed">
            Evaluates high-order interactions (synergy between visceral adiposity, glucose, and family genetics) beyond linear thresholds.
          </p>
        </div>

        {/* Card 2: FINDRISC Scorecard */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                FINDRISC Scorecard
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                WHO Validated
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono text-slate-900">
                {findrisc.score} <span className="text-xs text-slate-500 font-normal">/ 26</span>
              </div>
              <div className="font-semibold text-slate-700 text-xs mt-0.5">
                Tier: <strong className={findrisc.score >= 15 ? 'text-rose-600' : findrisc.score >= 12 ? 'text-amber-600' : 'text-emerald-600'}>{findrisc.tier}</strong> ({findrisc.tenYearRiskPct}% 10-Yr Risk)
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-200 leading-relaxed">
            {findrisc.description}. Widely endorsed by the European Association for the Study of Diabetes.
          </p>
        </div>

        {/* Card 3: ADA 60-Second Test */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                ADA Risk Test
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                ADA 2026
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono text-slate-900">
                {ada.score} <span className="text-xs text-slate-500 font-normal">/ 10</span>
              </div>
              <div className="font-semibold text-slate-700 text-xs mt-0.5">
                Status: <strong className={ada.isHighRisk ? 'text-rose-600' : 'text-emerald-600'}>{ada.isHighRisk ? 'High Risk (Score ≥ 5)' : 'Low/Moderate'}</strong>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-200 leading-relaxed">
            {ada.description}
          </p>
        </div>
      </div>

      {/* Auxiliary Cardiometabolic & Glycemic Biomarker Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Estimated HbA1c (eAG)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-bold font-mono text-slate-900">{estimatedA1c}%</span>
            <span className="text-[10px] text-slate-400 font-mono">({glucoseMgDl} mg/dL)</span>
          </div>
          <span className="text-[10px] text-slate-500">Nathan Formula</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">10-Year ASCVD Cardiovascular Risk</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-bold font-mono text-slate-900">{ascvd10YearRiskPct}%</span>
            <span className={`text-[10px] font-semibold ${ascvd10YearRiskPct >= 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
              ({ascvd10YearRiskPct >= 10 ? 'Elevated' : 'Low'})
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Cardiometabolic Co-Risk</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">HOMA-IR Insulin Resistance</span>
          {homaIr ? (
            <div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-bold font-mono text-slate-900">{homaIr.value}</span>
                <span className="text-[10px] font-semibold text-rose-600">{homaIr.classification}</span>
              </div>
              <span className="text-[10px] text-slate-500">Beta-Cell Strain</span>
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-slate-400">
              Enter fasting insulin in questionnaire for HOMA-IR calculation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
