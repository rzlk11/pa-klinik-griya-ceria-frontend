import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';

const customStyles = {
  headRow: { style: { backgroundColor: '#f0fdf4', borderBottom: '2px solid #166534' } },
  headCells: { style: { color: '#166534', fontWeight: '700', fontSize: '14px' } },
  rows: { style: { fontSize: '14px', '&:hover': { backgroundColor: '#f0fdf4' } } },
  pagination: { style: { borderTop: '1px solid #e5e7eb', fontSize: '13px' } },
};
const paginationComponentOptions = {
  rowsPerPageText: 'Baris per halaman:', rangeSeparatorText: 'dari',
  noRowsPerPage: false, selectAllRowsItem: true, selectAllRowsItemText: 'Semua',
};

const getStats = (list) => [
  { label: 'Total Rekam Medis', value: list.length, icon: <i className="fa-solid fa-file-medical text-blue-600"></i> },
];

function RekamMedis() {
  const [rekamMedisList, setRekamMedisList] = useState([]);
  const [pasienList, setPasienList] = useState([]);
  const [terapisList, setTerapisList] = useState([]);
  const [pelayananList, setPelayananList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showResepModal, setShowResepModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const navigate = useNavigate();
  const [selectedRekamMedis, setSelectedRekamMedis] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis`, { withCredentials: true });
      setRekamMedisList(response.data);
      const pasienRes = await axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true });
      setPasienList(pasienRes.data);
      const terapisRes = await axios.get(`${import.meta.env.VITE_API_URL}/terapis`, { withCredentials: true });
      setTerapisList(terapisRes.data);
      const pelayananRes = await axios.get(`${import.meta.env.VITE_API_URL}/pelayanan`, { withCredentials: true });
      setPelayananList(pelayananRes.data);
    } catch (error) { console.error(error); }
  };

  const stats = getStats(rekamMedisList);
  const handleAdd = () => { setModalType('add'); setSelectedRekamMedis(null); setShowModal(true); };
  const handleEdit = (rm) => { setModalType('edit'); setSelectedRekamMedis(rm); setShowModal(true); };
  const handleDelete = (rm) => { setModalType('delete'); setSelectedRekamMedis(rm); setShowModal(true); };
  const handleKelolaResep = (rm) => { setSelectedRekamMedis(rm); setShowResepModal(true); };
  const handleModalClose = () => { setShowModal(false); setShowResepModal(false); setSelectedRekamMedis(null); };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/rekam-medis/${selectedRekamMedis.id_rekam_medis}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = {
          diagnosa: form.diagnosa.value, tindakan: form.tindakan.value, catatan: form.catatan.value,
          id_pasien: Number(form.id_pasien.value), 
          id_terapis: form.id_terapis.value ? Number(form.id_terapis.value) : null, 
          id_pelayanan: Number(form.id_pelayanan.value),
          berat_badan: form.berat_badan.value || null, suhu: form.suhu.value || null,
        };
        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/rekam-medis`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/rekam-medis/${selectedRekamMedis.id_rekam_medis}`, data, { withCredentials: true });
        }
      }
      fetchData(); handleModalClose();
    } catch (error) { console.error(error); }
  };

  const columns = useMemo(() => [
    { name: 'ID', selector: row => row.id_rekam_medis, sortable: true, width: '70px' },
    { name: 'Nama Pasien', selector: row => row.pasien?.name || '-', sortable: true },
    { name: 'Jenis Kelamin', selector: row => row.pasien?.gender || '-', sortable: true,
      cell: row => row.pasien?.gender === 'L' ? 'Laki-laki' : row.pasien?.gender === 'P' ? 'Perempuan' : '-', width: '120px' },
    { name: 'Tgl Lahir', selector: row => row.pasien?.date_of_birth || '-', sortable: true, width: '110px' },
    { name: 'Terapis', selector: row => row.terapis?.nama_terapis || '-', sortable: true },
    { name: 'Pelayanan', selector: row => row.pelayanan?.nama_pelayanan || '-', sortable: true },
    { name: 'Diagnosa', selector: row => row.diagnosa || '-', sortable: true, wrap: true },
    { name: 'Tindakan', selector: row => row.tindakan || '-', sortable: true, wrap: true },
    { name: 'Berat Badan', selector: row => row.berat_badan, sortable: true, width: '110px',
      cell: row => row.berat_badan ? `${row.berat_badan} kg` : '-' },
    { name: 'Suhu', selector: row => row.suhu, sortable: true, width: '100px',
      cell: row => row.suhu ? `${row.suhu} °C` : '-' },
    { name: 'Catatan', selector: row => row.catatan || '-', sortable: true, wrap: true },
    { name: 'Aksi', cell: (row) => (
        <div className="flex gap-2">
          <button className="text-green-600 hover:underline font-semibold" onClick={() => handleKelolaResep(row)}>Resep</button>
          <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
          <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Hapus</button>
        </div>
      ), ignoreRowClick: true },
  ], []);

  const filteredData = useMemo(() => {
    if (!searchText) return rekamMedisList;
    const lower = searchText.toLowerCase();
    return rekamMedisList.filter(rm =>
      (rm.pasien?.name && rm.pasien.name.toLowerCase().includes(lower)) ||
      (rm.terapis?.nama_terapis && rm.terapis.nama_terapis.toLowerCase().includes(lower)) ||
      (rm.pelayanan?.nama_pelayanan && rm.pelayanan.nama_pelayanan.toLowerCase().includes(lower)) ||
      (rm.diagnosa && rm.diagnosa.toLowerCase().includes(lower)) ||
      (rm.tindakan && rm.tindakan.toLowerCase().includes(lower))
    );
  }, [rekamMedisList, searchText]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-800 mb-8">Rekam Medis</h1>
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg w-auto shadow p-5 flex flex-col items-start">
            <div className="text-gray-400 flex items-center mb-2">
              <span className="mr-2">{stat.icon}</span><span>{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-green-800">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-800">Tabel Data Rekam Medis</h2>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700" />
          <button className="bg-green-800 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900" onClick={handleAdd}>
            Tambah Rekam Medis
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filteredData} pagination paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={10} paginationRowsPerPageOptions={[5, 10, 20, 50]}
          noDataComponent={<div className="text-center text-gray-400 py-8">Belum ada data rekam medis.</div>}
          customStyles={customStyles} highlightOnHover striped />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add' ? 'Tambah Rekam Medis' : modalType === 'edit' ? 'Edit Rekam Medis' : 'Hapus Rekam Medis'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">Apakah Anda yakin ingin menghapus rekam medis pasien <b>{selectedRekamMedis?.pasien?.name}</b>?</p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Hapus</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Pasien</label>
                  <select name="id_pasien" defaultValue={selectedRekamMedis?.id_pasien || ''} required className="w-full border px-3 py-2 rounded">
                    <option value="">-- Pilih Pasien --</option>
                    {pasienList.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Terapis</label>
                  <select name="id_terapis" defaultValue={selectedRekamMedis?.id_terapis || ''} className="w-full border px-3 py-2 rounded">
                    <option value="">-- Pilih Terapis --</option>
                    {terapisList.map((t) => (<option key={t.id_terapis} value={t.id_terapis}>{t.nama_terapis}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Pelayanan</label>
                  <select name="id_pelayanan" defaultValue={selectedRekamMedis?.id_pelayanan || ''} required className="w-full border px-3 py-2 rounded">
                    <option value="">-- Pilih Pelayanan --</option>
                    {pelayananList.map((p) => (<option key={p.id_pelayanan} value={p.id_pelayanan}>{p.nama_pelayanan}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Diagnosa</label>
                  <textarea name="diagnosa" defaultValue={selectedRekamMedis?.diagnosa || ''} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1">Tindakan</label>
                  <textarea name="tindakan" defaultValue={selectedRekamMedis?.tindakan || ''} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block mb-1">Berat Badan (kg)</label>
                    <input name="berat_badan" type="number" step="0.1" min="0"
                      defaultValue={selectedRekamMedis?.berat_badan || ''}
                      placeholder="Contoh: 15.5"
                      className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1">Suhu (°C)</label>
                    <input name="suhu" type="number" step="0.1" min="0"
                      defaultValue={selectedRekamMedis?.suhu || ''}
                      placeholder="Contoh: 36.5"
                      className="w-full border px-3 py-2 rounded" />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Catatan</label>
                  <textarea name="catatan" defaultValue={selectedRekamMedis?.catatan || ''} className="w-full border px-3 py-2 rounded" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">
                    {modalType === 'add' ? 'Tambah' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showResepModal && selectedRekamMedis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-green-800">
                Kelola Resep Obat - Pasien {selectedRekamMedis.pasien?.name}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Daftar Resep untuk Rekam Medis Ini:</h4>
              {selectedRekamMedis.resep_obat && selectedRekamMedis.resep_obat.length > 0 ? (
                <div className="space-y-4">
                  {selectedRekamMedis.resep_obat.map(resep => (
                    <div key={resep.id_resep} className="border p-4 rounded-lg flex justify-between items-center bg-gray-50">
                      <div>
                        <div className="font-semibold">Resep #{resep.id_resep}</div>
                        <div className="text-sm text-gray-600">Tanggal: {resep.tanggal_resep}</div>
                        <div className="text-sm">Status: <span className={resep.status_resep === 'Aktif' ? 'text-green-600 font-bold' : 'text-blue-600 font-bold'}>{resep.status_resep}</span></div>
                        <div className="text-xs text-gray-500 mt-1">Total Obat: {resep.details ? resep.details.length : 0} jenis</div>
                      </div>
                      <button 
                        onClick={() => navigate(`/resep-obat/${resep.id_resep}/detail`)}
                        className="bg-green-700 text-white px-4 py-2 rounded font-medium hover:bg-green-800"
                      >
                        Kelola Detail Obat
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={async () => {
                      try {
                        const todayDate = new Date();
                        const year = todayDate.getFullYear();
                        const month = String(todayDate.getMonth() + 1).padStart(2, '0');
                        const day = String(todayDate.getDate()).padStart(2, '0');
                        const todayStr = `${year}-${month}-${day}`;
                  
                        await axios.post(`${import.meta.env.VITE_API_URL}/resep-obat`, {
                          id_rekam_medis: selectedRekamMedis.id_rekam_medis,
                          tanggal_resep: todayStr,
                          status_resep: 'Aktif'
                        }, { withCredentials: true });
                        setShowResepModal(false);
                        fetchData();
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 w-full"
                  >
                    + Buat Resep Baru Lainnya
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">Belum ada resep obat untuk rekam medis ini.</p>
                  <button 
                    onClick={async () => {
                      try {
                        const todayDate = new Date();
                        const year = todayDate.getFullYear();
                        const month = String(todayDate.getMonth() + 1).padStart(2, '0');
                        const day = String(todayDate.getDate()).padStart(2, '0');
                        const todayStr = `${year}-${month}-${day}`;
                  
                        await axios.post(`${import.meta.env.VITE_API_URL}/resep-obat`, {
                          id_rekam_medis: selectedRekamMedis.id_rekam_medis,
                          tanggal_resep: todayStr,
                          status_resep: 'Aktif'
                        }, { withCredentials: true });
                        setShowResepModal(false);
                        fetchData();
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
                  >
                    + Buat Resep Baru
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RekamMedis;