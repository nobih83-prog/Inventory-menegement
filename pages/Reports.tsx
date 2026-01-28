
import React, { useState } from 'react';
import { Sparkles, BarChart3, PieChart as PieIcon, LineChart as LineIcon, Info, RefreshCw } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { GoogleGenAI } from '@google/genai';
import { useNotifications } from '../App';

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
  const { addNotification } = useNotifications();

  const getAiInsight = async () => {
    setLoadingInsight(true);
    setInsight(null);
    
    try {
      // JIT Initialization to ensure latest key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ 
          parts: [{ 
            text: `Analyze this business data for a local cafe named Nashwa: 
            Monthly Revenue Trend: ${JSON.stringify(data.map(d => d.revenue))}. 
            Product Categories: Coffee, Pastries, Supplies, Merch.
            Revenue Source Mix: Coffee (40%), Pastries (25%), Others (35%).
            
            Provide exactly 3 high-impact, actionable business growth tips based on these numbers. 
            Keep it professional, data-driven, and very concise. Use bullet points.` 
          }] 
        }],
        config: { 
          temperature: 0.7,
          topK: 40,
          topP: 0.95
        }
      });

      const text = response.text;
      if (text) {
        setInsight(text);
        addNotification({
          title: 'Intelligence Ready',
          message: 'Gemini has analyzed your business trends.',
          type: 'success'
        });
      } else {
        throw new Error("Empty AI response received.");
      }
    } catch (err) {
      console.error('Gemini Insight Error:', err);
      setInsight("Unable to connect to Nashwa Intelligence. Please check your network or API permissions.");
      addNotification({
        title: 'Analysis Failed',
        message: 'Could not generate AI insights at this moment.',
        type: 'error'
      });
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Bar */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <Sparkles className="text-indigo-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Nashwa Intelligence</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">GenAI powered business analysis</p>
            </div>
          </div>
          
          <p className="text-slate-300 text-sm font-medium leading-relaxed mb-8">
            Leverage advanced reasoning to unlock growth. Our AI analyzes your transaction history, inventory turns, and customer behavior to provide strategic advice.
          </p>
          
          <button 
            onClick={getAiInsight}
            disabled={loadingInsight}
            className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center"
          >
            {loadingInsight ? (
              <><RefreshCw size={16} className="mr-3 animate-spin" /> Analyzing Nodes...</>
            ) : (
              'Run Intelligence Scan'
            )}
          </button>

          {insight && (
            <div className="mt-10 bg-white/5 p-8 rounded-[2rem] border border-white/10 animate-in slide-in-from-top-4 duration-500">
              <h4 className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center">
                <Info size={14} className="mr-2" /> Strategic Recommendations
              </h4>
              <div className="text-sm leading-relaxed text-indigo-50 font-medium">
                {insight.split('\n').map((line, i) => (
                  <p key={i} className="mb-3 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-[-10%] right-[5%] p-8 opacity-10 rotate-12 hidden lg:block">
           <BarChart3 size={240} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 flex items-center uppercase tracking-tight">
              <LineIcon size={18} className="mr-3 text-indigo-600" /> Revenue Flow
            </h3>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '30px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'}} />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="profit" fill="#818cf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 flex items-center uppercase tracking-tight">
              <PieIcon size={18} className="mr-3 text-indigo-600" /> Category Mix
            </h3>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
