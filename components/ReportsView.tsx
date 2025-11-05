import React, { useState, useMemo } from 'react';
import type { Order, MenuItem, InventoryItem, Customer, SystemSettings } from '../types';
import { OrderStatus } from '../types';
import { Receipt } from './Receipt';

interface ReportsViewProps {
    orders: Order[];
    menuItems: MenuItem[];
    inventoryItems: InventoryItem[];
    customers: Customer[];
    restaurantName: string;
    systemSettings: SystemSettings;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';
type ReportTab = 'financials' | 'sales' | 'inventory' | 'position';


export const ReportsView: React.FC<ReportsViewProps> = ({ orders, menuItems, inventoryItems, customers, restaurantName, systemSettings }) => {
    const [activeTab, setActiveTab] = useState<ReportTab>('financials');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
    const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);

    // Filtering Logic
    const isDateInFilter = (date: Date, filter: TimeFilter) => {
        const targetDate = new Date(date);
        if (filter === 'all') return true;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        let startDate: Date;

        switch (filter) {
            case 'today':
                startDate = startOfToday;
                break;
            case 'week':
                startDate = new Date(startOfToday);
                startDate.setDate(startOfToday.getDate() - 6); // Today + 6 previous days
                break;
            case 'month':
                startDate = new Date(startOfToday);
                startDate.setMonth(startOfToday.getMonth() - 1);
                break;
            default:
                return true;
        }
        
        return targetDate >= startDate && targetDate <= endOfToday;
    };
    
    const filteredCompletedOrders = useMemo(() => 
        orders.filter(order => order.status === OrderStatus.SERVED && isDateInFilter(order.timestamp, timeFilter))
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    , [orders, timeFilter]);

    // Common UI elements
    const tabStyle = "py-2 px-4 text-sm font-medium transition-colors duration-200 rounded-t-lg";
    const activeSubTabStyle = "bg-white text-orange-600 border-b-2 border-orange-500";
    const inactiveSubTabStyle = "bg-transparent text-slate-500 hover:bg-slate-200";

    const filterButtonStyle = "px-3 py-1 text-sm rounded-full transition-colors";
    const activeFilterStyle = "bg-orange-500 text-white font-semibold";
    const inactiveFilterStyle = "bg-slate-200 text-slate-700 hover:bg-slate-300";


    // Financial Report Component
    const FinancialsReport: React.FC = () => {
        const { totalRevenue, totalCost, totalProfit } = useMemo(() => {
            let revenue = 0;
            let cost = 0;
            filteredCompletedOrders.forEach(order => {
                revenue += order.totalAmount;
                order.items.forEach(item => {
                    cost += item.cost * item.quantity;
                });
            });
            return { totalRevenue: revenue, totalCost: cost, totalProfit: revenue - cost };
        }, [filteredCompletedOrders]);

        const salesByItem = useMemo(() => {
            const itemMap = new Map<string, { quantity: number; revenue: number; cost: number; profit: number }>();
            filteredCompletedOrders.forEach(order => {
                const orderSubtotal = order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                const orderDiscountRatio = order.discount && orderSubtotal > 0 ? 1 - (order.discount / orderSubtotal) : 1;
                
                order.items.forEach(item => {
                    const existing = itemMap.get(item.name) || { quantity: 0, revenue: 0, cost: 0, profit: 0 };
                    const itemSubtotal = item.quantity * item.price;
                    const itemRevenue = itemSubtotal * orderDiscountRatio;
                    const itemCost = item.quantity * item.cost;

                    existing.quantity += item.quantity;
                    existing.revenue += itemRevenue;
                    existing.cost += itemCost;
                    existing.profit += itemRevenue - itemCost;
                    itemMap.set(item.name, existing);
                });
            });
            return Array.from(itemMap.entries())
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.quantity - a.quantity);
        }, [filteredCompletedOrders]);

        return (
            <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                        <h4 className="text-slate-500 text-sm font-medium">إجمالي الإيرادات (بعد الخصم)</h4>
                        <p className="text-3xl font-bold text-blue-500">ر.س {totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                        <h4 className="text-slate-500 text-sm font-medium">إجمالي الربح</h4>
                        <p className="text-3xl font-bold text-green-500">ر.س {totalProfit.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                        <h4 className="text-slate-500 text-sm font-medium">الطلبات المكتملة</h4>
                        <p className="text-3xl font-bold text-orange-500">{filteredCompletedOrders.length}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">الأصناف الأكثر ربحاً</h4>
                    {salesByItem.length > 0 ? (
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                            {salesByItem.sort((a,b) => b.profit - a.profit).slice(0, 5).map(item => (
                                <li key={item.name} className="flex justify-between items-center text-slate-700 p-2 bg-slate-50 rounded-md">
                                    <span className="font-medium">{item.name} ({item.quantity})</span>
                                    <span className="font-bold text-green-500">ر.س {item.profit.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : ( <p className="text-slate-500 text-center py-4">لا توجد بيانات.</p> )}
                </div>
            </div>
        )
    };
    
    // Sales Report Component
    const SalesReport: React.FC = () => {
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                 <h3 className="text-xl font-bold text-slate-900 mb-4">تقرير المبيعات</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-slate-700">
                         <thead className="text-xs text-slate-600 uppercase bg-slate-50">
                            <tr>
                                <th className="py-3 px-6">رقم الطلب</th>
                                <th className="py-3 px-6">التاريخ</th>
                                <th className="py-3 px-6">النوع</th>
                                <th className="py-3 px-6">الإجمالي</th>
                                <th className="py-3 px-6">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompletedOrders.map(order => (
                                <tr key={order.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-4 px-6 font-medium text-slate-900">#{order.id}</td>
                                    <td className="py-4 px-6">{new Date(order.timestamp).toLocaleString('ar-SA')}</td>
                                    <td className="py-4 px-6">{order.orderType === 'dine-in' ? 'محلي' : 'توصيل'}</td>
                                    <td className="py-4 px-6 font-bold">ر.س {order.totalAmount.toFixed(2)}</td>
                                    <td className="py-4 px-6">
                                        <button onClick={() => setOrderToPrint(order)} className="font-medium text-blue-600 hover:underline">
                                            طباعة
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
                 {filteredCompletedOrders.length === 0 && <p className="text-slate-500 text-center py-8">لا توجد مبيعات في الفترة المحددة.</p>}
            </div>
        )
    }

    // Inventory Report Component
    const InventoryReport: React.FC = () => {
        const inventoryValue = useMemo(() => 
            inventoryItems.reduce((sum, item) => sum + (item.stock * item.costPerUnit), 0),
        [inventoryItems]);

        return (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                 <h3 className="text-xl font-bold text-slate-900 mb-4">تقرير المخزون</h3>
                 <div className="mb-4 text-lg font-bold">
                    قيمة المخزون الإجمالية: <span className="text-green-600">ر.س {inventoryValue.toFixed(2)}</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-slate-700">
                         <thead className="text-xs text-slate-600 uppercase bg-slate-50">
                            <tr>
                                <th className="py-3 px-6">المادة</th>
                                <th className="py-3 px-6">الكمية المتاحة</th>
                                <th className="py-3 px-6">تكلفة الوحدة</th>
                                <th className="py-3 px-6">القيمة الإجمالية</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryItems.map(item => (
                                <tr key={item.id} className={`border-b border-slate-200 hover:bg-slate-50 ${item.stock < 10 ? 'bg-red-50' : 'bg-white'}`}>
                                    <td className="py-4 px-6 font-medium text-slate-900">{item.name}</td>
                                    <td className="py-4 px-6 font-bold">{item.stock} {item.unit}</td>
                                    <td className="py-4 px-6">ر.س {item.costPerUnit.toFixed(2)}</td>
                                    <td className="py-4 px-6 font-bold text-orange-600">ر.س {(item.stock * item.costPerUnit).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        )
    }
    
    // Financial Position Component
    const FinancialPositionReport: React.FC = () => {
        const inventoryValue = useMemo(() => 
            inventoryItems.reduce((sum, item) => sum + (item.stock * item.costPerUnit), 0),
        [inventoryItems]);

        const totalRevenue = useMemo(() => {
             return filteredCompletedOrders.reduce((total, order) => total + order.totalAmount, 0);
        }, [filteredCompletedOrders]);

        const totalAssets = inventoryValue + totalRevenue;

        return (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                 <h3 className="text-xl font-bold text-slate-900 mb-4">قائمة الموقف المالي (حسب الفلتر)</h3>
                 <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-slate-800 text-lg mb-2">الأصول</h4>
                        <dl className="space-y-2">
                            <div className="flex justify-between items-center">
                                <dt className="text-slate-600">قيمة المخزون</dt>
                                <dd className="font-mono text-lg font-semibold text-blue-600">ر.س {inventoryValue.toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between items-center">
                                <dt className="text-slate-600">النقدية (من الإيرادات)</dt>
                                <dd className="font-mono text-lg font-semibold text-blue-600">ر.س {totalRevenue.toFixed(2)}</dd>
                            </div>
                        </dl>
                    </div>
                     <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg">
                        <dt className="text-xl font-bold text-green-800">إجمالي الأصول</dt>
                        <dd className="font-mono text-2xl font-extrabold text-green-800">ر.س {totalAssets.toFixed(2)}</dd>
                    </div>
                 </div>
            </div>
        )
    }


    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <nav className="flex space-x-1 p-1 bg-slate-200 rounded-lg">
                    <button onClick={() => setActiveTab('financials')} className={`${tabStyle} ${activeTab === 'financials' ? activeSubTabStyle : inactiveSubTabStyle}`}>التقرير المالي</button>
                    <button onClick={() => setActiveTab('sales')} className={`${tabStyle} ${activeTab === 'sales' ? activeSubTabStyle : inactiveSubTabStyle}`}>تقرير المبيعات</button>
                    <button onClick={() => setActiveTab('inventory')} className={`${tabStyle} ${activeTab === 'inventory' ? activeSubTabStyle : inactiveSubTabStyle}`}>تقرير المخزون</button>
                    <button onClick={() => setActiveTab('position')} className={`${tabStyle} ${activeTab === 'position' ? activeSubTabStyle : inactiveSubTabStyle}`}>الموقف المالي</button>
                </nav>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setTimeFilter('today')} className={`${filterButtonStyle} ${timeFilter === 'today' ? activeFilterStyle : inactiveFilterStyle}`}>اليوم</button>
                    <button onClick={() => setTimeFilter('week')} className={`${filterButtonStyle} ${timeFilter === 'week' ? activeFilterStyle : inactiveFilterStyle}`}>آخر 7 أيام</button>
                    <button onClick={() => setTimeFilter('month')} className={`${filterButtonStyle} ${timeFilter === 'month' ? activeFilterStyle : inactiveFilterStyle}`}>آخر 30 يوم</button>
                    <button onClick={() => setTimeFilter('all')} className={`${filterButtonStyle} ${timeFilter === 'all' ? activeFilterStyle : inactiveFilterStyle}`}>الكل</button>
                </div>
            </div>

            <div className="mt-4">
                {activeTab === 'financials' && <FinancialsReport />}
                {activeTab === 'sales' && <SalesReport />}
                {activeTab === 'inventory' && <InventoryReport />}
                {activeTab === 'position' && <FinancialPositionReport />}
            </div>

            {orderToPrint && (
                <Receipt 
                    order={orderToPrint}
                    customer={customers.find(c => c.id === orderToPrint.customerId)}
                    restaurantName={restaurantName}
                    onDone={() => setOrderToPrint(null)}
                    template={systemSettings.receiptTemplate}
                />
            )}
        </div>
    );
}