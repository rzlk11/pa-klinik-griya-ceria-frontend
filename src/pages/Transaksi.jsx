import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Select from 'react-select';
import TableFilter from '../components/TableFilter';
import * as XLSX from 'xlsx';

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
  { label: 'Total Transaksi', value: list.length, icon: <i className="fa-solid fa-wallet text-blue-600"></i> },
];

function Transaksi() {
  const role = localStorage.getItem('role') || 'admin';

  const [transaksiList, setTransaksiList] = useState([]);
  const [pasienList, setPasienList] = useState([]);
  const [pelayananList, setPelayananList] = useState([]);
  const [resepList, setResepList] = useState([]);
  const [rekamMedisList, setRekamMedisList] = useState([]);
  const [terapisList, setTerapisList] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit' | 'delete'
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [selectedPasienId, setSelectedPasienId] = useState('');
  const [selectedPelayananId, setSelectedPelayananId] = useState('');
  const [selectedResepId, setSelectedResepId] = useState('');
  const [tanggalTransaksi, setTanggalTransaksi] = useState('');
  const [totalBiaya, setTotalBiaya] = useState('');
  const [rincianBiaya, setRincianBiaya] = useState({ pelayanan: 0, obat: 0 });

  const [previewImage, setPreviewImage] = useState('');
  const [fileImage, setFileImage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', idPasien: '', idTerapis: '' });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let biayaPelayanan = 0;
    let biayaObat = 0;

    if (selectedPelayananId) {
      const pel = pelayananList.find(p => p.id_pelayanan === Number(selectedPelayananId));
      if (pel && pel.harga) biayaPelayanan = Number(pel.harga);
    }

    if (selectedResepId) {
      const res = resepList.find(r => r.id_resep === Number(selectedResepId));
      if (res && res.details) {
        res.details.forEach(d => {
          if (d.obat && d.obat.harga_per_unit) {
            biayaObat += d.jumlah_obat * Number(d.obat.harga_per_unit);
          }
        });
      }
    }

    setRincianBiaya({ pelayanan: biayaPelayanan, obat: biayaObat });
    if (modalType !== 'edit' || (modalType === 'edit' && (selectedPelayananId !== selectedTransaksi?.id_pelayanan || selectedResepId !== selectedTransaksi?.id_resep))) {
      setTotalBiaya(biayaPelayanan + biayaObat);
    }
  }, [selectedPelayananId, selectedResepId, pelayananList, resepList, modalType, selectedTransaksi]);

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
      const rmRes = await axios.get(`${import.meta.env.VITE_API_URL}/rekam-medis`, { withCredentials: true });
      setRekamMedisList(rmRes.data);
      const terapisRes = await axios.get(`${import.meta.env.VITE_API_URL}/terapis`, { withCredentials: true });
      setTerapisList(terapisRes.data);
    } catch (error) { console.error(error); }
  };

  const stats = getStats(transaksiList);

  const handleAdd = () => { 
    setModalType('add'); setSelectedTransaksi(null); setPreviewImage(''); setFileImage(''); 
    setSelectedPasienId(''); setSelectedPelayananId(''); setSelectedResepId(''); 
    setTanggalTransaksi(new Date().toISOString().split('T')[0]); setTotalBiaya(0);
    setShowModal(true); 
  };
  const handleEdit = (trx) => { 
    setModalType('edit'); setSelectedTransaksi(trx); setPreviewImage(trx.bukti_transaksi || ''); setFileImage(''); 
    setSelectedPasienId(trx.id_pasien || ''); 
    setSelectedPelayananId(trx.id_pelayanan || ''); 
    setSelectedResepId(trx.id_resep || ''); 
    setTanggalTransaksi(trx.tanggal_transaksi || ''); 
    setTotalBiaya(trx.total_biaya || 0);
    setShowModal(true); 
  };
  const handleDelete = (trx) => { setModalType('delete'); setSelectedTransaksi(trx); setShowModal(true); };
  const handleModalClose = () => { 
    setShowModal(false); setSelectedTransaksi(null); setPreviewImage(''); setFileImage(''); 
    setSelectedPasienId(''); setSelectedPelayananId(''); setSelectedResepId(''); 
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
        if(form.id_terapis.value) formData.append("id_terapis", form.id_terapis.value);
        formData.append("tanggal_transaksi", form.tanggal_transaksi.value);
        formData.append("total_biaya", form.total_biaya.value);
        if (fileImage) { formData.append("bukti_transaksi", fileImage); }

        if (modalType === 'add') {
          await axios.post(`${import.meta.env.VITE_API_URL}/transaksi`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
        } else if (modalType === 'edit') {
          await axios.patch(`${import.meta.env.VITE_API_URL}/transaksi/${selectedTransaksi.id_transaksi}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
        }
      }
      fetchData(); handleModalClose();
      fetchData(); handleModalClose();
    } catch (error) { console.error(error); }
  };

  const getBiayaObat = (row) => {
    let biayaObat = 0;
    if (row.id_resep) {
      const res = resepList.find(r => r.id_resep === row.id_resep);
      if (res && res.details) {
        res.details.forEach(d => {
          if (d.obat && d.obat.harga_per_unit) {
            biayaObat += d.jumlah_obat * Number(d.obat.harga_per_unit);
          }
        });
      }
    }
    return biayaObat;
  };

  const columns = useMemo(() => {
    const cols = [
    { name: 'ID', selector: row => row.id_transaksi, sortable: true, width: '70px' },
    { name: 'Pasien', selector: row => row.pasien?.name || '-', sortable: true },
    { name: 'Terapis', cell: row => {
        if (!row.terapis) return '-';
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.terapis.kode_warna || '#cccccc' }}></div>
            <span>{row.terapis.nama_terapis}</span>
          </div>
        )
      }, sortable: true },
    { name: 'Pelayanan', selector: row => row.pelayanan?.nama_pelayanan || '-', sortable: true },
    { name: 'Resep', selector: row => row.resep?.id_resep || '-', sortable: true, width: '250px', wrap: true, cell: row => {
        if (!row.id_resep) return '-';
        const resepDetail = resepList.find(r => r.id_resep === row.id_resep);
        return (
          <div className="py-2">
            <div className="font-semibold text-green-700 mb-1">ID: {row.id_resep}</div>
            {resepDetail?.resep_teks && resepDetail.resep_teks.trim() !== '' ? (
              <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 p-1.5 rounded font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
                {resepDetail.resep_teks}
              </div>
            ) : resepDetail?.details?.length > 0 ? (
              <ul className="text-xs text-gray-500 list-disc pl-3 space-y-0.5 max-h-24 overflow-y-auto">
                {resepDetail.details.map((d, i) => (
                  <li key={i}>{d.obat?.nama_obat} ({d.jumlah_obat}x) - {d.aturan_pakai}</li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500 italic">Tanpa obat</div>
            )}
          </div>
        );
    } },
    { name: 'Tanggal', selector: row => row.tanggal_transaksi, sortable: true },
    { name: role === 'apoteker' ? 'Biaya Obat' : 'Total Biaya', selector: row => role === 'apoteker' ? getBiayaObat(row) : row.total_biaya, sortable: true, cell: row => `Rp ${Number(role === 'apoteker' ? getBiayaObat(row) : row.total_biaya).toLocaleString('id-ID')}` },
    { name: 'Bukti', cell: row => row.bukti_transaksi ? (
        <a href={row.bukti_transaksi} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Lihat Bukti</a>
      ) : '-' }
    ];

    if (role !== 'apoteker') {
      cols.push({ name: 'Aksi', width: '180px', cell: (row) => (
          <div className="flex gap-2">
            <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
            <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Hapus</button>
          </div>
        ), ignoreRowClick: true });
    }

    return cols;
  }, [resepList, role]);

  const filteredData = useMemo(() => {
    let result = role === 'apoteker' ? transaksiList.filter(t => t.id_resep) : transaksiList;

    if (filters.startDate && filters.endDate) {
      result = result.filter(t => t.tanggal_transaksi >= filters.startDate && t.tanggal_transaksi <= filters.endDate);
    }
    if (filters.idPasien) {
      result = result.filter(t => t.id_pasien === filters.idPasien);
    }
    if (filters.idTerapis) {
      result = result.filter(t => t.id_terapis === filters.idTerapis);
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(t =>
        (t.pasien?.name && t.pasien.name.toLowerCase().includes(lower)) ||
        (t.pelayanan?.nama_pelayanan && t.pelayanan.nama_pelayanan.toLowerCase().includes(lower)) ||
        (t.tanggal_transaksi && t.tanggal_transaksi.toLowerCase().includes(lower))
      );
    }
    return result;
  }, [transaksiList, searchText, filters]);

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    const exportData = filteredData.map((t, index) => {
      const resepDetail = t.id_resep ? resepList.find(r => r.id_resep === t.id_resep) : null;
      let obatText = 'Tanpa obat';
      if (resepDetail?.resep_teks) {
        obatText = resepDetail.resep_teks;
      } else if (resepDetail?.details?.length > 0) {
        obatText = resepDetail.details.map(d => `${d.obat?.nama_obat} (${d.jumlah_obat}x) - ${d.aturan_pakai}`).join('\n');
      }
      
      return {
        No: index + 1,
        'ID Transaksi': t.id_transaksi,
        Pasien: t.pasien?.name || '-',
        Terapis: t.terapis?.nama_terapis || '-',
        Pelayanan: t.pelayanan?.nama_pelayanan || '-',
        'ID Resep': t.id_resep || '-',
        Obat: obatText,
        Tanggal: t.tanggal_transaksi,
        [role === 'apoteker' ? 'Biaya Obat' : 'Total Biaya']: Number(role === 'apoteker' ? getBiayaObat(t) : t.total_biaya)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Transaksi");
    XLSX.writeFile(workbook, `Laporan_Transaksi_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-800 mb-8">Transaksi</h1>
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
        <h2 className="text-xl font-bold text-green-800">Tabel Data Transaksi</h2>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center gap-2" onClick={handleExportExcel}>
            <i className="fa-solid fa-file-excel"></i> Export Excel
          </button>
          {role !== 'apoteker' && (
            <button className="bg-green-800 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900" onClick={handleAdd}>
              Tambah Transaksi
            </button>
          )}
        </div>
      </div>
      
      <TableFilter 
        onFilterChange={setFilters} 
        pasienList={pasienList} 
        terapisList={terapisList} 
        showPasien={true} 
        showTerapis={true} 
      />

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <DataTable columns={columns} data={filteredData} pagination paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={10} paginationRowsPerPageOptions={[5, 10, 20, 50]}
          noDataComponent={<div className="text-center text-gray-400 py-8">Belum ada data transaksi.</div>}
          customStyles={customStyles} highlightOnHover striped />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">
                {modalType === 'add' ? 'Tambah Transaksi' : modalType === 'edit' ? 'Edit Transaksi' : 'Hapus Transaksi'}
              </h3>
              <button type="button" onClick={handleModalClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {modalType === 'delete' ? (
              <form onSubmit={handleModalSubmit}>
                <p className="mb-6">Apakah Anda yakin ingin menghapus transaksi <b>{selectedTransaksi?.id_transaksi}</b>?</p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Hapus</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                {(() => {
                  const pasienOptions = pasienList.map(p => ({ value: p.id, label: p.name }));
                  const pelayananOptions = pelayananList.map(p => ({ value: p.id_pelayanan, label: p.nama_pelayanan }));
                  const terapisOptions = terapisList.map(t => ({ value: t.id_terapis, label: t.nama_terapis }));
                  
                  const resepOptions = !selectedPasienId ? [] : resepList
                    .filter(r => {
                      const rm = rekamMedisList.find(rm => rm.id_rekam_medis === r.id_rekam_medis);
                      return rm && rm.id_pasien === Number(selectedPasienId);
                    })
                    .map(r => {
                      let obatText = 'Tanpa obat';
                      if (r.resep_teks) obatText = 'Resep Teks';
                      else if (r.details?.length > 0) obatText = r.details.map(d => d.obat?.nama_obat).join(', ');
                      const rm = rekamMedisList.find(rm => rm.id_rekam_medis === r.id_rekam_medis);
                      const namaPasien = rm?.pasien?.name || 'Pasien tidak diketahui';
                      return {
                        value: r.id_resep,
                        label: `ID: ${r.id_resep} - ${namaPasien} - ${r.tanggal_resep} (${r.status_resep}) - Obat: ${obatText}`
                      };
                    });

                  return (
                    <>
                      <div>
                        <label className="block mb-1">Pasien</label>
                        <Select
                          name="id_pasien"
                          options={pasienOptions}
                          value={pasienOptions.find(o => o.value === Number(selectedPasienId)) || null}
                          onChange={(option) => setSelectedPasienId(option ? option.value : '')}
                          isClearable
                          placeholder="-- Pilih Pasien --"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Pelayanan</label>
                        <Select
                          name="id_pelayanan"
                          options={pelayananOptions}
                          value={pelayananOptions.find(o => o.value === Number(selectedPelayananId)) || null}
                          onChange={(option) => setSelectedPelayananId(option ? option.value : '')}
                          isClearable
                          placeholder="-- Pilih Pelayanan --"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Resep</label>
                        <Select
                          name="id_resep"
                          options={resepOptions}
                          value={resepOptions.find(o => o.value === Number(selectedResepId)) || null}
                          onChange={(option) => setSelectedResepId(option ? option.value : '')}
                          isClearable
                          isDisabled={!selectedPasienId}
                          placeholder={selectedPasienId ? "-- Pilih Resep --" : "Silakan pilih pasien terlebih dahulu"}
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Terapis</label>
                        <Select
                          name="id_terapis"
                          options={terapisOptions}
                          defaultValue={terapisOptions.find(o => o.value === selectedTransaksi?.id_terapis) || null}
                          isClearable
                          placeholder="-- Pilih Terapis --"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Tanggal Transaksi</label>
                        <input name="tanggal_transaksi" type="date" value={tanggalTransaksi} onChange={(e) => setTanggalTransaksi(e.target.value)} required className="w-full border px-3 py-2 rounded" />
                      </div>
                      <div>
                        <label className="block mb-1">Total Biaya (Rp)</label>
                        <input name="total_biaya" type="number" value={totalBiaya} onChange={(e) => setTotalBiaya(e.target.value)} required className="w-full border px-3 py-2 rounded" />
                        <div className="text-xs text-gray-500 mt-1">
                          Rincian: Pelayanan Rp {rincianBiaya.pelayanan.toLocaleString('id-ID')} + Obat Rp {rincianBiaya.obat.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1">Bukti Transaksi</label>
                        <input type="file" name="bukti_transaksi" accept="image/*" onChange={loadImage} className="w-full border px-3 py-2 rounded" />
                        {previewImage ? (
                          <figure className="mt-2">
                            <img src={previewImage} alt="Preview Bukti" className="w-32 h-32 object-cover rounded shadow" />
                          </figure>
                        ) : ""}
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

export default Transaksi;