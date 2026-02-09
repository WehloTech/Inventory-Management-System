import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Plus, X, Trash2, ChevronLeft, ChevronDown } from 'lucide-react';

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
  boxName: string;
  itemName: string;
  quantity: number;
  serialGroups: SerialNumberGroup[];
  date: string;
}

interface StockInDashboardEntry {
  id: string;
  boxName: string;
  itemName: string;
  date: string;
  totalQuantity: number;
  serialGroups: SerialNumberGroup[];
  expandedSerials: boolean;
}

// Add Stock In Modal
const AddStockInModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: StockInItem[], newSuppliers: SupplierInfo[]) => void;
  suppliers: SupplierInfo[];
}> = ({ isOpen, onClose, onSubmit, suppliers: initialSuppliers }) => {
  const [items, setItems] = useState<StockInItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>(initialSuppliers);
  const [boxName, setBoxName] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [serialNumbers, setSerialNumbers] = useState<string[]>(['']);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierInfo | null>(null);
  const [searchSupplier, setSearchSupplier] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    contact: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchSupplier.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!boxName.trim()) {
      newErrors.boxName = 'Box name is required';
    }
    if (!itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }
    if (!quantity || parseInt(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!selectedSupplier) {
      newErrors.supplier = 'Supplier is required';
    }

    const validSerials = serialNumbers.filter((s) => s.trim());
    if (validSerials.length === 0) {
      newErrors.serials = 'At least one serial number is required';
    }
    if (validSerials.length !== parseInt(quantity || '0')) {
      newErrors.serials = `You must have ${quantity} serial number(s), got ${validSerials.length}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNewSupplier = () => {
    if (!newSupplier.name.trim() || !newSupplier.email.trim() || !newSupplier.contact.trim()) {
      alert('Please fill all supplier fields');
      return;
    }

    const createdSupplier: SupplierInfo = {
      id: `supplier-${Date.now()}`,
      name: newSupplier.name,
      email: newSupplier.email,
      contact: newSupplier.contact,
    };

    // Add supplier to list
    setSuppliers([...suppliers, createdSupplier]);
    
    // Select the newly created supplier
    setSelectedSupplier(createdSupplier);
    
    // Reset form
    setNewSupplier({ name: '', email: '', contact: '' });
    setShowAddSupplier(false);
    setSearchSupplier('');
  };

  const handleAddItem = () => {
    if (!validateForm()) return;

    const qty = parseInt(quantity);
    const validSerials = serialNumbers.filter((s) => s.trim());
    const today = new Date().toISOString().split('T')[0];

    // Check if item with same box and item name exists on same day
    const existingItemIndex = items.findIndex(
      (item) =>
        item.boxName === boxName &&
        item.itemName === itemName &&
        item.date === today
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += qty;

      // Check if this supplier already exists in serial groups
      const supplierGroupIndex = updatedItems[existingItemIndex].serialGroups.findIndex(
        (group) => group.supplierId === selectedSupplier!.id
      );

      if (supplierGroupIndex !== -1) {
        updatedItems[existingItemIndex].serialGroups[supplierGroupIndex].serialNumbers.push(
          ...validSerials
        );
      } else {
        updatedItems[existingItemIndex].serialGroups.push({
          serialNumbers: validSerials,
          supplierId: selectedSupplier!.id,
          supplierName: selectedSupplier!.name,
        });
      }

      setItems(updatedItems);
    } else {
      // Create new item
      const newItem: StockInItem = {
        id: `item-${Date.now()}`,
        boxName,
        itemName,
        quantity: qty,
        date: today,
        serialGroups: [
          {
            serialNumbers: validSerials,
            supplierId: selectedSupplier!.id,
            supplierName: selectedSupplier!.name,
          },
        ],
      };

      setItems([...items, newItem]);
    }

    // Reset form but keep supplier selected for potential reuse
    setBoxName('');
    setItemName('');
    setQuantity('');
    setSerialNumbers(['']);
    setErrors({});
  };

  const handleSerialChange = (index: number, value: string) => {
    const newSerials = [...serialNumbers];
    newSerials[index] = value;
    setSerialNumbers(newSerials);
  };

  const addSerialField = () => {
    const qty = parseInt(quantity || '0');
    if (serialNumbers.length < qty) {
      setSerialNumbers([...serialNumbers, '']);
    }
  };

  const removeSerialField = (index: number) => {
    if (serialNumbers.length > 1) {
      setSerialNumbers(serialNumbers.filter((_, i) => i !== index));
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    onSubmit(items, suppliers);

    // Reset modal
    setItems([]);
    setBoxName('');
    setItemName('');
    setQuantity('');
    setSerialNumbers(['']);
    setSelectedSupplier(null);
    setSearchSupplier('');
    setShowAddSupplier(false);
    setErrors({});
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline font-semibold"
            >
              &lt;Back
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Stock In</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Item Form Section */}
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl p-5 space-y-3">
            {/* Box Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Box Name:
              </label>
              <input
                type="text"
                value={boxName}
                onChange={(e) => {
                  setBoxName(e.target.value);
                  if (errors.boxName) setErrors({ ...errors, boxName: '' });
                }}
                placeholder="Search Box Name"
                className={`w-full px-4 py-2 border-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.boxName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.boxName && <p className="text-red-500 text-xs mt-1">{errors.boxName}</p>}
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Item Name:
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  if (errors.itemName) setErrors({ ...errors, itemName: '' });
                }}
                placeholder="Search Item name"
                className={`w-full px-4 py-2 border-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.itemName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
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
                  
                  // Auto-adjust serial number fields
                  if (val > serialNumbers.length) {
                    const diff = val - serialNumbers.length;
                    setSerialNumbers([...serialNumbers, ...Array(diff).fill('')]);
                  }
                }}
                placeholder="Enter Quantity"
                min="1"
                className={`w-full px-4 py-2 border-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
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
                      placeholder={`Enter Serial Number ${index + 1}`}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
                {errors.serials && <p className="text-red-500 text-xs mt-1">{errors.serials}</p>}
              </div>
            )}

            {/* Supplier Section */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Supplier:
                </label>
              </div>

              {!showAddSupplier ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchSupplier}
                        onChange={(e) => setSearchSupplier(e.target.value)}
                        placeholder="Search Supplier"
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {searchSupplier && filteredSuppliers.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                          {filteredSuppliers.map((supplier) => (
                            <button
                              key={supplier.id}
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setSearchSupplier('');
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
                      className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm"
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
                  <div>
                    <label className="block text-xs font-medium text-gray-900 dark:text-white mb-1">
                      Name:
                    </label>
                    <input
                      type="text"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                      placeholder="Enter Supplier Name"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-900 dark:text-white mb-1">
                      Email:
                    </label>
                    <input
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                      placeholder="Enter Supplier Email"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-900 dark:text-white mb-1">
                      Contact:
                    </label>
                    <input
                      type="text"
                      value={newSupplier.contact}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                      placeholder="Enter Supplier Contact"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
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

            {/* Item Summary */}
            {items.length > 0 && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center border-2 border-gray-300 dark:border-gray-600">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Total Qt: {items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
            )}

            {/* Add Item Button */}
            <button
              onClick={handleAddItem}
              className="w-full px-6 py-3 border-2 border-gray-900 dark:border-white rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold flex items-center justify-center gap-2 mt-4"
            >
              <Plus size={20} />
              Add item
            </button>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Box: {item.boxName} | Qty: {item.quantity}
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.serialGroups.map((group, idx) => (
                          <p key={idx}>
                            Supplier: {group.supplierName} ({group.serialNumbers.length})
                          </p>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <button
            onClick={handleSubmit}
            disabled={items.length === 0}
            className="w-full px-6 py-3 border-2 border-gray-900 dark:border-white rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const StockIn = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardEntries, setDashboardEntries] = useState<StockInDashboardEntry[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([
    {
      id: '1',
      name: 'Supplier A',
      email: 'supplier.a@example.com',
      contact: '+1234567890',
    },
    {
      id: '2',
      name: 'Supplier B',
      email: 'supplier.b@example.com',
      contact: '+1987654321',
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const handleAddItems = (items: StockInItem[], newSuppliers: SupplierInfo[]) => {
    // Update suppliers list with any new suppliers added
    setSuppliers(newSuppliers);

    const today = new Date().toISOString().split('T')[0];

    let updatedEntries = [...dashboardEntries];

    items.forEach((newItem) => {
      // Check if entry with same box, item name, and date exists
      const existingIndex = updatedEntries.findIndex(
        (entry) =>
          entry.boxName === newItem.boxName &&
          entry.itemName === newItem.itemName &&
          entry.date === today
      );

      if (existingIndex !== -1) {
        // Merge with existing entry
        updatedEntries[existingIndex].totalQuantity += newItem.quantity;

        // Merge serial groups
        newItem.serialGroups.forEach((newGroup) => {
          const groupIndex = updatedEntries[existingIndex].serialGroups.findIndex(
            (group) => group.supplierId === newGroup.supplierId
          );

          if (groupIndex !== -1) {
            updatedEntries[existingIndex].serialGroups[groupIndex].serialNumbers.push(
              ...newGroup.serialNumbers
            );
          } else {
            updatedEntries[existingIndex].serialGroups.push(newGroup);
          }
        });
      } else {
        // Create new entry
        const newEntry: StockInDashboardEntry = {
          id: `entry-${Date.now()}`,
          boxName: newItem.boxName,
          itemName: newItem.itemName,
          date: today,
          totalQuantity: newItem.quantity,
          serialGroups: newItem.serialGroups,
          expandedSerials: false,
        };

        updatedEntries = [newEntry, ...updatedEntries];
      }
    });

    setDashboardEntries(updatedEntries);
    setIsModalOpen(false);
  };

  const filteredEntries = useMemo(() => {
    return dashboardEntries.filter((entry) => {
      const matchesSearch =
        entry.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.boxName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate = !dateFilter || entry.date === dateFilter;

      return matchesSearch && matchesDate;
    });
  }, [dashboardEntries, searchQuery, dateFilter]);

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setDashboardEntries((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const toggleExpandSerials = (id: string) => {
    setDashboardEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, expandedSerials: !entry.expandedSerials } : entry
      )
    );
  };

  return (
    <>
      <Head title="Stock In" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">STOCK IN</h1>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  STOCK IN
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Record and track items deposited into inventory
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 flex flex-col">
              {/* Search and Filter Bar */}
              <div className="flex gap-3 flex-col lg:flex-row mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by item name or box name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
                >
                  <Plus size={18} />
                  Add Stock In
                </button>
              </div>

              {/* Clear Filters */}
              {(searchQuery || dateFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDateFilter('');
                  }}
                  className="w-fit text-xs text-blue-600 dark:text-blue-400 hover:underline mb-3"
                >
                  Clear Filters
                </button>
              )}

              {/* Dashboard */}
              {filteredEntries.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      No stock in entries found
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
                    >
                      <Plus size={18} />
                      Add First Stock In
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col"
                    >
                      {/* Entry Header */}
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {entry.itemName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              Box: {entry.boxName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-blue-600">
                              {entry.totalQuantity}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Qty</p>
                          </div>
                        </div>
                      </div>

                      {/* Serial Numbers Section */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex-1">
                        <button
                          onClick={() => toggleExpandSerials(entry.id)}
                          className="flex items-center gap-2 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors w-full text-sm"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform flex-shrink-0 ${
                              entry.expandedSerials ? 'rotate-180' : ''
                            }`}
                          />
                          <span>Serial Numbers</span>
                        </button>

                        {entry.expandedSerials && (
                          <div className="mt-3 space-y-2 ml-4 text-xs">
                            {entry.serialGroups.map((group, idx) => (
                              <div key={idx}>
                                <p className="font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                  {group.supplierName}
                                </p>
                                <div className="space-y-0.5 mt-1">
                                  {group.serialNumbers.map((serial, sIdx) => (
                                    <p
                                      key={sIdx}
                                      className="text-gray-900 dark:text-white"
                                    >
                                      {serial}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 flex justify-end">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="px-3 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modal */}
        <AddStockInModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddItems}
          suppliers={suppliers}
        />
      </SidebarProvider>
    </>
  );
};

export default StockIn;