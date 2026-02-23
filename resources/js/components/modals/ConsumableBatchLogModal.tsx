import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export interface ConsumableLogEntry {
  id: number;
  action_type: 'ADD' | 'DEDUCT';
  quantity: number;
  remarks: string;
  date: string; // ISO string
}

export interface ConsumableBatchItem {
  id: number;
  item_name: string;
  box_name: string;
  supplier_name: string;
  quantity: number; // current stock
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ConsumableBatchItem | null;
  onUpdateRemarks: (logId: number, remarks: string) => void;
}

const ITEMS_PER_PAGE = 5;

const ConsumableBatchLogModal: React.FC<Props> = ({
  isOpen,
  onClose,
  item,
  onUpdateRemarks,
}) => {
  const [logs, setLogs] = useState<ConsumableLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [remarksMap, setRemarksMap] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Fetch logs when modal opens
  useEffect(() => {
    if (isOpen && item) {
      fetchLogs();
    }
  }, [isOpen, item?.id]);

  // Reset page when selected log changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLogId]);

  const fetchLogs = async () => {
    if (!item) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/consumable/logs/${item.id}`);
      const data: ConsumableLogEntry[] = await res.json();
      setLogs(data);

      // Pre-fill remarks map
      const map: Record<number, string> = {};
      data.forEach((log) => { map[log.id] = log.remarks ?? ''; });
      setRemarksMap(map);

      // Auto-select first log
      if (data.length > 0) setSelectedLogId(data[0].id);
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  const selectedLog = logs.find((l) => l.id === selectedLogId) ?? null;
  const selectedIndex = logs.findIndex((l) => l.id === selectedLogId);

  // For the "table" we show a single row per log entry (quantity-based, no serials)
  // But we paginate the logs list itself
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const paginatedLogs = logs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const handleSaveRemarks = async (logId: number) => {
    setSavingId(logId);
    try {
      await fetch('/api/consumable/update-remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '' },
        body: JSON.stringify({ logId, remarks: remarksMap[logId] ?? '' }),
      });
      onUpdateRemarks(logId, remarksMap[logId] ?? '');
    } catch {
      // handle silently
    } finally {
      setSavingId(null);
    }
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
            Batch Logs
          </h2>
          <div className="w-20" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* Item Info Card */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Item</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{item.item_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Box: {item.box_name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Current Stock</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{item.quantity}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">units</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 text-sm py-10">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">No logs yet for this item.</div>
          ) : (
            <>
              {/* Batch Selector + Remarks */}
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 space-y-3">

                {/* Prev / Selector / Next */}
                <div className="flex items-center gap-2">
                  {logs.length > 1 && (
                    <button
                      onClick={() => setSelectedLogId(logs[selectedIndex - 1].id)}
                      disabled={selectedIndex === 0}
                      className="px-2.5 py-2 text-xs font-bold border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      ←
                    </button>
                  )}

                  <select
                    value={selectedLogId ?? ''}
                    onChange={(e) => setSelectedLogId(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {logs.map((log) => (
                      <option key={log.id} value={log.id}>
                        {log.action_type === 'ADD' ? '➕' : '➖'} {formatDate(log.date)} {formatTime(log.date)} — {log.action_type} {log.quantity}
                      </option>
                    ))}
                  </select>

                  {logs.length > 1 && (
                    <button
                      onClick={() => setSelectedLogId(logs[selectedIndex + 1].id)}
                      disabled={selectedIndex === logs.length - 1}
                      className="px-2.5 py-2 text-xs font-bold border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      →
                    </button>
                  )}
                </div>

                {/* Selected batch summary */}
                {selectedLog && (
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      selectedLog.action_type === 'ADD'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {selectedLog.action_type === 'ADD' ? '+' : '−'} {selectedLog.quantity} units
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(selectedLog.date)} at {formatTime(selectedLog.date)}
                    </span>
                  </div>
                )}

                {/* Remarks */}
                {selectedLog && (
                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                      Remarks
                    </label>
                    <textarea
                      value={remarksMap[selectedLog.id] ?? ''}
                      onChange={(e) =>
                        setRemarksMap((prev) => ({ ...prev, [selectedLog.id]: e.target.value }))
                      }
                      placeholder="Add remarks…"
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    />
                    <button
                      onClick={() => handleSaveRemarks(selectedLog.id)}
                      disabled={savingId === selectedLog.id}
                      className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm font-medium transition"
                    >
                      {savingId === selectedLog.id ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {/* All Logs Table */}
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">

                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">All Transactions</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                    {logs.length} entries
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">#</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Qty</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLogs.map((log, idx) => {
                        const isSelected = log.id === selectedLogId;
                        return (
                          <tr
                            key={log.id}
                            onClick={() => setSelectedLogId(log.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            } ${idx < paginatedLogs.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                          >
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                log.action_type === 'ADD'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {log.action_type === 'ADD' ? '+ ADD' : '− DEDUCT'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                              {log.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              {formatDate(log.date)}
                              <span className="block text-xs text-gray-400">{formatTime(log.date)}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[160px] truncate">
                              {log.remarks || <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Empty rows to keep height stable */}
                      {Array.from({ length: ITEMS_PER_PAGE - paginatedLogs.length }).map((_, idx) => (
                        <tr key={`empty-${idx}`}>
                          {Array.from({ length: 5 }).map((__, col) => (
                            <td key={col} className="px-4 py-3 text-sm">&nbsp;</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 gap-2 flex-wrap">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumableBatchLogModal;