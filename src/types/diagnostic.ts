export type TrendArrow = 'rapid_rise' | 'rise' | 'stable' | 'fall' | 'rapid_fall';

export interface CGMTelemetryPoint {
  timestamp: string; // ISO string
  timeLabel: string; // HH:mm
  glucose: number; // mg/dL
  trendArrow: TrendArrow;
  event?: 'meal' | 'exercise' | 'correction' | 'fasting';
  carbsGrams?: number;
}

export interface AGPReportMetrics {
  timeInRangePct: number; // 70-180 mg/dL (target > 70%)
  timeVeryLowPct: number; // < 54 mg/dL (target < 1%)
  timeLowPct: number; // 54-69 mg/dL (target < 4%)
  timeHighPct: number; // 181-250 mg/dL (target < 25%)
  timeVeryHighPct: number; // > 250 mg/dL (target < 5%)
  meanGlucoseMgDl: number;
  glucoseManagementIndicatorGmi: number; // estimated A1c % from CGM
  glucoseVariabilityCv: number; // % (target <= 36%)
  standardDeviation: number;
}

export interface LaboratoryAssayInput {
  fastingPlasmaGlucoseMgDl: number;
  twoHourOgttMgDl: number;
  hba1cPercent: number;
  randomPlasmaGlucoseMgDl?: number;
  hasHyperglycemicSymptoms: boolean; // polyuria, polydipsia, unexplained weight loss
  isConfirmatoryRetest: boolean;
}

export type DiagnosticTier =
  | 'Normal Euglycemic Baseline'
  | 'Impaired Fasting Glucose (IFG)'
  | 'Impaired Glucose Tolerance (IGT)'
  | 'Prediabetes (Combined IFG + IGT)'
  | 'Provisional Type-2 Diabetes Mellitus'
  | 'Confirmed Type-2 Diabetes Mellitus (Concordant Criteria)'
  | 'Discordant Results (Requires Test Repetition)'
  | 'Acute Hyperglycemic Crisis Alert'
  | 'Hypoglycemic Alert';

export interface ADADiagnosticEvaluation {
  diagnosticTier: DiagnosticTier;
  icd10Code: string; // e.g. E11.9, R73.03, R73.01
  summaryVerdict: string;
  concordanceStatus: 'Concordant Positive' | 'Concordant Negative' | 'Discordant (Conflicting Tests)' | 'Single Positive (Requires Confirmatory Re-Test)';
  criteriaBreakdown: {
    criterionName: string;
    patientValue: string;
    threshold: string;
    status: 'Normal' | 'Prediabetes Range' | 'Diabetic Diagnostic Range';
    loincCode: string;
  }[];
  repeatProtocolInstructions: string;
  clinicalActionPlan: string[];
  fhirR4DiagnosticReport: Record<string, any>;
}
