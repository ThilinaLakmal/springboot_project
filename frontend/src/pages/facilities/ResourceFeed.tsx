import React, { useEffect, useState } from 'react';
import { getResources } from '../../api/resourceApi';
import { Resource } from '../../types/resource';
import { Search, MapPin, Users, Clock, CheckCircle2, AlertCircle, Wrench, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Footer } from '../../components/layout/Footer';

export const ResourceFeed: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(handler);
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await getResources(0, 500, '', '');
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
      case 'ACTIVE': return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2, label: 'Available' };
      case 'MAINTENANCE': return { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: Wrench, label: 'Maintenance' };
      default: return { bg: 'bg-red-500/10', text: 'text-red-500', icon: AlertCircle, label: 'Out of Service' };
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const normalizedLocationFilter = locationFilter.trim().toLowerCase();
  const capacityValue = capacityFilter ? Number(capacityFilter) : null;

  const filteredResources = resources.filter((resource) => {
    const resourceName = (resource.name || '').toLowerCase();
    const resourceType = (resource.type || '').toLowerCase();
    const resourceLocation = (resource.location || '').toLowerCase();
    const resourceCapacity = String(resource.capacity || '');

    const matchesSearch =
      !normalizedSearch ||
      resourceName.includes(normalizedSearch) ||
      resourceType.includes(normalizedSearch) ||
      resourceLocation.includes(normalizedSearch) ||
      resourceCapacity.includes(normalizedSearch);

    const matchesType = !typeFilter || resource.type === typeFilter;
    const matchesLocation = !normalizedLocationFilter || resourceLocation.includes(normalizedLocationFilter);
    const matchesCapacity = capacityValue === null || resource.capacity === capacityValue;

    return matchesSearch && matchesType && matchesLocation && matchesCapacity;
  });

  const typeOptions = Array.from(new Set(resources.map((r) => r.type))).sort((a, b) => a.localeCompare(b));

  const clearAllFilters = () => {
    setSearch('');
    setTypeFilter('');
    setLocationFilter('');
    setCapacityFilter('');
  };

  const hasActiveFilters = search || typeFilter || locationFilter || capacityFilter;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* Subtle Background Accents */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-500/5 via-blue-500/5 to-transparent pointer-events-none z-0"></div>

      {/* Standalone Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-sm text-white">
                 <MapPin size={18} />
              </div>
              <span className="font-extrabold text-slate-800 tracking-tight">SmartUniNexus</span>
           </div>
           
           <Link to="/app/facilities/dashboard" className="text-sm font-bold text-blue-600 hover:text-white border-2 border-blue-600 hover:bg-blue-600 px-5 py-2 rounded-full transition-all shadow-sm">
              Dashboard Access
           </Link>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-16 relative z-10 animate-fade-in-up">
        
        {/* Floating Search & Filter Console - Replaces Hero Text */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2rem] p-4 md:p-6 shadow-2xl shadow-slate-200/50 mb-12 w-full relative ring-1 ring-slate-100">
           {/* Universal Search Bar */}
           <div className="relative group mb-5">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
              </div>
              <input 
                type="text" 
                placeholder="Search any facility, resource, or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-16 pr-6 py-4 bg-slate-100/50 border-2 border-slate-200/50 rounded-2xl text-slate-700 font-semibold text-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm"
              />
              {hasActiveFilters && (
                 <button 
                   onClick={clearAllFilters}
                   className="absolute inset-y-0 right-4 flex items-center gap-1.5 text-xs font-bold bg-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-300 px-3 my-4 rounded-xl transition-all"
                 >
                   Clear <X size={12}/>
                 </button>
              )}
           </div>

           {/* Granular Filters */}
           <div className="flex flex-col md:flex-row gap-8">
              {/* Type Filter Pills */}
              <div className="flex-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Filter by Collection</p>
                 <div className="flex flex-wrap gap-2">
                    <button
                       onClick={() => setTypeFilter('')}
                       className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          typeFilter === '' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                       }`}
                    >
                       Everything
                    </button>
                    {typeOptions.map(type => (
                       <button
                         key={type}
                         onClick={() => setTypeFilter(type)}
                         className={`px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                            typeFilter === type 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                         }`}
                       >
                          {type}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Location & Capacity Inputs */}
              <div className="flex gap-4 md:w-2/5">
                 <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Location</p>
                    <input
                      type="text"
                      placeholder="e.g. Main Bldg"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-slate-200/50 rounded-xl text-sm font-bold text-slate-600 bg-slate-100/50 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:font-medium"
                    />
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Capacity</p>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 50"
                      value={capacityFilter}
                      onChange={(e) => setCapacityFilter(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-slate-200/50 rounded-xl text-sm font-bold text-slate-600 bg-slate-100/50 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:font-medium"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="mb-6 flex justify-center text-sm font-bold text-slate-400 opacity-80 decoration-slate-300">
            SHOWING {filteredResources.length} {filteredResources.length === 1 ? 'RESULT' : 'RESULTS'}
          </div>
        )}

        {/* Dynamic State Rendering */}
        {loading ? (
           <div className="flex flex-col justify-center items-center py-32 text-blue-500">
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-slate-200 border-t-current mb-4"></div>
              <p className="font-semibold text-slate-400">Curating resources...</p>
           </div>
        ) : filteredResources.length === 0 ? (
           <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-16 text-center shadow-form border border-slate-100/50 max-w-2xl mx-auto mt-8">
              <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-blue-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
                 <Search size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">No facilities match criteria</h3>
              <p className="text-slate-500 font-medium text-lg">Adjust your search or clear all filters to see more results.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {filteredResources.map(resource => {
                 const StatusIcon = getStatusConfig(resource.status).icon;
                 return (
                   <Link to={`/app/facilities/resources/${resource.id}`} key={resource.id} className="bg-white rounded-[2rem] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden group transition-all duration-[400ms] hover:-translate-y-2 flex flex-col will-change-transform">
                      {/* Image Banner */}
                      <div className="h-[280px] relative overflow-hidden bg-slate-100">
                         {resource.imageUrl ? (
                           <img src={resource.imageUrl.startsWith('http') ? resource.imageUrl : `http://localhost:8081${resource.imageUrl}`} 
                                alt={resource.name} 
                                className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 text-center px-4">
                             <div className="w-14 h-14 bg-slate-200/50 rounded-2xl mb-3 flex items-center justify-center"><MapPin size={28}/></div>
                             <span className="font-extrabold tracking-widest text-xs">AWAITING IMAGE</span>
                           </div>
                         )}
                         {/* Seamless Gradient Overlay */}
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-95 transition-opacity duration-500 group-hover:opacity-100"></div>
                         
                         {/* Floating Glass Type Badge */}
                         <div className="absolute top-5 left-5 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-[10px] text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                           {resource.type}
                         </div>

                         {/* Title over Image for modern feel */}
                         <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md mb-2">{resource.name}</h3>
                            <div className="flex items-center text-blue-200 text-[11px] font-bold uppercase tracking-widest drop-shadow-sm">
                              <MapPin size={14} className="mr-1.5" />
                              <span className="truncate">{resource.location}</span>
                            </div>
                         </div>
                      </div>
  
                      {/* Detailed Content Ribbon */}
                      <div className="p-6 flex flex-col flex-grow bg-white">
                         <div className="flex gap-4 mb-8 pt-2">
                           <div className="flex-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Users size={12}/> Capacity</p>
                             <p className="text-slate-800 font-extrabold whitespace-nowrap text-lg">{resource.capacity} <span className="text-sm font-medium text-slate-500">Pax</span></p>
                           </div>
                           <div className="w-[1.5px] bg-slate-100 rounded-full"></div>
                           <div className="flex-[1.5]">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock size={12}/> Active Hours</p>
                             <p className="text-slate-800 font-extrabold truncate text-lg">{resource.availabilityTime || 'Standard'}</p>
                           </div>
                         </div>
                         
                         {/* Footer Action Area */}
                         <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest leading-none ${getStatusConfig(resource.status).bg} ${getStatusConfig(resource.status).text}`}>
                               <StatusIcon size={14} className="stroke-[3]" />
                               {getStatusConfig(resource.status).label}
                            </div>
                            
                            <div className="w-12 h-12 rounded-[14px] bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm cursor-pointer group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                               <ChevronRight size={20} className="translate-x-[1px] group-hover:translate-x-[3px] transition-transform duration-300" />
                            </div>
                         </div>
                      </div>
                   </Link>
                 );
              })}
           </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
