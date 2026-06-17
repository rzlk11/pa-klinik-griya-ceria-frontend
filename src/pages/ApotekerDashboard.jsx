import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';

function ApotekerDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const [antrianList, setAntrianList] = useState([]);
  const [resepList, setResepList] = useState([]);

  // Modal State
  const [showSelesaikanModal, setShowSelesaikanModal] = useState(false);
  const [selectedAntrianSelesai, setSelectedAntrianSelesai] = useState(null);
  const [inputHarga, setInputHarga] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resepRes, antrianRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/antrian`, { withCredentials: true }),
        ]);

        setResepList(resepRes.data);
        setAntrianList(antrianRes.data.filter(a => a.status_antrian === 'Menunggu Obat'));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const openSelesaikanModal = (row) => {
    setSelectedAntrianSelesai(row);
    
    const resep = [...resepList]
      .filter(r => r.rekam_medis_detail?.id_pasien == row.id_pasien)
      .sort((a, b) => b.id_resep - a.id_resep)[0];
      
    let totalHarga = 0;
    if (resep && resep.details && resep.details.length > 0) {
      totalHarga = resep.details.reduce((sum, d) => {
        const qty = Number(d.jumlah_obat) || 0;
        const harga = Number(d.obat?.harga_per_unit) || 0;
        return sum + (qty * harga);
      }, 0);
    }

    setInputHarga(totalHarga > 0 ? totalHarga.toLocaleString('id-ID') : '');
    setShowSelesaikanModal(true);
  };

  const closeSelesaikanModal = () => {
    setShowSelesaikanModal(false);
    setSelectedAntrianSelesai(null);
    setInputHarga('');
  };

  const handleSelesaikanAntrian = async (e) => {
    e.preventDefault();
    if (!selectedAntrianSelesai) return;

    try {
      const row = selectedAntrianSelesai;
      const biayaObatManual = Number(inputHarga.replace(/\./g, '')) || 0;

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
             total_biaya: biayaObatManual + biayaPelayanan
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
      closeSelesaikanModal();
      alert('Antrian pasien selesai dan Transaksi otomatis dibuat!');
    } catch (error) {
      console.error(error);
      alert('Gagal menyelesaikan antrian');
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


  const columns = [
    { name: 'No', selector: (row, index) => index + 1, width: '60px' },
    { name: 'Pasien', selector: row => row.pasien?.name || '-', sortable: true },
    { name: 'Dokter/Terapis', selector: row => row.terapis?.nama_terapis || '-', sortable: true },
    { name: 'Detail Resep', cell: row => {
        const resep = [...resepList]
          .filter(r => r.rekam_medis_detail?.id_pasien == row.id_pasien)
          .sort((a, b) => b.id_resep - a.id_resep)[0];
          
        let resepContent = null;
        if (resep) {
          if (resep.resep_teks) {
            resepContent = resep.resep_teks;
          } else if (resep.details && resep.details.length > 0) {
            resepContent = resep.details.map(d => `${d.obat?.nama_obat || 'Obat Tidak Diketahui'} (${d.jumlah_obat}x) - ${d.aturan_pakai}`).join('\n');
          }
        }

        if (!resepContent) {
           return <span className="text-gray-400 italic">Belum ada resep obat</span>;
        }

        return (
          <div className="py-2 w-full">
            <div className="border border-green-100 bg-green-50 rounded p-3 text-sm whitespace-pre-wrap font-mono w-full">
              {resepContent}
            </div>
          </div>
        );
    }, width: '380px' },
    { name: 'Aksi', cell: row => (
        <div className="flex gap-2">
          <button 
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 font-semibold shadow flex items-center gap-2"
            onClick={() => openSelesaikanModal(row)}
          >
            <i className="fa-solid fa-check-circle"></i> Selesaikan
          </button>
        </div>
      ), ignoreRowClick: true, width: '200px' }
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

      {showSelesaikanModal && (() => {
        const resep = [...resepList]
          .filter(r => r.rekam_medis_detail?.id_pasien == selectedAntrianSelesai?.id_pasien)
          .sort((a, b) => b.id_resep - a.id_resep)[0];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-800">
                  Selesaikan Antrian
                </h3>
                <button onClick={closeSelesaikanModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Resep Dokter:</label>
                <div className="border border-green-100 bg-green-50 rounded p-3 text-sm whitespace-pre-wrap font-mono w-full max-h-40 overflow-y-auto">
                  {(() => {
                    if (resep?.resep_teks) return resep.resep_teks;
                    if (resep?.details && resep.details.length > 0) {
                      return resep.details.map(d => `${d.obat?.nama_obat || 'Obat Tidak Diketahui'} (${d.jumlah_obat}x) - ${d.aturan_pakai}`).join('\n');
                    }
                    return <span className="text-gray-400 italic">Tidak ada resep obat.</span>;
                  })()}
                </div>
              </div>

              <form onSubmit={handleSelesaikanAntrian}>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">
                    Masukkan total harga obat untuk pasien <strong className="text-green-800">{selectedAntrianSelesai?.pasien?.name || 'ini'}</strong> (Rp):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">Rp</span>
                    <input
                      type="text"
                      value={inputHarga}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setInputHarga(val ? Number(val).toLocaleString('id-ID') : '');
                      }}
                      className="w-full border border-gray-300 px-3 py-2 pl-10 rounded focus:ring-green-500 focus:border-green-500 font-semibold text-lg"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeSelesaikanModal}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 font-semibold shadow flex items-center gap-2"
                  >
                    <i className="fa-solid fa-check"></i> Konfirmasi Selesai
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default ApotekerDashboard;
