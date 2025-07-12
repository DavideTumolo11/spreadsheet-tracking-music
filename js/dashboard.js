/**
 * MUSIC BUSINESS TRACKER - DASHBOARD MODULE
 * Main dashboard with KPIs, charts, alerts and quick actions
 */

class DashboardModule {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
        this.currentPeriod = 'month';
        this.isInitialized = false;

        // Dashboard data cache
        this.dashboardData = {
            revenue: {
                today: 0,
                week: 0,
                month: 0,
                year: 0,
                growth: 0
            },
            videos: {
                total: 0,
                published: 0,
                views: 0,
                growth: 0
            },
            streaming: {
                plays: 0,
                listeners: 0,
                revenue: 0,
                growth: 0
            },
            targets: {
                monthly: 165,
                quarterly: 500,
                annual: 2000,
                piva: 5000
            },
            recentActivity: []
        };
    }

    /**
     * Initialize dashboard module
     */
    async init() {
        if (this.isInitialized) return;

        console.log('📊 Initializing Dashboard Module...');

        try {
            // Load user settings
            await this.loadSettings();

            // Build dashboard UI
            await this.buildDashboard();

            // Load and display data
            await this.loadDashboardData();

            // Setup real-time updates
            this.setupRealTimeUpdates();

            // Setup event listeners
            this.setupEventListeners();

            this.isInitialized = true;
            console.log('✅ Dashboard Module initialized');

        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showError('Errore inizializzazione dashboard');
        }
    }

    /**
     * Load user settings
     */
    async loadSettings() {
        const settings = await Promise.all([
            window.DB.getSetting('currency', '€'),
            window.DB.getSetting('pivaThreshold', 5000),
            window.DB.getSetting('monthlyTarget', 165),
            window.DB.getSetting('quarterlyTarget', 500),
            window.DB.getSetting('annualTarget', 2000)
        ]);

        this.dashboardData.targets = {
            monthly: settings[2],
            quarterly: settings[3],
            annual: settings[4],
            piva: settings[1]
        };

        this.currency = settings[0];
    }

    /**
     * Build dashboard HTML structure
     */
    async buildDashboard() {
        const container = document.getElementById('dashboard-section');
        if (!container) return;

        container.innerHTML = `
            <div class="dashboard-container">
                <!-- Alerts Section -->
                <div class="dashboard-alerts" id="dashboard-alerts"></div>
                
                <!-- KPI Cards Row -->
                <div class="dashboard-row kpi-cards">
                    <div class="kpi-card revenue" id="revenue-card">
                        <div class="kpi-header">
                            <span class="kpi-title">Revenue Mensile</span>
                            <div class="kpi-icon revenue">
                                <i class="fas fa-euro-sign"></i>
                            </div>
                        </div>
                        <div class="kpi-value" id="revenue-value">€0.00</div>
                        <div class="kpi-subtitle">Obiettivo: ${this.formatCurrency(this.dashboardData.targets.monthly)}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill revenue" id="revenue-progress" style="width: 0%"></div>
                            </div>
                            <div class="progress-labels">
                                <span>0%</span>
                                <span id="revenue-progress-text">del target</span>
                            </div>
                        </div>
                        <div class="kpi-footer">
                            <div class="kpi-change neutral" id="revenue-change">
                                <i class="fas fa-minus"></i>
                                <span>0%</span>
                            </div>
                            <div class="kpi-period">vs mese scorso</div>
                        </div>
                    </div>
                    
                    <div class="kpi-card videos" id="videos-card">
                        <div class="kpi-header">
                            <span class="kpi-title">Video Pubblicati</span>
                            <div class="kpi-icon videos">
                                <i class="fas fa-video"></i>
                            </div>
                        </div>
                        <div class="kpi-value" id="videos-value">0</div>
                        <div class="kpi-subtitle">Questo mese</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill target" id="videos-progress" style="width: 0%"></div>
                            </div>
                            <div class="progress-labels">
                                <span>Target: 12/mese</span>
                                <span id="videos-progress-text">0% completato</span>
                            </div>
                        </div>
                        <div class="kpi-footer">
                            <div class="kpi-change neutral" id="videos-change">
                                <i class="fas fa-minus"></i>
                                <span>0%</span>
                            </div>
                            <div class="kpi-period">vs mese scorso</div>
                        </div>
                    </div>
                    
                    <div class="kpi-card views" id="views-card">
                        <div class="kpi-header">
                            <span class="kpi-title">Visualizzazioni</span>
                            <div class="kpi-icon views">
                                <i class="fas fa-eye"></i>
                            </div>
                        </div>
                        <div class="kpi-value" id="views-value">0</div>
                        <div class="kpi-subtitle">Totali questo mese</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill target" id="views-progress" style="width: 0%"></div>
                            </div>
                            <div class="progress-labels">
                                <span>Target: 10K/mese</span>
                                <span id="views-progress-text">0% completato</span>
                            </div>
                        </div>
                        <div class="kpi-footer">
                            <div class="kpi-change neutral" id="views-change">
                                <i class="fas fa-minus"></i>
                                <span>0%</span>
                            </div>
                            <div class="kpi-period">vs mese scorso</div>
                        </div>
                    </div>
                    
                    <div class="kpi-card piva" id="piva-card">
                        <div class="kpi-header">
                            <span class="kpi-title">Soglia P.IVA</span>
                            <div class="kpi-icon piva">
                                <i class="fas fa-receipt"></i>
                            </div>
                        </div>
                        <div class="kpi-value" id="piva-value">€0</div>
                        <div class="kpi-subtitle">di ${this.formatCurrency(this.dashboardData.targets.piva)} annui</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill piva" id="piva-progress" style="width: 0%"></div>
                            </div>
                            <div class="progress-labels">
                                <span id="piva-progress-text">0%</span>
                                <span>della soglia</span>
                            </div>
                        </div>
                        <div class="kpi-footer">
                            <div class="kpi-change neutral" id="piva-change">
                                <i class="fas fa-calendar"></i>
                                <span id="piva-timeline">Nessun limite</span>
                            </div>
                            <div class="kpi-period">proiezione</div>
                        </div>
                    </div>
                </div>
                
                <!-- Main Content Row -->
                <div class="dashboard-row main-content">
                    <!-- Revenue Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3 class="chart-title">Trend Revenue</h3>
                            <div class="chart-controls">
                                <button class="chart-filter" data-period="week">7G</button>
                                <button class="chart-filter active" data-period="month">30G</button>
                                <button class="chart-filter" data-period="quarter">3M</button>
                                <button class="chart-filter" data-period="year">1A</button>
                            </div>
                        </div>
                        <canvas id="revenue-chart" class="chart-canvas"></canvas>
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="activity-container">
                        <div class="activity-header">
                            <h3 class="activity-title">Attività Recente</h3>
                            <button class="btn-icon" onclick="DashboardModule.refreshActivity()">
                                <i class="fas fa-refresh"></i>
                            </button>
                        </div>
                        <ul class="activity-list" id="activity-list">
                            <li class="activity-item">
                                <div class="activity-icon revenue">
                                    <i class="fas fa-plus"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-title-text">Nessuna attività</div>
                                    <div class="activity-description">Inizia aggiungendo la tua prima entrata</div>
                                </div>
                                <div class="activity-meta">
                                    <div class="activity-time">Ora</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <!-- Secondary Content Row -->
                <div class="dashboard-row secondary-content">
                    <!-- Platform Performance -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3 class="chart-title">Performance Piattaforme</h3>
                            <div class="chart-controls">
                                <button class="chart-filter active" data-chart="platforms">Revenue</button>
                                <button class="chart-filter" data-chart="views">Views</button>
                            </div>
                        </div>
                        <canvas id="platforms-chart" class="chart-canvas"></canvas>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <div class="quick-actions-header">
                            <h3 class="quick-actions-title">Azioni Rapide</h3>
                            <p style="font-size: 0.875rem; color: var(--text-muted);">Operazioni frequenti</p>
                        </div>
                        <div class="quick-actions-grid">
                            <button class="quick-action-btn" onclick="DashboardModule.openAddRevenue()">
                                <div class="quick-action-icon">
                                    <i class="fas fa-plus"></i>
                                </div>
                                <span class="quick-action-text">Aggiungi Entrata</span>
                            </button>
                            
                            <button class="quick-action-btn" onclick="DashboardModule.openAddVideo()">
                                <div class="quick-action-icon">
                                    <i class="fas fa-video"></i>
                                </div>
                                <span class="quick-action-text">Nuovo Video</span>
                            </button>
                            
                            <button class="quick-action-btn" onclick="DashboardModule.openReports()">
                                <div class="quick-action-icon">
                                    <i class="fas fa-chart-bar"></i>
                                </div>
                                <span class="quick-action-text">Genera Report</span>
                            </button>
                            
                            <button class="quick-action-btn" onclick="DashboardModule.exportData()">
                                <div class="quick-action-icon">
                                    <i class="fas fa-download"></i>
                                </div>
                                <span class="quick-action-text">Export CSV</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load dashboard data from database
     */
    async loadDashboardData() {
        try {
            // Show loading
            this.showLoading();

            // Load revenue data
            await this.loadRevenueData();

            // Load video data
            await this.loadVideoData();

            // Load streaming data
            await this.loadStreamingData();

            // Load recent activity
            await this.loadRecentActivity();

            // Update UI
            this.updateKPICards();
            this.updateCharts();
            this.updateAlerts();

            // Hide loading
            this.hideLoading();

        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
            this.showError('Errore caricamento dati dashboard');
        }
    }

    /**
     * Load revenue data
     */
    async loadRevenueData() {
        const now = new Date();
        const ranges = {
            today: window.Utils.getDateRange('today'),
            week: window.Utils.getDateRange('week'),
            month: window.Utils.getDateRange('month'),
            year: window.Utils.getDateRange('year')
        };

        // Get all revenue records
        const allRevenue = await window.DB.getAll('revenue');

        // Calculate totals for each period
        this.dashboardData.revenue = {
            today: this.calculatePeriodRevenue(allRevenue, ranges.today),
            week: this.calculatePeriodRevenue(allRevenue, ranges.week),
            month: this.calculatePeriodRevenue(allRevenue, ranges.month),
            year: this.calculatePeriodRevenue(allRevenue, ranges.year),
            growth: 0 // Will calculate vs previous month
        };

        // Calculate growth vs previous month
        const prevMonth = window.Utils.getDateRange('month');
        prevMonth.start.setMonth(prevMonth.start.getMonth() - 1);
        prevMonth.end.setMonth(prevMonth.end.getMonth() - 1);

        const prevMonthRevenue = this.calculatePeriodRevenue(allRevenue, prevMonth);
        this.dashboardData.revenue.growth = window.Utils.calculatePercentageChange(
            prevMonthRevenue,
            this.dashboardData.revenue.month
        );
    }

    /**
     * Load video data
     */
    async loadVideoData() {
        const ranges = {
            month: window.Utils.getDateRange('month')
        };

        // Get all video records
        const allVideos = await window.DB.getAll('videos');

        // Filter videos for current month
        const monthVideos = allVideos.filter(video =>
            window.Utils.isDateInRange(video.publishDate, ranges.month)
        );

        // Calculate totals
        this.dashboardData.videos = {
            total: allVideos.length,
            published: monthVideos.length,
            views: monthVideos.reduce((sum, video) => sum + (video.views || 0), 0),
            growth: 0 // Will calculate vs previous month
        };

        // Calculate growth vs previous month
        const prevMonth = window.Utils.getDateRange('month');
        prevMonth.start.setMonth(prevMonth.start.getMonth() - 1);
        prevMonth.end.setMonth(prevMonth.end.getMonth() - 1);

        const prevMonthVideos = allVideos.filter(video =>
            window.Utils.isDateInRange(video.publishDate, prevMonth)
        );

        this.dashboardData.videos.growth = window.Utils.calculatePercentageChange(
            prevMonthVideos.length,
            this.dashboardData.videos.published
        );
    }

    /**
     * Load streaming data
     */
    async loadStreamingData() {
        const ranges = {
            month: window.Utils.getDateRange('month')
        };

        // Get all streaming records
        const allStreaming = await window.DB.getAll('streaming');

        // Filter for current month
        const monthStreaming = allStreaming.filter(stream =>
            window.Utils.isDateInRange(stream.date, ranges.month)
        );

        // Calculate totals
        this.dashboardData.streaming = {
            plays: monthStreaming.reduce((sum, stream) => sum + (stream.streams || 0), 0),
            listeners: monthStreaming.reduce((sum, stream) => sum + (stream.listeners || 0), 0),
            revenue: monthStreaming.reduce((sum, stream) => sum + (stream.revenue || 0), 0),
            growth: 0
        };
    }

    /**
     * Load recent activity
     */
    async loadRecentActivity() {
        const activities = [];

        // Get recent revenue entries
        const recentRevenue = await window.DB.query('revenue', {}, {
            sortBy: 'createdAt',
            sortOrder: 'desc',
            limit: 5
        });

        recentRevenue.forEach(rev => {
            activities.push({
                type: 'revenue',
                title: `Entrata ${rev.platform}`,
                description: `${this.formatCurrency(rev.amount)} - ${rev.notes || 'Nessuna nota'}`,
                amount: rev.amount,
                time: rev.createdAt,
                icon: 'fas fa-euro-sign'
            });
        });

        // Get recent video uploads
        const recentVideos = await window.DB.query('videos', {}, {
            sortBy: 'createdAt',
            sortOrder: 'desc',
            limit: 3
        });

        recentVideos.forEach(video => {
            activities.push({
                type: 'video',
                title: `Video pubblicato`,
                description: window.Utils.truncate(video.title, 40),
                amount: video.revenue || 0,
                time: video.createdAt,
                icon: 'fas fa-video'
            });
        });

        // Sort by time and take top 8
        this.dashboardData.recentActivity = activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 8);
    }

    /**
     * Calculate revenue for a specific period
     */
    calculatePeriodRevenue(revenueData, range) {
        return revenueData
            .filter(rev => window.Utils.isDateInRange(rev.date, range))
            .reduce((sum, rev) => sum + (rev.amount || 0), 0);
    }

    /**
     * Update KPI cards
     */
    updateKPICards() {
        // Revenue card
        const revenueValue = document.getElementById('revenue-value');
        const revenueProgress = document.getElementById('revenue-progress');
        const revenueProgressText = document.getElementById('revenue-progress-text');
        const revenueChange = document.getElementById('revenue-change');

        if (revenueValue) {
            revenueValue.textContent = this.formatCurrency(this.dashboardData.revenue.month);

            const progressPercent = Math.min(
                (this.dashboardData.revenue.month / this.dashboardData.targets.monthly) * 100,
                100
            );
            revenueProgress.style.width = `${progressPercent}%`;
            revenueProgressText.textContent = `${Math.round(progressPercent)}% del target`;

            this.updateChangeIndicator(revenueChange, this.dashboardData.revenue.growth);
        }

        // Videos card
        const videosValue = document.getElementById('videos-value');
        const videosProgress = document.getElementById('videos-progress');
        const videosProgressText = document.getElementById('videos-progress-text');
        const videosChange = document.getElementById('videos-change');

        if (videosValue) {
            videosValue.textContent = this.dashboardData.videos.published;

            const progressPercent = Math.min((this.dashboardData.videos.published / 12) * 100, 100);
            videosProgress.style.width = `${progressPercent}%`;
            videosProgressText.textContent = `${Math.round(progressPercent)}% completato`;

            this.updateChangeIndicator(videosChange, this.dashboardData.videos.growth);
        }

        // Views card
        const viewsValue = document.getElementById('views-value');
        const viewsProgress = document.getElementById('views-progress');
        const viewsProgressText = document.getElementById('views-progress-text');
        const viewsChange = document.getElementById('views-change');

        if (viewsValue) {
            viewsValue.textContent = window.Utils.formatNumber(this.dashboardData.videos.views);

            const progressPercent = Math.min((this.dashboardData.videos.views / 10000) * 100, 100);
            viewsProgress.style.width = `${progressPercent}%`;
            viewsProgressText.textContent = `${Math.round(progressPercent)}% completato`;

            this.updateChangeIndicator(viewsChange, 0); // Placeholder
        }

        // P.IVA card
        const pivaValue = document.getElementById('piva-value');
        const pivaProgress = document.getElementById('piva-progress');
        const pivaProgressText = document.getElementById('piva-progress-text');
        const pivaChange = document.getElementById('piva-change');
        const pivaCard = document.getElementById('piva-card');

        if (pivaValue) {
            pivaValue.textContent = this.formatCurrency(this.dashboardData.revenue.year);

            const progressPercent = (this.dashboardData.revenue.year / this.dashboardData.targets.piva) * 100;
            pivaProgress.style.width = `${Math.min(progressPercent, 100)}%`;
            pivaProgressText.textContent = `${Math.round(progressPercent)}%`;

            // Update warning state
            if (progressPercent >= 80) {
                pivaCard.classList.add('warning');
            } else {
                pivaCard.classList.remove('warning');
            }

            // Calculate timeline to threshold
            const monthsRemaining = 12 - new Date().getMonth();
            const projectedYearRevenue = this.dashboardData.revenue.year +
                (this.dashboardData.revenue.month * monthsRemaining);

            if (projectedYearRevenue >= this.dashboardData.targets.piva) {
                const monthsToThreshold = Math.ceil(
                    (this.dashboardData.targets.piva - this.dashboardData.revenue.year) /
                    this.dashboardData.revenue.month
                );
                pivaChange.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>${monthsToThreshold} mesi alla soglia</span>`;
            } else {
                pivaChange.innerHTML = `<i class="fas fa-check"></i><span>Sotto soglia</span>`;
            }
        }
    }

    /**
     * Update change indicator
     */
    updateChangeIndicator(element, changePercent) {
        if (!element) return;

        element.className = 'kpi-change';

        if (changePercent > 0) {
            element.classList.add('positive');
            element.innerHTML = `<i class="fas fa-arrow-up"></i><span>+${Math.round(changePercent)}%</span>`;
        } else if (changePercent < 0) {
            element.classList.add('negative');
            element.innerHTML = `<i class="fas fa-arrow-down"></i><span>${Math.round(changePercent)}%</span>`;
        } else {
            element.classList.add('neutral');
            element.innerHTML = `<i class="fas fa-minus"></i><span>0%</span>`;
        }
    }

    /**
     * Update charts
     */
    updateCharts() {
        this.updateRevenueChart();
        this.updatePlatformsChart();
    }

    /**
     * Update revenue trend chart
     */
    async updateRevenueChart() {
        const canvas = document.getElementById('revenue-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        // Get revenue data for the selected period
        const chartData = await this.getRevenueChartData(this.currentPeriod);

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Revenue',
                    data: chartData.values,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 35, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => `Revenue: ${this.formatCurrency(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(100, 116, 139, 0.3)'
                        },
                        ticks: {
                            color: '#f8fafc'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(100, 116, 139, 0.3)'
                        },
                        ticks: {
                            color: '#f8fafc',
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    /**
     * Update platforms chart
     */
    async updatePlatformsChart() {
        const canvas = document.getElementById('platforms-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.platforms) {
            this.charts.platforms.destroy();
        }

        // Get platform data
        const platformData = await this.getPlatformChartData();

        this.charts.platforms = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: platformData.labels,
                datasets: [{
                    data: platformData.values,
                    backgroundColor: [
                        '#FF0000', // YouTube
                        '#1DB954', // Spotify
                        '#000000', // Apple Music
                        '#FF9900', // Amazon
                        '#7B68EE', // DistroKid
                        '#6B7280'  // Others
                    ],
                    borderWidth: 2,
                    borderColor: 'var(--primary-bg)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f8fafc',
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 35, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const label = context.label;
                                const value = this.formatCurrency(context.parsed);
                                const percentage = ((context.parsed / platformData.total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Get revenue chart data for period
     */
    async getRevenueChartData(period) {
        const allRevenue = await window.DB.getAll('revenue');
        const range = window.Utils.getDateRange(period);

        // Filter data for period
        const periodRevenue = allRevenue.filter(rev =>
            window.Utils.isDateInRange(rev.date, range)
        );

        // Group by date and sum amounts
        const grouped = window.Utils.groupBy(periodRevenue, 'date');
        const chartData = Object.keys(grouped)
            .sort()
            .map(date => ({
                date,
                amount: grouped[date].reduce((sum, rev) => sum + rev.amount, 0)
            }));

        return {
            labels: chartData.map(item => window.Utils.formatDate(item.date, 'short')),
            values: chartData.map(item => item.amount)
        };
    }

    /**
     * Get platform chart data
     */
    async getPlatformChartData() {
        const allRevenue = await window.DB.getAll('revenue');
        const range = window.Utils.getDateRange('month');

        // Filter for current month
        const monthRevenue = allRevenue.filter(rev =>
            window.Utils.isDateInRange(rev.date, range)
        );

        // Group by platform
        const platforms = window.Utils.groupBy(monthRevenue, 'platform');
        const platformTotals = Object.keys(platforms).map(platform => ({
            platform,
            amount: platforms[platform].reduce((sum, rev) => sum + rev.amount, 0)
        }));

        // Sort by amount
        platformTotals.sort((a, b) => b.amount - a.amount);

        const total = platformTotals.reduce((sum, p) => sum + p.amount, 0);

        return {
            labels: platformTotals.map(p => p.platform),
            values: platformTotals.map(p => p.amount),
            total
        };
    }

    /**
     * Update alerts
     */
    updateAlerts() {
        const alertsContainer = document.getElementById('dashboard-alerts');
        if (!alertsContainer) return;

        const alerts = [];

        // P.IVA threshold warning
        const pivaPercent = (this.dashboardData.revenue.year / this.dashboardData.targets.piva) * 100;
        if (pivaPercent >= 80) {
            alerts.push({
                type: 'warning',
                title: 'Attenzione Soglia P.IVA',
                message: `Hai raggiunto il ${Math.round(pivaPercent)}% della soglia P.IVA annuale. Considera l'apertura della Partita IVA.`,
                actions: [
                    { text: 'Apri Impostazioni', action: 'openSettings()' },
                    { text: 'Nascondi', action: 'dismissAlert(this)' }
                ]
            });
        }

        // Monthly target progress
        const monthPercent = (this.dashboardData.revenue.month / this.dashboardData.targets.monthly) * 100;
        if (monthPercent >= 100) {
            alerts.push({
                type: 'success',
                title: 'Obiettivo Mensile Raggiunto!',
                message: `Complimenti! Hai superato il target mensile di ${this.formatCurrency(this.dashboardData.targets.monthly)}.`,
                actions: [
                    { text: 'Vedi Report', action: 'openReports()' }
                ]
            });
        } else if (monthPercent < 50 && new Date().getDate() > 15) {
            alerts.push({
                type: 'info',
                title: 'Target Mensile in Ritardo',
                message: `Sei al ${Math.round(monthPercent)}% del target mensile. Considera di aumentare la frequenza di upload.`,
                actions: [
                    { text: 'Piano Contenuti', action: 'openCalendar()' }
                ]
            });
        }

        // Render alerts
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert ${alert.type}">
                <i class="alert-icon ${this.getAlertIcon(alert.type)}"></i>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                </div>
                <div class="alert-actions">
                    ${alert.actions.map(action => `
                        <button class="alert-btn primary" onclick="${action.action}">${action.text}</button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Get alert icon class
     */
    getAlertIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            danger: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Update recent activity list
     */
    updateRecentActivity() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        if (this.dashboardData.recentActivity.length === 0) {
            activityList.innerHTML = `
                <li class="activity-item">
                    <div class="activity-icon revenue">
                        <i class="fas fa-plus"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title-text">Nessuna attività</div>
                        <div class="activity-description">Inizia aggiungendo la tua prima entrata</div>
                    </div>
                    <div class="activity-meta">
                        <div class="activity-time">Ora</div>
                    </div>
                </li>
            `;
            return;
        }

        activityList.innerHTML = this.dashboardData.recentActivity.map(activity => `
            <li class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title-text">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                </div>
                <div class="activity-meta">
                    <div class="activity-time">${window.Utils.getRelativeTime(activity.time)}</div>
                    ${activity.amount > 0 ? `<div class="activity-amount">${this.formatCurrency(activity.amount)}</div>` : ''}
                </div>
            </li>
        `).join('');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Chart period filters
        document.addEventListener('click', (e) => {
            if (e.target.closest('.chart-filter')) {
                const filter = e.target.closest('.chart-filter');
                const period = filter.dataset.period;

                if (period) {
                    // Update active state
                    document.querySelectorAll('.chart-filter').forEach(f => f.classList.remove('active'));
                    filter.classList.add('active');

                    // Update chart
                    this.currentPeriod = period;
                    this.updateRevenueChart();
                }
            }
        });
    }

    /**
     * Setup real-time updates
     */
    setupRealTimeUpdates() {
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 30000);

        // Listen for data changes
        window.addEventListener('dataUpdated', () => {
            this.refreshData();
        });
    }

    /**
     * Refresh dashboard data
     */
    async refreshData() {
        try {
            await this.loadDashboardData();
            this.updateRecentActivity();
        } catch (error) {
            console.error('❌ Failed to refresh dashboard data:', error);
        }
    }

    /**
     * Utility functions
     */
    formatCurrency(amount) {
        return window.Utils.formatCurrency(amount, this.currency);
    }

    showLoading() {
        // Implementation for loading state
    }

    hideLoading() {
        // Implementation for hiding loading state
    }

    showError(message) {
        if (window.App) {
            window.App.showNotification(message, 'error');
        }
    }

    /**
     * Quick action handlers
     */
    static openAddRevenue() {
        window.App?.navigateToSection('revenue');
        // TODO: Open add revenue modal
    }

    static openAddVideo() {
        window.App?.navigateToSection('videos');
        // TODO: Open add video modal
    }

    static openReports() {
        window.App?.navigateToSection('reports');
    }

    static openCalendar() {
        window.App?.navigateToSection('calendar');
    }

    static exportData() {
        // TODO: Export CSV functionality
        window.App?.showNotification('Export CSV in arrivo!', 'info');
    }

    static refreshActivity() {
        const instance = window.DashboardModule;
        if (instance) {
            instance.refreshData();
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });

        this.isInitialized = false;
    }
}

// Create global instance
window.DashboardModule = new DashboardModule();

// Auto-initialize when app loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.App?.currentSection === 'dashboard') {
        window.DashboardModule.init();
    }
});