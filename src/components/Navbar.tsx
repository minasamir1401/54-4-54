import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Force Refetch of Framer Motion
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaUser,
  FaBars,
  FaTimes,
  FaFilm,
  FaTv,
  FaHome,
  FaFire,
  FaChild,
  FaLock,
  FaMicrophone,
  FaCoins,
  FaShareAlt,
  FaTrophy,
  FaGift
} from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import { redeemReward } from '../services/api';

/* =======================
   CATEGORIES (IMPORTANT)
======================= */
const navigationLinks = [
  { name: 'الرئيسية', path: '/', icon: <FaHome /> },
  { name: 'تحميل فيديوهات', path: '/downloader', icon: <FaFire /> },
];

const movieCategories = [
  { name: 'أفلام أجنبية', path: '/category/english-movies', icon: <FaFilm /> },
  { name: 'أفلام عربية', path: '/category/arabic-movies', icon: <FaFilm /> },
  { name: 'أفلام هندية', path: '/category/indian-movies', icon: <FaFilm /> },
  { name: 'أفلام تركية', path: '/category/turkish-movies', icon: <FaFilm /> },
  { name: 'أفلام آسيوية', path: '/category/asian-movies', icon: <FaFilm /> },
  { name: 'أفلام أنمي', path: '/category/anime-movies', icon: <FaFilm /> },
  { name: 'أفلام مدبلجة', path: '/category/dubbed-movies', icon: <FaFilm /> },
];

const seriesCategories = [
  { name: 'مسلسلات رمضان 2025', path: '/category/ramadan-2025', icon: <FaFire /> },
  { name: 'مسلسلات رمضان 2024', path: '/category/ramadan-2024', icon: <FaTv /> },
  { name: 'مسلسلات عربية', path: '/category/arabic-series', icon: <FaTv /> },
  { name: 'مسلسلات تركية', path: '/category/turkish-series', icon: <FaTv /> },
  { name: 'مسلسلات اجنبية', path: '/category/english-series', icon: <FaTv /> },
  { name: 'مسلسلات هندية', path: '/category/indian-series', icon: <FaTv /> },
  { name: 'مسلسلات آسياوية', path: '/category/asian-series', icon: <FaTv /> },
  { name: 'مسلسلات انمي', path: '/category/anime-series', icon: <FaTv /> },
  { name: 'برامج تلفزيون', path: '/category/tv-programs', icon: <FaTv /> },
  { name: 'مسرحيات', path: '/category/plays', icon: <FaTv /> },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [kidsMode, setKidsMode] = useState(localStorage.getItem('kidsMode') === 'true');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { user, refreshStatus, getReferralLink } = useUser();
  const [showRewards, setShowRewards] = useState(false);
  const navigate = useNavigate();

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("متصفحك لا يدعم البحث الصوتي.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const finalQuery = kidsMode ? `${transcript} كرتون` : transcript;
      setSearchInput(transcript);
      setIsListening(false);
      navigate(`/search?q=${finalQuery}`);
      setIsSearchActive(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  useEffect(() => {
    localStorage.setItem('kidsMode', String(kidsMode));
    // Dispatch event for other components
    window.dispatchEvent(new Event('kidsModeChange'));
    
    if (kidsMode) {
      document.body.classList.add('kids-mode');
    } else {
      document.body.classList.remove('kids-mode');
    }
  }, [kidsMode]);

  const handleToggleKids = () => {
    if (kidsMode) {
      setShowPinModal(true);
    } else {
      setKidsMode(true);
      navigate('/category/anime-movies');
    }
  };

  const verifyPin = () => {
    if (pinInput === '1234') { // Default PIN
      setKidsMode(false);
      setShowPinModal(false);
      setPinInput('');
    } else {
      alert('رمز خاطئ! اسأل والديك.');
    }
  };

  /* =======================
     SCROLL EFFECT
  ======================= */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* =======================
     SEARCH
  ======================= */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const finalQuery = kidsMode ? `${searchInput} كرتون` : searchInput;
    navigate(`/search?q=${finalQuery}`);
    setIsSearchActive(false);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* =======================
          NAVBAR
      ======================= */}
      <nav
        className={`
          fixed top-0 left-0 right-0 h-[72px]
          z-[9999] transition-all duration-300
          ${isScrolled || isMenuOpen
            ? 'bg-black/95 backdrop-blur-xl shadow-2xl'
            : 'bg-gradient-to-b from-black to-transparent'}
        `}
      >
        <div className="max-w-[1920px] mx-auto h-full px-2 xs:px-4 sm:px-10 md:px-32 flex items-center justify-between gap-2">

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            className="lg:hidden text-white text-2xl p-2 rounded-xl
                       border border-white/10 hover:bg-white/10"
          >
            {isMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>

          {/* SEARCH + USER + COINS + KIDS */}
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 md:gap-8 relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                placeholder="بحث..."
                aria-label="ابحث عن الأفلام والمسلسلات"
                className={`
                  bg-white/10 border border-white/20 text-xs sm:text-sm p-2 sm:p-3 rounded-2xl
                  placeholder-gray-400 focus:outline-none focus:border-red-600
                  transition-all duration-300 text-right dir-rtl text-white
                  ${isSearchActive
                    ? 'w-32 xs:w-44 sm:w-64 opacity-100 pr-10 sm:pr-12 pl-16 sm:pl-20'
                    : 'w-0 opacity-0 pointer-events-none'}
                `}
              />

              <button
                type="button"
                onClick={() => setIsSearchActive(true)}
                aria-label="تفعيل البحث"
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-300 hidden xs:block"
              >
                <FaSearch aria-hidden="true" />
              </button>

              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="مسح البحث"
                  className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-300"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              )}

              <button
                type="button"
                onClick={handleVoiceSearch}
                aria-label="بحث صوتي"
                className={`absolute left-8 top-1/2 -translate-y-1/2 transition-all p-1.5 rounded-full
                           ${isListening ? 'text-white bg-red-600 animate-pulse' : 'text-gray-300 hover:text-red-500'}
                           ${kidsMode ? 'bg-yellow-400 text-black shadow-lg scale-110' : ''}`}
              >
                <FaMicrophone aria-hidden="true" />
              </button>
            </form>

            <div className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 bg-gradient-to-br
                            from-red-600 to-red-800 rounded-lg xs:rounded-xl
                            items-center justify-center shadow-lg shrink-0
                            ${isSearchActive ? 'hidden xs:flex' : 'flex'}`}>
              <FaUser className="text-white text-[10px] xs:text-xs sm:text-sm" />
            </div>

            {/* Meih Coins Display */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setShowRewards(true)}
                className={`
                  flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-1.5 xs:px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg xs:rounded-xl transition-all
                  ${kidsMode 
                    ? 'bg-orange-400 text-white shadow-[0_3px_0_#c2410c]' 
                    : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30'}
                `}
              >
                <FaCoins className={`text-[10px] xs:text-xs sm:text-base ${kidsMode ? 'animate-pulse' : ''}`} />
                <span className="font-black text-[9px] xs:text-[10px] sm:text-xs">{user?.points || 0}</span>
              </button>
            </div>

            {/* Kids Mode Toggle */}
            <button
              onClick={handleToggleKids}
              className={`
                flex flex-row-reverse items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest transition-all shrink-0
                ${kidsMode 
                  ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'}
              `}
            >
              <FaChild className={`text-[11px] xs:text-xs sm:text-sm ${kidsMode ? 'animate-bounce' : ''}`} />
              <span className="hidden xs:inline text-[8px] xs:text-[9px] sm:text-[10px]">{kidsMode ? 'Kids' : 'Kids'}</span>
              <span className="hidden sm:inline text-[10px]">{kidsMode ? ' Mode ON' : ' Mode'}</span>
            </button>
          </div>

          {/* LOGO - LMINA Text */}
          <Link 
            to={kidsMode ? "/category/anime-movies" : "/"} 
            aria-label="LMINA - الرئيسية"
            title="LMINA - العودة للرئيسية"
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter
                           bg-gradient-to-r from-red-600 via-white to-red-600
                           bg-clip-text text-transparent
                           italic fire-text
                           select-none drop-shadow-2xl">
              LMINA
            </span>
          </Link>
        </div>

        {/* FLOATING TOP MENU (STYLISH) */}
        <div className="hidden lg:flex justify-center -mt-3">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-2 
                         shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center">
            <ul className="flex flex-row-reverse items-center justify-center gap-1 
                           text-[11px] font-bold tracking-widest uppercase text-gray-300">
              
              {/* Static Links */}
              {navigationLinks
                .filter(_ => !kidsMode)
                .map(link => (
                <li key={link.path} className="relative group/link">
                  <Link
                    to={link.path}
                    className={`px-5 py-2.5 transition-all duration-300 rounded-full flex items-center gap-2
                               ${link.path === '/downloader' 
                                 ? 'bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600/20' 
                                 : 'hover:text-white hover:bg-white/5'}`}
                  >
                    {link.path === '/downloader' && (
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                    {link.name}
                    {link.path === '/downloader' && (
                      <span className="bg-red-600 text-[7px] px-1.5 py-0.5 rounded-sm font-black text-white ml-1 animate-pulse">
                        NEW
                      </span>
                    )}
                  </Link>
                </li>
              ))}

              {/* Minimal Separator */}
              <div className="w-[1px] h-4 bg-white/10 mx-3" />
              
              {/* Movies Mega Menu Trigger */}
              <li className="group/menu relative">
                <button className="px-5 py-2.5 flex items-center gap-2 hover:text-white transition-all duration-300 rounded-full hover:bg-white/5 uppercase">
                  الأفلام
                  <span className="text-[8px] opacity-40 group-hover/menu:rotate-180 group-hover/menu:text-red-500 transition-all duration-500">▼</span>
                </button>
                <div className="absolute top-full right-0 pt-5 opacity-0 translate-y-4 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-500 z-50">
                  <div className="bg-black/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] w-64 grid gap-1">
                    {movieCategories
                      .filter(cat => !kidsMode || cat.path.includes('anime') || cat.path.includes('dubbed'))
                      .map(cat => (
                      <Link key={cat.path} to={cat.path} className="flex flex-row-reverse items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-all text-sm group/item">
                         <span className="text-gray-400 group-hover/item:text-white font-medium">{cat.name}</span>
                         <span className="text-gray-600 group-hover/item:text-red-500 transform group-hover/item:scale-110 transition-transform">{cat.icon}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              {/* Series Mega Menu Trigger */}
              <li className="group/menu relative">
                <button className="px-5 py-2.5 flex items-center gap-2 hover:text-white transition-all duration-300 rounded-full hover:bg-white/5 uppercase">
                  المسلسلات
                  <span className="text-[8px] opacity-40 group-hover/menu:rotate-180 group-hover/menu:text-red-500 transition-all duration-500">▼</span>
                </button>
                <div className="absolute top-full right-0 pt-5 opacity-0 translate-y-4 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-500 z-50">
                  <div className="bg-black/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] w-64 grid gap-1">
                    {seriesCategories
                      .filter(cat => !kidsMode || cat.path.includes('anime'))
                      .map(cat => (
                      <Link key={cat.path} to={cat.path} className="flex flex-row-reverse items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-all text-sm group/item">
                         <span className="text-gray-400 group-hover/item:text-white font-medium">{cat.name}</span>
                         <span className="text-gray-600 group-hover/item:text-red-500 transform group-hover/item:scale-110 transition-transform">{cat.icon}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* =======================
          MOBILE MENU (PREMIUM DRAWER)
      ======================= */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990]"
            />
            
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[85%] sm:w-[380px] 
                         bg-black/95 backdrop-blur-3xl z-[9991] overflow-y-auto
                         border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-8 pt-24 space-y-10">
                {/* Search in Mobile Menu */}
                <div className="relative group">
                   <form onSubmit={handleSearch}>
                      <input 
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="ابحث عن فيلم أو مسلسل..."
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-right dir-rtl focus:border-red-600 transition-all"
                      />
                      <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-600" />
                   </form>
                </div>

                {/* Kids Mode Toggle - Mobile */}
                <button
                  onClick={() => {
                    handleToggleKids();
                    setIsMenuOpen(false);
                  }}
                  className={`
                    w-full p-5 rounded-3xl font-black text-base uppercase tracking-widest transition-all
                    flex flex-row-reverse items-center justify-center gap-3
                    ${kidsMode 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black shadow-[0_0_30px_rgba(250,204,21,0.5)] border-4 border-yellow-300' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}
                  `}
                >
                  <FaChild className={`text-2xl ${kidsMode ? 'animate-bounce' : ''}`} />
                  <span>{kidsMode ? 'إيقاف وضع الأطفال' : 'تشغيل وضع الأطفال'}</span>
                </button>

                {/* Quick Action Pills */}
                <ul className="grid grid-cols-2 gap-3">
                    {navigationLinks
                      .filter(_ => !kidsMode)
                      .map(link => (
                        <li key={link.path}>
                            <Link 
                              to={link.path} 
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex flex-col items-center justify-center p-5 rounded-3xl border border-white/5 transition-all w-full
                                         ${link.path === '/downloader' ? 'bg-red-600/10 border-red-600/20 text-red-500' : 'bg-white/5 text-white'}`}
                            >
                                <span className="text-2xl mb-2">{link.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                
                {/* Categories Sections */}
                <div className="space-y-8">
                    <div>
                        <div className="flex flex-row-reverse items-center gap-3 mb-4 px-2">
                           <div className="w-1 h-4 bg-red-600 rounded-full" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">الأفلام</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {movieCategories
                              .filter(cat => !kidsMode || cat.path.includes('anime') || cat.path.includes('dubbed'))
                              .map(cat => (
                                <Link key={cat.path} to={cat.path} onClick={() => setIsMenuOpen(false)} className="flex flex-row-reverse items-center justify-between p-4 bg-white/[0.03] hover:bg-white/5 rounded-2xl border border-white/5 text-white transition-all group">
                                    <span className="text-sm font-bold group-hover:text-red-500">{cat.name}</span>
                                    <span className="text-gray-600 group-hover:text-red-500 group-hover:scale-110 transition-all">{cat.icon}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-row-reverse items-center gap-3 mb-4 px-2">
                           <div className="w-1 h-4 bg-red-600 rounded-full" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">المسلسلات</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {seriesCategories
                              .filter(cat => !kidsMode || cat.path.includes('anime'))
                              .map(cat => (
                                <Link key={cat.path} to={cat.path} onClick={() => setIsMenuOpen(false)} className="flex flex-row-reverse items-center justify-between p-4 bg-white/[0.03] hover:bg-white/5 rounded-2xl border border-white/5 text-white transition-all group">
                                    <span className="text-sm font-bold group-hover:text-red-500">{cat.name}</span>
                                    <span className="text-gray-600 group-hover:text-red-500 group-hover:scale-110 transition-all">{cat.icon}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Info in Menu */}
                <div className="pt-10 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">LMINA PREMIUM v2.0</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Rewards Modal */}
      <AnimatePresence>
        {showRewards && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`
                max-w-md w-full p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border shadow-2xl overflow-y-auto max-h-[90vh]
                ${kidsMode 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-zinc-900 border-white/10'}
              `}
            >
               <div className="text-center mb-8">
                  <div className={`
                    w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4
                    ${kidsMode ? 'bg-orange-400' : 'bg-yellow-500'}
                  `}>
                    <FaTrophy className="text-white text-4xl" />
                  </div>
                  <h2 className={`text-2xl font-black mb-1 ${kidsMode ? 'text-orange-900' : 'text-white'}`}>تحدي المشاركة والربح</h2>
                  <p className={`text-sm ${kidsMode ? 'text-orange-700' : 'text-gray-400'}`}>اربح Meih Coins واستبدلها بجوائز!</p>
               </div>

               <div className="space-y-4 mb-8">
                  <div className={`p-4 rounded-3xl border ${kidsMode ? 'bg-white border-orange-100' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-bold ${kidsMode ? 'text-orange-900' : 'text-white'}`}>نقاطك الحالية</span>
                        <div className="flex items-center gap-2 text-yellow-500 font-black">
                          <FaCoins />
                          <span>{user?.points || 0}</span>
                        </div>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${kidsMode ? 'bg-orange-100' : 'bg-white/10'}`}>
                        <div className="h-full bg-yellow-500" style={{ width: `${Math.min(((user?.points || 0) / 1000) * 100, 100)}%` }} />
                      </div>
                  </div>

                  <div className="grid gap-3">
                    <button 
                      onClick={async () => {
                        if (!user) return;
                        await redeemReward(user.id, 'ad_free');
                        refreshStatus();
                        alert('تم تفعيل المشاهدة بدون إعلانات لمدة 24 ساعة!');
                      }}
                      className={`
                        flex items-center justify-between p-4 rounded-2xl border transition-all
                        ${(user?.points || 0) >= 500 
                          ? 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20' 
                          : 'bg-white/5 border-white/5 text-gray-500 opacity-50'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <FaGift />
                        <span className="font-bold">إزالة الإعلانات (24 ساعة)</span>
                      </div>
                      <span className="font-black">500</span>
                    </button>

                    <button 
                      onClick={async () => {
                        if (!user) return;
                        await redeemReward(user.id, 'fan_badge');
                        refreshStatus();
                        alert('تم الحصول على لقب Fan!');
                      }}
                      className={`
                        flex items-center justify-between p-4 rounded-2xl border transition-all
                        ${(user?.points || 0) >= 1000 
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20' 
                          : 'bg-white/5 border-white/5 text-gray-500 opacity-50'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <FaUser />
                        <span className="font-bold">لقب "Fan" في التعليقات</span>
                      </div>
                      <span className="font-black">1000</span>
                    </button>
                  </div>

                  <div className={`p-4 rounded-[2.5rem] ${kidsMode ? 'bg-blue-100 text-blue-900' : 'bg-blue-600/10 text-blue-400'} text-center`}>
                    <div className="mb-2 font-black text-xs uppercase tracking-widest">شارك رابطك واربح 100 نقطة عن كل صديق!</div>
                    <div className="flex gap-2">
                        <input 
                          readOnly 
                          value={getReferralLink()}
                          className={`flex-1 text-[10px] p-2 rounded-xl outline-none ${kidsMode ? 'bg-white' : 'bg-black/40'}`}
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(getReferralLink());
                            alert('تم نسخ الرابط! شاركه مع أصدقائك.');
                          }}
                          className="bg-blue-600 text-white px-4 rounded-xl text-xs font-bold"
                        >
                          <FaShareAlt />
                        </button>
                    </div>
                  </div>
               </div>

               <button 
                onClick={() => setShowRewards(false)}
                className={`w-full p-4 rounded-2xl font-bold ${kidsMode ? 'bg-orange-500 text-white' : 'bg-white/10 text-white'}`}
               >
                 إغلاق
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-white/10 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-sm w-full text-center overflow-y-auto max-h-[90vh]"
            >
              <FaLock className="text-red-600 text-4xl mx-auto mb-6" />
              <h3 className="text-xl font-black mb-2 text-white">منطقة الوالدين</h3>
              <p className="text-gray-400 text-sm mb-6">أدخل الرمز الافتراضي (1234) للخروج من وضع الأطفال</p>
              <input 
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-center text-2xl tracking-[1em] text-white mb-6 focus:border-red-600 outline-none"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 p-4 rounded-2xl bg-white/5 text-gray-400 font-bold"
                >
                  إلغاء
                </button>
                <button 
                  onClick={verifyPin}
                  className="flex-1 p-4 rounded-2xl bg-red-600 text-white font-bold"
                >
                  تأكيد
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .kids-mode {
          background-color: #7dd3fc !important;
          background-image: 
            radial-gradient(circle at 10% 20%, #ffffff 0%, transparent 20%),
            radial-gradient(circle at 90% 80%, #ffffff 0%, transparent 20%),
            radial-gradient(circle at 50% 50%, #ffffff 0%, transparent 30%) !important;
          background-attachment: fixed !important;
          color: #0c4a6e !important;
          font-family: 'Cairo', cursive !important;
          cursor: url('https://cur.cursors-4u.net/games/gam-4/gam373.cur'), auto !important;
        }
        
        .kids-mode nav {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%) !important;
          border-bottom: 8px solid #d97706 !important;
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4), inset 0 -4px 0 rgba(217, 119, 6, 0.3) !important;
          position: relative !important;
        }

        .kids-mode nav::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ef4444);
          background-size: 200% 100%;
          animation: rainbow 3s linear infinite;
        }

        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .kids-mode .fire-text {
          background: linear-gradient(to bottom, #f87171, #dc2626) !important;
          -webkit-background-clip: text !important;
          color: transparent !important;
          font-weight: 900 !important;
          -webkit-text-stroke: 1.5px #ffffff;
          filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.1)) !important;
        }

        .kids-mode a, .kids-mode button {
          border-radius: 40px !important;
          border: 3px solid #fbbf24 !important;
          background: #38bdf8 !important;
          color: #ffffff !important;
          font-weight: 900 !important;
          box-shadow: 0 4px 0px #0369a1 !important;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }

        .kids-mode a:hover, .kids-mode button:hover {
          transform: scale(1.05) !important;
          background: #4ade80 !important;
          box-shadow: 0 4px 0px #15803d !important;
        }

        .kids-mode .bg-zinc-900, 
        .kids-mode .bg-white\\/5,
        .kids-mode .bg-white\\/\\[0\\.03\\] {
          background: #fef3c7 !important;
          border: 3px solid #fbbf24 !important;
          border-radius: 20px !important;
          color: #0c4a6e !important;
          box-shadow: 0 4px 0px #d97706 !important;
        }

        @media (min-width: 768px) {
          .kids-mode .bg-zinc-900, 
          .kids-mode .bg-white\\/5,
          .kids-mode .bg-white\\/\\[0\\.03\\] {
            border: 6px solid #fbbf24 !important;
            border-radius: 30px !important;
            box-shadow: 0 6px 0px #d97706 !important;
          }
        }

        .kids-mode .relative.aspect-video,
        .kids-mode .relative.aspect-\\[2\\/3\\] {
          border-radius: 40px !important;
          border: 6px solid #fbbf24 !important;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
        }

        .kids-mode input {
          background: #e0f2fe !important;
          border: 4px solid #fbbf24 !important;
          color: #0c4a6e !important;
        }

        .kids-mode h1, .kids-mode h2, .kids-mode h3 {
          color: #be123c !important;
          -webkit-text-stroke: 1px #fbbf24;
        }

        .kids-mode p, .kids-mode span, .kids-mode div {
          color: #0c4a6e !important;
        }

        .kids-mode .text-gray-300,
        .kids-mode .text-gray-400,
        .kids-mode .text-gray-500,
        .kids-mode .text-gray-600 {
          color: #0c4a6e !important;
        }

        .kids-mode input::placeholder {
          color: #38bdf8 !important;
          opacity: 1 !important;
        }

        /* Fun Animations */
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .kids-mode .animate-bounce {
          animation: bounce-slow 2s infinite ease-in-out !important;
        }

        .kids-mode .lg\\:hidden.fixed.bg-black\\/95 {
          background: #bae6fd !important;
          border-right: 15px solid #fbbf24 !important;
        }
      `}</style>
    </>
  );
};

export default Navbar;
