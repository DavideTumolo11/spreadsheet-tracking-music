/**
 * MUSIC BUSINESS TRACKER - DATABASE SYSTEM
 * LocalStorage + IndexedDB Management
 * Complete CRUD operations for all entities
 */

class MusicBusinessDatabase {
    constructor() {
        this.dbName = 'MusicBusinessTracker';
        this.dbVersion = 1;
        this.db = null;

        // Storage keys for localStorage
        this.storageKeys = {
            settings: 'mbt_settings',
            quickStats: 'mbt_quick_stats',
            lastBackup: 'mbt_last_backup',
            userPreferences: 'mbt_user_preferences'
        };

        // Initialize database
        this.init();
    }

    /**
     * Initialize database and create default data structure
     */
    async init() {
        try {
            // Initialize IndexedDB
            await this.initIndexedDB();

            // Initialize localStorage with default settings
            this.initLocalStorage();

            // Create default data if first run
            await this.createDefaultData();

            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            this.showToast('Errore inizializzazione database', 'error');
        }
    }

    /**
     * Initialize IndexedDB for large datasets
     */
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('Errore apertura IndexedDB'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Revenue store
                if (!db.objectStoreNames.contains('revenue')) {
                    const revenueStore = db.createObjectStore('revenue', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    revenueStore.createIndex('date', 'date', { unique: false });
                    revenueStore.createIndex('platform', 'platform', { unique: false });
                    revenueStore.createIndex('videoId', 'videoId', { unique: false });
                }

                // Videos store
                if (!db.objectStoreNames.contains('videos')) {
                    const videosStore = db.createObjectStore('videos', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    videosStore.createIndex('publishDate', 'publishDate', { unique: false });
                    videosStore.createIndex('niche', 'niche', { unique: false });
                    videosStore.createIndex('performance', 'views', { unique: false });
                }

                // Analytics store
                if (!db.objectStoreNames.contains('analytics')) {
                    const analyticsStore = db.createObjectStore('analytics', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    analyticsStore.createIndex('date', 'date', { unique: false });
                    analyticsStore.createIndex('type', 'type', { unique: false });
                }

                // Calendar events store
                if (!db.objectStoreNames.contains('calendar')) {
                    const calendarStore = db.createObjectStore('calendar', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    calendarStore.createIndex('date', 'date', { unique: false });
                    calendarStore.createIndex('type', 'type', { unique: false });
                }

                // Backups store
                if (!db.objectStoreNames.contains('backups')) {
                    const backupsStore = db.createObjectStore('backups', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    backupsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Initialize localStorage with default settings
     */
    initLocalStorage() {
        const defaultSettings = {
            version: '1.0.0',
            theme: 'dark',
            currency: 'EUR',
            language: 'it',
            fiscalYear: 'calendar',
            pivaThreshold: 5000,
            targets: {
                monthly: 165,
                quarterly: 500,
                annual: 2000
            },
            notifications: {
                milestones: true,
                pivaWarnings: true,
                performanceDrops: true,
                weeklyReports: true
            },
            analytics: {
                defaultPeriod: 'last30days',
                chartTypes: ['line', 'bar'],
                autoRefresh: 'daily'
            },
            platforms: {
                youtube: { enabled: true, color: '#ff0000' },
                spotify: { enabled: true, color: '#1db954' },
                appleMusic: { enabled: true, color: '#fa57c1' },
                amazonMusic: { enabled: true, color: '#ff9900' },
                youtubeMusic: { enabled: true, color: '#ff0000' },
                other: { enabled: true, color: '#888888' }
            }
        };

        // Initialize settings if not exists
        if (!localStorage.getItem(this.storageKeys.settings)) {
            localStorage.setItem(this.storageKeys.settings, JSON.stringify(defaultSettings));
        }

        // Initialize user preferences
        const defaultPreferences = {
            sidebarCollapsed: false,
            dashboardLayout: 'default',
            defaultPage: 'dashboard',
            quickActions: ['addRevenue', 'addVideo', 'exportData']
        };

        if (!localStorage.getItem(this.storageKeys.userPreferences)) {
            localStorage.setItem(this.storageKeys.userPreferences, JSON.stringify(defaultPreferences));
        }
    }

    /**
     * Create default sample data for first-time users
     */
    async createDefaultData() {
        try {
            // Check if data already exists
            const existingRevenue = await this.getAllRevenue();
            if (existingRevenue.length > 0) {
                return; // Data already exists
            }

            // Create sample revenue data
            const sampleRevenue = [
                {
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    platform: 'YouTube AdSense',
                    amount: 15.50,
                    videoId: null,
                    description: 'Revenue settimanale YouTube',
                    notes: 'Prima entrata di esempio'
                },
                {
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    platform: 'Spotify',
                    amount: 8.20,
                    videoId: null,
                    description: 'Streaming royalties Spotify',
                    notes: 'Crescita stream mensili'
                }
            ];

            for (const revenue of sampleRevenue) {
                await this.addRevenue(revenue);
            }

            // Create sample video data
            const sampleVideos = [
                {
                    title: 'Deep Focus Study Music • 2 Hours',
                    publishDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    duration: 120,
                    niche: 'Study/Focus',
                    youtubeUrl: '',
                    views: 1250,
                    likes: 85,
                    comments: 12,
                    ctr: 3.8,
                    retention: 65,
                    revenue: 12.50,
                    keywords: ['study music', 'focus music', 'concentration'],
                    thumbnail: '',
                    description: 'Musica per studiare e concentrarsi',
                    status: 'published'
                }
            ];

            for (const video of sampleVideos) {
                await this.addVideo(video);
            }

            console.log('✅ Sample data created successfully');
        } catch (error) {
            console.error('❌ Error creating sample data:', error);
        }
    }

    // ===== REVENUE OPERATIONS =====

    /**
     * Add new revenue entry
     */
    async addRevenue(revenueData) {
        try {
            const revenue = {
                ...revenueData,
                id: Date.now() + Math.random(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Validate revenue data
            this.validateRevenueData(revenue);

            // Add to IndexedDB
            await this.addToStore('revenue', revenue);

            // Update quick stats in localStorage
            await this.updateQuickStats();

            console.log('✅ Revenue added:', revenue);
            return revenue;
        } catch (error) {
            console.error('❌ Error adding revenue:', error);
            throw error;
        }
    }

    /**
     * Get all revenue entries
     */
    async getAllRevenue() {
        try {
            return await this.getAllFromStore('revenue');
        } catch (error) {
            console.error('❌ Error getting revenue:', error);
            return [];
        }
    }

    /**
     * Get revenue by date range
     */
    async getRevenueByDateRange(startDate, endDate) {
        try {
            const allRevenue = await this.getAllRevenue();
            return allRevenue.filter(revenue => {
                const revenueDate = new Date(revenue.date);
                return revenueDate >= new Date(startDate) && revenueDate <= new Date(endDate);
            });
        } catch (error) {
            console.error('❌ Error getting revenue by date range:', error);
            return [];
        }
    }

    /**
     * Update revenue entry
     */
    async updateRevenue(id, updateData) {
        try {
            const existingRevenue = await this.getFromStore('revenue', id);
            if (!existingRevenue) {
                throw new Error('Revenue not found');
            }

            const updatedRevenue = {
                ...existingRevenue,
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            this.validateRevenueData(updatedRevenue);
            await this.updateInStore('revenue', updatedRevenue);
            await this.updateQuickStats();

            return updatedRevenue;
        } catch (error) {
            console.error('❌ Error updating revenue:', error);
            throw error;
        }
    }

    /**
     * Delete revenue entry
     */
    async deleteRevenue(id) {
        try {
            await this.deleteFromStore('revenue', id);
            await this.updateQuickStats();
            console.log('✅ Revenue deleted:', id);
        } catch (error) {
            console.error('❌ Error deleting revenue:', error);
            throw error;
        }
    }

    // ===== VIDEO OPERATIONS =====

    /**
     * Add new video entry
     */
    async addVideo(videoData) {
        try {
            const video = {
                ...videoData,
                id: Date.now() + Math.random(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.validateVideoData(video);
            await this.addToStore('videos', video);

            console.log('✅ Video added:', video);
            return video;
        } catch (error) {
            console.error('❌ Error adding video:', error);
            throw error;
        }
    }

    /**
     * Get all videos
     */
    async getAllVideos() {
        try {
            return await this.getAllFromStore('videos');
        } catch (error) {
            console.error('❌ Error getting videos:', error);
            return [];
        }
    }

    /**
     * Update video entry
     */
    async updateVideo(id, updateData) {
        try {
            const existingVideo = await this.getFromStore('videos', id);
            if (!existingVideo) {
                throw new Error('Video not found');
            }

            const updatedVideo = {
                ...existingVideo,
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            this.validateVideoData(updatedVideo);
            await this.updateInStore('videos', updatedVideo);

            return updatedVideo;
        } catch (error) {
            console.error('❌ Error updating video:', error);
            throw error;
        }
    }

    /**
     * Delete video entry
     */
    async deleteVideo(id) {
        try {
            await this.deleteFromStore('videos', id);
            console.log('✅ Video deleted:', id);
        } catch (error) {
            console.error('❌ Error deleting video:', error);
            throw error;
        }
    }

    // ===== SETTINGS OPERATIONS =====

    /**
     * Get user settings
     */
    getSettings() {
        try {
            const settings = localStorage.getItem(this.storageKeys.settings);
            return settings ? JSON.parse(settings) : null;
        } catch (error) {
            console.error('❌ Error getting settings:', error);
            return null;
        }
    }

    /**
     * Update user settings
     */
    updateSettings(newSettings) {
        try {
            const currentSettings = this.getSettings() || {};
            const updatedSettings = { ...currentSettings, ...newSettings };
            localStorage.setItem(this.storageKeys.settings, JSON.stringify(updatedSettings));
            console.log('✅ Settings updated');
            return updatedSettings;
        } catch (error) {
            console.error('❌ Error updating settings:', error);
            throw error;
        }
    }

    /**
     * Get user preferences
     */
    getUserPreferences() {
        try {
            const prefs = localStorage.getItem(this.storageKeys.userPreferences);
            return prefs ? JSON.parse(prefs) : null;
        } catch (error) {
            console.error('❌ Error getting user preferences:', error);
            return null;
        }
    }

    /**
     * Update user preferences
     */
    updateUserPreferences(newPrefs) {
        try {
            const currentPrefs = this.getUserPreferences() || {};
            const updatedPrefs = { ...currentPrefs, ...newPrefs };
            localStorage.setItem(this.storageKeys.userPreferences, JSON.stringify(updatedPrefs));
            console.log('✅ User preferences updated');
            return updatedPrefs;
        } catch (error) {
            console.error('❌ Error updating user preferences:', error);
            throw error;
        }
    }

    // ===== ANALYTICS & CALCULATIONS =====

    /**
     * Calculate and update quick stats for dashboard
     */
    async updateQuickStats() {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfYear = new Date(now.getFullYear(), 0, 1);

            // Get revenue data
            const monthlyRevenue = await this.getRevenueByDateRange(
                startOfMonth.toISOString().split('T')[0],
                now.toISOString().split('T')[0]
            );

            const yearlyRevenue = await this.getRevenueByDateRange(
                startOfYear.toISOString().split('T')[0],
                now.toISOString().split('T')[0]
            );

            // Calculate totals
            const monthlyTotal = monthlyRevenue.reduce((sum, r) => sum + r.amount, 0);
            const yearlyTotal = yearlyRevenue.reduce((sum, r) => sum + r.amount, 0);

            // Get videos data
            const allVideos = await this.getAllVideos();
            const monthlyVideos = allVideos.filter(v => {
                const videoDate = new Date(v.publishDate);
                return videoDate >= startOfMonth;
            });

            // Calculate video stats
            const totalViews = allVideos.reduce((sum, v) => sum + (v.views || 0), 0);
            const avgCTR = allVideos.length > 0 ?
                allVideos.reduce((sum, v) => sum + (v.ctr || 0), 0) / allVideos.length : 0;

            // Get settings for targets
            const settings = this.getSettings();
            const monthlyTarget = settings?.targets?.monthly || 165;
            const yearlyTarget = settings?.targets?.annual || 2000;
            const pivaThreshold = settings?.pivaThreshold || 5000;

            const quickStats = {
                monthly: {
                    revenue: monthlyTotal,
                    target: monthlyTarget,
                    progress: (monthlyTotal / monthlyTarget) * 100,
                    videosPublished: monthlyVideos.length
                },
                yearly: {
                    revenue: yearlyTotal,
                    target: yearlyTarget,
                    progress: (yearlyTotal / yearlyTarget) * 100,
                    pivaProgress: (yearlyTotal / pivaThreshold) * 100,
                    videosPublished: allVideos.length
                },
                performance: {
                    totalViews,
                    avgCTR: Math.round(avgCTR * 100) / 100,
                    totalVideos: allVideos.length,
                    avgRevenuePerVideo: allVideos.length > 0 ?
                        (yearlyTotal / allVideos.length) : 0
                },
                lastUpdated: new Date().toISOString()
            };

            localStorage.setItem(this.storageKeys.quickStats, JSON.stringify(quickStats));
            return quickStats;
        } catch (error) {
            console.error('❌ Error updating quick stats:', error);
            return null;
        }
    }

    /**
     * Get quick stats for dashboard
     */
    getQuickStats() {
        try {
            const stats = localStorage.getItem(this.storageKeys.quickStats);
            return stats ? JSON.parse(stats) : null;
        } catch (error) {
            console.error('❌ Error getting quick stats:', error);
            return null;
        }
    }

    // ===== BACKUP & EXPORT =====

    /**
     * Create full backup of all data
     */
    async createBackup() {
        try {
            const backup = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: {
                    revenue: await this.getAllRevenue(),
                    videos: await this.getAllVideos(),
                    settings: this.getSettings(),
                    preferences: this.getUserPreferences(),
                    quickStats: this.getQuickStats()
                }
            };

            // Save backup to IndexedDB
            await this.addToStore('backups', backup);

            // Update last backup timestamp
            localStorage.setItem(this.storageKeys.lastBackup, new Date().toISOString());

            console.log('✅ Backup created successfully');
            return backup;
        } catch (error) {
            console.error('❌ Error creating backup:', error);
            throw error;
        }
    }

    /**
     * Export data as JSON for external use
     */
    async exportData(format = 'json') {
        try {
            const data = await this.createBackup();

            if (format === 'json') {
                return JSON.stringify(data, null, 2);
            } else if (format === 'csv') {
                return this.convertToCSV(data.data);
            }

            return data;
        } catch (error) {
            console.error('❌ Error exporting data:', error);
            throw error;
        }
    }

    /**
     * Import data from backup
     */
    async importData(backupData) {
        try {
            // Validate backup data structure
            if (!backupData.data || !backupData.version) {
                throw new Error('Invalid backup format');
            }

            // Clear existing data (with confirmation)
            const confirm = window.confirm(
                'Importare i dati cancellerà tutti i dati esistenti. Continuare?'
            );
            if (!confirm) return false;

            // Clear stores
            await this.clearStore('revenue');
            await this.clearStore('videos');

            // Import revenue data
            if (backupData.data.revenue) {
                for (const revenue of backupData.data.revenue) {
                    await this.addToStore('revenue', revenue);
                }
            }

            // Import videos data
            if (backupData.data.videos) {
                for (const video of backupData.data.videos) {
                    await this.addToStore('videos', video);
                }
            }

            // Import settings
            if (backupData.data.settings) {
                localStorage.setItem(this.storageKeys.settings,
                    JSON.stringify(backupData.data.settings));
            }

            // Import preferences
            if (backupData.data.preferences) {
                localStorage.setItem(this.storageKeys.userPreferences,
                    JSON.stringify(backupData.data.preferences));
            }

            // Update quick stats
            await this.updateQuickStats();

            console.log('✅ Data imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Error importing data:', error);
            throw error;
        }
    }

    // ===== VALIDATION FUNCTIONS =====

    /**
     * Validate revenue data
     */
    validateRevenueData(revenue) {
        if (!revenue.date) throw new Error('Data è richiesta');
        if (!revenue.platform) throw new Error('Piattaforma è richiesta');
        if (typeof revenue.amount !== 'number' || revenue.amount < 0) {
            throw new Error('Importo deve essere un numero positivo');
        }
    }

    /**
     * Validate video data
     */
    validateVideoData(video) {
        if (!video.title) throw new Error('Titolo è richiesto');
        if (!video.publishDate) throw new Error('Data pubblicazione è richiesta');
        if (!video.niche) throw new Error('Nicchia è richiesta');
        if (video.duration && (typeof video.duration !== 'number' || video.duration <= 0)) {
            throw new Error('Durata deve essere un numero positivo');
        }
    }

    // ===== INDEXEDDB HELPER FUNCTIONS =====

    /**
     * Add item to IndexedDB store
     */
    addToStore(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get item from IndexedDB store
     */
    getFromStore(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all items from IndexedDB store
     */
    getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update item in IndexedDB store
     */
    updateInStore(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete item from IndexedDB store
     */
    deleteFromStore(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all data from IndexedDB store
     */
    clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        let csv = '';

        // Revenue CSV
        if (data.revenue && data.revenue.length > 0) {
            csv += 'REVENUE DATA\n';
            csv += 'Date,Platform,Amount,Description,Notes\n';
            data.revenue.forEach(r => {
                csv += `${r.date},${r.platform},${r.amount},"${r.description || ''}","${r.notes || ''}"\n`;
            });
            csv += '\n';
        }

        // Videos CSV
        if (data.videos && data.videos.length > 0) {
            csv += 'VIDEOS DATA\n';
            csv += 'Title,Publish Date,Niche,Views,Revenue,CTR,Retention\n';
            data.videos.forEach(v => {
                csv += `"${v.title}",${v.publishDate},${v.niche},${v.views || 0},${v.revenue || 0},${v.ctr || 0},${v.retention || 0}\n`;
            });
        }

        return csv;
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // This will be implemented in app.js
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize global database instance
window.musicDB = new MusicBusinessDatabase();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicBusinessDatabase;
}