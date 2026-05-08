import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      <div className="bg-white rounded-lg shadow p-4">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-green-800">ID</th>
              <th className="px-4 py-2 text-left text-green-800">Nama Dokter</th>
              <th className="px-4 py-2 text-left text-green-800">Spesialis</th>
              <th className="px-4 py-2 text-left text-green-800">Jadwal Praktek</th>
              <th className="px-4 py-2 text-left text-green-800">No Telp</th>
              <th className="px-4 py-2 text-left text-green-800">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dokterList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  Belum ada data dokter.
                </td>
              </tr>
            ) : (
              dokterList.map((dokter) => (
                <tr key={dokter.id_dokter} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{dokter.id_dokter}</td>
                  <td className="px-4 py-2">{dokter.nama_dokter}</td>
                  <td className="px-4 py-2">{dokter.spesialisasi}</td>
                  <td className="px-4 py-2">{dokter.jadwal_praktek}</td>
                  <td className="px-4 py-2">{dokter.nomor_telepon}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => handleEdit(dokter)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(dokter)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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