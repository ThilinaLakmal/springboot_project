import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getBookingsByResource, Booking } from '../../api/bookingApi';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  purpose?: string;
  userName?: string;
}

interface Props {
  resourceId: number;
  resourceName?: string;
  availableFrom?: string; // e.g. "08:00"
  availableTo?: string;   // e.g. "20:00"
  onSlotSelect?: (slotInfo: { date: string; startTime: string; endTime: string }) => void;
}

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  APPROVED: { bg: '#dcfce7', border: '#22c55e', text: '#15803d' },
  PENDING: { bg: '#fef9c3', border: '#eab308', text: '#a16207' },
  REJECTED: { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c' },
  CANCELLED: { bg: '#f1f5f9', border: '#94a3b8', text: '#64748b' },
};

export const ResourceAvailabilityCalendar: React.FC<Props> = ({ 
  resourceId, resourceName, availableFrom, availableTo, onSlotSelect 
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getBookingsByResource(resourceId);
        setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings for calendar', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [resourceId]);

  // Convert bookings to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return bookings
      .filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED')
      .map(b => {
        const dateStr = typeof b.bookingDate === 'string' ? b.bookingDate : '';
        const start = new Date(`${dateStr}T${b.startTime}`);
        const end = new Date(`${dateStr}T${b.endTime}`);
        return {
          id: b.id || 0,
          title: `${b.status === 'APPROVED' ? '🔴' : '🟡'} ${b.purpose || 'Reserved'}`,
          start,
          end,
          status: b.status || 'PENDING',
          purpose: b.purpose,
          userName: b.userName,
        };
      });
  }, [bookings]);

  // Custom event styling
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const colors = statusColors[event.status] || statusColors.PENDING;
    return {
      style: {
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.border}`,
        color: colors.text,
        borderRadius: '8px',
        padding: '2px 8px',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      },
    };
  }, []);

  // Parse availability hours
  const minTime = useMemo(() => {
    if (availableFrom) {
      const [h, m] = availableFrom.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    return d;
  }, [availableFrom]);

  const maxTime = useMemo(() => {
    if (availableTo) {
      const [h, m] = availableTo.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }
    const d = new Date();
    d.setHours(21, 0, 0, 0);
    return d;
  }, [availableTo]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    if (onSlotSelect) {
      const date = format(slotInfo.start, 'yyyy-MM-dd');
      const startTime = format(slotInfo.start, 'HH:mm');
      const endTime = format(slotInfo.end, 'HH:mm');
      onSlotSelect({ date, startTime, endTime });
    }
  }, [onSlotSelect]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-500 font-medium">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-slate-600 font-medium">Booked (Approved)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="text-slate-600 font-medium">Pending Approval</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
          <span className="text-slate-600 font-medium">Available (Open Slots)</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white" style={{ minHeight: '520px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={[Views.WEEK, Views.DAY, Views.MONTH]}
          defaultView={Views.WEEK}
          min={minTime}
          max={maxTime}
          step={30}
          timeslots={2}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(event) => setSelectedEvent(event as CalendarEvent)}
          eventPropGetter={eventStyleGetter}
          style={{ height: 520 }}
          popup
          formats={{
            timeGutterFormat: (date: Date) => format(date, 'h:mm a'),
            eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
              `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`,
          }}
        />
      </div>

      {/* Event Detail Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-slate-800">Booking Details</h4>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 transition">
                <XCircle size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {selectedEvent.status === 'APPROVED' ? (
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><CheckCircle2 size={20} className="text-emerald-600" /></div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><Clock size={20} className="text-amber-600" /></div>
                )}
                <div>
                  <p className="font-bold text-slate-800">{selectedEvent.status}</p>
                  <p className="text-xs text-slate-500">{resourceName || 'Resource'}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-semibold text-slate-800">{format(selectedEvent.start, 'EEE, MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Time</span>
                  <span className="font-semibold text-slate-800">{format(selectedEvent.start, 'h:mm a')} – {format(selectedEvent.end, 'h:mm a')}</span>
                </div>
                {selectedEvent.userName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Booked by</span>
                    <span className="font-semibold text-slate-800">{selectedEvent.userName}</span>
                  </div>
                )}
                {selectedEvent.purpose && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Purpose</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[200px]">{selectedEvent.purpose}</span>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setSelectedEvent(null)} className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition">Close</button>
          </div>
        </div>
      )}

      {/* Custom CSS overrides */}
      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          background: #f8fafc;
          padding: 10px 8px;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
        }
        .rbc-time-header-cell .rbc-header {
          border-bottom: none;
        }
        .rbc-today {
          background-color: #eff6ff !important;
        }
        .rbc-toolbar {
          padding: 12px 16px;
          gap: 8px;
          flex-wrap: wrap;
        }
        .rbc-toolbar button {
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 6px 14px;
          font-weight: 600;
          font-size: 13px;
          color: #475569;
          transition: all 0.15s;
        }
        .rbc-toolbar button:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .rbc-toolbar button.rbc-active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .rbc-toolbar .rbc-toolbar-label {
          font-weight: 800;
          font-size: 16px;
          color: #1e293b;
        }
        .rbc-time-slot {
          border-top: 1px solid #f1f5f9;
        }
        .rbc-timeslot-group {
          min-height: 50px;
        }
        .rbc-current-time-indicator {
          background-color: #3b82f6;
          height: 2px;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top-color: #f1f5f9;
        }
        .rbc-time-content {
          border-top: 2px solid #e2e8f0;
        }
        .rbc-allday-cell {
          display: none;
        }
        .rbc-time-view .rbc-allday-cell + .rbc-time-content {
          border-top: 2px solid #e2e8f0;
        }
        .rbc-event {
          border: none !important;
        }
        .rbc-event-label {
          font-size: 10px;
          font-weight: 600;
        }
        .rbc-show-more {
          color: #3b82f6;
          font-weight: 700;
          font-size: 12px;
        }
        .rbc-off-range-bg {
          background: #fafafa;
        }
        .rbc-date-cell {
          padding: 4px 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .rbc-date-cell.rbc-now {
          font-weight: 800;
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
};
