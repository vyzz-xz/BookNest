/**
 * Storage utility untuk mengelola data buku di localStorage
 */

class BookStorage {
    constructor() {
        this.storageKey = 'bookshelf_books';
    }

    /**
     * Mengambil semua buku dari localStorage
     * @returns {Array} Array berisi semua buku
     */
    getAllBooks() {
        try {
            const books = localStorage.getItem(this.storageKey);
            return books ? JSON.parse(books) : [];
        } catch (error) {
            console.error('Error loading books from storage:', error);
            return [];
        }
    }

    /**
     * Menyimpan array buku ke localStorage
     * @param {Array} books - Array buku yang akan disimpan
     */
    saveBooks(books) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(books));
        } catch (error) {
            console.error('Error saving books to storage:', error);
            throw new Error('Gagal menyimpan data buku');
        }
    }

    /**
     * Menambah buku baru
     * @param {Object} book - Data buku baru
     * @returns {Object} Buku yang telah ditambahkan dengan ID
     */
    addBook(book) {
        const books = this.getAllBooks();
        const newBook = {
            id: this.generateId(),
            title: book.title.trim(),
            author: book.author.trim(),
            year: parseInt(book.year),
            isComplete: book.isComplete,
            createdAt: new Date().toISOString()
        };
        
        books.push(newBook);
        this.saveBooks(books);
        return newBook;
    }

    /**
     * Mengupdate buku berdasarkan ID
     * @param {string} id - ID buku
     * @param {Object} updatedData - Data yang akan diupdate
     * @returns {Object|null} Buku yang telah diupdate atau null jika tidak ditemukan
     */
    updateBook(id, updatedData) {
        const books = this.getAllBooks();
        const bookIndex = books.findIndex(book => book.id === id);
        
        if (bookIndex === -1) {
            return null;
        }
        
        books[bookIndex] = { ...books[bookIndex], ...updatedData };
        this.saveBooks(books);
        return books[bookIndex];
    }

    /**
     * Menghapus buku berdasarkan ID
     * @param {string} id - ID buku yang akan dihapus
     * @returns {boolean} True jika berhasil dihapus, false jika tidak ditemukan
     */
    deleteBook(id) {
        const books = this.getAllBooks();
        const filteredBooks = books.filter(book => book.id !== id);
        
        if (filteredBooks.length === books.length) {
            return false; // Buku tidak ditemukan
        }
        
        this.saveBooks(filteredBooks);
        return true;
    }

    /**
     * Mencari buku berdasarkan keyword
     * @param {string} keyword - Kata kunci pencarian
     * @returns {Array} Array buku yang sesuai dengan pencarian
     */
    searchBooks(keyword) {
        const books = this.getAllBooks();
        const searchTerm = keyword.toLowerCase().trim();
        
        if (!searchTerm) {
            return books;
        }
        
        return books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.year.toString().includes(searchTerm)
        );
    }

    /**
     * Mengambil buku berdasarkan status
     * @param {boolean} isComplete - Status buku (true = sudah dibaca, false = belum dibaca)
     * @returns {Array} Array buku dengan status tertentu
     */
    getBooksByStatus(isComplete) {
        const books = this.getAllBooks();
        return books.filter(book => book.isComplete === isComplete);
    }

    /**
     * Generate ID unik untuk buku baru
     * @returns {string} ID unik
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Mengambil statistik buku
     * @returns {Object} Objek berisi statistik buku
     */
    getBookStats() {
        const books = this.getAllBooks();
        return {
            total: books.length,
            completed: books.filter(book => book.isComplete).length,
            uncompleted: books.filter(book => !book.isComplete).length
        };
    }

    /**
     * Membersihkan semua data buku (untuk testing atau reset)
     */
    clearAllBooks() {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Export data buku ke JSON
     * @returns {string} JSON string dari semua buku
     */
    exportBooks() {
        const books = this.getAllBooks();
        return JSON.stringify(books, null, 2);
    }

    /**
     * Import data buku dari JSON
     * @param {string} jsonData - JSON string berisi data buku
     * @returns {boolean} True jika berhasil import
     */
    importBooks(jsonData) {
        try {
            const books = JSON.parse(jsonData);
            if (Array.isArray(books)) {
                this.saveBooks(books);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing books:', error);
            return false;
        }
    }
}