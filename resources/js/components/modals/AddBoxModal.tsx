import React, { useState } from 'react';
import { X } from 'lucide-react';

interface InventoryBox {
  id: number;
  box_name: string;
  category_quantity: number;
  main_category: string; // required — matches MasterList.tsx

}

interface AddBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainCategoryId: number;
  system: string;
  onSuccess?: (newBox?: InventoryBox) => void;
}

export const AddBoxModal: React.FC<AddBoxModalProps> = ({
  isOpen,
  onClose,
  mainCategoryId,
  system,
  onSuccess,
}) => {
  const [boxFormData, setBoxFormData] = useState({ boxNumber: '' });
  const [boxError, setBoxError] = useState('');
  const [showBoxError, setShowBoxError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const systemDisplayName = system.toUpperCase();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBoxFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    if (showBoxError) { setShowBoxError(false); setBoxError(''); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!boxFormData.boxNumber.trim()) {
      setBoxError('Please enter a box name');
      setShowBoxError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/masterlist/box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: boxFormData.boxNumber,
          main_category_id: mainCategoryId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const newBox = result.data;
        const formattedBox: InventoryBox = {
          id: newBox.id,
          box_name: newBox.name,
          category_quantity: 0,
          main_category: systemDisplayName,
        };
        setBoxFormData({ boxNumber: '' });
        setBoxError('');
        setShowBoxError(false);
        if (onSuccess) onSuccess(formattedBox);
        onClose();
      } else {
        setBoxError(result.message || 'Failed to create box');
        setShowBoxError(true);
      }
    } catch (error) {
      console.error('Error creating box:', error);
      setBoxError('Failed to create box. Please try again.');
      setShowBoxError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBoxFormData({ boxNumber: '' });
    setBoxError('');
    setShowBoxError(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Box</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Error */}
          {showBoxError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl px-4 py-3">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{boxError}</p>
            </div>
          )}

          {/* Main Category (read-only) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Main Category
            </label>
            <div className="w-full px-4 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium">
              {systemDisplayName}
            </div>
          </div>

          {/* Box Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Box Name
            </label>
            <input
              type="text"
              name="boxNumber"
              value={boxFormData.boxNumber}
              onChange={handleInputChange}
              placeholder="Enter box name"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-full text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-full text-sm font-medium bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Box'}
          </button>
        </div>

      </div>
    </div>
  );
};