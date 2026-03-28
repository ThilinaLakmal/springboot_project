import React, { useEffect, useState } from 'react';
import { getResources } from '../../api/resourceApi';
import { Resource } from '../../types/resource';
import { Search, MapPin, Users, Clock, CheckCircle2, AlertCircle, Wrench, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const ResourceFeed: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      // Fetch a larger set for the feed, or rely on infinity scroll/pagination if needed
      // Here we just fetch page 0, size 50 for a nice long feed
      const res = await getResources(0, 50, search, '');
      setResources(res.content || []);
    } catch (err) {
      toast.error('Failed to load resource feed.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'ACTIVE': return { bg: 'bg-emerald-500', text: 'text-white', icon: CheckCircle2, label: 'Available' };
      case 'MAINTENANCE': return { bg: 'bg-amber-500', text: 'text-white', icon: Wrench, label: 'Maintenance' };
      default: return { bg: 'bg-red-500', text: 'text-white', icon: AlertCircle, label: 'Out of Service' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Standalone Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                 <MapPin size={20} className="text-white" />
              </div>
              <span className="font-bold text-slate-800 text-lg tracking-tight">SmartUniNexus Feed</span>
           </div>
           {/* Add a button to return to Dashboard since it's standalone */}
           <Link to="/app/facilities/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              Access Dashboard
           </Link>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Campus Feed</h1>
          <p className="text-slate-500 mt-2 text-lg">Discover and explore top facilities ready for your next big idea.</p>
        </div>
        <div className="w-full md:w-80 relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
           <input type="text" placeholder="Find a spot..."
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm"
           />
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
         </div>
      ) : resources.length === 0 ? (
         <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
               <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No facilities found</h3>
            <p className="text-slate-500">Try adjusting your search to find what you're looking for.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map(resource => {
               const StatusIcon = getStatusConfig(resource.status).icon;
               return (
                 <div key={resource.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden group transition-all duration-300 hover:-translate-y-1 flex flex-col">
                    {/* Image Banner */}
                    <div className="h-56 relative overflow-hidden bg-slate-100">
                       {resource.imageUrl ? (
                         <img src={resource.imageUrl.startsWith('http') ? resource.imageUrl : `http://localhost:8080${resource.imageUrl}`} 
                              alt={resource.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                           <span className="font-bold tracking-wider">NO IMAGE</span>
                         </div>
                       )}
                       {/* Overlay Gradient */}
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                       
                       {/* Floating Type Badge */}
                       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm">
                         {resource.type}
                       </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-grow">
                       <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{resource.name}</h3>
                       
                       <div className="space-y-3 mt-4 mb-6">
                         <div className="flex items-center text-slate-500 text-sm font-medium">
                           <MapPin size={16} className="text-blue-500 mr-2.5 shrink-0" />
                           <span className="truncate">{resource.location}</span>
                         </div>
                         <div className="flex items-center text-slate-500 text-sm font-medium">
                           <Users size={16} className="text-indigo-500 mr-2.5 shrink-0" />
                           <span>Up to {resource.capacity} people</span>
                         </div>
                         <div className="flex items-center text-slate-500 text-sm font-medium">
                           <Clock size={16} className="text-emerald-500 mr-2.5 shrink-0" />
                           <span className="truncate">{resource.availabilityTime || 'Standard Hours'}</span>
                         </div>
                       </div>
                       
                       {/* Divider */}
                       <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold leading-none ${getStatusConfig(resource.status).bg} ${getStatusConfig(resource.status).text} shadow-sm`}>
                             <StatusIcon size={14} />
                             {getStatusConfig(resource.status).label}
                          </div>
                          
                          <Link to={`/app/facilities/resources/${resource.id}`} className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors group/link p-2 -m-2">
                             Explore
                             <ChevronRight size={16} className="ml-0.5 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                       </div>
                    </div>
                 </div>
               );
            })}
         </div>
      )}
      </div>
    </div>
  );
};
