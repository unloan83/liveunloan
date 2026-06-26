import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthCard from './components/AuthCard';
import Marketing from './components/Marketing';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animationClass, setAnimationClass] = useState('opacity-0 translate-y-4');
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(true);
  const [showManualTip, setShowManualTip] = useState(false);

  // Load existing server session and register PWA install prompt listener
  useEffect(() => {
    fetch('/api/auth/session')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setUser(payload?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => {
        setLoading(false);
        setTimeout(() => {
          setAnimationClass('opacity-100 translate-y-0');
        }, 100);
      });

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPwaBanner(false);
      }
    } else {
      // Trigger manual guide modal for unsupported clients (Safari, etc)
      setShowManualTip(true);
    }
  };

  const handleLoginSuccess = (userSession) => {
    // Fade out
    setAnimationClass('opacity-0 -translate-y-4');
    setTimeout(() => {
      setUser(userSession);
      // Fade in new view
      setTimeout(() => {
        setAnimationClass('opacity-100 translate-y-0');
      }, 50);
    }, 300);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    // Fade out
    setAnimationClass('opacity-0 translate-y-4');
    setTimeout(() => {
      setUser(null);
      // Fade in login view
      setTimeout(() => {
        setAnimationClass('opacity-100 translate-y-0');
      }, 50);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden">
      {/* PWA Install Banner */}
      {showPwaBanner && (
        <div className="w-full bg-emerald-950/90 border-b border-emerald-800/40 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 z-50 relative backdrop-blur-md">
          <div className="text-xs md:text-sm text-emerald-300 font-medium flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Download the PWA app on your phone for better view</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="pwa-download-btn"
              onClick={handlePwaInstall}
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              Download PWA
            </button>
            <button
              onClick={() => setShowPwaBanner(false)}
              className="text-emerald-500/60 hover:text-emerald-400 text-xs font-semibold px-2 py-1 hover:bg-emerald-950/50 rounded transition-all cursor-pointer"
              title="Dismiss banner"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Manual Installation Guide Modal */}
      {showManualTip && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-xl">
            <h4 className="text-lg font-bold text-white">How to Install Unloan PWA</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              To launch Unloan on your device, install the application manually using these steps:
            </p>
            <div className="text-xs text-left text-gray-300 bg-gray-950/80 p-3.5 rounded-xl border border-gray-850 space-y-2 font-medium">
              <p>📱 <strong>On iOS (Safari):</strong> Tap the <strong>Share</strong> button (box with up arrow) and select <strong>Add to Home Screen</strong>.</p>
              <p>🤖 <strong>On Android (Chrome):</strong> Tap the three dots icon (top-right) and select <strong>Install App</strong>.</p>
              <p>💻 <strong>On Desktop (Chrome/Edge):</strong> Click the install icon in the address bar.</p>
            </div>
            <button
              onClick={() => setShowManualTip(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-500/5 blur-[140px] pointer-events-none animate-pulse-slow"></div>

      <Header user={user} onLogout={handleLogout} />

      <main className={`flex-grow flex flex-col items-center justify-center py-10 px-4 transition-all duration-300 ease-out transform ${animationClass}`}>
        {user ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <div className="w-full flex flex-col items-center space-y-12">
            <AuthCard onLoginSuccess={handleLoginSuccess} />
            <div className="w-full border-t border-gray-900 max-w-4xl"></div>
            <Marketing />
          </div>
        )}
      </main>

      {/* Modern Compact Footer */}
      <footer className="w-full border-t border-gray-900 bg-gray-950/40 py-8 px-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Unloan App. Designed for financial education and smart debt planning.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-400 transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-400 transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-gray-400 transition-colors">Vercel Deploy Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
