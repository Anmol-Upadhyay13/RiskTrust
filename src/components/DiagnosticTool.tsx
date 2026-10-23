import React, { useState, useEffect, useRef } from 'react';
import {
  CGMTelemetryPoint,
  LaboratoryAssayInput,
  ADADiagnosticEvaluation,
  TrendArrow
} from '../types/diagnostic';
import {
  generateInitial24hCGM,
  computeAGPReportMetrics,
  simulateNextTelemetryTick,
  evaluateADADiagnosticCriteria
} from '../ml/diagnosticEngine';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Utensils,
  Footprints,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Download,
  Copy,
  Check,
  Stethoscope,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

export const DiagnosticTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cgm' | 'ada' | 'fhir'>('cgm');

  // CGM Real-Time Telemetry State
  const [cgmPoints, setCgmPoints] = useState<CGMTelemetryPoint[]>(() => generateInitial24hCGM(false));
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Laboratory Assay Form State
  const [assayInput, setAssayInput] = useState<LaboratoryAssayInput>({
    fastingPlasmaGlucoseMgDl: 128,
    twoHourOgttMgDl: 205,
    hba1cPercent: 6.8,
    randomPlasmaGlucoseMgDl: 160,
    hasHyperglycemicSymptoms: true,
    isConfirmatoryRetest: true
  });

  const [diagnosticResult, setDiagnosticResult] = useState<ADADiagnosticEvaluation>(() =>
    evaluateADADiagnosticCriteria(assayInput)
  );

  const [copiedFhir, setCopiedFhir] = useState(false);

  // Re-evaluate diagnostic criteria when assay changes
  const handleRunDiagnostic = (input: LaboratoryAssayInput) => {
    setAssayInput(input);
    const res = evaluateADADiagnosticCriteria(input);
    setDiagnosticResult(res);
  };

  // Real-time CGM streaming tick loop
  useEffect(() => {
    if (isStreaming) {
      streamTimerRef.current = setInterval(() => {
        setCgmPoints(prev => {
          const nextPt = simulateNextTelemetryTick(prev);
          const updated = [...prev.slice(1), nextPt];
          return updated;
        });
      }, 2500); // New tick every 2.5 seconds
    } else {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    }
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isStreaming]);

  const handleInjectAction = (action: 'meal' | 'exercise' | 'correction') => {
    setCgmPoints(prev => {
      const nextPt = simulateNextTelemetryTick(prev, action);
      return [...prev.slice(1), nextPt];
    });
  };

  const handleResetCgm = (isDiabetic: boolean) => {
    setIsStreaming(false);
    setCgmPoints(generateInitial24hCGM(isDiabetic));
  };

  // Calculate live AGP stats
  const agpMetrics = computeAGPReportMetrics(cgmPoints);
  const currentGlucose = cgmPoints[cgmPoints.length - 1];

  // Helper for trend arrow
  const renderTrendIcon = (arrow: TrendArrow) => {
    switch (arrow) {
      case 'rapid_rise':
        return <span className="text-rose-600 font-bold text-lg flex items-center">&uarr;&uarr;</span>;
      case 'rise':
        return <span className="text-amber-600 font-bold text-lg flex items-center">&uarr;</span>;
      case 'rapid_fall':
        return <span className="text-rose-600 font-bold text-lg flex items-center">&darr;&darr;</span>;
      case 'fall':
        return <span className="text-blue-600 font-bold text-lg flex items-center">&darr;</span>;
      default:
        return <span className="text-emerald-600 font-bold text-lg flex items-center">&rarr;</span>;
    }
  };

  const copyFhirJson = () => {
    navigator.clipboard.writeText(JSON.stringify(diagnosticResult.fhirR4DiagnosticReport, null, 2));
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  // SVG dimensions for 24h AGP plot
  const svgWidth = 680;
  const svgHeight = 220;
  const padLeft = 40;
  const padRight = 20;
  const padBottom = 30;
  const padTop = 15;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padBottom - padTop;

  const minG = 40;
  const maxG = 300;

  const toX = (idx: number) => padLeft + (idx / (cgmPoints.length - 1)) * plotWidth;
  const toY = (val: number) => svgHeight - padBottom - ((val - minG) / (maxG - minG)) * plotHeight;

  const cgmPathD = cgmPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toX(idx)} ${toY(p.glucose)}`)
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
              Clinical Diagnostic Engine & Telemetry
            </span>
            <span className="text-xs text-slate-400">&middot;</span>
            <span className="text-xs font-mono text-slate-400">ADA 2026 / WHO Standards</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Real-Time Diagnostic Engine & Ambulatory Glucose Profiler
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Production-grade clinical diagnostics evaluating real-time continuous glucose monitor (CGM) telemetry streams alongside gold-standard laboratory assays (FPG, OGTT, HbA1c) with EHR / FHIR R4 interoperability.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs font-medium self-start md:self-auto shrink-0 border border-slate-700">
          <button
            onClick={() => setActiveTab('cgm')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cgm' ? 'bg-teal-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Real-Time CGM Telemetry</span>
          </button>
          <button
            onClick={() => setActiveTab('ada')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ada' ? 'bg-teal-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>ADA Laboratory Evaluator</span>
          </button>
          <button
            onClick={() => setActiveTab('fhir')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fhir' ? 'bg-teal-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>FHIR R4 Diagnostic Report</span>
          </button>
        </div>
      </div>

      {/* MODE 1: REAL-TIME CGM TELEMETRY & AGP */}
      {activeTab === 'cgm' && (
        <div className="space-y-6">
          {/* Live Telemetry Bar & Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Current Live Glucose Meter */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="text-3xl font-extrabold font-mono text-slate-900 flex items-center gap-1">
                  {currentGlucose.glucose}
                  <span className="text-xs font-normal text-slate-500 font-sans">mg/dL</span>
                </div>
                <div className="flex flex-col items-center pl-2 border-l border-slate-200">
                  {renderTrendIcon(currentGlucose.trendArrow)}
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">{currentGlucose.timeLabel}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span className="text-xs font-bold text-slate-800">
                    {isStreaming ? 'Streaming Telemetry Active (2.5s tick)' : 'Telemetry Stream Paused'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Simulating interstitial glucose enzymatic sensing with real-time lag compensation
                </p>
              </div>
            </div>

            {/* Interactive Telemetry Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsStreaming(!isStreaming)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs ${
                  isStreaming ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isStreaming ? 'Pause Stream' : 'Start Live Stream'}</span>
              </button>

              <button
                onClick={() => handleInjectAction('meal')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
                title="Simulate 55g carbohydrate meal ingestion"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-600" />
                <span>+Meal (55g Carbs)</span>
              </button>

              <button
                onClick={() => handleInjectAction('exercise')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
                title="Simulate 30 min aerobic exercise"
              >
                <Footprints className="w-3.5 h-3.5 text-blue-600" />
                <span>+Exercise Bout</span>
              </button>

              <button
                onClick={() => handleResetCgm(false)}
                className="px-2 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-xs cursor-pointer"
                title="Reset normal baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 24-Hour Ambulatory Glucose Profile (AGP) SVG Telemetry Plot */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Ambulatory Glucose Profile (AGP)
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  24-Hour Continuous Telemetry Trajectory with Target Glycemic Bands
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Target (70–180 mg/dL)
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Hyper &gt;180
                </span>
                <span className="flex items-center gap-1 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Hypo &lt;70
                </span>
              </div>
            </div>

            {/* SVG Plot */}
            <div className="flex justify-center overflow-x-auto py-2">
              <svg width={svgWidth} height={svgHeight} className="overflow-visible select-none">
                {/* Target Range Band (70 - 180 mg/dL shaded green) */}
                <rect
                  x={padLeft}
                  y={toY(180)}
                  width={plotWidth}
                  height={toY(70) - toY(180)}
                  fill="rgba(16, 185, 129, 0.08)"
                />

                {/* Hyperglycemia reference line (180 mg/dL) */}
                <line
                  x1={padLeft}
                  y1={toY(180)}
                  x2={padLeft + plotWidth}
                  y2={toY(180)}
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                />

                {/* Hypoglycemia reference line (70 mg/dL) */}
                <line
                  x1={padLeft}
                  y1={toY(70)}
                  x2={padLeft + plotWidth}
                  y2={toY(70)}
                  stroke="#f43f5e"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                />

                {/* Horizontal grid lines */}
                {[70, 120, 180, 240].map(val => (
                  <React.Fragment key={val}>
                    <line
                      x1={padLeft}
                      y1={toY(val)}
                      x2={padLeft + plotWidth}
                      y2={toY(val)}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 6}
                      y={toY(val) + 4}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-slate-400"
                    >
                      {val}
                    </text>
                  </React.Fragment>
                ))}

                {/* CGM Continuous Path */}
                <path
                  d={cgmPathD}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Event Markers */}
                {cgmPoints.map((pt, i) => {
                  if (pt.event === 'meal') {
                    return (
                      <g key={i}>
                        <circle cx={toX(i)} cy={toY(pt.glucose)} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    );
                  }
                  if (pt.event === 'exercise') {
                    return (
                      <g key={i}>
                        <circle cx={toX(i)} cy={toY(pt.glucose)} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    );
                  }
                  return null;
                })}

                {/* Current Latest Point Marker */}
                <circle
                  cx={toX(cgmPoints.length - 1)}
                  cy={toY(currentGlucose.glucose)}
                  r="6"
                  fill="#0f766e"
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* Time Axis labels */}
                {cgmPoints
                  .filter((_, idx) => idx % 16 === 0)
                  .map((pt, idx) => (
                    <text
                      key={idx}
                      x={toX(cgmPoints.indexOf(pt))}
                      y={svgHeight - padBottom + 16}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-400"
                    >
                      {pt.timeLabel}
                    </text>
                  ))}
              </svg>
            </div>
          </div>

          {/* International Consensus AGP Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* TIR */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                Time in Range (70–180)
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {agpMetrics.timeInRangePct}%
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>Target: &gt;70%</span>
                <span className={agpMetrics.timeInRangePct >= 70 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                  ({agpMetrics.timeInRangePct >= 70 ? 'Target Met' : 'Sub-Optimal'})
                </span>
              </div>
            </div>

            {/* GMI */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                GMI (Estimated A1c)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {agpMetrics.glucoseManagementIndicatorGmi}%
              </div>
              <div className="text-[11px] text-slate-500">
                Mean: <strong className="font-mono text-slate-800">{agpMetrics.meanGlucoseMgDl} mg/dL</strong>
              </div>
            </div>

            {/* Glycemic Variability (CV %) */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                Glycemic Variability (CV %)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {agpMetrics.glucoseVariabilityCv}%
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>Target: &le;36%</span>
                <span className={agpMetrics.glucoseVariabilityCv <= 36 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                  ({agpMetrics.glucoseVariabilityCv <= 36 ? 'Stable' : 'High Fluctuation'})
                </span>
              </div>
            </div>

            {/* Time Below Range (Hypo) */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700">
                Time Below Range (&lt;70)
              </span>
              <div className="text-2xl font-bold font-mono text-rose-700">
                {agpMetrics.timeLowPct + agpMetrics.timeVeryLowPct}%
              </div>
              <div className="text-[11px] text-slate-500">
                Target: &lt;4% (<span className="text-rose-600 font-mono">&lt;54 mg/dL: {agpMetrics.timeVeryLowPct}%</span>)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: FORMAL ADA CLINICAL LABORATORY ASSAY EVALUATOR */}
      {activeTab === 'ada' && (
        <div className="space-y-6">
          {/* Diagnostic Determination Hero */}
          <div className={`p-6 rounded-2xl border transition-all ${
            diagnosticResult.diagnosticTier.includes('Confirmed') || diagnosticResult.diagnosticTier.includes('Crisis')
              ? 'bg-rose-50/80 border-rose-300'
              : diagnosticResult.diagnosticTier.includes('Prediabetes') || diagnosticResult.diagnosticTier.includes('Discordant')
              ? 'bg-amber-50/80 border-amber-300'
              : 'bg-emerald-50/80 border-emerald-300'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl text-white ${
                  diagnosticResult.diagnosticTier.includes('Confirmed')
                    ? 'bg-rose-600'
                    : diagnosticResult.diagnosticTier.includes('Prediabetes')
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}>
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Formal Clinical Determination
                    </span>
                    <span className="text-xs text-slate-400">&middot;</span>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-white/80 px-2 py-0.5 rounded border border-slate-300">
                      ICD-10: {diagnosticResult.icd10Code}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {diagnosticResult.diagnosticTier}
                  </h3>
                  <p className="text-xs text-slate-700 max-w-2xl mt-1 leading-relaxed">
                    {diagnosticResult.summaryVerdict}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-slate-200 text-xs font-mono text-center min-w-[170px]">
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Concordance</span>
                <strong className="text-slate-900 block mt-0.5">{diagnosticResult.concordanceStatus}</strong>
              </div>
            </div>

            {/* Repeat testing guidance */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 text-xs text-slate-700 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span><strong>ADA Protocol Instructions:</strong> {diagnosticResult.repeatProtocolInstructions}</span>
            </div>
          </div>

          {/* Interactive Assay Laboratory Inputs */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Input Venipuncture Laboratory Assays
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Fasting Plasma Glucose (FPG, mg/dL)
                </label>
                <input
                  type="number"
                  value={assayInput.fastingPlasmaGlucoseMgDl}
                  onChange={(e) => handleRunDiagnostic({ ...assayInput, fastingPlasmaGlucoseMgDl: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-base focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Threshold: &ge;126 Diabetic, 100-125 IFG</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  2-Hour 75g OGTT (mg/dL)
                </label>
                <input
                  type="number"
                  value={assayInput.twoHourOgttMgDl}
                  onChange={(e) => handleRunDiagnostic({ ...assayInput, twoHourOgttMgDl: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-base focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Threshold: &ge;200 Diabetic, 140-199 IGT</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  HbA1c (% - NGSP Certified)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={assayInput.hba1cPercent}
                  onChange={(e) => handleRunDiagnostic({ ...assayInput, hba1cPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-base focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Threshold: &ge;6.5% Diabetic, 5.7-6.4% Prediabetes</span>
              </div>
            </div>

            {/* Checkbox triggers */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assayInput.isConfirmatoryRetest}
                  onChange={(e) => handleRunDiagnostic({ ...assayInput, isConfirmatoryRetest: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                />
                <span className="font-medium text-slate-800">This is a confirmatory repeat test on a separate day</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assayInput.hasHyperglycemicSymptoms}
                  onChange={(e) => handleRunDiagnostic({ ...assayInput, hasHyperglycemicSymptoms: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                />
                <span className="font-medium text-slate-800">Classic hyperglycemic crisis symptoms present (polyuria, polydipsia)</span>
              </label>
            </div>
          </div>

          {/* Criteria Breakdown Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Laboratory Modality</th>
                  <th className="py-2.5 px-3">LOINC Code</th>
                  <th className="py-2.5 px-3 font-mono">Patient Value</th>
                  <th className="py-2.5 px-3">ADA Reference Thresholds</th>
                  <th className="py-2.5 px-3 text-right">Interpretation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diagnosticResult.criteriaBreakdown.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{c.criterionName}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{c.loincCode}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{c.patientValue}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">{c.threshold}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.status === 'Diabetic Diagnostic Range'
                          ? 'bg-rose-100 text-rose-700'
                          : c.status === 'Prediabetes Range'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clinical Action Plan */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Evidence-Based Clinical Action Protocol:
            </h4>
            <div className="space-y-2">
              {diagnosticResult.clinicalActionPlan.map((action, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: EHR / FHIR R4 DIAGNOSTIC REPORT EXPORTER */}
      {activeTab === 'fhir' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                Health Level 7 (HL7) &middot; FHIR R4 Standard
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                EHR-Compliant DiagnosticReport JSON Resource
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ready for clinical EHR ingestion (Epic Systems, Cerner, FHIR RESTful endpoint)
              </p>
            </div>

            <button
              onClick={copyFhirJson}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              {copiedFhir ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFhir ? 'FHIR Copied!' : 'Copy FHIR R4 JSON'}</span>
            </button>
          </div>

          <pre className="font-mono text-xs bg-slate-950 text-emerald-400 p-4 rounded-xl overflow-x-auto whitespace-pre leading-relaxed max-h-[500px]">
            {JSON.stringify(diagnosticResult.fhirR4DiagnosticReport, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
