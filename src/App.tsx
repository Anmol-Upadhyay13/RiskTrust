/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PatientInput, AlgorithmType, FullAssessmentResult } from './types/diabetes';
import { conductFullAssessment, PRESET_PATIENT_PROFILES } from './ml/mlEngine';
import { runRiskTrustReliabilityAudit } from './ml/reliabilityEngine';
import { Navbar, NavTab } from './components/Navbar';
import { Questionnaire } from './components/Questionnaire';
import { ExplainableResults } from './components/ExplainableResults';
import { PreventionPlan } from './components/PreventionPlan';
import { ResearchLab } from './components/ResearchLab';
import { BatchScreeningLab } from './components/BatchScreeningLab';
import { HistoryDashboard } from './components/HistoryDashboard';
import { MedicalDisclaimerModal } from './components/MedicalDisclaimerModal';
import { ShieldCheck, Info } from 'lucide-react';

const STORAGE_KEY = 'diacare_xai_history';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('screening');
  const [selectedModel, setSelectedModel] = useState<AlgorithmType>('xgboost');
  const [patientData, setPatientData] = useState<PatientInput>(PRESET_PATIENT_PROFILES[0].data);
  const [assessment, setAssessment] = useState<FullAssessmentResult>(() => {
    const res = conductFullAssessment(PRESET_PATIENT_PROFILES[0].data, 'xgboost');
    res.reliabilityAudit = runRiskTrustReliabilityAudit(
      PRESET_PATIENT_PROFILES[0].data,
      'xgboost',
      res.primaryPrediction,
      res.shapContributions
    );
    return res;
  });
  const [history, setHistory] = useState<FullAssessmentResult[]>([]);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to parse history from localStorage', e);
    }

    // Seed default 3-visit demonstration trend
    seedDemoHistory();
  }, []);

  const saveHistoryToStorage = (newHistory: FullAssessmentResult[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error saving history to localStorage', e);
    }
  };

  const seedDemoHistory = () => {
    const p1: PatientInput = {
      ...PRESET_PATIENT_PROFILES[0].data,
      bloodGlucose: 135,
      bmi: 33.2,
      physicalActivityMinutes: 20
    };
    const p2: PatientInput = {
      ...PRESET_PATIENT_PROFILES[0].data,
      bloodGlucose: 120,
      bmi: 30.5,
      physicalActivityMinutes: 75
    };
    const p3: PatientInput = {
      ...PRESET_PATIENT_PROFILES[0].data,
      bloodGlucose: 108,
      bmi: 28.1,
      physicalActivityMinutes: 150
    };

    const d1 = conductFullAssessment(p1, 'xgboost');
    d1.timestamp = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const d2 = conductFullAssessment(p2, 'xgboost');
    d2.timestamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const d3 = conductFullAssessment(p3, 'xgboost');
    d3.timestamp = new Date().toISOString();

    saveHistoryToStorage([d1, d2, d3]);
  };

  const handleAssessmentSubmit = (data: PatientInput, algo: AlgorithmType) => {
    const result = conductFullAssessment(data, algo);
    result.reliabilityAudit = runRiskTrustReliabilityAudit(
      data,
      algo,
      result.primaryPrediction,
      result.shapContributions
    );
    setAssessment(result);
    setPatientData(data);
    setSelectedModel(algo);

    // Append to history
    const updatedHistory = [result, ...history.slice(0, 19)];
    saveHistoryToStorage(updatedHistory);

    // Switch to XAI results tab
    setActiveTab('explainable');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectModel = (algo: AlgorithmType) => {
    setSelectedModel(algo);
    const result = conductFullAssessment(patientData, algo);
    result.reliabilityAudit = runRiskTrustReliabilityAudit(
      patientData,
      algo,
      result.primaryPrediction,
      result.shapContributions
    );
    setAssessment(result);
  };

  const handleSelectHistoryAssessment = (item: FullAssessmentResult) => {
    setAssessment(item);
    setPatientData(item.patientData);
    setSelectedModel(item.selectedModel);
    setActiveTab('explainable');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadPatientFromBatch = (patient: PatientInput) => {
    setPatientData(patient);
    const result = conductFullAssessment(patient, selectedModel);
    result.reliabilityAudit = runRiskTrustReliabilityAudit(
      patient,
      selectedModel,
      result.primaryPrediction,
      result.shapContributions
    );
    setAssessment(result);
    setActiveTab('explainable');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    saveHistoryToStorage([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        hasAssessment={Boolean(assessment)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'screening' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-teal-950 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
              <div className="max-w-3xl">
                <span className="text-[11px] font-mono tracking-wider uppercase text-teal-300 block mb-1">
                  RiskTrust Reliability Engine &middot; Audited Clinical AI
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Uncertainty-Aware Diabetes Risk Screening & Reliability Engine
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Investigating whether combining probability calibration, uncertainty estimation, explanation-stability auditing, and constrained counterfactuals identifies unreliable diabetes risk predictions more effectively than conventional performance metrics alone.
                </p>
              </div>
            </div>

            <Questionnaire
              currentPatient={patientData}
              selectedModel={selectedModel}
              onUpdatePatient={setPatientData}
              onSelectModel={handleSelectModel}
              onSubmit={handleAssessmentSubmit}
            />
          </div>
        )}

        {activeTab === 'explainable' && (
          <ExplainableResults
            assessment={assessment}
            onNavigateToPrevention={() => {
              setActiveTab('prevention');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectModel={handleSelectModel}
          />
        )}

        {activeTab === 'prevention' && (
          <PreventionPlan assessment={assessment} />
        )}

        {activeTab === 'research' && (
          <ResearchLab />
        )}

        {activeTab === 'batch' && (
          <BatchScreeningLab onLoadPatientIntoAssessment={handleLoadPatientFromBatch} />
        )}

        {activeTab === 'history' && (
          <HistoryDashboard
            history={history}
            onSelectAssessment={handleSelectHistoryAssessment}
            onClearHistory={handleClearHistory}
            onSeedDemoHistory={seedDemoHistory}
          />
        )}
      </main>

      {/* Global Medical Ethics Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>DiaCare XAI</strong> · Designed for early preventive risk stratification & clinical shared decision-making.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="hover:text-slate-900 cursor-pointer underline underline-offset-2"
            >
              Medical Disclaimer & ADA Guidelines
            </button>
            <span>·</span>
            <span>WHO Metabolic Guidelines</span>
          </div>
        </div>
      </footer>

      {/* Clinical Ethics Modal */}
      <MedicalDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
}
