import React from 'react';
import { SHAPContribution } from '../types/diabetes';
import { ArrowUpRight, ArrowDownRight, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SHAPWaterfallProps {
  baseRisk: number;
  finalRisk: number;
  contributions: SHAPContribution[];
}

export const SHAPWaterfall: React.FC<SHAPWaterfallProps> = ({ baseRisk, finalRisk, contributions }) => {
  const maxAbsImpact = Math.max(...contributions.map(c => Math.abs(c.impactValue)), 0.25);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span>SHAP Feature Attribution Waterfall</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              [E[f(x)] = {(baseRisk * 100).toFixed(1)}% → f(x) = {(finalRisk * 100).toFixed(1)}%]
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Marginal risk contributions (Shapley values) compared against standard demographic baseline
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            Risk Elevators (+Δ)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            Protective Buffers (-Δ)
          </span>
        </div>
      </div>

      {/* Waterfall Bars */}
      <div className="space-y-3.5">
        {/* Baseline item */}
        <div className="flex items-center text-xs pb-2 border-b border-dashed border-slate-200">
          <div className="w-44 font-semibold text-slate-700 truncate">
            Baseline Prior Population Risk
          </div>
          <div className="w-24 font-mono text-slate-500 text-right pr-4">
            {(baseRisk * 100).toFixed(1)}%
          </div>
          <div className="flex-1 bg-slate-100 h-2.5 rounded-full relative overflow-hidden">
            <div
              className="bg-slate-400 h-full rounded-full"
              style={{ width: `${baseRisk * 100}%` }}
            ></div>
          </div>
          <div className="w-16 text-right font-mono text-xs text-slate-600 pl-3">
            Base
          </div>
        </div>

        {/* Feature Attribution Rows */}
        {contributions.map((item, idx) => {
          const isIncrease = item.direction === 'increase';
          const pctImpact = Math.abs(item.impactValue * 100);
          const barWidthPercent = Math.min(100, (Math.abs(item.impactValue) / maxAbsImpact) * 100);

          return (
            <div key={idx} className="group hover:bg-slate-50/80 p-1.5 -mx-1.5 rounded-lg transition-colors">
              <div className="flex items-center text-xs">
                {/* Feature Label and Patient Value */}
                <div className="w-44 pr-2">
                  <div className="font-semibold text-slate-900 truncate">{item.label}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    Patient: <span className="font-medium text-slate-700">{item.patientValue}</span>
                  </div>
                </div>

                {/* Marginal Impact text */}
                <div className="w-24 text-right pr-4 font-mono text-xs">
                  <span className={`inline-flex items-center gap-0.5 font-bold ${isIncrease ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isIncrease ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {isIncrease ? '+' : '-'}{pctImpact.toFixed(1)}%
                  </span>
                </div>

                {/* Dual directional bar visualization */}
                <div className="flex-1 flex items-center h-4 bg-slate-100 rounded-md relative overflow-hidden">
                  {/* Center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 z-10"></div>

                  {isIncrease ? (
                    // Bar extends to the right from center
                    <div className="w-1/2 ml-auto flex justify-start pl-[1px]">
                      <div
                        className="bg-rose-500 h-3 rounded-r-sm transition-all duration-500"
                        style={{ width: `${(barWidthPercent / 2).toFixed(1)}%` }}
                      ></div>
                    </div>
                  ) : (
                    // Bar extends to the left from center
                    <div className="w-1/2 mr-auto flex justify-end pr-[1px]">
                      <div
                        className="bg-emerald-500 h-3 rounded-l-sm transition-all duration-500"
                        style={{ width: `${(barWidthPercent / 2).toFixed(1)}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Category tag */}
                <div className="w-20 text-right pl-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Biological explanation tooltip / detail */}
              <p className="text-[11px] text-slate-600 mt-1 pl-1 border-l-2 border-slate-200 ml-1">
                {item.description}
              </p>
            </div>
          );
        })}

        {/* Final Result Row */}
        <div className="flex items-center text-xs pt-3 border-t border-slate-200 mt-2">
          <div className="w-44 font-bold text-slate-900">
            Net Assessed Diabetes Risk
          </div>
          <div className="w-24 font-mono font-bold text-slate-900 text-right pr-4 text-sm">
            {(finalRisk * 100).toFixed(1)}%
          </div>
          <div className="flex-1 bg-slate-100 h-3.5 rounded-full relative overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                finalRisk >= 0.55 ? 'bg-rose-600' : finalRisk >= 0.28 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, finalRisk * 100)}%` }}
            ></div>
          </div>
          <div className="w-20 text-right pl-3 font-bold font-mono text-xs">
            {finalRisk >= 0.55 ? 'HIGH' : finalRisk >= 0.28 ? 'MODERATE' : 'LOW'}
          </div>
        </div>
      </div>
    </div>
  );
};
