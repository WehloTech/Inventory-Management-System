import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Eye } from 'lucide-react';

interface StockInPageComponent extends React.FC {
  layout?: any;
}

interface StockInTransaction {
  id: number;
  date: string;
  itemName: string;
  quantity: number;
  remarks: string;
}

const StockIn: StockInPageComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [stockInTransactions, setStockInTransactions] = useState<StockInTransaction[]>([
    { id: 1, date: 'Jan 5, 2026', itemName: 'Raspberry Pi-4', quantity: 7, remarks: 'Initial Stock' },
    { id: 2, date: 'Jan 6, 2026', itemName: 'Raspberry Pi-5', quantity: 4, remarks: '-' },
    { id: 3, date: 'Jan 7, 2026', itemName: 'Cable', quantity: 4, remarks: '-' },
    { id: 4, date: 'Jan 8, 2026', itemName: 'Wires', quantity: 7, remarks: '-' },
    { id: 5, date: 'Jan 9, 2026', itemName: 'Charger', quantity: 3, remarks: '-' },
    { id: 6, date: 'Jan 10, 2026', itemName: 'Srew', quantity: 2, remarks: '-' },
    { id: 7, date: 'Jan 11, 2026', itemName: 'Monitor', quantity: 5, remarks: '-' },
    { id: 8, date: 'Jan 12, 2026', itemName: 'Keyboard', quantity: 8, remarks: '-' },
    { id: 9, date: 'Jan 13, 2026', itemName: 'Mouse', quantity: 6, remarks: '-' },
    { id: 10, date: 'Jan 14, 2026', itemName: 'USB Hub', quantity: 4, remarks: '-' },
  ]);

  const filteredTransactions = stockInTransactions.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Head title="Stock In" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full h-full flex flex-col overflow-hidden">
          <div className="flex items-center gap-4 p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">STOCK IN</h1>
          </div>

          <div className="flex-1 flex flex-col p-6 min-h-0">
            <div className="w-full max-w-6xl mx-auto h-full flex flex-col">
              {/* Search and Buttons Row */}
              <div className="flex gap-4 items-center" style={{ height: '50px' }}>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search Stock In Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-1 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="px-6 py-1 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
                  MOVE
                </button>
              </div>

              {/* Date Filter Row */}
              <div className="flex items-center gap-4 flex-wrap mt-2" style={{ height: '50px' }}>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      value="all"
                      checked={filterType === 'all'}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-3 h-3"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">All</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      value="single"
                      checked={filterType === 'single'}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-3 h-3"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Single Date</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      value="range"
                      checked={filterType === 'range'}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-3 h-3"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Date Range</span>
                  </label>
                </div>

                {filterType === 'single' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="dd/mm/yy"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-1 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-1 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                      Apply
                    </button>
                  </div>
                )}

                <button className="ml-auto px-6 py-1 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Add Stock In
                </button>
              </div>

              {/* Table */}
              <div className="border-2 border-gray-900 dark:border-white rounded-lg overflow-hidden bg-white dark:bg-gray-800 my-4">
                <table className="w-full border-collapse">
                  <thead className="bg-white dark:bg-gray-800 border-b border-gray-900 dark:border-white">
                    <tr>
                      <th className="px-2 py-1 text-center text-sm font-bold text-gray-900 dark:text-white">
                        Date
                      </th>
                      <th className="px-2 py-1 text-center text-sm font-bold text-gray-900 dark:text-white">
                        Item name
                      </th>
                      <th className="px-2 py-1 text-center text-sm font-bold text-gray-900 dark:text-white">
                        Quantity
                      </th>
                      <th className="px-2 py-1 text-center text-sm font-bold text-gray-900 dark:text-white">
                        Remarks
                      </th>
                      <th className="px-2 py-1 text-center text-sm font-bold text-gray-900 dark:text-white">
                        Serial #
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {currentTransactions.map((item, index) => (
                      <tr key={item.id} className={index !== currentTransactions.length - 1 ? 'border-b border-gray-300 dark:border-gray-600' : ''}>
                        <td className="px-2 py-1 text-sm text-center text-gray-900 dark:text-white">{item.date}</td>
                        <td className="px-2 py-1 text-sm text-center text-gray-900 dark:text-white">{item.itemName}</td>
                        <td className="px-2 py-1 text-sm text-center text-gray-900 dark:text-white">{item.quantity}</td>
                        <td className="px-2 py-1 text-sm text-center text-gray-900 dark:text-white">{item.remarks}</td>
                        <td className="px-2 py-1 text-sm text-center">
                          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer transition-colors">
                            <Eye size={16} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-1 mt-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-0.5 text-sm font-bold text-gray-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  &lt;
                </button>

                {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-2 py-0.5 min-w-[28px] text-sm border ${
                      currentPage === page
                        ? 'border-gray-900 dark:border-white bg-gray-200 dark:bg-gray-700 font-bold'
                        : 'border-gray-300 dark:border-gray-600'
                    } text-gray-900 dark:text-white`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-0.5 text-sm font-bold text-gray-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  &gt;
                </button>
              </div>

            </div>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default StockIn;
