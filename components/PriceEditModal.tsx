import React, { useState, useEffect } from 'react';
import type { OrderItem } from '../types';

interface PriceEditModalProps {
  isOpen: boolean;
  item: OrderItem;
  onSave: (itemId: number, newPrice: number) => void;
  onClose: () => void;
}

export const PriceEditModal: React.FC<PriceEditModalProps> = ({ isOpen, item, onSave, onClose }) => {
  const [newPrice, setNewPrice] = useState(item.price);

  useEffect(() => {
    setNewPrice(item.price);
  }, [item]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrice >= 0) {
      onSave(item.id, newPrice);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold mb-2 text-slate-900">تعديل السعر</h3>
        <p className="text-slate-600 mb-6">الصنف: <span className="font-semibold">{item.name}</span></p>
        
        <form onSubmit={handleSubmit}>
            <label htmlFor="new-price" className="block text-sm font-medium text-slate-600 mb-1">السعر الجديد</label>
            <input
                id="new-price"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500"
                required
                min="0"
                step="0.01"
                autoFocus
            />
        
            <div className="flex justify-end gap-4 mt-6">
            <button
                type="button"
                onClick={onClose}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md transition-colors"
            >
                إلغاء
            </button>
            <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                حفظ
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};