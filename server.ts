import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Route: AI-generated personalized clinical prevention guidance using Gemini
app.post('/api/personalized-plan', async (req, res) => {
  try {
    const { patientData, riskScore, riskLevel, topRiskFactors, selectedModel } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        source: 'fallback',
        plan: generateAlgorithmicPlan(patientData, riskLevel, topRiskFactors)
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a senior preventive metabolic health AI specialist assisting an explainable screening system ("DiaCare XAI").
STRICT MEDICAL ETHICS & SAFETY NOTICE:
- Do NOT provide a definitive diagnosis or medical claim.
- Clearly present actionable, evidence-based lifestyle modifications (ADA & WHO guidelines).
- Focus on addressing the specific major contributing risk factors identified by the XAI model.

PATIENT PROFILE & XAI RESULTS:
- Assessed Risk Level: ${riskLevel} (${Math.round(riskScore * 100)}% probability, assessed using ${selectedModel})
- Age: ${patientData.age} | Gender: ${patientData.gender} | BMI: ${patientData.bmi} kg/m²
- Blood Glucose (Fasting/Random): ${patientData.bloodGlucose} mg/dL
- Blood Pressure: ${patientData.systolicBP}/${patientData.diastolicBP} mmHg
- Physical Activity: ${patientData.physicalActivityMinutes} min/week
- Family History of Diabetes: ${patientData.familyHistory ? 'Yes' : 'No'}
- Smoking Status: ${patientData.smokingStatus}
- Symptoms Reported: ${patientData.symptoms?.join(', ') || 'None reported'}
- Primary Risk Drivers Identified by XAI (SHAP impact):
${topRiskFactors?.map((f: { name: string; impact: string; detail: string }) => `  * ${f.name} (Impact: ${f.impact}) - ${f.detail}`).join('\n')}

Generate a structured JSON response containing:
1. "executiveSummary": A reassuring, 2-3 sentence overview of what this screening means and why early detection is an opportunity for prevention/reversal.
2. "targetedInterventions": An array of 3-4 specific lifestyle actions targeting their top risk factors (e.g. Dietary, Physical Activity, Biomarker Tracking). Each with "category", "recommendation", and "clinicalRationale".
3. "whatIfImpact": A realistic projected risk reduction if key modifiable factors (like 5% weight loss or 150 min/wk brisk walking) are met.
4. "doctorDiscussionGuide": An array of 3 specific, informed questions the patient should bring to their primary care physician.
5. "recommendedFollowUpInterval": Suggested timeframe for clinical re-check (e.g., "Within 2-4 weeks", "6 months annual wellness").

Return ONLY valid JSON matching this structure. No markdown backticks, raw JSON only.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    let parsedPlan;
    try {
      parsedPlan = JSON.parse(responseText.trim());
    } catch {
      // Clean possible wrapping
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedPlan = JSON.parse(cleaned);
    }

    return res.status(200).json({
      source: 'gemini',
      plan: parsedPlan
    });

  } catch (error: any) {
    console.error('Gemini API generation error:', error?.message || error);
    // Graceful fallback to algorithmic evidence-based plan
    const { patientData, riskLevel, topRiskFactors } = req.body;
    return res.status(200).json({
      source: 'fallback',
      plan: generateAlgorithmicPlan(patientData, riskLevel, topRiskFactors)
    });
  }
});

// Fallback generator adhering to ADA & WHO preventive medicine standards
function generateAlgorithmicPlan(patientData: any, riskLevel: string, topRiskFactors: any[]) {
  const isHigh = riskLevel === 'High';
  const isMod = riskLevel === 'Moderate';

  return {
    executiveSummary: `Based on your screening parameters, your diabetes risk profile is assessed as ${riskLevel}. This is a screening tool, not a diagnosis. Early detection of metabolic risk indicators provides a powerful opportunity to delay or prevent the onset of type-2 diabetes through targeted lifestyle adjustments.`,
    targetedInterventions: [
      {
        category: 'Nutrition & Glycemic Load',
        recommendation: 'Prioritize a Mediterranean or DASH-style dietary pattern rich in soluble dietary fiber (leafy greens, legumes, whole grains) while reducing refined starches and sugar-sweetened beverages.',
        clinicalRationale: 'Reduces postprandial glucose spikes and improves systemic insulin sensitivity by slowing digestive carbohydrate absorption.'
      },
      {
        category: 'Physical Activity & Muscle Glucose Uptake',
        recommendation: `Target at least 150 minutes per week of moderate-intensity aerobic exercise (e.g., brisk walking, cycling) combined with 2 sessions of resistance exercise.`,
        clinicalRationale: 'Skeletal muscle is the primary site of insulin-mediated glucose disposal. Contraction stimulates GLUT4 translocation independently of insulin.'
      },
      {
        category: 'Weight & Metabolic Optimization',
        recommendation: patientData?.bmi > 25 
          ? 'Aim for an intentional, sustainable 5% to 7% body weight reduction over a 6-month period.' 
          : 'Focus on maintaining optimal body composition and minimizing visceral adiposity through daily routine movement.',
        clinicalRationale: 'Clinical trials (e.g., the Diabetes Prevention Program) demonstrated that a 5-7% weight reduction lowers diabetes incidence by up to 58% in high-risk individuals.'
      },
      {
        category: 'Clinical Biomarker Monitoring',
        recommendation: isHigh 
          ? 'Schedule a formal laboratory assessment including Fasting Plasma Glucose (FPG), HbA1c, and a comprehensive lipid profile with your doctor.'
          : 'Keep a periodic log of resting blood pressure and repeat this lifestyle screening in 6 months.',
        clinicalRationale: 'Direct venous blood assay is required to definitively diagnose prediabetes or diabetes and tailor pharmacological or therapeutic plans.'
      }
    ],
    whatIfImpact: isHigh 
      ? 'Targeting a 5-7% reduction in BMI and achieving 150 min/week physical activity is estimated to shift your risk profile into the Moderate or Low zone.'
      : 'Maintaining active exercise habits and balanced fiber-rich meals stabilizes your risk within the healthy baseline margin.',
    doctorDiscussionGuide: [
      'Would you recommend an HbA1c test or an Oral Glucose Tolerance Test (OGTT) to assess my baseline metabolic health?',
      'How does my current lipid panel and blood pressure interact with my overall cardiometabolic risk?',
      'Are there supervised lifestyle programs (e.g., National Diabetes Prevention Program) or dietitian referrals suitable for me?'
    ],
    recommendedFollowUpInterval: isHigh ? 'Within 2 to 4 weeks with a primary care provider' : isMod ? 'Within 3 months' : 'Annual routine wellness check'
  };
}

// Development and production setup with Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DiaCare XAI server listening on port ${PORT}`);
  });
}

startServer();
