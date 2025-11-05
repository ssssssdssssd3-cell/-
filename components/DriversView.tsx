import React, { useState, useMemo } from 'react';
import type { User, Order, Customer } from '../types';
import { OrderStatus } from '../types';

interface DriversViewProps {
    users: User[];
    orders: Order[];
    customers: Customer[];
}

const DriverOrderCard: React.FC<{order: Order, customerName: string}> = ({ order, customerName }) => {
    // A simplified card for this view
    const statusColors: Record<string, string> = {
        [OrderStatus.OUT_FOR_DELIVERY]: 'text-purple-600 bg-purple-100',
        [OrderStatus.SERVED]: 'text-green-600 bg-green-100',
    };
    const statusStyle = statusColors[order.status] || 'text-slate-600 bg-slate-100';

    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-800">طلب #{order.id}</p>
                    <p className="text-sm text-slate-600">{customerName}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusStyle}`}>{order.status}</span>
            </div>
             <div className="mt-2 pt-2 border-t border-slate-100 text-sm text-slate-500">
                <p>العناصر: {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
            </div>
        </div>
    )
}

export const DriversView: React.FC<DriversViewProps> = ({ users, orders, customers }) => {
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

    const drivers = useMemo(() => users.filter(u => u.role === 'driver'), [users]);
    
    const selectedDriver = useMemo(() => 
        drivers.find(d => d.id === selectedDriverId), 
    [drivers, selectedDriverId]);
    
    const driverOrders = useMemo(() => 
        orders.filter(o => o.driverId === selectedDriverId && o.orderType === 'delivery')
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [orders, selectedDriverId]);

    const getCustomerName = (id?: number) => customers.find(c => c.id === id)?.name || 'N/A';
    
    const activeDeliveriesCount = (driverId: number) => {
        return orders.filter(o => o.driverId === driverId && o.status === OrderStatus.OUT_FOR_DELIVERY).length;
    }

    return (
        <div className="flex h-full bg-slate-50">
            {/* Drivers List */}
            <div className="w-1/3 border-l border-slate-200 p-4 overflow-y-auto">
                <h3 className="text-xl font-bold text-slate-800 mb-4">قائمة السائقين</h3>
                <ul className="space-y-2">
                    {drivers.map(driver => (
                        <li key={driver.id}>
                            <button 
                                onClick={() => setSelectedDriverId(driver.id)}
                                className={`w-full text-right p-3 rounded-lg transition-colors duration-200 flex justify-between items-center ${selectedDriverId === driver.id ? 'bg-orange-500 text-white shadow' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}`}
                            >
                                <span className="font-semibold">{driver.username}</span>
                                {activeDeliveriesCount(driver.id) > 0 &&
                                    <span className="text-xs font-bold bg-purple-500 text-white px-2 py-1 rounded-full">{activeDeliveriesCount(driver.id)} نشط</span>
                                }
                            </button>
                        </li>
                    ))}
                     {drivers.length === 0 && (
                        <p className="text-center text-slate-500 py-8">لا يوجد سائقين. أضف موظفين بصلاحية "سائق".</p>
                    )}
                </ul>
            </div>
            
            {/* Driver Details */}
            <div className="w-2/3 p-6 overflow-y-auto">
                {selectedDriver ? (
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                            طلبات السائق: <span className="text-orange-600">{selectedDriver.username}</span>
                        </h2>
                        <p className="text-slate-500 mb-6">
                            إجمالي الطلبات المسندة: {driverOrders.length}
                        </p>
                        {driverOrders.length > 0 ? (
                           <div className="space-y-4">
                               {driverOrders.map(order => (
                                   <DriverOrderCard 
                                       key={order.id} 
                                       order={order}
                                       customerName={getCustomerName(order.customerId)} 
                                   />
                               ))}
                           </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-slate-500">لا توجد طلبات مسندة لهذا السائق.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500 text-lg">الرجاء اختيار سائق لعرض طلباته.</p>
                    </div>
                )}
            </div>
        </div>
    );
};