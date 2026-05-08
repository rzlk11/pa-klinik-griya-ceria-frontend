import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Example stats
const getStats = (list) => [
  { label: 'Total Transaksi', value: list.length, icon: <i className="fa-solid fa-wallet text-blue-600"></i> },
  { label: 'Transaksi Lunas', value: list.filter(t => t.status_pembayaran === 'Lunas').length, icon: <i className="fa-solid fa-check-circle text-green-500"></i> },
  { label: 'Belum Lunas', value: list.filter(t => t.status_pembayaran === 'Belum lunas').length, icon: <i className="fa-solid fa-triangle-exclamation text-yellow-500"></i> },
];

function Transaksi() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [pasienList, setPasienList] = useState([]);
  const [pelayananList, setPelayananList] = useState([]);
  const [resepList, setResepList] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  const [previewImage, setPreviewImage] = useState('');
  const [fileImage, setFileImage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const trxRes = await axios.get(`${import.meta.env.VITE_API_URL}/transaksi`, { withCredentials: true });
      setTransaksiList(trxRes.data);

      const pasRes = await axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true });
      setPasienList(pasRes.data);

      const pelRes = await axios.get(`${import.meta.env.VITE_API_URL}/pelayanan`, { withCredentials: true });
      setPelayananList(pelRes.data);

      const resRes = await axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true });
      setResepList(resRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const stats = getStats(transaksiList);

  const handleAdd = () => {
    setModalType('add');
    setSelectedTransaksi(null);
    setPreviewImage('');
    setFileImage('');
    setShowModal(true);
  };

  const handleEdit = (trx) => {
    setModalType('edit');
    setSelectedTransaksi(trx);
    setPreviewImage(trx.bukti_transaksi || '');
    setFileImage('');
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
    setPreviewImage('');
    setFileImage('');
  };

  const loadImage = (e) => {
    const image = e.target.files[0];
    setFileImage(image);
    if(image) setPreviewImage(URL.createObjectURL(image));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/transaksi/${selectedTransaksi.id_transaksi}`, { withCredentials: true });
      } else {
        const form = e.target;
        const formData = new FormData();
        
        if(form.id_pasien.value) formData.append("id_pasien", form.id_pasien.value);
        if(form.id_pelayanan.value) formData.append("id_pelayanan", form.id_pelayanan.value);
        if(form.id_resep.value) formData.append("id_resep", form.id_resep.value);
        
        formData.append("tanggal_transaksi", form.tanggal_transaksi.value);
        formData.append("total_biaya", form.total_biaya.value);
        formData.append("status_pembayaran", form.status_pembayaran.value);
        if (fileImage) {
          formData.append("bukti_transaksi", fileImage);
        }

        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/transaksi`, formData, { 
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true 
          });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/transaksi/${selectedTransaksi.id_transaksi}`, formData, { 
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true 
          });
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
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
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
              <th className="px-4 py-2 text-left text-green-800">Bukti</th>
              <th className="px-4 py-2 text-left text-green-800">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksiList.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-gray-400 py-8">
                  Belum ada data transaksi.
                </td>
              </tr>
            ) : (
              transaksiList.map((trx) => (
                <tr key={trx.id_transaksi} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{trx.id_transaksi}</td>
                  <td className="px-4 py-2">{trx.pasien?.name || '-'}</td>
                  <td className="px-4 py-2">{trx.pelayanan?.nama_pelayanan || '-'}</td>
                  <td className="px-4 py-2">{trx.resep?.id_resep || '-'}</td>
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
                    {trx.bukti_transaksi ? (
                      <a href={trx.bukti_transaksi} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                        Lihat Bukti
                      </a>
                    ) : (
                      '-'
                    )}
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add'
                  ? 'Tambah Transaksi'
                  : modalType === 'edit'
                  ? 'Edit Transaksi'
                  : 'Hapus Transaksi'}
              </h3>
              <button type="button" onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
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
                  <label className="block mb-1">Pasien</label>
                  <select
                    name="id_pasien"
                    defaultValue={selectedTransaksi?.id_pasien || ''}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">-- Pilih Pasien --</option>
                    {pasienList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Pelayanan</label>
                  <select
                    name="id_pelayanan"
                    defaultValue={selectedTransaksi?.id_pelayanan || ''}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">-- Pilih Pelayanan --</option>
                    {pelayananList.map(p => (
                      <option key={p.id_pelayanan} value={p.id_pelayanan}>{p.nama_pelayanan}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Resep</label>
                  <select
                    name="id_resep"
                    defaultValue={selectedTransaksi?.id_resep || ''}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">-- Pilih Resep --</option>
                    {resepList.map(r => (
                      <option key={r.id_resep} value={r.id_resep}>{r.id_resep}</option>
                    ))}
                  </select>
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
                <div>
                  <label className="block mb-1">Bukti Transaksi</label>
                  <input
                    type="file"
                    name="bukti_transaksi"
                    accept="image/*"
                    onChange={loadImage}
                    className="w-full border px-3 py-2 rounded"
                  />
                  {previewImage ? (
                    <figure className="mt-2">
                      <img src={previewImage} alt="Preview Bukti" className="w-32 h-32 object-cover rounded shadow" />
                    </figure>
                  ) : (
                    ""
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
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