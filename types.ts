import type React from 'react';

export enum OrderStatus {
  PENDING = 'قيد الانتظار',
  PREPARING = 'قيد التحضير',
  READY = 'جاهز',
  OUT_FOR_DELIVERY = 'قيد التوصيل',
  SERVED = 'مقدّم',
}

export interface MenuItem {
  id: number;
  restaurantId: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  iconName: string;
  imageUrl?: string;
  description?: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: number;
  restaurantId: string;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: Date;
  orderType: 'dine-in' | 'delivery';
  tableNumber?: number;
  customerId?: number;
  driverId?: number; 
  salespersonId?: number;
  discount?: number;
  totalAmount: number;
}

export interface UserPermissions {
    canAccessAdmin: boolean;
    canManageMenu: boolean;
    canManageInventory: boolean;
    canManageUsers: boolean;
    canViewReports: boolean;
    canEditPrices: boolean;
}

export interface User {
  id: number;
  restaurantId: string;
  username: string;
  role: 'admin' | 'cashier' | 'driver' | 'superadmin' | 'owner';
  permissions: UserPermissions;
}

export type UserWithPassword = User & { password?: string };

export interface InventoryItem {
    id: number;
    restaurantId: string;
    name: string;
    unit: string;
    stock: number;
    costPerUnit: number;
}

export interface Customer {
    id: number;
    restaurantId: string;
    name: string;
    phone: string;
    address: string;
}

export interface Supplier {
    id: number;
    restaurantId: string;
    name: string;
    contactPerson?: string;
    phone?: string;
}

export interface PurchaseItem {
    inventoryItemId: number;
    quantity: number;
    cost: number; // Cost for this line item
}

export interface Purchase {
    id: number;
    restaurantId: string;
    supplierId: number;
    date: Date;
    items: PurchaseItem[];
    totalCost: number;
}

export interface Restaurant {
    id: string;
    name: string;
    subscriptionEndDate: string | null; // ISO Date string, or null for lifetime
    activationCode?: string;
    isActivated: boolean;
    activationDate?: string;
}

export interface SystemSettings {
    appName: string;
    appSubtitle: string;
    receiptTemplate: 'standard' | 'compact';
    autoPrintReceipt: boolean;
}

export interface BackupData {
    restaurants: Restaurant[];
    users: UserWithPassword[];
    menuItems: MenuItem[];
    orders: Order[];
    customers: Customer[];
    inventoryItems: InventoryItem[];
    suppliers: Supplier[];
    purchases: Purchase[];
    systemSettings?: SystemSettings; // Add settings to backup
}

export interface StoredBackup {
    id: number; // timestamp
    data: BackupData;
}