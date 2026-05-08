  import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getStats = (list) => [
  { label: 'Total Rekam Medis', value: list.length, icon: <i className="fa-solid fa-file-medical text-blue-600"></i> },
];

function RekamMedis() {
  const [rekamMedisList, setRekamMedisList] = useState([]);
  const [pasienList, setPasienList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [pelayananList, setPelayananList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedRekamMedis, setSelectedRekamMedis] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis`, { withCredentials: true });
      setRekamMedisList(response.data);

      const pasienRes = await axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true });
      setPasienList(pasienRes.data);

      const dokterRes = await axios.get(`${import.meta.env.VITE_API_URL}/dokter`, { withCredentials: true });
      setDokterList(dokterRes.data);

      const pelayananRes = await axios.get(`${import.meta.env.VITE_API_URL}/pelayanan`, { withCredentials: true });
      setPelayananList(pelayananRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const stats = getStats(rekamMedisList);

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

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/rekam-medis/${selectedRekamMedis.id_rekam_medis}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = {
          diagnosa: form.diagnosa.value,
          tindakan: form.tindakan.value,
          catatan: form.catatan.value,
          id_pasien: Number(form.id_pasien.value),
          id_dokter: Number(form.id_dokter.value),
          id_pelayanan: Number(form.id_pelayanan.value),
        };

        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/rekam-medis`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/rekam-medis/${selectedRekamMedis.id_rekam_medis}`, data, { withCredentials: true });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
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
                  <label className="block mb-1">Pasien</label>
                  <select
                    name="id_pasien"
                    defaultValue={selectedRekamMedis?.id_pasien || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">-- Pilih Pasien --</option>
                    {pasienList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Dokter</label>
                  <select
                    name="id_dokter"
                    defaultValue={selectedRekamMedis?.id_dokter || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">-- Pilih Dokter --</option>
                    {dokterList.map((d) => (
                      <option key={d.id_dokter} value={d.id_dokter}>{d.nama_dokter}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Pelayanan</label>
                  <select
                    name="id_pelayanan"
                    defaultValue={selectedRekamMedis?.id_pelayanan || ''}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">-- Pilih Pelayanan --</option>
                    {pelayananList.map((p) => (
                      <option key={p.id_pelayanan} value={p.id_pelayanan}>{p.nama_pelayanan}</option>
                    ))}
                  </select>
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