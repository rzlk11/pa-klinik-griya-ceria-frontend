import React, { useState } from 'react';

// Example data with id (gunakan id, bukan uuid)
const initialOrangTuaList = [
  {
    id: 1,
    name: 'Budi',
    relation: 'ayah',
    phone: '081234567890',
  },
  {
    id: 2,
    name: 'Dewi',
    relation: 'ibu',
    phone: '081234567891',
  },
  {
    id: 3,
    name: 'Sari',
    relation: 'wali',
    phone: '081234567892',
  },
];

function getStats(list) {
  return [
    { label: 'Total Orang Tua', value: list.length, icon: '👪' },
    { label: 'Ayah', value: list.filter(o => o.relation === 'ayah').length, icon: '👨' },
    { label: 'Ibu', value: list.filter(o => o.relation === 'ibu').length, icon: '👩' },
    { label: 'Wali', value: list.filter(o => o.relation === 'wali').length, icon: '🧑‍🤝‍🧑' },
  ];
}

function OrangTua() {
  const [orangTuaList, setOrangTuaList] = useState(initialOrangTuaList);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedOrangTua, setSelectedOrangTua] = useState(null);

  const stats = getStats(orangTuaList);

  const handleAdd = () => {
    setModalType('add');
    setSelectedOrangTua(null);
    setShowModal(true);
  };

  const handleEdit = (orangTua) => {
    setModalType('edit');
    setSelectedOrangTua(orangTua);
    setShowModal(true);
  };

  const handleDelete = (orangTua) => {
    setModalType('delete');
    setSelectedOrangTua(orangTua);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedOrangTua(null);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'add') {
      const form = e.target;
      const newOrangTua = {
        id: orangTuaList.length > 0 ? Math.max(...orangTuaList.map(o => o.id)) + 1 : 1,
        name: form.name.value,
        relation: form.relation.value,
        phone: form.phone.value,
      };
      setOrangTuaList([...orangTuaList, newOrangTua]);
    } else if (modalType === 'edit') {
      const form = e.target;
      setOrangTuaList(
        orangTuaList.map((o) =>
          o.id === selectedOrangTua.id
            ? {
                ...o,
                name: form.name.value,
                relation: form.relation.value,
                phone: form.phone.value,
              }
            : o
        )
      );
    } else if (modalType === 'delete') {
      setOrangTuaList(orangTuaList.filter((o) => o.id !== selectedOrangTua.id));
    }
    setShowModal(false);
    setSelectedOrangTua(null);
  };

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-800 mb-8">Orang Tua</h1>

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
        <h2 className="text-xl font-bold text-green-800">Tabel Data Orang Tua</h2>
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
            Tambah Orang Tua
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-green-800">ID</th>
              <th className="px-4 py-2 text-left text-green-800">Nama</th>
              <th className="px-4 py-2 text-left text-green-800">Relasi</th>
              <th className="px-4 py-2 text-left text-green-800">No Telp</th>
              <th className="px-4 py-2 text-left text-green-800">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orangTuaList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">
                  Belum ada data orang tua.
                </td>
              </tr>
            ) : (
              orangTuaList.map((orangTua) => (
                <tr key={orangTua.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{orangTua.id}</td>
                  <td className="px-4 py-2">{orangTua.name}</td>
                  <td className="px-4 py-2 capitalize">{orangTua.relation}</td>
                  <td className="px-4 py-2">{orangTua.phone}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => handleEdit(orangTua)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(orangTua)}
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
        {orangTuaList.length === 0 && (
          <div className="text-center text-gray-400 py-8">Belum ada data orang tua.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add'
                  ? 'Tambah Orang Tua'
                  : modalType === 'edit'
                  ? 'Edit Orang Tua'
                  : 'Hapus Orang Tua'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus orang tua <b>{selectedOrangTua?.name}</b>?
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
                  <label className="block mb-1">Nama</label>
                  <input
                    name="name"
                    defaultValue={selectedOrangTua?.name || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Relasi</label>
                  <select
                    name="relation"
                    defaultValue={selectedOrangTua?.relation || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Pilih</option>
                    <option value="ayah">Ayah</option>
                    <option value="ibu">Ibu</option>
                    <option value="wali">Wali</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">No Telp</label>
                  <input
                    name="phone"
                    defaultValue={selectedOrangTua?.phone || ''}
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

export default OrangTua;