import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CreditCard, Layers, CalendarClock, Music, Image as ImageIcon, Video, Cloud, CheckCircle2, ChevronRight, ChevronLeft, User, Edit2, Trash2, AlertTriangle, X, Check, CheckSquare, Square, Search, Zap, Info, ToggleLeft, ToggleRight, CircleDashed } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import LandingPage from './LandingPage';

const initialSubscriptions = [
  { id: 1, name: 'Spotify Student', iconType: 'Music', price: 'Rp 24.990', priceNumeric: 24990, billDate: '2026-05-10', nextBilling: 'Dalam 3 hari', isTrial: false, autoRenew: true },
  { id: 2, name: 'Canva Pro', iconType: 'Image', price: 'Rp 49.000', priceNumeric: 49000, billDate: '2026-05-19', nextBilling: 'Dalam 12 hari', isTrial: true, autoRenew: true },
  { id: 3, name: 'Netflix Mobile', iconType: 'Video', price: 'Rp 65.000', priceNumeric: 65000, billDate: '2026-05-22', nextBilling: 'Dalam 15 hari', isTrial: false, autoRenew: true },
  { id: 4, name: 'Google One', iconType: 'Cloud', price: 'Rp 26.900', priceNumeric: 26900, billDate: '2026-05-27', nextBilling: 'Dalam 20 hari', isTrial: false, autoRenew: true },
];

const defaultIconOptions: Record<string, {icon: any, color: string, bg: string, hex?: string}> = {
  Music: { icon: Music, color: 'text-[#1DB954]', bg: 'bg-[#1DB954]/20', hex: '#1DB954' },
  Video: { icon: Video, color: 'text-red-500', bg: 'bg-red-500/20', hex: '#ef4444' },
  Cloud: { icon: Cloud, color: 'text-yellow-500', bg: 'bg-yellow-500/20', hex: '#eab308' },
  Image: { icon: ImageIcon, color: 'text-blue-400', bg: 'bg-blue-400/20', hex: '#60a5fa' },
  Sub: { icon: Layers, color: 'text-purple-400', bg: 'bg-purple-400/20', hex: '#c084fc' }
};

const getInitialSubs = () => {
  const saved = localStorage.getItem('subs');
  if (saved) return JSON.parse(saved);
  return initialSubscriptions;
};

const getInitialIcons = () => {
  const saved = localStorage.getItem('dynamicIcons');
  if (saved) {
    const parsed = JSON.parse(saved);
    // Restore icon components from string keys if necessary, or just use Layers for custom
    Object.keys(parsed).forEach(key => {
      parsed[key].icon = defaultIconOptions[key]?.icon || Layers;
    });
    return parsed;
  }
  return defaultIconOptions;
};

export default function App() {
  const [view, setView] = useState<'landing' | 'prototype'>(() => {
    return typeof window !== 'undefined' && window.location.hash === '#prototype' ? 'prototype' : 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash === '#prototype' ? 'prototype' : 'landing');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToPrototype = () => {
    window.location.hash = 'prototype';
  };

  const navigateToLanding = () => {
    window.location.hash = '';
  };

  const [dynamicIcons, setDynamicIcons] = useState(getInitialIcons);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#c084fc");
  
  const [subs, setSubs] = useState(getInitialSubs);

  useEffect(() => {
    localStorage.setItem('subs', JSON.stringify(subs));
  }, [subs]);

  useEffect(() => {
    // We cannot stringify objects with React components, so remove them or rebuild on load
    const toSave = Object.keys(dynamicIcons).reduce((acc: any, key) => {
      acc[key] = { ...dynamicIcons[key], icon: null };
      return acc;
    }, {});
    localStorage.setItem('dynamicIcons', JSON.stringify(toSave));
  }, [dynamicIcons]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [selectedSubs, setSelectedSubs] = useState<number[]>([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const filteredSubs = subs.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPengeluaran = useMemo(() => subs.filter(s => !s.isTrial).reduce((acc, curr) => acc + (curr.priceNumeric || 0), 0), [subs]);
  const potentialTrialCharges = useMemo(() => subs.filter(s => s.isTrial && s.autoRenew).reduce((acc, curr) => acc + (curr.priceNumeric || 0), 0), [subs]);
  
  const formatRupiah = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;
  
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const [chartMode, setChartMode] = useState<'top' | 'category'>('top');
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const expenseData = useMemo(() => {
    let data: { name: string, cost: number, color: string }[] = [];
    const activeSubs = subs.filter(s => !s.isTrial);
    const multiplier = chartPeriod === 'yearly' ? 12 : chartPeriod === 'weekly' ? 12 / 52 : 1;

    if (chartMode === 'top') {
      data = activeSubs
        .sort((a, b) => (b.priceNumeric || 0) - (a.priceNumeric || 0))
        .slice(0, 4)
        .map(s => ({
          name: s.name.split(' ')[0],
          cost: Math.round((s.priceNumeric || 0) * multiplier),
          color: dynamicIcons[s.iconType]?.hex || '#3b82f6'
        }));
    } else {
      const categoryMap = new Map();
      activeSubs.forEach(s => {
        const current = categoryMap.get(s.iconType) || 0;
        categoryMap.set(s.iconType, current + (s.priceNumeric || 0) * multiplier);
      });
      data = Array.from(categoryMap.entries()).map(([key, val]) => ({
        name: key,
        cost: Math.round(val as number),
        color: dynamicIcons[key]?.hex || '#3b82f6'
      })).sort((a,b) => b.cost - a.cost);
    }
    return data;
  }, [subs, chartMode, chartPeriod, dynamicIcons]);

  const [mousePosition, setMousePosition] = useState(() => {
    if (typeof window !== "undefined") {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    return { x: 500, y: 400 };
  });

  useEffect(() => {
    // Set initial position correct to viewport center
    setMousePosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        setMousePosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const toggleSelection = (id: number) => {
    setSelectedSubs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAllSelection = () => {
    if (selectedSubs.length === subs.length && subs.length > 0) {
      setSelectedSubs([]);
    } else {
      setSelectedSubs(subs.map(s => s.id));
    }
  };

  const handleBulkDelete = () => {
    setSubs(subs.filter(s => !selectedSubs.includes(s.id)));
    setSelectedSubs([]);
    setBulkDeleteConfirm(false);
  };

  const handleBulkMarkPaid = () => {
    setSubs(subs.map(s => selectedSubs.includes(s.id) ? { ...s, billDate: 'Bulan Depan', nextBilling: '30 hari lagi' } : s));
    setSelectedSubs([]);
  };

  const [editTarget, setEditTarget] = useState<number | null>(null);
  const [editSubForm, setEditSubForm] = useState({
    name: '',
    price: '',
    billDate: '',
    iconType: 'Music',
    isTrial: false,
    autoRenew: true
  });

  const handleEditClick = (sub: any) => {
    setEditTarget(sub.id);
    setEditSubForm({
      name: sub.name,
      price: sub.price,
      billDate: sub.billDate,
      iconType: sub.iconType || 'Music',
      isTrial: sub.isTrial || false,
      autoRenew: sub.autoRenew ?? true
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubForm.name || !editSubForm.price || !editSubForm.billDate || editTarget === null) return;
    
    const iconConfig = dynamicIcons[editSubForm.iconType as keyof typeof dynamicIcons] || dynamicIcons.Sub;
    const numericPrice = parseInt(editSubForm.price.replace(/\D/g, '')) || 0;
    
    setSubs(subs.map(sub => 
      sub.id === editTarget 
        ? {
            ...sub,
            name: editSubForm.name,
            iconType: editSubForm.iconType,
            price: editSubForm.price,
            priceNumeric: numericPrice,
            billDate: editSubForm.billDate,
            isTrial: editSubForm.isTrial,
            autoRenew: editSubForm.autoRenew
          }
        : sub
    ));
    setEditTarget(null);
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubForm, setNewSubForm] = useState({
    name: '',
    price: '',
    billDate: '',
    iconType: 'Music',
    isTrial: false,
    autoRenew: true
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubForm.name || !newSubForm.price || !newSubForm.billDate) return;
    
    const iconConfig = dynamicIcons[newSubForm.iconType as keyof typeof dynamicIcons] || dynamicIcons.Sub;
    const numericPrice = parseInt(newSubForm.price.replace(/\D/g, '')) || 0;
    
    const newSubscription = {
      id: Date.now(),
      name: newSubForm.name,
      iconType: newSubForm.iconType,
      price: newSubForm.price,
      priceNumeric: numericPrice,
      billDate: newSubForm.billDate,
      nextBilling: 'Segera',
      isTrial: newSubForm.isTrial,
      autoRenew: newSubForm.autoRenew
    };
    
    setSubs([...subs, newSubscription]);
    setIsAddModalOpen(false);
    setNewSubForm({ name: '', price: '', billDate: '', iconType: 'Music', isTrial: false, autoRenew: true });
  };

  const handleDelete = () => {
    if (deleteTarget !== null) {
      setSubs(subs.filter(s => s.id !== deleteTarget));
      setDeleteTarget(null);
    }
  };

  if (view === 'landing') {
    return <LandingPage onEnterPrototype={navigateToPrototype} />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 font-sans selection:bg-blue-500/30 pb-32 relative overflow-hidden">
      
      {/* Interactive Background (Liquid Waves & Interactive Fluid) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#09090b]">
        {/* Parallax Dot Pattern */}
        <motion.div
           animate={{
            x: (mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 1000) / 2) * -0.015,
            y: (mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 800) / 2) * -0.015
           }}
           transition={{ type: "spring", damping: 100, stiffness: 200, mass: 1 }}
           className="absolute -inset-[20%] bg-dot-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
        />

        {/* Ambient Deep Bottom Glow (Anchoring Colors) */}
        <div className="absolute bottom-0 left-[-10%] right-[-10%] h-[35vh] bg-gradient-to-t from-blue-600/10 via-indigo-600/5 to-transparent blur-[80px] sm:blur-[120px] rounded-[100%] opacity-80 pointer-events-none" />

        {/* Interactive Glowing Fluid Cursor/Touch Light */}
        <motion.div
          animate={{
            x: mousePosition.x - 175,
            y: mousePosition.y - 175,
          }}
          transition={{ type: "spring", damping: 80, stiffness: 120, mass: 1 }}
          className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-purple-500/15 blur-[60px] sm:blur-[80px] opacity-70 pointer-events-none md:opacity-45"
        />

        {/* Liquid Waves */}
        <motion.div 
          animate={{ 
            x: ((mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 1000) / 2) * -0.15),
            y: [0, -25, 0],
            rotate: ((mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 1000) / 2) * 0.01)
          }}
          transition={{ 
            x: { type: "spring", stiffness: 60, damping: 30 },
            rotate: { type: "spring", stiffness: 60, damping: 30 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-[-1%] sm:bottom-[-10%] left-[-20%] right-[-20%] w-[140%] h-[20vh] sm:h-[30vh] opacity-[0.16] sm:opacity-[0.08] text-blue-500 origin-bottom"
        >
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0,160L48,149.3C96,139,192,117,288,122.7C384,128,480,160,576,144C672,128,768,64,864,69.3C960,75,1056,149,1152,186.7C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="currentColor"></path>
          </svg>
        </motion.div>

        <motion.div 
          animate={{ 
            x: ((mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 1000) / 2) * 0.1),
            y: [0, 30, 0],
            rotate: ((mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 1000) / 2) * -0.008)
          }}
          transition={{ 
            x: { type: "spring", stiffness: 50, damping: 40 },
            rotate: { type: "spring", stiffness: 50, damping: 40 },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }
          }}
          className="absolute bottom-[-1%] sm:bottom-[-10%] left-[-15%] right-[-15%] w-[130%] h-[24vh] sm:h-[35vh] opacity-[0.14] sm:opacity-[0.08] text-indigo-500 origin-bottom"
        >
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0,224L48,208C96,192,192,160,288,160C384,160,480,192,576,213.3C672,235,768,245,864,229.3C960,213,1056,171,1152,170.7C1248,171,1344,213,1392,234.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="currentColor"></path>
          </svg>
        </motion.div>

        <motion.div 
          animate={{ 
            x: ((mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 1000) / 2) * -0.08),
            y: [0, -15, 0],
            scaleX: [1, 1.05, 1],
          }}
          transition={{ 
            x: { type: "spring", stiffness: 40, damping: 50 },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 },
            scaleX: { duration: 9, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-[-1%] sm:bottom-[-5%] left-[-25%] w-[150%] h-[28vh] sm:h-[40vh] opacity-[0.12] sm:opacity-[0.07] text-purple-500"
        >
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="currentColor"></path>
          </svg>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-10 relative z-10">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center border-b border-white/5 pb-4 sm:pb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              SubScript <span className="text-gray-500 font-normal ml-1">v1.2</span>
            </h1>
          </div>
          <button 
            onClick={navigateToLanding}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer animate-fade-in"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Landing Page</span>
          </button>
        </motion.header>        {/* Top Summary Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 sm:p-6 rounded-xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm sm:col-span-2 flex flex-col justify-between min-w-0"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10">
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Pengeluaran Aktif</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-mono font-bold text-white tracking-tight">{formatRupiah(Math.round(totalPengeluaran * (chartPeriod === 'yearly' ? 12 : chartPeriod === 'weekly' ? 12 / 52 : 1)))}</h3>
              </div>
              <div className="flex flex-row flex-wrap items-center sm:items-end gap-2">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                  <button onClick={() => setChartMode('top')} className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${chartMode === 'top' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Top 4</button>
                  <button onClick={() => setChartMode('category')} className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${chartMode === 'category' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Kategori</button>
                </div>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                  <button onClick={() => setChartPeriod('weekly')} className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${chartPeriod === 'weekly' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Mingguan</button>
                  <button onClick={() => setChartPeriod('monthly')} className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${chartPeriod === 'monthly' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Bulanan</button>
                  <button onClick={() => setChartPeriod('yearly')} className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${chartPeriod === 'yearly' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Tahunan</button>
                </div>
              </div>
            </div>
            
            <div className="h-[120px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(val) => `Rp${val/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#121214', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: number) => [formatRupiah(value), 'Biaya']}
                  />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-3.5 sm:p-6 rounded-xl sm:rounded-3xl border border-yellow-500/20 bg-yellow-500/[0.02] backdrop-blur-sm flex flex-col justify-between min-w-0 sm:col-span-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-xs font-mono text-yellow-500/50">TRIAL RISK</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Potensi Tagihan Trial</p>
              <h3 className="text-xl sm:text-2xl font-mono font-bold text-yellow-400 mb-2">{formatRupiah(potentialTrialCharges)}</h3>
            </div>
            <div className="mt-4 p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
              <p className="text-xs text-yellow-500/80 font-medium flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Dibatalkan sebelum tenggat untuk menghindari tagihan.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:col-span-2 lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm flex-1 flex flex-col justify-center"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Layanan Aktif</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl sm:text-3xl font-mono font-bold text-white">{subs.length}</h3>
                    <span className="text-sm font-sans font-medium text-gray-500">Total</span>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-3xl border border-blue-500/20 bg-blue-500/[0.04] backdrop-blur-sm shadow-xl shadow-blue-500/5 flex-1 flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
              <div className="flex flex-col relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarClock className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Tagihan Terdekat</span>
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-white line-clamp-1 truncate">{subs[0]?.name || 'Tidak ada'}</h3>
                <p className="text-[10px] sm:text-sm text-blue-300 font-mono mt-0.5 sm:mt-1 font-medium">{subs[0]?.nextBilling || '-'}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Subscription Table */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Kelola Layanan</h2>
              <p className="text-sm text-gray-500 mt-1">Daftar semua langganan yang sedang aktif bulan ini.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari layanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all focus:bg-white/10"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {selectedSubs.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between sm:justify-start gap-2 bg-white/5 border border-white/10 p-1 rounded-xl w-full sm:w-auto"
                  >
                    <button 
                      onClick={handleBulkMarkPaid}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 hover:bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <CheckSquare className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 shrink-0" />
                    <button 
                      onClick={() => setBulkDeleteConfirm(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 hover:bg-red-500/10 text-red-500 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-gray-200 active:scale-95 transition-all rounded-xl text-sm font-bold shadow-lg w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" /> Tambah Layanan
                  </button>
                )}
              </div>
          </div>
        </div>

        {filteredSubs.length === 0 ? (
          <div className="border border-white/5 rounded-2xl bg-white/[0.01] p-12 text-center text-gray-500">
            <Layers className="w-10 h-10 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">Belum ada data tersedia.</p>
            <button onClick={() => setIsAddModalOpen(true)} className="text-blue-500 mt-2 text-sm hover:underline">Tambah langganan pertama Anda</button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block border border-white/5 rounded-2xl bg-white/[0.01] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-4 w-12">
                        <button 
                          onClick={toggleAllSelection}
                          className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${selectedSubs.length === subs.length && subs.length > 0 ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-white/20'}`}
                        >
                          {selectedSubs.length === subs.length && subs.length > 0 && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Layanan</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Harga</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">Tagihan</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:table-cell">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {filteredSubs.map((sub) => {
                        const currentIconConfig = dynamicIcons[sub.iconType] || dynamicIcons.Sub;
                        const IconComponent = currentIconConfig.icon;
                        return (
                        <motion.tr 
                          key={sub.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -10 }}
                          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                          className={`group transition-colors ${selectedSubs.includes(sub.id) ? 'bg-blue-500/[0.03]' : ''}`}
                        >
                          <td className="p-4">
                            <button 
                              onClick={() => toggleSelection(sub.id)}
                              className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${selectedSubs.includes(sub.id) ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-white/10 group-hover:border-white/30'}`}
                            >
                              {selectedSubs.includes(sub.id) && <Check className="w-3 h-3 text-white" />}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-4 py-1">
                              <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:bg-white/10 group-hover:border-white/20 overflow-hidden"
                              >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.15] transition-opacity duration-300" style={currentIconConfig.hex ? { backgroundColor: currentIconConfig.hex } : {}} />
                                {IconComponent && <IconComponent className="w-5 h-5 text-gray-300 transition-colors relative z-10" style={currentIconConfig.hex ? { color: currentIconConfig.hex } : {}} />}
                              </motion.div>
                              <div className="flex flex-col justify-center">
                                <span className="font-semibold text-gray-200 group-hover:text-white transition-colors leading-none">{sub.name}</span>
                                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out">
                                  <div className="overflow-hidden opacity-0 group-hover:opacity-100 min-h-0">
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                      <CalendarClock className="w-3 h-3 text-blue-400" />
                                      <span className="text-xs text-blue-400 font-medium">{sub.nextBilling}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-sm text-gray-100 group-hover:text-blue-300 transition-colors font-medium">{sub.price}</span>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <span className="text-sm text-gray-400 font-mono group-hover:text-gray-300 transition-colors">{formatDateDisplay(sub.billDate)}</span>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            <div className="flex flex-col gap-1 items-start">
                              {sub.isTrial ? (
                                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] uppercase font-bold rounded border border-yellow-500/20">
                                  Masa Trial
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] uppercase font-bold rounded border border-green-500/20">
                                  Aktif
                                </span>
                              )}
                              {sub.autoRenew ? (
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold rounded border border-blue-500/20 flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> Auto
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-500/10 text-gray-400 text-[10px] uppercase font-bold rounded border border-gray-500/20 flex items-center gap-1">
                                  <CircleDashed className="w-3 h-3" /> Manual
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditClick(sub)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setDeleteTarget(sub.id)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Selection All Toggle Bar */}
            <div className="flex sm:hidden items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-xs">
              <button 
                onClick={toggleAllSelection}
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${selectedSubs.length === subs.length && subs.length > 0 ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-white/20'}`}>
                  {selectedSubs.length === subs.length && subs.length > 0 && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className="font-medium text-gray-300">Pilih Semua ({filteredSubs.length})</span>
              </button>
              
              {selectedSubs.length > 0 && (
                <span className="text-blue-400 font-semibold">{selectedSubs.length} Terpilih</span>
              )}
            </div>

            {/* Mobile Card-Based List View */}
            <div className="block sm:hidden space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredSubs.map((sub) => {
                  const currentIconConfig = dynamicIcons[sub.iconType] || dynamicIcons.Sub;
                  const IconComponent = currentIconConfig.icon;
                  const isSelected = selectedSubs.includes(sub.id);
                  
                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'bg-blue-500/[0.04] border-blue-400/30 shadow-lg shadow-blue-500/5' 
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      } flex flex-col gap-4`}
                    >
                      {/* Top Row: App Icon + Name + Billing / Cost */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Selection Checkbox */}
                          <button 
                            onClick={() => toggleSelection(sub.id)}
                            className={`w-6 h-6 rounded-lg border transition-colors flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white/5 border-white/10'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                          
                          {/* Category styled Icon */}
                          <div className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.15]" style={currentIconConfig.hex ? { backgroundColor: currentIconConfig.hex } : {}} />
                            {IconComponent && <IconComponent className="w-5 h-5 relative z-10" style={currentIconConfig.hex ? { color: currentIconConfig.hex } : {}} />}
                          </div>
                          
                          {/* Name and Next Billing Date */}
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-gray-200 truncate leading-tight">{sub.name}</span>
                            <span className="text-xs text-blue-400 font-medium font-mono mt-0.5">{sub.nextBilling}</span>
                          </div>
                        </div>

                        {/* Price tag with Date */}
                        <div className="text-right shrink-0">
                          <span className="font-mono text-sm font-bold text-white block">{sub.price}</span>
                          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{formatDateDisplay(sub.billDate)}</span>
                        </div>
                      </div>

                      {/* Bottom Row: Status Badges and Direct Touch Actions */}
                      <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                        {/* Badges container */}
                        <div className="flex flex-wrap gap-1.5">
                          {sub.isTrial ? (
                            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[9px] uppercase font-bold rounded border border-yellow-500/20">
                              Trial
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[9px] uppercase font-bold rounded border border-green-500/20">
                              Aktif
                            </span>
                          )}
                          {sub.autoRenew ? (
                            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] uppercase font-bold rounded border border-blue-500/20 flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Auto
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-gray-500/10 text-gray-400 text-[9px] uppercase font-bold rounded border border-gray-500/20 flex items-center gap-1">
                              <CircleDashed className="w-3 h-3" /> Manual
                            </span>
                          )}
                        </div>

                        {/* Always-visible Touch Actions on mobile */}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditClick(sub)}
                            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors border border-white/5 flex items-center justify-center h-8 w-8"
                            aria-label="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setDeleteTarget(sub.id)}
                            className="p-2 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors border border-red-500/10 flex items-center justify-center h-8 w-8"
                            aria-label="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </section>

      </div>

      {/* Sleek Modal Overlay */}
      <AnimatePresence>
        {(deleteTarget !== null || bulkDeleteConfirm || isAddModalOpen || editTarget !== null) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Hapus Langganan?</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Tindakan ini tidak dapat dibatalkan. <span className="text-white font-semibold">{subs.find(s => s.id === deleteTarget)?.name}</span> akan dihapus permanen.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button 
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors border border-white/5"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirm */}
      <AnimatePresence>
        {bulkDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Hapus {selectedSubs.length} Items?</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Anda yakin ingin menghapus masal data yang dipilih?
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button 
                  onClick={() => setBulkDeleteConfirm(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors border border-white/5"
                >
                  Batal
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Hapus Masal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal Content */}
      <AnimatePresence>
        {(isAddModalOpen || editTarget !== null) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[calc(100%-2rem)] max-w-lg"
          >
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden max-h-[85vh] overflow-y-auto scrollbar-thin">
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-xl font-bold text-white">{editTarget !== null ? 'Edit Subscription' : 'New Subscription'}</h3>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">LENGKAPI INFORMASI BERIKUT</p>
                 </div>
                 <button 
                  onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}
                  className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <form onSubmit={editTarget !== null ? handleEditSubmit : handleAddSubmit} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[2px]">NAMA LAYANAN</label>
                   <input 
                    type="text" 
                    required
                    value={editTarget !== null ? editSubForm.name : newSubForm.name}
                    onChange={(e) => editTarget !== null ? setEditSubForm({...editSubForm, name: e.target.value}) : setNewSubForm({...newSubForm, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all font-semibold"
                    placeholder="Spotify, Netflix, etc..."
                   />
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[2px]">BIAYA</label>
                     <input 
                      type="text" 
                      required
                      value={editTarget !== null ? editSubForm.price : newSubForm.price}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const numericValue = rawValue.replace(/\D/g, '');
                        const formatted = numericValue ? `Rp ${parseInt(numericValue).toLocaleString('id-ID')}` : '';
                        if (editTarget !== null) {
                          setEditSubForm({...editSubForm, price: formatted});
                        } else {
                          setNewSubForm({...newSubForm, price: formatted});
                        }
                      }}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                      placeholder="Rp 25.000"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[2px]">NEXT BILLING</label>
                     <input 
                      type="date" 
                      required
                      value={editTarget !== null ? editSubForm.billDate : newSubForm.billDate}
                      onChange={(e) => editTarget !== null ? setEditSubForm({...editSubForm, billDate: e.target.value}) : setNewSubForm({...newSubForm, billDate: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono [color-scheme:dark]"
                     />
                   </div>
                 </div>

                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[2px]">PILIH KATEGORI IKON</label>
                   <div className="flex gap-4 flex-wrap">
                    {Object.entries(dynamicIcons).map(([key, config]: [string, any]) => {
                      const IconComponent = config.icon;
                      const active = (editTarget !== null ? editSubForm.iconType : newSubForm.iconType) === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => editTarget !== null ? setEditSubForm({...editSubForm, iconType: key}) : setNewSubForm({...newSubForm, iconType: key})}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border ${
                            active 
                              ? 'text-white shadow-lg'
                              : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-400'
                          }`}
                          style={active && config.hex ? { backgroundColor: config.hex, borderColor: config.hex, boxShadow: `0 4px 14px 0 ${config.hex}40` } : (active ? { backgroundColor: '#2563eb', borderColor: '#3b82f6' } : {})}
                        >
                          <IconComponent className="w-5 h-5" />
                        </button>
                      );
                    })}
                    {isAddingCategory ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const newCat = newCategoryName.trim();
                              if (newCat) {
                                const updatedIcons = {
                                  ...dynamicIcons,
                                  [newCat]: { icon: Layers, color: `text-[${newCategoryColor}]`, bg: `bg-[${newCategoryColor}]/20`, hex: newCategoryColor }
                                };
                                setDynamicIcons(updatedIcons);
                                if (editTarget !== null) setEditSubForm({...editSubForm, iconType: newCat});
                                else setNewSubForm({...newSubForm, iconType: newCat});
                                setIsAddingCategory(false);
                                setNewCategoryName('');
                              }
                            } else if (e.key === 'Escape') {
                              setIsAddingCategory(false);
                              setNewCategoryName('');
                            }
                          }}
                          className="w-32 bg-white/10 border border-blue-500 rounded-xl px-3 py-2 text-white focus:outline-none text-sm placeholder-gray-400 border-dashed"
                          placeholder="Nama Kategori..."
                        />
                        <input 
                          type="color" 
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="w-10 h-10 p-0 border-0 rounded-xl cursor-pointer bg-transparent"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const newCat = newCategoryName.trim();
                            if (newCat) {
                              const updatedIcons = {
                                ...dynamicIcons,
                                [newCat]: { icon: Layers, color: `text-[${newCategoryColor}]`, bg: `bg-[${newCategoryColor}]/20`, hex: newCategoryColor }
                              };
                              setDynamicIcons(updatedIcons);
                              if (editTarget !== null) setEditSubForm({...editSubForm, iconType: newCat});
                              else setNewSubForm({...newSubForm, iconType: newCat});
                              setIsAddingCategory(false);
                              setNewCategoryName('');
                            }
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setNewCategoryName('');
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                     ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(true)}
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all border bg-white/5 border-white/5 border-dashed hover:border-white/20 hover:bg-white/10"
                      >
                        <Plus className="w-5 h-5 text-gray-400" />
                      </button>
                     )}
                   </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
                   <label className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                     <div className="flex items-center gap-2">
                       <Zap className={`w-4 h-4 ${((editTarget !== null ? editSubForm.isTrial : newSubForm.isTrial)) ? 'text-yellow-400' : 'text-gray-500'}`} />
                       <span className="text-xs font-bold text-white">Masa Trial?</span>
                     </div>
                     <button
                       type="button"
                       onClick={() => editTarget !== null ? setEditSubForm({...editSubForm, isTrial: !editSubForm.isTrial}) : setNewSubForm({...newSubForm, isTrial: !newSubForm.isTrial})}
                       className="text-gray-400"
                     >
                       {((editTarget !== null ? editSubForm.isTrial : newSubForm.isTrial)) ? <ToggleRight className="w-8 h-8 text-blue-500" /> : <ToggleLeft className="w-8 h-8" />}
                     </button>
                   </label>
                   <label className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                     <div className="flex items-center gap-2">
                       <CircleDashed className={`w-4 h-4 ${((editTarget !== null ? editSubForm.autoRenew : newSubForm.autoRenew)) ? 'text-blue-400' : 'text-gray-500'}`} />
                       <span className="text-xs font-bold text-white">Auto Renew</span>
                     </div>
                     <button
                       type="button"
                       onClick={() => editTarget !== null ? setEditSubForm({...editSubForm, autoRenew: !editSubForm.autoRenew}) : setNewSubForm({...newSubForm, autoRenew: !newSubForm.autoRenew})}
                       className="text-gray-400"
                     >
                       {((editTarget !== null ? editSubForm.autoRenew : newSubForm.autoRenew)) ? <ToggleRight className="w-8 h-8 text-blue-500" /> : <ToggleLeft className="w-8 h-8" />}
                     </button>
                   </label>
                 </div>

                 <button 
                  type="submit"
                  className="w-full py-4 bg-white text-black text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all mt-4"
                 >
                   {editTarget !== null ? 'Update Subscription' : 'Create Subscription'}
                 </button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
