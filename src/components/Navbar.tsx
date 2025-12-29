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
  FaFire
} from 'react-icons/fa';

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
  { name: 'أفلام آسيوية', path: '/category/asian-movies', icon: <FaFilm /> },
  { name: 'أفلام أنمي', path: '/category/anime-movies', icon: <FaFilm /> },
  { name: 'أفلام مدبلجة', path: '/category/dubbed-movies', icon: <FaFilm /> },
];

const seriesCategories = [
  { name: 'مسلسلات تركية', path: '/category/turkish-series', icon: <FaTv /> },
  { name: 'مسلسلات عربية', path: '/category/arabic-series', icon: <FaTv /> },
  { name: 'مسلسلات رمضان 2025', path: '/category/ramadan-2025', icon: <FaFire /> },
  { name: 'مسلسلات اجنبية', path: '/category/english-series', icon: <FaTv /> },
  { name: 'مسلسلات آسياوية', path: '/category/asian-series', icon: <FaTv /> },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  /* =======================
     SCROLL EFFECT
  ======================= */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* =======================
     SEARCH
  ======================= */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    navigate(`/search?q=${searchInput}`);
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
        <div className="max-w-[1920px] mx-auto h-full px-4 md:px-10 flex items-center justify-between">

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="xl:hidden text-white text-2xl p-2 rounded-xl
                       border border-white/10 hover:bg-white/10"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* SEARCH + USER */}
          <div className="flex items-center gap-4 relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                placeholder="بحث..."
                className={`
                  bg-white/10 border border-white/20 text-sm p-3 rounded-2xl
                  placeholder-gray-400 focus:outline-none focus:border-red-600
                  transition-all duration-300 text-right dir-rtl text-white
                  ${isSearchActive
                    ? 'w-44 sm:w-64 opacity-100 pr-12 pl-10'
                    : 'w-0 opacity-0 pointer-events-none'}
                `}
              />

              <button
                type="button"
                onClick={() => setIsSearchActive(true)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
              >
                <FaSearch />
              </button>

              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                >
                  <FaTimes />
                </button>
              )}
            </form>

            <div className="hidden sm:flex w-10 h-10 bg-gradient-to-br
                            from-red-600 to-red-800 rounded-xl
                            items-center justify-center shadow-lg">
              <FaUser className="text-white text-sm" />
            </div>
          </div>

          {/* LOGO - LMINA Text */}
          <Link to="/" className="flex items-center gap-2 group">
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
        <div className="hidden xl:flex justify-center -mt-3">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-2 
                         shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center">
            <ul className="flex flex-row-reverse items-center justify-center gap-1 
                           text-[11px] font-bold tracking-widest uppercase text-gray-300">
              
              {/* Static Links */}
              {navigationLinks.map(link => (
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
                    {movieCategories.map(cat => (
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
                    {seriesCategories.map(cat => (
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
              className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990]"
            />
            
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="xl:hidden fixed top-0 right-0 bottom-0 w-[85%] sm:w-[380px] 
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

                {/* Quick Action Pills */}
                <div className="grid grid-cols-2 gap-3">
                    {navigationLinks.map(link => (
                        <Link 
                          key={link.path} 
                          to={link.path} 
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex flex-col items-center justify-center p-5 rounded-3xl border border-white/5 transition-all
                                     ${link.path === '/downloader' ? 'bg-red-600/10 border-red-600/20 text-red-500' : 'bg-white/5 text-white'}`}
                        >
                            <span className="text-2xl mb-2">{link.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                        </Link>
                    ))}
                </div>
                
                {/* Categories Sections */}
                <div className="space-y-8">
                    <div>
                        <div className="flex flex-row-reverse items-center gap-3 mb-4 px-2">
                           <div className="w-1 h-4 bg-red-600 rounded-full" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">الأفلام</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {movieCategories.map(cat => (
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
                            {seriesCategories.map(cat => (
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
    </>
  );
};

export default Navbar;
