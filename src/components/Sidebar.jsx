import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const menu = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/pasien', icon: '👤', label: 'Pasien' },
    { to: '/dokter', icon: '🩺', label: 'Dokter' },
    { to: '/obat', icon: '💊', label: 'Obat' },
    { to: '/transaksi', icon: '🧾', label: 'Transaksi' },
    { to: '/resep-obat', icon: '📝', label: 'Resep Obat' },
    { to: '/rekam-medis', icon: '📄', label: 'Rekam Medis' },
    { to: '/orang-tua', icon: '👥', label: 'Orang Tua Pasien' },
    { to: '/pelayanan-kesehatan', icon: '🏥', label: 'Pelayanan Kesehatan' },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <div className="p-6 font-bold text-xl text-green-800">Klinik Griya Ceria</div>
      <nav className="mt-6">
        <ul className="space-y-2 text-gray-700 text-base">
          {menu.map((item, idx) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`flex items-center px-4 py-2 rounded ${
                    isActive
                      ? 'bg-green-100 text-green-800 font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span> {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;