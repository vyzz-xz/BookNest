/**
 * Bookshelf class untuk mengelola logika utama aplikasi
 */

class Bookshelf {
    constructor() {
        this.storage = new BookStorage();
        this.currentSearchTerm = '';
        this.init();
    }

    /**
     * Inisialisasi aplikasi
     */
    init() {
        this.setupEventListeners();
        this.renderBooks();
        this.updateBookCounts();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Form submission
        ui.bookForm.addEventListener('submit', (e) => this.handleAddBook(e));
        
        // Search functionality
        ui.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        
        // Delete confirmation
        ui.confirmDeleteBtn.addEventListener('click', () => this.handleDeleteBook());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Handle penambahan buku baru
     * @param {Event} e - Event form submission
     */
    handleAddBook(e) {
        e.preventDefault();
        
        const formData = new FormData(ui.bookForm);
        const bookData = {
            title: formData.get('title'),
            author: formData.get('author'),
            year: parseInt(formData.get('year')),
            isComplete: formData.get('isComplete') === 'true'
        };

        // Validasi form
        if (!ui.validateForm(bookData)) {
            ui.showToast('Mohon periksa kembali data yang dimasukkan', 'error');
            return;
        }

        try {
            // Tambah buku ke storage
            const newBook = this.storage.addBook(bookData);
            
            // Update UI
            this.renderBooks();
            this.updateBookCounts();
            ui.resetForm();
            
            // Tampilkan notifikasi sukses
            ui.showToast(`Buku "${newBook.title}" berhasil ditambahkan!`, 'success');
            
            // Scroll ke section yang sesuai
            this.scrollToBookSection(newBook.isComplete);
            
        } catch (error) {
            console.error('Error adding book:', error);
            ui.showToast('Gagal menambahkan buku. Silakan coba lagi.', 'error');
        }
    }

    /**
     * Handle pencarian buku
     * @param {Event} e - Event input search
     */
    handleSearch(e) {
        this.currentSearchTerm = e.target.value;
        this.renderBooks();
    }

    /**
     * Handle penghapusan buku
     */
    handleDeleteBook() {
        const bookId = ui.getBookToDelete();
        if (!bookId) return;

        try {
            const books = this.storage.getAllBooks();
            const bookToDelete = books.find(book => book.id === bookId);
            
            if (this.storage.deleteBook(bookId)) {
                this.renderBooks();
                this.updateBookCounts();
                ui.hideDeleteModal();
                ui.showToast(`Buku "${bookToDelete.title}" berhasil dihapus!`, 'success');
            } else {
                ui.showToast('Buku tidak ditemukan!', 'error');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            ui.showToast('Gagal menghapus buku. Silakan coba lagi.', 'error');
        }
    }

    /**
     * Pindahkan buku antara rak
     * @param {string} bookId - ID buku yang akan dipindah
     */
    moveBook(bookId) {
        try {
            const books = this.storage.getAllBooks();
            const book = books.find(b => b.id === bookId);
            
            if (!book) {
                ui.showToast('Buku tidak ditemukan!', 'error');
                return;
            }

            // Update status buku
            const updatedBook = this.storage.updateBook(bookId, { 
                isComplete: !book.isComplete 
            });

            if (updatedBook) {
                this.renderBooks();
                this.updateBookCounts();
                
                const status = updatedBook.isComplete ? 'Sudah Dibaca' : 'Belum Dibaca';
                ui.showToast(`Buku "${updatedBook.title}" dipindah ke ${status}!`, 'success');
                
                // Scroll ke section yang sesuai
                this.scrollToBookSection(updatedBook.isComplete);
            }
        } catch (error) {
            console.error('Error moving book:', error);
            ui.showToast('Gagal memindahkan buku. Silakan coba lagi.', 'error');
        }
    }

    /**
     * Render semua buku ke UI
     */
    renderBooks() {
        const books = this.currentSearchTerm 
            ? this.storage.searchBooks(this.currentSearchTerm)
            : this.storage.getAllBooks();

        this.renderBooksByStatus(books, false); // Belum dibaca
        this.renderBooksByStatus(books, true);  // Sudah dibaca
    }

    /**
     * Render buku berdasarkan status
     * @param {Array} books - Array buku
     * @param {boolean} isComplete - Status buku
     */
    renderBooksByStatus(books, isComplete) {
        const filteredBooks = books.filter(book => book.isComplete === isComplete);
        const container = isComplete ? ui.readBooksContainer : ui.unreadBooksContainer;
        
        // Clear container
        container.innerHTML = '';

        if (filteredBooks.length === 0) {
            const message = this.currentSearchTerm 
                ? `Tidak ada buku ${isComplete ? 'yang sudah dibaca' : 'yang belum dibaca'} dengan kata kunci "${this.currentSearchTerm}"`
                : `Belum ada buku ${isComplete ? 'yang sudah dibaca' : 'yang belum dibaca'}`;
            
            const icon = isComplete ? 'fas fa-medal' : 'fas fa-book-open';
            ui.showEmptyState(container, message, icon);
            return;
        }

        // Render books
        filteredBooks.forEach((book, index) => {
            const bookElement = ui.createBookElement(book);
            container.appendChild(bookElement);
            
            // Animate entry dengan delay
            setTimeout(() => {
                ui.animateElementEntry(bookElement);
            }, index * 100);
        });
    }

    /**
     * Update counter jumlah buku
     */
    updateBookCounts() {
        const stats = this.storage.getBookStats();
        ui.updateBookCounts(stats.uncompleted, stats.completed);
    }

    /**
     * Scroll ke section buku yang sesuai
     * @param {boolean} isComplete - Status buku
     */
    scrollToBookSection(isComplete) {
        const targetSection = isComplete ? ui.readBooksContainer : ui.unreadBooksContainer;
        const sectionTop = targetSection.closest('section').offsetTop - 100;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Event keyboard
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K untuk focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            ui.searchInput.focus();
        }
        
        // Escape untuk clear search
        if (e.key === 'Escape' && document.activeElement === ui.searchInput) {
            ui.searchInput.value = '';
            this.currentSearchTerm = '';
            this.renderBooks();
        }
        
        // Ctrl/Cmd + N untuk focus form
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            ui.titleInput.focus();
        }
    }

    /**
     * Export data buku
     */
    exportBooks() {
        try {
            const data = this.storage.exportBooks();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `bookshelf-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            ui.showToast('Data buku berhasil diekspor!', 'success');
        } catch (error) {
            console.error('Error exporting books:', error);
            ui.showToast('Gagal mengekspor data buku.', 'error');
        }
    }

    /**
     * Import data buku
     * @param {File} file - File JSON yang akan diimport
     */
    importBooks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (this.storage.importBooks(e.target.result)) {
                    this.renderBooks();
                    this.updateBookCounts();
                    ui.showToast('Data buku berhasil diimport!', 'success');
                } else {
                    ui.showToast('Format file tidak valid.', 'error');
                }
            } catch (error) {
                console.error('Error importing books:', error);
                ui.showToast('Gagal mengimport data buku.', 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Reset semua data (untuk testing)
     */
    resetAllData() {
        if (confirm('Apakah Anda yakin ingin menghapus semua data buku? Tindakan ini tidak dapat dibatalkan.')) {
            this.storage.clearAllBooks();
            this.renderBooks();
            this.updateBookCounts();
            ui.showToast('Semua data buku berhasil dihapus!', 'warning');
        }
    }

    /**
     * Get book statistics
     * @returns {Object} Statistik buku
     */
    getBookStatistics() {
        return this.storage.getBookStats();
    }
}