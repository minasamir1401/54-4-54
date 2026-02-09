
// 🛡️ MOVIDO Guardian Service Worker - V2.0 (Extreme Filtering)
// This local proxy blocks all known ad networks and suspicious traffic.

const AD_PATTERNS = [
    /doubleclick/i, /googlesyndication/i, /google-analytics/i,
    /popads/i, /popcash/i, /propellerads/i, /onclickads/i,
    /exoclick/i, /realsrv/i, /juicyads/i, /melbet/i, /1xbet/i,
    /mostbet/i, /bet365/i, /tapbit/i, /okx/i, /cryptoad/i,
    /smartcpm/i, /clickunder/i, /adnxs/i, /adsystem/i,
    /adtarget/i, /traffic/i, /banner/i, /popunder/i,
    /attirecideryeah/i, /asg.vidoba/i, /track/i, /pixel/i
];

const WHITELIST = [
    'lmina', 'localhost', 'youtube.com', 'vjs.zencdn.net',
    'google.com', 'gstatic.com', 'video.js', 'hls.js'
];

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
    const url = event.request.url.toLowerCase();
    
    // 1. Always allow Whitelisted domains
    if (WHITELIST.some(domain => url.includes(domain))) {
        return event.respondWith(fetch(event.request));
    }

    // 2. Block direct Ad patterns
    const isAd = AD_PATTERNS.some(pattern => pattern.test(url));
    
    // 3. Block tracking and suspicious analytics
    if (isAd || url.includes('/ads/') || url.includes('/pop/')) {
        console.log(`🚫 Guardian Blocked: ${url}`);
        return event.respondWith(new Response('', { status: 204 }));
    }

    event.respondWith(fetch(event.request));
});
