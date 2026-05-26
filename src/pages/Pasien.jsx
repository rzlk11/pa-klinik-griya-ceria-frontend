import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

const getStats = (list) => [
  { label: 'Total Pasien', value: list.length, icon: <i className="fa-solid fa-user-group text-blue-600"></i> },
  { label: 'Pasien Laki-laki', value: list.filter(p => p.gender === 'L').length, icon: <i className="fa-solid fa-mars text-blue-500"></i> },
  { label: 'Pasien Perempuan', value: list.filter(p => p.gender === 'P').length, icon: <i className="fa-solid fa-venus text-pink-500"></i> },
];

const calculateAge = (dob) => {
  if (!dob) return '-';
  const birth = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  let result = '';
  if (years > 0) result += `${years} Tahun `;
  if (months > 0) result += `${months} Bulan `;
  if (days >= 0) result += `${days} Hari`;
  return result.trim();
};

function Pasien() {
  const navigate = useNavigate();
  const [pasienList, setPasienList] = useState([]);
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true });
      setPasienList(response.data);
      const otResponse = await axios.get(`${import.meta.env.VITE_API_URL}/orangtua`, { withCredentials: true });
      setOrangTuaList(otResponse.data);
    } catch (error) { console.error(error); }
  };

  const handleAdd = () => { setModalType('add'); setSelectedPasien(null); setShowModal(true); };
  const handleEdit = (p) => { setModalType('edit'); setSelectedPasien(p); setShowModal(true); };
  const handleDelete = (p) => { setModalType('delete'); setSelectedPasien(p); setShowModal(true); };
  const handleModalClose = () => { setShowModal(false); setSelectedPasien(null); };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/pasien/${selectedPasien.uuid}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = { name: form.name.value, date_of_birth: form.date_of_birth.value, gender: form.gender.value, orangTuaId: Number(form.orangTuaId.value) };
        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/pasien`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/pasien/${selectedPasien.uuid}`, data, { withCredentials: true });
        }
      }
      fetchData(); handleModalClose();
    } catch (error) { console.error(error); }
  };

  const stats = getStats(pasienList);

  const columns = useMemo(() => [
    { name: 'Nama Pasien', selector: row => row.name, sortable: true },
    { name: 'Usia', selector: row => row.date_of_birth, sortable: true, cell: row => calculateAge(row.date_of_birth), width: '180px' },
    { name: 'Tanggal Lahir', selector: row => row.date_of_birth, sortable: true },
    { name: 'Jenis Kelamin', selector: row => row.gender, sortable: true, cell: row => row.gender === 'L' ? 'Laki-laki' : row.gender === 'P' ? 'Perempuan' : '-' },
    { name: 'Orang Tua', selector: row => row.orang_tua?.name + " ( " + row.orang_tua?.relation + " )" || '-', sortable: true },
    { name: 'Aksi', cell: (row) => (
        <div className="flex gap-2">
          <button className="text-green-600 hover:underline font-semibold" onClick={() => navigate(`/pasien/${row.uuid}`)}>Detail</button>
          <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
          <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Hapus</button>
        </div>
      ), ignoreRowClick: true },
  ], [navigate]);

  const filteredData = useMemo(() => {
    if (!searchText) return pasienList;
    const lower = searchText.toLowerCase();
    return pasienList.filter(p =>
      (p.name && p.name.toLowerCase().includes(lower)) ||
      (p.date_of_birth && p.date_of_birth.toLowerCase().includes(lower)) ||
      (p.orang_tua?.name && p.orang_tua.name.toLowerCase().includes(lower))
    );
  }, [pasienList, searchText]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-800 mb-8">Pasien</h1>
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
        <h2 className="text-xl font-bold text-green-800">Tabel Data Pasien</h2>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700" />
          <button className="bg-green-800 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900" onClick={handleAdd}>
            Tambah Pasien
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filteredData} pagination paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={10} paginationRowsPerPageOptions={[5, 10, 20, 50]}
          noDataComponent={<div className="text-center text-gray-400 py-8">Belum ada data pasien.</div>}
          customStyles={customStyles} highlightOnHover striped />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add' ? 'Tambah Pasien' : modalType === 'edit' ? 'Edit Pasien' : 'Hapus Pasien'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">Apakah Anda yakin ingin menghapus pasien <b>{selectedPasien?.name}</b>?</p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Hapus</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Nama Pasien</label>
                  <input name="name" defaultValue={selectedPasien?.name || ''} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1">Tanggal Lahir</label>
                  <input name="date_of_birth" type="date" defaultValue={selectedPasien?.date_of_birth || ''} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1">Jenis Kelamin</label>
                  <select name="gender" defaultValue={selectedPasien?.gender || ''} required className="w-full border px-3 py-2 rounded">
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Orang Tua</label>
                  <select name="orangTuaId" defaultValue={selectedPasien?.orang_tua?.id || ''} required className="w-full border px-3 py-2 rounded">
                    <option value="">Pilih Orang Tua</option>
                    {orangTuaList.map((ot) => (
                      <option key={ot.id} value={ot.id}>{ot.name} ({ot.relation})</option>
                    ))}
                  </select>
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

export default Pasien;