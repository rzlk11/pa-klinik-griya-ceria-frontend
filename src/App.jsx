// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Pasien from './pages/Pasien';
import Dokter from './pages/Dokter';
import Obat from './pages/Obat';
import Transaksi from './pages/Transaksi';
import ResepObat from './pages/ResepObat';
import RekamMedis from './pages/RekamMedis';
import OrangTua from './pages/OrangTua';
import PelayananKesehatan from './pages/PelayananKesehatan';

function App() {
  return (
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path='/' element={<LoginForm />} />
          <Route path='/register' element={<RegisterForm />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/pasien' element={<Pasien />} />
          <Route path='/dokter' element={<Dokter />} />
          <Route path='/obat' element={<Obat />} />
          <Route path='/transaksi' element={<Transaksi />} />
          <Route path='/resep-obat' element={<ResepObat />} />
          <Route path='/rekam-medis' element={<RekamMedis />} />
          <Route path='/orang-tua' element={<OrangTua />} />
          <Route path='/pelayanan-kesehatan' element={<PelayananKesehatan />} />
        </Route>
      </Routes>
  );
}

export default App;
