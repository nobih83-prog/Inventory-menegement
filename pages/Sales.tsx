
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, CreditCard, DollarSign, Calendar, Download, Printer, Ban, Trash2, Search as SearchIcon, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSearch, useSaleAction, useCurrency, useAuth, useSalesData, SaleRecord } from '../App';

const Sales: React.FC = () => {
  const location = useLocation();
  const { searchQuery } = useSearch();
  const { setIsNewSaleModalOpen } = useSaleAction();
  const { currencySymbol } = useCurrency();
  const { user } = useAuth();
  const { sales, voidSale } = useSalesData();

  // Highlight State
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  
  // Void Confirmation State
  const [saleToVoid, setSaleToVoid] = useState<SaleRecord | null>(null);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);

  useEffect(() => {
    const highlightId = (location.state as any)?.highlightId;
    if (highlightId) {
      setActiveHighlightId(highlightId);
      const timer = setTimeout(() => setActiveHighlightId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => 
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sales, searchQuery]);

  const stats = useMemo(() => {
    const successfulSales = sales.filter(s => s.status === 'Success');
    const todayTotal = successfulSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const avgTicket = successfulSales.length > 0 ? todayTotal / successfulSales.length : 0;
    return {
      todayTotal,
      orderCount: successfulSales.length,
      avgTicket
    };
  }, [sales]);

  const handlePrintReceipt = (sale: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgId = `receipt-barcode-${sale.id}`;
    
    const receiptContent = `
      <html>
        <head>
          <title>Receipt - ${sale.id}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @page { size: 58mm auto; margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 58mm; 
              margin: 0; 
              padding: 5mm; 
              box-sizing: border-box;
              text-align: center;
              font-size: 9pt;
            }
            .biz-name { font-size: 12pt; font-weight: 900; margin-bottom: 2mm; text-transform: uppercase; }
            .header-info { margin-bottom: 4mm; font-size: 8pt; border-bottom: 1px dashed #000; padding-bottom: 2mm; }
            .row { display: flex; justify-content: space-between; margin-bottom: 1mm; text-align: left; }
            .total-row { border-top: 1px dashed #000; margin-top: 3mm; padding-top: 2mm; font-weight: 900; font-size: 11pt; }
            .barcode-container { margin-top: 6mm; width: 100%; text-align: center; }
            svg { width: 100%; height: 10mm; }
            .footer { margin-top: 4mm; font-size: 7pt; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="biz-name">${user?.businessName || 'NASHWA BUSINESS'}</div>
          <div class="header-info">
            Ref: ${sale.id}<br>
            Date: ${sale.createdAt}<br>
            User: ${user?.name || 'System'}
          </div>
          
          <div class="row">
            <span>Customer:</span>
            <span>${sale.customerName}</span>
          </div>
          <div class="row">
            <span>Payment:</span>
            <span>${sale.paymentMethod}</span>
          </div>
          
          <div class="row total-row">
            <span>TOTAL:</span>
            <span>${currencySymbol}${sale.totalAmount.toFixed(2)}</span>
          </div>

          <div class="barcode-container">
            <svg id="${svgId}"></svg>
          </div>
          
          <div class="footer">
            Thank you for your visit!<br>
            nashwa.io/verify
          </div>

          <script>
            window.onload = function() {
              JsBarcode("#${svgId}", "${sale.id}", {
                format: "CODE128",
                width: 1.5,
                height: 35,
                displayValue: true,
                fontSize: 10,
                margin: 0
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

    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const downloadCSV = () => {
    if (sales.length === 0) return;
    const headers = ['Order ID', 'Customer', 'Payment Method', 'Amount', 'Date', 'Status'].join(',');
    const rows = sales.map(s => [
      s.id,
      `"${s.customerName}"`,
      s.paymentMethod,
      s.totalAmount.toFixed(2),
      `"${s.createdAt}"`,
      s.status
    ].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nashwa_sales_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInitiateVoid = (sale: SaleRecord) => {
    setSaleToVoid(sale);
    setIsVoidModalOpen(true);
  };

  const handleConfirmVoid = () => {
    if (saleToVoid) {
      voidSale(saleToVoid.id);
      setIsVoidModalOpen(false);
      setSaleToVoid(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Revenue</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-black text-slate-900">{currencySymbol}{stats.todayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            <span className="text-emerald-500 text-xs font-bold">+14%</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Orders Count</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.orderCount}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Avg. Ticket</p>
          <h3 className="text-3xl font-black text-slate-900">{currencySymbol}{stats.avgTicket.toFixed(2)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Sales History</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Transaction Ledger</p>
          </div>
          <div className="flex items-center space-x-3">
             <button 
              onClick={downloadCSV}
              className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-slate-100 bg-white shadow-sm"
              title="Export Sales Records"
             >
              <Download size={20} />
            </button>
             <button 
              onClick={() => setIsNewSaleModalOpen(true)}
              className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center"
             >
              <ShoppingBag size={18} className="mr-2" />
              New Sale
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="px-10 py-5">Order Reference</th>
                <th className="px-10 py-5">Client Identity</th>
                <th className="px-10 py-5">Payment Flow</th>
                <th className="px-10 py-5">Total Value</th>
                <th className="px-10 py-5">Timestamp</th>
                <th className="px-10 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => (
                <tr 
                  key={sale.id} 
                  className={`text-sm text-slate-700 hover:bg-slate-50/50 transition-colors group ${activeHighlightId === sale.id ? 'animate-highlight' : ''}`}
                >
                  <td className="px-10 py-6 font-mono font-bold text-slate-900">{sale.id}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-all">{sale.customerName[0]}</div>
                      <span className="font-bold">{sale.customerName}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-2">
                      {sale.paymentMethod === 'CARD' ? <CreditCard size={14} className="text-blue-500" /> : sale.paymentMethod === 'CASH' ? <DollarSign size={14} className="text-emerald-500" /> : <ShoppingBag size={14} className="text-amber-500" />}
                      <span className="text-[10px] font-black uppercase tracking-tight">{sale.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-black text-slate-900 text-base">{currencySymbol}{sale.totalAmount.toFixed(2)}</td>
                  <td className="px-10 py-6 text-slate-500 text-xs font-bold">
                    <div className="flex items-center uppercase tracking-wide">
                      <Calendar size={12} className="mr-2 opacity-40" />
                      {sale.createdAt}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right overflow-visible">
                    <div className="flex items-center justify-end space-x-3">
                       <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        sale.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {sale.status}
                      </span>
                      <button 
                        onClick={() => handlePrintReceipt(sale)}
                        className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm"
                        title="Print Mini Receipt"
                      >
                        <Printer size={18} />
                      </button>
                      {sale.status === 'Success' && (
                        <button 
                          onClick={() => handleInitiateVoid(sale)}
                          className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm"
                          title="Void Transaction"
                        >
                          <Ban size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <ShoppingBag size={64} className="mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">No matching transactions</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Void Confirmation Modal */}
      {isVoidModalOpen && saleToVoid && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={40} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Void Order?</h3>
              <p className="text-slate-500 font-medium mb-8 px-4">
                Are you sure you want to void <span className="font-bold text-slate-900">{saleToVoid.id}</span> for <span className="font-bold text-rose-600">{currencySymbol}{saleToVoid.totalAmount.toFixed(2)}</span>? 
                This will reverse the transaction and log a void record.
              </p>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsVoidModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmVoid}
                  className="flex-1 px-6 py-4 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all"
                >
                  Confirm Void
                </button>
              </div>
            </div>
            <div className="bg-rose-50 px-8 py-4 text-center">
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em]">
                System Log: Transaction Reversal Mode
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
