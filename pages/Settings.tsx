
import React, { useState, useRef } from 'react';
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  ShieldCheck,
  Palette, 
  Database, 
  ChevronRight, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Smartphone, 
  Moon, 
  Sun, 
  Monitor,
  Download,
  RefreshCw,
  Cloud,
  Clock,
  Save,
  Trash2,
  Camera
} from 'lucide-react';
import { useAuth, useCurrency, useNotifications } from '../App';

type SettingsTab = 'business' | 'account' | 'notifications' | 'security' | 'appearance' | 'database';

const Settings: React.FC = () => {
  const { user, updateGlobalUser } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');
  const [isSaving, setIsSaving] = useState(false);
  const [backupProgress, setBackupProgress] = useState<number | null>(null);
  
  // Account Form State
  const [accountName, setAccountName] = useState(user?.name || '');
  const [accountPhone, setAccountPhone] = useState(user?.phone || '');
  const [accountPhoto, setAccountPhoto] = useState<string | null>(user?.photo || null);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      if (activeTab === 'account') {
        if (user) {
          updateGlobalUser({
            ...user,
            name: accountName,
            phone: accountPhone,
            photo: accountPhoto || undefined
          });
        }
      }
      
      setIsSaving(false);
      addNotification({
        title: 'Settings Updated',
        message: `Your ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} preferences have been saved.`,
        type: 'success'
      });
    }, 800);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.current || !passwordData.new) {
      addNotification({ title: 'Error', message: 'Please fill in all password fields.', type: 'error' });
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      addNotification({ title: 'Error', message: 'Passwords do not match.', type: 'error' });
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      addNotification({
        title: 'Password Changed',
        message: 'Your security credentials have been updated successfully.',
        type: 'success'
      });
    }, 1200);
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAccountPhoto(reader.result as string);
        addNotification({
          title: 'Photo Selected',
          message: 'Click Save Changes to finalize your profile picture.',
          type: 'info'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSnapshot = (snapshot: any) => {
    const mockData = {
      business: user?.businessName,
      timestamp: snapshot.date,
      type: snapshot.type,
      platform: "Nashwa Local Business Manager",
      version: "2.5.0-STABLE",
      data: "Encrypted snapshot data payload..."
    };
    
    const filename = `nashwa_backup_${snapshot.date.replace(/[,: ]/g, '_')}.json`;
    triggerDownload(filename, JSON.stringify(mockData, null, 2), 'application/json');
    
    addNotification({
      title: 'Download Started',
      message: `Snapshot for ${snapshot.date} is downloading.`,
      type: 'success'
    });
  };

  const handleDownloadMasterArchive = () => {
    const archiveContent = `-- Nashwa Master Database Export\n-- Generated for: ${user?.businessName}\n-- Date: ${new Date().toLocaleString()}\n\nSET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\nSTART TRANSACTION;\n\n-- Dumping data for tables...\n-- [Inventory, Sales, Customers, Expenses]`;
    
    triggerDownload('nashwa_master_archive_sql.txt', archiveContent, 'text/plain');
    
    addNotification({
      title: 'Archive Exported',
      message: 'The complete master database archive has been exported.',
      type: 'success'
    });
  };

  const runBackup = () => {
    setBackupProgress(0);
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          addNotification({
            title: 'Backup Successful',
            message: 'A new database snapshot has been stored in the cloud.',
            type: 'success'
          });
          return null;
        }
        return prev + 10;
      });
    }, 200);
  };

  const TabButton = ({ id, icon: Icon, label }: { id: SettingsTab, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
          : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-md'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon size={18} className={activeTab === id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} />
        <span className={`text-sm ${activeTab === id ? 'font-black uppercase tracking-widest' : 'font-bold'}`}>{label}</span>
      </div>
      <ChevronRight size={14} className={activeTab === id ? 'opacity-100' : 'opacity-0'} />
    </button>
  );

  const snapshotHistory = [
    { date: 'Today, 10:45 AM', size: '2.4 MB', type: 'Automatic' },
    { date: 'Yesterday, 12:00 AM', size: '2.3 MB', type: 'Automatic' },
    { date: 'May 14, 2024', size: '5.8 MB', type: 'Manual' },
    { date: 'May 10, 2024', size: '5.7 MB', type: 'Automatic' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 space-y-2">
          <TabButton id="business" icon={Building2} label="Business" />
          <TabButton id="account" icon={User} label="Account" />
          <TabButton id="notifications" icon={Bell} label="Notifications" />
          <TabButton id="security" icon={Shield} label="Security" />
          <TabButton id="appearance" icon={Palette} label="Appearance" />
          <TabButton id="database" icon={Database} label="Backup" />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px] animate-in slide-in-from-right-4 duration-500">
          
          <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {activeTab === 'business' && 'Business Profile'}
                {activeTab === 'account' && 'Account Settings'}
                {activeTab === 'notifications' && 'Notification Center'}
                {activeTab === 'security' && 'Security & Privacy'}
                {activeTab === 'appearance' && 'Interface Appearance'}
                {activeTab === 'database' && 'Database & Cloud'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Management Console • v2.5.0</p>
            </div>
            {activeTab !== 'database' && activeTab !== 'security' && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>

          <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* BUSINESS PROFILE */}
            {activeTab === 'business' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Name</label>
                    <input type="text" defaultValue={user?.businessName} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Type</label>
                    <select className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold appearance-none">
                      <option>Cafe & Bistro</option>
                      <option>Retail Store</option>
                      <option>Grocery/Supershop</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Global Currency</label>
                    <select 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold appearance-none"
                    >
                      <option value="BDT">Bangladeshi Taka (৳)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Regional Tax Rate (%)</label>
                    <input type="number" defaultValue="8.5" className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Official Address</label>
                  <textarea rows={3} placeholder="Full street address..." className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"></textarea>
                </div>
              </div>
            )}

            {/* ACCOUNT SETTINGS */}
            {activeTab === 'account' && (
              <div className="space-y-12 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group">
                  <div className="relative">
                    <div className="w-28 h-28 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-2xl shadow-indigo-100 overflow-hidden relative">
                      {accountPhoto ? (
                        <img src={accountPhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.[0] || user?.email?.[0].toUpperCase() || 'U'
                      )}
                    </div>
                    <button 
                      onClick={triggerPhotoUpload}
                      className="absolute -bottom-2 -right-2 bg-white text-indigo-600 p-2.5 rounded-2xl shadow-lg border border-slate-100 hover:scale-110 transition-transform"
                    >
                      <Camera size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-black text-slate-900">{accountName || 'Administrator'}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Primary Account Holder • {user?.role}</p>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 mt-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">Verified Identity</span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">Secure Profile</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center">
                    <User size={14} className="mr-2" /> Personal Metadata
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                      <input 
                        type="text" 
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Login Email (Read Only)</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="email" readOnly defaultValue={user?.email} className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-100 text-slate-400 outline-none text-sm font-bold cursor-not-allowed" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile Connection</label>
                      <div className="relative">
                        <Smartphone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          type="tel" 
                          value={accountPhone}
                          onChange={(e) => setAccountPhone(e.target.value)}
                          placeholder="+880 1XXX-XXXXXX"
                          className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                    <Lock size={120} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center">
                    <Shield size={18} className="mr-3 text-indigo-400" /> Security Override
                  </h4>
                  <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Current Secret</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 outline-none transition-all text-sm font-bold" 
                      />
                    </div>
                    <div className="hidden md:block"></div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">New Authority Key</label>
                      <input 
                        type="password" 
                        placeholder="Min. 8 characters" 
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 outline-none transition-all text-sm font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm Identity Key</label>
                      <input 
                        type="password" 
                        placeholder="Re-enter new password" 
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 outline-none transition-all text-sm font-bold" 
                      />
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-50 transition-all flex items-center active:scale-95 disabled:opacity-50"
                      >
                        {isSaving ? <RefreshCw size={14} className="mr-2 animate-spin" /> : <Lock size={14} className="mr-2 text-indigo-600" />}
                        Update Security
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {[
                  { title: 'Low Stock Alerts', desc: 'Trigger warning when items fall below minimum threshold', default: true },
                  { title: 'Sales Confirmations', desc: 'Real-time toast for every transaction completed', default: true },
                  { title: 'Customer Milestones', desc: 'Alert when a customer reaches elite status', default: false },
                  { title: 'Weekly Reports', desc: 'Receive summary email every Monday morning', default: true },
                  { title: 'Security Logs', desc: 'Notify on new logins from unrecognized devices', default: true }
                ].map((notif, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all group">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{notif.title}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-1">{notif.desc}</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.default} className="sr-only peer" />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECURITY & PRIVACY */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight">Two-Factor Authentication</h4>
                      <p className="text-xs text-indigo-600/70 font-medium">Enhanced security layer for your business data.</p>
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-indigo-600 hover:text-white transition-all">Enable 2FA</button>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Authorized Sessions</h4>
                  <div className="divide-y divide-slate-50 border border-slate-100 rounded-3xl overflow-hidden">
                    <div className="p-6 flex items-center justify-between bg-white">
                      <div className="flex items-center space-x-4">
                        <Monitor size={20} className="text-slate-300" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">Chrome on macOS High Sierra</p>
                          <p className="text-[10px] text-emerald-500 font-black uppercase">Current Session • Dhaka, BD</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">Active Now</span>
                    </div>
                    <div className="p-6 flex items-center justify-between bg-white opacity-60">
                      <div className="flex items-center space-x-4">
                        <Smartphone size={20} className="text-slate-300" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">iPhone 14 Pro Max</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase">Last seen 2h ago • CTG, BD</p>
                        </div>
                      </div>
                      <button className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <button className="w-full py-4 text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors">Terminate All Other Sessions</button>
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">Visual Theme</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="p-5 bg-white border-2 border-indigo-600 rounded-3xl flex flex-col items-center space-y-3 shadow-xl shadow-indigo-50">
                      <Sun size={24} className="text-amber-500" />
                      <span className="text-xs font-black uppercase">Light Mode</span>
                    </button>
                    <button className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center space-y-3 text-white">
                      <Moon size={24} className="text-indigo-400" />
                      <span className="text-xs font-black uppercase">Dark Mode</span>
                    </button>
                    <button className="p-5 bg-slate-100 border border-slate-200 rounded-3xl flex flex-col items-center space-y-3">
                      <Monitor size={24} className="text-slate-500" />
                      <span className="text-xs font-black uppercase">System Sync</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">UI Density</h4>
                  <div className="flex bg-slate-100 p-2 rounded-[2rem]">
                    <button className="flex-1 py-4 bg-white text-indigo-600 rounded-[1.75rem] text-xs font-black uppercase tracking-widest shadow-xl">Standard</button>
                    <button className="flex-1 py-4 text-slate-500 text-xs font-black uppercase tracking-widest">Compact</button>
                    <button className="flex-1 py-4 text-slate-500 text-xs font-black uppercase tracking-widest">Relaxed</button>
                  </div>
                </div>
              </div>
            )}

            {/* DATABASE BACKUP */}
            {activeTab === 'database' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="p-10 bg-slate-900 text-white rounded-[3rem] text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                    <Database size={150} />
                  </div>
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Security Node HQ</h4>
                  
                  {backupProgress !== null ? (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                      <RefreshCw size={48} className="mx-auto text-indigo-400 animate-spin" />
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Compiling Records...</span>
                          <span>{backupProgress}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${backupProgress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 space-y-8">
                      <div className="flex flex-col items-center">
                        <Cloud size={60} className="text-indigo-400 mb-4" />
                        <h3 className="text-3xl font-black tracking-tight">Cloud Safeguard</h3>
                        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">Instant snapshots protect your inventory, sales, and customer data from loss.</p>
                      </div>
                      <button 
                        onClick={runBackup}
                        className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/50 transition-all active:scale-95"
                      >
                        Initiate Manual Backup
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Snapshot History</h4>
                    <button 
                      onClick={handleDownloadMasterArchive}
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                    >
                      Download Master Archive
                    </button>
                  </div>
                  <div className="space-y-3">
                    {snapshotHistory.map((history, idx) => (
                      <div key={idx} className="p-5 flex items-center justify-between bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center">
                            <Clock size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{history.date}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">{history.type} System Snapshot</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{history.size}</span>
                          <button 
                            onClick={() => handleDownloadSnapshot(history)}
                            className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm active:scale-90"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="px-10 py-5 bg-slate-900 text-indigo-200 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em]">
            <div className="flex items-center space-x-6">
              <span className="flex items-center"><Monitor size={12} className="mr-2 text-indigo-400" /> Web Node Console</span>
              <span className="opacity-30">|</span>
              <span className="flex items-center"><CheckCircle2 size={12} className="mr-2 text-emerald-400" /> System Optimized</span>
            </div>
            <span className="text-white">v2.5.0-STABLE</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
