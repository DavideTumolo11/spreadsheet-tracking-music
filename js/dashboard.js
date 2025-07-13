/**
 * 📊 MUSIC BUSINESS TRACKER - DASHBOARD.JS
 * Dashboard principale con stats e overview
 */

class DashboardManager {
    constructor() {
        this.container = null;
        this.refreshInterval = null;
        this.init();
    }

    /**
     * Inizializza dashboard
     */
    init() {
        this.container = document.getElementById('dashboard-content');
        if (!this.container) {
            console.error('Container dashboard non trovato');
            return;
        }

        this.render();
        this.bindEvents();

        // Auto-refresh ogni 30 secondi
        this.startAutoRefresh();
    }

    /**
     * Render completo dashboard
     */
    render() {
        if (!this.container) return;

        try {
            const stats = DB.getRevenueStats();
            const pivaStatus = DB.checkPivaStatus();
            const monthlyGoals = DB.checkMonthlyGoals();
            const trends = DB.getMonthlyTrends();

            this.container.innerHTML = `
                <!-- 📊 STATS CARDS -->
                <div class="stats-grid">
                    ${this.renderStatsCards(stats, pivaStatus, monthlyGoals)}
                </div>

                <!-- ⚠️ ALERTS SECTION -->
                <div class="alerts-section">
                    ${this.renderAlerts(pivaStatus, monthlyGoals)}
                </div>

                <!-- 📈 CHARTS & OVERVIEW -->
                <div class="dashboard-grid">
                    <div class="dashboard-left">
                        ${this.renderTrendChart(trends)}
                        ${this.renderQuickActions()}
                    </div>
                    <div class="dashboard-right">
                        ${this.renderPlatformBreakdown(stats.byPlatform)}
                        ${this.renderRecentEntries()}
                    </div>
                </div>
            `;

            // Render grafici dopo DOM update
            setTimeout(() => {
                this.renderCharts(trends, stats.byPlatform);
            }, 100);

        } catch (error) {
            handleError(error, 'Errore rendering dashboard');
            this.renderError();
        }
    }

    /**
     * Render stats cards principali
     */
    renderStatsCards(stats, pivaStatus, monthlyGoals) {
        const monthlyProgress = monthlyGoals.percentage;
        const pivaProgress = pivaStatus.percentage;
        const yearlyAverage = stats.currentYearEntries > 0 ? stats.currentYearRevenue / 12 : 0;

        return `
            <!-- Revenue Mese Corrente -->
            <div class="stat-card">
                <div class="stat-value">${NumberUtils.formatCurrency(stats.currentMonthRevenue)}</div>
                <div class="stat-label">Revenue Questo Mese</div>
                <div class="stat-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(monthlyProgress, 100)}%"></div>
                    </div>
                    <span class="progress-text">${monthlyProgress.toFixed(1)}% dell'obiettivo</span>
                </div>
                <div class="stat-change ${monthlyGoals.achieved ? 'positive' : ''}">
                    ${monthlyGoals.remaining > 0 ?
                `${NumberUtils.formatCurrency(monthlyGoals.remaining)} rimanenti` :
                '🎯 Obiettivo raggiunto!'}
                </div>
            </div>

            <!-- Revenue Anno Corrente -->
            <div class="stat-card">
                <div class="stat-value">${NumberUtils.formatCurrency(stats.currentYearRevenue)}</div>
                <div class="stat-label">Revenue Anno Corrente</div>
                <div class="stat-details">
                    <span>${stats.currentYearEntries} entrate totali</span>
                    <span>Media: ${NumberUtils.formatCurrency(yearlyAverage)}/mese</span>
                </div>
            </div>

            <!-- Stato P.IVA -->
            <div class="stat-card ${pivaStatus.needsPiva ? 'warning' : ''}">
                <div class="stat-value">${NumberUtils.formatCurrency(pivaStatus.currentRevenue)}</div>
                <div class="stat-label">Soglia P.IVA (${NumberUtils.formatCurrency(pivaStatus.threshold)})</div>
                <div class="stat-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${pivaProgress >= 80 ? 'warning' : ''}" 
                             style="width: ${Math.min(pivaProgress, 100)}%"></div>
                    </div>
                    <span class="progress-text">${pivaProgress.toFixed(1)}% della soglia</span>
                </div>
                <div class="stat-change ${pivaProgress >= 80 ? 'warning' : ''}">
                    ${pivaStatus.needsPiva ?
                '⚠️ P.IVA richiesta!' :
                `${NumberUtils.formatCurrency(pivaStatus.remaining)} rimanenti`}
                </div>
            </div>

            <!-- Media per Entrata -->
            <div class="stat-card">
                <div class="stat-value">${NumberUtils.formatCurrency(stats.averagePerEntry)}</div>
                <div class="stat-label">Media per Entrata</div>
                <div class="stat-details">
                    <span>${stats.totalEntries} entrate totali</span>
                    <span>${stats.currentMonthEntries} questo mese</span>
                </div>
            </div>
        `;
    }

    /**
     * Render alerts sezione
     */
    renderAlerts(pivaStatus, monthlyGoals) {
        const alerts = [];

        // Alert P.IVA
        if (pivaStatus.percentage >= 90) {
            alerts.push({
                type: 'error',
                icon: 'exclamation-triangle',
                title: 'Soglia P.IVA Critica',
                message: `Hai raggiunto il ${pivaStatus.percentage.toFixed(1)}% della soglia P.IVA. Contatta il commercialista immediatamente.`
            });
        } else if (pivaStatus.percentage >= 80) {
            alerts.push({
                type: 'warning',
                icon: 'exclamation-triangle',
                title: 'Attenzione P.IVA',
                message: `Hai raggiunto il ${pivaStatus.percentage.toFixed(1)}% della soglia P.IVA. Prepara la documentazione.`
            });
        }

        // Alert obiettivi mensili
        if (monthlyGoals.achieved) {
            alerts.push({
                type: 'success',
                icon: 'check-circle',
                title: 'Obiettivo Mensile Raggiunto!',
                message: `Complimenti! Hai superato l'obiettivo di ${NumberUtils.formatCurrency(monthlyGoals.target)}.`
            });
        }

        // Render alerts
        if (alerts.length === 0) return '';

        return `
            <div class="alerts-container">
                ${alerts.map(alert => `
                    <div class="alert alert-${alert.type}">
                        <i class="fas fa-${alert.icon}"></i>
                        <div class="alert-content">
                            <div class="alert-title">${alert.title}</div>
                            <div class="alert-message">${alert.message}</div>
                        </div>
                        <button class="alert-close" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render trend chart container
     */
    renderTrendChart(trends) {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-chart-line"></i>
                        Trend Revenue Ultimi 6 Mesi
                    </h3>
                </div>
                <div class="card-body">
                    <canvas id="trendChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
    }

    /**
     * Render quick actions
     */
    renderQuickActions() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-plus-circle"></i>
                        Azioni Rapide
                    </h3>
                </div>
                <div class="card-body">
                    <div class="quick-actions">
                        <button class="btn-primary" onclick="Dashboard.showAddRevenueModal()">
                            <i class="fas fa-euro-sign"></i>
                            Aggiungi Entrata
                        </button>
                        <button class="btn-secondary" onclick="Dashboard.exportData()">
                            <i class="fas fa-download"></i>
                            Esporta Dati
                        </button>
                        <button class="btn-secondary" onclick="DB.createBackup()">
                            <i class="fas fa-shield-alt"></i>
                            Backup
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render platform breakdown
     */
    renderPlatformBreakdown(platformData) {
        const platforms = Object.entries(platformData)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5); // Top 5 platforms

        const totalRevenue = platforms.reduce((sum, [, data]) => sum + data.revenue, 0);

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-chart-pie"></i>
                        Top Piattaforme
                    </h3>
                </div>
                <div class="card-body">
                    <div class="platform-list">
                        ${platforms.map(([platform, data]) => {
            const percentage = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
            return `
                                <div class="platform-item">
                                    <div class="platform-info">
                                        <span class="platform-name">${platform}</span>
                                        <span class="platform-revenue">${NumberUtils.formatCurrency(data.revenue)}</span>
                                    </div>
                                    <div class="platform-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${percentage}%"></div>
                                        </div>
                                        <span class="progress-percentage">${percentage.toFixed(1)}%</span>
                                    </div>
                                    <div class="platform-details">
                                        ${data.entries} entrate • Media: ${NumberUtils.formatCurrency(data.revenue / data.entries)}
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                    ${platforms.length === 0 ? '<p class="text-muted">Nessuna entrata registrata</p>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render recent entries
     */
    renderRecentEntries() {
        const recentEntries = DB.getAllRevenue()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-clock"></i>
                        Entrate Recenti
                    </h3>
                    <a href="#" onclick="app.showSection('revenue')" class="card-action">
                        Vedi tutte <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                <div class="card-body">
                    <div class="recent-entries">
                        ${recentEntries.map(entry => `
                            <div class="recent-entry">
                                <div class="entry-main">
                                    <span class="entry-platform">${entry.platform}</span>
                                    <span class="entry-amount">${NumberUtils.formatCurrency(entry.amount)}</span>
                                </div>
                                <div class="entry-details">
                                    <span class="entry-date">${DateUtils.formatDate(entry.date)}</span>
                                    ${entry.videoTitle ? `<span class="entry-video">${entry.videoTitle}</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${recentEntries.length === 0 ? '<p class="text-muted">Nessuna entrata registrata</p>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render grafici con Chart.js
     */
    renderCharts(trends, platformData) {
        this.renderTrendLineChart(trends);
    }

    /**
     * Render line chart trends
     */
    renderTrendLineChart(trends) {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Pulisce canvas precedente
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dati ultimi 6 mesi
        const last6Months = trends.slice(-6);
        const labels = last6Months.map(item => item.month);
        const data = last6Months.map(item => item.revenue);

        // Simple line chart implementation
        this.drawLineChart(ctx, canvas, labels, data);
    }

    /**
     * Disegna line chart semplice
     */
    drawLineChart(ctx, canvas, labels, data) {
        const paddingLeft = 80; // Più spazio per numeri currency
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 40;
        const width = canvas.width - paddingLeft - paddingRight;
        const height = canvas.height - paddingTop - paddingBottom;

        // Colori
        ctx.strokeStyle = '#2ea043';
        ctx.fillStyle = '#2ea043';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // Trova min/max per scaling
        const maxValue = Math.max(...data, 0);
        const minValue = Math.min(...data, 0);
        const range = maxValue - minValue || 1;

        // Disegna assi
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Asse X
        ctx.moveTo(paddingLeft, height + paddingTop);
        ctx.lineTo(width + paddingLeft, height + paddingTop);
        // Asse Y
        ctx.moveTo(paddingLeft, paddingTop);
        ctx.lineTo(paddingLeft, height + paddingTop);
        ctx.stroke();

        // Disegna etichette X
        ctx.fillStyle = '#8b949e';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = paddingLeft + (width / (labels.length - 1)) * index;
            ctx.fillText(label, x, height + paddingTop + 25);
        });

        // Disegna linea dati
        if (data.length > 1) {
            ctx.strokeStyle = '#2ea043';
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

            // Disegna punti
            ctx.fillStyle = '#2ea043';
            data.forEach((value, index) => {
                const x = paddingLeft + (width / (data.length - 1)) * index;
                const y = paddingTop + height - ((value - minValue) / range) * height;

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        // Etichette valori Y (con più spazio)
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
     * Mostra modal aggiungi entrata
     */
    showAddRevenueModal() {
        const modal = document.getElementById('modal-container');
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Aggiungi Nuova Entrata</h3>
                    <button class="modal-close" onclick="this.closest('.modal-container').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="addRevenueForm">
                        <div class="form-group">
                            <label class="form-label">Data *</label>
                            <input type="date" class="form-input" name="date" 
                                   value="${DateUtils.formatDateForInput(new Date())}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Piattaforma *</label>
                            <select class="form-select" name="platform" required>
                                <option value="">Seleziona piattaforma</option>
                                <option value="YouTube AdSense">YouTube AdSense</option>
                                <option value="YouTube Music">YouTube Music</option>
                                <option value="Spotify">Spotify</option>
                                <option value="Apple Music">Apple Music</option>
                                <option value="Amazon Music">Amazon Music</option>
                                <option value="Altre piattaforme">Altre piattaforme</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Importo (€) *</label>
                            <input type="number" class="form-input" name="amount" 
                                   step="0.01" min="0" placeholder="0.00" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Video/Track</label>
                            <input type="text" class="form-input" name="videoTitle" 
                                   placeholder="Titolo del video o traccia">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Note</label>
                            <textarea class="form-textarea" name="notes" 
                                      placeholder="Note aggiuntive..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" 
                            onclick="this.closest('.modal-container').classList.remove('active')">
                        Annulla
                    </button>
                    <button type="submit" class="btn-primary" 
                            onclick="Dashboard.submitAddRevenue(event)">
                        <i class="fas fa-plus"></i> Aggiungi Entrata
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    /**
     * Submit form aggiungi entrata
     */
    submitAddRevenue(event) {
        event.preventDefault();

        const form = document.getElementById('addRevenueForm');
        if (!form) return;

        const formData = new FormData(form);
        const revenueData = {
            date: formData.get('date'),
            platform: formData.get('platform'),
            amount: formData.get('amount'),
            videoTitle: formData.get('videoTitle'),
            notes: formData.get('notes')
        };

        const result = DB.addRevenue(revenueData);
        if (result) {
            // Chiudi modal
            document.getElementById('modal-container').classList.remove('active');

            // Refresh dashboard
            this.render();
        }
    }

    /**
     * Esporta dati dashboard
     */
    exportData() {
        const stats = DB.getRevenueStats();
        const trends = DB.getMonthlyTrends();
        const currentMonth = DB.getCurrentMonthRevenue();

        const exportData = {
            generatedAt: new Date().toISOString(),
            stats: stats,
            trends: trends,
            currentMonthEntries: currentMonth
        };

        const filename = `dashboard-report-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.json`;
        ExportUtils.exportJSON(exportData, filename);
    }

    /**
     * Render errore
     */
    renderError() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--accent-danger); margin-bottom: 1rem;"></i>
                    <h3>Errore Caricamento Dashboard</h3>
                    <p class="text-muted">Si è verificato un errore durante il caricamento della dashboard.</p>
                    <button class="btn-primary" onclick="Dashboard.render()">
                        <i class="fas fa-refresh"></i> Riprova
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Bind eventi
     */
    bindEvents() {
        // Quick action buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addRevenueQuick') {
                this.showAddRevenueModal();
            }
        });
    }

    /**
     * Auto-refresh dashboard
     */
    startAutoRefresh() {
        // Refresh ogni 30 secondi
        this.refreshInterval = setInterval(() => {
            this.render();
        }, 30000);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Cleanup quando si cambia sezione
     */
    cleanup() {
        this.stopAutoRefresh();
    }
}

// CSS aggiuntivo per dashboard components
const dashboardCSS = `
<style>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.stat-progress {
    margin-top: var(--spacing-sm);
}

.progress-bar {
    height: 8px;
    background-color: var(--bg-tertiary);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: var(--spacing-xs);
}

.progress-fill {
    height: 100%;
    background-color: var(--accent-primary);
    transition: width 0.3s ease;
}

.progress-fill.warning {
    background-color: var(--accent-warning);
}

.progress-text {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.stat-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.alerts-container {
    margin-bottom: var(--spacing-xl);
}

.alert {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-radius: 8px;
    margin-bottom: var(--spacing-md);
    border-left: 4px solid;
}

.alert-success {
    background-color: rgba(46, 160, 67, 0.1);
    border-left-color: var(--accent-primary);
}

.alert-warning {
    background-color: rgba(210, 153, 34, 0.1);
    border-left-color: var(--accent-warning);
}

.alert-error {
    background-color: rgba(218, 54, 51, 0.1);
    border-left-color: var(--accent-danger);
}

.alert-content {
    flex: 1;
}

.alert-title {
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
}

.alert-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--spacing-xs);
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
}

.quick-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.platform-list {
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
    font-weight: 500;
}

.platform-revenue {
    font-weight: 600;
    color: var(--accent-primary);
}

.platform-progress {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
}

.platform-progress .progress-bar {
    flex: 1;
    margin: 0;
}

.progress-percentage {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    min-width: 40px;
    text-align: right;
}

.platform-details {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
}

.recent-entries {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.recent-entry {
    padding: var(--spacing-md);
    background-color: var(--bg-tertiary);
    border-radius: 6px;
}

.entry-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);
}

.entry-platform {
    font-weight: 500;
}

.entry-amount {
    font-weight: 600;
    color: var(--accent-primary);
}

.entry-details {
    display: flex;
    gap: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.entry-video {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-action {
    color: var(--accent-primary);
    text-decoration: none;
    font-size: var(--font-size-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

@media (max-width: 768px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', dashboardCSS);

// Inizializza dashboard globale
const Dashboard = new DashboardManager();

// Export per uso globale
window.Dashboard = Dashboard;