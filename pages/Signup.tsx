
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Mail, Lock, Building, UserPlus, User, Phone, Truck } from 'lucide-react';
import { useAuth } from '../App';
import { UserRole } from '../types';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate complex registration process
    const newUser = {
      id: `NS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      email: email,
      name: name,
      phone: phone,
      businessName: businessName,
      role: UserRole.OWNER,
      // In a real app, supplierId would be stored in the business profile
    };

    // Auto-login after successful registration
    login(newUser);
    
    // Redirect to dashboard
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-xl w-full z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-[1.5rem] shadow-2xl shadow-indigo-100 mb-4 rotate-3 hover:rotate-0 transition-transform">
            <BarChart3 className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Register Your Business</h1>
          <p className="text-slate-500 mt-2 font-medium">Join the Nashwa ecosystem and scale your local shop today.</p>
        </div>

        <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white">
          <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Info */}
            <div className="md:col-span-2">
              <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Owner Identity</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                  placeholder="e.g. Adil Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="tel" 
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                  placeholder="+880 1XXX-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Business Info */}
            <div className="md:col-span-2 pt-2">
              <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Business Metadata</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Name</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                  placeholder="e.g. Sunny Day Cafe"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Supplier ID</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                  placeholder="e.g. SUP-DK-101"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                />
              </div>
            </div>

            {/* Credentials */}
            <div className="md:col-span-2 pt-2">
              <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Login Credentials</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Authority Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-2 py-4">
              <div className="flex items-center space-x-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input type="checkbox" required className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer" />
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                  I agree to the <a href="#" className="text-indigo-600 font-black hover:underline">Terms of Authority</a> and Global Privacy Shield regulations.
                </label>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center active:scale-95 group"
              >
                <UserPlus className="mr-3" size={20} />
                Initialize My Business Profile
              </button>
            </div>
          </form>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center rounded-b-[2.5rem]">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              Already managing an entity? {' '}
              <Link to="/login" className="text-indigo-600 font-black hover:underline">Return to Hub</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
