import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Select from 'react-select';

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

function KelolaResepModal({ idResep, onClose }) {
  const id = idResep;
  const [resep, setResep] = useState(null);
  const [obatList, setObatList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRows, setSelectedRows] = useState([]);
  const [clearSelectedRows, setClearSelectedRows] = useState(false);
  const handleRowSelected = React.useCallback(state => setSelectedRows(state.selectedRows), []);

  const handleBulkDelete = async () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedRows.length} obat terpilih?`)) {
      try {
        await Promise.all(selectedRows.map(row => 
          axios.delete(`${import.meta.env.VITE_API_URL}/detail-resep-obat/${row.id_detail_resep}`, { withCredentials: true })
        ));
        setSelectedRows([]);
        setClearSelectedRows(!clearSelectedRows);
        fetchData();
      } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan saat menghapus beberapa data.");
      }
    }
  };

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
          catatan_terapis: form.catatan_terapis.value
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
    { name: 'Catatan Dokter', selector: row => row.catatan_terapis || '-', wrap: true },
    { name: 'Aksi', width: '180px', cell: (row) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
          <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Hapus</button>
        </div>
      ), ignoreRowClick: true },
  ], []);

  if (loading) return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg text-center">Memuat data...</div>
    </div>
  );
  if (!resep) return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl text-center">
        <h2 className="text-2xl text-gray-600 mb-4">Resep obat tidak ditemukan</h2>
        <button onClick={onClose} className="text-green-700 hover:underline">Tutup</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-5xl my-auto">
        <div className="p-6 h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-green-800">Kelola Obat untuk Resep #{resep.id_resep}</h1>
            <button onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-bold">
              <i className="fa-solid fa-times mr-2"></i> Tutup
            </button>
          </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-green-700">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Informasi Resep</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div><span className="text-gray-500 mr-2">Tanggal Resep:</span><span className="font-semibold">{resep.tanggal_resep}</span></div>
          <div><span className="text-gray-500 mr-2">Status Resep:</span>
            <span className={`font-semibold ${resep.status_resep === 'Aktif' ? 'text-green-700' : resep.status_resep === 'Selesai' ? 'text-blue-700' : 'text-red-700'}`}>
              {resep.status_resep}
            </span>
          </div>
          <div><span className="text-gray-500 mr-2">ID Rekam Medis:</span><span className="font-semibold">{resep.id_rekam_medis || '-'}</span></div>
        </div>
        {resep.resep_teks && resep.resep_teks.trim() !== '' && (
          <div className="border-t pt-4 mt-2">
            <span className="text-gray-500 font-semibold mb-2 block">Teks Resep (Catatan Dokter):</span>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded font-mono text-sm whitespace-pre-wrap text-gray-700">
              {resep.resep_teks}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-800">Daftar Obat</h2>
        <div className="flex gap-2">
          {selectedRows.length > 0 && (
            <button className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 flex items-center gap-2 shadow" onClick={handleBulkDelete}>
              <i className="fa-solid fa-trash"></i> Hapus Terpilih ({selectedRows.length})
            </button>
          )}
          <button className="bg-green-800 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900 shadow" onClick={handleAdd}>
            Tambah Obat
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
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
          selectableRows onSelectedRowsChange={handleRowSelected} clearSelectedRows={clearSelectedRows}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
                {(() => {
                  const obatOptions = obatList.map(o => ({
                    value: o.id_obat,
                    label: `${o.nama_obat} (Kekuatan: ${o.kekuatan || '-'} | Stok: ${o.stok} ${o.satuan})`
                  }));

                  return (
                    <div>
                      <label className="block mb-1">Pilih Obat</label>
                      <Select
                        name="id_obat"
                        options={obatOptions}
                        value={obatOptions.find(o => o.value === Number(selectedObatId)) || null}
                        onChange={(option) => setSelectedObatId(option ? option.value : '')}
                        isClearable
                        placeholder="-- Pilih Obat --"
                      />
                    </div>
                  );
                })()}

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
                  <textarea name="catatan_terapis" placeholder="Opsional" defaultValue={selectedDetail?.catatan_terapis || ''} className="w-full border px-3 py-2 rounded" />
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
      </div>
    </div>
  );
}

export default KelolaResepModal;
