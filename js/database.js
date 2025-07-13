/**
 * 🗄️ MUSIC BUSINESS TRACKER - DATABASE.JS
 * Sistema di gestione dati con localStorage
 */

// === CONFIGURAZIONE DATABASE ===
const DB_CONFIG = {
    version: '1.0.0',
    keys: {
        revenue: 'mbt_revenue_data',
        settings: 'mbt_settings',
        metadata: 'mbt_metadata'
    },
    defaults: {
        settings: {
            pivaThreshold: 5000,
            monthlyTarget: 165,
            currency: 'EUR',
            dateFormat: 'DD/MM/YYYY',
            theme: 'dark'
        }
    }
};

// === DATABASE MANAGER ===
class DatabaseManager {
    constructor() {
        this.cache = new Map();
        this.init();
    }

    /**
     * Inizializza database
     */
    init() {
        try {
            // Verifica compatibilità localStorage
            if (!this.isLocalStorageAvailable()) {
                throw new Error('LocalStorage non disponibile');
            }

            // Inizializza metadati
            this.initMetadata();

            // Inizializza settings default
            this.initSettings();

            // Inizializza revenue data
            this.initRevenue();

            console.log('Database inizializzato correttamente');
        } catch (error) {
            handleError(error, 'Errore inizializzazione database');
        }
    }

    /**
     * Verifica disponibilità localStorage
     */
    isLocalStorageAvailable() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Inizializza metadati applicazione
     */
    initMetadata() {
        const metadata = StorageUtils.load(DB_CONFIG.keys.metadata, {
            version: DB_CONFIG.version,
            createdAt: new Date().toISOString(),
            lastBackup: null,
            totalEntries: 0
        });

        // Aggiorna timestamp ultima apertura
        metadata.lastAccess = new Date().toISOString();
        StorageUtils.save(DB_CONFIG.keys.metadata, metadata);
    }

    /**
     * Inizializza settings con valori default
     */
    initSettings() {
        const settings = StorageUtils.load(DB_CONFIG.keys.settings);
        if (!settings) {
            StorageUtils.save(DB_CONFIG.keys.settings, DB_CONFIG.defaults.settings);
        }
    }

    /**
     * Inizializza revenue data
     */
    initRevenue() {
        const revenue = StorageUtils.load(DB_CONFIG.keys.revenue);
        if (!revenue) {
            StorageUtils.save(DB_CONFIG.keys.revenue, []);
        }
    }

    // === REVENUE OPERATIONS ===

    /**
     * Ottiene tutti i dati revenue
     */
    getAllRevenue() {
        const cacheKey = 'all_revenue';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const data = StorageUtils.load(DB_CONFIG.keys.revenue, []);
        this.cache.set(cacheKey, data);
        return data;
    }

    /**
     * Aggiunge nuova entrata revenue
     */
    addRevenue(revenueData) {
        try {
            // Validazione dati
            const validatedData = this.validateRevenueData(revenueData);

            // Genera ID unico
            validatedData.id = generateId();
            validatedData.createdAt = new Date().toISOString();
            validatedData.updatedAt = new Date().toISOString();

            // Ottieni dati correnti
            const currentData = this.getAllRevenue();

            // Aggiungi nuovo record
            currentData.push(validatedData);

            // Salva e aggiorna cache
            if (StorageUtils.save(DB_CONFIG.keys.revenue, currentData)) {
                this.clearCache();
                this.updateMetadata();
                NotificationUtils.success(`Entrata di ${NumberUtils.formatCurrency(validatedData.amount)} aggiunta`);
                return validatedData;
            }

            throw new Error('Errore nel salvataggio');
        } catch (error) {
            handleError(error, 'Errore aggiunta entrata');
            return null;
        }
    }

    /**
     * Aggiorna entrata esistente
     */
    updateRevenue(id, updateData) {
        try {
            const currentData = this.getAllRevenue();
            const index = currentData.findIndex(item => item.id === id);

            if (index === -1) {
                throw new Error('Entrata non trovata');
            }

            // Valida dati aggiornamento
            const validatedUpdate = this.validateRevenueData(updateData, false);

            // Aggiorna record mantenendo metadati
            const updatedRecord = {
                ...currentData[index],
                ...validatedUpdate,
                updatedAt: new Date().toISOString()
            };

            currentData[index] = updatedRecord;

            // Salva e aggiorna cache
            if (StorageUtils.save(DB_CONFIG.keys.revenue, currentData)) {
                this.clearCache();
                NotificationUtils.success('Entrata aggiornata');
                return updatedRecord;
            }

            throw new Error('Errore nel salvataggio');
        } catch (error) {
            handleError(error, 'Errore aggiornamento entrata');
            return null;
        }
    }

    /**
     * Elimina entrata
     */
    deleteRevenue(id) {
        try {
            const currentData = this.getAllRevenue();
            const index = currentData.findIndex(item => item.id === id);

            if (index === -1) {
                throw new Error('Entrata non trovata');
            }

            const deletedItem = currentData[index];
            currentData.splice(index, 1);

            // Salva e aggiorna cache
            if (StorageUtils.save(DB_CONFIG.keys.revenue, currentData)) {
                this.clearCache();
                this.updateMetadata();
                NotificationUtils.success('Entrata eliminata');
                return deletedItem;
            }

            throw new Error('Errore nel salvataggio');
        } catch (error) {
            handleError(error, 'Errore eliminazione entrata');
            return null;
        }
    }

    /**
     * Ottiene entrata per ID
     */
    getRevenueById(id) {
        const data = this.getAllRevenue();
        return data.find(item => item.id === id) || null;
    }

    /**
     * Filtra revenue per periodo
     */
    getRevenueByDateRange(startDate, endDate) {
        const data = this.getAllRevenue();
        const start = new Date(startDate);
        const end = new Date(endDate);

        return data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= start && itemDate <= end;
        });
    }

    /**
     * Ottiene revenue per mese corrente
     */
    getCurrentMonthRevenue() {
        const startDate = DateUtils.getCurrentMonthStart();
        const endDate = DateUtils.getCurrentMonthEnd();
        return this.getRevenueByDateRange(startDate, endDate);
    }

    /**
     * Ottiene revenue per anno corrente
     */
    getCurrentYearRevenue() {
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);
        return this.getRevenueByDateRange(startDate, endDate);
    }

    /**
     * Valida dati revenue
     */
    validateRevenueData(data, requireAll = true) {
        const validated = {};

        // Data (obbligatoria)
        if (requireAll || data.date !== undefined) {
            if (!ValidationUtils.isValidDate(data.date)) {
                throw new Error('Data non valida');
            }
            validated.date = data.date;
        }

        // Piattaforma (obbligatoria)
        if (requireAll || data.platform !== undefined) {
            if (!ValidationUtils.isNonEmptyString(data.platform)) {
                throw new Error('Piattaforma obbligatoria');
            }
            validated.platform = data.platform.trim();
        }

        // Importo (obbligatorio)
        if (requireAll || data.amount !== undefined) {
            const amount = NumberUtils.parseNumber(data.amount);
            if (!ValidationUtils.isPositiveAmount(amount)) {
                throw new Error('Importo deve essere positivo');
            }
            validated.amount = amount;
        }

        // Video/Track (opzionale)
        if (data.videoTitle !== undefined) {
            validated.videoTitle = data.videoTitle ? data.videoTitle.trim() : '';
        }

        // Note (opzionale)
        if (data.notes !== undefined) {
            validated.notes = data.notes ? data.notes.trim() : '';
        }

        // Categoria (opzionale)
        if (data.category !== undefined) {
            validated.category = data.category ? data.category.trim() : '';
        }

        return validated;
    }

    // === SETTINGS OPERATIONS ===

    /**
     * Ottiene settings
     */
    getSettings() {
        const cacheKey = 'settings';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const settings = StorageUtils.load(DB_CONFIG.keys.settings, DB_CONFIG.defaults.settings);
        this.cache.set(cacheKey, settings);
        return settings;
    }

    /**
     * Aggiorna settings
     */
    updateSettings(newSettings) {
        try {
            const currentSettings = this.getSettings();
            const updatedSettings = { ...currentSettings, ...newSettings };

            // Validazione settings
            this.validateSettings(updatedSettings);

            if (StorageUtils.save(DB_CONFIG.keys.settings, updatedSettings)) {
                this.clearCache();
                NotificationUtils.success('Impostazioni salvate');
                return updatedSettings;
            }

            throw new Error('Errore nel salvataggio');
        } catch (error) {
            handleError(error, 'Errore aggiornamento impostazioni');
            return null;
        }
    }

    /**
     * Valida settings
     */
    validateSettings(settings) {
        // Soglia P.IVA
        if (settings.pivaThreshold !== undefined) {
            const threshold = NumberUtils.parseNumber(settings.pivaThreshold);
            if (!ValidationUtils.isPositiveAmount(threshold)) {
                throw new Error('Soglia P.IVA deve essere positiva');
            }
        }

        // Obiettivo mensile
        if (settings.monthlyTarget !== undefined) {
            const target = NumberUtils.parseNumber(settings.monthlyTarget);
            if (!ValidationUtils.isPositiveAmount(target)) {
                throw new Error('Obiettivo mensile deve essere positivo');
            }
        }
    }

    // === ANALYTICS & REPORTING ===

    /**
     * Calcola statistiche revenue
     */
    getRevenueStats() {
        const allRevenue = this.getAllRevenue();
        const currentMonthRevenue = this.getCurrentMonthRevenue();
        const currentYearRevenue = this.getCurrentYearRevenue();

        const stats = {
            // Totali
            totalEntries: allRevenue.length,
            totalRevenue: allRevenue.reduce((sum, item) => sum + item.amount, 0),

            // Mese corrente
            currentMonthEntries: currentMonthRevenue.length,
            currentMonthRevenue: currentMonthRevenue.reduce((sum, item) => sum + item.amount, 0),

            // Anno corrente
            currentYearEntries: currentYearRevenue.length,
            currentYearRevenue: currentYearRevenue.reduce((sum, item) => sum + item.amount, 0),

            // Medie
            averagePerEntry: 0,
            averagePerMonth: 0,

            // Per piattaforma
            byPlatform: {}
        };

        // Calcola medie
        if (stats.totalEntries > 0) {
            stats.averagePerEntry = stats.totalRevenue / stats.totalEntries;
        }

        // Raggruppa per piattaforma
        allRevenue.forEach(item => {
            if (!stats.byPlatform[item.platform]) {
                stats.byPlatform[item.platform] = {
                    entries: 0,
                    revenue: 0
                };
            }
            stats.byPlatform[item.platform].entries++;
            stats.byPlatform[item.platform].revenue += item.amount;
        });

        return stats;
    }

    /**
     * Ottiene trend mensili ultimi 12 mesi
     */
    getMonthlyTrends() {
        const trends = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const monthRevenue = this.getRevenueByDateRange(startDate, endDate);
            const total = monthRevenue.reduce((sum, item) => sum + item.amount, 0);

            trends.push({
                month: DateUtils.formatDate(startDate).substring(3), // MM/YYYY
                revenue: total,
                entries: monthRevenue.length
            });
        }

        return trends;
    }

    // === BACKUP & RESTORE ===

    /**
     * Crea backup completo
     */
    createBackup() {
        try {
            const backup = {
                version: DB_CONFIG.version,
                timestamp: new Date().toISOString(),
                data: {
                    revenue: this.getAllRevenue(),
                    settings: this.getSettings(),
                    metadata: StorageUtils.load(DB_CONFIG.keys.metadata)
                }
            };

            const filename = `music-business-backup-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.json`;
            ExportUtils.exportJSON(backup, filename);

            // Aggiorna timestamp ultimo backup
            const metadata = StorageUtils.load(DB_CONFIG.keys.metadata);
            metadata.lastBackup = new Date().toISOString();
            StorageUtils.save(DB_CONFIG.keys.metadata, metadata);

            return backup;
        } catch (error) {
            handleError(error, 'Errore creazione backup');
            return null;
        }
    }

    /**
     * Ripristina da backup
     */
    restoreFromBackup(backupData) {
        try {
            // Validazione backup
            if (!backupData || !backupData.data) {
                throw new Error('Backup non valido');
            }

            // Conferma utente
            if (!confirm('Sei sicuro? Questa operazione sostituirà tutti i dati correnti.')) {
                return false;
            }

            // Ripristina dati
            if (backupData.data.revenue) {
                StorageUtils.save(DB_CONFIG.keys.revenue, backupData.data.revenue);
            }

            if (backupData.data.settings) {
                StorageUtils.save(DB_CONFIG.keys.settings, backupData.data.settings);
            }

            // Aggiorna metadati
            const metadata = StorageUtils.load(DB_CONFIG.keys.metadata);
            metadata.restoredAt = new Date().toISOString();
            metadata.restoredFrom = backupData.timestamp;
            StorageUtils.save(DB_CONFIG.keys.metadata, metadata);

            this.clearCache();
            NotificationUtils.success('Backup ripristinato con successo');

            // Ricarica pagina per aggiornare UI
            setTimeout(() => window.location.reload(), 1000);

            return true;
        } catch (error) {
            handleError(error, 'Errore ripristino backup');
            return false;
        }
    }

    // === CACHE MANAGEMENT ===

    /**
     * Pulisce cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Aggiorna metadati
     */
    updateMetadata() {
        const metadata = StorageUtils.load(DB_CONFIG.keys.metadata);
        metadata.totalEntries = this.getAllRevenue().length;
        metadata.lastModified = new Date().toISOString();
        StorageUtils.save(DB_CONFIG.keys.metadata, metadata);
    }

    // === UTILITY METHODS ===

    /**
     * Verifica stato P.IVA
     */
    checkPivaStatus() {
        const settings = this.getSettings();
        const currentYearRevenue = this.getCurrentYearRevenue();
        const totalRevenue = currentYearRevenue.reduce((sum, item) => sum + item.amount, 0);

        return {
            currentRevenue: totalRevenue,
            threshold: settings.pivaThreshold,
            percentage: (totalRevenue / settings.pivaThreshold) * 100,
            remaining: settings.pivaThreshold - totalRevenue,
            needsPiva: totalRevenue >= settings.pivaThreshold
        };
    }

    /**
     * Verifica obiettivi mensili
     */
    checkMonthlyGoals() {
        const settings = this.getSettings();
        const currentMonthRevenue = this.getCurrentMonthRevenue();
        const totalRevenue = currentMonthRevenue.reduce((sum, item) => sum + item.amount, 0);

        return {
            currentRevenue: totalRevenue,
            target: settings.monthlyTarget,
            percentage: (totalRevenue / settings.monthlyTarget) * 100,
            remaining: settings.monthlyTarget - totalRevenue,
            achieved: totalRevenue >= settings.monthlyTarget
        };
    }
}

// === INIZIALIZZAZIONE GLOBALE ===
const DB = new DatabaseManager();

// Export per uso globale
window.DB = DB;