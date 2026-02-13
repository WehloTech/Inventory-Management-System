import React, { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, ChevronLeft, Plus, X } from 'lucide-react';
import { AddBoxModal } from '@/components/modals/AddBoxModal';

interface SerialItem {
  serial: string;
  supplier: string;
  status: string;
}

interface SerialNumberViewProps {
  boxId: number;
  subcategoryId: number;
  mainCategoryId: number; // Add this
  system: string; // Add this
}

const SerialNumberView: React.FC<SerialNumberViewProps> = ({ boxId, subcategoryId, mainCategoryId, system}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    inStock: false,
    inUse: false,
    stockOut: false,
    damage: false,
  });
  
  // Add Box Modal states
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [boxFormData, setBoxFormData] = useState({ boxNumber: '' });
  const [boxError, setBoxError] = useState('');
  const [showBoxError, setShowBoxError] = useState(false);
  
  const itemsPerPage = 10;

  const [serialItems, setSerialItems] = useState<SerialItem[]>([]);
  const [boxNumber, setBoxNumber] = useState('');
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch serial items from API
  useEffect(() => {
    const fetchData = async () => {
      // Validate props
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
        
        // Fetch serial items
        const serialUrl = `http://localhost:8000/api/masterlist/subcategory/${subcategoryId}/serials`;
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
        
        // Fetch box info
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
        
        // Fetch subcategory info
        const subcategoryUrl = `http://localhost:8000/api/masterlist/box/${boxId}/subcategories`;
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

  // Map API status to display status
  const mapStatus = (apiStatus: string): string => {
    const statusMap: Record<string, string> = {
      'IN_STOCK': 'Stock in',
      'IN_USE': 'In use',
      'STOCK_OUT': 'Stock out',
      'DAMAGE': 'Damage',
    };
    return statusMap[apiStatus] || apiStatus;
  };

  // Apply filters
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

  // Apply search
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

  const handleBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBoxFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
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
        
          <USHERSidebar/>
          <main className="flex-1 w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900">
            <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Masterlist</h1>
            </div>
            <div className="flex-1 flex items-center justify-center">
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
          <main className="flex-1 w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900">
            <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Masterlist</h1>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Error Loading Data
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error}
                </p>
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
                    onClick={() => setIsBoxModalOpen(true)}
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
                    {boxNumber || 'Loading...'}
                  </h3>
                </div>

                {/* Item Category Title */}
                <div className="mb-6 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                    {itemName || 'Loading...'}
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
                            key={`${item.serial}-${index}`}
                            className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              index !== paginatedItems.length - 1 ? 'border-b border-gray-300 dark:border-gray-600' : ''
                            }`}
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {item.serial}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {item.supplier}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {mapStatus(item.status)}
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