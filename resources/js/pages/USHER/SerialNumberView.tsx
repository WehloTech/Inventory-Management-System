import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, ChevronLeft, Plus } from 'lucide-react';

interface SerialItem {
  id: number;
  serialNumber: string;
  supplier: string;
  status: 'In use' | 'Stock in' | 'Stock out' | 'Damage';
}

interface SerialNumberViewProps {
  boxId: number;
  itemName: string;
}

// Sample data - Replace with actual database queries
const SAMPLE_BOXES_DATA: Record<number, { boxNumber: string }> = {
  1: { boxNumber: 'BOX-001' },
  2: { boxNumber: 'BOX-002' },
  3: { boxNumber: 'BOX-003' },
  4: { boxNumber: 'BOX-004' },
  5: { boxNumber: 'BOX-005' },
  6: { boxNumber: 'BOX-006' },
};

const SAMPLE_SERIAL_DATA: Record<string, SerialItem[]> = {
  '1_Laptop': [
    { id: 1, serialNumber: 'DL123456', supplier: 'Dell Inc', status: 'In use' },
    { id: 2, serialNumber: 'DL123457', supplier: 'Dell Inc', status: 'Stock in' },
    { id: 3, serialNumber: 'DL123458', supplier: 'Dell Inc', status: 'Damage' },
    { id: 4, serialNumber: 'DL123459', supplier: 'Dell Inc', status: 'Stock out' },
  ],
  '1_Mouse': [
    { id: 5, serialNumber: 'MS789123', supplier: 'Logitech', status: 'In use' },
    { id: 6, serialNumber: 'MS789124', supplier: 'Logitech', status: 'Stock in' },
  ],
  '2_Monitor': [
    { id: 7, serialNumber: 'MON789456', supplier: 'LG Electronics', status: 'In use' },
    { id: 8, serialNumber: 'MON789457', supplier: 'LG Electronics', status: 'Stock in' },
    { id: 9, serialNumber: 'MON789458', supplier: 'LG Electronics', status: 'Stock out' },
  ],
  '3_Keyboard': [
    { id: 10, serialNumber: 'KEY456123', supplier: 'Logitech', status: 'In use' },
    { id: 11, serialNumber: 'KEY456124', supplier: 'Logitech', status: 'Stock in' },
  ],
  '3_Keyboard Stand': [
    { id: 12, serialNumber: 'KS456125', supplier: 'Generic', status: 'In use' },
  ],
};

const SerialNumberView: React.FC<SerialNumberViewProps> = ({ boxId, itemName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    inStock: false,
    inUse: false,
    stockOut: false,
    damage: false,
  });
  
  const itemsPerPage = 10;

  // Get box data
  const boxData = SAMPLE_BOXES_DATA[boxId];
  const boxNumber = boxData?.boxNumber || `BOX-${String(boxId).padStart(3, '0')}`;

  // Get serial items data
  const allSerialItems = useMemo(() => {
    const key = `${boxId}_${itemName}`;
    return SAMPLE_SERIAL_DATA[key] || [];
  }, [boxId, itemName]);

  // Apply filters
  const filteredByStatus = useMemo(() => {
    if (!filters.inStock && !filters.inUse && !filters.stockOut && !filters.damage) {
      return allSerialItems;
    }
    
    return allSerialItems.filter(item => {
      if (filters.inStock && item.status === 'Stock in') return true;
      if (filters.inUse && item.status === 'In use') return true;
      if (filters.stockOut && item.status === 'Stock out') return true;
      if (filters.damage && item.status === 'Damage') return true;
      return false;
    });
  }, [allSerialItems, filters]);

  // Apply search
  const filteredItems = useMemo(() => {
    return filteredByStatus.filter((item) =>
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredByStatus, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search or filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
    setCurrentPage(1);
  };

  const handleBack = () => {
    router.visit(`/usher/master-list/${boxId}`);
  };

  return (
    <>
      <Head title={`${boxNumber} - ${itemName}`} />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Masterlist
            </h1>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col bg-white dark:bg-gray-900">
              <div className="w-full flex flex-col flex-1">
                {/* Search and Add Bar */}
                <div className="flex gap-3 sm:gap-4 mb-6 flex-col sm:flex-row items-stretch sm:items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                      type="text"
                      placeholder="Search Serial Number"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-400 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                    />
                  </div>
                  <button
                    className="px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 bg-blue-900 text-white border border-blue-900 hover:bg-blue-800 active:bg-blue-950"
                  >
                    <Plus size={20} />
                    Add box
                  </button>
                </div>

                {/* Filters Row */}
                <div className="flex items-center justify-end mb-6 flex-wrap gap-4">
                  {/* Filters */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-gray-900 dark:text-white font-medium">Filter:</span>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={() => handleFilterChange('inStock')}
                        className="w-4 h-4 border-2 border-gray-900 dark:border-gray-100 rounded cursor-pointer"
                      />
                      <span className="text-gray-900 dark:text-white text-sm sm:text-base">In stock</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inUse}
                        onChange={() => handleFilterChange('inUse')}
                        className="w-4 h-4 border-2 border-gray-900 dark:border-gray-100 rounded cursor-pointer"
                      />
                      <span className="text-gray-900 dark:text-white text-sm sm:text-base">In use</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.stockOut}
                        onChange={() => handleFilterChange('stockOut')}
                        className="w-4 h-4 border-2 border-gray-900 dark:border-gray-100 rounded cursor-pointer"
                      />
                      <span className="text-gray-900 dark:text-white text-sm sm:text-base">Stock out</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.damage}
                        onChange={() => handleFilterChange('damage')}
                        className="w-4 h-4 border-2 border-gray-900 dark:border-gray-100 rounded cursor-pointer"
                      />
                      <span className="text-gray-900 dark:text-white text-sm sm:text-base">Damage</span>
                    </label>
                  </div>
                </div>

                {/* Box Title */}
                <div className="mb-4 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                    {boxNumber}
                  </h3>
                </div>

                {/* Item Category Title */}
                <div className="mb-6 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                    {itemName}
                  </h3>
                </div>

                {/* Table */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                  <table className="w-full">
                    {/* Table Header */}
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Serial #
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Supplier
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Status
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      {paginatedItems.length > 0 ? (
                        paginatedItems.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              index !== paginatedItems.length - 1 ? 'border-b border-gray-300 dark:border-gray-600' : ''
                            }`}
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {item.serialNumber}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {item.supplier}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {item.status}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                            No items found. Try adjusting your search or filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Back Button and Pagination Row */}
                <div className="flex items-center justify-between mt-7 flex-wrap gap-4">
                  {/* Back Button - Left Side */}
                  <button
                    onClick={handleBack}
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
      </SidebarProvider>
    </>
  );
};

export default SerialNumberView;