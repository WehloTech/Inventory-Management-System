import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import ConsumableBatchLogModal from '@/components/modals/ConsumableBatchLogModal';
import { getCategoryColor } from '@/utils/categoryColors';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ConsumableItem {
  id: number;
  item_name: string;
  box_name: string;
  box_id: number;
  subcategory_id: number;
  supplier_name: string;
  supplier_id: number | null;
  quantity: number;
  main_category: string;
  updated_at: string;
}

interface ConsumableProps {
  mainCategoryId: number;
  system: string;
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
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
          <button onClick={onCancel} className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2 text-white rounded-full font-medium ${isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add Modal ────────────────────────────────────────────────────────────────
const AddModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  boxes: { id: number; box_name: string }[];
  suppliers: { id: string; name: string }[];
  prefill?: { boxId: string; itemName: string } | null;
  onSuccess: () => void;
}> = ({ isOpen, onClose, boxes, suppliers, prefill, onSuccess }) => {
  const [form, setForm] = useState({ boxId: '', itemName: '', quantity: 1, supplierId: '', remarks: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({
        boxId: prefill?.boxId ?? '',
        itemName: prefill?.itemName ?? '',
        quantity: 1,
        supplierId: '',
        remarks: '',
      });
      setError('');
    }
  }, [isOpen, prefill?.boxId, prefill?.itemName]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.boxId || !form.itemName || form.quantity < 1) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/consumable/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
        },
        body: JSON.stringify({
          boxId: form.boxId,
          itemName: form.itemName,
          quantity: Number(form.quantity),
          supplierId: form.supplierId || null,
          remarks: form.remarks || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? 'Failed to add item.'); return; }
      onSuccess();
      onClose();
    } catch { setError('Failed to add item.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Consumable Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Box <span className="text-red-400">*</span></label>
            {prefill?.boxId ? (
              <div className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                {boxes.find((b) => String(b.id) === String(prefill.boxId))?.box_name ?? prefill.boxId}
              </div>
            ) : (
              <select value={form.boxId} onChange={(e) => setForm({ ...form, boxId: e.target.value })}
                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select box...</option>
                {boxes.map((b) => <option key={b.id} value={b.id}>{b.box_name}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Item Name <span className="text-red-400">*</span></label>
            {prefill?.itemName ? (
              <div className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                {prefill.itemName}
              </div>
            ) : (
              <input type="text" placeholder="e.g. Ballpen, Bond Paper..."
                value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Quantity <span className="text-red-400">*</span></label>
            <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Supplier</label>
            <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Remarks</label>
            <textarea rows={2} placeholder="Optional notes..."
              value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors disabled:opacity-50">
              {submitting ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Deduct Modal ─────────────────────────────────────────────────────────────
const DeductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  item: ConsumableItem | null;
  onSuccess: () => void;
}> = ({ isOpen, onClose, item, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) { setQuantity(1); setRemarks(''); setError(''); }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async () => {
    if (quantity < 1) { setError('Quantity must be at least 1.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/consumable/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
        },
        body: JSON.stringify({ consumableItemId: item.id, quantity, remarks: remarks || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? 'Failed to deduct.'); return; }
      onSuccess();
      onClose();
    } catch { setError('Failed to deduct.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Deduct Quantity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{item.item_name}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Box: {item.box_name} · Current stock: <strong>{item.quantity}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Deduct Quantity <span className="text-red-400">*</span></label>
            <input type="number" min={1} max={item.quantity} value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Remarks</label>
            <textarea rows={2} placeholder="Reason for deduction..."
              value={remarks} onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-colors disabled:opacity-50">
              {submitting ? 'Saving...' : 'Deduct'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Action Dropdown ──────────────────────────────────────────────────────────
const ActionDropdown: React.FC<{
  onAdd: () => void;
  onDeduct: () => void;
  onLogs: () => void;
}> = ({ onAdd, onDeduct, onLogs }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-[72px] py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
      >
        Actions
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => { onAdd(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Qty
          </button>
          <button
            onClick={() => { onDeduct(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Deduct
          </button>
          <button
            onClick={() => { onLogs(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            View Logs
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ConsumableU: React.FC<ConsumableProps> = ({ mainCategoryId, system }) => {
  const [items, setItems] = useState<ConsumableItem[]>([]);
  const [boxes, setBoxes] = useState<{ id: number; box_name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [sortItem, setSortItem] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortQty, setSortQty] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortBox, setSortBox] = useState<'none' | 'asc' | 'desc'>('none');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [addPrefill, setAddPrefill] = useState<{ boxId: string; itemName: string } | null>(null);
  const [deductModal, setDeductModal] = useState(false);
  const [logModal, setLogModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: ConsumableItem | null }>({ open: false, item: null });
  const [selectedItem, setSelectedItem] = useState<ConsumableItem | null>(null);

  const systemDisplayName = system.toUpperCase();

  // Dynamic items per page
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const ROW_HEIGHT = useRef(57);
  const HEADER_HEIGHT = useRef(45);

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
    if (tableContainerRef.current) resizeObserver.observe(tableContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [loading]);

  useEffect(() => {
    fetchItems();
    fetchBoxes();
    fetchSuppliers();
  }, [mainCategoryId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/consumable/items/${mainCategoryId}`);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error('Failed to fetch consumables', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoxes = async () => {
    try {
      const res = await fetch(`/api/masterlist/boxes/${mainCategoryId}`);
      setBoxes(await res.json());
    } catch {}
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/stockin/suppliers');
      setSuppliers(await res.json());
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      await fetch(`/api/consumable/item/${deleteConfirm.item.id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '' },
      });
      setDeleteConfirm({ open: false, item: null });
      fetchItems();
    } catch (e) { console.error('Delete failed', e); }
  };

  // Sort handlers
  const handleSortItem = () => { setSortItem(p => p === 'none' ? 'asc' : p === 'asc' ? 'desc' : 'none'); setSortQty('none'); setSortBox('none'); setCurrentPage(1); };
  const handleSortQty = () => { setSortQty(p => p === 'none' ? 'asc' : p === 'asc' ? 'desc' : 'none'); setSortItem('none'); setSortBox('none'); setCurrentPage(1); };
  const handleSortBox = () => { setSortBox(p => p === 'none' ? 'asc' : p === 'asc' ? 'desc' : 'none'); setSortItem('none'); setSortQty('none'); setCurrentPage(1); };

  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) =>
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.box_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortItem !== 'none') {
      filtered = [...filtered].sort((a, b) => sortItem === 'asc' ? a.item_name.localeCompare(b.item_name) : b.item_name.localeCompare(a.item_name));
    } else if (sortQty !== 'none') {
      filtered = [...filtered].sort((a, b) => sortQty === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity);
    } else if (sortBox !== 'none') {
      filtered = [...filtered].sort((a, b) => sortBox === 'asc' ? a.box_name.localeCompare(b.box_name) : b.box_name.localeCompare(a.box_name));
    }

    return filtered;
  }, [items, searchQuery, sortItem, sortQty, sortBox]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const colSpan = system === 'shared' ? 6 : 5;

  if (loading) {
    return (
      <>
        <Head title={`Consumable - ${systemDisplayName}`} />
        <SidebarProvider>
          <USHERSidebar system={system} />
          <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">CONSUMABLE - {systemDisplayName}</h1>
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
      <Head title={`Consumable - ${systemDisplayName}`} />
      <SidebarProvider>
        <USHERSidebar system={system} />
        <main className="flex-1 w-full h-screen overflow-hidden flex flex-col">

          {/* Fixed header */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">CONSUMABLE - {systemDisplayName}</h1>
          </div>

          <div className="flex-1 overflow-auto flex flex-col p-4 gap-4 bg-gray-50 dark:bg-gray-900">

            {/* Search + Add Bar */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search item name or box..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                  />
                </div>
                <button
                  onClick={() => { setAddPrefill(null); setAddModal(true); }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-sm whitespace-nowrap"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* Table card */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex-1 overflow-hidden" ref={tableContainerRef}>
                <table className="w-full h-full table-fixed">
                  <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button onClick={handleSortItem} className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase">
                          Item Name <span>{sortItem === 'none' ? '↕' : sortItem === 'asc' ? '↑' : '↓'}</span>
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button onClick={handleSortBox} className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase">
                          Box <span>{sortBox === 'none' ? '↕' : sortBox === 'asc' ? '↑' : '↓'}</span>
                        </button>
                      </th>
                      {system === 'shared' && (
                        <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Inventory</th>
                      )}
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Supplier</th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                        <button onClick={handleSortQty} className="flex items-center justify-center gap-1 w-full hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase">
                          Quantity <span>{sortQty === 'none' ? '↕' : sortQty === 'asc' ? '↑' : '↓'}</span>
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedItems.length === 0 ? (
                      <tr className="h-full">
                        <td colSpan={colSpan} className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
                          No consumable items found
                        </td>
                      </tr>
                    ) : (
                      <>
                        {paginatedItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700">
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white font-medium text-center">{item.item_name}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white text-center">{item.box_name}</td>
                            {system === 'shared' && (
                              <td className="px-4 py-4 text-sm text-center">
                                <span className={`px-2.5 py-0.5 ${getCategoryColor(item.main_category)} rounded-full font-semibold text-xs`}>
                                  {item.main_category}
                                </span>
                              </td>
                            )}
                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">{item.supplier_name}</td>
                            <td className="px-4 py-4 text-sm text-center">
                              <span className={`px-2.5 py-0.5 rounded-full font-semibold text-xs ${
                                item.quantity === 0
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                  : item.quantity <= 5
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              }`}>
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Actions Dropdown */}
                                <ActionDropdown
                                  onAdd={() => { setAddPrefill({ boxId: String(item.box_id), itemName: item.item_name }); setAddModal(true); }}
                                  onDeduct={() => { setSelectedItem(item); setDeductModal(true); }}
                                  onLogs={() => { setSelectedItem(item); setLogModal(true); }}
                                />
                                {/* Delete */}
                                <button
                                  onClick={() => setDeleteConfirm({ open: true, item })}
                                  className="w-[72px] py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr className="h-full">
                          <td colSpan={colSpan} className="border-b border-gray-200 dark:border-gray-700" />
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
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                  className="px-2.5 py-1.5 border-2 border-gray-900 dark:border-gray-100 rounded text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs">
                  &lt;
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`px-2.5 py-1.5 border-2 font-semibold rounded transition-colors text-xs ${
                        currentPage === page
                          ? 'border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                          : 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}>
                      {page}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 border-2 border-gray-900 dark:border-gray-100 rounded text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs">
                  &gt;
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Modals */}
        <AddModal
          isOpen={addModal}
          onClose={() => setAddModal(false)}
          boxes={boxes}
          suppliers={suppliers}
          prefill={addPrefill}
          onSuccess={fetchItems}
        />

        <DeductModal
          isOpen={deductModal}
          onClose={() => setDeductModal(false)}
          item={selectedItem}
          onSuccess={fetchItems}
        />

        <ConsumableBatchLogModal
          isOpen={logModal}
          onClose={() => setLogModal(false)}
          item={selectedItem}
          onUpdateRemarks={() => {}}
        />

        <ConfirmDialog
          isOpen={deleteConfirm.open}
          title="Delete Item"
          message={`Are you sure you want to delete "${deleteConfirm.item?.item_name}"? This will also remove all its logs.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm({ open: false, item: null })}
          confirmText="Delete"
          isDangerous
        />

      </SidebarProvider>
    </>
  );
};

export default ConsumableU;