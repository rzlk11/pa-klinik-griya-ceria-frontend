import React, { useState, useEffect, useMemo } from 'react';
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

function getStats(list) {
  return [
    { label: 'Total Orang Tua', value: list.length, icon: <i className="fa-solid fa-users"></i> },
    { label: 'Ayah', value: list.filter(o => o.relation === 'ayah').length, icon: <i className="fa-solid fa-person"></i> },
    { label: 'Ibu', value: list.filter(o => o.relation === 'ibu').length, icon: <i className="fa-solid fa-person-dress"></i> },
    { label: 'Wali', value: list.filter(o => o.relation === 'wali').length, icon: <i className="fa-solid fa-handshake"></i> },
  ];
}

function OrangTua() {
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedOrangTua, setSelectedOrangTua] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/orangtua`, { withCredentials: true });
      setOrangTuaList(response.data);
    } catch (error) { console.error(error); }
  };

  const stats = getStats(orangTuaList);

  const handleAdd = () => { setModalType('add'); setSelectedOrangTua(null); setShowModal(true); };
  const handleEdit = (o) => { setModalType('edit'); setSelectedOrangTua(o); setShowModal(true); };
  const handleDelete = (o) => { setModalType('delete'); setSelectedOrangTua(o); setShowModal(true); };
  const handleModalClose = () => { setShowModal(false); setSelectedOrangTua(null); };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/orangtua/${selectedOrangTua.id}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = { name: form.name.value, relation: form.relation.value, phone: form.phone.value };
        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/orangtua`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/orangtua/${selectedOrangTua.id}`, data, { withCredentials: true });
        }
      }
      fetchData(); handleModalClose();
    } catch (error) { console.error(error); }
  };

  const columns = useMemo(() => [
    { name: 'ID', selector: row => row.id, sortable: true, width: '80px' },
    { name: 'Nama', selector: row => row.name, sortable: true },
    { name: 'Relasi', selector: row => row.relation, sortable: true, cell: row => <span className="capitalize">{row.relation}</span> },
    { name: 'No Telp', selector: row => row.phone, sortable: true },
    { name: 'Aksi', cell: (row) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
          <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Hapus</button>
        </div>
      ), ignoreRowClick: true },
  ], []);

  const filteredData = useMemo(() => {
    if (!searchText) return orangTuaList;
    const lower = searchText.toLowerCase();
    return orangTuaList.filter(o =>
      (o.name && o.name.toLowerCase().includes(lower)) ||
      (o.relation && o.relation.toLowerCase().includes(lower)) ||
      (o.phone && o.phone.toLowerCase().includes(lower))
    );
  }, [orangTuaList, searchText]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-800 mb-8">Orang Tua</h1>
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg w-full shadow p-5 flex flex-col items-start">
            <div className="text-gray-400 flex items-center mb-2">
              <span className="mr-2">{stat.icon}</span><span>{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-green-800">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-800">Tabel Data Orang Tua</h2>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700" />
          <button className="bg-green-800 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900" onClick={handleAdd}>
            Tambah Orang Tua
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filteredData} pagination paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={10} paginationRowsPerPageOptions={[5, 10, 20, 50]}
          noDataComponent={<div className="text-center text-gray-400 py-8">Belum ada data orang tua.</div>}
          customStyles={customStyles} highlightOnHover striped />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add' ? 'Tambah Orang Tua' : modalType === 'edit' ? 'Edit Orang Tua' : 'Hapus Orang Tua'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">Apakah Anda yakin ingin menghapus orang tua <b>{selectedOrangTua?.name}</b>?</p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Hapus</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Nama</label>
                  <input name="name" defaultValue={selectedOrangTua?.name || ''} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1">Relasi</label>
                  <select name="relation" defaultValue={selectedOrangTua?.relation || ''} required className="w-full border px-3 py-2 rounded">
                    <option value="">Pilih</option>
                    <option value="ayah">Ayah</option>
                    <option value="ibu">Ibu</option>
                    <option value="wali">Wali</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">No Telp</label>
                  <input name="phone" defaultValue={selectedOrangTua?.phone || ''} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div className="flex justify-end gap-2">
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

export default OrangTua;