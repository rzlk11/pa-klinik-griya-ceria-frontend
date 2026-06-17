
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
  const [pelayananList, setPelayananList] = useState([]);
  const [transaksiList, setTransaksiList] = useState([]);
  const [vaksinList, setVaksinList] = useState([]);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedAntrian, setSelectedAntrian] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', idPasien: '', idTerapis: '' });

  const [selectedPasienId, setSelectedPasienId] = useState('');
  const [selectedTerapisId, setSelectedTerapisId] = useState('');
  const [selectedPelayananId, setSelectedPelayananId] = useState('');
  const [selectedVaksinId, setSelectedVaksinId] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [fileImage, setFileImage] = useState('');
  const [detailData, setDetailData] = useState(null);

  const [isNewPasien, setIsNewPasien] = useState(false);
  const [newPasienData, setNewPasienData] = useState({
    name: '', date_of_birth: '', gender: 'L', nama_orang_tua: '', no_telp_orang_tua: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const antrianRes = await axios.get(`${import.meta.env.VITE_API_URL}/antrian`, { withCredentials: true });
      setAntrianList(antrianRes.data);
      const pasienRes = await axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true });
      setPasienList(pasienRes.data);
      const terapisRes = await axios.get(`${import.meta.env.VITE_API_URL}/terapis`, { withCredentials: true });
      setTerapisList(terapisRes.data);
      const pelayananRes = await axios.get(`${import.meta.env.VITE_API_URL}/pelayanan`, { withCredentials: true });
      setPelayananList(pelayananRes.data);
      const transaksiRes = await axios.get(`${import.meta.env.VITE_API_URL}/transaksi`, { withCredentials: true });
      setTransaksiList(transaksiRes.data);
      const vaksinRes = await axios.get(`${import.meta.env.VITE_API_URL}/vaksin`, { withCredentials: true });
      setVaksinList(vaksinRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = () => { 
    setModalType('add'); setSelectedAntrian(null); 
    setSelectedPasienId(''); setSelectedTerapisId(''); setSelectedPelayananId(''); setSelectedVaksinId('');
    setIsNewPasien(false);
    setNewPasienData({ name: '', date_of_birth: '', gender: 'L', nama_orang_tua: '', no_telp_orang_tua: '' });
    setShowModal(true); 
  };
  const handleEdit = (row) => {
    setModalType('edit'); setSelectedAntrian(row);
    setSelectedPasienId(row.id_pasien || '');
    setSelectedTerapisId(row.id_terapis || '');
    setSelectedPelayananId(row.id_pelayanan || '');
    setSelectedVaksinId(''); // Editing an existing antrian shouldn't generally allow inserting vaccine again
    setShowModal(true);
  };
  const handleDelete = (row) => { setModalType('delete'); setSelectedAntrian(row); setShowModal(true); };
  const handleModalClose = () => { 
    setShowModal(false); setSelectedAntrian(null); setSelectedTransaction(null); 
    setPreviewImage(''); setFileImage(''); setDetailData(null);
    setIsNewPasien(false);
  };

  const handleDetail = async (row) => {
    setModalType('detail');
    setSelectedAntrian(row);

    const matchedTransactions = transaksiList.filter(t => t.id_antrian === row.id_antrian || (t.id_pasien === row.id_pasien && t.tanggal_transaksi === row.tanggal_antrian));
    const transaction = matchedTransactions.length > 0 ? (matchedTransactions.find(t => t.id_antrian === row.id_antrian) || matchedTransactions.find(t => t.bukti_transaksi) || matchedTransactions[matchedTransactions.length - 1]) : null;

    try {
      const [rmRes, resepRes, detailRes, obatRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/detail-resep-obat`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/obat`, { withCredentials: true })
      ]);

      const rm = rmRes.data.find(r => r.id_antrian === row.id_antrian);
      let resep = null;
      let details = [];
      if (rm) {
        const idRm = rm.id_rekam_medis || rm.id;
        resep = resepRes.data.find(r => r.id_rekam_medis === idRm);
        if (resep) {
          const idResep = resep.id_resep || resep.id;
          details = detailRes.data.filter(d => d.id_resep === idResep);
        }
      }

      setDetailData({
        transaksi: transaction,
        rekamMedis: rm,
        resep: resep,
        resepDetails: details,
        obatList: obatRes.data
      });

      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert('Gagal mengambil data detail.');
    }
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
    if (image) setPreviewImage(URL.createObjectURL(image));
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
        let finalPasienId = selectedPasienId;

        // Create new patient first if toggle is on
        if (modalType === 'add' && isNewPasien) {
          const pasRes = await axios.post(`${import.meta.env.VITE_API_URL}/pasien`, newPasienData, { withCredentials: true });
          let createdId = pasRes.data.data?.id;
          
          // Fallback if backend didn't return data (e.g. nodemon didn't restart)
          if (!createdId) {
            const allPasien = await axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true });
            const found = allPasien.data.find(p => p.name === newPasienData.name && p.date_of_birth === newPasienData.date_of_birth);
            createdId = found?.id;
          }
          
          finalPasienId = createdId;
          if (!finalPasienId) {
            throw new Error("Gagal mendapatkan ID Pasien baru. Harap refresh halaman.");
          }
        }

        const data = {
          id_pasien: finalPasienId,
          id_terapis: selectedTerapisId,
          id_pelayanan: selectedPelayananId,
          id_vaksin: selectedVaksinId || null,
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
      alert(error.response?.data?.msg || error.message);
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
    { name: 'Pelayanan', selector: row => row.pelayanan?.nama_pelayanan || '-', sortable: true },
    { name: 'Dokter/Terapis', selector: row => row.terapis?.nama_terapis || '-', sortable: true },
    { name: 'Keluhan', selector: row => row.keluhan || '-', sortable: true },
    {
      name: 'Status', cell: row => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(row.status_antrian)}`}>
          {row.status_antrian}
        </span>
      ), sortable: true
    },
    {
      name: 'Aksi', width: '240px', cell: (row) => {
        const matchedTransactions = transaksiList.filter(t => t.id_antrian === row.id_antrian || (t.id_pasien === row.id_pasien && t.tanggal_transaksi === row.tanggal_antrian));
        const isPaid = matchedTransactions.length > 0;
        const transaction = isPaid ? (matchedTransactions.find(t => t.id_antrian === row.id_antrian) || matchedTransactions.find(t => t.bukti_transaksi) || matchedTransactions[matchedTransactions.length - 1]) : null;
        return (
          <div className="flex gap-3 items-center">
            {row.status_antrian === 'Selesai' && !isPaid && (
              <button
                className="text-green-600 hover:underline text-sm font-semibold"
                onClick={() => navigate('/transaksi')}
                title="Proses Pembayaran Kasir"
              >
                Bayar
              </button>
            )}
            {row.status_antrian === 'Selesai' && (
              <button
                className="text-teal-600 hover:underline text-sm font-semibold"
                onClick={() => handleDetail(row)}
                title="Lihat Detail"
              >
                Detail
              </button>
            )}
            <button className="text-blue-600 hover:underline text-sm font-semibold" onClick={() => handleEdit(row)}>Edit</button>
            <button className="text-red-600 hover:underline text-sm font-semibold" onClick={() => handleDelete(row)}>Hapus</button>
          </div>
        );
      }, ignoreRowClick: true
    },
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
                {modalType === 'add' ? 'Tambah Antrian' : modalType === 'edit' ? 'Edit Antrian' : modalType === 'upload' ? 'Upload Bukti Transaksi' : modalType === 'detail' ? 'Detail Antrian' : 'Hapus Antrian'}
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
            ) : modalType === 'detail' && detailData ? (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h4 className="font-bold text-gray-700 mb-2">Informasi Umum</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500 block">Pasien</span><strong>{selectedAntrian?.pasien?.name}</strong></div>
                    <div><span className="text-gray-500 block">Pelayanan</span><strong>{selectedAntrian?.pelayanan?.nama_pelayanan || '-'}</strong></div>
                    <div><span className="text-gray-500 block">Terapis</span><strong>{selectedAntrian?.terapis?.nama_terapis || '-'}</strong></div>
                    <div><span className="text-gray-500 block">Tanggal</span><strong>{selectedAntrian?.tanggal_antrian}</strong></div>
                  </div>
                </div>

                {detailData.rekamMedis && (
                  <div className="border-b pb-3">
                    <h4 className="font-bold text-gray-700 mb-2">Rekam Medis</h4>
                    <div className="text-sm space-y-1">
                      <div><span className="text-gray-500">Diagnosa:</span> {detailData.rekamMedis.diagnosa || '-'}</div>
                      <div><span className="text-gray-500">Tindakan:</span> {detailData.rekamMedis.tindakan || '-'}</div>
                      <div><span className="text-gray-500">Catatan:</span> {detailData.rekamMedis.catatan || '-'}</div>
                    </div>
                  </div>
                )}

                <div className="border-b pb-3">
                  <h4 className="font-bold text-gray-700 mb-2">Resep Obat</h4>
                  {detailData.resep && detailData.resep.resep_teks && detailData.resep.resep_teks.trim() !== '' ? (
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm whitespace-pre-wrap font-mono w-full">
                      {detailData.resep.resep_teks}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Tidak ada resep obat.</div>
                  )}
                </div>

                <div className="pb-2">
                  <h4 className="font-bold text-gray-700 mb-2">Transaksi</h4>
                  {detailData.transaksi ? (
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-500">Total Biaya:</span>
                        <strong className="text-lg text-green-700">Rp {Number(detailData.transaksi.total_biaya || 0).toLocaleString('id-ID')}</strong>
                      </div>
                      {detailData.transaksi.bukti_transaksi && (
                        <div className="mt-2">
                          <span className="text-gray-500 block mb-1">Bukti Pembayaran:</span>
                          <img src={detailData.transaksi.bukti_transaksi} alt="Bukti" className="w-full max-w-xs rounded border shadow-sm" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Transaksi belum dibuat / tidak ditemukan.</div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Tutup</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-gray-700 text-sm">Pasien</label>
                    {modalType === 'add' && (
                      <button 
                        type="button" 
                        onClick={() => setIsNewPasien(!isNewPasien)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded"
                      >
                        {isNewPasien ? "Batal Tambah" : "+ Pasien Baru"}
                      </button>
                    )}
                  </div>
                  
                  {isNewPasien && modalType === 'add' ? (
                    <div className="bg-green-50 p-3 rounded border border-green-200 mb-2 space-y-3">
                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-700">Nama Lengkap</label>
                        <input type="text" required value={newPasienData.name} onChange={e => setNewPasienData({...newPasienData, name: e.target.value})} className="w-full border px-2 py-1.5 rounded text-sm focus:ring-green-500" placeholder="Nama Pasien" />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block mb-1 text-xs font-semibold text-gray-700">Tanggal Lahir</label>
                          <input type="date" required value={newPasienData.date_of_birth} onChange={e => setNewPasienData({...newPasienData, date_of_birth: e.target.value})} className="w-full border px-2 py-1.5 rounded text-sm focus:ring-green-500" />
                        </div>
                        <div className="flex-1">
                          <label className="block mb-1 text-xs font-semibold text-gray-700">Jenis Kelamin</label>
                          <select value={newPasienData.gender} onChange={e => setNewPasienData({...newPasienData, gender: e.target.value})} className="w-full border px-2 py-1.5 rounded text-sm focus:ring-green-500">
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block mb-1 text-xs font-semibold text-gray-700">Nama Orang Tua</label>
                          <input type="text" value={newPasienData.nama_orang_tua} onChange={e => setNewPasienData({...newPasienData, nama_orang_tua: e.target.value})} className="w-full border px-2 py-1.5 rounded text-sm focus:ring-green-500" placeholder="Opsional" />
                        </div>
                        <div className="flex-1">
                          <label className="block mb-1 text-xs font-semibold text-gray-700">No. Telp</label>
                          <input type="tel" value={newPasienData.no_telp_orang_tua} onChange={e => setNewPasienData({...newPasienData, no_telp_orang_tua: e.target.value})} className="w-full border px-2 py-1.5 rounded text-sm focus:ring-green-500" placeholder="Opsional" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Select
                      options={pasienList.map(p => ({ value: p.id, label: p.name }))}
                      value={pasienList.map(p => ({ value: p.id, label: p.name })).find(o => o.value === Number(selectedPasienId)) || null}
                      onChange={(opt) => setSelectedPasienId(opt ? opt.value : '')}
                      isClearable placeholder="-- Pilih Pasien --" required={!isNewPasien}
                    />
                  )}
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
                  <label className="block mb-1 font-semibold text-gray-700 text-sm">Pelayanan Kesehatan</label>
                  <Select
                    options={pelayananList.map(p => ({ value: p.id_pelayanan, label: p.nama_pelayanan }))}
                    value={pelayananList.map(p => ({ value: p.id_pelayanan, label: p.nama_pelayanan })).find(o => o.value === Number(selectedPelayananId)) || null}
                    onChange={(opt) => setSelectedPelayananId(opt ? opt.value : '')}
                    isClearable placeholder="-- Opsional: Pilih Pelayanan --"
                  />
                </div>

                {modalType === 'add' && pelayananList.find(p => p.id_pelayanan === Number(selectedPelayananId))?.nama_pelayanan.toLowerCase().match(/vaksin|imunisasi/) ? (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded mt-2">
                    <label className="block mb-1 font-semibold text-blue-800 text-sm">Pilih Vaksin</label>
                    <Select
                      options={vaksinList.filter(v => v.stok > 0).map(v => ({ value: v.id_vaksin, label: `${v.nama_vaksin} (Stok: ${v.stok})` }))}
                      value={vaksinList.map(v => ({ value: v.id_vaksin, label: `${v.nama_vaksin} (Stok: ${v.stok})` })).find(o => o.value === Number(selectedVaksinId)) || null}
                      onChange={(opt) => setSelectedVaksinId(opt ? opt.value : '')}
                      isClearable placeholder="-- Pilih Vaksin --"
                    />
                    <p className="text-xs text-blue-600 mt-1 italic">*Jika vaksin dipilih, antrian berstatus Selesai. Rekam medis & transaksi akan langsung dibuat.</p>
                  </div>
                ) : null}
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
