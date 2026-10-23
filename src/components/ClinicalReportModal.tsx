import React, { useState } from 'react';
import { FullAssessmentResult, PreventionPlanData } from '../types/diabetes';
import { generateClinicalReportHTML, generateEHRClinicalNote, getDefaultPreventionPlan } from '../utils/generateClinicalReport';
import {
  Printer,
  Download,
  Copy,
  Check,
  X,
  Stethoscope,
  ShieldAlert,
  AlertCircle,
  FileText,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: FullAssessmentResult;
  plan?: PreventionPlanData;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  assessment,
  plan
}) => {
  const [copied, setCopied] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const effectivePlan = plan || getDefaultPreventionPlan(assessment);
  const htmlContent = generateClinicalReportHTML(assessment, effectivePlan);

  const handleBrowserPrint = () => {
    setIsPrinting(true);
    setPrintError(null);

    try {
      // Create a hidden iframe to isolate the printable document without polluting or altering the main app state
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        throw new Error('Unable to access printable frame context');
      }

      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            setIsPrinting(false);
          }, 1000);
        } catch (innerErr) {
          console.warn('Iframe printing blocked by browser sandbox:', innerErr);
          document.body.removeChild(iframe);
          // Try main window print as fallback
          try {
            window.print();
          } catch (winErr) {
            console.error('Window print error:', winErr);
          }
          setPrintError('Browser preview iframe blocked the system print modal. Please use "Download PDF-Ready HTML" below to view or print without restrictions.');
          setIsPrinting(false);
        }
      }, 500);
    } catch (err: any) {
      console.warn('Print execution error:', err);
      setPrintError('Browser print dialogue restricted in current window. You can download the report file below.');
      setIsPrinting(false);
    }
  };

  const handleDownloadHtml = () => {
    try {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DiaCare_Clinical_Report_${assessment.patientData.age}yo_${assessment.primaryPrediction.riskLevel}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download report error:', err);
    }
  };

  const handleCopyEhr = () => {
    const text = generateEHRClinicalNote(assessment, effectivePlan);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const { patientData, primaryPrediction, shapContributions } = assessment;
  const isHigh = primaryPrediction.riskLevel === 'High';
  const isMod = primaryPrediction.riskLevel === 'Moderate';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header & Action Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>Clinical Report & Consultation Brief</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isHigh ? 'bg-rose-100 text-rose-800' : isMod ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {primaryPrediction.riskLevel} Risk
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Print, save as PDF, download or copy for electronic health record (EHR) review.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBrowserPrint}
              disabled={isPrinting}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Open System Print Dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? 'Preparing...' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download standalone HTML report (opens in any browser and prints to PDF cleanly)"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Download Report (.html)</span>
            </button>

            <button
              onClick={handleCopyEhr}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Copy EHR-formatted clinical note to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy EHR Note</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Warning Banner if Iframe blocked print */}
        {printError && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{printError}</span>
              <button
                onClick={handleDownloadHtml}
                className="underline font-semibold ml-2 hover:text-amber-950 cursor-pointer"
              >
                Click here to Download the standalone report
              </button>
            </div>
            <button onClick={() => setPrintError(null)} className="text-amber-500 hover:text-amber-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body - Render Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/80">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto space-y-6 text-slate-900 font-sans">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-blue-600 pb-4">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  DiaCare XAI · Clinical Screening & Prevention Report
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explainable AI Early Risk Stratification & Primary Care Consultation Guide
                </p>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                <div>Date: {new Date().toLocaleDateString()}</div>
                <div>Status: Educational Screening</div>
              </div>
            </div>

            {/* Risk Tier Badge */}
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              isHigh
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : isMod
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                  Stratified Risk Tier & Probability
                </span>
                <span className="text-lg font-black">
                  {primaryPrediction.riskLevel} Risk Profile ({Math.round(primaryPrediction.riskScore * 100)}%)
                </span>
                <p className="text-xs opacity-85 mt-0.5">
                  Inference: {primaryPrediction.modelName} &middot; Calibrated via Platt Scaling
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider ${
                isHigh
                  ? 'bg-rose-600 text-white'
                  : isMod
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {primaryPrediction.riskLevel}
              </div>
            </div>

            {/* Patient Vitals Summary */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
                1. Patient Demographic & Biometric Baseline
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase">Age / Gender</span>
                  <strong className="text-slate-900">{patientData.age} yrs &middot; {patientData.gender}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase">BMI & Vitals</span>
                  <strong className="text-slate-900">{patientData.bmi} kg/m²</strong>
                  <span className="text-[10px] text-slate-500 block">{patientData.weightKg}kg / {patientData.heightCm}cm</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase">Fasting Glucose</span>
                  <strong className="text-slate-900">{patientData.bloodGlucose} {patientData.glucoseUnit}</strong>
                  <span className="text-[10px] text-slate-500 block">{patientData.bloodGlucose >= 126 ? 'Diabetic Range' : patientData.bloodGlucose >= 100 ? 'Impaired Fasting' : 'Normal'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase">Blood Pressure</span>
                  <strong className="text-slate-900">{patientData.systolicBP}/{patientData.diastolicBP} mmHg</strong>
                </div>
              </div>
            </div>

            {/* SHAP Factor Attribution */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                2. Explainable AI (SHAP) Factor Attribution
              </h2>
              <p className="text-xs text-slate-600 mb-3">
                SHAP values quantify how each physiological biomarker shifts the patient's risk probability above or below reference baseline.
              </p>
              <div className="space-y-2 text-xs">
                {shapContributions.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{item.feature}:</strong>
                        <span className="text-slate-600">{item.patientValue}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                      item.direction === 'increase'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.direction === 'increase' ? `+${(Math.abs(item.impactValue) * 100).toFixed(1)}%` : `-${(Math.abs(item.impactValue) * 100).toFixed(1)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Targeted Prevention Prescriptions */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
                3. Evidence-Based Prevention Roadmap (ADA / WHO Standards)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {effectivePlan.targetedInterventions.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <p className="font-semibold text-slate-900">{item.recommendation}</p>
                    <p className="text-[11px] text-slate-500 italic">{item.clinicalRationale}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Questions */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs">
              <h3 className="font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>Primary Care Physician Discussion Agenda</span>
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-blue-950">
                {effectivePlan.doctorDiscussionGuide.map((q, idx) => (
                  <li key={idx} className="leading-relaxed">{q}</li>
                ))}
              </ol>
              <div className="mt-3 pt-2 border-t border-blue-200 text-blue-800 text-[11px]">
                <strong>Recommended Clinical Follow-up:</strong> {effectivePlan.recommendedFollowUpInterval}
              </div>
            </div>

            {/* Clinical Disclaimer */}
            <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 leading-relaxed">
              <strong>Non-Diagnostic Advisory Notice:</strong> DiaCare XAI is designed exclusively for early risk stratification, health education, and clinical decision support. It is not an automated medical diagnostic device. Final clinical diagnosis of prediabetes or type 2 diabetes mellitus must be established by a licensed healthcare professional through standardized laboratory venous blood assays (FPG, 2-h OGTT, or NGSP-certified HbA1c) with repeat confirmatory testing in accordance with ADA guidelines.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Generated: {new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHtml}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>
            <span>&middot;</span>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
