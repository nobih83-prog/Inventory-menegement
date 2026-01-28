
import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Minus, ShoppingCart, CreditCard, DollarSign, Wallet, Trash2, CheckCircle2 } from 'lucide-react';
import { useCurrency, useSalesData, useAuth, useNotifications, useInventoryData } from '../App';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const NewSaleModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CARD');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { currencySymbol } = useCurrency();
  const { addSale } = useSalesData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { inventory, deductStock } = useInventoryData();

  const filteredProducts = useMemo(() => {
    return inventory.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, inventory]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      addNotification({ title: 'Out of Stock', message: `${product.name} has no remaining balance.`, type: 'warning' });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          addNotification({ title: 'Limit Reached', message: `Only ${product.stock} units available for ${product.name}.`, type: 'info' });
          return prev;
        }
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const productSource = inventory.find(p => p.id === id);
        const newQty = Math.max(1, item.quantity + delta);
        if (productSource && newQty > productSource.stock) {
           addNotification({ title: 'Stock Limit', message: `No more units available for this item.`, type: 'info' });
           return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const tax = subtotal * 0.085; // 8.5%
  const total = subtotal + tax;

  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const saleItems = cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price }));

    const newRecord = {
      id: orderId,
      userId: user?.id || 'admin-123',
      customerName: customerName || 'Walk-in Customer',
      items: saleItems,
      totalAmount: total,
      paymentMethod,
      createdAt: timestamp,
      status: 'Success' as const
    };

    // Global Data updates
    addSale(newRecord);
    deductStock(saleItems);

    addNotification({ 
      title: 'Sale Successful', 
      message: `Order ${orderId} completed for ${currencySymbol}${total.toFixed(2)}.`, 
      type: 'success' 
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50">
            <CheckCircle2 size={48} className="animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Success!</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-8">Transaction recorded</p>
          <div className="text-5xl font-black text-indigo-600 mb-6">{currencySymbol}{total.toFixed(2)}</div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Printing Digital Receipt...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full h-full md:h-[90vh] md:max-w-7xl md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Left: Product Selection */}
        <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-100 min-h-0">
          <div className="p-8 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
                  <Plus className="mr-3 text-indigo-600" /> New Transaction
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Terminal Node #01</p>
              </div>
              <button onClick={onClose} className="md:hidden p-3 bg-slate-100 text-slate-400 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="Scan SKU or search item..." 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Customer Name" 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`bg-white p-6 rounded-[2rem] border-2 text-left transition-all group active:scale-95 ${product.stock <= 0 ? 'opacity-40 border-slate-100' : 'border-slate-100 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-50'}`}
                >
                  <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 px-1 border-l-2 border-indigo-500">{product.category}</div>
                  <div className="font-black text-slate-900 text-base mb-3 leading-tight truncate">{product.name}</div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-black text-slate-800">{currencySymbol}{product.price.toFixed(2)}</span>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl ${product.stock < 10 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                      {product.stock} left
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart & Checkout */}
        <div className="w-full md:w-[450px] flex flex-col bg-white">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg tracking-tight">Active Cart</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cart.length} Products</p>
              </div>
            </div>
            <button onClick={onClose} className="hidden md:block p-3 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center animate-pulse">
                <ShoppingCart size={64} className="mb-6 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest">Cart is Empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-sm">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="font-black text-sm text-slate-900 truncate">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{currencySymbol}{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                      ><Minus size={16} /></button>
                      <span className="px-3 text-sm font-black text-slate-900 min-w-[30px] text-center">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity(item.id, 1)}
                         className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                      ><Plus size={16} /></button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors bg-white rounded-lg shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Tax (8.5%)</span>
                <span>{currencySymbol}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Final Total</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Settlement Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'CARD', icon: CreditCard, label: 'Card' },
                  { id: 'CASH', icon: DollarSign, label: 'Cash' },
                  { id: 'TRANSFER', icon: Wallet, label: 'Trans' },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                      paymentMethod === method.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.05]' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    <method.icon size={20} />
                    <span className="text-[10px] font-black uppercase mt-2 tracking-tighter">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
            >
              <CheckCircle2 size={18} className="mr-3" />
              Finalize Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSaleModal;
