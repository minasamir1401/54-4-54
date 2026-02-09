# Advertising Plan

## Ad Strategy
- **Network**: Adsterra / PopAds (via `offevasionrecruit.com`)
- **Format**: 
  - Banner ads using iframe.
  - Popunder ads are enabled.
- **Behavior**:
  - Ads are configured to open in a NEW TAB (`_blank`).
  - `window.open` blocking has been removed to allow popunders to function correctly without redirecting the current page.

## Implementation Details
- Component: `src/components/AdBanner.tsx`
- Initialization: Injects scripts on mount.
- Cleanup: None required for scripts, but React unmount handles component removal.
