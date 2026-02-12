import React, { useEffect, useContext } from 'react'; // Added useContext
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import { AuthContext } from '../Contexts/AuthFile'; // Import your context

const Login = () => {
    const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Admin') navigate('/admin/dashboard');
      else if (user.role === 'Doctor') navigate('/doctor/dashboard');
      else navigate('/staff/dashboard');
    }
  }, [user, loading, navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      {/* Main Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden p-8"
      >
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-800"
          >
            Welcome Back
          </motion.h1>
          <p className="text-gray-500 mt-2">Please enter your details</p>
        </div>

        <form className="space-y-6">
          {/* Email Input */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
            />
          </motion.div>

          {/* Password Input */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </motion.div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600">
              <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2" />
              Remember me
            </label>
            <a href="#" className="text-purple-600 hover:underline font-medium">Forgot password?</a>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Sign In
          </motion.button>
        </form>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-gray-600 mt-8 text-sm"
        >
          Don't have an account? <a href="#" className="text-purple-600 font-bold hover:underline">Sign up</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;