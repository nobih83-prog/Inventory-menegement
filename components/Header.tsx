
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, Plus, X, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearch, useSaleAction, useNotifications, Notification } from '../App';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const { setIsNewSaleModalOpen } = useSaleAction();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-40 sticky top-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-2 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64 border border-slate-200/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search active view..." 
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-slate-600 placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`relative p-2 rounded-lg transition-all ${isNotificationOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={markAllAsRead}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={clearNotifications}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto bg-white">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)}
                        className={`p-5 flex items-start space-x-4 cursor-pointer transition-colors ${n.isRead ? 'opacity-60 bg-white' : 'bg-indigo-50/30 hover:bg-indigo-50/50'}`}
                      >
                        <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${
                          n.type === 'success' ? 'bg-emerald-100' : 
                          n.type === 'warning' ? 'bg-amber-100' : 
                          n.type === 'error' ? 'bg-rose-100' : 'bg-blue-100'
                        }`}>
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`text-xs font-black text-slate-900 truncate ${n.isRead ? 'font-bold' : 'font-black'}`}>{n.title}</h4>
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{getTimeAgo(n.timestamp)}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                          {n.path && (
                            <div className="mt-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center">
                              View Details <Plus size={8} className="ml-1 rotate-45" />
                            </div>
                          )}
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Bell size={24} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No new notifications</p>
                    <p className="text-[10px] text-slate-300 mt-1 px-10 leading-relaxed italic">You're all caught up! Important business alerts will appear here.</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:text-indigo-800 transition-colors"
                >
                  Close Panel
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>
        
        <div className="hidden sm:flex items-center space-x-3">
          <button 
            onClick={() => setIsNewSaleModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm shadow-indigo-100 transition-all active:scale-95 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            New Sale
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
