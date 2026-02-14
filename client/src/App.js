import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './Contexts/AuthFile';
import Login from './Pages/Login';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import DoctorDashboard from './Pages/Doctor/DoctorDashboard'; // New Import
import ProtectedRoute from './Components/ProtectRoute';
import Appointments from './Pages/Doctor/Appointments';
import Settings from './Pages/Doctor/Settings';
import StaffDashboard from './Pages/Staffs/Dashboard';
import PatientRecords from './Pages/Staffs/PatientRecord';
import DoctorRecords from './Pages/Staffs/Doctors';
import Register from './Pages/Staffs/Register';
import BookAppointment from './Pages/Staffs/Appointment';
import Alert from './Pages/Staffs/Alert';
import AllAppointments from './Pages/Staffs/AllAppointments'
import CheckAlerts from './Pages/Doctor/CheckAlerts';
import Schedule from './Pages/Doctor/Schedule';
import Unauthorized from './Pages/Unauthorized';
import StaffManagement from './Pages/Admin/StaffManagement';
import DoctorManagement from './Pages/Admin/DoctorManagement';

const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0b0f1a]">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  ); 

  if (!user) return <Navigate to="/login" />;

  // Logic to send users to the right "Home"
  if (user.role === 'Admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'Doctor') return <Navigate to="/doctor/dashboard" />;
  if (user.role === 'Staff') return <Navigate to="/staff/dashboard" />;
  
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Main Traffic Controller */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/staffs" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <StaffManagement />
            </ProtectedRoute>
          } />

          <Route path="/admin/doctors" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <DoctorManagement />
            </ProtectedRoute>
          } />

          {/* Doctor Protected Routes */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/doctor/appointments" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <Appointments />
            </ProtectedRoute>
          } />

            <Route path="/doctor/settings" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <Settings />
            </ProtectedRoute>
          } />

           <Route path="/doctor/checkalerts" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <CheckAlerts />
            </ProtectedRoute>
          } />

          <Route path="/doctor/schedule" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <Schedule />
            </ProtectedRoute>
          } />
          {/* Staff Protected Routes (Placeholder element for now) */}
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />

            <Route path="/staff/patient-records" element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <PatientRecords />
            </ProtectedRoute>
          } />

          <Route path="/staff/doctor-records" element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <DoctorRecords />
            </ProtectedRoute>
          } />

          <Route path="/staff/new-patient" element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <Register />
            </ProtectedRoute>
          } />

            <Route path="/staff/new-appointment" element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <BookAppointment />
            </ProtectedRoute>
          } />

            <Route path="/staff/alert" element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <Alert />
            </ProtectedRoute>
          } />

          <Route path="/staff/all-appointments" element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <AllAppointments />
            </ProtectedRoute>
          } />

          {/* Global Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;