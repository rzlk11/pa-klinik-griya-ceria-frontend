import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';

const customStyles = {
  headRow: { style: { backgroundColor: '#f0fdf4', borderBottom: '2px solid #166534' } },
  headCells: { style: { color: '#166534', fontWeight: '700', fontSize: '14px' } },
  rows: { style: { fontSize: '14px', '&:hover': { backgroundColor: '#f0fdf4' } } },
  pagination: { style: { borderTop: '1px solid #e5e7eb', fontSize: '13px' } },
};

const paginationComponentOptions = {
  rowsPerPageText: 'Baris per halaman:', rangeSeparatorText: 'dari',
  noRowsPerPage: false, selectAllRowsItem: true, selectAllRowsItemText: 'Semua',
};

function KelolaDetailResep() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resep, setResep] = useState(null);
  const [obatList, setObatList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [isPuyer, setIsPuyer] = useState(false);
  const [selectedObatId, setSelectedObatId] = useState('');
  const [dosisPuyer, setDosisPuyer] = useState('');
  const [permintaanPuyer, setPermintaanPuyer] = useState('');
  const [jumlahObatValue, setJumlahObatValue] = useState('');

  const selectedObat = useMemo(() => obatList.find(o => o.id_obat === Number(selectedObatId)), [obatList, selectedObatId]);

  const calculatedJumlah = useMemo(() => {
    if (!isPuyer || !selectedObat || !dosisPuyer || !permintaanPuyer) return '';
    const kekuatan = parseFloat(selectedObat.kekuatan);
    if (isNaN(kekuatan) || kekuatan === 0) return 0;
    const dosis = parseFloat(dosisPuyer);
    const permintaan = parseFloat(permintaanPuyer);
    if (isNaN(dosis) || isNaN(permintaan)) return 0;
    return Math.ceil((dosis / kekuatan) * permintaan);
  }, [isPuyer, selectedObat, dosisPuyer, permintaanPuyer]);

  useEffect(() => {
    if (isPuyer && calculatedJumlah !== '') {
      setJumlahObatValue(calculatedJumlah);
    }
  }, [isPuyer, calculatedJumlah]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/resep-obat/${id}`, { withCredentials: true });
      setResep(response.data);
      
      const obatRes = await axios.get(`${import.meta.env.VITE_API_URL}/obat`, { withCredentials: true });
      setObatList(obatRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAdd = () => { 
    setModalType('add'); setSelectedDetail(null); 
    setIsPuyer(false); setSelectedObatId(''); setDosisPuyer(''); setPermintaanPuyer(''); setJumlahObatValue('');
    setShowModal(true); 
  };
  const handleEdit = (detail) => { 
    setModalType('edit'); setSelectedDetail(detail); 
    setIsPuyer(false); setSelectedObatId(detail.id_obat); setJumlahObatValue(detail.jumlah_obat);
    setShowModal(true); 
  };
  const handleDelete = (detail) => { setModalType('delete'); setSelectedDetail(detail); setShowModal(true); };
  const handleModalClose = () => { setShowModal(false); setSelectedDetail(null); };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/detail-resep-obat/${selectedDetail.id_detail_resep}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = {
          id_resep: Number(id),
          id_obat: Number(form.id_obat.value),
          dosis: isPuyer ? `${dosisPuyer}mg (Puyer)` : form.dosis.value,
          jumlah_obat: Number(form.jumlah_obat.value),
          aturan_pakai: form.aturan_pakai.value,
          catatan_dokter: form.catatan_dokter.value
        };

        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/detail-resep-obat`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/detail-resep-obat/${selectedDetail.id_detail_resep}`, data, { withCredentials: true });
        }
      }
      fetchData(); 
      handleModalClose();
    } catch (error) { console.error(error); }
  };

  const columns = useMemo(() => [
    { name: 'Nama Obat', selector: row => row.obat?.nama_obat || '-', sortable: true },
    { name: 'Dosis', selector: row => row.dosis, sortable: true },
    { name: 'Jumlah', selector: row => row.jumlah_obat, sortable: true, cell: row => `${row.jumlah_obat} ${row.obat?.satuan || ''}` },
    { name: 'Aturan Pakai', selector: row => row.aturan_pakai, sortable: true, wrap: true },
    { name: 'Catatan Dokter', selector: row => row.catatan_dokter || '-', wrap: true },
    { name: 'Aksi', cell: (row) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
          <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Hapus</button>
        </div>
      ), ignoreRowClick: true, width: '120px' },
  ], []);

  if (loading) return <div className="text-center py-20 text-gray-500">Memuat data...</div>;
  if (!resep) return (
    <div className="text-center py-20">
      <h2 className="text-2xl text-gray-600 mb-4">Resep obat tidak ditemukan</h2>
      <button onClick={() => navigate('/resep-obat')} className="text-green-700 hover:underline">Kembali</button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/resep-obat')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
          <i className="fa-solid fa-arrow-left mr-2"></i> Kembali
        </button>
        <h1 className="text-3xl font-bold text-green-800">Kelola Obat untuk Resep #{resep.id_resep}</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-green-700">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Informasi Resep</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500 mr-2">Tanggal Resep:</span><span className="font-semibold">{resep.tanggal_resep}</span></div>
          <div><span className="text-gray-500 mr-2">Status Resep:</span>
            <span className={`font-semibold ${resep.status_resep === 'Aktif' ? 'text-green-700' : resep.status_resep === 'Selesai' ? 'text-blue-700' : 'text-red-700'}`}>
              {resep.status_resep}
            </span>
          </div>
          <div><span className="text-gray-500 mr-2">ID Rekam Medis:</span><span className="font-semibold">{resep.id_rekam_medis || '-'}</span></div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-800">Daftar Obat</h2>
        <button className="bg-green-800 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900" onClick={handleAdd}>
          Tambah Obat
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={resep.details || []}
          pagination
          paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20]}
          noDataComponent={<div className="text-center text-gray-400 py-8">Belum ada obat dalam resep ini.</div>}
          customStyles={customStyles}
          highlightOnHover
          striped
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add' ? 'Tambah Obat ke Resep' : modalType === 'edit' ? 'Edit Obat Resep' : 'Hapus Obat'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">Apakah Anda yakin ingin menghapus obat <b>{selectedDetail?.obat?.nama_obat}</b> dari resep ini?</p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Hapus</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Pilih Obat</label>
                  <select name="id_obat" value={selectedObatId} onChange={(e) => setSelectedObatId(e.target.value)} required className="w-full border px-3 py-2 rounded">
                    <option value="">-- Pilih Obat --</option>
                    {obatList.map((o) => (<option key={o.id_obat} value={o.id_obat}>{o.nama_obat} (Kekuatan: {o.kekuatan || '-'} | Stok: {o.stok} {o.satuan})</option>))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 cursor-pointer bg-green-50 p-2 rounded border border-green-200">
                    <input type="checkbox" checked={isPuyer} onChange={(e) => setIsPuyer(e.target.checked)} className="w-4 h-4 text-green-600 rounded border-gray-300" />
                    <span className="font-semibold text-green-800">Gunakan Perhitungan Obat Puyer</span>
                  </label>
                </div>

                {isPuyer && (
                  <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-3 mb-4">
                    <p className="text-xs text-gray-500 mb-2">Rumus: Dosis / Kekuatan Obat * Permintaan Obat (Bungkus)</p>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block mb-1 text-sm font-medium">Dosis (mg)</label>
                        <input type="number" step="0.01" value={dosisPuyer} onChange={(e) => setDosisPuyer(e.target.value)} placeholder="Contoh: 0.8" className="w-full border px-3 py-2 rounded text-sm" />
                      </div>
                      <div className="flex-1">
                        <label className="block mb-1 text-sm font-medium">Permintaan Obat (Bungkus)</label>
                        <input type="number" step="0.01" value={permintaanPuyer} onChange={(e) => setPermintaanPuyer(e.target.value)} placeholder="Contoh: 15" className="w-full border px-3 py-2 rounded text-sm" />
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                      Kekuatan Obat: <span className="font-bold">{selectedObat ? selectedObat.kekuatan || 'Belum diatur' : '-'}</span> <br/>
                      Estimasi Stok Terpotong: <span className="font-bold text-green-800">{calculatedJumlah || 0}</span>
                    </div>
                  </div>
                )}
                <div className={isPuyer ? 'hidden' : 'block'}>
                  <label className="block mb-1">Dosis</label>
                  <input name="dosis" placeholder="Cth: 500mg" defaultValue={selectedDetail?.dosis || ''} required={!isPuyer} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1">Jumlah (Stok Dipotong)</label>
                  <input name="jumlah_obat" type="number" min="1" value={jumlahObatValue} onChange={(e) => setJumlahObatValue(e.target.value)} readOnly={isPuyer} placeholder="Cth: 10" required className={`w-full border px-3 py-2 rounded ${isPuyer ? 'bg-gray-200 cursor-not-allowed' : ''}`} />
                </div>
                <div>
                  <label className="block mb-1">Aturan Pakai</label>
                  <input name="aturan_pakai" placeholder="Cth: 3x sehari sesudah makan" defaultValue={selectedDetail?.aturan_pakai || ''} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1">Catatan Dokter</label>
                  <textarea name="catatan_dokter" placeholder="Opsional" defaultValue={selectedDetail?.catatan_dokter || ''} className="w-full border px-3 py-2 rounded" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">
                    {modalType === 'add' ? 'Tambah' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default KelolaDetailResep;
