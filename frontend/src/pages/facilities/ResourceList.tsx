import React, { useEffect, useState } from 'react';
import { getResources, deleteResource } from '../../api/resourceApi';
import { Resource } from '../../types/resource';
import { Search, Filter, Box, ChevronLeft, ChevronRight, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ResourceList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      // Load a broad set once, then apply search/filters on the client
      const res = await getResources(0, 500, '', '');
      setResources(res.content || []);
    } catch (err) {
      toast.error('Failed to load resources.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        setLoading(true);
        await deleteResource(id);
        toast.success('Resource deleted successfully.');
        fetchResources(); // Refresh the list
      } catch (err) {
        toast.error('Failed to delete resource.');
        setLoading(false);
      }
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredResources = resources.filter((resource) => {
    const resourceType = (resource.type || '').toLowerCase();
    const resourceLocation = (resource.location || '').toLowerCase();
    const resourceCapacity = String(resource.capacity || '');

    const matchesSearch =
      !normalizedSearch ||
      resourceType.includes(normalizedSearch) ||
      resourceLocation.includes(normalizedSearch) ||
      resourceCapacity.includes(normalizedSearch);

    const matchesType = !type || resource.type === type;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / size));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedResources = filteredResources.slice(currentPage * size, currentPage * size + size);

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'LECTURE_HALL', label: 'Hall' },
    { value: 'LAB', label: 'Lab' },
    { value: 'LIBRARY', label: 'Library' },
    { value: 'SPORTS_ARENA', label: 'Sport' },
    { value: 'OTHERS', label: 'Equipment' },
    { value: 'OTHERS', label: 'Other' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Resource Catalogue</h2>
          <p className="text-slate-500 mt-1">Browse and filter campus facilities and assets.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search type, capacity or location..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 transition-shadow outline-none"
            />
          </div>
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center justify-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
              <select value={type} onChange={e => { setType(e.target.value); setPage(0); }} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                {typeOptions.map((option) => (
                  <option key={`${option.value || 'ALL'}-${option.label}`} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6 text-center">Capacity</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 relative">
              {loading && (
                <tr><td colSpan={6} className="h-48 text-center text-slate-500"><div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div><br />Loading...</td></tr>
              )}
              {!loading && paginatedResources.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500 font-medium tracking-wide">No resources found matching criteria.</td></tr>
              )}
              {!loading && paginatedResources.map(resource => (
                <tr key={resource.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100/50 overflow-hidden">
                        {resource.imageUrl ? (
                          <img src={resource.imageUrl.startsWith('http') ? resource.imageUrl : `http://localhost:8081${resource.imageUrl}`} alt={resource.name} className="w-full h-full object-cover" />
                        ) : (
                          <Box size={20} />
                        )}
                      </div>
                      <span className="font-bold text-slate-800">{resource.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{resource.type}</td>
                  <td className="py-4 px-6 text-center text-slate-600">{resource.capacity}</td>
                  <td className="py-4 px-6 text-slate-500">{resource.location}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-full border ${resource.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : resource.status === 'MAINTENANCE'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                      {resource.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm w-full">
                      <Link to={`/app/facilities/resources/${resource.id}`} title="View Details" className="p-2 px-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors font-bold flex items-center gap-2">
                        <Eye size={16} /> <span className="hidden sm:inline">View</span>
                      </Link>
                      {isAdmin && (
                        <>
                          <Link to={`/app/facilities/resources/edit/${resource.id}`} title="Edit Resource" className="p-2 px-3 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors font-bold flex items-center gap-2">
                            <Edit2 size={16} /> <span className="hidden sm:inline">Edit</span>
                          </Link>
                          <button onClick={() => handleDelete(resource.id)} title="Delete Resource" className="p-2 px-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-bold flex items-center gap-2 shadow-sm active:scale-95">
                            <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
          <div>
            Showing page <span className="font-bold">{currentPage + 1}</span> of <span className="font-bold">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="p-1.5 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 disabled:opacity-50 transition">
              <ChevronLeft size={18} />
            </button>
            <button disabled={currentPage >= totalPages - 1} onClick={() => setPage(currentPage + 1)} className="p-1.5 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 disabled:opacity-50 transition">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
