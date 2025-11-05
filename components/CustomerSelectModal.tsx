import React, { useState, useMemo } from 'react';
import type { Customer } from '../types';

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSelectCustomer: (customerId: number) => void;
  onAddCustomer: (customer: Omit<Customer, 'id'>) => Customer;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen,
  onClose,
  customers,
  onSelectCustomer,
  onAddCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });

  const filteredCustomers = useMemo(() =>
    customers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    ), [customers, searchTerm]);

  const handleAddNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomer.name && newCustomer.phone && newCustomer.address) {
      const addedCustomer = onAddCustomer(newCustomer);
      onSelectCustomer(addedCustomer.id);
      setIsAddingNew(false);
      setNewCustomer({ name: '', phone: '', address: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex flex-col h-[70vh]">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-slate-900">{isAddingNew ? 'إضافة عميل جديد' : 'اختيار عميل'}</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>
        
        {!isAddingNew ? (
            <>
                <div className="mb-4 relative">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو رقم الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                <div className="flex-grow overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                        <ul className="space-y-2">
                            {filteredCustomers.map(customer => (
                                <li key={customer.id} onClick={() => onSelectCustomer(customer.id)} className="p-3 bg-slate-100 hover:bg-orange-100 rounded-md cursor-pointer transition-colors">
                                    <p className="font-bold text-slate-800">{customer.name}</p>
                                    <p className="text-sm text-slate-600">{customer.phone} - {customer.address}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-500 py-8">لم يتم العثور على عملاء.</p>
                    )}
                </div>
                <div className="pt-4 mt-auto border-t border-slate-200">
                    <button onClick={() => setIsAddingNew(true)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        إضافة عميل جديد
                    </button>
                </div>
            </>
        ) : (
            <form onSubmit={handleAddNewCustomer} className="space-y-4 flex-grow flex flex-col">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">الاسم</label>
                    <input type="text" value={newCustomer.name} onChange={e => setNewCustomer(p => ({...p, name: e.target.value}))} className="w-full input-style" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">رقم الهاتف</label>
                    <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer(p => ({...p, phone: e.target.value}))} className="w-full input-style" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">العنوان</label>
                    <input type="text" value={newCustomer.address} onChange={e => setNewCustomer(p => ({...p, address: e.target.value}))} className="w-full input-style" required />
                </div>
                <div className="flex justify-end gap-4 pt-4 mt-auto">
                    <button type="button" onClick={() => setIsAddingNew(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md transition-colors">إلغاء</button>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">حفظ واختيار</button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};
