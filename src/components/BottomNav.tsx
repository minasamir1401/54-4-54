import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaDownload, FaGraduationCap, FaChild, FaLock, FaFilm } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomNav = () => {
    const location = useLocation();
    const [kidsMode, setKidsMode] = useState(localStorage.getItem('kidsMode') === 'true');


    const navigate = useNavigate();
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');

    const handleKidsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (kidsMode) {
            // If already in kids mode, ask for PIN to exit
            setShowPinModal(true);
        } else {
            // Enter kids mode
            setKidsMode(true);
            localStorage.setItem('kidsMode', 'true');
            window.dispatchEvent(new Event('kidsModeChange'));
            navigate('/category/anime-movies');
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
        } else {
            alert('رمز خاطئ! اسأل والديك.');
        }
    };

    useEffect(() => {
        const handleKidsChange = () => setKidsMode(localStorage.getItem('kidsMode') === 'true');
        window.addEventListener('kidsModeChange', handleKidsChange);
        return () => window.removeEventListener('kidsModeChange', handleKidsChange);
    }, []);

    const navItems = [
        { 
            name: 'الرئيسية', 
            path: '/', 
            icon: <FaHome />,
            match: (path: string) => path === '/'
        },
        { 
            name: 'أنمي', 
            path: '/anime', 
            icon: <FaFilm />,
            match: (path: string) => path === '/anime'
        },
        { 
            name: 'التحميل', 
            path: '/downloader', 
            icon: <FaDownload />,
            match: (path: string) => path === '/downloader'
        },
        { 
            name: 'الكورسات', 
            path: '/courses', 
            icon: <FaGraduationCap />,
            match: (path: string) => path.includes('/courses')
        },
        {
            name: 'وضع الأطفال',
            path: '#',
            icon: <FaChild />,
            isAction: true,
            action: handleKidsClick,
            isActive: kidsMode
        }
    ];
    
    /* Hide BottomNav on Watch/Details pages */
    if (['/watch', '/details'].some(path => location.pathname.startsWith(path))) return null;

    // Dynamic active color
    const getActiveColor = () => kidsMode ? 'text-kids-blue' : 'text-ice-mint';
    const getActiveBg = () => kidsMode ? 'bg-kids-blue' : 'bg-ice-mint';
    const getInactiveColor = () => kidsMode ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200';

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[90%] max-w-sm md:hidden">
            <div className={`
                backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 shadow-2xl
                flex items-center justify-between
                ${kidsMode ? 'bg-white/90 border-blue-200' : 'bg-deep-slate-800/90 border-deep-slate-border'}
            `}>
                {navItems.map((item: any) => {
                    const isActive = item.isActive !== undefined ? item.isActive : item.match(location.pathname);
                    return (
                        <Link 
                            key={item.name} 
                            to={item.path}
                            onClick={item.isAction ? item.action : undefined}
                            className={`
                                flex flex-col items-center gap-1 transition-all duration-300 relative
                                ${isActive ? `${getActiveColor()} -translate-y-1` : getInactiveColor()}
                            `}
                        >
                            <span className={`text-xl ${isActive ? 'filter drop-shadow-[0_0_10px_rgba(127,255,212,0.4)]' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-bold">{item.name}</span>
                            {isActive && !item.isAction && (
                                <span className={`absolute -bottom-2 w-1 h-1 rounded-full ${getActiveBg()}`} />
                            )}
                        </Link>
                    );
                })}
            </div>
            </div>

            <AnimatePresence>
                {showPinModal && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`${kidsMode ? 'bg-white border-4 border-kids-yellow shadow-2xl' : 'bg-zinc-900 border border-white/10'} p-6 rounded-[2rem] max-w-sm w-full text-center overflow-y-auto`}
                        >
                            <FaLock className={`${kidsMode ? 'text-kids-blue' : 'text-amber-500'} text-4xl mx-auto mb-6`} />
                            <h3 className={`text-xl font-black mb-2 ${kidsMode ? 'text-deep-slate-900' : 'text-white'}`}>منطقة الوالدين</h3>
                            <p className={`${kidsMode ? 'text-gray-500' : 'text-gray-400'} text-sm mb-6`}>أدخل الرمز الافتراضي (1234) للخروج</p>
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

export default BottomNav;
