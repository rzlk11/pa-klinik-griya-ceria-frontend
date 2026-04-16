import React from 'react';
import { Outlet } from 'react-router-dom';
import doctorImg from '../assets/doctorImg.png';

function AuthLayout() {
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