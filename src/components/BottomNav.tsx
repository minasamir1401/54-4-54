import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaGraduationCap, FaDownload, FaSearch, FaFilm } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const location = useLocation();
    const kidsMode = localStorage.getItem('kidsMode') === 'true';

    const navItems = [
        { name: 'الرئيسية', path: '/', icon: <FaHome /> },
        { name: 'الأقسام', path: '/category/all', icon: <FaFilm />, hideInKids: true },
        { name: 'بحث', path: '/search', icon: <FaSearch /> },
        { name: 'الأكاديمية', path: '/courses', icon: <FaGraduationCap />, hideInKids: true },
        { name: 'التحميل', path: '/downloader', icon: <FaDownload />, hideInKids: true },
    ];

    if (kidsMode) {
        // Simple nav for kids - Floating style
        return (
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[9995]">
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-2xl border-4 border-white rounded-[2.5rem] p-4 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                >
                    <Link to="/" className={`p-4 rounded-2xl transition-all ${location.pathname === '/' ? 'bg-amber-400 text-white shadow-lg scale-110' : 'text-gray-400 opacity-60'}`}>
                        <FaHome size={24} />
                    </Link>
                    <Link to="/category/anime-movies" className={`p-4 rounded-2xl transition-all ${location.pathname.includes('anime') ? 'bg-pink-400 text-white shadow-lg scale-110' : 'text-gray-400 opacity-60'}`}>
                        <FaFilm size={24} />
                    </Link>
                    <Link to="/search" className={`p-4 rounded-2xl transition-all ${location.pathname === '/search' ? 'bg-blue-400 text-white shadow-lg scale-110' : 'text-gray-400 opacity-60'}`}>
                        <FaSearch size={24} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[9995]">
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-[#0c0c0c]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
                {navItems
                    .filter(item => !item.hideInKids || !kidsMode)
                    .map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path.split('/')[1]));
                        return (
                            <Link
                                key={item.path}
                                to={item.path === '/category/all' ? '/category/english-movies' : item.path}
                                className="relative flex flex-col items-center justify-center p-3 transition-all duration-300"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavActive"
                                        className="absolute inset-0 bg-amber-500/10 rounded-2xl border border-amber-500/20"
                                        transition={{ type: "spring", damping: 15, stiffness: 300 }}
                                    />
                                )}
                                <span className={`text-xl mb-1 transition-colors ${isActive ? 'text-amber-500 font-bold scale-110' : 'text-gray-500 opacity-60'}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'text-amber-500' : 'text-gray-600'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
            </motion.div>
        </div>
    );
};

export default BottomNav;
