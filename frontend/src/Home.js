import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function Home() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalPatients: 0,
    totalDoctors: 0
  });
  
  const [latestAppointments, setLatestAppointments] = useState([]);
  const [upcoming, setUpcoming] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, apptsRes] = await Promise.all([
          axios.get('http://localhost:5000/stats'),
          axios.get('http://localhost:5000/appointments')
        ]);
        
        setStats(statsRes.data);
        
        const allAppts = apptsRes.data;
        const activeAppts = allAppts.filter(a => a.status !== 'cancelled');
        
        // 1. Recent Activity (Last 5 created)
        const recent = [...allAppts].sort((a,b) => b.id - a.id).slice(0, 5);
        setLatestAppointments(recent);
        
        // 2. Next Upcoming Appt
        const now = new Date();
        const futureAppts = activeAppts.filter(a => {
          const apptDate = new Date(`${a.date}T${a.time}`);
          return apptDate >= now;
        }).sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        
        if (futureAppts.length > 0) {
          setUpcoming(futureAppts[0]);
        }

        // 3. Chart Data
        const countsByDate = {};
        activeAppts.forEach(a => {
           countsByDate[a.date] = (countsByDate[a.date] || 0) + 1;
        });
        
        const sortedDates = Object.keys(countsByDate).sort();
        const cData = sortedDates.slice(0, 7).map(date => ({
           date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
           count: countsByDate[date]
        }));
        setChartData(cData);

      } catch (error) {
        setErrorMsg('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard Overview</h2>
      
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
          {errorMsg}
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center transition-colors">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400 mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Appointments</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalAppointments}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center transition-colors">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Patients</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalPatients}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center transition-colors">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400 mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Registered Doctors</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalDoctors}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Upcoming Appointment */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col transition-colors">
           <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
             <span className="mr-2 text-amber-500">⏳</span> Next Upcoming
           </h3>
           {upcoming ? (
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white flex-1 flex flex-col justify-center">
               <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Appointment</p>
               <h4 className="text-2xl font-bold mb-4">{upcoming.date} at {upcoming.time}</h4>
               <div className="space-y-2 text-sm">
                 <p className="flex items-center"><span className="w-20 opacity-80">Patient:</span> <span className="font-semibold">{upcoming.patientName}</span></p>
                 <p className="flex items-center"><span className="w-20 opacity-80">Doctor:</span> <span className="font-semibold">{upcoming.doctorName}</span></p>
               </div>
             </div>
           ) : (
             <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 flex-1 flex items-center justify-center text-center border overflow-hidden border-dashed border-slate-300 dark:border-slate-600">
               <p className="text-slate-500 dark:text-slate-400">No upcoming appointments scheduled.</p>
             </div>
           )}
        </div>

        {/* Chart Window */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 lg:col-span-2 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Appointments Trend</h3>
          <div className="h-[250px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: 'black'}}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center">
                 <p className="text-slate-400 dark:text-slate-500">Not enough data to display chart.</p>
               </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Activity List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Recent Activity</h3>
        </div>
        <div>
           {latestAppointments.length > 0 ? (
             <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
               {latestAppointments.map(appt => (
                 <div key={appt.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                   <div className="flex items-center space-x-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${appt.status === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4h3m-6 4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                     </div>
                     <div>
                       <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                         {appt.patientName} <span className="font-normal text-slate-500 dark:text-slate-400">booked</span> {appt.doctorName}
                       </p>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">For {appt.date} at {appt.time}</p>
                     </div>
                   </div>
                   <div className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                     {appt.status}
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="p-8 text-center text-slate-500 dark:text-slate-400">No recent activity detected.</div>
           )}
        </div>
      </div>
      
    </div>
  );
}

export default Home;
