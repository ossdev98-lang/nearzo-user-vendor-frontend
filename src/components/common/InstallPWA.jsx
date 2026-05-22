import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPwaPrompt || null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      return;
    }

    // Show button unconditionally after a short delay for better UX
    const timer = setTimeout(() => {
      setShowInstallButton(true);
    }, 1500);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPwaPrompt = e;
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if it was caught early in main.jsx
    if (window.deferredPwaPrompt) {
      setDeferredPrompt(window.deferredPwaPrompt);
      setShowInstallButton(true);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native prompt is available
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        window.deferredPwaPrompt = null;
        setShowInstallButton(false);
      }
    } else {
      // Native prompt NOT available (iOS, or Dev mode blocker) - Show instructions
      setShowInstructions(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showInstallButton && !showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-[9999] flex items-center justify-between sm:justify-start bg-white dark:bg-gray-800 rounded-2xl sm:rounded-full shadow-2xl overflow-hidden ring-1 ring-black/5"
          >
            <button
              onClick={handleInstallClick}
              className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3.5 sm:py-3 hover:opacity-90 transition-opacity font-semibold text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Install Nearzo App</span>
            </button>
            <button 
              onClick={() => setShowInstallButton(false)}
              className="p-3.5 sm:px-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowInstructions(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Install Nearzo</h3>
              
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>To install this app on your device:</p>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    📱 iOS (Safari)
                  </h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Tap the <Share className="w-3 h-3 inline mx-1" /> <b>Share</b> button</li>
                    <li>Scroll down and tap <b>"Add to Home Screen"</b> <PlusSquare className="w-3 h-3 inline mx-1" /></li>
                  </ol>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    🤖 Android (Chrome)
                  </h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Tap the <b>⋮</b> (three dots) menu in the top right</li>
                    <li>Tap <b>"Install app"</b> or <b>"Add to Home screen"</b></li>
                  </ol>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    💻 Desktop (Chrome/Edge)
                  </h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Look at the top right of your address bar</li>
                    <li>Click the <b>Install</b> ⬇️ icon</li>
                  </ol>
                </div>
              </div>
              
              <button
                onClick={() => setShowInstructions(false)}
                className="mt-6 w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPWA;
