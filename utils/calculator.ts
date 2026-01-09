import { CalculationResult, Gender, GoalType, GraphPoint, MacroSplitType, UserFormData } from '../types';
import { MACRO_SPLITS } from '../constants';

export const calculateResults = (data: UserFormData): CalculationResult | null => {
  // Guard clauses for empty inputs
  if (data.weight === '' || data.height === '' || data.age === '' || data.targetWeightChange === '') {
    return null;
  }

  const weight = Number(data.weight);
  const height = Number(data.height);
  const age = Number(data.age);
  const targetChange = Number(data.targetWeightChange);
  const bodyFat = data.bodyFat !== '' ? Number(data.bodyFat) : undefined;

  let bmr = 0;

  // 1. Calculate BMR
  if (bodyFat && bodyFat > 0) {
    // Katch-McArdle Formula
    const leanBodyMass = weight * (1 - bodyFat / 100);
    bmr = 370 + (21.6 * leanBodyMass);
  } else {
    // Mifflin-St Jeor Equation
    const base = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = data.gender === Gender.Male ? base + 5 : base - 161;
  }

  // 2. Calculate TDEE
  const tdee = bmr * data.activityLevel;

  // 3. Calculate Target Calories & Delta
  let dailyDelta = 0;
  
  // 1kg fat ~= 7700 kcal. Muscle gain is complex, roughly 7000-8000 surplus to build kg of tissue (muscle+fat).
  const caloriesPerKg = 7700; 

  if (data.targetMethod === 'ByDate' && data.weeksToGoal !== '') {
    const weeks = Number(data.weeksToGoal);
    const totalCalories = targetChange * caloriesPerKg;
    const dailyChange = totalCalories / (weeks * 7);
    dailyDelta = data.goalType === GoalType.LoseWeight ? -dailyChange : dailyChange;
  } else {
    // By Rate
    const dailyChange = (data.changePerWeek * caloriesPerKg) / 7;
    dailyDelta = data.goalType === GoalType.LoseWeight ? -dailyChange : dailyChange;
  }

  let targetCalories = tdee + dailyDelta;

  // Safety Checks
  let warning = undefined;
  const minCalories = data.gender === Gender.Male ? 1500 : 1200;
  
  if (data.goalType === GoalType.LoseWeight && targetCalories < minCalories) {
    warning = `Calories (${Math.round(targetCalories)}) are below the recommended safety minimum (${minCalories}).`;
  }

  // 4. Calculate Projection & Graph Data (Simulating Metabolic Adaptation)
  const graphData: GraphPoint[] = [];
  let currentWeight = weight;
  let currentBF = bodyFat || 25; // Default guess if unknown
  let currentLBM = weight * (1 - currentBF/100);
  
  // If we don't have body fat, we estimate for the graph.
  // Men approx 15-25%, Women 25-35% usually if not specified.
  if (!bodyFat) currentBF = data.gender === Gender.Male ? 20 : 30;

  // Determine duration
  let weeksToSimulate = 0;
  if (data.targetMethod === 'ByDate' && data.weeksToGoal !== '') {
    weeksToSimulate = Number(data.weeksToGoal);
  } else {
    weeksToSimulate = Math.ceil(targetChange / (Math.abs(dailyDelta) * 7 / caloriesPerKg));
    if (weeksToSimulate > 52) weeksToSimulate = 52; // Cap at 1 year for display
  }

  // Push starting point
  graphData.push({
    week: 0,
    weight: Number(currentWeight.toFixed(2)),
    secondaryMetric: data.goalType === GoalType.LoseWeight ? Number(currentBF.toFixed(1)) : Number(currentLBM.toFixed(1))
  });

  for (let i = 1; i <= weeksToSimulate; i++) {
    // Recalculate BMR based on new weight (Dynamic BMR)
    let dynamicBMR = 0;
    const currentWeightKg = currentWeight;
    
    // Simplified dynamic BMR for loop efficiency
    if (data.gender === Gender.Male) {
      dynamicBMR = (10 * currentWeightKg) + (6.25 * height) - (5 * age) + 5;
    } else {
      dynamicBMR = (10 * currentWeightKg) + (6.25 * height) - (5 * age) - 161;
    }

    // Adaptive Thermogenesis (Metabolic Adaptation)
    // As you diet, your NEAT drops and mitochondria become more efficient.
    // We model this as a % drop in TDEE relative to weight loss progress.
    const adaptationFactor = data.goalType === GoalType.LoseWeight 
        ? Math.max(0.90, 1 - (0.01 * i)) // Up to 10% adaptation drop over time
        : 1; // Less adaptation on surplus

    const dynamicTDEE = (dynamicBMR * data.activityLevel) * adaptationFactor;
    
    // The fixed calorie target vs the moving TDEE
    const actualDailyDeficit = targetCalories - dynamicTDEE;
    
    // Weekly weight change based on actual deficit/surplus
    const weeklyWeightChange = (actualDailyDeficit * 7) / caloriesPerKg;
    
    currentWeight += weeklyWeightChange;

    // Estimate Composition Change
    // In deficit: ~75% fat lost, 25% lean mass lost (optimistic with high protein)
    // In surplus: ~50% muscle gained, 50% fat gained (natural lifter avg)
    if (data.goalType === GoalType.LoseWeight) {
        const fatLoss = Math.abs(weeklyWeightChange) * 0.80; // 80% fat loss
        const lbmLoss = Math.abs(weeklyWeightChange) * 0.20;
        
        const fatMass = (currentWeightKg * (currentBF/100)) - fatLoss;
        currentBF = (fatMass / currentWeight) * 100;
    } else {
        const muscleGain = weeklyWeightChange * 0.50; // 50% muscle gain
        const lbm = (currentWeightKg * (1 - currentBF/100)) + muscleGain;
        currentLBM = lbm; // For graph
    }

    graphData.push({
      week: i,
      weight: Number(currentWeight.toFixed(2)),
      secondaryMetric: data.goalType === GoalType.LoseWeight ? Number(currentBF.toFixed(1)) : Number(currentLBM.toFixed(1))
    });
  }

  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + (weeksToSimulate * 7));

  // 5. Calculate Macros
  const split = MACRO_SPLITS[data.macroSplit];
  const proteinGrams = (targetCalories * (split.protein / 100)) / 4;
  const fatGrams = (targetCalories * (split.fats / 100)) / 9;
  const carbGrams = (targetCalories * (split.carbs / 100)) / 4;

  return {
    bmr,
    tdee,
    targetCalories,
    dailyDelta,
    proteinGrams,
    fatGrams,
    carbGrams,
    weeksUntilGoal: weeksToSimulate,
    projectedDate,
    warning,
    graphData
  };
};
