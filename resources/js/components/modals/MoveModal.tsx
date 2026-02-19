import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface SerialNumberGroup {
  serialNumbers: { serial: string; boxName: string }[];
  supplierId: string;
  supplierName: string;
}

interface StockInDashboardEntry {
  id: string;
  boxName: string;
  itemName: string;
  date: string;
  totalQuantity: number;
  serialGroups: SerialNumberGroup[];
  remarks: string;
}

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainCategoryId: number;
  onMoveSuccess: () => void;
  currentStatus?: string;
}

const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}> = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-start gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
          {isDangerous ? (
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" size={24} />
          ) : (
            <CheckCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={24} />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="p-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-full font-medium ${
              isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const getDestinationOptions = (currentStatus?: string) => {
  const statusMap: Record<string, string> = {
    'IN_STOCK':  'Stock in',
    'IN_USE':    'In use',
    'STOCK_OUT': 'Stock out',
    'DAMAGED':   'Damage',
    'DAMAGE':    'Damage',
  };

  const currentLabel = currentStatus ? statusMap[currentStatus] : null;

  const options = [
    { label: 'Stock in',  value: 'Stock in'  },
    { label: 'In use',    value: 'In use'    },
    { label: 'Stock out', value: 'Stock out' },
    { label: 'Damage',    value: 'Damage'    },
  ];

  return currentLabel ? options.filter((o) => o.label !== currentLabel) : options;
};

export const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  onClose,
  mainCategoryId,
  onMoveSuccess,
  currentStatus,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dashboardEntries, setDashboardEntries] = useState<StockInDashboardEntry[]>([]);
  const [searchItem, setSearchItem] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<StockInDashboardEntry | null>(null);
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());
  const [location, setLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Box selection for moving back to Stock in
  const [boxesForSubcategory, setBoxesForSubcategory] = useState<{ id: number; name: string }[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [searchBox, setSearchBox] = useState('');
  const [showBoxDropdown, setShowBoxDropdown] = useState(false);

  const destinationOptions = getDestinationOptions(currentStatus);

  useEffect(() => {
    if (isOpen) {
      fetchStockInItems();
    } else {
      // Reset all state when modal closes
      setStep(1);
      setSearchItem('');
      setSelectedEntry(null);
      setSelectedSerials(new Set());
      setLocation('');
      setRemarks('');
      setBoxesForSubcategory([]);
      setSelectedBoxId(null);
      setSearchBox('');
      setShowBoxDropdown(false);
    }
  }, [isOpen, mainCategoryId]);

  const fetchStockInItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/stockin/items-for-move/${mainCategoryId}?status=${currentStatus}`
      );
      const data = await response.json();
      setDashboardEntries(data);
    } catch (error) {
      console.error('Error fetching stock in items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoxesForSubcategory = async (subcategoryName: string) => {
    try {
      const url = `/api/stockin/subcategory-boxes/${encodeURIComponent(subcategoryName)}/${mainCategoryId}`;
      console.log('Fetching boxes from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Boxes data received:', data); // <-- check this in browser console
      
      const boxes = Array.isArray(data) ? data : [];
      console.log('Boxes array:', boxes);
      
      setBoxesForSubcategory(boxes);
      if (boxes.length > 0) {
        setShowBoxDropdown(true);
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
      setBoxesForSubcategory([]);
    }
  };

  if (!isOpen) return null;

  const uniqueItems = dashboardEntries.map((e) => e.itemName);
  const filteredItems = searchItem
    ? uniqueItems.filter((item) => item.toLowerCase().includes(searchItem.toLowerCase()))
    : uniqueItems;

  const handleSelectItem = (itemName: string) => {
    const entry = dashboardEntries.find((e) => e.itemName === itemName);
    if (entry) {
      setSelectedEntry(entry);
      setSelectedSerials(new Set());
      setStep(2);
    }
  };

  const handleToggleSerial = (serial: string) => {
    const updated = new Set(selectedSerials);
    updated.has(serial) ? updated.delete(serial) : updated.add(serial);
    setSelectedSerials(updated);
  };

  const handleMoveClick = () => {
    if (!selectedEntry || selectedSerials.size === 0 || !location) return;
    // Box is required when moving to Stock in
    if (location === 'Stock in' && !selectedBoxId) return;
    setShowConfirm(true);
  };

  const handleConfirmMove = async () => {
    if (!selectedEntry || selectedSerials.size === 0 || !location) return;

    try {
      setLoading(true);

      const statusMap: Record<string, string> = {
        'Stock in':  'IN_STOCK',
        'In use':    'IN_USE',
        'Stock out': 'STOCK_OUT',
        'Damage':    'DAMAGED',
      };

      const response = await fetch('/api/stockin/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumbers: Array.from(selectedSerials),
          status: statusMap[location],
          remarks: remarks || null,
          boxId: location === 'Stock in' ? selectedBoxId : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || 'Failed to move items');
        return;
      }

      // Success — reset everything
      setStep(1);
      setSearchItem('');
      setSelectedEntry(null);
      setSelectedSerials(new Set());
      setLocation('');
      setRemarks('');
      setBoxesForSubcategory([]);
      setSelectedBoxId(null);
      setSearchBox('');
      setShowBoxDropdown(false);
      setShowConfirm(false);
      onMoveSuccess();
      onClose();
    } catch (error) {
      console.error('Error moving items:', error);
      alert('Failed to move items');
    } finally {
      setLoading(false);
    }
  };

  const selectedBoxName = boxesForSubcategory.find((b) => b.id === selectedBoxId)?.name || '';
  const filteredBoxes = boxesForSubcategory.filter((b) =>
    b.name != null && b.name.toLowerCase().includes(searchBox.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 gap-2">
            <button
              onClick={() => {
                if (step === 1) {
                  onClose();
                } else {
                  setStep((step - 1) as 1 | 2 | 3);
                }
              }}
              disabled={loading}
              className="flex items-center gap-2 text-white font-bold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition whitespace-nowrap text-sm sm:text-base disabled:opacity-50"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center">Move</h2>
            <div className="w-16 sm:w-32" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {loading && (
              <div className="text-center py-8">
                <div className="text-gray-600 dark:text-gray-400">Loading...</div>
              </div>
            )}

            {/* Step 1 — Select Item */}
            {!loading && step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    Item Name:
                  </label>
                  <input
                    type="text"
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                    placeholder="Search item..."
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {filteredItems.length > 0 ? (
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
                    {filteredItems.map((itemName) => (
                      <button
                        key={itemName}
                        onClick={() => handleSelectItem(itemName)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-sm text-gray-900 dark:text-white font-medium"
                      >
                        {itemName}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    No items found
                  </div>
                )}
              </>
            )}

            {/* Step 2 — Select Serials */}
            {!loading && step === 2 && selectedEntry && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                    Item Name:
                  </label>
                  <input
                    type="text"
                    value={selectedEntry.itemName}
                    disabled
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                    Serial Numbers:
                  </label>
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
                    {selectedEntry.serialGroups.length === 0 || selectedEntry.totalQuantity === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No available serials with current status
                      </div>
                    ) : (
                      selectedEntry.serialGroups.map((group) =>
                        group.serialNumbers.map((item, idx) => (
                          <div
                            key={`${group.supplierId}-${idx}`}
                            className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSerials.has(item.serial)}
                              onChange={() => handleToggleSerial(item.serial)}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm text-gray-900 dark:text-white font-medium flex-1">
                              {item.serial}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                              {item.boxName}
                            </span>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setStep(3)}
                  disabled={selectedSerials.size === 0}
                  className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold disabled:opacity-50 text-sm sm:text-base"
                >
                  Next
                </button>
              </>
            )}

            {/* Step 3 — Select Destination */}
            {!loading && step === 3 && selectedEntry && (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    Total Selected: {selectedSerials.size} item(s)
                  </p>
                </div>

                {/* Move to */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                    Move to:
                  </label>
                  <select
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      // Reset box selection when destination changes
                      setSelectedBoxId(null);
                      setSearchBox('');
                      setBoxesForSubcategory([]);
                      // Fetch boxes if moving to Stock in
                      if (e.target.value === 'Stock in') {
                        fetchBoxesForSubcategory(selectedEntry.itemName);
                      }
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select destination</option>
                    {destinationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Box selector — only shown when moving to Stock in */}
                {location === 'Stock in' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                      Box:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedBoxId ? selectedBoxName : searchBox}
                        onChange={(e) => {
                          if (!selectedBoxId) {
                            setSearchBox(e.target.value);
                            setShowBoxDropdown(true);
                          }
                        }}
                        onFocus={() => setShowBoxDropdown(true)}
                        placeholder="Select box..."
                        readOnly={!!selectedBoxId}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      {selectedBoxId && (
                        <button
                          onClick={() => {
                            setSelectedBoxId(null);
                            setSearchBox('');
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ×
                        </button>
                      )}
                      {showBoxDropdown && !selectedBoxId && filteredBoxes.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                          {filteredBoxes.map((box) => (
                            <button
                              key={box.id}
                              onClick={() => {
                                setSelectedBoxId(box.id);
                                setShowBoxDropdown(false);
                                setSearchBox('');
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-sm"
                            >
                              {box.name}
                            </button>
                          ))}
                        </div>
                      )}
                      {showBoxDropdown && !selectedBoxId && filteredBoxes.length === 0 && (
                        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                          <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No boxes found</p>
                        </div>
                      )}
                    </div>
                    {location === 'Stock in' && !selectedBoxId && (
                      <p className="text-xs text-red-500 mt-1">Box is required when moving to Stock in</p>
                    )}
                  </div>
                )}

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                    Remarks:
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks..."
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                </div>

                {/* Items to Move */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                    Items to Move:
                  </label>
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 max-h-32 overflow-y-auto">
                    {selectedSerials.size > 0 ? (
                      Array.from(selectedSerials).map((serial, idx) => (
                        <p key={`confirm-${serial}-${idx}`} className="text-sm text-gray-900 dark:text-white mb-1">
                          {selectedEntry.itemName} - {serial}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">No items selected</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleMoveClick}
                  disabled={
                    !location ||
                    selectedSerials.size === 0 ||
                    (location === 'Stock in' && !selectedBoxId)
                  }
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 transition text-sm sm:text-base"
                >
                  Move Confirm
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Move"
        message={`Move ${selectedSerials.size} item(s) to "${location}"${location === 'Stock in' && selectedBoxName ? ` → ${selectedBoxName}` : ''}?`}
        onConfirm={handleConfirmMove}
        onCancel={() => setShowConfirm(false)}
        confirmText="Move"
        cancelText="Cancel"
      />
    </>
  );
};