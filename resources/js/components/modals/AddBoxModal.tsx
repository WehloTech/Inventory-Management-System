import React, { useState } from 'react';
import { X, Box as BoxIcon, AlertCircle } from 'lucide-react';

interface InventoryBox {
  id: number;
  box_name: string;
  category_quantity: number;
  main_category: string;
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
    const { value } = e.target;
    setBoxFormData({ boxNumber: value.toUpperCase() });
    if (showBoxError) {
      setShowBoxError(false);
      setBoxError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!boxFormData.boxNumber.trim()) {
      setBoxError('Box name cannot be empty');
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
        handleClose();
        if (onSuccess) onSuccess(formattedBox);
      } else {
        setBoxError(result.message || 'Failed to create box');
        setShowBoxError(true);
      }
    } catch (error) {
      console.error('Error creating box:', error);
      setBoxError('Network error. Please try again.');
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
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
              New Box
            </h2>

          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full transition-all active:scale-90 disabled:opacity-50"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          
          {/* Error Message */}
          {showBoxError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-tight">{boxError}</p>
            </div>
          )}

          {/* Read-only Category Info */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Main Category
            </label>
            <div className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 text-sm font-black italic tracking-tight">
              {systemDisplayName}
            </div>
          </div>

          {/* Box Name Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <BoxIcon size={12} /> Box Name
            </label>
            <input
              type="text"
              name="boxNumber"
              autoFocus
              value={boxFormData.boxNumber}
              onChange={handleInputChange}
              placeholder="Enter box name..."
              disabled={isSubmitting}
              className={`w-full px-6 py-4 rounded-2xl border-2 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-black text-lg placeholder:text-slate-300 focus:outline-none transition-all ${
                showBoxError 
                  ? 'border-red-500 focus:ring-red-500/20' 
                  : 'border-slate-100 dark:border-slate-800 focus:border-blue-500'
              } disabled:opacity-50`}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black transition-all flex items-center justify-center shadow-xl active:scale-[0.98] uppercase tracking-[0.2em] text-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Adding Box...' : 'Add Box'}
          </button>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            Cancel 
          </button>
        </div>

      </div>
    </div>
  );
};