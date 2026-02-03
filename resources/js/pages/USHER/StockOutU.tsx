import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Plus } from 'lucide-react';

interface StockOutPageComponent extends React.FC {
  layout?: any;
}

interface StockOutTransaction {
  id: number;
  itemName: string;
  date: string;
  quantity: number;
  totalStock: number;
  notes: string;
}

const StockOut: StockOutPageComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const stockOutTransactions: StockOutTransaction[] = [
    {
      id: 1,
      itemName: 'Laptop',
      date: '2026-01-30',
      quantity: 3,
      totalStock: 7,
      notes: 'Issued to department',
    },
    {
      id: 2,
      itemName: 'Monitor',
      date: '2026-01-28',
      quantity: 5,
      totalStock: 15,
      notes: 'Stock withdrawal',
    },
    {
      id: 3,
      itemName: 'Keyboard',
      date: '2026-01-25',
      quantity: 15,
      totalStock: 35,
      notes: 'Bulk order out',
    },
  ];

  const filteredTransactions = stockOutTransactions.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head title="Stock Out" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">STOCK OUT</h1>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  STOCK OUT
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Record and track items removed from inventory
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
                    Add Stock Out
                  </button>
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
                              <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
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
                              <button className="hover:underline">Edit</button>
                              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                              <button className="hover:underline">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No stock out transactions found.
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

export default StockOut;