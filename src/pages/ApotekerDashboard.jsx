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
             id_antrian: row.id_antrian,
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
    } catch (error) {
      console.error("Error logging out", error);
    } finally {
      localStorage.removeItem('role');
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
    { name: 'Detail Resep', cell: row => {
        const resep = [...resepList]
          .filter(r => r.rekam_medis_detail?.id_pasien == row.id_pasien)
          .sort((a, b) => b.id_resep - a.id_resep)[0];
          
        if (!resep || !resep.details || resep.details.length === 0) {
           return <span className="text-gray-400 italic">Belum ada resep / data tidak sinkron</span>;
        }

        return (
          <div className="py-2 flex flex-col gap-2 w-full">
            {resep.details.map((d, i) => (
              <div key={i} className="border border-green-100 bg-green-50 rounded p-2 text-xs w-full">
                <div className="font-bold text-green-800 text-sm mb-1">{d.obat?.nama_obat || 'Unknown Obat'}</div>
                <div className="grid grid-cols-2 gap-1 text-gray-700">
                  <div><span className="text-gray-500">Dosis:</span> {d.dosis || '-'}</div>
                  <div><span className="text-gray-500">Total:</span> <span className="font-semibold text-blue-700">{d.jumlah_obat} {d.obat?.satuan || ''}</span></div>
                </div>
                <div className="mt-1">
                  <span className="text-gray-500">Aturan Pakai:</span> <span className="font-semibold">{d.aturan_pakai || '-'}</span>
                </div>
                {d.catatan_terapis && d.catatan_terapis !== '-' && (
                  <div className="mt-2 text-red-700 font-semibold bg-red-100 p-1.5 rounded border border-red-200">
                    <i className="fa-solid fa-triangle-exclamation mr-1"></i> Catatan Dokter: {d.catatan_terapis}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
    }, width: '380px' },
    { name: 'Aksi', cell: row => (
        <div className="flex gap-2">
          <button 
            className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-semibold text-sm"
            onClick={() => handleLihatResep(row)}
          >
            Buka Hal. Resep
          </button>
          <button 
            className="bg-green-700 text-white px-3 py-1.5 rounded hover:bg-green-800 font-semibold text-sm"
            onClick={() => handleSelesaikanAntrian(row)}
          >
            Selesaikan
          </button>
        </div>
      ), ignoreRowClick: true, width: '250px' }
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
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/penjualan-langsung')}
            className="flex items-center gap-2 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 shadow-md font-semibold"
          >
            <i className="fa-solid fa-cash-register"></i> Kasir Apotek
          </button>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 font-semibold"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <i className="fa-solid fa-user-circle text-xl"></i>
              <span className="text-sm">Apoteker</span>
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
