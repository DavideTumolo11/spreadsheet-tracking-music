/**
 * MUSIC BUSINESS TRACKER - ANALYTICS MODULE
 * Clean Charts, Minimal Design, Data Visualization
 * FIXED: Chart.js loading issues
 */

/**
 * Wait for Chart.js to be loaded
 */
async function waitForChart() {
    return new Promise((resolve) => {
        if (typeof Chart !== 'undefined') {
            resolve();
            return;
        }

        // Check every 100ms if Chart is loaded
        const checkChart = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                clearInterval(checkChart);
                resolve();
            }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkChart);
            console.error('⚠️ Chart.js failed to load within 10 seconds');
            resolve(); // Resolve anyway to avoid blocking
        }, 10000);
    });
}

class AnalyticsModule {
    constructor() {
        this.container = document.getElementById('analyticsContent');
        this.charts = {
            revenue: null,
            platform: null,
            videos: null,
            growth: null
        };

        this.init();
    }

    /**
     * Initialize Analytics Module
     */
    async init() {
        try {
            console.log('🔄 Initializing Analytics Module...');

            await this.render();
            await this.loadData();

            console.log('✅ Analytics Module initialized');
        } catch (error) {
            console.error('❌ Error initializing Analytics:', error);
            this.showError('Errore caricamento Analytics');
        }
    }

    /**
     * Render Analytics Interface
     */
    async render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="analytics-layout">
                <!-- Analytics Header -->
                <div class="analytics-header">
                    <div class="analytics-title">
                        <h2>Analytics Overview</h2>
                        <p>Visualizzazione dati business minimal e pulita</p>
                    </div>
                    <div class="analytics-controls">
                        <button class="btn btn-outline btn-sm" id="refreshAnalytics">
                            <i class="fas fa-sync-alt"></i>
                            Aggiorna
                        </button>
                        <button class="btn btn-primary btn-sm" id="exportReport">
                            <i class="fas fa-download"></i>
                            Export Report
                        </button>
                    </div>
                </div>

                <!-- Key Metrics Summary -->
                <div class="metrics-summary">
                    <div class="metric-card">
                        <div class="metric-icon revenue-icon">
                            <i class="fas fa-euro-sign"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="totalRevenue">€0</div>
                            <div class="metric-label">Revenue Totale</div>
                            <div class="metric-change" id="revenueChange">-</div>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon views-icon">
                            <i class="fas fa-eye"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="totalViews">0</div>
                            <div class="metric-label">Views Totali</div>
                            <div class="metric-change" id="viewsChange">-</div>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon performance-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="avgPerformance">0%</div>
                            <div class="metric-label">Performance Media</div>
                            <div class="metric-change" id="performanceChange">-</div>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon growth-icon">
                            <i class="fas fa-trending-up"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="monthlyGrowth">0%</div>
                            <div class="metric-label">Crescita Mensile</div>
                            <div class="metric-change" id="growthChange">-</div>
                        </div>
                    </div>
                </div>

                <!-- Charts Grid -->
                <div class="charts-grid">
                    <!-- Revenue Trend Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Trend Revenue</h3>
                            <p>Andamento entrate ultimi 6 mesi</p>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="revenueChart"></canvas>
                        </div>
                    </div>

                    <!-- Platform Distribution Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Distribuzione Piattaforme</h3>
                            <p>Breakdown revenue per platform</p>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="platformChart"></canvas>
                        </div>
                    </div>

                    <!-- Video Performance Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Performance Video</h3>
                            <p>Top 10 video per views</p>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="videosChart"></canvas>
                        </div>
                    </div>

                    <!-- Growth Analysis Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Analisi Crescita</h3>
                            <p>Crescita views e revenue</p>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="growthChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Analytics Insights -->
                <div class="analytics-insights">
                    <div class="insights-header">
                        <h3>Insights Automatici</h3>
                        <p>Analisi intelligente dei tuoi dati</p>
                    </div>
                    <div class="insights-grid" id="insightsGrid">
                        <!-- Insights will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    /**
     * Setup Event Listeners
     */
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshAnalytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }

        // Export button
        const exportBtn = document.getElementById('exportReport');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }
    }

    /**
     * Load and Process Data
     */
    async loadData() {
        try {
            console.log('🔄 Loading analytics data...');

            // Get data from database
            const [revenueData, videosData] = await Promise.all([
                window.musicDB.getAllRevenue(),
                window.musicDB.getAllVideos()
            ]);

            // Process and update metrics
            const metrics = this.calculateMetrics(revenueData, videosData);
            this.updateMetrics(metrics);

            // Update charts
            await this.updateCharts(revenueData, videosData);

            // Generate insights
            this.generateInsights(metrics, revenueData, videosData);

            console.log('✅ Analytics data loaded');
        } catch (error) {
            console.error('❌ Error loading analytics data:', error);
            this.showError('Errore caricamento dati analytics');
        }
    }

    /**
     * Calculate Key Metrics
     */
    calculateMetrics(revenueData, videosData) {
        const currentDate = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(currentDate.getMonth() - 1);

        // Revenue metrics
        const totalRevenue = revenueData.reduce((sum, r) => sum + (r.amount || 0), 0);
        const currentMonthRevenue = revenueData
            .filter(r => new Date(r.date) >= lastMonth)
            .reduce((sum, r) => sum + (r.amount || 0), 0);

        // Video metrics
        const totalViews = videosData.reduce((sum, v) => sum + (v.views || 0), 0);
        const totalVideos = videosData.length;
        const avgCTR = videosData.length > 0
            ? videosData.reduce((sum, v) => sum + (v.ctr || 0), 0) / videosData.length
            : 0;
        const avgRetention = videosData.length > 0
            ? videosData.reduce((sum, v) => sum + (v.retention || 0), 0) / videosData.length
            : 0;

        // Performance metrics
        const avgPerformance = (avgCTR + avgRetention) / 2;

        // Growth calculation
        const previousMonthRevenue = revenueData
            .filter(r => {
                const date = new Date(r.date);
                const twoMonthsAgo = new Date();
                twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
                return date >= twoMonthsAgo && date < lastMonth;
            })
            .reduce((sum, r) => sum + (r.amount || 0), 0);

        const monthlyGrowth = previousMonthRevenue > 0
            ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
            : 0;

        return {
            totalRevenue,
            totalViews,
            totalVideos,
            avgPerformance,
            monthlyGrowth,
            currentMonthRevenue,
            previousMonthRevenue,
            avgCTR,
            avgRetention
        };
    }

    /**
     * Update Metrics Display
     */
    updateMetrics(metrics) {
        // Revenue
        const totalRevenueEl = document.getElementById('totalRevenue');
        if (totalRevenueEl) {
            totalRevenueEl.textContent = '€' + metrics.totalRevenue.toFixed(2);
        }

        const revenueChangeEl = document.getElementById('revenueChange');
        if (revenueChangeEl) {
            const change = metrics.monthlyGrowth;
            revenueChangeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
            revenueChangeEl.className = 'metric-change ' + (change >= 0 ? 'positive' : 'negative');
        }

        // Views
        const totalViewsEl = document.getElementById('totalViews');
        if (totalViewsEl) {
            totalViewsEl.textContent = metrics.totalViews.toLocaleString();
        }

        // Performance
        const avgPerformanceEl = document.getElementById('avgPerformance');
        if (avgPerformanceEl) {
            avgPerformanceEl.textContent = metrics.avgPerformance.toFixed(1) + '%';
        }

        // Growth
        const monthlyGrowthEl = document.getElementById('monthlyGrowth');
        if (monthlyGrowthEl) {
            monthlyGrowthEl.textContent = metrics.monthlyGrowth.toFixed(1) + '%';
        }
    }

    /**
     * Update Charts - FIXED VERSION
     */
    async updateCharts(revenueData, videosData) {
        await Promise.all([
            this.updateRevenueChart(revenueData),
            this.updatePlatformChart(revenueData),
            this.updateVideosChart(videosData),
            this.updateGrowthChart(revenueData, videosData)
        ]);
    }

    /**
     * Update Revenue Trend Chart (Line Chart) - FIXED VERSION
     */
    async updateRevenueChart(revenueData) {
        try {
            // Wait for Chart.js to be available
            await waitForChart();

            const canvas = document.getElementById('revenueChart');
            if (!canvas || typeof Chart === 'undefined') {
                console.warn('⚠️ Chart.js not available or canvas not found');
                return;
            }

            // Destroy existing chart
            if (this.charts.revenue) {
                this.charts.revenue.destroy();
            }

            // Group data by month
            const monthlyData = this.groupByMonth(revenueData);

            // Chart configuration - MINIMAL STYLE
            this.charts.revenue = new Chart(canvas.getContext('2d'), {
                type: 'line',
                data: {
                    labels: monthlyData.map(d => d.month),
                    datasets: [{
                        label: 'Revenue',
                        data: monthlyData.map(d => d.amount),
                        borderColor: '#007aff',
                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#007aff',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
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
                            backgroundColor: '#2d2d2d',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#404040',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: (context) => '€' + context.parsed.y.toFixed(2)
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: '#404040',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#b3b3b3',
                                font: {
                                    size: 11
                                }
                            }
                        },
                        y: {
                            grid: {
                                color: '#404040',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#b3b3b3',
                                font: {
                                    size: 11
                                },
                                callback: (value) => '€' + value
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });

            console.log('✅ Revenue chart updated successfully');
        } catch (error) {
            console.error('❌ Error updating revenue chart:', error);
        }
    }

    /**
     * Update Platform Distribution Chart (Doughnut Chart) - FIXED VERSION
     */
    async updatePlatformChart(revenueData) {
        try {
            // Wait for Chart.js to be available
            await waitForChart();

            const canvas = document.getElementById('platformChart');
            if (!canvas || typeof Chart === 'undefined') {
                console.warn('⚠️ Chart.js not available or canvas not found');
                return;
            }

            if (this.charts.platform) {
                this.charts.platform.destroy();
            }

            // Group by platform
            const platformData = this.groupByPlatform(revenueData);

            // Color palette - MINIMAL
            const colors = [
                '#007aff', '#32d74b', '#ff9500', '#ff3b30',
                '#af52de', '#5ac8fa', '#ffcc02', '#ff2d92'
            ];

            this.charts.platform = new Chart(canvas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: platformData.map(d => d.platform),
                    datasets: [{
                        data: platformData.map(d => d.amount),
                        backgroundColor: colors.slice(0, platformData.length),
                        borderWidth: 0,
                        hoverBorderWidth: 2,
                        hoverBorderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#b3b3b3',
                                font: {
                                    size: 11
                                },
                                padding: 16,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: '#2d2d2d',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#404040',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: (context) => {
                                    const percentage = ((context.parsed / platformData.reduce((sum, d) => sum + d.amount, 0)) * 100).toFixed(1);
                                    return context.label + ': €' + context.parsed.toFixed(2) + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });

            console.log('✅ Platform chart updated successfully');
        } catch (error) {
            console.error('❌ Error updating platform chart:', error);
        }
    }

    /**
     * Update Videos Performance Chart (Bar Chart) - FIXED VERSION
     */
    async updateVideosChart(videosData) {
        try {
            // Wait for Chart.js to be available
            await waitForChart();

            const canvas = document.getElementById('videosChart');
            if (!canvas || typeof Chart === 'undefined') {
                console.warn('⚠️ Chart.js not available or canvas not found');
                return;
            }

            if (this.charts.videos) {
                this.charts.videos.destroy();
            }

            // Get top 10 videos by views
            const topVideos = videosData
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 10);

            this.charts.videos = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: topVideos.map(v => this.truncateTitle(v.title, 15)),
                    datasets: [{
                        label: 'Views',
                        data: topVideos.map(v => v.views || 0),
                        backgroundColor: '#32d74b',
                        borderRadius: 4,
                        borderSkipped: false
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
                            backgroundColor: '#2d2d2d',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#404040',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                title: (context) => topVideos[context[0].dataIndex].title,
                                label: (context) => context.parsed.y.toLocaleString() + ' views'
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#b3b3b3',
                                font: {
                                    size: 10
                                },
                                maxRotation: 45
                            }
                        },
                        y: {
                            grid: {
                                color: '#404040',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#b3b3b3',
                                font: {
                                    size: 11
                                },
                                callback: (value) => value.toLocaleString()
                            }
                        }
                    }
                }
            });

            console.log('✅ Videos chart updated successfully');
        } catch (error) {
            console.error('❌ Error updating videos chart:', error);
        }
    }

    /**
     * Update Growth Analysis Chart (Area Chart) - FIXED VERSION
     */
    async updateGrowthChart(revenueData, videosData) {
        try {
            // Wait for Chart.js to be available
            await waitForChart();

            const canvas = document.getElementById('growthChart');
            if (!canvas || typeof Chart === 'undefined') {
                console.warn('⚠️ Chart.js not available or canvas not found');
                return;
            }

            if (this.charts.growth) {
                this.charts.growth.destroy();
            }

            // Get monthly data for both metrics
            const monthlyRevenue = this.groupByMonth(revenueData);
            const monthlyViews = this.groupVideosByMonth(videosData);

            // Align data by month
            const alignedData = this.alignMonthlyData(monthlyRevenue, monthlyViews);

            this.charts.growth = new Chart(canvas.getContext('2d'), {
                type: 'line',
                data: {
                    labels: alignedData.map(d => d.month),
                    datasets: [
                        {
                            label: 'Revenue',
                            data: alignedData.map(d => d.revenue),
                            borderColor: '#007aff',
                            backgroundColor: 'rgba(0, 122, 255, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Views',
                            data: alignedData.map(d => d.views),
                            borderColor: '#32d74b',
                            backgroundColor: 'rgba(50, 215, 75, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#b3b3b3',
                                font: {
                                    size: 11
                                },
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: '#2d2d2d',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#404040',
                            borderWidth: 1,
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: '#404040',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#b3b3b3',
                                font: {
                                    size: 11
                                }
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            grid: {
                                color: '#404040',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#b3b3b3',
                                font: {
                                    size: 11
                                },
                                callback: (value) => '€' + value
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false,
                            },
                            ticks: {
                                color: '#b3b3b3',
                                font: {
                                    size: 11
                                },
                                callback: (value) => value.toLocaleString()
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });

            console.log('✅ Growth chart updated successfully');
        } catch (error) {
            console.error('❌ Error updating growth chart:', error);
        }
    }

    /**
     * Generate Automatic Insights
     */
    generateInsights(metrics, revenueData, videosData) {
        const insights = [];

        // Revenue insights
        if (metrics.monthlyGrowth > 10) {
            insights.push({
                type: 'positive',
                icon: 'fas fa-arrow-up',
                title: 'Crescita Ottima',
                description: `Revenue cresciuto del ${metrics.monthlyGrowth.toFixed(1)}% questo mese`
            });
        } else if (metrics.monthlyGrowth < -5) {
            insights.push({
                type: 'warning',
                icon: 'fas fa-arrow-down',
                title: 'Attenzione Revenue',
                description: `Revenue diminuito del ${Math.abs(metrics.monthlyGrowth).toFixed(1)}% questo mese`
            });
        }

        // Performance insights
        if (metrics.avgPerformance > 75) {
            insights.push({
                type: 'positive',
                icon: 'fas fa-star',
                title: 'Performance Eccellente',
                description: `Media CTR+Retention del ${metrics.avgPerformance.toFixed(1)}%`
            });
        }

        // Video quantity insight
        if (metrics.totalVideos < 5) {
            insights.push({
                type: 'info',
                icon: 'fas fa-video',
                title: 'Aumenta Produzione',
                description: 'Considera di pubblicare più video per aumentare il reach'
            });
        }

        // Platform diversification
        const platformData = this.groupByPlatform(revenueData);
        if (platformData.length === 1) {
            insights.push({
                type: 'info',
                icon: 'fas fa-share-alt',
                title: 'Diversifica Piattaforme',
                description: 'Espandi su più piattaforme per ridurre i rischi'
            });
        }

        this.renderInsights(insights);
    }

    /**
     * Render Insights
     */
    renderInsights(insights) {
        const container = document.getElementById('insightsGrid');
        if (!container) return;

        if (insights.length === 0) {
            container.innerHTML = '<p class="no-insights">Nessun insight disponibile al momento</p>';
            return;
        }

        container.innerHTML = insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <div class="insight-icon">
                    <i class="${insight.icon}"></i>
                </div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.description}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Export Analytics Report
     */
    async exportReport() {
        try {
            const [revenueData, videosData] = await Promise.all([
                window.musicDB.getAllRevenue(),
                window.musicDB.getAllVideos()
            ]);

            const metrics = this.calculateMetrics(revenueData, videosData);

            const report = {
                generated: new Date().toISOString(),
                summary: {
                    totalRevenue: metrics.totalRevenue,
                    totalViews: metrics.totalViews,
                    totalVideos: metrics.totalVideos,
                    avgPerformance: metrics.avgPerformance,
                    monthlyGrowth: metrics.monthlyGrowth
                },
                revenue: revenueData,
                videos: videosData,
                platformBreakdown: this.groupByPlatform(revenueData),
                monthlyTrend: this.groupByMonth(revenueData)
            };

            const blob = new Blob([JSON.stringify(report, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);

            this.showToast('Report analytics esportato con successo!', 'success');
        } catch (error) {
            console.error('Error exporting report:', error);
            this.showToast('Errore durante l\'export del report', 'error');
        }
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * Group revenue data by month
     */
    groupByMonth(revenueData) {
        const monthlyData = {};

        revenueData.forEach(item => {
            const date = new Date(item.date);
            const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
            const monthLabel = date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: monthLabel,
                    amount: 0,
                    count: 0
                };
            }

            monthlyData[monthKey].amount += item.amount || 0;
            monthlyData[monthKey].count += 1;
        });

        return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    }

    /**
     * Group revenue data by platform
     */
    groupByPlatform(revenueData) {
        const platformData = {};

        revenueData.forEach(item => {
            const platform = item.platform || 'Other';

            if (!platformData[platform]) {
                platformData[platform] = {
                    platform: platform,
                    amount: 0,
                    count: 0
                };
            }

            platformData[platform].amount += item.amount || 0;
            platformData[platform].count += 1;
        });

        return Object.values(platformData).sort((a, b) => b.amount - a.amount);
    }

    /**
     * Group videos by month
     */
    groupVideosByMonth(videosData) {
        const monthlyData = {};

        videosData.forEach(video => {
            const date = new Date(video.publishDate);
            const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
            const monthLabel = date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: monthLabel,
                    views: 0,
                    count: 0
                };
            }

            monthlyData[monthKey].views += video.views || 0;
            monthlyData[monthKey].count += 1;
        });

        return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    }

    /**
     * Align monthly data for growth chart
     */
    alignMonthlyData(revenueData, viewsData) {
        const allMonths = new Set([
            ...revenueData.map(d => d.month),
            ...viewsData.map(d => d.month)
        ]);

        return Array.from(allMonths).sort().map(month => {
            const revenueItem = revenueData.find(d => d.month === month);
            const viewsItem = viewsData.find(d => d.month === month);

            return {
                month,
                revenue: revenueItem ? revenueItem.amount : 0,
                views: viewsItem ? viewsItem.views : 0
            };
        });
    }

    /**
     * Truncate title for display
     */
    truncateTitle(title, maxLength) {
        if (!title) return 'Untitled';
        return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
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
                    <h3>Errore Analytics</h3>
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
     * Refresh analytics data
     */
    async refresh() {
        await this.loadData();
    }

    /**
     * Destroy charts on cleanup
     */
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Initialize Analytics Module
window.AnalyticsModule = AnalyticsModule;