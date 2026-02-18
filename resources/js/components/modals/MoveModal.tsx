import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface SerialNumberGroup {
  serialNumbers: { serial: string; boxName: string }[];
  supplierId: string;
  supplierName: string;
}

// Update interface
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
  currentStatus?: string; // Add this prop
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

export const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  onClose,
  mainCategoryId,
  onMoveSuccess,
  currentStatus, // No default value here
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

  useEffect(() => {
    if (isOpen) {
      fetchStockInItems();
    } else {
      // Reset when modal closes
      setStep(1);
      setSearchItem('');
      setSelectedEntry(null);
      setSelectedSerials(new Set());
      setLocation('');
      setRemarks('');
    }
  }, [isOpen, mainCategoryId]);


  const fetchStockInItems = async () => {
    try {
      setLoading(true);
      // Add status query parameter
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

  if (!isOpen) return null;

const uniqueItems = dashboardEntries.map((e) => e.itemName);
  const filteredItems = searchItem
    ? uniqueItems.filter((item) => item.toLowerCase().includes(searchItem.toLowerCase()))
    : uniqueItems;

  // Update handleSelectItem to match on displayName
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
    if (selectedEntry && selectedSerials.size > 0 && location) {
      setShowConfirm(true);
    }
  };

  const handleConfirmMove = async () => {
    if (!selectedEntry || selectedSerials.size === 0 || !location) return;

    try {
      setLoading(true);

      // Map location to status
      const statusMap: Record<string, string> = {
        'In use': 'IN_USE',
        'Stock out': 'STOCK_OUT',
        'Damage': 'DAMAGED',
      };

      const response = await fetch('/api/stockin/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumbers: Array.from(selectedSerials),
          status: statusMap[location],
          remarks: remarks || null,
        }),
      });

      if (response.ok) {
        // Reset everything
        setStep(1);
        setSearchItem('');
        setSelectedEntry(null);
        setSelectedSerials(new Set());
        setLocation('');
        setRemarks('');
        setShowConfirm(false);
        
        // Notify parent to refresh
        onMoveSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to move items');
      }
    } catch (error) {
      console.error('Error moving items:', error);
      alert('Failed to move items');
    } finally {
      setLoading(false);
    }
  };

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
                  
                  {filteredItems.map((displayName) => (
                    <button
                      key={displayName}
                      onClick={() => handleSelectItem(displayName)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-sm text-gray-900 dark:text-white font-medium"
                    >
                      {displayName}
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
                    ))}
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

            {!loading && step === 3 && selectedEntry && (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    Total Selected: {selectedSerials.size} item(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                    Move to:
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select location</option>
                    <option value="In use">In use</option>
                    <option value="Stock out">Stock out</option>
                    <option value="Damage">Damage</option>
                  </select>
                </div>

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
                  disabled={!location || selectedSerials.size === 0}
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
        message={`Move ${selectedSerials.size} item(s) to ${location}?`}
        onConfirm={handleConfirmMove}
        onCancel={() => setShowConfirm(false)}
        confirmText="Move"
        cancelText="Cancel"
      />
    </>
  );
};