import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-blue-100 selection:text-blue-900 relative">
      {/* Global Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-400/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar flex flex-col items-center">
          <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 relative z-10">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};
