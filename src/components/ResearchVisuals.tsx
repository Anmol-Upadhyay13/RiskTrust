import React, { useState } from 'react';
import { BenchmarkModelMetrics, AlgorithmType } from '../types/diabetes';
import { BENCHMARK_MODELS } from '../ml/mlEngine';
import { HelpCircle, Sparkles } from 'lucide-react';

interface ConfusionMatrixProps {
  metrics: BenchmarkModelMetrics;
}

export const ConfusionMatrixView: React.FC<ConfusionMatrixProps> = ({ metrics }) => {
  const { truePositive, falsePositive, falseNegative, trueNegative } = metrics.confusionMatrix;
  const total = truePositive + falsePositive + falseNegative + trueNegative;

  const sensitivity = ((truePositive / (truePositive + falseNegative)) * 100).toFixed(1);
  const specificity = ((trueNegative / (trueNegative + falsePositive)) * 100).toFixed(1);
  const ppv = ((truePositive / (truePositive + falsePositive)) * 100).toFixed(1);
  const npv = ((trueNegative / (trueNegative + falseNegative)) * 100).toFixed(1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Confusion Matrix Analysis</h4>
          <p className="text-xs text-slate-500 mt-0.5">Test cohort evaluation (n = {total} patients, 80/20 train-test split)</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-500">Model: {metrics.name.split(' ')[0]}</span>
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* True Positive */}
        <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">True Positive (TP)</span>
            <span className="text-lg font-bold font-mono text-emerald-900">{truePositive}</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            Correctly detected high diabetes risk ({((truePositive / total) * 100).toFixed(1)}% of cohort)
          </p>
        </div>

        {/* False Positive */}
        <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">False Positive (FP - Type I)</span>
            <span className="text-lg font-bold font-mono text-amber-900">{falsePositive}</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1">
            Healthy flagged as high risk (triggers unnecessary lab re-check)
          </p>
        </div>

        {/* False Negative */}
        <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">False Negative (FN - Type II)</span>
            <span className="text-lg font-bold font-mono text-rose-900">{falseNegative}</span>
          </div>
          <p className="text-[11px] text-rose-700 mt-1">
            Missed risk cases (critical failure mode to minimize in medical screening)
          </p>
        </div>

        {/* True Negative */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">True Negative (TN)</span>
            <span className="text-lg font-bold font-mono text-slate-900">{trueNegative}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Correctly identified low baseline risk ({((trueNegative / total) * 100).toFixed(1)}% of cohort)
          </p>
        </div>
      </div>

      {/* Derived Epidemiological Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
        <div className="p-2 rounded bg-slate-50">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Sensitivity (Recall)</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{sensitivity}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">TP / (TP + FN)</div>
        </div>
        <div className="p-2 rounded bg-slate-50">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Specificity</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{specificity}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">TN / (TN + FP)</div>
        </div>
        <div className="p-2 rounded bg-slate-50">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Precision (PPV)</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{ppv}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">TP / (TP + FP)</div>
        </div>
        <div className="p-2 rounded bg-slate-50">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Accuracy</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{(metrics.accuracy * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">(TP + TN) / Total</div>
        </div>
      </div>
    </div>
  );
};

export const ROCCurveView: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>('xgboost');
  const [threshold, setThreshold] = useState<number>(0.50);

  // Approximate ROC curve points for each model
  const curvePoints: Record<AlgorithmType, { fpr: number; tpr: number }[]> = {
    xgboost: [
      { fpr: 0, tpr: 0 },
      { fpr: 0.02, tpr: 0.32 },
      { fpr: 0.05, tpr: 0.58 },
      { fpr: 0.09, tpr: 0.76 },
      { fpr: 0.12, tpr: 0.865 }, // @ threshold 0.50
      { fpr: 0.22, tpr: 0.94 },
      { fpr: 0.40, tpr: 0.98 },
      { fpr: 1, tpr: 1 }
    ],
    random_forest: [
      { fpr: 0, tpr: 0 },
      { fpr: 0.03, tpr: 0.28 },
      { fpr: 0.07, tpr: 0.54 },
      { fpr: 0.11, tpr: 0.72 },
      { fpr: 0.14, tpr: 0.844 },
      { fpr: 0.25, tpr: 0.92 },
      { fpr: 0.45, tpr: 0.97 },
      { fpr: 1, tpr: 1 }
    ],
    svm: [
      { fpr: 0, tpr: 0 },
      { fpr: 0.04, tpr: 0.25 },
      { fpr: 0.08, tpr: 0.50 },
      { fpr: 0.13, tpr: 0.70 },
      { fpr: 0.16, tpr: 0.805 },
      { fpr: 0.30, tpr: 0.90 },
      { fpr: 0.50, tpr: 0.96 },
      { fpr: 1, tpr: 1 }
    ],
    logistic_regression: [
      { fpr: 0, tpr: 0 },
      { fpr: 0.05, tpr: 0.22 },
      { fpr: 0.10, tpr: 0.48 },
      { fpr: 0.15, tpr: 0.68 },
      { fpr: 0.17, tpr: 0.779 },
      { fpr: 0.32, tpr: 0.88 },
      { fpr: 0.55, tpr: 0.95 },
      { fpr: 1, tpr: 1 }
    ],
    knn: [
      { fpr: 0, tpr: 0 },
      { fpr: 0.06, tpr: 0.20 },
      { fpr: 0.12, tpr: 0.42 },
      { fpr: 0.18, tpr: 0.65 },
      { fpr: 0.21, tpr: 0.753 },
      { fpr: 0.38, tpr: 0.85 },
      { fpr: 0.60, tpr: 0.92 },
      { fpr: 1, tpr: 1 }
    ]
  };

  const currentMetrics = BENCHMARK_MODELS[selectedAlgo];
  const points = curvePoints[selectedAlgo];

  // SVG coordinate transformation:
  // width: 320, height: 260. padding: 35
  const width = 360;
  const height = 280;
  const padLeft = 45;
  const padBottom = 35;
  const plotWidth = width - padLeft - 20;
  const plotHeight = height - padBottom - 20;

  const toSvgX = (fpr: number) => padLeft + fpr * plotWidth;
  const toSvgY = (tpr: number) => height - padBottom - tpr * plotHeight;

  const pathD = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(p.fpr)} ${toSvgY(p.tpr)}`)
    .join(' ');

  // Current threshold dynamic point simulation
  const dynamicFpr = Math.max(0.01, Math.min(0.99, (1 - threshold) * 0.45));
  const dynamicTpr = Math.max(0.1, Math.min(0.99, 1 - Math.pow(threshold, 1.8) * 0.4));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">ROC Curve (Receiver Operating Characteristic)</h4>
          <p className="text-xs text-slate-500">True Positive Rate vs. False Positive Rate across decision thresholds</p>
        </div>

        {/* Algorithm selector */}
        <select
          value={selectedAlgo}
          onChange={(e) => setSelectedAlgo(e.target.value as AlgorithmType)}
          className="text-xs font-medium border border-slate-300 rounded-md px-2.5 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
        >
          <option value="xgboost">XGBoost (AUC: 0.912)</option>
          <option value="random_forest">Random Forest (AUC: 0.895)</option>
          <option value="svm">SVM RBF (AUC: 0.869)</option>
          <option value="logistic_regression">Logistic Reg. (AUC: 0.848)</option>
          <option value="knn">KNN (AUC: 0.815)</option>
        </select>
      </div>

      {/* SVG Canvas */}
      <div className="flex justify-center">
        <svg width={width} height={height} className="overflow-visible select-none">
          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((val) => (
            <React.Fragment key={val}>
              {/* Horizontal */}
              <line
                x1={padLeft}
                y1={toSvgY(val)}
                x2={padLeft + plotWidth}
                y2={toSvgY(val)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text x={padLeft - 8} y={toSvgY(val) + 4} textAnchor="end" className="text-[10px] fill-slate-400">
                {val.toFixed(1)}
              </text>
              {/* Vertical */}
              <line
                x1={toSvgX(val)}
                y1={toSvgY(0)}
                x2={toSvgX(val)}
                y2={toSvgY(1)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text x={toSvgX(val)} y={height - padBottom + 16} textAnchor="middle" className="text-[10px] fill-slate-400">
                {val.toFixed(1)}
              </text>
            </React.Fragment>
          ))}

          {/* Diagonal 50/50 reference line (Random Classifier) */}
          <line
            x1={toSvgX(0)}
            y1={toSvgY(0)}
            x2={toSvgX(1)}
            y2={toSvgY(1)}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />

          {/* Area under curve fill */}
          <path
            d={`${pathD} L ${toSvgX(1)} ${toSvgY(0)} L ${toSvgX(0)} ${toSvgY(0)} Z`}
            fill="rgba(59, 130, 246, 0.08)"
          />

          {/* ROC Curve Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Operating Point marker based on threshold */}
          <circle
            cx={toSvgX(dynamicFpr)}
            cy={toSvgY(dynamicTpr)}
            r="6"
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth="2"
          />

          {/* Axis Labels */}
          <text
            x={padLeft + plotWidth / 2}
            y={height - 2}
            textAnchor="middle"
            className="text-xs font-semibold fill-slate-600"
          >
            False Positive Rate (1 - Specificity)
          </text>
          <text
            x={-height / 2 + 15}
            y={12}
            textAnchor="middle"
            transform="rotate(-90)"
            className="text-xs font-semibold fill-slate-600"
          >
            True Positive Rate (Sensitivity / Recall)
          </text>
        </svg>
      </div>

      {/* Threshold Slider Simulation */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-slate-700 flex items-center gap-1">
            Decision Threshold: <span className="font-mono font-bold text-slate-900">{threshold.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400">(Default clinical cutoff: 0.50)</span>
          </span>
          <span className="text-slate-500 font-mono text-xs">ROC-AUC: {currentMetrics.rocAuc}</span>
        </div>
        <input
          type="range"
          min="0.10"
          max="0.90"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <span>0.10 (High Sensitivity / Few Misses)</span>
          <span>0.90 (High Specificity / Few False Alarms)</span>
        </div>
      </div>
    </div>
  );
};
