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
  rowsPerPageText: 'Baris per halaman:',
  rangeSeparatorText: 'dari',
  noRowsPerPage: false,
  selectAllRowsItem: true,
  selectAllRowsItemText: 'Semua',
};

function getStats(dokterList) {
  const totalDokter = dokterList.length;
  const spesialisasiCount = dokterList.reduce((acc, d) => {
    acc[d.spesialisasi] = (acc[d.spesialisasi] || 0) + 1;
    return acc;
  }, {});
  return [
    { label: 'Total Dokter', value: totalDokter, icon: <i className="fa-solid fa-stethoscope"></i> },
    ...Object.entries(spesialisasiCount).map(([spesialisasi, count]) => ({
      label: `Dokter Spesialis ${spesialisasi}`,
      value: count,
      icon: <i className="fa-solid fa-tags"></i>,
    })),
  ];
}

function Dokter() {
  const [dokterList, setDokterList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedDokter, setSelectedDokter] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/dokter`, { withCredentials: true });
      setDokterList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const stats = getStats(dokterList);

  const handleAdd = () => {
    setModalType('add');
    setSelectedDokter(null);
    setShowModal(true);
  };

  const handleEdit = (dokter) => {
    setModalType('edit');
    setSelectedDokter(dokter);
    setShowModal(true);
  };

  const handleDelete = (dokter) => {
    setModalType('delete');
    setSelectedDokter(dokter);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDokter(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/dokter/${selectedDokter.id_dokter}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = {
          nama_dokter: form.nama_dokter.value,
          spesialisasi: form.spesialisasi.value,
          jadwal_praktek: form.jadwal_praktek.value,
          nomor_telepon: form.nomor_telepon.value,
        };

        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/dokter`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/dokter/${selectedDokter.id_dokter}`, data, { withCredentials: true });
        }
      }
      fetchData();
      handleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo(() => [
    { name: 'ID', selector: row => row.id_dokter, sortable: true, width: '80px' },
    { name: 'Nama Dokter', selector: row => row.nama_dokter, sortable: true },
    { name: 'Spesialis', selector: row => row.spesialisasi, sortable: true },
    { name: 'Jadwal Praktek', selector: row => row.jadwal_praktek, sortable: true },
    { name: 'No Telp', selector: row => row.nomor_telepon, sortable: true },
    {
      name: 'Aksi',
      cell: (row) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
          <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Hapus</button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ], []);

  const filteredData = useMemo(() => {
    if (!searchText) return dokterList;
    const lower = searchText.toLowerCase();
    return dokterList.filter(d =>
      (d.nama_dokter && d.nama_dokter.toLowerCase().includes(lower)) ||
      (d.spesialisasi && d.spesialisasi.toLowerCase().includes(lower)) ||
      (d.jadwal_praktek && d.jadwal_praktek.toLowerCase().includes(lower)) ||
      (d.nomor_telepon && d.nomor_telepon.toLowerCase().includes(lower))
    );
  }, [dokterList, searchText]);

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-800 mb-8">Dokter</h1>

      {/* Stats */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg w-full shadow p-5 flex flex-col items-start"
          >
            <div className="text-gray-400 flex items-center mb-2">
              <span className="mr-2">{stat.icon}</span>
              <span>{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-green-800">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Table Title and Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-800">Tabel Data Dokter</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          <button
            className="bg-green-800 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900"
            onClick={handleAdd}
          >
            Tambah Dokter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20, 50]}
          noDataComponent={<div className="text-center text-gray-400 py-8">Belum ada data dokter.</div>}
          customStyles={customStyles}
          highlightOnHover
          striped
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add'
                  ? 'Tambah Dokter'
                  : modalType === 'edit'
                    ? 'Edit Dokter'
                    : 'Hapus Dokter'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus dokter <b>{selectedDokter?.nama_dokter}</b>?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Nama Dokter</label>
                  <input
                    name="nama_dokter"
                    defaultValue={selectedDokter?.nama_dokter || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Spesialisasi</label>
                  <input
                    name="spesialisasi"
                    defaultValue={selectedDokter?.spesialisasi || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Jadwal Praktek</label>
                  <input
                    name="jadwal_praktek"
                    defaultValue={selectedDokter?.jadwal_praktek || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">No Telp</label>
                  <input
                    name="nomor_telepon"
                    defaultValue={selectedDokter?.nomor_telepon || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
                  >
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

export default Dokter;