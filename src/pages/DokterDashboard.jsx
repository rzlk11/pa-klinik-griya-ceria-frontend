import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import ExpandablePemeriksaan from '../components/ExpandablePemeriksaan';

function DokterDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const [antrianList, setAntrianList] = useState([]);
  const [rekamMedisList, setRekamMedisList] = useState([]);
  const [resepList, setResepList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [antrianRes, rmRes, resepRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/antrian`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true })
        ]);
        setAntrianList(antrianRes.data.filter(a => ['Menunggu', 'Diperiksa', 'Menunggu Obat'].includes(a.status_antrian)));
        setRekamMedisList(rmRes.data);
        setResepList(resepRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const [expandedRowId, setExpandedRowId] = useState(null);

  const handleRowClick = (row) => {
    setExpandedRowId(prev => prev === row.id_antrian ? null : row.id_antrian);
  };

  const ExpandedComponent = ({ data }) => {
    return (
      <ExpandablePemeriksaan 
        data={data} 
        onSelesai={() => {
          // Refetch to get updated status and records
          axios.get(`${import.meta.env.VITE_API_URL}/antrian`, { withCredentials: true })
            .then(res => setAntrianList(res.data.filter(a => ['Menunggu', 'Diperiksa', 'Menunggu Obat'].includes(a.status_antrian))));
          axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis`, { withCredentials: true })
            .then(res => setRekamMedisList(res.data));
          axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true })
            .then(res => setResepList(res.data));
        }}
        toggleExpand={() => setExpandedRowId(null)}
      />
    );
  };

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


  const columns = [
    { name: 'No', selector: (row, index) => index + 1, width: '60px' },
    { name: 'Pasien', selector: row => row.pasien?.name || '-', sortable: true },
    { name: 'Dokter Tujuan', selector: row => row.terapis?.nama_terapis || '-', sortable: true },
    { name: 'Keluhan Awal', selector: row => row.keluhan || '-' },
    { name: 'BB / Suhu', cell: row => `${row.berat_badan ? row.berat_badan + 'kg' : '-'} / ${row.suhu ? row.suhu + '°C' : '-'}` },
    { name: 'Status', cell: row => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          row.status_antrian === 'Diperiksa' ? 'bg-blue-100 text-blue-800' :
          row.status_antrian === 'Menunggu Obat' ? 'bg-orange-100 text-orange-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status_antrian}
        </span>
      ), sortable: true },
    { name: 'Aksi', cell: row => {
        const isExpanded = expandedRowId === row.id_antrian;
        
        if (row.status_antrian === 'Menunggu Obat') {
          return (
            <button 
              className={`${isExpanded ? 'bg-gray-500 hover:bg-gray-600' : 'bg-orange-600 hover:bg-orange-700'} text-white px-3 py-1.5 rounded font-semibold text-sm flex items-center gap-1 whitespace-nowrap`}
              onClick={() => handleRowClick(row)}
            >
              <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-pen-to-square'}`}></i> 
              {isExpanded ? 'Tutup' : 'Edit Pemeriksaan'}
            </button>
          );
        }

        return (
          <button 
            className={`${isExpanded ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-700 hover:bg-green-800'} text-white px-4 py-1.5 rounded font-semibold text-sm whitespace-nowrap`}
            onClick={() => handleRowClick(row)}
          >
            {isExpanded ? 'Tutup' : (row.status_antrian === 'Diperiksa' ? 'Lanjutkan' : 'Periksa')}
          </button>
        );
      }, ignoreRowClick: true, width: '180px' }
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
            expandableRows
            expandableRowsComponent={ExpandedComponent}
            expandableRowExpanded={row => row.id_antrian === expandedRowId}
            onRowExpandToggled={(expanded, row) => setExpandedRowId(expanded ? row.id_antrian : null)}
            expandableRowsHideExpander
          />
        </div>
      </div>
    </div>
  );
}

export default DokterDashboard;
