import React, { useState, useEffect } from 'react';
import type { Order, Customer, User } from '../types';
import { OrderStatus } from '../types';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: number, newStatus: OrderStatus) => void;
  customer?: Customer;
  drivers: User[];
  onAssignDriver: (orderId: number, driverId: number) => void;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-blue-500';
    case OrderStatus.PREPARING:
      return 'bg-yellow-500';
    case OrderStatus.READY:
      return 'bg-green-500';
    case OrderStatus.OUT_FOR_DELIVERY:
      return 'bg-purple-500';
    default:
      return 'bg-slate-500';
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, customer, drivers, onAssignDriver }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - order.timestamp.getTime()) / 1000);
      setElapsedTime(seconds);
    }, 1000);

    return () => clearInterval(timer);
  }, [order.timestamp]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAssignClick = () => {
    if (selectedDriverId) {
      onAssignDriver(order.id, parseInt(selectedDriverId, 10));
    }
  };

  const getAction = () => {
    switch (order.status) {
      case OrderStatus.PENDING:
        return (
          <button
            onClick={() => onUpdateStatus(order.id, OrderStatus.PREPARING)}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded-b-lg transition-colors"
          >
            بدء التحضير
          </button>
        );
      case OrderStatus.PREPARING:
        return (
          <button
            onClick={() => onUpdateStatus(order.id, OrderStatus.READY)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-b-lg transition-colors"
          >
            تحديد كـ جاهز
          </button>
        );
      case OrderStatus.READY:
        if (order.orderType === 'delivery') {
          return (
            <div className="p-2 bg-slate-100 rounded-b-lg space-y-2">
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md py-1 px-2 text-slate-900 text-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="" disabled>اختر سائق</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.username}</option>
                ))}
              </select>
              <button
                onClick={handleAssignClick}
                disabled={!selectedDriverId || drivers.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-md transition-colors disabled:bg-slate-400"
              >
                {drivers.length > 0 ? 'تعيين وتغيير الحالة' : 'لا يوجد سائقين'}
              </button>
            </div>
          );
        }
        return (
          <button
            onClick={() => onUpdateStatus(order.id, OrderStatus.SERVED)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-b-lg transition-colors"
          >
            تحديد كـ مقدّم
          </button>
        );
      case OrderStatus.OUT_FOR_DELIVERY:
         return (
          <button
            onClick={() => onUpdateStatus(order.id, OrderStatus.SERVED)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-b-lg transition-colors"
          >
            تحديد كـ تم التوصيل
          </button>
        );
      default:
        return null;
    }
  };

  const statusColor = getStatusColor(order.status);
  const isDelivery = order.orderType === 'delivery';
  const assignedDriver = drivers.find(d => d.id === order.driverId);

  return (
    <div className="bg-slate-50 rounded-lg shadow-lg flex flex-col h-full border border-slate-200">
      <div className={`p-3 rounded-t-lg flex justify-between items-center text-white ${statusColor}`}>
        <div>
          <h3 className="font-bold text-lg">طلب #{order.id}</h3>
          <p className="text-sm">
            {isDelivery ? `توصيل: ${customer?.name || 'عميل غير محدد'}` : `طاولة: ${order.tableNumber}`}
          </p>
           {assignedDriver && (
             <p className="text-xs mt-1 font-semibold bg-black bg-opacity-20 px-2 py-0.5 rounded">
                السائق: {assignedDriver.username}
             </p>
          )}
        </div>
        <div className="text-right">
          <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          <p className="text-xs uppercase tracking-wider">{order.status}</p>
        </div>
      </div>
      <ul className="p-3 space-y-1 flex-grow overflow-y-auto max-h-48">
        {order.items.map(item => (
          <li key={item.id} className="flex justify-between items-center text-sm">
            <span className="text-slate-700">{item.name}</span>
            <span className="font-bold text-orange-500">x{item.quantity}</span>
          </li>
        ))}
      </ul>
      {getAction()}
    </div>
  );
};