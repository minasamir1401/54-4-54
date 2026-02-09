import { useEffect, useState, useRef } from 'react';

const SecurityGuard = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const sequence = useRef('');

    useEffect(() => {
        // 1. Secret Sequence Listener ("mina")
        const handleKeyDown = (e: KeyboardEvent) => {
            const char = e.key.toLowerCase();
            // Only capture single characters to avoid 'Control', 'Shift', etc.
            if (char.length !== 1) return;

            sequence.current = (sequence.current + char).slice(-4);

            if (sequence.current === 'mina') {
                setIsAuthorized(true);
                console.clear();
                console.log('%c [MOVIDO] Security Override: ENABLED ', 'background: #222; color: #7fffd4; font-size: 20px; font-weight: bold; padding: 10px; border: 2px solid #7fffd4;');
                alert('Developer access granted.');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // 2. Heavy Protection Logic (Only active if not authorized)
        if (!isAuthorized) {
            const handleContextMenu = (e: MouseEvent) => e.preventDefault();

            const handleShortcuts = (e: KeyboardEvent) => {
                if (
                    e.key === 'F12' ||
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
                    (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's'))
                ) {
                    e.preventDefault();
                    return false;
                }
            };

            // Anti-Console Junk & Recursive Debugger
            const protect = () => {
                // The debugger will only trigger if console is open
                (function () {
                    (function a() {
                        try {
                            (function b(i) {
                                if (i === 0) {
                                    (function () { }.constructor('debugger')());
                                } else {
                                    b(++i);
                                }
                            })(0);
                        } catch (e) {
                            setTimeout(a, 1000);
                        }
                    })();
                })();
            };

            const interval = setInterval(() => {
                if (!isAuthorized) {
                    console.clear();
                    protect();
                }
            }, 1000);

            window.addEventListener('contextmenu', handleContextMenu);
            window.addEventListener('keydown', handleShortcuts);

            return () => {
                clearInterval(interval);
                window.removeEventListener('contextmenu', handleContextMenu);
                window.removeEventListener('keydown', handleShortcuts);
                window.removeEventListener('keydown', handleKeyDown);
            };
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAuthorized]);

    return null;
};

export default SecurityGuard;
