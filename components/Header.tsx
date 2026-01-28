
import React, { useState, useRef, useEffect } from 'react';
// Fixed: Added ArrowRight to imports
import { Bell, Search, Menu, Plus, X, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle, LogOut, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearch, useSaleAction, useNotifications, Notification, useAuth } from '../App';
import { UserRole } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  hideSidebarTrigger?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, hideSidebarTrigger = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const { setIsNewSaleModalOpen } = useSaleAction();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const isCustomer = user?.role === UserRole.CUSTOMER;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (isCustomer) return "My Portal";
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard Overview';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'error': return <AlertCircle size={16} className="text-rose-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n.id);
    if (n.path) {
      navigate(n.path, { state: { highlightId: n.targetId } });
      setIsNotificationOpen(false);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 z-40 sticky top-0 shadow-sm">
      <div className="flex items-center">
        {!hideSidebarTrigger && !isCustomer && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-2 transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{getPageTitle()}</h1>
          {isCustomer && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.businessName}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {!isCustomer && (
          <div className="hidden lg:flex items-center bg-slate-50 rounded-2xl px-5 py-2.5 w-72 border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-200 transition-all">
            <Search size={18} className="text-slate-400 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Deep Search..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-full text-slate-700 font-bold placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
        
        {!isCustomer && (
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative p-3 rounded-2xl transition-all ${isNotificationOpen ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em]">Business Alerts</h3>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg animate-pulse">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={markAllAsRead}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl transition-all hover:bg-white shadow-sm"
                      title="Mark all as read"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={clearNotifications}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-all hover:bg-white shadow-sm"
                      title="Clear all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[450px] overflow-y-auto bg-white custom-scrollbar">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-6 flex items-start space-x-4 cursor-pointer transition-all hover:pl-8 ${n.isRead ? 'opacity-50 grayscale bg-white' : 'bg-white hover:bg-indigo-50/30'}`}
                        >
                          <div className={`mt-1 p-2.5 rounded-2xl flex-shrink-0 ${
                            n.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 
                            n.type === 'warning' ? 'bg-amber-50 text-amber-500' : 
                            n.type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                          }`}>
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{n.title}</h4>
                              <span className="text-[9px] font-black text-slate-400 whitespace-nowrap ml-2 italic">{getTimeAgo(n.timestamp)}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{n.message}</p>
                            {n.path && (
                              <div className="mt-3 text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center group">
                                Deep Dive <ArrowRight size={10} className="ml-1 group-hover:ml-2 transition-all" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Bell size={32} className="text-slate-200" />
                      </div>
                      <p className="text-slate-900 text-sm font-black uppercase tracking-widest">All Clear!</p>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">Your business is running smoothly. New logs will appear here.</p>
                    </div>
                  )}
                </div>
                
                <div className="p-5 bg-slate-50 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-colors"
                  >
                    Minimize Panel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="h-10 w-px bg-slate-100 hidden sm:block mx-1"></div>
        
        {!isCustomer ? (
          <div className="hidden sm:flex items-center space-x-3">
            <button 
              onClick={() => setIsNewSaleModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Quick Transaction
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-3 bg-slate-50 px-5 py-2.5 rounded-[1.5rem] border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black overflow-hidden">
                {user?.photo ? (
                  <img src={user.photo} alt="User" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0] || 'U'
                )}
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{user?.name}</span>
            </div>
            <button 
              onClick={logout}
              className="p-3 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-100 rounded-2xl transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}

        {/* Mobile Logout (Customer Only) */}
        {isCustomer && (
          <button 
            onClick={logout}
            className="sm:hidden p-2.5 bg-rose-50 text-rose-600 rounded-xl"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
