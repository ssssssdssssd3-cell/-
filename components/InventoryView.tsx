import React, { useState } from 'react';
import type { InventoryItem } from '../types';
import { InventoryItemForm } from './InventoryItemForm';
import { ConfirmationDialog } from './ConfirmationDialog';

interface InventoryViewProps {
    inventoryItems: InventoryItem[];
    onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
    onUpdateItem: (item: InventoryItem) => void;
    onDeleteItem: (itemId: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventoryItems, onAddItem, onUpdateItem, onDeleteItem }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSaveItem = (item: Omit<InventoryItem, 'id'> | InventoryItem) => {
        if ('id' in item) {
            onUpdateItem(item);
        } else {
            onAddItem(item);
        }
        handleCloseModal();
    };

    const handleDeleteRequest = (itemId: number) => {
        setItemToDelete(itemId);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete !== null) {
            onDeleteItem(itemToDelete);
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button onClick={handleOpenAddModal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    إضافة مادة جديدة
                </button>
            </div>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-right text-slate-700">
                    <thead className="text-xs text-slate-600 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="py-3 px-6">المادة</th>
                            <th scope="col" className="py-3 px-6">الوحدة</th>
                            <th scope="col" className="py-3 px-6">الكمية المتاحة</th>
                            <th scope="col" className="py-3 px-6">تكلفة الوحدة</th>
                            <th scope="col" className="py-3 px-6">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryItems.map(item => (
                            <tr key={item.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">{item.name}</td>
                                <td className="py-4 px-6">{item.unit}</td>
                                <td className="py-4 px-6">{item.stock}</td>
                                <td className="py-4 px-6">ر.س {item.costPerUnit.toFixed(2)}</td>
                                <td className="py-4 px-6 flex gap-4">
                                    <button onClick={() => handleOpenEditModal(item)} className="font-medium text-blue-500 hover:underline">تعديل</button>
                                    <button onClick={() => handleDeleteRequest(item.id)} className="font-medium text-red-500 hover:underline">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <InventoryItemForm item={editingItem} onSave={handleSaveItem} onCancel={handleCloseModal} />}
            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذه المادة من المخزون؟"
            />
        </div>
    );
};
