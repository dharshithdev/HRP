import React, { useContext } from 'react'; // Added useContext
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './Contexts/AuthFile'; // Import both
import Login from './Pages/Login';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ProtectedRoute from './Components/ProtectRoute';

// Separate the Redirect Logic
const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>; 

  if (!user) return <Navigate to="/login" />;
  if (user.role === 'Admin') return <Navigate to="/admin/dashboard" />;
  // Add other roles here
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;