import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import TableFilter from '../components/TableFilter';

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

function Antrian() {
  const [antrianList, setAntrianList] = useState([]);
  const [pasienList, setPasienList] = useState([]);
  const [terapisList, setTerapisList] = useState([]);
  const [transaksiList, setTransaksiList] = useState([]);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedAntrian, setSelectedAntrian] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', idPasien: '', idTerapis: '' });

  const [selectedPasienId, setSelectedPasienId] = useState('');
  const [selectedTerapisId, setSelectedTerapisId] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [fileImage, setFileImage] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const antrianRes = await axios.get(`${import.meta.env.VITE_API_URL}/antrian`, { withCredentials: true });
      setAntrianList(antrianRes.data);
      const pasienRes = await axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true });
      setPasienList(pasienRes.data);
      const terapisRes = await axios.get(`${import.meta.env.VITE_API_URL}/terapis`, { withCredentials: true });
      setTerapisList(terapisRes.data);
      const transaksiRes = await axios.get(`${import.meta.env.VITE_API_URL}/transaksi`, { withCredentials: true });
      setTransaksiList(transaksiRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = () => { 
    setModalType('add'); setSelectedAntrian(null); 
    setSelectedPasienId(''); setSelectedTerapisId('');
    setShowModal(true); 
  };
  const handleEdit = (row) => { 
    setModalType('edit'); setSelectedAntrian(row); 
    setSelectedPasienId(row.id_pasien || ''); 
    setSelectedTerapisId(row.id_terapis || '');
    setShowModal(true); 
  };
  const handleDelete = (row) => { setModalType('delete'); setSelectedAntrian(row); setShowModal(true); };
  const handleModalClose = () => { 
    setShowModal(false); setSelectedAntrian(null); setSelectedTransaction(null); 
    setPreviewImage(''); setFileImage(''); 
  };

  const handleUpload = (row, transaction) => {
    setModalType('upload');
    setSelectedAntrian(row);
    setSelectedTransaction(transaction);
    setPreviewImage(transaction.bukti_transaksi || '');
    setFileImage('');
    setShowModal(true);
  };

  const loadImage = (e) => {
    const image = e.target.files[0];
    setFileImage(image);
    if(image) setPreviewImage(URL.createObjectURL(image));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/antrian/${selectedAntrian.id_antrian}`, { withCredentials: true });
      } else if (modalType === 'upload') {
        const formData = new FormData();
        if (fileImage) {
          formData.append("bukti_transaksi", fileImage);
        }
        await axios.patch(`${import.meta.env.VITE_API_URL}/transaksi/${selectedTransaction.id_transaksi}`, formData, { 
          headers: { 'Content-Type': 'multipart/form-data' }, 
          withCredentials: true 
        });
      } else {
        const form = e.target;
        const data = {
          id_pasien: selectedPasienId,
          id_terapis: selectedTerapisId,
          tanggal_antrian: form.tanggal_antrian.value,
          keluhan: form.keluhan.value,
          berat_badan: form.berat_badan.value,
          suhu: form.suhu.value,
          status_antrian: form.status_antrian?.value || 'Menunggu'
        };
        
        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/antrian`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/antrian/${selectedAntrian.id_antrian}`, data, { withCredentials: true });
        }
      }
      fetchData();
      handleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Menunggu': return 'bg-yellow-100 text-yellow-800';
      case 'Diperiksa': return 'bg-blue-100 text-blue-800';
      case 'Selesai Periksa': return 'bg-purple-100 text-purple-800';
      case 'Menunggu Obat': return 'bg-orange-100 text-orange-800';
      case 'Selesai': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = useMemo(() => [
    { name: 'No', selector: (row, index) => index + 1, width: '60px' },
    { name: 'Tanggal', selector: row => row.tanggal_antrian, sortable: true, width: '120px' },
    { name: 'Pasien', selector: row => row.pasien?.name || '-', sortable: true },
    { name: 'Dokter/Terapis', selector: row => row.terapis?.nama_terapis || '-', sortable: true },
    { name: 'Keluhan', selector: row => row.keluhan || '-', sortable: true },
    { name: 'Status', cell: row => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(row.status_antrian)}`}>
          {row.status_antrian}
        </span>
      ), sortable: true },
    { name: 'Aksi', width: '240px', cell: (row) => {
        const matchedTransactions = transaksiList.filter(t => t.id_antrian === row.id_antrian || (t.id_pasien === row.id_pasien && t.tanggal_transaksi === row.tanggal_antrian));
        const isPaid = matchedTransactions.length > 0;
        const transaction = isPaid ? (matchedTransactions.find(t => t.id_antrian === row.id_antrian) || matchedTransactions.find(t => t.bukti_transaksi) || matchedTransactions[matchedTransactions.length - 1]) : null;
        return (
          <div className="flex gap-2 items-center">
            {row.status_antrian === 'Selesai' && !isPaid && (
              <button 
                className="bg-green-700 text-white px-2 py-1 rounded hover:bg-green-800 text-xs font-semibold"
                onClick={() => navigate('/transaksi')}
                title="Proses Pembayaran Kasir"
              >
                Bayar
              </button>
            )}
            {row.status_antrian === 'Selesai' && isPaid && (
              <button 
                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs font-semibold flex items-center gap-1"
                onClick={() => handleUpload(row, transaction)}
                title="Upload Bukti Transaksi"
              >
                <i className="fa-solid fa-upload"></i> Bukti
              </button>
            )}
            <button className="text-blue-600 hover:underline text-sm font-semibold" onClick={() => handleEdit(row)}>Edit</button>
            <button className="text-red-600 hover:underline text-sm font-semibold" onClick={() => handleDelete(row)}>Hapus</button>
          </div>
        );
      }, ignoreRowClick: true },
  ], [transaksiList, navigate]);

  const filteredData = useMemo(() => {
    let result = antrianList;

    if (filters.startDate && filters.endDate) {
      result = result.filter(a => a.tanggal_antrian >= filters.startDate && a.tanggal_antrian <= filters.endDate);
    }
    if (filters.idPasien) {
      result = result.filter(a => a.id_pasien === filters.idPasien);
    }
    if (filters.idTerapis) {
      result = result.filter(a => a.id_terapis === filters.idTerapis);
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(a =>
        (a.pasien?.name && a.pasien.name.toLowerCase().includes(lower)) ||
        (a.terapis?.nama_terapis && a.terapis.nama_terapis.toLowerCase().includes(lower)) ||
        (a.status_antrian && a.status_antrian.toLowerCase().includes(lower)) ||
        (a.tanggal_antrian && a.tanggal_antrian.toLowerCase().includes(lower))
      );
    }
    return result;
  }, [antrianList, searchText, filters]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-800 mb-8">Kunjungan / Antrian</h1>
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-800">Daftar Antrian Kunjungan</h2>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Cari..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700" />
          <button className="bg-green-800 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900 shadow" onClick={handleAdd}>
            Tambah Antrian
          </button>
        </div>
      </div>

      <TableFilter 
        onFilterChange={setFilters} 
        pasienList={pasienList} 
        terapisList={terapisList} 
        showPasien={true} 
        showTerapis={true} 
      />
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <DataTable columns={columns} data={filteredData} pagination paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={10} paginationRowsPerPageOptions={[5, 10, 20, 50]}
          noDataComponent={<div className="text-center text-gray-400 py-8">Belum ada data antrian.</div>}
          customStyles={customStyles} highlightOnHover striped />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add' ? 'Tambah Antrian' : modalType === 'edit' ? 'Edit Antrian' : modalType === 'upload' ? 'Upload Bukti Transaksi' : 'Hapus Antrian'}
              </h3>
              <button type="button" onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">Apakah Anda yakin ingin menghapus antrian pasien <b>{selectedAntrian?.pasien?.name}</b>?</p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold">Hapus</button>
                </div>
              </form>
            ) : modalType === 'upload' ? (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700 text-sm">Bukti Transaksi</label>
                  <input type="file" name="bukti_transaksi" accept="image/*" onChange={loadImage} className="w-full border px-3 py-2 rounded focus:ring-green-500 focus:border-green-500" />
                  {previewImage ? (
                    <figure className="mt-4">
                      <img src={previewImage} alt="Preview Bukti" className="w-48 h-48 object-cover rounded shadow border border-gray-200" />
                    </figure>
                  ) : ""}
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 font-semibold shadow">
                    Upload Bukti
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700 text-sm">Pasien</label>
                  <Select
                    options={pasienList.map(p => ({ value: p.id, label: p.name }))}
                    value={pasienList.map(p => ({ value: p.id, label: p.name })).find(o => o.value === Number(selectedPasienId)) || null}
                    onChange={(opt) => setSelectedPasienId(opt ? opt.value : '')}
                    isClearable placeholder="-- Pilih Pasien --" required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700 text-sm">Dokter/Terapis Tujuan</label>
                  <Select
                    options={terapisList.map(t => ({ value: t.id_terapis, label: t.nama_terapis }))}
                    value={terapisList.map(t => ({ value: t.id_terapis, label: t.nama_terapis })).find(o => o.value === Number(selectedTerapisId)) || null}
                    onChange={(opt) => setSelectedTerapisId(opt ? opt.value : '')}
                    isClearable placeholder="-- Opsional: Pilih Terapis --"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700 text-sm">Tanggal</label>
                  <input name="tanggal_antrian" type="date" defaultValue={selectedAntrian?.tanggal_antrian || new Date().toISOString().split('T')[0]} required className="w-full border px-3 py-2 rounded focus:ring-green-500 focus:border-green-500" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block mb-1 font-semibold text-gray-700 text-sm">Berat Badan (Kg)</label>
                    <input name="berat_badan" type="number" step="0.1" defaultValue={selectedAntrian?.berat_badan || ''} className="w-full border px-3 py-2 rounded focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-semibold text-gray-700 text-sm">Suhu (°C)</label>
                    <input name="suhu" type="number" step="0.1" defaultValue={selectedAntrian?.suhu || ''} className="w-full border px-3 py-2 rounded focus:ring-green-500 focus:border-green-500" />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700 text-sm">Keluhan Awal</label>
                  <textarea name="keluhan" rows="3" defaultValue={selectedAntrian?.keluhan || ''} className="w-full border px-3 py-2 rounded focus:ring-green-500 focus:border-green-500" placeholder="Catat keluhan pasien..."></textarea>
                </div>
                
                {modalType === 'edit' && (
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700 text-sm">Status Antrian</label>
                    <Select 
                      name="status_antrian" 
                      options={[
                        { value: 'Menunggu', label: 'Menunggu' },
                        { value: 'Diperiksa', label: 'Diperiksa' },
                        { value: 'Selesai Periksa', label: 'Selesai Periksa' },
                        { value: 'Menunggu Obat', label: 'Menunggu Obat' },
                        { value: 'Selesai', label: 'Selesai' }
                      ]}
                      defaultValue={[
                        { value: 'Menunggu', label: 'Menunggu' },
                        { value: 'Diperiksa', label: 'Diperiksa' },
                        { value: 'Selesai Periksa', label: 'Selesai Periksa' },
                        { value: 'Menunggu Obat', label: 'Menunggu Obat' },
                        { value: 'Selesai', label: 'Selesai' }
                      ].find(o => o.value === selectedAntrian?.status_antrian) || null}
                      placeholder="Pilih Status"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 font-semibold shadow">
                    {modalType === 'add' ? 'Tambah Antrian' : 'Simpan Perubahan'}
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

export default Antrian;
