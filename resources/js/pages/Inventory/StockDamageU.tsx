import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, ArrowLeft } from 'lucide-react';
import SerialBatchViewModal, { SerialBatchEntry } from '@/components/modals/SerialBatchViewModal';

interface SerialNumberGroup {
  serialNumbers: { serial: string; boxName: string; batchTime: string }[];
  supplierId: string;
  supplierName: string;
}

interface StockDamageDashboardEntry {
  id: string;
  boxName: string;
  itemName: string;
  date: string;
  totalQuantity: number;
  serialGroups: SerialNumberGroup[];
  remarks: string;
  batchRemarks: Record<string, string>;  // ADD THIS

}

interface StockDamageProps {
  mainCategoryId: number;
  system: string;
}

// Main Component
const StockDamage: React.FC<StockDamageProps> = ({ mainCategoryId, system }) => {
  const [dashboardEntries, setDashboardEntries] = useState<StockDamageDashboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockDamageDashboardEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Dynamic items per page — mirrors MasterList approach
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const ROW_HEIGHT = useRef(57);
  const HEADER_HEIGHT = useRef(45);

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

  const systemDisplayName = system.toUpperCase();

  // Dynamic items per page based on container height
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const thead = tableContainerRef.current.querySelector('thead');
        const firstRow = tableContainerRef.current.querySelector('tbody tr');
        if (thead) HEADER_HEIGHT.current = thead.clientHeight;
        if (firstRow) ROW_HEIGHT.current = firstRow.clientHeight;
        const availableHeight = containerHeight - HEADER_HEIGHT.current;
        const rows = Math.floor(availableHeight / ROW_HEIGHT.current);
        setItemsPerPage(Math.max(1, rows));
      }
    };

    requestAnimationFrame(calculateItemsPerPage);

    const resizeObserver = new ResizeObserver(calculateItemsPerPage);
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [loading]);

  useEffect(() => {
    fetchDashboardData();
  }, [mainCategoryId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stockdamage/dashboard/${mainCategoryId}`);
      const data = await response.json();
      setDashboardEntries(data);
    } catch (error) {
      console.error('Error fetching stock damage dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBatchRemarks = async (batchTime: string, remarks: string, batchSerials: string[]) => {
    if (!selectedItem) return;
    try {
      const response = await fetch('/api/stockdamage/update-remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumbers: batchSerials, remarks }),
      });
      if (response.ok) {
        setDashboardEntries(prev =>
          prev.map(entry =>
            entry.id === selectedItem.id
              ? { ...entry, batchRemarks: { ...entry.batchRemarks, [batchTime]: remarks } }
              : entry
          )
        );
        setSelectedItem(prev =>
          prev ? { ...prev, batchRemarks: { ...prev.batchRemarks, [batchTime]: remarks } } : null
        );
      }
    } catch (error) { console.error('Error updating remarks:', error); }
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

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <>
        <Head title={`Stock Damage - ${systemDisplayName}`} />
        <SidebarProvider>
          <USHERSidebar system={system} />
          <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">DAMAGED - {systemDisplayName}</h1>
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
      <Head title={`Stock Damage - ${systemDisplayName}`} />
      <SidebarProvider>
        <USHERSidebar system={system} />
        <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">

          {/* Fixed header */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">DAMAGED - {systemDisplayName}</h1>
          </div>

          <div className="flex-1 overflow-auto flex flex-col p-4 gap-4 bg-gray-50 dark:bg-gray-900">

            {/* Search and Filter Bar */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex gap-3 flex-col lg:flex-row items-end">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search Damaged Item"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                  />
                </div>
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

            {/* Table card */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex-1 overflow-hidden" ref={tableContainerRef}>
                <table className="w-full h-full table-fixed">
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
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Serial #</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedEntries.length === 0 ? (
                      <tr className="h-full">
                        <td colSpan={4} className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                          No damaged entries found
                        </td>
                      </tr>
                    ) : (
                      <>
                        {paginatedEntries.map((entry) => (
                          <tr
                            key={entry.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                          >
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white font-medium text-center">
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white font-medium text-center">{entry.itemName}</td>
                            <td className="px-4 py-4 text-sm text-center">
                              <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-semibold text-xs">
                                {entry.totalQuantity}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-center">
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
                        ))}
                        {/* Filler row that stretches to fill remaining space */}
                        <tr className="h-full">
                          <td colSpan={4} className="border-b border-gray-200 dark:border-gray-700" />
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination — outside the table card */}
            {totalPages > 1 && (
              <div className="flex-shrink-0 flex items-center justify-center gap-1 py-3 flex-wrap">
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
        </main>

        <SerialBatchViewModal
          isOpen={serialModalOpen}
          onClose={() => setSerialModalOpen(false)}
          entry={selectedItem as SerialBatchEntry | null}
          onUpdateBatchRemarks={handleUpdateBatchRemarks}
        />
      </SidebarProvider>
    </>
  );
};

export default StockDamage;