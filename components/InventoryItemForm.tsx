import React, { useState } from 'react';
import type { InventoryItem } from '../types';

interface InventoryItemFormProps {
    item: InventoryItem | null;
    onSave: (item: Omit<InventoryItem, 'id'> | InventoryItem) => void;
    onCancel: () => void;
}

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item || {
        name: '',
        unit: '',
        stock: 0,
        costPerUnit: 0,
    });

    const isEditing = item !== null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'stock' || name === 'costPerUnit') ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.unit && formData.stock >= 0 && formData.costPerUnit >= 0) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{isEditing ? 'تعديل مادة بالمخزون' : 'إضافة مادة جديدة للمخزون'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">اسم المادة</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">وحدة القياس</label>
                            <input type="text" name="unit" value={formData.unit} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" placeholder="مثال: كجم، حبة" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">الكمية المتاحة</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required min="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">تكلفة الوحدة</label>
                            <input type="number" name="costPerUnit" value={formData.costPerUnit} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required min="0" step="0.01" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md transition-colors">إلغاء</button>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
