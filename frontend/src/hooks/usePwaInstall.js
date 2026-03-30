import { useState, useEffect } from 'react';

const DISMISS_KEY = 'mf_pwa_install_dismissed';
const DISMISS_DAYS = 30;

function isIOSDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isInStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function wasDismissedRecently() {
  const dismissed = localStorage.getItem(DISMISS_KEY);
  if (!dismissed) return false;
  const daysSince = (Date.now() - parseInt(dismissed, 10)) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_DAYS;
}

export default function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (isInStandalone() || wasDismissedRecently()) return;

    if (isIOSDevice()) {
      setIsIOS(true);
      setCanInstall(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    if (outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    }
  };

  const dismiss = () => {
    setCanInstall(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  return { canInstall, isIOS, install, dismiss };
}
