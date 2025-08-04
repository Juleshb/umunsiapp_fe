// PWA Utility Functions
class PWAUtils {
  constructor() {
    this.swRegistration = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Register service worker
  async registerServiceWorker() {
    if (!this.isSupported) {
      console.log('PWA: Service Worker not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('PWA: Service Worker registered successfully', this.swRegistration);

      // Listen for updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available
            this.showUpdateNotification();
          }
        });
      });

      return true;
    } catch (error) {
      console.error('PWA: Service Worker registration failed', error);
      return false;
    }
  }

  // Show update notification
  showUpdateNotification() {
    if (confirm('New version available! Click OK to update.')) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!this.isSupported) {
      console.log('PWA: Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('PWA: Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('PWA: Error requesting notification permission', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications() {
    if (!this.isSupported || !this.swRegistration) {
      console.log('PWA: Cannot subscribe to push notifications');
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (!permission) {
        return null;
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
      });

      console.log('PWA: Push subscription created', subscription);
      return subscription;
    } catch (error) {
      console.error('PWA: Error subscribing to push notifications', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications() {
    if (!this.isSupported || !this.swRegistration) {
      return false;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('PWA: Push subscription removed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('PWA: Error unsubscribing from push notifications', error);
      return false;
    }
  }

  // Send push notification
  async sendPushNotification(title, options = {}) {
    if (!this.isSupported) {
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        vibrate: [100, 50, 100],
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('PWA: Error sending notification', error);
      return false;
    }
  }

  // Check if app is installed
  isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  // Install prompt
  async showInstallPrompt() {
    if (!window.deferredPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      window.deferredPrompt = null;
      
      console.log('PWA: Install prompt outcome:', outcome);
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Error showing install prompt', error);
      return false;
    }
  }

  // Get app version
  async getAppVersion() {
    if (!this.swRegistration) {
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };
      this.swRegistration.active.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }

  // Check for updates
  async checkForUpdates() {
    if (!this.swRegistration) {
      return false;
    }

    try {
      await this.swRegistration.update();
      return true;
    } catch (error) {
      console.error('PWA: Error checking for updates', error);
      return false;
    }
  }

  // Background sync
  async registerBackgroundSync(tag = 'background-sync') {
    if (!this.isSupported || !this.swRegistration || !('sync' in this.swRegistration)) {
      console.log('PWA: Background sync not supported');
      return false;
    }

    try {
      await this.swRegistration.sync.register(tag);
      console.log('PWA: Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('PWA: Error registering background sync', error);
      return false;
    }
  }

  // Share API
  async share(data) {
    if (!navigator.share) {
      console.log('PWA: Web Share API not supported');
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('PWA: Error sharing', error);
      return false;
    }
  }

  // File handling
  async handleFiles(files) {
    if (!('launchQueue' in window)) {
      console.log('PWA: File handling not supported');
      return;
    }

    window.launchQueue.setConsumer(async (launchParams) => {
      if (!launchParams.files.length) {
        return;
      }

      for (const fileHandle of launchParams.files) {
        const file = await fileHandle.getFile();
        console.log('PWA: File received:', file.name);
        // Handle the file here
      }
    });
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Initialize PWA features
  async init() {
    console.log('PWA: Initializing...');
    
    // Register service worker
    await this.registerServiceWorker();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      console.log('PWA: Install prompt ready');
    });

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed');
      window.deferredPrompt = null;
    });

    // Handle file launch
    this.handleFiles();

    console.log('PWA: Initialization complete');
  }
}

// Create singleton instance
const pwaUtils = new PWAUtils();

export default pwaUtils; 