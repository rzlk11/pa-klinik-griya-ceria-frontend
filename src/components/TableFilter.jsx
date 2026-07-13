import React, { useState, useEffect } from 'react';
import Select from 'react-select';

function TableFilter({ onFilterChange, pasienList = [], terapisList = [], showPasien = false, showTerapis = false }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPasienId, setSelectedPasienId] = useState('');
  const [selectedTerapisId, setSelectedTerapisId] = useState('');
  const [activePreset, setActivePreset] = useState('semua');

  // Helper function to get local date string YYYY-MM-DD
  const getLocalISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Trigger onFilterChange whenever any filter state changes
  useEffect(() => {
    onFilterChange({
      startDate,
      endDate,
      idPasien: selectedPasienId,
      idTerapis: selectedTerapisId
    });
  }, [startDate, endDate, selectedPasienId, selectedTerapisId]);

  const handlePreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    
    if (preset === 'semua') {
      setStartDate('');
      setEndDate('');
      return;
    }

    if (preset === 'hari_ini') {
      const todayStr = getLocalISODate(today);
      setStartDate(todayStr);
      setEndDate(todayStr);
      return;
    }

    if (preset === 'minggu_ini') {
      const first = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1); // Monday
      const last = first + 6; // Sunday
      const firstDay = new Date(today.setDate(first));
      const lastDay = new Date(today.setDate(last));
      setStartDate(getLocalISODate(firstDay));
      setEndDate(getLocalISODate(lastDay));
      // restore today
      today.setTime(Date.now());
      return;
    }

    if (preset === 'bulan_ini') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(getLocalISODate(firstDay));
      setEndDate(getLocalISODate(lastDay));
      return;
    }
  };

  const handleCustomDateChange = () => {
    setActivePreset('custom');
  };

  const pasienOptions = pasienList.map(p => ({ value: p.id || p.id_pasien, label: p.name }));
  const terapisOptions = terapisList.map(t => ({ value: t.id_terapis, label: t.nama_terapis }));

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <i className="fa-solid fa-filter text-green-700"></i> Filter Data
        </h3>
        
        <div className="flex gap-2 text-sm">
          <button 
            onClick={() => handlePreset('semua')}
            className={`px-3 py-1.5 rounded-md border transition-colors ${activePreset === 'semua' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            Semua Waktu
          </button>
          <button 
            onClick={() => handlePreset('hari_ini')}
            className={`px-3 py-1.5 rounded-md border transition-colors ${activePreset === 'hari_ini' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            Hari Ini
          </button>
          <button 
            onClick={() => handlePreset('minggu_ini')}
            className={`px-3 py-1.5 rounded-md border transition-colors ${activePreset === 'minggu_ini' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            Minggu Ini
          </button>
          <button 
            onClick={() => handlePreset('bulan_ini')}
            className={`px-3 py-1.5 rounded-md border transition-colors ${activePreset === 'bulan_ini' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => { setStartDate(e.target.value); handleCustomDateChange(); }} 
            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-700" 
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => { setEndDate(e.target.value); handleCustomDateChange(); }} 
            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-700" 
          />
        </div>

        {showPasien && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nama Pasien</label>
            <Select
              options={pasienOptions}
              value={pasienOptions.find(o => o.value === selectedPasienId) || null}
              onChange={(option) => setSelectedPasienId(option ? option.value : '')}
              isClearable
              placeholder="Semua Pasien"
              styles={{
                control: (base) => ({ ...base, minHeight: '38px', borderRadius: '0.375rem', borderColor: '#d1d5db' }),
              }}
            />
          </div>
        )}

        {showTerapis && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nama Terapis</label>
            <Select
              options={terapisOptions}
              value={terapisOptions.find(o => o.value === selectedTerapisId) || null}
              onChange={(option) => setSelectedTerapisId(option ? option.value : '')}
              isClearable
              placeholder="Semua Terapis"
              styles={{
                control: (base) => ({ ...base, minHeight: '38px', borderRadius: '0.375rem', borderColor: '#d1d5db' }),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TableFilter;
