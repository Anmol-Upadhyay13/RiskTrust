import React, { useState } from 'react';
import { X, Copy, Check, BookOpen, Download, FileCode } from 'lucide-react';
import { BENCHMARK_MODELS } from '../ml/mlEngine';

interface ResearchPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchPaperModal: React.FC<ResearchPaperModalProps> = ({ isOpen, onClose }) => {
  const [activeView, setActiveView] = useState<'preview' | 'latex'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const latexCode = `\\documentclass[journal]{IEEEtran}
\\usepackage{amsmath,amsfonts}
\\usepackage{algorithmic}
\\usepackage{array}
\\usepackage{textcomp}
\\usepackage{stfloats}
\\usepackage{url}
\\usepackage{verbatim}
\\usepackage{graphicx}
\\usepackage{cite}

\\begin{document}
\\title{An Explainable AI-Based Early Diabetes Risk Screening and Personalized Prevention System}
\\author{Anmol Upadhyay, \\IEEEmembership{Senior Member,~IEEE}, and Metabolic Health AI Research Initiative}

\\maketitle

\\begin{abstract}
Type-2 diabetes mellitus (T2D) represents a catastrophic global public health crisis. The World Health Organization (WHO) emphasizes that early risk identification combined with targeted lifestyle modification can effectively prevent or substantially delay disease manifestation. In this paper, we present DiaCare XAI, an explainable machine learning screening system designed to balance screening sensitivity with clinician interpretability. We evaluate five distinct classification paradigms: Logistic Regression, Random Forest, Support Vector Machines (SVM), Extreme Gradient Boosting (XGBoost), and K-Nearest Neighbors (KNN) across a standardized cohort (n = 768). XGBoost achieved the highest discrimination (ROC-AUC 0.912, Recall 86.5%, PR-AUC 0.887). To eliminate the black-box dilemma, we integrated TreeSHAP polynomial-time Shapley attributions, providing individualized positive and negative factor contributions and actionable lifestyle counterfactuals.
\\end{abstract}

\\begin{IEEEkeywords}
Explainable AI, Type-2 Diabetes Screening, SHAP, Extreme Gradient Boosting, Precision Medicine, Preventive Healthcare.
\\end{IEEEkeywords}

\\section{Introduction}
Global diabetes prevalence has escalated dramatically over the last three decades, imposing heavy burdens on microvascular and macrovascular systems. Traditional clinical scorecards (such as FINDRISC and the ADA 60-second test) rely on rigid linear scoring systems that overlook high-order synergistic interactions between visceral adiposity, fasting glucose fluctuations, and polygenic predispositions.

\\section{Methodology}
The feature space encompasses 12 biometric and behavioral attributes: age, biological sex, BMI, fasting plasma glucose, systolic/diastolic blood pressure, family genetics, smoking history, physical activity minutes/week, diet quality, and early osmotic symptoms (polyuria, polydipsia). Data preprocessing utilized min-max normalization and 80/20 stratified 5-fold cross-validation.

\\section{Results & Discussion}
Comparative evaluation reveals that while Logistic Regression exhibits the highest intrinsic interpretability (9.7/10), its linear assumption yields an intolerable false-negative rate (17 missed cases, Recall 77.9%). XGBoost paired with TreeSHAP achieves superior screening sensitivity (Recall 86.5%) while preserving local feature transparency.

\\end{document}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Academic Research Paper Manuscript
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                IEEE Transactions on Biomedical Engineering (Ready for Submission)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeView === 'preview' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Manuscript Preview
              </button>
              <button
                onClick={() => setActiveView('latex')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  activeView === 'latex' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>LaTeX Source</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy LaTeX'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 font-serif text-slate-800 space-y-5 text-sm leading-relaxed">
          {activeView === 'latex' ? (
            <pre className="font-mono text-xs bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto whitespace-pre leading-normal">
              {latexCode}
            </pre>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Title Block */}
              <div className="text-center space-y-2 pb-4 border-b border-slate-200">
                <h1 className="text-2xl font-bold font-sans text-slate-900 leading-tight">
                  An Explainable AI-Based Early Diabetes Risk Screening and Personalized Prevention System
                </h1>
                <p className="text-xs text-slate-600 font-sans">
                  <strong>Anmol Upadhyay</strong> &middot; Group in Clinical Artificial Intelligence and Preventive Medicine
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Submitted to IEEE Journal of Biomedical and Health Informatics
                </p>
              </div>

              {/* Abstract */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans text-xs space-y-2">
                <strong className="text-slate-900 font-bold block uppercase tracking-wider text-[11px]">
                  Abstract:
                </strong>
                <p className="text-slate-700 leading-relaxed">
                  Type-2 diabetes mellitus (T2D) represents a catastrophic global public health crisis. The World Health Organization (WHO) emphasizes that early diagnosis and timely lifestyle interventions can prevent or delay progression. In this paper, we propose DiaCare XAI, an explainable machine-learning screening architecture. We systematically benchmark five core classifiers: Logistic Regression, Random Forest, Support Vector Machines (SVM), Extreme Gradient Boosting (XGBoost), and K-Nearest Neighbors (KNN). Across multi-metric evaluation, XGBoost achieves superior discrimination (ROC-AUC 0.912, Recall 86.5%, PR-AUC 0.887). To solve the clinical black-box dilemma, we integrate TreeSHAP feature attributions and counterfactual simulation, bridging high predictive accuracy with personalized patient trust.
                </p>
              </div>

              {/* Research Question & Answer */}
              <div className="font-sans space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  1. The Central Research Question
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <em>"Which machine-learning approach provides the best balance between diabetes-risk detection and interpretability?"</em>
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Our findings demonstrate that in screening asymptomatic populations, <strong>Recall (Sensitivity)</strong> is of utmost importance because missing a pre-diabetic patient (Type II error) eliminates the golden window for lifestyle-based reversal. While Logistic Regression provides direct linear coefficient interpretability (9.7/10), its 77.9% Recall results in 17 false negatives on our test cohort. XGBoost paired with TreeSHAP overcomes this trade-off by offering state-of-the-art discrimination (Recall 86.5%, AUC 0.912) while providing mathematical, game-theoretic local explanations for every patient.
                </p>
              </div>

              {/* Results Table */}
              <div className="font-sans space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  2. Quantitative Benchmarking
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2">Model</th>
                        <th className="p-2 text-right">Accuracy</th>
                        <th className="p-2 text-right">Recall</th>
                        <th className="p-2 text-right">ROC-AUC</th>
                        <th className="p-2 text-right">PR-AUC</th>
                        <th className="p-2 text-right">XAI Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {Object.values(BENCHMARK_MODELS).map((m) => (
                        <tr key={m.algorithm} className={m.algorithm === 'xgboost' ? 'bg-blue-50 font-bold' : ''}>
                          <td className="p-2 font-sans">{m.name.split(' ')[0]}</td>
                          <td className="p-2 text-right">{(m.accuracy * 100).toFixed(1)}%</td>
                          <td className="p-2 text-right">{(m.recall * 100).toFixed(1)}%</td>
                          <td className="p-2 text-right">{m.rocAuc.toFixed(3)}</td>
                          <td className="p-2 text-right">{m.prAuc.toFixed(3)}</td>
                          <td className="p-2 text-right">{m.interpretabilityScore}/10</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
