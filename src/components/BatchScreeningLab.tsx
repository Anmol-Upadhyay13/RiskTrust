import React, { useState } from 'react';
import { generateSyntheticCohort } from '../ml/mlEngine';
import { BatchPatientRecord, PatientInput } from '../types/diabetes';
import { Users, Filter, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';

interface BatchScreeningLabProps {
  onLoadPatientIntoAssessment: (patient: PatientInput) => void;
}

export const BatchScreeningLab: React.FC<BatchScreeningLabProps> = ({ onLoadPatientIntoAssessment }) => {
  const [cohort, setCohort] = useState<BatchPatientRecord[]>(() => generateSyntheticCohort(30));
  const [filterLevel, setFilterLevel] = useState<'All' | 'High' | 'Moderate' | 'Low'>('All');

  const regenerate = () => {
    setCohort(generateSyntheticCohort(30));
  };

  const highCount = cohort.filter(p => p.predictedLevel === 'High').length;
  const modCount = cohort.filter(p => p.predictedLevel === 'Moderate').length;
  const lowCount = cohort.filter(p => p.predictedLevel === 'Low').length;

  const filtered = filterLevel === 'All' ? cohort : cohort.filter(p => p.predictedLevel === filterLevel);

  const handleSelectPatient = (p: BatchPatientRecord) => {
    const fullPatient: PatientInput = {
      age: p.age,
      gender: 'male',
      heightCm: 172,
      weightKg: Math.round(p.bmi * 1.72 * 1.72),
      bmi: p.bmi,
      bloodGlucose: p.glucose,
      glucoseUnit: 'mg/dL',
      systolicBP: p.predictedLevel === 'High' ? 138 : 120,
      diastolicBP: p.predictedLevel === 'High' ? 88 : 78,
      familyHistory: p.familyHistory,
      hypertensionHistory: p.predictedLevel === 'High',
      highCholesterol: p.predictedLevel === 'High',
      smokingStatus: p.smoking as any,
      physicalActivityMinutes: p.activityMin,
      dietQuality: p.predictedLevel === 'High' ? 'poor' : 'healthy',
      sleepHours: 7,
      symptoms: {
        polyuria: p.predictedLevel === 'High',
        polydipsia: p.predictedLevel === 'High',
        fatigue: p.predictedLevel !== 'Low',
        blurredVision: false,
        unexplainedWeightLoss: false,
        slowHealing: false,
      }
    };
    onLoadPatientIntoAssessment(fullPatient);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Public Health & Clinical Cohort Simulation
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Batch Outpatient Screening Lab (n = {cohort.length} Patients)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates real-world triage, automated risk flagging, and community-level prevalence detection
          </p>
        </div>

        <button
          onClick={regenerate}
          className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Generate New Cohort</span>
        </button>
      </div>

      {/* Cohort Risk Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Cohort</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{cohort.length}</div>
          <span className="text-[10px] text-slate-400">Outpatient Visits</span>
        </div>

        <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
          <span className="text-[10px] text-rose-700 uppercase font-semibold">High Risk Flagged</span>
          <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">
            {highCount} <span className="text-xs font-normal">({Math.round((highCount / cohort.length) * 100)}%)</span>
          </div>
          <span className="text-[10px] text-rose-600">Immediate Lab Triage</span>
        </div>

        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
          <span className="text-[10px] text-amber-800 uppercase font-semibold">Moderate Risk</span>
          <div className="text-xl font-bold font-mono text-amber-800 mt-0.5">
            {modCount} <span className="text-xs font-normal">({Math.round((modCount / cohort.length) * 100)}%)</span>
          </div>
          <span className="text-[10px] text-amber-700">Lifestyle Intervention</span>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
          <span className="text-[10px] text-emerald-800 uppercase font-semibold">Low Baseline</span>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-0.5">
            {lowCount} <span className="text-xs font-normal">({Math.round((lowCount / cohort.length) * 100)}%)</span>
          </div>
          <span className="text-[10px] text-emerald-700">Standard Check-up</span>
        </div>
      </div>

      {/* Interactive Filter and Patient Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 mr-1 font-medium">Filter by Tier:</span>
            {(['All', 'High', 'Moderate', 'Low'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setFilterLevel(tier)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  filterLevel === tier
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500">Showing {filtered.length} records</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Patient ID</th>
                <th className="py-2.5 px-3">Age</th>
                <th className="py-2.5 px-3">BMI</th>
                <th className="py-2.5 px-3">Fasting Glucose</th>
                <th className="py-2.5 px-3">Activity</th>
                <th className="py-2.5 px-3">Family Hist.</th>
                <th className="py-2.5 px-3 text-right">Predicted Risk</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isHigh = p.predictedLevel === 'High';
                const isMod = p.predictedLevel === 'Moderate';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{p.id}</td>
                    <td className="py-2.5 px-3">{p.age}y</td>
                    <td className="py-2.5 px-3 font-mono">{p.bmi}</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={p.glucose >= 126 ? 'text-rose-600 font-bold' : p.glucose >= 100 ? 'text-amber-600' : 'text-slate-700'}>
                        {p.glucose} mg/dL
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{p.activityMin} min/wk</td>
                    <td className="py-2.5 px-3">
                      {p.familyHistory ? <span className="text-amber-700 font-medium">Yes</span> : <span className="text-slate-400">No</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {p.predictedRisk}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isHigh ? 'bg-rose-100 text-rose-700' : isMod ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.predictedLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleSelectPatient(p)}
                        className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium transition-colors cursor-pointer"
                      >
                        Load Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
