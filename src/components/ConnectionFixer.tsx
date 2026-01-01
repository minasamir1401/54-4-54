import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const ConnectionFixer: React.FC = () => {
    const [isBlocked, setIsBlocked] = useState(false);
    const [apiUrl, setApiUrl] = useState('');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Get the actual base URL from axios instance safely
                const url = api?.defaults?.baseURL || '';
                setApiUrl(url);

                if (!url || url.includes('localhost') || url.includes('vercel.app')) {
                    return;
                }

                // Use AbortController for timeouts to avoid hanging requests
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                try {
                    const response = await fetch(`${url}/health`, { 
                        method: 'GET',
                        signal: controller.signal
                    });
                    
                    if (response.ok) {
                        setIsBlocked(false);
                    } else {
                        setIsBlocked(true);
                    }
                } catch (e) {
                    setIsBlocked(true);
                } finally {
                    clearTimeout(timeoutId);
                }
            } catch (error) {
                console.error("Connection check failed:", error);
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 15000);
        return () => clearInterval(interval);
    }, []);

    if (!isBlocked) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            zIndex: 99999,
            background: '#18181b',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #7f1d1d',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            direction: 'rtl'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ color: 'white', fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '18px' }}>تنبيه بخصوص المحتوى</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.5' }}>
                        المتصفح يمنع الاتصال بسيرفر الأفلام. لتفعيل المحتوى، اضغط على الزر وافتح الرابط ثم اختر "متابعة".
                    </p>
                    <button 
                        onClick={() => {
                            if (apiUrl) window.open(apiUrl, '_blank');
                        }}
                        style={{
                            width: '100%',
                            background: '#e11d48',
                            color: 'white',
                            fontWeight: 'bold',
                            padding: '12px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        تنشيط الموقع الآن
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectionFixer;
