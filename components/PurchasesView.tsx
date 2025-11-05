import React, { useState } from 'react';
import type { Purchase, Supplier, InventoryItem } from '../types';
import { PurchaseForm } from './PurchaseForm';

interface PurchasesViewProps {
    purchases: Purchase[];
    suppliers: Supplier[];
    inventoryItems: InventoryItem[];
    onAddPurchase: (purchase: Omit<Purchase, 'id'>) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ purchases, suppliers, inventoryItems, onAddPurchase }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getSupplierName = (id: number) => suppliers.find(s => s.id === id)?.name || 'غير معروف';
    const getInventoryItemName = (id: number) => inventoryItems.find(i => i.id === id)?.name || 'غير معروف';

    const handleSave = (purchase: Omit<Purchase, 'id'>) => {
        onAddPurchase(purchase);
        setIsModalOpen(false);
    };

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    إضافة فاتورة مشتريات
                </button>
            </div>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-right text-slate-700">
                    <thead className="text-xs text-slate-600 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="py-3 px-6">رقم الفاتورة</th>
                            <th scope="col" className="py-3 px-6">المورد</th>
                            <th scope="col" className="py-3 px-6">التاريخ</th>
                            <th scope="col" className="py-3 px-6">الإجمالي</th>
                            <th scope="col" className="py-3 px-6">التفاصيل</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map(purchase => (
                            <tr key={purchase.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-4 px-6 font-medium text-slate-900">#{purchase.id}</td>
                                <td className="py-4 px-6">{getSupplierName(purchase.supplierId)}</td>
                                <td className="py-4 px-6">{new Date(purchase.date).toLocaleDateString('ar-EG')}</td>
                                <td className="py-4 px-6 font-bold text-orange-600">ر.س {purchase.totalCost.toFixed(2)}</td>
                                <td className="py-4 px-6">
                                    <ul className="text-xs">
                                        {purchase.items.map((item, index) => (
                                            <li key={index}>- {getInventoryItemName(item.inventoryItemId)} (الكمية: {item.quantity})</li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <PurchaseForm
                    suppliers={suppliers}
                    inventoryItems={inventoryItems}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};
