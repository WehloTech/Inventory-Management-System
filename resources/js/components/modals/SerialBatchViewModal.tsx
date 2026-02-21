import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export interface SerialBatchEntry {
  id: string;
  itemName: string;
  date: string;
  totalQuantity: number;
  serialGroups: {
    serialNumbers: { serial: string; boxName: string; batchTime: string }[];
    supplierId: string;
    supplierName: string;
  }[];
  batchRemarks: Record<string, string>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entry: SerialBatchEntry | null;
  onUpdateBatchRemarks: (batchTime: string, remarks: string, batchSerials: string[]) => void;
}

const ITEMS_PER_PAGE = 5;

const SerialBatchViewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  entry,
  onUpdateBatchRemarks,
}) => {
  const [selectedBatchTime, setSelectedBatchTime] = useState<string>('');
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isOpen && entry) {
      const times = getUniqueBatchTimes(entry);
      setSelectedBatchTime(times[0] ?? '');
      setRemarksMap({ ...entry.batchRemarks });
      setCurrentPage(1);
    }
  }, [entry?.id, isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBatchTime]);

  if (!isOpen || !entry) return null;

  const allSerials = entry.serialGroups.flatMap((group) =>
    group.serialNumbers.map((item) => ({
      serial: item.serial,
      boxName: item.boxName,
      batchTime: item.batchTime,
      supplier: group.supplierName,
    }))
  );

  function getUniqueBatchTimes(e: SerialBatchEntry) {
    return Array.from(
      new Set(e.serialGroups.flatMap((g) => g.serialNumbers.map((s) => s.batchTime)))
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  const batchTimes = getUniqueBatchTimes(entry);
  const batchSerials = allSerials.filter((s) => s.batchTime === selectedBatchTime);
  const batchSerialNumbers = batchSerials.map((s) => s.serial);
  const selectedBatchIndex = batchTimes.indexOf(selectedBatchTime);

  const totalPages = Math.ceil(batchSerials.length / ITEMS_PER_PAGE);
  const paginatedSerials = batchSerials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* Item info — polished card */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Item</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.itemName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{entry.totalQuantity}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">units</p>
            </div>
          </div>

          {/* Time Selector + Remarks */}
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 space-y-3">

            {/* Time dropdown + prev/next */}
            <div className="flex items-center gap-2">
              {batchTimes.length > 1 && (
                <button
                  onClick={() => setSelectedBatchTime(batchTimes[selectedBatchIndex - 1])}
                  disabled={selectedBatchIndex === 0}
                  className="px-2.5 py-2 text-xs font-bold border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ←
                </button>
              )}
              <select
                value={selectedBatchTime}
                onChange={(e) => setSelectedBatchTime(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {batchTimes.map((time) => (
                  <option key={time} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>
              {batchTimes.length > 1 && (
                <button
                  onClick={() => setSelectedBatchTime(batchTimes[selectedBatchIndex + 1])}
                  disabled={selectedBatchIndex === batchTimes.length - 1}
                  className="px-2.5 py-2 text-xs font-bold border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  →
                </button>
              )}
            </div>

            {/* Remarks */}
            {selectedBatchTime && (
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                  Remarks
                </label>
                <textarea
                  value={remarksMap[selectedBatchTime] ?? ''}
                  onChange={(e) =>
                    setRemarksMap((prev) => ({ ...prev, [selectedBatchTime]: e.target.value }))
                  }
                  placeholder="Add remarks…"
                  rows={2}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
                <button
                  onClick={() =>
                    onUpdateBatchRemarks(
                      selectedBatchTime,
                      remarksMap[selectedBatchTime] ?? '',
                      batchSerialNumbers
                    )
                  }
                  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Serials table */}
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">

            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {selectedBatchTime ? formatTime(selectedBatchTime) : '—'}
              </span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                {batchSerials.length} items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">#</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Serial #</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Box</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSerials.map((item, idx) => (
                    <tr
                      key={`${item.serial}-${idx}`}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${idx < paginatedSerials.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                    >
                      <td className="px-3 sm:px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-gray-900 dark:text-white font-medium">{item.serial}</td>
                      <td className="px-3 sm:px-6 py-3 text-sm">
                        <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">{item.boxName}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-gray-900 dark:text-white">{item.supplier}</td>
                    </tr>
                  ))}
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
                      className={`px-2 py-1 text-xs rounded font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
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

export default SerialBatchViewModal;