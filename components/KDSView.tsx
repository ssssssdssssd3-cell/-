import React from 'react';
import type { Order, Customer, User } from '../types';
import { OrderStatus } from '../types';
import { OrderCard } from './OrderCard';

interface KDSViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: number, newStatus: OrderStatus) => void;
  customers: Customer[];
  users: User[];
  onAssignDriver: (orderId: number, driverId: number) => void;
}

export const KDSView: React.FC<KDSViewProps> = ({ orders, onUpdateStatus, customers, users, onAssignDriver }) => {
  const activeOrders = orders.filter(order => order.status !== OrderStatus.SERVED);
  const drivers = users.filter(user => user.role === 'driver');

  return (
    <div className="bg-white rounded-lg shadow-2xl flex flex-col h-full">
      <h2 className="text-2xl font-bold p-4 border-b border-slate-200 text-slate-900">شاشة المطبخ</h2>
      <div className="flex-grow p-4 overflow-y-auto">
        {activeOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-lg">لا توجد طلبات نشطة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={onUpdateStatus} 
                customer={customers.find(c => c.id === order.customerId)}
                drivers={drivers}
                onAssignDriver={onAssignDriver}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};