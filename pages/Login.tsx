
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Mail, Lock, ArrowRight, User, Building2, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../App';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const [loginType, setLoginType] = useState<'admin' | 'customer' | 'super'>('admin');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login, allUsers } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loginEmail = email || 'your-email@example.com';
    
    // Check if user exists in registry
    const existingUser = allUsers.find(u => u.email === loginEmail);
    
    if (existingUser) {
      login(existingUser);
    } else {
      login({
        id: 'admin-' + Math.random().toString(36).substr(2, 5),
        email: loginEmail,
        businessName: 'Nashwa Cafe & Bistro',
        role: UserRole.OWNER,
        name: 'Business Admin'
      });
    }
    navigate('/');
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loginPhone = phone || '+880 1XXX-XXXXXX';
    
    // Look up by phone if available
    const existingUser = allUsers.find(u => u.phone === loginPhone);
    
    if (existingUser) {
      login(existingUser);
    } else {
      login({
        id: 'cust-' + Math.random().toString(36).substr(2, 5),
        email: 'customer-' + Math.random().toString(36).substr(2, 3) + '@example.com',
        businessName: 'Nashwa Cafe & Bistro',
        role: UserRole.CUSTOMER,
        name: 'Valued Customer',
        phone: loginPhone
      });
    }
    navigate('/portal');
  };

  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loginEmail = email || 'master@nashwa.io';
    
    const existingUser = allUsers.find(u => u.email === loginEmail);
    
    if (existingUser) {
      login(existingUser);
    } else {
      login({
        id: 'super-001',
        email: loginEmail,
        businessName: 'Nashwa Platforms HQ',
        role: UserRole.SUPER_ADMIN,
        name: 'Platform Overseer'
      });
    }
    navigate('/platform-control');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-100 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-200 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <BarChart3 className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nashwa</h1>
          <p className="text-slate-500 mt-2 font-black uppercase text-[10px] tracking-[0.2em]">Authority Portal v2.5</p>
        </div>

        <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white mb-8 overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex p-1.5 bg-slate-100 rounded-[2.25rem] mb-4">
            <button 
              onClick={() => setLoginType('admin')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                loginType === 'admin' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 size={14} />
              <span>Business</span>
            </button>
            <button 
              onClick={() => setLoginType('customer')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                loginType === 'customer' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={14} />
              <span>Customer</span>
            </button>
            <button 
              onClick={() => setLoginType('super')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                loginType === 'super' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldCheck size={14} />
              <span>HQ</span>
            </button>
          </div>

          <div className="p-6">
            {loginType === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Identity Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" 
                      required
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                      placeholder="your-email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Authority Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      required
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center group">
                  Authorize Session <ArrowRight className="ml-2 group-hover:translate-x-1 transition-all" size={16} />
                </button>
              </form>
            )}

            {loginType === 'customer' && (
              <form onSubmit={handleCustomerLogin} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Mobile Connection</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="tel" 
                      required
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                      placeholder="+880 1XXX-XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                  Enter your registered mobile number to access loyalty points.
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center group">
                  Enter Portal <ArrowRight className="ml-2 group-hover:translate-x-1 transition-all" size={16} />
                </button>
              </form>
            )}

            {loginType === 'super' && (
              <form onSubmit={handleSuperAdminLogin} className="space-y-6">
                <div className="p-4 bg-indigo-600 rounded-2xl text-white mb-2">
                  <h4 className="text-xs font-black uppercase tracking-widest mb-1 flex items-center"><ShieldCheck size={14} className="mr-2" /> Global Node Access</h4>
                  <p className="text-[9px] font-medium opacity-80 uppercase leading-relaxed text-indigo-100">Authority Login for platform administrators only.</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Master ID</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 outline-none transition-all text-sm font-bold"
                    placeholder="master@nashwa.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Security Key</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 outline-none transition-all text-sm font-bold"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center group">
                  Authorize Access <ArrowRight className="ml-2 group-hover:translate-x-1 transition-all" size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            {loginType === 'admin' ? (
              <>Don't have an account? <Link to="/signup" className="text-indigo-600 font-black hover:underline">Register Entity</Link></>
            ) : (
              "Global Privacy Node Active"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
