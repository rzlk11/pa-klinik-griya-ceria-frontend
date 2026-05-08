import React, { useState, useEffect } from 'react';
import axios from 'axios';


const getStats = (pelayananList) => [
  { label: 'Total Pelayanan', value: pelayananList.length, icon: <i className="fa-solid fa-hospital text-blue-600"></i> },
];

function PelayananKesehatan() {
  const [pelayananList, setPelayananList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedPelayanan, setSelectedPelayanan] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/pelayanan`, { withCredentials: true });
      setPelayananList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const stats = getStats(pelayananList);

  const handleAdd = () => {
    setModalType('add');
    setSelectedPelayanan(null);
    setShowModal(true);
  };

  const handleEdit = (pelayanan) => {
    setModalType('edit');
    setSelectedPelayanan(pelayanan);
    setShowModal(true);
  };

  const handleDelete = (pelayanan) => {
    setModalType('delete');
    setSelectedPelayanan(pelayanan);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPelayanan(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/pelayanan/${selectedPelayanan.id_pelayanan}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = {
          nama_pelayanan: form.nama_pelayanan.value,
          deskripsi: form.deskripsi.value,
          harga: Number(form.harga.value),
        };

        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/pelayanan`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/pelayanan/${selectedPelayanan.id_pelayanan}`, data, { withCredentials: true });
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
      <h1 className="text-3xl font-bold text-green-800 mb-8">Pelayanan Kesehatan</h1>

      {/* Stats */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg w-auto shadow p-5 flex flex-col items-start"
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
        <h2 className="text-xl font-bold text-green-800">Tabel Data Pelayanan Kesehatan</h2>
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
            Tambah Pelayanan
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-green-800">ID</th>
              <th className="px-4 py-2 text-left text-green-800">Nama Pelayanan</th>
              <th className="px-4 py-2 text-left text-green-800">Deskripsi</th>
              <th className="px-4 py-2 text-left text-green-800">Harga</th>
              <th className="px-4 py-2 text-left text-green-800">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pelayananList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">
                  Belum ada data pelayanan.
                </td>
              </tr>
            ) : (
              pelayananList.map((pelayanan) => (
                <tr key={pelayanan.id_pelayanan} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{pelayanan.id_pelayanan}</td>
                  <td className="px-4 py-2">{pelayanan.nama_pelayanan}</td>
                  <td className="px-4 py-2">{pelayanan.deskripsi || '-'}</td>
                  <td className="px-4 py-2">
                    Rp {Number(pelayanan.harga).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => handleEdit(pelayanan)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(pelayanan)}
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
        {pelayananList.length === 0 && (
          <div className="text-center text-gray-400 py-8">Belum ada data pelayanan.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add'
                  ? 'Tambah Pelayanan'
                  : modalType === 'edit'
                  ? 'Edit Pelayanan'
                  : 'Hapus Pelayanan'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus pelayanan <b>{selectedPelayanan?.nama_pelayanan}</b>?
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
                  <label className="block mb-1">Nama Pelayanan</label>
                  <input
                    name="nama_pelayanan"
                    defaultValue={selectedPelayanan?.nama_pelayanan || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Deskripsi</label>
                  <textarea
                    name="deskripsi"
                    defaultValue={selectedPelayanan?.deskripsi || ''}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Harga</label>
                  <input
                    name="harga"
                    type="number"
                    min={0}
                    defaultValue={selectedPelayanan?.harga || ''}
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

export default PelayananKesehatan;