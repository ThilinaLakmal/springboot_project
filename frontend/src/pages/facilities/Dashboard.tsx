import React, { useEffect, useState } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getResources } from '../../api/resourceApi';
import { getAllBookings } from '../../api/bookingApi';
import { Building2, AlertTriangle, CheckCircle2, Package, Calendar, Zap, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, maintenance: 0, outOfService: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getResources(0, 500),
      getAllBookings().catch(() => []) 
    ])
    .then(([resourceData, bookingsData]) => {
      const resources = resourceData.content || [];
      
      setStats({
        total: resources.length, 
        active: resources.filter((r) => r.status === 'ACTIVE').length,
        maintenance: resources.filter((r) => r.status === 'MAINTENANCE').length,
        outOfService: resources.filter((r) => r.status === 'OUT_OF_SERVICE').length,
      });

      const dist: Record<string, { active: number, maint: number }> = {};
      resources.forEach(r => {
         const type = r.type || 'Other';
         if (!dist[type]) dist[type] = { active: 0, maint: 0 };
         if (r.status === 'ACTIVE') dist[type].active += 1;
         else dist[type].maint += 1;
      });
      const processedDist = Object.entries(dist).map(([k, v]) => ({ name: k, active: v.active, maintenance: v.maint }));
      setDistributionData(processedDist.length > 0 ? processedDist : [
         { name: 'Lecture Halls', active: 0, maintenance: 0 },
         { name: 'Laboratories', active: 0, maintenance: 0 },
         { name: 'Libraries', active: 0, maintenance: 0 },
         { name: 'Sports', active: 0, maintenance: 0 }
      ]);

      const bookingsByDate: Record<string, number> = {};
      bookingsData.forEach(b => {
         const date = b.bookingDate;
         if (date) {
            bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
         }
      });

      const processedData = Object.entries(bookingsByDate)
         .map(([date, count]) => ({ date, bookings: count }))
         .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
         .slice(-7); 

      if (processedData.length === 0) {
         setChartData([{ date: new Date().toISOString().split('T')[0], bookings: 0 }]);
      } else {
         setChartData(processedData);
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Failed to load dashboard metrics');
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 min-h-[60vh] flex flex-col items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div><p className="text-slate-500 font-bold animate-pulse">Initializing Hub...</p></div>;

  const systemHealth = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 100;

   return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in-up">

         {/* Admin Control Header */}
         <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-10 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:gap-0 md:flex-row md:items-center md:justify-between">
               <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest">
                     <Activity size={14} /> Admin View
                  </div>
                  <div>
                     <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Operations control center</h1>
                     <p className="text-slate-600 mt-2 max-w-2xl">Monitor asset health, bookings, and maintenance at a glance. Keep the platform stable and act quickly when something drifts.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                     <Link to="/app/facilities/resources" className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold hover:bg-slate-100 transition">View resources</Link>
                     <Link to="/app/facilities/resources/add" className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
                        <Zap size={16} /> Register facility
                     </Link>
                     <Link to="/app/facilities/bookings" className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold flex items-center gap-2 hover:bg-slate-800 transition">
                        <Calendar size={16} /> Manage bookings
                     </Link>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="relative w-28 h-28">
                     <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className={`${systemHealth >= 90 ? 'text-emerald-500' : systemHealth >= 70 ? 'text-blue-500' : 'text-amber-500'}`} strokeDasharray={`${systemHealth}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900">{systemHealth}%</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">Health</span>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                     <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 size={16} className="text-emerald-500" /> {stats.active} active</div>
                     <div className="flex items-center gap-2 text-sm text-slate-600"><AlertTriangle size={16} className="text-amber-500" /> {stats.maintenance} in maintenance</div>
                     <div className="flex items-center gap-2 text-sm text-slate-600"><ShieldCheck size={16} className="text-red-500" /> {stats.outOfService} out of service</div>
                  </div>
               </div>
            </div>
         </div>

      {/* Quick Metrics Grid */}
      <h3 className="text-lg font-bold text-slate-800 mb-4 px-2 tracking-tight">Infrastructure Overview</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors group">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package size={20} />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Assets</p>
          <h3 className="text-3xl font-black text-slate-800">{stats.total}</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active / Ready</p>
          <h3 className="text-3xl font-black text-slate-800">{stats.active}</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-amber-200 transition-colors group">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <AlertTriangle size={20} />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Maintenance</p>
          <h3 className="text-3xl font-black text-slate-800">{stats.maintenance}</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-red-200 transition-colors group">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck size={20} />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Out of Service</p>
          <h3 className="text-3xl font-black text-slate-800">{stats.outOfService}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Chart 1: Distribution */}
         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-[420px] flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-8">
               <h4 className="text-sm flex items-center gap-2 font-bold text-slate-800 uppercase tracking-widest">
                  <Building2 size={16} className="text-blue-500" /> Resource Distribution
               </h4>
            </div>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: '600', color: '#64748b' }} />
                  <Bar name="Active" dataKey="active" stackId="a" fill="#10b981" radius={[0, 0, 8, 8]} />
                  <Bar name="Maintenance" dataKey="maintenance" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Chart 2: Bookings Activity */}
         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-[420px] flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-8">
               <h4 className="text-sm flex items-center gap-2 font-bold text-slate-800 uppercase tracking-widest">
                  <Calendar size={16} className="text-indigo-500" /> Booking Activity (7 Days)
               </h4>
            </div>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                  <Area type="monotone" name="New Bookings" dataKey="bookings" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorBookings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};
