import { useEffect } from 'react';

const GlobalPopunder = () => {
    useEffect(() => {
        const handleClick = () => {
            // User wants "more ads", so we trigger on EVERYTHING.
            const lastPopTime = sessionStorage.getItem('last_popunder_time');
            const now = Date.now();

            // Refresh cooldown: 5 minutes
            if (lastPopTime && (now - parseInt(lastPopTime) < 5 * 60 * 1000)) {
                return;
            }

            // High Aggression: Trigger every minute on any click
            const win = window.open('https://offevasionrecruit.com/zic21a2k4s?key=b01e21cf613c7a05ddb4e54f14865584', '_blank');

            if (win) {
                sessionStorage.setItem('last_popunder_time', now.toString());
                window.focus();
            }
        };

        // Attach to document
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    return null; // Invisible component
};

export default GlobalPopunder;
