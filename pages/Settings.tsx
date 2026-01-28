
import React from 'react';
import { User, Building2, Bell, Shield, Palette, Database } from 'lucide-react';
import { useAuth, useCurrency } from '../App';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const code = val.split(' ')[0];
    setCurrency(code);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm">
            <Building2 size={18} />
            <span>Business Profile</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
            <User size={18} />
            <span>Account Details</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
            <Bell size={18} />
            <span>Notifications</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
            <Shield size={18} />
            <span>Security & Privacy</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
            <Palette size={18} />
            <span>Appearance</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 font-medium text-sm transition-colors">
            <Database size={18} />
            <span>Database Backup</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Business Profile</h3>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Name</label>
                <input 
                  type="text" 
                  defaultValue={user?.businessName} 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Type</label>
                  <select className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm">
                    <option>Coffee Shop / Cafe</option>
                    <option>Retail Store</option>
                    <option>Restaurant</option>
                    <option>Service Provider</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Currency</label>
                  <select 
                    value={`${currency} (${currency === 'BDT' ? '৳' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'JPY' ? '¥' : '$'})`}
                    onChange={handleCurrencyChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  >
                    <option>BDT (৳)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tax Rate (%)</label>
                <input 
                  type="number" 
                  defaultValue="8.5" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Primary Email</label>
                <input 
                  type="email" 
                  readOnly 
                  defaultValue={user?.email} 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Physical Address</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  placeholder="Street, City, Country, Zip Code"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
