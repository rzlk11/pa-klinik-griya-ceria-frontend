import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getStats = (list) => [
  { label: 'Total Resep', value: list.length, icon: <i className="fa-solid fa-prescription text-blue-600"></i> },
  { label: 'Aktif', value: list.filter(r => r.status_resep === 'Aktif').length, icon: <i className="fa-solid fa-circle text-green-500"></i> },
  { label: 'Selesai', value: list.filter(r => r.status_resep === 'Selesai').length, icon: <i className="fa-solid fa-check-circle text-green-600"></i> },
  { label: 'Dibatalkan', value: list.filter(r => r.status_resep === 'Dibatalkan').length, icon: <i className="fa-solid fa-times-circle text-red-500"></i> },
];

function ResepObat() {
  const [resepList, setResepList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedResep, setSelectedResep] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true });
      // Ensure details array exists for UI mapping
      const dataWithDetails = response.data.map(item => ({
        ...item,
        details: item.details || []
      }));
      setResepList(dataWithDetails);
    } catch (error) {
      console.error(error);
    }
  };

  const stats = getStats(resepList);

  const handleAdd = () => {
    setModalType('add');
    setSelectedResep(null);
    setShowModal(true);
  };

  const handleEdit = (resep) => {
    setModalType('edit');
    setSelectedResep(resep);
    setShowModal(true);
  };

  const handleDelete = (resep) => {
    setModalType('delete');
    setSelectedResep(resep);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedResep(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/resep-obat/${selectedResep.id_resep}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = {
          id_rekam_medis: Number(form.id_rekam_medis.value),
          tanggal_resep: form.tanggal_resep.value,
          status_resep: form.status_resep.value,
        };

        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/resep-obat`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/resep-obat/${selectedResep.id_resep}`, data, { withCredentials: true });
        }
      }
      fetchData();
      handleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-800 mb-8">Resep Obat</h1>

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
        <h2 className="text-xl font-bold text-green-800">Tabel Data Resep Obat</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          <button
            className="bg-green-800 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900"
            onClick={handleAdd}
          >
            Tambah Resep
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-green-800">ID Resep</th>
              <th className="px-4 py-2 text-left text-green-800">ID Rekam Medis</th>
              <th className="px-4 py-2 text-left text-green-800">Tanggal</th>
              <th className="px-4 py-2 text-left text-green-800">Status</th>
              <th className="px-4 py-2 text-left text-green-800">Detail Obat</th>
              <th className="px-4 py-2 text-left text-green-800">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {resepList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  Belum ada data resep.
                </td>
              </tr>
            ) : (
              resepList.map((resep) => (
                <tr key={resep.id_resep} className="border-b hover:bg-gray-50 align-top">
                  <td className="px-4 py-2">{resep.id_resep}</td>
                  <td className="px-4 py-2">{resep.id_rekam_medis}</td>
                  <td className="px-4 py-2">{resep.tanggal_resep}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        resep.status_resep === 'Aktif'
                          ? 'text-green-700 font-semibold'
                          : resep.status_resep === 'Selesai'
                          ? 'text-blue-700 font-semibold'
                          : 'text-red-700 font-semibold'
                      }
                    >
                      {resep.status_resep}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {resep.details.length === 0 ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <ul className="list-disc ml-4">
                        {resep.details.map((detail) => (
                          <li key={detail.id}>
                            {detail.nama_obat} ({detail.dosis}) - {detail.jumlah} {detail.satuan}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => handleEdit(resep)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(resep)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Empty state */}
        {resepList.length === 0 && (
          <div className="text-center text-gray-400 py-8">Belum ada data resep.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add'
                  ? 'Tambah Resep'
                  : modalType === 'edit'
                  ? 'Edit Resep'
                  : 'Hapus Resep'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus resep <b>{selectedResep?.id_resep}</b>?
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
                  <label className="block mb-1">ID Rekam Medis</label>
                  <input
                    name="id_rekam_medis"
                    type="number"
                    defaultValue={selectedResep?.id_rekam_medis || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Tanggal Resep</label>
                  <input
                    name="tanggal_resep"
                    type="date"
                    defaultValue={selectedResep?.tanggal_resep || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Status Resep</label>
                  <select
                    name="status_resep"
                    defaultValue={selectedResep?.status_resep || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Pilih</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
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

export default ResepObat;