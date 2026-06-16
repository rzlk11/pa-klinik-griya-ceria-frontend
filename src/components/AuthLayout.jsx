import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import doctorImg from '../assets/doctorImg.png';

function AuthLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role) {
      if (role === 'dokter') navigate('/dashboard/dokter');
      else if (role === 'apoteker') navigate('/dashboard/apoteker');
      else navigate('/dashboard/admin');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left side image */}
        <div className="flex items-center justify-center p-8 bg-white">
          <img
            src={doctorImg}
            alt="Doctor Illustration"
            className="rounded-xs w-80"
          />
        </div>
        {/* Right side (form) */}
        <div className="flex w-120 items-center justify-center p-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;