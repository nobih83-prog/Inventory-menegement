
import React, { useMemo, useState } from 'react';
import { 
  ShoppingBag, 
  Star, 
  History, 
  Gift, 
  Calendar, 
  ChevronRight, 
  LogOut,
  User,
  Zap,
  Ticket,
  MapPin,
  Download,
  X,
  CheckCircle2,
  Clock,
  Copy,
  Tag
} from 'lucide-react';
import { useAuth, useCurrency, useNotifications } from '../App';

interface Deal {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  expiry: string;
  type: 'FLAT' | 'PERCENT' | 'GIFT';
  isClaimed?: boolean;
}

const CustomerPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const { currencySymbol } = useCurrency();
  const { addNotification } = useNotifications();

  // Deals State
  const [isDealsModalOpen, setIsDealsModalOpen] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([
    { id: 'D1', title: 'Elite Morning Special', description: 'Get a free croissant with any large latte purchase.', code: 'MORNING-ELITE', discount: 'FREE GIFT', expiry: 'Ends in 2 days', type: 'GIFT' },
    { id: 'D2', title: 'Loyalty Reward', description: 'Flat discount on your total bill for reaching 100 points.', code: 'LOYALTY-100', discount: '৳150 OFF', expiry: 'Ends in 14 days', type: 'FLAT' },
    { id: 'D3', title: 'New Menu Trial', description: 'Exclusive 20% discount on our new seasonal blend.', code: 'SEASONAL-20', discount: '20% OFF', expiry: 'Ends Today', type: 'PERCENT' },
  ]);

  const purchaseHistory = [
    { id: 'ORD-1025', date: 'May 12, 2024', amount: 45.00, items: 'Premium Coffee, Milk', points: 45 },
    { id: 'ORD-1011', date: 'May 05, 2024', amount: 12.50, items: 'Espresso, Croissant', points: 12 },
    { id: 'ORD-0982', date: 'Apr 28, 2024', amount: 84.00, items: 'Whole Beans (2kg)', points: 84 },
    { id: 'ORD-0955', date: 'Apr 15, 2024', amount: 15.00, items: 'Iced Latte', points: 15 },
  ];

  const totalPoints = useMemo(() => purchaseHistory.reduce((sum, h) => sum + h.points, 0), []);
  const nextRewardAt = 200;
  const progress = (totalPoints / nextRewardAt) * 100;

  const handleExportStatement = () => {
    try {
      const headers = ['Order ID', 'Date', 'Items', 'Amount', 'Points Earned'];
      const rows = purchaseHistory.map(h => [
        h.id,
        h.date,
        `"${h.items}"`,
        h.amount.toFixed(2),
        h.points
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${user?.name?.replace(/\s+/g, '_')}_Purchase_Statement.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addNotification({
        title: 'Statement Exported',
        message: 'Your purchase history has been downloaded successfully.',
        type: 'success'
      });
    } catch (error) {
      addNotification({
        title: 'Export Failed',
        message: 'Could not generate the statement at this time.',
        type: 'error'
      });
    }
  };

  const claimDeal = (deal: Deal) => {
    navigator.clipboard.writeText(deal.code);
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, isClaimed: true } : d));
    addNotification({
      title: 'Voucher Claimed!',
      message: `Code ${deal.code} copied to clipboard. Show it at the counter!`,
      type: 'success'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Welcome Banner */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-indigo-100 border border-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative z-10 flex items-center space-x-6">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[1.75rem] flex items-center justify-center font-black text-3xl shadow-2xl shadow-indigo-200 overflow-hidden">
            {user?.photo ? (
              <img src={user.photo} alt="User" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0] || 'U'
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 flex items-center">
              <Star size={14} className="mr-1 text-amber-500 fill-amber-500" />
              Elite Member • Since 2023
            </p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="mt-6 md:mt-0 px-6 py-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center"
        >
          <LogOut size={16} className="mr-2" />
          Log Out
        </button>
      </div>

      {/* Rewards Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Gift size={120} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Loyalty Balance</h3>
            <div className="flex items-end space-x-3 mb-8">
              <span className="text-6xl font-black">{totalPoints}</span>
              <span className="text-indigo-300 font-black text-sm mb-2 uppercase tracking-widest">Points</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Next Reward Progress</span>
                <span className="text-xs font-black text-indigo-300">{totalPoints} / {nextRewardAt}</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 p-1">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 font-bold italic">
                Only {nextRewardAt - totalPoints} more points for a free coffee voucher!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 flex flex-col justify-between">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Ticket size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight leading-none mb-2">Exclusive Deals</h3>
            <p className="text-indigo-100 text-xs font-medium">Flash deals and member-only discounts just for you.</p>
          </div>
          <button 
            onClick={() => setIsDealsModalOpen(true)}
            className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95"
          >
            View My Coupons
          </button>
        </div>
      </div>

      {/* Quick Actions & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center uppercase tracking-tight">
              <History size={20} className="mr-3 text-indigo-600" /> Recent Visits
            </h3>
            <button 
              onClick={handleExportStatement}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
              title="Download Statement"
            >
              <Download size={18} />
            </button>
          </div>
          <div className="space-y-4">
            {purchaseHistory.map((order) => (
              <div key={order.id} className="p-4 rounded-3xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{order.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">{currencySymbol}{order.amount.toFixed(2)}</p>
                  <p className="text-[9px] font-black text-emerald-600 uppercase">+{order.points} Points</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={handleExportStatement}
            className="w-full mt-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
          >
            Export Full Statement
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center uppercase tracking-tight">
              <MapPin size={20} className="mr-3 text-indigo-600" /> Store Info
            </h3>
            <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 space-y-4">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Address</p>
                <p className="text-sm font-bold text-indigo-900 mt-1">123 Business Street, Dhaka, Bangladesh</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Opening Hours</p>
                  <p className="text-xs font-bold text-indigo-900 mt-1">Mon - Sun • 09:00 - 22:00</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-lg animate-pulse">Open Now</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-rose-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Zap size={24} />
              </div>
              <h4 className="text-xl font-black tracking-tight">Refer a Friend</h4>
            </div>
            <p className="text-rose-100 text-xs font-medium mb-6">Give your friends ৳100 off their first order and get 100 points!</p>
            <div className="flex space-x-2">
              <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-xs font-mono font-bold backdrop-blur-sm border border-white/20">
                NASHWA-FRIEND-2024
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('NASHWA-FRIEND-2024');
                  addNotification({ title: 'Code Copied', message: 'Referral code copied to clipboard!', type: 'success' });
                }}
                className="bg-white text-rose-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusive Deals Modal */}
      {isDealsModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Ticket size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Available Coupons</h2>
                  <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Exclusive Member Rewards</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDealsModalOpen(false)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {deals.map((deal) => (
                <div 
                  key={deal.id}
                  className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6 ${
                    deal.isClaimed 
                      ? 'bg-slate-50 border-slate-100 opacity-80' 
                      : 'bg-white border-slate-100 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50'
                  }`}
                >
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        deal.type === 'GIFT' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {deal.discount}
                      </span>
                      {deal.isClaimed && (
                        <span className="flex items-center text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                          <CheckCircle2 size={10} className="mr-1" /> Claimed
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{deal.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">{deal.description}</p>
                    <div className="flex items-center justify-center sm:justify-start mt-4 space-x-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center"><Clock size={12} className="mr-1.5" /> {deal.expiry}</span>
                      <span className="flex items-center"><Tag size={12} className="mr-1.5" /> Single Use</span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    {deal.isClaimed ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="px-6 py-3 bg-slate-100 rounded-2xl text-xs font-mono font-bold text-slate-500 border border-slate-200">
                          {deal.code}
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(deal.code);
                            addNotification({ title: 'Copied', message: 'Voucher code copied!', type: 'info' });
                          }}
                          className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center"
                        >
                          <Copy size={10} className="mr-1" /> Copy Again
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => claimDeal(deal)}
                        className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        Claim Voucher
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                New Deals Added Every Monday • Nashwa Loyalty
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
