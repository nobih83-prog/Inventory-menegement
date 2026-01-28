
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Mail, Lock, Building, UserPlus } from 'lucide-react';
import { useAuth } from '../App';
import { UserRole } from '../types';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      id: 'mock-user-new',
      email: email,
      businessName: businessName,
      role: UserRole.OWNER
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 mb-4">
            <BarChart3 className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grow with Nashwa</h1>
          <p className="text-slate-500 mt-2 font-medium">The all-in-one platform for business management.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Business Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="e.g. Sunny Day Cafe"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pb-2">
              <input type="checkbox" required className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
              <label className="text-xs text-slate-500">I agree to the <a href="#" className="text-indigo-600 font-bold hover:underline">Terms of Service</a> and Privacy Policy.</label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center group"
            >
              <UserPlus className="mr-2" size={18} />
              Create My Account
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account? {' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
