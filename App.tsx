import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
// Types
import type {
    MenuItem,
    Order,
    User,
    Customer,
    InventoryItem,
    Supplier,
    Purchase,
    UserWithPassword,
    SystemSettings,
    UserPermissions,
    Restaurant,
    BackupData
} from './types';
import { OrderStatus } from './types';
import { addBackup, clearOldBackups } from './indexedDB';

// Components
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { POSView } from './components/POSView';
import { KDSView } from './components/KDSView';
import { AdminView } from './components/AdminView';
import { SubscriptionExpiredView } from './components/SubscriptionExpiredView';
import { ActivationView } from './components/ActivationView';
import { SystemOwnerView } from './components/SystemOwnerView';
import { InitialActivationView } from './components/InitialActivationView';


// A simple hook to manage state with localStorage
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            if (!storedValue) return defaultValue;

            // JSON.parse with a reviver function to correctly handle Date objects
            const parsed = JSON.parse(storedValue, (k, v) => {
                // Look for strings that look like ISO date strings
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v)) {
                    return new Date(v);
                }
                return v;
            });
            return parsed;

        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            // FIX: Complete the JSON.stringify call with the state variable.
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    // FIX: Add missing return statement. The hook must return the state and setter.
    return [state, setState];
}

const DEFAULT_SETTINGS: SystemSettings = {
    appName: 'FoodCore',
    appSubtitle: 'RMS',
    receiptTemplate: 'compact',
    autoPrintReceipt: false,
};

const DEFAULT_PERMISSIONS: UserPermissions = {
    canAccessAdmin: false,
    canManageMenu: false,
    canManageInventory: false,
    canManageUsers: false,
    canViewReports: false,
    canEditPrices: false,
};

const App: React.FC = () => {
    // Global State
    const [restaurants, setRestaurants] = usePersistentState<Restaurant[]>('restaurants', []);
    const [systemSettings, setSystemSettings] = usePersistentState<SystemSettings>('systemSettings', DEFAULT_SETTINGS);

    // Per-Restaurant State
    const [currentRestaurantId, setCurrentRestaurantId] = usePersistentState<string | null>('currentRestaurantId', null);
    const [users, setUsers] = usePersistentState<UserWithPassword[]>('users', []);
    const [menuItems, setMenuItems] = usePersistentState<MenuItem[]>('menuItems', []);
    const [orders, setOrders] = usePersistentState<Order[]>('orders', []);
    const [customers, setCustomers] = usePersistentState<Customer[]>('customers', []);
    const [inventoryItems, setInventoryItems] = usePersistentState<InventoryItem[]>('inventoryItems', []);
    const [suppliers, setSuppliers] = usePersistentState<Supplier[]>('suppliers', []);
    const [purchases, setPurchases] = usePersistentState<Purchase[]>('purchases', []);

    // Session State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'pos' | 'kds' | 'admin'>('pos');
    const [superAdminLogin, setSuperAdminLogin] = useState(false);
    const [lastManualBackupTimestamp, setLastManualBackupTimestamp] = usePersistentState<number | null>('lastManualBackupTimestamp', null);
    
    const currentRestaurant = useMemo(() => restaurants.find(r => r.id === currentRestaurantId), [restaurants, currentRestaurantId]);

    // Filtered data for the current restaurant
    const restaurantUsers = useMemo(() => users.filter(u => u.restaurantId === currentRestaurantId), [users, currentRestaurantId]);
    const restaurantMenuItems = useMemo(() => menuItems.filter(item => item.restaurantId === currentRestaurantId), [menuItems, currentRestaurantId]);
    const restaurantOrders = useMemo(() => orders.filter(order => order.restaurantId === currentRestaurantId), [orders, currentRestaurantId]);
    const restaurantCustomers = useMemo(() => customers.filter(c => c.restaurantId === currentRestaurantId), [customers, currentRestaurantId]);
    const restaurantInventory = useMemo(() => inventoryItems.filter(i => i.restaurantId === currentRestaurantId), [inventoryItems, currentRestaurantId]);
    const restaurantSuppliers = useMemo(() => suppliers.filter(s => s.restaurantId === currentRestaurantId), [suppliers, currentRestaurantId]);
    const restaurantPurchases = useMemo(() => purchases.filter(p => p.restaurantId === currentRestaurantId), [purchases, currentRestaurantId]);

    // Handlers
    const handleLogin = (username: string, password: string) => {
        if (username === 'superadmin' && password === 'superadmin') {
            setSuperAdminLogin(true);
            return;
        }
        const user = restaurantUsers.find(u => u.username === username && u.password === password);
        if (user) {
            setCurrentUser(user);
            setLoginError(null);
            setCurrentView('pos');
        } else {
            setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setSuperAdminLogin(false);
    };

    const handleSwitchRestaurant = () => {
        setCurrentUser(null);
        setCurrentRestaurantId(null);
    };

    const handlePlaceOrder = (orderData: Omit<Order, 'id' | 'timestamp' | 'status' | 'restaurantId'>): Order => {
        const newOrder: Order = {
            ...orderData,
            id: Date.now(),
            timestamp: new Date(),
            status: OrderStatus.PENDING,
            restaurantId: currentRestaurantId!,
        };
        setOrders(prev => [...prev, newOrder]);
        return newOrder;
    };

    const handleUpdateOrderStatus = (orderId: number, newStatus: OrderStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    const handleAssignDriver = (orderId: number, driverId: number) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, driverId, status: OrderStatus.OUT_FOR_DELIVERY } : o));
    }
    
    const handleAddItem = (item: Omit<MenuItem, 'id'| 'restaurantId'>) => {
        setMenuItems(prev => [...prev, { ...item, id: Date.now(), restaurantId: currentRestaurantId! }]);
    };
    
    const handleUpdateItem = (updatedItem: MenuItem) => {
        setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    };

    const handleDeleteItem = (itemId: number) => {
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
    };
    
    const handleEditPrice = (itemId: number, newPrice: number) => {
        setMenuItems(prev => prev.map(item => item.id === itemId ? {...item, price: newPrice} : item))
    }

    const handleAddUser = (user: Omit<UserWithPassword, 'id' | 'restaurantId' | 'permissions'>) => {
        const permissions = (user.role === 'admin' || user.role === 'owner')
          ? { canAccessAdmin: true, canManageMenu: true, canManageInventory: true, canManageUsers: true, canViewReports: true, canEditPrices: true }
          : DEFAULT_PERMISSIONS;

        setUsers(prev => [...prev, { ...user, id: Date.now(), restaurantId: currentRestaurantId!, permissions }]);
    };
    
    const handleUpdateUser = (updatedUser: UserWithPassword) => {
        setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
    };

    const handleDeleteUser = (userId: number) => {
        setUsers(prev => prev.filter(user => user.id !== userId));
    };

    const handleUpdateUserPermissions = (userId: number, permissions: UserPermissions) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions } : u));
    }

    const handleAddCustomer = (customer: Omit<Customer, 'id' | 'restaurantId'>) => {
        const newCustomer = { ...customer, id: Date.now(), restaurantId: currentRestaurantId! };
        setCustomers(prev => [...prev, newCustomer]);
        return newCustomer;
    };

    const handleUpdateCustomer = (updatedCustomer: Customer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    };

    const handleDeleteCustomer = (customerId: number) => {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
    };
    
    const handleAddInventoryItem = (item: Omit<InventoryItem, 'id' | 'restaurantId'>) => {
        setInventoryItems(prev => [...prev, { ...item, id: Date.now(), restaurantId: currentRestaurantId! }]);
    };

    const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
        setInventoryItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    };

    const handleDeleteInventoryItem = (itemId: number) => {
        setInventoryItems(prev => prev.filter(i => i.id !== itemId));
    };

    const handleAddSupplier = (supplier: Omit<Supplier, 'id'|'restaurantId'>) => {
        setSuppliers(prev => [...prev, { ...supplier, id: Date.now(), restaurantId: currentRestaurantId! }]);
    };
    
    const handleUpdateSupplier = (updatedSupplier: Supplier) => {
        setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    };

    const handleDeleteSupplier = (supplierId: number) => {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    };

    const handleAddPurchase = (purchase: Omit<Purchase, 'id'|'restaurantId'>) => {
        const newPurchase = { ...purchase, id: Date.now(), restaurantId: currentRestaurantId! };
        setPurchases(prev => [...prev, newPurchase]);
        // Update inventory stock
        const newInventory = [...inventoryItems];
        newPurchase.items.forEach(purchasedItem => {
            const itemIndex = newInventory.findIndex(invItem => invItem.id === purchasedItem.inventoryItemId);
            if (itemIndex > -1) {
                newInventory[itemIndex].stock += purchasedItem.quantity;
            }
        });
        setInventoryItems(newInventory);
    };

    const handleManualBackup = () => {
        const data: BackupData = { restaurants, users, menuItems, orders, customers, inventoryItems, suppliers, purchases, systemSettings };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `foodcore_backup_${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setLastManualBackupTimestamp(Date.now());
    };

    const handleRestoreData = (data: BackupData) => {
        if(data.restaurants) setRestaurants(data.restaurants);
        if(data.users) setUsers(data.users);
        if(data.menuItems) setMenuItems(data.menuItems);
        if(data.orders) setOrders(data.orders);
        if(data.customers) setCustomers(data.customers);
        if(data.inventoryItems) setInventoryItems(data.inventoryItems);
        if(data.suppliers) setSuppliers(data.suppliers);
        if(data.purchases) setPurchases(data.purchases);
        if(data.systemSettings) setSystemSettings(data.systemSettings);

        // Reset runtime state
        setCurrentRestaurantId(null);
        setCurrentUser(null);
        alert('تمت استعادة البيانات بنجاح! سيتم إعادة تحميل الصفحة.');
        window.location.reload();
    };

    const handleAutoBackup = useCallback(() => {
        const data: BackupData = { restaurants, users, menuItems, orders, customers, inventoryItems, suppliers, purchases, systemSettings };
        addBackup(data);
        console.log("Automatic backup created.");
    }, [restaurants, users, menuItems, orders, customers, inventoryItems, suppliers, purchases, systemSettings]);

    // Auto backup every 2 hours
    useEffect(() => {
        const intervalId = setInterval(handleAutoBackup, 2 * 60 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [handleAutoBackup]);

    // Clear old backups on startup and then daily
    useEffect(() => {
        clearOldBackups();
        const cleanupInterval = setInterval(clearOldBackups, 24 * 60 * 60 * 1000);
        return () => clearInterval(cleanupInterval);
    }, []);

    // Super Admin Handlers
    const handleAddRestaurant = (restaurant: Omit<Restaurant, 'subscriptionEndDate' | 'isActivated'>) => {
        setRestaurants(prev => [...prev, { ...restaurant, isActivated: false, subscriptionEndDate: null }]);
    };
    
    const handleUpdateSubscription = (restaurantId: string, newEndDate: string | null) => {
        setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, subscriptionEndDate: newEndDate } : r));
    };

    const handleGenerateCode = (restaurantId: string) => {
        const code = `FC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, activationCode: code } : r));
    };

    const handleResetActivation = (restaurantId: string) => {
        setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, isActivated: false, activationDate: undefined } : r));
    }
    
    const handleInitialActivate = (code: string) => {
        const restaurantToActivate = restaurants.find(r => r.activationCode === code);
        if(!restaurantToActivate) return 'INVALID_CODE';
        if(restaurantToActivate.isActivated) return 'ALREADY_USED';

        setRestaurants(prev => prev.map(r => r.id === restaurantToActivate.id ? {...r, isActivated: true, activationDate: new Date().toISOString() } : r));
        setCurrentRestaurantId(restaurantToActivate.id);
        return 'SUCCESS';
    }
    
    const handleCreateAdminUser = (username: string, password: string) => {
        const adminUser: Omit<UserWithPassword, 'id' | 'restaurantId'> = {
            username,
            password,
            role: 'admin',
            permissions: { canAccessAdmin: true, canManageMenu: true, canManageInventory: true, canManageUsers: true, canViewReports: true, canEditPrices: true },
        };
        setUsers(prev => [...prev, {...adminUser, id: Date.now(), restaurantId: currentRestaurantId!}]);
    }
    
    // RENDER LOGIC
    if (superAdminLogin) {
        return <SystemOwnerView 
            restaurants={restaurants}
            onAddRestaurant={handleAddRestaurant}
            onUpdateSubscription={handleUpdateSubscription}
            onGenerateCode={handleGenerateCode}
            onResetActivation={handleResetActivation}
            onLogout={handleLogout}
            systemSettings={systemSettings}
        />
    }

    if(restaurants.length === 0 || restaurants.every(r => !r.isActivated)){
        return <InitialActivationView onActivate={handleInitialActivate} systemSettings={systemSettings} onSuperAdminClick={() => handleLogin('superadmin', 'superadmin')} />
    }
    
    if (!currentRestaurantId) {
        const activatedRestaurants = restaurants.filter(r => r.isActivated);
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                    <h1 className="text-3xl font-bold text-slate-900">اختر المطعم</h1>
                    <div className="space-y-3 pt-4">
                        {activatedRestaurants.map(r => (
                            <button key={r.id} onClick={() => setCurrentRestaurantId(r.id)} className="w-full text-lg font-semibold p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                                {r.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!currentRestaurant) return <div>خطأ: المطعم المحدد غير موجود.</div>; // Should not happen

    if (!currentRestaurant.isActivated) {
         // This case should be handled by the logic above, but as a fallback:
         return <ActivationView 
            onActivate={handleCreateAdminUser}
            onCancel={handleSwitchRestaurant}
            restaurantName={currentRestaurant.name}
            systemSettings={systemSettings}
         />
    }

    const isSubscriptionExpired = currentRestaurant.subscriptionEndDate && new Date(currentRestaurant.subscriptionEndDate) < new Date();
    if (isSubscriptionExpired) {
        return <SubscriptionExpiredView onLogout={handleSwitchRestaurant} systemSettings={systemSettings} restaurantName={currentRestaurant.name} />
    }

    if (restaurantUsers.length === 0) {
        return <ActivationView 
            onActivate={handleCreateAdminUser}
            onCancel={handleSwitchRestaurant}
            restaurantName={currentRestaurant.name}
            systemSettings={systemSettings}
         />
    }
    
    if (!currentUser) {
        return <LoginView onLogin={handleLogin} error={loginError} systemSettings={systemSettings} restaurantName={currentRestaurant.name} onSwitchRestaurant={handleSwitchRestaurant} />
    }

    return (
        <div className="flex flex-col h-screen bg-slate-200 font-sans">
            <Header
                currentView={currentView}
                onSetView={setCurrentView}
                user={currentUser}
                onLogout={handleLogout}
                restaurantName={currentRestaurant.name}
                systemSettings={systemSettings}
                lastManualBackupTimestamp={lastManualBackupTimestamp}
                onManualBackup={handleManualBackup}
            />
            <main className="flex-grow p-4">
                {currentView === 'pos' && 
                    <POSView 
                        menuItems={restaurantMenuItems} 
                        currentUser={currentUser} 
                        customers={restaurantCustomers} 
                        users={restaurantUsers}
                        onPlaceOrder={handlePlaceOrder} 
                        onEditPrice={handleEditPrice}
                        onAddCustomer={handleAddCustomer}
                        restaurantName={currentRestaurant.name}
                        systemSettings={systemSettings}
                        onManualBackup={handleManualBackup}
                    />
                }
                {currentView === 'kds' && 
                    <KDSView 
                        orders={restaurantOrders} 
                        onUpdateStatus={handleUpdateOrderStatus} 
                        customers={restaurantCustomers}
                        users={restaurantUsers}
                        onAssignDriver={handleAssignDriver}
                    />
                }
                {currentView === 'admin' && currentUser.permissions.canAccessAdmin && 
                    <AdminView 
                        currentUser={currentUser}
                        menuItems={restaurantMenuItems}
                        orders={restaurantOrders}
                        users={restaurantUsers}
                        inventoryItems={restaurantInventory}
                        customers={restaurantCustomers}
                        suppliers={restaurantSuppliers}
                        purchases={restaurantPurchases}
                        restaurantName={currentRestaurant.name}
                        systemSettings={systemSettings}
                        onUpdateSettings={setSystemSettings}
                        onAddItem={handleAddItem}
                        onUpdateItem={handleUpdateItem}
                        onDeleteItem={handleDeleteItem}
                        onAddUser={handleAddUser}
                        onUpdateUser={handleUpdateUser}
                        onDeleteUser={handleDeleteUser}
                        onUpdateUserPermissions={handleUpdateUserPermissions}
                        onAddInventoryItem={handleAddInventoryItem}
                        onUpdateInventoryItem={handleUpdateInventoryItem}
                        onDeleteInventoryItem={handleDeleteInventoryItem}
                        onAddCustomer={handleAddCustomer}
                        onUpdateCustomer={handleUpdateCustomer}
                        onDeleteCustomer={handleDeleteCustomer}
                        onAddSupplier={handleAddSupplier}
                        onUpdateSupplier={handleUpdateSupplier}
                        onDeleteSupplier={handleDeleteSupplier}
                        onAddPurchase={handleAddPurchase}
                        onRestoreData={handleRestoreData}
                        onManualBackup={handleManualBackup}
                    />
                }
            </main>
        </div>
    );
}

export default App;
