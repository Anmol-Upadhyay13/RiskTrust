import { AlgorithmType, PatientInput, RiskLevel, ModelPrediction, SHAPContribution } from './diabetes';

// 1. Calibration Metrics
export interface CalibrationMetrics {
  brierScore: number; // Mean squared difference between predicted prob and outcome (0 = perfect)
  expectedCalibrationError: number; // ECE (e.g. 0.038)
  maximumCalibrationError: number; // MCE
  calibrationCurveBins: {
    binMidpoint: number;
    meanPredictedProb: number;
    observedEmpiricalFrequency: number;
    sampleCount: number;
  }[];
}

// 2. Uncertainty Estimation
export interface UncertaintyEstimate {
  meanPrediction: number; // e.g. 0.74
  uncertaintyInterval: [number, number]; // e.g. [0.68, 0.80] (95% credible interval)
  ensembleVariance: number; // Variance across 5 model predictions
  monteCarloPerturbationSpread: number; // Spread under test-time noise
  isHighUncertainty: boolean;
  uncertaintyTier: 'Low Variance' | 'Moderate Variance' | 'High Uncertainty';
}

// 3. Input & Out-of-Distribution (OOD) Reliability
export interface InputReliability {
  isOutlier: boolean;
  mahalanobisDistanceScore: number; // Standardized distance from training centroid
  unsupportedCombinations: string[];
  missingFields: string[];
  plausibilityWarnings: string[];
  dataQualityTier: 'Reliable / In-Distribution' | 'Borderline Extrapolation' | 'Out-of-Distribution (OOD)';
}

// 4. Explanation Stability (Lipschitz Audit)
export interface ExplanationStabilityAudit {
  stabilityScore: number; // 0 to 1 (1 = perfectly stable)
  topFeaturesRankPreserved: boolean;
  perturbationMaxRankShift: number; // maximum rank change of top 3 features under 3% perturbation
  featureSignFlipCount: number; // 0 = no sign reversal
  isUnstableWarning: boolean;
  stabilityDetails: {
    feature: string;
    originalShap: number;
    perturbedShap: number;
    delta: number;
  }[];
}

// 5. Constrained Counterfactuals
export interface ConstrainedCounterfactual {
  isFeasible: boolean;
  targetRiskThreshold: number; // e.g. 0.35
  achievedRisk: number;
  l1Distance: number; // normalized action effort
  sparsity: number; // number of features altered
  immutableViolations: string[]; // must be empty
  prescribedModifications: {
    feature: string;
    originalValue: string | number;
    targetValue: string | number;
    effortLevel: 'Low' | 'Moderate' | 'High';
    clinicalRationale: string;
  }[];
  modelRevalidationPassed: boolean;
}

// Comprehensive RiskTrust Reliability Engine Output
export interface RiskTrustAuditReport {
  overallReliabilityStatus: 'High Reliability' | 'Moderate Reliability' | 'Caution: High Uncertainty / OOD';
  calibration: CalibrationMetrics;
  uncertainty: UncertaintyEstimate;
  inputReliability: InputReliability;
  explanationStability: ExplanationStabilityAudit;
  counterfactual: ConstrainedCounterfactual;
  modelDisagreementRate: number; // max prediction difference across models
  summaryRecommendation: string;
}

// Subgroup Fairness Audit
export interface SubgroupFairnessMetrics {
  groupName: string;
  subgroups: {
    label: string;
    sampleSize: number;
    recall: number;
    precision: number;
    falseNegativeRate: number;
    falsePositiveRate: number;
    rocAuc: number;
  }[];
  disparateImpactRatio: number; // e.g. 0.94 (ideal 0.80 - 1.25)
  equalOpportunityDifference: number; // absolute recall difference
  isFair: boolean;
  auditNotes: string;
}

// Dataset Shift & External Validation
export interface DatasetShiftEvaluation {
  primaryDatasetName: string;
  externalDatasetName: string;
  primaryMetrics: {
    sampleSize: number;
    accuracy: number;
    recall: number;
    rocAuc: number;
    brierScore: number;
  };
  externalMetrics: {
    sampleSize: number;
    accuracy: number;
    recall: number;
    rocAuc: number;
    brierScore: number;
  };
  populationStabilityIndex: number; // PSI (<0.1 slight, 0.1-0.2 moderate, >0.2 significant shift)
  covariateShiftSummary: {
    feature: string;
    primaryMean: number;
    externalMean: number;
    shiftMagnitude: 'Low' | 'Moderate' | 'High';
  }[];
  generalizationVerdict: string;
}

// Ablation Study Experiments
export interface AblationExperiment {
  pipelineVariant: string;
  description: string;
  recall: number;
  rocAuc: number;
  brierScore: number;
  unreliableFlagRate: number; // % of unreliable/borderline cases successfully caught
  falseAlarmRate: number;
}
