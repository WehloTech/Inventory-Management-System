import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-start gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
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

  // Form fields
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [searchBox, setSearchBox] = useState('');
  const [showBoxDropdown, setShowBoxDropdown] = useState(false);
  
  const [itemName, setItemName] = useState('');
  const [searchItemName, setSearchItemName] = useState('');
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

  // Fetch data when modal opens
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
    } catch (error) {
      console.error('Error fetching boxes:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/stockin/suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchExistingItems = async () => {
    try {
      const response = await fetch(`/api/stockin/items/${mainCategoryId}`);
      const data = await response.json();
      setExistingItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchAllSerials = async () => {
    try {
      const response = await fetch('/api/stockin/serials');
      const data = await response.json();
      setAllExistingSerials(data);
    } catch (error) {
      console.error('Error fetching serials:', error);
    }
  };

  if (!isOpen) return null;

  const filteredBoxes = searchBox
    ? boxes.filter((box) => box.name.toLowerCase().includes(searchBox.toLowerCase()))
    : boxes;

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchSupplier.toLowerCase())
  );

  const filteredItems = itemName.trim()
    ? existingItems.filter((item) => item.toLowerCase().includes(itemName.toLowerCase()))
    : [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedBox) newErrors.boxName = 'Box is required';
    if (!itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!quantity || parseInt(quantity) <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!selectedSupplier) newErrors.supplier = 'Supplier is required';

    const validSerials = serialNumbers.filter((s) => s.trim());
    if (validSerials.length === 0) {
      newErrors.serials = 'At least one serial number is required';
    }
    if (validSerials.length !== parseInt(quantity || '0')) {
      newErrors.serials = `You must have ${quantity} serial number(s), got ${validSerials.length}`;
    }

    const duplicates = validSerials.filter((serial) => allExistingSerials.includes(serial));
    if (duplicates.length > 0) {
      newErrors.serials = `These serial numbers already exist: ${duplicates.join(', ')}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNewSupplier = async () => {
    if (!newSupplier.name.trim() || !newSupplier.email.trim() || !newSupplier.contact.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/stockin/supplier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier),
      });

      if (response.ok) {
        const data = await response.json();
        const createdSupplier: SupplierInfo = {
          id: data.data.id.toString(),
          name: data.data.name,
          email: data.data.email,
          contact: data.data.contact_number,
        };

        setSuppliers([...suppliers, createdSupplier]);
        setSelectedSupplier(createdSupplier);
        setNewSupplier({ name: '', email: '', contact: '' });
        setShowAddSupplier(false);
        setSearchSupplier('');
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  const handleAddItem = () => {
    if (!validateForm()) return;

    const qty = parseInt(quantity);
    const validSerials = serialNumbers.filter((s) => s.trim());

    const newItem: StockInItem = {
      id: `item-${Date.now()}`,
      boxId: selectedBox!.id,
      boxName: selectedBox!.name,
      itemName,
      quantity: qty,
      remarks,
      serialGroups: [
        {
          serialNumbers: validSerials,
          supplierId: selectedSupplier!.id,
          supplierName: selectedSupplier!.name,
        },
      ],
    };

    setItems([...items, newItem]);

    // Reset form
    setSelectedBox(null);
    setSearchBox('');
    setItemName('');
    setSearchItemName('');
    setQuantity('');
    setSerialNumbers(['']);
    setRemarks('');
    setSelectedSupplier(null);
    setSearchSupplier('');
    setShowItemSuggestions(false);
    setShowBoxDropdown(false);
    setErrors({});
  };

  const handleSerialChange = (index: number, value: string) => {
    const newSerials = [...serialNumbers];
    newSerials[index] = value;
    setSerialNumbers(newSerials);
  };

  const handleRemoveItem = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmRemoveItem = () => {
    if (deleteConfirm) {
      setItems(items.filter((item) => item.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      return;
    }

    onSubmit(items);

    // Reset everything
    setItems([]);
    setSelectedBox(null);
    setSearchBox('');
    setItemName('');
    setSearchItemName('');
    setQuantity('');
    setSerialNumbers(['']);
    setRemarks('');
    setSelectedSupplier(null);
    setSearchSupplier('');
    setShowAddSupplier(false);
    setErrors({});
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-white font-semibold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition whitespace-nowrap text-sm sm:text-base"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white text-center flex-1 lg:flex-none">
                Add Stock In
              </h2>
              <div className="w-16 sm:w-32" />
            </div>

            {/* Item Form Section */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3 bg-gray-50 dark:bg-gray-700">
              {/* Box Name - Dropdown only */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Box Name:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedBox ? selectedBox.name : searchBox}
                    onChange={(e) => {
                      if (!selectedBox) {
                        setSearchBox(e.target.value);
                        setShowBoxDropdown(true);
                      }
                    }}
                    onFocus={() => setShowBoxDropdown(true)}
                    placeholder="Select box"
                    readOnly={!!selectedBox}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      errors.boxName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } ${selectedBox ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  />
                  {selectedBox && (
                    <button
                      onClick={() => {
                        setSelectedBox(null);
                        setSearchBox('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                  {showBoxDropdown && !selectedBox && filteredBoxes.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredBoxes.map((box) => (
                        <button
                          key={box.id}
                          onClick={() => {
                            setSelectedBox(box);
                            setShowBoxDropdown(false);
                            if (errors.boxName) setErrors({ ...errors, boxName: '' });
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-sm"
                        >
                          {box.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.boxName && <p className="text-red-500 text-xs mt-1">{errors.boxName}</p>}
              </div>

              {/* Item Name - Searchable, can type new */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Item Name:
                </label>
                <div className="relative">
                <input
                    type="text"
                    value={itemName}
                    onChange={(e) => {
                    setItemName(e.target.value);
                    setSearchItemName(e.target.value);
                    setShowItemSuggestions(true);
                    if (errors.itemName) setErrors({ ...errors, itemName: '' });
                    }}
                    onBlur={() => {
                    // Delay hiding to allow click to register
                    setTimeout(() => setShowItemSuggestions(false), 200);
                    }}
                    onFocus={() => {
                    if (itemName) setShowItemSuggestions(true);
                    }}
                    placeholder="Search or type item name"
                    className={`w-full px-4 py-2 border-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.itemName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                {showItemSuggestions && filteredItems.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredItems.map((item) => (
                        <button
                        key={item}
                        onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur
                            setItemName(item);
                            setShowItemSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-sm"
                        >
                        {item}
                        </button>
                    ))}
                    </div>
                )}
                </div>
                {errors.itemName && <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Quantity:
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setQuantity(val.toString());
                    if (errors.quantity) setErrors({ ...errors, quantity: '' });

                    if (val > serialNumbers.length) {
                      const diff = val - serialNumbers.length;
                      setSerialNumbers([...serialNumbers, ...Array(diff).fill('')]);
                    }
                  }}
                  placeholder="Enter Quantity"
                  min="1"
                  className={`w-full px-4 py-2 border-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>

              {/* Serial Numbers */}
              {quantity && parseInt(quantity) > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    SN (Serial Numbers):
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {serialNumbers.slice(0, parseInt(quantity)).map((serial, index) => (
                      <input
                        key={index}
                        type="text"
                        value={serial}
                        onChange={(e) => handleSerialChange(index, e.target.value)}
                        placeholder={`Serial #${index + 1}`}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    ))}
                  </div>
                  {errors.serials && <p className="text-red-500 text-xs mt-1">{errors.serials}</p>}
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Remarks:
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add remarks (optional)..."
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
              </div>

              {/* Supplier */}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Supplier:</label>
                </div>

                {!showAddSupplier ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                    <div className="flex-1 relative">
                    <input
                        type="text"
                        value={searchSupplier}
                        onChange={(e) => setSearchSupplier(e.target.value)}
                        onBlur={() => {
                        // Delay hiding to allow click to register
                        setTimeout(() => setSearchSupplier(''), 200);
                        }}
                        placeholder="Search Supplier"
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    {searchSupplier && filteredSuppliers.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                        {filteredSuppliers.map((supplier) => (
                            <button
                            key={supplier.id}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur
                                setSelectedSupplier(supplier);
                                setSearchSupplier('');
                                if (errors.supplier) setErrors({ ...errors, supplier: '' });
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-sm"
                            >
                            {supplier.name}
                            </button>
                        ))}
                        </div>
                    )}
                    </div>
                      <button
                        onClick={() => setShowAddSupplier(true)}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>

                    {selectedSupplier && (
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-semibold">Selected:</span> {selectedSupplier.name}
                        </p>
                      </div>
                    )}

                    {errors.supplier && <p className="text-red-500 text-xs">{errors.supplier}</p>}
                  </div>
                ) : (
                  <div className="space-y-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                      placeholder="Supplier Name"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                      placeholder="Email"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      value={newSupplier.contact}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                      placeholder="Contact"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddSupplier(false)}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNewSupplier}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddItem}
                className="w-full px-6 py-3 border-2 border-gray-900 dark:border-white rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold flex items-center justify-center gap-2 mt-4 text-sm sm:text-base"
              >
                <Plus size={20} />
                Add item
              </button>
            </div>
          </div>

          {/* Right Side - Items List */}
          <div className="w-full lg:w-80 bg-gray-50 dark:bg-gray-700 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-600 overflow-y-auto flex flex-col max-h-[50vh] lg:max-h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                Items ({items.length})
              </h3>
              {items.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total Qt: {items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              )}
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">No items added yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 p-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {item.itemName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Box: {item.boxName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Qty: {item.quantity}</p>
                        {item.serialGroups.map((group, idx) => (
                          <p key={idx} className="text-xs text-gray-500 dark:text-gray-500">
                            {group.supplierName}
                          </p>
                        ))}
                        {item.remarks && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 italic mt-1">
                            "{item.remarks}"
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 space-y-2">
              <button
                onClick={handleSubmit}
                disabled={items.length === 0}
                className="w-full px-6 py-3 border-2 border-gray-900 dark:border-white rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
              >
                Submit
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Delete Item"
        message="Are you sure you want to delete this item from the list?"
        onConfirm={confirmRemoveItem}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
      />
    </>
  );
};