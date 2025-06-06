/**
 * Main application file - Entry point aplikasi Bookshelf
 */

// Global variables
let ui, bookshelf;

/**
 * Inisialisasi aplikasi saat DOM loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Tampilkan loading screen
    showInitialLoading();
    
    // Inisialisasi komponen utama
    initializeApp();
    
    // Setup additional features
    setupAdditionalFeatures();
    
    // Sembunyikan loading screen
    hideInitialLoading();
});

/**
 * Tampilkan loading screen awal
 */
function showInitialLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

/**
 * Sembunyikan loading screen awal
 */
function hideInitialLoading() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1200); // Delay untuk memberikan efek loading yang smooth
}

/**
 * Inisialisasi komponen utama aplikasi
 */
function initializeApp() {
    try {
        // Inisialisasi UI Manager
        ui = new UIManager();
        console.log('✅ UI Manager initialized');
        
        // Inisialisasi Bookshelf
        bookshelf = new Bookshelf();
        console.log('✅ Bookshelf initialized');
        
        // Setup welcome message
        showWelcomeMessage();
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showErrorMessage('Gagal menginisialisasi aplikasi. Silakan refresh halaman.');
    }
}

/**
 * Setup fitur tambahan
 */
function setupAdditionalFeatures() {
    // Setup keyboard shortcuts info
    setupKeyboardShortcuts();
    
    // Setup performance monitoring
    setupPerformanceMonitoring();
    
    // Setup error handling
    setupGlobalErrorHandling();
    
    // Setup PWA features (jika diperlukan)
    setupPWAFeatures();
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    // Tampilkan shortcut hints
    const shortcutHints = [
        'Ctrl/Cmd + K: Fokus pencarian',
        'Ctrl/Cmd + N: Fokus form tambah buku',
        'Escape: Bersihkan pencarian'
    ];
    
    console.log('⌨️ Keyboard shortcuts available:', shortcutHints);
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
    // Monitor loading time
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`⚡ App loaded in ${loadTime.toFixed(2)}ms`);
        
        // Log performance metrics
        if ('performance' in window && 'getEntriesByType' in performance) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                console.log('📊 Performance metrics:', {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart
                });
            }
        }
    });
}

/**
 * Setup global error handling
 */
function setupGlobalErrorHandling() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
        console.error('❌ Global error:', event.error);
        if (ui) {
            ui.showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
        }
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('❌ Unhandled promise rejection:', event.reason);
        if (ui) {
            ui.showToast('Terjadi kesalahan sistem. Silakan refresh halaman.', 'error');
        }
    });
}

/**
 * Setup PWA features
 */
function setupPWAFeatures() {
    // Check if app is running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('📱 Running as PWA');
    }
    
    // Handle online/offline status
    window.addEventListener('online', () => {
        if (ui) {
            ui.showToast('Koneksi internet tersambung kembali', 'success');
        }
    });
    
    window.addEventListener('offline', () => {
        if (ui) {
            ui.showToast('Koneksi internet terputus. Data tetap tersimpan lokal.', 'warning');
        }
    });
}

/**
 * Tampilkan pesan selamat datang
 */
function showWelcomeMessage() {
    // Cek apakah user pertama kali menggunakan app
    const isFirstTime = !localStorage.getItem('bookshelf_visited');
    
    if (isFirstTime) {
        setTimeout(() => {
            if (ui) {
                ui.showToast('Selamat datang di Bookshelf App! 📚', 'info');
                localStorage.setItem('bookshelf_visited', 'true');
            }
        }, 2000);
    }
}

/**
 * Tampilkan pesan error
 * @param {string} message - Pesan error
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-triangle mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Utility functions yang bisa diakses global
 */
window.BookshelfApp = {
    /**
     * Export data buku
     */
    exportData() {
        if (bookshelf) {
            bookshelf.exportBooks();
        }
    },
    
    /**
     * Import data buku
     * @param {File} file - File yang akan diimport
     */
    importData(file) {
        if (bookshelf) {
            bookshelf.importBooks(file);
        }
    },
    
    /**
     * Reset semua data
     */
    resetData() {
        if (bookshelf) {
            bookshelf.resetAllData();
        }
    },
    
    /**
     * Get statistik buku
     * @returns {Object} Statistik buku
     */
    getStats() {
        return bookshelf ? bookshelf.getBookStatistics() : null;
    },
    
    /**
     * Toggle debug mode
     */
    toggleDebug() {
        const isDebug = localStorage.getItem('bookshelf_debug') === 'true';
        localStorage.setItem('bookshelf_debug', (!isDebug).toString());
        console.log(`Debug mode ${!isDebug ? 'enabled' : 'disabled'}`);
        
        if (!isDebug) {
            console.log('🐛 Debug mode enabled. Available commands:');
            console.log('- BookshelfApp.getStats(): Get book statistics');
            console.log('- BookshelfApp.exportData(): Export all books');
            console.log('- BookshelfApp.resetData(): Reset all data');
        }
    }
};

/**
 * Console welcome message untuk developer
 */
console.log(`
🚀 Bookshelf App v1.0.0
📚 Professional Book Management System

Built with:
- Vanilla JavaScript (ES6+)
- Tailwind CSS
- Font Awesome Icons
- Local Storage API

Developer Commands:
- BookshelfApp.toggleDebug(): Toggle debug mode
- BookshelfApp.getStats(): Get statistics
- BookshelfApp.exportData(): Export data
- BookshelfApp.importData(file): Import data

Made with ❤️ for Dicoding Submission
`);

// Enable debug mode in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    localStorage.setItem('bookshelf_debug', 'true');
    console.log('🐛 Debug mode auto-enabled for localhost');
}