import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaUser,
  FaBars,
  FaTimes,
  FaChild,
  FaLock,
  FaCoins,
  FaHome,
  FaFilm,
  FaTv,
  FaFutbol,
  FaGraduationCap,
  FaDownload,
  FaEllipsisH,
  FaFire,
  FaRobot,
  FaStar

} from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import { redeemPromo } from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [kidsMode, setKidsMode] = useState(localStorage.getItem('kidsMode') === 'true');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const { user, refreshStatus } = useUser();

  const openSmartLink = () => {
    window.open('https://offevasionrecruit.com/zic21a2k4s?key=b01e21cf613c7a05ddb4e54f14865584', '_blank');
  };

  const handleNavClick = (path: string) => {
    const lastPopTime = sessionStorage.getItem('last_nav_pop_time');
    const now = Date.now();

    // 5 minutes cooldown for nav clicks too
    if (!lastPopTime || (now - parseInt(lastPopTime) > 5 * 60 * 1000)) {
      openSmartLink();
      sessionStorage.setItem('last_nav_pop_time', now.toString());
    }
    navigate(path);
  };

  // Categories Mapping
  const movieCategories = [
    { name: 'أفلام Netflix', path: '/category/netflix-movies' },
    { name: 'أفلام أجنبية', path: '/category/english-movies' },
    { name: 'أفلام آسيوية', path: '/category/asian-movies' },
    { name: 'أفلام تركية', path: '/category/turkish-movies' },
    { name: 'أفلام عربية', path: '/category/arabic-movies' },
    { name: 'أفلام كلاسيكية', path: '/category/classic-movies' },
    { name: 'أفلام مدبلجة', path: '/category/dubbed-movies' },
    { name: 'أفلام هندية', path: '/category/indian-movies' },
    { name: 'أفلام كرتون', path: '/category/anime-movies' },
  ];

  const seriesCategories = [
    { name: 'مسلسلات Netflix', path: '/category/netflix-series' },
    { name: 'مسلسلات أجنبية', path: '/category/english-series' },
    { name: 'مسلسلات تركية', path: '/category/turkish-series' },
    { name: 'مسلسلات عربية', path: '/category/arabic-series' },
    { name: 'مسلسلات كرتون', path: '/category/cartoon-series' },
    { name: 'مسلسلات كورية', path: '/category/korean-series' },
    { name: 'مسلسلات مدبلجة', path: '/category/dubbed-series' },
    { name: 'مسلسلات مصرية', path: '/category/egyptian-series' },
    { name: 'مسلسلات هندية', path: '/category/indian-series' },
  ];

  const ramadanCategories = [
    { name: 'مسلسلات رمضان 2026', path: '/ramadan-2026' },
    { name: 'مسلسلات رمضان 2025', path: '/category/ramadan-2025' },
    { name: 'مسلسلات رمضان 2024', path: '/category/ramadan-2024' },
    { name: 'مسلسلات رمضان 2023', path: '/category/ramadan-2023' },
    { name: 'مسلسلات رمضان 2022', path: '/category/ramadan-2022' },
    { name: 'مسلسلات رمضان 2021', path: '/category/ramadan-2021' },
    { name: 'مسلسلات رمضان 2020', path: '/category/ramadan-2020' },
    { name: 'مسلسلات رمضان 2019', path: '/category/ramadan-2019' },
  ];

  const otherCategories = [
    { name: 'مسرحيات عربية', path: '/category/plays' },
    { name: 'مصارعة حرة (WWE)', path: '/category/wwe' },
    { name: 'أغاني عربية', path: '/category/arabic-songs' },
  ];

  useEffect(() => {
    // Scroll Handler
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // System Warmup
    import('../services/api').then(({ warmupContent }) => warmupContent());

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const finalQuery = kidsMode ? `${searchInput} كرتون` : searchInput;
    navigate(`/search?q=${finalQuery}`);
    setIsMenuOpen(false);
  };

  const handleToggleKids = () => {
    if (kidsMode) setShowPinModal(true);
    else {
      setKidsMode(true);
      localStorage.setItem('kidsMode', 'true');
      window.dispatchEvent(new Event('kidsModeChange'));
      navigate('/category/cartoon-series');
    }
  };

  const verifyPin = () => {
    if (pinInput === '1234') {
      setKidsMode(false);
      localStorage.setItem('kidsMode', 'false');
      window.dispatchEvent(new Event('kidsModeChange'));
      setShowPinModal(false);
      setPinInput('');
      navigate('/');
    } else alert('رمز خاطئ!');
  };

  const handlePromoRedeem = async () => {
    if (!user || !promoCode.trim()) return;
    try {
      await redeemPromo(user.id, promoCode.trim());
      setPromoMsg({ text: 'تم التفعيل بنجاح! +30 يوم', type: 'success' });
      setPromoCode('');
      refreshStatus();
      setTimeout(() => setPromoMsg(null), 5000);
    } catch (e: any) {
      setPromoMsg({ text: typeof e === 'string' ? e : 'كود غير صالح', type: 'error' });
      setTimeout(() => setPromoMsg(null), 5000);
    }
  };

  const prefetchCategory = async (id: string) => {
    const { prefetchCategory } = await import('../services/api');
    prefetchCategory(id);
  }

  if (location.pathname.startsWith('/admin') || ['/watch'].some(p => location.pathname.startsWith(p))) return null;

  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: <FaHome /> },
    { name: 'الأفلام', path: '#', hasMenu: true, items: movieCategories, icon: <FaFilm /> },
    { name: 'المسلسلات', path: '#', hasMenu: true, items: seriesCategories, icon: <FaTv /> },
    { name: 'رمضان', path: '#', hasMenu: true, items: ramadanCategories, icon: <FaFire /> },
    { name: 'أنمي', path: '/category/cartoon-series', icon: <FaRobot /> },
    { name: 'مباريات', path: '/matches', icon: <FaFutbol /> },
    { name: 'الكورسات', path: '/courses', icon: <FaGraduationCap /> },
    { name: 'تحميل', path: '/downloader', icon: <FaDownload /> },
    { name: 'إضافي', path: '#', hasMenu: true, items: otherCategories, icon: <FaEllipsisH /> },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 
        ${isScrolled
          ? 'h-20 bg-[#05070a]/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl'
          : 'h-28 bg-transparent'}`}>

        <div className="max-w-[1920px] mx-auto h-full px-6 lg:px-12 flex items-center justify-between gap-4">

          {/* Menu Icon (Mobile) */}
          <button onClick={() => setIsMenuOpen(true)} className="lg:hidden text-2xl text-white p-2">
            <FaBars />
          </button>

          {/* Logo Section */}
          <Link to="/" className="flex flex-row-reverse items-center gap-4 group shrink-0">
            <img src="/mobile-logo.png" className="w-11 h-11 rounded-2xl shadow-[0_0_30px_rgba(127,255,212,0.2)] group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-700" alt="MOVIDO" />
            <div className="flex flex-col items-start pr-2">
              <span className={`text-2xl md:text-4xl font-black heading-premium italic tracking-tighter transition-all duration-700
                  ${kidsMode
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-kids-blue to-kids-pink'
                  : 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}>
                MOVIDO
              </span>
              <span className={`text-[8px] font-black tracking-[0.6em] -mt-1.5 opacity-40 ${kidsMode ? 'text-kids-blue' : 'text-[#7fffd4]'}`}>
                {kidsMode ? 'FOR KIDS' : 'PREMIUM TV'}
              </span>
            </div>
          </Link>

          {/* Optimized Navigation Pill - Responsive for Laptops */}
          <div className="hidden lg:flex flex-1 justify-center px-2">
            <div className="glass-panel rounded-full px-2 py-1 flex items-center gap-0.5 border-white/5">

              {/* Home */}
              <div className="relative group/nav">
                <div onClick={() => handleNavClick('/')} className="cursor-pointer px-3 py-2 text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5">
                  <span className="text-xs opacity-60 group-hover/nav:opacity-100 transition-opacity"><FaHome /></span>
                  <span className="hidden sm:inline">الرئيسية</span>
                </div>
              </div>

              {/* Movies */}
              <div className="relative group/nav">
                <Link to="#" className="px-3 py-2 text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5">
                  <span className="text-xs opacity-60 group-hover/nav:opacity-100 transition-opacity"><FaFilm /></span>
                  <span className="hidden sm:inline">الأفلام</span>
                  <span className="text-[7px] opacity-30 group-hover/nav:rotate-180 transition-transform">▼</span>
                </Link>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 scale-95 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:scale-100 group-hover/nav:pointer-events-auto transition-all duration-300 z-50">
                  <div className="glass-panel p-3 rounded-[2rem] min-w-[14rem] grid gap-1 border-white/10 shadow-huge">
                    {movieCategories.map((item) => (
                      <div key={item.path} onClick={() => handleNavClick(item.path)} onMouseEnter={() => prefetchCategory(item.path.split('/').pop()!)}
                        className="cursor-pointer px-5 py-3 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all text-right flex justify-between items-center">
                        {item.name}
                        <span className="w-1 h-1 rounded-full bg-[#7fffd4] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Series */}
              <div className="relative group/nav">
                <Link to="#" className="px-3 py-2 text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5">
                  <span className="text-xs opacity-60 group-hover/nav:opacity-100 transition-opacity"><FaTv /></span>
                  <span className="hidden sm:inline">المسلسلات</span>
                  <span className="text-[7px] opacity-30 group-hover/nav:rotate-180 transition-transform">▼</span>
                </Link>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 scale-95 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:scale-100 group-hover/nav:pointer-events-auto transition-all duration-300 z-50">
                  <div className="glass-panel p-3 rounded-[2rem] min-w-[14rem] grid gap-1 border-white/10 shadow-huge">
                    {seriesCategories.map((item) => (
                      <div key={item.path} onClick={() => handleNavClick(item.path)} onMouseEnter={() => prefetchCategory(item.path.split('/').pop()!)}
                        className="cursor-pointer px-5 py-3 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all text-right flex justify-between items-center">
                        {item.name}
                        <span className="w-1 h-1 rounded-full bg-[#7fffd4] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ramadan */}
              <div className="relative group/nav">
                <Link to="#" className="px-3 py-2 text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5">
                  <span className="text-xs opacity-60 group-hover/nav:opacity-100 transition-opacity"><FaFire /></span>
                  <span className="hidden sm:inline">رمضان</span>
                  <span className="text-[7px] opacity-30 group-hover/nav:rotate-180 transition-transform">▼</span>
                </Link>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 scale-95 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:scale-100 group-hover/nav:pointer-events-auto transition-all duration-300 z-50">
                  <div className="glass-panel p-3 rounded-[2rem] min-w-[14rem] grid gap-1 border-white/10 shadow-huge">
                    {ramadanCategories.map((item) => (
                      <div key={item.path} onClick={() => handleNavClick(item.path)} onMouseEnter={() => prefetchCategory(item.path.split('/').pop()!)}
                        className="cursor-pointer px-5 py-3 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all text-right flex justify-between items-center">
                        {item.name}
                        <span className="w-1 h-1 rounded-full bg-[#7fffd4] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Anime/Cartoon Series */}
              <div className="relative group/nav">
                <div onClick={() => handleNavClick('/category/cartoon-series')} onMouseEnter={() => prefetchCategory('cartoon-series')} className="cursor-pointer px-3 py-2 text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5">
                  <span className="text-xs opacity-60 group-hover/nav:opacity-100 transition-opacity"><FaRobot /></span>
                  <span className="hidden sm:inline">أنمي</span>
                </div>
              </div>

              {/* Matches */}
              <div className="relative group/nav hidden xl:block">
                <div onClick={() => handleNavClick('/matches')} className="cursor-pointer px-3 py-2 text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5">
                  <span className="text-xs opacity-60 group-hover/nav:opacity-100 transition-opacity"><FaFutbol /></span>
                  <span className="hidden sm:inline">مباريات</span>
                </div>
              </div>

              {/* Courses */}
              <div className="relative group/nav hidden xl:block">
                <div onClick={() => handleNavClick('/courses')} className="cursor-pointer px-3 py-2 text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5">
                  <span className="text-xs opacity-60 group-hover/nav:opacity-100 transition-opacity"><FaGraduationCap /></span>
                  <span className="hidden sm:inline">الكورسات</span>
                </div>
              </div>

              {/* Downloader */}
              <div className="relative group/nav hidden xl:block">
                <div onClick={() => handleNavClick('/downloader')} className="cursor-pointer px-3 py-2 text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5">
                  <span className="text-xs opacity-60 group-hover/nav:opacity-100 transition-opacity"><FaDownload /></span>
                  <span className="hidden sm:inline">تحميل</span>
                </div>
              </div>

              {/* Extra */}
              <div className="relative group/nav">
                <Link to="#" className="px-3 py-2 text-[10px] xl:text-[11px] font-black uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5">
                  <span className="text-xs opacity-60 group-hover/nav:opacity-100 transition-opacity"><FaEllipsisH /></span>
                  <span className="hidden sm:inline">إضافي</span>
                  <span className="text-[7px] opacity-30 group-hover/nav:rotate-180 transition-transform">▼</span>
                </Link>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 scale-95 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:scale-100 group-hover/nav:pointer-events-auto transition-all duration-300 z-50">
                  <div className="glass-panel p-3 rounded-[2rem] min-w-[14rem] grid gap-1 border-white/10 shadow-huge">
                    {otherCategories.map((item) => (
                      <div key={item.path} onClick={() => handleNavClick(item.path)} onMouseEnter={() => prefetchCategory(item.path.split('/').pop()!)}
                        className="cursor-pointer px-5 py-3 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all text-right flex justify-between items-center">
                        {item.name}
                        <span className="w-1 h-1 rounded-full bg-[#7fffd4] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Pill (Desktop Large) */}
            <form onSubmit={handleSearch} className="hidden xl:flex glass-panel rounded-full px-5 py-2 flex items-center gap-3 border-white/10 focus-within:border-[#7fffd4]/30 transition-all">
              <input
                type="text"
                placeholder="ابحث..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-transparent text-xs w-32 focus:w-48 transition-all outline-none text-white font-bold placeholder:text-slate-600 text-right"
              />
              <FaSearch className="text-slate-500 text-xs" />
            </form>

            {/* Premium Wallet Utility */}
            <Link to="/rewards" className="hidden sm:flex glass-panel px-5 py-2.5 rounded-2xl items-center gap-2.5 border-[#7fffd4]/30 hover:border-[#7fffd4] transition-all hover:scale-105 active:scale-95 group/wallet relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7fffd4]/10 to-transparent opacity-0 group-hover/wallet:opacity-100 transition-opacity" />
              <FaCoins className="text-yellow-400 text-sm animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[7px] font-black text-[#7fffd4] uppercase tracking-widest opacity-60 mb-0.5">رصيدك</span>
                <span className="font-black text-sm text-white tabular-nums drop-shadow-lg">{user?.points || 0}</span>
              </div>
              {/* Glow hint */}
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-[#7fffd4]/20 blur-2xl rounded-full" />
            </Link>

            {/* Kids Mode Toggle */}
            <button
              onClick={handleToggleKids}
              className={`p-2.5 rounded-full border transition-all duration-500
                ${kidsMode
                  ? 'bg-kids-blue text-white border-white shadow-xl rotate-12'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-accent-primary hover:text-accent-primary'}`}
            >
              <FaChild size={14} />
            </button>

            {/* Quick Profile & Identity */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative group cursor-pointer transition-all active:scale-95
                ${kidsMode ? 'bg-kids-yellow' : 'bg-gradient-to-br from-[#7fffd4] to-[#1e88e5] hover:shadow-[0_0_20px_rgba(127,255,212,0.4)]'}`}
              >
                <FaUser className="text-[#05070a] text-sm" />
                {user?.is_fan === 1 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-[#05070a] flex items-center justify-center shadow-lg">
                    <FaStar className="text-[#05070a] text-[6px]" />
                  </div>
                )}
              </button>

              {/* Desktop Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-14 left-0 w-72 glass-panel p-6 rounded-[2.5rem] border-[#7fffd4]/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[100] text-right"
                  >
                    <div className="space-y-6">
                      <div className="flex flex-row-reverse items-center gap-4 border-b border-white/5 pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#7fffd4] text-xl">
                          <FaUser />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-black text-sm italic">مستخدم MOVIDO</h4>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">ID: {user?.id.substring(0, 8)}...</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${user && user.ad_free_until > Date.now() / 1000 ? 'bg-[#7fffd4] text-[#05070a]' : 'bg-orange-500/20 text-orange-500'}`}>
                            {user && user.ad_free_until > Date.now() / 1000 ? 'PREMIUM' : 'STANDARD'}
                          </span>
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">حالة الحساب</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                          <span className="text-sm font-black text-[#7fffd4]">{user?.points || 0}</span>
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">النقاط</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl border border-[#7fffd4]/20">
                          <span className="text-xs font-black text-yellow-400">{((user?.watch_time_total || 0) / 3600).toFixed(1)} ساعة</span>
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">المشاهدة</span>
                        </div>
                      </div>

                      {/* Dropdown Promo Section */}
                      <div className="space-y-3 pt-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="كود الخصم..."
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white font-bold outline-none focus:border-[#7fffd4]/40 uppercase"
                          />
                          <button
                            onClick={handlePromoRedeem}
                            className="absolute left-2 top-1.5 bottom-1.5 px-3 bg-[#7fffd4] text-[#05070a] rounded-lg font-black text-[9px] hover:scale-105 transition-all"
                          >
                            تفعيل
                          </button>
                        </div>
                        {promoMsg && (
                          <p className={`text-[8px] font-bold text-center ${promoMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {promoMsg.text}
                          </p>
                        )}
                      </div>

                      <Link
                        to="/rewards"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full py-4 bg-[#7fffd4]/10 text-[#7fffd4] border border-[#7fffd4]/20 rounded-2xl font-black text-xs block text-center shadow-lg hover:bg-[#7fffd4] hover:text-[#05070a] transition-all"
                      >
                        فتح متجر المكافآت
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </nav>

      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-10 rounded-[3rem] w-full max-w-sm text-center">
              <FaLock className="text-4xl text-[#7fffd4] mx-auto mb-6" />
              <h3 className="text-xl font-black text-white mb-2 italic">منطقة الوالدين</h3>
              <p className="text-slate-400 text-sm mb-8">أدخل الرمز (1234) للخروج</p>
              <input
                type="password" maxLength={4} value={pinInput} onChange={e => setPinInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-center text-3xl tracking-[0.5em] text-white outline-none focus:border-[#7fffd4]"
              />
              <div className="flex gap-4 mt-8">
                <button onClick={() => setShowPinModal(false)} className="flex-1 p-4 rounded-2xl font-bold text-slate-500 bg-white/5">إلغاء</button>
                <button onClick={verifyPin} className="flex-1 p-4 rounded-2xl font-bold text-[#05070a] bg-[#7fffd4]">تأكيد</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-80 max-w-sm bg-[#0c0f16] z-[201] p-8 flex flex-col gap-8 shadow-huge border-l border-white/5"
            >
              <div className="flex items-center justify-between">
                <button onClick={() => setIsMenuOpen(false)} className="text-3xl text-white hover:text-[#7fffd4] transition-colors">
                  <FaTimes />
                </button>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black italic text-white tracking-tighter">MOVIDO</span>
                  <span className="text-[6px] font-black text-accent-primary tracking-[0.3em] uppercase">Navigation</span>
                </div>
              </div>

              <div className="mt-6 flex-1 overflow-y-auto no-scrollbar pb-10 space-y-10">
                {/* Primary Links & Categories */}
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#7fffd4] opacity-40 italic mb-6">المستكشف الذكي</div>
                  <ul className="space-y-4">
                    {navLinks.map((l, i) => (
                      <li key={i} className="space-y-3">
                        <Link
                          to={l.path}
                          onClick={l.hasMenu ? (e) => e.preventDefault() : () => setIsMenuOpen(false)}
                          className={`text-xl font-black italic transition-all flex items-center justify-between group
                                       ${location.pathname === l.path ? 'text-[#7fffd4]' : 'text-white/90 hover:text-[#7fffd4]'}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`text-lg transition-all duration-500 ${location.pathname === l.path ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}>
                              {l.icon}
                            </span>
                            {l.name}
                          </div>
                          {l.hasMenu && <span className="text-[10px] opacity-20">▼</span>}
                        </Link>

                        {/* Nested Categories for Movies/Series/etc */}
                        {l.hasMenu && (
                          <div className="grid grid-cols-2 gap-2 pr-8">
                            {l.items?.map((item, idx) => (
                              <Link
                                key={idx}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-[10px] font-bold text-slate-500 hover:text-white py-2 px-3 bg-white/5 rounded-lg border border-white/5 transition-all truncate"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="h-[1px] bg-white/5 w-full" />

                {/* Bottom Actions */}
                <div className="space-y-4">
                  <button
                    onClick={() => { handleToggleKids(); setIsMenuOpen(false); }}
                    className="w-full bg-kids-blue text-white p-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-xl hover:scale-105 active:scale-95 transition-all text-sm"
                  >
                    <FaChild /> {kidsMode ? 'الخروج من وضع الأطفال' : 'تفعيل وضع الأطفال'}
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/rewards" onClick={() => setIsMenuOpen(false)} className="glass-panel p-4 rounded-3xl flex flex-col items-center justify-center gap-1 border-white/5 active:scale-95 transition-all">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">النقاط</span>
                      <span className="text-sm font-black text-yellow-500 flex items-center gap-2"><FaCoins size={10} /> {user?.points || 0}</span>
                    </Link>
                    <div className="glass-panel p-4 rounded-3xl flex flex-col items-center justify-center gap-1 border-white/5">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">الحالة</span>
                      <span className={`text-[10px] font-black uppercase italic ${user && user.ad_free_until > Date.now() / 1000 ? 'text-[#7fffd4]' : 'text-orange-500'}`}>
                        {user && user.ad_free_until > Date.now() / 1000 ? 'Premium' : 'Standard'}
                      </span>
                    </div>
                  </div>

                  {/* Profile Card & Promo in Mobile */}
                  <div className="glass-panel p-5 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/5 to-transparent space-y-4">
                    <div className="flex flex-row-reverse items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#7fffd4]/10 flex items-center justify-center text-[#7fffd4] text-xl">
                        <FaUser />
                      </div>
                      <div className="text-right flex-1">
                        <h4 className="text-white font-black text-xs italic">حسابي الشخصي</h4>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 italic">ID: {user?.id.substring(0, 12)}...</p>
                      </div>
                    </div>

                    <div className="relative pt-2">
                      <input
                        type="text"
                        placeholder="أدخل كود الهدية..."
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white font-bold outline-none focus:border-[#7fffd4]/40 uppercase"
                      />
                      <button
                        onClick={handlePromoRedeem}
                        className="absolute left-2 top-4 bottom-2 px-6 bg-[#7fffd4] text-[#05070a] rounded-xl font-black text-[10px]"
                      >
                        تفعيل
                      </button>
                    </div>
                  </div>

                </div>

                <div className="pt-4 text-center">
                  <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.5em] italic">MOVIDO Core Protocol v3.0</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
