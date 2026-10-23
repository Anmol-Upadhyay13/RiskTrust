import {
  CGMTelemetryPoint,
  AGPReportMetrics,
  LaboratoryAssayInput,
  ADADiagnosticEvaluation,
  TrendArrow
} from '../types/diagnostic';

// 1. Generate 24-hour realistic baseline CGM telemetry
export function generateInitial24hCGM(isDiabeticProfile: boolean = false): CGMTelemetryPoint[] {
  const points: CGMTelemetryPoint[] = [];
  const now = new Date();
  const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const baseGlucose = isDiabeticProfile ? 145 : 92;
  const glucoseNoise = isDiabeticProfile ? 25 : 8;

  // 96 points (every 15 minutes over 24 hours)
  for (let i = 0; i < 96; i++) {
    const ptTime = new Date(startTime.getTime() + i * 15 * 60 * 1000);
    const hour = ptTime.getHours();
    const minute = ptTime.getMinutes();
    const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    let val = baseGlucose + (Math.sin(i / 15) * 12);
    let event: 'meal' | 'exercise' | 'correction' | 'fasting' | undefined = undefined;

    // Breakfast (07:30 - 09:00)
    if (hour === 8 && minute < 45) {
      val += isDiabeticProfile ? 75 : 35;
      event = 'meal';
    }
    // Lunch (12:30 - 14:00)
    else if (hour === 13 && minute < 45) {
      val += isDiabeticProfile ? 85 : 42;
      event = 'meal';
    }
    // Afternoon exercise (17:00 - 18:00)
    else if (hour === 17) {
      val -= isDiabeticProfile ? 28 : 18;
      event = 'exercise';
    }
    // Dinner (19:30 - 21:00)
    else if (hour === 20 && minute < 45) {
      val += isDiabeticProfile ? 92 : 46;
      event = 'meal';
    }
    // Dawn Phenomenon (04:30 - 06:30)
    else if (hour >= 5 && hour <= 6) {
      val += isDiabeticProfile ? 32 : 12;
      event = 'fasting';
    }

    val += (Math.random() - 0.5) * glucoseNoise;
    val = Math.max(50, Math.min(350, Math.round(val)));

    let trendArrow: TrendArrow = 'stable';
    if (points.length > 0) {
      const prev = points[points.length - 1].glucose;
      const rate = val - prev;
      if (rate > 8) trendArrow = 'rapid_rise';
      else if (rate > 3) trendArrow = 'rise';
      else if (rate < -8) trendArrow = 'rapid_fall';
      else if (rate < -3) trendArrow = 'fall';
    }

    points.push({
      timestamp: ptTime.toISOString(),
      timeLabel,
      glucose: val,
      trendArrow,
      event
    });
  }

  return points;
}

// 2. Compute Ambulatory Glucose Profile (AGP) International Standard Statistics
export function computeAGPReportMetrics(points: CGMTelemetryPoint[]): AGPReportMetrics {
  if (points.length === 0) {
    return {
      timeInRangePct: 75,
      timeVeryLowPct: 0,
      timeLowPct: 2,
      timeHighPct: 20,
      timeVeryHighPct: 3,
      meanGlucoseMgDl: 115,
      glucoseManagementIndicatorGmi: 6.0,
      glucoseVariabilityCv: 26.5,
      standardDeviation: 30.5
    };
  }

  const values = points.map(p => p.glucose);
  const total = values.length;

  const inRange = values.filter(v => v >= 70 && v <= 180).length;
  const veryLow = values.filter(v => v < 54).length;
  const low = values.filter(v => v >= 54 && v < 70).length;
  const high = values.filter(v => v > 180 && v <= 250).length;
  const veryHigh = values.filter(v => v > 250).length;

  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / total;

  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / total;
  const sd = Math.sqrt(variance);
  const cv = (sd / mean) * 100;

  // GMI (%) = 3.31 + 0.02392 * [mean glucose in mg/dL] (Bergerstal et al.)
  const gmi = 3.31 + 0.02392 * mean;

  return {
    timeInRangePct: Math.round((inRange / total) * 100),
    timeVeryLowPct: Math.round((veryLow / total) * 100),
    timeLowPct: Math.round((low / total) * 100),
    timeHighPct: Math.round((high / total) * 100),
    timeVeryHighPct: Math.round((veryHigh / total) * 100),
    meanGlucoseMgDl: Math.round(mean),
    glucoseManagementIndicatorGmi: Math.round(gmi * 10) / 10,
    glucoseVariabilityCv: Math.round(cv * 10) / 10,
    standardDeviation: Math.round(sd * 10) / 10
  };
}

// 3. Simulate Next Live Telemetry Tick
export function simulateNextTelemetryTick(
  history: CGMTelemetryPoint[],
  action?: 'meal' | 'exercise' | 'correction'
): CGMTelemetryPoint {
  const last = history[history.length - 1];
  const now = new Date(new Date(last.timestamp).getTime() + 15 * 60 * 1000);
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  let delta = (Math.random() - 0.48) * 6; // gentle drift

  if (action === 'meal') {
    delta += 28 + Math.random() * 12; // sharp postprandial spike
  } else if (action === 'exercise') {
    delta -= 22 + Math.random() * 8; // skeletal GLUT4 disposal
  } else if (action === 'correction') {
    delta -= 35 + Math.random() * 10;
  } else {
    // Mean reversion toward baseline (110)
    if (last.glucose > 180) delta -= 7;
    else if (last.glucose < 80) delta += 6;
  }

  const nextGlucose = Math.max(48, Math.min(380, Math.round(last.glucose + delta)));

  let trendArrow: TrendArrow = 'stable';
  const rate = nextGlucose - last.glucose;
  if (rate > 8) trendArrow = 'rapid_rise';
  else if (rate > 3) trendArrow = 'rise';
  else if (rate < -8) trendArrow = 'rapid_fall';
  else if (rate < -3) trendArrow = 'fall';

  return {
    timestamp: now.toISOString(),
    timeLabel,
    glucose: nextGlucose,
    trendArrow,
    event: action
  };
}

// 4. Production-Level ADA Diagnostic Evaluation & FHIR R4 Report Generation
export function evaluateADADiagnosticCriteria(assay: LaboratoryAssayInput): ADADiagnosticEvaluation {
  const {
    fastingPlasmaGlucoseMgDl: fpg,
    twoHourOgttMgDl: ogtt,
    hba1cPercent: a1c,
    randomPlasmaGlucoseMgDl: rpg,
    hasHyperglycemicSymptoms,
    isConfirmatoryRetest
  } = assay;

  const criteriaBreakdown = [
    {
      criterionName: 'Fasting Plasma Glucose (FPG, ≥8 hr fast)',
      patientValue: `${fpg} mg/dL (${(fpg / 18.0182).toFixed(1)} mmol/L)`,
      threshold: '<100 Normal | 100–125 IFG | ≥126 Diabetic',
      status: (fpg >= 126 ? 'Diabetic Diagnostic Range' : fpg >= 100 ? 'Prediabetes Range' : 'Normal') as any,
      loincCode: '1558-6'
    },
    {
      criterionName: '2-Hour 75g Oral Glucose Tolerance Test (OGTT)',
      patientValue: `${ogtt} mg/dL (${(ogtt / 18.0182).toFixed(1)} mmol/L)`,
      threshold: '<140 Normal | 140–199 IGT | ≥200 Diabetic',
      status: (ogtt >= 200 ? 'Diabetic Diagnostic Range' : ogtt >= 140 ? 'Prediabetes Range' : 'Normal') as any,
      loincCode: '20436-2'
    },
    {
      criterionName: 'Glycated Hemoglobin (HbA1c - NGSP Certified)',
      patientValue: `${a1c}% (${Math.round((a1c - 2.15) * 10.929)} mmol/mol)`,
      threshold: '<5.7% Normal | 5.7–6.4% Prediabetes | ≥6.5% Diabetic',
      status: (a1c >= 6.5 ? 'Diabetic Diagnostic Range' : a1c >= 5.7 ? 'Prediabetes Range' : 'Normal') as any,
      loincCode: '4548-4'
    }
  ];

  if (rpg !== undefined && rpg > 0) {
    criteriaBreakdown.push({
      criterionName: 'Random Plasma Glucose (with Symptoms)',
      patientValue: `${rpg} mg/dL`,
      threshold: '≥200 mg/dL with Classic Symptoms',
      status: (rpg >= 200 && hasHyperglycemicSymptoms ? 'Diabetic Diagnostic Range' : 'Normal') as any,
      loincCode: '2345-7'
    });
  }

  // Count criteria in diabetic threshold
  const diabeticCriteriaCount = criteriaBreakdown.filter(c => c.status === 'Diabetic Diagnostic Range').length;
  const prediabetesCriteriaCount = criteriaBreakdown.filter(c => c.status === 'Prediabetes Range').length;

  let diagnosticTier: any = 'Normal Euglycemic Baseline';
  let icd10Code = 'Z13.1'; // Screening for diabetes
  let concordanceStatus: any = 'Concordant Negative';
  let summaryVerdict = 'Laboratory assays demonstrate normal glucose homeostasis.';
  let repeatProtocolInstructions = 'Routine annual wellness screening recommended.';
  const clinicalActionPlan: string[] = [];

  // Severe Hypoglycemia alert
  if (fpg < 54 || ogtt < 54) {
    diagnosticTier = 'Hypoglycemic Alert';
    icd10Code = 'E16.2';
    summaryVerdict = 'Critical Hypoglycemia detected (<54 mg/dL). Immediate clinical rule-out of insulinoma, endocrine insufficiency, or medication-induced hypoglycemia required.';
    clinicalActionPlan.push('Administer fast-acting oral carbohydrates (15-20g glucose rule) or medical evaluation.');
  }
  // Acute Hyperglycemic Crisis
  else if ((rpg && rpg >= 200 && hasHyperglycemicSymptoms) || fpg >= 300) {
    diagnosticTier = 'Acute Hyperglycemic Crisis Alert';
    icd10Code = 'E11.65';
    summaryVerdict = 'Severe hyperglycemia with cardinal symptoms present. Urgent clinical assessment required to rule out Diabetic Ketoacidosis (DKA) or Hyperosmolar Hyperglycemic State (HHS).';
    clinicalActionPlan.push('Check capillary ketones, electrolytes, and arterial blood gas.');
    clinicalActionPlan.push('Immediate referral to emergency or acute medical triage.');
  }
  // Confirmed Diabetes (2 or more concordant tests or repeat confirmed)
  else if (diabeticCriteriaCount >= 2 || (diabeticCriteriaCount === 1 && isConfirmatoryRetest)) {
    diagnosticTier = 'Confirmed Type-2 Diabetes Mellitus (Concordant Criteria)';
    icd10Code = 'E11.9';
    concordanceStatus = 'Concordant Positive';
    summaryVerdict = 'Formal diagnostic criteria for Type-2 Diabetes Mellitus are fully met per ADA 2026 guidelines (confirmed via 2 concordant laboratory modalities or repeat testing).';
    repeatProtocolInstructions = 'Diagnostic verification complete. Begin formal clinical diabetes management plan.';
    clinicalActionPlan.push('Initiate patient education, comprehensive diabetes self-management education and support (DSMES).');
    clinicalActionPlan.push('Assess for baseline microvascular and macrovascular complications (UACR urine microalbumin, dilated retinal exam, comprehensive foot exam).');
    clinicalActionPlan.push('Consider first-line pharmacological therapy (e.g., Metformin, SGLT2i, or GLP-1 RA based on cardiovascular/renal comorbidities).');
  }
  // Single positive test without repeat confirmation
  else if (diabeticCriteriaCount === 1 && !isConfirmatoryRetest) {
    diagnosticTier = 'Discordant Results (Requires Test Repetition)';
    icd10Code = 'R73.09';
    concordanceStatus = 'Discordant (Conflicting Tests)';
    summaryVerdict = 'One laboratory assay exceeds the diagnostic threshold while others remain discordant. Per ADA Standards, a diagnosis requires a confirmatory repeat test on a separate day.';
    repeatProtocolInstructions = 'Repeat the test that was above the diagnostic threshold using a new venous blood sample on a separate day without delay.';
    clinicalActionPlan.push('Schedule confirmatory repeat venous blood draw within 1-2 weeks.');
    clinicalActionPlan.push('Advise patient on temporary dietary moderation while awaiting confirmatory verification.');
  }
  // Prediabetes
  else if (prediabetesCriteriaCount > 0) {
    if (fpg >= 100 && ogtt >= 140) {
      diagnosticTier = 'Prediabetes (Combined IFG + IGT)';
      icd10Code = 'R73.03';
    } else if (fpg >= 100) {
      diagnosticTier = 'Impaired Fasting Glucose (IFG)';
      icd10Code = 'R73.01';
    } else {
      diagnosticTier = 'Impaired Glucose Tolerance (IGT)';
      icd10Code = 'R73.02';
    }
    concordanceStatus = 'Concordant Positive';
    summaryVerdict = 'Biomarkers indicate Prediabetes. Pancreatic beta-cell function is impaired but diabetes has not yet manifested. Immediate lifestyle intervention has proven 58% reversal efficacy.';
    repeatProtocolInstructions = 'Re-evaluate with venous HbA1c and FPG in 6 to 12 months.';
    clinicalActionPlan.push('Referral to CDC-recognized National Diabetes Prevention Program (DPP).');
    clinicalActionPlan.push('Target 5-7% intentional weight reduction and 150 min/wk moderate aerobic exercise.');
    clinicalActionPlan.push('Monitor blood pressure and lipid panel for co-morbid metabolic syndrome.');
  } else {
    diagnosticTier = 'Normal Euglycemic Baseline';
    icd10Code = 'Z13.1';
    concordanceStatus = 'Concordant Negative';
    summaryVerdict = 'All diagnostic modalities (FPG, OGTT, HbA1c) are within optimal physiological thresholds.';
    repeatProtocolInstructions = 'Repeat standard screening every 3 years per ADA asymptomatic screening guidelines.';
    clinicalActionPlan.push('Maintain balanced nutritional intake and regular physical activity.');
  }

  // Generate production-level HL7 / FHIR R4 DiagnosticReport resource
  const fhirR4DiagnosticReport = {
    resourceType: 'DiagnosticReport',
    id: `dia-report-${Date.now()}`,
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'LAB',
            display: 'Laboratory'
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '24357-6',
          display: 'Diabetes mellitus and impaired glucose assessment panel'
        }
      ],
      text: 'ADA 2026 Diabetes Diagnostic Evaluation Panel'
    },
    effectiveDateTime: new Date().toISOString(),
    issued: new Date().toISOString(),
    conclusion: summaryVerdict,
    conclusionCode: [
      {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/icd-10-cm',
            code: icd10Code,
            display: diagnosticTier
          }
        ]
      }
    ],
    result: criteriaBreakdown.map(c => ({
      code: c.loincCode,
      name: c.criterionName,
      value: c.patientValue,
      interpretation: c.status
    }))
  };

  return {
    diagnosticTier,
    icd10Code,
    summaryVerdict,
    concordanceStatus,
    criteriaBreakdown,
    repeatProtocolInstructions,
    clinicalActionPlan,
    fhirR4DiagnosticReport
  };
}
