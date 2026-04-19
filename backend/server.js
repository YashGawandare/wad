const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory array for appointments
let appointments = [];

// GET /stats
app.get('/stats', (req, res) => {
    const bookedAppointments = appointments.filter(a => a.status === 'booked');
    
    // Calculate unique patients
    const uniquePatients = new Set(appointments.map(a => a.patientName.toLowerCase()));
    
    // Calculate unique doctors
    const uniqueDoctors = new Set(appointments.map(a => a.doctorName.toLowerCase()));

    res.json({
        totalAppointments: bookedAppointments.length,
        totalPatients: uniquePatients.size,
        totalDoctors: uniqueDoctors.size
    });
});

// GET /appointments - Returns all appointments (sorted by date/time)
app.get('/appointments', (req, res) => {
    const sorted = [...appointments].sort((a, b) => {
        const datetimeA = new Date(`${a.date}T${a.time}`);
        const datetimeB = new Date(`${b.date}T${b.time}`);
        return datetimeA - datetimeB;
    });
    res.json(sorted);
});

// POST /appointments - Create new appointment object
app.post('/appointments', (req, res) => {
    const { patientName, doctorName, date, time, notes } = req.body;

    if (!patientName || !doctorName || !date || !time) {
        return res.status(400).json({ error: 'All primary fields are required' });
    }

    // Duplicate slot check (only checking 'booked' status)
    const isDuplicate = appointments.some(appt => 
        appt.status === 'booked' &&
        appt.doctorName === doctorName && 
        appt.date === date && 
        appt.time === time
    );

    if (isDuplicate) {
        return res.status(400).json({ error: 'This time slot is already booked for this doctor.' });
    }

    const newAppointment = {
        id: Date.now().toString(),
        patientName,
        doctorName,
        date,
        time,
        notes: notes || '',
        status: 'booked'
    };

    appointments.push(newAppointment);
    
    res.status(201).json({ 
        message: 'Appointment Booked Successfully', 
        appointment: newAppointment 
    });
});

// PUT /appointments/:id (Update Date, Time, Notes)
app.put('/appointments/:id', (req, res) => {
    const { id } = req.params;
    const { date, time, notes } = req.body;

    const apptIndex = appointments.findIndex(a => a.id === id);

    if (apptIndex === -1) {
        return res.status(404).json({ error: 'Appointment not found' });
    }

    if (!date || !time) {
         return res.status(400).json({ error: 'Date and Time are required' });
    }

    const currentAppt = appointments[apptIndex];

    // Optional: check for duplicate if date/time changed
    if (currentAppt.date !== date || currentAppt.time !== time) {
        const isDuplicate = appointments.some(appt => 
            appt.id !== id && 
            appt.status === 'booked' &&
            appt.doctorName === currentAppt.doctorName && 
            appt.date === date && 
            appt.time === time
        );
        if (isDuplicate) {
             return res.status(400).json({ error: 'This time slot is already booked for this doctor.' });
        }
    }

    appointments[apptIndex] = {
        ...currentAppt,
        date,
        time,
        notes: notes !== undefined ? notes : currentAppt.notes
    };

    res.status(200).json({ message: 'Appointment updated successfully', appointment: appointments[apptIndex] });
});

// DELETE /appointments/:id (Soft-delete)
app.delete('/appointments/:id', (req, res) => {
    const { id } = req.params;
    const appointment = appointments.find(appt => appt.id === id);

    if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    res.status(200).json({ message: 'Appointment cancelled successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
