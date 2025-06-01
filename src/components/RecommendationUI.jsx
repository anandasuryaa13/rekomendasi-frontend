import React, { useState, useEffect } from 'react';

// Komponen HTML pengganti UI library
const Card = ({ children, className }) => <div className={`border rounded p-4 shadow ${className} dark:bg-gray-800 dark:border-gray-700`}>{children}</div>;
const CardContent = ({ children, className }) => <div className={className}>{children}</div>;
const Button = ({ children, ...props }) => <button {...props} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 dark:bg-blue-700">{children}</button>;
const Checkbox = ({ checked, onCheckedChange }) => (
  <input type="checkbox" checked={checked} onChange={onCheckedChange} className="form-checkbox" />
);
const Label = ({ children, className }) => <label className={className}>{children}</label>;

const RecommendationUI = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [preference, setPreference] = useState('item');
  const [recommendations, setRecommendations] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('Semua');
  const [darkMode, setDarkMode] = useState(false);

  const BASE_URL = "https://rekomendasi-backend-production.up.railway.app";  // URL backend 

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${BASE_URL}/items`);
        const data = await response.json();
        setAllItems(data.items);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    const fetchBrands = async () => {
      try {
        const response = await fetch(`${BASE_URL}/brands`);
        const data = await response.json();
        setBrands(['Semua', ...data.brands]);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchItems();
    fetchBrands();
  }, [BASE_URL]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleItem = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find(i => i.item === item);
      if (exists) {
        return prev.filter(i => i.item !== item);
      } else {
        return [...prev, { item, qty: 1 }];
      }
    });
  };

  const updateQty = (item, qty) => {
    setSelectedItems((prev) =>
      prev.map(i => i.item === item ? { ...i, qty: qty } : i)
    );
  };

  const addToCart = (itemName) => {
    const exists = selectedItems.find(i => i.item === itemName);
    if (!exists) {
      setSelectedItems(prev => [...prev, { item: itemName, qty: 1 }]);
    }
  };


  const handleSubmit = async () => {
    try {
      const response = await fetch(`${BASE_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_items: selectedItems.map(i => i.item.split(' - ')[0].trim()),
          preference_type: preference,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error:', error);
      setRecommendations([]);
    }
  };

  const filteredItems = selectedBrand === 'Semua'
    ? allItems
    : allItems.filter(item => item.toLowerCase().includes(selectedBrand.toLowerCase()));

  const searchedItems = filteredItems.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-2xl mx-auto dark:bg-gray-900 dark:text-white">
      {/* Toggle Dark Mode */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-2 py-1 border rounded bg-gray-200 dark:bg-gray-800 dark:text-white"
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4 bg-blue-500 text-white p-2 rounded">
        FROZEN FOOD
      </h2>

      <Card className="mb-4">
        <CardContent className="space-y-2">
          <h3 className="font-semibold">Silahkan Pilih Item yang Diinginkan</h3>

          {/* Filter Brand */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Filter berdasarkan Brand:</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
            >
              {brands.map((brand, idx) => (
                <option key={idx} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Cari barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
          />

          {/* Daftar Barang */}
          <div className="grid grid-cols-2 gap-2">
            {searchedItems.length > 0 ? (
              searchedItems.map((item) => (
                <Label key={item} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedItems.some(i => i.item === item)}
                    onCheckedChange={() => toggleItem(item)}
                  />
                  <span>{item}</span>
                </Label>
              ))
            ) : (
              <p>Memuat barang atau tidak ditemukan...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Keranjang Belanja */}
      {selectedItems.length > 0 && (
        <Card className="mb-4">
          <CardContent className="space-y-2">
            <h3 className="font-semibold">Keranjang Kamu:</h3>
            <ul className="list-disc list-inside">
              {selectedItems.map(({ item, qty }, i) => (
                <li key={i} className="flex justify-between items-center">
                  {item}
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => updateQty(item, parseInt(e.target.value))}
                      className="w-16 border p-1 rounded dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={() => toggleItem(item)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="font-semibold">Total: {selectedItems.length} barang</p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardContent className="space-y-2">
          <h3 className="font-semibold">2. Pilih Preferensi Rekomendasi:</h3>
          <div className="flex gap-4">
            {[
              {
                type: 'item',
                tooltip: 'Direkomendasikan produk berdasarkan preferensi item dari barang yang telah dipilih di keranjang.'
              },
              {
                type: 'user',
                tooltip: 'Direkomendasikan produk berdasarkan preferensi pembelian user lain yang serupa dari barang yang telah dipilih di keranjang.'
              },
              {
                type: 'brand',
                tooltip: 'Direkomendasikan produk berdasarkan preferensi brand sejenis dari barang yang telah dipilih di keranjang.'
              }
            ].map(({ type, tooltip }) => (
              <Label key={type} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="preference"
                  value={type}
                  checked={preference === type}
                  onChange={() => setPreference(type)}
                  title={tooltip} // Optional: tooltip juga muncul saat hover radio
                />
                <span title={tooltip}>{type}</span> {/* Tooltip pasti muncul di sini */}
              </Label>
            ))}

          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={selectedItems.length === 0}>
        Tampilkan Rekomendasi
      </Button>

      {recommendations.length > 0 && (
        <Card className="mt-4">
          <CardContent className="space-y-2">
            <h3 className="font-semibold">Rekomendasi untukmu:</h3>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => {
                const itemLabel = `${rec.kode} - ${rec.nama}`;
                return (
                  <li key={i} className="p-2 border rounded dark:border-gray-600 flex justify-between items-start">
                    <div>
                      <strong>{rec.nama}</strong><br />
                      Kode: {rec.kode}<br />
                      Harga: Rp{rec.harga.toLocaleString('id-ID')}
                    </div>
                    <button
                      onClick={() => addToCart(itemLabel)}
                      className="ml-4 mt-1 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                      title="Tambahkan ke keranjang"
                    >
                      🛒 Tambah
                    </button>
                  </li>
                );
              })}

            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecommendationUI;
