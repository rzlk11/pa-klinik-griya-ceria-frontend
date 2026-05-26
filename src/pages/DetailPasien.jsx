import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';

const customStyles = {
  headRow: { style: { backgroundColor: '#f0fdf4', borderBottom: '2px solid #166534' } },
  headCells: { style: { color: '#166534', fontWeight: '700', fontSize: '14px' } },
  rows: { style: { fontSize: '14px', '&:hover': { backgroundColor: '#f0fdf4' } } },
  pagination: { style: { borderTop: '1px solid #e5e7eb', fontSize: '13px' } },
};

function DetailPasien() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pasien, setPasien] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/pasien/${id}`, { withCredentials: true });
        setPasien(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Memuat data...</div>;
  }

  if (!pasien) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-gray-600 mb-4">Pasien tidak ditemukan</h2>
        <button onClick={() => navigate('/pasien')} className="text-green-700 hover:underline">Kembali ke Daftar Pasien</button>
      </div>
    );
  }

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const birth = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    let result = '';
    if (years > 0) result += `${years} Tahun `;
    if (months > 0) result += `${months} Bulan `;
    if (days >= 0) result += `${days} Hari`;
    return result.trim();
  };

  const rekamMedisColumns = [
    { name: 'Tgl Rekam Medis', selector: row => row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID') : '-', sortable: true },
    { name: 'Diagnosa', selector: row => row.diagnosa || '-', wrap: true },
    { name: 'Tindakan', selector: row => row.tindakan || '-', wrap: true },
    { name: 'Catatan', selector: row => row.catatan || '-', wrap: true },
  ];

  const resepObatColumns = [
    { name: 'Tanggal', selector: row => row.tanggal_resep, sortable: true },
    { name: 'Status', selector: row => row.status_resep, sortable: true, cell: row => (
        <span className={row.status_resep === 'Aktif' ? 'text-green-700 font-semibold' : row.status_resep === 'Selesai' ? 'text-blue-700 font-semibold' : 'text-red-700 font-semibold'}>
          {row.status_resep}
        </span>
      ) },
    { name: 'Detail Obat', cell: row => row.details && row.details.length > 0 ? (
        <ul className="list-disc ml-4 my-2">
          {row.details.map((detail) => (<li key={detail.id}>{detail.nama_obat} ({detail.dosis}) - {detail.jumlah} {detail.satuan}</li>))}
        </ul>
      ) : <span className="text-gray-400">-</span>, wrap: true },
  ];

  const transaksiColumns = [
    { name: 'Tanggal', selector: row => row.tanggal_transaksi, sortable: true },
    { name: 'Total Biaya', selector: row => row.total_biaya, sortable: true, cell: row => `Rp ${Number(row.total_biaya).toLocaleString('id-ID')}` },
    { name: 'Status', selector: row => row.status_pembayaran, sortable: true, cell: row => (
        <span className={row.status_pembayaran === 'Lunas' ? 'text-green-700 font-semibold' : 'text-yellow-700 font-semibold'}>
          {row.status_pembayaran}
        </span>
      ) },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/pasien')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
          <i className="fa-solid fa-arrow-left mr-2"></i> Kembali
        </button>
        <h1 className="text-3xl font-bold text-green-800">Detail Pasien: {pasien.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Info Pasien */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-green-800 mb-4 border-b pb-2">Informasi Pasien</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Nama Lengkap</span><span className="font-medium">{pasien.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Usia</span><span className="font-medium">{calculateAge(pasien.date_of_birth)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tanggal Lahir</span><span className="font-medium">{pasien.date_of_birth}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Jenis Kelamin</span><span className="font-medium">{pasien.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
          </div>
        </div>

        {/* Info Orang Tua */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-green-800 mb-4 border-b pb-2">Informasi Orang Tua</h2>
          {pasien.orang_tua ? (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Nama</span><span className="font-medium">{pasien.orang_tua.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Hubungan</span><span className="font-medium capitalize">{pasien.orang_tua.relation}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">No. Telepon</span><span className="font-medium">{pasien.orang_tua.phone}</span></div>
            </div>
          ) : (
            <div className="text-gray-400 italic">Data orang tua tidak tersedia.</div>
          )}
        </div>
      </div>

      {/* Tabs / Sections for related data */}
      <div className="space-y-8">
        {/* Rekam Medis */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-green-800"><i className="fa-solid fa-file-medical mr-2"></i>Riwayat Rekam Medis</h3>
          </div>
          <DataTable
            columns={rekamMedisColumns}
            data={pasien.rekam_medis || []}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10]}
            noDataComponent={<div className="text-center text-gray-400 py-6">Belum ada riwayat rekam medis.</div>}
            customStyles={customStyles}
          />
        </div>

        {/* Resep Obat */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-green-800"><i className="fa-solid fa-prescription mr-2"></i>Riwayat Resep Obat</h3>
          </div>
          <DataTable
            columns={resepObatColumns}
            data={pasien.reseps || []}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10]}
            noDataComponent={<div className="text-center text-gray-400 py-6">Belum ada riwayat resep obat.</div>}
            customStyles={customStyles}
          />
        </div>

        {/* Transaksi */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-green-800"><i className="fa-solid fa-wallet mr-2"></i>Riwayat Transaksi</h3>
          </div>
          <DataTable
            columns={transaksiColumns}
            data={pasien.transaksi || []}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10]}
            noDataComponent={<div className="text-center text-gray-400 py-6">Belum ada riwayat transaksi.</div>}
            customStyles={customStyles}
          />
        </div>
      </div>
    </div>
  );
}

export default DetailPasien;
