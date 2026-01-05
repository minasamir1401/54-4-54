import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FaGraduationCap
} from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import { redeemReward } from '../services/api';

/* =======================
   CATEGORIES (IMPORTANT)
======================= */
const navigationLinks = [
  { name: 'الرئيسية', path: '/', icon: <FaHome /> },
  { name: 'الأكاديمية', path: '/courses', icon: <FaGraduationCap /> },
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
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b border-white/5
      ${isScrolled ? 'h-16 sm:h-20 bg-black/80 backdrop-blur-xl' : 'h-20 sm:h-28 bg-transparent'}`}>
      
      {kidsMode && (
        <>
          <div className="kids-decor-1 pointer-events-none" />
          <div className="kids-decor-2 pointer-events-none" />
        </>
      )}

        <div className="max-w-[1920px] mx-auto h-full px-2 xs:px-4 sm:px-10 md:px-32 flex items-center justify-between gap-2">

          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            className="lg:hidden text-white text-2xl p-2 rounded-xl
                       border border-white/10 hover:bg-white/10"
          >
            {isMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>

          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 md:gap-8 relative">
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <input
                type="text"
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                placeholder="بحث..."
                aria-label="ابحث عن الأفلام والمسلسلات"
                className={`
                  bg-white/10 border border-white/20 text-xs sm:text-sm p-2 sm:p-3 rounded-2xl
                  placeholder-gray-400 focus:outline-none focus:border-amber-500
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
                           ${isListening ? 'text-white bg-indigo-600 animate-pulse' : 'text-gray-300 hover:text-indigo-400'}
                           ${kidsMode ? 'bg-yellow-400 text-black shadow-lg scale-110' : ''}`}
              >
                <FaMicrophone aria-hidden="true" />
              </button>
            </form>

            <div className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 bg-gradient-to-br
                            from-amber-600 to-yellow-500 rounded-lg xs:rounded-xl
                            items-center justify-center shadow-lg shrink-0
                            ${isSearchActive ? 'hidden xs:flex' : 'flex'}`}>
              <FaUser className="text-white text-[10px] xs:text-xs sm:text-sm" />
            </div>

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

          <Link 
            to={kidsMode ? "/category/anime-movies" : "/"} 
            aria-label="LMINA - الرئيسية"
            title="LMINA - العودة للرئيسية"
            className="flex items-center gap-2 group"
          >
            <span className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter
                           bg-gradient-to-r 
                           ${kidsMode 
                             ? 'from-[#FF6B6B] via-[#4ECDC4] via-[#FFE66D] to-[#FF6B6B]' 
                             : 'from-[#bf953f] via-[#fcf6ba] via-[#b38728] via-[#fcf6ba] to-[#bf953f]'}
                           bg-[length:200%_auto] 
                           bg-clip-text text-transparent
                           italic select-none
                           animate-shimmer-logo
                           ${kidsMode ? 'animate-bounce-slow' : 'drop-shadow-[0_0_15px_rgba(184,135,40,0.3)]'}
                           transition-all duration-500 hover:scale-110 cursor-pointer`}>
              LMINA
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex justify-center -mt-3">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-2 
                         shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center">
            <ul className="flex flex-row-reverse items-center justify-center gap-1 
                           text-[11px] font-bold tracking-widest uppercase text-gray-300">
              
              {navigationLinks
                .filter(_ => !kidsMode)
                .map(link => (
                <li key={link.path} className="relative group/link">
                  <Link
                    to={link.path}
                    className={`px-5 py-2.5 transition-all duration-300 rounded-full flex items-center gap-2
                               ${link.path === '/downloader' 
                                 ? 'bg-amber-600/10 text-amber-500 border border-amber-600/20 hover:bg-amber-600/20' 
                                 : 'hover:text-white hover:bg-white/5'}`}
                  >
                    {link.path === '/downloader' && (
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    )}
                    {link.name}
                    {link.path === '/downloader' && (
                      <span className="bg-amber-600 text-[7px] px-1.5 py-0.5 rounded-sm font-black text-white ml-1 animate-pulse">
                        NEW
                      </span>
                    )}
                  </Link>
                </li>
              ))}

              <div className="w-[1px] h-4 bg-white/10 mx-3" />
              
              <li className="group/menu relative">
                <button className="px-5 py-2.5 flex items-center gap-2 hover:text-white transition-all duration-300 rounded-full hover:bg-white/5 uppercase">
                  الأفلام
                  <span className="text-[8px] opacity-40 group-hover/menu:rotate-180 group-hover/menu:text-amber-500 transition-all duration-500">▼</span>
                </button>
                <div className="absolute top-full right-0 pt-5 opacity-0 translate-y-4 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-500 z-50">
                  <div className="bg-black/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] w-64 grid gap-1">
                    {movieCategories
                      .filter(cat => !kidsMode || cat.path.includes('anime') || cat.path.includes('dubbed'))
                      .map(cat => (
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
                    {seriesCategories
                      .filter(cat => !kidsMode || cat.path.includes('anime'))
                      .map(cat => (
                      <Link key={cat.path} to={cat.path} className="flex flex-row-reverse items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-all text-sm group/item">
                         <span className="text-gray-400 group-hover/item:text-white font-medium">{cat.name}</span>
                         <span className="text-gray-600 group-hover/item:text-amber-500 transform group-hover/item:scale-110 transition-transform">{cat.icon}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
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
              <div className="p-8 pt-24 space-y-10">
                <div className="relative group">
                   <form onSubmit={handleSearch}>
                      <input 
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="ابحث عن فيلم أو مسلسل..."
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-right dir-rtl focus:border-amber-500 transition-all"
                      />
                      <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500" />
                   </form>
                </div>

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

                <ul className="grid grid-cols-2 gap-3">
                    {navigationLinks
                      .filter(_ => !kidsMode)
                      .map(link => (
                        <li key={link.path}>
                            <Link 
                              to={link.path} 
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex flex-col items-center justify-center p-5 rounded-3xl border border-white/5 transition-all w-full
                                         ${link.path === '/downloader' ? 'bg-amber-600/10 border-amber-600/20 text-amber-500' : 'bg-white/5 text-white'}`}
                            >
                                <span className="text-2xl mb-2">{link.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                
                <div className="space-y-8">
                    <div>
                        <div className="flex flex-row-reverse items-center gap-3 mb-4 px-2">
                           <div className="w-1 h-4 bg-amber-600 rounded-full" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">الأفلام</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {movieCategories
                              .filter(cat => !kidsMode || cat.path.includes('anime') || cat.path.includes('dubbed'))
                              .map(cat => (
                                <Link key={cat.path} to={cat.path} onClick={() => setIsMenuOpen(false)} className="flex flex-row-reverse items-center justify-between p-4 bg-white/[0.03] hover:bg-white/5 rounded-2xl border border-white/5 text-white transition-all group">
                                    <span className="text-sm font-bold group-hover:text-amber-500">{cat.name}</span>
                                    <span className="text-gray-600 group-hover:text-amber-500 group-hover:scale-110 transition-all">{cat.icon}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-row-reverse items-center gap-3 mb-4 px-2">
                           <div className="w-1 h-4 bg-amber-600 rounded-full" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">المسلسلات</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {seriesCategories
                              .filter(cat => !kidsMode || cat.path.includes('anime'))
                              .map(cat => (
                                <Link key={cat.path} to={cat.path} onClick={() => setIsMenuOpen(false)} className="flex flex-row-reverse items-center justify-between p-4 bg-white/[0.03] hover:bg-white/5 rounded-2xl border border-white/5 text-white transition-all group">
                                    <span className="text-sm font-bold group-hover:text-amber-500">{cat.name}</span>
                                    <span className="text-gray-600 group-hover:text-amber-500 group-hover:scale-110 transition-all">{cat.icon}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">LMINA PREMIUM v2.0</p>
                </div>
              </div>
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
              className="bg-zinc-900 border border-white/10 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-sm w-full text-center overflow-y-auto max-h-[90vh]"
            >
              <FaLock className="text-amber-500 text-4xl mx-auto mb-6" />
              <h3 className="text-xl font-black mb-2 text-white">منطقة الوالدين</h3>
              <p className="text-gray-400 text-sm mb-6">أدخل الرمز الافتراضي (1234) للخروج من وضع الأطفال</p>
              <input 
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-center text-2xl tracking-[1em] text-white mb-6 focus:border-amber-500 outline-none"
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
                  className="flex-1 p-4 rounded-2xl bg-amber-600 text-black font-bold"
                >
                  تأكيد
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer-logo {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .animate-shimmer-logo {
          animation: shimmer-logo 4s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }

        .kids-mode {
          background-color: #f0f9ff !important;
          background-image: 
            linear-gradient(120deg, #f0f9ff 0%, #e0f2fe 50%, #fdf2f8 100%) !important;
          background-size: 400% 400% !important;
          animation: bg-gradient-move 15s infinite alternate ease-in-out !important;
          color: #1e293b !important;
          font-family: 'Almarai', sans-serif !important;
          overflow-x: hidden;
        }

        @keyframes bg-gradient-move {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        /* More Floating Decorations */
        .kids-mode::after {
          content: '🎈';
          position: fixed;
          top: 10%;
          right: 8%;
          font-size: 50px;
          opacity: 0.5;
          z-index: -1;
          animation: float-fun 8s infinite ease-in-out;
        }

        .kids-mode::before {
          content: '🚀';
          position: fixed;
          bottom: 20%;
          left: 5%;
          font-size: 60px;
          opacity: 0.3;
          z-index: -1;
          animation: fly-across 20s infinite linear;
        }

        .kids-decor-1::after {
          content: '☁️';
          position: fixed;
          top: 25%;
          left: 15%;
          font-size: 40px;
          opacity: 0.4;
          z-index: -1;
          animation: float-fun 12s infinite ease-in-out reverse;
        }

        .kids-decor-2::after {
          content: '🍭';
          position: fixed;
          bottom: 10%;
          right: 15%;
          font-size: 45px;
          opacity: 0.4;
          z-index: -1;
          animation: sparkle 4s infinite alternate;
        }

        @keyframes float-fun {
          0%, 100% { transform: translateY(0) rotate(5deg) scale(1); }
          50% { transform: translateY(-30px) rotate(-5deg) scale(1.1); }
        }

        @keyframes fly-across {
          0% { left: -10%; transform: rotate(45deg); }
          100% { left: 110%; transform: rotate(45deg); }
        }

        @keyframes sparkle {
          0% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg); }
          100% { transform: scale(1.2) rotate(15deg); filter: hue-rotate(90deg); }
        }
        
        .kids-mode nav {
          background: linear-gradient(90deg, #60a5fa, #f472b6, #fbbf24, #60a5fa) !important;
          background-size: 200% auto !important;
          animation: rainbow-flow 6s linear infinite !important;
          border-bottom: 4px solid rgba(255,255,255,0.4) !important;
          box-shadow: 0 8px 32px rgba(96, 165, 250, 0.2) !important;
        }

        @keyframes rainbow-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .kids-mode .fire-text, .kids-mode .premium-text {
          background: white !important;
          -webkit-background-clip: text !important;
          color: transparent !important;
          filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.1)) !important;
          font-weight: 900 !important;
        }

        .kids-mode a, .kids-mode button {
          border-radius: 20px !important;
          border: 3px solid white !important;
          background: rgba(255,255,255,0.9) !important;
          color: #4338ca !important;
          font-weight: 800 !important;
          box-shadow: 0 6px 0px rgba(0,0,0,0.05) !important;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }

        .kids-mode a:hover, .kids-mode button:hover {
          transform: scale(1.1) translateY(-5px) !important;
          background: #fdf2f8 !important;
          border-color: #f472b6 !important;
          color: #be185d !important;
        }

        .kids-mode .bg-zinc-900, 
        .kids-mode .bg-white\\/5,
        .kids-mode .bg-zinc-900\\/50,
        .kids-mode .bg-white\\/\\[0\\.03\\] {
          background: #fff !important;
          border: 4px solid #fde68a !important; /* Pastel Yellow border */
          border-radius: 30px !important;
          color: #1e293b !important;
          box-shadow: 0 10px 0px #fef3c7 !important;
        }

        .kids-mode h1, .kids-mode h2, .kids-mode h3 {
          color: #4338ca !important;
          font-weight: 900 !important;
        }
      `}</style>
    </>
  );
};

export default Navbar;
