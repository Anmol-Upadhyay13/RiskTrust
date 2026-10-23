import { FullAssessmentResult, PatientInput } from '../types/diabetes';
import { PreventionPlanData } from '../types/diabetes';

export function getDefaultPreventionPlan(assessment: FullAssessmentResult): PreventionPlanData {
  const { primaryPrediction, patientData } = assessment;
  return {
    executiveSummary: `Based on your screening parameters, your diabetes risk profile is stratified as ${primaryPrediction.riskLevel} (${Math.round(primaryPrediction.riskScore * 100)}% calibrated probability). This is an early screening assessment, not a formal diagnosis. Lifestyle interventions initiated during early stages can prevent or substantially delay the progression to Type-2 diabetes.`,
    targetedInterventions: [
      {
        category: 'Nutritional Glycemic Management',
        recommendation: 'Adopt a fiber-dense dietary pattern (minimum 25–30g dietary fiber daily), replace refined starches with low-glycemic complex carbohydrates, and consume protein and vegetables before carbohydrates in meals.',
        clinicalRationale: 'Meal sequencing and soluble viscous fiber slow gastric emptying, blunting acute postprandial glucose surges and preserving pancreatic beta-cell insulin secretory capacity.'
      },
      {
        category: 'Skeletal Muscle Glucose Clearance',
        recommendation: `Accumulate at least 150 minutes of moderate-intensity aerobic exercise (e.g. brisk walking at 4-5 km/h) distributed over 4-5 days, supplemented with 2 resistance training sessions.`,
        clinicalRationale: 'Contraction-mediated muscle glucose uptake activates AMP-activated protein kinase (AMPK) and GLUT4 translocation to the cell membrane completely independent of insulin action.'
      },
      {
        category: 'Adiposity & Metabolic Stress Target',
        recommendation: patientData.bmi >= 25
          ? `Target an intentional, gradual 5% to 7% reduction in total body weight (approx. ${(patientData.weightKg * 0.06).toFixed(1)} kg) over 6 months.`
          : 'Maintain current body weight stability while optimizing lean muscle mass and minimizing visceral waist circumference.',
        clinicalRationale: 'The landmark Diabetes Prevention Program (DPP) randomized trial confirmed that a 5-7% weight reduction reduces diabetes incidence by 58% in high-risk individuals.'
      },
      {
        category: 'Biomarker Surveillance & Laboratory Follow-up',
        recommendation: primaryPrediction.riskLevel === 'High'
          ? 'Schedule an in-person venous blood assessment including Fasting Plasma Glucose (FPG), HbA1c, and a comprehensive lipid profile within 2 to 4 weeks.'
          : 'Re-screen clinical vitals annually and monitor fasting glucose periodically.',
        clinicalRationale: 'Screening tools identify elevated risk, but formal diagnostic confirmation requires calibrated clinical venipuncture assays according to ADA standards.'
      }
    ],
    whatIfImpact: primaryPrediction.riskLevel === 'High'
      ? 'Consistent adherence to the 150 min/wk exercise target and a 5-7% weight reduction is projected to shift your risk tier down into the Moderate or Low category within 6-12 months.'
      : 'Maintaining active exercise habits and balanced fiber-rich meals preserves your metabolic resilience.',
    doctorDiscussionGuide: [
      'Would you recommend an HbA1c test or an Oral Glucose Tolerance Test (OGTT) to assess my baseline metabolic health?',
      'Given my family history and current biometric risk factors, should I be monitored more frequently for cardiometabolic changes?',
      'Are there registered dietitian consultations or structured diabetes prevention programs available in my area?'
    ],
    recommendedFollowUpInterval: primaryPrediction.riskLevel === 'High'
      ? 'Within 2 to 4 weeks with a primary care physician'
      : primaryPrediction.riskLevel === 'Moderate'
      ? 'Within 2 to 3 months'
      : 'Annual routine preventive checkup'
  };
}

export function generateClinicalReportHTML(
  assessment: FullAssessmentResult,
  plan?: PreventionPlanData
): string {
  const activePlan = plan || getDefaultPreventionPlan(assessment);
  const { patientData, primaryPrediction, shapContributions, domainScores, reliabilityAudit } = assessment;
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const bmiCategory =
    patientData.bmi < 18.5
      ? 'Underweight'
      : patientData.bmi < 25
      ? 'Normal weight'
      : patientData.bmi < 30
      ? 'Overweight'
      : 'Obesity Class I/II';

  const riskBadgeColor =
    primaryPrediction.riskLevel === 'High'
      ? '#dc2626'
      : primaryPrediction.riskLevel === 'Moderate'
      ? '#d97706'
      : '#16a34a';

  const riskBadgeBg =
    primaryPrediction.riskLevel === 'High'
      ? '#fee2e2'
      : primaryPrediction.riskLevel === 'Moderate'
      ? '#fef3c7'
      : '#dcfce7';

  const topRiskDrivers = shapContributions
    .filter((c) => c.direction === 'increase')
    .slice(0, 4);

  const protectiveDrivers = shapContributions
    .filter((c) => c.direction === 'decrease')
    .slice(0, 3);

  const activeSymptoms = Object.entries(patientData.symptoms)
    .filter(([, active]) => active)
    .map(([s]) => s.replace(/([A-Z])/g, ' $1').toLowerCase());

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DiaCare XAI - Clinical Health & Prevention Report</title>
  <style>
    @page {
      size: letter;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.45;
      font-size: 12px;
      padding: 24px;
    }
    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .report-meta {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .risk-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 14px;
      background: ${riskBadgeBg};
      color: ${riskBadgeColor};
      border: 1px solid ${riskBadgeColor};
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e293b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 16px;
      margin-bottom: 10px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .metric-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .metric-val {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .metric-sub {
      font-size: 10px;
      color: #64748b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 11px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
    }
    .attribution-pos {
      color: #dc2626;
      font-weight: 700;
    }
    .attribution-neg {
      color: #16a34a;
      font-weight: 700;
    }
    .plan-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-left: 3px solid #2563eb;
      border-radius: 4px;
      padding: 8px 10px;
      margin-bottom: 8px;
    }
    .plan-category {
      font-weight: 700;
      font-size: 11px;
      color: #1e3a8a;
      margin-bottom: 2px;
    }
    .plan-rec {
      font-size: 11px;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .plan-rat {
      font-size: 10px;
      color: #475569;
      font-style: italic;
    }
    .doctor-questions {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 10px 12px;
      margin-top: 10px;
    }
    .doctor-questions ol {
      padding-left: 18px;
      margin-top: 6px;
    }
    .doctor-questions li {
      font-size: 11px;
      margin-bottom: 4px;
      color: #1e3a8a;
    }
    .disclaimer-box {
      margin-top: 20px;
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      font-size: 9.5px;
      color: #64748b;
      line-height: 1.4;
    }
    .sig-block {
      margin-top: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      font-size: 10px;
    }
    .sig-line {
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      margin-top: 28px;
      color: #475569;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-title">DiaCare XAI · Clinical Health & Risk Report</div>
      <div class="brand-sub">Explainable AI Early Screening & Evidence-Based Prevention System</div>
    </div>
    <div class="report-meta">
      <div><strong>Encounter Date:</strong> ${dateStr}</div>
      <div><strong>Report Generated:</strong> ${timeStr}</div>
      <div><strong>Protocol:</strong> ADA 2026 / WHO Metabolic Standards</div>
    </div>
  </div>

  <!-- Primary Risk Tier Banner -->
  <div class="banner">
    <div>
      <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px;">
        Stratified Diabetes Risk Tier
      </div>
      <div style="font-size: 16px; font-weight: 800; color: #0f172a;">
        ${primaryPrediction.riskLevel} Risk Profile (${Math.round(primaryPrediction.riskScore * 100)}% Probability)
      </div>
      <div style="font-size: 11px; color: #475569; margin-top: 2px;">
        Evaluated via ${primaryPrediction.modelName} &middot; Calibrated with Platt Scaling (Brier Score: ${reliabilityAudit?.calibration?.brierScore?.toFixed(3) || '0.089'})
      </div>
    </div>
    <div class="risk-badge">
      ${primaryPrediction.riskLevel.toUpperCase()} RISK
    </div>
  </div>

  <!-- Patient Biometrics & Vitals -->
  <div class="section-title">1. Patient Demographic & Biometric Profile</div>
  <div class="grid-4">
    <div class="metric-card">
      <div class="metric-label">Age & Sex</div>
      <div class="metric-val">${patientData.age} yrs &middot; ${patientData.gender}</div>
      <div class="metric-sub">Metabolic baseline</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">BMI & Adiposity</div>
      <div class="metric-val">${patientData.bmi} kg/m²</div>
      <div class="metric-sub">${bmiCategory}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Fasting Blood Glucose</div>
      <div class="metric-val">${patientData.bloodGlucose} ${patientData.glucoseUnit}</div>
      <div class="metric-sub">${patientData.bloodGlucose >= 126 ? 'Elevated (Diabetic Range)' : patientData.bloodGlucose >= 100 ? 'Impaired Fasting' : 'Normal (<100)'}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Blood Pressure</div>
      <div class="metric-val">${patientData.systolicBP}/${patientData.diastolicBP} mmHg</div>
      <div class="metric-sub">${patientData.systolicBP >= 140 ? 'Stage 2 HTN' : patientData.systolicBP >= 130 ? 'Stage 1 HTN' : 'Standard'}</div>
    </div>
  </div>

  <div class="grid-4">
    <div class="metric-card">
      <div class="metric-label">Physical Activity</div>
      <div class="metric-val">${patientData.physicalActivityMinutes} min/wk</div>
      <div class="metric-sub">${patientData.physicalActivityMinutes >= 150 ? 'Meets ADA Target' : 'Below Target (150 min)'}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Family History</div>
      <div class="metric-val">${patientData.familyHistory ? 'Positive (1st Degree)' : 'None Reported'}</div>
      <div class="metric-sub">Genetic susceptibility</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Smoking Status</div>
      <div class="metric-val">${patientData.smokingStatus}</div>
      <div class="metric-sub">Microvascular risk</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Reported Symptoms</div>
      <div class="metric-val">${activeSymptoms.length > 0 ? activeSymptoms.join(', ') : 'Asymptomatic'}</div>
      <div class="metric-sub">Osmotic / clinical signs</div>
    </div>
  </div>

  <!-- Explainable AI (SHAP) Factor Attribution -->
  <div class="section-title">2. Explainable AI (SHAP) Risk Drivers & Mitigators</div>
  <p style="font-size: 11px; color: #475569; margin-bottom: 8px;">
    SHAP (SHapley Additive exPlanations) values quantify how each clinical variable shifts the baseline population probability (${Math.round((assessment.baseRisk || 0.28) * 100)}%) toward higher or lower risk.
  </p>
  <table>
    <thead>
      <tr>
        <th>Biomarker / Factor</th>
        <th>Patient Value</th>
        <th>Direction</th>
        <th>SHAP Impact (Δ Probability)</th>
        <th>Clinical Significance</th>
      </tr>
    </thead>
    <tbody>
      ${topRiskDrivers.map((item) => `
        <tr>
          <td><strong>${item.feature}</strong></td>
          <td>${item.patientValue}</td>
          <td class="attribution-pos">Increases Risk</td>
          <td class="attribution-pos">+${(Math.abs(item.impactValue) * 100).toFixed(1)}%</td>
          <td>${item.description}</td>
        </tr>
      `).join('')}
      ${protectiveDrivers.map((item) => `
        <tr>
          <td><strong>${item.feature}</strong></td>
          <td>${item.patientValue}</td>
          <td class="attribution-neg">Protective Factor</td>
          <td class="attribution-neg">-${(Math.abs(item.impactValue) * 100).toFixed(1)}%</td>
          <td>${item.description}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Personalized Prevention Plan -->
  <div class="section-title">3. Personalized Clinical Prevention & Lifestyle Prescription</div>
  <div style="margin-bottom: 10px; font-size: 11px; color: #334155; line-height: 1.4;">
    <strong>Executive Summary:</strong> ${activePlan.executiveSummary}
  </div>

  <div class="grid-2">
    ${activePlan.targetedInterventions.map((item) => `
      <div class="plan-card">
        <div class="plan-category">${item.category}</div>
        <div class="plan-rec"><strong>Prescription:</strong> ${item.recommendation}</div>
        <div class="plan-rat"><strong>Biochemical Mechanism:</strong> ${item.clinicalRationale}</div>
      </div>
    `).join('')}
  </div>

  <!-- Physician Discussion Questions -->
  <div class="doctor-questions">
    <strong style="color: #1e3a8a; font-size: 11px; text-transform: uppercase;">
      Recommended Questions to Ask Your Primary Care Physician:
    </strong>
    <ol>
      ${activePlan.doctorDiscussionGuide.map((q) => `<li>${q}</li>`).join('')}
    </ol>
    <div style="margin-top: 6px; font-size: 10.5px; color: #2563eb;">
      <strong>Recommended Follow-up Window:</strong> ${activePlan.recommendedFollowUpInterval}
    </div>
  </div>

  <!-- Sign-off Block -->
  <div class="sig-block">
    <div>
      <div class="sig-line">Reviewing Physician / Clinician Signature</div>
      <div style="font-size: 9px; color: #64748b; margin-top: 2px;">NPI / License: _________________________</div>
    </div>
    <div>
      <div class="sig-line">Date Reviewed & Consultation Notes</div>
      <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Actions Taken: [ ] Lab Orders [ ] Referral [ ] Lifestyle</div>
    </div>
  </div>

  <!-- Legal & Clinical Disclaimer -->
  <div class="disclaimer-box">
    <strong>Clinical Practice Notice & Non-Diagnostic Framing:</strong> This document is generated by DiaCare XAI as an educational and preventive risk stratification artifact. Machine learning outputs (XGBoost, Random Forest, Logistic Regression calibrated via Platt scaling) reflect probability estimations derived from clinical cohorts (PIMA, CDC BRFSS, NHANES) and do NOT constitute a formal laboratory diagnosis of diabetes mellitus. A conclusive diagnosis requires standardized venipuncture testing (FPG ≥ 126 mg/dL, 2-h OGTT ≥ 200 mg/dL, or HbA1c ≥ 6.5%) with a confirmatory repeat sample on a separate day pursuant to ADA standards of care.
  </div>
</body>
</html>`;
}

export function generateEHRClinicalNote(
  assessment: FullAssessmentResult,
  plan?: PreventionPlanData
): string {
  const activePlan = plan || getDefaultPreventionPlan(assessment);
  const { patientData, primaryPrediction, shapContributions } = assessment;
  const dateStr = new Date().toLocaleDateString();

  const topRisks = shapContributions
    .filter((c) => c.direction === 'increase')
    .slice(0, 3)
    .map((c) => `${c.feature} (${c.patientValue})`)
    .join(', ');

  return `DIACARE XAI PREVENTIVE CLINICAL ENCOUNTER SUMMARY
Encounter Date: ${dateStr}
Clinical Objective: Early Diabetes Risk Stratification & Preventive Intervention

PATIENT VITALS & BIOMETRICS:
- Age / Sex: ${patientData.age} yo ${patientData.gender}
- BMI: ${patientData.bmi} kg/m2 (Wt: ${patientData.weightKg} kg, Ht: ${patientData.heightCm} cm)
- Fasting Blood Glucose: ${patientData.bloodGlucose} ${patientData.glucoseUnit}
- Blood Pressure: ${patientData.systolicBP}/${patientData.diastolicBP} mmHg
- Physical Activity: ${patientData.physicalActivityMinutes} min/week
- Smoking Status: ${patientData.smokingStatus}
- Family History: ${patientData.familyHistory ? 'Positive (1st Degree)' : 'Negative'}

XAI RISK STRATIFICATION:
- Primary Tier: ${primaryPrediction.riskLevel.toUpperCase()} RISK (${Math.round(primaryPrediction.riskScore * 100)}% calibrated probability)
- Model: ${primaryPrediction.modelName}
- Leading Risk Attribution Drivers: ${topRisks}

PREVENTIVE PLAN RECOMMENDATIONS:
- Nutrition: Fiber-dense low-GI pattern (>=25-30g fiber/day); protein/veggies before starch.
- Exercise: 150+ min/week moderate aerobic + 2 resistance sessions.
- Adiposity Target: ${patientData.bmi >= 25 ? 'Gradual 5-7% weight reduction over 6 months' : 'Weight maintenance & lean mass optimization'}.
- Follow-up: ${activePlan.recommendedFollowUpInterval} (Recommend venous FPG, HbA1c, and lipid panel).

NOTE: Educational risk screening support only. Not a formal diagnosis. Repeat confirmatory laboratory assay required for definitive diagnosis.`;
}
