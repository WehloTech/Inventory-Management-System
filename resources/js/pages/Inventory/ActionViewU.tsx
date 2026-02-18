import React, { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, Plus, X, Eye } from 'lucide-react';
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
  const itemsPerPage = 8;
  
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [boxFormData, setBoxFormData] = useState({ boxNumber: '' });
  const [boxError, setBoxError] = useState('');
  const [showBoxError, setShowBoxError] = useState(false);

  const [subcategories, setSubcategories] = useState<AlphabetSubcategory[]>([]);
  const [boxNumber, setBoxNumber] = useState('');
  const [loading, setLoading] = useState(true);

  const [sortSubItem, setSortSubItem] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortCurrentItems, setSortCurrentItems] = useState<'none' | 'asc' | 'desc'>('none');

  const handleSortSubItem = () => {
    setSortSubItem(prev => prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none');
    setSortCurrentItems('none');
    setCurrentPage(1);
  };

  const handleSortCurrentItems = () => {
    setSortCurrentItems(prev => prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none');
    setSortSubItem('none');
    setCurrentPage(1);
  };

  const systemDisplayName = system.toUpperCase();

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!boxId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/masterlist/box/${boxId}/subcategories`);
        const data = await response.json();
        setSubcategories(data);
        
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

  const filteredSubcategories = useMemo(() => {
    let filtered = subcategories.filter((sub) =>
      sub.subcategory_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortSubItem !== 'none') {
      filtered = [...filtered].sort((a, b) =>
        sortSubItem === 'asc'
          ? a.subcategory_name.localeCompare(b.subcategory_name)
          : b.subcategory_name.localeCompare(a.subcategory_name)
      );
    } else if (sortCurrentItems !== 'none') {
      filtered = [...filtered].sort((a, b) =>
        sortCurrentItems === 'asc'
          ? a.current_items - b.current_items
          : b.current_items - a.current_items
      );
    }

    return filtered;
  }, [subcategories, searchQuery, sortSubItem, sortCurrentItems]);

  const totalPages = Math.ceil(filteredSubcategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubcategories = filteredSubcategories.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleViewSerials = (subcategory: AlphabetSubcategory) => {
    router.visit(`/inventory/${system}/master-list/box/${boxId}/item/${subcategory.subcategory_id}`);
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
      const response = await fetch('/api/masterlist/box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: boxFormData.boxNumber,
          main_category_id: mainCategoryId,
        }),
      });

      if (response.ok) {
        setBoxFormData({ boxNumber: '' });
        setBoxError('');
        setShowBoxError(false);
        setIsBoxModalOpen(false);
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
          <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Masterlist - {systemDisplayName}
              </h1>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
          <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Masterlist - {systemDisplayName}
              </h1>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Box Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">The box you're looking for doesn't exist.</p>
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
        {/* h-screen + overflow-hidden locks the page — nothing can scroll */}
        <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">

          {/* Fixed header strip */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {boxNumber} - {systemDisplayName}
            </h1>
          </div>

          {/* Remaining area — single flex column, no overflow */}
          <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4 bg-gray-50 dark:bg-gray-900">

            {/* Search / Add bar — fixed height */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-3 flex-col lg:flex-row items-end">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search Item Category"
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
            </div>

            {/* Breadcrumb — fixed height */}
            <div className="flex-shrink-0 px-2">
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => router.visit(`/inventory/${system}/master-list`)}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
                >
                  Masterlist
                </button>
                <span className="text-gray-500 dark:text-gray-400">&gt;</span>
                <span className="font-medium text-gray-900 dark:text-white">{boxNumber}</span>
              </div>
            </div>

            {/* Table card — fills all remaining height, no internal scroll */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">

              {/* Table area — overflow hidden, filler rows keep height consistent */}
              <div className="flex-1 overflow-hidden">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button
                          onClick={handleSortSubItem}
                          className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase"
                        >
                          Sub Item Category
                          <span>
                            {sortSubItem === 'none' && '↕'}
                            {sortSubItem === 'asc' && '↑'}
                            {sortSubItem === 'desc' && '↓'}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        Stock In
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        Stock Out
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        Damage
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        In Use
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button
                          onClick={handleSortCurrentItems}
                          className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase"
                        >
                          Current Items
                          <span>
                            {sortCurrentItems === 'none' && '↕'}
                            {sortCurrentItems === 'asc' && '↑'}
                            {sortCurrentItems === 'desc' && '↓'}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        Serial #
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedSubcategories.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                          No items found. Try adjusting your search.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {paginatedSubcategories.map((subcategory, index) => (
                          <tr
                            key={subcategory.subcategory_id}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index < paginatedSubcategories.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                          >
                            <td className="px-4 py-3.5 text-center text-gray-900 dark:text-white font-medium text-sm">
                              {subcategory.subcategory_name}
                            </td>
                            <td className="px-4 py-3.5 text-center text-sm">
                              <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-xs">
                                {subcategory.stockin}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center text-sm">
                              <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-semibold text-xs">
                                {subcategory.stockout}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center text-sm">
                              <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-semibold text-xs">
                                {subcategory.damage}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center text-sm">
                              <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold text-xs">
                                {subcategory.inuse}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center text-sm">
                              <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-semibold text-xs">
                                {subcategory.current_items}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <button
                                onClick={() => handleViewSerials(subcategory)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded font-medium transition-colors text-xs"
                              >
                                <Eye size={14} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                        {/* Filler rows keep table height consistent and prevent scroll */}
                        {Array.from({ length: itemsPerPage - paginatedSubcategories.length }).map((_, idx) => (
                          <tr key={`empty-${idx}`}>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination — pinned to bottom inside the card */}
              {totalPages > 1 && (
                <div className="flex-shrink-0 flex items-center justify-center gap-1 py-3 border-t border-gray-200 dark:border-gray-700 flex-wrap">
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