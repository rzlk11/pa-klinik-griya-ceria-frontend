import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Total Pendapatan per Bulan',
      color: '#166534',
      font: { size: 16, weight: 'bold' },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#166534', font: { weight: 'bold' } },
    },
    y: {
      beginAtZero: true,
      grid: { color: '#e5e7eb' },
      ticks: { color: '#166534', font: { weight: 'bold' } },
    },
  },
};

function Dashboard() {
  const navigate = useNavigate();
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  const [pasienCount, setPasienCount] = useState(0);
  const [dokterCount, setDokterCount] = useState(0);
  const [obatCount, setObatCount] = useState(0);
  const [todayTransaksi, setTodayTransaksi] = useState(0);
  const [obatStok, setObatStok] = useState([]);
  const [chartData, setChartData] = useState(Array(12).fill(0));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pasienRes, dokterRes, obatRes, transaksiRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/pasien`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/dokter`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/obat`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/transaksi`, { withCredentials: true }),
        ]);

        setPasienCount(pasienRes.data.length);
        setDokterCount(dokterRes.data.length);
        setObatCount(obatRes.data.length);

        const colors = ['bg-red-500', 'bg-yellow-400', 'bg-green-500', 'bg-blue-500', 'bg-purple-500'];
        const formattedObat = obatRes.data.map((o, idx) => ({
          name: o.nama_obat,
          value: o.stok,
          color: colors[idx % colors.length]
        }));
        setObatStok(formattedObat);

        const todayDate = new Date();
        const year = todayDate.getFullYear();
        const month = String(todayDate.getMonth() + 1).padStart(2, '0');
        const day = String(todayDate.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        let totalToday = 0;
        const monthlyData = Array(12).fill(0);

        transaksiRes.data.forEach(t => {
          const biaya = Number(t.total_biaya);
          if (t.tanggal_transaksi === todayStr) {
            totalToday += biaya;
          }
          const m = parseInt(t.tanggal_transaksi.split('-')[1], 10) - 1;
          if (m >= 0 && m <= 11) {
            monthlyData[m] += biaya;
          }
        });

        setTodayTransaksi(totalToday);
        setChartData(monthlyData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/logout`, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error("Error logging out", error);
      navigate('/');
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  const stats = [
    { label: 'Total Pasien', value: pasienCount, icon: <i className="fa-solid fa-user-group"></i> },
    { label: 'Total Dokter', value: dokterCount, icon: <i className="fa-solid fa-stethoscope"></i> },
    { label: 'Total Jenis Obat', value: obatCount, icon: <i className="fa-solid fa-capsules"></i> },
    { label: 'Total Transaksi Hari ini', value: formatRupiah(todayTransaksi), icon: <i className="fa-solid fa-wallet"></i> },
  ];

  const dynamicBarData = {
    labels: months,
    datasets: [
      {
        label: 'Total Pendapatan',
        data: chartData,
        backgroundColor: '#166534',
        borderRadius: 6,
        barThickness: 32,
      },
    ],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Dashboard</h1>
        <div className="relative">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 font-semibold text-green-800"
          onClick={() => setShowAdminDropdown((prev) => !prev)}
        >
          <i className="fa-solid fa-circle-user text-xl text-black"></i>
          <span className="text-sm">Admin</span>
          <i className="fa-solid fa-chevron-down text-xs"></i>
        </button>
        {showAdminDropdown && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow z-10">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded border border-gray-200 p-5 flex flex-col items-start">
            <div className="text-gray-400 text-sm flex items-center mb-4">
              <span className="mr-2 text-gray-300 text-lg">{stat.icon}</span>
              <span className="font-medium">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-green-800">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-white rounded border border-gray-200 p-6 flex-1 flex flex-col justify-end">
          <div className="mb-4 text-gray-300 text-sm font-semibold flex items-center">
            <i className="fa-solid fa-wallet mr-2"></i> Total Pendapatan per Bulan
          </div>
          <div className="flex-1 flex flex-col justify-end min-h-[300px]">
            <Bar data={dynamicBarData} options={barOptions} />
          </div>
        </div>
        <div className="bg-white rounded border border-gray-200 w-full lg:w-[350px]">
          <div className="text-gray-300 text-sm font-semibold flex items-center p-4 border-b border-gray-100">
             <i className="fa-solid fa-tags mr-2"></i> Stok Obat
          </div>
          <ul className="flex flex-col">
            {obatStok.map((obat, idx) => (
              <li key={idx} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center font-medium text-gray-700 text-sm">
                  <span className={`w-3 h-3 rounded-full mr-4 ${obat.color}`}></span>
                  <span>{obat.name}</span>
                </div>
                <span className="font-bold text-green-800">{obat.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;