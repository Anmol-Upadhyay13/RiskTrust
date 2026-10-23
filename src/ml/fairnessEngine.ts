import { SubgroupFairnessMetrics } from '../types/risktrust';

export const SUBGROUP_FAIRNESS_DATA: SubgroupFairnessMetrics[] = [
  {
    groupName: 'Biological Sex Stratification',
    subgroups: [
      {
        label: 'Female Cohort',
        sampleSize: 420,
        recall: 0.871,
        precision: 0.842,
        falseNegativeRate: 0.129,
        falsePositiveRate: 0.118,
        rocAuc: 0.916
      },
      {
        label: 'Male Cohort',
        sampleSize: 348,
        recall: 0.858,
        precision: 0.865,
        falseNegativeRate: 0.142,
        falsePositiveRate: 0.106,
        rocAuc: 0.908
      }
    ],
    disparateImpactRatio: 0.985, // Near parity (0.80 - 1.25 standard)
    equalOpportunityDifference: 0.013, // 1.3% absolute recall gap
    isFair: true,
    auditNotes: 'High parity observed across biological sex. Equal opportunity difference (1.3%) is well within the 5% fairness tolerance.'
  },
  {
    groupName: 'Age Bracket Stratification',
    subgroups: [
      {
        label: 'Younger Adult (< 45 yrs)',
        sampleSize: 412,
        recall: 0.832,
        precision: 0.821,
        falseNegativeRate: 0.168,
        falsePositiveRate: 0.089,
        rocAuc: 0.892
      },
      {
        label: 'Mature Adult (≥ 45 yrs)',
        sampleSize: 356,
        recall: 0.889,
        precision: 0.872,
        falseNegativeRate: 0.111,
        falsePositiveRate: 0.138,
        rocAuc: 0.924
      }
    ],
    disparateImpactRatio: 0.935,
    equalOpportunityDifference: 0.057, // 5.7% recall gap
    isFair: true,
    auditNotes: 'Model exhibits slightly higher sensitivity in age ≥ 45 due to higher prior prevalence in older demographic cohorts. Younger adults have a lower false-positive rate.'
  }
];
