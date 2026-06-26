import React, { useState } from 'react';
import { 
  PiggyBank, 
  TrendingUp, 
  ShoppingBag, 
  Clock, ChevronRight,
ArrowLeft,Plus,
  Trash2,
  PieChart,
  Percent,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const [activeApp, setActiveApp] = useState(null);
  const [notice, setNotice] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleLaunchApp = async (appId) => {
    if (appId === 'money-planner' || appId === 'stock-planner') {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.redirectTo) {
        setNotice(payload.error || 'Unable to open this app right now.');
        return;
      }

      window.location.href = payload.redirectTo;
      return;
    }

    setActiveApp(appId);
  };

  // App 1: Money Planner State & Component
  const MoneyPlannerApp = () => {
    const [income, setIncome] = useState(5000);
    const [expenses, setExpenses] = useState(3000);
    const savings = income - expenses;
    const savingsPercentage = income > 0 ? ((savings / income) * 100).toFixed(0) : 0;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <PiggyBank className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Money Planner</h3>
              <p className="text-xs text-gray-400">Budget, Save, & Track Debt-to-Income ratio</p>
            </div>
          </div>
          <button 
            id="money-planner-back-btn"
            onClick={() => setActiveApp(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Inputs</h4>
            <div className="space-y-3">
              <div>
                <label htmlFor="money-income-input" className="block text-xs text-gray-500 mb-1">Monthly Income ($)</label>
                <input
                  id="money-income-input"
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="money-expenses-input" className="block text-xs text-gray-500 mb-1">Monthly Expenses ($)</label>
                <input
                  id="money-expenses-input"
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider mb-2">Summary</h4>
            <div className="space-y-4 my-auto">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Net Savings:</span>
                <span className={`text-lg font-bold ${savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${savings.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Savings Rate:</span>
                <span className={`text-lg font-bold ${savingsPercentage >= 20 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {savingsPercentage}%
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Tip: Aim for a savings rate of 20% or higher to compound wealth efficiently.
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider mb-2">Rule of Thumb</h4>
            <div className="space-y-3 my-auto">
              <div className="w-full bg-gray-950 rounded-full h-3.5 border border-gray-800 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, (savings / (income || 1)) * 100))}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed">
                Your monthly debt/expense ratio is <strong>{((expenses / (income || 1)) * 100).toFixed(0)}%</strong>. Keeping expenses below 50% of income is a standard wealth-building target.
              </div>
            </div>
            <div className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Checked against Unloan standard
            </div>
          </div>
        </div>
      </div>
    );
  };

  // App 2: Stock Planner State & Component
  const StockPlannerApp = () => {
    const [principal, setPrincipal] = useState(1000);
    const [monthlyContribution, setMonthlyContribution] = useState(200);
    const [rate, setRate] = useState(8);
    const [years, setYears] = useState(10);

    const calculateCompoundInterest = () => {
      let total = principal;
      const monthlyRate = rate / 100 / 12;
      const months = years * 12;

      for (let i = 0; i < months; i++) {
        total = total * (1 + monthlyRate) + monthlyContribution;
      }
      return Math.round(total);
    };

    const futureValue = calculateCompoundInterest();
    const totalInvested = principal + (monthlyContribution * years * 12);
    const interestEarned = futureValue - totalInvested;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <TrendingUp className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Stock Planner</h3>
              <p className="text-xs text-gray-400">Calculate stock market compound interest returns</p>
            </div>
          </div>
          <button 
            id="stock-planner-back-btn"
            onClick={() => setActiveApp(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Parameters</h4>
            <div className="space-y-3">
              <div>
                <label htmlFor="stock-principal-input" className="block text-xs text-gray-500 mb-0.5">Initial Investment ($)</label>
                <input
                  id="stock-principal-input"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label htmlFor="stock-monthly-input" className="block text-xs text-gray-500 mb-0.5">Monthly Contribution ($)</label>
                <input
                  id="stock-monthly-input"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="stock-rate-input" className="block text-xs text-gray-500 mb-0.5">Annual Return (%)</label>
                  <input
                    id="stock-rate-input"
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="stock-years-input" className="block text-xs text-gray-500 mb-0.5">Duration (Years)</label>
                  <input
                    id="stock-years-input"
                    type="number"
                    value={years}
                    onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider mb-2">Estimated Value</h4>
            <div className="space-y-4 my-auto">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Total Wealth Accrued</p>
                <p className="text-3xl font-extrabold text-teal-400">${futureValue.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Principal Invested:</span>
                <span>${totalInvested.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Interest Gained:</span>
                <span className="text-emerald-400 font-semibold">+${interestEarned.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 border-t border-gray-800 pt-2.5">
              Historical S&P 500 average annual return is ~10% (before inflation adjustment).
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between text-left">
            <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider mb-2">Growth Projection</h4>
            <div className="space-y-3 my-auto text-sm text-gray-300">
              <p>
                By compounding for <strong className="text-teal-300">{years} years</strong>, you turn a total contribution of <strong className="text-gray-100">${totalInvested.toLocaleString()}</strong> into <strong className="text-teal-400">${futureValue.toLocaleString()}</strong>.
              </p>
              <div className="p-3 bg-teal-950/20 border border-teal-500/20 rounded-xl">
                <span className="text-teal-400 font-bold block mb-0.5">Lesson #1: Pay yourself first</span>
                <p className="text-xs text-gray-400">Automating small monthly transfers into index funds is the easiest way to outpace inflation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // App 3: Grocery Planner State & Component
  const GroceryPlannerApp = () => {
    const [items, setItems] = useState([
      { id: 1, name: 'Fresh Vegetables', price: 15, checked: false },
      { id: 2, name: 'Whole Wheat Bread', price: 4, checked: true },
      { id: 3, name: 'Oatmeal', price: 5, checked: false },
      { id: 4, name: 'Almond Milk', price: 6, checked: false }
    ]);
    const [newItem, setNewItem] = useState('');
    const [newPrice, setNewPrice] = useState('');

    const addItem = (e) => {
      e.preventDefault();
      if (!newItem.trim()) return;
      const item = {
        id: Date.now(),
        name: newItem,
        price: parseFloat(newPrice) || 0,
        checked: false
      };
      setItems((prev) => [...prev, item]);
      setNewItem('');
      setNewPrice('');
    };

    const toggleItem = (id) => {
      setItems((prev) => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    };

    const deleteItem = (id) => {
      setItems((prev) => prev.filter(item => item.id !== id));
    };

    const totalBudget = items.reduce((sum, item) => sum + item.price, 0);
    const checkedBudget = items.filter(item => item.checked).reduce((sum, item) => sum + item.price, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <ShoppingBag className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Grocery Planner</h3>
              <p className="text-xs text-gray-400">Plan and budget list of items to avoid impulse buying</p>
            </div>
          </div>
          <button 
            id="grocery-planner-back-btn"
            onClick={() => setActiveApp(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-5 space-y-4 md:col-span-2">
            <form onSubmit={addItem} className="flex gap-2">
              <input
                id="grocery-item-input"
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Item name (e.g. Eggs)"
                className="flex-grow bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <input
                id="grocery-price-input"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Price ($)"
                className="w-24 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <button
                id="grocery-add-btn"
                type="submit"
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 px-3.5 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No items listed. Add some above!</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-950/50 border border-gray-900 hover:border-gray-850 transition-all">
                    <div className="flex items-center gap-3">
                      <input
                        id={`grocery-check-${item.id}`}
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItem(item.id)}
                        className="w-4 h-4 rounded text-orange-500 bg-gray-900 border-gray-800 focus:ring-orange-500/50 cursor-pointer"
                      />
                      <span className={`text-sm ${item.checked ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-400">${item.price.toFixed(2)}</span>
                      <button
                        id={`grocery-delete-${item.id}`}
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-600 hover:text-red-400 transition-all p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider mb-2">Budget Status</h4>
            <div className="space-y-4 my-auto">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Total Budgeted:</span>
                <span className="text-base font-bold text-white">${totalBudget.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Purchased:</span>
                <span className="text-base font-bold text-orange-400">${checkedBudget.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-950 rounded-full h-2 border border-gray-800 overflow-hidden">
                <div 
                  className="bg-orange-500 h-full transition-all duration-300"
                  style={{ width: `${totalBudget > 0 ? (checkedBudget / totalBudget) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2 border-t border-gray-800 pt-3">
              Impulse spending is the #1 killer of family wealth. Writing down list items before walking into the store cuts spending by 25%.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const activeAppsList = [
    {
      id: 'money-planner',
      title: 'Money Planner',
      desc: 'Formulate monthly spending targets, track assets vs liabilities, and compound wealth.',
      icon: <PiggyBank className="w-6 h-6 text-emerald-400" />,
      colorClass: 'from-emerald-500/10 to-teal-400/5 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/40'
    },
    {
      id: 'stock-planner',
      title: 'Stock Planner',
      desc: 'Simulate stock compounding and calculate historical growth models over customized timelines.',
      icon: <TrendingUp className="w-6 h-6 text-teal-400" />,
      colorClass: 'from-teal-500/10 to-emerald-400/5 border-teal-500/20 text-teal-400 hover:border-teal-500/40'
    },
    {
      id: 'grocery-planner',
      title: 'Grocery Planner',
      desc: 'Create budgeting grocery lists to check off purchased items and maintain impulse control.',
      icon: <ShoppingBag className="w-6 h-6 text-orange-400" />,
      colorClass: 'from-orange-500/10 to-yellow-400/5 border-orange-500/20 text-orange-400 hover:border-orange-500/40'
    }
  ];

  const disabledAppsList = [
    {
      title: 'Daily Expense Planner',
      desc: 'Detailed spreadsheet to trace daily outgoings and receive push notifications on budget limits.',
      icon: <CalendarDays className="w-5 h-5 text-gray-600" />
    },
    {
      title: 'Debt Payoff Tracker',
      desc: 'Utilize the Avalanche or Snowball method to visualize how fast you can become 100% debt-free.',
      icon: <PieChart className="w-5 h-5 text-gray-600" />
    },
    {
      title: 'Tax Estimator',
      desc: 'Simulate standard deductions and calculate how much capital you can legally write off.',
      icon: <Percent className="w-5 h-5 text-gray-600" />
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10 transition-all duration-500">
      {notice && <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{notice}</div>}
      {isProfileOpen && <EditProfileModal user={user} onClose={() => setIsProfileOpen(false)} onSaved={() => setNotice('Profile updated. Please sign in again if you changed your email or password.')} />}
      {isAdminOpen && <AdminControlModal onClose={() => setIsAdminOpen(false)} />}
      {activeApp ? (
        /* Render Selected Application inside App Wrapper Container */
        <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fadeIn">
          {activeApp === 'money-planner' && <MoneyPlannerApp />}
          {activeApp === 'stock-planner' && <StockPlannerApp />}
          {activeApp === 'grocery-planner' && <GroceryPlannerApp />}
        </div>
      ) : (
        /* Render Launcher Grid Dashboard */
        <div className="space-y-10">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Your Financial Control Desk</h2>
                <p className="text-xs text-gray-500 mt-1">{user?.portfolioName ? user.portfolioName + ' portfolio is mapped to this login.' : 'One login controls all Unloan apps.'}</p>
              </div>
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setIsAdminOpen(true)}
                  className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition-all cursor-pointer"
                >
                  Admin Control
                </button>
              )}
              {user?.role === 'user' && (
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-800 text-gray-300 hover:border-emerald-500/30 hover:text-emerald-300 transition-all cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
              <button
                id="dash-logout-btn"
                onClick={onLogout}
                className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-800 hover:border-red-500/30 text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
            <p className="text-sm text-gray-400">Launch planning applications or explore pending services below.</p>
          </div>

          {/* Active Applications Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500/80">Active Launchers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeAppsList.map((app) => (
                <button
                  id={`launcher-${app.id}`}
                  key={app.id}
                  onClick={() => handleLaunchApp(app.id)}
                  className={`glass-panel bg-gradient-to-br ${app.colorClass} rounded-2xl p-6 text-left hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 flex flex-col justify-between group cursor-pointer`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-950 flex items-center justify-center border border-gray-850 shadow-inner mb-4">
                    {app.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-100 mb-1 group-hover:text-white flex items-center gap-1">
                      {app.title}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{app.desc}</p>
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase border border-gray-850 px-3 py-1 bg-gray-950/80 rounded-md self-start">
                    Launch
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Disabled coming soon Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Coming Soon (Roadmap)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
              {disabledAppsList.map((app, index) => (
                <div
                  key={index}
                  className="glass-panel rounded-2xl p-6 border-dashed border-gray-850 bg-gray-950/20 text-left flex flex-col justify-between select-none"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-gray-950/50 flex items-center justify-center border border-gray-900 mb-4">
                      {app.icon}
                    </div>
                    <h4 className="text-sm font-bold text-gray-300 mb-1">{app.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">{app.desc}</p>
                  </div>
                  <span className="text-xxs font-bold uppercase text-gray-500 bg-gray-900 border border-gray-900/50 px-2 py-0.5 rounded self-start flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditProfileModal({ user, onClose, onSaved }) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || 'Unable to save profile.');
        return;
      }
      onSaved(payload.user);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <section className="glass-panel w-full max-w-md rounded-2xl border border-gray-800 p-5 text-gray-100 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Edit Profile</h3>
            <p className="mt-1 text-sm text-gray-400">Update your name, email, or password.</p>
          </div>
          <button type="button" onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-white">Close</button>
        </div>
        <div className="space-y-3">
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white" placeholder="Display name" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white" placeholder="Email" type="email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white" placeholder="New password (optional)" type="password" />
          {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
          <button type="button" onClick={save} disabled={saving} className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-gray-950 disabled:opacity-70">{saving ? 'Saving...' : 'Save Profile'}</button>
        </div>
      </section>
    </div>
  );
}

function AdminControlModal({ onClose }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const refreshUsers = async () => {
    const response = await fetch('/api/admin/users');
    const payload = await response.json().catch(() => ({}));
    if (response.ok) setUsers((payload.users || []).map((user) => ({ ...user, password: '' })));
    else setError(payload.error || 'Unable to load users.');
  };

  React.useEffect(() => {
    refreshUsers();
  }, []);

  const updateUser = (index, next) => {
    setUsers((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item)));
  };

  const saveUser = async (user) => {
    setError('');
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || 'Unable to save user.');
      return;
    }
    await refreshUsers();
  };

  const resetUser = async (seedEmail) => {
    setError('');
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset', seedEmail }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || 'Unable to reset user.');
      return;
    }
    setUsers((payload.users || []).map((user) => ({ ...user, password: '' })));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <section className="glass-panel max-h-[84vh] w-full max-w-5xl overflow-auto rounded-2xl border border-gray-800 p-5 text-gray-100 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Admin Control</h3>
            <p className="mt-1 text-sm text-gray-400">Manage user details, passwords, and portfolio mapping.</p>
          </div>
          <button type="button" onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-white">Close</button>
        </div>
        {error && <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        <div className="grid gap-3">
          {users.map((item, index) => (
            <div key={item.seedEmail || item.email} className="grid gap-3 rounded-xl border border-gray-800 bg-gray-950/50 p-4 md:grid-cols-2">
              <strong className="text-sm text-white md:col-span-2">{item.role === 'admin' ? 'Admin' : item.displayName}</strong>
              <input value={item.displayName || ''} onChange={(event) => updateUser(index, { displayName: event.target.value })} className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white" placeholder="Display name" />
              <input value={item.email || ''} onChange={(event) => updateUser(index, { email: event.target.value })} className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white" placeholder="Email" type="email" />
              <input value={item.portfolioName || ''} onChange={(event) => updateUser(index, { portfolioName: event.target.value })} className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white" placeholder="Portfolio mapping" />
              <input value={item.password || ''} onChange={(event) => updateUser(index, { password: event.target.value })} className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white" placeholder="New password (optional)" type="password" />
              <div className="flex flex-wrap justify-end gap-2 md:col-span-2">
                <button type="button" onClick={() => saveUser(item)} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-gray-950">Save</button>
                <button type="button" onClick={() => resetUser(item.seedEmail)} className="rounded-lg border border-gray-700 px-3 py-2 text-xs font-bold text-gray-300 hover:text-white">Reset</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
