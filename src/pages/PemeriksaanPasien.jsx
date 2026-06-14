import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';

function PemeriksaanPasien() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [antrian, setAntrian] = useState(null);
  const [riwayatMedis, setRiwayatMedis] = useState([]);
  const [pelayananList, setPelayananList] = useState([]);
  const [obatList, setObatList] = useState([]);
  
  const [diagnosa, setDiagnosa] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedPelayananId, setSelectedPelayananId] = useState('');
  
  const [resepDetails, setResepDetails] = useState([]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const antRes = await axios.get(`${import.meta.env.VITE_API_URL}/antrian/${id}`, { withCredentials: true });
        setAntrian(antRes.data);
        
        if (antRes.data.status_antrian === 'Menunggu') {
          // Update status to Diperiksa
          await axios.patch(`${import.meta.env.VITE_API_URL}/antrian/${id}`, {
            status_antrian: 'Diperiksa'
          }, { withCredentials: true });
          setAntrian(prev => ({ ...prev, status_antrian: 'Diperiksa' }));
        }

        const rmRes = await axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis`, { withCredentials: true });
        const pasRm = rmRes.data.filter(rm => rm.id_pasien === antRes.data.id_pasien);
        setRiwayatMedis(pasRm);
        
        const [pelRes, obRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/pelayanan`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/obat`, { withCredentials: true })
        ]);
        setPelayananList(pelRes.data);
        setObatList(obRes.data);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchInitialData();
  }, [id]);

  const handleAddObat = () => {
    setResepDetails([...resepDetails, { id_obat: '', jumlah_obat: 1, dosis: '' }]);
  };

  const handleRemoveObat = (index) => {
    const newDetails = [...resepDetails];
    newDetails.splice(index, 1);
    setResepDetails(newDetails);
  };

  const handleChangeObat = (index, field, value) => {
    const newDetails = [...resepDetails];
    newDetails[index][field] = value;
    setResepDetails(newDetails);
  };

  const handleSelesaikanPemeriksaan = async () => {
    try {
      // 1. Buat Rekam Medis
      const rmData = {
        id_pasien: antrian.id_pasien,
        id_terapis: antrian.id_terapis,
        id_pelayanan: selectedPelayananId || null,
        diagnosa,
        tindakan,
        catatan,
        berat_badan: antrian.berat_badan,
        suhu: antrian.suhu
      };
      
      const rmRes = await axios.post(`${import.meta.env.VITE_API_URL}/rekam-medis`, rmData, { withCredentials: true });
      const idRekamMedis = rmRes.data.data?.id_rekam_medis || rmRes.data.data?.id;

      // 2. Buat Resep Obat (jika ada obat)
      if (resepDetails.length > 0) {
        const resepData = {
          id_rekam_medis: idRekamMedis,
          tanggal_resep: new Date().toISOString().split('T')[0],
          status_resep: 'Aktif'
        };
        const resObatRes = await axios.post(`${import.meta.env.VITE_API_URL}/resep-obat`, resepData, { withCredentials: true });
        const idResep = resObatRes.data.data?.id_resep || resObatRes.data.data?.id;
        
        // 3. Masukkan Detail Resep
        for (const detail of resepDetails) {
          if (detail.id_obat && detail.jumlah_obat) {
            await axios.post(`${import.meta.env.VITE_API_URL}/detail-resep-obat`, {
              id_resep: idResep,
              id_obat: detail.id_obat,
              jumlah_obat: detail.jumlah_obat,
              dosis: detail.dosis || '-',
              aturan_pakai: detail.dosis || '-'
            }, { withCredentials: true });
          }
        }
      }

      // 4. Update Status Antrian
      const newStatus = resepDetails.length > 0 ? 'Menunggu Obat' : 'Selesai Periksa';
      await axios.patch(`${import.meta.env.VITE_API_URL}/antrian/${id}`, {
        status_antrian: newStatus
      }, { withCredentials: true });

      alert('Pemeriksaan selesai!');
      navigate('/dashboard/dokter');
    } catch (error) {
      console.error(error);
      alert('Gagal menyelesaikan pemeriksaan: ' + (error.response?.data?.msg || error.message));
    }
  };

  if (!antrian) return <div className="p-8 text-center text-gray-500">Memuat data pasien...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/dokter')} className="text-gray-500 hover:text-green-700 bg-white p-2 rounded-full shadow">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-3xl font-bold text-green-800">Pemeriksaan Pasien</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiri: Info Pasien & Riwayat */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-lg shadow border-t-4 border-green-700 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Data Kunjungan</h2>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500 block">Nama Pasien</span><strong className="text-lg">{antrian.pasien?.name}</strong></div>
              <div><span className="text-gray-500 block">Tanggal Kunjungan</span><strong>{antrian.tanggal_antrian}</strong></div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500 block">Berat Badan</span><strong>{antrian.berat_badan ? `${antrian.berat_badan} kg` : '-'}</strong></div>
                <div><span className="text-gray-500 block">Suhu</span><strong>{antrian.suhu ? `${antrian.suhu} °C` : '-'}</strong></div>
              </div>
              <div className="bg-yellow-50 p-3 rounded text-yellow-900 border border-yellow-200">
                <span className="font-semibold block mb-1">Keluhan Awal:</span>
                {antrian.keluhan || 'Tidak ada keluhan dicatat.'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Riwayat Rekam Medis</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {riwayatMedis.length > 0 ? riwayatMedis.map((rm, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded bg-gray-50 text-sm">
                  <div className="text-xs text-green-700 font-semibold mb-1">{new Date(rm.createdAt).toLocaleDateString('id-ID')}</div>
                  <div className="mb-1"><span className="text-gray-500">Diagnosa:</span> {rm.diagnosa || '-'}</div>
                  <div className="mb-1"><span className="text-gray-500">Tindakan:</span> {rm.tindakan || '-'}</div>
                  <div><span className="text-gray-500">Pelayanan:</span> {rm.pelayanan?.nama_pelayanan || '-'}</div>
                </div>
              )) : (
                <div className="text-gray-500 text-sm text-center py-4">Belum ada riwayat rekam medis.</div>
              )}
            </div>
          </div>
        </div>

        {/* Kanan: Form Input RM & Resep */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Form Rekam Medis</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Pelayanan Kesehatan</label>
                <Select
                  options={pelayananList.map(p => ({ value: p.id_pelayanan, label: p.nama_pelayanan }))}
                  value={pelayananList.map(p => ({ value: p.id_pelayanan, label: p.nama_pelayanan })).find(o => o.value === selectedPelayananId) || null}
                  onChange={(opt) => setSelectedPelayananId(opt ? opt.value : '')}
                  isClearable placeholder="-- Pilih Pelayanan --"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Diagnosa</label>
                <textarea rows="3" value={diagnosa} onChange={e => setDiagnosa(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Masukkan diagnosa pasien..."></textarea>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Tindakan</label>
                <textarea rows="2" value={tindakan} onChange={e => setTindakan(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Masukkan tindakan yang dilakukan..."></textarea>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Catatan Tambahan (Opsional)</label>
                <textarea rows="2" value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Catatan tambahan..."></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">Resep Obat</h2>
              <button type="button" onClick={handleAddObat} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-blue-700">
                <i className="fa-solid fa-plus mr-1"></i> Tambah Obat
              </button>
            </div>
            
            {resepDetails.length === 0 ? (
              <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-200 rounded">
                Tidak ada obat yang diresepkan. Klik "Tambah Obat" jika pasien butuh obat.
              </div>
            ) : (
              <div className="space-y-4">
                {resepDetails.map((detail, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end p-4 border border-blue-100 bg-blue-50/30 rounded">
                    <div className="w-full md:w-5/12">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Obat</label>
                      <Select
                        options={obatList.map(o => ({ value: o.id_obat, label: o.nama_obat }))}
                        value={obatList.map(o => ({ value: o.id_obat, label: o.nama_obat })).find(opt => opt.value === detail.id_obat) || null}
                        onChange={(opt) => handleChangeObat(index, 'id_obat', opt ? opt.value : '')}
                        isClearable placeholder="Cari obat..."
                      />
                    </div>
                    <div className="w-full md:w-2/12">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah</label>
                      <input type="number" min="1" value={detail.jumlah_obat} onChange={e => handleChangeObat(index, 'jumlah_obat', parseInt(e.target.value))} className="w-full border border-gray-300 rounded px-3 py-[7px] text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="w-full md:w-4/12">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Aturan Pakai / Dosis</label>
                      <input type="text" value={detail.dosis} onChange={e => handleChangeObat(index, 'dosis', e.target.value)} placeholder="Contoh: 3x1 Sesudah makan" className="w-full border border-gray-300 rounded px-3 py-[7px] text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="w-full md:w-1/12 text-right">
                      <button type="button" onClick={() => handleRemoveObat(index)} className="text-red-500 hover:bg-red-50 p-2 rounded mb-0.5">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={handleSelesaikanPemeriksaan} className="bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-800 shadow-lg flex items-center gap-2">
              <i className="fa-solid fa-check-circle"></i> Selesaikan Pemeriksaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PemeriksaanPasien;
