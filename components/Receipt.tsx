import React from 'react';
import type { Order, Customer } from '../types';

interface ReceiptProps {
  order: Order;
  customer: Customer | undefined;
  restaurantName: string;
  onDone: () => void;
  template: 'standard' | 'compact';
}

export const Receipt: React.FC<ReceiptProps> = ({ order, customer, restaurantName, onDone, template }) => {

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isCompact = template === 'compact';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-50 no-print">
        <div className="receipt-container relative bg-white rounded-lg shadow-xl">
        <style>{`
            @media print {
            body * {
                visibility: hidden;
            }
            .receipt-container, .receipt-container * {
                visibility: visible;
            }
            .receipt-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
                padding: 0;
                margin: 0;
                box-shadow: none;
                border-radius: 0;
            }
            .no-print {
                display: none !important;
            }
            .receipt-compact {
                max-width: 300px;
                font-size: 12px;
                padding: 12px;
            }
            .receipt-compact h1 {
                font-size: 1.25rem;
            }
            .receipt-compact .font-bold {
                font-weight: 600;
            }
            .receipt-compact table, .receipt-compact div {
                line-height: 1.5;
            }
            }
        `}</style>
        <div className={`bg-white p-8 max-w-sm mx-auto text-right font-sans text-black ${isCompact ? 'receipt-compact' : ''}`}>
            <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">{restaurantName}</h1>
            <p>فاتورة طلب</p>
            </div>
            <div className="border-b-2 border-dashed border-black pb-2 mb-2">
            <p>رقم الطلب: #{order.id}</p>
            <p>التاريخ: {new Date(order.timestamp).toLocaleString('ar-SA')}</p>
            {order.orderType === 'dine-in' && order.tableNumber && <p>طاولة: {order.tableNumber}</p>}
            {order.orderType === 'delivery' && customer && (
                <>
                <p>العميل: {customer.name}</p>
                <p>الهاتف: {customer.phone}</p>
                <p>العنوان: {customer.address}</p>
                </>
            )}
            </div>
            <table className="w-full mb-2">
            <thead>
                <tr className="border-b border-dashed border-black">
                <th className="text-right py-1">الصنف</th>
                <th className="text-center py-1">الكمية</th>
                <th className="text-left py-1">السعر</th>
                </tr>
            </thead>
            <tbody>
                {order.items.map(item => (
                <tr key={item.id}>
                    <td className="py-1">{item.name}</td>
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-left py-1">{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
                ))}
            </tbody>
            </table>
            <div className="border-t-2 border-dashed border-black pt-2 space-y-1">
            <div className="flex justify-between">
                <span>الإجمالي الفرعي</span>
                <span>ر.س {subtotal.toFixed(2)}</span>
            </div>
            {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                    <span>الخصم</span>
                    <span>- ر.س {order.discount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي</span>
                <span>ر.س {order.totalAmount.toFixed(2)}</span>
            </div>
            </div>
            <div className="text-center mt-6">
                <p>شكراً لزيارتكم!</p>
            </div>
        </div>
        </div>
        <div className="no-print mt-4 flex justify-center gap-4">
            <button
                onClick={onDone}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-6 rounded-md transition-colors"
            >
                إغلاق
            </button>
            <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
            >
                طباعة
            </button>
        </div>
    </div>
  );
};