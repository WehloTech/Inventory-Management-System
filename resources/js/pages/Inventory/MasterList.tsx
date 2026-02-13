import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, Plus, X, Eye, Trash2 } from 'lucide-react';

interface InventoryBox {
  id: number;
  box_name: string;
  category_quantity: number;
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
  const itemsPerPage = 8;
  
  const [inventoryBoxes, setInventoryBoxes] = useState<InventoryBox[]>([]);
  const [loading, setLoading] = useState(true);

  const [boxFormData, setBoxFormData] = useState({
    boxNumber: '',
  });

  const [boxError, setBoxError] = useState('');
  const [showBoxError, setShowBoxError] = useState(false);

  // Get system display name
  const systemDisplayName = system.toUpperCase();

  // Fetch boxes from API using mainCategoryId from props
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
  }, [mainCategoryId]); // Re-fetch when mainCategoryId changes

  // Filter boxes by box name
  const filteredBoxes = inventoryBoxes.filter((box) => {
    const query = searchQuery.toLowerCase();
    return box.box_name.toLowerCase().includes(query);
  });

  // Pagination
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

  const handleAddBox = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if box number already exists
    const boxNumberExists = inventoryBoxes.some(
      (box) => box.box_name.toLowerCase() === boxFormData.boxNumber.toLowerCase()
    );

    if (boxNumberExists) {
      setBoxError('Box ID already has been taken');
      setShowBoxError(true);
      return;
    }

    if (!boxFormData.boxNumber.trim()) {
      setBoxError('Please enter a box name');
      setShowBoxError(true);
      return;
    }

    try {
      // Call API to create new box with mainCategoryId from props
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
        const result = await response.json();
        const newBox = result.data;
        
        // Create the box object matching the expected structure
        const formattedBox: InventoryBox = {
          id: newBox.id,
          box_name: newBox.name,
          category_quantity: 0, // New box starts with 0 categories
        };
        
        const newBoxList = [...inventoryBoxes, formattedBox];
        setInventoryBoxes(newBoxList);
        
        // Calculate which page the new box will be on
        const newTotalPages = Math.ceil(newBoxList.length / itemsPerPage);
        setCurrentPage(newTotalPages);
        
        setBoxFormData({ boxNumber: '' });
        setBoxError('');
        setShowBoxError(false);
        setIsBoxModalOpen(false);
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
          
          // Recalculate total pages after deletion
          const newTotalPages = Math.ceil(newBoxList.length / itemsPerPage);
          
          // If current page is greater than new total pages, go to the last page
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
          <main className="flex-1 w-full h-screen overflow-hidden flex flex-col bg-white dark:bg-gray-900">
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

  return (
    <>
      <Head title={`Master List - ${systemDisplayName}`} />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full h-screen overflow-hidden flex flex-col bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Masterlist - {systemDisplayName}
            </h1>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col bg-white dark:bg-gray-900">
              <div className="w-full flex flex-col">
                {/* Search and Add Bar */}
                <div className="flex gap-3 sm:gap-4 mb-6 flex-col sm:flex-row items-stretch sm:items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                      type="text"
                      placeholder="Search Box/Item"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-400 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setIsBoxModalOpen(true)}
                    className="px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 bg-blue-900 text-white border border-blue-900 hover:bg-blue-800 active:bg-blue-950 whitespace-nowrap"
                  >
                    <Plus size={20} />
                    Add Box
                  </button>
                </div>

                {/* Table - Responsive */}
                <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 mb-4">
                  <table className="w-full">
                    {/* Table Header */}
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <th className="px-4 sm:px-6 py-3 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base whitespace-nowrap">
                          Box Name
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base whitespace-nowrap">
                          Category Quantity
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base whitespace-nowrap">
                          Action
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      {paginatedBoxes.length > 0 ? (
                        paginatedBoxes.map((box) => (
                          <tr
                            key={box.id}
                            className="border-b border-gray-300 dark:border-gray-600 last:border-b-0 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {box.box_name}
                            </td>

                            <td className="px-4 sm:px-6 py-3 text-center text-sm sm:text-base">
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold inline-block">
                                {box.category_quantity}
                              </span>
                            </td>

                            <td className="px-4 sm:px-6 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    // Updated route to include system parameter
                                    router.visit(`/inventory/${system}/master-list/box/${box.id}`);
                                  }}
                                  className="text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded px-2 sm:px-3 py-1 font-medium flex items-center gap-1 text-xs sm:text-sm transition-colors whitespace-nowrap"
                                  title="View"
                                >
                                  <Eye size={14} />
                                  <span>View</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteBox(box.id)}
                                  className="text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded px-2 sm:px-3 py-1 font-medium flex items-center gap-1 text-xs sm:text-sm transition-colors whitespace-nowrap"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                            No boxes found. Create one to get started!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                      {systemDisplayName}
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

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && boxToDelete && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg">
              {/* Header */}
              <div className="p-6 sm:p-8 border-b-2 border-gray-900 dark:border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {boxToDelete.box_name}
                </h2>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Warning Message */}
                <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-3xl p-6">
                  <p className="text-red-700 dark:text-red-200 font-bold text-lg">
                    Deleting this box will permanently remove all associated sub-categories, items, and related information.
                  </p>
                  <p className="text-red-700 dark:text-red-200 font-bold mt-3">
                    This action cannot be undone.
                  </p>
                </div>

                {/* Confirmation Instructions */}
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold mb-4">
                    To continue, type to confirm
                  </p>
                  
                  {/* Input Field */}
                  <input
                    type="text"
                    placeholder="Enter box name to confirm"
                    value={deleteConfirmationInput}
                    onChange={(e) => setDeleteConfirmationInput(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border-2 border-gray-400 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors font-medium text-sm"
                  />
                </div>
              </div>

              {/* Footer */}
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