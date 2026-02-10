import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, ChevronLeft, Plus, X } from 'lucide-react';

interface SerialItem {
  id: number;
  serialNumber: string;
  supplier: string;
}

interface AlphabetSubcategory {
  letter: string;
  itemName: string;
  description: string;
  unit: string;
  serialItems: SerialItem[];
  stockIn: number;
  stockOut: number;
  damageStock: number;
  inUse: number;
  currentStock: number;
}

interface InventoryBox {
  id: number;
  boxNumber: string;
  subcategories: AlphabetSubcategory[];
}

interface ActionViewUProps {
  boxId?: number;
  box?: InventoryBox;
}

// Sample data - Replace with actual database queries
const SAMPLE_BOXES: InventoryBox[] = [
  {
    id: 1,
    boxNumber: 'BOX-001',
    subcategories: [
      {
        letter: 'A',
        itemName: 'Laptop',
        description: 'Dell XPS 13 Laptop',
        unit: 'pcs',
        serialItems: [
          { id: 1, serialNumber: 'DL123456', supplier: 'Dell Inc' },
          { id: 2, serialNumber: 'DL123457', supplier: 'Dell Inc' },
          { id: 3, serialNumber: 'DL123458', supplier: 'Dell Inc' },
        ],
        stockIn: 5,
        stockOut: 2,
        damageStock: 1,
        inUse: 3,
        currentStock: 10,
      },
      {
        letter: 'B',
        itemName: 'Mouse',
        description: 'Wireless Mouse',
        unit: 'pcs',
        serialItems: [
          { id: 4, serialNumber: 'MS789123', supplier: 'Logitech' },
          { id: 5, serialNumber: 'MS789124', supplier: 'Logitech' },
        ],
        stockIn: 10,
        stockOut: 3,
        damageStock: 0,
        inUse: 5,
        currentStock: 15,
      },
    ],
  },
  {
    id: 2,
    boxNumber: 'BOX-002',
    subcategories: [
      {
        letter: 'A',
        itemName: 'Monitor',
        description: '24 inch LED Monitor',
        unit: 'pcs',
        serialItems: [
          { id: 6, serialNumber: 'MON789456', supplier: 'LG Electronics' },
          { id: 7, serialNumber: 'MON789457', supplier: 'LG Electronics' },
          { id: 8, serialNumber: 'MON789458', supplier: 'LG Electronics' },
        ],
        stockIn: 8,
        stockOut: 3,
        damageStock: 0,
        inUse: 5,
        currentStock: 12,
      },
    ],
  },
  {
    id: 3,
    boxNumber: 'BOX-003',
    subcategories: [
      {
        letter: 'A',
        itemName: 'Keyboard',
        description: 'Mechanical RGB Keyboard',
        unit: 'pcs',
        serialItems: [
          { id: 9, serialNumber: 'KEY456123', supplier: 'Logitech' },
          { id: 10, serialNumber: 'KEY456124', supplier: 'Logitech' },
        ],
        stockIn: 20,
        stockOut: 10,
        damageStock: 2,
        inUse: 8,
        currentStock: 25,
      },
      {
        letter: 'B',
        itemName: 'Keyboard Stand',
        description: 'Adjustable Keyboard Stand',
        unit: 'pcs',
        serialItems: [
          { id: 11, serialNumber: 'KS456125', supplier: 'Generic' },
        ],
        stockIn: 5,
        stockOut: 1,
        damageStock: 0,
        inUse: 2,
        currentStock: 6,
      },
    ],
  },
  {
    id: 4,
    boxNumber: 'BOX-004',
    subcategories: [
      {
        letter: 'A',
        itemName: 'USB Cable',
        description: 'Type-C USB Cable',
        unit: 'pcs',
        serialItems: [],
        stockIn: 50,
        stockOut: 20,
        damageStock: 5,
        inUse: 15,
        currentStock: 35,
      },
    ],
  },
  {
    id: 5,
    boxNumber: 'BOX-005',
    subcategories: [
      {
        letter: 'A',
        itemName: 'Power Adapter',
        description: '65W Power Adapter',
        unit: 'pcs',
        serialItems: [],
        stockIn: 12,
        stockOut: 4,
        damageStock: 1,
        inUse: 3,
        currentStock: 8,
      },
    ],
  },
  {
    id: 6,
    boxNumber: 'BOX-006',
    subcategories: [
      {
        letter: 'A',
        itemName: 'Monitor Stand',
        description: 'Adjustable Monitor Stand',
        unit: 'pcs',
        serialItems: [],
        stockIn: 8,
        stockOut: 2,
        damageStock: 0,
        inUse: 2,
        currentStock: 6,
      },
    ],
  },
];

const ActionViewU: React.FC<ActionViewUProps> = ({ boxId, box }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Add Box Modal states
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [boxFormData, setBoxFormData] = useState({ boxNumber: '' });
  const [boxError, setBoxError] = useState('');
  const [showBoxError, setShowBoxError] = useState(false);

  // Use passed box data or find from sample data
  const currentBox = useMemo(() => {
    if (box) return box;
    if (boxId) return SAMPLE_BOXES.find((b) => b.id === boxId);
    return null;
  }, [box, boxId]);

  // Filter subcategories based on search
  const filteredSubcategories = useMemo(() => {
    if (!currentBox) return [];
    return currentBox.subcategories.filter((sub) =>
      sub.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.serialItems.some(
        (serial) =>
          serial.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          serial.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [currentBox, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredSubcategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubcategories = filteredSubcategories.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleViewSerials = (subcategory: AlphabetSubcategory) => {
    // Navigate to the serial number detail page
    // Format: /usher/master-list/{boxId}/item/{itemName}
    const encodedItemName = encodeURIComponent(subcategory.itemName);
    router.visit(`/usher/master-list/${currentBox?.id}/item/${encodedItemName}`);
  };

  const handleBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBoxFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleAddBox = (e: React.FormEvent) => {
    e.preventDefault();

    if (!boxFormData.boxNumber.trim()) {
      setBoxError('Please enter a box name');
      setShowBoxError(true);
      return;
    }

    // Here you would typically save to database
    // For now, just navigate to the new box (you'll need to implement this in your backend)
    console.log('Adding new box:', boxFormData.boxNumber);
    
    // Close modal and reset form
    setBoxFormData({ boxNumber: '' });
    setBoxError('');
    setShowBoxError(false);
    setIsBoxModalOpen(false);
    
    // Navigate back to master list to see the new box
    router.visit('/usher/master-list');
  };

  if (!currentBox) {
    return (
      <>
        <Head title="Box Not Found" />
        <SidebarProvider>
          <USHERSidebar />
          <main className="flex-1 w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900">
            <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Masterlist
              </h1>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Box Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The box you're looking for doesn't exist.
                </p>
                <button
                  onClick={() => router.visit('/usher/master-list')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Go Back to Masterlist
                </button>
              </div>
            </div>
          </main>
        </SidebarProvider>
      </>
    );
  }

  return (
    <>
      <Head title={`${currentBox.boxNumber} - Details`} />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentBox.boxNumber}
            </h1>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col bg-white dark:bg-gray-900">
              <div className="w-full flex flex-col flex-1">
                {/* Title */}
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Masterlist
                  </h2>
                </div>

                {/* Search and Back Bar */}
                <div className="flex gap-3 sm:gap-4 mb-6 flex-col sm:flex-row items-stretch sm:items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                      type="text"
                      placeholder="Search Item Category"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-400 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setIsBoxModalOpen(true)}
                    className="px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 bg-blue-900 text-white border border-blue-900 hover:bg-blue-800 active:bg-blue-950"
                  >
                    <Plus size={20} />
                    Add box
                  </button>
                </div>

                {/* Box Title Box */}
                <div className="mb-6 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                    {currentBox.boxNumber}
                  </h3>
                </div>

                {/* Table */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                  <table className="w-full min-w-full">
                    {/* Table Header */}
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Sub Item Category
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Stock In
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Stock out
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Damage
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          In Use
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Current Items
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Serial #
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      {paginatedSubcategories.length > 0 ? (
                        paginatedSubcategories.map((subcategory) => (
                          <tr
                            key={subcategory.letter}
                            className="border-b border-gray-300 dark:border-gray-600 last:border-b-0 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              <div className="flex flex-col items-center">
                                <p className="text-sm">{subcategory.itemName}</p>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {subcategory.stockIn}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {subcategory.stockOut}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {subcategory.damageStock}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {subcategory.inUse}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {subcategory.currentStock}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                              <button
                                onClick={() => handleViewSerials(subcategory)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium text-sm"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                            No items found. Try adjusting your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Back Button and Pagination Row */}
                <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
                  {/* Back Link - Left Side */}
                  <button
                    onClick={() => router.visit('/usher/master-list')}
                    className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 font-medium text-sm sm:text-base group"
                  >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                  </button>

                  {/* Pagination - Center */}
                  <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border-2 border-gray-900 dark:border-gray-100 rounded text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      &lt;
                    </button>

                    <div className="flex gap-1 sm:gap-2">
                      {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 sm:px-3 py-2 border-2 font-semibold rounded transition-colors text-sm ${
                            currentPage === page
                              ? 'border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                              : 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border-2 border-gray-900 dark:border-gray-100 rounded text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      &gt;
                    </button>
                  </div>

                  {/* Empty div for spacing balance */}
                  <div className="w-[100px] hidden sm:block"></div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Add Box Modal */}
        {isBoxModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b-2 border-gray-900 dark:border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Add Box</h2>
                <button
                  onClick={() => {
                    setIsBoxModalOpen(false);
                    setBoxFormData({ boxNumber: '' });
                    setBoxError('');
                    setShowBoxError(false);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {showBoxError && (
                  <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-2xl p-4">
                    <p className="text-red-700 dark:text-red-200 font-bold text-sm">
                      {boxError}
                    </p>
                  </div>
                )}
                <form onSubmit={handleAddBox} className="space-y-6">
                  {/* Box Name Field */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="font-bold text-gray-900 dark:text-white text-sm sm:text-base min-w-fit">
                      Box Name
                    </label>
                    <span className="hidden sm:block text-gray-900 dark:text-white font-bold">:</span>
                    <input
                      type="text"
                      name="boxNumber"
                      value={boxFormData.boxNumber}
                      onChange={handleBoxInputChange}
                      placeholder="Enter Box name"
                      className="flex-1 px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors font-medium"
                      required
                    />
                  </div>

                  {/* Main Category Field */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="font-bold text-gray-900 dark:text-white text-sm sm:text-base min-w-fit">
                      Main Category
                    </label>
                    <span className="hidden sm:block text-gray-900 dark:text-white font-bold">:</span>
                    <div className="flex-1 px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium">
                      USHER
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex justify-center p-6 sm:p-8 border-t-2 border-gray-900 dark:border-gray-100">
                <button
                  onClick={handleAddBox}
                  className="px-8 sm:px-12 py-3 border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Add Box
                </button>
              </div>
            </div>
          </div>
        )}
      </SidebarProvider>
    </>
  );
};

export default ActionViewU;