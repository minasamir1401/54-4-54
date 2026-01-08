import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component - High Priority Force Reset
 * Resolves the issue where navigation might land the user at the bottom of the page.
 */
const ScrollToTop = () => {
    const { pathname, search } = useLocation();

    // Disable browser's automatic scroll restoration to prevent jumping
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    // Use useLayoutEffect for immediate execution before paint
    useLayoutEffect(() => {
        // Immediate forceful reset
        window.scrollTo(0, 0);
        document.documentElement.scrollTo(0, 0);
        document.body.scrollTo(0, 0);
        
        // Secondary reset to catch any post-render layout shifts
        const timeoutId = setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
        }, 50);

        return () => clearTimeout(timeoutId);
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;
