import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const ConnectionFixer: React.FC = () => {
    const [isBlocked, setIsBlocked] = useState(false);
    const [apiUrl, setApiUrl] = useState('');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Get the actual base URL from axios instance
                const url = api.defaults.baseURL || '';
                setApiUrl(url);

                if (!url || url.includes('localhost') || url.includes('vercel.app')) {
                    return; // Don't check if local or self-referencing
                }

                // Let's try a real fetch and catch the error.
                await fetch(`${url}/health`);
                setIsBlocked(false);
            } catch (error) {
                console.error("API connection failed. Probable browser block.", error);
                setIsBlocked(true);
            }
        };

        checkConnection();
        // Check every 30 seconds
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!isBlocked) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 z-[9999] md:left-auto md:w-96 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-zinc-900 border border-red-900/50 p-6 rounded-2xl shadow-2xl backdrop-blur-xl">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1 text-right">المحتوى مخفي؟</h3>
                        <p className="text-zinc-400 text-sm mb-4 leading-relaxed text-right">
                            متصفحك يمنع الاتصال بسيرفر الأفلام لأسباب أمنية. اضغط على الزر أدناه ثم اختر "إعدادات متقدمة" ثم "متابعة" لتفعيل المحتوى.
                        </p>
                        <button 
                            onClick={() => window.open(apiUrl, '_blank')}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-red-600/20"
                        >
                            تنشيط السيرفر الآن
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionFixer;
