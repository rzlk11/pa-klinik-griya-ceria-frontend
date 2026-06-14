import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';

function ApotekerDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const [obatCount, setObatCount] = useState(0);
  const [resepCount, setResepCount] = useState(0);
  const [antrianList, setAntrianList] = useState([]);
  const [resepList, setResepList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [obatRes, resepRes, antrianRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/obat`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/antrian`, { withCredentials: true }),
        ]);

        setObatCount(obatRes.data.length);
        setResepCount(resepRes.data.length);
        setResepList(resepRes.data);
        setAntrianList(antrianRes.data.filter(a => a.status_antrian === 'Menunggu Obat'));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSelesaikanAntrian = async (row) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/antrian/${row.id_antrian}`, {
        status_antrian: 'Selesai'
      }, { withCredentials: true });

      try {
        const resep = [...resepList]
          .filter(r => r.rekam_medis_detail?.id_pasien == row.id_pasien)
          .sort((a, b) => b.id_resep - a.id_resep)[0];

        if (resep && resep.rekam_medis_detail) {
           const idRekamMedis = resep.rekam_medis_detail.id_rekam_medis;
           const rmRes = await axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis/${idRekamMedis}`, { withCredentials: true });
           const rmData = rmRes.data;

           let biayaObat = 0;
           if (resep.details) {
             resep.details.forEach(d => {
               biayaObat += Number(d.jumlah_obat) * Number(d.obat?.harga_per_unit || 0);
             });
           }

           let biayaPelayanan = 0;
           if (rmData.pelayanan) {
              biayaPelayanan = Number(rmData.pelayanan.harga || 0);
           }

           const trxData = {
             id_pasien: row.id_pasien,
             id_pelayanan: rmData.id_pelayanan || '',
             id_resep: resep.id_resep,
             id_terapis: row.id_terapis || '',
             tanggal_transaksi: row.tanggal_antrian,
             total_biaya: biayaObat + biayaPelayanan
           };
           
           const formData = new FormData();
           Object.keys(trxData).forEach(key => {
             if (trxData[key] !== null && trxData[key] !== undefined && trxData[key] !== '') {
               formData.append(key, trxData[key]);
             }
           });

           await axios.post(`${import.meta.env.VITE_API_URL}/transaksi`, formData, { 
             headers: { 'Content-Type': 'multipart/form-data' },
             withCredentials: true 
           });
        }
      } catch (err) {
        console.error("Gagal buat transaksi otomatis:", err);
      }

      setAntrianList(prev => prev.filter(a => a.id_antrian !== row.id_antrian));
      alert('Antrian pasien selesai dan Transaksi otomatis dibuat!');
    } catch (error) {
      console.error(error);
      alert('Gagal menyelesaikan antrian');
    }
  };

  const handleLihatResep = (row) => {
    // Cari resep terbaru untuk id_pasien tersebut tanpa membandingkan tanggal (menghindari isu zona waktu)
    const resep = [...resepList]
      .filter(r => r.rekam_medis_detail?.id_pasien == row.id_pasien)
      .sort((a, b) => b.id_resep - a.id_resep)[0];

    if (resep) {
      navigate(`/resep-obat/${resep.id_resep}/detail`);
    } else {
      alert('Data resep untuk pasien ini belum ditemukan atau belum disinkronisasi.');
      navigate('/resep-obat');
    }
  };

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
    { label: 'Total Resep Obat', value: resepCount, icon: <i className="fa-solid fa-prescription"></i> },
    { label: 'Menunggu Obat', value: antrianList.length, icon: <i className="fa-solid fa-clock text-orange-500"></i> },
  ];

  const columns = [
    { name: 'No', selector: (row, index) => index + 1, width: '60px' },
    { name: 'Pasien', selector: row => row.pasien?.name || '-', sortable: true },
    { name: 'Dokter/Terapis', selector: row => row.terapis?.nama_terapis || '-', sortable: true },
    { name: 'Aksi', cell: row => (
        <div className="flex gap-2">
          <button 
            className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-semibold text-sm"
            onClick={() => handleLihatResep(row)}
          >
            Lihat Resep
          </button>
          <button 
            className="bg-green-700 text-white px-3 py-1.5 rounded hover:bg-green-800 font-semibold text-sm"
            onClick={() => handleSelesaikanAntrian(row)}
          >
            Selesaikan
          </button>
        </div>
      ), ignoreRowClick: true, width: '220px' }
  ];

  const customStyles = {
    headRow: { style: { backgroundColor: '#f0fdf4', borderBottom: '2px solid #166534' } },
    headCells: { style: { color: '#166534', fontWeight: '700', fontSize: '14px' } },
    rows: { style: { fontSize: '14px' } },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Dashboard Apoteker</h1>
        <div className="relative">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 font-semibold text-green-800"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <i className="fa-solid fa-pills text-xl text-black"></i>
            <span className="text-sm">Apoteker</span>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
        <h2 className="text-xl font-bold text-green-800 mb-2">Antrian Menunggu Obat</h2>
        <p className="text-gray-600 mb-6">Daftar pasien yang sedang menunggu pengambilan obat.</p>
        <div className="border rounded-lg overflow-hidden">
          <DataTable 
            columns={columns} 
            data={antrianList} 
            customStyles={customStyles}
            noDataComponent={<div className="p-4 text-gray-500 text-center">Tidak ada antrian menunggu obat.</div>}
            highlightOnHover
          />
        </div>
      </div>
    </div>
  );
}

export default ApotekerDashboard;
