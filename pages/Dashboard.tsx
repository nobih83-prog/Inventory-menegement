
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useSearch, useCurrency } from '../App';

const mockSalesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const lowStockItems = [
  { name: 'Organic Coffee Beans', stock: 5, min: 20 },
  { name: 'Milk Carton 1L', stock: 12, min: 50 },
  { name: 'Paper Cups 50pk', stock: 8, min: 30 },
];

const recentTransactions = [
  { id: 1, name: 'Jane Doe', initial: 'JD', date: 'May 15, 2024', amount: 124.50, status: 'Completed' },
  { id: 2, name: 'John Smith', initial: 'JS', date: 'May 14, 2024', amount: 89.20, status: 'Completed' },
  { id: 3, name: 'Robert Brown', initial: 'RB', date: 'May 14, 2024', amount: 45.00, status: 'Pending' },
  { id: 4, name: 'Sarah Wilson', initial: 'SW', date: 'May 13, 2024', amount: 210.30, status: 'Completed' },
  { id: 5, name: 'Michael Chen', initial: 'MC', date: 'May 12, 2024', amount: 32.15, status: 'Completed' },
];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon size={24} />
      </div>
      <div className={`flex items-center text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {change >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
        {Math.abs(change)}%
      </div>
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
  </div>
);

const Dashboard: React.FC = () => {
  const { searchQuery } = useSearch();
  const { currencySymbol } = useCurrency();

  const filteredLowStock = lowStockItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = recentTransactions.filter(tr => 
    tr.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    `#TR-50${tr.id}2`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search status indicator when active */}
      {searchQuery && (
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <p className="text-sm text-indigo-700">
            Filtering dashboard by: <span className="font-bold">"{searchQuery}"</span>
          </p>
          <span className="text-xs font-medium text-indigo-400 bg-white px-2 py-0.5 rounded-lg">
            {filteredTransactions.length + filteredLowStock.length} results found
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value={`${currencySymbol}12,845`} change={12.5} icon={DollarSign} color="indigo" />
        <StatCard title="Total Customers" value="842" change={8.2} icon={Users} color="blue" />
        <StatCard title="Inventory Value" value={`${currencySymbol}45,210`} change={-2.4} icon={Package} color="amber" />
        <StatCard title="Total Expenses" value={`${currencySymbol}3,120`} change={5.1} icon={AlertTriangle} color="rose" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Weekly Revenue</h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSalesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  formatter={(value: any) => [`${currencySymbol}${value}`, 'Revenue']}
                  contentStyle={{backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Low Stock Alerts</h3>
          <div className="space-y-4 flex-1">
            {filteredLowStock.length > 0 ? (
              filteredLowStock.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-amber-700">Stock: {item.stock} / Target: {item.min}</p>
                  </div>
                  <button className="text-xs bg-white text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 font-bold hover:bg-amber-100 transition-colors">
                    Order
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <AlertTriangle size={32} className="opacity-20 mb-2" />
                <p className="text-xs">No alerts found</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-2 border-t border-slate-100 transition-colors">
            View All Inventory
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
          <button className="text-sm text-indigo-600 font-semibold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tr) => (
                  <tr key={tr.id} className="text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">#TR-50{tr.id}2</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold mr-3">{tr.initial}</div>
                        {tr.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{tr.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{currencySymbol}{tr.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        tr.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-indigo-600">Details</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
