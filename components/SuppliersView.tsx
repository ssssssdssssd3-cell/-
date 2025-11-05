import React, { useState } from 'react';
import type { Supplier } from '../types';
import { ConfirmationDialog } from './ConfirmationDialog';
import { SupplierForm } from './SupplierForm';

interface SuppliersViewProps {
    suppliers: Supplier[];
    onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    onUpdateSupplier: (supplier: Supplier) => void;
    onDeleteSupplier: (supplierId: number) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ suppliers, onAddSupplier, onUpdateSupplier, onDeleteSupplier }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);

    const handleOpenAddModal = () => {
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleSave = (supplier: Omit<Supplier, 'id'> | Supplier) => {
        if ('id' in supplier) {
            onUpdateSupplier(supplier);
        } else {
            onAddSupplier(supplier);
        }
        handleCloseModal();
    };

    const handleDeleteRequest = (supplierId: number) => {
        setSupplierToDelete(supplierId);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (supplierToDelete !== null) {
            onDeleteSupplier(supplierToDelete);
        }
        setIsConfirmOpen(false);
        setSupplierToDelete(null);
    };

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button onClick={handleOpenAddModal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    إضافة مورد جديد
                </button>
            </div>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-right text-slate-700">
                    <thead className="text-xs text-slate-600 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="py-3 px-6">اسم المورد</th>
                            <th scope="col" className="py-3 px-6">مسؤول التواصل</th>
                            <th scope="col" className="py-3 px-6">رقم الهاتف</th>
                            <th scope="col" className="py-3 px-6">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(supplier => (
                            <tr key={supplier.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">{supplier.name}</td>
                                <td className="py-4 px-6">{supplier.contactPerson || '-'}</td>
                                <td className="py-4 px-6">{supplier.phone || '-'}</td>
                                <td className="py-4 px-6 flex gap-4">
                                    <button onClick={() => handleOpenEditModal(supplier)} className="font-medium text-blue-500 hover:underline">تعديل</button>
                                    <button onClick={() => handleDeleteRequest(supplier.id)} className="font-medium text-red-500 hover:underline">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <SupplierForm supplier={editingSupplier} onSave={handleSave} onCancel={handleCloseModal} />}
            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا المورد؟"
            />
        </div>
    );
};
