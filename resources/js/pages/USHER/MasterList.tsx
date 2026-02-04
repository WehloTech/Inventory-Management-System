import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';

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

interface MasterListPageComponent extends React.FC {
  layout?: any;
}

const MasterList: MasterListPageComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedBoxForSerial, setSelectedBoxForSerial] = useState<{ boxId: number; letter: string } | null>(null);
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
  const [expandedBoxes, setExpandedBoxes] = useState<Set<number>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [currentBoxId, setCurrentBoxId] = useState<number | null>(null);
  const [currentSubcategoryLetter, setCurrentSubcategoryLetter] = useState<string | null>(null);

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

  const handleBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBoxFormData((prev) => ({
      ...prev,
      [name]: value,
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

    const newBoxId = Math.max(...inventoryBoxes.map((b) => b.id), 0) + 1;

    const newBox: InventoryBox = {
      id: newBoxId,
      boxNumber: boxFormData.boxNumber,
      subcategories: [],
    };

    setInventoryBoxes([...inventoryBoxes, newBox]);
    setBoxFormData({
      boxNumber: '',
    });
    setIsBoxModalOpen(false);
  };

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentBoxId === null) return;

    setInventoryBoxes((prevBoxes) =>
      prevBoxes.map((box) => {
        if (box.id === currentBoxId) {
          // Get the next letter (A, B, C, etc.)
          const existingLetters = box.subcategories.map((sub) => sub.letter);
          const nextLetter = String.fromCharCode(
            65 + box.subcategories.length
          ); // A=65 in ASCII

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

  const openAddItemModal = (boxId: number, letter: string) => {
    setCurrentBoxId(boxId);
    setCurrentSubcategoryLetter(letter);
    setItemFormData({
      unit: 'pcs',
      serialNumber: '',
      supplier: '',
      stockIn: 0,
      stockOut: 0,
      damageStock: 0,
      inUse: 0,
    });
    setIsItemModalOpen(true);
  };

  const toggleBoxExpanded = (boxId: number) => {
    setExpandedBoxes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(boxId)) {
        newSet.delete(boxId);
      } else {
        newSet.add(boxId);
      }
      return newSet;
    });
  };

  const toggleSubcategoryExpanded = (boxId: number, letter: string) => {
    const key = `${boxId}-${letter}`;
    setExpandedSubcategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const openSerialModal = (boxId: number, letter: string) => {
    setSelectedBoxForSerial({ boxId, letter });
    setIsSerialModalOpen(true);
  };

  const currentBox = currentBoxId ? inventoryBoxes.find((b) => b.id === currentBoxId) : null;
  const currentSubcategory =
    currentBox && currentSubcategoryLetter
      ? currentBox.subcategories.find((sub) => sub.letter === currentSubcategoryLetter)
      : null;

  return (
    <>
      <Head title="Master List" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">MASTER LIST</h1>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Content */}
            <div className="flex-1 overflow-auto p-6 flex flex-col">
              <div className="w-full flex flex-col flex-1">
                {/* Header */}
                <div className="mb-6">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        BOX INVENTORY
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        Manage Inventory by Box and Serial Numbers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search and Add Bar */}
                <div className="flex gap-4 mb-6 flex-col lg:flex-row">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by item name, box number, serial number, or supplier..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => setIsBoxModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus size={20} />
                    Add Box
                  </button>
                </div>

                {/* Boxes List */}
                <div className="space-y-4">
                  {filteredBoxes.map((box) => (
                    <div
                      key={box.id}
                      className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 overflow-hidden rounded-lg"
                    >
                      {/* Box Header */}
                      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4 flex-1">
                            <button
                              onClick={() => toggleBoxExpanded(box.id)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <ChevronDown
                                size={20}
                                className={`transform transition-transform ${
                                  expandedBoxes.has(box.id) ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {box.boxNumber}
                                </h3>
                                <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded">
                                  {box.subcategories.length} subcategories
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => openAddSubcategoryModal(box.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <Plus size={16} />
                              Add Item Type
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Box Subcategories */}
                      {expandedBoxes.has(box.id) && (
                        <div className="bg-gray-50 dark:bg-gray-700/50">
                          {box.subcategories.map((subcategory) => {
                            const subcategoryKey = `${box.id}-${subcategory.letter}`;
                            const isSubExpanded = expandedSubcategories.has(subcategoryKey);

                            return (
                              <div
                                key={subcategory.letter}
                                className="border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                              >
                                {/* Subcategory Header */}
                                <div className="p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4 flex-1">
                                      <button
                                        onClick={() =>
                                          toggleSubcategoryExpanded(box.id, subcategory.letter)
                                        }
                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                      >
                                        <ChevronRight
                                          size={18}
                                          className={`transform transition-transform ${
                                            isSubExpanded ? 'rotate-90' : ''
                                          }`}
                                        />
                                      </button>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {subcategory.letter}
                                          </span>
                                          <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                            {subcategory.itemName}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {subcategory.description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Subcategory Stats */}
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
                                      <p className="text-xs text-green-600 dark:text-green-400 uppercase">
                                        Stock In
                                      </p>
                                      <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                                        {subcategory.stockIn}
                                      </p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded p-3">
                                      <p className="text-xs text-red-600 dark:text-red-400 uppercase">
                                        Stock Out
                                      </p>
                                      <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                                        {subcategory.stockOut}
                                      </p>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-3">
                                      <p className="text-xs text-orange-600 dark:text-orange-400 uppercase">
                                        Damage
                                      </p>
                                      <p className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                                        {subcategory.damageStock}
                                      </p>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-3">
                                      <p className="text-xs text-purple-600 dark:text-purple-400 uppercase">
                                        In Use
                                      </p>
                                      <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                                        {subcategory.inUse}
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                                      <p className="text-xs text-blue-600 dark:text-blue-400 uppercase">
                                        Current Stock
                                      </p>
                                      <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                                        {subcategory.currentStock}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Subcategory Details - Serial Numbers */}
                                {isSubExpanded && (
                                  <div className="px-6 pb-6">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                      <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                          Serial Numbers ({subcategory.serialItems.length})
                                        </h4>
                                        <button
                                          onClick={() => openSerialModal(box.id, subcategory.letter)}
                                          className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                                        >
                                          View All
                                        </button>
                                      </div>

                                      <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {subcategory.serialItems.slice(0, 3).map((serial) => (
                                          <div
                                            key={serial.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                                          >
                                            <div>
                                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {serial.serialNumber}
                                              </p>
                                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {serial.supplier}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                        {subcategory.serialItems.length > 3 && (
                                          <div className="text-center pt-2">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                              +{subcategory.serialItems.length - 3} more
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Add Box Modal */}
        {isBoxModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Box</h2>
                <button
                  onClick={() => {
                    setIsBoxModalOpen(false);
                    setBoxFormData({
                      boxNumber: '',
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleAddBox} className="p-6 space-y-4">
                {/* Box Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Box Number
                  </label>
                  <input
                    type="text"
                    name="boxNumber"
                    value={boxFormData.boxNumber}
                    onChange={handleBoxInputChange}
                    placeholder="BOX-001"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    After creating the box, you can add item types (subcategories A, B, C, etc.) to organize different items within this box.
                  </p>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBoxModalOpen(false);
                      setBoxFormData({
                        boxNumber: '',
                      });
                    }}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Create Box
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Subcategory Modal */}
        {isSubcategoryModalOpen && currentBox && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Add Item Type
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentBox.boxNumber} - Letter {String.fromCharCode(65 + currentBox.subcategories.length)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsSubcategoryModalOpen(false);
                    setCurrentBoxId(null);
                    setSubcategoryFormData({
                      itemName: '',
                      description: '',
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleAddSubcategory} className="p-6 space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={subcategoryFormData.itemName}
                    onChange={handleSubcategoryInputChange}
                    placeholder="Laptop"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={subcategoryFormData.description}
                    onChange={handleSubcategoryInputChange}
                    placeholder="Item description"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubcategoryModalOpen(false);
                      setCurrentBoxId(null);
                      setSubcategoryFormData({
                        itemName: '',
                        description: '',
                      });
                    }}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Add Item Type
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {isItemModalOpen && currentSubcategory && currentBox && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Item Details</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentBox.boxNumber} - {currentSubcategoryLetter} - {currentSubcategory.itemName}
                  </p>
                </div>
                <button
                  onClick={() => {
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
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleAddItem} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stock In */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock In
                    </label>
                    <input
                      type="number"
                      name="stockIn"
                      value={itemFormData.stockIn}
                      onChange={handleItemInputChange}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Stock Out */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock Out
                    </label>
                    <input
                      type="number"
                      name="stockOut"
                      value={itemFormData.stockOut}
                      onChange={handleItemInputChange}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Damage Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Damage Stock
                    </label>
                    <input
                      type="number"
                      name="damageStock"
                      value={itemFormData.damageStock}
                      onChange={handleItemInputChange}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* In Use */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      In Use
                    </label>
                    <input
                      type="number"
                      name="inUse"
                      value={itemFormData.inUse}
                      onChange={handleItemInputChange}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Serial Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Serial #
                    </label>
                    <input
                      type="text"
                      name="serialNumber"
                      value={itemFormData.serialNumber}
                      onChange={handleItemInputChange}
                      placeholder="DL123456"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Supplier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      value={itemFormData.supplier}
                      onChange={handleItemInputChange}
                      placeholder="Dell Inc"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleFinishAddingItems}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Done
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Serial Numbers Modal */}
        {isSerialModalOpen && selectedBoxForSerial !== null && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div>
                  {(() => {
                    const box = inventoryBoxes.find((b) => b.id === selectedBoxForSerial.boxId);
                    const subcategory = box?.subcategories.find(
                      (sub) => sub.letter === selectedBoxForSerial.letter
                    );
                    return (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {box?.boxNumber} - {selectedBoxForSerial.letter} - Serial Numbers
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {subcategory?.itemName}
                        </p>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setIsSerialModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {(() => {
                    const box = inventoryBoxes.find((b) => b.id === selectedBoxForSerial.boxId);
                    const subcategory = box?.subcategories.find(
                      (sub) => sub.letter === selectedBoxForSerial.letter
                    );
                    return subcategory?.serialItems.map((serial) => (
                      <div
                        key={serial.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {serial.serialNumber}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Supplier: {serial.supplier}
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    onClick={() => setIsSerialModalOpen(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarProvider>
    </>
  );
};

export default MasterList;