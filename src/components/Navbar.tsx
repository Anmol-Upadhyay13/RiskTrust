import React from 'react';
import {
  Activity,
  FileText,
  BarChart2,
  History,
  Shield,
  HeartPulse,
  BrainCircuit,
  Users,
  Stethoscope
} from 'lucide-react';

export type NavTab = 'screening' | 'explainable' | 'prevention' | 'diagnostic' | 'research' | 'batch' | 'history';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenDisclaimer: () => void;
  hasAssessment: boolean;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenDisclaimer,
  hasAssessment,
  historyCount
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  Risk<span className="text-teal-600">Trust</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 border-l border-slate-200 pl-2 hidden sm:inline">
                  Reliability & XAI Framework
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Uncertainty-Aware Diabetes Screening, Calibration & Constrained Recourse
              </p>
            </div>
          </div>

          {/* Clinical Ethics & Disclaimer link */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDisclaimer}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Clinical Ethics & Guidelines</span>
              <span className="sm:hidden">Ethics</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => onTabChange('screening')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'screening'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1. Health Questionnaire</span>
          </button>

          <button
            onClick={() => onTabChange('explainable')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'explainable'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>2. XAI Assessment & "Why This Risk?"</span>
            {hasAssessment && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
          </button>

          <button
            onClick={() => onTabChange('prevention')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'prevention'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Prevention Plan & Doctor Guide</span>
          </button>

          <button
            onClick={() => onTabChange('diagnostic')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'diagnostic'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-500" />
            <span>4. Real-Time Diagnostic Tool</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              activeTab === 'diagnostic' ? 'bg-blue-700 text-teal-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
            }`}>
              CGM &middot; ADA Lab
            </span>
          </button>

          <button
            onClick={() => onTabChange('research')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'research'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>5. ML Research & Reliability Lab</span>
          </button>

          <button
            onClick={() => onTabChange('batch')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>6. Batch Screening Lab</span>
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>7. History ({historyCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
