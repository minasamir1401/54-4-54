import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import Background3D from './components/Background3D';
import InstallPrompt from './components/InstallPrompt';

const Home = lazy(() => import('./pages/Home'));
const Watch = lazy(() => import('./pages/Watch'));
const Search = lazy(() => import('./pages/Search'));
const CategoryPage = lazy(() => import('./pages/Category'));
const Downloader = lazy(() => import('./pages/Downloader'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseWatch = lazy(() => import('./pages/CourseWatch'));

const App = () => {
  const location = useLocation();

  return (
    <div className="bg-transparent min-h-screen selection:bg-amber-600/30">
      <Background3D />
      <InstallPrompt />
      <ErrorBoundary>
        <Navbar />
        <Suspense fallback={
          <div className="bg-[#0a0a0a] h-screen text-white flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">جاري التحميل...</p>
          </div>
        }>
          <div className="pb-24 lg:pb-0">
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
                </Routes>
              </motion.main>
            </AnimatePresence>
          </div>
        </Suspense>
        <BottomNav />
      </ErrorBoundary>
    </div>
  );
};

export default App;
