import React, { useState } from 'react';
import { PatientInput, AlgorithmType } from '../types/diabetes';
import { generatePartialDependenceCurve } from '../ml/mlEngine';
import { TrendingUp, HelpCircle, User } from 'lucide-react';

interface PartialDependenceViewProps {
  patient: PatientInput;
  selectedModel: AlgorithmType;
}

export const PartialDependenceView: React.FC<PartialDependenceViewProps> = ({
  patient,
  selectedModel
}) => {
  const [activeFeature, setActiveFeature] = useState<'glucose' | 'bmi' | 'activity' | 'age'>('glucose');

  const curveData = generatePartialDependenceCurve(patient, activeFeature, selectedModel);

  // SVG dimensions
  const width = 500;
  const height = 220;
  const padLeft = 45;
  const padBottom = 35;
  const padTop = 20;
  const padRight = 25;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padBottom - padTop;

  const minX = curveData.points[0]?.value || 0;
  const maxX = curveData.points[curveData.points.length - 1]?.value || 100;
  const minY = 0;
  const maxY = 100;

  const toSvgX = (val: number) => padLeft + ((val - minX) / (maxX - minX)) * plotWidth;
  const toSvgY = (riskPct: number) => height - padBottom - (riskPct / maxY) * plotHeight;

  const pathD = curveData.points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(p.value)} ${toSvgY(p.predictedRisk)}`)
    .join(' ');

  // Find predicted risk for current patient value
  const currentSvgX = toSvgX(curveData.patientCurrentValue);
  // Interpolate y
  const closestPoint = curveData.points.reduce((prev, curr) => {
    return Math.abs(curr.value - curveData.patientCurrentValue) < Math.abs(prev.value - curveData.patientCurrentValue) ? curr : prev;
  }, curveData.points[0]);
  const currentSvgY = toSvgY(closestPoint.predictedRisk);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Advanced Model Interpretability
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            Partial Dependence Plot (PDP): Non-Linear Risk Curvature
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Marginal effect of a single biometric factor on predicted risk holding all other patient features frozen
          </p>
        </div>

        {/* Feature selector tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          {[
            { key: 'glucose', label: 'Glucose' },
            { key: 'bmi', label: 'BMI' },
            { key: 'activity', label: 'Activity' },
            { key: 'age', label: 'Age' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFeature(tab.key as any)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activeFeature === tab.key
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Plot */}
      <div className="flex justify-center overflow-x-auto py-1">
        <svg width={width} height={height} className="overflow-visible select-none">
          {/* Y Grid lines (0%, 25%, 50%, 75%, 100%) */}
          {[0, 25, 50, 75, 100].map((val) => (
            <React.Fragment key={val}>
              <line
                x1={padLeft}
                y1={toSvgY(val)}
                x2={padLeft + plotWidth}
                y2={toSvgY(val)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={toSvgY(val) + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400"
              >
                {val}%
              </text>
            </React.Fragment>
          ))}

          {/* Moderate/High Risk Threshold Reference Lines */}
          <line
            x1={padLeft}
            y1={toSvgY(55)}
            x2={padLeft + plotWidth}
            y2={toSvgY(55)}
            stroke="#fecaca"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text
            x={padLeft + plotWidth - 4}
            y={toSvgY(55) - 4}
            textAnchor="end"
            className="text-[9px] font-mono fill-rose-500"
          >
            High Risk Cutoff (55%)
          </text>

          {/* Area under curve */}
          <path
            d={`${pathD} L ${toSvgX(maxX)} ${toSvgY(0)} L ${toSvgX(minX)} ${toSvgY(0)} Z`}
            fill="rgba(59, 130, 246, 0.08)"
          />

          {/* Partial Dependence Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data points */}
          {curveData.points.map((pt, i) => (
            <circle
              key={i}
              cx={toSvgX(pt.value)}
              cy={toSvgY(pt.predictedRisk)}
              r="3"
              fill="#2563eb"
            />
          ))}

          {/* Current Patient Position Marker */}
          <line
            x1={currentSvgX}
            y1={toSvgY(0)}
            x2={currentSvgX}
            y2={currentSvgY}
            stroke="#dc2626"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
          <circle
            cx={currentSvgX}
            cy={currentSvgY}
            r="6"
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <text
            x={currentSvgX}
            y={currentSvgY - 10}
            textAnchor="middle"
            className="text-[10px] font-bold fill-rose-700 bg-white"
          >
            You ({curveData.patientCurrentValue} {curveData.unit})
          </text>

          {/* X Axis labels */}
          {curveData.points
            .filter((_, idx) => idx % 2 === 0)
            .map((pt, idx) => (
              <text
                key={idx}
                x={toSvgX(pt.value)}
                y={height - padBottom + 16}
                textAnchor="middle"
                className="text-[10px] font-mono fill-slate-500"
              >
                {pt.value}
              </text>
            ))}

          {/* Axis Labels */}
          <text
            x={padLeft + plotWidth / 2}
            y={height - 2}
            textAnchor="middle"
            className="text-xs font-semibold fill-slate-700"
          >
            {curveData.featureName} ({curveData.unit})
          </text>
          <text
            x={-height / 2 + 10}
            y={12}
            textAnchor="middle"
            transform="rotate(-90)"
            className="text-xs font-semibold fill-slate-700"
          >
            Predicted Risk Probability (%)
          </text>
        </svg>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
        <strong>Clinical Insight:</strong> The curve demonstrates non-linear inflection dynamics. Notice how small shifts near borderline thresholds (e.g., fasting glucose shifting from 95 to 115 mg/dL) cause disproportionate risk accelerations compared to changes within normal physiological margins.
      </div>
    </div>
  );
};
