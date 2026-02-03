import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Plus } from 'lucide-react';

interface StockInPageComponent extends React.FC {
  layout?: any;
}

interface StockInTransaction {
  id: number;
  itemName: string;
  date: string;
  quantity: number;
  totalStock: number;
  notes: string;
}

const StockIn: StockInPageComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const stockInTransactions: StockInTransaction[] = [
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
        <main className="flex-1 w-full overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">STOCK IN</h1>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  STOCK IN
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Record and track items deposited into inventory
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 flex flex-col">
              <div className="w-full flex flex-col flex-1">
                {/* Search and Add Bar */}
                <div className="flex gap-4 mb-6 flex-col lg:flex-row">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by item name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    <Plus size={20} />
                    Add Stock In
                  </button>
                </div>

                {/* Date Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-4 mb-4 flex-wrap">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="all"
                        checked={filterType === 'all'}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">All</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="single"
                        checked={filterType === 'single'}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Single Date</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="range"
                        checked={filterType === 'range'}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Date Range</span>
                    </label>
                  </div>

                  {filterType === 'single' && (
                    <div className="flex gap-4">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                      <button className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Apply
                      </button>
                    </div>
                  )}

                  {filterType === 'range' && (
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2 items-end">
                        <button className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                          Save
                        </button>
                        <button className="px-6 py-2 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1">
                  <div className="overflow-x-hidden flex-1 flex flex-col w-full">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                            Item Name
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[110px]">
                            Date
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[80px]">
                            Quantity
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                            Total Stock
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[150px]">
                            Notes
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[150px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredTransactions.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors h-20">
                            <td className="px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {item.itemName}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {item.date}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                              {item.totalStock}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {item.notes}
                            </td>
                            <td className="px-3 py-4 text-sm text-blue-600 dark:text-blue-400">
                              <button className="hover:underline">Withdraw</button>
                              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                              <button className="hover:underline">Deposit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No stock in transactions found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default StockIn;