import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Eye,
  Trash2,
} from 'lucide-react';
import axios from 'axios';


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
  const [inventoryBoxes, setInventoryBoxes] = useState<InventoryBox[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
  const [expandedBoxes, setExpandedBoxes] = useState<Set<number>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
  const [selectedBoxForSerial, setSelectedBoxForSerial] = useState<{ boxId: number; letter: string } | null>(null);

  // Fetch API
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data } = await axios.get('/api/usher-stocks'); // adjust API route
        const boxes = mapStocksToBoxes(data);
        setInventoryBoxes(boxes);
      } catch (error) {
        console.error('Failed to fetch stocks:', error);
      } finally {
        setLoading(false);
      }
    };
=======
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBoxForDetail, setSelectedBoxForDetail] = useState<InventoryBox | null>(null);
  const [currentBoxId, setCurrentBoxId] = useState<number | null>(null);
  const [currentSubcategoryLetter, setCurrentSubcategoryLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

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
  ]);
>>>>>>> 174fe10b20b94b8a6df59b188b895aa09605457a

    fetchStocks();
  }, []);

  // Map API data to boxes
  const mapStocksToBoxes = (stocks: any[]): InventoryBox[] => {
    const boxesMap: Record<string, InventoryBox> = {};

    stocks.forEach((stock) => {
      const boxKey = stock.location;

      if (!boxesMap[boxKey]) {
        boxesMap[boxKey] = {
          id: Date.now() + Math.random(), // unique id
          boxNumber: stock.location,
          subcategories: [],
        };
      }

      const serialItems: SerialItem[] = (stock.serial_numbers?.split(',') || []).map(
        (sn: string, idx: number) => ({
          id: idx + 1,
          serialNumber: sn,
          supplier: stock.suppliers || '',
        })
      );

      const letter = String.fromCharCode(65 + boxesMap[boxKey].subcategories.length);

      boxesMap[boxKey].subcategories.push({
        letter,
        itemName: stock.subCategory,
        description: '', 
        unit: 'pcs',
        serialItems,
        stockIn: stock.IN,
        stockOut: stock.OUT,
        damageStock: stock.DAMAGE,
        inUse: stock.IN_USE,
        currentStock: stock.total_items,
      });
    });

    return Object.values(boxesMap);
  };

  const filteredBoxes = inventoryBoxes.filter((box) => {
    const query = searchQuery.toLowerCase();
    return (
      box.boxNumber.toLowerCase().includes(query) ||
      box.subcategories.some(
        (sub) =>
          sub.itemName.toLowerCase().includes(query) ||
          sub.serialItems.some(
            (serial) =>
              serial.serialNumber.toLowerCase().includes(query) ||
              serial.supplier.toLowerCase().includes(query)
          )
      )
    );
  });

<<<<<<< HEAD
  const toggleBoxExpanded = (boxId: number) => {
    setExpandedBoxes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(boxId)) newSet.delete(boxId);
      else newSet.add(boxId);
      return newSet;
    });
  };

  const toggleSubcategoryExpanded = (boxId: number, letter: string) => {
    const key = `${boxId}-${letter}`;
    setExpandedSubcategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const openSerialModal = (boxId: number, letter: string) => {
    setSelectedBoxForSerial({ boxId, letter });
    setIsSerialModalOpen(true);
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

=======
  // Pagination
  const totalPages = Math.ceil(filteredBoxes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBoxes = filteredBoxes.slice(startIndex, startIndex + itemsPerPage);

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

    const newBoxList = [...inventoryBoxes, newBox];
    setInventoryBoxes(newBoxList);
    
    // Calculate which page the new box will be on
    const newTotalPages = Math.ceil(newBoxList.length / itemsPerPage);
    setCurrentPage(newTotalPages);
    
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

  const handleDeleteBox = (boxId: number) => {
    if (confirm('Are you sure you want to delete this box?')) {
      const newBoxList = inventoryBoxes.filter((b) => b.id !== boxId);
      setInventoryBoxes(newBoxList);
      
      // Recalculate total pages after deletion
      const newTotalPages = Math.ceil(newBoxList.length / itemsPerPage);
      
      // If current page is greater than new total pages, go to the last page
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
    }
  };

>>>>>>> 174fe10b20b94b8a6df59b188b895aa09605457a
  return (
    <>
      <Head title="Master List" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Masterlist</h1>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
<<<<<<< HEAD
            <div className="flex-1 overflow-auto p-6 flex flex-col">
              <div className="mb-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg text-center">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">BOX INVENTORY</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage Inventory by Box and Serial Numbers</p>
                </div>
              </div>

              {/* Search */}
              <div className="flex gap-4 mb-6">
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
              </div>

              {/* Boxes */}
              <div className="space-y-4">
                {filteredBoxes.map((box) => (
                  <div key={box.id} className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 overflow-hidden rounded-lg">
                    {/* Box Header */}
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4">
                      <button
                        onClick={() => toggleBoxExpanded(box.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ChevronDown
                          size={20}
                          className={`transform transition-transform ${expandedBoxes.has(box.id) ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{box.boxNumber}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded">
                        {box.subcategories.length} subcategories
                      </span>
                    </div>

                    {/* Subcategories */}
                    {expandedBoxes.has(box.id) && (
                      <div className="bg-gray-50 dark:bg-gray-700/50">
                        {box.subcategories.map((sub) => {
                          const key = `${box.id}-${sub.letter}`;
                          const isExpanded = expandedSubcategories.has(key);

                          return (
                            <div key={sub.letter} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                              <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <button
                                    onClick={() => toggleSubcategoryExpanded(box.id, sub.letter)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                  >
                                    <ChevronRight
                                      size={18}
                                      className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                    />
                                  </button>
                                  <div>
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{sub.letter}</span>
                                    <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full ml-2">
                                      {sub.itemName}
                                    </span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{sub.description}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6">
                                <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
                                  <p className="text-xs text-green-600 dark:text-green-400 uppercase">Stock In</p>
                                  <p className="text-lg font-semibold text-green-700 dark:text-green-300">{sub.stockIn}</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded p-3">
                                  <p className="text-xs text-red-600 dark:text-red-400 uppercase">Stock Out</p>
                                  <p className="text-lg font-semibold text-red-700 dark:text-red-300">{sub.stockOut}</p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-3">
                                  <p className="text-xs text-orange-600 dark:text-orange-400 uppercase">Damage</p>
                                  <p className="text-lg font-semibold text-orange-700 dark:text-orange-300">{sub.damageStock}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-3">
                                  <p className="text-xs text-purple-600 dark:text-purple-400 uppercase">In Use</p>
                                  <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">{sub.inUse}</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 uppercase">Current Stock</p>
                                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">{sub.currentStock}</p>
                                </div>
                              </div>

                              {/* Serial Numbers */}
                              {isExpanded && (
                                <div className="px-6 pb-6 pt-4">
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center justify-between mb-4">
                                      <h4 className="font-semibold text-gray-900 dark:text-white">
                                        Serial Numbers ({sub.serialItems.length})
                                      </h4>
                                      <button
                                        onClick={() => openSerialModal(box.id, sub.letter)}
                                        className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                                      >
                                        View All
                                      </button>
                                    </div>

                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                      {sub.serialItems.slice(0, 3).map((serial) => (
                                        <div
                                          key={serial.id}
                                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                                        >
                                          <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{serial.serialNumber}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{serial.supplier}</p>
                                          </div>
                                        </div>
                                      ))}
                                      {sub.serialItems.length > 3 && (
                                        <div className="text-center pt-2 text-sm text-gray-600 dark:text-gray-400">
                                          +{sub.serialItems.length - 3} more
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
=======
            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col bg-white dark:bg-gray-900">
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
                    Add box
                  </button>
                </div>

                {/* Table - Responsive */}
                <div className="overflow-x-auto border-2 border-gray-900 dark:border-gray-100 rounded-lg bg-white dark:bg-gray-800">
                  <table className="w-full min-w-full">
                    {/* Table Header */}
<thead>
  <tr className="border-b-2 border-gray-900 dark:border-gray-100">
    <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-r border-gray-900 dark:border-gray-100 text-sm sm:text-base">
      Box No.
    </th>
    <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-r border-gray-900 dark:border-gray-100 text-sm sm:text-base">
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
                            className="border-b-2 border-gray-900 dark:border-gray-100 last:border-b-0 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
<td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium border-r border-gray-900 dark:border-gray-100 text-sm sm:text-base">
  {box.boxNumber}
</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-medium border-r border-gray-900 dark:border-gray-100 text-sm sm:text-base">
                              {box.subcategories.length}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                                <button
                                  onClick={() => {
                                    // Navigate to detail view page
                                    router.visit(`/usher/master-list/${box.id}`);
                                  }}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium flex items-center gap-1 text-sm sm:text-base"
                                >
                                  <Eye size={16} />
                                  <span className="hidden sm:inline">View</span>
                                  <span className="sm:hidden">View</span>
                                </button>
                                <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">|</span>
                                <button
                                  onClick={() => handleDeleteBox(box.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline font-medium flex items-center gap-1 text-sm sm:text-base"
                                >
                                  <Trash2 size={16} />
                                  <span className="hidden sm:inline">Delete</span>
                                  <span className="sm:hidden">Delete</span>
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
                <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 flex-wrap">
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
>>>>>>> 174fe10b20b94b8a6df59b188b895aa09605457a
              </div>
            </div>
          </div>
        </main>

<<<<<<< HEAD
        {/* Serial Numbers Modal */}
        {isSerialModalOpen && selectedBoxForSerial && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subcategory?.itemName}</p>
                      </>
                    );
                  })()}
                </div>
                <button onClick={() => setIsSerialModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
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
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{serial.serialNumber}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Supplier: {serial.supplier}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setIsSerialModalOpen(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Close
=======
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
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 space-y-6">
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
                  Add box
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal - View Box Contents */}
        {isDetailModalOpen && selectedBoxForDetail && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b-2 border-gray-900 dark:border-gray-100 sticky top-0 bg-white dark:bg-gray-800 z-10">
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
              <div className="p-6 sm:p-8">
                <div className="space-y-6">
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
              <div className="flex gap-3 justify-center p-6 sm:p-8 border-t-2 border-gray-900 dark:border-gray-100 sticky bottom-0 bg-white dark:bg-gray-800">
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
>>>>>>> 174fe10b20b94b8a6df59b188b895aa09605457a
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
