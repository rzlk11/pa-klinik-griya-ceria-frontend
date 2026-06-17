import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Select from 'react-select';
import TableFilter from '../components/TableFilter';

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
  { label: 'Total Resep', value: list.length, icon: <i className="fa-solid fa-prescription text-blue-600"></i> },
  { label: 'Aktif', value: list.filter(r => r.status_resep === 'Aktif').length, icon: <i className="fa-solid fa-circle text-green-500"></i> },
  { label: 'Selesai', value: list.filter(r => r.status_resep === 'Selesai').length, icon: <i className="fa-solid fa-check-circle text-green-600"></i> },
  { label: 'Dibatalkan', value: list.filter(r => r.status_resep === 'Dibatalkan').length, icon: <i className="fa-solid fa-times-circle text-red-500"></i> },
];

function ResepObat() {
  const navigate = useNavigate();
  const [resepList, setResepList] = useState([]);
  const [rekamMedisList, setRekamMedisList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedResep, setSelectedResep] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', idPasien: '' });
  const [pasienList, setPasienList] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/resep-obat`, { withCredentials: true });
      const dataWithDetails = response.data.map(item => ({ ...item, details: item.details || [] }));
      setResepList(dataWithDetails);

      const rmResponse = await axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis`, { withCredentials: true });
      setRekamMedisList(rmResponse.data);

      const pasienRes = await axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true });
      setPasienList(pasienRes.data);
    } catch (error) { console.error(error); }
  };

  const stats = getStats(resepList);
  const handleAdd = () => { setModalType('add'); setSelectedResep(null); setShowModal(true); };
  const handleEdit = (r) => { setModalType('edit'); setSelectedResep(r); setShowModal(true); };
  const handleDelete = (r) => { setModalType('delete'); setSelectedResep(r); setShowModal(true); };
  const handleModalClose = () => { setShowModal(false); setSelectedResep(null); };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/resep-obat/${selectedResep.id_resep}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = { 
          id_rekam_medis: Number(form.id_rekam_medis.value), 
          tanggal_resep: form.tanggal_resep.value, 
          status_resep: form.status_resep.value,
          resep_teks: form.resep_teks.value
        };
        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/resep-obat`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/resep-obat/${selectedResep.id_resep}`, data, { withCredentials: true });
        }
      }
      fetchData(); handleModalClose();
    } catch (error) { console.error(error); }
  };

  const columns = useMemo(() => [
    { name: 'ID Resep', selector: row => row.id_resep, sortable: true, width: '90px' },
    { name: 'Pasien & RM', cell: row => {
        if (!row.rekam_medis_detail) return <span className="text-gray-400">Data tidak tersedia</span>;
        const rm = row.rekam_medis_detail;
        const pasien = rm.pasien;
        return (
          <div className="py-2">
            <div className="font-semibold text-green-800">{pasien ? pasien.name : 'Pasien tidak diketahui'}</div>
            <div className="text-xs text-gray-500 mt-1">RM ID: {rm.id_rekam_medis} | Diagnosa: {rm.diagnosa || '-'}</div>
          </div>
        );
      }, sortable: true, sortFunction: (a, b) => {
          const nameA = a.rekam_medis_detail?.pasien?.name || '';
          const nameB = b.rekam_medis_detail?.pasien?.name || '';
          return nameA.localeCompare(nameB);
      }, width: '250px' 
    },
    { name: 'Tanggal', selector: row => row.tanggal_resep, sortable: true },
    { name: 'Status', selector: row => row.status_resep, sortable: true, cell: row => (
        <span className={row.status_resep === 'Aktif' ? 'text-green-700 font-semibold' : row.status_resep === 'Selesai' ? 'text-blue-700 font-semibold' : 'text-red-700 font-semibold'}>
          {row.status_resep}
        </span>
      ) },
    { name: 'Detail Obat', cell: row => {
        if (row.resep_teks && row.resep_teks.trim() !== '') {
          return (
            <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 p-2 rounded font-mono whitespace-pre-wrap max-h-32 overflow-y-auto my-2 w-full">
              {row.resep_teks}
            </div>
          );
        } else if (row.details && row.details.length > 0) {
          return (
            <ul className="list-disc ml-4 my-2 text-xs text-gray-700 max-h-32 overflow-y-auto w-full pr-2">
              {row.details.map((detail) => (
                <li key={detail.id_detail_resep}>
                  {detail.obat?.nama_obat || 'Obat tidak diketahui'} ({detail.dosis}) - {detail.jumlah_obat} {detail.obat?.satuan || ''}
                </li>
              ))}
            </ul>
          );
        }
        return <span className="text-gray-400 italic">Tanpa obat</span>;
      }, wrap: true, width: '300px' },
    { name: 'Aksi', width: '250px', cell: (row) => (
        <div className="flex gap-2">
          <button className="text-green-600 hover:underline font-semibold" onClick={() => navigate(`/resep-obat/${row.id_resep}/detail`)}>Kelola Obat</button>
          <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
          <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Hapus</button>
        </div>
      ), ignoreRowClick: true },
  ], [navigate]);

  const filteredData = useMemo(() => {
    let result = resepList;

    if (filters.startDate && filters.endDate) {
      result = result.filter(r => r.tanggal_resep >= filters.startDate && r.tanggal_resep <= filters.endDate);
    }
    if (filters.idPasien) {
      result = result.filter(r => r.rekam_medis_detail?.id_pasien === filters.idPasien);
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(r =>
        (r.tanggal_resep && r.tanggal_resep.toLowerCase().includes(lower)) ||
        (r.status_resep && r.status_resep.toLowerCase().includes(lower)) ||
        (r.rekam_medis_detail?.pasien?.name && r.rekam_medis_detail.pasien.name.toLowerCase().includes(lower)) ||
        (r.rekam_medis_detail?.diagnosa && r.rekam_medis_detail.diagnosa.toLowerCase().includes(lower)) ||
        String(r.id_rekam_medis).includes(lower)
      );
    }
    return result;
  }, [resepList, searchText, filters]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-800 mb-8">Resep Obat</h1>
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg w-full shadow p-5 flex flex-col items-start">
            <div className="text-gray-400 flex items-center mb-2">
              <span className="mr-2">{stat.icon}</span><span>{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-green-800">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-800">Tabel Data Resep Obat</h2>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700" />
          <button className="bg-green-800 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900" onClick={handleAdd}>
            Tambah Resep
          </button>
        </div>
      </div>

      <TableFilter 
        onFilterChange={setFilters} 
        pasienList={pasienList} 
        showPasien={true} 
      />

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <DataTable columns={columns} data={filteredData} pagination paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={10} paginationRowsPerPageOptions={[5, 10, 20, 50]}
          noDataComponent={<div className="text-center text-gray-400 py-8">Belum ada data resep.</div>}
          customStyles={customStyles} highlightOnHover striped />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add' ? 'Tambah Resep' : modalType === 'edit' ? 'Edit Resep' : 'Hapus Resep'}
              </h3>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">Apakah Anda yakin ingin menghapus resep <b>{selectedResep?.id_resep}</b>?</p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Hapus</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                {(() => {
                  const rekamMedisOptions = rekamMedisList.map(rm => ({
                    value: rm.id_rekam_medis,
                    label: `ID: ${rm.id_rekam_medis} - Pasien: ${rm.pasien?.name || 'Tidak diketahui'} (Diagnosa: ${rm.diagnosa || '-'})`
                  }));
                  const statusOptions = [
                    { value: 'Aktif', label: 'Aktif' },
                    { value: 'Selesai', label: 'Selesai' },
                    { value: 'Dibatalkan', label: 'Dibatalkan' }
                  ];

                  return (
                    <>
                      <div>
                        <label className="block mb-1">Rekam Medis</label>
                        <Select
                          name="id_rekam_medis"
                          options={rekamMedisOptions}
                          defaultValue={rekamMedisOptions.find(o => o.value === selectedResep?.id_rekam_medis) || null}
                          isClearable
                          placeholder="-- Pilih Rekam Medis --"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Tanggal Resep</label>
                        <input name="tanggal_resep" type="date" defaultValue={selectedResep?.tanggal_resep || ''} required className="w-full border px-3 py-2 rounded" />
                      </div>
                      <div>
                        <label className="block mb-1">Status Resep</label>
                        <Select
                          name="status_resep"
                          options={statusOptions}
                          defaultValue={statusOptions.find(o => o.value === selectedResep?.status_resep) || null}
                          isClearable
                          placeholder="Pilih Status"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Teks Resep (Opsional)</label>
                        <textarea
                          name="resep_teks"
                          rows="4"
                          defaultValue={selectedResep?.resep_teks || ''}
                          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                          placeholder="Masukkan teks resep obat di sini jika tidak menggunakan obat dari database..."
                        ></textarea>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">
                          {modalType === 'add' ? 'Tambah' : 'Simpan'}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResepObat;