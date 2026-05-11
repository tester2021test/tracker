import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Calculator, FileText, CheckCircle2, Wallet, 
  Building2, Landmark, Save, Plus, Trash2, Calendar, 
  PieChart, Key, Edit2, X, ChevronRight, TrendingUp,
  UploadCloud, AlertCircle, Download, CreditCard,
  BarChart3, RefreshCw, Printer, FileCheck, Ruler,
  LogOut, Lock, Mail, Loader2, Menu, TrendingDown,
  ArrowRightCircle, FileUp, FileInput, Percent,
  Home, DollarSign, GripHorizontal, Activity, Layers,
  Zap, Clock, Database, Upload, FileJson, Bell, Moon, Sun,
  Share2, Eye, EyeOff, Settings, Filter, Search, ChevronDown,
  MapPin, Users, Award, Target, Smartphone
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBjCYP_kqxflfLEj0tdxExF9NRv9EUgkn8",
  authDomain: "property-tracker-d44a0.firebaseapp.com",
  projectId: "property-tracker-d44a0",
  storageBucket: "property-tracker-d44a0.firebasestorage.app",
  messagingSenderId: "110428888734",
  appId: "1:110428888734:web:c7191afeabe83bd968a58f",
  measurementId: "G-5ER3RSQLXS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- UTILS ---
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try { 
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: '2-digit' 
    }); 
  } catch (e) { 
    return dateStr; 
  }
};

const formatLongDate = (dateStr) => {
  if (!dateStr) return '-';
  try { 
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }); 
  } catch (e) { 
    return dateStr; 
  }
};

// Local Storage Helper (Fallback)
const localStorageHelper = {
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  },
  load: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('LocalStorage load error:', e);
      return null;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('LocalStorage remove error:', e);
    }
  }
};

// --- COMPONENTS ---

// Theme Toggle
const ThemeToggle = ({ darkMode, setDarkMode }) => (
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
    title={darkMode ? "Light Mode" : "Dark Mode"}
  >
    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
  </button>
);

// Bento Box Style Card
const BentoCard = ({ title, value, subtext, icon: Icon, variant = "default", onClick, className = "" }) => {
  const variants = {
    default: "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100",
    primary: "bg-indigo-600 border-indigo-500 text-white",
    dark: "bg-slate-900 border-slate-800 text-white",
    success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-900 dark:text-amber-100"
  };

  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] border transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between h-full relative overflow-hidden ${variants[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 opacity-80">
          {Icon && <Icon className="w-4 h-4" />}
          <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        </div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtext && <div className="text-xs mt-1 opacity-70 font-medium">{subtext}</div>}
      </div>
      {Icon && <Icon className="absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.05] pointer-events-none" />}
    </div>
  );
};

// Comparison Bar Component
const ComparisonBar = ({ label, original, current, unit = "", color = "bg-indigo-500" }) => {
    const maxVal = Math.max(original, current);
    const originalPercent = maxVal > 0 ? (original / maxVal) * 100 : 0;
    const currentPercent = maxVal > 0 ? (current / maxVal) * 100 : 0;
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>{label}</span>
                {original > current && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Saved: {unit === '₹' ? formatCurrency(original - current) : (original - current).toFixed(0) + ' ' + unit}
                  </span>
                )}
            </div>
            <div className="space-y-1">
                <div className="relative h-6 bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden flex items-center">
                    <div 
                      style={{ width: `${originalPercent}%` }} 
                      className="absolute h-full bg-slate-300 dark:bg-slate-600 rounded-r-md"
                    />
                    <span className="relative z-10 text-[10px] font-bold text-slate-600 dark:text-slate-300 pl-2">
                      Current: {unit === '₹' ? formatCurrency(original) : original.toFixed(0) + ' ' + unit}
                    </span>
                </div>
                <div className="relative h-6 bg-slate-50 dark:bg-slate-800 rounded-md overflow-hidden flex items-center">
                    <div 
                      style={{ width: `${currentPercent}%` }} 
                      className={`absolute h-full ${color} rounded-r-md transition-all duration-500 ease-out`}
                    />
                    <span className={`relative z-10 text-[10px] font-bold pl-2 ${currentPercent > 50 ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      New: {unit === '₹' ? formatCurrency(current) : current.toFixed(0) + ' ' + unit}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Breakdown Card Component
const BreakdownCard = ({ title, total, items, icon: Icon, bgClass = "bg-white dark:bg-slate-800", borderClass = "border-slate-100 dark:border-slate-700" }) => (
  <div className={`p-6 rounded-[2rem] border ${borderClass} shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex flex-col justify-between h-full ${bgClass} relative overflow-hidden group hover:shadow-lg transition-all duration-300`}>
    <div className="relative z-10">
        <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-sm border border-slate-100/50 dark:border-slate-600/50">
              <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        </div>
        <div className="space-y-3">
            {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm items-center border-b border-slate-50 dark:border-slate-700 last:border-0 pb-1.5 last:pb-0">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm">{item.label}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 font-mono text-xs md:text-sm">{item.value}</span>
                </div>
            ))}
        </div>
    </div>
    <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-end">
        <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">Total</span>
        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{total}</span>
    </div>
    <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.06] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.1] transition-opacity transform rotate-12 scale-150 pointer-events-none">
        <Icon className="w-32 h-32" />
    </div>
  </div>
);

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    paid: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    received: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    pending: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    partial: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    na: "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800"
  };
  const labels = {
    paid: "Paid", 
    received: "Received", 
    pending: "Pending", 
    partial: "Partial", 
    na: "N/A"
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[status] || styles.pending} flex items-center gap-1 w-fit`}>
      {(status === 'paid' || status === 'received') && <CheckCircle2 className="w-3 h-3" />}
      {labels[status] || status}
    </span>
  );
};

// Mobile Navigation
const MobileNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'schedule', icon: Building2, label: 'Schedule' },
    { id: 'loan', icon: Wallet, label: 'Finance' },
    { id: 'bank_plan', icon: Landmark, label: 'Bank' },
    { id: 'docs', icon: FileCheck, label: 'Docs' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 pb-safe z-50 safe-area-bottom no-print">
      <div className="flex justify-around items-center p-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${
              activeTab === tab.id 
                ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Desktop Navigation
const DesktopNav = ({ activeTab, setActiveTab }) => (
  <div className="hidden md:flex bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
    {[
      { id: 'schedule', icon: Building2, label: 'Schedule' },
      { id: 'loan', icon: Wallet, label: 'Finance' },
      { id: 'bank_plan', icon: Landmark, label: 'Bank' },
      { id: 'docs', icon: FileCheck, label: 'Documents' },
    ].map(tab => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
          activeTab === tab.id 
            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-slate-200 dark:shadow-slate-900' 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
        }`}
      >
        <tab.icon className="w-4 h-4" />
        {tab.label}
      </button>
    ))}
  </div>
);

// Drawer/Modal Component
const BottomDrawer = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4 no-print animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl shadow-2xl transform transition-all animate-in slide-in-from-bottom-full md:slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md z-10 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center rounded-t-3xl">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Donut Chart
const DonutChart = ({ data, size = 120 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativeAngle = 0;
    
    if (total === 0) return (
      <div className="flex items-center justify-center text-xs text-slate-400 h-full w-full bg-slate-50 dark:bg-slate-800 rounded-full">
        No Data
      </div>
    );
    
    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, i) => {
            const angle = (item.value / total) * 360;
            const x1 = 50 + 40 * Math.cos((Math.PI * cumulativeAngle) / 180);
            const y1 = 50 + 40 * Math.sin((Math.PI * cumulativeAngle) / 180);
            const x2 = 50 + 40 * Math.cos((Math.PI * (cumulativeAngle + angle)) / 180);
            const y2 = 50 + 40 * Math.sin((Math.PI * (cumulativeAngle + angle)) / 180);
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = total === item.value 
                ? `M 50 10 m 0 40 a 40 40 0 1 0 0 -80 a 40 40 0 1 0 0 80`
                : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            cumulativeAngle += angle;
            return <path key={i} d={pathData} fill={item.color} stroke="white" strokeWidth="2" />;
          })}
          <circle cx="50" cy="50" r="25" fill="white" className="dark:fill-slate-800" />
        </svg>
      </div>
    );
};

// Yearly Breakdown
const YearlyBreakdown = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="w-full h-40 flex items-center justify-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
        No payment history found
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-indigo-500" /> Annual Payment Summary
        </h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar max-h-[180px]">
            {[...data].sort((a,b) => b.label.localeCompare(a.label)).map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">{item.formattedValue}</span>
                </div>
            ))}
        </div>
    </div>
  );
};

// --- AUTH PAGE ---
const AuthPage = ({ darkMode }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      if (isSgnUp) {
        await createUserhEmailAndPassword(auth, email, password);
        setMessage({ type: 'success', text: 'Account created successfully!' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      let errorMessage = 'An error occurred';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({ type: 'success', text: 'Password reset email sent!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send reset email' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 transition-colors">
       <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
           <div className="text-center mb-8">
               <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 mb-4">
                   <Calculator className="w-8 h-8" />
               </div>
               <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Property Tracker</h1>
               <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                 {isSnUp ? 'Create Account' : 'Secure Login'}
               </p>
           </div>
           
           <form onSubmit={handleAuth} className="space-y-4">
               <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email</label>
                   <div className="relative">
                       <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                       <input 
                         type="email" 
                         required 
                         className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" 
                         value={email} 
                         onChange={e => setEmail(e.target.value)} 
                       />
                   </div>
               </div>
               
               <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Password</label>
                   <div className="relative">
                       <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                       <input 
                         type={showPassword ? "text" : "password"}
                         required 
                         className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" 
                         value={password} 
                         onChange={e => setPassword(e.target.value)} 
                       />
                       <button
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                       >
                         {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                   </div>
               </div>
               
               {message.text && (
                 <div className={`p-3 rounded-xl text-xs ${
                   message.type === 'error' 
                     ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                     : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                 }`}>
                   {message.text}
                 </div>
               )}
               
               <button 
                 disabled={loading} 
                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex justify-center items-center gap-2 disabled:opacity-50"
               >
                   {loading && <Loader2 className="w-4 h-4 animate-spin" />} 
                   {isSignUp ? 'Sign Up' : 'Login'}
               </button>
               
               <div className="flex justify-between items-center text-xs">
                 <button
                   type="button"
                   onClick={() => setIsSignUp(!isSignUp)}
                   className="text-indigo-600 dark:text-indigo-400 hover:underline"
                 >
                   {isSignUp ? 'Already have account?' : 'Create account'}
                 </button>
                 
                 {!isSignUp && (
                   <button
                     type="button"
                     onClick={handleForgotPassword}
                     className="text-slate-500 dark:text-slate-400 hover:underline"
                   >
                     Forgot password?
                   </button>
                 )}
               </div>
           </form>
       </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  // Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // App State
  const [activeTab, setActiveTab] = useState('schedule');
  const [prepaymentAmount, setPrepaymentAmount] = useState('');
  const [stepUpPercentage, setStepUpPercentage] = useState('');
  const [simulatorMode, setSimulatorMode] = useState('lumpsum');
  const [docsList, setDocsList] = useState([
    { id: 'allotment', label: 'Allotment Letter', status: 'pending' },
    { id: 'agreement', label: 'Registered Agreement', status: 'pending' },
    { id: 'index2', label: 'Index II Document', status: 'pending' },
    { id: 'receipts', label: 'All Payment Receipts', status: 'pending' },
    { id: 'sanction', label: 'Loan Sanction Letter', status: 'pending' },
    { id: 'noc', label: 'Builder NOC', status: 'pending' },
    { id: 'possession', label: 'Possession Letter', status: 'pending' },
  ]);

  // Data Stores
  const [paymentRecords, setPaymentRecords] = useState({});
  const [bankTransactions, setBankTransactions] = useState([]);
  const [bankEntries, setBankEntries] = useState([]); 
  
  // Forms & UI State
  const [editingStage, setEditingStage] = useState(null); 
  const [editForm, setEditForm] = useState({ date: '', receipt: '', amount: '' });
  const [financeForm, setFinanceForm] = useState({ type: 'emi', date: '', amount: '', notes: '' });
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Bank Edit Form
  const [editBankId, setEditBankId] = useState(null);
  const [bankForm, setBankForm] = useState({ 
    date: '', 
    type: 'emi', 
    emi: '', 
    amount: '', 
    interest: '', 
    principal: '', 
    roi: '', 
    balance: '' 
  });
  const [showBankForm, setShowBankForm] = useState(false); 

  // Constants
  const AGREEMENT_VALUE = 4400000;
  const STAMP_DUTY_RATE = 0.06;
  const REGISTRATION_CHARGE = 40000;
  const MAINTENANCE_CHARGE = 123600;
  const CORPUS_FUND = 103000;

  // Dark Mode Effect
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load Data from Firestore
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load payment records
        const paymentsRef = collection(db, 'users', user.uid, 'payments');
        const paymentsSnap = await getDocs(paymentsRef);
        const records = {};
        paymentsSnap.forEach(doc => {
          const data = doc.data();
          records[data.stage_id] = {
            dbId: doc.id,
            paidAmount: data.amount,
            date: data.payment_date,
            receipt: data.receipt_number
          };
        });
        setPaymentRecords(records);

        // Load transactions
        const transactionsRef = collection(db, 'users', user.uid, 'transactions');
        const transactionsSnap = await getDocs(transactionsRef);
        const txs = [];
        transactionsSnap.forEach(doc => {
          txs.push({ id: doc.id, ...doc.data() });
        });
        setBankTransactions(txs);

        // Load bank entries
        const bankEntriesRef = collection(db, 'users', user.uid, 'bankEntries');
        const bankEntriesSnap = await getDocs(bankEntriesRef);
        const entries = [];
        bankEntriesSnap.forEach(doc => {
          entries.push({ id: doc.id, ...doc.data() });
        });
        setBankEntries(entries.sort((a,b) => new Date(a.date) - new Date(b.date)));

        // Load settings
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'main');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.checklist) {
            setDocsList(prev => prev.map(d => ({
              ...d,
              status: data.checklist[d.id] || 'pending'
            })));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [user]);

  // Calculations (same as before)
  const value = AGREEMENT_VALUE;
  const gstRate = value > 0 ? (value <= 4500000 ? 0.01 : 0.05) : 0;
  const totalGst = value * gstRate;
  const stampDuty = value * STAMP_DUTY_RATE;
  const regCharge = value > 0 ? REGISTRATION_CHARGE : 0;
  const totalPossessionCharges = MAINTENANCE_CHARGE + CORPUS_FUND;
  
  const incidentalCosts = useMemo(
    () => bankTransactions.filter(t => t.type === 'incidental').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
    [bankTransactions]
  );
  
  const totalCost = value + totalGst + stampDuty + regCharge + totalPossessionCharges + incidentalCosts;

  const rawSchedule = [
    { label: "Booking", cumulative: 5 },
    { label: "On execution of Sales Agreement", cumulative: 10 },
    { label: "Payment within 15 Days After Registration", cumulative: 30 },
    { label: "Plinth", cumulative: 45 },
    { label: "1st Slab", cumulative: 49 },
    { label: "3rd Slab", cumulative: 53 },
    { label: "5th Slab", cumulative: 57 },
    { label: "7th Slab", cumulative: 61 },
    { label: "9th Slab", cumulative: 65 },
    { label: "11th Slab", cumulative: 69 },
    { label: "13th Slab", cumulative: 73 },
    { label: "15th Slab", cumulative: 77 },
    { label: "17th Slab", cumulative: 81 },
    { label: "19th Slab", cumulative: 85 },
    { label: "On Bricks work", cumulative: 90 },
    { label: "On Plaster Flooring", cumulative: 95 },
    { label: "On 100% Completion", cumulative: 100 },
  ];

  const planData = useMemo(() => {
    let previousCumulative = 0;
    const constructionStages = rawSchedule.map((stage, index) => {
      const stageId = index + 1;
      const stagePercent = stage.cumulative - previousCumulative;
      const stageAmount = (value * stagePercent) / 100;
      const stageGst = stageAmount * gstRate;
      const totalStageAmount = stageAmount + stageGst;
      previousCumulative = stage.cumulative;
      
      const record = paymentRecords[stageId] || {};
      const paidAmount = parseFloat(record.paidAmount) || 0;
      const balance = totalStageAmount - paidAmount;
      
      let status = 'pending';
      if (paidAmount >= totalStageAmount - 1) status = 'paid';
      else if (paidAmount > 0) status = 'partial';
      
      return {
        id: stageId,
        label: stage.label,
        type: 'construction',
        stagePercent: parseFloat(stagePercent.toFixed(2)),
        totalPayable: totalStageAmount,
        record,
        paidAmount,
        balance,
        status
      };
    });
    
    const stampDutyRow = {
      id: 101,
      label: "Stamp Duty (6%)",
      type: 'tax',
      stagePercent: 0,
      totalPayable: stampDuty,
      record: paymentRecords[101] || {},
      paidAmount: parseFloat(paymentRecords[101]?.paidAmount) || 0,
      balance: stampDuty - (parseFloat(paymentRecords[101]?.paidAmount) || 0),
      status: (parseFloat(paymentRecords[101]?.paidAmount) || 0) >= stampDuty - 1 ? 'paid' : 'pending'
    };
    
    const regRow = {
      id: 102,
      label: "Registration",
      type: 'tax',
      stagePercent: 0,
      totalPayable: regCharge,
      record: paymentRecords[102] || {},
      paidAmount: parseFloat(paymentRecords[102]?.paidAmount) || 0,
      balance: regCharge - (parseFloat(paymentRecords[102]?.paidAmount) || 0),
      status: (parseFloat(paymentRecords[102]?.paidAmount) || 0) >= regCharge - 1 ? 'paid' : 'pending'
    };
    
    const possessionRow = {
      id: 103,
      label: "Maint. + Corpus",
      type: 'possession',
      stagePercent: 0,
      totalPayable: totalPossessionCharges,
      record: paymentRecords[103] || {},
      paidAmount: parseFloat(paymentRecords[103]?.paidAmount) || 0,
      balance: totalPossessionCharges - (parseFloat(paymentRecords[103]?.paidAmount) || 0),
      status: (parseFloat(paymentRecords[103]?.paidAmount) || 0) >= totalPossessionCharges - 1 ? 'paid' : 'pending'
    };
    
    const combinedData = [...constructionStages];
    combinedData.splice(3, 0, stampDutyRow, regRow);
    combinedData.push(possessionRow);
    
    return combinedData;
  }, [value, gstRate, paymentRecords, stampDuty, regCharge, totalPossessionCharges]);

  const totalPaid = planData.reduce((sum, r) => sum + (parseFloat(r.paidAmount) || 0), 0);
  const paidPercent = totalCost > 0 ? (totalPaid / totalCost) * 100 : 0;

  const financeSummary = useMemo(() => {
    const disbursements = bankTransactions.filter(t => t.type === 'disbursement');
    const ownContrib = bankTransactions.filter(t => t.type === 'own');
    const emis = bankTransactions.filter(t => t.type === 'emi');
    
    const totalDisbursed = disbursements.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalOwn = ownContrib.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalEmiPaid = emis.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalPaidTowardsCost = totalDisbursed + totalOwn;
    const balanceDue = totalCost - totalPaidTowardsCost;
    
    const byFY = {};
    emis.forEach(t => {
      const dVal = t.transaction_date || t.date;
      if (!dVal) return;
      const date = new Date(dVal);
      const month = date.getMonth();
      const year = date.getFullYear();
      const fyStart = month >= 3 ? year : year - 1;
      const fyEndShort = (fyStart + 1).toString().slice(-2);
      const fyLabel = `FY ${fyStart}-${fyEndShort}`;
      if (!byFY[fyLabel]) byFY[fyLabel] = 0;
      byFY[fyLabel] += parseFloat(t.amount) || 0;
    });
    
    const chartData = Object.keys(byFY).sort().map(year => ({
      label: year,
      value: byFY[year],
      formattedValue: formatCurrency(byFY[year])
    }));
    
    return {
      totalDisbursed,
      totalOwn,
      totalEmiPaid,
      byFY,
      balanceDue,
      totalPaidTowardsCost,
      chartData
    };
  }, [bankTransactions, totalCost]);

  const bankSummary = useMemo(() => {
    if (bankEntries.length === 0) {
      return {
        currentEMI: 0,
        projectedEMI: 0,
        currentROI: 0,
        tenureEnd: '-',
        currentPrincipal: 0
      };
    }
    
    const today = new Date();
    const sorted = [...bankEntries].sort((a,b) => new Date(a.date) - new Date(b.date));
    const current = sorted.filter(e => new Date(e.date) <= today).pop() || sorted[0];
    const future = sorted.filter(e => new Date(e.date) > today && e.type === 'emi');
    const maxEMI = future.length > 0 ? Math.max(...future.map(e => e.emi || e.amount)) : 0;
    const lastEntry = sorted[sorted.length - 1];
    
    return {
      currentEMI: current.emi || current.amount || 0,
      projectedEMI: maxEMI,
      currentROI: current.roi || 0,
      tenureEnd: lastEntry ? formatDate(lastEntry.date) : '-',
      currentPrincipal: current.balance || 0
    };
  }, [bankEntries]);

  const simulatorStats = useMemo(() => {
    const P = bankSummary.currentPrincipal;
    const annualRate = bankSummary.currentROI;
    const currentEMI = bankSummary.currentEMI;
    
    if (P <= 0 || annualRate <= 0 || currentEMI <= 0) return null;
    
    const r = annualRate / 100 / 12;
    
    // Calculate original baseline
    let monthsOriginal = 0;
    if (P * r >= currentEMI) return null;
    monthsOriginal = -Math.log(1 - (P * r) / currentEMI) / Math.log(1 + r);
    const interestOriginal = (monthsOriginal * currentEMI) - P;
    
    let monthsNew = 0;
    let totalInterestNew = 0;
    
    if (simulatorMode === 'lumpsum') {
      const prepay = parseFloat(prepaymentAmount) || 0;
      if (prepay <= 0 || prepay >= P) {
        return {
          originalInterest: interestOriginal,
          newInterest: interestOriginal,
          originalTenure: monthsOriginal,
          newTenure: monthsOriginal
        };
      }
      
      monthsNew = -Math.log(1 - ((P - prepay) * r) / currentEMI) / Math.log(1 + r);
      totalInterestNew = (monthsNew * currentEMI) - (P - prepay);
    } else {
      const stepUp = parseFloat(stepUpPercentage) || 0;
      
      let balance = P;
      let emi = currentEMI;
      let months = 0;
      
      if (stepUp <= 0) {
        monthsNew = monthsOriginal;
        totalInterestNew = interestOriginal;
      } else {
        while (balance > 0 && months < 600) {
          const interest = balance * r;
          let principal = emi - interest;
          
          if (principal <= 0) break;
          
          if (balance < principal) {
            totalInterestNew += (balance * r);
            months++;
            balance = 0;
            break;
          }
          
          balance -= principal;
          totalInterestNew += interest;
          months++;
          
          if (months % 12 === 0) {
            emi = emi * (1 + stepUp / 100);
          }
        }
        monthsNew = months;
      }
    }
    
    if (monthsNew === 0 || monthsNew === Infinity) return null;
    
    return {
      originalInterest: interestOriginal,
      newInterest: Math.max(0, totalInterestNew),
      originalTenure: monthsOriginal,
      newTenure: monthsNew
    };
  }, [bankSummary, prepaymentAmount, stepUpPercentage, simulatorMode]);

  // Handlers
  const savePayment = async () => {
    if (!user || !editingStage) return;
    
    try {
      const existingRecord = paymentRecords[editingStage];
      const paymentData = {
        stage_id: editingStage,
        amount: parseFloat(editForm.amount),
        payment_date: editForm.date,
        receipt_number: editForm.receipt,
        updated_at: serverTimestamp()
      };
      
      if (existingRecord?.dbId) {
        const paymentRef = doc(db, 'users', user.uid, 'payments', existingRecord.dbId);
        await updateDoc(paymentRef, paymentData);
        
        setPaymentRecords(prev => ({
          ...prev,
          [editingStage]: {
            ...existingRecord,
            paidAmount: editForm.amount,
            date: editForm.date,
            receipt: editForm.receipt
          }
        }));
      } else {
        const paymentsRef = collection(db, 'users', user.uid, 'payments');
        const newPaymentRef = doc(paymentsRef);
        await setDoc(newPaymentRef, {
          ...paymentData,
          created_at: serverTimestamp()
        });
        
        setPaymentRecords(prev => ({
          ...prev,
          [editingStage]: {
            dbId: newPaymentRef.id,
            paidAmount: editForm.amount,
            date: editForm.date,
            receipt: editForm.receipt
          }
        }));
      }
      
      setEditingStage(null);
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Failed to save payment');
    }
  };

  const saveTransaction = async () => {
    if (!user || !financeForm.date || !financeForm.amount) return;
    
    try {
      const transactionData = {
        type: financeForm.type,
        amount: parseFloat(financeForm.amount),
        transaction_date: financeForm.date,
        date: financeForm.date,
        notes: financeForm.notes,
        updated_at: serverTimestamp()
      };
      
      if (editingTransactionId) {
        const txRef = doc(db, 'users', user.uid, 'transactions', editingTransactionId);
        await updateDoc(txRef, transactionData);
        
        setBankTransactions(prev =>
          prev.map(t => t.id === editingTransactionId ? { ...t, ...transactionData } : t)
        );
        setEditingTransactionId(null);
      } else {
        const transactionsRef = collection(db, 'users', user.uid, 'transactions');
        const newTxRef = doc(transactionsRef);
        await setDoc(newTxRef, {
          ...transactionData,
          created_at: serverTimestamp()
        });
        
        setBankTransactions(prev => [...prev, { id: newTxRef.id, ...transactionData }]);
      }
      
      setFinanceForm({ type: 'emi', date: '', amount: '', notes: '' });
      setShowTransactionModal(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    
    try {
      const txRef = doc(db, 'users', user.uid, 'transactions', id);
      await deleteDoc(txRef);
      setBankTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const toggleDocStatus = async (docId, currentStatus) => {
    if (!user) return;
    
    const newStatus = currentStatus === 'pending' ? 'received' : currentStatus === 'received' ? 'na' : 'pending';
    const newDocsList = docsList.map(d => d.id === docId ? { ...d, status: newStatus } : d);
    setDocsList(newDocsList);
    
    try {
      const checklistMap = newDocsList.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.status }), {});
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'main');
      await setDoc(settingsRef, {
        checklist: checklistMap,
        updated_at: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const saveBankEntry = async () => {
    if (!user) return;
    
    try {
      const entryData = {
        date: bankForm.date,
        type: bankForm.type,
        amount: parseFloat(bankForm.amount) || 0,
        interest: parseFloat(bankForm.interest) || 0,
        principal: parseFloat(bankForm.principal) || 0,
        roi: parseFloat(bankForm.roi) || 0,
        balance: parseFloat(bankForm.balance) || 0,
        emi: bankForm.type === 'emi' ? (parseFloat(bankForm.emi) || parseFloat(bankForm.amount) || 0) : 0,
        updated_at: serverTimestamp()
      };
      
      if (editBankId) {
        const entryRef = doc(db, 'users', user.uid, 'bankEntries', editBankId);
        await updateDoc(entryRef, entryData);
        
        setBankEntries(prev =>
          prev.map(e => e.id === editBankId ? { ...e, ...entryData } : e)
        );
      } else {
        const entriesRef = collection(db, 'users', user.uid, 'bankEntries');
        const newEntryRef = doc(entriesRef);
        await setDoc(newEntryRef, {
          ...entryData,
          created_at: serverTimestamp()
        });
        
        setBankEntries(prev =>
          [...prev, { id: newEntryRef.id, ...entryData }].sort((a,b) => new Date(a.date) - new Date(b.date))
        );
      }
      
      setEditBankId(null);
      setShowBankForm(false);
      setBankForm({ date: '', type: 'emi', emi: '', amount: '', interest: '', principal: '', roi: '', balance: '' });
    } catch (error) {
      console.error('Error saving bank entry:', error);
      alert('Failed to save bank entry');
    }
  };

  const handleEditBankEntry = (entry) => {
    setEditBankId(entry.id);
    setBankForm({
      date: entry.date,
      type: entry.type,
      amount: entry.type === 'disb' ? entry.amount : (entry.emi || entry.amount),
      emi: entry.emi || '',
      interest: entry.interest || '',
      principal: entry.principal || '',
      roi: entry.roi || '',
      balance: entry.balance || ''
    });
    setShowBankForm(true);
  };

  const handleDeleteBankEntry = async (id) => {
    if (!user) return;
    
    try {
      const entryRef = doc(db, 'users', user.uid, 'bankEntries', id);
      await deleteDoc(entryRef);
      setBankEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting bank entry:', error);
      alert('Failed to delete entry');
    }
  };

  const handleDeleteAllBankEntries = async () => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete ALL bank entries? This cannot be undone.")) return;
    
    try {
      const entriesRef = collection(db, 'users', user.uid, 'bankEntries');
      const snapshot = await getDocs(entriesRef);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      setBankEntries([]);
    } catch (error) {
      console.error('Error deleting all entries:', error);
      alert('Failed to delete entries');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleExportCSV = () => {
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const rows = [];
    rows.push(["SUMMARY", "Agreement Value", escapeCSV(value), "", ""]);
    rows.push(["SUMMARY", "Govt Taxes (GST+Stamp+Reg)", escapeCSV(totalGst + stampDuty + regCharge), "", ""]);
    rows.push(["SUMMARY", "Possession Charges", escapeCSV(totalPossessionCharges), "", ""]);
    rows.push(["SUMMARY", "Incidental/Extras", escapeCSV(incidentalCosts), "", ""]);
    rows.push(["SUMMARY", "Total Cost of Ownership", escapeCSV(totalCost), "", ""]);
    rows.push(["SUMMARY", "Total Paid So Far", escapeCSV(totalPaid), "", ""]);
    rows.push([]);
    
    rows.push(["PAYMENT SCHEDULE", "Stage", "Payable", "Paid Amount", "Payment Date", "Balance"]);
    planData.forEach(p => {
      rows.push([
        "SCHEDULE",
        escapeCSV(p.label),
        escapeCSV(p.totalPayable),
        escapeCSV(p.paidAmount > 0 ? p.paidAmount : "0"),
        escapeCSV(p.record.date || "-"),
        escapeCSV(p.balance <= 1 ? "0" : p.balance)
      ]);
    });
    rows.push([]);
    
    rows.push(["FINANCE HISTORY", "Type", "Amount", "Date", "Notes"]);
    bankTransactions.sort((a,b) => new Date(a.date || a.transaction_date) - new Date(b.date || b.transaction_date)).forEach(tx => {
      rows.push([
        "TRANSACTION",
        escapeCSV(tx.type),
        escapeCSV(tx.amount),
        escapeCSV(formatDate(tx.transaction_date || tx.date)),
        escapeCSV(tx.notes || "")
      ]);
    });
    rows.push([]);

    rows.push(["DOCUMENT CHECKLIST", "Document Name", "Status"]);
    docsList.forEach(doc => {
      rows.push(["DOC", escapeCSV(doc.label), escapeCSV(doc.status)]);
    });
    rows.push([]);

    if (bankEntries.length > 0) {
      rows.push(["BANK AMORTIZATION", "Date", "Type", "Amount/EMI", "Interest", "Principal", "Balance", "ROI"]);
      bankEntries.forEach(row => {
        rows.push([
          "AMORTIZATION",
          escapeCSV(formatDate(row.date)),
          escapeCSV(row.type === 'disb' ? 'Disbursement' : 'EMI'),
          escapeCSV(row.type === 'disb' ? row.amount : (row.emi || row.amount)),
          escapeCSV(row.interest || 0),
          escapeCSV(row.principal || 0),
          escapeCSV(row.balance || 0),
          escapeCSV(row.roi || 0)
        ]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Property_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackup = async () => {
    if (!user) return;
    
    const data = {
      paymentRecords,
      bankTransactions,
      bankEntries,
      docsList,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowDataModal(false);
  };

  const handleRestore = async (e) => {
    if (!user || !e.target.files[0]) return;
    
    if (!window.confirm("WARNING: This will merge the backup data with your current data. Continue?")) {
      e.target.value = null;
      return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Restore transactions
        if (data.bankTransactions && Array.isArray(data.bankTransactions)) {
          const transactionsRef = collection(db, 'users', user.uid, 'transactions');
          for (const tx of data.bankTransactions) {
            const { id, ...txData } = tx;
            const newTxRef = doc(transactionsRef);
            await setDoc(newTxRef, {
              ...txData,
              created_at: serverTimestamp()
            });
          }
        }

        // Restore bank entries
        if (data.bankEntries && Array.isArray(data.bankEntries)) {
          const entriesRef = collection(db, 'users', user.uid, 'bankEntries');
          for (const entry of data.bankEntries) {
            const { id, ...entryData } = entry;
            const newEntryRef = doc(entriesRef);
            await setDoc(newEntryRef, {
              ...entryData,
              created_at: serverTimestamp()
            });
          }
        }

        // Restore settings
        if (data.docsList) {
          const checklistMap = data.docsList.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.status }), {});
          const settingsRef = doc(db, 'users', user.uid, 'settings', 'main');
          await setDoc(settingsRef, {
            checklist: checklistMap,
            updated_at: serverTimestamp()
          }, { merge: true });
        }

        // Restore payment records
        if (data.paymentRecords) {
          const paymentsRef = collection(db, 'users', user.uid, 'payments');
          for (const [stageId, record] of Object.entries(data.paymentRecords)) {
            const newPaymentRef = doc(paymentsRef);
            await setDoc(newPaymentRef, {
              stage_id: parseInt(stageId),
              amount: record.paidAmount,
              payment_date: record.date,
              receipt_number: record.receipt,
              created_at: serverTimestamp()
            });
          }
        }

        alert("Data restoration successful! The page will now reload.");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Failed to parse backup file.");
      }
    };
    
    reader.readAsText(file);
    setShowDataModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-24 md:pb-8 selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-700 dark:selection:text-indigo-300 transition-colors">
        
        {/* Print Styles */}
        <style>{`
          @media print {
            @page { margin: 1.5cm; size: A4 portrait; }
            body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; font-size: 12px; }
            .no-print { display: none !important; }
            .print-only { display: block !important; width: 100%; position: relative; top: 0; left: 0; z-index: 1000; background: white; }
            html, body { height: auto; overflow: visible; }
            .break-before-page { page-break-before: always; }
            .break-inside-avoid { page-break-inside: avoid; }
            .dark { color-scheme: light; }
          }
          .print-only { display: none; }
          
          /* Custom Scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #475569;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>

        {/* HEADER */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 transition-all duration-300 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-row justify-between items-center py-4">
               <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
                     <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                     <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">Property Tracker</h1>
                     <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dashboard</p>
                  </div>
               </div>
               
               <DesktopNav activeTab={activeTab} setActiveTab={setActiveTab} />
               
               <div className="flex gap-2">
                  <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
                  <button 
                    onClick={() => setShowDataModal(true)} 
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors" 
                    title="Data Backup/Restore"
                  >
                    <Database className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleExportCSV} 
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors" 
                    title="Export CSV"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handlePrint} 
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors" 
                    title="Print"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-6 animate-in fade-in duration-500 no-print">

          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Hero Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  
                  {/* Main Investment Summary */}
                  <div className="md:col-span-2 lg:col-span-1 bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 flex flex-col justify-between min-h-[320px]">
                      <div className="relative z-10">
                          <div className="flex justify-between items-start mb-8">
                              <div>
                                  <p className="text-slate-400 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Total Paid</p>
                                  <h2 className="text-4xl font-bold tracking-tight mb-1">{formatCurrency(totalPaid)}</h2>
                                  <p className="text-sm text-slate-400 dark:text-slate-300">Total Cost: <span className="text-white font-medium">{formatCurrency(totalCost)}</span></p>
                              </div>
                              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                  <PieChart className="w-6 h-6 text-indigo-300" />
                              </div>
                          </div>
                          <div className="space-y-4">
                              <div className="flex justify-between text-sm font-medium">
                                  <span className="text-indigo-200">Progress</span>
                                  <span className="text-white">{paidPercent.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-slate-800/50 rounded-full h-4 overflow-hidden p-1 shadow-inner border border-white/5">
                                  <div 
                                    className="bg-gradient-to-r from-indigo-500 to-violet-400 h-full rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out" 
                                    style={{ width: `${paidPercent}%` }}
                                  />
                              </div>
                              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-white/10">
                                  <span>Started</span>
                                  <span>Agreement: {formatCurrency(value)}</span>
                              </div>
                          </div>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/20 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none"></div>
                  </div>

                  {/* Govt Taxes Breakdown */}
                  <BreakdownCard 
                      title="Govt. Taxes Breakdown" 
                      total={formatCurrency(totalGst + stampDuty + regCharge)}
                      items={[
                          { label: `GST (${(gstRate * 100).toFixed(0)}%)`, value: formatCurrency(totalGst) },
                          { label: `Stamp Duty (${(STAMP_DUTY_RATE * 100).toFixed(0)}%)`, value: formatCurrency(stampDuty) },
                          { label: "Registration", value: formatCurrency(regCharge) }
                      ]}
                      icon={Landmark}
                  />

                  {/* Possession Charges */}
                  <BreakdownCard 
                      title="Possession Charges" 
                      total={formatCurrency(totalPossessionCharges)}
                      items={[
                          { label: "Maint. + Corpus", value: formatCurrency(totalPossessionCharges) },
                          { label: "Incidental/Extras", value: formatCurrency(incidentalCosts) }
                      ]}
                      icon={Key}
                      bgClass="bg-amber-50/50 dark:bg-amber-900/10"
                      borderClass="border-amber-100 dark:border-amber-800"
                  />
              </div>

              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Payment Timeline</h2>
                  <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400">
                    {planData.filter(d => d.status === 'paid').length} / {planData.length} Completed
                  </span>
              </div>

              {/* Mobile Timeline */}
              <div className="md:hidden relative pl-4 border-l-2 border-slate-100 dark:border-slate-700 ml-4 space-y-8 my-4">
                  {planData.map((row) => (
                      <div key={row.id} className="relative pl-6">
                          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-colors duration-300 ${
                            row.status === 'paid' ? 'bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/50' : 'bg-slate-300 dark:bg-slate-600'
                          }`} />
                          <div 
                              onClick={() => {
                                setEditingStage(row.id);
                                setEditForm({
                                  date: row.record.date || new Date().toISOString().split('T')[0],
                                  receipt: row.record.receipt || '',
                                  amount: row.record.paidAmount || row.totalPayable
                                });
                              }}
                              className={`p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                                row.status === 'paid' 
                                  ? 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-800 shadow-sm' 
                                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'
                              }`}
                          >
                              <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stage {row.id}</span>
                                  <StatusBadge status={row.status} />
                              </div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{row.label}</h4>
                              <div className="flex justify-between items-end mt-3">
                                  <div>
                                      <div className="text-[10px] text-slate-400 uppercase font-bold">Amount</div>
                                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatCurrency(row.totalPayable)}</div>
                                  </div>
                                  {row.balance > 1 && (
                                      <div className="text-right">
                                          <div className="text-[10px] text-rose-400 uppercase font-bold">Balance</div>
                                          <div className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(row.balance)}</div>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-400 dark:text-slate-500">
                      <tr>
                        <th className="py-5 px-6">Stage Details</th>
                        <th className="py-5 px-6 text-right">Amount</th>
                        <th className="py-5 px-6">Status</th>
                        <th className="py-5 px-6 text-right">Balance</th>
                        <th className="py-5 px-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                      {planData.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-4 px-6">
                              <div className="font-bold text-slate-700 dark:text-slate-200">{row.label}</div>
                              {row.stagePercent > 0 && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{row.stagePercent}%</div>}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium text-slate-600 dark:text-slate-300">{formatCurrency(row.totalPayable)}</td>
                          <td className="py-4 px-6"><StatusBadge status={row.status} /></td>
                          <td className="py-4 px-6 text-right font-mono text-slate-500 dark:text-slate-400">{row.balance <= 1 ? '-' : formatCurrency(row.balance)}</td>
                          <td className="py-4 px-6 text-center">
                              <button 
                                  onClick={() => {
                                    setEditingStage(row.id);
                                    setEditForm({
                                      date: row.record.date || new Date().toISOString().split('T')[0],
                                      receipt: row.record.receipt || '',
                                      amount: row.record.paidAmount || row.totalPayable
                                    });
                                  }}
                                  className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                              >
                                  <Edit2 className="w-4 h-4" />
                              </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
          )}

          {/* FINANCE TAB */}
          {activeTab === 'loan' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <BentoCard 
                   title="Total Disbursed" 
                   value={formatCurrency(financeSummary.totalDisbursed + financeSummary.totalOwn)} 
                   subtext={`Target: ${formatCurrency(totalCost)}`} 
                   icon={Wallet} 
                   variant="primary" 
                 />
                 <BentoCard 
                   title="Total Interest Paid" 
                   value={formatCurrency(financeSummary.totalEmiPaid)} 
                   subtext="Principal + Interest outflow" 
                   icon={TrendingUp} 
                 />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Funding Mix Donut */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 text-sm">
                          <PieChart className="w-4 h-4 text-indigo-500" /> Funding Mix
                      </h3>
                      <div className="flex flex-col items-center justify-center flex-1 gap-6">
                          <DonutChart 
                            data={[
                              { value: financeSummary.totalDisbursed, color: '#6366f1' },
                              { value: financeSummary.totalOwn, color: '#10b981' },
                              { value: Math.max(0, financeSummary.balanceDue), color: '#f1f5f9' }
                            ]} 
                            size={160} 
                          />
                          <div className="w-full space-y-3 text-xs">
                              <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/50">
                                  <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                      <span className="text-slate-600 dark:text-slate-300 font-medium">Bank Loan</span>
                                  </div>
                                  <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(financeSummary.totalDisbursed)}</span>
                              </div>
                              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100/50 dark:border-emerald-800/50">
                                  <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                      <span className="text-slate-600 dark:text-slate-300 font-medium">Own Contrib.</span>
                                  </div>
                                  <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(financeSummary.totalOwn)}</span>
                              </div>
                              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                                  <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                      <span className="text-slate-500 dark:text-slate-400">Balance Due</span>
                                  </div>
                                  <span className="font-bold text-slate-400 dark:text-slate-500">{formatCurrency(Math.max(0, financeSummary.balanceDue))}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Annual Summary */}
                  <div className="md:col-span-2 h-full">
                       <YearlyBreakdown data={financeSummary.chartData} />
                  </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">Transaction History</h3>
                      <button 
                        onClick={() => {
                          setEditingTransactionId(null);
                          setFinanceForm({
                            type: 'emi',
                            date: new Date().toISOString().split('T')[0],
                            amount: '',
                            notes: ''
                          });
                          setShowTransactionModal(true);
                        }} 
                        className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                          <Plus className="w-3 h-3" /> Add Entry
                      </button>
                  </div>
                  
                  {bankTransactions.length === 0 ? (
                      <div className="text-center py-12">
                          <div className="bg-slate-50 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                              <RefreshCw className="w-6 h-6 text-slate-300 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-400 dark:text-slate-500 text-sm">No transactions yet.</p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {bankTransactions
                            .sort((a,b) => new Date(b.date || b.transaction_date) - new Date(a.date || a.transaction_date))
                            .map(tx => (
                              <div 
                                key={tx.id} 
                                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all group"
                              >
                                  <div className="flex items-center gap-4">
                                      <div className={`p-3 rounded-2xl ${
                                        tx.type === 'emi' 
                                          ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' 
                                          : tx.type === 'own' 
                                          ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                      }`}>
                                          {tx.type === 'emi' 
                                            ? <Calendar className="w-5 h-5" /> 
                                            : tx.type === 'own' 
                                            ? <Wallet className="w-5 h-5" /> 
                                            : <Building2 className="w-5 h-5" />
                                          }
                                      </div>
                                      <div>
                                          <div className="font-bold text-slate-800 dark:text-slate-100 capitalize">{tx.type}</div>
                                          <div className="text-xs text-slate-400 dark:text-slate-500">{formatDate(tx.transaction_date || tx.date)}</div>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className="font-bold text-slate-800 dark:text-slate-100 font-mono">{formatCurrency(tx.amount)}</div>
                                      <div className="flex justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button 
                                            onClick={() => {
                                              setFinanceForm({
                                                type: tx.type,
                                                date: tx.transaction_date || tx.date,
                                                amount: tx.amount,
                                                notes: tx.notes || ''
                                              });
                                              setEditingTransactionId(tx.id);
                                              setShowTransactionModal(true);
                                            }} 
                                            className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase"
                                          >
                                            Edit
                                          </button>
                                          <button 
                                            onClick={() => deleteTransaction(tx.id)} 
                                            className="text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase"
                                          >
                                            Delete
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            </div>
          )}

          {/* BANK PLAN TAB */}
          {activeTab === 'bank_plan' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <BentoCard title="Current EMI" value={formatCurrency(bankSummary.currentEMI)} variant="default" />
                      <BentoCard title="Projected EMI" value={formatCurrency(bankSummary.projectedEMI)} variant="default" />
                      <BentoCard title="Current ROI" value={`${bankSummary.currentROI}%`} variant="default" />
                      <BentoCard title="Tenure End" value={bankSummary.tenureEnd} variant="default" />
                  </div>

                  {/* Amortization Table */}
                  <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100">Amortization Schedule</h3>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditBankId(null);
                                  setShowBankForm(true);
                                  setBankForm({
                                    date: new Date().toISOString().split('T')[0],
                                    type: 'emi',
                                    emi: '',
                                    amount: '',
                                    interest: '',
                                    principal: '',
                                    roi: '',
                                    balance: ''
                                  });
                                }} 
                                className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full font-bold hover:bg-indigo-700 transition-colors"
                              >
                                Add Entry
                              </button>
                              <button 
                                onClick={handleDeleteAllBankEntries} 
                                className="text-xs bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-full font-bold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                              >
                                Clear All
                              </button>
                          </div>
                      </div>
                      
                      {/* Loan Impact Simulator */}
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                          <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    <Activity className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Impact Simulator</span>
                              </div>
                              <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                                  <button 
                                      onClick={() => setSimulatorMode('lumpsum')} 
                                      className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${
                                        simulatorMode === 'lumpsum' 
                                          ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-700 dark:text-indigo-300' 
                                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                      }`}
                                  >
                                      <Zap className="w-3 h-3" /> Lumpsum
                                  </button>
                                  <button 
                                      onClick={() => setSimulatorMode('stepup')} 
                                      className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${
                                        simulatorMode === 'stepup' 
                                          ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-700 dark:text-indigo-300' 
                                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                      }`}
                                  >
                                      <TrendingUp className="w-3 h-3" /> Step-Up
                                  </button>
                              </div>
                          </div>

                          <div className="flex flex-col lg:flex-row gap-8">
                              {/* Input Area */}
                              <div className="flex-1 space-y-4">
                                  {simulatorMode === 'lumpsum' ? (
                                      <div className="space-y-2 animate-in fade-in">
                                          <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">One-time Payment</label>
                                          <div className="relative">
                                              <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
                                              <input 
                                                  type="number" 
                                                  placeholder="e.g. 100000" 
                                                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700 dark:text-slate-200"
                                                  value={prepaymentAmount}
                                                  onChange={(e) => setPrepaymentAmount(e.target.value)}
                                              />
                                          </div>
                                          <p className="text-[10px] text-slate-400 ml-1">Calculate impact of reduced principal today.</p>
                                      </div>
                                  ) : (
                                      <div className="space-y-2 animate-in fade-in">
                                          <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Annual EMI Increase</label>
                                          <div className="relative">
                                              <input 
                                                  type="number" 
                                                  placeholder="e.g. 5 or 10" 
                                                  className="w-full pl-4 pr-8 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700 dark:text-slate-200"
                                                  value={stepUpPercentage}
                                                  onChange={(e) => setStepUpPercentage(e.target.value)}
                                              />
                                              <span className="absolute right-4 top-3.5 text-slate-400 font-bold">%</span>
                                          </div>
                                          <p className="text-[10px] text-slate-400 ml-1">Simulates increasing EMI by {stepUpPercentage || 'X'}% yearly.</p>
                                      </div>
                                  )}
                              </div>
                              
                              {/* Visual Illustration */}
                              <div className="flex-[1.5] bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                  {simulatorStats ? (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                                          <ComparisonBar 
                                              label="Total Interest" 
                                              original={simulatorStats.originalInterest} 
                                              current={simulatorStats.newInterest} 
                                              unit="₹"
                                              color="bg-emerald-500"
                                          />
                                          <ComparisonBar 
                                              label="Loan Tenure" 
                                              original={simulatorStats.originalTenure} 
                                              current={simulatorStats.newTenure} 
                                              unit="months"
                                              color="bg-indigo-500"
                                          />
                                      </div>
                                  ) : (
                                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                          <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-full mb-2">
                                            <Activity className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                                          </div>
                                          <p className="text-xs text-slate-400 dark:text-slate-500">Enter details to see impact.</p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-400 dark:text-slate-500">
                                  <tr>
                                      <th className="p-4">Date</th>
                                      <th className="p-4">Type</th>
                                      <th className="p-4 text-right">Amount</th>
                                      <th className="p-4 text-right hidden md:table-cell">Interest</th>
                                      <th className="p-4 text-right hidden md:table-cell">Principal</th>
                                      <th className="p-4 text-right">Balance</th>
                                      <th className="p-4 w-10"></th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                  {bankEntries.length === 0 ? (
                                    <tr>
                                      <td colSpan="7" className="p-8 text-center text-slate-400 dark:text-slate-500">
                                        No entries yet. Add your first entry above.
                                      </td>
                                    </tr>
                                  ) : (
                                    bankEntries.map((row, i) => (
                                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 group">
                                          <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {formatDate(row.date)}
                                          </td>
                                          <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                              row.type === 'disb' 
                                                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                            }`}>
                                              {row.type === 'disb' ? 'Disb' : 'EMI'}
                                            </span>
                                          </td>
                                          <td className="p-4 text-right font-mono font-medium dark:text-slate-200">
                                            {formatCurrency(row.type === 'disb' ? row.amount : (row.emi || row.amount))}
                                          </td>
                                          <td className="p-4 text-right text-slate-400 dark:text-slate-500 hidden md:table-cell">
                                            {row.interest ? formatCurrency(row.interest) : '-'}
                                          </td>
                                          <td className="p-4 text-right text-slate-400 dark:text-slate-500 hidden md:table-cell">
                                            {row.principal ? formatCurrency(row.principal) : '-'}
                                          </td>
                                          <td className="p-4 text-right font-mono font-bold text-slate-700 dark:text-slate-200">
                                            {formatCurrency(row.balance)}
                                          </td>
                                          <td className="p-4 text-right">
                                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <button 
                                                    onClick={() => handleEditBankEntry(row)} 
                                                    className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded"
                                                  >
                                                    <Edit2 className="w-3 h-3" />
                                                  </button>
                                                  <button 
                                                    onClick={() => handleDeleteBankEntry(row.id)} 
                                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                    ))
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}

          {/* DOCS TAB */}
          {activeTab === 'docs' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                         <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                             <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                               <FileCheck className="w-5 h-5 text-indigo-500" /> Document Checklist
                             </h3>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track critical property documents.</p>
                         </div>
                         <div className="divide-y divide-slate-50 dark:divide-slate-700">
                             {docsList.map((doc) => (
                                 <div 
                                   key={doc.id} 
                                   onClick={() => toggleDocStatus(doc.id, doc.status)} 
                                   className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors group"
                                 >
                                     <div className="flex items-center gap-4">
                                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                           doc.status === 'received' 
                                             ? 'bg-emerald-500 border-emerald-500 scale-110' 
                                             : doc.status === 'na' 
                                             ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600' 
                                             : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'
                                         }`}>
                                             {doc.status === 'received' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                             {doc.status === 'na' && <X className="w-3 h-3 text-slate-400 dark:text-slate-500" />}
                                         </div>
                                         <span className={`font-medium transition-colors ${
                                           doc.status === 'received' 
                                             ? 'text-slate-400 dark:text-slate-500 line-through' 
                                             : 'text-slate-700 dark:text-slate-200'
                                         }`}>
                                           {doc.label}
                                         </span>
                                     </div>
                                     <StatusBadge status={doc.status} />
                                 </div>
                             ))}
                         </div>
                     </div>
                     
                     <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 dark:from-indigo-950 dark:to-indigo-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[300px]">
                          <div className="relative z-10 space-y-6">
                              <div>
                                  <h3 className="text-2xl font-bold mb-2">Why track documents?</h3>
                                  <p className="text-indigo-200 dark:text-indigo-300 text-sm leading-relaxed">
                                      Missing documents like <strong>Index II</strong> or <strong>NOC</strong> can delay resale or loan transfer by months.
                                  </p>
                              </div>
                              <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                  <h4 className="font-bold text-sm mb-2 text-indigo-100 flex items-center gap-2">
                                    <UploadCloud className="w-4 h-4" /> Pro Tip
                                  </h4>
                                  <p className="text-xs text-indigo-200/80 leading-relaxed">
                                    Always scan and upload physical documents to secure cloud storage (DigiLocker) immediately.
                                  </p>
                              </div>
                          </div>
                          <FileText className="absolute -right-8 -bottom-8 w-48 h-48 text-white opacity-5 transform rotate-12" />
                     </div>
                 </div>
             </div>
          )}

        </div>

        {/* DRAWERS / MODALS */}
        
        {/* Data Management Drawer */}
        <BottomDrawer isOpen={showDataModal} onClose={() => setShowDataModal(false)} title="Data Management">
           <div className="space-y-6">
               <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl">
                   <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-1">
                     <AlertCircle className="w-4 h-4" /> Important
                   </h4>
                   <p className="text-xs text-amber-700 dark:text-amber-400">
                     Backup your data regularly. Restoring data will merge with existing records.
                   </p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={handleBackup} 
                     className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group"
                   >
                       <div className="p-3 bg-white dark:bg-slate-600 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                           <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                       </div>
                       <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Backup Data</span>
                       <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Download JSON</span>
                   </button>

                   <label className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group cursor-pointer relative">
                       <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                       <div className="p-3 bg-white dark:bg-slate-600 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                           <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                       </div>
                       <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Restore Data</span>
                       <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Upload JSON</span>
                   </label>
               </div>
           </div>
        </BottomDrawer>

        {/* Payment Edit Drawer */}
        <BottomDrawer isOpen={!!editingStage} onClose={() => setEditingStage(null)} title="Update Payment">
           <div className="space-y-4">
              <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Payment Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" 
                    value={editForm.date} 
                    onChange={e => setEditForm({...editForm, date: e.target.value})} 
                  />
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Amount Paid</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" 
                    value={editForm.amount} 
                    onChange={e => setEditForm({...editForm, amount: e.target.value})} 
                  />
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Receipt No.</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" 
                    value={editForm.receipt} 
                    onChange={e => setEditForm({...editForm, receipt: e.target.value})} 
                  />
              </div>
              <button 
                onClick={savePayment} 
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:bg-indigo-700 transition-all mt-2"
              >
                Save Payment
              </button>
           </div>
        </BottomDrawer>

        {/* Transaction Add/Edit Drawer */}
        <BottomDrawer isOpen={showTransactionModal} onClose={() => setShowTransactionModal(false)} title={editingTransactionId ? "Edit Transaction" : "New Transaction"}>
           <div className="space-y-4">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl">
                  {[
                    { id: 'emi', label: 'EMI' },
                    { id: 'disbursement', label: 'Bank Release' },
                    { id: 'own', label: 'Own' },
                    { id: 'incidental', label: 'Extra' }
                  ].map(opt => (
                    <button 
                      key={opt.id} 
                      onClick={() => setFinanceForm({...financeForm, type: opt.id})} 
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        financeForm.type === opt.id 
                          ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Date</label>
                      <input 
                        type="date" 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-100" 
                        value={financeForm.date} 
                        onChange={e => setFinanceForm({...financeForm, date: e.target.value})} 
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Amount</label>
                      <input 
                        type="number" 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-100" 
                        value={financeForm.amount} 
                        onChange={e => setFinanceForm({...financeForm, amount: e.target.value})} 
                      />
                  </div>
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Notes</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-100" 
                    placeholder="Optional notes" 
                    value={financeForm.notes} 
                    onChange={e => setFinanceForm({...financeForm, notes: e.target.value})} 
                  />
              </div>
              <button 
                onClick={saveTransaction} 
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:bg-indigo-700 transition-all mt-2"
              >
                Save Transaction
              </button>
           </div>
        </BottomDrawer>

        {/* Bank Entry Drawer */}
        <BottomDrawer isOpen={showBankForm} onClose={() => setShowBankForm(false)} title={editBankId ? "Edit Bank Entry" : "Add Bank Entry"}>
           <div className="grid grid-cols-2 gap-3">
               <div className="col-span-2">
                   <label className="text-[10px] uppercase font-bold text-slate-400">Date</label>
                   <input 
                     type="date" 
                     className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
                     value={bankForm.date} 
                     onChange={e => setBankForm({...bankForm, date: e.target.value})} 
                   />
               </div>
               <div>
                   <label className="text-[10px] uppercase font-bold text-slate-400">Type</label>
                   <select 
                     className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
                     value={bankForm.type} 
                     onChange={e => setBankForm({...bankForm, type: e.target.value})}
                   >
                       <option value="emi">EMI</option>
                       <option value="disb">Disbursement</option>
                   </select>
               </div>
               {bankForm.type === 'disb' ? (
                   <div>
                       <label className="text-[10px] uppercase font-bold text-slate-400">Amount</label>
                       <input 
                         type="number" 
                         className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
                         value={bankForm.amount} 
                         onChange={e => setBankForm({...bankForm, amount: e.target.value})} 
                       />
                   </div>
               ) : (
                   <div>
                       <label className="text-[10px] uppercase font-bold text-slate-400">EMI Amount</label>
                       <input 
                         type="number" 
                         className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
                         value={bankForm.emi} 
                         onChange={e => setBankForm({...bankForm, emi: e.target.value})} 
                       />
                   </div>
               )}
               <div>
                 <label className="text-[10px] uppercase font-bold text-slate-400">Interest</label>
                 <input 
                   type="number" 
                   className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
                   value={bankForm.interest} 
                   onChange={e => setBankForm({...bankForm, interest: e.target.value})} 
                 />
               </div>
               <div>
                 <label className="text-[10px] uppercase font-bold text-slate-400">Principal</label>
                 <input 
                   type="number" 
                   className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
                   value={bankForm.principal} 
                   onChange={e => setBankForm({...bankForm, principal: e.target.value})} 
                 />
               </div>
               <div>
                 <label className="text-[10px] uppercase font-bold text-slate-400">Balance</label>
                 <input 
                   type="number" 
                   className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
                   value={bankForm.balance} 
                   onChange={e => setBankForm({...bankForm, balance: e.target.value})} 
                 />
               </div>
               <div>
                 <label className="text-[10px] uppercase font-bold text-slate-400">ROI %</label>
                 <input 
                   type="number" 
                   className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
                   value={bankForm.roi} 
                   onChange={e => setBankForm({...bankForm, roi: e.target.value})} 
                 />
               </div>
               <button 
                 onClick={saveBankEntry} 
                 className="col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-bold mt-2 hover:bg-indigo-700 transition-colors"
               >
                 Save Entry
               </button>
           </div>
        </BottomDrawer>

        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;
