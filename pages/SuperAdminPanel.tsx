
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Activity, 
  Globe, 
  TrendingUp, 
  Search, 
  MoreVertical, 
  ArrowUpRight, 
  LogOut,
  Clock,
  Key,
  Database,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { useAuth, useCurrency } from '../App';
import { UserRole, LoginRecord, BusinessRegistration } from '../types';

const SuperAdminPanel: React.FC = () => {
  const { logout } = useAuth();
  const { currencySymbol } = useCurrency();
  const [activeTab, setActiveTab] = useState<'businesses' | 'logs'>('businesses');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Global Data
  const businesses: BusinessRegistration[] = [
    { id: 'BUS-001', name: 'Nashwa Cafe & Bistro', ownerName: 'Adil Khan', ownerEmail: 'adil@nashwa.com', totalSales: 45200.50, customerCount: 842, status: 'ACTIVE', joinedAt: 'Jan 12, 2024' },
    { id: 'BUS-002', name: 'Elite Tech Store', ownerName: 'Sarah Smith', ownerEmail: 'sarah@elitetech.io', totalSales: 125400.00, customerCount: 1205, status: 'ACTIVE', joinedAt: 'Feb 05, 2024' },
    { id: 'BUS-003', name: 'Sunset Bakery', ownerName: 'Maria Garcia', ownerEmail: 'maria@bakery.com', totalSales: 12400.20, customerCount: 310, status: 'ACTIVE', joinedAt: 'Mar 15, 2024' },
    { id: 'BUS-004', name: 'City Gym Pro', ownerName: 'John Doe', ownerEmail: 'john@citygym.com', totalSales: 8900.00, customerCount: 145, status: 'SUSPENDED', joinedAt: 'Apr 01, 2024' },
    { id: 'BUS-005', name: 'Vintage Apparel', ownerName: 'Emily Brown', ownerEmail: 'emily@vintage.net', totalSales: 34500.40, customerCount: 620, status: 'ACTIVE', joinedAt: 'Apr 10, 2024' },
  ];

  const loginLogs: LoginRecord[] = [
    { id: 'LOG-1', userId: 'admin-123', userEmail: 'adil@nashwa.com', businessName: 'Nashwa Cafe & Bistro', role: UserRole.OWNER, timestamp: 'May 15, 2024 14:22:10', ipAddress: '192.168.1.45' },
    { id: 'LOG-2', userId: 'staff-88', userEmail: 'kyle@nashwa.com', businessName: 'Nashwa Cafe & Bistro', role: UserRole.STAFF, timestamp: 'May 15, 2024 14:05:32', ipAddress: '192.168.1.12' },
    { id: 'LOG-3', userId: 'cust-456', userEmail: 'jane.doe@example.com', businessName: 'Nashwa Cafe & Bistro', role: UserRole.CUSTOMER, timestamp: 'May 15, 2024 13:45:00', ipAddress: '45.12.33.201' },
    { id: 'LOG-4', userId: 'admin-90', userEmail: 'sarah@elitetech.io', businessName: 'Elite Tech Store', role: UserRole.OWNER, timestamp: 'May 15, 2024 12:30:15', ipAddress: '103.44.22.10' },
  ];

  const platformStats = useMemo(() => ({
    totalBusinesses: businesses.length,
    activeBusinesses: businesses.filter(b => b.status === 'ACTIVE').length,
    totalRevenue: businesses.reduce((sum, b) => sum + b.totalSales, 0),
    totalUsers: businesses.reduce((sum, b) => sum + b.customerCount, 0) + businesses.length * 3 // estimate staff
  }), [businesses]);

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = loginLogs.filter(l => 
    l.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.businessName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Super Admin Top Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
              <ShieldCheck size={40} className="text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-black tracking-tight">Nashwa Command Center</h1>
                <span className="bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Live Platform</span>
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 flex items-center">
                <Globe size={14} className="mr-1.5 text-indigo-500" />
                Global Node: Dhaka, Bangladesh • Admin HQ
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all" title="System Settings">
              <Key size={20} className="text-indigo-300" />
            </button>
            <button onClick={logout} className="px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-rose-900/40 flex items-center">
              <LogOut size={16} className="mr-2" /> End Authority Session
            </button>
          </div>
        </div>
      </div>

      {/* Platform Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Building2 size={24} />
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Entities</p>
            <h3 className="text-4xl font-black text-slate-900 mt-1">{platformStats.totalBusinesses}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Activity size={24} />
            </div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">98.4% uptime</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active nodes</p>
            <h3 className="text-4xl font-black text-slate-900 mt-1">{platformStats.activeBusinesses}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Users size={24} />
            </div>
            <ArrowUpRight size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Users</p>
            <h3 className="text-4xl font-black text-slate-900 mt-1">{platformStats.totalUsers.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-white/10 rounded-2xl text-indigo-300">
              <BarChart3 size={24} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total throughput</p>
            <h3 className="text-3xl font-black mt-1">{currencySymbol}{platformStats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {/* Tab Controls */}
        <div className="px-10 py-6 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/30">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('businesses')}
              className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'businesses' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Business Catalog
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'logs' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Security Logs
            </button>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder={`Filter ${activeTab}...`}
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-x-auto">
          {activeTab === 'businesses' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 bg-white sticky top-0">
                  <th className="px-10 py-6">Entity Identity</th>
                  <th className="px-10 py-6">Ownership</th>
                  <th className="px-10 py-6">Scale</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBusinesses.map((bus) => (
                  <tr key={bus.id} className="text-sm text-slate-700 hover:bg-indigo-50/20 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg">
                          {bus.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{bus.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Joined {bus.joinedAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{bus.ownerName}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{bus.ownerEmail}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">{currencySymbol}{bus.totalSales.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{bus.customerCount} Customers</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        bus.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="p-3 text-slate-300 hover:text-indigo-600 transition-colors">
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 bg-white sticky top-0">
                  <th className="px-10 py-6">Auth Event</th>
                  <th className="px-10 py-6">User Context</th>
                  <th className="px-10 py-6">Entity</th>
                  <th className="px-10 py-6">Metadata</th>
                  <th className="px-10 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="text-sm text-slate-700 hover:bg-slate-50 transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{log.timestamp.split(' ')[1]}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{log.timestamp.split(' ')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{log.userEmail}</span>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{log.role}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <p className="font-bold text-slate-600">{log.businessName}</p>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-slate-400">{log.ipAddress}</span>
                        <span className="text-[9px] text-slate-300 font-bold uppercase">Dhaka Node</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-lg">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Platform footer info */}
        <div className="px-10 py-5 bg-slate-900 text-slate-400 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em]">
          <div className="flex items-center space-x-8">
            <span className="flex items-center"><Database size={12} className="mr-2 text-indigo-400" /> DB Cluster: NS-DB-01-PRIMARY</span>
            <span className="flex items-center"><Key size={12} className="mr-2 text-emerald-400" /> API Status: Connected</span>
          </div>
          <span className="text-white">v2.5.0 Authority Node</span>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
