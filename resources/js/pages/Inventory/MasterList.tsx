import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, Plus, X, Eye, Trash2 } from 'lucide-react';
import { AddBoxModal } from '@/components/modals/AddBoxModal';
import { getCategoryColor } from '@/utils/categoryColors';


interface InventoryBox {
  id: number;
  box_name: string;
  category_quantity: number;
  main_category: string;
}

interface Props {
  mainCategoryId: number;
  system: string;
}

interface MasterListPageComponent extends React.FC<Props> {
  layout?: any;
}

const MasterList: MasterListPageComponent = ({ mainCategoryId, system }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [boxToDelete, setBoxToDelete] = useState<InventoryBox | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const ROW_HEIGHT = useRef(57);
  const HEADER_HEIGHT = useRef(45);

  const [inventoryBoxes, setInventoryBoxes] = useState<InventoryBox[]>([]);
  const [loading, setLoading] = useState(true);

  const [boxFormData, setBoxFormData] = useState({
    boxNumber: '',
  });

  const [boxError, setBoxError] = useState('');
  const [showBoxError, setShowBoxError] = useState(false);

  const systemDisplayName = system.toUpperCase();

  // Dynamic items per page based on container height
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
  }, [loading]); // re-run after loading completes so ref is attached

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/masterlist/boxes/${mainCategoryId}`);
        const data = await response.json();
        setInventoryBoxes(data);
      } catch (error) {
        console.error('Error fetching boxes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, [mainCategoryId]);

  const filteredBoxes = inventoryBoxes.filter((box) => {
    const query = searchQuery.toLowerCase();
    return box.box_name.toLowerCase().includes(query);
  });

  const totalPages = Math.ceil(filteredBoxes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBoxes = filteredBoxes.slice(startIndex, startIndex + itemsPerPage);

  const handleBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBoxFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleBoxAdded = (newBox?: InventoryBox) => {
    if (newBox) {
      const newBoxList = [...inventoryBoxes, newBox];
      setInventoryBoxes(newBoxList);
      const newTotalPages = Math.ceil(newBoxList.length / itemsPerPage);
      setCurrentPage(newTotalPages);
    }
  };

  const openDeleteModal = (box: InventoryBox) => {
    setBoxToDelete(box);
    setDeleteConfirmationInput('');
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBoxToDelete(null);
    setDeleteConfirmationInput('');
  };

  const handleConfirmDelete = async () => {
    if (boxToDelete && deleteConfirmationInput === boxToDelete.box_name) {
      try {
        const response = await fetch(`/api/masterlist/box/${boxToDelete.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const newBoxList = inventoryBoxes.filter((b) => b.id !== boxToDelete.id);
          setInventoryBoxes(newBoxList);
          const newTotalPages = Math.ceil(newBoxList.length / itemsPerPage);
          if (currentPage > newTotalPages) {
            setCurrentPage(Math.max(1, newTotalPages));
          }
          closeDeleteModal();
        }
      } catch (error) {
        console.error('Error deleting box:', error);
      }
    }
  };

  const handleDeleteBox = (boxId: number) => {
    const box = inventoryBoxes.find((b) => b.id === boxId);
    if (box) {
      openDeleteModal(box);
    }
  };

  if (loading) {
    return (
      <>
        <Head title={`Master List - ${systemDisplayName}`} />
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

  return (
    <>
      <Head title={`Master List - ${systemDisplayName}`} />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">

          {/* Fixed header strip */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Masterlist - {systemDisplayName}
            </h1>
          </div>

          {/* Remaining area */}
            <div className="flex-1 overflow-auto flex flex-col p-4 gap-4 bg-gray-50 dark:bg-gray-900">

            {/* Search / Add bar */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-3 flex-col lg:flex-row items-end">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search Box/Item"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {system !== 'shared' && (
                  <button
                    onClick={() => setIsBoxModalOpen(true)}
                    className="px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 bg-blue-900 text-white border border-blue-900 hover:bg-blue-800 active:bg-blue-950 whitespace-nowrap text-sm"
                  >
                    <Plus size={18} />
                    Add Box
                  </button>
                )}
              </div>
            </div>

            {/* Table card */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex-1 overflow-hidden" ref={tableContainerRef}>
                <table className="w-full h-full table-fixed">
                <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      Box Name
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      Item Category Quantity
                    </th>
                    {/* ✅ NEW */}
                    {system === 'shared' && (
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        Inventory
                      </th>
                    )}
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                  <tbody>
                    {paginatedBoxes.length === 0 ? (
                      <tr className="h-full">
                        <td colSpan={system === 'shared' ? 4 : 3} className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                          No boxes found. Create one to get started!
                        </td>
                      </tr>
                    ) : (
                      <>
                        {paginatedBoxes.map((box) => (
                          <tr key={box.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700">
                            <td className="px-4 py-4 text-center text-gray-900 dark:text-white font-medium text-sm">
                              {box.box_name}
                            </td>
                            <td className="px-4 py-4 text-center text-sm">
                              <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-xs">
                                {box.category_quantity}
                              </span>
                            </td>
                            {/* ✅ NEW */}
                            {system === 'shared' && (
                              <td className="px-4 py-4 text-center text-sm">
                                <span className={`px-2.5 py-0.5 ${getCategoryColor(box.main_category)} rounded-full font-semibold text-xs`}>
                                  {box.main_category}
                                </span>
                              </td>
                            )}
                            <td className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => router.visit(`/inventory/${system}/master-list/box/${box.id}`)}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded font-medium transition-colors text-xs"
                                  title="View"
                                >
                                  <Eye size={14} />
                                  View
                                </button>
                                {system !== 'shared' && (
                                  <button
                                    onClick={() => handleDeleteBox(box.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded font-medium transition-colors text-xs"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {/* Filler row that stretches to fill remaining space */}
                        <tr className="h-full">
                          <td colSpan={system === 'shared' ? 4 : 3} className="border-b border-gray-200 dark:border-gray-700" />
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
              {/* Pagination */}
              {totalPages > 1 && (
                  <div className={`flex-shrink-0 flex items-center justify-center gap-1 py-3 flex-wrap ${totalPages <= 1 ? 'invisible' : ''}`}>
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
          onSuccess={handleBoxAdded}
        />

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && boxToDelete && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg">
              <div className="p-6 sm:p-8 border-b-2 border-gray-900 dark:border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {boxToDelete.box_name}
                </h2>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-3xl p-6">
                  <p className="text-red-700 dark:text-red-200 font-bold text-lg">
                    Deleting this box will permanently remove all associated sub-categories, items, and related information.
                  </p>
                  <p className="text-red-700 dark:text-red-200 font-bold mt-3">
                    This action cannot be undone.
                  </p>
                </div>

                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold mb-4">
                    To continue, type to confirm
                  </p>
                  <input
                    type="text"
                    placeholder="Enter box name to confirm"
                    value={deleteConfirmationInput}
                    onChange={(e) => setDeleteConfirmationInput(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border-2 border-gray-400 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors font-medium text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-center p-6 sm:p-8 border-t-2 border-gray-900 dark:border-gray-100 flex-col sm:flex-row">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmationInput !== boxToDelete.box_name}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/50 text-white rounded-full font-bold transition-colors text-sm sm:text-base disabled:cursor-not-allowed"
                >
                  Delete
                </button>
                <button
                  onClick={closeDeleteModal}
                  className="px-8 py-3 border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </SidebarProvider>
    </>
  );
};

export default MasterList;