import React, { useState, useMemo } from 'react';
import type { MenuItem, OrderItem, User, Customer, Order, SystemSettings } from '../types';
import { ICON_MAP } from '../constants';
import { PencilIcon, ArrowDownTrayIcon } from './IconComponents';
import { PriceEditModal } from './PriceEditModal';
import { CustomerSelectModal } from './CustomerSelectModal';
import { Receipt } from './Receipt';

interface POSViewProps {
  menuItems: MenuItem[];
  currentUser: User;
  customers: Customer[];
  users: User[];
  onPlaceOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status' | 'restaurantId'>) => Order;
  onEditPrice: (itemId: number, newPrice: number) => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'restaurantId'>) => Customer;
  restaurantName: string;
  systemSettings: SystemSettings;
  onManualBackup: () => void;
}

export const POSView: React.FC<POSViewProps> = ({ menuItems, currentUser, customers, users, onPlaceOrder, onEditPrice, onAddCustomer, restaurantName, systemSettings, onManualBackup }) => {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [tableNumber, setTableNumber] = useState<number | ''>('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [driverId, setDriverId] = useState<number | ''>('');
  const [discount, setDiscount] = useState<string>('');
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);


  const categories = useMemo(() => ['all', ...Array.from(new Set(menuItems.map(item => item.category)))], [menuItems]);
  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === 'all') return menuItems;
    return menuItems.filter(item => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);
  
  const drivers = useMemo(() => users.filter(u => u.role === 'driver'), [users]);

  const subtotal = useMemo(() => currentOrder.reduce((acc, item) => acc + item.price * item.quantity, 0), [currentOrder]);
  const total = useMemo(() => {
      const discountValue = parseFloat(discount) || 0;
      return Math.max(0, subtotal - discountValue);
  }, [subtotal, discount]);

  const selectedCustomer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);

  const addToOrder = (item: MenuItem) => {
    const existingItem = currentOrder.find(orderItem => orderItem.id === item.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(orderItem =>
        orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCurrentOrder(currentOrder.filter(item => item.id !== itemId));
    } else {
      setCurrentOrder(currentOrder.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    }
  };
  
  const handlePlaceOrder = () => {
    if (currentOrder.length === 0) return;
    if (orderType === 'dine-in' && !tableNumber) {
        alert('الرجاء إدخال رقم الطاولة');
        return;
    }
     if (orderType === 'delivery' && !customerId) {
        alert('الرجاء اختيار العميل');
        return;
    }
    
    const newOrderData: Omit<Order, 'id' | 'timestamp' | 'status' | 'restaurantId'> = {
        items: currentOrder,
        orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber || undefined : undefined,
        customerId: orderType === 'delivery' ? customerId || undefined : undefined,
        driverId: orderType === 'delivery' ? (driverId ? Number(driverId) : undefined) : undefined,
        salespersonId: currentUser.id,
        discount: parseFloat(discount) || 0,
        totalAmount: total,
    };
    const placedOrder = onPlaceOrder(newOrderData);
    
    setOrderToPrint(placedOrder);
    
    // Reset state
    setCurrentOrder([]);
    setTableNumber('');
    setCustomerId(null);
    setDriverId('');
    setDiscount('');
  };
  
  const handleSavePrice = (itemId: number, newPrice: number) => {
     setCurrentOrder(currentOrder.map(item => item.id === itemId ? { ...item, price: newPrice } : item));
     onEditPrice(itemId, newPrice);
     setEditingItem(null);
  }

  return (
    <div className="flex h-full bg-slate-100">
      {/* Menu */}
      <div className="w-2/3 flex flex-col p-4">
        <nav className="flex-shrink-0 bg-white rounded-lg shadow-sm p-2 mb-4">
          <ul className="flex flex-wrap gap-2">
            {categories.map(category => (
              <li key={category}>
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${selectedCategory === category ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                  {category === 'all' ? 'الكل' : category}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-grow bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMenuItems.map(item => {
              const Icon = ICON_MAP[item.iconName] || (() => <div />);
              return (
                <button key={item.id} onClick={() => addToOrder(item)} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center hover:shadow-lg hover:border-orange-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 flex flex-col">
                  {item.imageUrl ? 
                    <img src={item.imageUrl} alt={item.name} className="w-full h-20 object-cover rounded-md mb-2" />
                    : <Icon className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                  }
                  <div className="flex-grow">
                    <h3 className="font-bold text-sm text-slate-800">{item.name}</h3>
                    {item.description && <p className="text-xs text-slate-500 mt-1 h-8 overflow-hidden" title={item.description}>{item.description}</p>}
                  </div>
                  <p className="text-xs text-orange-500 font-semibold mt-1">ر.س {item.price.toFixed(2)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Order */}
      <div className="w-1/3 bg-white shadow-lg flex flex-col p-4 border-l border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">الطلب الحالي</h2>
        <div className="flex bg-slate-200 rounded-lg p-1 mb-4">
          <button onClick={() => setOrderType('dine-in')} className={`w-1/2 py-2 rounded-md font-semibold text-sm transition-colors ${orderType === 'dine-in' ? 'bg-white text-orange-600 shadow' : 'text-slate-600'}`}>محلي</button>
          <button onClick={() => setOrderType('delivery')} className={`w-1/2 py-2 rounded-md font-semibold text-sm transition-colors ${orderType === 'delivery' ? 'bg-white text-orange-600 shadow' : 'text-slate-600'}`}>توصيل</button>
        </div>
        
        {orderType === 'dine-in' ? (
          <input type="number" value={tableNumber} onChange={e => setTableNumber(parseInt(e.target.value) || '')} placeholder="رقم الطاولة" className="w-full bg-slate-100 border border-slate-300 rounded-md p-2 mb-4 focus:ring-orange-500 focus:border-orange-500" />
        ) : (
            <div className="mb-4 space-y-2">
                <button onClick={() => setIsCustomerModalOpen(true)} className="w-full bg-slate-100 border border-slate-300 rounded-md p-2 text-slate-800 hover:bg-slate-200">
                    {selectedCustomer ? `العميل: ${selectedCustomer.name}` : 'اختيار عميل'}
                </button>
                <select value={driverId} onChange={e => setDriverId(parseInt(e.target.value) || '')} className="w-full bg-slate-100 border border-slate-300 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">-- تعيين سائق (اختياري) --</option>
                    {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>{driver.username}</option>
                    ))}
                </select>
            </div>
        )}

        <ul className="flex-grow space-y-2 overflow-y-auto pr-2 -mr-2">
          {currentOrder.length > 0 ? currentOrder.map(item => (
            <li key={item.id} className="bg-slate-50 p-3 rounded-lg flex items-center gap-4">
              <div className="flex-grow">
                <p className="font-semibold text-slate-800">{item.name}</p>
                <p className="text-sm text-slate-500">ر.س {item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                 {currentUser.permissions.canEditPrices &&
                    <button onClick={() => setEditingItem(item)} className="p-1 text-slate-500 hover:text-blue-500">
                        <PencilIcon className="h-4 w-4" />
                    </button>
                 }
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="font-bold bg-slate-200 h-6 w-6 rounded-full">-</button>
                <span className="font-bold w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="font-bold bg-slate-200 h-6 w-6 rounded-full">+</button>
              </div>
            </li>
          )) : <p className="text-center text-slate-500 pt-16">لا توجد أصناف في الطلب.</p>}
        </ul>

        <div className="mt-auto pt-4 border-t-2 border-slate-200">
           <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-md">
                    <span className="font-medium text-slate-600">الإجمالي الفرعي:</span>
                    <span className="font-semibold text-slate-800">ر.س {subtotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center text-md">
                    <label htmlFor="discount" className="font-medium text-slate-600">الخصم:</label>
                    <input 
                        id="discount"
                        type="number" 
                        value={discount} 
                        onChange={e => setDiscount(e.target.value)} 
                        placeholder="0.00" 
                        className="w-24 bg-slate-100 border border-slate-300 rounded-md p-1 text-left focus:ring-orange-500 focus:border-orange-500" 
                    />
                </div>
           </div>

          <div className="flex justify-between items-center text-xl mb-4 p-2 bg-slate-100 rounded-lg">
            <span className="font-semibold text-slate-700">الإجمالي النهائي:</span>
            <span className="font-extrabold text-orange-600">ر.س {total.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={handlePlaceOrder} disabled={currentOrder.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-400">
                تأكيد الطلب
            </button>
            <button 
                onClick={onManualBackup} 
                className="w-full flex justify-center items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg transition-colors"
            >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>أخذ نسخة احتياطية</span>
            </button>
          </div>
        </div>
      </div>
      
      {editingItem && (
        <PriceEditModal
            isOpen={!!editingItem}
            item={editingItem}
            onSave={handleSavePrice}
            onClose={() => setEditingItem(null)}
        />
      )}
      
      {isCustomerModalOpen && (
        <CustomerSelectModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          customers={customers}
          onSelectCustomer={(id) => { setCustomerId(id); setIsCustomerModalOpen(false); }}
          onAddCustomer={onAddCustomer as (customer: Omit<Customer, 'id' | 'restaurantId'>) => Customer}
        />
      )}

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
};