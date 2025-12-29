import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ContentItem } from '../services/api';
import { FaHistory, FaTrash } from 'react-icons/fa';

const HistoryRow = () => {
  const [history, setHistory] = useState<ContentItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('watch_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('watch_history');
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <FaHistory className="text-primary text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">تابع المشاهدة</h2>
        </div>
        <button 
          onClick={clearHistory}
          className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-sm"
        >
          <FaTrash size={12} />
          مسح السجل
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {history.slice(0, 6).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/watch/${item.id}`} className="group block">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg">
                <img 
                  src={item.poster} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                   <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-primary" />
                   </div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-200 group-hover:text-primary transition-colors line-clamp-2 text-center">
                {item.title}
              </h3>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HistoryRow;
