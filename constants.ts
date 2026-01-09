import { ActivityLevelValue, ActivityOption, MacroSplit, MacroSplitType } from './types';

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    label: 'Sedentary',
    value: ActivityLevelValue.Sedentary,
    description: 'Desk job, little/no exercise.',
  },
  {
    label: 'Light',
    value: ActivityLevelValue.LightlyActive,
    description: 'Exercise 1-3 days/week.',
  },
  {
    label: 'Moderate',
    value: ActivityLevelValue.ModeratelyActive,
    description: 'Sports 3-5 days/week.',
  },
  {
    label: 'Very Active',
    value: ActivityLevelValue.VeryActive,
    description: 'Sports 6-7 days/week.',
  },
  {
    label: 'Extra Active',
    value: ActivityLevelValue.ExtraActive,
    description: 'Physical job or 2x training.',
  },
];

export const MACRO_SPLITS: Record<MacroSplitType, MacroSplit> = {
  [MacroSplitType.Balanced]: {
    label: 'Balanced',
    protein: 30,
    fats: 35,
    carbs: 35,
    description: 'Sustainable balance.',
  },
  [MacroSplitType.HighProtein]: {
    label: 'High Protein',
    protein: 40,
    fats: 30,
    carbs: 30,
    description: 'Best for retention/growth.',
  },
  [MacroSplitType.HighCarb]: {
    label: 'High Carb',
    protein: 25,
    fats: 20,
    carbs: 55,
    description: 'Endurance focused.',
  },
  [MacroSplitType.LowCarb]: {
    label: 'Low Carb',
    protein: 40,
    fats: 40,
    carbs: 20,
    description: 'Insulin control.',
  },
  [MacroSplitType.Keto]: {
    label: 'Keto',
    protein: 25,
    fats: 70,
    carbs: 5,
    description: 'Ketosis state.',
  },
};

export const TOOLTIPS = {
  gender: "Biological sex affects BMR calculations due to average differences in muscle mass.",
  age: "Metabolism naturally slows slightly as we age.",
  height: "Taller individuals generally have more mass and surface area, increasing BMR.",
  weight: "Total body mass is the primary driver of energy expenditure.",
  waist: "Waist circumference can help refine body fat estimation if direct measurement isn't available.",
  bodyFat: "Using Body Fat % (Katch-McArdle formula) is more accurate than total weight alone, especially for athletes.",
  muscleMass: "Knowing your lean mass helps target protein needs more precisely.",
  activity: "Be honest! 'Sedentary' is correct for most office workers, even those who lift 3x a week. Overestimating this causes stalling.",
  goalType: "Fat Loss requires a Caloric Deficit. Muscle Gain requires a Caloric Surplus and resistance training.",
  targetWeight: "How much weight do you want to move in your chosen direction?",
  targetMethod: "Choose 'Rate' for consistency or 'Time' for a deadline. Rate is usually safer.",
  weeklyRate: "0.5kg/week is standard. >1kg/week risks muscle loss (in cuts) or excessive fat gain (in bulks).",
  macro: "Protein builds muscle. Fats regulate hormones. Carbs fuel high-intensity activity.",
  bmr: "Basal Metabolic Rate: Calories burned at complete rest (coma state).",
  tdee: "Total Daily Energy Expenditure: BMR + Activity. This is your maintenance level.",
  delta: "The difference between your maintenance calories and your target. Negative = Weight Loss.",
};
