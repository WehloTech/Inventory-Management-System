import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Box as BoxIcon, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingCart,
  Hash,
  MessageSquare
} from 'lucide-react';

interface Box {
  id: number;
  name: string;
}

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
  boxId: number;
  boxName: string;
  itemName: string;
  quantity: number;
  serialGroups: SerialNumberGroup[];
  remarks: string;
}

interface AddStockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: StockInItem[]) => void;
  mainCategoryId: number;
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDangerous ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
            {isDangerous ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{message}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3.5 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-all text-xs uppercase tracking-widest">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-3.5 text-white rounded-2xl font-bold transition-all active:scale-95 text-xs uppercase tracking-widest shadow-lg ${isDangerous ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AddStockInModal: React.FC<AddStockInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mainCategoryId,
}) => {
  const [items, setItems] = useState<StockInItem[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [existingItems, setExistingItems] = useState<string[]>([]);
  const [allExistingSerials, setAllExistingSerials] = useState<string[]>([]);

  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [searchBox, setSearchBox] = useState('');
  const [showBoxDropdown, setShowBoxDropdown] = useState(false);
  const [itemName, setItemName] = useState('');
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [serialNumbers, setSerialNumbers] = useState<string[]>(['']);
  const [remarks, setRemarks] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierInfo | null>(null);
  const [searchSupplier, setSearchSupplier] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', contact: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBoxes();
      fetchSuppliers();
      fetchExistingItems();
      fetchAllSerials();
    }
  }, [isOpen, mainCategoryId]);

  const fetchBoxes = async () => {
    try {
      const response = await fetch(`/api/masterlist/boxes/${mainCategoryId}`);
      const data = await response.json();
      setBoxes(data.map((box: any) => ({ id: box.id, name: box.box_name })));
    } catch (e) { console.error(e); }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/stockin/suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (e) { console.error(e); }
  };

  const fetchExistingItems = async () => {
    try {
      const response = await fetch(`/api/stockin/items/${mainCategoryId}`);
      const data = await response.json();
      setExistingItems(data);
    } catch (e) { console.error(e); }
  };

  const fetchAllSerials = async () => {
    try {
      const response = await fetch('/api/stockin/serials');
      const data = await response.json();
      setAllExistingSerials(data);
    } catch (e) { console.error(e); }
  };

  const filteredBoxes = boxes.filter(box => box.name.toLowerCase().includes(searchBox.toLowerCase()));
  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchSupplier.toLowerCase()));
  const filteredItems = itemName.trim() ? existingItems.filter(i => i.toLowerCase().includes(itemName.toLowerCase())) : [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // STRICT VALIDATION: Check all inputs
    if (!selectedBox) newErrors.boxName = 'Box is required';
    if (!itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!quantity || parseInt(quantity) <= 0) newErrors.quantity = 'Quantity is required';
    if (!remarks.trim()) newErrors.remarks = 'Remarks are required';
    if (!selectedSupplier) newErrors.supplier = 'Supplier is required';

    const validSerials = serialNumbers.slice(0, parseInt(quantity || '0')).filter(s => s.trim());
    if (validSerials.length !== parseInt(quantity || '0')) {
      newErrors.serials = `All ${quantity} serial numbers are required`;
    }

    const duplicates = validSerials.filter(s => allExistingSerials.includes(s));
    if (duplicates.length > 0) newErrors.serials = `Duplicate serials found: ${duplicates.join(', ')}`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (!validateForm()) return;
    const qty = parseInt(quantity);
    const validSerials = serialNumbers.slice(0, qty).filter(s => s.trim());

    const newItem: StockInItem = {
      id: `item-${Date.now()}`,
      boxId: selectedBox!.id,
      boxName: selectedBox!.name,
      itemName,
      quantity: qty,
      remarks,
      serialGroups: [{ serialNumbers: validSerials, supplierId: selectedSupplier!.id, supplierName: selectedSupplier!.name }],
    };

    setItems([...items, newItem]);
    
    // Reset Form
    setSelectedBox(null); setItemName(''); setQuantity(''); setSerialNumbers(['']); setRemarks(''); setSelectedSupplier(null); setErrors({});
  };

  const handleSerialChange = (index: number, value: string) => {
    const newSerials = [...serialNumbers];
    newSerials[index] = value;
    setSerialNumbers(newSerials);
  };

  const handleAddNewSupplier = async () => {
    if (!newSupplier.name.trim() || !newSupplier.email.trim() || !newSupplier.contact.trim()) return;
    try {
      const response = await fetch('/api/stockin/supplier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier),
      });
      if (response.ok) {
        const data = await response.json();
        const created = { id: data.data.id.toString(), name: data.data.name, email: data.data.email, contact: data.data.contact_number };
        setSuppliers([...suppliers, created]);
        setSelectedSupplier(created);
        setShowAddSupplier(false);
        setNewSupplier({ name: '', email: '', contact: '' });
      }
    } catch (e) { console.error(e); }
  };

  const confirmRemoveItem = () => {
    if (deleteConfirm) {
      setItems(items.filter(i => i.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const handleSubmit = () => {
    if (items.length === 0) return;
    onSubmit(items);
    setItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[94vh] overflow-hidden flex flex-col lg:flex-row border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Left Side: Form */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
            <div className="flex items-center justify-between mb-10">
              <button onClick={onClose} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full hover:bg-blue-600 hover:text-white transition-all active:scale-90">
                <ArrowLeft size={20} strokeWidth={3} />
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Stock Entry</h2>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mt-1 italic">Validation Required</p>
              </div>
              <div className="w-10" />
            </div>

            <div className="space-y-8">
              {/* Box & Item Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <BoxIcon size={12} /> Destination Box <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedBox ? selectedBox.name : searchBox}
                      onChange={(e) => { setSearchBox(e.target.value); setShowBoxDropdown(true); }}
                      onFocus={() => setShowBoxDropdown(true)}
                      placeholder="Search container..."
                      readOnly={!!selectedBox}
                      className={`w-full px-6 py-4 border-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-bold focus:outline-none transition-all ${errors.boxName ? 'border-red-500 bg-red-50/10' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500'}`}
                    />
                    {selectedBox && <button onClick={() => { setSelectedBox(null); setSearchBox(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">×</button>}
                    {showBoxDropdown && !selectedBox && filteredBoxes.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-20 max-h-48 overflow-y-auto">
                        {filteredBoxes.map(box => (
                          <button key={box.id} onClick={() => { setSelectedBox(box); setShowBoxDropdown(false); }} className="w-full text-left px-5 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-bold text-sm">{box.name}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <ShoppingCart size={12} /> Item Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => { setItemName(e.target.value); setShowItemSuggestions(true); }}
                      placeholder="Type Item Name..."
                      className={`w-full px-6 py-4 border-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-bold focus:outline-none transition-all ${errors.itemName ? 'border-red-500 bg-red-50/10' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500'}`}
                    />
                    {showItemSuggestions && filteredItems.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border rounded-2xl shadow-2xl z-20 overflow-hidden">
                        {filteredItems.map(i => <button key={i} onMouseDown={() => { setItemName(i); setShowItemSuggestions(false); }} className="w-full text-left px-5 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-bold text-xs">{i}</button>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity & Serials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Hash size={12} /> Units <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setQuantity(val.toString());
                      if (val > serialNumbers.length) setSerialNumbers([...serialNumbers, ...Array(val - serialNumbers.length).fill('')]);
                    }}
                    placeholder="0"
                    className={`w-full px-6 py-4 border-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-black text-2xl outline-none transition-all ${errors.quantity ? 'border-red-500' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serial Identifiers <span className="text-red-500">*</span></label>
                  <div className={`border-2 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-950/10 max-h-[140px] overflow-y-auto space-y-2 custom-scrollbar transition-all ${errors.serials ? 'border-red-500 bg-red-50/5' : 'border-slate-100 dark:border-slate-800'}`}>
                    {serialNumbers.slice(0, parseInt(quantity || '0')).map((sn, idx) => (
                      <input key={idx} value={sn} onChange={(e) => handleSerialChange(idx, e.target.value)} placeholder={`SN #${idx + 1}`} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                    ))}
                    {!quantity || parseInt(quantity) === 0 ? <p className="text-center py-6 text-[10px] font-black text-slate-300 uppercase italic">Input units above</p> : null}
                  </div>
                  {errors.serials && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.serials}</p>}
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <MessageSquare size={12} /> Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Required: Specific details about this stock-in..."
                  className={`w-full px-6 py-4 border-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-bold outline-none transition-all resize-none ${errors.remarks ? 'border-red-500' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500'}`}
                  rows={2}
                />
              </div>

              {/* Supplier Section */}
              <div className="pt-4 space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <User size={12} /> Supplier <span className="text-red-500">*</span>
                </label>
                {!showAddSupplier ? (
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchSupplier}
                        onChange={(e) => setSearchSupplier(e.target.value)}
                        placeholder="Search vendors..."
                        className={`w-full px-6 py-4 border-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-sm font-bold focus:border-blue-500 outline-none transition-all ${errors.supplier ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'}`}
                      />
                      {searchSupplier && filteredSuppliers.length > 0 && (
                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-30 max-h-40 overflow-y-auto">
                          {filteredSuppliers.map(s => <button key={s.id} onMouseDown={() => { setSelectedSupplier(s); setSearchSupplier(''); }} className="w-full text-left px-5 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-bold text-sm border-b last:border-0 dark:border-slate-700">{s.name}</button>)}
                        </div>
                      )}
                    </div>
                    <button onClick={() => setShowAddSupplier(true)} className="px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all">New</button>
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-blue-500/30 rounded-3xl space-y-4 bg-blue-500/5 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} placeholder="Shop Name *" className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold" />
                      <input type="email" value={newSupplier.email} onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })} placeholder="Email *" className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold" />
                    </div>
                    <div className="flex gap-3">
                      <input type="text" value={newSupplier.contact} onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })} placeholder="Contact Number *" className="flex-1 p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold" />
                      <button onClick={() => setShowAddSupplier(false)} className="px-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                      <button onClick={handleAddNewSupplier} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20">Add</button>
                    </div>
                  </div>
                )}
                {selectedSupplier && <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl animate-in zoom-in-95"><CheckCircle2 size={16} className="text-green-500" /><span className="text-xs font-black text-green-700 dark:text-green-400 uppercase">{selectedSupplier.name} Linked</span></div>}
              </div>

              <button
                onClick={handleAddItem}
                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
              >
                <Plus size={22} strokeWidth={4} />
                Add Item
              </button>
            </div>
          </div>

          {/* Right Side: Manifest Sidebar */}
          <div className="w-full lg:w-[400px] bg-slate-50 dark:bg-slate-950 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800">
            <div className="p-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <div className="mt-6 flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Qty</p>
                 <p className="text-sm font-black text-blue-600 dark:text-blue-400">{items.reduce((s, i) => s + i.quantity, 0)} Units</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                  <BoxIcon size={48} strokeWidth={1} className="mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Empty</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="group bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative transition-all hover:shadow-lg animate-in slide-in-from-right-4">
                    <button onClick={() => setDeleteConfirm(item.id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Trash2 size={12} strokeWidth={3} /></button>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start pb-2 border-b border-slate-50 dark:border-slate-800">
                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-[13px]">{item.itemName}</p>
                        <span className="text-blue-600 font-black text-[13px]">x{item.quantity}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[9px] font-black text-slate-400 uppercase">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{item.boxName}</span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md max-w-[120px] truncate">{item.serialGroups[0].supplierName}</span>
                      </div>
                      <p className="text-[10px] italic text-slate-400 leading-tight line-clamp-2">"{item.remarks}"</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <button
                onClick={handleSubmit}
                disabled={items.length === 0}
                className="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-3xl shadow-xl shadow-green-500/20 active:scale-95 transition-all uppercase tracking-widest text-[11px]"
              >
                Submit All Entries
              </button>
              <button onClick={onClose} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Remove Asset"
        message="This will remove the entry from your current session."
        onConfirm={confirmRemoveItem}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Remove"
        cancelText="Cancel"
        isDangerous
      />
    </>
  );
};