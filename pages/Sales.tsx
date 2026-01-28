
import React, { useState, useEffect } from 'react';
import { ShoppingBag, CreditCard, DollarSign, Calendar, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSearch, useSaleAction, useCurrency } from '../App';

const Sales: React.FC = () => {
  const location = useLocation();
  const { searchQuery } = useSearch();
  const { setIsNewSaleModalOpen } = useSaleAction();
  const { currencySymbol } = useCurrency();

  // Highlight State
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const highlightId = (location.state as any)?.highlightId;
    if (highlightId) {
      setActiveHighlightId(highlightId);
      // Auto-clear highlight after animation completes
      const timer = setTimeout(() => setActiveHighlightId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const salesRecords = [
    { id: 'ORD-101', customer: 'Walk-in Customer', method: 'Cash', amount: 45.20, date: 'May 15, 14:22', status: 'Success' },
    { id: 'ORD-102', customer: 'John Smith', method: 'Card', amount: 12.00, date: 'May 15, 13:05', status: 'Success' },
    { id: 'ORD-103', customer: 'Maria Garcia', method: 'Transfer', amount: 350.00, date: 'May 15, 11:45', status: 'Success' },
    { id: 'ORD-104', customer: 'Walk-in Customer', method: 'Card', amount: 8.50, date: 'May 15, 09:12', status: 'Refunded' },
    { id: 'ORD-105', customer: 'David Chen', method: 'Card', amount: 65.00, date: 'May 14, 17:40', status: 'Success' },
  ];

  const downloadCSV = () => {
    if (salesRecords.length === 0) return;
    const headers = Object.keys(salesRecords[0]).join(',');
    const rows = salesRecords.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nashwa_sales_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSales = salesRecords.filter(sale => 
    sale.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Daily Revenue</p>
          <div className="flex items-end space-x-2 mt-1">
            <h3 className="text-2xl font-bold text-slate-800">{currencySymbol}1,245.00</h3>
            <span className="text-emerald-500 text-sm font-bold pb-1">+14%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Orders Today</p>
          <h3 className="text-2xl font-bold text-slate-800">42</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Avg. Ticket Size</p>
          <h3 className="text-2xl font-bold text-slate-800">{currencySymbol}29.64</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">All Sales Records</h3>
          <div className="flex items-center space-x-3">
             <button 
              onClick={downloadCSV}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200"
              title="Export Sales Records"
             >
              <Download size={20} />
            </button>
             <button 
              onClick={() => setIsNewSaleModalOpen(true)}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
             >
              New Transaction
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => (
                <tr 
                  key={sale.id} 
                  className={`text-sm text-slate-700 hover:bg-slate-50 transition-colors ${activeHighlightId === sale.id ? 'animate-highlight' : ''}`}
                >
                  <td className="px-6 py-4 font-mono font-medium">{sale.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{sale.customer}</td>
                  <td className="px-6 py-4 flex items-center">
                    {sale.method === 'Card' ? <CreditCard size={14} className="mr-2" /> : sale.method === 'Cash' ? <DollarSign size={14} className="mr-2" /> : <ShoppingBag size={14} className="mr-2" />}
                    {sale.method}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{currencySymbol}{sale.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                    <div className="flex items-center uppercase tracking-wide">
                      <Calendar size={12} className="mr-1.5" />
                      {sale.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      sale.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions found matching "{searchQuery}"
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

export default Sales;
