
import React, { useState } from 'react';
import { Sparkles, BarChart3, PieChart as PieIcon, LineChart as LineIcon, Info } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { GoogleGenAI } from '@google/genai';

const data = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 2000, profit: 9800 },
  { name: 'Apr', revenue: 2780, profit: 3908 },
  { name: 'May', revenue: 1890, profit: 4800 },
  { name: 'Jun', revenue: 2390, profit: 3800 },
];

const categoryData = [
  { name: 'Coffee', value: 400 },
  { name: 'Pastries', value: 300 },
  { name: 'Supplies', value: 300 },
  { name: 'Merch', value: 200 },
];

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e'];

const Reports: React.FC = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const getAiInsight = async () => {
    setLoadingInsight(true);
    try {
      // Use process.env.API_KEY directly as per SDK requirements
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this hypothetical business data for a local coffee shop: 
        Monthly Revenue: [4000, 3000, 2000, 2780, 1890, 2390]. 
        Categories: Coffee (40%), Pastries (30%), Supplies (30%), Merch (20%).
        Please provide 3 actionable business growth tips based on these trends. Keep it professional and brief.`,
        config: { temperature: 0.7 }
      });
      // Correct extraction of text from GenerateContentResponse
      setInsight(response.text || "No insights available.");
    } catch (err) {
      console.error('Gemini Insight Error:', err);
      setInsight("Error generating insights. Please try again.");
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Bar */}
      <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="text-indigo-300" />
            <h2 className="text-xl font-bold">Business Intelligence AI</h2>
          </div>
          <p className="text-indigo-100 max-w-2xl mb-6">
            Get personalized insights and growth recommendations powered by Gemini AI based on your business data.
          </p>
          <button 
            onClick={getAiInsight}
            disabled={loadingInsight}
            className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50"
          >
            {loadingInsight ? 'Analyzing Trends...' : 'Generate Insights'}
          </button>

          {insight && (
            <div className="mt-6 bg-indigo-800/50 p-6 rounded-xl border border-indigo-700/50 animate-in fade-in slide-in-from-top-4 duration-500">
              <h4 className="text-indigo-200 font-bold mb-3 flex items-center">
                <Info size={16} className="mr-2" /> Actionable Recommendations
              </h4>
              <div className="text-sm leading-relaxed text-indigo-50">
                {insight.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <BarChart3 size={160} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Profit Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <LineIcon size={18} className="mr-2 text-indigo-500" /> Revenue vs Profit
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <PieIcon size={18} className="mr-2 text-indigo-500" /> Sales by Category
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
