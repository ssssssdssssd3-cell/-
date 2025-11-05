import React, { useState } from 'react';
import type { Customer } from '../types';
import { ConfirmationDialog } from './ConfirmationDialog';
import { CustomerForm } from './CustomerForm';

interface CustomersViewProps {
    customers: Customer[];
    onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
    onUpdateCustomer: (customer: Customer) => void;
    onDeleteCustomer: (customerId: number) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);

    const handleOpenAddModal = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSave = (customer: Omit<Customer, 'id'> | Customer) => {
        if ('id' in customer) {
            onUpdateCustomer(customer);
        } else {
            onAddCustomer(customer);
        }
        handleCloseModal();
    };

    const handleDeleteRequest = (customerId: number) => {
        setCustomerToDelete(customerId);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (customerToDelete !== null) {
            onDeleteCustomer(customerToDelete);
        }
        setIsConfirmOpen(false);
        setCustomerToDelete(null);
    };

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button onClick={handleOpenAddModal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    إضافة عميل جديد
                </button>
            </div>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-right text-slate-700">
                    <thead className="text-xs text-slate-600 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="py-3 px-6">الاسم</th>
                            <th scope="col" className="py-3 px-6">رقم الهاتف</th>
                            <th scope="col" className="py-3 px-6">العنوان</th>
                            <th scope="col" className="py-3 px-6">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">{customer.name}</td>
                                <td className="py-4 px-6">{customer.phone}</td>
                                <td className="py-4 px-6">{customer.address}</td>
                                <td className="py-4 px-6 flex gap-4">
                                    <button onClick={() => handleOpenEditModal(customer)} className="font-medium text-blue-500 hover:underline">تعديل</button>
                                    <button onClick={() => handleDeleteRequest(customer.id)} className="font-medium text-red-500 hover:underline">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <CustomerForm customer={editingCustomer} onSave={handleSave} onCancel={handleCloseModal} />}
            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا العميل؟"
            />
        </div>
    );
};
