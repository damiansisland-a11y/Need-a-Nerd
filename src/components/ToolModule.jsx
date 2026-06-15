import React from 'react';
import { MonitorPlay, CheckSquare } from 'lucide-react';
import { tools } from './ToolRegistry'; // Both are in the components folder

const IconMap = {
  CheckSquare: CheckSquare
};

export default function ToolsModule({ user, config, onLogin, onLogout }) {
  return (
    <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen flex flex-col items-center animate-in fade-in duration-500">
      
      {/* 1. Header */}
      <div className="text-center mb-10">
        <MonitorPlay className="w-20 h-20 text-indigo-200 dark:text-indigo-900/50 mx-auto mb-8" />
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Digital Tools & Ecosystem</h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          This space is reserved for bespoke, zero-friction educational applications.
        </p>
      </div>

      <div className="w-full space-y-8">
        
        {/* 2. Authentication Bar */}
        <div className="w-full flex justify-end">
          {!user || user.isAnonymous ? (
             <button 
               onClick={onLogin} 
               className="px-6 py-2 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm"
             >
               Sign In
             </button>
          ) : (
             <button 
               onClick={onLogout} 
               className="px-6 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-sm"
             >
               Sign Out
             </button>
          )}
        </div>

        {/* 3. The Tools Grid */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => {
              const Icon = IconMap[tool.icon];
              return (
                <div key={tool.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                    {Icon && <Icon size={24} />}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{tool.title}</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 mb-4">{tool.description}</p>
                  <a 
                    href={tool.path} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Launch Tool →
                  </a>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}