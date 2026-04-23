import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Doctor() {
  const [appointments, setAppointments] = useState([]);

  // Search, Filter, Sort
  const [doctorName, setDoctorName] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Patient Name
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dateAsc');

  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadAppointments = async () => {
    if (!doctorName) {
      toast.error('Please select or enter a doctor name first.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/appointments');
      const myAppts = data.filter(
        appt => appt.doctorName.toLowerCase() === doctorName.toLowerCase()
      );
      setAppointments(myAppts);
      setHasSearched(true);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await axios.delete(`http://localhost:5000/appointments/${id}`);
      toast.success('Appointment cancelled successfully!');
      loadAppointments(); // refresh
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Derived state filtering & sorting
  let displayedAppts = [...appointments];

  if (searchTerm) {
    displayedAppts = displayedAppts.filter(a => a.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  if (filterDate) {
    displayedAppts = displayedAppts.filter(a => a.date === filterDate);
  }
  if (filterStatus !== 'all') {
    displayedAppts = displayedAppts.filter(a => a.status === filterStatus);
  }

  // Sorting
  displayedAppts.sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time}`);
    const timeB = new Date(`${b.date}T${b.time}`);
    if (sortBy === 'dateAsc') return timeA - timeB;
    if (sortBy === 'dateDesc') return timeB - timeA;
    if (sortBy === 'time') {
      const minA = parseInt(a.time.replace(':', ''));
      const minB = parseInt(b.time.replace(':', ''));
      return minA - minB;
    }
    return 0;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Manage Appointments</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage your schedule</p>
        </div>
      </div>

      <div className="p-6">

        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Select Doctor</label>
            <select
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm dark:text-slate-100"
            >
              <option value="">Choose Doctor...</option>
              <option value="Dr. A">Dr. A</option>
              <option value="Dr. B">Dr. B</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadAppointments}
              disabled={!doctorName || isLoading}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition disabled:opacity-50 h-[38px] text-sm shadow-sm flex items-center justify-center"
            >
              {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : null}
              Load Schedule
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        {hasSearched && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Search Patient</label>
              <input
                type="text"
                placeholder="Name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Filter by Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-slate-200"
              >
                <option value="all">All</option>
                <option value="booked">Booked</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-slate-200"
              >
                <option value="dateAsc">Date (Upcoming First)</option>
                <option value="dateDesc">Date (Furthest First)</option>
                <option value="time">Time of Day</option>
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                Results ({displayedAppts.length})
              </h3>
              <button
                onClick={loadAppointments}
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium flex items-center bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Refresh
              </button>
            </div>

            {displayedAppts.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient Name</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {displayedAppts.map(appt => {
                      const isToday = appt.date === todayStr;
                      const isCancelled = appt.status === 'cancelled';
                      return (
                        <tr key={appt.id} className={`${isToday && !isCancelled ? 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'} transition-colors`}>
                          <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                            {appt.patientName}
                            {isToday && !isCancelled && <span className="ml-2 text-[10px] bg-amber-200 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-bold">TODAY</span>}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                            <span className="block font-medium">{appt.date}</span>
                            <span className="block text-xs font-mono">{appt.time}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs italic max-w-xs truncate">
                            {appt.notes || '--'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isCancelled ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                              {isCancelled ? 'Cancelled' : 'Booked'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => cancelAppointment(appt.id)}
                              disabled={isCancelled}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p className="text-slate-500 dark:text-slate-400 font-medium">No appointments found matching this criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Doctor;
