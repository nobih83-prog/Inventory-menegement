
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Truck,
  Printer,
  FileText,
  X,
  ArrowRight,
  Barcode,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearch, useCurrency, useNotifications, useAuth, useInventoryData } from '../App';

const mockSalesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const recentTransactions = [
  { id: 1, name: 'Jane Doe', initial: 'JD', date: 'May 15, 2024', amount: 124.50, status: 'Completed' },
  { id: 2, name: 'John Smith', initial: 'JS', date: 'May 14, 2024', amount: 89.20, status: 'Completed' },
  { id: 3, name: 'Robert Brown', initial: 'RB', date: 'May 14, 2024', amount: 45.00, status: 'Pending' },
  { id: 4, name: 'Sarah Wilson', initial: 'SW', date: 'May 13, 2024', amount: 210.30, status: 'Completed' },
  { id: 5, name: 'Michael Chen', initial: 'MC', date: 'May 12, 2024', amount: 32.15, status: 'Completed' },
];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon size={24} />
      </div>
      <div className={`flex items-center text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {change >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
        {Math.abs(change)}%
      </div>
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
  </div>
);

const Dashboard: React.FC = () => {
  const { searchQuery } = useSearch();
  const { currencySymbol } = useCurrency();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const { inventory, incrementStock } = useInventoryData();
  const location = useLocation();
  const navigate = useNavigate();

  // Derived low stock items from REAL inventory
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.stock < item.minStockLevel);
  }, [inventory]);

  const [orderingItems, setOrderingItems] = useState<string[]>([]);
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  const [focusedAlertItem, setFocusedAlertItem] = useState<any>(null);

  // Catch notification clicks and route to detail modal
  useEffect(() => {
    const highlightId = (location.state as any)?.highlightId;
    if (highlightId) {
      const item = lowStockItems.find(i => i.id === highlightId);
      if (item) {
        setFocusedAlertItem(item);
      }
    }
  }, [location.state, lowStockItems]);

  const handleOrder = (itemId: string, itemName: string, minLevel: number, currentStock: number) => {
    setOrderingItems(prev => [...prev, itemId]);
    
    // Simulate procurement process
    setTimeout(() => {
      // Calculate how much to add (enough to clear alert + buffer)
      const restockAmount = Math.max(20, (minLevel - currentStock) + Math.ceil(minLevel * 0.5));
      
      // Update the REAL global state
      incrementStock(itemId, restockAmount);

      setOrderingItems(prev => prev.filter(id => id !== itemId));
      setOrderedItems(prev => [...prev, itemId]);
      
      addNotification({
        title: 'Restock Completed',
        message: `${itemName} stock increased by ${restockAmount}.`,
        type: 'success',
      });
      
      // Clean up "ordered" state after 5 seconds
      setTimeout(() => {
        setOrderedItems(prev => prev.filter(id => id !== itemId));
      }, 5000);
    }, 1500);
  };

  const handlePrintPO = (item: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const poId = `PO-${item.id.toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const svgId = `po-barcode-${item.id}`;

    const poContent = `
      <html>
        <head>
          <title>PO - ${poId}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #333; line-height: 1.4; }
            .header { border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .po-title { font-size: 28px; font-weight: 900; text-transform: uppercase; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .section-label { font-size: 10px; color: #777; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 5px; }
            .section-value { font-size: 14px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; border-bottom: 2px solid #eee; padding: 12px 10px; font-size: 11px; text-transform: uppercase; color: #666; }
            td { padding: 15px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
            .barcode-area { margin-top: 40px; text-align: center; border-top: 1px dashed #ccc; padding-top: 30px; }
            .footer { margin-top: 50px; font-size: 11px; color: #999; text-align: center; font-style: italic; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="po-title">Purchase Order</div>
              <div style="font-weight: 800; color: #4f46e5;">${user?.businessName || 'Nashwa Node'}</div>
            </div>
            <div style="text-align: right; font-size: 12px; font-weight: 700;">${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="info-grid">
            <div>
              <div class="section-label">Supplier Ref</div>
              <div class="section-value">System Generated PO</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">Verified Supply Chain Partner</div>
            </div>
            <div>
              <div class="section-label">Order Reference</div>
              <div class="section-value">${poId}</div>
              <div class="section-label" style="margin-top: 15px;">Urgency</div>
              <div class="section-value" style="color: #e11d48;">CRITICAL STOCK RECOVERY</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Current Inventory</th>
                <th>Requirement</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category || 'General'}</td>
                <td>${item.stock} Units</td>
                <td>Restock to ${item.minStockLevel}+ Units</td>
              </tr>
            </tbody>
          </table>

          <div class="barcode-area">
            <div class="section-label">Electronic verification barcode</div>
            <svg id="${svgId}"></svg>
          </div>

          <div class="footer">
            This document was generated by Nashwa Business Intelligence. 
            All transactions are logged for audit purposes.
          </div>

          <script>
            window.onload = function() {
              JsBarcode("#${svgId}", "${poId}", {
                format: "CODE128",
                width: 2,
                height: 50,
                displayValue: true,
                fontSize: 14,
                margin: 10
              });
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(poContent);
    printWindow.document.close();
  };

  const filteredLowStock = useMemo(() => {
    return lowStockItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [lowStockItems, searchQuery]);

  const filteredTransactions = recentTransactions.filter(tr => 
    tr.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    `#TR-50${tr.id}2`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search status indicator */}
      {searchQuery && (
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <p className="text-sm text-indigo-700">
            Filtering by: <span className="font-bold">"{searchQuery}"</span>
          </p>
          <button onClick={() => navigate('/inventory', { state: { query: searchQuery } })} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">View in Inventory</button>
        </div>
      )}

      {/* Focused Alert Modal (Triggered by Notification) */}
      {focusedAlertItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-rose-600 p-10 text-white relative">
              <button 
                onClick={() => { setFocusedAlertItem(null); navigate(location.pathname, { replace: true, state: {} }); }}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <AlertTriangle size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Critical Stock Alert</h2>
                  <p className="text-rose-100 text-xs font-bold uppercase tracking-widest">Action Required Immediately</p>
                </div>
              </div>
              <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mb-1">Item Identity</p>
                      <h3 className="text-xl font-black">{focusedAlertItem.name}</h3>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mb-1">Current Stock</p>
                      <span className="text-3xl font-black">{focusedAlertItem.stock}</span>
                      <span className="text-sm font-bold opacity-60 ml-2">/ {focusedAlertItem.minStockLevel} min</span>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                    <Truck size={12} className="mr-2 text-indigo-500" /> Catalog Ref
                  </p>
                  <p className="text-sm font-black text-slate-800">{focusedAlertItem.sku || 'N/A'}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                    <Package size={12} className="mr-2 text-indigo-500" /> Category
                  </p>
                  <p className="text-sm font-black text-slate-800">{focusedAlertItem.category || 'Inventory'}</p>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => handlePrintPO(focusedAlertItem)}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
                >
                  <Printer size={18} className="mr-3" />
                  Print Purchase Order
                </button>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => { setFocusedAlertItem(null); navigate('/inventory', { state: { highlightId: focusedAlertItem.id } }); }}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center"
                  >
                    <ExternalLink size={14} className="mr-2" />
                    Inventory View
                  </button>
                  <button 
                    onClick={() => { setFocusedAlertItem(null); navigate(location.pathname, { replace: true, state: {} }); }}
                    className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600"
                  >
                    Dismiss Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value={`${currencySymbol}12,845`} change={12.5} icon={DollarSign} color="indigo" />
        <StatCard title="Total Customers" value="842" change={8.2} icon={Users} color="blue" />
        <StatCard title="Inventory Value" value={`${currencySymbol}45,210`} change={-2.4} icon={Package} color="amber" />
        <StatCard title="Total Expenses" value={`${currencySymbol}3,120`} change={5.1} icon={AlertTriangle} color="rose" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Weekly Revenue</h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSalesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  formatter={(value: any) => [`${currencySymbol}${value}`, 'Revenue']}
                  contentStyle={{backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Low Stock Alerts</h3>
            <AlertTriangle size={18} className="text-amber-500 animate-pulse" />
          </div>
          
          <div className="space-y-4 flex-1">
            {filteredLowStock.length > 0 ? (
              filteredLowStock.map((item) => {
                const isOrdering = orderingItems.includes(item.id);
                const isOrdered = orderedItems.includes(item.id);
                const isFocused = focusedAlertItem?.id === item.id;

                return (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isFocused ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : isOrdered ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-sm font-black truncate ${isFocused ? 'text-indigo-700' : 'text-slate-800'}`}>{item.name}</p>
                      <div className="flex items-center mt-0.5">
                        {isOrdered ? (
                          <span className="text-[10px] text-emerald-700 font-black uppercase flex items-center">
                            <CheckCircle2 size={10} className="mr-1" /> Success
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">
                            Stock: <span className={`font-black ${item.stock < item.minStockLevel ? 'text-rose-600' : 'text-amber-600'}`}>{item.stock}</span> / Min: {item.minStockLevel}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {(isOrdered || isFocused) && (
                        <button 
                          onClick={() => handlePrintPO(item)}
                          className="p-2 bg-white text-indigo-600 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-colors shadow-sm"
                          title="Print PO Anytime"
                        >
                          <Printer size={16} />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => !isOrdering && !isOrdered && handleOrder(item.id, item.name, item.minStockLevel, item.stock)}
                        disabled={isOrdering || isOrdered}
                        className={`text-[10px] px-3 py-2 rounded-xl border font-black uppercase tracking-tighter transition-all flex flex-col items-center min-w-[70px] justify-center ${
                          isOrdered 
                          ? 'bg-emerald-600 text-white border-emerald-700 cursor-default' 
                          : isOrdering
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100 opacity-70 cursor-wait'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 active:scale-95 shadow-sm'
                        }`}
                      >
                        {isOrdering ? (
                          <>
                            <RefreshCw size={14} className="animate-spin mb-0.5" />
                            Wait...
                          </>
                        ) : isOrdered ? (
                          <>
                            <CheckCircle2 size={14} className="mb-0.5" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Package size={14} className="mb-0.5" />
                            Restock
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <AlertTriangle size={32} className="opacity-20 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Inventory is Optimized</p>
              </div>
            )}
          </div>
          
          <button onClick={() => navigate('/inventory')} className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 py-4 border-t border-slate-50 transition-colors flex items-center justify-center group">
            Global Inventory Node <Truck size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
          <button onClick={() => navigate('/sales')} className="text-sm text-indigo-600 font-semibold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 status">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tr) => (
                  <tr key={tr.id} className="text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">#TR-50{tr.id}2</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold mr-3">{tr.initial}</div>
                        {tr.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{tr.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{currencySymbol}{tr.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        tr.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate('/sales', { state: { highlightId: `ORD-10${tr.id}` } })} className="text-slate-400 hover:text-indigo-600">Details</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
