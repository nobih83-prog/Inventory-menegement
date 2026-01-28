
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Mail, 
  Phone, 
  Search as SearchIcon, 
  Plus, 
  MoreVertical, 
  X, 
  User, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Trash2, 
  Edit, 
  MessageSquare, 
  Save,
  CheckCircle2,
  Download,
  AlertTriangle,
  History,
  ExternalLink,
  Printer
} from 'lucide-react';
import { useSearch, useAuth, useNotifications } from '../App';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  spent: number;
  visits: number;
  lastVisit: string;
  joinDate: string;
}

interface DeleteLog {
  timestamp: string;
  customerName: string;
  deletedBy: string;
  customerId: string;
}

const Customers: React.FC = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerRecord | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // New Customer Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  
  // Audit Logs for deletions
  const [deleteLogs, setDeleteLogs] = useState<DeleteLog[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedCustomers = localStorage.getItem('nashwa_customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      // Initial default data if none exists
      const defaults: CustomerRecord[] = [
        { id: '1', name: 'John Smith', email: 'john@example.com', phone: '+1 234 567 890', spent: 1250.40, visits: 12, lastVisit: 'May 12, 2024', joinDate: 'Jan 10, 2023' },
        { id: '2', name: 'Maria Garcia', email: 'maria.g@gmail.com', phone: '+1 987 654 321', spent: 840.00, visits: 8, lastVisit: 'May 15, 2024', joinDate: 'Feb 15, 2023' }
      ];
      setCustomers(defaults);
      localStorage.setItem('nashwa_customers', JSON.stringify(defaults));
    }

    const savedLogs = localStorage.getItem('nashwa_customer_logs');
    if (savedLogs) setDeleteLogs(JSON.parse(savedLogs));
  }, []);

  // Save to localStorage whenever customers change
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem('nashwa_customers', JSON.stringify(customers));
    }
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('nashwa_customer_logs', JSON.stringify(deleteLogs));
  }, [deleteLogs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newCustomer: CustomerRecord = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: formData.name,
      email: formData.email || 'N/A',
      phone: formData.phone || 'N/A',
      spent: 0,
      visits: 0,
      lastVisit: 'Never',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setCustomers(prev => [newCustomer, ...prev]);
    setIsSuccess(true);
    addNotification({
      title: 'Customer Added',
      message: `${newCustomer.name} has been added to your directory.`,
      type: 'success'
    });

    // Reset form and close modal after animation
    setTimeout(() => {
      setIsSuccess(false);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '' });
    }, 1500);
  };

  const mockTransactions = [
    { id: 'ORD-102', date: 'May 15, 2024', amount: 45.20, items: 3, status: 'Success' },
    { id: 'ORD-098', date: 'May 10, 2024', amount: 12.00, items: 1, status: 'Success' },
    { id: 'ORD-085', date: 'Apr 25, 2024', amount: 84.50, items: 5, status: 'Success' },
  ];

  const exportCustomerStatement = (customer: CustomerRecord) => {
    try {
      const headers = ['Transaction ID', 'Date', 'Amount', 'Items Count', 'Status'];
      const rows = mockTransactions.map(tx => [
        tx.id,
        tx.date,
        tx.amount.toFixed(2),
        tx.items,
        tx.status
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [
            `Statement for: ${customer.name}`,
            `Generated by: ${user?.businessName}`,
            `Date: ${new Date().toLocaleDateString()}`,
            '',
            headers.join(','), 
            ...rows.map(r => r.join(','))
          ].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Statement_${customer.name.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addNotification({
        title: 'Export Complete',
        message: `Financial statement for ${customer.name} is ready.`,
        type: 'success'
      });
    } catch (err) {
      addNotification({ title: 'Export Error', message: 'Could not generate CSV.', type: 'error' });
    }
  };

  const downloadCSV = () => {
    if (customers.length === 0) return;
    const headers = Object.keys(customers[0]).join(',');
    const rows = customers.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nashwa_customer_directory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRowClick = (customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const confirmDelete = (customer: CustomerRecord) => {
    setCustomerToDelete(customer);
    setIsDeleteConfirmOpen(true);
    setActiveMenuId(null);
  };

  const executeDelete = () => {
    if (customerToDelete) {
      const newLog: DeleteLog = {
        timestamp: new Date().toLocaleString(),
        customerName: customerToDelete.name,
        deletedBy: user?.email || 'Anonymous System User',
        customerId: customerToDelete.id
      };
      
      setDeleteLogs(prev => [newLog, ...prev]);
      setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
      setIsDeleteConfirmOpen(false);
      setCustomerToDelete(null);
      addNotification({ title: 'Record Deleted', message: 'Customer removed and logged.', type: 'warning' });
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Action Handlers
  const handleCall = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    if (phone === 'N/A') return;
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    if (email === 'N/A') return;
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all font-medium"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="bg-white text-slate-600 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold flex items-center hover:bg-slate-50 transition-all shadow-sm"
            title="View Deletion Audit Log"
          >
            <History size={18} className="mr-2 text-rose-500" />
            Audit Logs
          </button>
          <button 
            onClick={downloadCSV}
            className="hidden lg:flex bg-white text-slate-600 border border-slate-200 px-5 py-3 rounded-2xl text-sm font-bold items-center hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} className="mr-2" />
            Export Directory
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={18} className="mr-2" />
            New Customer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-visible">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-black text-slate-800">Customer Directory</h3>
            {searchQuery && (
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                {filteredCustomers.length} Matches
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {filteredCustomers.length} Total Records
          </div>
        </div>
        
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="px-8 py-4">Client Identity</th>
                <th className="px-8 py-4">Contact Details</th>
                <th className="px-8 py-4 text-center">Frequency</th>
                <th className="px-8 py-4">Total Value</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => handleRowClick(c)}
                    className="text-sm text-slate-700 hover:bg-slate-50/80 transition-all cursor-pointer group relative"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl mr-4 border border-indigo-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {c.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Joined {c.joinDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col space-y-1">
                        <button 
                          onClick={(e) => handleEmail(e, c.email)}
                          className="flex items-center text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors w-fit"
                        >
                          <Mail size={14} className="mr-2 text-slate-400" />
                          {c.email}
                        </button>
                        <button 
                          onClick={(e) => handleCall(e, c.phone)}
                          className="flex items-center text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors w-fit"
                        >
                          <Phone size={14} className="mr-2 text-slate-400" />
                          {c.phone}
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-slate-900 text-lg">{c.visits}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase">Visits</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-indigo-600 text-base">${c.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Life-time Revenue</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right overflow-visible">
                      <div className="relative inline-block text-left" ref={activeMenuId === c.id ? menuRef : null}>
                        <button 
                          onClick={(e) => toggleMenu(e, c.id)}
                          className={`p-2.5 rounded-xl transition-all ${activeMenuId === c.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {activeMenuId === c.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[100] animate-in zoom-in-95 duration-150 origin-top-right">
                            <button onClick={(e) => { e.stopPropagation(); handleRowClick(c); setActiveMenuId(null); }} className="w-full flex items-center px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                              <User size={14} className="mr-3 text-indigo-500" /> View Profile
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); exportCustomerStatement(c); setActiveMenuId(null); }} className="w-full flex items-center px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                              <Download size={14} className="mr-3 text-emerald-500" /> Export Statement
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleCall(e, c.phone); }} className="w-full flex items-center px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                              <Phone size={14} className="mr-3 text-slate-400" /> Voice Call
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleEmail(e, c.email); }} className="w-full flex items-center px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                              <Mail size={14} className="mr-3 text-blue-500" /> Send Email
                            </button>
                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); confirmDelete(c); }}
                              className="w-full flex items-center px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={14} className="mr-3 text-rose-400" /> Delete Client
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <User size={48} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold text-base tracking-tight">No customers found matching "{searchQuery}"</p>
                      <button 
                        onClick={() => setSearchQuery('')} 
                        className="mt-4 text-indigo-600 text-xs font-black uppercase hover:underline tracking-widest"
                      >
                        Reset Directory Search
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && customerToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Customer?</h3>
              <p className="text-slate-500 font-medium mb-8 px-4">
                Are you sure you want to remove <span className="font-bold text-slate-900">"{customerToDelete.name}"</span>? 
                This action will be logged for audit purposes and cannot be easily undone.
              </p>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 px-6 py-4 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
            <div className="bg-rose-50 px-8 py-4 text-center">
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em]">
                Action will be logged by: {user?.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Audit Logs Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  <History size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">System Audit Logs</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Record Tracking</p>
                </div>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors">
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
                          <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-[9px] font-black uppercase">Deleted</span>
                          <p className="font-black text-slate-900 text-sm">{log.customerName}</p>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">By: <span className="text-indigo-600 font-bold">{log.deletedBy}</span></p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{log.timestamp}</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-300">ID: {log.customerId}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-slate-50 p-6 rounded-full mb-4">
                    <History size={40} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No deletion history found</p>
                  <p className="text-xs text-slate-400 mt-1">Deletion events will appear here as they occur.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Profile Modal */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-indigo-100">
                  {selectedCustomer.name[0]}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{selectedCustomer.name}</h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <button onClick={(e) => handleEmail(e, selectedCustomer.email)} className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-widest flex items-center">
                      <Mail size={12} className="mr-1.5" /> {selectedCustomer.email}
                    </button>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <button onClick={(e) => handleCall(e, selectedCustomer.phone)} className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-widest flex items-center">
                      <Phone size={12} className="mr-1.5" /> {selectedCustomer.phone}
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)} 
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* Profile Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 shadow-sm flex flex-col justify-between">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-4">Total Purchases</p>
                  <div className="flex items-center space-x-3">
                    <ShoppingBag size={24} className="text-indigo-600" />
                    <span className="text-4xl font-black text-indigo-900">{selectedCustomer.visits}</span>
                  </div>
                </div>
                
                <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 shadow-sm flex flex-col justify-between">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.15em] mb-4">Total Spend</p>
                  <div className="flex items-center space-x-3">
                    <DollarSign size={24} className="text-emerald-600" />
                    <span className="text-4xl font-black text-emerald-900">${selectedCustomer.spent.toFixed(0)}</span>
                  </div>
                </div>
                
                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Last Visit</p>
                  <div className="flex items-center space-x-3">
                    <Calendar size={24} className="text-slate-600" />
                    <span className="text-xl font-black text-slate-900">{selectedCustomer.lastVisit}</span>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">AOV</p>
                  <div className="flex items-center space-x-3">
                    <TrendingUp size={24} className="text-indigo-500" />
                    <span className="text-xl font-black text-slate-900">${(selectedCustomer.visits > 0 ? selectedCustomer.spent / selectedCustomer.visits : 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
                    <ShoppingBag size={24} className="mr-3 text-indigo-600" /> Purchase History
                  </h3>
                  <button 
                    onClick={() => exportCustomerStatement(selectedCustomer)}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest py-2.5 px-6 bg-indigo-50 rounded-2xl transition-all flex items-center"
                  >
                    <Download size={14} className="mr-2" />
                    Export Statement
                  </button>
                </div>
                
                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                        <th className="px-8 py-5">Order ID</th>
                        <th className="px-8 py-5">Transaction Date</th>
                        <th className="px-8 py-5">Items</th>
                        <th className="px-10 py-5">Amount</th>
                        <th className="px-8 py-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockTransactions.map((tx, idx) => (
                        <tr key={idx} className="text-sm text-slate-600 hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 font-mono font-bold text-slate-900">{tx.id}</td>
                          <td className="px-8 py-5 font-medium">{tx.date}</td>
                          <td className="px-8 py-5 font-black">{tx.items} pk.</td>
                          <td className="px-10 py-5 font-black text-slate-900">${tx.amount.toFixed(2)}</td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-tighter">
                                {tx.status}
                              </span>
                              <button className="p-1.5 text-slate-300 hover:text-indigo-600 transition-all">
                                <Printer size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="px-10 py-6 bg-slate-900 text-indigo-200 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em]">
              <div className="flex items-center space-x-8">
                <span>Client ID: NS-CUST-{selectedCustomer.id}</span>
                <span className="opacity-30">|</span>
                <span>Loyalty Tier: Platinum Elite</span>
              </div>
              <span className="text-white">Active Account</span>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            
            {isSuccess ? (
              <div className="p-16 text-center animate-in zoom-in-90 duration-300">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50">
                  <CheckCircle2 size={48} className="animate-bounce" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">Customer Registered</h3>
                <p className="text-slate-500 font-medium">New client has been added to your business directory.</p>
              </div>
            ) : (
              <>
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                      <User size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Client</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Growth Tracking</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomer} className="p-10 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Full Identity</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold placeholder:text-slate-300" 
                      placeholder="e.g. Robert Pattinson" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Email Channel</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold placeholder:text-slate-300" 
                        placeholder="hello@domain.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile Contact</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold placeholder:text-slate-300" 
                        placeholder="+1 000 000 000" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center space-x-6">
                    <button 
                      type="button"
                      onClick={() => setIsAddModalOpen(false)} 
                      className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-95"
                    >
                      <Save size={18} className="mr-2" />
                      Add to Directory
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

export default Customers;
