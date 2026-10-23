import React, { useState, useEffect } from 'react';
import { PatientInput, AlgorithmType } from '../types/diabetes';
import { runModelInference, normalizeGlucoseToMgDl } from '../ml/mlEngine';
import { ConstrainedCounterfactual } from '../types/risktrust';
import { generateConstrainedCounterfactual } from '../ml/reliabilityEngine';
import { Lock, Sparkles, TrendingDown, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ConstrainedCounterfactualViewProps {
  initialPatient: PatientInput;
  selectedModel: AlgorithmType;
}

export const ConstrainedCounterfactualView: React.FC<ConstrainedCounterfactualViewProps> = ({
  initialPatient,
  selectedModel
}) => {
  const [simulatedPatient, setSimulatedPatient] = useState<PatientInput>({ ...initialPatient });

  useEffect(() => {
    setSimulatedPatient({ ...initialPatient });
  }, [initialPatient]);

  const initialPred = runModelInference(selectedModel, initialPatient);
  const currentPred = runModelInference(selectedModel, simulatedPatient);
  const audit = generateConstrainedCounterfactual(initialPatient, selectedModel);

  const initialRiskPct = Math.round(initialPred.riskScore * 100);
  const currentRiskPct = Math.round(currentPred.riskScore * 100);
  const delta = initialRiskPct - currentRiskPct;

  // Normalized L1 action effort
  const deltaBmi = Math.abs(initialPatient.bmi - simulatedPatient.bmi) / 15;
  const deltaAct = Math.abs(initialPatient.physicalActivityMinutes - simulatedPatient.physicalActivityMinutes) / 200;
  const deltaGluc =
    Math.abs(
      normalizeGlucoseToMgDl(initialPatient.bloodGlucose, initialPatient.glucoseUnit) -
      normalizeGlucoseToMgDl(simulatedPatient.bloodGlucose, simulatedPatient.glucoseUnit)
    ) / 80;

  const currentL1Effort = Math.round((deltaBmi + deltaAct + deltaGluc) * 100) / 100;

  const applyOptimalCounterfactual = () => {
    const targetBmi = Math.max(22, Math.round(initialPatient.bmi * 0.93 * 10) / 10);
    const targetGluc = Math.min(98, normalizeGlucoseToMgDl(initialPatient.bloodGlucose, initialPatient.glucoseUnit) * 0.85);

    setSimulatedPatient({
      ...initialPatient,
      bmi: targetBmi,
      physicalActivityMinutes: Math.max(150, initialPatient.physicalActivityMinutes + 60),
      bloodGlucose: Math.round(targetGluc),
      glucoseUnit: 'mg/dL',
      dietQuality: 'healthy',
      smokingStatus: initialPatient.smokingStatus === 'current' ? 'former' : initialPatient.smokingStatus
    });
  };

  const reset = () => {
    setSimulatedPatient({ ...initialPatient });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Constrained Counterfactual Simulator
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Immutable Locks Active</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Clinically Feasible "What-If" Decision Recourse
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hypothetical actionable recourse exploring realistic biomarker shifts to cross the decision boundary
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={applyOptimalCounterfactual}
            className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Apply Optimal Recourse</span>
          </button>
          <button
            onClick={reset}
            className="text-xs font-medium px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Recourse Banner */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold font-mono text-base flex items-center justify-center shrink-0">
            {currentRiskPct}%
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Model Re-Evaluation: <strong className="text-slate-900">{currentPred.riskLevel} Risk</strong>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Original: <span className="font-mono">{initialRiskPct}%</span> ({initialPred.riskLevel}) &rarr; Simulated: <span className="font-mono font-bold text-slate-900">{currentRiskPct}%</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 block font-sans uppercase">Action Effort (L₁)</span>
            <strong className="text-slate-900 text-sm">{currentL1Effort}</strong>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 block font-sans uppercase">Risk Delta (Δ)</span>
            <strong className={`text-sm ${delta > 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
              {delta > 0 ? `-${delta}%` : `${Math.abs(delta)}%`}
            </strong>
          </div>
        </div>
      </div>

      {/* Immutable Feature Restriction Banner */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center gap-3 text-xs text-amber-950">
        <Lock className="w-4 h-4 text-amber-700 shrink-0" />
        <div>
          <strong>Immutable Feature Locks:</strong> Demographics and genetics (Age: {initialPatient.age}y, Sex: {initialPatient.gender}, Family History: {initialPatient.familyHistory ? 'Positive' : 'None'}) are legally and biologically immutable and cannot be altered by counterfactual algorithms.
        </div>
      </div>

      {/* Mutable Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Mutable 1: BMI */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-800">Body Mass Index (BMI)</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {simulatedPatient.bmi} kg/m²
            </span>
          </div>
          <input
            type="range"
            min="19.0"
            max="42.0"
            step="0.5"
            value={simulatedPatient.bmi}
            onChange={(e) => setSimulatedPatient({ ...simulatedPatient, bmi: parseFloat(e.target.value) })}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Original: {initialPatient.bmi} kg/m²</span>
        </div>

        {/* Mutable 2: Physical Activity */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-800">Physical Activity</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {simulatedPatient.physicalActivityMinutes} min/wk
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="15"
            value={simulatedPatient.physicalActivityMinutes}
            onChange={(e) => setSimulatedPatient({ ...simulatedPatient, physicalActivityMinutes: parseInt(e.target.value) })}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">WHO Target: &ge;150 min/wk</span>
        </div>

        {/* Mutable 3: Blood Glucose */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-800">Fasting Glucose</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {simulatedPatient.bloodGlucose} mg/dL
            </span>
          </div>
          <input
            type="range"
            min="70"
            max="180"
            step="2"
            value={simulatedPatient.bloodGlucose}
            onChange={(e) => setSimulatedPatient({ ...simulatedPatient, bloodGlucose: parseInt(e.target.value) })}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Euglycemic goal: &lt;100 mg/dL</span>
        </div>
      </div>

      {/* Prescribed Feasible Modifications Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <th className="py-2.5 px-3">Targeted Action</th>
              <th className="py-2.5 px-3">Baseline</th>
              <th className="py-2.5 px-3">Counterfactual Target</th>
              <th className="py-2.5 px-3">Feasibility / Effort</th>
              <th className="py-2.5 px-3">Clinical Mechanism</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {audit.prescribedModifications.map((m, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-900">{m.feature}</td>
                <td className="py-2.5 px-3 font-mono text-slate-500">{m.originalValue}</td>
                <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{m.targetValue}</td>
                <td className="py-2.5 px-3">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    m.effortLevel === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {m.effortLevel} Effort
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600 text-[11px]">{m.clinicalRationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-400 leading-normal">
        <strong>Scientific Caveat:</strong> Counterfactual changes demonstrate mathematical sensitivity within the trained XGBoost model space. They do not guarantee physiological disease prevention without longitudinal medical supervision.
      </div>
    </div>
  );
};
