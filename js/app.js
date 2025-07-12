/**
 * MUSIC BUSINESS TRACKER - CORE APPLICATION
 * Main app controller with routing, navigation and initialization
 * VERSIONE DEFINITIVA - COMPLETAMENTE FUNZIONANTE
 */

class MusicBusinessApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.isLoading = false;
        this.isMobile = window.innerWidth <= 768;
        this.sidebarOpen = !this.isMobile;

        // Core app state
        this.appState = {
            user: {
                name: 'Music Creator',
                currency: '€',
                pivaThreshold: 5000,
                monthlyTarget: 165,
                quarterlyTarget: 500,
                annualTarget: 2000
            },
            stats: {
                todayRevenue: 0,
                weekRevenue: 0,
                monthRevenue: 0,
                yearRevenue: 0,
                totalVideos: 0,
                totalSubscribers: 0,
                totalViews: 0
            },
            notifications: [],
            lastUpdate: new Date().toISOString()
        };

        // Notification system
        this.notificationQueue = [];
        this.notificationCount = 0;
        this.maxNotifications = 50;

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('🚀 Music Business Tracker - Initializing...');

        try {
            // Load app state from localStorage
            await this.loadAppState();

            // Setup event listeners
            this.setupEventListeners();

            // Setup navigation
            this.setupNavigation();

            // Setup responsive behavior
            this.setupResponsive();

            // Calculate and update quick stats
            await this.calculateRealTimeStats();

            // Load initial section
            this.navigateToSection(this.currentSection);

            // Auto-save state every 30 seconds
            this.setupAutoSave();

            // Setup notification cleanup
            this.setupNotificationCleanup();

            console.log('✅ App initialized successfully');

            // Show welcome notification
            this.showNotification('App caricata con successo!', 'success');

        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showNotification('Errore inizializzazione app', 'error');
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation clicks
        document.addEventListener('click', (e) => {
            this.handleDocumentClick(e);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Before unload - save state
        window.addEventListener('beforeunload', () => {
            this.saveAppState();
        });

        // Data update events
        window.addEventListener('dataUpdated', () => {
            this.handleDataUpdate();
        });
    }

    /**
     * Handle all document clicks
     */
    handleDocumentClick(e) {
        // Navigation items
        if (e.target.closest('.nav-item')) {
            e.preventDefault();
            const navItem = e.target.closest('.nav-item');
            const section = navItem.dataset.section;
            if (section) {
                this.navigateToSection(section);
            }
            return;
        }

        // Header action buttons
        if (e.target.closest('#add-revenue-btn')) {
            e.preventDefault();
            this.openAddRevenueModal();
            return;
        }

        if (e.target.closest('#add-video-btn')) {
            e.preventDefault();
            this.openAddVideoModal();
            return;
        }

        if (e.target.closest('#notifications-btn')) {
            e.preventDefault();
            this.toggleNotifications();
            return;
        }

        // Quick backup and export
        if (e.target.closest('#quick-backup')) {
            e.preventDefault();
            this.quickBackup();
            return;
        }

        if (e.target.closest('#quick-export')) {
            e.preventDefault();
            this.quickExport();
            return;
        }

        // Modal handling
        if (e.target.closest('#modal-container') && !e.target.closest('.revenue-modal') && !e.target.closest('.modal')) {
            this.closeModal();
            return;
        }

        // Mobile sidebar toggle
        if (e.target.closest('#mobile-menu-btn')) {
            e.preventDefault();
            this.toggleSidebar();
            return;
        }

        // Close dropdowns when clicking outside
        if (!e.target.closest('.filter-dropdown')) {
            document.querySelectorAll('.filter-dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }

        // Close notification panel when clicking outside
        if (!e.target.closest('#notifications-btn') && !e.target.closest('.notification-panel')) {
            this.closeNotificationPanel();
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.openAddRevenueModal();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveAppState();
                    this.showNotification('Dati salvati!', 'success');
                    break;
                case 'b':
                    e.preventDefault();
                    this.quickBackup();
                    break;
                case 'e':
                    e.preventDefault();
                    this.quickExport();
                    break;
                case '1':
                    e.preventDefault();
                    this.navigateToSection('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    this.navigateToSection('revenue');
                    break;
                case '3':
                    e.preventDefault();
                    this.navigateToSection('videos');
                    break;
            }
        }

        // Escape key
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeNotificationPanel();
        }
    }

    /**
     * Setup navigation system
     */
    setupNavigation() {
        this.sections = [
            { id: 'dashboard', title: 'Dashboard', breadcrumb: ['Home', 'Dashboard'] },
            { id: 'revenue', title: 'Entrate & Revenue', breadcrumb: ['Home', 'Revenue'] },
            { id: 'videos', title: 'Video Performance', breadcrumb: ['Home', 'Videos'] },
            { id: 'analytics', title: 'Streaming Analytics', breadcrumb: ['Home', 'Analytics'] },
            { id: 'reports', title: 'Reports & Grafici', breadcrumb: ['Home', 'Reports'] },
            { id: 'calendar', title: 'Content Calendar', breadcrumb: ['Home', 'Calendar'] },
            { id: 'settings', title: 'Impostazioni', breadcrumb: ['Home', 'Settings'] }
        ];

        // Check URL hash for initial section
        const hash = window.location.hash.slice(1);
        if (hash && this.sections.find(s => s.id === hash)) {
            this.currentSection = hash;
        }
    }

    /**
     * Navigate to a specific section
     */
    navigateToSection(sectionId) {
        console.log(`📍 Navigating to: ${sectionId}`);

        // Validate section exists
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) {
            console.error(`❌ Section not found: ${sectionId}`);
            this.showNotification('Sezione non trovata', 'error');
            return;
        }

        // Show loading for better UX
        this.showLoading();

        // Use timeout for smooth transition
        setTimeout(async () => {
            try {
                // Update current section
                this.currentSection = sectionId;

                // Update navigation active state
                this.updateNavigationState(sectionId);

                // Update page header
                this.updatePageHeader(section);

                // Show section content
                this.showSection(sectionId);

                // Initialize section module
                await this.initializeSection(sectionId);

                // Close sidebar on mobile
                if (this.isMobile) {
                    this.closeSidebar();
                }

                // Update URL hash
                window.location.hash = sectionId;

                // Update quick stats when navigating
                await this.calculateRealTimeStats();

            } catch (error) {
                console.error(`❌ Error navigating to ${sectionId}:`, error);
                this.showNotification('Errore nella navigazione', 'error');
            } finally {
                this.hideLoading();
            }
        }, 150);
    }

    /**
     * Update navigation active state
     */
    updateNavigationState(activeSectionId) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current section
        const activeNavItem = document.querySelector(`[data-section="${activeSectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    /**
     * Update page header (title and breadcrumb)
     */
    updatePageHeader(section) {
        // Update page title
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = section.title;
        }

        // Update breadcrumb
        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb && section.breadcrumb) {
            breadcrumb.innerHTML = section.breadcrumb
                .map((item, index) => {
                    if (index === section.breadcrumb.length - 1) {
                        return `<span>${item}</span>`;
                    }
                    return `<span>${item}</span><i class="fas fa-chevron-right"></i>`;
                })
                .join('');
        }

        // Update document title
        document.title = `${section.title} - Music Business Tracker`;
    }

    /**
     * Show specific section content
     */
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    /**
     * Initialize section module
     */
    async initializeSection(sectionId) {
        const moduleMap = {
            'dashboard': () => window.DashboardModule?.init(),
            'revenue': () => window.RevenueModule?.init(),
            'videos': () => window.VideosModule?.init(),
            'analytics': () => window.AnalyticsModule?.init(),
            'reports': () => window.ReportsModule?.init(),
            'calendar': () => window.CalendarModule?.init(),
            'settings': () => window.SettingsModule?.init()
        };

        const initFunction = moduleMap[sectionId];
        if (initFunction) {
            try {
                await initFunction();
            } catch (error) {
                console.warn(`⚠️ Module ${sectionId} initialization error:`, error.message);
                // Don't show error to user for module loading issues
            }
        }
    }

    /**
     * Setup responsive behavior
     */
    setupResponsive() {
        this.handleResize();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        // Handle mobile/desktop transition
        if (wasMobile !== this.isMobile) {
            this.sidebarOpen = !this.isMobile;
            this.updateSidebarState();
        }
    }

    /**
     * Toggle sidebar (mobile)
     */
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        this.updateSidebarState();
    }

    /**
     * Close sidebar (mobile)
     */
    closeSidebar() {
        if (this.isMobile) {
            this.sidebarOpen = false;
            this.updateSidebarState();
        }
    }

    /**
     * Update sidebar state
     */
    updateSidebarState() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open', this.sidebarOpen);
        }
    }

    /**
     * Calculate real-time stats from database
     */
    async calculateRealTimeStats() {
        try {
            // Get all revenue data
            const revenueData = await window.DB.getAll('revenue') || [];

            if (revenueData.length === 0) {
                this.updateQuickStats();
                return;
            }

            const now = new Date();

            // Calculate today's revenue
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

            this.appState.stats.todayRevenue = revenueData
                .filter(rev => {
                    const revDate = new Date(rev.date);
                    return revDate >= todayStart && revDate <= todayEnd;
                })
                .reduce((sum, rev) => sum + (rev.amount || 0), 0);

            // Calculate week revenue
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
            weekStart.setHours(0, 0, 0, 0);

            this.appState.stats.weekRevenue = revenueData
                .filter(rev => {
                    const revDate = new Date(rev.date);
                    return revDate >= weekStart && revDate <= now;
                })
                .reduce((sum, rev) => sum + (rev.amount || 0), 0);

            // Calculate month revenue
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            this.appState.stats.monthRevenue = revenueData
                .filter(rev => {
                    const revDate = new Date(rev.date);
                    return revDate >= monthStart && revDate <= now;
                })
                .reduce((sum, rev) => sum + (rev.amount || 0), 0);

            // Calculate year revenue
            const yearStart = new Date(now.getFullYear(), 0, 1);

            this.appState.stats.yearRevenue = revenueData
                .filter(rev => {
                    const revDate = new Date(rev.date);
                    return revDate >= yearStart && revDate <= now;
                })
                .reduce((sum, rev) => sum + (rev.amount || 0), 0);

            // Update UI
            this.updateQuickStats();

        } catch (error) {
            console.error('❌ Failed to calculate real-time stats:', error);
        }
    }

    /**
     * Update quick stats in sidebar and header
     */
    updateQuickStats() {
        // Sidebar quick stats
        const quickRevenue = document.getElementById('quick-revenue');
        if (quickRevenue) {
            quickRevenue.textContent = this.formatCurrency(this.appState.stats.monthRevenue);
        }

        const quickPiva = document.getElementById('quick-piva');
        if (quickPiva) {
            const percentage = Math.round((this.appState.stats.yearRevenue / this.appState.user.pivaThreshold) * 100);
            quickPiva.textContent = `€${Math.round(this.appState.stats.yearRevenue)} / €${this.appState.user.pivaThreshold} (${percentage}%)`;
        }

        // Header stats
        const headerToday = document.getElementById('header-today');
        if (headerToday) {
            headerToday.textContent = this.formatCurrency(this.appState.stats.todayRevenue);
        }

        const headerWeek = document.getElementById('header-week');
        if (headerWeek) {
            headerWeek.textContent = this.formatCurrency(this.appState.stats.weekRevenue);
        }
    }

    /**
     * Handle data updates from modules
     */
    async handleDataUpdate() {
        await this.calculateRealTimeStats();
        this.saveAppState();
    }

    /**
     * Show loading overlay
     */
    showLoading() {
        this.isLoading = true;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.isLoading = false;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Show notification with auto-cleanup
     */
    showNotification(message, type = 'info', duration = 4000, persistent = false) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notificationId = Date.now() + Math.random();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = notificationId;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas ${this.getNotificationIcon(type)}" style="flex-shrink: 0;"></i>
                <span style="flex: 1;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove(); window.App.removeNotificationFromList('${notificationId}')" 
                        style="margin-left: auto; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(notification);

        // Add to notifications list
        const notificationData = {
            id: notificationId,
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.appState.notifications.unshift(notificationData);

        // Keep only last 50 notifications
        if (this.appState.notifications.length > this.maxNotifications) {
            this.appState.notifications = this.appState.notifications.slice(0, this.maxNotifications);
        }

        this.updateNotificationBadge();

        // Auto remove after duration (unless persistent)
        if (!persistent) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }
    }

    /**
     * Remove notification from internal list
     */
    removeNotificationFromList(notificationId) {
        this.appState.notifications = this.appState.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationBadge();
    }

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Update notification badge
     */
    updateNotificationBadge() {
        const badge = document.getElementById('notification-count');
        if (badge) {
            const unreadCount = this.appState.notifications.filter(n => !n.read).length;
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    /**
     * Toggle notifications panel
     */
    toggleNotifications() {
        let panel = document.getElementById('notification-panel');

        if (!panel) {
            panel = this.createNotificationPanel();
        }

        const isVisible = panel.style.display === 'block';

        if (isVisible) {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
            this.renderNotifications();
            // Mark all as read
            this.appState.notifications.forEach(n => n.read = true);
            this.updateNotificationBadge();
        }
    }

    /**
     * Create notification panel
     */
    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.id = 'notification-panel';
        panel.className = 'notification-panel';
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 350px;
            max-height: 400px;
            background: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 9999;
            display: none;
            overflow: hidden;
        `;

        document.body.appendChild(panel);
        return panel;
    }

    /**
     * Render notifications in panel
     */
    renderNotifications() {
        const panel = document.getElementById('notification-panel');
        if (!panel) return;

        const notifications = this.appState.notifications.slice(0, 20); // Show last 20

        panel.innerHTML = `
            <div style="padding: var(--spacing-lg); border-bottom: 1px solid var(--border-color);">
                <h3 style="margin: 0; color: var(--text-primary); font-size: 1rem;">Notifiche</h3>
                <button onclick="window.App.clearAllNotifications()" 
                        style="position: absolute; top: var(--spacing-lg); right: var(--spacing-lg); background: none; border: none; color: var(--text-muted); cursor: pointer;">
                    Cancella tutto
                </button>
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
                ${notifications.length === 0 ? `
                    <div style="padding: var(--spacing-xl); text-align: center; color: var(--text-muted);">
                        <i class="fas fa-bell" style="font-size: 2rem; margin-bottom: var(--spacing-md);"></i>
                        <p>Nessuna notifica</p>
                    </div>
                ` : notifications.map(notification => `
                    <div style="padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--border-color); ${!notification.read ? 'background: rgba(59, 130, 246, 0.05);' : ''}">
                        <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
                            <i class="fas ${this.getNotificationIcon(notification.type)}" style="color: var(--accent-${notification.type === 'error' ? 'red' : notification.type === 'warning' ? 'orange' : notification.type === 'success' ? 'green' : 'blue'});"></i>
                            <span style="font-size: 0.875rem; color: var(--text-primary);">${notification.message}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">
                            ${window.Utils.getRelativeTime(notification.timestamp)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Close notification panel
     */
    closeNotificationPanel() {
        const panel = document.getElementById('notification-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    /**
     * Clear all notifications
     */
    clearAllNotifications() {
        this.appState.notifications = [];
        this.updateNotificationBadge();
        this.renderNotifications();
    }

    /**
     * Setup notification cleanup
     */
    setupNotificationCleanup() {
        // Clean old notifications every hour
        setInterval(() => {
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            this.appState.notifications = this.appState.notifications.filter(n =>
                new Date(n.timestamp) > oneWeekAgo
            );
            this.updateNotificationBadge();
        }, 60 * 60 * 1000); // Every hour
    }

    /**
     * Quick action handlers - ALL FUNCTIONAL
     */
    openAddRevenueModal() {
        this.navigateToSection('revenue');
        setTimeout(() => {
            if (window.RevenueModule && window.RevenueModule.openRevenueModal) {
                window.RevenueModule.openRevenueModal();
            }
        }, 300);
    }

    openAddVideoModal() {
        this.navigateToSection('videos');
        setTimeout(() => {
            if (window.VideosModule && window.VideosModule.openVideoModal) {
                window.VideosModule.openVideoModal();
            } else {
                this.showNotification('Modulo Video in arrivo!', 'info');
            }
        }, 300);
    }

    /**
     * Close any open modal
     */
    closeModal() {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.classList.remove('active');
            modalContainer.innerHTML = '';
        }
    }

    /**
     * Quick backup function - FUNCTIONAL
     */
    async quickBackup() {
        try {
            this.showNotification('Creazione backup in corso...', 'info', 2000);

            const backupData = {
                appState: this.appState,
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                data: {}
            };

            // Get all data from database
            const storeNames = ['revenue', 'videos', 'streaming', 'settings'];
            for (const storeName of storeNames) {
                try {
                    backupData.data[storeName] = await window.DB.getAll(storeName);
                } catch (error) {
                    console.warn(`⚠️ Could not backup ${storeName}:`, error);
                    backupData.data[storeName] = [];
                }
            }

            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `music-business-backup-${new Date().toISOString().split('T')[0]}.json`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            this.showNotification('Backup creato con successo!', 'success');

        } catch (error) {
            console.error('❌ Backup failed:', error);
            this.showNotification('Errore durante il backup', 'error');
        }
    }

    /**
     * Quick export CSV function - FUNCTIONAL
     */
    async quickExport() {
        try {
            const revenueData = await window.DB.getAll('revenue');

            if (!revenueData || revenueData.length === 0) {
                this.showNotification('Nessun dato da esportare', 'warning');
                return;
            }

            const csvData = revenueData.map(item => ({
                'Data': window.Utils.formatDate(item.date),
                'Piattaforma': item.platform,
                'Importo': item.amount,
                'Valuta': item.currency || '€',
                'Categoria': item.category || 'Altri',
                'Video/Track ID': item.videoId || '',
                'Note': item.notes || ''
            }));

            const filename = `revenue-export-${new Date().toISOString().split('T')[0]}.csv`;
            window.Utils.downloadCSV(csvData, filename);

            this.showNotification('Export CSV completato!', 'success');

        } catch (error) {
            console.error('❌ Export failed:', error);
            this.showNotification('Errore durante l\'export', 'error');
        }
    }

    /**
     * Load app state from localStorage
     */
    async loadAppState() {
        try {
            const saved = localStorage.getItem('musicBusinessTracker');
            if (saved) {
                const savedState = JSON.parse(saved);
                this.appState = { ...this.appState, ...savedState };
                console.log('📂 App state loaded from localStorage');
            }

            // Load user settings from database
            if (window.DB) {
                const pivaThreshold = await window.DB.getSetting('pivaThreshold', 5000);
                const monthlyTarget = await window.DB.getSetting('monthlyTarget', 165);

                this.appState.user.pivaThreshold = pivaThreshold;
                this.appState.user.monthlyTarget = monthlyTarget;
            }

        } catch (error) {
            console.error('❌ Failed to load app state:', error);
        }
    }

    /**
     * Save app state to localStorage
     */
    saveAppState() {
        try {
            this.appState.lastUpdate = new Date().toISOString();
            localStorage.setItem('musicBusinessTracker', JSON.stringify(this.appState));
            console.log('💾 App state saved to localStorage');
        } catch (error) {
            console.error('❌ Failed to save app state:', error);
        }
    }

    /**
     * Setup auto-save
     */
    setupAutoSave() {
        setInterval(() => {
            this.saveAppState();
        }, 30000); // Save every 30 seconds
    }

    /**
     * Format currency value
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(value || 0);
    }

    /**
     * Format date
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('it-IT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    }

    /**
     * Format number
     */
    formatNumber(value) {
        return new Intl.NumberFormat('it-IT').format(value || 0);
    }

    /**
     * Get app instance (singleton pattern)
     */
    static getInstance() {
        if (!MusicBusinessApp.instance) {
            MusicBusinessApp.instance = new MusicBusinessApp();
        }
        return MusicBusinessApp.instance;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.App = MusicBusinessApp.getInstance();
});

// Make app available globally
window.MusicBusinessApp = MusicBusinessApp;