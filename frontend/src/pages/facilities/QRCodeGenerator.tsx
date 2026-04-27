import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getResources } from '../../api/resourceApi';
import { Resource } from '../../types/resource';
import { Download, QrCode, Building2, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const QRCodeGenerator: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResources(0, 100)
      .then(data => setResources(data.content || []))
      .catch(() => toast.error('Failed to load resources'))
      .finally(() => setLoading(false));
  }, []);

  const downloadQR = (resource: Resource) => {
    const svgEl = document.getElementById(`qr-${resource.id}`) as unknown as SVGSVGElement;
    if (!svgEl) return;
    
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 480;
      if (ctx) {
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code centered
        ctx.drawImage(img, 50, 30, 300, 300);
        
        // Add resource name text
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(resource.name, 200, 370);
        
        // Add location text
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Arial';
        ctx.fillText(resource.location, 200, 395);
        
        // Add instruction
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Scan to check in to your booking', 200, 430);
        
        // Add ID
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Arial';
        ctx.fillText(`RESOURCE:${resource.id}`, 200, 460);

        const link = document.createElement('a');
        link.download = `QR-${resource.name.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success(`QR code downloaded for ${resource.name}`);
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) {
    return (
      <div className="p-10 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">
          <QrCode size={14} /> QR Code Management
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resource QR Codes</h1>
        <p className="text-slate-500 mt-2">Generate and download unique QR codes for each resource. Print and display them at the physical location for user check-in.</p>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map(resource => (
          <div key={resource.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            {/* QR Code Display */}
            <div className="p-6 flex flex-col items-center bg-slate-50/50 border-b border-slate-100">
              <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-200">
                <QRCodeSVG
                  id={`qr-${resource.id}`}
                  value={`RESOURCE:${resource.id}`}
                  size={180}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#1e293b"
                />
              </div>
              <p className="mt-3 text-xs text-slate-400 font-mono font-bold tracking-widest">RESOURCE:{resource.id}</p>
            </div>

            {/* Resource Info */}
            <div className="p-5">
              <h3 className="font-bold text-slate-800 text-lg mb-2">{resource.name}</h3>
              <div className="space-y-1.5 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-blue-500" />
                  <span>{resource.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-500" />
                  <span>{resource.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-indigo-500" />
                  <span>Capacity: {resource.capacity}</span>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => downloadQR(resource)}
                className="w-full mt-4 py-3 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm active:scale-[0.98]"
              >
                <Download size={16} /> Download QR Code
              </button>
            </div>
          </div>
        ))}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-20">
          <QrCode size={64} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500">No Resources Found</h3>
          <p className="text-slate-400 mt-1">Add resources first to generate QR codes.</p>
        </div>
      )}
    </div>
  );
};
