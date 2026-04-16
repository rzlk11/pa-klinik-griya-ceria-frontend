import React, { useState } from 'react';

const stats = [
  { label: 'Total Pasien', value: 50, icon: '👤' },
  { label: 'Pasien Laki-laki', value: 10, icon: '♂️' },
  { label: 'Pasien Perempuan', value: 10, icon: '♀️' },
];

// Example pasien data
const initialPasienList = [
  {
    id: 1,
    nama: 'Ahmad',
    usia: 12,
    jenis_kelamin: 'Laki-laki',
    orang_tua: 'Budi',
    no_telp: '081234567890',
  },
  {
    id: 2,
    nama: 'Siti',
    usia: 10,
    jenis_kelamin: 'Perempuan',
    orang_tua: 'Dewi',
    no_telp: '081234567891',
  },
  {
    id: 3,
    nama: 'Rizky',
    usia: 8,
    jenis_kelamin: 'Laki-laki',
    orang_tua: 'Andi',
    no_telp: '081234567892',
  },
  {
    id: 4,
    nama: 'Ayu',
    usia: 9,
    jenis_kelamin: 'Perempuan',
    orang_tua: 'Sari',
    no_telp: '081234567893',
  },
];

function Pasien() {
  const [pasienList, setPasienList] = useState(initialPasienList);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedPasien, setSelectedPasien] = useState(null);

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

  // Dummy handlers for demo
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'add') {
      // Add logic here
      const form = e.target;
      const newPasien = {
        id: pasienList.length + 1,
        nama: form.nama.value,
        usia: form.usia.value,
        jenis_kelamin: form.jenis_kelamin.value,
        orang_tua: form.orang_tua.value,
        no_telp: form.no_telp.value,
      };
      setPasienList([...pasienList, newPasien]);
    } else if (modalType === 'edit') {
      // Edit logic here
      const form = e.target;
      setPasienList(
        pasienList.map((p) =>
          p.id === selectedPasien.id
            ? {
                ...p,
                nama: form.nama.value,
                usia: form.usia.value,
                jenis_kelamin: form.jenis_kelamin.value,
                orang_tua: form.orang_tua.value,
                no_telp: form.no_telp.value,
              }
            : p
        )
      );
    } else if (modalType === 'delete') {
      setPasienList(pasienList.filter((p) => p.id !== selectedPasien.id));
    }
    setShowModal(false);
    setSelectedPasien(null);
  };

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
              <th className="px-4 py-2 text-left text-green-800">ID</th>
              <th className="px-4 py-2 text-left text-green-800">Nama Pasien</th>
              <th className="px-4 py-2 text-left text-green-800">Usia</th>
              <th className="px-4 py-2 text-left text-green-800">Jenis Kelamin</th>
              <th className="px-4 py-2 text-left text-green-800">Orang Tua</th>
              <th className="px-4 py-2 text-left text-green-800">No Telp</th>
              <th className="px-4 py-2 text-left text-green-800">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pasienList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">
                  Belum ada data pasien.
                </td>
              </tr>
            ) : (
              pasienList.map((pasien) => (
                <tr key={pasien.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{pasien.id}</td>
                  <td className="px-4 py-2">{pasien.nama}</td>
                  <td className="px-4 py-2">{pasien.usia}</td>
                  <td className="px-4 py-2">{pasien.jenis_kelamin}</td>
                  <td className="px-4 py-2">{pasien.orang_tua}</td>
                  <td className="px-4 py-2">{pasien.no_telp}</td>
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
        {/* Empty state */}
        {pasienList.length === 0 && (
          <div className="text-center text-gray-400 py-8">Belum ada data pasien.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
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
                  Apakah Anda yakin ingin menghapus pasien <b>{selectedPasien?.nama}</b>?
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
                    name="nama"
                    defaultValue={selectedPasien?.nama || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Usia</label>
                  <input
                    name="usia"
                    type="number"
                    min={0}
                    defaultValue={selectedPasien?.usia || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Jenis Kelamin</label>
                  <select
                    name="jenis_kelamin"
                    defaultValue={selectedPasien?.jenis_kelamin || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Pilih</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Orang Tua</label>
                  <input
                    name="orang_tua"
                    defaultValue={selectedPasien?.orang_tua || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">No Telp</label>
                  <input
                    name="no_telp"
                    defaultValue={selectedPasien?.no_telp || ''}
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

export default Pasien;