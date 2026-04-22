import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Home from './Home';
import Patient from './Patient';
import Doctor from './Doctor';

function App() {
  const [view, setView] = useState('home'); // 'home', 'patient', 'doctor'
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const NavItem = ({ name, icon, target }) => (
    <button
      onClick={() => setView(target)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
        view === target 
          ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-900/50 dark:text-indigo-300' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{name}</span>
    </button>
  );

  const getPageTitle = () => {
    if (view === 'home') return 'Overview';
    if (view === 'patient') return 'Patient Panel';
    if (view === 'doctor') return 'Doctor Dashboard';
    return '';
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col fixed inset-y-0 shadow-sm z-10 transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="bg-indigo-600 text-white rounded-lg p-2">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
             </div>
             <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">MedCare</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem name="Dashboard" icon="📊" target="home" />
          <NavItem name="Patient Panel" icon="🏥" target="patient" />
          <NavItem name="Doctor Panel" icon="👨‍⚕️" target="doctor" />
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 text-center">
          © {new Date().getFullYear()} MedCare Systems
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{getPageTitle()}</h2>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {currentDate}
            </div>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300"
              title="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
            
            {/* Mobile Menu Dropdown (Simplified) */}
            <div className="md:hidden flex items-center">
              <select 
                value={view} 
                onChange={(e) => setView(e.target.value)}
                className="bg-slate-100 dark:bg-slate-700 border-none text-slate-800 dark:text-slate-100 rounded-md py-1 px-2 text-sm focus:ring-0"
              >
                <option value="home">Dashboard</option>
                <option value="patient">Patient Panel</option>
                <option value="doctor">Doctor Panel</option>
              </select>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 lg:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-5xl mx-auto">
            {view === 'home' && <Home />}
            {view === 'patient' && <Patient />}
            {view === 'doctor' && <Doctor />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
