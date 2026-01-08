import { useState, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  FaGift,
  FaGraduationCap,
  FaFutbol
} from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import { redeemReward } from '../services/api';

/* =======================
   CATEGORIES (IMPORTANT)
======================= */
const navigationLinks = [
  { name: 'الرئيسية', path: '/', icon: <FaHome /> },
  { name: 'أنمي', path: '/anime', icon: <FaFilm /> },
  { name: 'مباريات', path: '/matches', icon: <FaFutbol /> },
  { name: 'الأكاديمية', path: '/courses', icon: <FaGraduationCap /> },
  { name: 'تحميل فيديوهات', path: '/downloader', icon: <FaFire /> },
];

const kidsNavigationLinks = [
  { name: 'الرئيسية', path: '/', icon: <FaHome /> },
  { name: 'أفلام كرتون اطفال', path: '/category/anime-movies', icon: <FaFilm /> },
  { name: 'مسلسلات كرتون اطفال', path: '/category/anime-series', icon: <FaTv /> },
  { name: 'أفلام مدبلجة', path: '/category/dubbed-movies', icon: <FaFilm /> },
];

const movieCategories = [
  { name: 'أفلام أجنبية', path: '/category/english-movies', icon: <FaFilm /> },
  { name: 'أفلام عربية', path: '/category/arabic-movies', icon: <FaFilm /> },
  { name: 'أفلام هندية', path: '/category/indian-movies', icon: <FaFilm /> },
  { name: 'أفلام تركية', path: '/category/turkish-movies', icon: <FaFilm /> },
  { name: 'أفلام آسيوية', path: '/category/asian-movies', icon: <FaFilm /> },
  { name: 'أفلام كرتون اطفال', path: '/category/anime-movies', icon: <FaFilm /> },
  { name: 'أفلام مدبلجة', path: '/category/dubbed-movies', icon: <FaFilm /> },
];

const seriesCategories = [
  { name: 'مسلسلات رمضان 2025', path: '/category/ramadan-2025', icon: <FaFire /> },
  { name: 'مسلسلات رمضان 2024', path: '/category/ramadan-2024', icon: <FaTv /> },
  { name: 'مسلسلات رمضان 2023', path: '/category/ramadan-2023', icon: <FaTv /> },
  { name: 'مسلسلات عربية', path: '/category/arabic-series', icon: <FaTv /> },
  { name: 'مسلسلات تركية', path: '/category/turkish-series', icon: <FaTv /> },
  { name: 'مسلسلات اجنبية', path: '/category/english-series', icon: <FaTv /> },
  { name: 'مسلسلات هندية', path: '/category/indian-series', icon: <FaTv /> },
  { name: 'مسلسلات آسياوية', path: '/category/asian-series', icon: <FaTv /> },
  { name: 'مسلسلات كرتون اطفال', path: '/category/anime-series', icon: <FaTv /> },
  { name: 'برامج تلفزيون', path: '/category/tv-programs', icon: <FaTv /> },
  { name: 'مسرحيات', path: '/category/plays', icon: <FaTv /> },
];

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
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

  // Handle unused prop to suppress lint
  useEffect(() => {
    if (onSearch) {
       // Placeholder to use onSearch if needed in future
    }
  }, [onSearch]);

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
      window.dispatchEvent(new Event('kidsModeChange'));
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

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const location = useLocation();

  const { onSearch: globalOnSearch } = useSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    // Check prop first, then context
    const currentOnSearch = onSearch || globalOnSearch;
    
    if (currentOnSearch) {
      currentOnSearch(searchInput);
      setIsSearchActive(false);
      setIsMenuOpen(false);
      return;
    }

    const finalQuery = kidsMode ? `${searchInput} كرتون` : searchInput;
    navigate(`/search?q=${finalQuery}`);
    setIsSearchActive(false);
    setIsMenuOpen(false);
  };

  /* Hide Navbar on Watch/Details pages for immersive experience */
  if (['/watch', '/details'].some(path => location.pathname.startsWith(path))) return null;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b 
      ${isScrolled 
          ? (kidsMode 
              ? 'h-16 sm:h-20 bg-white/90 backdrop-blur-xl border-kids-blue/20 shadow-lg' 
              : 'h-16 sm:h-20 bg-black/80 backdrop-blur-xl border-white/5')
          : (kidsMode
              ? 'h-20 sm:h-28 bg-transparent border-transparent'
              : 'h-20 sm:h-28 bg-transparent border-white/5')
      }`}>
      
      {kidsMode && (
        <>
          <div className="kids-decor-1 pointer-events-none" />
          <div className="kids-decor-2 pointer-events-none" />
        </>
      )}

        <div className="max-w-[1920px] mx-auto h-full px-2 xs:px-4 sm:px-6 md:px-10 lg:px-32 flex items-center justify-between gap-2">

          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            className={`lg:hidden text-2xl p-2.5 sm:p-3 rounded-xl transition-all
                       ${kidsMode 
                         ? 'bg-kids-blue/10 text-kids-blue hover:bg-kids-blue/20 border-2 border-kids-blue/30' 
                         : 'text-white border border-white/10 hover:bg-white/10'}`}
          >
            {isMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>

          {/* Search, User, Rewards, Kids Toggle - Hidden on mobile, visible on tablet+ */}
            <div className={`flex items-center gap-3 lg:gap-6 relative ${isSearchActive ? 'hidden lg:flex' : 'flex'}`}>
              <div className={`w-10 h-10 rounded-xl
                              items-center justify-center shadow-lg shrink-0
                              ${kidsMode ? 'bg-kids-yellow text-deep-slate-900' : 'bg-gradient-to-br from-ice-mint-active to-ice-mint'}
                              flex`}>
                {kidsMode ? <span className="text-lg">👶</span> : <FaUser className="text-deep-slate-900 text-sm" />}
              </div>
  
              <div className="flex items-center shrink-0">
                <button
                  onClick={() => setShowRewards(true)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all
                    ${kidsMode 
                      ? 'bg-orange-400 text-white shadow-[0_3px_0_#c2410c]' 
                      : 'bg-ice-mint/10 text-ice-mint border border-ice-mint/20 hover:bg-ice-mint/20'}
                  `}
                >
                  <FaCoins className={`text-base ${kidsMode ? 'animate-pulse' : ''}`} />
                  <span className="font-black text-xs">{user?.points || 0}</span>
                </button>
              </div>
  
              <button 
                  onClick={handleToggleKids}
                  className={`p-3 rounded-xl font-bold text-sm transition-all duration-300 items-center gap-2 flex
                            ${kidsMode 
                               ? 'bg-kids-green text-deep-slate-900 shadow-lg hover:bg-kids-green/90 hover:scale-105 ring-2 ring-kids-yellow ring-offset-2 ring-offset-kids-green' 
                               : 'bg-gradient-to-r from-deep-slate-800 to-deep-slate-700 border border-deep-slate-border hover:border-ice-mint text-white hover:shadow-[0_0_15px_rgba(127,255,212,0.3)]'}`}
              >
                    {kidsMode ? (
                        <>
                          <span className="hidden lg:inline">خروج</span>
                          <FaLock className="text-sm" />
                        </>
                    ) : (
                        <>
                          <span className="hidden lg:inline">وضع الأطفال</span>
                          <FaChild className={`${kidsMode ? 'text-white' : 'text-ice-mint'}`} />
                        </>
                    )}
              </button>
            </div>
  
            <Link 
              to={kidsMode ? "/category/anime-movies" : "/"} 
              aria-label="LMINA - الرئيسية"
              title="LMINA - العودة للرئيسية"
              className="flex items-center gap-2 group"
            >
              {kidsMode ? (
                  <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-kids-blue via-kids-pink to-kids-yellow italic select-none animate-bounce-slow drop-shadow-sm cursor-pointer hover:scale-110 transition-transform">
                    LMINA<span className="text-kids-green">.</span>KIDS
                  </span>
              ) : (
                  <span className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter
                                  bg-gradient-to-r 
                                  from-[#bf953f] via-[#fcf6ba] via-[#b38728] via-[#fcf6ba] to-[#bf953f]
                                  bg-[length:200%_auto] 
                                  bg-clip-text text-transparent
                                  italic select-none
                                  animate-shimmer-logo
                                  drop-shadow-[0_0_15px_rgba(184,135,40,0.3)]
                                  transition-all duration-500 hover:scale-110 cursor-pointer`}>
                    LMINA
                  </span>
              )}
            </Link>
          </div>
  
          <div className="hidden lg:flex justify-center -mt-3">
            <div className="bg-deep-slate-800/80 backdrop-blur-2xl border border-deep-slate-border rounded-full px-8 py-2 
                           shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center">
              <ul className={`flex flex-row-reverse items-center justify-center gap-1 
                             text-[11px] font-bold tracking-widest uppercase ${kidsMode ? 'text-deep-slate-700' : 'text-text-secondary'}`}>
                
                {(kidsMode ? kidsNavigationLinks : navigationLinks).map(link => (
                  <li key={link.path} className="relative group/link">
                    <Link
                      to={link.path}
                      className={`px-5 py-2.5 transition-all duration-300 rounded-full flex items-center gap-2
                                 ${!kidsMode && link.path === '/downloader' 
                                   ? 'bg-ice-mint/10 text-ice-mint border border-ice-mint/20 hover:bg-ice-mint/20' 
                                   : kidsMode
                                     ? 'hover:text-kids-blue hover:bg-kids-blue/10'
                                     : 'hover:text-white hover:bg-deep-slate-700'}`}
                    >
                      {!kidsMode && link.path === '/downloader' && (
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ice-mint opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-ice-mint"></span>
                        </span>
                      )}
                      {link.name}
                    </Link>
                  </li>
                ))}
  
                {!kidsMode && (
                  <>
                    <div className="w-[1px] h-4 bg-white/10 mx-3" />
                    
                    {/* Unified Premium Search Pill - High Visibility for Weak Vision */}
                    <li className="flex items-center group/pill-search">
                      <form onSubmit={handleSearch} className="flex flex-row-reverse items-center bg-white/10 hover:bg-white/20 rounded-full px-5 py-2.5 border border-white/20 focus-within:border-ice-mint focus-within:bg-black/60 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] group/form min-w-[140px]">
                        <button type="submit" className="text-ice-mint transition-all hover:scale-125 focus:outline-none" title="بحث">
                          <FaSearch size={18} />
                        </button>
                        <input 
                          type="text"
                          value={searchInput}
                          onChange={(e) => {
                            setSearchInput(e.target.value);
                            const currentOnSearch = onSearch || globalOnSearch;
                            if (currentOnSearch) currentOnSearch(e.target.value);
                          }}
                          placeholder="ابحث هنا..."
                          className="bg-transparent text-sm w-32 sm:group-focus-within/pill-search:w-72 transition-all duration-700 outline-none text-white text-right dir-rtl font-bold placeholder:text-white/40 px-3"
                          aria-label="ابحث عن أفلام أو مسلسلات"
                        />
                        <button
                          type="button"
                          onClick={handleVoiceSearch}
                          className={`transition-all p-2 rounded-full flex items-center justify-center ${isListening ? 'bg-ice-mint text-deep-slate-900 shadow-[0_0_15px_#7ffff0] animate-pulse' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                          title="بحث صوتي"
                        >
                          <FaMicrophone size={18} />
                        </button>
                      </form>
                    </li>
  
                    <div className="w-[1px] h-4 bg-white/10 mx-3" />
                    
                    <li className="group/menu relative">
                      <button className="px-5 py-2.5 flex items-center gap-2 hover:text-white transition-all duration-300 rounded-full hover:bg-white/5 uppercase">
                        الأفلام
                        <span className="text-[8px] opacity-40 group-hover/menu:rotate-180 group-hover/menu:text-amber-500 transition-all duration-500">▼</span>
                      </button>
                      <div className="absolute top-full right-0 pt-5 opacity-0 translate-y-4 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-500 z-50">
                        <div className="bg-black/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] w-64 grid gap-1">
                          {movieCategories.map((cat: any) => (
                            <Link key={cat.path} to={cat.path} className="flex flex-row-reverse items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-all text-sm group/item">
                              <span className="text-gray-400 group-hover/item:text-white font-medium">{cat.name}</span>
                              <span className="text-gray-600 group-hover/item:text-amber-500 transform group-hover/item:scale-110 transition-transform">{cat.icon}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </li>
  
                    <li className="group/menu relative">
                      <button className="px-5 py-2.5 flex items-center gap-2 hover:text-white transition-all duration-300 rounded-full hover:bg-white/5 uppercase">
                        المسلسلات
                        <span className="text-[8px] opacity-40 group-hover/menu:rotate-180 group-hover/menu:text-amber-500 transition-all duration-500">▼</span>
                      </button>
                      <div className="absolute top-full right-0 pt-5 opacity-0 translate-y-4 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-500 z-50">
                        <div className="bg-black/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] w-64 grid gap-1">
                          {seriesCategories.map((cat: any) => (
                            <Link key={cat.path} to={cat.path} className="flex flex-row-reverse items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-all text-sm group/item">
                              <span className="text-gray-400 group-hover/item:text-white font-medium">{cat.name}</span>
                              <span className="text-gray-600 group-hover/item:text-amber-500 transform group-hover/item:scale-110 transition-transform">{cat.icon}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
      </nav>


      <AnimatePresence>
        {isMenuOpen && (
          <>
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
              <nav role="navigation" aria-label="القائمة الجانبية" className="p-8 pt-24 space-y-10">
                <div className="relative group">
                   <form onSubmit={handleSearch} role="search">
                      <label htmlFor="mobile-search" className="sr-only">البحث عن المحتوى</label>
                      <input 
                        id="mobile-search"
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="ابحث عن فيلم أو مسلسل..."
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-right dir-rtl focus:border-amber-500 transition-all"
                        aria-label="ابحث في مكتبة LMINA"
                      />
                      <FaSearch aria-hidden="true" className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500" />
                   </form>
                </div>

                <button
                  onClick={() => {
                    if (kidsMode) {
                      setIsMenuOpen(false);
                      setShowPinModal(true);
                    } else {
                      setKidsMode(true);
                      window.dispatchEvent(new Event('kidsModeChange'));
                      navigate('/category/anime-movies');
                      setIsMenuOpen(false);
                    }
                  }}
                  aria-pressed={kidsMode}
                  aria-label={kidsMode ? "إيقاف وضع الأطفال الآمن" : "تشغيل وضع الأطفال الآمن"}
                  className={`
                    w-full p-5 rounded-3xl font-black text-base uppercase tracking-widest transition-all
                    flex flex-row-reverse items-center justify-center gap-3
                    ${kidsMode 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black shadow-[0_0_30px_rgba(250,204,21,0.5)] border-4 border-yellow-300' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}
                  `}
                >
                  <FaChild aria-hidden="true" className={`text-2xl ${kidsMode ? 'animate-bounce' : ''}`} />
                  <span>{kidsMode ? 'إيقاف وضع الأطفال' : 'تشغيل وضع الأطفال'}</span>
                </button>

                <div className="space-y-6">
                  <h4 className="sr-only">روابط الوصول السريع</h4>
                  <ul className="grid grid-cols-2 gap-3" role="list">
                      {navigationLinks
                        .filter(_ => !kidsMode)
                        .map(link => (
                          <li key={link.path}>
                              <Link 
                                to={link.path} 
                                onClick={() => setIsMenuOpen(false)}
                                title={link.name}
                                aria-label={link.name}
                                className={`flex flex-col items-center justify-center p-5 rounded-3xl border border-white/5 transition-all w-full
                                           ${link.path === '/downloader' ? 'bg-amber-600/10 border-amber-600/20 text-amber-500' : 'bg-white/5 text-white'}`}
                              >
                                  <span className="text-2xl mb-2" aria-hidden="true">{link.icon}</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                              </Link>
                          </li>
                      ))}
                  </ul>
                </div>
                
                <section className="space-y-8" aria-labelledby="categories-heading">
                    <h2 id="categories-heading" className="sr-only">أقسام المحتوى</h2>
                    <aside>
                        <div className="flex flex-row-reverse items-center gap-3 mb-4 px-2">
                           <div className="w-1 h-4 bg-amber-600 rounded-full" aria-hidden="true" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">الأفلام</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {movieCategories
                              .filter(cat => !kidsMode || cat.path.includes('anime') || cat.path.includes('dubbed'))
                              .map(cat => (
                                <Link 
                                    key={cat.path} 
                                    to={cat.path} 
                                    onClick={() => setIsMenuOpen(false)} 
                                    title={`مشاهدة ${cat.name}`}
                                    className="flex flex-row-reverse items-center justify-between p-4 bg-white/[0.03] hover:bg-white/5 rounded-2xl border border-white/5 text-white transition-all group"
                                >
                                    <span className="text-sm font-bold group-hover:text-amber-500">{cat.name}</span>
                                    <span aria-hidden="true" className="text-gray-600 group-hover:text-amber-500 group-hover:scale-110 transition-all">{cat.icon}</span>
                                </Link>
                            ))}
                        </div>
                    </aside>

                    <aside>
                        <div className="flex flex-row-reverse items-center gap-3 mb-4 px-2">
                           <div className="w-1 h-4 bg-amber-600 rounded-full" aria-hidden="true" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">المسلسلات</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {seriesCategories
                              .filter(cat => !kidsMode || cat.path.includes('anime'))
                              .map(cat => (
                                <Link 
                                    key={cat.path} 
                                    to={cat.path} 
                                    onClick={() => setIsMenuOpen(false)} 
                                    title={`مشاهدة ${cat.name}`}
                                    className="flex flex-row-reverse items-center justify-between p-4 bg-white/[0.03] hover:bg-white/5 rounded-2xl border border-white/5 text-white transition-all group"
                                >
                                    <span className="text-sm font-bold group-hover:text-amber-500">{cat.name}</span>
                                    <span aria-hidden="true" className="text-gray-600 group-hover:text-amber-500 group-hover:scale-110 transition-all">{cat.icon}</span>
                                </Link>
                            ))}
                        </div>
                    </aside>
                </section>

                <footer className="pt-10 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">LMINA PREMIUM v2.0</p>
                </footer>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mb-4 shadow-xl shadow-amber-500/20">
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
              className={`${kidsMode ? 'bg-white border-4 border-kids-yellow shadow-2xl' : 'bg-zinc-900 border border-white/10'} p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-sm w-full text-center overflow-y-auto max-h-[90vh]`}
            >
              <FaLock className={`${kidsMode ? 'text-kids-blue' : 'text-amber-500'} text-4xl mx-auto mb-6`} />
              <h3 className={`text-xl font-black mb-2 ${kidsMode ? 'text-deep-slate-900' : 'text-white'}`}>منطقة الوالدين</h3>
              <p className={`${kidsMode ? 'text-gray-500' : 'text-gray-400'} text-sm mb-6`}>أدخل الرمز الافتراضي (1234) للخروج من وضع الأطفال</p>
              <input 
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className={`w-full p-4 rounded-2xl text-center text-2xl tracking-[1em] mb-6 outline-none border transition-all ${kidsMode ? 'bg-gray-50 border-kids-blue/30 text-deep-slate-900 focus:border-kids-blue' : 'bg-white/5 border-white/10 text-white focus:border-amber-500'}`}
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowPinModal(false)}
                  className={`flex-1 p-4 rounded-2xl font-bold ${kidsMode ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-white/5 text-gray-400'}`}
                >
                  إلغاء
                </button>
                <button 
                  onClick={verifyPin}
                  className={`flex-1 p-4 rounded-2xl font-bold ${kidsMode ? 'bg-kids-blue text-deep-slate-900 hover:bg-kids-blue/90' : 'bg-amber-600 text-black'}`}
                >
                  تأكيد
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
};

export default Navbar;
