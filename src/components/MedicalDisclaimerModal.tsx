import React from 'react';
import { ShieldCheck, X, Stethoscope, AlertTriangle, FileText } from 'lucide-react';

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalDisclaimerModal: React.FC<MedicalDisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Clinical Purpose & Medical Disclaimer
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              DiaCare XAI Preventive Governance
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Not a Diagnostic Tool:</strong> DiaCare XAI is designed exclusively for early risk stratification, preventive screening education, and patient-physician shared decision-making. It does not provide medical diagnosis or prescribe clinical pharmacotherapy.
            </div>
          </div>

          <p>
            <strong>Evidence-Based Foundation:</strong> Risk models are calibrated on established epidemiological cohorts (including CDC BRFSS and Pima Diabetes reference benchmarks) utilizing American Diabetes Association (ADA) and World Health Organization (WHO) clinical thresholds.
          </p>

          <p>
            <strong>Explainable AI (XAI) Transparency:</strong> Shapley Additive Explanations (SHAP) provide local feature attributions showing how individual biomarkers (e.g. glucose, BMI, physical activity) affect model predictions compared to demographic baselines.
          </p>

          <p>
            <strong>Confirmatory Testing:</strong> If your screening indicates Moderate or High risk, we strongly advise consulting a licensed primary care physician for venous blood assays, including Fasting Plasma Glucose (FPG), HbA1c, and lipid panels.
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
