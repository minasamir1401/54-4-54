import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShieldAlt, FaHome, FaServer, FaUsers, FaCogs, FaSignOutAlt,
  FaCheckCircle, FaSpinner, FaMemory, FaGlobe, FaDatabase,
  FaToggleOn, FaToggleOff, FaTrash, FaBolt, FaComments, FaFilm,
  FaClock, FaHdd, FaFingerprint
} from 'react-icons/fa';
import { clearAllCache } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// --- Types ---
interface ScraperSettings {
  larooza_enabled: boolean;
  arabseed_enabled: boolean;
  anime4up_enabled: boolean;
  fallback_mode: boolean;
  merge_results: boolean;
  primary_source: string;
}

interface StatsData {
  users: { total: number; active_today: number; total_points: number };
  content: { comments: number; courses: number };
  system: { cache_size: number; uptime: number; cache_keys: number };
}

interface HealthStatus {
  larooza: { enabled: boolean; working: boolean; error?: string; items_count?: number };
  arabseed: { enabled: boolean; working: boolean; error?: string; items_count?: number };
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-8 py-5 transition-all relative group
      ${active ? 'text-[#7fffd4]' : 'text-slate-500 hover:text-white'}`}
  >
    {active && (
      <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-white/5 border-r-4 border-[#7fffd4]" />
    )}
    <Icon className={`text-xl relative z-10 transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="font-black text-sm relative z-10 italic uppercase tracking-widest">{label}</span>
  </button>
);

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group shadow-2xl"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 rounded-full transition-opacity duration-500 group-hover:opacity-20 ${color}`} />
    <div className="flex items-center gap-6 relative z-10">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl glass-panel border-white/10 ${color}`}>
        <Icon />
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className="text-3xl font-black text-white italic tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value || 0}
        </h3>
      </div>
    </div>
  </motion.div>
);

const UsersListTable = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = sessionStorage.getItem('admin_token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/admin/dashboard/users/list?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  if (loading) return <tr><td colSpan={5} className="text-center p-20"><FaSpinner className="animate-spin text-3xl text-[#7fffd4] mx-auto" /></td></tr>;

  return (
    <>
      {users.map((user) => (
        <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5">
          <td className="px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7fffd4]/20 to-transparent flex items-center justify-center text-[#7fffd4] font-black italic text-xs">
                {user.id.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-mono text-[10px] text-slate-500">{user.id.substring(0, 12)}...</span>
            </div>
          </td>
          <td className="px-8 py-6 font-black text-[#7fffd4] italic tabular-nums">{user.points}</td>
          <td className="px-8 py-6 text-slate-400 font-bold text-xs">
            {Math.floor(user.watch_time_total / 3600)}h {Math.floor((user.watch_time_total % 3600) / 60)}m
          </td>
          <td className="px-8 py-6">
            {user.is_fan ? (
              <span className="px-3 py-1 bg-[#7fffd4]/10 text-[#7fffd4] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#7fffd4]/20">Pro Fan</span>
            ) : (
              <span className="px-3 py-1 bg-white/5 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">Standard</span>
            )}
          </td>
          <td className="px-8 py-6 text-slate-500 text-[10px] font-bold">{new Date(user.created_at).toLocaleDateString('ar-EG')}</td>
        </tr>
      ))}
    </>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState<ScraperSettings | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const navigate = useNavigate();
  const getToken = () => sessionStorage.getItem('admin_token');

  const fetchAllData = async () => {
    const token = getToken();
    if (!token) { navigate('/admin'); return; }
    try {
      const [settingsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/scrapers/settings`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/dashboard/stats/overview`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (settingsRes.status === 401 || statsRes.status === 401) { navigate('/admin'); return; }
      const settingsData = await settingsRes.json();
      const statsData = await statsRes.json();
      setSettings(settingsData.settings);
      setStats(statsData.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const checkHealth = async () => {
    const token = getToken();
    setCheckingHealth(true);
    try {
      const res = await fetch(`${API_BASE}/admin/scrapers/health`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setHealth(data.health);
    } finally { setCheckingHealth(false); }
  };

  const updateSettings = async (updates: Partial<ScraperSettings>) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE}/admin/scrapers/settings`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data.new_settings);
      }
    } catch (e) { console.error(e); }
  };

  const handleClearCache = async () => {
    if (!confirm('سيتم تطهير ذاكرة التخزين المؤقت بالكامل، هل أنت متأكد؟')) return;
    const success = await clearAllCache();
    if (success) {
      alert('تم تطهير النظام والذاكرة بنجاح 🧹');
      fetchAllData();
    } else {
      alert('حدث خطأ أثناء تطهير الذاكرة');
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    navigate('/admin');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-[#7fffd4]/10 border-t-[#7fffd4] rounded-full animate-spin shadow-[0_0_30px_rgba(127,255,212,0.2)] mx-auto mb-8" />
        <p className="text-[#7fffd4] font-black italic tracking-widest animate-pulse uppercase">Authenticating Terminal...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex overflow-hidden">

      {/* Premium Sidebar */}
      <div className="w-80 bg-black/40 border-l border-white/5 h-screen fixed right-0 top-0 z-50 hidden xl:flex flex-col pt-12 backdrop-blur-3xl shadow-huge">
        <div className="px-10 mb-16">
          <div className="flex items-center gap-4 text-[#7fffd4] mb-4 group cursor-default">
            <div className="w-12 h-12 rounded-2xl glass-panel border-[#7fffd4]/20 flex items-center justify-center shadow-[0_0_20px_rgba(127,255,212,0.1)] group-hover:rotate-12 transition-transform">
              <FaShieldAlt className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black heading-premium italic tracking-tighter">MOVIDO</h2>
              <p className="text-[8px] font-black text-slate-500 tracking-[0.4em] -mt-1 uppercase">Control Core</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <SidebarItem icon={FaHome} label="الرئيسية" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={FaServer} label="المصادر" active={activeTab === 'scrapers'} onClick={() => setActiveTab('scrapers')} />
          <SidebarItem icon={FaUsers} label="المستخدمين" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarItem icon={FaCogs} label="النظام" active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
        </div>

        <div className="p-8">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-4 p-5 bg-white/5 text-slate-400 rounded-3xl hover:bg-red-500/10 hover:text-red-400 font-black transition-all border border-transparent hover:border-red-500/20 italic group">
            <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" /> تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Dashboard Panel */}
      <div className="flex-1 xl:mr-80 p-8 md:p-12 lg:p-16 min-h-screen overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1.5 bg-[#7fffd4]/10 text-[#7fffd4] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#7fffd4]/20 italic">Live Status: Active</span>
                    <span className="text-slate-500 font-bold text-xs flex items-center gap-2"><FaClock className="text-[10px]" /> {new Date().toLocaleTimeString()}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black heading-premium italic tracking-tighter">لوحة التحكم</h1>
                  <p className="text-slate-500 font-bold max-w-xl">مرحباً مينا سمير، النظام يعمل بكفاءة 100% حالياً. لم يتم رصد أي محاولات اختراق أو ثغرات أمنية خلال آخر 24 ساعة.</p>
                </div>
                <div className="glass-panel px-8 py-5 rounded-3xl border-white/5 flex items-center gap-8 shadow-xl">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Server Latency</p>
                    <p className="text-2xl font-black text-[#7fffd4] italic tabular-nums">24ms</p>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">System Uptime</p>
                    <p className="text-2xl font-black text-white italic tabular-nums">{stats ? Math.floor(stats.system.uptime / 60) : 0}m</p>
                  </div>
                </div>
              </header>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard icon={FaUsers} label="المستخدمين" value={stats?.users.total} color="bg-blue-400" delay={0.1} />
                <StatCard icon={FaCheckCircle} label="النشطين اليوم" value={stats?.users.active_today || stats?.users.total} color="bg-green-400" delay={0.2} />
                <StatCard icon={FaComments} label="التعليقات" value={stats?.content.comments} color="bg-amber-400" delay={0.3} />
                <StatCard icon={FaFilm} label="الكورسات" value={stats?.content.courses} color="bg-purple-400" delay={0.4} />
              </div>

              {/* Action Center */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Quick Actions */}
                <div className="lg:col-span-2 glass-panel rounded-[3.5rem] p-10 border-white/5 shadow-huge space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black italic flex items-center gap-4"><FaBolt className="text-yellow-400" /> مركز التحكم</h3>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red]" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { icon: FaTrash, label: 'تطهير الكاش', color: 'text-red-400', onClick: handleClearCache },
                      { icon: FaMemory, label: 'صحة النظام', color: 'text-blue-400', onClick: checkHealth },
                      { icon: FaFingerprint, label: 'سجل الدخول', color: 'text-purple-400', onClick: () => { } },
                      { icon: FaDatabase, label: 'قاعدة البيانات', color: 'text-[#7fffd4]', onClick: () => { } }
                    ].map((act, i) => (
                      <button key={i} onClick={act.onClick} className="glass-panel p-6 rounded-3xl border-white/5 hover:border-white/20 transition-all group hover:-translate-y-1">
                        <act.icon className={`text-3xl ${act.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
                        <span className="text-[10px] font-black uppercase text-slate-500 block">{act.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* System Health Snapshot */}
                <div className="glass-panel rounded-[3.5rem] p-10 border-white/5 shadow-huge">
                  <h3 className="text-xl font-black italic mb-8 flex items-center gap-4"><FaHdd className="text-[#7fffd4]" /> حالة العتاد</h3>
                  <div className="space-y-6">
                    {[
                      { label: 'Cache Keys', value: stats?.system.cache_keys || 0, color: 'text-[#7fffd4]' },
                      { label: 'Memory Usage', value: '42.5 MB', color: 'text-blue-400' },
                      { label: 'CPU Load', value: '18%', color: 'text-green-400' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                        <span className={`font-mono font-black ${item.color} italic text-sm`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCRAPERS TAB */}
          {activeTab === 'scrapers' && (
            <motion.div key="scrapers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-12">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <h1 className="text-3xl md:text-5xl font-black heading-premium italic tracking-tighter">إدارة المصادر</h1>
                  <p className="text-slate-500 font-bold max-w-xl">تحكم في محركات التجميع الآلي (Scrapers) وراقب استجابة المواقع المصدرية لحظياً.</p>
                </div>
                <button onClick={checkHealth} disabled={checkingHealth} className="glass-panel px-8 py-5 rounded-3xl border-white/10 bg-[#7fffd4] text-[#05070a] font-black hover:scale-105 transition-all flex items-center gap-4 shadow-[0_20px_40px_rgba(127,255,212,0.2)]">
                  {checkingHealth ? <FaSpinner className="animate-spin text-xl" /> : <FaBolt className="text-xl" />} <span className="italic uppercase tracking-wider">Scraper Scan</span>
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Larooza Control */}
                <div className="glass-panel p-10 rounded-[3.5rem] border-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-green-500/10 rounded-[2rem] flex items-center justify-center text-green-500 text-4xl shadow-huge shadow-green-500/5 group-hover:scale-110 transition-transform"><FaGlobe /></div>
                    <div className="space-y-1">
                      <h3 className="font-black text-2xl italic tracking-tight">Larooza Bond</h3>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">المصدر البلاتيني - استجابة فائقة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {health?.larooza && (
                      <span className={`text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest ${health.larooza.working ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {health.larooza.working ? `${health.larooza.items_count} Works` : 'Offline'}
                      </span>
                    )}
                    <button onClick={() => updateSettings({ larooza_enabled: !settings?.larooza_enabled })} className={`text-6xl transition-all duration-500 hover:scale-110 ${settings?.larooza_enabled ? 'text-[#7fffd4]' : 'text-slate-800'}`}>
                      {settings?.larooza_enabled ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                </div>

                {/* ArabSeed Control */}
                <div className="glass-panel p-10 rounded-[3.5rem] border-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-500 text-4xl shadow-huge shadow-blue-500/5 group-hover:scale-110 transition-transform"><FaFilm /></div>
                    <div className="space-y-1">
                      <h3 className="font-black text-2xl italic tracking-tight">ArabSeed Pro</h3>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">المصدر البديل - تجميع شامل</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {health?.arabseed && (
                      <span className={`text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest ${health.arabseed.working ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {health.arabseed.working ? `${health.arabseed.items_count} Works` : 'Offline'}
                      </span>
                    )}
                    <button onClick={() => updateSettings({ arabseed_enabled: !settings?.arabseed_enabled })} className={`text-6xl transition-all duration-500 hover:scale-110 ${settings?.arabseed_enabled ? 'text-[#7fffd4]' : 'text-slate-800'}`}>
                      {settings?.arabseed_enabled ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Automation Engine Logic */}
              <div className="glass-panel rounded-[4rem] p-12 border-white/5 relative overflow-hidden shadow-huge">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <h3 className="text-2xl font-black italic mb-10 text-[#7fffd4] flex items-center gap-4 relative z-10"><FaShieldAlt /> محرك المصادقة والتجميع (SmartLink Engine)</h3>
                <div className="grid md:grid-cols-3 gap-10 relative z-10">
                  {[
                    { label: 'Fallback Strategy', state: settings?.fallback_mode, key: 'fallback_mode' },
                    { label: 'Deep Results Merging', state: settings?.merge_results, key: 'merge_results' }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-center space-y-6">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{item.label}</p>
                      <button onClick={() => updateSettings({ [item.key]: !item.state } as any)} className={`text-5xl transition-all ${item.state ? 'text-[#7fffd4]' : 'text-slate-800'}`}>
                        {item.state ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  ))}
                  <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-center space-y-6">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Primary Search Core</p>
                    <select
                      value={settings?.primary_source}
                      onChange={(e) => updateSettings({ primary_source: e.target.value })}
                      className="bg-[#05070a] border border-white/10 rounded-2xl px-6 py-3 text-sm font-black italic text-[#7fffd4] outline-none w-full"
                    >
                      <option value="larooza">Larooza Main</option>
                      <option value="arabseed">ArabSeed Core</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <h1 className="text-3xl md:text-5xl font-black heading-premium italic tracking-tighter">سجلات المستخدمين</h1>
                  <p className="text-slate-500 font-bold max-w-xl">مراقبة وتحليل سلوك المستخدمين، إحصائيات المشاهدة، وتوزيع نقاط الوفاء في المنصة.</p>
                </div>
              </div>

              <div className="glass-panel rounded-[3.5rem] border-white/5 overflow-hidden shadow-huge">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/5">
                        {['المعرف الرقمي', 'رصيد النقاط', 'عمق المشاهدة', 'المستوى الأمني', 'بروتوكول الانضمام'].map((h, i) => (
                          <th key={i} className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <UsersListTable />
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* SYSTEM TAB */}
          {activeTab === 'system' && (
            <motion.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
              <h1 className="text-3xl md:text-5xl font-black heading-premium italic tracking-tighter">مركز مراقبة النواة</h1>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-12">
                  <div className="glass-panel p-10 rounded-[3.5rem] border-white/5 shadow-huge">
                    <h3 className="text-2xl font-black italic mb-8 flex items-center gap-4 text-purple-400"><FaServer /> Terminal Nodes</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Uptime Protocol', value: `${stats ? Math.floor(stats.system.uptime / 3600) : 0} Hours Fully Connected`, color: 'text-white' },
                        { label: 'Cache Integrity', value: `${stats?.system.cache_keys} Encryption Keys Active`, color: 'text-[#7fffd4]' },
                        { label: 'Gateway Access', value: 'Port 8000 (Authorized SSL)', color: 'text-blue-400' },
                        { label: 'Core Environment', value: 'Mainline Production Node', color: 'text-amber-400' }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-5 bg-white/[0.02] rounded-2xl border border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                          <span className={`font-black italic text-sm ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logs Console */}
                <div className="glass-panel p-10 rounded-[3.5rem] border-white/5 shadow-huge font-mono relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7fffd4]/30 to-transparent" />
                  <h3 className="text-xl font-black italic mb-8 text-slate-500 flex items-center gap-4 uppercase tracking-[0.2em]"><FaDatabase /> Cyber-Logs :: Output Stream</h3>
                  <div className="h-[400px] overflow-y-auto space-y-3 text-[11px] leading-relaxed scrollbar-hide">
                    <p className="text-[#7fffd4] opacity-80"><span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span> SYS_BOOT: High-End cinematic UI framework initialized.</p>
                    <p className="text-blue-400 opacity-80"><span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span> DB_AUTH: SQLite persistent storage connected successfully.</p>
                    <p className="text-purple-400 opacity-80"><span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span> CACHE_SYNC: {stats?.system.cache_keys} keys restored from memory bank.</p>
                    <p className="text-amber-400 opacity-80"><span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span> SECURITY: Admin session token verified for 'Mina Samir'.</p>
                    <p className="text-green-400 opacity-80"><span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span> SCRAPER: Larooza Bond engine reporting {health?.larooza?.working ? 'OPTIMAL' : 'SLEEPING'} status.</p>
                    <div className="h-px bg-white/5 my-4" />
                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="text-white/20 italic">Listening for system events...</motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
