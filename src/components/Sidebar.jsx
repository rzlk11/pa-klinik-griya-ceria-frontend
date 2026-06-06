import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const role = localStorage.getItem('role') || 'admin';

  let menu = [];

  if (role === 'admin') {
    menu = [
      { to: '/dashboard/admin', icon: <i className="fa-solid fa-table-columns"></i>, label: 'Dashboard' },
      { to: '/pasien', icon: <i className="fa-solid fa-user-group"></i>, label: 'Pasien' },
      { to: '/terapis', icon: <i className="fa-solid fa-user-md"></i>, label: 'Terapis' },
      { to: '/obat', icon: <i className="fa-solid fa-capsules"></i>, label: 'Obat' },
      { to: '/transaksi', icon: <i className="fa-solid fa-wallet"></i>, label: 'Transaksi' },
      { to: '/resep-obat', icon: <i className="fa-solid fa-prescription"></i>, label: 'Resep Obat' },
      { to: '/rekam-medis', icon: <i className="fa-solid fa-file-medical"></i>, label: 'Rekam Medis' },
      { to: '/pelayanan-kesehatan', icon: <i className="fa-solid fa-hospital"></i>, label: 'Pelayanan Kesehatan' },
    ];
  } else if (role === 'dokter') {
    menu = [
      { to: '/dashboard/dokter', icon: <i className="fa-solid fa-table-columns"></i>, label: 'Dashboard' },
      { to: '/pasien', icon: <i className="fa-solid fa-user-group"></i>, label: 'Pasien' },
      { to: '/rekam-medis', icon: <i className="fa-solid fa-file-medical"></i>, label: 'Rekam Medis' },
      { to: '/resep-obat', icon: <i className="fa-solid fa-prescription"></i>, label: 'Resep Obat' },
    ];
  } else if (role === 'apoteker') {
    menu = [
      { to: '/dashboard/apoteker', icon: <i className="fa-solid fa-table-columns"></i>, label: 'Dashboard' },
      { to: '/obat', icon: <i className="fa-solid fa-capsules"></i>, label: 'Obat' },
      { to: '/resep-obat', icon: <i className="fa-solid fa-prescription"></i>, label: 'Resep Obat' },
    ];
  }

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 font-bold text-xl text-green-800 border-b border-gray-200">Klinik Griya Ceria</div>
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Overview</div>
        <ul className="space-y-1 text-gray-600 text-base">
          {menu.map((item, idx) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`flex items-center px-6 py-3 transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-800 font-semibold border-l-4 border-green-600'
                      : 'hover:bg-gray-50 hover:text-green-800 border-l-4 border-transparent'
                  }`}
                >
                  <span className="mr-3 w-5 text-center">{item.icon}</span> {item.label}
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