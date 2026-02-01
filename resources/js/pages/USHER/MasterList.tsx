import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, Plus, X } from 'lucide-react';

interface MasterListPageComponent extends React.FC {
  layout?: any;
}

interface InventoryItem {
  id: number;
  boxNumber: string;
  itemName: string;
  description: string;
  serialNumber: string;
  supplier: string;
  unit: string;
  beginningStock: number;
  stockIn: number;
  stockOut: number;
  damageStock: number;
  totalStock: number;
  currentStock: number;
}

const MasterList: MasterListPageComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
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
  ]);

  const [formData, setFormData] = useState({
    boxNumber: '',
    itemName: '',
    description: '',
    serialNumber: '',
    supplier: '',
    unit: 'pcs',
    beginningStock: 0,
    stockIn: 0,
    stockOut: 0,
    damageStock: 0,
  });

  const filteredItems = inventoryItems.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.boxNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: InventoryItem = {
      id: inventoryItems.length + 1,
      ...formData,
      totalStock: formData.beginningStock,
      currentStock: formData.beginningStock,
    };

    setInventoryItems([...inventoryItems, newItem]);
    setFormData({
      boxNumber: '',
      itemName: '',
      description: '',
      serialNumber: '',
      supplier: '',
      unit: 'pcs',
      beginningStock: 0,
      stockIn: 0,
      stockOut: 0,
      damageStock: 0,
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <Head title="Master List" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">MASTER LIST</h1>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  MASTER LIST
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete Listing of All Inventory Items
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
                      placeholder="Search by item name or box number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus size={20} />
                    Add Item
                  </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1">
                  <div className="overflow-x-hidden flex-1 flex flex-col w-full">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                            Box #
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                            Item Name
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[110px]">
                            Serial #
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                            Supplier
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[70px]">
                            Unit
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[110px]">
                            Beg. Stock
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[80px]">
                            Stock In
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[80px]">
                            Stock Out
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[80px]">
                            Damage
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                            Total Stock
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[110px]">
                            Current Stock
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[70px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Render actual items only */}
                        {filteredItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors h-20">
                            <td className="px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {item.boxNumber}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {item.itemName}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {item.serialNumber}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {item.supplier}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {item.unit}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {item.beginningStock}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                {item.stockIn}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                {item.stockOut}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                {item.damageStock}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                              {item.totalStock}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {item.currentStock} {item.unit}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm text-blue-600 dark:text-blue-400">
                              <button className="hover:underline">Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Add Item Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Item</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleAddItem} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Box Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Box #
                    </label>
                    <input
                      type="text"
                      name="boxNumber"
                      value={formData.boxNumber}
                      onChange={handleInputChange}
                      placeholder="BOX-001"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      placeholder="Laptop"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Serial Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Serial #
                    </label>
                    <input
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      placeholder="DL123456"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Supplier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      placeholder="Dell Inc"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pcs">pcs</option>
                      <option value="box">box</option>
                      <option value="set">set</option>
                      <option value="unit">unit</option>
                    </select>
                  </div>

                  {/* Beginning Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Beginning Stock
                    </label>
                    <input
                      type="number"
                      name="beginningStock"
                      value={formData.beginningStock}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Stock In */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock In
                    </label>
                    <input
                      type="number"
                      name="stockIn"
                      value={formData.stockIn}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Stock Out */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock Out
                    </label>
                    <input
                      type="number"
                      name="stockOut"
                      value={formData.stockOut}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Damage Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Damage Stock
                    </label>
                    <input
                      type="number"
                      name="damageStock"
                      value={formData.damageStock}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </SidebarProvider>
    </>
  );
};

export default MasterList;