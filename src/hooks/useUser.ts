import { useState, useEffect } from 'react';
import { initUser, getUserStatus, UserStatus } from '../services/api';

export const useUser = () => {
    const [user, setUser] = useState<UserStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                // Get ref from URL
                const urlParams = new URLSearchParams(window.location.search);
                const ref = urlParams.get('ref');
                
                let userId = localStorage.getItem('meih_user_id');
                
                const userData = await initUser(userId || undefined, ref || undefined);
                
                if (userData) {
                    localStorage.setItem('meih_user_id', userData.id);
                    setUser(userData);
                }
            } catch (error) {
                console.error("Failed to load user:", error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const refreshStatus = async () => {
       if (!user) return;
       const data = await getUserStatus(user.id);
       setUser(data);
    };

    const getReferralLink = () => {
        if (!user) return '';
        const base = window.location.origin;
        return `${base}?ref=${user.id}`;
    };

    return { user, loading, refreshStatus, getReferralLink };
};
