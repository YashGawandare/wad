import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Patient() {
  const [myAppointments, setMyAppointments] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Search, Filter, Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'booked', 'cancelled'
  const [sortBy, setSortBy] = useState('dateAsc'); // dateAsc, dateDesc, time
  
  // Form States
  const defaultDate = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    date: defaultDate,
    time: '',
    notes: ''
  });
  
  const [editData, setEditData] = useState({ id: '', date: '', time: '', notes: '' });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const loadAppointments = async () => {
    setIsFetching(true);
    try {
      const { data } = await axios.get('http://localhost:5000/appointments');
      setMyAppointments(data);
    } catch (err) {
      toast.error('Failed to load appointments.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.doctorName || !formData.date || !formData.time) {
      toast.error('All required fields must be filled.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/appointments', formData);
      toast.success('Appointment booked successfully!');
      
      const currentPatientName = formData.patientName;
      setFormData({
        patientName: currentPatientName,
        doctorName: '',
        date: defaultDate,
        time: '',
        notes: ''
      });
      setIsBookingModalOpen(false);
      loadAppointments();
    } catch (error) {
      if (error.response && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Server error: Failed to book appointment.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editData.date || !editData.time) {
      toast.error('Date and time are required.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`http://localhost:5000/appointments/${editData.id}`, {
        date: editData.date,
        time: editData.time,
        notes: editData.notes
      });
      toast.success('Appointment updated successfully!');
      setIsEditModalOpen(false);
      loadAppointments();
    } catch (error) {
      if (error.response && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to update appointment.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.delete(`http://localhost:5000/appointments/${id}`);
      toast.success('Appointment cancelled!');
      loadAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment.');
    }
  };

  const isFormValid = formData.patientName && formData.doctorName && formData.date && formData.time;

  // Derived state (filtering/sorting)
  let displayedAppts = [...myAppointments];

  if (searchTerm) {
    displayedAppts = displayedAppts.filter(a => a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  if (filterDate) {
    displayedAppts = displayedAppts.filter(a => a.date === filterDate);
  }
  if (filterStatus && filterStatus !== 'all') {
    displayedAppts = displayedAppts.filter(a => a.status === filterStatus);
  }

  displayedAppts.sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time}`);
    const timeB = new Date(`${b.date}T${b.time}`);
    
    if (sortBy === 'dateAsc') return timeA - timeB;
    if (sortBy === 'dateDesc') return timeB - timeA;
    if (sortBy === 'time') {
      const minA = parseInt(a.time.replace(':',''));
      const minB = parseInt(b.time.replace(':',''));
      return minA - minB;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
           <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Appointments</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400">View, search, or update your schedule</p>
        </div>
        <button 
          onClick={() => setIsBookingModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition shadow-sm flex items-center justify-center whitespace-nowrap"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Book New Appointment
        </button>
      </div>

      {/* Control Panel (Search, Filter, Sort) */}
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 transition-colors">
         <div>
           <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Search Doctor</label>
           <input 
             type="text" 
             placeholder="e.g. Dr. A"
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

      {/* Appointments List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {isFetching ? (
          <div className="flex justify-center items-center p-12">
            <span className="w-8 h-8 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : displayedAppts.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {displayedAppts.map(appt => {
               const isCancelled = appt.status === 'cancelled';
               return (
                <div key={appt.id} className={`p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-colors ${isCancelled ? 'bg-slate-50/50 dark:bg-slate-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                  <div className="flex-1 w-full mb-4 sm:mb-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <p className={`text-lg font-bold ${isCancelled ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                        {appt.doctorName}
                      </p>
                      <span className={`px-2.5 py-0.5 text-xs uppercase font-bold rounded-full border ${isCancelled ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'}`}>
                        {isCancelled ? 'Cancelled' : 'Booked'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {appt.date}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {appt.time}
                      </span>
                      <span className="flex items-center font-medium">
                        For: {appt.patientName}
                      </span>
                    </div>
                    {appt.notes && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 italic">"{appt.notes}"</p>
                    )}
                  </div>
                  
                  {!isCancelled && (
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button 
                        onClick={() => {
                          setEditData({ id: appt.id, date: appt.date, time: appt.time, notes: appt.notes });
                          setIsEditModalOpen(true);
                        }}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm flex-1 sm:flex-none"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => cancelAppointment(appt.id)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-semibold rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition shadow-sm flex-1 sm:flex-none"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
               )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
             <svg className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No appointments found</h3>
             <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or book a new appointment.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Book Appointment</h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleBooking} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                  <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} placeholder="e.g. John Doe" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200" required />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Doctor Selection</label>
                  <select name="doctorName" value={formData.doctorName} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200" required>
                    <option value="">Select Doctor</option>
                    <option value="Dr. A">Dr. A</option>
                    <option value="Dr. B">Dr. B</option>
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                    <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200" required />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Additional Notes (Optional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any symptoms or questions?" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none text-slate-800 dark:text-slate-200"></textarea>
               </div>
               
               <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
                 <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-5 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>
                 <button type="submit" disabled={!isFormValid || isLoading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center">
                   {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Confirm Booking"}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Update Appointment</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input type="date" name="date" value={editData.date} onChange={handleEditChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                    <input type="time" name="time" value={editData.time} onChange={handleEditChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200" required />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Additional Notes</label>
                  <textarea name="notes" value={editData.notes} onChange={handleEditChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none text-slate-800 dark:text-slate-200"></textarea>
               </div>
               
               <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
                 <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>
                 <button type="submit" disabled={isLoading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center">
                   {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Save Changes"}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patient;
