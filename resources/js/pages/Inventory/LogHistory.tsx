import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search } from 'lucide-react';

interface LogHistoryEntry {
  id: string;
  date: string;        // ISO date string e.g. "2025-01-15"
  time: string;        // e.g. "14:32:00"
  itemName: string;
  serialNumber: string;
  from: string;        // source location / transaction
  to: string;          // destination location / transaction
  remarks: string;
}

interface LogHistoryProps {
  mainCategoryId: number;
  system: string;
}

const LogHistory: React.FC<LogHistoryProps> = ({ mainCategoryId, system }) => {
  const [entries, setEntries] = useState<LogHistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Derived unique "from" and "to" values for dropdowns
  const [fromOptions, setFromOptions] = useState<string[]>([]);
  const [toOptions, setToOptions] = useState<string[]>([]);

  const [itemsPerPage, setItemsPerPage] = useState(8);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const ROW_HEIGHT = useRef(57);
  const HEADER_HEIGHT = useRef(45);

  // Sorting
  const [sortDate, setSortDate] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortItem, setSortItem] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortSerial, setSortSerial] = useState<'none' | 'asc' | 'desc'>('none');

  const handleSortDate = () => { setSortDate(p => p === 'none' ? 'asc' : p === 'asc' ? 'desc' : 'none'); setSortItem('none'); setSortSerial('none'); setCurrentPage(1); };
  const handleSortItem = () => { setSortItem(p => p === 'none' ? 'asc' : p === 'asc' ? 'desc' : 'none'); setSortDate('none'); setSortSerial('none'); setCurrentPage(1); };
  const handleSortSerial = () => { setSortSerial(p => p === 'none' ? 'asc' : p === 'asc' ? 'desc' : 'none'); setSortDate('none'); setSortItem('none'); setCurrentPage(1); };

  const systemDisplayName = system.toUpperCase();

  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const thead = tableContainerRef.current.querySelector('thead');
        const firstRow = tableContainerRef.current.querySelector('tbody tr');
        if (thead) HEADER_HEIGHT.current = thead.clientHeight;
        if (firstRow) ROW_HEIGHT.current = firstRow.clientHeight;
        const availableHeight = containerHeight - HEADER_HEIGHT.current;
        setItemsPerPage(Math.max(1, Math.floor(availableHeight / ROW_HEIGHT.current)));
      }
    };
    requestAnimationFrame(calculateItemsPerPage);
    const resizeObserver = new ResizeObserver(calculateItemsPerPage);
    if (tableContainerRef.current) resizeObserver.observe(tableContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [loading]);

  useEffect(() => { fetchLogData(); }, [mainCategoryId]);

  const fetchLogData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/log-history/${mainCategoryId}`);
      const data: LogHistoryEntry[] = await response.json();
      setEntries(data);

      // Derive unique from/to options for filter dropdowns
      const froms = Array.from(new Set(data.map(e => e.from).filter(Boolean))).sort();
      const tos = Array.from(new Set(data.map(e => e.to).filter(Boolean))).sort();
      setFromOptions(froms);
      setToOptions(tos);
    } catch (error) {
      console.error('Error fetching log history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilterFrom('');
    setFilterTo('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const filteredEntries = useMemo(() => {
    let filtered = entries.filter((entry) => {
      const matchesSearch =
        entry.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFrom = filterFrom ? entry.from === filterFrom : true;
      const matchesTo = filterTo ? entry.to === filterTo : true;

      let matchesDate = true;
      if (startDate && endDate) matchesDate = entry.date >= startDate && entry.date <= endDate;
      else if (startDate) matchesDate = entry.date >= startDate;
      else if (endDate) matchesDate = entry.date <= endDate;

      return matchesSearch && matchesFrom && matchesTo && matchesDate;
    });

    if (sortDate !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aDateTime = new Date(`${a.date}T${a.time}`).getTime();
        const bDateTime = new Date(`${b.date}T${b.time}`).getTime();
        return sortDate === 'asc' ? aDateTime - bDateTime : bDateTime - aDateTime;
      });
    } else if (sortItem !== 'none') {
      filtered = [...filtered].sort((a, b) =>
        sortItem === 'asc' ? a.itemName.localeCompare(b.itemName) : b.itemName.localeCompare(a.itemName)
      );
    } else if (sortSerial !== 'none') {
      filtered = [...filtered].sort((a, b) =>
        sortSerial === 'asc' ? a.serialNumber.localeCompare(b.serialNumber) : b.serialNumber.localeCompare(a.serialNumber)
      );
    }

    return filtered;
  }, [entries, searchQuery, filterFrom, filterTo, startDate, endDate, sortDate, sortItem, sortSerial]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const hasActiveFilters = filterFrom || filterTo || startDate || endDate;

  if (loading) {
    return (
      <>
        <Head title={`Log History - ${systemDisplayName}`} />
        <SidebarProvider>
          <USHERSidebar system={system} />
          <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">LOG HISTORY - {systemDisplayName}</h1>
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
      <Head title={`Log History - ${systemDisplayName}`} />
      <SidebarProvider>
        <USHERSidebar system={system} />
        <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">
          <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">LOG HISTORY - {systemDisplayName}</h1>
          </div>

          <div className="flex-1 overflow-auto flex flex-col p-4 gap-4 bg-gray-50 dark:bg-gray-900">
            {/* Search & Filters */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">

              {/* Search bar */}
              <div className="flex gap-3 flex-col lg:flex-row items-end">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search item name or serial number"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                  />
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-2 rounded-full font-medium text-sm border border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Filter row */}
              <div className="flex gap-3 items-center flex-wrap">

                {/* From filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</span>
                  <select
                    value={filterFrom}
                    onChange={(e) => { setFilterFrom(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">All</option>
                    {fromOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* To filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</span>
                  <select
                    value={filterTo}
                    onChange={(e) => { setFilterTo(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">All</option>
                    {toOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range filter */}
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex-1 overflow-hidden" ref={tableContainerRef}>
                <table className="w-full h-full table-fixed">
                  <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button onClick={handleSortDate} className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase">
                          Date & Time <span>{sortDate === 'none' ? '↕' : sortDate === 'asc' ? '↑' : '↓'}</span>
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button onClick={handleSortItem} className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase">
                          Item Name <span>{sortItem === 'none' ? '↕' : sortItem === 'asc' ? '↑' : '↓'}</span>
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button onClick={handleSortSerial} className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase">
                          Serial # <span>{sortSerial === 'none' ? '↕' : sortSerial === 'asc' ? '↑' : '↓'}</span>
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">From</th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">To</th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEntries.length === 0 ? (
                      <tr className="h-full">
                        <td colSpan={6} className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                          No log history found
                        </td>
                      </tr>
                    ) : (
                      <>
                        {paginatedEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700">

                            {/* Date & Time */}
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white text-center">
                              <div className="font-medium">
                                {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {entry.time
                                  ? new Date(`1970-01-01T${entry.time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                                  : '—'}
                              </div>
                            </td>

                            {/* Item Name */}
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white font-medium text-center">
                              {entry.itemName}
                            </td>

                            {/* Serial Number */}
                            <td className="px-4 py-4 text-sm text-center">
                              <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono text-xs">
                                {entry.serialNumber || '—'}
                              </span>
                            </td>

                            {/* From */}
                            <td className="px-4 py-4 text-sm text-center">
                              <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-semibold text-xs">
                                {entry.from || '—'}
                              </span>
                            </td>

                            {/* To */}
                            <td className="px-4 py-4 text-sm text-center">
                              <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold text-xs">
                                {entry.to || '—'}
                              </span>
                            </td>

                            {/* Remarks */}
                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs truncate">
                              {entry.remarks || <span className="italic text-gray-400 dark:text-gray-600">—</span>}
                            </td>

                          </tr>
                        ))}
                        <tr className="h-full">
                          <td colSpan={6} className="border-b border-gray-200 dark:border-gray-700" />
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex-shrink-0 flex items-center justify-center gap-1 py-3 flex-wrap">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 border-2 border-gray-900 dark:border-gray-100 rounded text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >&lt;</button>
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
                    >{page}</button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 border-2 border-gray-900 dark:border-gray-100 rounded text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >&gt;</button>
              </div>
            )}
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default LogHistory;