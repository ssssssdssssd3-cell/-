import React, { useState } from 'react';
import type { Restaurant } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newEndDate: string | null) => void;
  restaurant: Restaurant;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSave, restaurant }) => {
  // Helper to format date as YYYY-MM-DD for the input
  const formatDateForInput = (date: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [endDate, setEndDate] = useState<string>(formatDateForInput(restaurant.subscriptionEndDate));

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    // If endDate is empty string, it means lifetime subscription (null)
    const newEndDate = endDate ? new Date(endDate).toISOString() : null;
    onSave(newEndDate);
  };
  
  const setLifetime = () => {
      setEndDate('');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-2 text-slate-900">إدارة الاشتراك</h3>
        <p className="text-slate-600 mb-6">
          مطعم: <span className="font-semibold">{restaurant.name}</span>
        </p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">
              تحديد تاريخ انتهاء الصلاحية
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-slate-500">أو</span>
            </div>
          </div>
          <div>
             <button
                type="button"
                onClick={setLifetime}
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-2 px-4 rounded-md transition-colors"
             >
                تعيين كاشتراك دائم
             </button>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};