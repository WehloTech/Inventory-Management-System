import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
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
              </div>
            </div>
          </div>
        </main>

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
