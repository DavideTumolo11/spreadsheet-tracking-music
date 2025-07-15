/**
 * 🎮 MUSIC BUSINESS TRACKER - APP.JS CORRETTO
 * Controller principale senza CSS dinamico (corretto)
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
            this.showSuccessMessage('App caricata con successo!');

        } catch (error) {
            console.error('Errore inizializzazione app:', error);
            this.showErrorState();
        }
    }

    /**
     * Inizializza database
     */
    async initDatabase() {
        try {
            // Verifica disponibilità localStorage
            if (!StorageUtils.isAvailable()) {
                throw new Error('LocalStorage non disponibile');
            }

            // Inizializza database base
            if (typeof DB !== 'undefined') {
                DB.init();
                console.log('✅ Database inizializzato');
            } else {
                console.warn('⚠️ DB utilities non disponibili');
            }

        } catch (error) {
            console.error('Errore inizializzazione database:', error);
            throw error;
        }
    }

    /**
     * Setup UI base
     */
    initUI() {
        // Update data corrente nell'header
        this.updateCurrentDate();

        // Setup responsive sidebar
        this.setupResponsiveSidebar();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        console.log('✅ UI inizializzata');
    }

    /**
     * Update data corrente
     */
    updateCurrentDate() {
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
     * Bind eventi globali
     */
    bindGlobalEvents() {
        // Navigation click events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const section = navItem.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            }
        });

        // Backup rapido
        const backupBtn = document.getElementById('quickBackup');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.quickBackup());
        }

        // Gestione chiusura finestra
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));

        // Gestione resize finestra
        window.addEventListener('resize', () => this.handleWindowResize());

        console.log('✅ Eventi globali collegati');
    }

    /**
     * Inizializza tutti i manager delle sezioni
     */
    initializeManagers() {
        try {
            // Dashboard Manager
            if (typeof DashboardManager !== 'undefined') {
                this.managers.dashboard = new DashboardManager();
                console.log('✅ Dashboard Manager inizializzato');
            }

            // Revenue Manager
            if (typeof RevenueManager !== 'undefined') {
                this.managers.revenue = new RevenueManager();
                console.log('✅ Revenue Manager inizializzato');
            }

            // Videos Manager  
            if (typeof VideosManager !== 'undefined') {
                this.managers.videos = new VideosManager();
                console.log('✅ Videos Manager inizializzato');
            }

            // Analytics Manager
            if (typeof AnalyticsManager !== 'undefined') {
                this.managers.analytics = new AnalyticsManager();
                console.log('✅ Analytics Manager inizializzato');
            }

            // Reports Manager
            if (typeof ReportsManager !== 'undefined') {
                this.managers.reports = new ReportsManager();
                console.log('✅ Reports Manager inizializzato');
            }

            // Settings Manager
            if (typeof SettingsManager !== 'undefined') {
                this.managers.settings = new SettingsManager();
                console.log('✅ Settings Manager inizializzato');
            }

        } catch (error) {
            console.error('Errore inizializzazione manager:', error);
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
            console.error('Errore navigazione:', error);
            this.showSectionError(sectionName);
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
     * Quick backup dei dati
     */
    async quickBackup() {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                revenue: StorageUtils.load('mbt_revenue_data', []),
                videos: StorageUtils.load('mbt_videos_data', []),
                settings: StorageUtils.load('mbt_settings', {}),
                metadata: StorageUtils.load('mbt_metadata', {})
            };

            const filename = `music-business-backup-${new Date().toISOString().split('T')[0]}.json`;
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.showSuccessMessage('Backup creato con successo!');

        } catch (error) {
            console.error('Errore backup:', error);
            this.showErrorMessage('Errore durante il backup');
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
                        if (this.currentSection === 'revenue') {
                            // Trigger add revenue if manager available
                            if (this.managers.revenue && this.managers.revenue.addRevenue) {
                                this.managers.revenue.addRevenue();
                            }
                        }
                        break;
                    case 'b':
                        e.preventDefault();
                        this.quickBackup();
                        break;
                }
            }

            // ESC key
            if (e.key === 'Escape') {
                this.closeActiveModal();
                this.closeMobileSidebar();
            }
        });
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
        const currentManager = this.managers[this.currentSection];
        if (currentManager && typeof currentManager.handleResize === 'function') {
            currentManager.handleResize();
        }
    }

    /**
     * Gestisce chiusura finestra
     */
    handleBeforeUnload(e) {
        const metadata = StorageUtils.load('mbt_metadata', {});
        const lastBackup = metadata.lastBackup ?
            new Date(metadata.lastBackup) : null;
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
     * Mostra messaggio di successo
     */
    showSuccessMessage(message) {
        console.log('✅ ' + message);
        // Se hai NotificationUtils, usalo, altrimenti log
        if (typeof NotificationUtils !== 'undefined') {
            NotificationUtils.success(message);
        }
    }

    /**
     * Mostra messaggio di errore
     */
    showErrorMessage(message) {
        console.error('❌ ' + message);
        // Se hai NotificationUtils, usalo, altrimenti log
        if (typeof NotificationUtils !== 'undefined') {
            NotificationUtils.error(message);
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
            revenueCount: (typeof DB !== 'undefined') ? DB.getAllRevenue().length : 0,
            videoCount: StorageUtils.load('mbt_videos_data', []).length,
            settings: (typeof DB !== 'undefined') ? DB.getSettings() : {},
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
            console.log(`${name}: ${manager ? '✅ Caricato' : '❌ Non disponibile'}`);
        });

        return state;
    }
}

// Inizializza app quando DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    // Crea istanza app globale
    window.app = new AppController();

    // Funzioni helper globali
    window.debug = () => window.app.debug();
    window.showShortcuts = () => {
        console.log(`
🎹 MUSIC BUSINESS TRACKER - SHORTCUTS:
────────────────────────────────────────
Ctrl+1-6     → Naviga tra sezioni
Ctrl+N       → Aggiungi entrata (se in Revenue)
Ctrl+B       → Backup rapido
ESC          → Chiudi modal/sidebar

📱 MOBILE:
Tap Hamburger → Apri/chiudi menu
Tap Overlay   → Chiudi menu
        `);
    };

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
