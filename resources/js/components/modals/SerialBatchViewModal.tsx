import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, Pencil, X } from 'lucide-react';

export interface SerialBatchEntry {
  id: string;
  itemName: string;
  date: string;
  totalQuantity: number;
  serialGroups: {
    serialNumbers: {
      serial: string;
      boxName: string;
      batchTime: string;
      fromStatus: string | null;
    }[];
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

const FromBadge: React.FC<{ status: string | null }> = ({ status }) => {
  if (!status) return <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>;

  const styles: Record<string, string> = {
    IN_STOCK:  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    IN_USE:    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    STOCK_OUT: 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300',
    DAMAGED:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  const labels: Record<string, string> = {
    IN_STOCK:  'Stock In',
    IN_USE:    'In Use',
    STOCK_OUT: 'Stock Out',
    DAMAGED:   'Damaged',
  };

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  );
};

const SerialBatchViewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  entry,
  onUpdateBatchRemarks,
}) => {
  const [selectedBatchTime, setSelectedBatchTime] = useState<string>('');
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Which batch is currently in edit mode
  const [editingBatch, setEditingBatch] = useState<string | null>(null);
  // Draft value while editing (separate from committed value)
  const [draftRemarks, setDraftRemarks] = useState('');
  // Save state per batch: 'saving' | 'saved'
  const [saveStateMap, setSaveStateMap] = useState<Record<string, 'saving' | 'saved'>>({});

  useEffect(() => {
    if (isOpen && entry) {
      const times = getUniqueBatchTimes(entry);
      setSelectedBatchTime(times[0] ?? '');
      setRemarksMap({ ...entry.batchRemarks });
      setEditingBatch(null);
      setDraftRemarks('');
      setSaveStateMap({});
      setCurrentPage(1);
    }
  }, [entry?.id, isOpen]);

  // Cancel edit mode when switching batch
  useEffect(() => {
    setEditingBatch(null);
    setDraftRemarks('');
    setCurrentPage(1);
  }, [selectedBatchTime]);

  if (!isOpen || !entry) return null;

  function getUniqueBatchTimes(e: SerialBatchEntry) {
    return Array.from(
      new Set(e.serialGroups.flatMap((g) => g.serialNumbers.map((s) => s.batchTime)))
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  const allSerials = entry.serialGroups.flatMap((group) =>
    group.serialNumbers.map((item) => ({
      serial: item.serial,
      boxName: item.boxName,
      batchTime: item.batchTime,
      fromStatus: item.fromStatus,
      supplier: group.supplierName,
    }))
  );

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

  const handleStartEdit = (batchTime: string) => {
    setEditingBatch(batchTime);
    setDraftRemarks(remarksMap[batchTime] ?? '');
    // Clear saved indicator when re-entering edit
    setSaveStateMap((prev) => {
      const next = { ...prev };
      delete next[batchTime];
      return next;
    });
  };

  const handleCancelEdit = () => {
    setEditingBatch(null);
    setDraftRemarks('');
  };

  const handleSave = async (batchTime: string) => {
    setSaveStateMap((prev) => ({ ...prev, [batchTime]: 'saving' }));
    await onUpdateBatchRemarks(batchTime, draftRemarks, batchSerialNumbers);
    setRemarksMap((prev) => ({ ...prev, [batchTime]: draftRemarks }));
    setSaveStateMap((prev) => ({ ...prev, [batchTime]: 'saved' }));
    setEditingBatch(null);
    setDraftRemarks('');
  };

  const isEditingCurrent = editingBatch === selectedBatchTime;
  const isSaving = saveStateMap[selectedBatchTime] === 'saving';
  const isSaved  = saveStateMap[selectedBatchTime] === 'saved';
  const currentRemarks = remarksMap[selectedBatchTime] ?? '';

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

          {/* Item info card */}
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
                  <option key={time} value={time}>{formatTime(time)}</option>
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

            {/* ── Remarks ── */}
            {selectedBatchTime && (
              <div className="space-y-1.5">

                {/* Label row */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Remarks
                  </label>

                  {/* Edit button — only shown when NOT editing */}
                  {!isEditingCurrent && (
                    <button
                      onClick={() => handleStartEdit(selectedBatchTime)}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                    >
                      <Pencil size={11} />
                      Edit
                    </button>
                  )}
                </div>

                {/* READ-ONLY display */}
                {!isEditingCurrent && (
                  <div
                    className={`w-full min-h-[52px] px-2.5 py-2 rounded border text-sm
                      ${isSaved
                        ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                  >
                    <span className={currentRemarks ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500 italic'}>
                      {currentRemarks || 'No remarks'}
                    </span>
                    {isSaved && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400 font-semibold">
                        <Check size={11} /> Saved
                      </span>
                    )}
                  </div>
                )}

                {/* EDIT mode */}
                {isEditingCurrent && (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      value={draftRemarks}
                      onChange={(e) => setDraftRemarks(e.target.value)}
                      placeholder="Add remarks…"
                      rows={3}
                      disabled={isSaving}
                      className="w-full px-2.5 py-2 border-2 border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none text-sm disabled:opacity-50 transition"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave(selectedBatchTime)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-xs font-bold transition"
                      >
                        {isSaving
                          ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                          : <><Check size={12} /> Save</>
                        }
                      </button>
                      {!isSaving && (
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs font-bold transition"
                        >
                          <X size={12} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}

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
                    <th className="px-3 sm:px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">From</th>
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
                      <td className="px-3 sm:px-6 py-3 text-sm"><FromBadge status={item.fromStatus} /></td>
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
                      <td className="px-3 sm:px-6 py-3 text-sm">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 gap-2 flex-wrap">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 text-sm">&lt;</button>
                <div className="flex gap-1 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`px-2 py-1 text-xs rounded font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{page}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 text-sm">&gt;</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SerialBatchViewModal;