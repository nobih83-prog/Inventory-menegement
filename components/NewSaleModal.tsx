
import React, { useState } from 'react';
import { X, Search, Plus, Minus, ShoppingCart, CreditCard, DollarSign, Wallet, Trash2, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../App';

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
  const [isSuccess, setIsSuccess] = useState(false);
  const { currencySymbol } = useCurrency();

  const mockInventory: Product[] = [
    { id: '1', name: 'Premium Coffee Beans (1kg)', category: 'Coffee', price: 25.00, stock: 15 },
    { id: '2', name: 'Milk 1L (Whole)', category: 'Dairy', price: 1.50, stock: 120 },
    { id: '3', name: 'Croissant (Plain)', category: 'Bakery', price: 3.50, stock: 5 },
    { id: '4', name: 'Espresso Machine Cleaner', category: 'Maintenance', price: 18.00, stock: 12 },
    { id: '5', name: 'Paper Cups (Large)', category: 'Supplies', price: 0.15, stock: 500 },
  ];

  const filteredProducts = mockInventory.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
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
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.085; // 8.5%
  const total = subtotal + tax;

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sale Completed!</h2>
          <p className="text-slate-500 mb-6">Transaction recorded successfully.</p>
          <div className="text-4xl font-black text-indigo-600 mb-4">{currencySymbol}{total.toFixed(2)}</div>
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Receipt Generated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 md:p-4">
      <div className="bg-white w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Left: Product Selection */}
        <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-100 min-h-0">
          <div className="p-6 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Plus className="mr-2 text-indigo-600" /> New Transaction
              </h2>
              <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 text-left hover:border-indigo-50 hover:shadow-lg transition-all group active:scale-95"
                >
                  <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">{product.category}</div>
                  <div className="font-bold text-slate-900 mb-2 truncate">{product.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-slate-800">{currencySymbol}{product.price.toFixed(2)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${product.stock < 10 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      Qty: {product.stock}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart & Checkout */}
        <div className="w-full md:w-[400px] flex flex-col bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="text-slate-400" size={20} />
              <h3 className="font-bold text-slate-800">Shopping Cart</h3>
            </div>
            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.length} Items
            </span>
            <button onClick={onClose} className="hidden md:block p-1 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                <ShoppingCart size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Your cart is empty</p>
                <p className="text-xs">Add items to start a sale</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="font-bold text-sm text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">{currencySymbol}{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-slate-50 text-slate-500"
                      ><Minus size={14} /></button>
                      <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity(item.id, 1)}
                         className="p-1 hover:bg-slate-50 text-slate-500"
                      ><Plus size={14} /></button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Tax (8.5%)</span>
                <span>{currencySymbol}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CARD', icon: CreditCard, label: 'Card' },
                  { id: 'CASH', icon: DollarSign, label: 'Cash' },
                  { id: 'TRANSFER', icon: Wallet, label: 'Trans' },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      paymentMethod === method.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                    }`}
                  >
                    <method.icon size={18} />
                    <span className="text-[10px] font-bold mt-1">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSaleModal;
