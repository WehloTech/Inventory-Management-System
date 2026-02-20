import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, Plus, X } from 'lucide-react';
import { AddBoxModal } from '@/components/modals/AddBoxModal';

interface SerialItem {
  serial: string;
  supplier: string;
  status: string;
}

interface SerialNumberViewProps {
  boxId: number;
  subcategoryId: number;
  mainCategoryId: number;
  system: string;
}

const SerialNumberView: React.FC<SerialNumberViewProps> = ({ boxId, subcategoryId, mainCategoryId, system }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    inStock: false,
    inUse: false,
    stockOut: false,
    damage: false,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const ROW_HEIGHT = useRef(57);
  const HEADER_HEIGHT = useRef(45);

  // Add Box Modal states
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [boxFormData, setBoxFormData] = useState({ boxNumber: '' });
  const [boxError, setBoxError] = useState('');
  const [showBoxError, setShowBoxError] = useState(false);

  const [serialItems, setSerialItems] = useState<SerialItem[]>([]);
  const [boxNumber, setBoxNumber] = useState('');
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic items per page based on container height — same as MasterList
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const thead = tableContainerRef.current.querySelector('thead');
        const firstRow = tableContainerRef.current.querySelector('tbody tr');
        if (thead) HEADER_HEIGHT.current = thead.clientHeight;
        if (firstRow) ROW_HEIGHT.current = firstRow.clientHeight;
        const availableHeight = containerHeight - HEADER_HEIGHT.current;
        const rows = Math.floor(availableHeight / ROW_HEIGHT.current);
        setItemsPerPage(Math.max(1, rows));
      }
    };

    requestAnimationFrame(calculateItemsPerPage);

    const resizeObserver = new ResizeObserver(calculateItemsPerPage);
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [loading]);

  // Fetch serial items from API (original logic - untouched)
  useEffect(() => {
    const fetchData = async () => {
      if (!boxId || !subcategoryId) {
        console.error('Missing required props:', { boxId, subcategoryId });
        setError(`Invalid box or subcategory ID. Received: boxId=${boxId}, subcategoryId=${subcategoryId}`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching data for:', { boxId, subcategoryId });

        const serialUrl = `/api/masterlist/subcategory/${subcategoryId}/box/${boxId}/serials`;
        console.log('Fetching serials from:', serialUrl);

        const serialResponse = await fetch(serialUrl);
        console.log('Serial response status:', serialResponse.status);

        if (!serialResponse.ok) {
          throw new Error(`Failed to fetch serials: ${serialResponse.status}`);
        }

        const serialData = await serialResponse.json();
        console.log('Serial data received:', serialData);
        console.log('Number of items:', serialData.length);

        setSerialItems(serialData);

        const boxUrl = `/api/masterlist/boxes/${mainCategoryId}`;
        console.log('Fetching boxes from:', boxUrl);

        const boxResponse = await fetch(boxUrl);
        console.log('Box response status:', boxResponse.status);

        if (!boxResponse.ok) {
          console.warn('Failed to fetch box info, using default');
          setBoxNumber(`Box #${boxId}`);
        } else {
          const boxes = await boxResponse.json();
          console.log('Boxes received:', boxes);

          const currentBox = boxes.find((b: any) => Number(b.id) === Number(boxId));
          console.log('Current box:', currentBox);

          if (currentBox) {
            setBoxNumber(currentBox.box_name);
          } else {
            console.warn('Box not found, using default');
            setBoxNumber(`Box #${boxId}`);
          }
        }

        const subcategoryUrl = `/api/masterlist/box/${boxId}/subcategories`;
        console.log('Fetching subcategories from:', subcategoryUrl);

        const subcategoryResponse = await fetch(subcategoryUrl);
        console.log('Subcategory response status:', subcategoryResponse.status);

        if (!subcategoryResponse.ok) {
          console.warn('Failed to fetch subcategory info, using default');
          setItemName(`Item #${subcategoryId}`);
        } else {
          const subcategories = await subcategoryResponse.json();
          console.log('Subcategories received:', subcategories);

          const currentSubcategory = subcategories.find(
            (s: any) => Number(s.subcategory_id) === Number(subcategoryId)
          );
          console.log('Current subcategory:', currentSubcategory);

          if (currentSubcategory) {
            setItemName(currentSubcategory.subcategory_name);
          } else {
            console.warn('Subcategory not found, using default');
            setItemName(`Item #${subcategoryId}`);
          }
        }

        console.log('All data loaded successfully');
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [boxId, subcategoryId, mainCategoryId]);

  // Map API status to display status (original logic - untouched)
  const mapStatus = (apiStatus: string): string => {
    const statusMap: Record<string, string> = {
      'IN_STOCK': 'Stock in',
      'IN_USE': 'In use',
      'STOCK_OUT': 'Stock out',
      'DAMAGE': 'Damage',
    };
    return statusMap[apiStatus] || apiStatus;
  };

  // Apply filters (original logic - untouched)
  const filteredByStatus = useMemo(() => {
    if (!filters.inStock && !filters.inUse && !filters.stockOut && !filters.damage) {
      return serialItems;
    }

    return serialItems.filter(item => {
      const mappedStatus = mapStatus(item.status);
      if (filters.inStock && mappedStatus === 'Stock in') return true;
      if (filters.inUse && mappedStatus === 'In use') return true;
      if (filters.stockOut && mappedStatus === 'Stock out') return true;
      if (filters.damage && mappedStatus === 'Damage') return true;
      return false;
    });
  }, [serialItems, filters]);

  // Apply search (original logic - untouched)
  const filteredItems = useMemo(() => {
    return filteredByStatus.filter((item) =>
      item.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredByStatus, searchQuery]);

  // Pagination
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

  const handleBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBoxFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleAddBox = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!boxFormData.boxNumber.trim()) {
      setBoxError('Please enter a box name');
      setShowBoxError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/masterlist/boxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          box_name: boxFormData.boxNumber,
          main_category_id: 1,
        }),
      });

      if (response.ok) {
        setBoxFormData({ boxNumber: '' });
        setBoxError('');
        setShowBoxError(false);
        setIsBoxModalOpen(false);
        router.visit('/usher/master-list');
      } else {
        const errorData = await response.json().catch(() => null);
        setBoxError(errorData?.message || 'Failed to create box');
        setShowBoxError(true);
      }
    } catch (error) {
      console.error('Error creating box:', error);
      setBoxError('Failed to create box');
      setShowBoxError(true);
    }
  };

  if (loading) {
    return (
      <>
        <Head title="Loading..." />
        <SidebarProvider>
          <USHERSidebar />
          <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Masterlist</h1>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
          </main>
        </SidebarProvider>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head title="Error" />
        <SidebarProvider>
          <USHERSidebar />
          <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Masterlist</h1>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Data</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <button
                  onClick={() => router.visit('/usher/master-list')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Go Back to Master List
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
      <Head title={`${boxNumber} - ${itemName}`} />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">

          {/* Fixed header strip */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Masterlist</h1>
          </div>

          {/* Remaining area */}
          <div className="flex-1 overflow-auto flex flex-col p-4 gap-4 bg-gray-50 dark:bg-gray-900">

            {/* Search, Add, and Filters */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex gap-3 flex-col lg:flex-row items-end">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search Serial Number"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setIsBoxModalOpen(true)}
                  className="px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 bg-blue-900 text-white border border-blue-900 hover:bg-blue-800 active:bg-blue-950 whitespace-nowrap text-sm"
                >
                  <Plus size={18} />
                  Add box
                </button>
              </div>

              {/* Filters Row */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-gray-900 dark:text-white font-medium text-sm">Filter:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.inStock} onChange={() => handleFilterChange('inStock')} className="w-4 h-4 rounded cursor-pointer" />
                  <span className="text-gray-900 dark:text-white text-sm">In stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.inUse} onChange={() => handleFilterChange('inUse')} className="w-4 h-4 rounded cursor-pointer" />
                  <span className="text-gray-900 dark:text-white text-sm">In use</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.stockOut} onChange={() => handleFilterChange('stockOut')} className="w-4 h-4 rounded cursor-pointer" />
                  <span className="text-gray-900 dark:text-white text-sm">Stock out</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.damage} onChange={() => handleFilterChange('damage')} className="w-4 h-4 rounded cursor-pointer" />
                  <span className="text-gray-900 dark:text-white text-sm">Damage</span>
                </label>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex-shrink-0 px-2">
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => router.visit(`/inventory/${system}/master-list`)}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
                >
                  Masterlist
                </button>
                <span className="text-gray-500 dark:text-gray-400">&gt;</span>
                <button
                  onClick={() => router.visit(`/inventory/${system}/master-list/box/${boxId}`)}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
                >
                  {boxNumber}
                </button>
                <span className="text-gray-500 dark:text-gray-400">&gt;</span>
                <span className="font-medium text-gray-900 dark:text-white">{itemName}</span>
              </div>
            </div>

            {/* Table card */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex-1 overflow-hidden" ref={tableContainerRef}>
                <table className="w-full h-full table-fixed">
                  <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        Serial #
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        Supplier
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedItems.length === 0 ? (
                      <tr className="h-full">
                        <td colSpan={3} className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                          No items found. Try adjusting your search or filters.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {paginatedItems.map((item, index) => {
                          const displayStatus = mapStatus(item.status);
                          return (
                            <tr
                              key={`${item.serial}-${index}`}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                            >
                              <td className="px-4 py-3.5 text-center text-gray-900 dark:text-white font-medium text-sm">
                                {item.serial}
                              </td>
                              <td className="px-4 py-3.5 text-center text-gray-900 dark:text-white font-medium text-sm">
                                {item.supplier}
                              </td>
                              <td className="px-4 py-3.5 text-center text-sm">
                                <span className={`px-2.5 py-0.5 rounded-full font-semibold text-xs ${
                                  displayStatus === 'In use'    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                  displayStatus === 'Stock in'  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                  displayStatus === 'Stock out' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                                                  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                }`}>
                                  {displayStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {/* Filler row stretches to fill remaining space */}
                        <tr className="h-full">
                          <td colSpan={3} />
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination — outside table card, same as MasterList */}
            {totalPages > 1 && (
              <div className="flex-shrink-0 flex items-center justify-center gap-1 py-3 flex-wrap">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 border-2 border-gray-900 dark:border-gray-100 rounded text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  &lt;
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2.5 py-1.5 border-2 font-semibold rounded transition-colors text-xs ${
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
                  className="px-2.5 py-1.5 border-2 border-gray-900 dark:border-gray-100 rounded text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  &gt;
                </button>
              </div>
            )}

          </div>
        </main>

        <AddBoxModal
          isOpen={isBoxModalOpen}
          onClose={() => setIsBoxModalOpen(false)}
          mainCategoryId={mainCategoryId}
          system={system}
          onSuccess={() => router.visit(`/inventory/${system}/master-list`)}
        />
      </SidebarProvider>
    </>
  );
};

export default SerialNumberView;