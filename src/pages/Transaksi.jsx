import React, { useState } from 'react';

// Example transaksi data based on the model and associations
const initialTransaksiList = [
  {
    id_transaksi: 1,
    pasien: { nama: 'Ahmad' },
    pelayanan: { nama_pelayanan: 'Konsultasi Umum' },
    resep: { kode_resep: 'RSP001' },
    tanggal_transaksi: '2024-06-01',
    total_biaya: 150000,
    status_pembayaran: 'Lunas',
  },
  {
    id_transaksi: 2,
    pasien: { nama: 'Siti' },
    pelayanan: { nama_pelayanan: 'Pemeriksaan Gigi' },
    resep: { kode_resep: 'RSP002' },
    tanggal_transaksi: '2024-06-02',
    total_biaya: 200000,
    status_pembayaran: 'Belum lunas',
  },
  {
    id_transaksi: 3,
    pasien: { nama: 'Rizky' },
    pelayanan: { nama_pelayanan: 'Imunisasi' },
    resep: { kode_resep: 'RSP003' },
    tanggal_transaksi: '2024-06-03',
    total_biaya: 100000,
    status_pembayaran: 'Lunas',
  },
];

// Example stats
const getStats = (list) => [
  { label: 'Total Transaksi', value: list.length, icon: <i className="fa-solid fa-wallet text-blue-600"></i> },
  { label: 'Transaksi Lunas', value: list.filter(t => t.status_pembayaran === 'Lunas').length, icon: <i className="fa-solid fa-check-circle text-green-500"></i> },
  { label: 'Belum Lunas', value: list.filter(t => t.status_pembayaran === 'Belum lunas').length, icon: <i className="fa-solid fa-triangle-exclamation text-yellow-500"></i> },
];

function Transaksi() {
  const [transaksiList, setTransaksiList] = useState(initialTransaksiList);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  const stats = getStats(transaksiList);

  const handleAdd = () => {
    setModalType('add');
    setSelectedTransaksi(null);
    setShowModal(true);
  };

  const handleEdit = (trx) => {
    setModalType('edit');
    setSelectedTransaksi(trx);
    setShowModal(true);
  };

  const handleDelete = (trx) => {
    setModalType('delete');
    setSelectedTransaksi(trx);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTransaksi(null);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'add') {
      const form = e.target;
      const newTrx = {
        id_transaksi: transaksiList.length > 0 ? Math.max(...transaksiList.map(t => t.id_transaksi)) + 1 : 1,
        pasien: { nama: form.pasien_nama.value },
        pelayanan: { nama_pelayanan: form.pelayanan_nama.value },
        resep: { kode_resep: form.kode_resep.value },
        tanggal_transaksi: form.tanggal_transaksi.value,
        total_biaya: Number(form.total_biaya.value),
        status_pembayaran: form.status_pembayaran.value,
      };
      setTransaksiList([...transaksiList, newTrx]);
    } else if (modalType === 'edit') {
      const form = e.target;
      setTransaksiList(
        transaksiList.map((t) =>
          t.id_transaksi === selectedTransaksi.id_transaksi
            ? {
                ...t,
                pasien: { nama: form.pasien_nama.value },
                pelayanan: { nama_pelayanan: form.pelayanan_nama.value },
                resep: { kode_resep: form.kode_resep.value },
                tanggal_transaksi: form.tanggal_transaksi.value,
                total_biaya: Number(form.total_biaya.value),
                status_pembayaran: form.status_pembayaran.value,
              }
            : t
        )
      );
    } else if (modalType === 'delete') {
      setTransaksiList(transaksiList.filter((t) => t.id_transaksi !== selectedTransaksi.id_transaksi));
    }
    setShowModal(false);
    setSelectedTransaksi(null);
  };

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-800 mb-8">Transaksi</h1>

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
        <h2 className="text-xl font-bold text-green-800">Tabel Data Transaksi</h2>
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
            Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-green-800">ID</th>
              <th className="px-4 py-2 text-left text-green-800">Pasien</th>
              <th className="px-4 py-2 text-left text-green-800">Pelayanan</th>
              <th className="px-4 py-2 text-left text-green-800">Resep</th>
              <th className="px-4 py-2 text-left text-green-800">Tanggal</th>
              <th className="px-4 py-2 text-left text-green-800">Total Biaya</th>
              <th className="px-4 py-2 text-left text-green-800">Status</th>
              <th className="px-4 py-2 text-left text-green-800">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksiList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-8">
                  Belum ada data transaksi.
                </td>
              </tr>
            ) : (
              transaksiList.map((trx) => (
                <tr key={trx.id_transaksi} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{trx.id_transaksi}</td>
                  <td className="px-4 py-2">{trx.pasien?.nama || '-'}</td>
                  <td className="px-4 py-2">{trx.pelayanan?.nama_pelayanan || '-'}</td>
                  <td className="px-4 py-2">{trx.resep?.kode_resep || '-'}</td>
                  <td className="px-4 py-2">{trx.tanggal_transaksi}</td>
                  <td className="px-4 py-2">
                    Rp {Number(trx.total_biaya).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2">
                    <span className={trx.status_pembayaran === 'Lunas' ? 'text-green-700 font-semibold' : 'text-yellow-700 font-semibold'}>
                      {trx.status_pembayaran}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => handleEdit(trx)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(trx)}
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
        {transaksiList.length === 0 && (
          <div className="text-center text-gray-400 py-8">Belum ada data transaksi.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add'
                  ? 'Tambah Transaksi'
                  : modalType === 'edit'
                  ? 'Edit Transaksi'
                  : 'Hapus Transaksi'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus transaksi <b>{selectedTransaksi?.id_transaksi}</b>?
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
                    name="pasien_nama"
                    defaultValue={selectedTransaksi?.pasien?.nama || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Nama Pelayanan</label>
                  <input
                    name="pelayanan_nama"
                    defaultValue={selectedTransaksi?.pelayanan?.nama_pelayanan || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Kode Resep</label>
                  <input
                    name="kode_resep"
                    defaultValue={selectedTransaksi?.resep?.kode_resep || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Tanggal Transaksi</label>
                  <input
                    name="tanggal_transaksi"
                    type="date"
                    defaultValue={selectedTransaksi?.tanggal_transaksi || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Total Biaya</label>
                  <input
                    name="total_biaya"
                    type="number"
                    min={0}
                    defaultValue={selectedTransaksi?.total_biaya || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Status Pembayaran</label>
                  <select
                    name="status_pembayaran"
                    defaultValue={selectedTransaksi?.status_pembayaran || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Pilih</option>
                    <option value="Lunas">Lunas</option>
                    <option value="Belum lunas">Belum lunas</option>
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

export default Transaksi;