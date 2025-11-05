import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { MenuItem, Order, UserWithPassword, InventoryItem, Customer, Supplier, Purchase, User, UserPermissions, BackupData, SystemSettings } from '../types';
import { ICON_MAP } from '../constants';
import { ConfirmationDialog } from './ConfirmationDialog';
import { EmployeesView } from './EmployeesView';
import { InventoryView } from './InventoryView';
import { CustomersView } from './CustomersView';
import { SuppliersView } from './SuppliersView';
import { PurchasesView } from './PurchasesView';
import { DriversView } from './DriversView';
import { ReportsView } from './ReportsView';
import { PermissionsView } from './PermissionsView';
import { BackupRestoreView } from './BackupRestoreView';
import { SettingsView } from './SettingsView';
import {
    DocumentTextIcon,
    BookOpenIcon,
    ArchiveBoxIcon,
    ShoppingCartIcon,
    UsersIcon,
    TruckIcon,
    UserGroupIcon,
    BuildingStorefrontIcon,
    ShieldCheckIcon,
    ArrowDownTrayIcon,
    Cog6ToothIcon,
    PhotoIcon,
    XCircleIcon,
    SparklesIcon,
} from './IconComponents';


interface AdminViewProps {
  currentUser: User;
  menuItems: MenuItem[];
  orders: Order[];
  users: UserWithPassword[];
  inventoryItems: InventoryItem[];
  customers: Customer[];
  suppliers: Supplier[];
  purchases: Purchase[];
  restaurantName: string;
  systemSettings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  onAddItem: (item: Omit<MenuItem, 'id' | 'restaurantId'>) => void;
  onUpdateItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: number) => void;
  onAddUser: (user: Omit<UserWithPassword, 'id' | 'restaurantId'>) => void;
  onUpdateUser: (user: UserWithPassword) => void;
  onDeleteUser: (userId: number) => void;
  onUpdateUserPermissions: (userId: number, permissions: UserPermissions) => void;
  onAddInventoryItem: (item: Omit<InventoryItem, 'id' | 'restaurantId'>) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onDeleteInventoryItem: (itemId: number) => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'restaurantId'>) => Customer;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: number) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'restaurantId'>) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: number) => void;
  onAddPurchase: (purchase: Omit<Purchase, 'id' | 'restaurantId'>) => void;
  onRestoreData: (data: BackupData) => void;
  onManualBackup: () => void;
}

type AdminTab = 'reports' | 'menu' | 'inventory' | 'purchases' | 'employees' | 'permissions' | 'drivers' | 'customers' | 'suppliers' | 'backup' | 'settings';

const MenuItemForm: React.FC<{
    item: Omit<MenuItem, 'id' | 'restaurantId'> | MenuItem | null;
    onSave: (item: Omit<MenuItem, 'id' | 'restaurantId'> | MenuItem) => void;
    onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item || {
        name: '',
        price: 0,
        cost: 0,
        category: '',
        iconName: Object.keys(ICON_MAP)[0],
        imageUrl: '',
        description: '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: ['price', 'cost'].includes(name) ? parseFloat(value) : value }));
    };

    const handleImageChange = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({...prev, imageUrl: reader.result as string}));
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            handleImageChange(e.target.files[0]);
        }
    };
    
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if(file) handleImageChange(file);
                e.preventDefault();
                break;
            }
        }
    };

    const handleGenerateDescription = async () => {
        if (!formData.name) {
            alert('الرجاء إدخال اسم الصنف أولاً.');
            return;
        }
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const prompt = `اكتب وصفًا تسويقيًا جذابًا وقصيرًا باللغة العربية لا يتجاوز 15 كلمة، لعنصر في قائمة طعام مطعم. اسم العنصر هو "${formData.name}" وهو من فئة "${formData.category}".`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const description = response.text;
            setFormData(prev => ({ ...prev, description: description.trim() }));
    
        } catch (error) {
            console.error("Error generating description:", error);
            alert("حدث خطأ أثناء إنشاء الوصف. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.price > 0 && formData.category && formData.cost >= 0) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{'id' in formData && formData.id ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">صورة المنتج</label>
                        <div 
                            className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md"
                            onPaste={handlePaste}
                        >
                            <div className="space-y-1 text-center">
                                {formData.imageUrl ? (
                                    <div className="relative group">
                                        <img src={formData.imageUrl} alt="معاينة" className="mx-auto h-24 w-auto rounded-md object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Remove image"
                                        >
                                           <XCircleIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                ) : (
                                    <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                                )}
                                <div className="flex text-sm text-slate-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                                    <span>اختر ملف</span>
                                    <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileSelect} accept="image/*" />
                                </label>
                                <p className="pr-1">أو قم بلصق صورة</p>
                                </div>
                                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 1MB</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">اسم الصنف</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="description" className="block text-sm font-medium text-slate-600">الوصف</label>
                            <button 
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={!formData.name || isGenerating}
                                className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                ) : (
                                    <SparklesIcon className="h-4 w-4" />
                                )}
                                <span>{isGenerating ? 'جاري الإنشاء...' : 'إنشاء باستخدام AI'}</span>
                            </button>
                        </div>
                        <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" rows={3}></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">سعر البيع</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required min="0" step="0.01" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">التكلفة</label>
                            <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required min="0" step="0.01" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">الفئة</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">الأيقونة (في حال عدم وجود صورة)</label>
                        <select name="iconName" value={formData.iconName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:ring-orange-500 focus:border-orange-500">
                            {Object.keys(ICON_MAP).map(iconName => (
                                <option key={iconName} value={iconName}>{iconName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md transition-colors">إلغاء</button>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const AdminView: React.FC<AdminViewProps> = (props) => {
    const { currentUser, menuItems, onAddItem, onUpdateItem, onDeleteItem } = props;
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [activeTab, setActiveTab] = useState<AdminTab>('reports');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setIsMenuModalOpen(true);
    };

    const handleOpenEditModal = (item: MenuItem) => {
        setEditingItem(item);
        setIsMenuModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsMenuModalOpen(false);
        setEditingItem(null);
    };

    const handleSave = (item: Omit<MenuItem, 'id' | 'restaurantId'> | MenuItem) => {
        if ('id' in item) {
            onUpdateItem(item as MenuItem);
        } else {
            onAddItem(item as Omit<MenuItem, 'id' | 'restaurantId'>);
        }
        handleCloseModal();
    };

    const handleDeleteRequest = (itemId: number) => {
        setItemToDelete(itemId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete !== null) {
            onDeleteItem(itemToDelete);
        }
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };
    
    const TABS = [
        { id: 'reports', label: 'التقارير', icon: DocumentTextIcon, permission: currentUser.permissions.canViewReports },
        { id: 'menu', label: 'قائمة الأصناف', icon: BookOpenIcon, permission: currentUser.permissions.canManageMenu },
        { id: 'inventory', label: 'المخزون', icon: ArchiveBoxIcon, permission: currentUser.permissions.canManageInventory },
        { id: 'purchases', label: 'المشتريات', icon: ShoppingCartIcon, permission: currentUser.permissions.canManageInventory },
        { id: 'employees', label: 'الموظفين', icon: UsersIcon, permission: currentUser.permissions.canManageUsers },
        { id: 'permissions', label: 'الصلاحيات', icon: ShieldCheckIcon, permission: currentUser.permissions.canManageUsers },
        { id: 'drivers', label: 'السائقين', icon: TruckIcon, permission: currentUser.permissions.canManageUsers },
        { id: 'customers', label: 'العملاء', icon: UserGroupIcon, permission: true }, // Assume everyone can see customers for now
        { id: 'suppliers', label: 'الموردين', icon: BuildingStorefrontIcon, permission: currentUser.permissions.canManageInventory },
        { id: 'backup', label: 'النسخ الاحتياطي', icon: ArrowDownTrayIcon, permission: true },
        { id: 'settings', label: 'الإعدادات', icon: Cog6ToothIcon, permission: true },
    ].filter(tab => tab.permission);


    return (
        <div className="bg-white rounded-lg shadow-2xl flex h-full overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-50 border-l border-slate-200 flex-shrink-0">
                <div className="p-4">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 px-2">لوحة التحكم</h2>
                    <nav className="flex flex-col space-y-1">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as AdminTab)}
                                    className={`flex items-center gap-3 w-full text-right py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        isActive
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                                    }`}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-slate-100">
                {activeTab === 'menu' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800">قائمة الأصناف</h3>
                            <button onClick={handleOpenAddModal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                                إضافة صنف جديد
                            </button>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                        <div className="overflow-x-auto relative">
                            <table className="w-full text-sm text-right text-slate-700">
                                <thead className="text-xs text-slate-600 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="py-3 px-6">الصنف</th>
                                        <th scope="col" className="py-3 px-6">الفئة</th>
                                        <th scope="col" className="py-3 px-6">الوصف</th>
                                        <th scope="col" className="py-3 px-6">السعر</th>
                                        <th scope="col" className="py-3 px-6">التكلفة</th>
                                        <th scope="col" className="py-3 px-6">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menuItems.map(item => (
                                        <tr key={item.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                            <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap flex items-center gap-3">
                                                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-md object-cover"/>}
                                                <span>{item.name}</span>
                                            </td>
                                            <td className="py-4 px-6">{item.category}</td>
                                            <td className="py-4 px-6 max-w-xs truncate" title={item.description}>{item.description || '-'}</td>
                                            <td className="py-4 px-6">ر.س {item.price.toFixed(2)}</td>
                                            <td className="py-4 px-6">ر.س {item.cost.toFixed(2)}</td>
                                            <td className="py-4 px-6 flex gap-4">
                                                <button onClick={() => handleOpenEditModal(item)} className="font-medium text-blue-500 hover:underline">تعديل</button>
                                                <button onClick={() => handleDeleteRequest(item.id)} className="font-medium text-red-500 hover:underline">حذف</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                )}
                {activeTab === 'reports' && <ReportsView orders={props.orders} menuItems={props.menuItems} inventoryItems={props.inventoryItems} customers={props.customers} restaurantName={props.restaurantName} systemSettings={props.systemSettings} />}
                {activeTab === 'inventory' && <InventoryView inventoryItems={props.inventoryItems} onAddItem={props.onAddInventoryItem} onUpdateItem={props.onUpdateInventoryItem} onDeleteItem={props.onDeleteInventoryItem} />}
                {activeTab === 'employees' && <EmployeesView users={props.users} onAddUser={props.onAddUser} onUpdateUser={props.onUpdateUser} onDeleteUser={props.onDeleteUser} />}
                {activeTab === 'permissions' && <PermissionsView users={props.users} onUpdateUserPermissions={props.onUpdateUserPermissions} />}
                {activeTab === 'customers' && <CustomersView customers={props.customers} onAddCustomer={props.onAddCustomer} onUpdateCustomer={props.onUpdateCustomer} onDeleteCustomer={props.onDeleteCustomer} />}
                {activeTab === 'suppliers' && <SuppliersView suppliers={props.suppliers} onAddSupplier={props.onAddSupplier} onUpdateSupplier={props.onUpdateSupplier} onDeleteSupplier={props.onDeleteSupplier} />}
                {activeTab === 'purchases' && <PurchasesView purchases={props.purchases} suppliers={props.suppliers} inventoryItems={props.inventoryItems} onAddPurchase={props.onAddPurchase} />}
                {activeTab === 'drivers' && <DriversView users={props.users} orders={props.orders} customers={props.customers} />}
                {activeTab === 'backup' && <BackupRestoreView onRestore={props.onRestoreData} onManualBackup={props.onManualBackup} />}
                {activeTab === 'settings' && <SettingsView settings={props.systemSettings} onUpdateSettings={props.onUpdateSettings} />}

            </main>

            {isMenuModalOpen && <MenuItemForm item={editingItem} onSave={handleSave} onCancel={handleCloseModal} />}
            <ConfirmationDialog
                isOpen={isConfirmModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا الصنف؟ لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
};