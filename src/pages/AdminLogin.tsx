import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaUser, FaKey, FaShieldAlt, FaEye, FaEyeSlash, FaFingerprint } from 'react-icons/fa';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connectionKey, setConnectionKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, connection_key: connectionKey }),
      });

      if (!response.ok) throw new Error('⛔ بيانات دخول غير مصرح بها');
      const data = await response.json();
      sessionStorage.setItem('admin_token', data.access_token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'حدثت فجوة أمنية في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
             <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7fffd4]/5 blur-[150px] rounded-full animate-pulse" />
             <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full" />
        </div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[500px] relative z-10"
        >
            {/* Shield Logo */}
            <div className="text-center mb-12">
                <motion.div 
                    initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} transition={{ duration: 1, type: 'spring' }}
                    className="inline-flex items-center justify-center w-28 h-28 rounded-3xl glass-panel border-[#7fffd4]/20 shadow-[0_0_50px_rgba(127,255,212,0.15)] mb-8"
                >
                    <FaShieldAlt className="text-5xl text-[#7fffd4]" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black heading-premium italic tracking-tighter text-white mb-4">
                    بوابة <span className="opacity-30">|</span> الآمنين
                </h1>
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] italic">نظام الوصول المشفر فائق السرية</p>
            </div>

            {/* Login Glass Panel */}
            <div className="glass-panel p-10 md:p-14 rounded-[4rem] border-white/5 shadow-huge relative group">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#7fffd4]/20 to-transparent" />
                
                <form onSubmit={handleLogin} className="space-y-10" autoComplete="off">
                    <div className="space-y-6">
                        {/* Field: Username */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-4">المعرف الإداري</label>
                            <div className="relative group/field">
                                <FaUser className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#7fffd4] transition-colors" />
                                <input 
                                    type="text" value={username} onChange={e => setUsername(e.target.value)} required
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-14 py-5 text-white font-bold outline-none focus:border-[#7fffd4]/40 focus:bg-white/[0.08] transition-all text-right"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {/* Field: Password */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-4">شفرة المرور</label>
                            <div className="relative group/field">
                                <FaLock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#7fffd4] transition-colors" />
                                <input 
                                    type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-14 py-5 text-white font-bold outline-none focus:border-[#7fffd4]/40 focus:bg-white/[0.08] transition-all text-right"
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Field: Connection Key */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-4">مفتاح الحماية الرباعي</label>
                            <div className="relative group/field">
                                <FaKey className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#7fffd4] transition-colors" />
                                <input 
                                    type={showKey ? "text" : "password"} value={connectionKey} onChange={e => setConnectionKey(e.target.value)} required
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-14 py-5 text-white font-bold outline-none focus:border-[#7fffd4]/40 focus:bg-white/[0.08] transition-all text-right"
                                    autoComplete="off"
                                />
                                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                                    {showKey ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-red-400/10 border border-red-400/20 text-red-500 text-center text-xs font-black italic">
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                        disabled={loading}
                        className="w-full bg-[#7fffd4] text-[#05070a] font-black py-6 rounded-3xl flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(127,255,212,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                             <div className="w-5 h-5 border-4 border-[#05070a]/20 border-t-[#05070a] rounded-full animate-spin" />
                        ) : <FaFingerprint className="text-xl" />}
                        {loading ? 'جاري المصادقة...' : 'تأكيد الهوية والولوج'}
                    </button>
                </form>

                <div className="mt-12 pt-10 border-t border-white/5 flex flex-col items-center gap-4 opacity-30 grayscale hover:opacity-100 transition-opacity">
                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-center leading-loose">
                        بروتوكول تشفير فائق الأمان<br />
                        SHA-512 + AES-256 + RSA-4096
                     </p>
                </div>
            </div>

            <div className="text-center mt-12">
                <button onClick={() => navigate('/')} className="text-slate-600 hover:text-[#7fffd4] font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-3 mx-auto">
                    ← إلغاء العملية والعودة للمنصة
                </button>
            </div>
        </motion.div>
    </div>
  );
};

export default AdminLogin;
