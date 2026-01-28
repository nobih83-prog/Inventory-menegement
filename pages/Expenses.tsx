
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Filter, 
  Receipt, 
  X, 
  Save, 
  Search, 
  TrendingDown, 
  Calendar,
  Tag,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  History,
  Info
} from 'lucide-react';
import { useSearch, useCurrency, useNotifications, useAuth } from '../App';

interface ExpenseItem {
  id: string;
  desc: string;
  category: string;
  amount: number;
  date: string;
}

interface ExpenseDeleteLog {
  id: string;
  desc: string;
  amount: number;
  deletedAt: string;
  deletedBy: string;
}

const CATEGORIES = ['Facilities', 'Utilities', 'Supplies', 'Marketing', 'Payroll', 'Other'];

const Expenses: React.FC = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const { currencySymbol } = useCurrency();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: '1', desc: 'Monthly Rent', category: 'Facilities', amount: 2400.00, date: '2024-05-01' },
    { id: '2', desc: 'Electricity Bill', category: 'Utilities', amount: 320.50, date: '2024-05-05' },
    { id: '3', desc: 'Inventory Restock', category: 'Supplies', amount: 1540.20, date: '2024-05-10' },
    { id: '4', desc: 'Marketing Ads', category: 'Marketing', amount: 500.00, date: '2024-05-12' },
    { id: '5', desc: 'Staff Training', category: 'Payroll', amount: 200.00, date: '2024-05-14' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);
  const [deleteLogs, setDeleteLogs] = useState<ExpenseDeleteLog[]>([]);
  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [newExpense, setNewExpense] = useState({
    desc: '',
    category: 'Supplies',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const expense: ExpenseItem = {
      id: Math.random().toString(36).substr(2, 9),
      desc: newExpense.desc,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date
    };

    setExpenses(prev => [expense, ...prev]);
    setIsSuccess(true);
    addNotification({
      title: 'Expense Logged',
      message: `${expense.desc} (${currencySymbol}${expense.amount}) added to ledger.`,
      type: 'success'
    });
    
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setNewExpense({
        desc: '',
        category: 'Supplies',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    }, 1500);
  };

  // Initiate Deletion with OTP
  const initiateDelete = (exp: ExpenseItem) => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setExpenseToDelete(exp);
    setIsOtpModalOpen(true);
    setOtpValue(['', '', '', '']);
    setOtpError(false);

    // Mock sending OTP
    addNotification({
      title: 'Verification Code',
      message: `Use code ${newOtp} to delete "${exp.desc}".`,
      type: 'info'
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpValue];
    newOtp[index] = value.slice(-1);
    setOtpValue(newOtp);
    setOtpError(false);

    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const verifyAndDestroy = () => {
    const enteredOtp = otpValue.join('');
    if (enteredOtp === generatedOtp && expenseToDelete) {
      // Record the deletion in logs
      const newLog: ExpenseDeleteLog = {
        id: expenseToDelete.id,
        desc: expenseToDelete.desc,
        amount: expenseToDelete.amount,
        deletedAt: new Date().toLocaleString(),
        deletedBy: user?.email || 'System Admin'
      };
      
      setDeleteLogs(prev => [newLog, ...prev]);
      setExpenses(prev => prev.filter(exp => exp.id !== expenseToDelete.id));
      setIsOtpModalOpen(false);
      setExpenseToDelete(null);
      addNotification({
        title: 'Expense Deleted',
        message: `Financial record "${expenseToDelete.desc}" has been permanently removed and logged.`,
        type: 'warning'
      });
    } else {
      setOtpError(true);
      setOtpValue(['', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = exp.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           exp.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const totalThisMonth = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-1">
          <div className="bg-rose-100 p-3 rounded-xl text-rose-600 shadow-inner">
            <Receipt size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Expense Ledger</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center mt-1">
              <TrendingDown size={14} className="mr-1 text-rose-500" />
              Total Period: <span className="ml-1 text-rose-600">{currencySymbol}{totalThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsLogsModalOpen(true)}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200"
            title="View Deletion Audit Logs"
          >
            <History size={20} />
          </button>
          
          <div className="relative group hidden sm:block">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-95 flex-1 md:flex-none"
          >
            <Plus size={20} className="mr-2" />
            Log Expense
          </button>
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-black text-slate-800">Expense Journal</h3>
            {searchQuery && (
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                Filtered Results
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span>{filteredExpenses.length} Records found</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="px-8 py-4">Expense Details</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4 text-center">Date</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="text-sm text-slate-700 hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{exp.desc}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">Ref: EXP-{exp.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200/50">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center text-slate-500 text-xs font-bold">
                        <Calendar size={12} className="mr-1.5 opacity-50" />
                        {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-black text-rose-600 tracking-tight">
                        -{currencySymbol}{exp.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => initiateDelete(exp)}
                        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete with verification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <Search size={40} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold text-sm">No expenses found matching your criteria</p>
                      <button 
                        onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} 
                        className="mt-4 text-indigo-600 text-xs font-black uppercase hover:underline"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deletion Audit Logs Modal */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  <History size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Expense Audit Logs</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archived Deletion History</p>
                </div>
              </div>
              <button onClick={() => setIsLogsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              {deleteLogs.length > 0 ? (
                <div className="space-y-4">
                  {deleteLogs.map((log, idx) => (
                    <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-[9px] font-black uppercase">Removed</span>
                          <p className="font-black text-slate-900 text-sm">{log.desc}</p>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Deleted By: <span className="text-indigo-600 font-bold">{log.deletedBy}</span></p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{log.deletedAt}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-rose-600">-{currencySymbol}{log.amount.toFixed(2)}</p>
                        <span className="text-[9px] font-mono font-bold text-slate-300">ID: {log.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-slate-50 p-6 rounded-full mb-4">
                    <History size={40} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No deletion records found</p>
                  <p className="text-xs text-slate-400 mt-1">When an expense is deleted via verification, it will be logged here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal (NO BLUR FOR VISIBILITY) */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Verify Deletion</h3>
              <p className="text-xs font-medium text-slate-500 mb-8 px-4 leading-relaxed">
                Enter the 4-digit code appearing in the floating notification to delete: 
                <span className="block mt-1 font-bold text-slate-900">"{expenseToDelete?.desc}"</span>
              </p>
              
              <div className="flex justify-center space-x-3 mb-8">
                {otpValue.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className={`w-14 h-16 text-center text-2xl font-black rounded-2xl border ${otpError ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'} outline-none transition-all`}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest mb-4 animate-bounce">
                  Invalid Verification Code
                </p>
              )}

              <div className="flex flex-col space-y-3">
                <button 
                  onClick={verifyAndDestroy}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center"
                >
                  <ShieldCheck size={18} className="mr-2" />
                  Confirm Removal
                </button>
                <button 
                  onClick={() => setIsOtpModalOpen(false)} 
                  className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 py-2"
                >
                  Abort Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            
            {isSuccess ? (
              <div className="p-12 text-center animate-in zoom-in-90 duration-300">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-50">
                  <CheckCircle2 size={48} className="animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Expense Recorded</h3>
                <p className="text-slate-500 font-medium">Your financial ledger has been updated.</p>
              </div>
            ) : (
              <>
                <div className="px-8 py-7 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                      <Receipt size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Log New Expense</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Outflow Tracking</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm rounded-full transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        required
                        type="text" 
                        value={newExpense.desc}
                        onChange={e => setNewExpense({...newExpense, desc: e.target.value})}
                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold placeholder:text-slate-300" 
                        placeholder="e.g. Office Stationery, Cloud Server Bill" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                      <select 
                        required
                        value={newExpense.category}
                        onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold bg-white"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date</label>
                      <input 
                        required
                        type="date" 
                        value={newExpense.date}
                        onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount ({currencySymbol})</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">{currencySymbol}</div>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        value={newExpense.amount}
                        onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all text-xl font-black text-rose-600 placeholder:text-slate-200" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex items-center space-x-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)} 
                      className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-95"
                    >
                      <Save size={16} className="mr-2" />
                      Confirm Expense
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
