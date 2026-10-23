import React, { useState } from 'react';
import { FullAssessmentResult, PreventionPlanData } from '../types/diabetes';
import { MealPlanRoadmap } from './MealPlanRoadmap';
import { ClinicalReportModal } from './ClinicalReportModal';
import {
  Apple,
  Dumbbell,
  Scale,
  FileText,
  Printer,
  Sparkles,
  Stethoscope,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Download
} from 'lucide-react';

interface PreventionPlanProps {
  assessment: FullAssessmentResult;
}

export const PreventionPlan: React.FC<PreventionPlanProps> = ({ assessment }) => {
  const { primaryPrediction, shapContributions, patientData } = assessment;
  const [loadingAi, setLoadingAi] = useState(false);
  const [planData, setPlanData] = useState<PreventionPlanData | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Top positive risk factors to send to AI or default
  const topRisks = shapContributions
    .filter(c => c.direction === 'increase')
    .slice(0, 3)
    .map(c => ({
      name: c.label,
      impact: `+${Math.round(c.impactValue * 100)}%`,
      detail: c.description
    }));

  const handleFetchAiPlan = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/personalized-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientData,
          riskScore: primaryPrediction.riskScore,
          riskLevel: primaryPrediction.riskLevel,
          topRiskFactors: topRisks,
          selectedModel: primaryPrediction.modelName
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setPlanData(data.plan);
          setIsAiGenerated(data.source === 'gemini');
        }
      }
    } catch (err) {
      console.error('Error requesting prevention plan:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handlePrint = () => {
    setIsReportModalOpen(true);
  };

  // Default evidence-based baseline plan
  const defaultPlan: PreventionPlanData = {
    executiveSummary: `Based on your screening parameters, your diabetes risk profile is stratified as ${primaryPrediction.riskLevel} (${Math.round(primaryPrediction.riskScore * 100)}% probability). This is an early screening assessment, not a formal diagnosis. Lifestyle interventions initiated during early stages can prevent or substantially delay the progression to Type-2 diabetes.`,
    targetedInterventions: [
      {
        category: 'Nutritional Glycemic Management',
        recommendation: 'Adopt a fiber-dense dietary pattern (minimum 25–30g dietary fiber daily), replace refined starches with low-glycemic complex carbohydrates, and consume protein and vegetables before carbohydrates in meals.',
        clinicalRationale: 'Meal sequencing and soluble viscous fiber slow gastric emptying, blunting acute postprandial glucose surges and preserving pancreatic beta-cell insulin secretory capacity.'
      },
      {
        category: 'Skeletal Muscle Glucose Clearance',
        recommendation: `Accumulate at least 150 minutes of moderate-intensity aerobic exercise (e.g. brisk walking at 4-5 km/h) distributed over 4-5 days, supplemented with 2 resistance training sessions.`,
        clinicalRationale: 'Contraction-mediated muscle glucose uptake activates AMP-activated protein kinase (AMPK) and GLUT4 translocation to the cell membrane completely independent of insulin action.'
      },
      {
        category: 'Adiposity & Metabolic Stress Target',
        recommendation: patientData.bmi >= 25
          ? `Target an intentional, gradual 5% to 7% reduction in total body weight (approx. ${(patientData.weightKg * 0.06).toFixed(1)} kg) over 6 months.`
          : 'Maintain current body weight stability while optimizing lean muscle mass and minimizing visceral waist circumference.',
        clinicalRationale: 'The landmark Diabetes Prevention Program (DPP) randomized trial confirmed that a 5-7% weight reduction reduces diabetes incidence by 58% in high-risk individuals.'
      },
      {
        category: 'Biomarker Surveillance & Laboratory Follow-up',
        recommendation: primaryPrediction.riskLevel === 'High'
          ? 'Schedule an in-person venous blood assessment including Fasting Plasma Glucose (FPG), HbA1c, and a comprehensive lipid profile within 2 to 4 weeks.'
          : 'Re-screen clinical vitals annually and monitor fasting glucose periodically.',
        clinicalRationale: 'Screening tools identify elevated risk, but formal diagnostic confirmation requires calibrated clinical venipuncture assays according to ADA standards.'
      }
    ],
    whatIfImpact: primaryPrediction.riskLevel === 'High'
      ? 'Consistent adherence to the 150 min/wk exercise target and a 5-7% weight reduction is projected to shift your risk tier down into the Moderate or Low category within 6-12 months.'
      : 'Maintaining active exercise habits and balanced fiber-rich meals preserves your metabolic resilience.',
    doctorDiscussionGuide: [
      'Would you recommend an HbA1c test or an Oral Glucose Tolerance Test (OGTT) to assess my baseline metabolic health?',
      'Given my family history and current biometric risk factors, should I be monitored more frequently for cardiometabolic changes?',
      'Are there registered dietitian consultations or structured diabetes prevention programs available in my area?'
    ],
    recommendedFollowUpInterval: primaryPrediction.riskLevel === 'High'
      ? 'Within 2 to 4 weeks with a primary care physician'
      : primaryPrediction.riskLevel === 'Moderate'
      ? 'Within 2 to 3 months'
      : 'Annual routine preventive checkup'
  };

  const activePlan = planData || defaultPlan;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Clinical Prevention Architecture
            </span>
            {isAiGenerated && (
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" /> Powered by Gemini
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Personalized Prevention & Doctor Consultation Guide
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Evidence-based interventions targeting your individual XAI risk factors (ADA & WHO standards)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleFetchAiPlan}
            disabled={loadingAi}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {loadingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{planData ? 'Regenerate with Gemini AI' : 'Deep Personalization (Gemini AI)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Doctor Report</span>
          </button>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Stethoscope className="w-4 h-4 text-blue-600" />
          <span>Screening Synthesis & Clinical Context</span>
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed">
          {activePlan.executiveSummary}
        </p>

        <div className="mt-4 p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Recommended Clinical Check-in Interval:</strong>{' '}
            <span>{activePlan.recommendedFollowUpInterval}</span>
          </div>
        </div>
      </div>

      {/* 4-Pillar Intervention Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activePlan.targetedInterventions.map((item, idx) => {
          const icons = [
            <Apple className="w-4 h-4 text-emerald-600" key="1" />,
            <Dumbbell className="w-4 h-4 text-blue-600" key="2" />,
            <Scale className="w-4 h-4 text-purple-600" key="3" />,
            <Stethoscope className="w-4 h-4 text-rose-600" key="4" />
          ];
          const icon = icons[idx % icons.length];

          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="p-1.5 rounded-md bg-slate-100">
                  {icon}
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {item.category}
                </h4>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-900 leading-snug">
                  {item.recommendation}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Clinical & Biochemical Mechanism:
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {item.clinicalRationale}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Day Low-Glycemic Mediterranean Meal Plan */}
      <MealPlanRoadmap patient={patientData} />

      {/* Printable Doctor Consultation Brief */}
      <div id="doctor-brief" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Clinical Export Summary
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Primary Care Physician Discussion Brief
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export Report</span>
            </button>
            <div className="text-xs text-slate-500 font-mono hidden sm:block">
              Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          Take this summary to your next healthcare appointment to facilitate an informed, collaborative discussion with your doctor regarding your metabolic screening results.
        </p>

        {/* Biometric Snapshot for Physician */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Screening Risk</span>
            <strong className="text-slate-900">{primaryPrediction.riskLevel} ({Math.round(primaryPrediction.riskScore * 100)}%)</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Fasting Glucose</span>
            <strong className="text-slate-900">{patientData.bloodGlucose} {patientData.glucoseUnit}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">BMI / Vitals</span>
            <strong className="text-slate-900">{patientData.bmi} kg/m² ({patientData.systolicBP}/{patientData.diastolicBP})</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Inference Engine</span>
            <strong className="text-slate-900">{primaryPrediction.modelName.split(' ')[0]}</strong>
          </div>
        </div>

        {/* Top 3 Questions to Ask Your Doctor */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
            Key Questions to Ask Your Physician:
          </h4>
          <div className="space-y-2">
            {activePlan.doctorDiscussionGuide.map((q, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-800 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-snug">{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medical disclaimer in brief */}
        <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-400 leading-normal">
          <strong>Notice for Healthcare Provider:</strong> This report is generated by DiaCare XAI as a preventive risk stratification decision-support artifact. Predictions are based on validated multi-model machine learning (XGBoost, Random Forest, Logistic Regression) calibrated against reference metabolic screening cohorts. It does not constitute a formal diagnosis.
        </div>
      </div>

      {/* Clinical Report & Print Modal */}
      <ClinicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        assessment={assessment}
        plan={activePlan}
      />
    </div>
  );
};
