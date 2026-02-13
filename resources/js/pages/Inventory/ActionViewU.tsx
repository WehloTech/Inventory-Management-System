import React, { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, ChevronLeft, Plus, X, Eye } from 'lucide-react';
import { AddBoxModal } from '@/components/modals/AddBoxModal';

interface AlphabetSubcategory {
  subcategory_id: number;
  subcategory_name: string;
  stockin: number;
  stockout: number;
  damage: number;
  inuse: number;
  current_items: number;
}

interface ActionViewUProps {
  boxId: number;
  mainCategoryId: number;
  system: string;
}

const ActionViewU: React.FC<ActionViewUProps> = ({ boxId, mainCategoryId, system }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Add Box Modal states
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [boxFormData, setBoxFormData] = useState({ boxNumber: '' });
  const [boxError, setBoxError] = useState('');
  const [showBoxError, setShowBoxError] = useState(false);

  const [subcategories, setSubcategories] = useState<AlphabetSubcategory[]>([]);
  const [boxNumber, setBoxNumber] = useState('');
  const [loading, setLoading] = useState(true);

  // Get system display name
  const systemDisplayName = system.toUpperCase();

  // Fetch subcategories from API
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!boxId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/masterlist/box/${boxId}/subcategories`);
        const data = await response.json();
        setSubcategories(data);
        
        // Fetch box info using mainCategoryId from props
        const boxResponse = await fetch(`/api/masterlist/boxes/${mainCategoryId}`);
        const boxes = await boxResponse.json();
        const currentBox = boxes.find((b: any) => b.id === boxId);
        if (currentBox) {
          setBoxNumber(currentBox.box_name);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [boxId, mainCategoryId]);

  // Filter subcategories based on search
  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((sub) =>
      sub.subcategory_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subcategories, searchQuery]);

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
    // Updated route with system parameter
    router.visit(`/inventory/${system}/master-list/box/${boxId}/item/${subcategory.subcategory_id}`);
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
      const response = await fetch('/api/masterlist/box', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: boxFormData.boxNumber,
          main_category_id: mainCategoryId, // Use mainCategoryId from props
        }),
      });

      if (response.ok) {
        setBoxFormData({ boxNumber: '' });
        setBoxError('');
        setShowBoxError(false);
        setIsBoxModalOpen(false);
        // Navigate back to master list with system parameter
        router.visit(`/inventory/${system}/master-list`);
      } else {
        setBoxError('Failed to create box');
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
          <main className="flex-1 w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900">
            <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Masterlist - {systemDisplayName}
              </h1>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
          </main>
        </SidebarProvider>
      </>
    );
  }

  if (!boxId) {
    return (
      <>
        <Head title="Box Not Found" />
        <SidebarProvider>
          <USHERSidebar />
          <main className="flex-1 w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900">
            <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Masterlist - {systemDisplayName}
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
                  onClick={() => router.visit(`/inventory/${system}/master-list`)}
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
      <Head title={`${boxNumber} - Details`} />
      <SidebarProvider>
        <USHERSidebar system={system} />
        <main className="flex-1 w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {boxNumber} - {systemDisplayName}
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
                    {boxNumber}
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
                            key={subcategory.subcategory_id}
                            className="border-b border-gray-300 dark:border-gray-600 last:border-b-0 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              <div className="flex flex-col items-center">
                                <p className="text-sm">{subcategory.subcategory_name}</p>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {subcategory.stockin}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {subcategory.stockout}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {subcategory.damage}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {subcategory.inuse}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {subcategory.current_items}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 flex justify-center">
                              <button
                                onClick={() => handleViewSerials(subcategory)}
                                className="flex items-center gap-2 px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded font-medium text-xs sm:text-sm transition-colors whitespace-nowrap"
                              >
                                <Eye size={16} />
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
                    onClick={() => router.visit(`/inventory/${system}/master-list`)}
                    className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 font-medium text-sm sm:text-base group"
                  >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                  </button>

                  {/* Pagination - Center */}
                  {totalPages > 0 && (
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
                  )}

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

export default ActionViewU;