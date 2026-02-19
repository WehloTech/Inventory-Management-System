import React, { useState } from 'react';
import { X } from 'lucide-react';

interface InventoryBox {
  id: number;
  box_name: string;
  category_quantity: number;
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
    setBoxFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
    // Clear error when user types
    if (showBoxError) {
      setShowBoxError(false);
      setBoxError('');
    }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: boxFormData.boxNumber,
          main_category_id: mainCategoryId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Success - box created
        const newBox = result.data;
        
        // Create the box object matching the expected structure
        const formattedBox: InventoryBox = {
          id: newBox.id,
          box_name: newBox.name,
          category_quantity: 0,
        };

        // Reset form
        setBoxFormData({ boxNumber: '' });
        setBoxError('');
        setShowBoxError(false);
        
        // Call success callback with the new box data
        if (onSuccess) {
          onSuccess(formattedBox);
        }
        
        // Close modal
        onClose();
      } else {
        // Error - show message from backend (e.g., "Box ID already has been taken")
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
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b-2 border-gray-900 dark:border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Add Box
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={isSubmitting}
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {showBoxError && (
            <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-2xl p-4">
              <p className="text-red-700 dark:text-red-200 font-bold text-sm">
                {boxError}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Box Name Field */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="font-bold text-gray-900 dark:text-white text-sm sm:text-base min-w-fit">
                Box Name
              </label>
              <span className="hidden sm:block text-gray-900 dark:text-white font-bold">:</span>
              <input
                type="text"
                name="boxNumber"
                value={boxFormData.boxNumber}
                onChange={handleInputChange}
                placeholder="Enter Box name"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            {/* Main Category Field */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="font-bold text-gray-900 dark:text-white text-sm sm:text-base min-w-fit">
                Main Category
              </label>
              <span className="hidden sm:block text-gray-900 dark:text-white font-bold">:</span>
              <div className="flex-1 px-4 py-2 border-2 border-gray-900 dark:border-gray-100 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium">
                {systemDisplayName}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-center p-6 sm:p-8 border-t-2 border-gray-900 dark:border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 sm:px-12 py-3 border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Box'}
          </button>
        </div>
      </div>
    </div>
  );
};