import React, { useState } from 'react';
import { createResource, uploadResourceImage } from '../../api/resourceApi';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const AddResource: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '', type: 'Hall', capacity: 0, location: '', status: 'ACTIVE' as 'ACTIVE' | 'OUT_OF_SERVICE' | 'MAINTENANCE', availabilityTime: '08:00 - 20:00', imageUrl: ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || formData.capacity < 1) {
      return toast.error('Please fill out all required fields correctly.');
    }

    setLoading(true);
    try {
      let imageUrl = formData.imageUrl;
      if (selectedFile) {
        toast.success(`Uploading image...`);
        imageUrl = await uploadResourceImage(selectedFile);
      }

      const payload = { ...formData, imageUrl };
      await createResource(payload);

      toast.success('Resource registered successfully!');
      navigate('/resources');
    } catch (err) {
      toast.error('Failed to register resource.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Add New Resource</h2>
        <p className="text-slate-500 mt-1">Register a new facility or asset into the campus portfolio.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-10">
          
          {/* Section: Resource Details */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
              Resource Details
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Resource Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all shadow-sm" placeholder="e.g. Main Auditorium" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type <span className="text-red-500">*</span></label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all shadow-sm appearance-none">
                    <option value="Hall">Hall</option>
                    <option value="Lab">Lab</option>
                    <option value="Library">Library</option>
                    <option value="Sports">Sports Facility</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Capacity <span className="text-red-500">*</span></label>
                  <input type="number" required min="1" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all shadow-sm" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location / Building <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all shadow-sm" placeholder="e.g. Science Block, Room 101" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Availability Time</label>
                  <select value={formData.availabilityTime} onChange={e => setFormData({ ...formData, availabilityTime: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all shadow-sm appearance-none">
                    <option value="08:00 - 18:00">08:00 - 18:00 (Standard)</option>
                    <option value="08:00 - 20:00">08:00 - 20:00 (Extended)</option>
                    <option value="00:00 - 23:59">00:00 - 23:59 (24 Hours)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'OUT_OF_SERVICE' | 'MAINTENANCE' })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all shadow-sm appearance-none">
                    <option value="ACTIVE">Active (Ready)</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Resource Image */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-sm">2</span>
              Resource Media (Optional)
            </h3>
            <div className="mt-2 flex justify-center px-6 pt-10 pb-12 border-2 border-slate-300 border-dashed rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-slate-50/50 relative group min-h-[250px] items-center">
              {imagePreview ? (
                <div className="absolute inset-0 p-3">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-md" />
                  <button type="button" onClick={() => setImagePreview(null)} className="absolute top-6 right-6 bg-slate-900/80 p-2.5 rounded-full text-white hover:bg-red-500 transition-all backdrop-blur-sm hover:scale-110 shadow-lg">
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-500 mb-2 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Upload size={28} />
                  </div>
                  <div className="flex flex-col text-sm text-slate-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      <span className="text-base">Click to upload an image</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <p className="mt-2 text-slate-500">or drag and drop your image here</p>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-slate-400 bg-white px-4 py-1.5 rounded-full border border-slate-200">PNG or JPG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-4 items-center rounded-b-2xl">
          <button type="button" onClick={() => navigate('/resources')} className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm focus:ring-2 focus:ring-slate-200">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white rounded-xl inline-flex justify-center items-center gap-2 text-sm font-bold shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 transition-all hover:-translate-y-0.5">
            <Save size={18} /> {loading ? 'Saving Resource...' : 'Save Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};
