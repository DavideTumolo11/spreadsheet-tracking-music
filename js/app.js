/**
 * 🎮 MUSIC BUSINESS TRACKER - APP.JS FINALE
 * Controller principale completo per tutte le sezioni
 */

class AppController {
    constructor() {
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        this.managers = {};
        this.sections = ['dashboard', 'revenue', 'videos', 'analytics', 'reports', 'settings'];
        this.init();
    }

    /**
     * Inizializza applicazione completa
     */
    async init() {
        try {
            // Mostra loader iniziale
            this.showLoader();

            // Inizializza database
            await this.initDatabase();

            // Setup UI base
            this.initUI();

            // Bind eventi globali
            this.bindGlobalEvents();

            // Inizializza tutti i manager
            this.initializeManagers();

            // Inizializza sezione di default
            this.showSection('dashboard');

            // Setup completato
            this.hideLoader();
            this.isInitialized = true;

            console.log('🎵 Music Business Tracker inizializzato correttamente');
            NotificationUtils.success('App caricata con successo!');

        } catch (error) {
            handleError(error, 'Errore inizializzazione applicazione');
            this.showErrorState();
        }
    }

    /**
     * Inizializza database e verifica integrità
     */
    async initDatabase() {
        // Database già inizializzato in database.js
        // Verifica che tutto sia ok
        const settings = DB.getSettings();
        const revenue = DB.getAllRevenue();
        const videos = StorageUtils.load('mbt_videos_data', []);

        console.log(`Database caricato: ${revenue.length} entrate, ${videos.length} video, settings OK`);
    }

    /**
     * Inizializza tutti i manager
     */
    initializeManagers() {
        // I manager sono già inizializzati nei loro file
        // Qui salviamo i riferimenti per controllo
        this.managers = {
            dashboard: window.Dashboard,
            revenue: window.Revenue,
            videos: window.Videos,
            analytics: window.Analytics,
            reports: window.Reports,
            settings: window.Settings
        };

        // Verifica che tutti i manager siano disponibili
        const missingManagers = Object.entries(this.managers)
            .filter(([name, manager]) => !manager)
            .map(([name]) => name);

        if (missingManagers.length > 0) {
            console.warn('Manager mancanti:', missingManagers);
        }
    }

    /**
     * Inizializza UI e componenti base
     */
    initUI() {
        // Aggiorna data header
        this.updateHeaderDate();

        // Setup sidebar navigation
        this.setupNavigation();

        // Setup responsive sidebar per mobile
        this.setupResponsiveSidebar();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Setup section action buttons
        this.setupSectionActions();
    }

    /**
     * Aggiorna data nel header
     */
    updateHeaderDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            dateElement.textContent = now.toLocaleDateString('it-IT', options);
        }
    }

    /**
     * Setup navigation sidebar
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section && this.sections.includes(section)) {
                    this.showSection(section);
                }
            });
        });
    }

    /**
     * Setup azioni sezioni
     */
    setupSectionActions() {
        // Dashboard actions
        const addRevenueQuick = document.getElementById('addRevenueQuick');
        if (addRevenueQuick) {
            addRevenueQuick.addEventListener('click', () => {
                if (this.managers.dashboard && this.managers.dashboard.showAddRevenueModal) {
                    this.managers.dashboard.showAddRevenueModal();
                }
            });
        }

        // Revenue actions
        const addRevenueBtn = document.getElementById('addRevenueBtn');
        if (addRevenueBtn) {
            addRevenueBtn.addEventListener('click', () => {
                if (this.managers.revenue && this.managers.revenue.showAddModal) {
                    this.managers.revenue.showAddModal();
                }
            });
        }

        const exportRevenueBtn = document.getElementById('exportRevenueBtn');
        if (exportRevenueBtn) {
            exportRevenueBtn.addEventListener('click', () => {
                if (this.managers.revenue && this.managers.revenue.exportCSV) {
                    this.managers.revenue.exportCSV();
                }
            });
        }

        // Videos actions
        const addVideoBtn = document.getElementById('addVideoBtn');
        if (addVideoBtn) {
            addVideoBtn.addEventListener('click', () => {
                if (this.managers.videos && this.managers.videos.showAddModal) {
                    this.managers.videos.showAddModal();
                }
            });
        }

        const syncVideosBtn = document.getElementById('syncVideosBtn');
        if (syncVideosBtn) {
            syncVideosBtn.addEventListener('click', () => {
                if (this.managers.videos && this.managers.videos.syncWithRevenue) {
                    this.managers.videos.syncWithRevenue();
                }
            });
        }

        // Analytics actions
        const refreshAnalyticsBtn = document.getElementById('refreshAnalyticsBtn');
        if (refreshAnalyticsBtn) {
            refreshAnalyticsBtn.addEventListener('click', () => {
                if (this.managers.analytics && this.managers.analytics.render) {
                    this.managers.analytics.loadData();
                    this.managers.analytics.calculateAnalytics();
                    this.managers.analytics.generateInsights();
                    this.managers.analytics.render();
                }
            });
        }

        const exportAnalyticsBtn = document.getElementById('exportAnalyticsBtn');
        if (exportAnalyticsBtn) {
            exportAnalyticsBtn.addEventListener('click', () => {
                if (this.managers.analytics && this.managers.analytics.exportAnalytics) {
                    this.managers.analytics.exportAnalytics();
                }
            });
        }

        // Reports actions
        const quickReportBtn = document.getElementById('quickReportBtn');
        if (quickReportBtn) {
            quickReportBtn.addEventListener('click', () => {
                if (this.managers.reports && this.managers.reports.generateQuickReport) {
                    this.managers.reports.generateQuickReport('commercialista_current');
                }
            });
        }

        const scheduleReportBtn = document.getElementById('scheduleReportBtn');
        if (scheduleReportBtn) {
            scheduleReportBtn.addEventListener('click', () => {
                if (this.managers.reports && this.managers.reports.showScheduleModal) {
                    this.managers.reports.showScheduleModal();
                }
            });
        }
    }

    /**
     * Setup responsive sidebar per mobile
     */
    setupResponsiveSidebar() {
        // Setup mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');

        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }

        // Chiudi sidebar quando si clicca sull'overlay
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }

        // Chiudi sidebar quando si seleziona una voce di menu (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && e.target.closest('.nav-item')) {
                setTimeout(() => this.closeMobileSidebar(), 200);
            }
        });
    }

    /**
     * Toggle sidebar mobile
     */
    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');

        if (sidebar && overlay) {
            const isOpen = sidebar.classList.contains('mobile-open');

            if (isOpen) {
                this.closeMobileSidebar();
            } else {
                this.openMobileSidebar();
            }
        }
    }

    /**
     * Apri sidebar mobile
     */
    openMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');

        if (sidebar) sidebar.classList.add('mobile-open');
        if (overlay) overlay.classList.add('active');
    }

    /**
     * Chiudi sidebar mobile
     */
    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');

        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.showSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.showSection('revenue');
                        break;
                    case '3':
                        e.preventDefault();
                        this.showSection('videos');
                        break;
                    case '4':
                        e.preventDefault();
                        this.showSection('analytics');
                        break;
                    case '5':
                        e.preventDefault();
                        this.showSection('reports');
                        break;
                    case '6':
                        e.preventDefault();
                        this.showSection('settings');
                        break;
                    case 'n':
                        e.preventDefault();
                        this.handleQuickAdd();
                        break;
                    case 's':
                        e.preventDefault();
                        DB.createBackup();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.refreshCurrentSection();
                        break;
                }
            }

            // Escape per chiudere modali
            if (e.key === 'Escape') {
                this.closeActiveModal();
            }
        });
    }

    /**
     * Gestisce quick add in base alla sezione corrente
     */
    handleQuickAdd() {
        switch (this.currentSection) {
            case 'revenue':
                if (this.managers.revenue && this.managers.revenue.showAddModal) {
                    this.managers.revenue.showAddModal();
                }
                break;
            case 'videos':
                if (this.managers.videos && this.managers.videos.showAddModal) {
                    this.managers.videos.showAddModal();
                }
                break;
            case 'reports':
                if (this.managers.reports && this.managers.reports.generateQuickReport) {
                    this.managers.reports.generateQuickReport('commercialista_current');
                }
                break;
            default:
                if (this.managers.dashboard && this.managers.dashboard.showAddRevenueModal) {
                    this.managers.dashboard.showAddRevenueModal();
                }
        }
    }

    /**
     * Refresh sezione corrente
     */
    refreshCurrentSection() {
        const manager = this.managers[this.currentSection];
        if (manager) {
            if (manager.loadData) manager.loadData();
            if (manager.render) manager.render();
            NotificationUtils.success(`${this.currentSection} aggiornato`);
        }
    }

    /**
     * Mostra sezione specifica
     */
    showSection(sectionName) {
        if (!this.isInitialized) {
            console.warn('App non ancora inizializzata');
            return;
        }

        if (!this.sections.includes(sectionName)) {
            console.error(`Sezione ${sectionName} non valida`);
            return;
        }

        try {
            // Nascondi tutte le sezioni
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });

            // Rimuovi active da nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });

            // Mostra sezione richiesta
            const targetSection = document.getElementById(`${sectionName}-section`);
            const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);

            if (targetSection && targetNavItem) {
                targetSection.classList.add('active');
                targetNavItem.classList.add('active');

                const previousSection = this.currentSection;
                this.currentSection = sectionName;

                // Cleanup sezione precedente se necessario
                this.cleanupPreviousSection(previousSection);

                // Inizializza/refresh sezione corrente
                this.initCurrentSection(sectionName);

                // Chiudi sidebar mobile se aperta
                if (window.innerWidth <= 768) {
                    this.closeMobileSidebar();
                }

                console.log(`Navigazione verso: ${sectionName}`);
            } else {
                throw new Error(`Sezione ${sectionName} non trovata nel DOM`);
            }

        } catch (error) {
            handleError(error, `Errore navigazione verso ${sectionName}`);
        }
    }

    /**
     * Cleanup sezione precedente
     */
    cleanupPreviousSection(previousSection) {
        const previousManager = this.managers[previousSection];
        if (previousManager && typeof previousManager.cleanup === 'function') {
            previousManager.cleanup();
        }
    }

    /**
     * Inizializza sezione corrente
     */
    initCurrentSection(sectionName) {
        const manager = this.managers[sectionName];

        if (!manager) {
            console.warn(`Manager per ${sectionName} non disponibile`);
            return;
        }

        try {
            switch (sectionName) {
                case 'dashboard':
                    if (manager.render) {
                        manager.render();
                    }
                    break;

                case 'revenue':
                    if (manager.loadData) manager.loadData();
                    if (manager.render) manager.render();
                    break;

                case 'videos':
                    if (manager.loadData) manager.loadData();
                    if (manager.render) manager.render();
                    break;

                case 'analytics':
                    if (manager.loadData) manager.loadData();
                    if (manager.calculateAnalytics) manager.calculateAnalytics();
                    if (manager.generateInsights) manager.generateInsights();
                    if (manager.render) manager.render();
                    break;

                case 'reports':
                    if (manager.render) manager.render();
                    break;

                case 'settings':
                    if (manager.loadSettings) manager.loadSettings();
                    if (manager.render) manager.render();
                    break;
            }
        } catch (error) {
            console.error(`Errore inizializzazione sezione ${sectionName}:`, error);
            this.showSectionError(sectionName);
        }
    }

    /**
     * Mostra errore sezione
     */
    showSectionError(sectionName) {
        const container = document.getElementById(`${sectionName}-content`);
        if (container) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--accent-danger); margin-bottom: 1rem;"></i>
                        <h3>Errore Caricamento ${sectionName}</h3>
                        <p class="text-muted">Si è verificato un errore durante il caricamento.</p>
                        <button class="btn-primary" onclick="app.showSection('${sectionName}')">
                            <i class="fas fa-refresh"></i> Riprova
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Bind eventi globali
     */
    bindGlobalEvents() {
        // Backup rapido
        document.addEventListener('click', (e) => {
            if (e.target.id === 'quickBackup') {
                e.preventDefault();
                DB.createBackup();
            }
        });

        // Gestione resize finestra
        window.addEventListener('resize', debounce(() => {
            this.handleWindowResize();
        }, 250));

        // Gestione beforeunload per backup automatico
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });

        // Gestione errori globali
        window.addEventListener('error', (e) => {
            handleError(e.error, 'Errore JavaScript non gestito');
        });

        // Gestione promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            handleError(e.reason, 'Promise rejection non gestita');
            e.preventDefault();
        });

        // Auto-refresh periodico dei dati
        this.setupPeriodicRefresh();
    }

    /**
     * Setup refresh periodico
     */
    setupPeriodicRefresh() {
        // Refresh soft ogni 5 minuti
        setInterval(() => {
            if (this.isInitialized) {
                // Solo refresh dashboard se è la sezione corrente
                if (this.currentSection === 'dashboard' && this.managers.dashboard) {
                    this.managers.dashboard.render();
                }
            }
        }, 5 * 60 * 1000); // 5 minuti
    }

    /**
     * Gestisce resize finestra
     */
    handleWindowResize() {
        // Chiudi sidebar mobile se si passa a desktop
        if (window.innerWidth > 768) {
            this.closeMobileSidebar();
        }

        // Re-render charts se necessario
        if (this.currentSection === 'analytics' && this.managers.analytics) {
            setTimeout(() => {
                if (this.managers.analytics.renderCharts) {
                    this.managers.analytics.renderCharts();
                }
            }, 100);
        }
    }

    /**
     * Gestisce chiusura app
     */
    handleBeforeUnload(e) {
        // Auto-backup se ci sono modifiche recenti
        const metadata = StorageUtils.load('mbt_metadata', {});
        const lastBackup = metadata.lastBackup ? new Date(metadata.lastBackup) : null;
        const now = new Date();

        // Se ultimo backup > 24 ore fa, suggerisci backup
        if (!lastBackup || (now - lastBackup) > 24 * 60 * 60 * 1000) {
            e.preventDefault();
            e.returnValue = 'Hai modifiche non salvate. Vuoi creare un backup prima di uscire?';
            return e.returnValue;
        }
    }

    /**
     * Chiude modal attivo
     */
    closeActiveModal() {
        const activeModal = document.querySelector('.modal-container.active');
        if (activeModal) {
            activeModal.classList.remove('active');
        }
    }

    /**
     * Mostra loader
     */
    showLoader() {
        const loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <i class="fas fa-music loader-icon"></i>
                <div class="loader-text">Caricamento Music Business Tracker...</div>
                <div class="loader-progress">
                    <div class="loader-bar"></div>
                </div>
                <div class="loader-details">
                    Inizializzando database e moduli...
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    }

    /**
     * Nascondi loader
     */
    hideLoader() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }

    /**
     * Mostra stato errore
     */
    showErrorState() {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h2>Errore Inizializzazione</h2>
                        <p>Si è verificato un errore durante il caricamento dell'applicazione.</p>
                        <div class="error-details">
                            <p>Possibili cause:</p>
                            <ul>
                                <li>Problema con il browser storage</li>
                                <li>Script non caricati correttamente</li>
                                <li>Incompatibilità browser</li>
                            </ul>
                        </div>
                        <div class="error-actions">
                            <button class="btn-primary" onclick="window.location.reload()">
                                <i class="fas fa-refresh"></i> Ricarica Pagina
                            </button>
                            <button class="btn-secondary" onclick="app.clearAllData()">
                                <i class="fas fa-trash"></i> Reset Dati
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Reset completo dati (emergency)
     */
    clearAllData() {
        if (confirm('ATTENZIONE: Questa azione eliminerà tutti i dati. Continuare?')) {
            try {
                StorageUtils.remove('mbt_revenue_data');
                StorageUtils.remove('mbt_videos_data');
                StorageUtils.remove('mbt_settings');
                StorageUtils.remove('mbt_metadata');
                StorageUtils.remove('mbt_scheduled_reports');

                alert('Dati eliminati. La pagina verrà ricaricata.');
                window.location.reload();
            } catch (error) {
                alert('Errore durante il reset: ' + error.message);
            }
        }
    }

    /**
     * Ottieni stato app completo
     */
    getAppState() {
        return {
            currentSection: this.currentSection,
            isInitialized: this.isInitialized,
            availableManagers: Object.keys(this.managers).filter(key => this.managers[key]),
            revenueCount: DB.getAllRevenue().length,
            videoCount: StorageUtils.load('mbt_videos_data', []).length,
            settings: DB.getSettings(),
            storageSize: (StorageUtils.getStorageSize() / 1024).toFixed(1) + ' KB',
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * Debug info completo
     */
    debug() {
        const state = this.getAppState();
        console.log('🎵 Music Business Tracker Debug Info:');
        console.table(state);

        // Test tutti i manager
        console.log('\n📊 Manager Status:');
        Object.entries(this.managers).forEach(([name, manager]) => {
            console.log(`${name}: ${manager ? '✅ OK' : '❌ Missing'}`);
        });

        // Storage info
        console.log('\n💾 Storage Info:');
        console.log('Size:', state.storageSize);
        console.log('Revenue entries:', state.revenueCount);
        console.log('Video entries:', state.videoCount);
    }

    /**
     * Mostra shortcuts help
     */
    showShortcutsHelp() {
        const modal = document.getElementById('modal-container');
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">⌨️ Keyboard Shortcuts</h3>
                    <button class="modal-close" onclick="this.closest('.modal-container').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-grid">
                        <div class="shortcut-group">
                            <h4>Navigazione</h4>
                            <div class="shortcut-item">
                                <kbd>Ctrl+1</kbd> <span>Dashboard</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+2</kbd> <span>Revenue</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+3</kbd> <span>Video</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+4</kbd> <span>Analytics</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+5</kbd> <span>Reports</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+6</kbd> <span>Settings</span>
                            </div>
                        </div>
                        
                        <div class="shortcut-group">
                            <h4>Azioni</h4>
                            <div class="shortcut-item">
                                <kbd>Ctrl+N</kbd> <span>Nuovo (contestuale)</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+S</kbd> <span>Backup</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+R</kbd> <span>Refresh sezione</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Esc</kbd> <span>Chiudi modal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }
}

// CSS aggiuntivo per app controller
const appCSS = `
<style>
#app-loader {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    transition: opacity 0.3s ease;
}

.loader-content {
    text-align: center;
    max-width: 400px;
    padding: var(--spacing-xl);
}

.loader-icon {
    font-size: 4rem;
    color: var(--accent-primary);
    margin-bottom: var(--spacing-lg);
    animation: pulse 2s infinite;
}

.loader-text {
    color: var(--text-primary);
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-size-xl);
    font-weight: 600;
}

.loader-details {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-md);
}

.loader-progress {
    width: 100%;
    height: 6px;
    background-color: var(--bg-tertiary);
    border-radius: 3px;
    overflow: hidden;
    margin-top: var(--spacing-lg);
}

.loader-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-info));
    width: 0;
    animation: loading 3s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
}

@keyframes loading {
    0% { width: 0; }
    50% { width: 70%; }
    100% { width: 100%; }
}

.error-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - var(--header-height));
    padding: var(--spacing-xl);
}

.error-content {
    text-align: center;
    max-width: 500px;
    background-color: var(--bg-secondary);
    padding: var(--spacing-xl);
    border-radius: 12px;
    border: 1px solid var(--border-primary);
}

.error-content i {
    font-size: 4rem;
    color: var(--accent-danger);
    margin-bottom: var(--spacing-lg);
}

.error-content h2 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

.error-content p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-lg);
}

.error-details {
    text-align: left;
    background-color: var(--bg-tertiary);
    padding: var(--spacing-md);
    border-radius: 6px;
    margin: var(--spacing-lg) 0;
}

.error-details ul {
    margin: var(--spacing-sm) 0 0 var(--spacing-lg);
    color: var(--text-secondary);
}

.error-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
}

.mobile-nav-toggle {
    display: none;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    cursor: pointer;
    padding: var(--spacing-sm);
    border-radius: 4px;
    transition: var(--transition-fast);
}

.mobile-nav-toggle:hover {
    background-color: var(--bg-hover);
}

.shortcuts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
}

.shortcut-group h4 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--border-primary);
    padding-bottom: var(--spacing-sm);
}

.shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--border-secondary);
}

.shortcut-item:last-child {
    border-bottom: none;
}

.shortcut-item kbd {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    padding: var(--spacing-xs) var(--spacing-sm);
    font-family: monospace;
    font-size: var(--font-size-sm);
    color: var(--text-primary);
}

.shortcut-item span {
    color: var(--text-secondary);
}

@media (max-width: 768px) {
    .mobile-nav-toggle {
        display: block;
    }
    
    .sidebar {
        transform: translateX(-100%);
        transition: transform var(--transition-normal);
        z-index: 1001;
    }
    
    .sidebar.active {
        transform: translateX(0);
    }
    
    .content {
        margin-left: 0;
    }
    
    .shortcuts-grid {
        grid-template-columns: 1fr;
    }
    
    .error-actions {
        flex-direction: column;
    }
}

/* Utility classes */
.fade-in {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Focus management */
.section.active {
    animation: sectionFadeIn 0.2s ease;
}

@keyframes sectionFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* Loading states migliorati */
.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xl);
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    min-height: 200px;
}

.loading i {
    font-size: var(--font-size-xl);
    color: var(--accent-primary);
}

/* Status indicators */
.app-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--accent-primary);
    animation: pulse 2s infinite;
}

.status-dot.offline {
    background-color: var(--accent-danger);
}

.status-dot.warning {
    background-color: var(--accent-warning);
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', appCSS);

// Inizializza app quando DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    // Crea istanza app globale
    window.app = new AppController();

    // Funzioni helper globali
    window.debug = () => window.app.debug();
    window.showShortcuts = () => window.app.showShortcutsHelp();

    // Status monitor
    window.addEventListener('online', () => {
        const status = document.getElementById('appStatus');
        if (status) {
            status.innerHTML = '● Online';
            status.className = 'status online';
        }
    });

    window.addEventListener('offline', () => {
        const status = document.getElementById('appStatus');
        if (status) {
            status.innerHTML = '● Offline';
            status.className = 'status offline';
        }
    });

    console.log('🎵 Music Business Tracker - Ready to rock!');
    console.log('💡 Tip: Usa Ctrl+1-6 per navigare, Ctrl+N per aggiungere, debug() per info');
});

// Export per uso globale
window.AppController = AppController;