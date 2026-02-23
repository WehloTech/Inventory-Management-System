import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, PackageSearch } from 'lucide-react';
import { PasscodeGate } from './PasscodeGate';

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
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
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
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 font-bold transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-full font-bold transition-all shadow-lg active:scale-95 ${
              isDangerous ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
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
    'IN_STOCK': 'Stock in',
    'IN_USE': 'In use',
    'STOCK_OUT': 'Stock out',
    'DAMAGED': 'Damage',
    'DAMAGE': 'Damage',
  };

  const currentLabel = currentStatus ? statusMap[currentStatus] : null;

  const options = [
    { label: 'Stock in', value: 'Stock in' },
    { label: 'In use', value: 'In use' },
    { label: 'Stock out', value: 'Stock out' },
    { label: 'Damage', value: 'Damage' },
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
  const [passcodeVerified, setPasscodeVerified] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dashboardEntries, setDashboardEntries] = useState<StockInDashboardEntry[]>([]);
  const [searchItem, setSearchItem] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<StockInDashboardEntry | null>(null);
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());
  const [location, setLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [boxesForSubcategory, setBoxesForSubcategory] = useState<{ id: number; name: string }[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [searchBox, setSearchBox] = useState('');
  const [showBoxDropdown, setShowBoxDropdown] = useState(false);

  const destinationOptions = getDestinationOptions(currentStatus);
  const isDamageSelected = location === 'Damage';
  const isRemarksEmpty = !remarks.trim();

  const handleClose = () => {
    setPasscodeVerified(false);
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
    onClose();
  };

  useEffect(() => {
    if (isOpen && passcodeVerified) {
      fetchStockInItems();
    } else if (!isOpen) {
      setPasscodeVerified(false);
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
  }, [isOpen, passcodeVerified, mainCategoryId]);

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
      const response = await fetch(`/api/stockin/subcategory-boxes/${encodeURIComponent(subcategoryName)}/${mainCategoryId}`);
      const data = await response.json();
      const boxes = Array.isArray(data) ? data : [];
      setBoxesForSubcategory(boxes);
      if (boxes.length > 0) setShowBoxDropdown(true);
    } catch (error) {
      console.error('Error fetching boxes:', error);
      setBoxesForSubcategory([]);
    }
  };

  if (!isOpen) return null;

  // ── Show PasscodeGate first ──
  if (!passcodeVerified) {
    return (
      <PasscodeGate
        actionName="move items"
        onSuccess={() => setPasscodeVerified(true)}
        onCancel={handleClose}
      />
    );
  }

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
    if (location === 'Stock in' && !selectedBoxId) return;
    if (isDamageSelected && isRemarksEmpty) return;
    setShowConfirm(true);
  };

  const handleConfirmMove = async () => {
    try {
      setLoading(true);
      const statusMap: Record<string, string> = {
        'Stock in': 'IN_STOCK',
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
          boxId: location === 'Stock in' ? selectedBoxId : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to move items');

      onMoveSuccess();
      handleClose();
    } catch (error) {
      console.error(error);
      alert('Failed to move items');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const selectedBoxName = boxesForSubcategory.find((b) => b.id === selectedBoxId)?.name || '';
  const filteredBoxes = boxesForSubcategory.filter((b) =>
    b.name != null && b.name.toLowerCase().includes(searchBox.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => step === 1 ? handleClose() : setStep((step - 1) as 1 | 2 | 3)}
              disabled={loading}
              className="flex items-center gap-2 text-white font-bold bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-full transition-all active:scale-95 disabled:opacity-50"
            >
              <ArrowLeft size={18} strokeWidth={3} />
              Back
            </button>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Move</h2>
            <div className="w-20" />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading && <div className="text-center py-12 text-slate-500 font-bold animate-pulse">Processing...</div>}

            {/* Step 1: Item Search */}
            {!loading && step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Search Item</label>
                  <input
                    type="text"
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full px-5 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                {filteredItems.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                    <PackageSearch className="text-slate-300 dark:text-slate-700 mb-4" size={48} strokeWidth={1.5} />
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No current items found</p>
                  </div>
                ) : (
                  <div className="border-2 border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredItems.map((itemName) => (
                      <button
                        key={itemName}
                        onClick={() => handleSelectItem(itemName)}
                        className="w-full text-left px-5 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-200 font-bold transition-all flex items-center justify-between group"
                      >
                        {itemName}
                        <span className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">Select →</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Serial Selection */}
            {!loading && step === 2 && selectedEntry && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Active Item</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{selectedEntry.itemName}</span>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Serials</label>
                  
                  {selectedEntry.serialGroups.length === 0 ||
                   selectedEntry.serialGroups.every(g => g.serialNumbers.length === 0) ? (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                      <AlertCircle className="text-amber-500 mb-4" size={48} strokeWidth={1.5} />
                      <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No available units to move</p>
                      <button
                        onClick={() => setStep(1)}
                        className="mt-4 text-blue-500 text-xs font-black uppercase hover:underline"
                      >
                        ← Choose a different item
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl max-h-60 overflow-y-auto bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedEntry.serialGroups.flatMap((group) =>
                          group.serialNumbers.map((item, idx) => (
                            <label key={idx} className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                              <input
                                type="checkbox"
                                checked={selectedSerials.has(item.serial)}
                                onChange={() => handleToggleSerial(item.serial)}
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <p className="font-bold text-slate-900 dark:text-white">{item.serial}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Box: {item.boxName}</p>
                              </div>
                            </label>
                          ))
                        )}
                      </div>

                      <button
                        onClick={() => setStep(3)}
                        disabled={selectedSerials.size === 0}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                      >
                        NEXT STEP
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Destination & Remarks */}
            {!loading && step === 3 && selectedEntry && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                  <span className="font-bold text-blue-700 dark:text-blue-300">Items Selected</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-black">{selectedSerials.size}</span>
                </div>

                {isDamageSelected && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
                      You are marking these items as DAMAGED. This status usually flags items as unusable. Please provide details.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-2 block">Destination</label>
                    <select
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setSelectedBoxId(null);
                        if (e.target.value === 'Stock in') fetchBoxesForSubcategory(selectedEntry.itemName);
                      }}
                      className="w-full p-3.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none"
                    >
                      <option value="">Select destination...</option>
                      {destinationOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  {location === 'Stock in' && (
                    <div className="relative">
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-2 block">Assign Box <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={selectedBoxId ? selectedBoxName : searchBox}
                        onChange={(e) => { setSearchBox(e.target.value); setShowBoxDropdown(true); }}
                        onFocus={() => setShowBoxDropdown(true)}
                        placeholder="Search box..."
                        readOnly={!!selectedBoxId}
                        className="w-full p-3.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none"
                      />
                      {selectedBoxId && (
                        <button onClick={() => { setSelectedBoxId(null); setSearchBox(''); }} className="absolute right-4 top-10 text-slate-400">×</button>
                      )}
                      {showBoxDropdown && !selectedBoxId && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 max-h-40 overflow-y-auto">
                          {filteredBoxes.map((box) => (
                            <button key={box.id} onClick={() => { setSelectedBoxId(box.id); setShowBoxDropdown(false); }} className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm">
                              {box.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-2 block">
                      Remarks {isDamageSelected && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder={isDamageSelected ? "Explain the damage details here..." : "Any additional notes?"}
                      rows={3}
                      className={`w-full p-4 border-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none transition-all ${
                        isDamageSelected && isRemarksEmpty ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleMoveClick}
                  disabled={!location || selectedSerials.size === 0 || (location === 'Stock in' && !selectedBoxId) || (isDamageSelected && isRemarksEmpty)}
                  className={`w-full py-4 rounded-xl font-black text-white transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 ${
                    isDamageSelected ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' : 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                  }`}
                >
                  {isDamageSelected ? 'CONFIRM DAMAGE STATUS' : 'PROCEED WITH MOVE'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title={isDamageSelected ? "Confirm Damage Flag" : "Final Confirmation"}
        isDangerous={isDamageSelected}
        message={`You are moving ${selectedSerials.size} unit(s) to "${location}". Are you sure you want to update these records?`}
        onConfirm={handleConfirmMove}
        onCancel={() => setShowConfirm(false)}
        confirmText={isDamageSelected ? "Confirm Damage" : "Move Items"}
      />
    </>
  );
};