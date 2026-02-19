import React, { useState, useMemo, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Plus, Trash2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { AddStockInModal } from '@/components/modals/AddStockInModal';
import { MoveModal } from '@/components/modals/MoveModal';

interface SupplierInfo {
  id: string;
  name: string;
  email: string;
  contact: string;
}

interface StockInSerialGroup {
  serialNumbers: string[];
  supplierId: string;
  supplierName: string;
}

interface SerialNumberGroup {
  serialNumbers: { serial: string; boxName: string }[];
  supplierId: string;
  supplierName: string;
}

interface StockInItem {
  id: string;
  boxId: number;
  boxName: string;
  itemName: string;
  quantity: number;
  serialGroups: StockInSerialGroup[];
  remarks: string;
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

interface StockInProps {
  mainCategoryId: number;
  system: string;
}

// Confirmation Dialog (unchanged from first code)
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

// Serial Number View Modal — design from second code, data shape from first code
const SerialNumberViewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  entry: StockInDashboardEntry | null;
  onUpdateRemarks: (remarks: string) => void;
}> = ({ isOpen, onClose, entry, onUpdateRemarks }) => {
  const [remarks, setRemarks] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  React.useEffect(() => {
    if (isOpen && entry) {
      setRemarks(entry.remarks || '');
      setCurrentPage(1);
    }
  }, [entry?.id, isOpen]);

  if (!isOpen || !entry) return null;

  // First code data shape: serialNumbers is { serial, boxName }[]
  const allSerials = entry.serialGroups.flatMap((group) =>
    group.serialNumbers.map((item) => ({
      serial: item.serial,
      boxName: item.boxName,
      supplier: group.supplierName,
    }))
  );

  const totalPages = Math.ceil(allSerials.length / ITEMS_PER_PAGE);
  const paginatedSerials = allSerials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSaveRemarks = () => {
    onUpdateRemarks(remarks);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-300 dark:border-gray-700 flex-shrink-0 gap-2 flex-wrap">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white font-bold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition whitespace-nowrap text-sm"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center flex-1">
            Serial #
          </h2>
          <div className="w-20" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Item Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Item: {entry.itemName}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Date:{' '}
                {new Date(entry.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
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
                    <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">#</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Serial #</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Box</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSerials.map((item, idx) => (
                    <tr key={`${entry.id}-${item.serial}-${idx}`} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${idx < paginatedSerials.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                      <td className="px-3 sm:px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-gray-900 dark:text-white font-medium">{item.serial}</td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-gray-900 dark:text-white">
                        <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">{item.boxName}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-gray-900 dark:text-white">{item.supplier}</td>
                    </tr>
                  ))}
                  {/* Filler rows — keep modal height consistent across pages */}
                  {Array.from({ length: ITEMS_PER_PAGE - paginatedSerials.length }).map((_, idx) => (
                    <tr key={`empty-${idx}`}>
                      <td className="px-3 sm:px-6 py-3 text-sm">&nbsp;</td>
                      <td className="px-3 sm:px-6 py-3 text-sm">&nbsp;</td>
                      <td className="px-3 sm:px-6 py-3 text-sm">&nbsp;</td>
                      <td className="px-3 sm:px-6 py-3 text-sm">&nbsp;</td>
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
      </div>
    </div>
  );
};

// Main Component
const StockIn: React.FC<StockInProps> = ({ mainCategoryId, system }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [dashboardEntries, setDashboardEntries] = useState<StockInDashboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockInDashboardEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<StockInDashboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // Sorting states (from second code design)
  const [sortDate, setSortDate] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortItem, setSortItem] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortQuantity, setSortQuantity] = useState<'none' | 'asc' | 'desc'>('none');

  const handleSortDate = () => {
    setSortDate(prev => prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none');
    setSortItem('none');
    setSortQuantity('none');
    setCurrentPage(1);
  };

  const handleSortItem = () => {
    setSortItem(prev => prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none');
    setSortDate('none');
    setSortQuantity('none');
    setCurrentPage(1);
  };

  const handleSortQuantity = () => {
    setSortQuantity(prev => prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none');
    setSortDate('none');
    setSortItem('none');
    setCurrentPage(1);
  };

  const ITEMS_PER_PAGE = 8;
  const systemDisplayName = system.toUpperCase();

  // Fetch dashboard data on mount (original API logic)
  useEffect(() => {
    fetchDashboardData();
  }, [mainCategoryId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stockin/dashboard/${mainCategoryId}`);
      const data = await response.json();
      setDashboardEntries(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItems = async (items: StockInItem[]) => {
    try {
      const response = await fetch('/api/stockin/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        await fetchDashboardData();
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to stock in items');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to stock in items');
    }
  };

  const handleMoveFromViewModal = async (selectedSerials: string[], location: string) => {
    if (!selectedItem) return;

    try {
      const statusMap: Record<string, string> = {
        'In use': 'IN_USE',
        'Stock out': 'STOCK_OUT',
        'Damage': 'DAMAGED',
      };

      const response = await fetch('/api/stockin/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumbers: selectedSerials,
          status: statusMap[location],
          remarks: null,
        }),
      });

      if (response.ok) {
        await fetchDashboardData();
        setSerialModalOpen(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to move items');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to move items');
    }
  };

  const handleMoveSuccess = () => {
    fetchDashboardData();
  };

  const handleUpdateRemarks = async (remarks: string) => {
    if (!selectedItem) return;

    try {
      const allSerials = selectedItem.serialGroups.flatMap(g => g.serialNumbers.map(s => s.serial));

      const response = await fetch('/api/stockin/update-remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumbers: allSerials, remarks }),
      });

      if (response.ok) {
        setDashboardEntries((prev) =>
          prev.map((entry) =>
            entry.id === selectedItem.id ? { ...entry, remarks } : entry
          )
        );
        setSelectedItem((prev) => (prev ? { ...prev, remarks } : null));
      }
    } catch (error) {
      console.error('Error updating remarks:', error);
    }
  };

  const handleDeleteEntry = (entry: StockInDashboardEntry) => {
    setDeleteConfirm(entry);
  };

  const confirmDeleteEntry = async () => {
    if (!deleteConfirm) return;

    try {
      const allSerials = deleteConfirm.serialGroups.flatMap(g => g.serialNumbers.map(s => s.serial));

      const response = await fetch('/api/stockin/entry', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumbers: allSerials }),
      });

      if (response.ok) {
        await fetchDashboardData();
        setDeleteConfirm(null);

        const newFilteredCount = dashboardEntries.length - 1;
        const newTotalPages = Math.ceil(newFilteredCount / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  const filteredEntries = useMemo(() => {
    let filtered = dashboardEntries.filter((entry) => {
      const matchesSearch = entry.itemName.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesDate = true;
      if (filterType === 'single' && dateFilter) {
        matchesDate = entry.date === dateFilter;
      } else if (filterType === 'range' && startDate && endDate) {
        matchesDate = entry.date >= startDate && entry.date <= endDate;
      }

      return matchesSearch && matchesDate;
    });

    // Apply sorting
    if (sortDate !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDate === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortItem !== 'none') {
      filtered = [...filtered].sort((a, b) =>
        sortItem === 'asc'
          ? a.itemName.localeCompare(b.itemName)
          : b.itemName.localeCompare(a.itemName)
      );
    } else if (sortQuantity !== 'none') {
      filtered = [...filtered].sort((a, b) =>
        sortQuantity === 'asc'
          ? a.totalQuantity - b.totalQuantity
          : b.totalQuantity - a.totalQuantity
      );
    }

    return filtered;
  }, [dashboardEntries, searchQuery, dateFilter, filterType, startDate, endDate, sortDate, sortItem, sortQuantity]);

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <>
        <Head title={`Stock In - ${systemDisplayName}`} />
        <SidebarProvider>
          <USHERSidebar system={system} />
          <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">STOCK IN - {systemDisplayName}</h1>
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
      <Head title={`Stock In - ${systemDisplayName}`} />
      <SidebarProvider>
        <USHERSidebar system={system} />
        {/* h-screen + overflow-hidden locks the page — nothing can scroll */}
        <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">

          {/* Fixed header */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">STOCK IN - {systemDisplayName}</h1>
          </div>

          {/* Remaining area — single flex column, no overflow */}
          <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4 bg-gray-50 dark:bg-gray-900">

            {/* Search and Filter Bar — fixed height */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">
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
                  className="px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 bg-blue-900 text-white border border-blue-900 hover:bg-blue-800 active:bg-blue-950 whitespace-nowrap text-sm"
                >
                  <Plus size={18} />
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
                  <input type="radio" value="all" checked={filterType === 'all'} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="w-4 h-4" />
                  <span className="text-gray-700 dark:text-gray-300">All</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="single" checked={filterType === 'single'} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="w-4 h-4" />
                  <span className="text-gray-700 dark:text-gray-300">Single Date</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="range" checked={filterType === 'range'} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="w-4 h-4" />
                  <span className="text-gray-700 dark:text-gray-300">Date Range</span>
                </label>

                {filterType === 'single' && (
                  <div className="flex gap-2 items-center ml-auto flex-wrap">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <button onClick={() => { setDateFilter(''); setCurrentPage(1); }} className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm">Clear</button>
                  </div>
                )}

                {filterType === 'range' && (
                  <div className="flex gap-2 items-center ml-auto flex-wrap">
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">From:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">To:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <button onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }} className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm">Clear</button>
                  </div>
                )}
              </div>
            </div>

            {/* Table card — fills remaining height, no internal scroll */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">

              {/* Table area */}
              <div className="flex-1 overflow-hidden">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button onClick={handleSortDate} className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase">
                          Date <span>{sortDate === 'none' ? '↕' : sortDate === 'asc' ? '↑' : '↓'}</span>
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button onClick={handleSortItem} className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase">
                          Item Name <span>{sortItem === 'none' ? '↕' : sortItem === 'asc' ? '↑' : '↓'}</span>
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button onClick={handleSortQuantity} className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase">
                          Quantity <span>{sortQuantity === 'none' ? '↕' : sortQuantity === 'asc' ? '↑' : '↓'}</span>
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Remarks</th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Serial #</th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                          No stock in entries found
                        </td>
                      </tr>
                    ) : (
                      <>
                        {paginatedEntries.map((entry, index) => (
                          <tr
                            key={entry.id}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index < paginatedEntries.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                          >
                            <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-white font-medium text-center">
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-white font-medium text-center">{entry.itemName}</td>
                            <td className="px-4 py-3.5 text-sm text-center">
                              <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-xs">
                                {entry.totalQuantity}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 text-center">{entry.remarks || '-'}</td>
                            <td className="px-4 py-3.5 text-sm text-center">
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
                            <td className="px-4 py-3.5 text-sm text-center">
                              <button
                                onClick={() => handleDeleteEntry(entry)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded font-medium transition-colors text-xs"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {/* Filler rows keep table height consistent */}
                        {Array.from({ length: ITEMS_PER_PAGE - paginatedEntries.length }).map((_, idx) => (
                          <tr key={`empty-${idx}`}>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                            <td className="px-4 py-3.5 text-sm text-center">&nbsp;</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination — pinned to bottom inside the card */}
              {totalPages > 1 && (
                <div className="flex-shrink-0 flex items-center justify-center gap-1 py-3 border-t border-gray-200 dark:border-gray-700 flex-wrap">
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

          </div>
        </main>

        {/* Add Stock In Modal (original component) */}
        <AddStockInModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddItems}
          mainCategoryId={mainCategoryId}
        />

        {/* Serial Number View Modal */}
        <SerialNumberViewModal
          isOpen={serialModalOpen}
          onClose={() => setSerialModalOpen(false)}
          entry={selectedItem}
          onUpdateRemarks={handleUpdateRemarks}
        />

        {/* Move Modal (original component) */}
        <MoveModal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          mainCategoryId={mainCategoryId}
          onMoveSuccess={handleMoveSuccess}
          currentStatus="IN_STOCK"
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteConfirm !== null}
          title="Delete Stock In Entry"
          message={`Are you sure you want to delete this stock in entry? This will permanently delete ${deleteConfirm?.totalQuantity || 0} item(s) and all associated data. This action cannot be undone.`}
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