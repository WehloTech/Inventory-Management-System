import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, ChevronLeft } from 'lucide-react';

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

// Sample data
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
  const [selectedSerial, setSelectedSerial] = useState<SerialItem | null>(null);

  const itemsPerPage = 10;

  const boxData = SAMPLE_BOXES_DATA[boxId];
  const boxNumber = boxData?.boxNumber || `BOX-${String(boxId).padStart(3, '0')}`;

  const allSerialItems = useMemo(() => {
    const key = `${boxId}_${itemName}`;
    return SAMPLE_SERIAL_DATA[key] || [];
  }, [boxId, itemName]);

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

  const filteredItems = useMemo(() => {
    return filteredByStatus.filter(item =>
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredByStatus, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
    setCurrentPage(1);
  };

  return (
    <>
      <Head title={`${boxNumber} - ${itemName}`} />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Masterlist</h1>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">
            <input
              type="text"
              placeholder="Search Serial Number"
              value={searchQuery}
              onChange={handleSearchChange}
              className="mb-4 w-full pl-4 py-2 border rounded"
            />

            <table className="w-full border-2 border-gray-900 dark:border-gray-100">
              <thead>
                <tr className="border-b-2 border-gray-900 dark:border-gray-100">
                  <th className="px-4 py-2">Serial #</th>
                  <th className="px-4 py-2">Supplier</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => setSelectedSerial(item)}
                          className="text-blue-500 hover:underline"
                        >
                          {item.serialNumber}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-center">{item.supplier}</td>
                      <td className="px-4 py-2 text-center">{item.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Serial Modal */}
            {selectedSerial && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80">
                  <h2 className="text-xl font-bold mb-4">Serial Details</h2>
                  <p><strong>ID:</strong> {selectedSerial.id}</p>
                  <p><strong>Serial Number:</strong> {selectedSerial.serialNumber}</p>
                  <p><strong>Supplier:</strong> {selectedSerial.supplier}</p>
                  <p><strong>Status:</strong> {selectedSerial.status}</p>
                  <button
                    onClick={() => setSelectedSerial(null)}
                    className="mt-4 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default SerialNumberView;
