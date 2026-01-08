import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Background3D from './components/Background3D';
import KidsBackground from './components/KidsBackground';
import InstallPrompt from './components/InstallPrompt';
import ScrollToTop from './components/ScrollToTop';
import { useState, useEffect } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Watch = lazy(() => import('./pages/Watch'));
const Search = lazy(() => import('./pages/Search'));
const CategoryPage = lazy(() => import('./pages/Category'));
const Downloader = lazy(() => import('./pages/Downloader'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseWatch = lazy(() => import('./pages/CourseWatch'));
const Matches = lazy(() => import('./pages/Matches'));
const Anime = lazy(() => import('./pages/Anime'));

const App = () => {
  const location = useLocation();
  const [kidsMode, setKidsMode] = useState(localStorage.getItem('kidsMode') === 'true');

  useEffect(() => {
    const handleKidsChange = () => {
      setKidsMode(localStorage.getItem('kidsMode') === 'true');
    };
    window.addEventListener('kidsModeChange', handleKidsChange);
    return () => window.removeEventListener('kidsModeChange', handleKidsChange);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${kidsMode ? 'bg-white text-deep-slate-900 selection:bg-kids-pink/30' : 'bg-deep-slate-900 selection:bg-ice-mint/30'}`}>
      <Background3D />
      <KidsBackground />
      <InstallPrompt />
      <ScrollToTop />
      <ErrorBoundary>
        <Navbar key={`navbar-${kidsMode}`} />
        <BottomNav key={`bottomnav-${kidsMode}`} />
        <Suspense fallback={
          <div className="bg-deep-slate-900 h-screen text-white flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-2 border-ice-mint border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">جاري التحميل...</p>
          </div>
        }>
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/downloader" element={<Downloader />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/academy" element={<Courses />} />
                <Route path="/course/:id" element={<CourseWatch />} />
                <Route path="/category/:catId" element={<CategoryPage />} />
                <Route path="/details/:id" element={<Watch />} />
                <Route path="/watch/:id" element={<Watch />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/anime" element={<Anime />} />
              </Routes>
            </motion.main>
          </AnimatePresence>
        </Suspense>
        <Footer />
      </ErrorBoundary>
    </div>
  );
};

export default App;
