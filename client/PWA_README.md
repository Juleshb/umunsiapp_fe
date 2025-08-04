# Chart App - Progressive Web App (PWA)

This document describes the Progressive Web App (PWA) features implemented in the Chart App client.

## Overview

The Chart App is a fully-featured Progressive Web App that provides a native app-like experience on web browsers. It includes offline functionality, push notifications, app installation, and more.

## PWA Features

### ✅ Implemented Features

1. **Web App Manifest** (`/public/manifest.json`)
   - App metadata and configuration
   - Icons for different sizes
   - Theme colors and display settings
   - App shortcuts for quick access
   - File handling capabilities
   - Share target integration

2. **Service Worker** (`/public/sw.js`)
   - Caching strategies for static and dynamic content
   - Offline functionality
   - Background sync
   - Push notification handling
   - App update management

3. **PWA Utilities** (`/src/utils/pwa.js`)
   - Service worker registration
   - Push notification management
   - Install prompt handling
   - App version checking
   - Background sync registration
   - Web Share API integration

4. **Enhanced HTML** (`/public/index.html`)
   - PWA meta tags
   - Open Graph tags for social sharing
   - Twitter Card support
   - Manifest and icon links

## Installation & Setup

### Prerequisites

1. **VAPID Keys** (for push notifications)
   - Generate VAPID keys for your domain
   - Add `VITE_VAPID_PUBLIC_KEY` to your environment variables

2. **Icons** (recommended)
   - Create icons in multiple sizes (192x192, 512x512, etc.)
   - Place them in the `/public` directory
   - Update the manifest.json with correct paths

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VITE_API_URL=http://localhost:3000
```

### Build and Deploy

1. **Development**
   ```bash
   npm run dev
   ```

2. **Production Build**
   ```bash
   npm run build
   ```

3. **Preview Production Build**
   ```bash
   npm run preview
   ```

## PWA Features Usage

### Service Worker Registration

The service worker is automatically registered when the app starts:

```javascript
import pwaUtils from './utils/pwa.js';

// Initialize PWA features
await pwaUtils.init();
```

### Push Notifications

```javascript
// Request permission and subscribe
const subscription = await pwaUtils.subscribeToPushNotifications();

// Send local notification
await pwaUtils.sendPushNotification('Hello!', {
  body: 'This is a test notification',
  icon: '/icon-192x192.png'
});

// Unsubscribe
await pwaUtils.unsubscribeFromPushNotifications();
```

### App Installation

```javascript
// Check if app is installed
const isInstalled = pwaUtils.isAppInstalled();

// Show install prompt
const installed = await pwaUtils.showInstallPrompt();
```

### Background Sync

```javascript
// Register background sync
await pwaUtils.registerBackgroundSync('sync-posts');

// Check for app updates
await pwaUtils.checkForUpdates();
```

### Web Share API

```javascript
// Share content
await pwaUtils.share({
  title: 'Check out Chart App!',
  text: 'A great social media platform',
  url: 'https://chartapp.com'
});
```

## Caching Strategy

The service worker implements different caching strategies:

1. **Static Assets** (Cache First)
   - CSS, JS, images, fonts
   - Cached immediately on install
   - Served from cache first, network fallback

2. **API Requests** (Network First)
   - API calls to backend
   - Network first, no caching
   - Offline fallback with error message

3. **Navigation** (Network First)
   - Page navigation requests
   - Network first, cache fallback
   - Falls back to cached index.html for SPA

## Offline Functionality

The app works offline with the following features:

- ✅ Static assets cached and available offline
- ✅ Basic navigation works offline
- ✅ API requests show offline message
- ✅ Background sync for offline data
- ✅ Push notifications work offline

## Browser Support

### Fully Supported
- Chrome/Chromium (desktop & mobile)
- Edge
- Firefox
- Safari (iOS 11.3+)

### Partially Supported
- Safari (desktop) - limited PWA features
- Internet Explorer - not supported

## Testing PWA Features

### Chrome DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Manifest** section
4. Check **Service Workers** section
5. Test **Storage** and **Cache**

### Lighthouse Audit

Run Lighthouse audit to check PWA score:

1. Open DevTools
2. Go to **Lighthouse** tab
3. Select **Progressive Web App**
4. Run audit

### Testing Offline

1. Open DevTools
2. Go to **Network** tab
3. Check **Offline** checkbox
4. Refresh page and test functionality

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Check if HTTPS is enabled (required for service workers)
   - Verify service worker file path
   - Check browser console for errors

2. **Push Notifications Not Working**
   - Verify VAPID keys are correct
   - Check notification permissions
   - Ensure HTTPS is enabled

3. **App Not Installing**
   - Verify manifest.json is valid
   - Check if app meets install criteria
   - Test on supported browser

4. **Caching Issues**
   - Clear browser cache
   - Unregister service worker
   - Check cache storage in DevTools

### Debug Commands

```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Check cache storage
caches.keys().then(keys => {
  console.log('Cache Keys:', keys);
});

// Clear all caches
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

## Performance Optimization

### Best Practices

1. **Cache Strategy**
   - Use appropriate caching strategy for each resource type
   - Implement cache versioning for updates
   - Clean up old caches regularly

2. **Bundle Size**
   - Minimize JavaScript bundle size
   - Use code splitting for better performance
   - Optimize images and assets

3. **Loading Performance**
   - Preload critical resources
   - Use service worker for faster loading
   - Implement lazy loading for non-critical content

## Security Considerations

1. **HTTPS Required**
   - Service workers require HTTPS
   - Push notifications require HTTPS
   - Use localhost for development

2. **Content Security Policy**
   - Implement CSP headers
   - Restrict resource loading
   - Prevent XSS attacks

3. **VAPID Keys**
   - Keep private keys secure
   - Use environment variables
   - Rotate keys regularly

## Future Enhancements

### Planned Features

- [ ] Advanced offline data sync
- [ ] Background periodic sync
- [ ] Web Share Target API
- [ ] File handling improvements
- [ ] Advanced push notification features
- [ ] App shortcuts customization
- [ ] Theme customization
- [ ] Multi-language support

### Performance Improvements

- [ ] Advanced caching strategies
- [ ] Image optimization
- [ ] Bundle optimization
- [ ] Critical resource preloading
- [ ] Service worker optimization

## Resources

- [MDN Web Docs - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Chrome DevTools - PWA](https://developers.google.com/web/tools/chrome-devtools/progressive-web-apps)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Test in different browsers
4. Verify PWA requirements are met
5. Check Lighthouse audit results 