import React, { useEffect, useState } from 'react';
import { getAllBookings, approveBooking, rejectBooking } from '../../api/bookingApi';
import { Booking } from '../../api/bookingApi';
import { Calendar, Clock, User, Check, X, ShieldAlert, Filter, Users, MessageSquare, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_IN'] as const;

const statusStyles: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  CHECKED_IN: 'bg-blue-50 text-blue-600 border-blue-200',
};

export const ManageBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectBookingId, setRejectBookingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Approve modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveBookingId, setApproveBookingId] = useState<number | null>(null);
  const [approveReason, setApproveReason] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);

  // Detail panel state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab !== 'ALL' ? activeTab : undefined;
      const data = await getAllBookings(statusFilter);
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (id: number) => {
    setApproveBookingId(id);
    setApproveReason('');
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (approveBookingId === null) return;
    try {
      setApproveLoading(true);
      await approveBooking(approveBookingId, approveReason || undefined);
      toast.success('Booking approved successfully.');
      setApproveModalOpen(false);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve booking.');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRejectClick = (id: number) => {
    setRejectBookingId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (rejectBookingId === null) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    try {
      setRejectLoading(true);
      await rejectBooking(rejectBookingId, rejectReason);
      toast.success('Booking rejected successfully.');
      setRejectModalOpen(false);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reject booking.');
    } finally {
      setRejectLoading(false);
    }
  };

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

  if (loading) return <div className="p-12 text-center animate-pulse text-slate-500 font-semibold text-lg">Loading Admin Booking Terminal...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
           <ShieldAlert size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Booking Moderation Grid</h2>
          <p className="text-slate-500 mt-1">Review, approve, and resolve facility reservation requests.</p>
        </div>
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
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200'
                : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const).map((status) => {
          const count = bookings.filter(b => b.status === status).length;
          const colors: Record<string, string> = {
            PENDING: 'text-amber-600 bg-amber-50 border-amber-200',
            APPROVED: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            REJECTED: 'text-red-600 bg-red-50 border-red-200',
            CANCELLED: 'text-slate-500 bg-slate-50 border-slate-200',
          };
          return (
            <div key={status} className={`rounded-xl border p-4 text-center ${colors[status]}`}>
              <div className="text-2xl font-black">{activeTab === 'ALL' ? count : (activeTab === status ? count : '—')}</div>
              <div className="text-xs font-bold uppercase tracking-wider mt-1">{status}</div>
            </div>
          );
        })}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="py-4 px-6">ID / User</th>
              <th className="py-4 px-6">Resource & Time</th>
              <th className="py-4 px-6">Details</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.length === 0 ? (
               <tr><td colSpan={5} className="py-12 text-center text-slate-500 font-medium tracking-wide">
                 {activeTab === 'ALL' ? 'No booking requests found in the system.' : `No ${activeTab.toLowerCase()} bookings found.`}
               </td></tr>
            ) : bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}>
                <td className="py-4 px-6">
                  <span className="text-xs text-slate-400 font-mono pr-2">#{booking.id}</span>
                  <div className="font-bold text-slate-800 flex items-center gap-2 mt-1">
                     <User size={14} className="text-slate-400" />
                     {booking.userName || `User ${booking.userId}`}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-700">{booking.resourceName || `Resource ${booking.resourceId}`}</div>
                  {booking.resourceLocation && (
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {booking.resourceLocation}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                     <Calendar size={12} /> {formatDate(booking.bookingDate)} 
                     <span className="mx-1">•</span>
                     <Clock size={12} /> {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-slate-600 text-xs italic max-w-xs truncate" title={booking.purpose}>{booking.purpose || '—'}</div>
                  {booking.expectedAttendees && (
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Users size={10} /> {booking.expectedAttendees} attendees
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusStyles[booking.status || ''] || statusStyles.CANCELLED}`}>
                     {booking.status}
                  </span>
                  {booking.adminReason && (
                    <div className="text-xs text-slate-400 italic mt-1.5 max-w-[120px] truncate" title={booking.adminReason}>
                      "{booking.adminReason}"
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                   {booking.status === 'PENDING' ? (
                     <div className="flex justify-end gap-2">
                       <button onClick={() => booking.id && handleApproveClick(booking.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200" title="Approve">
                          <Check size={18} />
                       </button>
                       <button onClick={() => booking.id && handleRejectClick(booking.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Reject">
                          <X size={18} />
                       </button>
                     </div>
                   ) : (
                      <span className="text-xs text-slate-400 font-medium">Processed</span>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel (below table when a row is clicked) */}
      {selectedBooking && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Booking #{selectedBooking.id} — Details</h3>
              <p className="text-sm text-slate-500">Full information about this reservation request.</p>
            </div>
            <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Resource</div>
              <div className="font-bold text-slate-800">{selectedBooking.resourceName}</div>
              {selectedBooking.resourceType && <div className="text-xs text-indigo-500 mt-0.5">{selectedBooking.resourceType}</div>}
              {selectedBooking.resourceLocation && (
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={10} /> {selectedBooking.resourceLocation}</div>
              )}
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Schedule</div>
              <div className="font-semibold text-slate-800">{formatDate(selectedBooking.bookingDate)}</div>
              <div className="text-sm text-slate-600">{formatTime(selectedBooking.startTime)} — {formatTime(selectedBooking.endTime)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Requested By</div>
              <div className="font-semibold text-slate-800">{selectedBooking.userName}</div>
              {selectedBooking.expectedAttendees && <div className="text-sm text-slate-500">{selectedBooking.expectedAttendees} expected attendees</div>}
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 md:col-span-2 lg:col-span-3">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Purpose</div>
              <div className="text-slate-700">{selectedBooking.purpose || 'No purpose specified'}</div>
            </div>
            {selectedBooking.adminReason && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 md:col-span-2 lg:col-span-3">
                <div className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><MessageSquare size={12} /> Admin Remark</div>
                <div className="text-blue-800">{selectedBooking.adminReason}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Check size={20} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Approve Booking</h3>
              </div>
              <button onClick={() => setApproveModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Reason (Optional)</label>
                <textarea
                  rows={3}
                  value={approveReason}
                  onChange={(e) => setApproveReason(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Optionally provide a note for the user..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setApproveModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold">Cancel</button>
                <button onClick={handleApproveConfirm} disabled={approveLoading} className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-70 transition-colors">
                  {approveLoading ? 'Processing...' : 'Confirm Approval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <X size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Reject Booking</h3>
              </div>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Reason for Rejection <span className="text-red-500">*</span></label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Please explain why this booking request is being rejected..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setRejectModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold">Cancel</button>
                <button onClick={handleRejectConfirm} disabled={rejectLoading || !rejectReason.trim()} className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold flex items-center gap-2 hover:bg-red-700 disabled:opacity-70 transition-colors">
                  {rejectLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
