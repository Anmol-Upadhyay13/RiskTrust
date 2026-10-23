import React, { useState } from 'react';
import { PatientInput, AlgorithmType } from '../types/diabetes';
import { calculateBMI, PRESET_PATIENT_PROFILES, BENCHMARK_MODELS } from '../ml/mlEngine';
import {
  Activity,
  Heart,
  User,
  Scale,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';

interface QuestionnaireProps {
  currentPatient: PatientInput;
  selectedModel: AlgorithmType;
  onUpdatePatient: (patient: PatientInput) => void;
  onSelectModel: (algo: AlgorithmType) => void;
  onSubmit: (patient: PatientInput, algo: AlgorithmType) => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  currentPatient,
  selectedModel,
  onUpdatePatient,
  onSelectModel,
  onSubmit
}) => {
  const [patient, setPatient] = useState<PatientInput>({ ...currentPatient });

  // Sync when currentPatient updates (e.g. from preset)
  const loadPreset = (presetData: PatientInput) => {
    setPatient({ ...presetData });
    onUpdatePatient({ ...presetData });
  };

  const handleHeightOrWeightChange = (height: number, weight: number) => {
    const computedBmi = calculateBMI(weight, height);
    setPatient(prev => ({
      ...prev,
      heightCm: height,
      weightKg: weight,
      bmi: computedBmi > 0 ? computedBmi : prev.bmi
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePatient(patient);
    onSubmit(patient, selectedModel);
  };

  // BMI Category label helper
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-600' };
    if (bmi < 25) return { label: 'Normal Weight', color: 'text-emerald-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600' };
    return { label: 'Obese (High Risk Factor)', color: 'text-rose-600' };
  };

  const bmiCat = getBmiCategory(patient.bmi);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preset Quick Loader Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Quick Test Profiles:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_PATIENT_PROFILES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(preset.data)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 text-slate-700 font-medium transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{preset.label.split(':')[0]}</span>
                <span className="text-[10px] font-mono text-slate-500 font-normal">({preset.tag})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Demographics & Anthropometrics */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">1. Demographics & Anthropometrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Age */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Age (Years)</label>
              <input
                type="number"
                min="18"
                max="100"
                value={patient.age}
                onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Risk elevates &ge;45 yrs</span>
            </div>

            {/* Gender */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Biological Sex</label>
              <select
                value={patient.gender}
                onChange={(e) => setPatient({ ...patient, gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Non-specified</option>
              </select>
            </div>
          </div>

          {/* Height & Weight with Auto BMI */}
          <div className="grid grid-cols-3 gap-3 text-xs pt-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="240"
                value={patient.heightCm}
                onChange={(e) => handleHeightOrWeightChange(parseFloat(e.target.value) || 0, patient.weightKg)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Weight (kg)</label>
              <input
                type="number"
                min="35"
                max="250"
                step="0.5"
                value={patient.weightKg}
                onChange={(e) => handleHeightOrWeightChange(patient.heightCm, parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">BMI (kg/m²)</label>
              <input
                type="number"
                step="0.1"
                value={patient.bmi}
                onChange={(e) => setPatient({ ...patient, bmi: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-slate-50 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-600 font-medium">BMI Status:</span>
            <span className={`font-semibold ${bmiCat.color}`}>{bmiCat.label} ({patient.bmi})</span>
          </div>
        </div>

        {/* Section 2: Glycemic & Hemodynamic Biomarkers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">2. Blood Glucose & Vitals</h3>
            </div>
            {/* Unit toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setPatient({ ...patient, glucoseUnit: 'mg/dL' })}
                className={`px-2 py-0.5 rounded ${patient.glucoseUnit === 'mg/dL' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                mg/dL
              </button>
              <button
                type="button"
                onClick={() => setPatient({ ...patient, glucoseUnit: 'mmol/L' })}
                className={`px-2 py-0.5 rounded ${patient.glucoseUnit === 'mmol/L' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                mmol/L
              </button>
            </div>
          </div>

          {/* Blood Glucose */}
          <div className="text-xs">
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Fasting Blood Glucose Level</label>
              <span className="font-mono text-slate-500">{patient.glucoseUnit}</span>
            </div>
            <input
              type="number"
              step={patient.glucoseUnit === 'mmol/L' ? '0.1' : '1'}
              value={patient.bloodGlucose}
              onChange={(e) => setPatient({ ...patient, bloodGlucose: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold font-mono text-base focus:ring-1 focus:ring-slate-900 focus:outline-none"
              required
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
              <span className="text-emerald-700">&lt;100 Normal</span>
              <span className="text-amber-700">100–125 Prediabetes</span>
              <span className="text-rose-700">&ge;126 High Risk</span>
            </div>
          </div>

          {/* Advanced Optional Biomarkers: HbA1c & Fasting Insulin */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">HbA1c (% - Optional)</label>
              </div>
              <input
                type="number"
                step="0.1"
                min="3.5"
                max="16.0"
                placeholder="e.g. 5.8"
                value={patient.hba1c || ''}
                onChange={(e) => setPatient({ ...patient, hba1c: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Auto-estimated if blank</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Fasting Insulin (µIU/mL)</label>
              </div>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="100.0"
                placeholder="e.g. 12.5"
                value={patient.fastingInsulin || ''}
                onChange={(e) => setPatient({ ...patient, fastingInsulin: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Calculates HOMA-IR</span>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                min="70"
                max="220"
                value={patient.systolicBP}
                onChange={(e) => setPatient({ ...patient, systolicBP: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                min="40"
                max="140"
                value={patient.diastolicBP}
                onChange={(e) => setPatient({ ...patient, diastolicBP: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Genetics & Medical History */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Heart className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-slate-900">3. Family History & Clinical Preconditions</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Family history */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={patient.familyHistory}
                onChange={(e) => setPatient({ ...patient, familyHistory: e.target.checked })}
                className="mt-0.5 rounded text-blue-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-slate-900 block">Family History of Diabetes</span>
                <span className="text-[11px] text-slate-500">First-degree relative (parent or sibling diagnosed with Type-2 diabetes)</span>
              </div>
            </label>

            {/* Hypertension history */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={patient.hypertensionHistory}
                onChange={(e) => setPatient({ ...patient, hypertensionHistory: e.target.checked })}
                className="mt-0.5 rounded text-blue-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-slate-900 block">Diagnosed Hypertension</span>
                <span className="text-[11px] text-slate-500">History of high blood pressure or taking antihypertensive medication</span>
              </div>
            </label>

            {/* Dyslipidemia / High Cholesterol */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={patient.highCholesterol}
                onChange={(e) => setPatient({ ...patient, highCholesterol: e.target.checked })}
                className="mt-0.5 rounded text-blue-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-slate-900 block">Elevated Lipids / High Cholesterol</span>
                <span className="text-[11px] text-slate-500">High triglycerides or low HDL (&lt;35 mg/dL)</span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 4: Lifestyle & Physical Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Scale className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">4. Lifestyle & Physical Habits</h3>
          </div>

          {/* Physical Activity Slider */}
          <div className="text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">Weekly Moderate/Vigorous Activity</label>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {patient.physicalActivityMinutes} min/week
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="15"
              value={patient.physicalActivityMinutes}
              onChange={(e) => setPatient({ ...patient, physicalActivityMinutes: parseInt(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>0 (Sedentary)</span>
              <span className="text-emerald-700 font-semibold">ADA/WHO Target: &ge;150 min</span>
              <span>300+ min</span>
            </div>
          </div>

          {/* Smoking & Diet Quality */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Smoking History</label>
              <select
                value={patient.smokingStatus}
                onChange={(e) => setPatient({ ...patient, smokingStatus: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value="never">Never Smoked</option>
                <option value="former">Former Smoker</option>
                <option value="current">Current Smoker</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Diet Pattern</label>
              <select
                value={patient.dietQuality}
                onChange={(e) => setPatient({ ...patient, dietQuality: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value="healthy">Healthy (High Fiber/Whole Food)</option>
                <option value="average">Average Mixed</option>
                <option value="poor">High Sugar & Ultra-Processed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Early Clinical Symptoms (FinDRISC / ADA indicators) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">
            5. Early Clinical Symptoms Checklist (Check all that currently apply)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { key: 'polyuria', label: 'Polyuria', desc: 'Frequent urination, particularly nocturia at night' },
            { key: 'polydipsia', label: 'Polydipsia', desc: 'Persistent, unquenchable excessive thirst' },
            { key: 'fatigue', label: 'Unexplained Chronic Fatigue', desc: 'Lethargy despite normal rest' },
            { key: 'blurredVision', label: 'Blurred or Fluctuating Vision', desc: 'Temporary lens osmotic swelling' },
            { key: 'unexplainedWeightLoss', label: 'Sudden Weight Loss', desc: 'Unintentional loss without dieting' },
            { key: 'slowHealing', label: 'Slow-Healing Cuts / Tingling', desc: 'Peripheral sensory or microvascular delay' },
          ].map((item) => (
            <label
              key={item.key}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                (patient.symptoms as any)[item.key]
                  ? 'bg-amber-50/70 border-amber-300 text-amber-950 ring-1 ring-amber-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={(patient.symptoms as any)[item.key]}
                onChange={(e) =>
                  setPatient({
                    ...patient,
                    symptoms: {
                      ...patient.symptoms,
                      [item.key]: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 rounded text-amber-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-semibold block">{item.label}</span>
                <span className="text-[11px] text-slate-500 leading-tight">{item.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ML Algorithm Selection Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Choose Primary Inference Algorithm</h3>
            <p className="text-xs text-slate-500">
              Select which model generates the primary risk prediction and SHAP waterfall
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">All 5 models will be cross-validated</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {(Object.keys(BENCHMARK_MODELS) as AlgorithmType[]).map((algoKey) => {
            const m = BENCHMARK_MODELS[algoKey];
            const isSelected = selectedModel === algoKey;

            return (
              <button
                key={algoKey}
                type="button"
                onClick={() => onSelectModel(algoKey)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {m.name.split(' ')[0]}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  ROC-AUC: <strong className="text-slate-800">{m.rocAuc}</strong>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Recall: {(m.recall * 100).toFixed(0)}% · XAI: {m.interpretabilityScore}/10
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submission Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500">
          Screening evaluates 12 biometric parameters against calibrated multi-model decision bounds.
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
        >
          <span>Run Explainable AI Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
