import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Cell, LineChart, Line, ReferenceLine, ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Activity, 
  BrainCircuit, 
  Table as TableIcon, 
  BarChart3,
  Lock,
  Pencil,
  Menu,
  ChevronRight,
  X
} from 'lucide-react';
import { calculateNPV, calculateIRR, generateTableData } from './utils/financial';
import { DashboardCard } from './components/DashboardCard';
import { analyzeProjectFinancials } from './services/geminiService';
import { ProjectMetrics, YearlyData, AnalysisStatus } from './types';
import Markdown from 'react-markdown';

const App: React.FC = () => {
  // Fixed data - User cannot edit these anymore
  const [initialInvestment] = useState<number>(-200000);
  const [discountRate] = useState<number>(0.12);
  const [cashFlows] = useState<number[]>([50000, 60000, 70000, 80000, 90000]);
  
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [tableData, setTableData] = useState<YearlyData[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'ai'>('dashboard');
  
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Calculate metrics on mount
  useEffect(() => {
    const npv = calculateNPV(initialInvestment, cashFlows, discountRate);
    const irr = calculateIRR(initialInvestment, cashFlows);
    const tData = generateTableData(initialInvestment, cashFlows, discountRate);
    
    // Summing positive future values for display purposes
    const totalPv = tData.reduce((acc, curr) => acc + (curr.year > 0 ? curr.pv : 0), 0);
    const totalFv = tData.reduce((acc, curr) => acc + (curr.year > 0 ? curr.fv : 0), 0);

    setMetrics({
      npv,
      irr,
      totalPv,
      totalFv,
      initialInvestment,
      discountRate
    });
    setTableData(tData);
  }, [initialInvestment, discountRate, cashFlows]);

  const triggerAiAnalysis = async () => {
    if (!metrics) return;
    setAiStatus(AnalysisStatus.LOADING);
    const result = await analyzeProjectFinancials(metrics, tableData);
    setAiAnalysis(result);
    setAiStatus(AnalysisStatus.SUCCESS);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen text-ink flex flex-col md:flex-row font-sans selection:bg-marker-yellow selection:text-black overflow-x-hidden">
      
      {/* Sidebar Navigation - Notebook Margin Style */}
      <aside 
        className={`fixed top-0 right-0 h-full bg-white border-l-[3px] border-black flex flex-col z-30 shadow-2xl transition-transform duration-300 w-64 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b-[3px] border-black bg-marker-yellow relative">
           {/* Close Button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-2 left-2 p-1 hover:bg-black/10 rounded transition-colors"
          >
            <ChevronRight size={24} className="text-black" />
          </button>

          <div className="flex items-center gap-2 mb-1 -rotate-2 mt-4">
            <h1 className="text-4xl font-black text-black">
              پروژه ۱
            </h1>
            <Pencil size={24} className="text-black" />
          </div>
          <p className="text-lg font-bold text-black mt-2 rotate-1 bg-white inline-block px-2 border-2 border-black">حساب‌کتاب مالی 🧮</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`doodle-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-marker-blue -rotate-1' : 'bg-white hover:bg-gray-100 rotate-0'}`}
          >
            <BarChart3 size={24} strokeWidth={2.5} />
            <span className="font-bold text-xl pt-1">داشبورد</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('table')}
            className={`doodle-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'table' ? 'bg-marker-green rotate-1' : 'bg-white hover:bg-gray-100 rotate-0'}`}
          >
            <TableIcon size={24} strokeWidth={2.5} />
            <span className="font-bold text-xl pt-1">جدول اعداد</span>
          </button>

          <button 
            onClick={() => setActiveTab('ai')}
            className={`doodle-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'ai' ? 'bg-marker-purple -rotate-1' : 'bg-white hover:bg-gray-100 rotate-0'}`}
          >
            <BrainCircuit size={24} strokeWidth={2.5} />
            <span className="font-bold text-xl pt-1">هوش مصنوعی</span>
          </button>
        </nav>

        {/* Info Box */}
        <div className="p-4 border-t-[3px] border-black bg-gray-50 pattern-grid">
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <Lock size={20} />
            <span className="font-bold text-xl">تنظیمات قفل شده</span>
          </div>
          <div className="space-y-4 opacity-75 grayscale">
            <div className="bg-white p-2 border-2 border-black rounded border-dashed">
              <label className="text-sm font-bold block mb-1">نرخ تنزیل (%)</label>
              <div className="w-full bg-gray-100 px-2 py-1 text-xl text-center font-bold">
                {Math.round(discountRate * 100)}%
              </div>
            </div>
            <div className="bg-white p-2 border-2 border-black rounded border-dashed">
              <label className="text-sm font-bold block mb-1">سرمایه‌گذاری اولیه</label>
              <div className="w-full bg-gray-100 px-2 py-1 text-xl text-center font-bold text-red-600" dir="ltr">
                {formatCurrency(initialInvestment)}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'md:mr-64' : 'md:mr-0'}`}>
        
        {/* Toggle Button when closed */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 right-4 z-20 doodle-btn bg-marker-yellow p-3 rounded-lg hover:rotate-2 transition-transform"
          >
            <Menu size={24} className="text-black" />
          </button>
        )}

        {metrics && activeTab === 'dashboard' && (
          <div className="space-y-8 max-w-6xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b-4 border-black/10 pb-4 border-dashed pt-12 md:pt-0">
              <div>
                <h2 className="text-4xl font-black text-black mb-1 relative inline-block">
                  گزارش نهایی پروژه
                  <span className="absolute -top-4 -left-4 text-3xl rotate-12">📊</span>
                </h2>
                <p className="text-gray-600 text-xl">این گزارش نهایی است و مقادیر ثابت هستند.</p>
              </div>
              <div className={`doodle-card px-6 py-3 ${metrics.npv > 0 ? 'bg-marker-green' : 'bg-marker-pink'}`}>
                <span className="font-bold text-xl text-black">
                  {metrics.npv > 0 ? '✅ اوضاع خوبه! (سودده)' : '⛔️ فرار کن! (زیان‌ده)'}
                </span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard 
                title="NPV (سود خالص)" 
                value={formatCurrency(metrics.npv)} 
                subValue={metrics.npv > 0 ? "مثبت (+)" : "منفی (-)"}
                icon={DollarSign}
                trend={metrics.npv > 0 ? 'up' : 'down'}
                colorClass="bg-marker-green"
              />
              <DashboardCard 
                title="IRR (نرخ بازده)" 
                value={`${metrics.irr.toFixed(2)}%`} 
                subValue={metrics.irr > (discountRate * 100) ? "بیشتر از انتظار" : "کمتر از انتظار"}
                icon={Percent}
                trend={metrics.irr > (discountRate * 100) ? 'up' : 'down'}
                colorClass="bg-marker-blue"
              />
              <DashboardCard 
                title="ارزش فعلی (PV)" 
                value={formatCurrency(metrics.totalPv)} 
                icon={TrendingUp}
                trend="up"
                colorClass="bg-marker-yellow"
              />
              <DashboardCard 
                title="ارزش آتی (FV)" 
                value={formatCurrency(metrics.totalFv)} 
                icon={Activity}
                colorClass="bg-marker-purple"
              />
            </div>

            {/* Charts Row - Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Chart 1: Cash Flow Timeline (Visual Timeline) */}
              <div className="doodle-card p-6 relative">
                <div className="absolute -top-3 -right-3 bg-white border-2 border-black px-3 py-1 rotate-2 shadow-[2px_2px_0px_0px_#000] z-10">
                   <h3 className="font-bold text-lg">تایم‌لاین جریان نقدی</h3>
                </div>
                <div className="h-[320px] w-full mt-4" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={tableData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="5 5" stroke="#000" strokeOpacity={0.1} vertical={false} />
                      <XAxis 
                        dataKey="year" 
                        stroke="#000" 
                        tick={{fontFamily: 'Vazirmatn', fontSize: 14}}
                        tickFormatter={(val) => val === 0 ? 'شروع (0)' : `سال ${val}`}
                      />
                      <YAxis stroke="#000" tick={{fontFamily: 'Vazirmatn', fontSize: 14}} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ backgroundColor: '#fff', border: '2px solid black', boxShadow: '4px 4px 0px 0px black', borderRadius: '8px', fontFamily: 'Vazirmatn' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <ReferenceLine y={0} stroke="#000" strokeWidth={2} />
                      {/* Using Bar for the timeline events */}
                      <Bar dataKey="cashFlow" name="جریان نقدی" barSize={40}>
                        {tableData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.cashFlow < 0 ? '#f9a8d4' : '#10b981'} 
                            stroke="#000" 
                            strokeWidth={2}
                          />
                        ))}
                      </Bar>
                      {/* Dashed line to connect tops/bottoms for visual flow */}
                      <Line type="monotone" dataKey="cashFlow" stroke="#000" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, fill: '#000', strokeWidth: 0}} activeDot={{r: 6}} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: IRR vs Discount Rate (Comparison) */}
              <div className="doodle-card p-6 relative">
                 <div className="absolute -top-3 -right-3 bg-white border-2 border-black px-3 py-1 -rotate-1 shadow-[2px_2px_0px_0px_#000] z-10">
                   <h3 className="font-bold text-lg">مسابقه بازدهی (IRR)</h3>
                </div>
                <div className="h-[320px] w-full mt-4 flex flex-col items-center justify-center" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={[
                        { name: 'نرخ مورد انتظار', value: discountRate * 100, fill: '#e5e7eb' },
                        { name: 'بازده واقعی (IRR)', value: metrics.irr, fill: '#67e8f9' }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                      <XAxis dataKey="name" stroke="#000" tick={{fontFamily: 'Vazirmatn', fontSize: 14, fontWeight: 'bold'}} />
                      <YAxis stroke="#000" tick={{fontFamily: 'Vazirmatn', fontSize: 14}} unit="%" />
                      <Tooltip 
                         cursor={{fill: 'transparent'}}
                         contentStyle={{ backgroundColor: '#fff', border: '2px solid black', boxShadow: '4px 4px 0px 0px black', borderRadius: '8px', fontFamily: 'Vazirmatn' }}
                         formatter={(value: number) => [`${value.toFixed(2)}%`, 'درصد']}
                      />
                      <Bar dataKey="value" stroke="#000" strokeWidth={2} radius={[8, 8, 0, 0]}>
                        {
                          [0, 1].map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === 0 ? '#d1d5db' : '#67e8f9'} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-center font-bold text-gray-500 mt-2">
                    چون IRR از نرخ تنزیل بیشتر است، پس صرفه اقتصادی دارد.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {/* Table View */}
        {metrics && activeTab === 'table' && (
          <div className="max-w-5xl mx-auto space-y-8 pt-12 md:pt-0">
            
             {/* Large Chart for PV vs FV Gap */}
             <div className="doodle-card p-6 relative">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rotate-1 shadow-[4px_4px_0px_0px_#fde047] z-10 rounded">
                   <h3 className="font-bold text-xl">تحلیل شکاف ارزش (PV vs FV)</h3>
                 </div>
                 <div className="h-[350px] w-full mt-8" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={tableData.filter(d => d.year > 0)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" strokeOpacity={0.1} />
                        <XAxis 
                          dataKey="year" 
                          stroke="#000" 
                          tick={{fontFamily: 'Vazirmatn', fontSize: 16}} 
                          tickFormatter={(val) => `سال ${val}`}
                        />
                        <YAxis stroke="#000" tick={{fontFamily: 'Vazirmatn', fontSize: 14}} />
                        <Tooltip 
                          cursor={{fill: '#000', opacity: 0.05}}
                          contentStyle={{ backgroundColor: '#fff', border: '2px solid black', boxShadow: '4px 4px 0px 0px black', borderRadius: '8px', fontFamily: 'Vazirmatn' }} 
                          formatter={(val: number, name: string) => [formatCurrency(val), name === 'pv' ? 'ارزش فعلی (PV)' : 'ارزش آتی (FV)']}
                        />
                        <Legend wrapperStyle={{ fontFamily: 'Vazirmatn', paddingTop: '10px' }} />
                        <Bar dataKey="pv" name="ارزش فعلی (PV)" fill="#fde047" stroke="#000" strokeWidth={2} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="fv" name="ارزش آتی (FV)" fill="#67e8f9" stroke="#000" strokeWidth={2} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <p className="text-center font-bold text-gray-600 mt-4 text-lg">
                   فاصله بین میله زرد و آبی، قدرتِ <span className="text-black bg-marker-pink px-1">سود مرکب</span> است!
                 </p>
             </div>

             {/* The Table */}
             <div className="doodle-card overflow-hidden">
                <div className="p-6 border-b-2 border-black bg-marker-blue/20 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">دفتر حساب و کتاب</h2>
                    <span className="text-lg font-bold">واحد: دلار ($)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-black text-white font-bold text-lg">
                      <tr>
                        <th className="px-6 py-4">سال</th>
                        <th className="px-6 py-4">پول تو جیب (جریان نقدی)</th>
                        <th className="px-6 py-4">ارزش الان (PV)</th>
                        <th className="px-6 py-4">ارزش آینده (FV)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black/10 font-bold text-lg">
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-marker-yellow/10 transition-colors">
                          <td className="px-6 py-4">{row.year === 0 ? 'شروع (سال ۰)' : row.year}</td>
                          <td className={`px-6 py-4 ${row.cashFlow < 0 ? 'text-red-600' : 'text-black'}`} dir="ltr">
                            {formatCurrency(row.cashFlow)}
                          </td>
                          <td className="px-6 py-4 text-emerald-700" dir="ltr">{formatCurrency(row.pv)}</td>
                          <td className="px-6 py-4 text-blue-700" dir="ltr">{formatCurrency(row.fv)}</td>
                        </tr>
                      ))}
                      <tr className="bg-marker-yellow border-t-4 border-black border-double">
                        <td className="px-6 py-4 font-bold text-xl">جمع کل</td>
                        <td className="px-6 py-4">-</td>
                        <td className="px-6 py-4 font-black" dir="ltr">{formatCurrency(metrics.npv)}</td>
                        <td className="px-6 py-4 font-black" dir="ltr">{formatCurrency(metrics.totalFv)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {/* AI Analysis View */}
        {activeTab === 'ai' && (
          <div className="max-w-3xl mx-auto space-y-8 pt-12 md:pt-0">
            <div className="doodle-card p-10 text-center bg-gradient-to-br from-marker-purple/30 to-marker-pink/30 relative overflow-hidden">
               {/* Background scribbles */}
               <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '30px 30px'}}></div>
              
              <div className="w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_0px_#000]">
                <BrainCircuit size={48} className="text-black" />
              </div>
              <h2 className="text-4xl font-black text-black mb-4">مشاور هوشمند (شوخ‌طبع)</h2>
              <p className="text-xl font-bold text-gray-800 mb-8 max-w-lg mx-auto">
                من داده‌های شما را تحلیل می‌کنم، ولی قول نمی‌دهم جدی باشم! 🤖
              </p>
              
              <button 
                onClick={triggerAiAnalysis}
                disabled={aiStatus === AnalysisStatus.LOADING}
                className="doodle-btn px-10 py-4 text-xl bg-marker-green rounded-full flex items-center gap-3 mx-auto disabled:opacity-50 disabled:shadow-none disabled:translate-y-1"
              >
                {aiStatus === AnalysisStatus.LOADING ? (
                  <>🤔 در حال فکر کردن...</>
                ) : (
                  <>✨ تحلیل کن ببینم!</>
                )}
              </button>
            </div>

            {aiStatus === AnalysisStatus.SUCCESS && (
              <div className="doodle-card p-8 bg-white relative">
                 <div className="absolute -top-4 left-10 bg-marker-yellow border-2 border-black px-4 py-1 rotate-[-2deg] shadow-[2px_2px_0px_0px_#000]">
                    <span className="font-bold">پاسخ هوش مصنوعی</span>
                 </div>
                <div className="prose prose-xl prose-p:font-bold prose-headings:font-black prose-strong:text-marker-blue prose-strong:bg-black prose-strong:px-1 max-w-none text-black leading-loose">
                  <Markdown>{aiAnalysis}</Markdown>
                </div>
              </div>
            )}
            
            {aiStatus === AnalysisStatus.ERROR && (
              <div className="doodle-card p-6 bg-red-100 border-red-500 text-red-900 text-center font-bold text-xl">
                ⚠️ ای وای! سیم‌هایم قاطی کرد. دوباره تلاش کن.
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;