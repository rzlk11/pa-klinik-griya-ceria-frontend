import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';

function MainLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!role) {
      navigate('/');
    }
  }, [navigate]);
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;