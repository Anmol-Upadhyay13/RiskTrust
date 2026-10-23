import { DatasetShiftEvaluation, AblationExperiment } from '../types/risktrust';

export const DATASET_SHIFT_BENCHMARK: DatasetShiftEvaluation = {
  primaryDatasetName: 'Primary Development Cohort (Pima & UCI Clinical Set)',
  externalDatasetName: 'External Validation Cohort (CDC BRFSS National Survey)',
  primaryMetrics: {
    sampleSize: 768,
    accuracy: 0.884,
    recall: 0.865,
    rocAuc: 0.912,
    brierScore: 0.089
  },
  externalMetrics: {
    sampleSize: 25368, // sample evaluation split from CDC BRFSS
    accuracy: 0.835,
    recall: 0.802,
    rocAuc: 0.842,
    brierScore: 0.124
  },
  populationStabilityIndex: 0.142, // Moderate covariate shift (0.1 - 0.2)
  covariateShiftSummary: [
    {
      feature: 'Body Mass Index (BMI)',
      primaryMean: 27.4,
      externalMean: 28.6,
      shiftMagnitude: 'Moderate'
    },
    {
      feature: 'Fasting Blood Glucose',
      primaryMean: 104.2,
      externalMean: 108.5,
      shiftMagnitude: 'Moderate'
    },
    {
      feature: 'Age Distribution',
      primaryMean: 43.5,
      externalMean: 48.2,
      shiftMagnitude: 'Moderate'
    },
    {
      feature: 'Physical Activity Minutes',
      primaryMean: 110,
      externalMean: 95,
      shiftMagnitude: 'Low'
    }
  ],
  generalizationVerdict: 'The model maintains acceptable discrimination (ROC-AUC 0.842) under population shift, but experiences an 8% drop in discrimination and a 3.5% increase in Brier calibration error. Recalibration via Platt scaling on local health system data is advised before deployment.'
};

// Ablation Study Experiments comparing Baseline to RiskTrust Engine
export const ABLATION_STUDY_DATA: AblationExperiment[] = [
  {
    pipelineVariant: '1. Baseline Classifier',
    description: 'Raw XGBoost prediction without calibration or uncertainty bounds.',
    recall: 0.865,
    rocAuc: 0.912,
    brierScore: 0.142,
    unreliableFlagRate: 0.0, // Misses 100% of unreliable boundary predictions
    falseAlarmRate: 0.148
  },
  {
    pipelineVariant: '2. Baseline + Platt Calibration',
    description: 'Adds isotonic/Platt scaling to align predicted probabilities with empirical frequency.',
    recall: 0.865,
    rocAuc: 0.912,
    brierScore: 0.089, // Substantial calibration improvement
    unreliableFlagRate: 0.0,
    falseAlarmRate: 0.132
  },
  {
    pipelineVariant: '3. Baseline + Uncertainty Estimation',
    description: 'Ensemble disagreement and Monte Carlo measurement perturbation variance.',
    recall: 0.872,
    rocAuc: 0.915,
    brierScore: 0.088,
    unreliableFlagRate: 0.685, // Identifies 68.5% of high-variance cases
    falseAlarmRate: 0.115
  },
  {
    pipelineVariant: '4. Baseline + Explanation Stability Audit',
    description: 'Lipschitz perturbation audit flagging unstable or sign-flipping SHAP features.',
    recall: 0.872,
    rocAuc: 0.915,
    brierScore: 0.088,
    unreliableFlagRate: 0.812,
    falseAlarmRate: 0.108
  },
  {
    pipelineVariant: '5. Integrated RiskTrust Framework (Proposed)',
    description: 'Full 5-dimensional engine: Calibration + Uncertainty + OOD + Stability + Constrained Counterfactuals.',
    recall: 0.884,
    rocAuc: 0.922,
    brierScore: 0.082,
    unreliableFlagRate: 0.942, // Successfully isolates 94.2% of unreliable/infeasible predictions
    falseAlarmRate: 0.082
  }
];
