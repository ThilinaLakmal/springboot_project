import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getMyBookings, cancelBooking } from '../../api/bookingApi';
import { Booking } from '../../api/bookingApi';
import { Calendar, Clock, XCircle, FileText, Users, MapPin, Tag, MessageSquare, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const;

const statusStyles: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const { user } = useAuth();
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentId = user?.id ?? null;
    if (lastUserIdRef.current === currentId) return;
    lastUserIdRef.current = currentId;
    fetchBookings();
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    if (!user?.id) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const statusFilter = activeTab !== 'ALL' ? activeTab : undefined;
      const data = await getMyBookings(Number(user.id), statusFilter);
      setBookings(data);
    } catch (err) {
      const friendlyMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || `Failed to load your reservations (${err.response?.status || 'network error'}).`
        : 'Failed to load your reservations.';
      toast.error(friendlyMessage, { id: 'load-reservations' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(id);
        toast.success('Booking cancelled successfully.');
        fetchBookings();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to cancel booking.');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
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

  if (loading) return <div className="p-12 text-center text-slate-500 font-semibold animate-pulse">Loading Reservations...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">My Reservations</h2>
        <p className="text-slate-500 mt-1">Track and manage your campus facility bookings.</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={16} className="text-slate-400" />
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === tab
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
         <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {activeTab === 'ALL' ? 'No active bookings' : `No ${activeTab.toLowerCase()} bookings`}
            </h3>
            <p className="text-slate-500">
              {activeTab === 'ALL'
                ? "You haven't made any resource reservations yet."
                : `You don't have any bookings with ${activeTab.toLowerCase()} status.`}
            </p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                 <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Booking #{booking.id}</div>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{booking.resourceName || `Resource ${booking.resourceId}`}</h3>
                    {booking.resourceType && (
                      <div className="flex items-center gap-1 mt-1">
                        <Tag size={12} className="text-indigo-400" />
                        <span className="text-xs text-indigo-500 font-medium">{booking.resourceType}</span>
                      </div>
                    )}
                 </div>
                 <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusStyles[booking.status || ''] || statusStyles.CANCELLED}`}>
                    {booking.status}
                 </div>
              </div>
              
              <div className="p-5 flex-1 space-y-3 text-sm">
                 <div className="flex items-start gap-3 text-slate-600">
                    <Calendar size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-semibold text-slate-700">Date</span>
                      <span>{formatDate(booking.bookingDate)}</span>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 text-slate-600">
                    <Clock size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-semibold text-slate-700">Time</span>
                      <span>{formatTime(booking.startTime)} — {formatTime(booking.endTime)}</span>
                    </div>
                 </div>
                 {booking.resourceLocation && (
                   <div className="flex items-start gap-3 text-slate-600">
                      <MapPin size={16} className="text-rose-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="block font-semibold text-slate-700">Location</span>
                        <span>{booking.resourceLocation}</span>
                      </div>
                   </div>
                 )}
                 {booking.expectedAttendees && (
                   <div className="flex items-start gap-3 text-slate-600">
                      <Users size={16} className="text-teal-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="block font-semibold text-slate-700">Expected Attendees</span>
                        <span>{booking.expectedAttendees} people</span>
                      </div>
                   </div>
                 )}
                 <div className="flex items-start gap-3 text-slate-600">
                    <FileText size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="block font-semibold text-slate-700">Purpose</span>
                      <p className="line-clamp-2 italic text-slate-500">{booking.purpose || 'No purpose specified'}</p>
                    </div>
                 </div>

                 {/* Admin Reason (shown for approved/rejected bookings) */}
                 {booking.adminReason && (booking.status === 'APPROVED' || booking.status === 'REJECTED') && (
                   <div className="flex items-start gap-3 text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <MessageSquare size={16} className={`mt-0.5 shrink-0 ${booking.status === 'APPROVED' ? 'text-emerald-500' : 'text-red-500'}`} />
                      <div className="flex-1">
                        <span className="block font-semibold text-slate-700 text-xs uppercase tracking-wider">Admin Remark</span>
                        <p className="text-slate-600 text-sm mt-0.5">{booking.adminReason}</p>
                      </div>
                   </div>
                 )}
              </div>

              {/* Cancel Button - only for PENDING or APPROVED */}
              {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                 <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button onClick={() => booking.id && handleCancel(booking.id)} className="w-full py-2 flex items-center justify-center gap-2 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors">
                       <XCircle size={18} /> Cancel Booking
                    </button>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
