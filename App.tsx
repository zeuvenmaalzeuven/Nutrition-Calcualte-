import React, { useState, useEffect } from 'react';
import { 
  Gender, 
  ActivityLevelValue, 
  UserFormData, 
  TargetMethod, 
  MacroSplitType, 
  CalculationResult,
  GoalType
} from './types';
import { ACTIVITY_OPTIONS, MACRO_SPLITS, TOOLTIPS } from './constants';
import { calculateResults } from './utils/calculator';
import { determineActivityLevel } from './services/geminiService';
import InputGroup from './components/InputGroup';
import Tooltip from './components/Tooltip';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

const INITIAL_DATA: UserFormData = {
  gender: Gender.Male,
  age: 30,
  weight: 80,
  height: 180,
  activityLevel: ActivityLevelValue.Sedentary,
  activityDescription: '',
  goalType: GoalType.LoseWeight,
  targetWeightChange: 5,
  targetMethod: TargetMethod.ByRate,
  weeksToGoal: 12,
  changePerWeek: 0.5,
  macroSplit: MacroSplitType.Balanced
};

function App() {
  const [formData, setFormData] = useState<UserFormData>(INITIAL_DATA);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isAnalyzingActivity, setIsAnalyzingActivity] = useState(false);

  useEffect(() => {
    const res = calculateResults(formData);
    setResults(res);
  }, [formData]);

  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    if (value === '') {
      handleChange(field, '');
    } else {
      handleChange(field, Number(value));
    }
  };

  const handleAiActivityAnalysis = async () => {
    if (!formData.activityDescription) return;

    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    setIsAnalyzingActivity(true);
    const suggestedLevel = await determineActivityLevel(formData.activityDescription);
    setIsAnalyzingActivity(false);
    
    if (suggestedLevel) {
      handleChange('activityLevel', suggestedLevel);
    }
  };

  const formatNumber = (num: number) => Math.round(num).toLocaleString();

  // Pie Chart Data
  const macroData = results ? [
    { name: 'Protein', value: results.proteinGrams, color: '#e5e5e5' },
    { name: 'Fats', value: results.fatGrams, color: '#737373' },
    { name: 'Carbs', value: results.carbGrams, color: '#404040' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 font-sans selection:bg-white selection:text-black">
      <header className="border-b border-gray-800 bg-[#121212] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center text-black font-bold text-xs">N</div>
            <h1 className="text-lg font-bold tracking-tight text-white">NeuroCal</h1>
          </div>
          <span className="text-[10px] text-gray-600 font-mono">SCIENTIFIC CALCULATOR v2.0</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Section 1: Stats */}
          <section className="bg-[#181818] p-4 rounded border border-gray-800">
            <h2 className="text-sm font-semibold mb-4 text-white flex items-center">
              1. Biometrics
              <Tooltip content="Your basic physical stats are required to calculate your Basal Metabolic Rate (BMR)." />
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputGroup label="Gender" tooltip={TOOLTIPS.gender} className="col-span-2 sm:col-span-1">
                <div className="flex bg-[#222] rounded overflow-hidden border border-gray-700">
                  <button
                    type="button"
                    onClick={() => handleChange('gender', Gender.Male)}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                      formData.gender === Gender.Male ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    M
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('gender', Gender.Female)}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                      formData.gender === Gender.Female ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    F
                  </button>
                </div>
              </InputGroup>

              <InputGroup label="Age" tooltip={TOOLTIPS.age}>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full p-1.5 bg-[#222] border border-gray-700 rounded text-sm text-white focus:border-white outline-none"
                />
              </InputGroup>

              <InputGroup label="Height (cm)" tooltip={TOOLTIPS.height}>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="w-full p-1.5 bg-[#222] border border-gray-700 rounded text-sm text-white focus:border-white outline-none"
                />
              </InputGroup>

              <InputGroup label="Weight (kg)" tooltip={TOOLTIPS.weight}>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="w-full p-1.5 bg-[#222] border border-gray-700 rounded text-sm text-white focus:border-white outline-none"
                />
              </InputGroup>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2">
               <InputGroup label="Waist (cm)" optional tooltip={TOOLTIPS.waist}>
                <input type="number" value={formData.waist || ''} onChange={(e) => handleInputChange('waist', e.target.value)} className="w-full p-1.5 bg-[#222] border border-gray-700 rounded text-sm text-white focus:border-white outline-none" placeholder="Opt" />
              </InputGroup>
               <InputGroup label="Body Fat %" optional tooltip={TOOLTIPS.bodyFat}>
                <input type="number" value={formData.bodyFat || ''} onChange={(e) => handleInputChange('bodyFat', e.target.value)} className="w-full p-1.5 bg-[#222] border border-gray-700 rounded text-sm text-white focus:border-white outline-none" placeholder="Opt" />
              </InputGroup>
               <InputGroup label="Muscle (kg)" optional tooltip={TOOLTIPS.muscleMass}>
                <input type="number" value={formData.muscleMass || ''} onChange={(e) => handleInputChange('muscleMass', e.target.value)} className="w-full p-1.5 bg-[#222] border border-gray-700 rounded text-sm text-white focus:border-white outline-none" placeholder="Opt" />
              </InputGroup>
            </div>
          </section>

          {/* Section 2: Activity */}
          <section className="bg-[#181818] p-4 rounded border border-gray-800">
             <h2 className="text-sm font-semibold mb-4 text-white flex items-center">
              2. Activity
              <Tooltip content={TOOLTIPS.activity} />
            </h2>
            
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                 <input 
                   type="text" 
                   value={formData.activityDescription}
                   onChange={(e) => handleChange('activityDescription', e.target.value)}
                   placeholder="Or type: 'Office job, gym 3x/week' & use AI ->"
                   className="flex-1 p-1.5 bg-[#222] border border-gray-700 rounded text-xs text-white focus:border-white outline-none"
                 />
                 <button
                    onClick={handleAiActivityAnalysis}
                    disabled={isAnalyzingActivity || !formData.activityDescription}
                    className="bg-white text-black px-3 rounded text-xs font-bold hover:bg-gray-200 disabled:opacity-50"
                 >
                   {isAnalyzingActivity ? '...' : 'AI'}
                 </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {ACTIVITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange('activityLevel', option.value)}
                  className={`flex-1 min-w-[80px] py-2 px-1 rounded border text-xs transition-all ${
                    formData.activityLevel === option.value
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-[#222] text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                  title={option.description}
                >
                  {option.label}
                  <div className="text-[10px] opacity-70 mt-0.5">x{option.value}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Section 3: Goals */}
          <section className="bg-[#181818] p-4 rounded border border-gray-800">
             <h2 className="text-sm font-semibold mb-4 text-white flex items-center">
              3. Goals
              <Tooltip content={TOOLTIPS.goalType} />
            </h2>

            <div className="flex bg-[#222] rounded overflow-hidden border border-gray-700 mb-4">
               <button
                  onClick={() => handleChange('goalType', GoalType.LoseWeight)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    formData.goalType === GoalType.LoseWeight ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                  }`}
               >
                 Burn Fat (Deficit)
               </button>
               <button
                  onClick={() => handleChange('goalType', GoalType.GainMuscle)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    formData.goalType === GoalType.GainMuscle ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                  }`}
               >
                 Build Muscle (Surplus)
               </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <InputGroup label={`Target ${formData.goalType === GoalType.LoseWeight ? 'Loss' : 'Gain'} (kg)`} tooltip={TOOLTIPS.targetWeight}>
                 <input
                  type="number"
                  value={formData.targetWeightChange}
                  onChange={(e) => handleInputChange('targetWeightChange', e.target.value)}
                  className="w-full p-1.5 bg-[#222] border border-gray-700 rounded text-sm text-white focus:border-white outline-none"
                 />
               </InputGroup>

               <div className="flex flex-col justify-end mb-3">
                  <div className="flex bg-[#222] rounded p-0.5 border border-gray-700 h-[34px]">
                     <button 
                       onClick={() => handleChange('targetMethod', TargetMethod.ByRate)}
                       className={`flex-1 rounded text-xs ${formData.targetMethod === TargetMethod.ByRate ? 'bg-white text-black' : 'text-gray-400'}`}
                     >
                       Rate
                     </button>
                     <button 
                       onClick={() => handleChange('targetMethod', TargetMethod.ByDate)}
                       className={`flex-1 rounded text-xs ${formData.targetMethod === TargetMethod.ByDate ? 'bg-white text-black' : 'text-gray-400'}`}
                     >
                       Date
                     </button>
                  </div>
               </div>
            </div>

            {formData.targetMethod === TargetMethod.ByRate ? (
               <InputGroup label="Weekly Rate (kg/week)" tooltip={TOOLTIPS.weeklyRate} className="mb-0">
                 <div className="flex gap-1">
                   {[0.25, 0.5, 0.75, 1.0].map(rate => (
                     <button
                        key={rate}
                        onClick={() => handleChange('changePerWeek', rate)}
                        className={`flex-1 py-2 rounded border text-xs ${
                          formData.changePerWeek === rate 
                            ? 'bg-white text-black border-white' 
                            : 'bg-[#222] text-gray-400 border-gray-700'
                        }`}
                     >
                       {rate}
                     </button>
                   ))}
                 </div>
               </InputGroup>
            ) : (
               <InputGroup label="Weeks to Goal" tooltip="Duration of your diet phase" className="mb-0">
                  <input
                    type="number"
                    value={formData.weeksToGoal}
                    onChange={(e) => handleInputChange('weeksToGoal', e.target.value)}
                    className="w-full p-1.5 bg-[#222] border border-gray-700 rounded text-sm text-white focus:border-white outline-none"
                  />
               </InputGroup>
            )}
          </section>

          {/* Section 4: Macro Split */}
          <section className="bg-[#181818] p-4 rounded border border-gray-800">
             <h2 className="text-sm font-semibold mb-4 text-white flex items-center">
              4. Nutrition Strategy
              <Tooltip content={TOOLTIPS.macro} />
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
               {Object.keys(MACRO_SPLITS).map((key) => {
                 const split = MACRO_SPLITS[key as MacroSplitType];
                 return (
                  <button 
                    key={key} 
                    onClick={() => handleChange('macroSplit', key)}
                    className={`flex flex-col items-center justify-center p-2 border rounded transition-all ${
                      formData.macroSplit === key 
                        ? 'border-white bg-white text-black' 
                        : 'border-gray-700 bg-[#222] text-gray-400 hover:border-gray-500'
                    }`}
                  >
                     <span className="font-bold text-[10px] uppercase mb-1">{split.label}</span>
                     <div className="flex text-[9px] gap-1 opacity-80">
                        <span>P{split.protein}</span>/<span>F{split.fats}</span>/<span>C{split.carbs}</span>
                     </div>
                  </button>
                 );
               })}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Card */}
          <div className="bg-[#e5e5e5] text-black p-6 rounded-lg shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">Target Daily Intake</h3>
               <div className="flex items-baseline gap-2 mb-4">
                 <span className="text-5xl font-extrabold tracking-tighter">
                   {results ? formatNumber(results.targetCalories) : '---'}
                 </span>
                 <span className="text-sm font-medium text-gray-600">kcal / day</span>
               </div>
               
               <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/50 rounded p-2 text-center backdrop-blur-sm">
                     <div className="text-xl font-bold">{results ? Math.round(results.proteinGrams) : '-'}g</div>
                     <div className="text-[10px] uppercase text-gray-600 font-bold">Protein</div>
                  </div>
                  <div className="bg-white/50 rounded p-2 text-center backdrop-blur-sm">
                     <div className="text-xl font-bold">{results ? Math.round(results.fatGrams) : '-'}g</div>
                     <div className="text-[10px] uppercase text-gray-600 font-bold">Fat</div>
                  </div>
                  <div className="bg-white/50 rounded p-2 text-center backdrop-blur-sm">
                     <div className="text-xl font-bold">{results ? Math.round(results.carbGrams) : '-'}g</div>
                     <div className="text-[10px] uppercase text-gray-600 font-bold">Carbs</div>
                  </div>
               </div>
             </div>
             {/* Abstract BG Shape */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/30 rounded-full blur-2xl"></div>
          </div>

          {results?.warning && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-xs flex items-start gap-2">
               <span>⚠️</span>
               {results.warning}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#181818] p-3 rounded border border-gray-800">
                <div className="text-gray-400 text-[10px] uppercase mb-1 flex items-center gap-1">
                   BMR <Tooltip content={TOOLTIPS.bmr} />
                </div>
                <div className="text-lg font-mono text-white">{results ? formatNumber(results.bmr) : '-'}</div>
             </div>
             <div className="bg-[#181818] p-3 rounded border border-gray-800">
                <div className="text-gray-400 text-[10px] uppercase mb-1 flex items-center gap-1">
                   Maintenance <Tooltip content={TOOLTIPS.tdee} />
                </div>
                <div className="text-lg font-mono text-white">{results ? formatNumber(results.tdee) : '-'}</div>
             </div>
             <div className="bg-[#181818] p-3 rounded border border-gray-800">
                <div className="text-gray-400 text-[10px] uppercase mb-1 flex items-center gap-1">
                   Daily Delta <Tooltip content={TOOLTIPS.delta} />
                </div>
                <div className={`text-lg font-mono ${formData.goalType === GoalType.LoseWeight ? 'text-red-400' : 'text-green-400'}`}>
                   {results ? (results.dailyDelta > 0 ? '+' : '') + formatNumber(results.dailyDelta) : '-'}
                </div>
             </div>
             <div className="bg-[#181818] p-3 rounded border border-gray-800">
                <div className="text-gray-400 text-[10px] uppercase mb-1">Completion</div>
                <div className="text-xs text-white">
                   {results ? results.projectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '-'}
                </div>
                <div className="text-[10px] text-gray-500">{results ? Math.round(results.weeksUntilGoal) : '-'} weeks</div>
             </div>
          </div>

          {/* Graph Section */}
          <div className="bg-[#181818] p-4 rounded border border-gray-800 h-64 flex flex-col">
             <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Projected Progress (with Adaptation)</h3>
             <div className="flex-1 w-full min-h-0">
               {results && (
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={results.graphData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                     <XAxis 
                       dataKey="week" 
                       stroke="#666" 
                       fontSize={10} 
                       tickLine={false}
                       axisLine={false}
                       interval="preserveStartEnd"
                     />
                     <YAxis 
                       yAxisId="left" 
                       stroke="#e5e5e5" 
                       fontSize={10} 
                       tickLine={false}
                       axisLine={false}
                       domain={['auto', 'auto']}
                       unit="kg"
                     />
                     <YAxis 
                       yAxisId="right" 
                       orientation="right" 
                       stroke="#666" 
                       fontSize={10} 
                       tickLine={false}
                       axisLine={false}
                       domain={['auto', 'auto']}
                       unit={formData.goalType === GoalType.LoseWeight ? "%" : "kg"}
                     />
                     <RechartsTooltip 
                       contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '4px' }}
                       itemStyle={{ fontSize: '11px', color: '#fff' }}
                       labelStyle={{ color: '#888', marginBottom: '4px' }}
                     />
                     <Legend iconSize={8} wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>
                     <Line 
                       yAxisId="left"
                       type="monotone" 
                       dataKey="weight" 
                       stroke="#e5e5e5" 
                       strokeWidth={2} 
                       dot={false} 
                       name="Weight (kg)"
                     />
                     <Line 
                       yAxisId="right"
                       type="monotone" 
                       dataKey="secondaryMetric" 
                       stroke="#666" 
                       strokeWidth={1} 
                       strokeDasharray="4 4" 
                       dot={false} 
                       name={formData.goalType === GoalType.LoseWeight ? "Est. Body Fat %" : "Est. Muscle Mass (kg)"}
                     />
                   </LineChart>
                 </ResponsiveContainer>
               )}
             </div>
          </div>

          {/* Pie Chart Mini */}
          <div className="bg-[#181818] p-3 rounded border border-gray-800 h-32 flex">
             <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={35}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="w-1/2 flex flex-col justify-center text-xs space-y-2">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#e5e5e5]"></div>
                   <span className="text-gray-400">Protein</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#737373]"></div>
                   <span className="text-gray-400">Fats</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#404040]"></div>
                   <span className="text-gray-400">Carbs</span>
                </div>
             </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default App;