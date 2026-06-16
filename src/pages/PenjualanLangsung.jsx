import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';

function PenjualanLangsung() {
  const navigate = useNavigate();
  const [obatList, setObatList] = useState([]);
  const [cart, setCart] = useState([]);
  
  // States for the current input
  const [selectedObatId, setSelectedObatId] = useState('');
  const [jumlah, setJumlah] = useState(1);

  // States for direct puyer
  const [isPuyer, setIsPuyer] = useState(false);
  const [puyerPermintaan, setPuyerPermintaan] = useState('');

  useEffect(() => {
    const fetchObat = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/obat`, { withCredentials: true });
        setObatList(response.data);
      } catch (error) {
        console.error("Error fetching obat:", error);
      }
    };
    fetchObat();
  }, []);

  const handleAddToCart = () => {
    if (!selectedObatId) return alert('Silakan pilih obat terlebih dahulu!');
    if (!jumlah || jumlah <= 0) return alert('Jumlah harus lebih dari 0!');

    const obat = obatList.find(o => String(o.id_obat) === String(selectedObatId));
    if (!obat) return;

    if (jumlah > obat.stok) {
      return alert(`Stok tidak mencukupi! Sisa stok ${obat.nama_obat} adalah ${obat.stok}.`);
    }

    const subtotal = Number(obat.harga_per_unit) * Number(jumlah);

    const newItem = {
      obat,
      jumlah_obat: Number(jumlah),
      subtotal,
      is_puyer: isPuyer,
      puyer_permintaan: puyerPermintaan
    };

    setCart([...cart, newItem]);

    // Reset form
    setSelectedObatId('');
    setJumlah(1);
    setIsPuyer(false);
    setPuyerPermintaan('');
  };

  const handleRemoveFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const totalBelanja = cart.reduce((acc, item) => acc + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Keranjang belanja kosong!');

    try {
      // 1. Buat Resep Obat (Status Selesai, tanpa Rekam Medis)
      const resepData = {
        id_rekam_medis: null,
        tanggal_resep: new Date().toISOString().split('T')[0],
        status_resep: 'Selesai'
      };
      const resObatRes = await axios.post(`${import.meta.env.VITE_API_URL}/resep-obat`, resepData, { withCredentials: true });
      const idResep = resObatRes.data.data?.id_resep || resObatRes.data.data?.id;

      // 2. Masukkan Detail Resep (Sekaligus potong stok di backend jika backend sudah menghandle trigger/hook)
      for (const item of cart) {
        await axios.post(`${import.meta.env.VITE_API_URL}/detail-resep-obat`, {
          id_resep: idResep,
          id_obat: item.obat.id_obat,
          jumlah_obat: item.jumlah_obat,
          dosis: item.is_puyer ? 'Pembelian Puyer' : 'Pembelian Langsung',
          aturan_pakai: 'Sesuai Kemasan',
          catatan_terapis: item.is_puyer ? `Mohon racik PUYER sebanyak ${item.puyer_permintaan} bungkus.` : null
        }, { withCredentials: true });
      }

      // 3. Catat Transaksi
      const trxData = {
        tanggal_transaksi: new Date().toISOString().split('T')[0],
        total_biaya: totalBelanja,
        id_resep: idResep
      };

      const formData = new FormData();
      Object.keys(trxData).forEach(key => {
        formData.append(key, trxData[key]);
      });

      await axios.post(`${import.meta.env.VITE_API_URL}/transaksi`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true 
      });

      alert('Pembayaran berhasil dan resep langsung telah dibuat!');
      setCart([]);
    } catch (error) {
      console.error(error);
      alert('Gagal menyelesaikan pembayaran: ' + (error.response?.data?.msg || error.message));
    }
  };

  const selectOptions = obatList.map(o => ({
    value: o.id_obat,
    label: o.kekuatan ? `${o.nama_obat} (${o.kekuatan}) - Rp${o.harga_per_unit.toLocaleString()}` : `${o.nama_obat} - Rp${o.harga_per_unit.toLocaleString()}`
  }));

  const selectedOption = selectOptions.find(opt => opt.value === selectedObatId) || null;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/apoteker')} className="text-gray-500 hover:text-green-700 bg-white p-2 rounded-full shadow">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-3xl font-bold text-green-800">Penjualan Obat Bebas (Kasir)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input Kasir */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow border-t-4 border-green-700 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2"><i className="fa-solid fa-cart-plus mr-2"></i>Tambah Barang</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold text-gray-700 text-sm">Pilih Obat</label>
                <Select
                  options={selectOptions}
                  value={selectedOption}
                  onChange={(opt) => setSelectedObatId(opt ? opt.value : '')}
                  isClearable placeholder="Cari obat..."
                  styles={{ control: (base) => ({ ...base, minHeight: '38px', borderRadius: '0.375rem', borderColor: '#d1d5db' }) }}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700 text-sm">Jumlah ({selectedObatId ? obatList.find(o => String(o.id_obat) === String(selectedObatId))?.satuan : 'Pcs'})</label>
                <input 
                  type="number" 
                  min="1" 
                  value={jumlah} 
                  onChange={(e) => setJumlah(e.target.value)} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
                {selectedObatId && (
                  <div className="text-xs text-gray-500 mt-1">Stok tersedia: <span className="font-bold text-blue-600">{obatList.find(o => String(o.id_obat) === String(selectedObatId))?.stok}</span></div>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="checkbox" 
                    id="isPuyer" 
                    checked={isPuyer} 
                    onChange={e => setIsPuyer(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isPuyer" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Pelanggan Minta Diracik Puyer
                  </label>
                </div>
                {isPuyer && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Jadikan Berapa Bungkus?</label>
                    <input type="number" min="1" value={puyerPermintaan} onChange={e => setPuyerPermintaan(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Cth: 10" />
                  </div>
                )}
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 shadow flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus"></i> Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>

        {/* Keranjang Belanja */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2"><i className="fa-solid fa-shopping-cart mr-2"></i>Keranjang Belanja</h2>
            
            <div className="flex-1 overflow-y-auto mb-4 min-h-[300px]">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <i className="fa-solid fa-box-open text-4xl mb-3"></i>
                  <p>Keranjang kosong. Tambahkan obat untuk memulai transaksi.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50">
                      <div>
                        <div className="font-bold text-green-800">{item.obat.nama_obat}</div>
                        <div className="text-sm text-gray-600">
                          {item.jumlah_obat} {item.obat.satuan} x Rp{item.obat.harga_per_unit.toLocaleString()}
                        </div>
                        {item.is_puyer && (
                          <div className="text-xs text-red-600 font-semibold mt-1">
                            *Akan diracik menjadi {item.puyer_permintaan} bungkus puyer
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-bold text-gray-800">Rp{item.subtotal.toLocaleString()}</div>
                        <button onClick={() => handleRemoveFromCart(idx)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600 font-semibold text-lg">Total Pembayaran:</span>
                <span className="text-3xl font-bold text-green-700">Rp{totalBelanja.toLocaleString()}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-lg font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
              >
                <i className="fa-solid fa-cash-register"></i> Selesaikan Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PenjualanLangsung;
