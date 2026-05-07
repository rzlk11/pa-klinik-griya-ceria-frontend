import React, { useState } from 'react';

const stats = [
  { label: 'Total Obat', value: 6, icon: <i className="fa-solid fa-capsules"></i> },
  { label: 'Obat Stok Rendah', value: 2, icon: <i className="fa-solid fa-triangle-exclamation text-yellow-500"></i> },
  { label: 'Obat Stok Aman', value: 4, icon: <i className="fa-solid fa-check-circle text-green-500"></i> },
];

// Example obat data based on ObatModel.js
const initialObatList = [
  {
    id_obat: 1,
    nama_obat: 'Paracetamol',
    jenis: 'Tablet',
    stok: 5,
    harga_per_unit: 1500.0,
    satuan: 'Strip',
  },
  {
    id_obat: 2,
    nama_obat: 'Amoxicillin',
    jenis: 'Kapsul',
    stok: 10,
    harga_per_unit: 2000.0,
    satuan: 'Strip',
  },
  {
    id_obat: 3,
    nama_obat: 'Ibuprofen',
    jenis: 'Tablet',
    stok: 15,
    harga_per_unit: 1800.0,
    satuan: 'Strip',
  },
  {
    id_obat: 4,
    nama_obat: 'Cetirizine',
    jenis: 'Tablet',
    stok: 20,
    harga_per_unit: 2500.0,
    satuan: 'Strip',
  },
  {
    id_obat: 5,
    nama_obat: 'Salbutamol',
    jenis: 'Sirup',
    stok: 40,
    harga_per_unit: 12000.0,
    satuan: 'Botol',
  },
  {
    id_obat: 6,
    nama_obat: 'Betadine',
    jenis: 'Salep',
    stok: 40,
    harga_per_unit: 10000.0,
    satuan: 'Tube',
  },
];

function Obat() {
  const [obatList, setObatList] = useState(initialObatList);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedObat, setSelectedObat] = useState(null);

  const handleAdd = () => {
    setModalType('add');
    setSelectedObat(null);
    setShowModal(true);
  };

  const handleEdit = (obat) => {
    setModalType('edit');
    setSelectedObat(obat);
    setShowModal(true);
  };

  const handleDelete = (obat) => {
    setModalType('delete');
    setSelectedObat(obat);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedObat(null);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'add') {
      const form = e.target;
      const newObat = {
        id_obat: obatList.length > 0 ? Math.max(...obatList.map(o => o.id_obat)) + 1 : 1,
        nama_obat: form.nama_obat.value,
        jenis: form.jenis.value,
        stok: Number(form.stok.value),
        harga_per_unit: Number(form.harga_per_unit.value),
        satuan: form.satuan.value,
      };
      setObatList([...obatList, newObat]);
    } else if (modalType === 'edit') {
      const form = e.target;
      setObatList(
        obatList.map((o) =>
          o.id_obat === selectedObat.id_obat
            ? {
                ...o,
                nama_obat: form.nama_obat.value,
                jenis: form.jenis.value,
                stok: Number(form.stok.value),
                harga_per_unit: Number(form.harga_per_unit.value),
                satuan: form.satuan.value,
              }
            : o
        )
      );
    } else if (modalType === 'delete') {
      setObatList(obatList.filter((o) => o.id_obat !== selectedObat.id_obat));
    }
    setShowModal(false);
    setSelectedObat(null);
  };

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-800 mb-8">Obat</h1>

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
        <h2 className="text-xl font-bold text-green-800">Tabel Data Obat</h2>
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
            Tambah Obat
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-green-800">ID</th>
              <th className="px-4 py-2 text-left text-green-800">Nama Obat</th>
              <th className="px-4 py-2 text-left text-green-800">Jenis</th>
              <th className="px-4 py-2 text-left text-green-800">Stok</th>
              <th className="px-4 py-2 text-left text-green-800">Harga/Unit</th>
              <th className="px-4 py-2 text-left text-green-800">Satuan</th>
              <th className="px-4 py-2 text-left text-green-800">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {obatList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">
                  Belum ada data obat.
                </td>
              </tr>
            ) : (
              obatList.map((obat) => (
                <tr key={obat.id_obat} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{obat.id_obat}</td>
                  <td className="px-4 py-2">{obat.nama_obat}</td>
                  <td className="px-4 py-2">{obat.jenis}</td>
                  <td className="px-4 py-2">{obat.stok}</td>
                  <td className="px-4 py-2">
                    Rp {Number(obat.harga_per_unit).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2">{obat.satuan}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => handleEdit(obat)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(obat)}
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
        {obatList.length === 0 && (
          <div className="text-center text-gray-400 py-8">Belum ada data obat.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add'
                  ? 'Tambah Obat'
                  : modalType === 'edit'
                  ? 'Edit Obat'
                  : 'Hapus Obat'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus obat <b>{selectedObat?.nama_obat}</b>?
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
                  <label className="block mb-1">Nama Obat</label>
                  <input
                    name="nama_obat"
                    defaultValue={selectedObat?.nama_obat || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Jenis</label>
                  <select
                    name="jenis"
                    defaultValue={selectedObat?.jenis || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Pilih</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Kapsul">Kapsul</option>
                    <option value="Sirup">Sirup</option>
                    <option value="Salep">Salep</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Stok</label>
                  <input
                    name="stok"
                    type="number"
                    min={0}
                    defaultValue={selectedObat?.stok || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Harga per Unit</label>
                  <input
                    name="harga_per_unit"
                    type="number"
                    min={0}
                    defaultValue={selectedObat?.harga_per_unit || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Satuan</label>
                  <input
                    name="satuan"
                    defaultValue={selectedObat?.satuan || ''}
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

export default Obat;