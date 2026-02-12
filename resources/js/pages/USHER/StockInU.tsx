import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Plus, Trash2, ArrowLeft, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface SupplierInfo {
  id: string;
  name: string;
  email: string;
  contact: string;
}

interface SerialNumberGroup {
  serialNumbers: string[];
  supplierId: string;
  supplierName: string;
}

interface StockInItem {
  id: string;
  boxName: string;
  itemName: string;
  quantity: number;
  serialGroups: SerialNumberGroup[];
  date: string;
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

// Confirmation Dialog
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
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Serial Number View Modal
const SerialNumberViewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  entry: StockInDashboardEntry | null;
  onMove: (selectedSerials: string[], location: string) => void;
  onUpdateRemarks: (remarks: string) => void;
}> = ({ isOpen, onClose, entry, onMove, onUpdateRemarks }) => {
  const [remarks, setRemarks] = useState('');
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const ITEMS_PER_PAGE = 5;

  React.useEffect(() => {
    if (isOpen && entry) {
      setRemarks(entry.remarks || '');
      setSelectedSerials(new Set());
      setCurrentPage(1);
      setShowMoveModal(false);
      setSelectedLocation('');
    }
  }, [entry?.id, isOpen]);

  if (!isOpen || !entry) return null;

  const allSerials = entry.serialGroups.flatMap((group) =>
    group.serialNumbers.map((serial) => ({ serial, supplier: group.supplierName }))
  );

  const totalPages = Math.ceil(allSerials.length / ITEMS_PER_PAGE);
  const paginatedSerials = allSerials.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleToggleSerial = (serial: string) => {
    const updated = new Set(selectedSerials);
    updated.has(serial) ? updated.delete(serial) : updated.add(serial);
    setSelectedSerials(updated);
  };

  const handleSaveRemarks = () => {
    onUpdateRemarks(remarks);
  };

  const handleMoveClick = () => {
    if (selectedSerials.size > 0) {
      setShowMoveModal(true);
    }
  };

  const handleConfirmMove = () => {
    if (selectedSerials.size > 0 && selectedLocation) {
      setShowConfirm(true);
    }
  };

  const handleFinalMove = () => {
    onMove(Array.from(selectedSerials), selectedLocation);
    setShowMoveModal(false);
    setShowConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 gap-2 flex-wrap">
            <button 
              onClick={showMoveModal ? () => setShowMoveModal(false) : onClose} 
              className="flex items-center gap-2 text-white font-bold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition whitespace-nowrap text-sm sm:text-base"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center flex-1 sm:flex-none">Serial #</h2>
            {!showMoveModal && (
              <button 
                onClick={handleMoveClick}
                disabled={selectedSerials.size === 0}
                className="px-4 sm:px-6 py-2 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap text-sm sm:text-base"
              >
                MOVE ({selectedSerials.size})
              </button>
            )}
            {showMoveModal && <div className="w-20 sm:w-40" />}
          </div>

          {/* View Mode */}
          {!showMoveModal && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Item Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Item: {entry.itemName}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Date: {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Qty: {entry.totalQuantity}</p>
                </div>
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700">
                  <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 block">Remarks:</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks..."
                    rows={3}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                  <button
                    onClick={handleSaveRemarks}
                    className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Serial Numbers Table */}
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white w-12">✓</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Serial #</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Supplier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedSerials.map((item, idx) => (
                        <tr key={`${entry.id}-${item.serial}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 sm:px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedSerials.has(item.serial)}
                              onChange={() => handleToggleSerial(item.serial)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-3 sm:px-6 py-3 text-sm text-gray-900 dark:text-white font-medium">{item.serial}</td>
                          <td className="px-3 sm:px-6 py-3 text-sm text-gray-900 dark:text-white">{item.supplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 text-sm"
                    >
                      &lt;
                    </button>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 py-1 text-xs rounded font-medium ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 text-sm"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Move Modal - Step 3 (Direct) */}
          {showMoveModal && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  Total Selected: {selectedSerials.size} item(s)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Move to:</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select location</option>
                  <option value="In use">In use</option>
                  <option value="Stock out">Stock out</option>
                  <option value="Damage">Damage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Items to Move:</label>
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 max-h-48 overflow-y-auto">
                  {selectedSerials.size > 0 ? (
                    <div className="space-y-2">
                      {Array.from(selectedSerials).map((serial, idx) => (
                        <div key={`move-${serial}-${idx}`} className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-2 rounded">
                          {entry.itemName} - {serial}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No items selected</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleConfirmMove}
                disabled={!selectedLocation || selectedSerials.size === 0}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 transition text-sm sm:text-base"
              >
                Move Confirm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Move"
        message={`Move ${selectedSerials.size} item(s) to ${selectedLocation}?`}
        onConfirm={handleFinalMove}
        onCancel={() => setShowConfirm(false)}
        confirmText="Move"
        cancelText="Cancel"
      />
    </>
  );
};

// Move Modal
const MoveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  dashboardEntries: StockInDashboardEntry[];
  onMoveConfirm: (removedSerials: Array<{ serial: string; itemName: string }>) => void;
}> = ({ isOpen, onClose, dashboardEntries, onMoveConfirm }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchItem, setSearchItem] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<StockInDashboardEntry | null>(null);
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());
  const [location, setLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const uniqueItems = Array.from(new Set(dashboardEntries.map((e) => e.itemName)));
  const filteredItems = uniqueItems.filter((item) => item.toLowerCase().includes(searchItem.toLowerCase()));

  const handleSelectItem = (entry: StockInDashboardEntry) => {
    setSelectedEntry(entry);
    setSelectedSerials(new Set());
    setStep(2);
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

  const handleConfirmMove = () => {
    if (selectedEntry && selectedSerials.size > 0 && location) {
      const removedSerials = Array.from(selectedSerials).map((serial) => ({
        serial,
        itemName: selectedEntry.itemName,
      }));

      onMoveConfirm(removedSerials);
      
      setStep(1);
      setSearchItem('');
      setSelectedEntry(null);
      setSelectedSerials(new Set());
      setLocation('');
      setRemarks('');
      setShowConfirm(false);
      onClose();
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
              className="flex items-center gap-2 text-white font-bold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition whitespace-nowrap text-sm sm:text-base"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center">Move</h2>
            <div className="w-16 sm:w-32" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Item Name:</label>
                  <input
                    type="text"
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                    placeholder="Search item..."
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {searchItem && filteredItems.length > 0 && (
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
                    {filteredItems.map((itemName) => {
                      const entry = dashboardEntries.find((e) => e.itemName === itemName);
                      if (!entry) return null;

                      return (
                        <button
                          key={itemName}
                          onClick={() => handleSelectItem(entry)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-sm text-gray-900 dark:text-white font-medium"
                        >
                          {itemName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {step === 2 && selectedEntry && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Item Name:</label>
                  <input
                    type="text"
                    value={selectedEntry.itemName}
                    disabled
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Serial Numbers:</label>
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
                    {selectedEntry.serialGroups.map((group) =>
                      group.serialNumbers.map((serial, idx) => (
                        <div
                          key={`${group.supplierId}-${idx}`}
                          className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSerials.has(serial)}
                            onChange={() => handleToggleSerial(serial)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="text-sm text-gray-900 dark:text-white font-medium flex-1">{serial}</span>
                        </div>
                      ))
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

            {step === 3 && selectedEntry && (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    Total Selected: {selectedSerials.size} item(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Move to:</label>
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
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Remarks:</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks..."
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Items to Move:</label>
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

// Add Stock In Modal
const AddStockInModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: StockInItem[], newSuppliers: SupplierInfo[]) => void;
  suppliers: SupplierInfo[];
  allExistingSerials: string[];
  allExistingItems: string[];
}> = ({ isOpen, onClose, onSubmit, suppliers: initialSuppliers, allExistingSerials, allExistingItems }) => {
  const [items, setItems] = useState<StockInItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>(initialSuppliers);
  const [boxName, setBoxName] = useState('');
  const [itemName, setItemName] = useState('');
  const [searchItemName, setSearchItemName] = useState('');
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [serialNumbers, setSerialNumbers] = useState<string[]>(['']);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierInfo | null>(null);
  const [searchSupplier, setSearchSupplier] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', contact: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchSupplier.toLowerCase())
  );

  const filteredItems = itemName.trim() 
    ? allExistingItems.filter((item) => item.toLowerCase().includes(itemName.toLowerCase()))
    : [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!boxName.trim()) newErrors.boxName = 'Box name is required';
    if (!itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!quantity || parseInt(quantity) <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!selectedSupplier) newErrors.supplier = 'Supplier is required';

    const validSerials = serialNumbers.filter((s) => s.trim());
    if (validSerials.length === 0) {
      newErrors.serials = 'At least one serial number is required';
    }
    if (validSerials.length !== parseInt(quantity || '0')) {
      newErrors.serials = `You must have ${quantity} serial number(s), got ${validSerials.length}`;
    }

    const duplicates = validSerials.filter((serial) => allExistingSerials.includes(serial));
    if (duplicates.length > 0) {
      newErrors.serials = `These serial numbers already exist: ${duplicates.join(', ')}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNewSupplier = () => {
    if (!newSupplier.name.trim() || !newSupplier.email.trim() || !newSupplier.contact.trim()) {
      return;
    }

    const createdSupplier: SupplierInfo = {
      id: `supplier-${Date.now()}`,
      name: newSupplier.name,
      email: newSupplier.email,
      contact: newSupplier.contact,
    };

    setSuppliers([...suppliers, createdSupplier]);
    setSelectedSupplier(createdSupplier);
    setNewSupplier({ name: '', email: '', contact: '' });
    setShowAddSupplier(false);
    setSearchSupplier('');
  };

  const handleAddItem = () => {
    if (!validateForm()) return;

    const qty = parseInt(quantity);
    const validSerials = serialNumbers.filter((s) => s.trim());
    const today = new Date().toISOString().split('T')[0];

    const existingItemIndex = items.findIndex(
      (item) => item.boxName === boxName && item.itemName === itemName && item.date === today
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += qty;

      const supplierGroupIndex = updatedItems[existingItemIndex].serialGroups.findIndex(
        (group) => group.supplierId === selectedSupplier!.id
      );

      if (supplierGroupIndex !== -1) {
        updatedItems[existingItemIndex].serialGroups[supplierGroupIndex].serialNumbers.push(...validSerials);
      } else {
        updatedItems[existingItemIndex].serialGroups.push({
          serialNumbers: validSerials,
          supplierId: selectedSupplier!.id,
          supplierName: selectedSupplier!.name,
        });
      }

      setItems(updatedItems);
    } else {
      const newItem: StockInItem = {
        id: `item-${Date.now()}`,
        boxName,
        itemName,
        quantity: qty,
        date: today,
        serialGroups: [
          {
            serialNumbers: validSerials,
            supplierId: selectedSupplier!.id,
            supplierName: selectedSupplier!.name,
          },
        ],
      };

      setItems([...items, newItem]);
    }

    setBoxName('');
    setItemName('');
    setSearchItemName('');
    setQuantity('');
    setSerialNumbers(['']);
    setShowItemSuggestions(false);
    setErrors({});
  };

  const handleSerialChange = (index: number, value: string) => {
    const newSerials = [...serialNumbers];
    newSerials[index] = value;
    setSerialNumbers(newSerials);
  };

  const handleRemoveItem = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmRemoveItem = () => {
    if (deleteConfirm) {
      setItems(items.filter((item) => item.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      return;
    }

    onSubmit(items, suppliers);

    setItems([]);
    setBoxName('');
    setItemName('');
    setSearchItemName('');
    setQuantity('');
    setSerialNumbers(['']);
    setSelectedSupplier(null);
    setSearchSupplier('');
    setShowAddSupplier(false);
    setErrors({});
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-white font-semibold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition whitespace-nowrap text-sm sm:text-base"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white text-center flex-1 lg:flex-none">Add Stock In</h2>
              <div className="w-16 sm:w-32" />
            </div>

            {/* Item Form Section */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3 bg-gray-50 dark:bg-gray-700">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Box Name:</label>
                <input
                  type="text"
                  value={boxName}
                  onChange={(e) => {
                    setBoxName(e.target.value.toUpperCase());
                    if (errors.boxName) setErrors({ ...errors, boxName: '' });
                  }}
                  placeholder="ENTER BOX NAME"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.boxName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Item Name:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => {
                      setItemName(e.target.value);
                      setSearchItemName(e.target.value);
                      setShowItemSuggestions(true);
                      if (errors.itemName) setErrors({ ...errors, itemName: '' });
                    }}
                    placeholder="Search or type item name"
                    className={`w-full px-4 py-2 border-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      errors.itemName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {showItemSuggestions && filteredItems.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {filteredItems.map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            setItemName(item);
                            setShowItemSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-sm"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.itemName && <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Quantity:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setQuantity(val.toString());
                    if (errors.quantity) setErrors({ ...errors, quantity: '' });
                    
                    if (val > serialNumbers.length) {
                      const diff = val - serialNumbers.length;
                      setSerialNumbers([...serialNumbers, ...Array(diff).fill('')]);
                    }
                  }}
                  placeholder="Enter Quantity"
                  min="1"
                  className={`w-full px-4 py-2 border-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>

              {quantity && parseInt(quantity) > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">SN (Serial Numbers):</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {serialNumbers.slice(0, parseInt(quantity)).map((serial, index) => (
                      <input
                        key={index}
                        type="text"
                        value={serial}
                        onChange={(e) => handleSerialChange(index, e.target.value)}
                        placeholder={`Serial #${index + 1}`}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    ))}
                  </div>
                  {errors.serials && <p className="text-red-500 text-xs mt-1">{errors.serials}</p>}
                </div>
              )}

              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Supplier:</label>
                </div>

                {!showAddSupplier ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={searchSupplier}
                          onChange={(e) => setSearchSupplier(e.target.value)}
                          placeholder="Search Supplier"
                          className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        {searchSupplier && filteredSuppliers.length > 0 && (
                          <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                            {filteredSuppliers.map((supplier) => (
                              <button
                                key={supplier.id}
                                onClick={() => {
                                  setSelectedSupplier(supplier);
                                  setSearchSupplier('');
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-sm"
                              >
                                {supplier.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setShowAddSupplier(true)}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>

                    {selectedSupplier && (
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-semibold">Selected:</span> {selectedSupplier.name}
                        </p>
                      </div>
                    )}

                    {errors.supplier && <p className="text-red-500 text-xs">{errors.supplier}</p>}
                  </div>
                ) : (
                  <div className="space-y-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                      placeholder="Supplier Name"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                      placeholder="Email"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      value={newSupplier.contact}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                      placeholder="Contact"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddSupplier(false)}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNewSupplier}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddItem}
                className="w-full px-6 py-3 border-2 border-gray-900 dark:border-white rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold flex items-center justify-center gap-2 mt-4 text-sm sm:text-base"
              >
                <Plus size={20} />
                Add item
              </button>
            </div>
          </div>

          {/* Right Side - Items List */}
          <div className="w-full lg:w-80 bg-gray-50 dark:bg-gray-700 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-600 overflow-y-auto flex flex-col max-h-[50vh] lg:max-h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Items ({items.length})</h3>
              {items.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total Qt: {items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              )}
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">No items added yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 p-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.itemName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Box: {item.boxName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Qty: {item.quantity}</p>
                        {item.serialGroups.map((group, idx) => (
                          <p key={idx} className="text-xs text-gray-500 dark:text-gray-500">
                            {group.supplierName}
                          </p>
                        ))}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 space-y-2">
              <button
                onClick={handleSubmit}
                disabled={items.length === 0}
                className="w-full px-6 py-3 border-2 border-gray-900 dark:border-white rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
              >
                Submit
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Delete Item"
        message="Are you sure you want to delete this item from the list?"
        onConfirm={confirmRemoveItem}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
      />
    </>
  );
};

// Main Component
const StockIn = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [dashboardEntries, setDashboardEntries] = useState<StockInDashboardEntry[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([
    { id: '1', name: 'Supplier A', email: 'supplier.a@example.com', contact: '+1234567890' },
    { id: '2', name: 'Supplier B', email: 'supplier.b@example.com', contact: '+1987654321' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockInDashboardEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 8;

  const handleAddItems = (items: StockInItem[], newSuppliers: SupplierInfo[]) => {
    setSuppliers(newSuppliers);

    const today = new Date().toISOString().split('T')[0];
    let updatedEntries = [...dashboardEntries];

    items.forEach((newItem) => {
      const existingIndex = updatedEntries.findIndex(
        (entry) =>
          entry.boxName === newItem.boxName &&
          entry.itemName === newItem.itemName &&
          entry.date === today
      );

      if (existingIndex !== -1) {
        // Update existing entry
        updatedEntries[existingIndex] = {
          ...updatedEntries[existingIndex],
          totalQuantity: updatedEntries[existingIndex].totalQuantity + newItem.quantity,
          serialGroups: updatedEntries[existingIndex].serialGroups.map((group) => {
            const matchingGroup = newItem.serialGroups.find((g) => g.supplierId === group.supplierId);
            if (matchingGroup) {
              return {
                ...group,
                serialNumbers: [...group.serialNumbers, ...matchingGroup.serialNumbers],
              };
            }
            return group;
          }).concat(
            newItem.serialGroups.filter(
              (newGroup) =>
                !updatedEntries[existingIndex].serialGroups.some((g) => g.supplierId === newGroup.supplierId)
            )
          ),
        };
      } else {
        // Add new entry
        updatedEntries.unshift({
          id: `entry-${Date.now()}-${Math.random()}`,
          boxName: newItem.boxName,
          itemName: newItem.itemName,
          date: today,
          totalQuantity: newItem.quantity,
          serialGroups: newItem.serialGroups,
          remarks: '',
        });
      }
    });

    setDashboardEntries(updatedEntries);
    setIsModalOpen(false);
  };

  const handleMoveFromViewModal = (selectedSerials: string[], location: string) => {
    if (!selectedItem) return;

    setDashboardEntries((prev) =>
      prev
        .map((e) => {
          if (e.id !== selectedItem.id) return e;

          return {
            ...e,
            totalQuantity: e.totalQuantity - selectedSerials.length,
            serialGroups: e.serialGroups
              .map((group) => ({
                ...group,
                serialNumbers: group.serialNumbers.filter((s) => !selectedSerials.includes(s)),
              }))
              .filter((group) => group.serialNumbers.length > 0),
          };
        })
        .filter((e) => e.totalQuantity > 0)
    );

    setSerialModalOpen(false);
  };

  const handleMoveFromDashboard = (removedSerials: Array<{ serial: string; itemName: string }>) => {
    setDashboardEntries((prev) => {
      let updated = [...prev];

      removedSerials.forEach(({ serial, itemName }) => {
        updated = updated.map((entry) => {
          if (entry.itemName !== itemName) return entry;

          return {
            ...entry,
            totalQuantity: entry.totalQuantity - 1,
            serialGroups: entry.serialGroups
              .map((group) => ({
                ...group,
                serialNumbers: group.serialNumbers.filter((s) => s !== serial),
              }))
              .filter((group) => group.serialNumbers.length > 0),
          };
        });
      });

      return updated.filter((e) => e.totalQuantity > 0);
    });
  };

  const handleUpdateRemarks = (remarks: string) => {
    if (!selectedItem) return;

    setDashboardEntries((prev) =>
      prev.map((entry) =>
        entry.id === selectedItem.id ? { ...entry, remarks } : entry
      )
    );

    setSelectedItem((prev) => (prev ? { ...prev, remarks } : null));
  };

  const handleDeleteEntry = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDeleteEntry = () => {
    if (deleteConfirm) {
      setDashboardEntries((prev) => prev.filter((entry) => entry.id !== deleteConfirm));
      setDeleteConfirm(null);
      setCurrentPage(1);
    }
  };

  const filteredEntries = useMemo(() => {
    return dashboardEntries.filter((entry) => {
      const matchesSearch =
        entry.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.boxName.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesDate = true;
      if (filterType === 'single' && dateFilter) {
        matchesDate = entry.date === dateFilter;
      } else if (filterType === 'range' && startDate && endDate) {
        matchesDate = entry.date >= startDate && entry.date <= endDate;
      }

      return matchesSearch && matchesDate;
    });
  }, [dashboardEntries, searchQuery, dateFilter, filterType, startDate, endDate]);

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getAllSerialNumbers = () => {
    return dashboardEntries.flatMap((entry) =>
      entry.serialGroups.flatMap((group) => group.serialNumbers)
    );
  };

  const getAllItemNames = () => {
    return Array.from(new Set(dashboardEntries.map((entry) => entry.itemName)));
  };

  return (
    <>
      <Head title="Stock In" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">STOCK IN</h1>
          </div>

            <div className="flex-1 overflow-hidden p-4 flex flex-col bg-gray-50 dark:bg-gray-900">
              {/* Search and Filter Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex gap-3 flex-col lg:flex-row items-end">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search Stock In Name"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-sm whitespace-nowrap"
                  >
                    Add Stock In
                  </button>
                  <button
                    onClick={() => setIsMoveModalOpen(true)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium text-sm whitespace-nowrap"
                  >
                    Move
                  </button>
                </div>

                <div className="flex gap-3 items-center flex-wrap">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="all"
                      checked={filterType === 'all'}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300">All</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="single"
                      checked={filterType === 'single'}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Single Date</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="range"
                      checked={filterType === 'range'}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Date Range</span>
                  </label>

                  {filterType === 'single' && (
                    <div className="flex gap-2 items-center ml-auto flex-wrap">
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => {
                          setDateFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        onClick={() => {
                          setDateFilter('');
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {filterType === 'range' && (
                    <div className="flex gap-2 items-center ml-auto flex-wrap">
                      <span className="text-gray-600 dark:text-gray-400 rounded text-sm">From:</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <span className="text-gray-600 dark:text-gray-400 rounded text-sm">To:</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full min-w-max">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                      <tr>
                        <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Date</th>
                        <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Item</th>
                        <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Qty</th>
                        <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hidden sm:table-cell">Remarks</th>
                        <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">S/N</th>
                        <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Act</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedEntries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No stock in entries found
                          </td>
                        </tr>
                      ) : (
                        paginatedEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap">
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm text-gray-900 dark:text-white font-medium truncate">{entry.itemName}</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-xs">
                                {entry.totalQuantity}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell truncate">{entry.remarks || '-'}</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm">
                              <button
                                onClick={() => {
                                  setSelectedItem(entry);
                                  setSerialModalOpen(true);
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium whitespace-nowrap"
                              >
                                View
                              </button>
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 text-xs">
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded px-1 sm:px-2 py-1 font-medium flex items-center gap-1 text-xs transition-colors whitespace-nowrap"
                              >
                                <Trash2 size={12} />
                                <span className="hidden sm:inline">Del</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 transition"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 sm:px-3 py-2 border-2 font-semibold rounded transition-colors text-sm ${
                            currentPage === page
                              ? 'border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                              : 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
        </main>

        {/* Add Stock In Modal */}
        <AddStockInModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddItems}
          suppliers={suppliers}
          allExistingSerials={getAllSerialNumbers()}
          allExistingItems={getAllItemNames()}
        />

        {/* Serial Number View Modal */}
        <SerialNumberViewModal
          isOpen={serialModalOpen}
          onClose={() => setSerialModalOpen(false)}
          entry={selectedItem}
          onMove={handleMoveFromViewModal}
          onUpdateRemarks={handleUpdateRemarks}
        />

        {/* Move Modal */}
        <MoveModal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          dashboardEntries={dashboardEntries}
          onMoveConfirm={handleMoveFromDashboard}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteConfirm !== null}
          title="Delete Entry"
          message="Are you sure you want to delete this stock in entry?"
          onConfirm={confirmDeleteEntry}
          onCancel={() => setDeleteConfirm(null)}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous
        />
      </SidebarProvider>
    </>
  );
};

export default StockIn;