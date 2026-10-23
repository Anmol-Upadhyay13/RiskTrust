import React from 'react';
import { Layers, Info } from 'lucide-react';

export const SHAPBeeswarmPlot: React.FC = () => {
  // Synthetic reference cohort beeswarm distribution points for the top 6 features
  const features = [
    {
      name: 'Blood Glucose',
      points: [
        { shap: 0.28, val: 'high' }, { shap: 0.26, val: 'high' }, { shap: 0.24, val: 'high' },
        { shap: 0.21, val: 'high' }, { shap: 0.18, val: 'high' }, { shap: 0.12, val: 'mid' },
        { shap: 0.08, val: 'mid' }, { shap: 0.02, val: 'mid' }, { shap: -0.05, val: 'low' },
        { shap: -0.09, val: 'low' }, { shap: -0.14, val: 'low' }, { shap: -0.18, val: 'low' },
      ]
    },
    {
      name: 'Body Mass Index (BMI)',
      points: [
        { shap: 0.22, val: 'high' }, { shap: 0.19, val: 'high' }, { shap: 0.16, val: 'high' },
        { shap: 0.13, val: 'high' }, { shap: 0.08, val: 'mid' }, { shap: 0.04, val: 'mid' },
        { shap: -0.02, val: 'mid' }, { shap: -0.07, val: 'low' }, { shap: -0.11, val: 'low' },
        { shap: -0.15, val: 'low' },
      ]
    },
    {
      name: 'Family History',
      points: [
        { shap: 0.15, val: 'high' }, { shap: 0.14, val: 'high' }, { shap: 0.14, val: 'high' },
        { shap: 0.13, val: 'high' }, { shap: -0.04, val: 'low' }, { shap: -0.05, val: 'low' },
        { shap: -0.05, val: 'low' }, { shap: -0.06, val: 'low' },
      ]
    },
    {
      name: 'Physical Activity',
      points: [
        // Note: high activity is protective (negative SHAP), low activity has positive SHAP!
        { shap: 0.10, val: 'low' }, { shap: 0.09, val: 'low' }, { shap: 0.06, val: 'low' },
        { shap: 0.02, val: 'mid' }, { shap: -0.03, val: 'mid' }, { shap: -0.08, val: 'high' },
        { shap: -0.12, val: 'high' }, { shap: -0.16, val: 'high' }, { shap: -0.19, val: 'high' },
      ]
    },
    {
      name: 'Age (≥45 yrs)',
      points: [
        { shap: 0.12, val: 'high' }, { shap: 0.10, val: 'high' }, { shap: 0.07, val: 'high' },
        { shap: 0.03, val: 'mid' }, { shap: -0.01, val: 'mid' }, { shap: -0.05, val: 'low' },
        { shap: -0.08, val: 'low' },
      ]
    },
    {
      name: 'Blood Pressure',
      points: [
        { shap: 0.11, val: 'high' }, { shap: 0.08, val: 'high' }, { shap: 0.05, val: 'mid' },
        { shap: 0.01, val: 'mid' }, { shap: -0.03, val: 'low' }, { shap: -0.06, val: 'low' },
      ]
    }
  ];

  const width = 540;
  const height = 260;
  const padLeft = 145;
  const padRight = 35;
  const padBottom = 30;
  const padTop = 15;
  const plotWidth = width - padLeft - padRight;
  const minShap = -0.22;
  const maxShap = 0.32;

  const toSvgX = (shap: number) => padLeft + ((shap - minShap) / (maxShap - minShap)) * plotWidth;
  const zeroX = toSvgX(0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Global Population XAI
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            TreeSHAP Summary Beeswarm Distribution (Validation Cohort)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Each dot represents an individual patient record; horizontal position shows impact on risk
          </p>
        </div>

        {/* Feature Value Color Legend */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-medium text-slate-500">Feature Value:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-blue-600 font-semibold">Low</span>
            <div className="w-16 h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-400 to-rose-500"></div>
            <span className="text-[10px] text-rose-600 font-semibold">High</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex justify-center overflow-x-auto py-1">
        <svg width={width} height={height} className="overflow-visible select-none">
          {/* Zero center line */}
          <line
            x1={zeroX}
            y1={padTop}
            x2={zeroX}
            y2={height - padBottom}
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />

          {/* Grid lines */}
          {[-0.2, -0.1, 0, 0.1, 0.2, 0.3].map((val) => (
            <React.Fragment key={val}>
              <line
                x1={toSvgX(val)}
                y1={padTop}
                x2={toSvgX(val)}
                y2={height - padBottom}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={toSvgX(val)}
                y={height - padBottom + 16}
                textAnchor="middle"
                className="text-[10px] font-mono fill-slate-400"
              >
                {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
              </text>
            </React.Fragment>
          ))}

          {/* Feature rows */}
          {features.map((feat, rowIdx) => {
            const y = padTop + (rowIdx + 0.6) * 36;

            return (
              <g key={feat.name}>
                {/* Horizontal guide */}
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + plotWidth}
                  y2={y}
                  stroke="#f8fafc"
                  strokeWidth="1"
                />

                {/* Feature Label */}
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs font-semibold fill-slate-800"
                >
                  {feat.name}
                </text>

                {/* Beeswarm dots */}
                {feat.points.map((p, dotIdx) => {
                  // Add subtle organic jitter in y
                  const jitter = ((dotIdx % 3) - 1) * 3.5;
                  const cx = toSvgX(p.shap);
                  const cy = y + jitter;

                  const color =
                    p.val === 'high' ? '#e11d48' : p.val === 'mid' ? '#9333ea' : '#2563eb';

                  return (
                    <circle
                      key={dotIdx}
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      fill={color}
                      fillOpacity="0.75"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Bottom axis label */}
          <text
            x={padLeft + plotWidth / 2}
            y={height - 2}
            textAnchor="middle"
            className="text-xs font-semibold fill-slate-600"
          >
            SHAP Value (Impact on Model Log-Odds / Predicted Diabetes Risk)
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span>← Protective Buffer (-Δ Risk)</span>
        <span>Risk Accelerator (+Δ Risk) →</span>
      </div>
    </div>
  );
};
