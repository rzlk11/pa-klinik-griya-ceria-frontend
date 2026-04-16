import React, { useState } from 'react';

// Example data based on RekamMedisModel.js and associations
const initialRekamMedisList = [
  {
    id_rekam_medis: 1,
    pasien: { name: 'Ahmad', gender: 'L', date_of_birth: '2012-01-01' },
    dokter: { nama_dokter: 'Dr. Andi' },
    pelayanan: { nama_pelayanan: 'Konsultasi Umum' },
    diagnosa: 'Demam dan batuk',
    tindakan: 'Pemberian obat penurun panas',
    catatan: 'Kontrol kembali jika tidak membaik',
  },
  {
    id_rekam_medis: 2,
    pasien: { name: 'Siti', gender: 'P', date_of_birth: '2014-03-12' },
    dokter: { nama_dokter: 'Dr. Dewi' },
    pelayanan: { nama_pelayanan: 'Pemeriksaan Gigi' },
    diagnosa: 'Gigi berlubang',
    tindakan: 'Penambalan gigi',
    catatan: 'Jaga kebersihan gigi',
  },
  {
    id_rekam_medis: 3,
    pasien: { name: 'Rizky', gender: 'L', date_of_birth: '2016-07-21' },
    dokter: { nama_dokter: 'Dr. Budi' },
    pelayanan: { nama_pelayanan: 'Imunisasi' },
    diagnosa: 'Sehat',
    tindakan: 'Imunisasi campak',
    catatan: '',
  },
];

const stats = [
  { label: 'Total Rekam Medis', value: initialRekamMedisList.length, icon: '📄' },
];

function RekamMedis() {
  const [rekamMedisList, setRekamMedisList] = useState(initialRekamMedisList);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedRekamMedis, setSelectedRekamMedis] = useState(null);

  const handleAdd = () => {
    setModalType('add');
    setSelectedRekamMedis(null);
    setShowModal(true);
  };

  const handleEdit = (rm) => {
    setModalType('edit');
    setSelectedRekamMedis(rm);
    setShowModal(true);
  };

  const handleDelete = (rm) => {
    setModalType('delete');
    setSelectedRekamMedis(rm);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRekamMedis(null);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'add') {
      const form = e.target;
      const newRM = {
        id_rekam_medis: rekamMedisList.length > 0 ? Math.max(...rekamMedisList.map(rm => rm.id_rekam_medis)) + 1 : 1,
        pasien: {
          name: form.pasien_name.value,
          gender: form.pasien_gender.value,
          date_of_birth: form.pasien_date_of_birth.value,
        },
        dokter: { nama_dokter: form.dokter_nama.value },
        pelayanan: { nama_pelayanan: form.pelayanan_nama.value },
        diagnosa: form.diagnosa.value,
        tindakan: form.tindakan.value,
        catatan: form.catatan.value,
      };
      setRekamMedisList([...rekamMedisList, newRM]);
    } else if (modalType === 'edit') {
      const form = e.target;
      setRekamMedisList(
        rekamMedisList.map((rm) =>
          rm.id_rekam_medis === selectedRekamMedis.id_rekam_medis
            ? {
                ...rm,
                pasien: {
                  name: form.pasien_name.value,
                  gender: form.pasien_gender.value,
                  date_of_birth: form.pasien_date_of_birth.value,
                },
                dokter: { nama_dokter: form.dokter_nama.value },
                pelayanan: { nama_pelayanan: form.pelayanan_nama.value },
                diagnosa: form.diagnosa.value,
                tindakan: form.tindakan.value,
                catatan: form.catatan.value,
              }
            : rm
        )
      );
    } else if (modalType === 'delete') {
      setRekamMedisList(rekamMedisList.filter((rm) => rm.id_rekam_medis !== selectedRekamMedis.id_rekam_medis));
    }
    setShowModal(false);
    setSelectedRekamMedis(null);
  };

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-800 mb-8">Rekam Medis</h1>

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
        <h2 className="text-xl font-bold text-green-800">Tabel Data Rekam Medis</h2>
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
            Tambah Rekam Medis
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
              <th className="px-4 py-2 text-left text-green-800">Jenis Kelamin</th>
              <th className="px-4 py-2 text-left text-green-800">Tanggal Lahir</th>
              <th className="px-4 py-2 text-left text-green-800">Dokter</th>
              <th className="px-4 py-2 text-left text-green-800">Pelayanan</th>
              <th className="px-4 py-2 text-left text-green-800">Diagnosa</th>
              <th className="px-4 py-2 text-left text-green-800">Tindakan</th>
              <th className="px-4 py-2 text-left text-green-800">Catatan</th>
              <th className="px-4 py-2 text-left text-green-800">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rekamMedisList.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-gray-400 py-8">
                  Belum ada data rekam medis.
                </td>
              </tr>
            ) : (
              rekamMedisList.map((rm) => (
                <tr key={rm.id_rekam_medis} className="border-b hover:bg-gray-50 align-top">
                  <td className="px-4 py-2">{rm.id_rekam_medis}</td>
                  <td className="px-4 py-2">{rm.pasien?.name || '-'}</td>
                  <td className="px-4 py-2">
                    {rm.pasien?.gender === 'L' ? 'Laki-laki' : rm.pasien?.gender === 'P' ? 'Perempuan' : '-'}
                  </td>
                  <td className="px-4 py-2">{rm.pasien?.date_of_birth || '-'}</td>
                  <td className="px-4 py-2">{rm.dokter?.nama_dokter || '-'}</td>
                  <td className="px-4 py-2">{rm.pelayanan?.nama_pelayanan || '-'}</td>
                  <td className="px-4 py-2">{rm.diagnosa || '-'}</td>
                  <td className="px-4 py-2">{rm.tindakan || '-'}</td>
                  <td className="px-4 py-2">{rm.catatan || '-'}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => handleEdit(rm)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(rm)}
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
        {rekamMedisList.length === 0 && (
          <div className="text-center text-gray-400 py-8">Belum ada data rekam medis.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add'
                  ? 'Tambah Rekam Medis'
                  : modalType === 'edit'
                  ? 'Edit Rekam Medis'
                  : 'Hapus Rekam Medis'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus rekam medis pasien <b>{selectedRekamMedis?.pasien?.name}</b>?
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
                    name="pasien_name"
                    defaultValue={selectedRekamMedis?.pasien?.name || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Jenis Kelamin</label>
                  <select
                    name="pasien_gender"
                    defaultValue={selectedRekamMedis?.pasien?.gender || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Tanggal Lahir</label>
                  <input
                    name="pasien_date_of_birth"
                    type="date"
                    defaultValue={selectedRekamMedis?.pasien?.date_of_birth || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Nama Dokter</label>
                  <input
                    name="dokter_nama"
                    defaultValue={selectedRekamMedis?.dokter?.nama_dokter || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Nama Pelayanan</label>
                  <input
                    name="pelayanan_nama"
                    defaultValue={selectedRekamMedis?.pelayanan?.nama_pelayanan || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Diagnosa</label>
                  <textarea
                    name="diagnosa"
                    defaultValue={selectedRekamMedis?.diagnosa || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Tindakan</label>
                  <textarea
                    name="tindakan"
                    defaultValue={selectedRekamMedis?.tindakan || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Catatan</label>
                  <textarea
                    name="catatan"
                    defaultValue={selectedRekamMedis?.catatan || ''}
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

export default RekamMedis;