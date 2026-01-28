
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Download, AlertCircle, 
  X, History, TrendingUp, Package, DollarSign, Save, 
  Edit, Trash2, ArrowUpCircle, ArrowDownCircle, Maximize, Camera, Zap, CheckCircle2, AlertTriangle,
  Printer,
  Barcode
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSearch, useCurrency, useNotifications } from '../App';
import JsBarcode from 'jsbarcode';

const BarcodeScanner: React.FC<{ onScan: (code: string) => void; onClose: () => void }> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let detectionInterval: number | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        if ('BarcodeDetector' in window) {
          // @ts-ignore
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['code_128', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e']
          });

          detectionInterval = window.setInterval(async () => {
            if (videoRef.current && scanning) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const code = barcodes[0].rawValue;
                  onScan(code);
                  setScanning(false);
                }
              } catch (e) { }
            }
          }, 500);
        } else {
          setError("Barcode detection API not supported in this browser.");
        }
      } catch (err) {
        setError("Camera access denied or not found.");
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (detectionInterval) window.clearInterval(detectionInterval);
    };
  }, [onScan, scanning]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
              <Camera size={20} className="mr-2 text-indigo-600" /> Scanner
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="relative aspect-square bg-slate-900 overflow-hidden flex items-center justify-center">
          {error ? (
            <div className="p-10 text-center space-y-4 text-slate-300"><AlertCircle size={48} className="mx-auto" /><p>{error}</p></div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 border-[40px] border-slate-900/40 flex items-center justify-center pointer-events-none">
                 <div className="w-64 h-48 border-2 border-indigo-500 rounded-2xl relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 animate-pulse"></div>
                 </div>
              </div>
            </>
          )}
        </div>
        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center text-xs font-bold text-slate-400">Position barcode clearly inside the frame</div>
      </div>
    </div>
  );
};

const Inventory: React.FC = () => {
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  const { currencySymbol } = useCurrency();
  const { addNotification } = useNotifications();

  // Inventory State
  const [inventory, setInventory] = useState([
    { id: '1', name: 'Premium Coffee Beans (1kg)', category: 'Coffee', price: 25.00, stock: 15, minStockLevel: 20, sku: 'CB-PR-01', lastRestocked: 'May 12, 2024' },
    { id: '2', name: 'Milk 1L (Whole)', category: 'Dairy', price: 1.50, stock: 120, minStockLevel: 40, sku: 'DA-MK-02', lastRestocked: 'May 14, 2024' },
    { id: '3', name: 'Croissant (Plain)', category: 'Bakery', price: 3.50, stock: 5, minStockLevel: 15, sku: 'BK-CR-01', lastRestocked: 'May 15, 2024' },
    { id: '4', name: 'Espresso Machine Cleaner', category: 'Maintenance', price: 18.00, stock: 12, minStockLevel: 5, sku: 'MT-EM-01', lastRestocked: 'Apr 28, 2024' },
    { id: '5', name: 'Paper Cups (Large)', category: 'Supplies', price: 0.15, stock: 500, minStockLevel: 100, sku: 'SP-PC-03', lastRestocked: 'May 01, 2024' },
  ]);

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

  // Modal States
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', sku: '', category: 'Coffee', stock: 0, price: 0, minStockLevel: 10 });
  const [adjustmentValue, setAdjustmentValue] = useState(1);
  const [scannedSKU, setScannedSKU] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ name: '', sku: scannedSKU, category: 'Coffee', stock: 0, price: 0, minStockLevel: 10 });
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setIsEditMode(true);
    setSelectedItem(item);
    setFormData({ ...item });
    setIsAddModalOpen(true);
    setActiveMenuId(null);
  };

  const openRestockModal = (item: any, type: 'IN' | 'OUT') => {
    setSelectedItem({ ...item, adjustmentType: type });
    setAdjustmentValue(1);
    setIsRestockModalOpen(true);
    setActiveMenuId(null);
  };

  const openDeleteModal = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const handlePrintLabel = (item: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // We create an SVG container to render the barcode
    const svgId = `barcode-${item.sku}`;
    
    const labelContent = `
      <html>
        <head>
          <title>Print Label - ${item.name}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @page { size: 58mm 40mm; margin: 0; }
            body { 
              font-family: 'Inter', sans-serif; 
              width: 58mm; 
              height: 40mm; 
              margin: 0; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              text-align: center;
              padding: 2mm;
              box-sizing: border-box;
            }
            .name { font-size: 10pt; font-weight: 800; margin-bottom: 1mm; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 100%; }
            .price { font-size: 14pt; font-weight: 900; margin-bottom: 1mm; }
            .barcode-container { width: 100%; height: 12mm; }
            svg { width: 100%; height: 100%; }
            .sku { font-size: 7pt; font-weight: 600; color: #666; margin-top: 1mm; }
          </style>
        </head>
        <body>
          <div class="name">${item.name}</div>
          <div class="price">${currencySymbol}${item.price.toFixed(2)}</div>
          <div class="barcode-container">
            <svg id="${svgId}"></svg>
          </div>
          <div class="sku">${item.sku}</div>
          <script>
            window.onload = function() {
              JsBarcode("#${svgId}", "${item.sku}", {
                format: "CODE128",
                width: 2,
                height: 40,
                displayValue: false,
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

    printWindow.document.write(labelContent);
    printWindow.document.close();
    setActiveMenuId(null);
  };

  // Actions
  const handleSaveItem = () => {
    if (isEditMode) {
      setInventory(prev => prev.map(item => item.id === selectedItem.id ? { ...item, ...formData } : item));
      addNotification({ title: 'Item Updated', message: `${formData.name} was updated successfully.`, type: 'success' });
    } else {
      const newItem = { ...formData, id: Math.random().toString(36).substr(2, 9), lastRestocked: new Date().toLocaleDateString() };
      setInventory(prev => [newItem, ...prev]);
      addNotification({ title: 'Item Added', message: `${formData.name} added to catalog.`, type: 'success' });
    }
    setIsAddModalOpen(false);
  };

  const handleStockAdjustment = () => {
    const type = selectedItem.adjustmentType;
    const finalVal = type === 'IN' ? selectedItem.stock + adjustmentValue : selectedItem.stock - adjustmentValue;
    
    if (finalVal < 0) return alert("Cannot reduce stock below zero");

    setInventory(prev => prev.map(item => item.id === selectedItem.id ? { ...item, stock: finalVal, lastRestocked: new Date().toLocaleDateString() } : item));
    addNotification({ 
      title: type === 'IN' ? 'Restocked' : 'Stock Removed', 
      message: `${selectedItem.name} balance is now ${finalVal}.`, 
      type: 'info' 
    });
    setIsRestockModalOpen(false);
  };

  const handleDelete = () => {
    setInventory(prev => prev.filter(item => item.id !== selectedItem.id));
    addNotification({ title: 'Item Deleted', message: `${selectedItem.name} has been removed from inventory.`, type: 'warning' });
    setIsDeleteModalOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 flex space-x-3 max-w-xl">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all"
              placeholder="Search by name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setIsScannerOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-white text-indigo-600 border border-slate-200 rounded-xl text-sm font-black transition-all shadow-sm">
            <Camera size={18} />
            <span className="hidden sm:inline uppercase tracking-tighter">Scan</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={openAddModal} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95">
            <Plus size={18} className="mr-2" />
            Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Inventory Catalog</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredInventory.length} Total</span>
        </div>
        
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="px-6 py-4 text-center">Item</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => { setSelectedItem(item); setIsDetailModalOpen(true); }} 
                  className={`text-sm text-slate-700 hover:bg-slate-50/80 transition-all cursor-pointer group ${activeHighlightId === item.id ? 'animate-highlight' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black">{currencySymbol}{item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center font-black">
                    <span className={item.stock < item.minStockLevel ? 'text-rose-600' : 'text-slate-900'}>{item.stock}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${item.stock < item.minStockLevel ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                      <span className="text-[10px] font-black uppercase">{item.stock < item.minStockLevel ? 'Low' : 'OK'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right overflow-visible">
                    <div className="relative inline-block text-left" ref={activeMenuId === item.id ? menuRef : null}>
                      <button onClick={(e) => toggleMenu(e, item.id)} className={`p-2 rounded-xl transition-all ${activeMenuId === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600'}`}>
                        <MoreVertical size={18} />
                      </button>
                      {activeMenuId === item.id && (
                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[100] animate-in zoom-in-95 origin-top-right">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(item); }} className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <Edit size={14} className="mr-3 text-slate-400" /> Edit Item
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handlePrintLabel(item); }} className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <Barcode size={14} className="mr-3 text-indigo-500" /> Print Label
                          </button>
                          <div className="h-px bg-slate-100 my-1 mx-2"></div>
                          <button onClick={(e) => { e.stopPropagation(); openRestockModal(item, 'IN'); }} className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <ArrowUpCircle size={14} className="mr-3 text-emerald-500" /> Restock
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); openRestockModal(item, 'OUT'); }} className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <ArrowDownCircle size={14} className="mr-3 text-amber-500" /> Remove Stock
                          </button>
                          <div className="h-px bg-slate-100 my-1 mx-2"></div>
                          <button onClick={(e) => { e.stopPropagation(); openDeleteModal(item); }} className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors">
                            <Trash2 size={14} className="mr-3 text-rose-400" /> Delete Item
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal (Restock/Remove) */}
      {isRestockModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${selectedItem.adjustmentType === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {selectedItem.adjustmentType === 'IN' ? <ArrowUpCircle size={32} /> : <ArrowDownCircle size={32} />}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">{selectedItem.adjustmentType === 'IN' ? 'Restock' : 'Remove Stock'}</h3>
            <p className="text-xs font-medium text-slate-500 mb-8">{selectedItem.name}</p>
            
            <div className="flex items-center justify-center space-x-6 mb-10">
              <button onClick={() => setAdjustmentValue(v => Math.max(1, v - 1))} className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">-</button>
              <input type="number" value={adjustmentValue} onChange={e => setAdjustmentValue(parseInt(e.target.value) || 0)} className="w-20 text-center text-3xl font-black outline-none" />
              <button onClick={() => setAdjustmentValue(v => v + 1)} className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">+</button>
            </div>

            <div className="flex flex-col space-y-3">
              <button onClick={handleStockAdjustment} className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white ${selectedItem.adjustmentType === 'IN' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-amber-600 shadow-amber-100'} shadow-xl`}>
                Confirm Adjustment
              </button>
              <button onClick={() => setIsRestockModalOpen(false)} className="text-[10px] font-black uppercase text-slate-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Item?</h3>
            <p className="text-slate-500 font-medium mb-8">Are you sure you want to remove <span className="font-bold">"{selectedItem.name}"</span>? This cannot be undone.</p>
            <div className="flex space-x-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-rose-100">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-7 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{isEditMode ? 'Edit Item' : 'New Product'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product Name</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">SKU</label>
                  <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} type="text" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold bg-white">
                    <option>Coffee</option><option>Dairy</option><option>Supplies</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Price</label>
                  <input value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} type="number" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Min Level</label>
                  <input value={formData.minStockLevel} onChange={e => setFormData({...formData, minStockLevel: parseInt(e.target.value) || 0})} type="number" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold" />
                </div>
              </div>
              <div className="pt-4 flex space-x-4">
                 <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest">Cancel</button>
                 <button onClick={handleSaveItem} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedItem && !isRestockModalOpen && !isAddModalOpen && !isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-7 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${selectedItem.stock < selectedItem.minStockLevel ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                  <Package size={28} />
                </div>
                <div><h2 className="text-2xl font-black text-slate-900">{selectedItem.name}</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedItem.sku}</p></div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-3 text-slate-400"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-3 gap-6">
                 <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Stock</p>
                    <span className={`text-4xl font-black ${selectedItem.stock < selectedItem.minStockLevel ? 'text-rose-600' : 'text-slate-900'}`}>{selectedItem.stock}</span>
                 </div>
                 <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Price</p>
                    <span className="text-3xl font-black">{currencySymbol}{selectedItem.price.toFixed(2)}</span>
                 </div>
                 <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Category</p>
                    <span className="text-sm font-black text-indigo-600">{selectedItem.category}</span>
                 </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                 <button onClick={() => openEditModal(selectedItem)} className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 flex items-center transition-all hover:bg-slate-50"><Edit size={14} className="mr-2" /> Edit</button>
                 <button onClick={() => handlePrintLabel(selectedItem)} className="px-6 py-3 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-600 flex items-center transition-all hover:bg-indigo-50"><Barcode size={14} className="mr-2" /> Print Label</button>
                 <button onClick={() => openRestockModal(selectedItem, 'IN')} className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-100"><ArrowUpCircle size={14} className="mr-2" /> Restock</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isScannerOpen && <BarcodeScanner onScan={(code) => { setSearchQuery(code); setIsScannerOpen(false); }} onClose={() => setIsScannerOpen(false)} />}
    </div>
  );
};

export default Inventory;
