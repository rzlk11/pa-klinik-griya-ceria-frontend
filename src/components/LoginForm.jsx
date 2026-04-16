import React, { useState } from 'react';
import doctorImg from '../assets/doctorImg.png';
import CircularProgress from '@mui/material/CircularProgress';
import { Link, useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const correctEmail = "test@gmail.com";
  const correctPassword = "test";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email === correctEmail && password === correctPassword) {
        setLoginMsg("");
        navigate('/dashboard');
      } else {
        setLoginMsg("Email atau Password Salah");
      }
      setLoading(false);
    }, 1500);
  }

  return (
        <div className="w-full p-8">
          <h2 className="text-2xl font-semibold text-center text-green-800 mb-6">Login</h2>
          {loginMsg && (
            <div className='mb-4 text-center text-red-600 font-medium'>
              {loginMsg}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-2 flex">
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-sm text-gray-700">Remember me</label>
            </div>
            <div className='mb-2'>
              <p className='text-gray-700'>Don't have an account? Register <Link to="/register" className='text-green-800 underline'>here</Link></p>
            </div>
            <button
              type="submit"
              className="w-full bg-green-800 text-white py-2 rounded-md hover:bg-green-900"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Login'}
            </button>
          </form>
        </div>
  );
}

export default LoginForm;