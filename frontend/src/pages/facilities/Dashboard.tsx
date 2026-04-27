import React, { useEffect, useState } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getResources } from '../../api/resourceApi';
import { getAllBookings, getMyBookings, Booking } from '../../api/bookingApi';
import { Building2, AlertTriangle, CheckCircle2, Package, Calendar, Zap, ShieldCheck, Activity, Clock, MapPin, FileText, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, maintenance: 0, outOfService: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [topResourcesData, setTopResourcesData] = useState<Array<{ name: string; bookings: number; confirmed: number }>>([]);
  const [peakHoursData, setPeakHoursData] = useState<Array<{ hour: string; bookings: number }>>([]);
  const [peakHourLabel, setPeakHourLabel] = useState('N/A');

  // User-specific state
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [userStats, setUserStats] = useState({ pending: 0, approved: 0, rejected: 0, cancelled: 0, total: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load resources for both views
        const resourceData = await getResources(0, 500);
        const resources = resourceData.content || [];

        setStats({
          total: resources.length,
          active: resources.filter((r) => r.status === 'ACTIVE').length,
          maintenance: resources.filter((r) => r.status === 'MAINTENANCE').length,
          outOfService: resources.filter((r) => r.status === 'OUT_OF_SERVICE').length,
        });

        if (isAdmin) {
          // Admin: load all bookings for charts
          const bookingsData = await getAllBookings().catch(() => []);

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
          setChartData(processedData.length > 0 ? processedData : [{ date: new Date().toISOString().split('T')[0], bookings: 0 }]);

          const usageByResource: Record<string, { bookings: number; confirmed: number }> = {};
          const usageByHour: Record<number, number> = {};

          bookingsData.forEach((booking) => {
            const resourceKey = booking.resourceName?.trim() || `Resource ${booking.resourceId}`;
            if (!usageByResource[resourceKey]) usageByResource[resourceKey] = { bookings: 0, confirmed: 0 };
            usageByResource[resourceKey].bookings += 1;

            const status = (booking.status || '').toUpperCase();
            if (status === 'APPROVED' || status === 'CHECKED_IN') {
              usageByResource[resourceKey].confirmed += 1;
            }

            if (booking.startTime) {
              const hour = Number(booking.startTime.split(':')[0]);
              if (!Number.isNaN(hour) && hour >= 0 && hour <= 23) {
                usageByHour[hour] = (usageByHour[hour] || 0) + 1;
              }
            }
          });

          const rankedResources = Object.entries(usageByResource)
            .map(([name, data]) => ({ name, bookings: data.bookings, confirmed: data.confirmed }))
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 5);
          setTopResourcesData(
            rankedResources.length > 0 ? rankedResources : [{ name: 'No booking data yet', bookings: 0, confirmed: 0 }]
          );

          const formatHourLabel = (hour: number) => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const normalized = hour % 12 || 12;
            return `${normalized} ${period}`;
          };

          const peakSeries = Array.from({ length: 24 }, (_, hour) => ({
            hour: formatHourLabel(hour),
            bookings: usageByHour[hour] || 0,
          }));
          setPeakHoursData(peakSeries);

          const peakHour = Object.entries(usageByHour)
            .map(([hour, count]) => ({ hour: Number(hour), count }))
            .sort((a, b) => b.count - a.count)[0];
          setPeakHourLabel(peakHour ? `${formatHourLabel(peakHour.hour)} (${peakHour.count})` : 'N/A');

        } else {
          // User: load personal bookings
          if (user?.id) {
            const myBookings = await getMyBookings(Number(user.id)).catch(() => []);
            setUserBookings(myBookings);
            setUserStats({
              pending: myBookings.filter(b => b.status === 'PENDING').length,
              approved: myBookings.filter(b => b.status === 'APPROVED').length,
              rejected: myBookings.filter(b => b.status === 'REJECTED').length,
              cancelled: myBookings.filter(b => b.status === 'CANCELLED').length,
              total: myBookings.length,
            });
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAdmin, user?.id]);

  if (loading) return <div className="p-10 min-h-[60vh] flex flex-col items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div><p className="text-slate-500 font-bold animate-pulse">Initializing Hub...</p></div>;

  const systemHealth = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 100;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
      });
    } catch { return dateStr; }
  };

  const formatTime = (timeStr: string) => {
    try {
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${m} ${ampm}`;
    } catch { return timeStr; }
  };

  const statusStyles: Record<string, string> = {
    APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
    REJECTED: 'bg-red-50 text-red-600 border-red-200',
    CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  // Get upcoming bookings (approved or pending, sorted by date)
  const upcomingBookings = userBookings
    .filter(b => b.status === 'PENDING' || b.status === 'APPROVED')
    .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
    .slice(0, 5);

  // Get recent activity (last 5 bookings by creation)
  const recentActivity = [...userBookings]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 5);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in-up">

      {/* Header Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-10 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:gap-0 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            {isAdmin ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest">
                <Activity size={14} /> Admin View
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest">
                <Activity size={14} /> Student / Staff View
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {isAdmin ? 'Operations control center' : `Welcome back, ${user?.email?.split('@')[0] || 'User'}`}
              </h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                {isAdmin
                  ? 'Monitor asset health, bookings, and maintenance at a glance. Keep the platform stable and act quickly when something drifts.'
                  : 'Discover available campus facilities, make reservations for your events or study sessions, and track your booking status.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/app/facilities/resources" className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold hover:bg-slate-100 transition">View resources</Link>
              {isAdmin ? (
                <>
                  <Link to="/app/facilities/resources/add" className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
                    <Zap size={16} /> Register facility
                  </Link>
                  <Link to="/app/facilities/bookings/manage" className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold flex items-center gap-2 hover:bg-slate-800 transition">
                    <Calendar size={16} /> Manage bookings
                  </Link>
                </>
              ) : (
                <Link to="/app/facilities/bookings/my" className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
                  <Calendar size={16} /> My reservations
                </Link>
              )}
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

      {/* ========== ADMIN VIEW ========== */}
      {isAdmin && (
        <>
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-2 tracking-tight">Infrastructure Overview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors group">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Package size={20} /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Assets</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.total}</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CheckCircle2 size={20} /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active / Ready</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.active}</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-amber-200 transition-colors group">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><AlertTriangle size={20} /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Maintenance</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.maintenance}</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-red-200 transition-colors group">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><ShieldCheck size={20} /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Out of Service</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.outOfService}</h3>
            </div>
          </div>

          {/* Admin Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

          {/* Usage Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-[430px] flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm flex items-center gap-2 font-bold text-slate-800 uppercase tracking-widest">
                  <Building2 size={16} className="text-blue-500" /> Top Resources (Usage)
                </h4>
              </div>
              <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topResourcesData} layout="vertical" margin={{ top: 8, right: 8, left: 20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '14px', fontSize: '13px', fontWeight: '600', color: '#64748b' }} />
                    <Bar name="Bookings" dataKey="bookings" fill="#2563eb" radius={[0, 8, 8, 0]} />
                    <Bar name="Approved / Checked-in" dataKey="confirmed" fill="#6366f1" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-[430px] flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm flex items-center gap-2 font-bold text-slate-800 uppercase tracking-widest">
                  <Clock size={16} className="text-indigo-500" /> Peak Booking Hours
                </h4>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  Hotspot: {peakHourLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Most Active Slot</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{peakHourLabel}</p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">Tracked Window</p>
                  <p className="text-lg font-black text-slate-800 mt-1">24h pattern</p>
                </div>
              </div>

              <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={peakHoursData}>
                    <defs>
                      <linearGradient id="peakHoursColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#peakHoursColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== USER VIEW ========== */}
      {!isAdmin && (
        <>
          {/* User Booking Stats */}
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-2 tracking-tight">My Booking Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors group">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Package size={20} /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bookings</p>
              <h3 className="text-3xl font-black text-slate-800">{userStats.total}</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-amber-200 transition-colors group">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Clock size={20} /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending</p>
              <h3 className="text-3xl font-black text-slate-800">{userStats.pending}</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CheckCircle2 size={20} /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Approved</p>
              <h3 className="text-3xl font-black text-slate-800">{userStats.approved}</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-red-200 transition-colors group">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><XCircle size={20} /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rejected</p>
              <h3 className="text-3xl font-black text-slate-800">{userStats.rejected}</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-slate-300 transition-colors group">
              <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><ShieldCheck size={20} /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cancelled</p>
              <h3 className="text-3xl font-black text-slate-800">{userStats.cancelled}</h3>
            </div>
          </div>

          {/* Two-column: Upcoming + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm flex items-center gap-2 font-bold text-slate-800 uppercase tracking-widest">
                  <Calendar size={16} className="text-blue-500" /> Upcoming Reservations
                </h4>
                <Link to="/app/facilities/bookings/my" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition">View All →</Link>
              </div>

              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={28} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-semibold">No upcoming reservations</p>
                  <p className="text-slate-400 text-sm mt-1">Book a facility to see it here.</p>
                  <Link to="/app/facilities/resources" className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
                    Browse Resources
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-800 text-sm truncate">{booking.resourceName || `Resource ${booking.resourceId}`}</h5>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(booking.bookingDate)}</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                        </div>
                        {booking.resourceLocation && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <MapPin size={11} /> {booking.resourceLocation}
                          </div>
                        )}
                      </div>
                      <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${statusStyles[booking.status || ''] || statusStyles.CANCELLED}`}>
                        {booking.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm flex items-center gap-2 font-bold text-slate-800 uppercase tracking-widest">
                  <FileText size={16} className="text-indigo-500" /> Recent Activity
                </h4>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-semibold">No booking activity yet</p>
                  <p className="text-slate-400 text-sm mt-1">Your booking history will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((booking) => (
                    <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                        booking.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                        booking.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                        'bg-slate-200 text-slate-500'
                      }`}>
                        {booking.status === 'APPROVED' ? <CheckCircle2 size={18} /> :
                         booking.status === 'PENDING' ? <Clock size={18} /> :
                         booking.status === 'REJECTED' ? <XCircle size={18} /> :
                         <ShieldCheck size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-800 text-sm truncate">{booking.resourceName || `Resource ${booking.resourceId}`}</h5>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {booking.purpose || 'No purpose specified'} · {formatDate(booking.bookingDate)}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${statusStyles[booking.status || ''] || statusStyles.CANCELLED}`}>
                        {booking.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Resources Count */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Ready to book?</h3>
                <p className="text-blue-100 mt-1">{stats.active} facilities are currently available for reservation.</p>
              </div>
              <Link to="/app/facilities/resources" className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-sm text-center">
                Browse Available Resources
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
