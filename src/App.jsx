// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import DokterDashboard from './pages/DokterDashboard';
import ApotekerDashboard from './pages/ApotekerDashboard';
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Pasien from './pages/Pasien';
import Terapis from './pages/Terapis';
import Obat from './pages/Obat';
import Vaksin from './pages/Vaksin';
import Transaksi from './pages/Transaksi';
import ResepObat from './pages/ResepObat';
import KelolaDetailResep from './pages/KelolaDetailResep';
import RekamMedis from './pages/RekamMedis';
import PelayananKesehatan from './pages/PelayananKesehatan';
import DetailPasien from './pages/DetailPasien';
import Antrian from './pages/Antrian';
import PenjualanLangsung from './pages/PenjualanLangsung';

function App() {
  return (
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path='/' element={<LoginForm />} />
          <Route path='/register' element={<RegisterForm />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path='/dashboard/admin' element={<AdminDashboard />} />
          <Route path='/dashboard/dokter' element={<DokterDashboard />} />
          <Route path='/dashboard/apoteker' element={<ApotekerDashboard />} />
          <Route path='/pasien' element={<Pasien />} />
          <Route path='/pasien/:id' element={<DetailPasien />} />
          <Route path='/terapis' element={<Terapis />} />
          <Route path='/obat' element={<Obat />} />
          <Route path='/vaksin' element={<Vaksin />} />
          <Route path='/transaksi' element={<Transaksi />} />
          <Route path='/resep-obat' element={<ResepObat />} />
          <Route path='/resep-obat/:id/detail' element={<KelolaDetailResep />} />
          <Route path='/rekam-medis' element={<RekamMedis />} />
          <Route path='/pelayanan-kesehatan' element={<PelayananKesehatan />} />
          <Route path='/antrian' element={<Antrian />} />
          <Route path='/penjualan-langsung' element={<PenjualanLangsung />} />
        </Route>
      </Routes>
  );
}

export default App;
