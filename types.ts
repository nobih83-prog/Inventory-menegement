
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id: string;
  email: string;
  businessName: string;
  role: UserRole;
  name?: string;
  phone?: string;
  photo?: string;
}

export interface LoginRecord {
  id: string;
  userId: string;
  userEmail: string;
  businessName: string;
  role: UserRole;
  timestamp: string;
  ipAddress: string;
}

export interface BusinessRegistration {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  totalSales: number;
  customerCount: number;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedAt: string;
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
