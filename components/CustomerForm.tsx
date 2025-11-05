import React, { useState } from 'react';
import type { Customer } from '../types';

interface CustomerFormProps {
    customer: Customer | null;
    onSave: (customer: Omit<Customer, 'id'> | Customer) => void;
    onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
    const [formData, setFormData] = useState(customer || {
        name: '',
        phone: '',
        address: '',
    });

    const isEditing = customer !== null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.phone && formData.address) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{isEditing ? 'تعديل عميل' : 'إضافة عميل جديد'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">الاسم</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">رقم الهاتف</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">العنوان</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required />
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
