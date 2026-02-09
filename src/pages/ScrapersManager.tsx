import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaServer, FaSyncAlt, FaToggleOn, FaToggleOff, FaArrowUp, FaArrowDown,
  FaCheckCircle, FaExclamationTriangle, FaClock, FaActivity, FaZap, FaTrash
} from 'react-icons/fa';
import axios from 'axios';

const ScrapersManager = () => {
  const [scrapers, setScrapers] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [clearing, setClearing] = useState(false);

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
  const token = sessionStorage.getItem('admin_token');

  const fetchScrapers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/scrapers/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScrapers(response.data.scrapers);
      setStats(response.data.stats);
    } catch (err) { console.error(err); }
  };

  const checkHealth = async () => {
    setChecking(true);
    try {
      await axios.post(`${API_BASE}/admin/scrapers/check-health`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchScrapers();
      alert('✅ تم فحص النواة بنجاح');
    } catch (err) { alert('❌ فشل فحص النواة'); } finally { setChecking(false); }
  };

  const clearCache = async () => {
    if (!window.confirm('هل أنت متأكد من تطهير ذاكرة النظام؟')) return;
    setClearing(true);
    try {
      await axios.post(`${API_BASE}/admin/scrapers/clear-cache`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ تم التطهير بنجاح');
      fetchScrapers();
    } catch (err) { alert('❌ فشل التطهير'); } finally { setClearing(false); }
  };

  const toggleScraper = async (scraperName: string, currentState: boolean) => {
    try {
      await axios.post(`${API_BASE}/admin/scrapers/toggle`, {
        scraper_name: scraperName,
        enabled: !currentState
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchScrapers();
    } catch (err) { alert('فشل تغيير الحالة'); }
  };

  useEffect(() => {
    fetchScrapers();
    const interval = setInterval(fetchScrapers, 30000);
    return () => clearInterval(interval);
  }, []);

  const getScraperIcon = (name: string) => {
    if (name.includes('Larooza')) return '💎';
    if (name.includes('MyCima')) return '🎬';
    if (name.includes('Anime')) return '🇯🇵';
    return '📡';
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#7fffd4]/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <span className="w-3 h-3 rounded-full bg-[#7fffd4] animate-pulse shadow-[0_0_15px_#7fffd4]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#7fffd4] italic">Scraper Core Protocol</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black heading-premium italic tracking-tighter">إدارة المصادر</h1>
                <p className="text-slate-500 font-bold max-w-2xl text-lg">تحكم كامل في محركات البحث والتجميع. يمكنك تحديد الأولوية، مراقبة الصحة، والتبديل التلقائي لمصادر المحتوى.</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
                <button 
                    onClick={clearCache} disabled={clearing}
                    className="glass-panel px-8 py-5 rounded-3xl border-white/5 bg-red-500/10 text-red-400 font-black flex items-center gap-3 hover:bg-red-500/20 transition-all"
                >
                    <FaTrash className={clearing ? 'animate-bounce' : ''} /> <span className="italic uppercase tracking-wider">{clearing ? 'Clearing...' : 'Clear Core'}</span>
                </button>
                <button 
                    onClick={checkHealth} disabled={checking}
                    className="glass-panel px-8 py-5 rounded-3xl border-white/5 bg-white/5 text-white font-black flex items-center gap-3 hover:bg-white/10 transition-all"
                >
                    <FaSyncAlt className={checking ? 'animate-spin' : ''} /> <span className="italic uppercase tracking-wider">Health Scan</span>
                </button>
                <button 
                    onClick={fetchScrapers}
                    className="glass-panel px-8 py-5 rounded-3xl border-white/5 bg-[#7fffd4] text-[#05070a] font-black flex items-center gap-3 shadow-[0_20px_40px_rgba(127,255,212,0.2)] hover:scale-105 transition-all"
                >
                    <FaZap /> <span className="italic uppercase tracking-wider">Live Refresh</span>
                </button>
            </div>
        </header>

        {/* Global Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                  { label: 'إجمالي المحركات', value: stats.total_scrapers, icon: <FaServer />, color: 'text-blue-400' },
                  { label: 'المتاحة حالياً', value: stats.online_scrapers, icon: <FaCheckCircle />, color: 'text-green-400' },
                  { label: 'معطلة / خارج الخدمة', value: stats.offline_scrapers, icon: <FaExclamationTriangle />, color: 'text-red-400' },
                  { label: 'كفاءة النطاق', value: `${stats.health_percentage.toFixed(0)}%`, icon: <FaActivity />, color: 'text-[#7fffd4]' }
              ].map((stat, i) => (
                  <motion.div 
                    key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group"
                  >
                      <div className="relative z-10">
                          <div className={`text-2xl ${stat.color} mb-3 opacity-50`}>{stat.icon}</div>
                          <h3 className="text-4xl font-black italic tracking-tight tabular-nums mb-1">{stat.value}</h3>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">{stat.label}</p>
                      </div>
                  </motion.div>
              ))}
          </div>
        )}

        {/* Scrapers Detailed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {scrapers && Object.entries(scrapers).map(([key, scraper]: [string, any], idx) => (
                <motion.div
                    key={key} 
                    initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    className="glass-panel p-10 rounded-[4rem] border-white/5 hover:border-white/10 transition-all group relative overflow-hidden shadow-huge"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.02] rounded-full -translate-y-20 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
                    
                    {/* Scraper Card Header */}
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="text-5xl drop-shadow-2xl group-hover:scale-110 transition-transform">{getScraperIcon(scraper.name)}</div>
                            <div>
                                <h3 className="text-3xl font-black italic tracking-tight group-hover:text-[#7fffd4] transition-colors">{scraper.name}</h3>
                                <p className="text-[10px] font-mono text-slate-500 tracking-wider truncate max-w-xs">{scraper.url}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleScraper(key, scraper.enabled)}
                            className={`text-6xl transition-all duration-500 hover:scale-110 ${scraper.enabled ? 'text-[#7fffd4] drop-shadow-[0_0_15px_rgba(127,255,212,0.3)]' : 'text-slate-800'}`}
                        >
                            {scraper.enabled ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-6 mb-10 relative z-10">
                        {[
                            { label: 'Priority', value: `#${scraper.priority}`, color: 'text-white' },
                            { label: 'Core Health', value: `${scraper.health_score.toFixed(0)}%`, color: scraper.health_score >= 80 ? 'text-green-400' : 'text-amber-400' },
                            { label: 'Response', value: scraper.response_time ? `${scraper.response_time.toFixed(0)}ms` : '-', color: 'text-[#7fffd4]' }
                        ].map((metric, i) => (
                            <div key={i} className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 text-center group/metric hover:bg-white/[0.05] transition-colors">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">{metric.label}</p>
                                <p className={`text-xl font-black italic tabular-nums ${metric.color}`}>{metric.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Status Footer */}
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${scraper.is_online ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-500 shadow-[0_0_10px_red]'}`} />
                            <span className={`text-[11px] font-black uppercase tracking-widest ${scraper.is_online ? 'text-green-500' : 'text-red-500'}`}>
                                {scraper.is_online ? 'Operational' : 'Node Offline'}
                            </span>
                        </div>
                        
                        {scraper.last_check && (
                            <div className="flex items-center gap-3 text-slate-600">
                                <FaClock />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Last Sync: {new Date(scraper.last_check).toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Intelligence Notice */}
        <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="glass-panel p-12 rounded-[4rem] border-[#7fffd4]/10 mt-20 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7fffd4]/20 to-transparent" />
            <h3 className="text-2xl font-black italic text-white mb-6 flex items-center gap-4">
                <FaZap className="text-[#7fffd4] animate-bounce" /> قواعد محرك التجميع الذكي
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[
                    { title: 'أولوية الاستدعاء', desc: 'يتم استدعاء السكريبر صاحب الأولوية الأعلى (#1) دائماً في البداية لضمان السرعة.' },
                    { title: 'بروتوكول الـ Fallback', desc: 'في حالة فشل المصدر الأول، يقوم النظام بالتبديل فورياً للمصدر التالي دون شعور المستخدم.' },
                    { title: 'صحة البيانات', desc: 'إذا انخفضت صحة السكريبر عن 50% يتم استبعاده تلقائياً مؤقتاً لحين استعادة استقراره.' }
                ].map((rule, i) => (
                    <div key={i} className="space-y-3">
                        <h4 className="text-sm font-black text-[#7fffd4] uppercase tracking-wider">{rule.title}</h4>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed">{rule.desc}</p>
                    </div>
                ))}
            </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ScrapersManager;
