import React from 'react';
import { Heart, Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-white/50 backdrop-blur-sm border-t border-slate-200 px-6 py-6 transition-all w-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 max-w-7xl mx-auto w-full">
        
        {/* Left: Branding & Copyright */}
        <div className="flex items-center gap-2">
           <Building2 size={16} className="text-blue-500" />
           <span className="font-semibold text-slate-700">SmartUniNexus</span>
           <span>&copy; {currentYear}. All rights reserved.</span>
        </div>

        {/* Center: Built with care */}
        <div className="flex items-center gap-1.5 hidden lg:flex font-medium">
          Built with <Heart size={14} className="text-red-500 fill-red-500 animate-pulse mx-0.5" /> for Academic Excellence
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-4 font-medium">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
          <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
          <a href="#" className="hover:text-blue-600 transition-colors hidden sm:block">Help & Support</a>
        </div>
        
      </div>
    </footer>
  );
};
