import React, { useState } from 'react';
import { PatientInput } from '../types/diabetes';
import { generateWeeklyMealPlan } from '../ml/mlEngine';
import { Apple, Clock, Flame, ShieldAlert, Sparkles, Footprints, Utensils } from 'lucide-react';

interface MealPlanRoadmapProps {
  patient: PatientInput;
}

export const MealPlanRoadmap: React.FC<MealPlanRoadmapProps> = ({ patient }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const weeklyPlan = generateWeeklyMealPlan(patient);

  const activeDayPlan = weeklyPlan.find(d => d.dayNumber === selectedDay) || weeklyPlan[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Cardiometabolic Nutrition
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Personalized 7-Day Low-Glycemic Mediterranean Roadmap
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrated for BMI {patient.bmi} kg/m² with target {activeDayPlan.calorieTarget} kcal/day & high soluble fiber
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>ADA Nutritional Standard</span>
        </div>
      </div>

      {/* Day Selector Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {weeklyPlan.map((d) => (
          <button
            key={d.dayNumber}
            onClick={() => setSelectedDay(d.dayNumber)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedDay === d.dayNumber
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Day {d.dayNumber}
          </button>
        ))}
      </div>

      {/* Active Day Clinical Tip & Theme */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-slate-900 block text-sm">{activeDayPlan.dayName}</span>
          <p className="text-slate-600 mt-0.5">{activeDayPlan.dailyTip}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-slate-700 font-mono font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            {activeDayPlan.calorieTarget} kcal
          </span>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {activeDayPlan.meals.map((meal, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {meal.mealType}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  GI: <strong className="text-emerald-700">{meal.glycemicIndex}</strong>
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{meal.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{meal.description}</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Carbs: <strong className="text-slate-700">{meal.carbsGrams}g</strong></span>
              <span>Fiber: <strong className="text-emerald-700 font-bold">{meal.fiberGrams}g</strong></span>
              <span className="text-[10px] text-slate-400 font-sans truncate max-w-[130px]">{meal.keyNutrient}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Skeletal Muscle GLUT4 Tip Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-xs text-blue-950">
        <Footprints className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Postprandial Contraction Window:</strong> Clinical continuous glucose monitoring demonstrates that taking a 10 to 15-minute gentle walk immediately after lunch or dinner stimulates muscle contraction GLUT4 translocation, blunting the 60-minute post-meal glucose peak by up to 35% without requiring extra insulin.
        </div>
      </div>
    </div>
  );
};
