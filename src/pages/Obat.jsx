import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Select from 'react-select';

const customStyles = {
  headRow: { style: { backgroundColor: '#f0fdf4', borderBottom: '2px solid #166534' } },
  headCells: { style: { color: '#166534', fontWeight: '700', fontSize: '14px' } },
  rows: { style: { fontSize: '14px', '&:hover': { backgroundColor: '#f0fdf4' } } },
  pagination: { style: { borderTop: '1px solid #e5e7eb', fontSize: '13px' } },
};

const paginationComponentOptions = {
  rowsPerPageText: 'Baris per halaman:',
  rangeSeparatorText: 'dari',
  noRowsPerPage: false,
  selectAllRowsItem: true,
  selectAllRowsItemText: 'Semua',
};




function Obat() {
  const [obatList, setObatList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedObat, setSelectedObat] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [inputHarga, setInputHarga] = useState('');

  const [selectedRows, setSelectedRows] = useState([]);
  const [clearSelectedRows, setClearSelectedRows] = useState(false);
  const handleRowSelected = React.useCallback(state => setSelectedRows(state.selectedRows), []);

  const handleBulkDelete = async () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedRows.length} obat terpilih?`)) {
      try {
        await Promise.all(selectedRows.map(row => 
          axios.delete(`${import.meta.env.VITE_API_URL}/obat/${row.id_obat}`, { withCredentials: true })
        ));
        setSelectedRows([]);
        setClearSelectedRows(!clearSelectedRows);
        fetchData();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.msg || "Terjadi kesalahan saat menghapus beberapa data.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/obat`, { withCredentials: true });
      setObatList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = () => {
    setModalType('add');
    setSelectedObat(null);
    setInputHarga('');
    setShowModal(true);
  };

  const handleEdit = (obat) => {
    setModalType('edit');
    setSelectedObat(obat);
    setInputHarga(obat.harga_per_unit ? Number(obat.harga_per_unit).toLocaleString('id-ID') : '');
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

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'delete') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/obat/${selectedObat.id_obat}`, { withCredentials: true });
      } else {
        const form = e.target;
        const data = {
          nama_obat: form.nama_obat.value,
          kekuatan: form.kekuatan.value,
          jenis: form.jenis.value,
          stok: Number(form.stok.value),
          harga_per_unit: Number(inputHarga.replace(/\./g, '')),
          satuan: form.satuan.value,
        };

        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/obat`, data, { withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/obat/${selectedObat.id_obat}`, data, { withCredentials: true });
        }
      }
      fetchData();
      handleModalClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.msg || "Terjadi kesalahan!");
    }
  };

  const columns = useMemo(() => [
    { name: 'ID', selector: row => row.id_obat, sortable: true, width: '80px' },
    { name: 'Nama Obat', selector: row => row.nama_obat, sortable: true },
    { name: 'Kekuatan', selector: row => row.kekuatan, sortable: true },
    { name: 'Jenis', selector: row => row.jenis, sortable: true },
    { name: 'Stok', selector: row => row.stok, sortable: true, width: '100px' },
    {
      name: 'Harga/Unit',
      selector: row => row.harga_per_unit,
      sortable: true,
      cell: row => `Rp ${Number(row.harga_per_unit).toLocaleString('id-ID')}`,
    },
    { name: 'Satuan', selector: row => row.satuan, sortable: true, width: '100px' },
    {
      name: 'Aksi', width: '180px',
      cell: (row) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
          <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Hapus</button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ], []);

  const filteredData = useMemo(() => {
    if (!searchText) return obatList;
    const lower = searchText.toLowerCase();
    return obatList.filter(o =>
      (o.nama_obat && o.nama_obat.toLowerCase().includes(lower)) ||
      (o.jenis && o.jenis.toLowerCase().includes(lower)) ||
      (o.satuan && o.satuan.toLowerCase().includes(lower))
    );
  }, [obatList, searchText]);

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-800 mb-8">Obat</h1>



      {/* Table Title and Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-800">Tabel Data Obat</h2>
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <button className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 flex items-center gap-2 shadow" onClick={handleBulkDelete}>
              <i className="fa-solid fa-trash"></i> Hapus Terpilih ({selectedRows.length})
            </button>
          )}
          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
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
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20, 50]}
          noDataComponent={<div className="text-center text-gray-400 py-8">Belum ada data obat.</div>}
          customStyles={customStyles}
          highlightOnHover
          striped
          selectableRows onSelectedRowsChange={handleRowSelected} clearSelectedRows={clearSelectedRows}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              {(() => {
                const jenisOptions = [
                  { value: 'Tablet', label: 'Tablet' },
                  { value: 'Kapsul', label: 'Kapsul' },
                  { value: 'Sirup', label: 'Sirup' },
                  { value: 'Salep', label: 'Salep' },
                  { value: 'Lainnya', label: 'Lainnya' }
                ];
                
                return (
                  <>
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
                      <label className="block mb-1">Kekuatan</label>
                      <input
                        name="kekuatan"
                        defaultValue={selectedObat?.kekuatan || ''}
                        placeholder="Contoh: 500mg, 10ml, dll"
                        className="w-full border px-3 py-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Jenis</label>
                      <Select
                        name="jenis"
                        options={jenisOptions}
                        defaultValue={jenisOptions.find(o => o.value === selectedObat?.jenis) || null}
                        isClearable
                        placeholder="Pilih Jenis"
                      />
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
                        type="text"
                        value={inputHarga}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setInputHarga(val ? Number(val).toLocaleString('id-ID') : '');
                        }}
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

export default Obat;