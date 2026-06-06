import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DokterDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const [pasienCount, setPasienCount] = useState(0);
  const [rekamMedisCount, setRekamMedisCount] = useState(0);
  const [resepCount, setResepCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pasienRes, rekamMedisRes, resepRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true }),
        ]);

        setPasienCount(pasienRes.data.length);
        setRekamMedisCount(rekamMedisRes.data.length);
        setResepCount(resepRes.data.length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/logout`, { withCredentials: true });
      localStorage.removeItem('role');
      navigate('/');
    } catch (error) {
      console.error("Error logging out", error);
      navigate('/');
    }
  };

  const stats = [
    { label: 'Total Pasien', value: pasienCount, icon: <i className="fa-solid fa-user-group"></i> },
    { label: 'Total Rekam Medis', value: rekamMedisCount, icon: <i className="fa-solid fa-file-medical"></i> },
    { label: 'Total Resep Obat', value: resepCount, icon: <i className="fa-solid fa-prescription"></i> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Dashboard Dokter</h1>
        <div className="relative">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 font-semibold text-green-800"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <i className="fa-solid fa-user-md text-xl text-black"></i>
            <span className="text-sm">Dokter</span>
            <i className="fa-solid fa-chevron-down text-xs"></i>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow z-10">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded border border-gray-200 p-5 flex flex-col items-start">
            <div className="text-gray-400 text-sm flex items-center mb-4">
              <span className="mr-2 text-gray-300 text-lg">{stat.icon}</span>
              <span className="font-medium">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-green-800">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-green-800 mb-4">Selamat Datang di Portal Dokter</h2>
        <p className="text-gray-600">Gunakan menu di sebelah kiri untuk mengelola data pasien, melihat rekam medis, dan membuat resep obat.</p>
      </div>
    </div>
  );
}

export default DokterDashboard;
