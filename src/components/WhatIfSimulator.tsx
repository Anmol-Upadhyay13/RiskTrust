import React, { useState, useEffect } from 'react';
import { PatientInput, AlgorithmType } from '../types/diabetes';
import { runModelInference, normalizeGlucoseToMgDl } from '../ml/mlEngine';
import { Sparkles, TrendingDown, RefreshCw, CheckCircle2 } from 'lucide-react';

interface WhatIfSimulatorProps {
  initialPatient: PatientInput;
  selectedModel: AlgorithmType;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ initialPatient, selectedModel }) => {
  const [simulatedPatient, setSimulatedPatient] = useState<PatientInput>({ ...initialPatient });

  // Keep synced if initialPatient updates
  useEffect(() => {
    setSimulatedPatient({ ...initialPatient });
  }, [initialPatient]);

  const initialPrediction = runModelInference(selectedModel, initialPatient);
  const currentPrediction = runModelInference(selectedModel, simulatedPatient);

  const initialRiskPct = Math.round(initialPrediction.riskScore * 100);
  const currentRiskPct = Math.round(currentPrediction.riskScore * 100);
  const riskDelta = initialRiskPct - currentRiskPct; // positive means risk was reduced

  const resetSimulation = () => {
    setSimulatedPatient({ ...initialPatient });
  };

  const applyWHOInterventionTarget = () => {
    // 5% BMI reduction, 150 min/wk physical activity, healthy diet
    const targetBmi = Math.max(22, Math.round(initialPatient.bmi * 0.94 * 10) / 10);
    const targetGlucose = Math.min(100, normalizeGlucoseToMgDl(initialPatient.bloodGlucose, initialPatient.glucoseUnit));

    setSimulatedPatient(prev => ({
      ...prev,
      bmi: targetBmi,
      bloodGlucose: targetGlucose,
      physicalActivityMinutes: Math.max(150, prev.physicalActivityMinutes),
      dietQuality: 'healthy',
      smokingStatus: prev.smokingStatus === 'current' ? 'former' : prev.smokingStatus
    }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Counterfactual "What-If" Lifestyle Explorer</span>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Interactive Simulation
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Test how targeted lifestyle interventions shift the ML decision boundary in real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={applyWHOInterventionTarget}
            className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Apply ADA/WHO Target
          </button>
          <button
            onClick={resetSimulation}
            className="text-xs font-medium px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            title="Reset to original patient values"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Delta Banner */}
      <div className={`p-4 rounded-xl border mb-5 transition-all ${
        riskDelta > 0
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : riskDelta < 0
          ? 'bg-rose-50/80 border-rose-200 text-rose-950'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              riskDelta > 0 ? 'bg-emerald-600 text-white' : riskDelta < 0 ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {currentRiskPct}%
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Simulated Risk Assessment: <span className="font-bold text-slate-900">{currentPrediction.riskLevel}</span>
              </div>
              <p className="text-xs mt-0.5 text-slate-600">
                Original: <span className="font-mono font-medium">{initialRiskPct}%</span> ({initialPrediction.riskLevel}) → Simulated: <span className="font-mono font-bold">{currentRiskPct}%</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            {riskDelta > 0 ? (
              <div className="inline-flex items-center gap-1 text-emerald-700 font-bold text-base">
                <TrendingDown className="w-5 h-5" />
                -{riskDelta}% Risk Drop
              </div>
            ) : riskDelta < 0 ? (
              <div className="text-rose-700 font-bold text-base">
                +{Math.abs(riskDelta)}% Risk Increase
              </div>
            ) : (
              <span className="text-xs text-slate-500">No parameters modified</span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Sliders for Modifiable Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* 1. Body Mass Index (BMI) */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-800">Body Mass Index (BMI)</label>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {simulatedPatient.bmi} kg/m²
            </span>
          </div>
          <input
            type="range"
            min="18.5"
            max="42.0"
            step="0.5"
            value={simulatedPatient.bmi}
            onChange={(e) => setSimulatedPatient({ ...simulatedPatient, bmi: parseFloat(e.target.value) })}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Normal (18.5-24.9)</span>
            <span>Overweight (25-29.9)</span>
            <span>Obese (≥30)</span>
          </div>
        </div>

        {/* 2. Physical Activity */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-800">Physical Activity (min/wk)</label>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
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
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Sedentary (&lt;60)</span>
            <span className="font-semibold text-emerald-700">WHO Target: 150 min</span>
            <span>Active (300+)</span>
          </div>
        </div>

        {/* 3. Fasting Blood Glucose */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-800">Fasting Blood Glucose</label>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
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
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Euglycemic (&lt;100)</span>
            <span>Prediabetes (100-125)</span>
            <span>Provisional (≥126)</span>
          </div>
        </div>

        {/* 4. Lifestyle Habits (Smoking & Diet) */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <label className="font-semibold text-slate-800 block mb-1.5">Diet Quality Pattern</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['poor', 'average', 'healthy'] as const).map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => setSimulatedPatient({ ...simulatedPatient, dietQuality: diet })}
                  className={`py-1 text-xs font-medium rounded capitalize transition-colors ${
                    simulatedPatient.dietQuality === diet
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="font-medium text-slate-700">Smoking Habit:</span>
            <div className="flex gap-1.5">
              {(['never', 'former', 'current'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSimulatedPatient({ ...simulatedPatient, smokingStatus: st })}
                  className={`px-2 py-0.5 text-xs rounded capitalize transition-colors ${
                    simulatedPatient.smokingStatus === st
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
