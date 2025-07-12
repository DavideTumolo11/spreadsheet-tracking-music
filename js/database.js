/**
 * MUSIC BUSINESS TRACKER - DATABASE MANAGER
 * LocalStorage + IndexedDB management for data persistence
 */

class DatabaseManager {
    constructor() {
        this.dbName = 'MusicBusinessTracker';
        this.dbVersion = 1;
        this.db = null;

        // Data schemas
        this.schemas = {
            revenue: {
                id: 'string',
                date: 'string',
                platform: 'string',
                amount: 'number',
                videoId: 'string',
                currency: 'string',
                notes: 'string',
                category: 'string',
                tags: 'array',
                createdAt: 'string',
                updatedAt: 'string'
            },
            videos: {
                id: 'string',
                title: 'string',
                publishDate: 'string',
                duration: 'number',
                views: 'number',
                likes: 'number',
                comments: 'number',
                shares: 'number',
                revenue: 'number',
                ctr: 'number',
                retention: 'number',
                thumbnailUrl: 'string',
                description: 'string',
                tags: 'array',
                category: 'string',
                platform: 'string',
                url: 'string',
                status: 'string',
                createdAt: 'string',
                updatedAt: 'string'
            },
            streaming: {
                id: 'string',
                trackId: 'string',
                platform: 'string',
                date: 'string',
                streams: 'number',
                listeners: 'number',
                revenue: 'number',
                country: 'string',
                playlistAdds: 'number',
                saves: 'number',
                skips: 'number',
                completionRate: 'number',
                createdAt: 'string',
                updatedAt: 'string'
            },
            settings: {
                key: 'string',
                value: 'any',
                type: 'string',
                category: 'string',
                updatedAt: 'string'
            },
            backups: {
                id: 'string',
                timestamp: 'string',
                data: 'object',
                size: 'number',
                type: 'string'
            }
        };

        this.init();
    }

    /**
     * Initialize database
     */
    async init() {
        try {
            await this.initIndexedDB();
            await this.runMigrations();
            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            // Fallback to localStorage only
            console.log('📦 Using localStorage fallback');
        }
    }

    /**
     * Initialize IndexedDB
     */
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                Object.keys(this.schemas).forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: 'id' });

                        // Create indexes based on schema
                        const schema = this.schemas[storeName];
                        Object.keys(schema).forEach(field => {
                            if (field !== 'id' && ['string', 'number'].includes(schema[field])) {
                                try {
                                    store.createIndex(field, field, { unique: false });
                                } catch (e) {
                                    // Index might already exist
                                }
                            }
                        });

                        // Common indexes
                        if (schema.date) {
                            store.createIndex('date', 'date', { unique: false });
                        }
                        if (schema.createdAt) {
                            store.createIndex('createdAt', 'createdAt', { unique: false });
                        }
                    }
                });
            };
        });
    }

    /**
     * Run database migrations
     */
    async runMigrations() {
        const currentVersion = await this.getSetting('dbVersion', 0);

        if (currentVersion < 1) {
            // Migration 1: Initial setup
            await this.migrationV1();
            await this.setSetting('dbVersion', 1);
        }

        // Future migrations can be added here
    }

    /**
     * Migration V1: Initial data setup
     */
    async migrationV1() {
        console.log('🔄 Running migration V1...');

        // Set default settings
        const defaultSettings = {
            currency: '€',
            pivaThreshold: 5000,
            monthlyTarget: 165,
            quarterlyTarget: 500,
            annualTarget: 2000,
            theme: 'dark',
            language: 'it',
            dateFormat: 'DD/MM/YYYY',
            backupFrequency: 'weekly',
            notifications: true,
            autoSave: true
        };

        for (const [key, value] of Object.entries(defaultSettings)) {
            await this.setSetting(key, value, 'general');
        }

        console.log('✅ Migration V1 completed');
    }

    /**
     * Create new record
     */
    async create(storeName, data) {
        try {
            // Validate schema
            this.validateSchema(storeName, data);

            // Generate ID if not provided
            if (!data.id) {
                data.id = this.generateId();
            }

            // Add timestamps
            const now = new Date().toISOString();
            data.createdAt = now;
            data.updatedAt = now;

            // Save to IndexedDB
            if (this.db) {
                await this.saveToIndexedDB(storeName, data);
            }

            // Save to localStorage as backup
            await this.saveToLocalStorage(storeName, data);

            console.log(`✅ Created ${storeName} record:`, data.id);
            return data;

        } catch (error) {
            console.error(`❌ Failed to create ${storeName} record:`, error);
            throw error;
        }
    }

    /**
     * Read record by ID
     */
    async read(storeName, id) {
        try {
            // Try IndexedDB first
            if (this.db) {
                const data = await this.readFromIndexedDB(storeName, id);
                if (data) return data;
            }

            // Fallback to localStorage
            return await this.readFromLocalStorage(storeName, id);

        } catch (error) {
            console.error(`❌ Failed to read ${storeName} record ${id}:`, error);
            return null;
        }
    }

    /**
     * Update record
     */
    async update(storeName, id, updates) {
        try {
            // Get existing record
            const existing = await this.read(storeName, id);
            if (!existing) {
                throw new Error(`Record ${id} not found in ${storeName}`);
            }

            // Merge updates
            const updated = {
                ...existing,
                ...updates,
                id, // Ensure ID doesn't change
                updatedAt: new Date().toISOString()
            };

            // Validate schema
            this.validateSchema(storeName, updated);

            // Save to IndexedDB
            if (this.db) {
                await this.saveToIndexedDB(storeName, updated);
            }

            // Save to localStorage
            await this.saveToLocalStorage(storeName, updated);

            console.log(`✅ Updated ${storeName} record:`, id);
            return updated;

        } catch (error) {
            console.error(`❌ Failed to update ${storeName} record ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete record
     */
    async delete(storeName, id) {
        try {
            // Delete from IndexedDB
            if (this.db) {
                await this.deleteFromIndexedDB(storeName, id);
            }

            // Delete from localStorage
            await this.deleteFromLocalStorage(storeName, id);

            console.log(`✅ Deleted ${storeName} record:`, id);
            return true;

        } catch (error) {
            console.error(`❌ Failed to delete ${storeName} record ${id}:`, error);
            throw error;
        }
    }

    /**
     * Query records with filters
     */
    async query(storeName, filters = {}, options = {}) {
        try {
            let results = [];

            // Try IndexedDB first
            if (this.db) {
                results = await this.queryIndexedDB(storeName, filters, options);
            } else {
                // Fallback to localStorage
                results = await this.queryLocalStorage(storeName, filters, options);
            }

            return results;

        } catch (error) {
            console.error(`❌ Failed to query ${storeName}:`, error);
            return [];
        }
    }

    /**
     * Get all records from store
     */
    async getAll(storeName) {
        return await this.query(storeName);
    }

    /**
     * Count records in store
     */
    async count(storeName, filters = {}) {
        const results = await this.query(storeName, filters);
        return results.length;
    }

    /**
     * Clear all records from store
     */
    async clear(storeName) {
        try {
            // Clear IndexedDB
            if (this.db) {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                await store.clear();
            }

            // Clear localStorage
            const lsKey = `${this.dbName}_${storeName}`;
            localStorage.removeItem(lsKey);

            console.log(`✅ Cleared ${storeName} store`);
            return true;

        } catch (error) {
            console.error(`❌ Failed to clear ${storeName}:`, error);
            throw error;
        }
    }

    /**
     * Settings management
     */
    async getSetting(key, defaultValue = null) {
        try {
            const setting = await this.read('settings', key);
            return setting ? setting.value : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }

    async setSetting(key, value, category = 'general') {
        const setting = {
            id: key,
            key,
            value,
            type: typeof value,
            category,
            updatedAt: new Date().toISOString()
        };

        return await this.create('settings', setting);
    }

    /**
     * Backup operations
     */
    async createBackup(type = 'manual') {
        try {
            const backupData = {};

            // Get all data from all stores
            for (const storeName of Object.keys(this.schemas)) {
                if (storeName !== 'backups') {
                    backupData[storeName] = await this.getAll(storeName);
                }
            }

            const backup = {
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                data: backupData,
                size: JSON.stringify(backupData).length,
                type
            };

            await this.create('backups', backup);

            console.log('✅ Backup created:', backup.id);
            return backup;

        } catch (error) {
            console.error('❌ Failed to create backup:', error);
            throw error;
        }
    }

    async restoreBackup(backupId) {
        try {
            const backup = await this.read('backups', backupId);
            if (!backup) {
                throw new Error('Backup not found');
            }

            // Clear existing data
            for (const storeName of Object.keys(backup.data)) {
                await this.clear(storeName);
            }

            // Restore data
            for (const [storeName, records] of Object.entries(backup.data)) {
                for (const record of records) {
                    await this.create(storeName, record);
                }
            }

            console.log('✅ Backup restored:', backupId);
            return true;

        } catch (error) {
            console.error('❌ Failed to restore backup:', error);
            throw error;
        }
    }

    /**
     * Export data as JSON
     */
    async exportData(storeNames = null) {
        const data = {};
        const stores = storeNames || Object.keys(this.schemas);

        for (const storeName of stores) {
            data[storeName] = await this.getAll(storeName);
        }

        return {
            timestamp: new Date().toISOString(),
            version: this.dbVersion,
            data
        };
    }

    /**
     * Import data from JSON
     */
    async importData(importData, merge = false) {
        try {
            if (!merge) {
                // Clear existing data
                for (const storeName of Object.keys(importData.data)) {
                    await this.clear(storeName);
                }
            }

            // Import new data
            for (const [storeName, records] of Object.entries(importData.data)) {
                for (const record of records) {
                    if (merge) {
                        const existing = await this.read(storeName, record.id);
                        if (existing) {
                            await this.update(storeName, record.id, record);
                        } else {
                            await this.create(storeName, record);
                        }
                    } else {
                        await this.create(storeName, record);
                    }
                }
            }

            console.log('✅ Data imported successfully');
            return true;

        } catch (error) {
            console.error('❌ Failed to import data:', error);
            throw error;
        }
    }

    /**
     * IndexedDB operations
     */
    saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    readFromIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    deleteFromIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    queryIndexedDB(storeName, filters, options) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                let results = request.result;

                // Apply filters
                results = this.applyFilters(results, filters);

                // Apply sorting
                if (options.sortBy) {
                    results = this.applySorting(results, options.sortBy, options.sortOrder);
                }

                // Apply pagination
                if (options.limit || options.offset) {
                    results = this.applyPagination(results, options.offset, options.limit);
                }

                resolve(results);
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * LocalStorage operations
     */
    async saveToLocalStorage(storeName, data) {
        const lsKey = `${this.dbName}_${storeName}`;
        const existing = JSON.parse(localStorage.getItem(lsKey) || '{}');
        existing[data.id] = data;
        localStorage.setItem(lsKey, JSON.stringify(existing));
    }

    async readFromLocalStorage(storeName, id) {
        const lsKey = `${this.dbName}_${storeName}`;
        const existing = JSON.parse(localStorage.getItem(lsKey) || '{}');
        return existing[id] || null;
    }

    async deleteFromLocalStorage(storeName, id) {
        const lsKey = `${this.dbName}_${storeName}`;
        const existing = JSON.parse(localStorage.getItem(lsKey) || '{}');
        delete existing[id];
        localStorage.setItem(lsKey, JSON.stringify(existing));
    }

    async queryLocalStorage(storeName, filters, options) {
        const lsKey = `${this.dbName}_${storeName}`;
        const existing = JSON.parse(localStorage.getItem(lsKey) || '{}');
        let results = Object.values(existing);

        // Apply filters
        results = this.applyFilters(results, filters);

        // Apply sorting
        if (options.sortBy) {
            results = this.applySorting(results, options.sortBy, options.sortOrder);
        }

        // Apply pagination
        if (options.limit || options.offset) {
            results = this.applyPagination(results, options.offset, options.limit);
        }

        return results;
    }

    /**
     * Utility functions
     */
    applyFilters(data, filters) {
        return data.filter(item => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                const itemValue = item[key];

                if (filterValue === null || filterValue === undefined) {
                    return true;
                }

                if (typeof filterValue === 'object' && filterValue.operator) {
                    return this.applyOperator(itemValue, filterValue.value, filterValue.operator);
                }

                return itemValue === filterValue;
            });
        });
    }

    applyOperator(itemValue, filterValue, operator) {
        switch (operator) {
            case 'gt': return itemValue > filterValue;
            case 'gte': return itemValue >= filterValue;
            case 'lt': return itemValue < filterValue;
            case 'lte': return itemValue <= filterValue;
            case 'ne': return itemValue !== filterValue;
            case 'contains': return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
            case 'startsWith': return String(itemValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
            case 'endsWith': return String(itemValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
            case 'in': return Array.isArray(filterValue) && filterValue.includes(itemValue);
            default: return itemValue === filterValue;
        }
    }

    applySorting(data, sortBy, sortOrder = 'asc') {
        return data.sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    applyPagination(data, offset = 0, limit = null) {
        if (limit) {
            return data.slice(offset, offset + limit);
        }
        return data.slice(offset);
    }

    validateSchema(storeName, data) {
        const schema = this.schemas[storeName];
        if (!schema) {
            throw new Error(`Schema not found for store: ${storeName}`);
        }

        // Basic validation - can be expanded
        for (const [field, type] of Object.entries(schema)) {
            if (data[field] !== undefined && data[field] !== null) {
                const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
                if (type !== 'any' && actualType !== type) {
                    console.warn(`Schema mismatch for ${storeName}.${field}: expected ${type}, got ${actualType}`);
                }
            }
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Get database statistics
     */
    async getStats() {
        const stats = {};

        for (const storeName of Object.keys(this.schemas)) {
            stats[storeName] = await this.count(storeName);
        }

        return stats;
    }

    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
}

// Create global instance
window.DB = DatabaseManager.getInstance();

// Export for modules
window.DatabaseManager = DatabaseManager;