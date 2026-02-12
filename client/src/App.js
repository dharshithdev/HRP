import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './Contexts/AuthFile';
import Login from './Pages/Login';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import DoctorDashboard from './Pages/Doctor/DoctorDashboard'; // New Import
import ProtectedRoute from './Components/ProtectRoute';

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

          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Doctor Protected Routes */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          {/* Staff Protected Routes (Placeholder element for now) */}
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <div className="text-white">Staff Dashboard Coming Soon...</div>
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