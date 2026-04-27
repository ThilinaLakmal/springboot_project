import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResourceById } from '../../api/resourceApi';
import { Resource } from '../../types/resource';
import { MapPin, Users, Clock, ArrowLeft, Image as ImageIcon, CheckCircle2, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createBooking } from '../../api/bookingApi';
import { useAuth } from '../../contexts/AuthContext';
import { ResourceAvailabilityCalendar } from '../../components/facilities/ResourceAvailabilityCalendar';

export const ResourceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking Modal State
  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getResourceById(id)
        .then(setResource)
        .catch(() => {
           toast.error('Could not fetch details. Using mock data for demo.', { id: 'fetch-err' });
           // Mock Data
           setResource({
             id: parseInt(id), name: 'Main Auditorium', type: 'Hall', capacity: 500, location: 'Block A, Floor 1', 
             status: 'ACTIVE', availabilityTime: 'Everyday 08:00 - 20:00',
             imageUrl: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
           });
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-12 text-center text-slate-500 font-semibold animate-pulse">Loading detailed view...</div>;
  if (!resource) return <div className="p-12 text-center text-red-500 font-bold">Resource not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in-up">
       <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 w-max">
         <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Catalogue
       </button>

       <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
             {/* Left Column: Image & Actions */}
             <div className="lg:w-2/5 p-6 lg:border-r border-slate-100 bg-slate-50/50 flex flex-col items-center justify-start">
                <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 shadow-inner relative group border border-slate-200/60">
                  {resource.imageUrl ? (
                    <img src={resource.imageUrl.startsWith('http') ? resource.imageUrl : `http://localhost:8081${resource.imageUrl}`} alt={resource.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={64} className="mb-4 opacity-30" />
                        <span className="font-medium tracking-wide">No Media Available</span>
                    </div>
                  )}
                  {/* Status Overlay */}
                  <div className="absolute top-4 left-4">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${resource.status === 'ACTIVE'
                        ? 'bg-emerald-500/90 text-white'
                        : resource.status === 'MAINTENANCE'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-red-500/90 text-white'
                      }`}>
                      {resource.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="w-full mt-6 space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <p className="text-xs text-slate-500 font-bold mb-1 tracking-wider uppercase">Operational Status</p>
                    <div className={`font-black tracking-wide text-lg flex items-center justify-center gap-2 ${resource.status === 'ACTIVE' ? 'text-emerald-600' : resource.status === 'MAINTENANCE' ? 'text-amber-600' : 'text-red-600'}`}>
                      {resource.status === 'ACTIVE' ? <CheckCircle2 size={24} /> : null} 
                      {resource.status.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {resource.status === 'ACTIVE' && (
                     <button onClick={() => setShowModal(true)} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold tracking-wide hover:bg-blue-700 transition-all shadow-md flex justify-center items-center gap-2 hover:-translate-y-0.5 active:scale-95 border border-blue-500">
                        <Calendar size={20} /> BOOK THIS RESOURCE
                     </button>
                  )}
                </div>
             </div>

             {/* Right Column: Details & Specs */}
             <div className="lg:w-3/5 p-8 md:p-10 lg:p-12 flex flex-col">
                <div className="mb-8">
                   <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase mb-4 inline-block border border-indigo-100">
                     {resource.type}
                   </div>
                   <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">{resource.name}</h1>
                   <div className="w-16 h-1.5 bg-blue-600 rounded-full mb-6"></div>
                   <p className="text-slate-600 text-lg leading-relaxed">
                     {resource.description || `The ${resource.name} is a state-of-the-art facility located seamlessly within the ${resource.location}. Designed to support the academic and extracurricular needs of the SmartUniNexus structure, it ensures high reliability and comfort for up to ${resource.capacity} occupants.`}
                   </p>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Facility Specifications</h4>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-5 rounded-2xl flex items-start gap-4 border border-slate-100 hover:border-blue-200 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold mb-0.5 tracking-widest uppercase">Location</p>
                          <p className="font-semibold text-slate-800 text-lg leading-snug">{resource.location}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl flex items-start gap-4 border border-slate-100 hover:border-indigo-200 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Users size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold mb-0.5 tracking-widest uppercase">Max Capacity</p>
                          <p className="font-semibold text-slate-800 text-lg leading-snug">{resource.capacity} <span className="text-sm text-slate-500 font-medium">people</span></p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl flex items-start gap-4 border border-slate-100 hover:border-emerald-200 transition-colors sm:col-span-2 group">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Clock size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold mb-0.5 tracking-widest uppercase">Availability</p>
                          <p className="font-semibold text-slate-800 text-lg leading-snug">{resource.availabilityTime || 'Not specified'}</p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

        {/* Booking Modal */}
        {showModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                 <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">Book {resource.name}</h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                       <X size={24} />
                    </button>
                 </div>
                 
                 <form onSubmit={async (e) => {
                    e.preventDefault();
                    setBookingLoading(true);
                    try {
                       const userId = user?.id ? Number(user.id) : 1;
                       await createBooking({ 
                         ...bookingData, 
                         resourceId: resource.id, 
                         userId,
                         expectedAttendees: bookingData.expectedAttendees ? parseInt(bookingData.expectedAttendees) : undefined 
                       });
                       toast.success('Booking requested successfully!');
                       setShowModal(false);
                       setBookingData({ bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: ''});
                    } catch (err: any) {
                       toast.error(err.response?.data?.error || 'Failed to request booking');
                    } finally {
                       setBookingLoading(false);
                    }
                 }} className="p-6 space-y-4">
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                       <input type="date" required value={bookingData.bookingDate} onChange={e => setBookingData({...bookingData, bookingDate: e.target.value})} 
                         className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                         <input type="time" required value={bookingData.startTime} onChange={e => setBookingData({...bookingData, startTime: e.target.value})} 
                           className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                         <input type="time" required value={bookingData.endTime} onChange={e => setBookingData({...bookingData, endTime: e.target.value})} 
                           className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Expected Attendees</label>
                       <input type="number" min="1" max={resource.capacity} value={bookingData.expectedAttendees} onChange={e => setBookingData({...bookingData, expectedAttendees: e.target.value})} 
                         className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder={`Max capacity: ${resource.capacity}`} />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Purpose</label>
                       <textarea required rows={3} value={bookingData.purpose} onChange={e => setBookingData({...bookingData, purpose: e.target.value})} 
                         className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Briefly describe the purpose of booking..."></textarea>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                       <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold">Cancel</button>
                       <button type="submit" disabled={bookingLoading} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-70 transition-colors">
                          {bookingLoading ? 'Submitting...' : 'Submit Request'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        )}

       {/* Availability Calendar Section */}
       <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Calendar size={22} className="text-blue-600" /> Availability Calendar
            </h2>
            <p className="text-slate-500 text-sm mt-1">View booked and available time slots. Click on an empty slot to start a booking.</p>
          </div>
          <ResourceAvailabilityCalendar
            resourceId={resource.id}
            resourceName={resource.name}
            availableFrom={resource.availableFrom || resource.availabilityTime?.split(' - ')[0]}
            availableTo={resource.availableTo || resource.availabilityTime?.split(' - ')[1]}
            onSlotSelect={(slotInfo) => {
              setBookingData({
                bookingDate: slotInfo.date,
                startTime: slotInfo.startTime,
                endTime: slotInfo.endTime,
                purpose: '',
                expectedAttendees: '',
              });
              setShowModal(true);
            }}
          />
       </div>
    </div>
  );
};
