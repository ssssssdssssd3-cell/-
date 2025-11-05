import React, { useState, useMemo } from 'react';
import type { Purchase, PurchaseItem, Supplier, InventoryItem } from '../types';

interface PurchaseFormProps {
    suppliers: Supplier[];
    inventoryItems: InventoryItem[];
    onSave: (purchase: Omit<Purchase, 'id'>) => void;
    onCancel: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({ suppliers, inventoryItems, onSave, onCancel }) => {
    const [supplierId, setSupplierId] = useState<number | ''>('');
    const [items, setItems] = useState<PurchaseItem[]>([]);
    
    const [currentItem, setCurrentItem] = useState<{itemId: string, quantity: string, cost: string}>({
        itemId: '',
        quantity: '',
        cost: ''
    });

    const totalCost = useMemo(() => items.reduce((sum, item) => sum + item.cost, 0), [items]);

    const handleAddItem = () => {
        const {itemId, quantity, cost} = currentItem;
        if (itemId && quantity && cost) {
            const inventoryItem = inventoryItems.find(i => i.id === parseInt(itemId));
            if (inventoryItem) {
                setItems(prev => [...prev, {
                    inventoryItemId: parseInt(itemId),
                    quantity: parseFloat(quantity),
                    cost: parseFloat(cost)
                }]);
                setCurrentItem({itemId: '', quantity: '', cost: ''}); // Reset form
            }
        }
    };
    
    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (supplierId && items.length > 0) {
            onSave({
                supplierId: supplierId,
                date: new Date(),
                items: items,
                totalCost: totalCost
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col h-[80vh]">
                <h3 className="text-2xl font-bold mb-4 text-slate-900">إضافة فاتورة مشتريات</h3>
                <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col overflow-hidden">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">اختر المورد</label>
                        <select
                            value={supplierId}
                            onChange={e => setSupplierId(parseInt(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500"
                            required
                        >
                            <option value="" disabled>-- اختر مورد --</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="border-t border-b border-slate-200 py-4 space-y-2">
                         <h4 className="text-lg font-semibold text-slate-800">إضافة مواد للفاتورة</h4>
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                            <select value={currentItem.itemId} onChange={e => setCurrentItem(p => ({...p, itemId: e.target.value}))} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900">
                                <option value="" disabled>اختر مادة</option>
                                {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                            <input type="number" placeholder="الكمية" value={currentItem.quantity} onChange={e => setCurrentItem(p => ({...p, quantity: e.target.value}))} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900" min="0"/>
                            <input type="number" placeholder="التكلفة الإجمالية للبند" value={currentItem.cost} onChange={e => setCurrentItem(p => ({...p, cost: e.target.value}))} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900" min="0" step="0.01"/>
                            <button type="button" onClick={handleAddItem} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md transition-colors">إضافة</button>
                         </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto">
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">المواد المضافة</h4>
                        <ul className="space-y-2">
                        {items.map((item, index) => {
                           const invItem = inventoryItems.find(i => i.id === item.inventoryItemId);
                           return (
                            <li key={index} className="flex justify-between items-center p-2 bg-slate-100 rounded-md">
                                <div>
                                    <p className="font-semibold">{invItem?.name}</p>
                                    <p className="text-sm text-slate-500">الكمية: {item.quantity} {invItem?.unit}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-bold">ر.س {item.cost.toFixed(2)}</p>
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                                </div>
                            </li>
                           );
                        })}
                        </ul>
                    </div>

                    <div className="border-t border-slate-200 pt-4 mt-auto">
                         <div className="flex justify-between items-center mb-4 text-xl">
                            <span className="font-semibold text-slate-700">الإجمالي:</span>
                            <span className="font-bold text-orange-600">ر.س {totalCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={onCancel} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md transition-colors">إلغاء</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">حفظ الفاتورة</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
