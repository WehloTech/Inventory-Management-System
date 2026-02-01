import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Plus } from 'lucide-react';

const StockIn = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'single', 'range'
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const stockInTransactions = [
    {
      id: 1,
      itemName: 'Laptop',
      date: '2026-01-30',
      quantity: 5,
      totalStock: 15,
      notes: 'Received from supplier',
    },
    {
      id: 2,
      itemName: 'Monitor',
      date: '2026-01-28',
      quantity: 8,
      totalStock: 20,
      notes: 'Stock replenishment',
    },
    {
      id: 3,
      itemName: 'Keyboard',
      date: '2026-01-25',
      quantity: 20,
      totalStock: 45,
      notes: 'Bulk order received',
    },
  ];

  const filteredTransactions = stockInTransactions.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head title="Stock In" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden">
          <div className="flex items-center gap-4 p-4 border-b bg-white">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Stock In</h1>
          </div>

          <div className="w-full h-full overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-2">Stock In</h2>
              <p className="text-gray-600 mb-6">Record and track items deposited into inventory</p>

              {/* Search and Add Bar */}
              <div className="flex gap-4 mb-6 flex-col lg:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by item name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus size={20} />
                  Add Stock In
                </button>
              </div>

              {/* Date Filter */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="all"
                      checked={filterType === 'all'}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">All</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="single"
                      checked={filterType === 'single'}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Single Date</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="range"
                      checked={filterType === 'range'}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Date Range</span>
                  </label>
                </div>

                {filterType === 'single' && (
                  <div className="flex gap-4">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <button className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">
                      Apply
                    </button>
                  </div>
                )}

                {filterType === 'range' && (
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <button className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">
                        Save
                      </button>
                      <button className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Item Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Total Stock</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Notes</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTransactions.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{item.itemName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">{item.totalStock}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.notes}</td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-blue-600 hover:underline">Withdraw</button>
                          <span className="mx-2 text-gray-300">|</span>
                          <button className="text-blue-600 hover:underline">Deposit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No stock in transactions found.
                </div>
              )}
            </div>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default StockIn;