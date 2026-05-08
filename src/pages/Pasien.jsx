import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getStats = (list) => [
  { label: 'Total Pasien', value: list.length, icon: <i className="fa-solid fa-user-group text-blue-600"></i> },
  { label: 'Pasien Laki-laki', value: list.filter(p => p.gender === 'L').length, icon: <i className="fa-solid fa-mars text-blue-500"></i> },
  { label: 'Pasien Perempuan', value: list.filter(p => p.gender === 'P').length, icon: <i className="fa-solid fa-venus text-pink-500"></i> },
];

const calculateAge = (dob) => {
  if (!dob) return '-';
  const diffMs = Date.now() - new Date(dob).getTime();
  const ageDt = new Date(diffMs); 
  return Math.abs(ageDt.getUTCFullYear() - 1970);
};

function Pasien() {
  const [pasienList, setPasienList] = useState([]);
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedPasien, setSelectedPasien] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true });
      setPasienList(response.data);

      const otResponse = await axios.get(`${import.meta.env.VITE_API_URL}/orangtua`, { withCredentials: true });
      setOrangTuaList(otResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = () => {
    setModalType('add');
    setSelectedPasien(null);
    setShowModal(true);
  };

  const handleEdit = (pasien) => {
    setModalType('edit');
    setSelectedPasien(pasien);
    setShowModal(true);
  };

  const handleDelete = (pasien) => {
    setModalType('delete');
    setSelectedPasien(pasien);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPasien(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        // Backend delete uses uuid
        await axios.delete(`${import.meta.env.VITE_API_URL}/pasien/${selectedPasien.uuid}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = {
          name: form.name.value,
          date_of_birth: form.date_of_birth.value,
          gender: form.gender.value,
          orangTuaId: Number(form.orangTuaId.value),
        };

        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/pasien`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/pasien/${selectedPasien.uuid}`, data, { withCredentials: true });
        }
      }
      fetchData();
      handleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  const stats = getStats(pasienList);

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-800 mb-8">Pasien</h1>

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
        <h2 className="text-xl font-bold text-green-800">Tabel Data Pasien</h2>
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
            Tambah Pasien
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-green-800">Nama Pasien</th>
              <th className="px-4 py-2 text-left text-green-800">Usia</th>
              <th className="px-4 py-2 text-left text-green-800">Tanggal Lahir</th>
              <th className="px-4 py-2 text-left text-green-800">Jenis Kelamin</th>
              <th className="px-4 py-2 text-left text-green-800">Orang Tua</th>
              <th className="px-4 py-2 text-left text-green-800">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pasienList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  Belum ada data pasien.
                </td>
              </tr>
            ) : (
              pasienList.map((pasien) => (
                <tr key={pasien.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{pasien.name}</td>
                  <td className="px-4 py-2">{calculateAge(pasien.date_of_birth)} Tahun</td>
                  <td className="px-4 py-2">{pasien.date_of_birth}</td>
                  <td className="px-4 py-2">{pasien.gender === 'L' ? 'Laki-laki' : pasien.gender === 'P' ? 'Perempuan' : '-'}</td>
                  <td className="px-4 py-2">{pasien.orang_tua?.name || '-'}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => handleEdit(pasien)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(pasien)}
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
                  ? 'Tambah Pasien'
                  : modalType === 'edit'
                  ? 'Edit Pasien'
                  : 'Hapus Pasien'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus pasien <b>{selectedPasien?.name}</b>?
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
                  <label className="block mb-1">Nama Pasien</label>
                  <input
                    name="name"
                    defaultValue={selectedPasien?.name || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Tanggal Lahir</label>
                  <input
                    name="date_of_birth"
                    type="date"
                    defaultValue={selectedPasien?.date_of_birth || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Jenis Kelamin</label>
                  <select
                    name="gender"
                    defaultValue={selectedPasien?.gender || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Orang Tua</label>
                  <select
                    name="orangTuaId"
                    defaultValue={selectedPasien?.orang_tua?.id || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Pilih Orang Tua</option>
                    {orangTuaList.map((ot) => (
                      <option key={ot.id} value={ot.id}>
                        {ot.name} ({ot.relation})
                      </option>
                    ))}
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

export default Pasien;