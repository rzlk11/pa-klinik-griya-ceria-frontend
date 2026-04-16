import React, { useState } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const stats = [
  { label: 'Total Pasien', value: 50, icon: '👤' },
  { label: 'Total Dokter', value: 10, icon: '🩺' },
  { label: 'Total Jenis Obat', value: 10, icon: '💊' },
  { label: 'Total Transaksi Hari ini', value: 'Rp 150.000', icon: '🧾' },
];

const obatStok = [
  { name: 'Obat 1', value: 5, color: 'bg-red-500' },
  { name: 'Obat 2', value: 10, color: 'bg-red-500' },
  { name: 'Obat 3', value: 15, color: 'bg-yellow-400' },
  { name: 'Obat 4', value: 20, color: 'bg-yellow-400' },
  { name: 'Obat 5', value: 40, color: 'bg-green-500' },
  { name: 'Obat 6', value: 40, color: 'bg-green-500' },
];

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const chartData = [500, 400, 200, 100, 700, 600, 50, 100, 500, 400, 500, 600];

const barData = {
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

    const handleLogout = () => {
    navigate('/');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Dashboard</h1>
        <div className="relative">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100"
          onClick={() => setShowAdminDropdown((prev) => !prev)}
        >
          <span>Admin</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
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
      <div className="flex flex-col lg:flex-row gap-6 justify-between mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white w-full rounded-lg shadow p-5 flex flex-col items-start">
            <div className="text-gray-400 flex items-center mb-2">
              <span className="mr-2">{stat.icon}</span>
              <span>{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-green-800">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col justify-end">
          <div className="mb-2 text-gray-400 font-semibold">Total Pendapatan per Bulan</div>
          <div className="flex-1 flex flex-col justify-end min-h-[300px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 w-full lg:w-80">
          <div className="text-gray-400 mb-2">Stok Obat</div>
          <ul>
            {obatStok.map((obat, idx) => (
              <li key={idx} className="flex items-center justify-between py-1">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${obat.color}`}></span>
                  <span>{obat.name}</span>
                </div>
                <span className="font-semibold text-green-800">{obat.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;