
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { X, Bell, Info, CheckCircle, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import { User, UserRole, Sale } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerPortal from './pages/CustomerPortal';
import SuperAdminPanel from './pages/SuperAdminPanel';
import AiChatWidget from './components/AiChatWidget';
import NewSaleModal from './components/NewSaleModal';

// Add Global CSS for highlighting rows
const GlobalStyle = () => (
  <style>{`
    @keyframes highlight-blink {
      0% { background-color: transparent; }
      25% { background-color: rgba(251, 191, 36, 0.3); }
      50% { background-color: transparent; }
      75% { background-color: rgba(251, 191, 36, 0.3); }
      100% { background-color: transparent; }
    }
    .animate-highlight {
      animation: highlight-blink 2s ease-in-out forwards;
      border-left: 4px solid #f59e0b !important;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
  `}</style>
);

// Auth Context
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Search Context
interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
const SearchContext = createContext<SearchContextType | undefined>(undefined);
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within a SearchProvider');
  return context;
};

// Sale UI Context
interface SaleContextType {
  isNewSaleModalOpen: boolean;
  setIsNewSaleModalOpen: (open: boolean) => void;
}
const SaleContext = createContext<SaleContextType | undefined>(undefined);
export const useSaleAction = () => {
  const context = useContext(SaleContext);
  if (!context) throw new Error('useSaleAction must be used within a SaleProvider');
  return context;
};

// Global Sales Data Context
export interface SaleRecord extends Sale {
  customerName: string;
  status: 'Success' | 'Voided';
}

interface SalesDataContextType {
  sales: SaleRecord[];
  addSale: (sale: SaleRecord) => void;
  voidSale: (id: string) => void;
}
const SalesDataContext = createContext<SalesDataContextType | undefined>(undefined);
export const useSalesData = () => {
  const context = useContext(SalesDataContext);
  if (!context) throw new Error('useSalesData must be used within a SalesDataProvider');
  return context;
};

// Currency Context
interface CurrencyContextType {
  currency: string;
  currencySymbol: string;
  setCurrency: (currency: string) => void;
}
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};

// Notification Context
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  isRead: boolean;
  path?: string;
  targetId?: string; 
  isPrintAction?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};

// Global Toast Component
const Toast: React.FC<{ toast: Notification | null; onClose: () => void }> = ({ toast, onClose }) => {
  const navigate = useNavigate();
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'error': return <AlertCircle size={18} className="text-rose-500" />;
      default: return <Info size={18} className="text-indigo-500" />;
    }
  };

  const handleAction = () => {
    if (toast.path) {
      navigate(toast.path, { 
        state: { 
          highlightId: toast.targetId, 
          printItemId: toast.isPrintAction ? toast.targetId : undefined 
        } 
      });
    }
    onClose();
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-full max-w-sm px-4 animate-in slide-in-from-top-10 duration-500">
      <div 
        onClick={handleAction}
        className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[1.5rem] p-4 flex items-center space-x-4 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
      >
        <div className={`p-2.5 rounded-xl ${
          toast.type === 'success' ? 'bg-emerald-50' : 
          toast.type === 'warning' ? 'bg-amber-50' : 
          toast.type === 'error' ? 'bg-rose-50' : 'bg-indigo-50'
        }`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{toast.title}</h4>
          <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{toast.message}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === UserRole.SUPER_ADMIN) return <Navigate to="/platform-control" />;
    if (user.role === UserRole.CUSTOMER) return <Navigate to="/portal" />;
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isNewSaleModalOpen, setIsNewSaleModalOpen } = useSaleAction();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isSpecialPortal = location.pathname === '/portal' || location.pathname === '/platform-control';

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (isAuthPage) return <>{children}</>;

  if (isSpecialPortal || user?.role === UserRole.CUSTOMER || user?.role === UserRole.SUPER_ADMIN) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden relative text-slate-900">
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => {}} hideSidebarTrigger={true} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
      <AiChatWidget />
      {isNewSaleModalOpen && <NewSaleModal onClose={() => setIsNewSaleModalOpen(false)} />}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [currency, setCurrencyState] = useState('BDT');
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  
  // Sales Ledger State
  const [sales, setSales] = useState<SaleRecord[]>([
    { id: 'ORD-101', customerName: 'Walk-in Customer', paymentMethod: 'CASH', totalAmount: 45.20, createdAt: 'May 15, 2024 14:22', status: 'Success', items: [], userId: 'admin-123' },
    { id: 'ORD-102', customerName: 'John Smith', paymentMethod: 'CARD', totalAmount: 12.00, createdAt: 'May 15, 2024 13:05', status: 'Success', items: [], userId: 'admin-123' },
    { id: 'ORD-103', customerName: 'Maria Garcia', paymentMethod: 'TRANSFER', totalAmount: 350.00, createdAt: 'May 15, 2024 11:45', status: 'Success', items: [], userId: 'admin-123' }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'Organic Coffee Beans are below minimum level (5 left).',
      type: 'warning',
      timestamp: new Date().toISOString(),
      isRead: false,
      path: '/inventory',
      targetId: '1'
    }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('bizgrow_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedCurrency = localStorage.getItem('nashwa_currency');
    if (savedCurrency) setCurrencyState(savedCurrency);
    const savedSales = localStorage.getItem('nashwa_sales');
    if (savedSales) setSales(JSON.parse(savedSales));
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('bizgrow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bizgrow_user');
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem('nashwa_currency', c);
  };

  const getSymbol = (c: string) => {
    switch (c) {
      case 'BDT': return '৳';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);
    
    setTimeout(() => {
      setActiveToast(prev => prev?.id === newNotif.id ? null : prev);
    }, 8000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addSale = (sale: SaleRecord) => {
    const newSales = [sale, ...sales];
    setSales(newSales);
    localStorage.setItem('nashwa_sales', JSON.stringify(newSales));
  };

  const voidSale = (id: string) => {
    const newSales = sales.map(s => s.id === id ? { ...s, status: 'Voided' } : s);
    setSales(newSales as SaleRecord[]);
    localStorage.setItem('nashwa_sales', JSON.stringify(newSales));
    addNotification({ title: 'Transaction Voided', message: `Order ${id} has been marked as void.`, type: 'warning' });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
        <SaleContext.Provider value={{ isNewSaleModalOpen, setIsNewSaleModalOpen }}>
          <SalesDataContext.Provider value={{ sales, addSale, voidSale }}>
            <CurrencyContext.Provider value={{ currency, currencySymbol: getSymbol(currency), setCurrency }}>
              <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications }}>
                <HashRouter>
                  <GlobalStyle />
                  <Toast toast={activeToast} onClose={() => setActiveToast(null)} />
                  <AppLayout>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/platform-control" element={<PrivateRoute allowedRoles={[UserRole.SUPER_ADMIN]}><SuperAdminPanel /></PrivateRoute>} />
                      <Route path="/" element={<PrivateRoute allowedRoles={[UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF]}><Dashboard /></PrivateRoute>} />
                      <Route path="/inventory" element={<PrivateRoute allowedRoles={[UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF]}><Inventory /></PrivateRoute>} />
                      <Route path="/sales" element={<PrivateRoute allowedRoles={[UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF]}><Sales /></PrivateRoute>} />
                      <Route path="/customers" element={<PrivateRoute allowedRoles={[UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF]}><Customers /></PrivateRoute>} />
                      <Route path="/expenses" element={<PrivateRoute allowedRoles={[UserRole.OWNER, UserRole.MANAGER]}><Expenses /></PrivateRoute>} />
                      <Route path="/reports" element={<PrivateRoute allowedRoles={[UserRole.OWNER, UserRole.MANAGER]}><Reports /></PrivateRoute>} />
                      <Route path="/settings" element={<PrivateRoute allowedRoles={[UserRole.OWNER, UserRole.MANAGER]}><Settings /></PrivateRoute>} />
                      <Route path="/portal" element={<PrivateRoute allowedRoles={[UserRole.CUSTOMER]}><CustomerPortal /></PrivateRoute>} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </AppLayout>
                </HashRouter>
              </NotificationContext.Provider>
            </CurrencyContext.Provider>
          </SalesDataContext.Provider>
        </SaleContext.Provider>
      </SearchContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
