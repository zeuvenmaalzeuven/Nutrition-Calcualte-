export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum ActivityLevelValue {
  Sedentary = 1.2,
  LightlyActive = 1.375,
  ModeratelyActive = 1.55,
  VeryActive = 1.725,
  ExtraActive = 1.9,
}

export interface ActivityOption {
  label: string;
  value: ActivityLevelValue;
  description: string;
}

export enum GoalType {
  LoseWeight = 'LoseWeight',
  GainMuscle = 'GainMuscle',
}

export enum TargetMethod {
  ByDate = 'ByDate',
  ByRate = 'ByRate',
}

export enum MacroSplitType {
  Balanced = 'Balanced',
  HighProtein = 'HighProtein',
  HighCarb = 'HighCarb',
  LowCarb = 'LowCarb',
  Keto = 'Keto',
}

export interface MacroSplit {
  label: string;
  protein: number; // percentage 0-100
  fats: number;
  carbs: number;
  description: string;
}

export interface UserFormData {
  gender: Gender;
  age: number | '';
  weight: number | ''; // kg
  height: number | ''; // cm
  activityLevel: ActivityLevelValue;
  activityDescription: string;
  
  // Optional
  waist?: number | ''; // cm
  bodyFat?: number | ''; // %
  muscleMass?: number | ''; // kg

  // Goals
  goalType: GoalType;
  targetWeightChange: number | ''; // kg to lose OR gain (always positive in UI)
  targetMethod: TargetMethod;
  weeksToGoal: number | '';
  changePerWeek: number; // kg per week

  macroSplit: MacroSplitType;
}

export interface GraphPoint {
  week: number;
  weight: number;
  secondaryMetric: number; // Body Fat % or Muscle Mass
}

export interface CalculationResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  dailyDelta: number; // Deficit or Surplus
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  weeksUntilGoal: number;
  projectedDate: Date;
  warning?: string;
  graphData: GraphPoint[];
}
