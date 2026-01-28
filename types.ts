
export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  email: string;
  businessName: string;
  role: UserRole;
}

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  minStockLevel: number;
  updatedAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  lastVisit: string;
}

export interface Sale {
  id: string;
  userId: string;
  customerId?: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface BusinessSettings {
  taxRate: number;
  currency: string;
  address: string;
  logoUrl?: string;
}
