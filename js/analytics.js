/**
 * 📊 MUSIC BUSINESS TRACKER - ANALYTICS.JS
 * Analytics avanzate e business intelligence
 */

class AnalyticsManager {
    constructor() {
        this.container = null;
        this.videoData = [];
        this.revenueData = [];
        this.analytics = {};
        this.timeframe = 'last_6_months';
        this.comparisonMode = 'category';
        this.insights = [];
        this.init();
    }

    /**
     * Inizializza analytics manager
     */
    init() {
        this.container = document.getElementById('analytics-content');
        if (!this.container) {
            console.error('Container analytics non trovato');
            return;
        }

        this.loadData();
        this.calculateAnalytics();
        this.generateInsights();
        this.render();
        this.bindEvents();
    }

    /**
     * Carica tutti i dati
     */
    loadData() {
        this.videoData = StorageUtils.load('mbt_videos_data', []);
        this.revenueData = DB.getAllRevenue();

        // Collega revenue ai video
        this.linkRevenueToVideos();
    }

    /**
     * Collega revenue ai video
     */
    linkRevenueToVideos() {
        this.videoData.forEach(video => {
            const relatedRevenue = this.revenueData.filter(r =>
                r.videoTitle &&
                (r.videoTitle.toLowerCase().includes(video.title.toLowerCase()) ||
                    video.title.toLowerCase().includes(r.videoTitle.toLowerCase()))
            );

            video.revenueEntries = relatedRevenue;
            video.totalRevenue = relatedRevenue.reduce((sum, r) => sum + r.amount, 0);
            video.platformRevenue = this.calculatePlatformRevenue(relatedRevenue);
        });
    }

    /**
     * Calcola revenue per piattaforma
     */
    calculatePlatformRevenue(revenueEntries) {
        const platformRevenue = {};
        revenueEntries.forEach(entry => {
            if (!platformRevenue[entry.platform]) {
                platformRevenue[entry.platform] = 0;
            }
            platformRevenue[entry.platform] += entry.amount;
        });
        return platformRevenue;
    }

    /**
     * Calcola analytics principali
     */
    calculateAnalytics() {
        this.analytics = {
            overview: this.calculateOverview(),
            categoryAnalysis: this.calculateCategoryAnalysis(),
            platformAnalysis: this.calculatePlatformAnalysis(),
            performanceAnalysis: this.calculatePerformanceAnalysis(),
            trendsAnalysis: this.calculateTrendsAnalysis(),
            roiAnalysis: this.calculateROIAnalysis(),
            benchmarks: this.calculateBenchmarks()
        };
    }

    /**
     * Calcola overview generale
     */
    calculateOverview() {
        const totalVideos = this.videoData.length;
        const totalRevenue = this.revenueData.reduce((sum, r) => sum + r.amount, 0);
        const totalViews = this.videoData.reduce((sum, v) => sum + (v.views || 0), 0);
        const averageCTR = this.videoData.reduce((sum, v) => sum + (v.ctr || 0), 0) / totalVideos;
        const averageRetention = this.videoData.reduce((sum, v) => sum + (v.retention || 0), 0) / totalVideos;

        return {
            totalVideos,
            totalRevenue,
            totalViews,
            averageRevenuePerVideo: totalVideos > 0 ? totalRevenue / totalVideos : 0,
            averageViewsPerVideo: totalVideos > 0 ? totalViews / totalVideos : 0,
            averageCTR: averageCTR || 0,
            averageRetention: averageRetention || 0,
            revenuePerThousandViews: totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0
        };
    }

    /**
     * Analisi per categoria
     */
    calculateCategoryAnalysis() {
        const categories = {};

        this.videoData.forEach(video => {
            const category = video.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = {
                    count: 0,
                    totalRevenue: 0,
                    totalViews: 0,
                    totalCTR: 0,
                    totalRetention: 0,
                    videos: []
                };
            }

            categories[category].count++;
            categories[category].totalRevenue += video.totalRevenue || 0;
            categories[category].totalViews += video.views || 0;
            categories[category].totalCTR += video.ctr || 0;
            categories[category].totalRetention += video.retention || 0;
            categories[category].videos.push(video);
        });

        // Calcola medie per categoria
        Object.keys(categories).forEach(category => {
            const cat = categories[category];
            cat.averageRevenue = cat.totalRevenue / cat.count;
            cat.averageViews = cat.totalViews / cat.count;
            cat.averageCTR = cat.totalCTR / cat.count;
            cat.averageRetention = cat.totalRetention / cat.count;
            cat.revenuePerVideo = cat.totalRevenue / cat.count;
            cat.performanceScore = this.calculateCategoryPerformanceScore(cat);
        });

        return categories;
    }

    /**
     * Calcola score performance categoria
     */
    calculateCategoryPerformanceScore(categoryData) {
        let score = 0;

        // Revenue per video (40%)
        if (categoryData.averageRevenue >= 10) score += 40;
        else if (categoryData.averageRevenue >= 5) score += 25;
        else if (categoryData.averageRevenue >= 2) score += 15;

        // CTR (30%)
        if (categoryData.averageCTR >= 4) score += 30;
        else if (categoryData.averageCTR >= 3) score += 20;
        else if (categoryData.averageCTR >= 2) score += 10;

        // Retention (30%)
        if (categoryData.averageRetention >= 60) score += 30;
        else if (categoryData.averageRetention >= 45) score += 20;
        else if (categoryData.averageRetention >= 30) score += 10;

        return Math.min(100, score);
    }

    /**
     * Analisi per piattaforma
     */
    calculatePlatformAnalysis() {
        const platforms = {};

        this.revenueData.forEach(revenue => {
            const platform = revenue.platform;
            if (!platforms[platform]) {
                platforms[platform] = {
                    totalRevenue: 0,
                    entryCount: 0,
                    averageRevenue: 0,
                    percentage: 0,
                    growth: 0
                };
            }

            platforms[platform].totalRevenue += revenue.amount;
            platforms[platform].entryCount++;
        });

        const totalRevenue = Object.values(platforms).reduce((sum, p) => sum + p.totalRevenue, 0);

        // Calcola percentuali e medie
        Object.keys(platforms).forEach(platform => {
            const p = platforms[platform];
            p.averageRevenue = p.totalRevenue / p.entryCount;
            p.percentage = totalRevenue > 0 ? (p.totalRevenue / totalRevenue) * 100 : 0;
        });

        return platforms;
    }

    /**
     * Analisi performance
     */
    calculatePerformanceAnalysis() {
        const highPerformers = this.videoData.filter(v => this.calculateVideoPerformanceScore(v) >= 70);
        const mediumPerformers = this.videoData.filter(v => {
            const score = this.calculateVideoPerformanceScore(v);
            return score >= 40 && score < 70;
        });
        const lowPerformers = this.videoData.filter(v => this.calculateVideoPerformanceScore(v) < 40);

        return {
            highPerformers: {
                count: highPerformers.length,
                videos: highPerformers.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0)).slice(0, 5),
                totalRevenue: highPerformers.reduce((sum, v) => sum + (v.totalRevenue || 0), 0),
                averageRevenue: highPerformers.length > 0 ?
                    highPerformers.reduce((sum, v) => sum + (v.totalRevenue || 0), 0) / highPerformers.length : 0
            },
            mediumPerformers: {
                count: mediumPerformers.length,
                totalRevenue: mediumPerformers.reduce((sum, v) => sum + (v.totalRevenue || 0), 0)
            },
            lowPerformers: {
                count: lowPerformers.length,
                videos: lowPerformers.sort((a, b) => (a.totalRevenue || 0) - (b.totalRevenue || 0)).slice(0, 5),
                totalRevenue: lowPerformers.reduce((sum, v) => sum + (v.totalRevenue || 0), 0),
                needsOptimization: lowPerformers.length
            }
        };
    }

    /**
     * Calcola score performance video
     */
    calculateVideoPerformanceScore(video) {
        let score = 0;

        // Revenue (40%)
        const revenue = video.totalRevenue || 0;
        if (revenue >= 15) score += 40;
        else if (revenue >= 8) score += 25;
        else if (revenue >= 3) score += 15;

        // CTR (30%)
        const ctr = video.ctr || 0;
        if (ctr >= 4) score += 30;
        else if (ctr >= 3) score += 20;
        else if (ctr >= 2) score += 10;

        // Retention (30%)
        const retention = video.retention || 0;
        if (retention >= 60) score += 30;
        else if (retention >= 45) score += 20;
        else if (retention >= 30) score += 10;

        return Math.min(100, score);
    }

    /**
     * Analisi trend temporali
     */
    calculateTrendsAnalysis() {
        // Raggruppa dati per mese
        const monthlyData = {};

        this.revenueData.forEach(revenue => {
            const month = revenue.date.substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    revenue: 0,
                    entries: 0,
                    videos: new Set()
                };
            }
            monthlyData[month].revenue += revenue.amount;
            monthlyData[month].entries++;
            if (revenue.videoTitle) {
                monthlyData[month].videos.add(revenue.videoTitle);
            }
        });

        // Converti in array ordinato
        const trends = Object.keys(monthlyData)
            .sort()
            .slice(-12) // Ultimi 12 mesi
            .map(month => ({
                month,
                revenue: monthlyData[month].revenue,
                entries: monthlyData[month].entries,
                videoCount: monthlyData[month].videos.size,
                revenuePerVideo: monthlyData[month].videos.size > 0 ?
                    monthlyData[month].revenue / monthlyData[month].videos.size : 0
            }));

        // Calcola crescita
        trends.forEach((trend, index) => {
            if (index > 0) {
                const previousRevenue = trends[index - 1].revenue;
                trend.growth = previousRevenue > 0 ?
                    ((trend.revenue - previousRevenue) / previousRevenue) * 100 : 0;
            } else {
                trend.growth = 0;
            }
        });

        return trends;
    }

    /**
     * Analisi ROI
     */
    calculateROIAnalysis() {
        const videosWithCosts = this.videoData.filter(v => v.productionCost > 0);

        const roiData = videosWithCosts.map(video => ({
            video,
            roi: video.productionCost > 0 ? ((video.totalRevenue || 0) / video.productionCost) * 100 : 0,
            profit: (video.totalRevenue || 0) - video.productionCost
        })).sort((a, b) => b.roi - a.roi);

        const totalInvestment = videosWithCosts.reduce((sum, v) => sum + v.productionCost, 0);
        const totalReturns = videosWithCosts.reduce((sum, v) => sum + (v.totalRevenue || 0), 0);
        const overallROI = totalInvestment > 0 ? ((totalReturns - totalInvestment) / totalInvestment) * 100 : 0;

        return {
            videosAnalyzed: videosWithCosts.length,
            totalInvestment,
            totalReturns,
            overallROI,
            bestROI: roiData.slice(0, 5),
            worstROI: roiData.slice(-5).reverse(),
            averageROI: roiData.length > 0 ? roiData.reduce((sum, r) => sum + r.roi, 0) / roiData.length : 0
        };
    }

    /**
     * Calcola benchmark
     */
    calculateBenchmarks() {
        const settings = DB.getSettings();
        const currentMonth = DB.getCurrentMonthRevenue();
        const currentYear = DB.getCurrentYearRevenue();

        const monthlyRevenue = currentMonth.reduce((sum, r) => sum + r.amount, 0);
        const yearlyRevenue = currentYear.reduce((sum, r) => sum + r.amount, 0);

        return {
            monthlyTarget: settings.monthlyTarget,
            monthlyActual: monthlyRevenue,
            monthlyProgress: (monthlyRevenue / settings.monthlyTarget) * 100,
            pivaThreshold: settings.pivaThreshold,
            pivaActual: yearlyRevenue,
            pivaProgress: (yearlyRevenue / settings.pivaThreshold) * 100,
            projectedYearEnd: monthlyRevenue * 12, // Stima semplice
            onTrackForTarget: monthlyRevenue >= settings.monthlyTarget
        };
    }

    /**
     * Genera insights automatici
     */
    generateInsights() {
        this.insights = [];

        // Insights categorie
        const categoryAnalysis = this.analytics.categoryAnalysis;
        const bestCategory = Object.entries(categoryAnalysis)
            .sort((a, b) => b[1].averageRevenue - a[1].averageRevenue)[0];

        if (bestCategory) {
            this.insights.push({
                type: 'success',
                category: 'Content Strategy',
                title: 'Top Performing Category',
                message: `"${bestCategory[0]}" è la categoria più performante con ${NumberUtils.formatCurrency(bestCategory[1].averageRevenue)} per video in media.`,
                action: `Concentrati di più su contenuti ${bestCategory[0]}`
            });
        }

        // Insights performance
        const perfAnalysis = this.analytics.performanceAnalysis;
        if (perfAnalysis.lowPerformers.count > perfAnalysis.highPerformers.count) {
            this.insights.push({
                type: 'warning',
                category: 'Performance',
                title: 'Ottimizzazione Necessaria',
                message: `${perfAnalysis.lowPerformers.count} video hanno performance basse. Considera di ottimizzare titoli, thumbnail o contenuto.`,
                action: 'Rivedi la strategia per i video low-performing'
            });
        }

        // Insights ROI
        const roiAnalysis = this.analytics.roiAnalysis;
        if (roiAnalysis.overallROI > 200) {
            this.insights.push({
                type: 'success',
                category: 'ROI',
                title: 'Excellent ROI',
                message: `ROI complessivo del ${roiAnalysis.overallROI.toFixed(1)}%! I tuoi investimenti stanno rendendo molto bene.`,
                action: 'Continua con la strategia attuale'
            });
        }

        // Insights trend
        const trends = this.analytics.trendsAnalysis;
        const recentTrends = trends.slice(-3);
        const avgGrowth = recentTrends.reduce((sum, t) => sum + t.growth, 0) / recentTrends.length;

        if (avgGrowth > 10) {
            this.insights.push({
                type: 'success',
                category: 'Growth',
                title: 'Crescita Positiva',
                message: `Crescita media del ${avgGrowth.toFixed(1)}% negli ultimi 3 mesi. Ottimo trend!`,
                action: 'Mantieni la frequenza di pubblicazione'
            });
        } else if (avgGrowth < -5) {
            this.insights.push({
                type: 'warning',
                category: 'Growth',
                title: 'Trend in Declino',
                message: `Crescita negativa del ${Math.abs(avgGrowth).toFixed(1)}% negli ultimi 3 mesi.`,
                action: 'Rivedi la strategia di contenuto e SEO'
            });
        }

        // Insights piattaforme
        const platformAnalysis = this.analytics.platformAnalysis;
        const topPlatform = Object.entries(platformAnalysis)
            .sort((a, b) => b[1].percentage - a[1].percentage)[0];

        if (topPlatform && topPlatform[1].percentage > 60) {
            this.insights.push({
                type: 'info',
                category: 'Diversification',
                title: 'Concentrazione Piattaforma',
                message: `${topPlatform[1].percentage.toFixed(1)}% delle entrate viene da ${topPlatform[0]}. Considera diversificazione.`,
                action: 'Sviluppa strategie per altre piattaforme'
            });
        }
    }

    /**
     * Render completo analytics
     */
    render() {
        if (!this.container) return;

        try {
            this.container.innerHTML = `
                <!-- 🎯 INSIGHTS AUTOMATICI -->
                <div class="insights-section">
                    ${this.renderInsights()}
                </div>

                <!-- 📊 OVERVIEW METRICS -->
                <div class="overview-section">
                    ${this.renderOverview()}
                </div>

                <!-- 📈 COMPARAZIONE E CHARTS -->
                <div class="comparison-section">
                    ${this.renderComparison()}
                </div>

                <!-- 🏆 PERFORMANCE ANALYSIS -->
                <div class="performance-section">
                    ${this.renderPerformanceAnalysis()}
                </div>

                <!-- 💰 ROI ANALYSIS -->
                <div class="roi-section">
                    ${this.renderROIAnalysis()}
                </div>
            `;

            // Render charts dopo DOM update
            setTimeout(() => {
                this.renderCharts();
            }, 100);

        } catch (error) {
            handleError(error, 'Errore rendering analytics');
            this.renderError();
        }
    }

    /**
     * Render insights automatici
     */
    renderInsights() {
        if (this.insights.length === 0) {
            return `
                <div class="card">
                    <div class="card-body text-center">
                        <i class="fas fa-lightbulb" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p class="text-muted">Aggiungi più dati per generare insights automatici</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-lightbulb"></i>
                        AI Insights & Raccomandazioni
                    </h3>
                </div>
                <div class="card-body">
                    <div class="insights-grid">
                        ${this.insights.map(insight => `
                            <div class="insight-card insight-${insight.type}">
                                <div class="insight-header">
                                    <div class="insight-category">${insight.category}</div>
                                    <i class="fas fa-${this.getInsightIcon(insight.type)}"></i>
                                </div>
                                <h4 class="insight-title">${insight.title}</h4>
                                <p class="insight-message">${insight.message}</p>
                                <div class="insight-action">
                                    <strong>Azione:</strong> ${insight.action}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Ottieni icona per tipo insight
     */
    getInsightIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
            error: 'exclamation-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Render overview
     */
    renderOverview() {
        const overview = this.analytics.overview;
        const benchmarks = this.analytics.benchmarks;

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-chart-line"></i>
                        Overview Performance
                    </h3>
                    <div class="timeframe-selector">
                        <select class="form-select" id="timeframeSelect" onchange="Analytics.changeTimeframe(this.value)">
                            <option value="last_6_months" ${this.timeframe === 'last_6_months' ? 'selected' : ''}>Ultimi 6 mesi</option>
                            <option value="last_12_months" ${this.timeframe === 'last_12_months' ? 'selected' : ''}>Ultimi 12 mesi</option>
                            <option value="current_year" ${this.timeframe === 'current_year' ? 'selected' : ''}>Anno corrente</option>
                            <option value="all_time" ${this.timeframe === 'all_time' ? 'selected' : ''}>Tutto il periodo</option>
                        </select>
                    </div>
                </div>
                <div class="card-body">
                    <div class="overview-grid">
                        <div class="overview-metric">
                            <div class="metric-icon"><i class="fas fa-video"></i></div>
                            <div class="metric-content">
                                <div class="metric-value">${overview.totalVideos}</div>
                                <div class="metric-label">Video Totali</div>
                                <div class="metric-detail">${NumberUtils.formatCurrency(overview.averageRevenuePerVideo)} per video</div>
                            </div>
                        </div>
                        
                        <div class="overview-metric">
                            <div class="metric-icon"><i class="fas fa-euro-sign"></i></div>
                            <div class="metric-content">
                                <div class="metric-value">${NumberUtils.formatCurrency(overview.totalRevenue)}</div>
                                <div class="metric-label">Revenue Totale</div>
                                <div class="metric-detail">${NumberUtils.formatCurrency(overview.revenuePerThousandViews)}/1k views</div>
                            </div>
                        </div>
                        
                        <div class="overview-metric">
                            <div class="metric-icon"><i class="fas fa-eye"></i></div>
                            <div class="metric-content">
                                <div class="metric-value">${NumberUtils.formatNumber(overview.totalViews)}</div>
                                <div class="metric-label">Visualizzazioni</div>
                                <div class="metric-detail">${NumberUtils.formatNumber(overview.averageViewsPerVideo)} per video</div>
                            </div>
                        </div>
                        
                        <div class="overview-metric">
                            <div class="metric-icon"><i class="fas fa-mouse-pointer"></i></div>
                            <div class="metric-content">
                                <div class="metric-value">${overview.averageCTR.toFixed(1)}%</div>
                                <div class="metric-label">CTR Medio</div>
                                <div class="metric-detail ${overview.averageCTR >= 3 ? 'positive' : 'negative'}">
                                    ${overview.averageCTR >= 3 ? 'Buona performance' : 'Da migliorare'}
                                </div>
                            </div>
                        </div>
                        
                        <div class="overview-metric">
                            <div class="metric-icon"><i class="fas fa-clock"></i></div>
                            <div class="metric-content">
                                <div class="metric-value">${overview.averageRetention.toFixed(1)}%</div>
                                <div class="metric-label">Retention Media</div>
                                <div class="metric-detail ${overview.averageRetention >= 50 ? 'positive' : 'negative'}">
                                    ${overview.averageRetention >= 50 ? 'Ottima retention' : 'Migliorabile'}
                                </div>
                            </div>
                        </div>
                        
                        <div class="overview-metric">
                            <div class="metric-icon"><i class="fas fa-target"></i></div>
                            <div class="metric-content">
                                <div class="metric-value">${benchmarks.monthlyProgress.toFixed(1)}%</div>
                                <div class="metric-label">Obiettivo Mensile</div>
                                <div class="metric-detail">${NumberUtils.formatCurrency(benchmarks.monthlyActual)} / ${NumberUtils.formatCurrency(benchmarks.monthlyTarget)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render comparazione
     */
    renderComparison() {
        return `
            <div class="comparison-container">
                <div class="comparison-left">
                    ${this.renderCategoryComparison()}
                </div>
                <div class="comparison-right">
                    ${this.renderPlatformComparison()}
                    ${this.renderTrendsChart()}
                </div>
            </div>
        `;
    }

    /**
     * Render comparazione categorie
     */
    renderCategoryComparison() {
        const categories = this.analytics.categoryAnalysis;
        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1].performanceScore - a[1].performanceScore);

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-tags"></i>
                        Performance per Categoria
                    </h3>
                </div>
                <div class="card-body">
                    <div class="category-comparison">
                        ${sortedCategories.map(([category, data]) => `
                            <div class="category-item">
                                <div class="category-header">
                                    <span class="category-name">${category}</span>
                                    <span class="category-score ${this.getScoreClass(data.performanceScore)}">
                                        ${data.performanceScore.toFixed(0)}%
                                    </span>
                                </div>
                                
                                <div class="category-metrics">
                                    <div class="category-metric">
                                        <span class="metric-label">Video</span>
                                        <span class="metric-value">${data.count}</span>
                                    </div>
                                    <div class="category-metric">
                                        <span class="metric-label">Revenue Media</span>
                                        <span class="metric-value">${NumberUtils.formatCurrency(data.averageRevenue)}</span>
                                    </div>
                                    <div class="category-metric">
                                        <span class="metric-label">CTR Medio</span>
                                        <span class="metric-value">${data.averageCTR.toFixed(1)}%</span>
                                    </div>
                                    <div class="category-metric">
                                        <span class="metric-label">Retention</span>
                                        <span class="metric-value">${data.averageRetention.toFixed(1)}%</span>
                                    </div>
                                </div>
                                
                                <div class="category-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill ${this.getScoreClass(data.performanceScore)}" 
                                             style="width: ${data.performanceScore}%"></div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Ottieni classe per score
     */
    getScoreClass(score) {
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    /**
     * Render comparazione piattaforme
     */
    renderPlatformComparison() {
        const platforms = this.analytics.platformAnalysis;
        const sortedPlatforms = Object.entries(platforms)
            .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue);

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-chart-pie"></i>
                        Revenue per Piattaforma
                    </h3>
                </div>
                <div class="card-body">
                    <div class="platform-comparison">
                        ${sortedPlatforms.map(([platform, data]) => `
                            <div class="platform-item">
                                <div class="platform-info">
                                    <span class="platform-name">${platform}</span>
                                    <span class="platform-percentage">${data.percentage.toFixed(1)}%</span>
                                </div>
                                <div class="platform-bar">
                                    <div class="platform-fill" style="width: ${data.percentage}%"></div>
                                </div>
                                <div class="platform-details">
                                    <span class="platform-revenue">${NumberUtils.formatCurrency(data.totalRevenue)}</span>
                                    <span class="platform-avg">${NumberUtils.formatCurrency(data.averageRevenue)} media</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render chart trends
     */
    renderTrendsChart() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-chart-line"></i>
                        Trend Revenue
                    </h3>
                </div>
                <div class="card-body">
                    <canvas id="trendsChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
    }

    /**
     * Render performance analysis
     */
    renderPerformanceAnalysis() {
        const performance = this.analytics.performanceAnalysis;

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-trophy"></i>
                        Analisi Performance Video
                    </h3>
                </div>
                <div class="card-body">
                    <div class="performance-overview">
                        <div class="performance-stats">
                            <div class="perf-stat high">
                                <div class="perf-icon"><i class="fas fa-trophy"></i></div>
                                <div class="perf-content">
                                    <div class="perf-value">${performance.highPerformers.count}</div>
                                    <div class="perf-label">High Performers</div>
                                    <div class="perf-revenue">${NumberUtils.formatCurrency(performance.highPerformers.totalRevenue)}</div>
                                </div>
                            </div>
                            
                            <div class="perf-stat medium">
                                <div class="perf-icon"><i class="fas fa-chart-line"></i></div>
                                <div class="perf-content">
                                    <div class="perf-value">${performance.mediumPerformers.count}</div>
                                    <div class="perf-label">Medium Performers</div>
                                    <div class="perf-revenue">${NumberUtils.formatCurrency(performance.mediumPerformers.totalRevenue)}</div>
                                </div>
                            </div>
                            
                            <div class="perf-stat low">
                                <div class="perf-icon"><i class="fas fa-chart-line-down"></i></div>
                                <div class="perf-content">
                                    <div class="perf-value">${performance.lowPerformers.count}</div>
                                    <div class="perf-label">Low Performers</div>
                                    <div class="perf-revenue">${NumberUtils.formatCurrency(performance.lowPerformers.totalRevenue)}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="performance-details">
                            <div class="performers-section">
                                <h4>🏆 Top 5 High Performers</h4>
                                <div class="video-list">
                                    ${performance.highPerformers.videos.map(video => `
                                        <div class="video-performance-item">
                                            <span class="video-title">${video.title}</span>
                                            <span class="video-category">${video.category}</span>
                                            <span class="video-revenue">${NumberUtils.formatCurrency(video.totalRevenue || 0)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            ${performance.lowPerformers.videos.length > 0 ? `
                                <div class="performers-section">
                                    <h4>⚠️ Video da Ottimizzare</h4>
                                    <div class="video-list">
                                        ${performance.lowPerformers.videos.map(video => `
                                            <div class="video-performance-item low">
                                                <span class="video-title">${video.title}</span>
                                                <span class="video-category">${video.category}</span>
                                                <span class="video-revenue">${NumberUtils.formatCurrency(video.totalRevenue || 0)}</span>
                                                <button class="btn-sm btn-primary" onclick="Videos.showEditModal('${video.id}')">
                                                    <i class="fas fa-edit"></i> Ottimizza
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render ROI analysis
     */
    renderROIAnalysis() {
        const roi = this.analytics.roiAnalysis;

        if (roi.videosAnalyzed === 0) {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-chart-bar"></i>
                            Analisi ROI
                        </h3>
                    </div>
                    <div class="card-body text-center">
                        <i class="fas fa-info-circle" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p class="text-muted">Aggiungi costi di produzione ai video per analizzare il ROI</p>
                        <button class="btn-primary" onclick="Videos.showAddModal()">
                            <i class="fas fa-plus"></i> Aggiungi Video con Costi
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-chart-bar"></i>
                        Analisi ROI
                    </h3>
                </div>
                <div class="card-body">
                    <div class="roi-overview">
                        <div class="roi-summary">
                            <div class="roi-metric">
                                <div class="roi-label">Investimento Totale</div>
                                <div class="roi-value">${NumberUtils.formatCurrency(roi.totalInvestment)}</div>
                            </div>
                            <div class="roi-metric">
                                <div class="roi-label">Ritorno Totale</div>
                                <div class="roi-value">${NumberUtils.formatCurrency(roi.totalReturns)}</div>
                            </div>
                            <div class="roi-metric">
                                <div class="roi-label">ROI Complessivo</div>
                                <div class="roi-value ${roi.overallROI > 0 ? 'positive' : 'negative'}">
                                    ${roi.overallROI.toFixed(1)}%
                                </div>
                            </div>
                            <div class="roi-metric">
                                <div class="roi-label">ROI Medio</div>
                                <div class="roi-value">${roi.averageROI.toFixed(1)}%</div>
                            </div>
                        </div>
                        
                        <div class="roi-details">
                            <div class="roi-section">
                                <h4>🥇 Migliori ROI</h4>
                                <div class="roi-list">
                                    ${roi.bestROI.map(item => `
                                        <div class="roi-item">
                                            <span class="roi-video">${item.video.title}</span>
                                            <span class="roi-percentage positive">${item.roi.toFixed(1)}%</span>
                                            <span class="roi-profit">${NumberUtils.formatCurrency(item.profit)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            ${roi.worstROI.length > 0 ? `
                                <div class="roi-section">
                                    <h4>📉 ROI da Migliorare</h4>
                                    <div class="roi-list">
                                        ${roi.worstROI.map(item => `
                                            <div class="roi-item">
                                                <span class="roi-video">${item.video.title}</span>
                                                <span class="roi-percentage ${item.roi >= 0 ? 'positive' : 'negative'}">
                                                    ${item.roi.toFixed(1)}%
                                                </span>
                                                <span class="roi-profit ${item.profit >= 0 ? 'positive' : 'negative'}">
                                                    ${NumberUtils.formatCurrency(item.profit)}
                                                </span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render charts
     */
    renderCharts() {
        this.renderTrendsLineChart();
    }

    /**
     * Render trends line chart
     */
    renderTrendsLineChart() {
        const canvas = document.getElementById('trendsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const trends = this.analytics.trendsAnalysis;
        if (trends.length === 0) return;

        const labels = trends.map(t => t.month.substring(5)); // MM
        const data = trends.map(t => t.revenue);

        this.drawLineChart(ctx, canvas, labels, data, 'Revenue', '#2ea043');
    }

    /**
     * Disegna line chart
     */
    drawLineChart(ctx, canvas, labels, data, label, color) {
        const paddingLeft = 80; // Più spazio per numeri currency
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 40;
        const width = canvas.width - paddingLeft - paddingRight;
        const height = canvas.height - paddingTop - paddingBottom;

        // Setup
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // Scaling
        const maxValue = Math.max(...data, 0);
        const minValue = Math.min(...data, 0);
        const range = maxValue - minValue || 1;

        // Assi
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, height + paddingTop);
        ctx.lineTo(width + paddingLeft, height + paddingTop);
        ctx.moveTo(paddingLeft, paddingTop);
        ctx.lineTo(paddingLeft, height + paddingTop);
        ctx.stroke();

        // Etichette X
        ctx.fillStyle = '#8b949e';
        ctx.textAlign = 'center';
        labels.forEach((lbl, index) => {
            const x = paddingLeft + (width / (labels.length - 1)) * index;
            ctx.fillText(lbl, x, height + paddingTop + 25);
        });

        // Linea dati
        if (data.length > 1) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();

            data.forEach((value, index) => {
                const x = paddingLeft + (width / (data.length - 1)) * index;
                const y = paddingTop + height - ((value - minValue) / range) * height;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Punti
            ctx.fillStyle = color;
            data.forEach((value, index) => {
                const x = paddingLeft + (width / (data.length - 1)) * index;
                const y = paddingTop + height - ((value - minValue) / range) * height;

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        // Etichette Y (con formato migliorato)
        ctx.fillStyle = '#8b949e';
        ctx.textAlign = 'right';
        ctx.font = '11px Arial';
        for (let i = 0; i <= 5; i++) {
            const value = minValue + (range / 5) * i;
            const y = paddingTop + height - (i / 5) * height;
            const formattedValue = value < 10 ?
                NumberUtils.formatCurrency(value) :
                `€${value.toFixed(0)}`;
            ctx.fillText(formattedValue, paddingLeft - 10, y + 4);
        }
    }

    /**
     * Cambia timeframe
     */
    changeTimeframe(newTimeframe) {
        this.timeframe = newTimeframe;
        this.calculateAnalytics();
        this.generateInsights();
        this.render();
    }

    /**
     * Export analytics data
     */
    exportAnalytics() {
        const exportData = {
            generatedAt: new Date().toISOString(),
            timeframe: this.timeframe,
            overview: this.analytics.overview,
            categoryAnalysis: this.analytics.categoryAnalysis,
            platformAnalysis: this.analytics.platformAnalysis,
            performanceAnalysis: this.analytics.performanceAnalysis,
            roiAnalysis: this.analytics.roiAnalysis,
            insights: this.insights
        };

        const filename = `analytics-report-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.json`;
        ExportUtils.exportJSON(exportData, filename);
    }

    /**
     * Bind eventi
     */
    bindEvents() {
        // Eventi gestiti tramite inline handlers
    }

    /**
     * Render errore
     */
    renderError() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--accent-danger); margin-bottom: 1rem;"></i>
                    <h3>Errore Caricamento Analytics</h3>
                    <p class="text-muted">Si è verificato un errore durante il caricamento delle analytics.</p>
                    <button class="btn-primary" onclick="Analytics.render()">
                        <i class="fas fa-refresh"></i> Riprova
                    </button>
                </div>
            </div>
        `;
    }
}

// CSS aggiuntivo per analytics components
const analyticsCSS = `
<style>
.insights-section {
    margin-bottom: var(--spacing-xl);
}

.insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
}

.insight-card {
    padding: var(--spacing-lg);
    border-radius: 8px;
    border-left: 4px solid;
    position: relative;
}

.insight-card.insight-success {
    background-color: rgba(46, 160, 67, 0.1);
    border-left-color: var(--accent-primary);
}

.insight-card.insight-warning {
    background-color: rgba(210, 153, 34, 0.1);
    border-left-color: var(--accent-warning);
}

.insight-card.insight-info {
    background-color: rgba(47, 129, 247, 0.1);
    border-left-color: var(--accent-info);
}

.insight-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.insight-category {
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
}

.insight-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

.insight-message {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
    line-height: 1.5;
}

.insight-action {
    font-size: var(--font-size-sm);
    color: var(--text-primary);
}

.overview-section {
    margin-bottom: var(--spacing-xl);
}

.timeframe-selector {
    display: flex;
    align-items: center;
}

.timeframe-selector .form-select {
    min-width: 150px;
}

.overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
}

.overview-metric {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background-color: var(--bg-tertiary);
    border-radius: 8px;
}

.metric-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--accent-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
}

.metric-content {
    flex: 1;
}

.metric-value {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
    display: block;
    margin-bottom: var(--spacing-xs);
}

.metric-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--spacing-xs);
}

.metric-detail {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
}

.metric-detail.positive {
    color: var(--accent-primary);
}

.metric-detail.negative {
    color: var(--accent-danger);
}

.comparison-section {
    margin-bottom: var(--spacing-xl);
}

.comparison-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
}

.category-comparison {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.category-item {
    padding: var(--spacing-md);
    background-color: var(--bg-tertiary);
    border-radius: 6px;
}

.category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
}

.category-name {
    font-weight: 600;
    color: var(--text-primary);
}

.category-score {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 4px;
    font-weight: 600;
    font-size: var(--font-size-sm);
}

.category-score.high {
    background-color: rgba(46, 160, 67, 0.1);
    color: var(--accent-primary);
}

.category-score.medium {
    background-color: rgba(210, 153, 34, 0.1);
    color: var(--accent-warning);
}

.category-score.low {
    background-color: rgba(218, 54, 51, 0.1);
    color: var(--accent-danger);
}

.category-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.category-metric {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-sm);
}

.category-metric .metric-label {
    color: var(--text-secondary);
}

.category-metric .metric-value {
    color: var(--text-primary);
    font-weight: 500;
}

.category-progress .progress-bar {
    height: 6px;
    background-color: var(--bg-primary);
    border-radius: 3px;
    overflow: hidden;
}

.category-progress .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
}

.category-progress .progress-fill.high {
    background-color: var(--accent-primary);
}

.category-progress .progress-fill.medium {
    background-color: var(--accent-warning);
}

.category-progress .progress-fill.low {
    background-color: var(--accent-danger);
}

.platform-comparison {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.platform-item {
    padding: var(--spacing-md);
    background-color: var(--bg-tertiary);
    border-radius: 6px;
}

.platform-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.platform-name {
    font-weight: 600;
    color: var(--text-primary);
}

.platform-percentage {
    font-weight: 600;
    color: var(--accent-primary);
}

.platform-bar {
    height: 8px;
    background-color: var(--bg-primary);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: var(--spacing-sm);
}

.platform-fill {
    height: 100%;
    background-color: var(--accent-primary);
    transition: width 0.3s ease;
}

.platform-details {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.platform-revenue {
    font-weight: 600;
    color: var(--text-primary);
}

.performance-section,
.roi-section {
    margin-bottom: var(--spacing-xl);
}

.performance-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.perf-stat {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-radius: 8px;
    border-left: 4px solid;
}

.perf-stat.high {
    background-color: rgba(46, 160, 67, 0.1);
    border-left-color: var(--accent-primary);
}

.perf-stat.medium {
    background-color: rgba(210, 153, 34, 0.1);
    border-left-color: var(--accent-warning);
}

.perf-stat.low {
    background-color: rgba(218, 54, 51, 0.1);
    border-left-color: var(--accent-danger);
}

.perf-icon {
    font-size: var(--font-size-xl);
    width: 48px;
    text-align: center;
}

.perf-stat.high .perf-icon {
    color: var(--accent-primary);
}

.perf-stat.medium .perf-icon {
    color: var(--accent-warning);
}

.perf-stat.low .perf-icon {
    color: var(--accent-danger);
}

.perf-value {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
}

.perf-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.perf-revenue {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--accent-primary);
}

.performance-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
}

.performers-section h4 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

.video-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.video-performance-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr auto;
    gap: var(--spacing-sm);
    align-items: center;
    padding: var(--spacing-sm);
    background-color: var(--bg-tertiary);
    border-radius: 4px;
}

.video-performance-item.low {
    border-left: 3px solid var(--accent-danger);
}

.video-title {
    font-weight: 500;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.video-category {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.video-revenue {
    font-weight: 600;
    color: var(--accent-primary);
    text-align: right;
}

.roi-overview {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}

.roi-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
}

.roi-metric {
    text-align: center;
    padding: var(--spacing-lg);
    background-color: var(--bg-tertiary);
    border-radius: 6px;
}

.roi-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
}

.roi-value {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
}

.roi-value.positive {
    color: var(--accent-primary);
}

.roi-value.negative {
    color: var(--accent-danger);
}

.roi-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
}

.roi-section h4 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

.roi-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.roi-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: var(--spacing-sm);
    align-items: center;
    padding: var(--spacing-sm);
    background-color: var(--bg-tertiary);
    border-radius: 4px;
}

.roi-video {
    font-weight: 500;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.roi-percentage {
    font-weight: 600;
    text-align: center;
}

.roi-percentage.positive {
    color: var(--accent-primary);
}

.roi-percentage.negative {
    color: var(--accent-danger);
}

.roi-profit {
    font-weight: 600;
    text-align: right;
}

.roi-profit.positive {
    color: var(--accent-primary);
}

.roi-profit.negative {
    color: var(--accent-danger);
}

@media (max-width: 1024px) {
    .comparison-container {
        grid-template-columns: 1fr;
    }
    
    .performance-details,
    .roi-details {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .insights-grid {
        grid-template-columns: 1fr;
    }
    
    .overview-grid {
        grid-template-columns: 1fr;
    }
    
    .performance-stats {
        grid-template-columns: 1fr;
    }
    
    .roi-summary {
        grid-template-columns: 1fr 1fr;
    }
    
    .video-performance-item {
        grid-template-columns: 1fr;
        gap: var(--spacing-xs);
    }
    
    .roi-item {
        grid-template-columns: 1fr;
        gap: var(--spacing-xs);
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', analyticsCSS);

// Inizializza analytics manager globale
const Analytics = new AnalyticsManager();

// Export per uso globale
window.Analytics = Analytics;