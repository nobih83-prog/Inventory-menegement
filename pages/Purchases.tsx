
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Truck, 
  Search, 
  Download, 
  X, 
  Save, 
  CheckCircle2, 
  Package, 
  ArrowUpRight, 
  History, 
  Trash2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useSearch, useCurrency, useNotifications, useInventoryData } from '../App';

interface PurchaseRecord {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  supplier: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: string;
}

const Purchases: React.FC = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const { currencySymbol } = useCurrency();
  const { addNotification } = useNotifications();
  const { inventory, incrementStock } = useInventoryData();

  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    itemId: '',
    supplier: '',
    quantity: 1,
    unitCost: 0,
    date: new Date().toISOString().split('T')[0]
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('nashwa_purchases');
    if (saved) {
      setPurchases(JSON.parse(saved));
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('nashwa_purchases', JSON.stringify(purchases));
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => 
      p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [purchases, searchQuery]);

  const totalProcurement = useMemo(() => {
    return filteredPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  }, [filteredPurchases]);

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = inventory.find(i => i.id === formData.itemId);
    if (!selectedItem) {
      alert("Please select a valid item from inventory");
      return;
    }

    const totalCost = formData.quantity * formData.unitCost;
    const newPurchase: PurchaseRecord = {
      id: `PUR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      itemId: formData.itemId,
      itemName: selectedItem.name,
      sku: selectedItem.sku,
      supplier: formData.supplier,
      quantity: formData.quantity,
      unitCost: formData.unitCost,
      totalCost: totalCost,
      date: formData.date
    };

    // Update Purchases Ledger
    setPurchases(prev => [newPurchase, ...prev]);
    
    // SYNC: Increment Inventory Stock
    incrementStock(formData.itemId, formData.quantity);

    addNotification({
      title: 'Purchase Recorded',
      message: `Stock for ${selectedItem.name} increased by ${formData.quantity}.`,
      type: 'success'
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setFormData({
        itemId: '',
        supplier: '',
        quantity: 1,
        unitCost: 0,
        date: new Date().toISOString().split('T')[0]
      });
    }, 1500);
  };

  const downloadCSV = () => {
    if (purchases.length === 0) return;
    const headers = ['Purchase ID', 'Item', 'SKU', 'Supplier', 'Quantity', 'Unit Cost', 'Total Cost', 'Date'].join(',');
    const rows = purchases.map(p => [
      p.id,
      `"${p.itemName}"`,
      p.sku,
      `"${p.supplier}"`,
      p.quantity,
      p.unitCost,
      p.totalCost,
      p.date
    ].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nashwa_procurement_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between">
           <div className="flex items-center space-x-6">
             <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <Truck size={32} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">Procurement Hub</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Inventory Buy-Ins & Supply Tracking</p>
             </div>
           </div>
           <div className="flex items-center space-x-4 mt-6 md:mt-0">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Outflow</p>
                <h3 className="text-3xl font-black text-slate-900">{currencySymbol}{totalProcurement.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center"
              >
                <Plus size={18} className="mr-2" />
                New Buy-In
              </button>
           </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[3rem] flex flex-col justify-between group">
           <div className="flex justify-between items-start">
              <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><History size={24} /></div>
              <ArrowUpRight size={20} className="text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </div>
           <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recent Restocks</p>
              <h4 className="text-lg font-black text-indigo-900">{purchases.length} Transactions</h4>
           </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
           <div className="relative w-80 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by supplier or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all"
              />
           </div>
           <button 
            onClick={downloadCSV}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-slate-100 bg-white shadow-sm"
           >
             <Download size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="px-10 py-5">Purchase ID</th>
                <th className="px-10 py-5">Item Identity</th>
                <th className="px-10 py-5">Supplier Source</th>
                <th className="px-10 py-5 text-center">Volume</th>
                <th className="px-10 py-5">Total Cost</th>
                <th className="px-10 py-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((pur) => (
                  <tr key={pur.id} className="text-sm text-slate-700 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6 font-mono font-bold text-slate-900">{pur.id}</td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{pur.itemName}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SKU: {pur.sku}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">{pur.supplier[0]}</div>
                         <span className="font-bold text-slate-700">{pur.supplier}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center font-black">{pur.quantity}</td>
                    <td className="px-10 py-6 font-black text-indigo-600">{currencySymbol}{pur.totalCost.toFixed(2)}</td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex items-center justify-end text-slate-400 text-xs font-bold uppercase tracking-wide">
                          <Calendar size={12} className="mr-2 opacity-40" />
                          {pur.date}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Truck size={64} className="mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">No procurement records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Buy-In Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            
            {isSuccess ? (
              <div className="p-16 text-center animate-in zoom-in-90 duration-300">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50">
                  <CheckCircle2 size={48} className="animate-bounce" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">Order Confirmed</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Inventory levels have been automatically adjusted and logged.</p>
              </div>
            ) : (
              <>
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                      <Truck size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Purchase</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Procurement Node</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSavePurchase} className="p-10 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Select Inventory Item</label>
                    <select 
                      required
                      value={formData.itemId}
                      onChange={(e) => setFormData({...formData, itemId: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold bg-white"
                    >
                      <option value="">Choose item...</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Supplier Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      placeholder="e.g. Arabica Roast Masters"
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Quantity</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Unit Cost ({currencySymbol})</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={formData.unitCost}
                        onChange={(e) => setFormData({...formData, unitCost: parseFloat(e.target.value) || 0})}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center space-x-6">
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Procurement Cost</p>
                      <h4 className="text-3xl font-black text-indigo-600">{currencySymbol}{(formData.quantity * formData.unitCost).toFixed(2)}</h4>
                    </div>
                    <button 
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-95"
                    >
                      <Save size={18} className="mr-2" />
                      Save Purchase
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

export default Purchases;
