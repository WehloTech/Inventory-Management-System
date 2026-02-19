import React, { useState, useMemo, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

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

interface StockOutDashboardEntry {
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

// Serial Number View Modal - Original structure with pagination + Move button
const SerialNumberViewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  date: string;
  quantity: number;
  remarks: string;
  serialGroups: SerialNumberGroup[];
  onMove: (selectedSerials: string[]) => void;
  onRemarksChange: (newRemarks: string) => void;
}> = ({ isOpen, onClose, itemName, date, quantity, remarks, serialGroups, onMove, onRemarksChange }) => {
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [localRemarks, setLocalRemarks] = useState(remarks);
  const ITEMS_PER_PAGE = 5;

  // Update local remarks when modal opens with new data
  useEffect(() => {
    setLocalRemarks(remarks);
  }, [remarks, isOpen]);

  if (!isOpen) return null;

  // Flatten all serials with their suppliers
  const allSerials = serialGroups.flatMap((group) =>
    group.serialNumbers.map((serial) => ({
      serial,
      supplier: group.supplierName,
    }))
  );

  const totalPages = Math.ceil(allSerials.length / ITEMS_PER_PAGE);
  const paginatedSerials = allSerials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleSerial = (serial: string) => {
    const updated = new Set(selectedSerials);
    if (updated.has(serial)) {
      updated.delete(serial);
    } else {
      updated.add(serial);
    }
    setSelectedSerials(updated);
  };

  const handleMove = () => {
    if (selectedSerials.size > 0) {
      // Save remarks before moving
      onRemarksChange(localRemarks);
      onMove(Array.from(selectedSerials));
      setSelectedSerials(new Set());
      setCurrentPage(1);
    } else {
      alert('Please select at least one serial number');
    }
  };

  const handleClose = () => {
    // Save remarks when closing
    onRemarksChange(localRemarks);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-300 dark:border-gray-700">
          <button 
            onClick={handleClose} 
            className="flex items-center gap-2 text-white font-bold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="flex-1" />
          <button 
            onClick={handleMove}
            disabled={selectedSerials.size === 0}
            className="px-6 py-2 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            MOVE ({selectedSerials.size})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Item Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Item name: {itemName}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                Date: {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">Quantity: {quantity}</p>
            </div>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Remark:</p>
              <textarea
                value={localRemarks}
                onChange={(e) => setLocalRemarks(e.target.value)}
                placeholder="Add remarks..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            </div>
          </div>

          {/* Serial Numbers Table with Pagination */}
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white w-12">✓</th>
                  <th className="px-6 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">Serial #</th>
                  <th className="px-6 py-3 text-center text-sm font-bold text-gray-900 dark:text-white border-l-2 border-gray-300 dark:border-gray-600">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-300 dark:divide-gray-600">
                {paginatedSerials.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedSerials.has(item.serial)}
                        onChange={() => handleToggleSerial(item.serial)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-white text-center font-medium">{item.serial}</td>
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-white text-center border-l-2 border-gray-300 dark:border-gray-600">{item.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                >
                  &lt;
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-xs rounded font-medium transition ${
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
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-gray-300 dark:border-gray-700 flex justify-between">
        </div>
      </div>
    </div>
  );
};

// Move Modal - Original structure with confirmation
const MoveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  dashboardEntries: StockOutDashboardEntry[];
  onMoveConfirm: (removedSerials: Array<{ serial: string; itemName: string }>) => void;
}> = ({ isOpen, onClose, dashboardEntries, onMoveConfirm }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchItem, setSearchItem] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<StockOutDashboardEntry | null>(null);
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());
  const [location, setLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const uniqueItems = Array.from(new Set(dashboardEntries.map((e) => e.itemName)));
  const filteredItems = uniqueItems.filter((item) => item.toLowerCase().includes(searchItem.toLowerCase()));

  const handleSelectItem = (entry: StockOutDashboardEntry) => {
    setSelectedEntry(entry);
    setSelectedSerials(new Set());
    setStep(2);
  };

  const handleToggleSerial = (serial: string) => {
    const updated = new Set(selectedSerials);
    if (updated.has(serial)) {
      updated.delete(serial);
    } else {
      updated.add(serial);
    }
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
      
      // Reset
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-gray-300 dark:border-gray-700">
            <button
              onClick={() => {
                if (step === 1) {
                  onClose();
                } else {
                  setStep((step - 1) as 1 | 2 | 3);
                }
              }}
              className="flex items-center gap-2 text-white font-bold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Move</h2>
            <div className="w-32" />
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {step === 1 && (
              <>
                {/* Item Name Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Item Name:</label>
                  <input
                    type="text"
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                    placeholder="Raspberry Pi"
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Items Dropdown */}
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
                {/* Item Name Display */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Item Name:</label>
                  <input
                    type="text"
                    value={selectedEntry.itemName}
                    disabled
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* SN Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">SN:</label>
                  <input
                    type="text"
                    placeholder="Enter you serial number"
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Serial Numbers List */}
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

                <button
                  onClick={() => setStep(3)}
                  disabled={selectedSerials.size === 0}
                  className="w-full px-6 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </>
            )}

            {step === 3 && selectedEntry && (
              <>
                {/* Total Quantity */}
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Total Quantity: {selectedSerials.size}</p>
                </div>

                {/* Move to Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Move to:</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select location</option>
                    <option value="In use">In use</option>
                    <option value="Stock in">Stock in</option>
                    <option value="Damage">Damage</option>
                  </select>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Remarks:</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks..."
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* List of Items */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">List of item:</label>
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 max-h-32 overflow-y-auto">
                    {selectedSerials.size > 0 ? (
                      Array.from(selectedSerials).map((serial, idx) => (
                        <p key={idx} className="text-sm text-gray-900 dark:text-white">
                          {selectedEntry.itemName}-{serial}
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
                  className="w-full px-6 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Move Confirm
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Move */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Move"
        message={`Are you sure you want to move ${selectedSerials.size} item(s) to ${location}?`}
        onConfirm={handleConfirmMove}
        onCancel={() => setShowConfirm(false)}
        confirmText="Move"
        cancelText="Cancel"
      />
    </>
  );
};

// Main Component
const StockOut = () => {
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [dashboardEntries, setDashboardEntries] = useState<StockOutDashboardEntry[]>([
    // Sample data for demonstration
    {
      id: 'entry-1',
      boxName: 'Box A',
      itemName: 'Raspberry Pi 4',
      date: '2026-02-10',
      totalQuantity: 5,
      serialGroups: [
        {
          serialNumbers: ['RPI001', 'RPI002', 'RPI003', 'RPI006', 'RPI007', 'RPI008'],
          supplierId: '1',
          supplierName: 'Supplier A',
        },
        {
          serialNumbers: ['RPI004', 'RPI005'],
          supplierId: '2',
          supplierName: 'Supplier B',
        },
      ],
      remarks: 'For project deployment',
    },
    {
      id: 'entry-2',
      boxName: 'Box B',
      itemName: 'Arduino Uno',
      date: '2026-02-09',
      totalQuantity: 3,
      serialGroups: [
        {
          serialNumbers: ['ARD001', 'ARD002', 'ARD003'],
          supplierId: '1',
          supplierName: 'Supplier A',
        },
      ],
      remarks: '',
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockOutDashboardEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const handleMoveFromViewModal = (selectedSerials: string[]) => {
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

    alert(`${selectedSerials.length} item(s) moved successfully`);
    setSerialModalOpen(false);
  };

  const handleRemarksChange = (newRemarks: string) => {
    if (!selectedItem) return;

    setDashboardEntries((prev) =>
      prev.map((e) => {
        if (e.id !== selectedItem.id) return e;
        return {
          ...e,
          remarks: newRemarks,
        };
      })
    );
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

    alert(`${removedSerials.length} item(s) moved successfully`);
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

  return (
    <>
      <Head title="Stock Out" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">STOCK OUT</h1>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-4 flex flex-col bg-gray-50 dark:bg-gray-900">
              {/* Search and Filter Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex gap-3 flex-col lg:flex-row items-end">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search Stock Out Name"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                    />
                  </div>
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
                    <div className="flex gap-2 items-center ml-auto">
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
                    <div className="flex gap-2 items-center ml-auto">
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">From:</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">To:</span>
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
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Date</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Item name</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Remarks</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Serial #</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedEntries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No stock out entries found
                          </td>
                        </tr>
                      ) : (
                        paginatedEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium text-center">
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium text-center">{entry.itemName}</td>
                            <td className="px-6 py-4 text-sm text-center">
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                                {entry.totalQuantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-center">{entry.remarks || '-'}</td>
                            <td className="px-6 py-4 text-sm text-center">
                              <button
                                onClick={() => {
                                  setSelectedItem(entry);
                                  setSerialModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded font-medium transition-colors text-xs"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                View
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
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Serial Number View Modal */}
        <SerialNumberViewModal
          isOpen={serialModalOpen}
          onClose={() => setSerialModalOpen(false)}
          itemName={selectedItem?.itemName || ''}
          date={selectedItem?.date || ''}
          quantity={selectedItem?.totalQuantity || 0}
          remarks={selectedItem?.remarks || ''}
          serialGroups={selectedItem?.serialGroups || []}
          onMove={handleMoveFromViewModal}
          onRemarksChange={handleRemarksChange}
        />

        {/* Move Modal */}
        <MoveModal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          dashboardEntries={dashboardEntries}
          onMoveConfirm={handleMoveFromDashboard}
        />
      </SidebarProvider>
    </>
  );
};

export default StockOut;