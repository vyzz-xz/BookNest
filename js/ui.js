/**
 * UI utility untuk mengelola elemen-elemen antarmuka pengguna
 */

class UIManager {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.initializeTheme();
    }

    /**
     * Inisialisasi elemen-elemen DOM
     */
    initializeElements() {
        // Form elements
        this.bookForm = document.getElementById('book-form');
        this.titleInput = document.getElementById('title');
        this.authorInput = document.getElementById('author');
        this.yearInput = document.getElementById('year');
        this.isCompleteInputs = document.querySelectorAll('input[name="isComplete"]');

        // Search elements
        this.searchInput = document.getElementById('search-input');

        // Book containers
        this.unreadBooksContainer = document.getElementById('unread-books');
        this.readBooksContainer = document.getElementById('read-books');

        // Counters
        this.unreadCount = document.getElementById('unread-count');
        this.readCount = document.getElementById('read-count');

        // UI elements
        this.toast = document.getElementById('toast');
        this.toastIcon = document.getElementById('toast-icon');
        this.toastMessage = document.getElementById('toast-message');
        this.scrollToTopBtn = document.getElementById('scroll-to-top');
        this.scrollProgress = document.getElementById('scroll-progress');
        this.loadingScreen = document.getElementById('loading-screen');
        this.themeToggle = document.getElementById('theme-toggle');

        // Modal elements
        this.deleteModal = document.getElementById('delete-modal');
        this.confirmDeleteBtn = document.getElementById('confirm-delete');
        this.cancelDeleteBtn = document.getElementById('cancel-delete');
        
        this.bookToDelete = null;
    }

    /**
     * Setup event listeners untuk UI
     */
    setupEventListeners() {
        // Scroll progress
        window.addEventListener('scroll', () => this.updateScrollProgress());
        
        // Scroll to top button
        window.addEventListener('scroll', () => this.toggleScrollToTopButton());
        this.scrollToTopBtn.addEventListener('click', () => this.scrollToTop());
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Modal events
        this.cancelDeleteBtn.addEventListener('click', () => this.hideDeleteModal());
        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) {
                this.hideDeleteModal();
            }
        });

        // Form input animations
        this.setupFormAnimations();
    }

    /**
     * Setup animasi untuk form inputs
     */
    setupFormAnimations() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', (e) => {
                e.target.parentElement.classList.remove('focused');
            });
        });
    }

    /**
     * Inisialisasi tema
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('bookshelf_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
    }

    /**
     * Toggle tema dark/light
     */
    toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('bookshelf_theme', isDark ? 'dark' : 'light');
        
        // Animasi icon
        this.themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.themeToggle.style.transform = 'rotate(0deg)';
        }, 300);
    }

    /**
     * Update progress bar scroll
     */
    updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        this.scrollProgress.style.width = scrollPercent + '%';
    }

    /**
     * Toggle tombol scroll to top
     */
    toggleScrollToTopButton() {
        if (window.pageYOffset > 300) {
            this.scrollToTopBtn.style.transform = 'scale(1)';
        } else {
            this.scrollToTopBtn.style.transform = 'scale(0)';
        }
    }

    /**
     * Scroll ke atas halaman
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Tampilkan loading screen
     */
    showLoading() {
        this.loadingScreen.style.display = 'flex';
    }

    /**
     * Sembunyikan loading screen
     */
    hideLoading() {
        setTimeout(() => {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 300);
        }, 1000);
    }

    /**
     * Tampilkan toast notification
     * @param {string} message - Pesan yang akan ditampilkan
     * @param {string} type - Tipe notifikasi (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        // Set icon dan style berdasarkan tipe
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const colors = {
            success: 'text-green-500',
            error: 'text-red-500',
            warning: 'text-yellow-500',
            info: 'text-blue-500'
        };

        this.toastIcon.className = `${icons[type]} ${colors[type]} mr-3`;
        this.toastMessage.textContent = message;
        this.toast.className = `fixed top-20 right-4 bg-white dark:bg-gray-800 border-l-4 toast-${type} rounded-lg shadow-lg p-4 transform transition-transform duration-300 z-40`;

        // Tampilkan toast
        this.toast.style.transform = 'translateX(0)';

        // Sembunyikan setelah 3 detik
        setTimeout(() => {
            this.toast.style.transform = 'translateX(100%)';
        }, 3000);
    }

    /**
     * Tampilkan modal konfirmasi hapus
     * @param {string} bookId - ID buku yang akan dihapus
     * @param {string} bookTitle - Judul buku untuk konfirmasi
     */
    showDeleteModal(bookId, bookTitle) {
        this.bookToDelete = bookId;
        this.deleteModal.querySelector('p').textContent = 
            `Apakah Anda yakin ingin menghapus buku "${bookTitle}"? Tindakan ini tidak dapat dibatalkan.`;
        
        this.deleteModal.classList.remove('hidden');
        this.deleteModal.classList.add('flex');
        this.deleteModal.querySelector('.bg-white').classList.add('modal-enter');
    }

    /**
     * Sembunyikan modal konfirmasi hapus
     */
    hideDeleteModal() {
        this.deleteModal.classList.add('hidden');
        this.deleteModal.classList.remove('flex');
        this.bookToDelete = null;
    }

    /**
     * Dapatkan ID buku yang akan dihapus
     * @returns {string|null} ID buku atau null
     */
    getBookToDelete() {
        return this.bookToDelete;
    }

    /**
     * Reset form input
     */
    resetForm() {
        this.bookForm.reset();
        this.clearFormErrors();
    }

    /**
     * Tampilkan error pada form
     * @param {string} fieldName - Nama field yang error
     * @param {string} message - Pesan error
     */
    showFormError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = field.parentElement.querySelector('.error-message');
        
        field.classList.add('border-red-500');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    /**
     * Bersihkan semua error form
     */
    clearFormErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        const inputElements = document.querySelectorAll('input');
        
        errorElements.forEach(element => {
            element.classList.add('hidden');
            element.textContent = '';
        });
        
        inputElements.forEach(input => {
            input.classList.remove('border-red-500');
        });
    }

    /**
     * Validasi form input
     * @param {Object} formData - Data form yang akan divalidasi
     * @returns {boolean} True jika valid, false jika tidak
     */
    validateForm(formData) {
        let isValid = true;
        this.clearFormErrors();

        // Validasi judul
        if (!formData.title || formData.title.trim().length < 2) {
            this.showFormError('title', 'Judul buku harus diisi minimal 2 karakter');
            isValid = false;
        }

        // Validasi penulis
        if (!formData.author || formData.author.trim().length < 2) {
            this.showFormError('author', 'Nama penulis harus diisi minimal 2 karakter');
            isValid = false;
        }

        // Validasi tahun
        const currentYear = new Date().getFullYear();
        if (!formData.year || formData.year < 1000 || formData.year > currentYear) {
            this.showFormError('year', `Tahun harus antara 1000 - ${currentYear}`);
            isValid = false;
        }

        return isValid;
    }

    /**
     * Update counter buku
     * @param {number} unreadCount - Jumlah buku belum dibaca
     * @param {number} readCount - Jumlah buku sudah dibaca
     */
    updateBookCounts(unreadCount, readCount) {
        this.unreadCount.textContent = unreadCount;
        this.readCount.textContent = readCount;
    }

    /**
     * Buat elemen buku
     * @param {Object} book - Data buku
     * @returns {HTMLElement} Elemen HTML buku
     */
    createBookElement(book) {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 fade-in';
        bookElement.dataset.bookId = book.id;

        bookElement.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-gray-800 dark:text-white text-lg leading-tight">${this.escapeHtml(book.title)}</h3>
                <div class="flex space-x-2 ml-4">
                    <button onclick="bookshelf.moveBook('${book.id}')" 
                        class="p-2 rounded-lg ${book.isComplete ? 'bg-orange-100 hover:bg-orange-200 text-orange-600' : 'bg-green-100 hover:bg-green-200 text-green-600'} transition-colors duration-200"
                        title="${book.isComplete ? 'Pindah ke Belum Dibaca' : 'Pindah ke Sudah Dibaca'}">
                        <i class="fas ${book.isComplete ? 'fa-undo' : 'fa-check'} text-sm"></i>
                    </button>
                    <button onclick="ui.showDeleteModal('${book.id}', '${this.escapeHtml(book.title)}')" 
                        class="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors duration-200"
                        title="Hapus Buku">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p class="flex items-center">
                    <i class="fas fa-user mr-2 text-blue-500"></i>
                    <span class="font-medium">Penulis:</span>
                    <span class="ml-1">${this.escapeHtml(book.author)}</span>
                </p>
                <p class="flex items-center">
                    <i class="fas fa-calendar mr-2 text-blue-500"></i>
                    <span class="font-medium">Tahun:</span>
                    <span class="ml-1">${book.year}</span>
                </p>
                <p class="flex items-center">
                    <i class="fas ${book.isComplete ? 'fa-check-circle' : 'fa-clock'} mr-2 ${book.isComplete ? 'text-green-500' : 'text-orange-500'}"></i>
                    <span class="font-medium">Status:</span>
                    <span class="ml-1 ${book.isComplete ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}">${book.isComplete ? 'Sudah Dibaca' : 'Belum Dibaca'}</span>
                </p>
            </div>
        `;

        return bookElement;
    }

    /**
     * Escape HTML untuk mencegah XSS
     * @param {string} text - Text yang akan di-escape
     * @returns {string} Text yang sudah di-escape
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Tampilkan empty state
     * @param {HTMLElement} container - Container yang akan menampilkan empty state
     * @param {string} message - Pesan empty state
     * @param {string} icon - Icon untuk empty state
     */
    showEmptyState(container, message, icon) {
        container.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8 empty-state">
                <i class="${icon} text-4xl mb-4 opacity-50"></i>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Animasi saat menambah elemen
     * @param {HTMLElement} element - Elemen yang akan dianimasi
     */
    animateElementEntry(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 10);
    }
}