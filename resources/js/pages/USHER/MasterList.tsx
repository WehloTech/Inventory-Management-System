import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, Plus, X, Eye, Trash2 } from 'lucide-react';

interface SerialItem {
  id: number;
  serialNumber: string;
  supplier: string;
}
// This is a test comment for Pull Request
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

interface MasterListPageComponent extends React.FC {
  layout?: any;
}

const MasterList: MasterListPageComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBoxForDetail, setSelectedBoxForDetail] = useState<InventoryBox | null>(null);
  const [currentBoxId, setCurrentBoxId] = useState<number | null>(null);
  const [currentSubcategoryLetter, setCurrentSubcategoryLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [boxToDelete, setBoxToDelete] = useState<InventoryBox | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

  const [inventoryBoxes, setInventoryBoxes] = useState<InventoryBox[]>([
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
        {
      id: 7,
      boxNumber: 'BOX-007',
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
            {
      id: 8,
      boxNumber: 'BOX-008',
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
  ]);

  const [boxFormData, setBoxFormData] = useState({
    boxNumber: '',
  });

  const [subcategoryFormData, setSubcategoryFormData] = useState({
    itemName: '',
    description: '',
  });

  const [itemFormData, setItemFormData] = useState({
    unit: 'pcs',
    serialNumber: '',
    supplier: '',
    stockIn: 0,
    stockOut: 0,
    damageStock: 0,
    inUse: 0,
  });

  const [boxError, setBoxError] = useState('');
  const [showBoxError, setShowBoxError] = useState(false);

  // Filter boxes by item name, box number, serial number, or supplier
  const filteredBoxes = inventoryBoxes.filter((box) => {
    const query = searchQuery.toLowerCase();
    return (
      box.boxNumber.toLowerCase().includes(query) ||
      box.subcategories.some(
        (sub) =>
          sub.itemName.toLowerCase().includes(query) ||
          sub.description.toLowerCase().includes(query) ||
          sub.letter.toLowerCase().includes(query) ||
          sub.serialItems.some(
            (serial) =>
              serial.serialNumber.toLowerCase().includes(query) ||
              serial.supplier.toLowerCase().includes(query)
          )
      )
    );
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

  const handleSubcategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubcategoryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItemFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleAddBox = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if box number already exists
    const boxNumberExists = inventoryBoxes.some(
      (box) => box.boxNumber.toLowerCase() === boxFormData.boxNumber.toLowerCase()
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

    // Generate unique ID using timestamp and random number for guaranteed uniqueness
    const newBoxId = Date.now() + Math.floor(Math.random() * 10000);

    const newBox: InventoryBox = {
      id: newBoxId,
      boxNumber: boxFormData.boxNumber,
      subcategories: [],
    };

    const newBoxList = [...inventoryBoxes, newBox];
    setInventoryBoxes(newBoxList);
    
    // Calculate which page the new box will be on
    const newTotalPages = Math.ceil(newBoxList.length / itemsPerPage);
    setCurrentPage(newTotalPages);
    
    setBoxFormData({
      boxNumber: '',
    });
    setBoxError('');
    setShowBoxError(false);
    setIsBoxModalOpen(false);
  };

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentBoxId === null) return;

    setInventoryBoxes((prevBoxes) =>
      prevBoxes.map((box) => {
        if (box.id === currentBoxId) {
          const nextLetter = String.fromCharCode(65 + box.subcategories.length);

          const newSubcategory: AlphabetSubcategory = {
            letter: nextLetter,
            itemName: subcategoryFormData.itemName,
            description: subcategoryFormData.description,
            unit: 'pcs',
            serialItems: [],
            stockIn: 0,
            stockOut: 0,
            damageStock: 0,
            inUse: 0,
            currentStock: 0,
          };

          return {
            ...box,
            subcategories: [...box.subcategories, newSubcategory],
          };
        }
        return box;
      })
    );

    setSubcategoryFormData({
      itemName: '',
      description: '',
    });
    setIsSubcategoryModalOpen(false);
    setCurrentBoxId(null);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentBoxId === null || currentSubcategoryLetter === null) return;

    const newSerialItem: SerialItem = {
      id: Date.now(),
      serialNumber: itemFormData.serialNumber,
      supplier: itemFormData.supplier,
    };

    setInventoryBoxes((prevBoxes) =>
      prevBoxes.map((box) => {
        if (box.id === currentBoxId) {
          return {
            ...box,
            subcategories: box.subcategories.map((sub) => {
              if (sub.letter === currentSubcategoryLetter) {
                return {
                  ...sub,
                  unit: itemFormData.unit,
                  stockIn: itemFormData.stockIn,
                  stockOut: itemFormData.stockOut,
                  damageStock: itemFormData.damageStock,
                  inUse: itemFormData.inUse,
                  serialItems: [...sub.serialItems, newSerialItem],
                  currentStock:
                    itemFormData.stockIn -
                    itemFormData.stockOut -
                    itemFormData.damageStock,
                };
              }
              return sub;
            }),
          };
        }
        return box;
      })
    );

    setItemFormData({
      unit: 'pcs',
      serialNumber: '',
      supplier: '',
      stockIn: 0,
      stockOut: 0,
      damageStock: 0,
      inUse: 0,
    });
  };

  const handleFinishAddingItems = () => {
    setIsItemModalOpen(false);
    setCurrentBoxId(null);
    setCurrentSubcategoryLetter(null);
    setItemFormData({
      unit: 'pcs',
      serialNumber: '',
      supplier: '',
      stockIn: 0,
      stockOut: 0,
      damageStock: 0,
      inUse: 0,
    });
  };

  const openAddSubcategoryModal = (boxId: number) => {
    setCurrentBoxId(boxId);
    setSubcategoryFormData({
      itemName: '',
      description: '',
    });
    setIsSubcategoryModalOpen(true);
  };

  const openDetailModal = (box: InventoryBox) => {
    setSelectedBoxForDetail(box);
    setIsDetailModalOpen(true);
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

  const handleConfirmDelete = () => {
    if (boxToDelete && deleteConfirmationInput === boxToDelete.boxNumber) {
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
  };

  const handleDeleteBox = (boxId: number) => {
    const box = inventoryBoxes.find((b) => b.id === boxId);
    if (box) {
      openDeleteModal(box);
    }
  };

  return (
    <>
      <Head title="Master List" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full h-screen overflow-hidden flex flex-col bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Masterlist</h1>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Content */}
            <div className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col bg-white dark:bg-gray-900">
              <div className="w-full flex flex-col flex-1">
                {/* Search and Add Bar */}
                <div className="flex gap-3 sm:gap-4 mb-6 flex-col sm:flex-row items-stretch sm:items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                      type="text"
                      placeholder="Search Box"
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
                    className="px-6 py-2.5 border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    Add Box
                  </button>
                </div>

                {/* Table - Responsive */}
                <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <table className="w-full min-w-full">
                    {/* Table Header */}
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Box No.
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Category Quantity
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-base">
                          Action
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      {paginatedBoxes.length > 0 ? (
                        paginatedBoxes.map((box, index) => (
                          <tr
                            key={box.id}
                            className="border-b border-gray-300 dark:border-gray-600 last:border-b-0 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {box.boxNumber}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                              {box.subcategories.length}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <button
                                  onClick={() => {
                                    // Navigate to detail view page
                                    router.visit(`/usher/master-list/${box.id}`);
                                  }}
                                  className="text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded px-2 py-1 font-medium flex items-center gap-1 text-xs transition-colors"
                                  title="View"
                                >
                                  <Eye size={14} />
                                  <span className="hidden sm:inline">View</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteBox(box.id)}
                                  className="text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded px-2 py-1 font-medium flex items-center gap-1 text-xs transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                  <span className="hidden sm:inline">Delete</span>
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
                <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 mb-4 flex-wrap">
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

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && boxToDelete && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg">
              {/* Header */}
              <div className="p-6 sm:p-8 border-b-2 border-gray-900 dark:border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {boxToDelete.boxNumber}
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
                    onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-400 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors font-medium text-sm"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 justify-center p-6 sm:p-8 border-t-2 border-gray-900 dark:border-gray-100 flex-col sm:flex-row">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmationInput !== boxToDelete.boxNumber}
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

        {/* Detail Modal - View Box Contents */}
        {isDetailModalOpen && selectedBoxForDetail && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b-2 border-gray-900 dark:border-gray-100 bg-white dark:bg-gray-800">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedBoxForDetail.boxNumber}
                </h2>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 flex-1 overflow-hidden">
                <div className="space-y-6 overflow-hidden">
                  {selectedBoxForDetail.subcategories.length > 0 ? (
                    selectedBoxForDetail.subcategories.map((subcategory) => (
                      <div
                        key={subcategory.letter}
                        className="border-2 border-gray-900 dark:border-gray-100 rounded-3xl p-6 sm:p-8 bg-white dark:bg-gray-700"
                      >
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {subcategory.letter} - {subcategory.itemName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subcategory.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-3 border-2 border-green-300 dark:border-green-700">
                            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">Stock In</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{subcategory.stockIn}</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-3 border-2 border-red-300 dark:border-red-700">
                            <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase">Stock Out</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{subcategory.stockOut}</p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-3 border-2 border-orange-300 dark:border-orange-700">
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase">Damage</p>
                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{subcategory.damageStock}</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-3 border-2 border-purple-300 dark:border-purple-700">
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase">In Use</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{subcategory.inUse}</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 border-2 border-blue-300 dark:border-blue-700">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Current</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{subcategory.currentStock}</p>
                          </div>
                        </div>

                        {subcategory.serialItems.length > 0 && (
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                              Serial Numbers ({subcategory.serialItems.length})
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {subcategory.serialItems.map((serial) => (
                                <div
                                  key={serial.id}
                                  className="p-3 bg-gray-50 dark:bg-gray-600 rounded-2xl border-2 border-gray-300 dark:border-gray-500"
                                >
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {serial.serialNumber}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{serial.supplier}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">No item categories added yet.</p>
                      <button
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          openAddSubcategoryModal(selectedBoxForDetail.id);
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors text-sm"
                      >
                        Add Item Type
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 justify-center p-6 sm:p-8 border-t-2 border-gray-900 dark:border-gray-100 bg-white dark:bg-gray-800">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openAddSubcategoryModal(selectedBoxForDetail.id);
                  }}
                  className="px-6 sm:px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Add Item Type
                </button>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 sm:px-8 py-3 border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Subcategory Modal */}
        {isSubcategoryModalOpen && currentBoxId !== null && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b-2 border-gray-900 dark:border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Add Item Type</h2>
                <button
                  onClick={() => {
                    setIsSubcategoryModalOpen(false);
                    setCurrentBoxId(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 space-y-6">
                <form onSubmit={handleAddSubcategory} className="space-y-6">
                  {/* Item Name Field */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="font-bold text-gray-900 dark:text-white text-sm sm:text-base min-w-fit">
                      Item Name
                    </label>
                    <span className="hidden sm:block text-gray-900 dark:text-white font-bold">:</span>
                    <input
                      type="text"
                      name="itemName"
                      value={subcategoryFormData.itemName}
                      onChange={handleSubcategoryInputChange}
                      placeholder="Enter Item name"
                      className="flex-1 px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors font-medium"
                      required
                    />
                  </div>

                  {/* Description Field */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <label className="font-bold text-gray-900 dark:text-white text-sm sm:text-base min-w-fit pt-2">
                      Description
                    </label>
                    <span className="hidden sm:block text-gray-900 dark:text-white font-bold pt-2">:</span>
                    <input
                      type="text"
                      name="description"
                      value={subcategoryFormData.description}
                      onChange={handleSubcategoryInputChange}
                      placeholder="Enter Description"
                      className="flex-1 px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors font-medium"
                    />
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex justify-center p-6 sm:p-8 border-t-2 border-gray-900 dark:border-gray-100">
                <button
                  onClick={handleAddSubcategory}
                  className="px-8 sm:px-12 py-3 border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Add Item Type
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