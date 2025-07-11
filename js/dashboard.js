/**
 * MUSIC BUSINESS TRACKER - DASHBOARD MODULE
 * KPI Cards, Charts, Performance Overview, Alerts
 */

class DashboardModule {
    constructor() {
        this.container = document.getElementById('dashboardContent');
        this.charts = {};
        this.refreshInterval = null;
        this.initialized = false;

        this.init();
    }

    /**
     * Initialize dashboard module
     */
    async init() {
        try {
            console.log('🚀 Initializing Dashboard Module...');

            if (!this.container) {
                throw new Error('Dashboard container not found');
            }

            // Create dashboard layout
            await this.createDashboardLayout();

            // Load and display data
            await this.loadDashboardData();

            // Setup auto-refresh
            this.setupAutoRefresh();

            this.initialized = true;
            console.log('✅ Dashboard Module initialized');

        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showError('Errore caricamento dashboard');
        }
    }

    /**
     * Create dashboard HTML layout
     */
    async createDashboardLayout() {
        const dashboardHTML = `
            <div class="dashboard-grid">
                <!-- KPI Cards Section -->
                <div class="kpi-section">
                    <div class="section-header">
                        <h2 class="section-title">Panoramica Mensile</h2>
                        <div class="section-actions">
                            <span class="last-updated" id="lastUpdated">Ultimo aggiornamento: --</span>
                        </div>
                    </div>
                    
                    <div class="kpi-cards-grid">
                        <!-- Monthly Revenue Card -->
                        <div class="kpi-card revenue-card">
                            <div class="kpi-header">
                                <div class="kpi-icon">
                                    <i class="fas fa-euro-sign"></i>
                                </div>
                                <div class="kpi-meta">
                                    <span class="kpi-title">Revenue Mensile</span>
                                    <span class="kpi-period">Gennaio 2025</span>
                                </div>
                            </div>
                            <div class="kpi-value">
                                <span class="amount" id="monthlyRevenue">€0.00</span>
                                <span class="growth positive" id="monthlyGrowth">+0%</span>
                            </div>
                            <div class="kpi-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="monthlyProgress" style="width: 0%"></div>
                                </div>
                                <span class="progress-text">
                                    <span id="monthlyTarget">€165</span> obiettivo mensile
                                </span>
                            </div>
                        </div>
                        
                        <!-- Annual Revenue Card -->
                        <div class="kpi-card annual-card">
                            <div class="kpi-header">
                                <div class="kpi-icon">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="kpi-meta">
                                    <span class="kpi-title">Revenue Annuale</span>
                                    <span class="kpi-period">2025</span>
                                </div>
                            </div>
                            <div class="kpi-value">
                                <span class="amount" id="annualRevenue">€0.00</span>
                                <span class="growth positive" id="annualGrowth">+0%</span>
                            </div>
                            <div class="kpi-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="annualProgress" style="width: 0%"></div>
                                </div>
                                <span class="progress-text">
                                    <span id="annualTarget">€2,000</span> obiettivo annuale
                                </span>
                            </div>
                        </div>
                        
                        <!-- P.IVA Threshold Card -->
                        <div class="kpi-card piva-card">
                            <div class="kpi-header">
                                <div class="kpi-icon warning">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="kpi-meta">
                                    <span class="kpi-title">Soglia P.IVA</span>
                                    <span class="kpi-period">Monitoraggio</span>
                                </div>
                            </div>
                            <div class="kpi-value">
                                <span class="amount" id="pivaRevenue">€0.00</span>
                                <span class="threshold-remaining" id="pivaRemaining">€5,000 rimanenti</span>
                            </div>
                            <div class="kpi-progress">
                                <div class="progress-bar warning">
                                    <div class="progress-fill" id="pivaProgress" style="width: 0%"></div>
                                </div>
                                <span class="progress-text">
                                    <span id="pivaThreshold">€5,000</span> soglia annuale
                                </span>
                            </div>
                        </div>
                        
                        <!-- Performance Card -->
                        <div class="kpi-card performance-card">
                            <div class="kpi-header">
                                <div class="kpi-icon">
                                    <i class="fas fa-video"></i>
                                </div>
                                <div class="kpi-meta">
                                    <span class="kpi-title">Performance Video</span>
                                    <span class="kpi-period">Totali</span>
                                </div>
                            </div>
                            <div class="kpi-value">
                                <span class="amount" id="totalViews">0</span>
                                <span class="unit">visualizzazioni</span>
                            </div>
                            <div class="performance-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Video:</span>
                                    <span class="stat-value" id="totalVideos">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">CTR medio:</span>
                                    <span class="stat-value" id="avgCTR">0%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">€/video:</span>
                                    <span class="stat-value" id="revenuePerVideo">€0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Charts Section -->
                <div class="charts-section">
                    <div class="charts-grid">
                        <!-- Revenue Trend Chart -->
                        <div class="chart-card">
                            <div class="chart-header">
                                <h3 class="chart-title">Trend Revenue (6 Mesi)</h3>
                                <div class="chart-actions">
                                    <select id="chartPeriod" class="chart-select">
                                        <option value="6months">Ultimi 6 mesi</option>
                                        <option value="3months">Ultimi 3 mesi</option>
                                        <option value="12months">Ultimo anno</option>
                                    </select>
                                </div>
                            </div>
                            <div class="chart-container">
                                <canvas id="revenueChart" width="400" height="200"></canvas>
                            </div>
                        </div>
                        
                        <!-- Platform Distribution Chart -->
                        <div class="chart-card">
                            <div class="chart-header">
                                <h3 class="chart-title">Distribuzione per Piattaforma</h3>
                                <div class="chart-legend" id="platformLegend">
                                    <!-- Legend items will be added dynamically -->
                                </div>
                            </div>
                            <div class="chart-container">
                                <canvas id="platformChart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activity Section -->
                <div class="activity-section">
                    <div class="section-header">
                        <h2 class="section-title">Attività Recenti</h2>
                        <a href="#revenue" class="section-link">Vedi tutto →</a>
                    </div>
                    
                    <div class="activity-grid">
                        <!-- Recent Revenue -->
                        <div class="activity-card">
                            <div class="activity-header">
                                <h4 class="activity-title">Ultime Entrate</h4>
                            </div>
                            <div class="activity-list" id="recentRevenue">
                                <div class="activity-empty">Nessuna entrata recente</div>
                            </div>
                        </div>
                        
                        <!-- Recent Videos -->
                        <div class="activity-card">
                            <div class="activity-header">
                                <h4 class="activity-title">Ultimi Video</h4>
                            </div>
                            <div class="activity-list" id="recentVideos">
                                <div class="activity-empty">Nessun video recente</div>
                            </div>
                        </div>
                        
                        <!-- Alerts -->
                        <div class="activity-card alerts-card">
                            <div class="activity-header">
                                <h4 class="activity-title">Alert & Notifiche</h4>
                            </div>
                            <div class="alerts-list" id="alertsList">
                                <div class="alert-item info">
                                    <i class="fas fa-info-circle"></i>
                                    <span>Sistema operativo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = dashboardHTML;
    }

    /**
     * Load and display dashboard data
     */
    async loadDashboardData() {
        try {
            // Update quick stats first
            await window.musicDB.updateQuickStats();

            // Get fresh stats
            const stats = window.musicDB.getQuickStats();
            const settings = window.musicDB.getSettings();

            if (stats) {
                this.updateKPICards(stats, settings);
                await this.updateCharts(stats);
                await this.updateRecentActivity();
                this.updateAlerts(stats, settings);
            }

            // Update last updated time
            this.updateLastUpdatedTime();

        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            this.showError('Errore caricamento dati');
        }
    }

    /**
     * Update KPI cards with fresh data
     */
    updateKPICards(stats, settings) {
        // Monthly Revenue
        const monthlyRevenue = document.getElementById('monthlyRevenue');
        const monthlyGrowth = document.getElementById('monthlyGrowth');
        const monthlyProgress = document.getElementById('monthlyProgress');
        const monthlyTarget = document.getElementById('monthlyTarget');

        if (monthlyRevenue) {
            monthlyRevenue.textContent = `€${stats.monthly.revenue.toFixed(2)}`;
        }
        if (monthlyTarget) {
            monthlyTarget.textContent = `€${stats.monthly.target}`;
        }
        if (monthlyProgress) {
            const progress = Math.min(stats.monthly.progress, 100);
            monthlyProgress.style.width = `${progress}%`;

            // Add color based on progress
            if (progress >= 100) {
                monthlyProgress.className = 'progress-fill success';
            } else if (progress >= 75) {
                monthlyProgress.className = 'progress-fill warning';
            } else {
                monthlyProgress.className = 'progress-fill';
            }
        }

        // Annual Revenue
        const annualRevenue = document.getElementById('annualRevenue');
        const annualProgress = document.getElementById('annualProgress');
        const annualTarget = document.getElementById('annualTarget');

        if (annualRevenue) {
            annualRevenue.textContent = `€${stats.yearly.revenue.toFixed(2)}`;
        }
        if (annualTarget) {
            annualTarget.textContent = `€${stats.yearly.target.toLocaleString()}`;
        }
        if (annualProgress) {
            const progress = Math.min(stats.yearly.progress, 100);
            annualProgress.style.width = `${progress}%`;
        }

        // P.IVA Threshold
        const pivaRevenue = document.getElementById('pivaRevenue');
        const pivaProgress = document.getElementById('pivaProgress');
        const pivaRemaining = document.getElementById('pivaRemaining');
        const pivaThreshold = document.getElementById('pivaThreshold');

        if (pivaRevenue) {
            pivaRevenue.textContent = `€${stats.yearly.revenue.toFixed(2)}`;
        }
        if (pivaThreshold) {
            const threshold = settings?.pivaThreshold || 5000;
            pivaThreshold.textContent = `€${threshold.toLocaleString()}`;
        }
        if (pivaRemaining) {
            const threshold = settings?.pivaThreshold || 5000;
            const remaining = Math.max(0, threshold - stats.yearly.revenue);
            pivaRemaining.textContent = `€${remaining.toFixed(0)} rimanenti`;
        }
        if (pivaProgress) {
            const progress = Math.min(stats.yearly.pivaProgress, 100);
            pivaProgress.style.width = `${progress}%`;

            // Color coding for P.IVA threshold
            if (progress >= 90) {
                pivaProgress.className = 'progress-fill error';
            } else if (progress >= 80) {
                pivaProgress.className = 'progress-fill warning';
            } else {
                pivaProgress.className = 'progress-fill';
            }
        }

        // Performance Stats
        const totalViews = document.getElementById('totalViews');
        const totalVideos = document.getElementById('totalVideos');
        const avgCTR = document.getElementById('avgCTR');
        const revenuePerVideo = document.getElementById('revenuePerVideo');

        if (totalViews) {
            totalViews.textContent = stats.performance.totalViews.toLocaleString();
        }
        if (totalVideos) {
            totalVideos.textContent = stats.performance.totalVideos;
        }
        if (avgCTR) {
            avgCTR.textContent = `${stats.performance.avgCTR}%`;
        }
        if (revenuePerVideo) {
            revenuePerVideo.textContent = `€${stats.performance.avgRevenuePerVideo.toFixed(2)}`;
        }
    }

    /**
     * Update charts with data
     */
    async updateCharts(stats) {
        await this.updateRevenueChart();
        await this.updatePlatformChart();
    }

    /**
     * Update revenue trend chart
     */
    async updateRevenueChart() {
        try {
            const canvas = document.getElementById('revenueChart');
            if (!canvas) return;

            // Get revenue data for last 6 months
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(endDate.getMonth() - 6);

            const revenueData = await window.musicDB.getRevenueByDateRange(
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            );

            // Group by month
            const monthlyData = this.groupRevenueByMonth(revenueData);

            // Prepare chart data
            const labels = monthlyData.map(item => item.month);
            const data = monthlyData.map(item => item.total);

            // Destroy existing chart if it exists
            if (this.charts.revenueChart) {
                this.charts.revenueChart.destroy();
            }

            // Create new chart
            const ctx = canvas.getContext('2d');
            this.charts.revenueChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue Mensile',
                        data: data,
                        borderColor: '#007aff',
                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#007aff',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return '€' + value.toFixed(0);
                                },
                                color: '#b3b3b3'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#b3b3b3'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    },
                    elements: {
                        point: {
                            hoverRadius: 8
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error updating revenue chart:', error);
        }
    }

    /**
     * Update platform distribution chart
     */
    async updatePlatformChart() {
        try {
            const canvas = document.getElementById('platformChart');
            if (!canvas) return;

            // Get all revenue data
            const revenueData = await window.musicDB.getAllRevenue();

            // Group by platform
            const platformData = this.groupRevenueByPlatform(revenueData);

            // Prepare chart data
            const labels = platformData.map(item => item.platform);
            const data = platformData.map(item => item.total);
            const colors = [
                '#007aff', // Blue
                '#ff3b30', // Red  
                '#32d74b', // Green
                '#ff9500', // Orange
                '#af52de', // Purple
                '#64d2ff', // Light Blue
                '#ff2d92'  // Pink
            ];

            // Destroy existing chart if it exists
            if (this.charts.platformChart) {
                this.charts.platformChart.destroy();
            }

            // Create new chart
            const ctx = canvas.getContext('2d');
            this.charts.platformChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors.slice(0, labels.length),
                        borderWidth: 2,
                        borderColor: '#2d2d2d'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    cutout: '60%'
                }
            });

            // Update legend
            this.updatePlatformLegend(platformData, colors);

        } catch (error) {
            console.error('❌ Error updating platform chart:', error);
        }
    }

    /**
     * Update platform chart legend
     */
    updatePlatformLegend(platformData, colors) {
        const legendContainer = document.getElementById('platformLegend');
        if (!legendContainer) return;

        const total = platformData.reduce((sum, item) => sum + item.total, 0);

        const legendHTML = platformData.map((item, index) => {
            const percentage = total > 0 ? (item.total / total * 100).toFixed(1) : 0;
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${colors[index]}"></div>
                    <div class="legend-info">
                        <span class="legend-label">${item.platform}</span>
                        <span class="legend-value">€${item.total.toFixed(2)} (${percentage}%)</span>
                    </div>
                </div>
            `;
        }).join('');

        legendContainer.innerHTML = legendHTML;
    }

    /**
     * Update recent activity section
     */
    async updateRecentActivity() {
        await this.updateRecentRevenue();
        await this.updateRecentVideos();
    }

    /**
     * Update recent revenue list
     */
    async updateRecentRevenue() {
        try {
            const recentRevenueContainer = document.getElementById('recentRevenue');
            if (!recentRevenueContainer) return;

            const allRevenue = await window.musicDB.getAllRevenue();
            const recentRevenue = allRevenue
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            if (recentRevenue.length === 0) {
                recentRevenueContainer.innerHTML = '<div class="activity-empty">Nessuna entrata recente</div>';
                return;
            }

            const revenueHTML = recentRevenue.map(revenue => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-euro-sign"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-main">
                            <span class="activity-title">${revenue.platform}</span>
                            <span class="activity-amount">€${revenue.amount.toFixed(2)}</span>
                        </div>
                        <div class="activity-meta">
                            <span class="activity-date">${this.formatDate(revenue.date)}</span>
                            ${revenue.description ? `<span class="activity-desc">${revenue.description}</span>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

            recentRevenueContainer.innerHTML = revenueHTML;

        } catch (error) {
            console.error('❌ Error updating recent revenue:', error);
        }
    }

    /**
     * Update recent videos list
     */
    async updateRecentVideos() {
        try {
            const recentVideosContainer = document.getElementById('recentVideos');
            if (!recentVideosContainer) return;

            const allVideos = await window.musicDB.getAllVideos();
            const recentVideos = allVideos
                .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
                .slice(0, 5);

            if (recentVideos.length === 0) {
                recentVideosContainer.innerHTML = '<div class="activity-empty">Nessun video recente</div>';
                return;
            }

            const videosHTML = recentVideos.map(video => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-video"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-main">
                            <span class="activity-title">${video.title}</span>
                            <span class="activity-views">${video.views || 0} views</span>
                        </div>
                        <div class="activity-meta">
                            <span class="activity-date">${this.formatDate(video.publishDate)}</span>
                            <span class="activity-niche">${video.niche}</span>
                        </div>
                    </div>
                </div>
            `).join('');

            recentVideosContainer.innerHTML = videosHTML;

        } catch (error) {
            console.error('❌ Error updating recent videos:', error);
        }
    }

    /**
     * Update alerts and notifications
     */
    updateAlerts(stats, settings) {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        const alerts = [];

        // P.IVA threshold alerts
        if (stats.yearly.pivaProgress >= 90) {
            alerts.push({
                type: 'error',
                icon: 'fas fa-exclamation-circle',
                message: 'URGENTE: Soglia P.IVA quasi raggiunta (>90%)'
            });
        } else if (stats.yearly.pivaProgress >= 80) {
            alerts.push({
                type: 'warning',
                icon: 'fas fa-exclamation-triangle',
                message: 'Attenzione: Soglia P.IVA all\'80%'
            });
        }

        // Monthly target alerts
        if (stats.monthly.progress >= 100) {
            alerts.push({
                type: 'success',
                icon: 'fas fa-check-circle',
                message: 'Obiettivo mensile raggiunto! 🎉'
            });
        } else if (stats.monthly.progress < 50) {
            const today = new Date();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const dayOfMonth = today.getDate();
            const monthProgress = (dayOfMonth / daysInMonth) * 100;

            if (stats.monthly.progress < monthProgress - 20) {
                alerts.push({
                    type: 'warning',
                    icon: 'fas fa-chart-line',
                    message: 'Revenue mensile sotto obiettivo'
                });
            }
        }

        // Performance alerts
        if (stats.performance.avgCTR < 2 && stats.performance.totalVideos > 5) {
            alerts.push({
                type: 'info',
                icon: 'fas fa-info-circle',
                message: 'CTR medio basso: ottimizza thumbnail'
            });
        }

        // Success messages
        if (alerts.length === 0) {
            alerts.push({
                type: 'success',
                icon: 'fas fa-check-circle',
                message: 'Tutto ok! Sistema operativo'
            });
        }

        const alertsHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <i class="${alert.icon}"></i>
                <span>${alert.message}</span>
            </div>
        `).join('');

        alertsList.innerHTML = alertsHTML;
    }

    /**
     * Update last updated timestamp
     */
    updateLastUpdatedTime() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.textContent = `Ultimo aggiornamento: ${now.toLocaleTimeString('it-IT')}`;
        }
    }

    /**
     * Setup auto-refresh functionality
     */
    setupAutoRefresh() {
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, 5 * 60 * 1000);
    }

    /**
     * Refresh dashboard data
     */
    async refresh() {
        try {
            console.log('🔄 Refreshing dashboard...');
            await this.loadDashboardData();
        } catch (error) {
            console.error('❌ Dashboard refresh failed:', error);
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clear refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });

        this.charts = {};
        this.initialized = false;
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * Group revenue data by month
     */
    groupRevenueByMonth(revenueData) {
        const monthlyGroups = {};

        revenueData.forEach(revenue => {
            const date = new Date(revenue.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyGroups[monthKey]) {
                monthlyGroups[monthKey] = {
                    month: date.toLocaleDateString('it-IT', { year: 'numeric', month: 'short' }),
                    total: 0
                };
            }

            monthlyGroups[monthKey].total += revenue.amount;
        });

        // Convert to array and sort by date
        return Object.keys(monthlyGroups)
            .sort()
            .slice(-6) // Last 6 months
            .map(key => monthlyGroups[key]);
    }

    /**
     * Group revenue data by platform
     */
    groupRevenueByPlatform(revenueData) {
        const platformGroups = {};

        revenueData.forEach(revenue => {
            if (!platformGroups[revenue.platform]) {
                platformGroups[revenue.platform] = {
                    platform: revenue.platform,
                    total: 0
                };
            }

            platformGroups[revenue.platform].total += revenue.amount;
        });

        // Convert to array and sort by total (descending)
        return Object.values(platformGroups)
            .sort((a, b) => b.total - a.total);
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short'
        });
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="error-message">
                        <h3>Errore Dashboard</h3>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="window.musicApp.refreshDashboard()">
                            <i class="fas fa-sync-alt"></i>
                            Riprova
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Export for global usage
window.DashboardModule = DashboardModule;