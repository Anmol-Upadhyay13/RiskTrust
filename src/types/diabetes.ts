export type RiskLevel = 'Low' | 'Moderate' | 'High';

export type AlgorithmType = 'xgboost' | 'random_forest' | 'logistic_regression' | 'svm' | 'knn';

export interface PatientInput {
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  bmi: number;
  bloodGlucose: number; // mg/dL
  glucoseUnit: 'mg/dL' | 'mmol/L';
  hba1c?: number; // % (e.g. 5.7)
  fastingInsulin?: number; // micro-IU/mL (for HOMA-IR)
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  familyHistory: boolean;
  hypertensionHistory: boolean;
  highCholesterol: boolean;
  smokingStatus: 'never' | 'former' | 'current';
  physicalActivityMinutes: number; // minutes per week
  dietQuality: 'poor' | 'average' | 'healthy';
  sleepHours: number;
  symptoms: {
    polyuria: boolean; // frequent urination
    polydipsia: boolean; // excessive thirst
    fatigue: boolean;
    blurredVision: boolean;
    unexplainedWeightLoss: boolean;
    slowHealing: boolean;
  };
}

export interface SHAPContribution {
  feature: string;
  label: string;
  patientValue: string | number;
  baselineValue: string | number;
  impactValue: number; // positive = increases risk, negative = decreases risk
  direction: 'increase' | 'decrease';
  category: 'clinical' | 'lifestyle' | 'demographic' | 'symptom';
  description: string;
}

export interface ModelPrediction {
  algorithm: AlgorithmType;
  modelName: string;
  riskScore: number; // 0 - 1
  riskLevel: RiskLevel;
  confidence: number;
  decisionBoundaryThreshold: number;
}

export interface ClinicalScores {
  findrisc: {
    score: number; // 0-26
    tier: string;
    description: string;
    tenYearRiskPct: number;
  };
  ada: {
    score: number; // 0-10
    highRiskThreshold: number;
    isHighRisk: boolean;
    description: string;
  };
  homaIr?: {
    value: number;
    classification: 'Optimal' | 'Early Insulin Resistance' | 'Significant Insulin Resistance';
    description: string;
  };
  ascvd10YearRiskPct: number;
  estimatedA1c: number; // calculated from glucose via Nathan formula
}

export interface FullAssessmentResult {
  id: string;
  timestamp: string;
  patientData: PatientInput;
  selectedModel: AlgorithmType;
  primaryPrediction: ModelPrediction;
  allModelPredictions: Record<AlgorithmType, ModelPrediction>;
  baseRisk: number; // Population baseline prior (e.g. 0.185)
  finalRiskScore: number;
  shapContributions: SHAPContribution[];
  domainScores: {
    glycemic: number; // 0-100
    adiposity: number;
    cardiovascular: number;
    lifestyle: number;
    hereditaryAge: number;
    symptomatic: number;
  };
  clinicalScores: ClinicalScores;
  reliabilityAudit?: import('./risktrust').RiskTrustAuditReport;
  keyTakeaways: string[];
}

export interface BenchmarkModelMetrics {
  algorithm: AlgorithmType;
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number; // Precision-Recall AUC (critical for imbalanced disease screening)
  interpretabilityScore: number; // 1-10
  inferenceLatencyMs: number;
  confusionMatrix: {
    truePositive: number;
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
  };
  strengths: string;
  tradeoffs: string;
}

export interface PartialDependenceCurve {
  featureName: string;
  unit: string;
  points: { value: number; predictedRisk: number }[];
  patientCurrentValue: number;
}

export interface MealItem {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  title: string;
  description: string;
  glycemicIndex: 'Low' | 'Medium';
  carbsGrams: number;
  fiberGrams: number;
  keyNutrient: string;
}

export interface DailyMealPlan {
  dayNumber: number;
  dayName: string;
  calorieTarget: number;
  meals: MealItem[];
  dailyTip: string;
}

export interface PreventionPlanData {
  executiveSummary: string;
  targetedInterventions: {
    category: string;
    recommendation: string;
    clinicalRationale: string;
  }[];
  whatIfImpact: string;
  doctorDiscussionGuide: string[];
  recommendedFollowUpInterval: string;
  mealPlan?: DailyMealPlan[];
}

export interface BatchPatientRecord {
  id: string;
  age: number;
  bmi: number;
  glucose: number;
  activityMin: number;
  smoking: string;
  familyHistory: boolean;
  actualStatus: 'diabetic' | 'non-diabetic';
  predictedRisk: number;
  predictedLevel: RiskLevel;
}
