// src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Initialize state synchronously from localStorage to prevent "flicker"
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Auth initialization error:", error);
            return null;
        }
    });

    // 2. Initializing loading based on whether we have a user/token to validate
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    // Optional: Keep useEffect if you need to verify the token with the backend on refresh
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !user) {
            // This is where you'd call a 'checkAuth' endpoint if needed
            setLoading(false);
        }
    }, [user]);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (userData.role === 'Admin') {
            navigate('/admin/dashboard');
        } else if (userData.role === 'Doctor') {
            navigate('/doctor/dashboard');
        } else {
            navigate('/staff/dashboard');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {/* If loading is true, we could show a splash screen here */}
            {loading ? (
                <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};