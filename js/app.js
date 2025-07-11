/**
 * MUSIC BUSINESS TRACKER - MAIN APP CONTROLLER
 * SPA Routing, Navigation, Modals, Toast Notifications
 * Coordination between all modules
 */

class MusicBusinessApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.isLoading = false;
        this.sidebarCollapsed = false;
        this.modules = {
            dashboard: null,
            revenue: null,
            videos: null,
            analytics: null,
            calendar: null,
            settings: null
        };

        // Initialize app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing Music Business Tracker...');

            // Show loading screen
            this.showLoading(true);

            // Wait for database initialization
            if (window.musicDB) {
                await this.waitForDatabase();
            }

            // Initialize UI components
            this.initializeComponents();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize routing
            this.initializeRouting();

            // Load user preferences
            this.loadUserPreferences();

            // Initialize dashboard by default
            await this.navigateToPage('dashboard');

            // Hide loading screen
            this.showLoading(false);

            console.log('✅ App initialized successfully');
            this.showToast('App inizializzata con successo!', 'success');

        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showToast('Errore inizializzazione app', 'error');
            this.showLoading(false);
        }
    }

    /**
     * Wait for database to be ready
     */
    async waitForDatabase() {
        return new Promise((resolve) => {
            const checkDB = () => {
                if (window.musicDB && window.musicDB.db) {
                    resolve();
                } else {
                    setTimeout(checkDB, 100);
                }
            };
            checkDB();
        });
    }

    /**
     * Initialize UI components
     */
    initializeComponents() {
        // Initialize sidebar state
        this.initializeSidebar();

        // Initialize modal system
        this.initializeModals();

        // Initialize toast container
        this.initializeToasts();

        console.log('✅ UI components initialized');
    }

    /**
     * Initialize sidebar functionality
     */
    initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        if (sidebar) {
            // Load saved sidebar state
            const preferences = window.musicDB?.getUserPreferences();
            if (preferences?.sidebarCollapsed) {
                this.toggleSidebar(true);
            }
        }
    }

    /**
     * Initialize modal system
     */
    initializeModals() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');

        if (modalOverlay) {
            // Close modal when clicking overlay
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        // Close modal buttons
        [modalClose, modalCancel].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.closeModal());
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    /**
     * Initialize toast notifications system
     */
    initializeToasts() {
        // Toast container is already in HTML
        // We'll create toast notifications dynamically
        console.log('✅ Toast system initialized');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation links
        this.setupNavigationListeners();

        // Quick action buttons
        this.setupQuickActionListeners();

        // Sidebar toggle
        this.setupSidebarListeners();

        // Window resize for responsive design
        this.setupResponsiveListeners();

        console.log('✅ Event listeners setup complete');
    }

    /**
     * Setup navigation event listeners
     */
    setupNavigationListeners() {
        const navLinks = document.querySelectorAll('.nav-link[data-page]');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'dashboard';
            this.navigateToPage(page, false);
        });
    }

    /**
     * Setup quick action button listeners
     */
    setupQuickActionListeners() {
        // Add Revenue button
        const addRevenueBtn = document.getElementById('addRevenueBtn');
        const addRevenueModalBtn = document.getElementById('addRevenueModalBtn');

        [addRevenueBtn, addRevenueModalBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.openAddRevenueModal());
            }
        });

        // Add Video button
        const addVideoBtn = document.getElementById('addVideoBtn');
        const addVideoModalBtn = document.getElementById('addVideoModalBtn');

        [addVideoBtn, addVideoModalBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.openAddVideoModal());
            }
        });

        // Export Data button
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportData());
        }

        // Refresh Dashboard button
        const refreshDashboard = document.getElementById('refreshDashboard');
        if (refreshDashboard) {
            refreshDashboard.addEventListener('click', () => this.refreshDashboard());
        }
    }

    /**
     * Setup sidebar toggle listeners
     */
    setupSidebarListeners() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
    }

    /**
     * Setup responsive design listeners
     */
    setupResponsiveListeners() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Initial resize handling
        this.handleResize();
    }

    /**
     * Initialize routing system
     */
    initializeRouting() {
        // Get initial page from URL hash or default to dashboard
        const hash = window.location.hash.substring(1);
        const initialPage = hash || 'dashboard';

        // Set initial history state
        if (!hash) {
            history.replaceState({ page: 'dashboard' }, '', '#dashboard');
        }

        console.log('✅ Routing initialized, initial page:', initialPage);
    }

    /**
     * Load user preferences and apply them
     */
    loadUserPreferences() {
        try {
            const preferences = window.musicDB?.getUserPreferences();
            if (preferences) {
                // Apply sidebar state
                if (preferences.sidebarCollapsed) {
                    this.toggleSidebar(true);
                }

                console.log('✅ User preferences loaded');
            }
        } catch (error) {
            console.error('❌ Error loading user preferences:', error);
        }
    }

    // ===== NAVIGATION SYSTEM =====

    /**
     * Navigate to a specific page
     */
    async navigateToPage(pageName, updateHistory = true) {
        try {
            console.log(`🔄 Navigating to page: ${pageName}`);

            // Validate page name
            const validPages = ['dashboard', 'revenue', 'videos', 'analytics', 'calendar', 'settings'];
            if (!validPages.includes(pageName)) {
                throw new Error(`Invalid page: ${pageName}`);
            }

            // Show loading if needed
            if (this.currentPage !== pageName) {
                this.showPageLoading(true);
            }

            // Hide all pages
            this.hideAllPages();

            // Update navigation state
            this.updateNavigationState(pageName);

            // Update URL and history
            if (updateHistory) {
                history.pushState({ page: pageName }, '', `#${pageName}`);
            }

            // Show target page
            await this.showPage(pageName);

            // Update current page
            this.currentPage = pageName;

            // Hide loading
            this.showPageLoading(false);

            console.log(`✅ Navigation complete: ${pageName}`);

        } catch (error) {
            console.error('❌ Navigation error:', error);
            this.showToast(`Errore navigazione: ${error.message}`, 'error');
            this.showPageLoading(false);
        }
    }

    /**
     * Hide all page contents
     */
    hideAllPages() {
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(page => {
            page.classList.add('hidden');
        });
    }

    /**
     * Update navigation active state
     */
    updateNavigationState(activePage) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page link
        const activeLink = document.querySelector(`.nav-link[data-page="${activePage}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Show specific page and initialize its module
     */
    async showPage(pageName) {
        const pageElement = document.getElementById(`${pageName}-page`);

        if (!pageElement) {
            throw new Error(`Page element not found: ${pageName}-page`);
        }

        // Show page element
        pageElement.classList.remove('hidden');

        // Initialize page module if not already initialized
        if (!this.modules[pageName]) {
            await this.initializePageModule(pageName);
        }

        // Refresh page content
        await this.refreshPageContent(pageName);
    }

    /**
     * Initialize page-specific module
     */
    async initializePageModule(pageName) {
        try {
            switch (pageName) {
                case 'dashboard':
                    if (window.DashboardModule) {
                        this.modules.dashboard = new window.DashboardModule();
                    }
                    break;
                case 'revenue':
                    if (window.RevenueModule) {
                        this.modules.revenue = new window.RevenueModule();
                    }
                    break;
                case 'videos':
                    if (window.VideosModule) {
                        this.modules.videos = new window.VideosModule();
                    }
                    break;
                case 'analytics':
                    if (window.AnalyticsModule) {
                        this.modules.analytics = new window.AnalyticsModule();
                    }
                    break;
                case 'calendar':
                    if (window.CalendarModule) {
                        this.modules.calendar = new window.CalendarModule();
                    }
                    break;
                case 'settings':
                    if (window.SettingsModule) {
                        this.modules.settings = new window.SettingsModule();
                    }
                    break;
            }

            console.log(`✅ Module initialized: ${pageName}`);
        } catch (error) {
            console.error(`❌ Error initializing module ${pageName}:`, error);
        }
    }

    /**
     * Refresh page content
     */
    async refreshPageContent(pageName) {
        try {
            const module = this.modules[pageName];
            if (module && typeof module.refresh === 'function') {
                await module.refresh();
            }
        } catch (error) {
            console.error(`❌ Error refreshing page ${pageName}:`, error);
        }
    }

    // ===== MODAL SYSTEM =====

    /**
     * Open modal with specific content
     */
    openModal(title, content, confirmCallback = null, cancelCallback = null) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalConfirm = document.getElementById('modalConfirm');

        if (!modalOverlay) return;

        // Set modal content
        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = content;

        // Setup confirm button
        if (modalConfirm && confirmCallback) {
            modalConfirm.onclick = () => {
                confirmCallback();
                this.closeModal();
            };
        }

        // Show modal
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input if available
        const firstInput = modalBody?.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Open Add Revenue modal
     */
    openAddRevenueModal() {
        const formHTML = `
            <form id="addRevenueForm" class="form">
                <div class="form-group">
                    <label for="revenueDate" class="form-label">Data *</label>
                    <input type="date" id="revenueDate" class="form-input" required 
                           value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="revenuePlatform" class="form-label">Piattaforma *</label>
                    <select id="revenuePlatform" class="form-select" required>
                        <option value="">Seleziona piattaforma</option>
                        <option value="YouTube AdSense">YouTube AdSense</option>
                        <option value="YouTube Music">YouTube Music</option>
                        <option value="Spotify">Spotify</option>
                        <option value="Apple Music">Apple Music</option>
                        <option value="Amazon Music">Amazon Music</option>
                        <option value="Deezer">Deezer</option>
                        <option value="Tidal">Tidal</option>
                        <option value="Altri">Altri</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="revenueAmount" class="form-label">Importo (€) *</label>
                    <input type="number" id="revenueAmount" class="form-input" 
                           step="0.01" min="0" required placeholder="0.00">
                </div>
                <div class="form-group">
                    <label for="revenueDescription" class="form-label">Descrizione</label>
                    <input type="text" id="revenueDescription" class="form-input" 
                           placeholder="Descrizione entrata">
                </div>
                <div class="form-group">
                    <label for="revenueNotes" class="form-label">Note</label>
                    <textarea id="revenueNotes" class="form-textarea" 
                              placeholder="Note aggiuntive..."></textarea>
                </div>
            </form>
        `;

        this.openModal('Aggiungi Entrata', formHTML, () => this.submitAddRevenue());
    }

    /**
     * Submit add revenue form
     */
    async submitAddRevenue() {
        try {
            const form = document.getElementById('addRevenueForm');
            const formData = new FormData(form);

            const revenueData = {
                date: document.getElementById('revenueDate').value,
                platform: document.getElementById('revenuePlatform').value,
                amount: parseFloat(document.getElementById('revenueAmount').value),
                description: document.getElementById('revenueDescription').value,
                notes: document.getElementById('revenueNotes').value
            };

            // Validate required fields
            if (!revenueData.date || !revenueData.platform || !revenueData.amount) {
                throw new Error('Compilare tutti i campi obbligatori');
            }

            // Add to database
            await window.musicDB.addRevenue(revenueData);

            // Show success message
            this.showToast('Entrata aggiunta con successo!', 'success');

            // Refresh current page if it's revenue or dashboard
            if (this.currentPage === 'revenue' || this.currentPage === 'dashboard') {
                await this.refreshPageContent(this.currentPage);
            }

        } catch (error) {
            console.error('❌ Error adding revenue:', error);
            this.showToast(`Errore: ${error.message}`, 'error');
        }
    }

    /**
     * Open Add Video modal
     */
    openAddVideoModal() {
        const formHTML = `
            <form id="addVideoForm" class="form">
                <div class="form-group">
                    <label for="videoTitle" class="form-label">Titolo Video *</label>
                    <input type="text" id="videoTitle" class="form-input" required 
                           placeholder="Es: Deep Focus Study Music • 2 Hours">
                </div>
                <div class="form-group">
                    <label for="videoDate" class="form-label">Data Pubblicazione *</label>
                    <input type="date" id="videoDate" class="form-input" required 
                           value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="videoNiche" class="form-label">Nicchia *</label>
                    <select id="videoNiche" class="form-select" required>
                        <option value="">Seleziona nicchia</option>
                        <option value="Study/Focus">Study/Focus</option>
                        <option value="Sleep/Relaxation">Sleep/Relaxation</option>
                        <option value="Work/Background">Work/Background</option>
                        <option value="Ambient/Nature">Ambient/Nature</option>
                        <option value="Seasonal/Mood">Seasonal/Mood</option>
                        <option value="Altri">Altri</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="videoDuration" class="form-label">Durata (minuti)</label>
                    <input type="number" id="videoDuration" class="form-input" 
                           min="1" placeholder="120">
                </div>
                <div class="form-group">
                    <label for="videoUrl" class="form-label">URL YouTube</label>
                    <input type="url" id="videoUrl" class="form-input" 
                           placeholder="https://youtube.com/watch?v=...">
                </div>
                <div class="form-group">
                    <label for="videoDescription" class="form-label">Descrizione</label>
                    <textarea id="videoDescription" class="form-textarea" 
                              placeholder="Descrizione del video..."></textarea>
                </div>
            </form>
        `;

        this.openModal('Aggiungi Video', formHTML, () => this.submitAddVideo());
    }

    /**
     * Submit add video form
     */
    async submitAddVideo() {
        try {
            const videoData = {
                title: document.getElementById('videoTitle').value,
                publishDate: document.getElementById('videoDate').value,
                niche: document.getElementById('videoNiche').value,
                duration: parseInt(document.getElementById('videoDuration').value) || null,
                youtubeUrl: document.getElementById('videoUrl').value,
                description: document.getElementById('videoDescription').value,
                views: 0,
                likes: 0,
                comments: 0,
                ctr: 0,
                retention: 0,
                revenue: 0,
                status: 'published'
            };

            // Validate required fields
            if (!videoData.title || !videoData.publishDate || !videoData.niche) {
                throw new Error('Compilare tutti i campi obbligatori');
            }

            // Add to database
            await window.musicDB.addVideo(videoData);

            // Show success message
            this.showToast('Video aggiunto con successo!', 'success');

            // Refresh current page if it's videos or dashboard
            if (this.currentPage === 'videos' || this.currentPage === 'dashboard') {
                await this.refreshPageContent(this.currentPage);
            }

        } catch (error) {
            console.error('❌ Error adding video:', error);
            this.showToast(`Errore: ${error.message}`, 'error');
        }
    }

    // ===== TOAST NOTIFICATIONS =====

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 5000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Toast content
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        // Add to container
        toastContainer.appendChild(toast);

        // Show toast with animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove after duration
        setTimeout(() => this.removeToast(toast), duration);
    }

    /**
     * Remove toast notification
     */
    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * Toggle sidebar collapse state
     */
    toggleSidebar(force = null) {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        if (!sidebar) return;

        const isCollapsed = force !== null ? force : !sidebar.classList.contains('collapsed');

        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }

        this.sidebarCollapsed = isCollapsed;

        // Save state to preferences
        if (window.musicDB) {
            window.musicDB.updateUserPreferences({ sidebarCollapsed: isCollapsed });
        }
    }

    /**
     * Handle window resize for responsive design
     */
    handleResize() {
        const sidebar = document.getElementById('sidebar');
        const isMobile = window.innerWidth <= 768;

        if (isMobile && sidebar) {
            // On mobile, always start with sidebar hidden
            sidebar.classList.remove('mobile-open');
        }
    }

    /**
     * Show/hide main loading screen
     */
    showLoading(show) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            if (show) {
                loadingScreen.classList.remove('hidden');
            } else {
                loadingScreen.classList.add('hidden');
            }
        }
    }

    /**
     * Show/hide page loading state
     */
    showPageLoading(show) {
        // This could be implemented with a page-specific loading indicator
        this.isLoading = show;
    }

    /**
     * Export data functionality
     */
    async exportData() {
        try {
            const data = await window.musicDB.exportData('json');

            // Create download link
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `music-business-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast('Dati esportati con successo!', 'success');
        } catch (error) {
            console.error('❌ Export error:', error);
            this.showToast('Errore durante l\'export', 'error');
        }
    }

    /**
     * Refresh dashboard data
     */
    async refreshDashboard() {
        try {
            // Update quick stats
            await window.musicDB.updateQuickStats();

            // Refresh dashboard if it's the current page
            if (this.currentPage === 'dashboard') {
                await this.refreshPageContent('dashboard');
            }

            this.showToast('Dashboard aggiornata!', 'success');
        } catch (error) {
            console.error('❌ Dashboard refresh error:', error);
            this.showToast('Errore aggiornamento dashboard', 'error');
        }
    }
}

// Initialize app when script loads
window.musicApp = new MusicBusinessApp();

// Make showToast globally available
window.showToast = (message, type, duration) => {
    if (window.musicApp) {
        window.musicApp.showToast(message, type, duration);
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicBusinessApp;
}