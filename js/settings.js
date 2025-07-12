/**
 * MUSIC BUSINESS TRACKER - SETTINGS MODULE V2
 * Clean Design, Simple Layout, Easy Configuration
 */

class SettingsModule {
    constructor() {
        this.container = document.getElementById('settingsContent');
        this.settings = {};
        this.defaultSettings = {
            // Business Settings
            businessName: 'Music Creator',
            monthlyTarget: 165,
            annualTarget: 2000,
            pivaThreshold: 5000,
            currency: 'EUR',

            // App Settings
            theme: 'dark',
            language: 'it',
            notifications: true,
            autoBackup: true,

            // Privacy
            dataRetention: 365,
            enableAnalytics: true
        };

        this.init();
    }

    /**
     * Initialize Settings Module
     */
    async init() {
        try {
            console.log('🔄 Initializing Settings Module V2...');

            await this.loadSettings();
            await this.render();
            this.setupEventListeners();

            console.log('✅ Settings Module V2 initialized');
        } catch (error) {
            console.error('❌ Error initializing Settings:', error);
            this.showError('Errore caricamento Settings');
        }
    }

    /**
     * Load settings
     */
    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('musicBusiness_settings');
            if (savedSettings) {
                this.settings = { ...this.defaultSettings, ...JSON.parse(savedSettings) };
            } else {
                this.settings = { ...this.defaultSettings };
                this.saveSettings();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = { ...this.defaultSettings };
        }
    }

    /**
     * Render Settings Interface - CLEAN LAYOUT
     */
    async render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="settings-clean">
                <!-- Settings Header -->
                <div class="settings-header-clean">
                    <div class="settings-title-clean">
                        <h2>⚙️ Impostazioni</h2>
                        <p>Configura la tua app per un'esperienza personalizzata</p>
                    </div>
                    <button class="btn btn-success" id="saveAllSettings">
                        <i class="fas fa-save"></i>
                        Salva Tutto
                    </button>
                </div>

                <!-- Settings Content Grid -->
                <div class="settings-grid-clean">
                    
                    <!-- Business Settings Card -->
                    <div class="settings-card">
                        <div class="card-header">
                            <h3>💼 Business</h3>
                            <p>Configurazioni del tuo business musicale</p>
                        </div>
                        <div class="card-content">
                            <div class="setting-item">
                                <label>Nome Business</label>
                                <input type="text" id="businessName" class="setting-input" 
                                       value="${this.settings.businessName}" 
                                       placeholder="Il tuo nome o brand">
                            </div>
                            
                            <div class="setting-row">
                                <div class="setting-item">
                                    <label>Obiettivo Mensile</label>
                                    <div class="input-with-unit">
                                        <input type="number" id="monthlyTarget" class="setting-input" 
                                               value="${this.settings.monthlyTarget}" min="0" step="5">
                                        <span class="input-unit">€</span>
                                    </div>
                                </div>
                                
                                <div class="setting-item">
                                    <label>Obiettivo Annuale</label>
                                    <div class="input-with-unit">
                                        <input type="number" id="annualTarget" class="setting-input" 
                                               value="${this.settings.annualTarget}" min="0" step="100">
                                        <span class="input-unit">€</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="setting-row">
                                <div class="setting-item">
                                    <label>Soglia P.IVA</label>
                                    <div class="input-with-unit">
                                        <input type="number" id="pivaThreshold" class="setting-input" 
                                               value="${this.settings.pivaThreshold}" min="0" step="100">
                                        <span class="input-unit">€</span>
                                    </div>
                                </div>
                                
                                <div class="setting-item">
                                    <label>Valuta</label>
                                    <select id="currency" class="setting-input">
                                        <option value="EUR" ${this.settings.currency === 'EUR' ? 'selected' : ''}>Euro (€)</option>
                                        <option value="USD" ${this.settings.currency === 'USD' ? 'selected' : ''}>US Dollar ($)</option>
                                        <option value="GBP" ${this.settings.currency === 'GBP' ? 'selected' : ''}>British Pound (£)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- App Settings Card -->
                    <div class="settings-card">
                        <div class="card-header">
                            <h3>🎨 Aspetto</h3>
                            <p>Personalizza l'interfaccia dell'app</p>
                        </div>
                        <div class="card-content">
                            <div class="setting-item">
                                <label>Tema</label>
                                <div class="theme-options">
                                    <div class="theme-choice ${this.settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                                        <div class="theme-preview dark-theme"></div>
                                        <span>Dark</span>
                                    </div>
                                    <div class="theme-choice ${this.settings.theme === 'light' ? 'active' : ''}" data-theme="light">
                                        <div class="theme-preview light-theme"></div>
                                        <span>Light</span>
                                    </div>
                                    <div class="theme-choice ${this.settings.theme === 'auto' ? 'active' : ''}" data-theme="auto">
                                        <div class="theme-preview auto-theme"></div>
                                        <span>Auto</span>
                                    </div>
                                </div>
                                <input type="hidden" id="theme" value="${this.settings.theme}">
                            </div>
                            
                            <div class="setting-item">
                                <label>Lingua</label>
                                <select id="language" class="setting-input">
                                    <option value="it" ${this.settings.language === 'it' ? 'selected' : ''}>🇮🇹 Italiano</option>
                                    <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>🇺🇸 English</option>
                                    <option value="es" ${this.settings.language === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Notifications Card -->
                    <div class="settings-card">
                        <div class="card-header">
                            <h3>🔔 Notifiche</h3>
                            <p>Gestisci avvisi e promemoria</p>
                        </div>
                        <div class="card-content">
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <label>Notifiche Attive</label>
                                    <p>Ricevi avvisi per eventi importanti</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notifications" ${this.settings.notifications ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <label>Backup Automatico</label>
                                    <p>Salvataggio automatico dei dati</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="autoBackup" ${this.settings.autoBackup ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <label>Analytics</label>
                                    <p>Migliora l'app con dati anonimi</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="enableAnalytics" ${this.settings.enableAnalytics ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Data Management Card -->
                    <div class="settings-card">
                        <div class="card-header">
                            <h3>💾 Gestione Dati</h3>
                            <p>Backup, export e gestione privacy</p>
                        </div>
                        <div class="card-content">
                            <div class="setting-item">
                                <label>Conservazione Dati</label>
                                <select id="dataRetention" class="setting-input">
                                    <option value="30" ${this.settings.dataRetention === 30 ? 'selected' : ''}>30 giorni</option>
                                    <option value="90" ${this.settings.dataRetention === 90 ? 'selected' : ''}>3 mesi</option>
                                    <option value="365" ${this.settings.dataRetention === 365 ? 'selected' : ''}>1 anno</option>
                                    <option value="1095" ${this.settings.dataRetention === 1095 ? 'selected' : ''}>3 anni</option>
                                </select>
                            </div>
                            
                            <div class="data-stats-clean">
                                <div class="data-stat">
                                    <span class="stat-number" id="revenueCount">-</span>
                                    <span class="stat-label">Entrate</span>
                                </div>
                                <div class="data-stat">
                                    <span class="stat-number" id="videoCount">-</span>
                                    <span class="stat-label">Video</span>
                                </div>
                                <div class="data-stat">
                                    <span class="stat-number" id="storageUsed">-</span>
                                    <span class="stat-label">Storage</span>
                                </div>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn btn-outline" id="exportData">
                                    <i class="fas fa-download"></i>
                                    Export Backup
                                </button>
                                <button class="btn btn-outline" id="importData">
                                    <i class="fas fa-upload"></i>
                                    Import Dati
                                </button>
                                <input type="file" id="importFile" accept=".json" style="display: none;">
                            </div>
                        </div>
                    </div>

                    <!-- Danger Zone Card -->
                    <div class="settings-card danger-card">
                        <div class="card-header">
                            <h3>⚠️ Zona Pericolosa</h3>
                            <p>Azioni irreversibili - usare con cautela</p>
                        </div>
                        <div class="card-content">
                            <div class="danger-actions">
                                <button class="btn btn-outline btn-sm" id="resetSettings">
                                    <i class="fas fa-undo"></i>
                                    Reset Impostazioni
                                </button>
                                <button class="btn btn-warning btn-sm" id="clearCache">
                                    <i class="fas fa-broom"></i>
                                    Pulisci Cache
                                </button>
                                <button class="btn btn-error btn-sm" id="deleteAllData">
                                    <i class="fas fa-trash"></i>
                                    Elimina Tutto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateDataStats();
    }

    /**
     * Setup Event Listeners
     */
    setupEventListeners() {
        // Save all settings
        document.getElementById('saveAllSettings').addEventListener('click', () => {
            this.saveAllSettings();
        });

        // Theme selection
        document.querySelectorAll('.theme-choice').forEach(choice => {
            choice.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.selectTheme(theme);
            });
        });

        // Export/Import
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportAllData();
        });

        document.getElementById('importData').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Danger zone actions
        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });

        document.getElementById('clearCache').addEventListener('click', () => {
            this.clearCache();
        });

        document.getElementById('deleteAllData').addEventListener('click', () => {
            this.deleteAllData();
        });

        // Auto-save on change
        this.container.addEventListener('change', () => {
            this.markUnsaved();
        });

        this.container.addEventListener('input', () => {
            this.markUnsaved();
        });
    }

    /**
     * Select theme
     */
    selectTheme(theme) {
        document.querySelectorAll('.theme-choice').forEach(choice => {
            choice.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        document.getElementById('theme').value = theme;

        // Apply theme immediately
        this.applyTheme(theme);
        this.markUnsaved();
    }

    /**
     * Apply theme
     */
    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }

    /**
     * Save all settings
     */
    saveAllSettings() {
        try {
            const newSettings = { ...this.settings };

            // Collect all form values systematically
            const formElements = this.container.querySelectorAll('input, select');

            formElements.forEach(element => {
                if (element.id && element.id !== 'importFile') {
                    const key = element.id;
                    let value;

                    if (element.type === 'checkbox') {
                        value = element.checked;
                    } else if (element.type === 'number') {
                        value = parseFloat(element.value) || 0;
                    } else {
                        value = element.value;
                    }

                    newSettings[key] = value;
                    console.log(`Setting ${key} = ${value}`); // Debug log
                }
            });

            // Save the new settings
            this.settings = newSettings;
            this.saveSettings();

            // Apply changes immediately
            this.applyTheme(newSettings.theme);

            // Update global settings if database available
            if (window.musicDB && typeof window.musicDB.updateSettings === 'function') {
                window.musicDB.updateSettings(this.settings);
            }

            console.log('Settings saved:', this.settings); // Debug log
            this.showToast('✅ Impostazioni salvate con successo!', 'success');
            this.markSaved();

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('❌ Errore durante il salvataggio', 'error');
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            const settingsString = JSON.stringify(this.settings, null, 2);
            localStorage.setItem('musicBusiness_settings', settingsString);
            console.log('Settings saved to localStorage:', settingsString); // Debug log

            // Update global settings if available
            if (window.musicDB && typeof window.musicDB.updateSettings === 'function') {
                window.musicDB.updateSettings(this.settings);
                console.log('Settings updated in musicDB'); // Debug log
            }

            return true;
        } catch (error) {
            console.error('Error saving settings to localStorage:', error);
            this.showToast('❌ Errore durante il salvataggio locale', 'error');
            return false;
        }
    }

    /**
     * Update data statistics
     */
    async updateDataStats() {
        try {
            const revenueData = await window.musicDB.getAllRevenue();
            const videosData = await window.musicDB.getAllVideos();

            document.getElementById('revenueCount').textContent = revenueData.length;
            document.getElementById('videoCount').textContent = videosData.length;

            // Calculate storage
            const totalData = JSON.stringify({ revenue: revenueData, videos: videosData });
            const storageKB = Math.round(new Blob([totalData]).size / 1024);
            document.getElementById('storageUsed').textContent = storageKB + ' KB';

        } catch (error) {
            console.error('Error updating data stats:', error);
        }
    }

    /**
     * Export all data
     */
    async exportAllData() {
        try {
            const [revenueData, videosData, calendarEvents] = await Promise.all([
                window.musicDB.getAllRevenue(),
                window.musicDB.getAllVideos(),
                JSON.parse(localStorage.getItem('musicBusiness_calendarEvents') || '[]')
            ]);

            const exportData = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                settings: this.settings,
                data: {
                    revenue: revenueData,
                    videos: videosData,
                    calendar: calendarEvents
                }
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `music-business-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);

            this.showToast('✅ Backup esportato!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('❌ Errore durante l\'export', 'error');
        }
    }

    /**
     * Import data
     */
    async importData(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            if (!importData.version || !importData.data) {
                throw new Error('File di backup non valido');
            }

            if (confirm('⚠️ Questo sovrascriverà tutti i dati esistenti. Continuare?')) {
                // Import settings
                if (importData.settings) {
                    this.settings = { ...this.defaultSettings, ...importData.settings };
                    this.saveSettings();
                }

                // Import data
                if (importData.data.revenue) {
                    localStorage.setItem('musicBusiness_revenue', JSON.stringify(importData.data.revenue));
                }
                if (importData.data.videos) {
                    localStorage.setItem('musicBusiness_videos', JSON.stringify(importData.data.videos));
                }
                if (importData.data.calendar) {
                    localStorage.setItem('musicBusiness_calendarEvents', JSON.stringify(importData.data.calendar));
                }

                this.showToast('✅ Dati importati! Ricaricando...', 'success');

                setTimeout(() => {
                    location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error('Error importing data:', error);
            this.showToast('❌ File non valido o corrotto', 'error');
        }
    }

    /**
     * Reset settings
     */
    resetSettings() {
        if (confirm('🔄 Ripristinare tutte le impostazioni ai valori predefiniti?')) {
            this.settings = { ...this.defaultSettings };
            this.saveSettings();
            this.applyTheme(this.settings.theme);
            location.reload();
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        if (confirm('🧹 Pulire la cache dell\'applicazione?')) {
            sessionStorage.clear();

            const cacheKeys = Object.keys(localStorage).filter(key =>
                key.includes('_cache') || key.includes('_temp')
            );
            cacheKeys.forEach(key => localStorage.removeItem(key));

            this.showToast('✅ Cache pulita!', 'success');
        }
    }

    /**
     * Delete all data
     */
    deleteAllData() {
        const confirmation = prompt('⚠️ ATTENZIONE: Eliminerà TUTTI i dati!\nDigitare "ELIMINA TUTTO" per confermare:');
        if (confirmation === 'ELIMINA TUTTO') {
            const allKeys = Object.keys(localStorage).filter(key =>
                key.startsWith('musicBusiness_')
            );
            allKeys.forEach(key => localStorage.removeItem(key));

            sessionStorage.clear();

            this.showToast('🗑️ Tutti i dati eliminati. Ricaricando...', 'warning');

            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    }

    /**
     * Mark as unsaved
     */
    markUnsaved() {
        const saveBtn = document.getElementById('saveAllSettings');
        if (saveBtn && !saveBtn.classList.contains('unsaved')) {
            saveBtn.classList.add('unsaved');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Salva Tutto *';
        }
    }

    /**
     * Mark as saved
     */
    markSaved() {
        const saveBtn = document.getElementById('saveAllSettings');
        if (saveBtn) {
            saveBtn.classList.remove('unsaved');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Salva Tutto';
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Errore Settings</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Ricarica Pagina
                    </button>
                </div>
            `;
        }
    }

    /**
     * Get settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Update setting
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    /**
     * Refresh settings
     */
    async refresh() {
        await this.loadSettings();
        await this.render();
        this.updateDataStats();
    }

    /**
     * Destroy settings
     */
    destroy() {
        this.settings = {};
    }
}

// Initialize Settings Module
window.SettingsModule = SettingsModule;