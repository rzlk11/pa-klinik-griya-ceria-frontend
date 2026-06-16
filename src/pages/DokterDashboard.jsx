import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';

function DokterDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const [pasienCount, setPasienCount] = useState(0);
  const [rekamMedisCount, setRekamMedisCount] = useState(0);
  const [resepCount, setResepCount] = useState(0);
  const [antrianList, setAntrianList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pasienRes, rekamMedisRes, resepRes, antrianRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/antrian`, { withCredentials: true }),
        ]);

        setPasienCount(pasienRes.data.length);
        setRekamMedisCount(rekamMedisRes.data.length);
        setResepCount(resepRes.data.length);
        setAntrianList(antrianRes.data.filter(a => ['Menunggu', 'Diperiksa'].includes(a.status_antrian)));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/logout`, { withCredentials: true });
    } catch (error) {
      console.error("Error logging out", error);
    } finally {
      localStorage.removeItem('role');
      navigate('/');
    }
  };

  const stats = [
    { label: 'Total Pasien', value: pasienCount, icon: <i className="fa-solid fa-user-group"></i> },
    { label: 'Total Rekam Medis', value: rekamMedisCount, icon: <i className="fa-solid fa-file-medical"></i> },
    { label: 'Total Resep Obat', value: resepCount, icon: <i className="fa-solid fa-prescription"></i> },
  ];

  const columns = [
    { name: 'No', selector: (row, index) => index + 1, width: '60px' },
    { name: 'Pasien', selector: row => row.pasien?.name || '-', sortable: true },
    { name: 'Dokter Tujuan', selector: row => row.terapis?.nama_terapis || '-', sortable: true },
    { name: 'Keluhan Awal', selector: row => row.keluhan || '-' },
    { name: 'BB / Suhu', cell: row => `${row.berat_badan ? row.berat_badan + 'kg' : '-'} / ${row.suhu ? row.suhu + '°C' : '-'}` },
    { name: 'Status', cell: row => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status_antrian === 'Diperiksa' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {row.status_antrian}
        </span>
      ), sortable: true },
    { name: 'Aksi', cell: row => (
        <button 
          className="bg-green-700 text-white px-4 py-1.5 rounded hover:bg-green-800 font-semibold text-sm"
          onClick={() => navigate(`/pemeriksaan/${row.id_antrian}`)}
        >
          {row.status_antrian === 'Diperiksa' ? 'Lanjutkan' : 'Periksa'}
        </button>
      ), ignoreRowClick: true, width: '120px' }
  ];

  const customStyles = {
    headRow: { style: { backgroundColor: '#f0fdf4', borderBottom: '2px solid #166534' } },
    headCells: { style: { color: '#166534', fontWeight: '700', fontSize: '14px' } },
    rows: { style: { fontSize: '14px' } },
  };

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
            <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg border border-gray-200 z-10">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold text-sm"
              >
                <i className="fa-solid fa-sign-out-alt mr-2"></i> Logout
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

      <div className="bg-white rounded border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-green-800 mb-2">Antrian Pasien</h2>
        <p className="text-gray-600 mb-6">Daftar pasien yang sedang menunggu atau sedang diperiksa hari ini.</p>
        <div className="border rounded-lg overflow-hidden">
          <DataTable 
            columns={columns} 
            data={antrianList} 
            customStyles={customStyles}
            noDataComponent={<div className="p-4 text-gray-500 text-center">Tidak ada antrian saat ini.</div>}
            highlightOnHover
          />
        </div>
      </div>
    </div>
  );
}

export default DokterDashboard;
