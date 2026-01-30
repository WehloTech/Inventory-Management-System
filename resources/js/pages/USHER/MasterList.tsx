import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { Search, Plus, Package, List, LogOut, LogIn, AlertTriangle, ShoppingCart, Truck } from 'lucide-react';

interface MasterListPageComponent extends React.FC {
  layout?: any;
}

const MasterList: MasterListPageComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation items for USHER system
  const navItems: NavItem[] = [
    {
      title: 'Inventory',
      icon: Package,
      submenu: [
        {
          title: 'Master List',
          href: '/usher/master-list',
          icon: List,
        },
        {
          title: 'Stock Out',
          href: '/usher/stock-out',
          icon: LogOut,
        },
        {
          title: 'Stock In',
          href: '/usher/stock-in',
          icon: LogIn,
        },
        {
          title: 'Damaged',
          href: '/usher/damaged',
          icon: AlertTriangle,
        },
      ],
    },
    {
      title: 'Purchase Order',
      href: '/usher/purchase-order',
      icon: ShoppingCart,
    },
    {
      title: 'Deployment',
      href: '/usher/deployment',
      icon: Truck,
    },
  ];

  // Sample inventory data
  const inventoryItems = [
    {
      id: 1,
      boxNumber: 'BOX-001',
      itemName: 'Laptop',
      description: 'Dell XPS 13 Laptop',
      serialNumber: 'DL123456',
      supplier: 'Dell Inc',
      unit: 'pcs',
      beginningStock: 10,
      stockIn: 5,
      stockOut: 3,
      damageStock: 2,
      totalStock: 10,
      currentStock: 10,
    },
    {
      id: 2,
      boxNumber: 'BOX-002',
      itemName: 'Monitor',
      description: '24 inch LED Monitor',
      serialNumber: 'MON789456',
      supplier: 'LG Electronics',
      unit: 'pcs',
      beginningStock: 20,
      stockIn: 8,
      stockOut: 5,
      damageStock: 1,
      totalStock: 22,
      currentStock: 12,
    },
    {
      id: 3,
      boxNumber: 'BOX-003',
      itemName: 'Keyboard',
      description: 'Mechanical RGB Keyboard',
      serialNumber: 'KEY456123',
      supplier: 'Logitech',
      unit: 'pcs',
      beginningStock: 50,
      stockIn: 20,
      stockOut: 15,
      damageStock: 3,
      totalStock: 52,
      currentStock: 25,
    },
  ];

  const filteredItems = inventoryItems.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.boxNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head title="Master List" />
      <SidebarProvider>
        <USHERSidebar items={navItems} />
        <main className="flex-1 w-full overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Master List</h1>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Master List
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete listing of all inventory items
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                {/* Search and Add Bar */}
                <div className="flex gap-4 mb-6 flex-col lg:flex-row">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by item name or box number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    <Plus size={20} />
                    Add Item
                  </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Box #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Item Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Serial #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Supplier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Beginning Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Stock In
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Stock Out
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Damage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Total Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Current Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {item.boxNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {item.itemName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {item.serialNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {item.supplier}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {item.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {item.beginningStock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                {item.stockIn}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                {item.stockOut}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                {item.damageStock}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                              {item.totalStock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {item.currentStock} {item.unit}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                              <button className="hover:underline">Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No items found matching your search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default MasterList;