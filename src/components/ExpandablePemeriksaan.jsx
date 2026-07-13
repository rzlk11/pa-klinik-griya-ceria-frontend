import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

function ExpandablePemeriksaan({ data, onSelesai, toggleExpand }) {
  const id = data.id_antrian;
  
  const [antrian, setAntrian] = useState(data);
  const [riwayatMedis, setRiwayatMedis] = useState([]);
  const [pelayananList, setPelayananList] = useState([]);
  const [obatList, setObatList] = useState([]);
  const [resepList, setResepList] = useState([]);
  
  const [diagnosa, setDiagnosa] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [catatan, setCatatan] = useState('');
  
  const [resepTeks, setResepTeks] = useState('');
  
  const [resepMode, setResepMode] = useState('teks'); // 'teks' or 'terstruktur'
  const [resepDetails, setResepDetails] = useState([]);
  const [isPuyer, setIsPuyer] = useState(false);
  const [dosisPuyer, setDosisPuyer] = useState('');
  const [permintaanPuyer, setPermintaanPuyer] = useState('');
  const [currentObatId, setCurrentObatId] = useState('');
  const [currentDosis, setCurrentDosis] = useState('');
  const [currentJumlah, setCurrentJumlah] = useState('');
  const [currentAturan, setCurrentAturan] = useState('');
  const [currentCatatan, setCurrentCatatan] = useState('');

  // Modal Summary State
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Modal Cari Resep State
  const [showCariResepModal, setShowCariResepModal] = useState(false);
  const [cariResepKeyword, setCariResepKeyword] = useState('');
  
  // Existing Record State
  const [existingIdRekamMedis, setExistingIdRekamMedis] = useState(null);
  const [existingIdResep, setExistingIdResep] = useState(null);
  const [existingDetailResepIds, setExistingDetailResepIds] = useState([]);
  
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
        
        const [pelRes, obRes, resepRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/pelayanan`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/obat`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true })
        ]);
        setPelayananList(pelRes.data);
        setObatList(obRes.data);
        setResepList(resepRes.data);
        
        // Load existing examination data if any
        const currentRm = rmRes.data.find(rm => rm.id_antrian === antRes.data.id_antrian);
        if (currentRm) {
          setExistingIdRekamMedis(currentRm.id_rekam_medis || currentRm.id);
          setDiagnosa(currentRm.diagnosa || '');
          setTindakan(currentRm.tindakan || '');
          setCatatan(currentRm.catatan || '');
          
          const currentResep = resepRes.data.find(r => r.id_rekam_medis === (currentRm.id_rekam_medis || currentRm.id));
          if (currentResep) {
            setExistingIdResep(currentResep.id_resep || currentResep.id);
            if (currentResep.resep_teks && currentResep.resep_teks.trim() !== '') {
              setResepMode('teks');
              setResepTeks(currentResep.resep_teks);
            } else if (currentResep.details && currentResep.details.length > 0) {
              setResepMode('terstruktur');
              setResepDetails(currentResep.details);
              setExistingDetailResepIds(currentResep.details.map(d => d.id_detail_resep));
            }
          }
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchInitialData();
  }, [id]);

  const selectedObat = obatList.find(o => o.id_obat === Number(currentObatId));
  const calculatedJumlah = isPuyer && selectedObat && dosisPuyer && permintaanPuyer
    ? Math.ceil((parseFloat(dosisPuyer) / parseFloat(selectedObat.kekuatan || 1)) * parseFloat(permintaanPuyer))
    : '';

  useEffect(() => {
    if (isPuyer && calculatedJumlah !== '') setCurrentJumlah(calculatedJumlah);
  }, [isPuyer, calculatedJumlah]);

  const handleAddDetail = () => {
    if (!currentObatId || !currentJumlah || !currentAturan) return alert('Pilih obat, isi jumlah dan aturan pakai!');
    const obat = obatList.find(o => o.id_obat === Number(currentObatId));
    
    setResepDetails([
      ...resepDetails, 
      {
        id_obat: Number(currentObatId),
        obat,
        dosis: isPuyer ? `${dosisPuyer}mg (Puyer)` : currentDosis,
        jumlah_obat: Number(currentJumlah),
        aturan_pakai: currentAturan,
        catatan_terapis: currentCatatan
      }
    ]);
    
    // reset form
    setCurrentObatId(''); setCurrentDosis(''); setCurrentJumlah('');
    setCurrentAturan(''); setCurrentCatatan(''); setIsPuyer(false);
    setDosisPuyer(''); setPermintaanPuyer('');
  };

  const handleRemoveDetail = (index) => {
    setResepDetails(resepDetails.filter((_, i) => i !== index));
  };



  const handleSelesaikanPemeriksaan = async () => {
    try {
      // 1. Buat / Update Rekam Medis
      const rmData = {
        id_pasien: antrian.id_pasien,
        id_terapis: antrian.id_terapis,
        id_pelayanan: antrian.id_pelayanan || null,
        id_antrian: antrian.id_antrian,
        diagnosa,
        tindakan,
        catatan,
        berat_badan: antrian.berat_badan,
        suhu: antrian.suhu
      };
      
      let idRekamMedis = existingIdRekamMedis;
      if (existingIdRekamMedis) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/rekam-medis/${existingIdRekamMedis}`, rmData, { withCredentials: true });
      } else {
        const rmRes = await axios.post(`${import.meta.env.VITE_API_URL}/rekam-medis`, rmData, { withCredentials: true });
        idRekamMedis = rmRes.data.data?.id_rekam_medis || rmRes.data.data?.id;
      }

      // 2. Buat / Update Resep Obat (jika ada resep)
      const hasResepTeks = resepMode === 'teks' && resepTeks.trim() !== '';
      const hasResepStruktur = resepMode === 'terstruktur' && resepDetails.length > 0;
      
      if (hasResepTeks) {
        const resepData = {
          id_rekam_medis: idRekamMedis,
          tanggal_resep: new Date().toISOString().split('T')[0],
          status_resep: 'Aktif',
          resep_teks: resepTeks
        };
        if (existingIdResep) {
          await axios.patch(`${import.meta.env.VITE_API_URL}/resep-obat/${existingIdResep}`, resepData, { withCredentials: true });
        } else {
          await axios.post(`${import.meta.env.VITE_API_URL}/resep-obat`, resepData, { withCredentials: true });
        }
      } else if (hasResepStruktur) {
        const resepData = { 
          id_rekam_medis: idRekamMedis, 
          tanggal_resep: new Date().toISOString().split('T')[0], 
          status_resep: 'Aktif'
        };
        
        let currentIdResep = existingIdResep;
        if (existingIdResep) {
          await axios.patch(`${import.meta.env.VITE_API_URL}/resep-obat/${existingIdResep}`, resepData, { withCredentials: true });
          
          // Hapus detail lama agar tidak menumpuk saat update
          for (const oldId of existingDetailResepIds) {
            try {
              await axios.delete(`${import.meta.env.VITE_API_URL}/detail-resep-obat/${oldId}`, { withCredentials: true });
            } catch (e) { console.error(e) }
          }
        } else {
          const resRes = await axios.post(`${import.meta.env.VITE_API_URL}/resep-obat`, resepData, { withCredentials: true });
          currentIdResep = resRes.data.data?.id_resep || resRes.data.data?.id;
        }

        // Post detail resep baru
        for (const detail of resepDetails) {
          const detailData = {
            id_resep: currentIdResep,
            id_obat: detail.id_obat,
            dosis: detail.dosis,
            jumlah_obat: detail.jumlah_obat,
            aturan_pakai: detail.aturan_pakai,
            catatan_terapis: detail.catatan_terapis
          };
          await axios.post(`${import.meta.env.VITE_API_URL}/detail-resep-obat`, detailData, { withCredentials: true });
        }
      }

      // 4. Update Status Antrian & Buat Transaksi jika tanpa resep
      const hasResep = hasResepTeks || hasResepStruktur;
      
      if (!hasResep) {
        // Karena hanya konsultasi, antrian langsung selesai dan buat transaksi
        let biayaPelayanan = 0;
        if (antrian.id_pelayanan) {
          const pel = pelayananList.find(p => p.id_pelayanan === antrian.id_pelayanan);
          if (pel) biayaPelayanan = Number(pel.harga) || 0;
        }

        const trxData = {
          id_pasien: antrian.id_pasien,
          id_pelayanan: antrian.id_pelayanan || '',
          id_terapis: antrian.id_terapis || '',
          id_antrian: antrian.id_antrian,
          tanggal_transaksi: antrian.tanggal_antrian || new Date().toISOString().split('T')[0],
          total_biaya: biayaPelayanan
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

        await axios.patch(`${import.meta.env.VITE_API_URL}/antrian/${id}`, {
          status_antrian: 'Selesai'
        }, { withCredentials: true });
      } else {
        // Ada resep, maka lanjut ke Apoteker
        await axios.patch(`${import.meta.env.VITE_API_URL}/antrian/${id}`, {
          status_antrian: 'Menunggu Obat'
        }, { withCredentials: true });
      }

      // Siapkan data summary untuk modal
      let biayaPel = 0;
      let namaPel = antrian.pelayanan?.nama_pelayanan || '-';
      if (antrian.id_pelayanan) {
        const pel = pelayananList.find(p => p.id_pelayanan === antrian.id_pelayanan);
        if (pel) biayaPel = Number(pel.harga) || 0;
      }

      setSummaryData({
        nama_pasien: antrian.pasien?.name,
        pelayanan: namaPel,
        biaya_pelayanan: biayaPel,
        resep_teks: resepTeks,
        has_resep: hasResep,
        is_terstruktur: hasResepStruktur,
        resep_details: resepDetails,
        has_transaksi: !hasResep
      });

      setShowSummary(true);
    } catch (error) {
      console.error(error);
      alert('Gagal menyelesaikan pemeriksaan: ' + (error.response?.data?.msg || error.message));
    }
  };

  if (!antrian) return <div className="p-8 text-center text-gray-500">Memuat data pasien...</div>;

  return (
    <div className="bg-green-50 p-6 border-b-2 border-green-700 shadow-inner">
      <div className="flex items-center gap-2 mb-4 border-b border-green-200 pb-2">
        <i className="fa-solid fa-stethoscope text-green-700 text-xl"></i>
        <h2 className="text-xl font-bold text-green-800">Pemeriksaan: {data.pasien?.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiri: Info Pasien & Riwayat */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-lg shadow border-t-4 border-green-700 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Data Kunjungan</h2>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500 block">Nama Pasien</span><strong className="text-lg">{antrian.pasien?.name}</strong></div>
              <div><span className="text-gray-500 block">Tanggal Kunjungan</span><strong>{antrian.tanggal_antrian}</strong></div>
              <div><span className="text-gray-500 block">Pelayanan Kesehatan</span><strong className="text-lg">{antrian.pelayanan?.nama_pelayanan || '-'}</strong></div>
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
              {riwayatMedis.length > 0 ? riwayatMedis.map((rm, idx) => {
                const resep = resepList.find(r => String(r.id_rekam_medis) === String(rm.id_rekam_medis || rm.id));
                return (
                <div key={idx} className="p-3 border border-gray-200 rounded bg-gray-50 text-sm">
                  <div className="text-xs text-green-700 font-semibold mb-1">{new Date(rm.createdAt).toLocaleDateString('id-ID')}</div>
                  <div className="mb-1"><span className="text-gray-500">Diagnosa:</span> {rm.diagnosa || '-'}</div>
                  <div className="mb-1"><span className="text-gray-500">Tindakan:</span> {rm.tindakan || '-'}</div>
                  <div><span className="text-gray-500">Pelayanan:</span> {rm.pelayanan?.nama_pelayanan || '-'}</div>
                  
                  {resep && resep.resep_teks && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-gray-500 text-xs mb-1">Resep Obat:</div>
                      <div className="bg-white p-2 rounded border border-gray-200 text-xs font-mono whitespace-pre-wrap mb-2">
                        {resep.resep_teks}
                      </div>
                      <button 
                        onClick={() => {
                          setResepMode('teks');
                          setResepTeks(resep.resep_teks);
                          // Optionally scroll to resep input
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <i className="fa-solid fa-copy"></i> Gunakan Resep Ini
                      </button>
                    </div>
                  )}
                </div>
              )}) : (
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
            <div className="mb-4 border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Penyusunan Resep Obat</h2>
                <p className="text-sm text-gray-500">Pilih metode penyusunan resep obat.</p>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1 border">
                <button 
                  onClick={() => setResepMode('teks')} 
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${resepMode === 'teks' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Resep Teks
                </button>
                <button 
                  onClick={() => setResepMode('terstruktur')} 
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${resepMode === 'terstruktur' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Pilih Obat
                </button>
              </div>
            </div>
            
            {resepMode === 'teks' ? (
              <div className="animate-fade-in">
                <div className="flex justify-end mb-3">
                  <button 
                    onClick={() => setShowCariResepModal(true)}
                    className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 text-sm font-semibold flex items-center gap-2 transition"
                  >
                    <i className="fa-solid fa-search"></i> Cari Resep Pasien Lain
                  </button>
                </div>
                <textarea 
                  rows="6" 
                  value={resepTeks} 
                  onChange={e => setResepTeks(e.target.value)} 
                  className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" 
                  placeholder="Contoh:&#10;1. Paracetamol 500mg 3x1&#10;2. Amoxicillin 500mg 3x1 (Habiskan)"
                ></textarea>
              </div>
            ) : (
              <div className="animate-fade-in">
                {/* Daftar Obat Terpilih */}
                {resepDetails.length > 0 && (
                  <div className="mb-5">
                    <h3 className="font-semibold text-gray-700 mb-2">Obat Terpilih:</h3>
                    <div className="space-y-2">
                      {resepDetails.map((d, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50 p-3 border rounded shadow-sm">
                          <div className="text-sm">
                            <strong className="text-green-800 text-base">{d.obat?.nama_obat}</strong> 
                            <span className="text-gray-500 ml-2 text-xs">(Dosis: {d.dosis || '-'})</span> <br/>
                            <span className="text-gray-700">Jumlah: {d.jumlah_obat} {d.obat?.satuan} | Aturan: {d.aturan_pakai}</span>
                          </div>
                          <button onClick={() => handleRemoveDetail(i)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded hover:bg-red-100 transition">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Tambah Obat */}
                <div className="bg-gray-50 p-5 border rounded-lg shadow-inner">
                  <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2"><i className="fa-solid fa-plus-circle text-blue-600 mr-2"></i> Tambah Obat ke Resep</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Obat</label>
                      <Select
                        options={obatList.map(o => ({ value: o.id_obat, label: `${o.nama_obat} (Kekuatan: ${o.kekuatan || '-'} | Stok: ${o.stok} ${o.satuan})` }))}
                        value={currentObatId ? { value: currentObatId, label: obatList.find(o => o.id_obat === Number(currentObatId))?.nama_obat } : null}
                        onChange={opt => setCurrentObatId(opt ? opt.value : '')}
                        placeholder="-- Cari Obat --"
                        isClearable
                      />
                    </div>
                    
                    <label className="flex items-center gap-2 mb-2 cursor-pointer bg-blue-50 p-3 rounded border border-blue-200 hover:bg-blue-100 transition">
                      <input type="checkbox" checked={isPuyer} onChange={(e) => setIsPuyer(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                      <span className="font-semibold text-blue-800 text-sm">Gunakan Perhitungan Obat Puyer</span>
                    </label>

                    {isPuyer ? (
                      <div className="p-4 bg-white rounded border border-gray-200 space-y-3 shadow-sm">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Dosis (mg)</label>
                            <input type="number" step="0.01" value={dosisPuyer} onChange={e => setDosisPuyer(e.target.value)} className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Permintaan (Bungkus)</label>
                            <input type="number" step="0.01" value={permintaanPuyer} onChange={e => setPermintaanPuyer(e.target.value)} className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">Estimasi Stok Terpotong: <strong className="text-blue-700 text-sm">{calculatedJumlah || 0}</strong> {selectedObat?.satuan}</div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosis</label>
                        <input type="text" value={currentDosis} onChange={e => setCurrentDosis(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Cth: 500mg" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                        <input type="number" min="1" value={currentJumlah} onChange={e => setCurrentJumlah(e.target.value)} readOnly={isPuyer} className={`w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${isPuyer ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`} placeholder="Cth: 10" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aturan Pakai</label>
                        <input type="text" value={currentAturan} onChange={e => setCurrentAturan(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Cth: 3x1 sesudah makan" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                      <input type="text" value={currentCatatan} onChange={e => setCurrentCatatan(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Opsional" />
                    </div>

                    <button onClick={handleAddDetail} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded mt-4 hover:bg-blue-700 text-sm shadow transition">
                      Tambahkan ke Resep
                    </button>
                  </div>
                </div>
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

      {/* Summary Modal */}
      {showSummary && summaryData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-green-700 text-white p-4 text-center">
              <i className="fa-solid fa-circle-check text-4xl mb-2"></i>
              <h2 className="text-2xl font-bold">Pemeriksaan Selesai</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-bold text-gray-800 mb-2">Detail Pasien</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-semibold">{summaryData.nama_pasien}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Pelayanan:</span>
                  <span className="font-semibold">{summaryData.pelayanan}</span>
                </div>
              </div>

              {summaryData.has_resep ? (
                <div className="border-b pb-4">
                  <h3 className="font-bold text-gray-800 mb-2">Detail Resep Obat</h3>
                  {summaryData.is_terstruktur ? (
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                      <ul className="list-disc pl-4 space-y-1">
                        {summaryData.resep_details.map((d, i) => (
                          <li key={i}>{d.obat?.nama_obat} ({d.jumlah_obat} {d.obat?.satuan}) - {d.aturan_pakai}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm whitespace-pre-wrap font-mono">
                      {summaryData.resep_teks}
                    </div>
                  )}
                  <div className="mt-4 text-sm text-yellow-800 bg-yellow-50 p-3 rounded border border-yellow-200 flex items-start gap-2">
                    <i className="fa-solid fa-info-circle mt-0.5"></i>
                    <span>Pasien diarahkan ke <strong>Apoteker</strong> untuk pengambilan obat dan konfirmasi harga.</span>
                  </div>
                </div>
              ) : (
                <div className="border-b pb-4">
                  <h3 className="font-bold text-gray-800 mb-2">Detail Transaksi</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Biaya Pelayanan:</span>
                    <span className="font-semibold">Rp {summaryData.biaya_pelayanan.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-3 text-green-700 font-bold border-t pt-3">
                    <span>Total Tagihan:</span>
                    <span className="text-lg">Rp {summaryData.biaya_pelayanan.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => {
                  setShowSummary(false);
                  if (onSelesai) onSelesai();
                  if (toggleExpand) toggleExpand();
                }}
                className="w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 transition shadow-md"
              >
                Tutup & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cari Resep Pasien Lain */}
      {showCariResepModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-800"><i className="fa-solid fa-search text-blue-600 mr-2"></i> Cari Resep Pasien Lain</h2>
              <button onClick={() => setShowCariResepModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 border-b bg-white">
              <input 
                type="text" 
                placeholder="Cari berdasarkan nama pasien, diagnosa, atau isi resep..." 
                value={cariResepKeyword}
                onChange={e => setCariResepKeyword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4 bg-gray-100">
              {(() => {
                const filtered = resepList.filter(r => {
                  if (!r.resep_teks || r.resep_teks.trim() === '') return false;
                  
                  // Optional: if we want to exclude the CURRENT patient from "Pasien Lain"
                  if (String(r.rekam_medis_detail?.id_pasien) === String(antrian?.id_pasien)) return false;

                  const kw = cariResepKeyword.toLowerCase();
                  if (!kw) return true;
                  return (
                    (r.resep_teks && r.resep_teks.toLowerCase().includes(kw)) ||
                    (r.rekam_medis_detail?.pasien?.name && r.rekam_medis_detail.pasien.name.toLowerCase().includes(kw)) ||
                    (r.rekam_medis_detail?.diagnosa && r.rekam_medis_detail.diagnosa.toLowerCase().includes(kw))
                  );
                });

                if (filtered.length === 0) return <div className="text-center text-gray-500 py-8 bg-white rounded-lg border">Tidak ada resep teks yang ditemukan dari pasien lain.</div>;

                return filtered.map(r => (
                  <div key={r.id_resep} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-gray-800 text-lg">{r.rekam_medis_detail?.pasien?.name || 'Pasien Tidak Diketahui'}</div>
                        <div className="text-sm text-gray-600 mt-1"><span className="font-semibold">Diagnosa:</span> {r.rekam_medis_detail?.diagnosa || '-'}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setResepMode('teks');
                          setResepTeks(r.resep_teks);
                          setShowCariResepModal(false);
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                      >
                        <i className="fa-solid fa-copy"></i> Salin ke Form
                      </button>
                    </div>
                    <div className="bg-gray-50 border p-3 rounded text-sm font-mono whitespace-pre-wrap text-gray-700 mt-3 max-h-32 overflow-y-auto">
                      {r.resep_teks}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpandablePemeriksaan;
