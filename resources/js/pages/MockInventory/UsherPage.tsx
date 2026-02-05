import { useState, useEffect } from "react";
import axios from "axios";

export default function StocksUsherPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [location, setLocation] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [unit, setUnit] = useState("");

  // Fetch stocks from API
  const fetchStocks = () => {
    setLoading(true);
    axios
      .get("/api/usher-stocks")
      .then((res) => setStocks(res.data))
      .catch((err) => console.error("Error fetching stocks:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Handle adding stock
  const handleSave = () => {
    if (!location || !subCategory || !manufacturer || !unit) {
      alert("Please fill all fields");
      return;
    }

    setSaving(true);

    axios
      .post("/api/stocks", {
        location,
        subCategory,
        manufacturer,
        unit,
        mainCategory: "Usher",
      })
      .then((res) => {
        // Refresh table
        fetchStocks();
        // Close modal
        setShowModal(false);
        // Reset form
        setLocation("");
        setSubCategory("");
        setManufacturer("");
        setUnit("");
      })
      .catch((err) => {
        console.error("Error adding stock:", err);
        alert("Failed to add stock");
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="p-6 bg-white text-black min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Usher Stocks</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Stock
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading stocks...</div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No stocks found.</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">ID</th>
                <th className="px-3 py-2 border">Location</th>
                <th className="px-3 py-2 border">Sub Category</th>
                <th className="px-3 py-2 border">Serial Numbers</th>
                <th className="px-3 py-2 border">IN</th>
                <th className="px-3 py-2 border">OUT</th>
                <th className="px-3 py-2 border">DAMAGE</th>
                <th className="px-3 py-2 border">IN USE</th>
                <th className="px-3 py-2 border">Current Stock</th>
                <th className="px-3 py-2 border">Suppliers</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => (
                <tr key={s.stock_id} className="text-center">
                  <td className="px-3 py-2 border">{s.stock_id}</td>
                  <td className="px-3 py-2 border">{s.location}</td>
                  <td className="px-3 py-2 border">{s.subCategory}</td>
                  <td className="px-3 py-2 border text-left">{s.serial_numbers}</td>
                  <td className="px-3 py-2 border">{s.IN}</td>
                  <td className="px-3 py-2 border">{s.OUT}</td>
                  <td className="px-3 py-2 border">{s.DAMAGE}</td>
                  <td className="px-3 py-2 border">{s.IN_USE}</td>
                  <td
                    className={`px-3 py-2 border font-semibold ${
                      s.total_items <= 5 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {s.total_items}
                  </td>
                  <td className="px-3 py-2 border text-left">{s.suppliers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-300/50"></div>

          <div className="bg-white rounded-lg w-[360px] p-5 z-10 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Add Stock</h3>

            <div className="space-y-2">
              {/* Location - dropdown or input */}
              <div>
                <label className="text-sm">Location</label>
                <input
                  list="locations"
                  className="w-full border rounded px-2 py-1"
                  placeholder="Select or type new location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <datalist id="locations">
                  {stocks.map((s) => (
                    <option key={s.stock_id} value={s.location} />
                  ))}
                </datalist>
              </div>

              {/* Main Category */}
              <div>
                <label className="text-sm">Main Category</label>
                <input
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                  value="Usher"
                  readOnly
                />
              </div>

              {/* Sub Category - optional dropdown for existing */}
              <div>
                <label className="text-sm">Sub Category</label>
                <input
                  list="subCategories"
                  className="w-full border rounded px-2 py-1"
                  placeholder="Select or type new sub category"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                />
                <datalist id="subCategories">
                  {stocks
                    .map((s) => s.subCategory)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                </datalist>
              </div>

              {/* Manufacturer */}
              <div>
                <label className="text-sm">Manufacturer</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>

              {/* Unit */}
              <div>
                <label className="text-sm">Unit</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
