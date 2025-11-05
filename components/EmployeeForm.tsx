import React, { useState } from 'react';
import type { UserWithPassword } from '../types';

interface EmployeeFormProps {
    user: UserWithPassword | null;
    onSave: (user: Omit<UserWithPassword, 'id'> | UserWithPassword) => void;
    onCancel: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        password: '',
        role: user?.role || 'cashier',
    });

    const isEditing = user !== null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Password is required for new users, optional for existing ones
        if (formData.username && (isEditing || formData.password)) {
            if (isEditing) {
                onSave({ ...user, ...formData });
            } else {
                onSave(formData as Omit<UserWithPassword, 'id'>);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{isEditing ? 'تعديل موظف' : 'إضافة موظف جديد'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">اسم المستخدم</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">كلمة المرور</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" 
                            placeholder={isEditing ? 'اترك الحقل فارغاً لعدم التغيير' : ''}
                            required={!isEditing}
                         />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">الصلاحية</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500">
                           <option value="owner">مالك</option>
                           <option value="admin">مدير</option>
                           <option value="cashier">كاشير</option>
                           <option value="driver">سائق</option>
                        </select>
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