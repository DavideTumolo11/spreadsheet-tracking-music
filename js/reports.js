/**
 * 📄 MUSIC BUSINESS TRACKER - REPORTS.JS
 * Sistema di generazione report automatici
 */

class ReportsManager {
    constructor() {
        this.container = null;
        this.reportTypes = {
            commercialista: 'Report Commercialista',
            performance: 'Report Performance',
            executive: 'Executive Summary',
            quarterly: 'Report Trimestrale',
            annual: 'Report Annuale'
        };
        this.templates = {};
        this.scheduledReports = [];
        this.init();
    }

    /**
     * Inizializza reports manager
     */
    init() {
        this.container = document.getElementById('reports-content');
        if (!this.container) {
            console.error('Container reports non trovato');
            return;
        }

        this.loadScheduledReports();
        this.initializeTemplates();
        this.render();
        this.bindEvents();
    }

    /**
     * Carica report schedulati
     */
    loadScheduledReports() {
        this.scheduledReports = StorageUtils.load('mbt_scheduled_reports', []);
    }

    /**
     * Inizializza template report
     */
    initializeTemplates() {
        this.templates = {
            commercialista: {
                name: 'Report Commercialista',
                description: 'Report fiscale per P.IVA e dichiarazioni',
                sections: ['revenue_summary', 'platform_breakdown', 'monthly_details', 'tax_info'],
                formats: ['CSV', 'Excel'],
                frequency: ['monthly', 'quarterly', 'annual']
            },
            performance: {
                name: 'Performance Report',
                description: 'Analisi performance video e contenuti',
                sections: ['overview', 'top_performers', 'category_analysis', 'optimization_tips'],
                formats: ['PDF', 'HTML'],
                frequency: ['weekly', 'monthly']
            },
            executive: {
                name: 'Executive Summary',
                description: 'Riassunto business per decision making',
                sections: ['kpi_overview', 'growth_trends', 'roi_analysis', 'strategic_insights'],
                formats: ['PDF', 'HTML'],
                frequency: ['monthly', 'quarterly']
            },
            quarterly: {
                name: 'Report Trimestrale',
                description: 'Analisi approfondita trimestre',
                sections: ['quarter_overview', 'comparative_analysis', 'goal_tracking', 'next_quarter_plan'],
                formats: ['PDF', 'Excel'],
                frequency: ['quarterly']
            },
            annual: {
                name: 'Report Annuale',
                description: 'Bilancio completo anno fiscale',
                sections: ['year_overview', 'growth_analysis', 'platform_evolution', 'strategic_recommendations'],
                formats: ['PDF', 'Excel'],
                frequency: ['annual']
            }
        };
    }

    /**
     * Render completo sezione reports
     */
    render() {
        if (!this.container) return;

        try {
            this.container.innerHTML = `
                <!-- 🚀 QUICK REPORTS -->
                <div class="quick-reports-section">
                    ${this.renderQuickReports()}
                </div>

                <!-- 📋 REPORT GENERATOR -->
                <div class="report-generator-section">
                    ${this.renderReportGenerator()}
                </div>

                <!-- ⏰ SCHEDULED REPORTS -->
                <div class="scheduled-reports-section">
                    ${this.renderScheduledReports()}
                </div>

                <!-- 📊 REPORT TEMPLATES -->
                <div class="report-templates-section">
                    ${this.renderReportTemplates()}
                </div>
            `;

        } catch (error) {
            handleError(error, 'Errore rendering reports');
            this.renderError();
        }
    }

    /**
     * Render quick reports
     */
    renderQuickReports() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-bolt"></i>
                        Report Rapidi
                    </h3>
                </div>
                <div class="card-body">
                    <div class="quick-reports-grid">
                        <div class="quick-report-item">
                            <div class="quick-report-icon">
                                <i class="fas fa-calculator"></i>
                            </div>
                            <div class="quick-report-content">
                                <h4>Report Commercialista</h4>
                                <p>Revenue mese corrente per P.IVA</p>
                                <button class="btn-primary" onclick="Reports.generateQuickReport('commercialista_current')">
                                    <i class="fas fa-download"></i> Genera CSV
                                </button>
                            </div>
                        </div>

                        <div class="quick-report-item">
                            <div class="quick-report-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="quick-report-content">
                                <h4>Performance Mensile</h4>
                                <p>Analytics mese corrente</p>
                                <button class="btn-primary" onclick="Reports.generateQuickReport('performance_monthly')">
                                    <i class="fas fa-file-pdf"></i> Genera PDF
                                </button>
                            </div>
                        </div>

                        <div class="quick-report-item">
                            <div class="quick-report-icon">
                                <i class="fas fa-crown"></i>
                            </div>
                            <div class="quick-report-content">
                                <h4>Executive Summary</h4>
                                <p>Panoramica business corrente</p>
                                <button class="btn-primary" onclick="Reports.generateQuickReport('executive_summary')">
                                    <i class="fas fa-file-alt"></i> Genera Report
                                </button>
                            </div>
                        </div>

                        <div class="quick-report-item">
                            <div class="quick-report-icon">
                                <i class="fas fa-backup"></i>
                            </div>
                            <div class="quick-report-content">
                                <h4>Backup Completo</h4>
                                <p>Tutti i dati per sicurezza</p>
                                <button class="btn-secondary" onclick="DB.createBackup()">
                                    <i class="fas fa-shield-alt"></i> Crea Backup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render report generator
     */
    renderReportGenerator() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-cogs"></i>
                        Generatore Report Personalizzato
                    </h3>
                </div>
                <div class="card-body">
                    <form id="reportGeneratorForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Tipo Report</label>
                                <select class="form-select" name="reportType" id="reportTypeSelect" onchange="Reports.updateReportOptions()">
                                    <option value="">Seleziona tipo report</option>
                                    ${Object.entries(this.reportTypes).map(([key, name]) => `
                                        <option value="${key}">${name}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Periodo</label>
                                <select class="form-select" name="period" id="periodSelect">
                                    <option value="current_month">Mese Corrente</option>
                                    <option value="last_month">Mese Scorso</option>
                                    <option value="current_quarter">Trimestre Corrente</option>
                                    <option value="last_quarter">Trimestre Scorso</option>
                                    <option value="current_year">Anno Corrente</option>
                                    <option value="last_year">Anno Scorso</option>
                                    <option value="custom">Periodo Personalizzato</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Formato</label>
                                <select class="form-select" name="format" id="formatSelect">
                                    <option value="pdf">PDF</option>
                                    <option value="excel">Excel (XLSX)</option>
                                    <option value="csv">CSV</option>
                                    <option value="html">HTML</option>
                                    <option value="json">JSON</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row custom-period" id="customPeriodRow" style="display: none;">
                            <div class="form-group">
                                <label class="form-label">Data Inizio</label>
                                <input type="date" class="form-input" name="startDate" id="startDateInput">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Data Fine</label>
                                <input type="date" class="form-input" name="endDate" id="endDateInput">
                            </div>
                        </div>

                        <div class="report-sections" id="reportSections">
                            <!-- Sezioni dinamiche in base al tipo report -->
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="Reports.previewReport()">
                                <i class="fas fa-eye"></i> Anteprima
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-download"></i> Genera Report
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Render scheduled reports
     */
    renderScheduledReports() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-clock"></i>
                        Report Programmati
                    </h3>
                    <button class="btn-primary" onclick="Reports.showScheduleModal()">
                        <i class="fas fa-plus"></i> Nuovo Schedule
                    </button>
                </div>
                <div class="card-body">
                    ${this.scheduledReports.length === 0 ? `
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <h4>Nessun Report Programmato</h4>
                            <p>Programma report automatici per riceverli regolarmente</p>
                            <button class="btn-primary" onclick="Reports.showScheduleModal()">
                                <i class="fas fa-plus"></i> Programma Primo Report
                            </button>
                        </div>
                    ` : `
                        <div class="scheduled-reports-list">
                            ${this.scheduledReports.map(report => this.renderScheduledReportItem(report)).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * Render singolo report schedulato
     */
    renderScheduledReportItem(report) {
        const nextRun = this.calculateNextRun(report);

        return `
            <div class="scheduled-report-item" data-id="${report.id}">
                <div class="report-info">
                    <div class="report-name">${report.name}</div>
                    <div class="report-details">
                        <span class="report-type">${this.reportTypes[report.type]}</span>
                        <span class="report-frequency">${this.getFrequencyLabel(report.frequency)}</span>
                        <span class="report-format">${report.format.toUpperCase()}</span>
                    </div>
                    <div class="report-schedule">
                        <span class="next-run">Prossima esecuzione: ${DateUtils.formatDate(nextRun)}</span>
                    </div>
                </div>
                
                <div class="report-actions">
                    <button class="btn-sm btn-secondary" onclick="Reports.runScheduledReport('${report.id}')" title="Esegui Ora">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn-sm btn-secondary" onclick="Reports.editScheduledReport('${report.id}')" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-danger" onclick="Reports.deleteScheduledReport('${report.id}')" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render template reports
     */
    renderReportTemplates() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-file-alt"></i>
                        Template Report
                    </h3>
                </div>
                <div class="card-body">
                    <div class="templates-grid">
                        ${Object.entries(this.templates).map(([key, template]) => `
                            <div class="template-card">
                                <div class="template-header">
                                    <h4>${template.name}</h4>
                                    <div class="template-formats">
                                        ${template.formats.map(format => `
                                            <span class="format-badge">${format}</span>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div class="template-description">
                                    <p>${template.description}</p>
                                </div>
                                
                                <div class="template-sections">
                                    <strong>Sezioni incluse:</strong>
                                    <ul>
                                        ${template.sections.map(section => `
                                            <li>${this.getSectionLabel(section)}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                                
                                <div class="template-actions">
                                    <button class="btn-secondary" onclick="Reports.previewTemplate('${key}')">
                                        <i class="fas fa-eye"></i> Anteprima
                                    </button>
                                    <button class="btn-primary" onclick="Reports.useTemplate('${key}')">
                                        <i class="fas fa-magic"></i> Usa Template
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Ottieni label sezione
     */
    getSectionLabel(section) {
        const labels = {
            revenue_summary: 'Riassunto Revenue',
            platform_breakdown: 'Breakdown Piattaforme',
            monthly_details: 'Dettagli Mensili',
            tax_info: 'Informazioni Fiscali',
            overview: 'Panoramica',
            top_performers: 'Top Performers',
            category_analysis: 'Analisi Categorie',
            optimization_tips: 'Suggerimenti Ottimizzazione',
            kpi_overview: 'KPI Overview',
            growth_trends: 'Trend Crescita',
            roi_analysis: 'Analisi ROI',
            strategic_insights: 'Insights Strategici',
            quarter_overview: 'Overview Trimestre',
            comparative_analysis: 'Analisi Comparativa',
            goal_tracking: 'Tracking Obiettivi',
            next_quarter_plan: 'Piano Prossimo Trimestre',
            year_overview: 'Overview Anno',
            growth_analysis: 'Analisi Crescita',
            platform_evolution: 'Evoluzione Piattaforme',
            strategic_recommendations: 'Raccomandazioni Strategiche'
        };
        return labels[section] || section;
    }

    /**
     * Genera quick report
     */
    generateQuickReport(type) {
        try {
            let reportData, filename, format;

            switch (type) {
                case 'commercialista_current':
                    reportData = this.generateCommercialistaReport('current_month');
                    filename = `commercialista-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.csv`;
                    format = 'csv';
                    break;

                case 'performance_monthly':
                    reportData = this.generatePerformanceReport('current_month');
                    filename = `performance-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.html`;
                    format = 'html';
                    break;

                case 'executive_summary':
                    reportData = this.generateExecutiveReport('current_month');
                    filename = `executive-summary-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.html`;
                    format = 'html';
                    break;

                default:
                    throw new Error('Tipo report non supportato');
            }

            this.downloadReport(reportData, filename, format);
            NotificationUtils.success('Report generato con successo');

        } catch (error) {
            handleError(error, 'Errore generazione quick report');
        }
    }

    /**
     * Genera report commercialista
     */
    generateCommercialistaReport(period) {
        const revenueData = this.getRevenueDataForPeriod(period);
        const settings = DB.getSettings();

        // Raggruppa per piattaforma e mese
        const monthlyBreakdown = {};
        const platformTotals = {};

        revenueData.forEach(entry => {
            const month = entry.date.substring(0, 7); // YYYY-MM
            const platform = entry.platform;

            if (!monthlyBreakdown[month]) {
                monthlyBreakdown[month] = {};
            }
            if (!monthlyBreakdown[month][platform]) {
                monthlyBreakdown[month][platform] = 0;
            }
            if (!platformTotals[platform]) {
                platformTotals[platform] = 0;
            }

            monthlyBreakdown[month][platform] += entry.amount;
            platformTotals[platform] += entry.amount;
        });

        const totalRevenue = revenueData.reduce((sum, entry) => sum + entry.amount, 0);
        const pivaStatus = DB.checkPivaStatus();

        // Prepara dati CSV
        const csvData = [];

        // Header informazioni
        csvData.push({
            'Data': 'REPORT COMMERCIALISTA',
            'Descrizione': `Periodo: ${this.getPeriodLabel(period)}`,
            'Importo': '',
            'Piattaforma': '',
            'Note': `Generato il ${DateUtils.formatDate(new Date())}`
        });

        csvData.push({
            'Data': '',
            'Descrizione': 'RIEPILOGO FISCALE',
            'Importo': '',
            'Piattaforma': '',
            'Note': ''
        });

        csvData.push({
            'Data': '',
            'Descrizione': 'Revenue Totale Periodo',
            'Importo': totalRevenue.toFixed(2),
            'Piattaforma': '',
            'Note': 'EUR'
        });

        csvData.push({
            'Data': '',
            'Descrizione': 'Revenue Annuale Corrente',
            'Importo': pivaStatus.currentRevenue.toFixed(2),
            'Piattaforma': '',
            'Note': 'EUR'
        });

        csvData.push({
            'Data': '',
            'Descrizione': 'Soglia P.IVA',
            'Importo': settings.pivaThreshold.toFixed(2),
            'Piattaforma': '',
            'Note': `${pivaStatus.percentage.toFixed(1)}% raggiunta`
        });

        csvData.push({
            'Data': '',
            'Descrizione': '',
            'Importo': '',
            'Piattaforma': '',
            'Note': ''
        });

        // Dettaglio per piattaforma
        csvData.push({
            'Data': '',
            'Descrizione': 'BREAKDOWN PIATTAFORME',
            'Importo': '',
            'Piattaforma': '',
            'Note': ''
        });

        Object.entries(platformTotals).forEach(([platform, total]) => {
            csvData.push({
                'Data': '',
                'Descrizione': platform,
                'Importo': total.toFixed(2),
                'Piattaforma': platform,
                'Note': `${((total / totalRevenue) * 100).toFixed(1)}%`
            });
        });

        csvData.push({
            'Data': '',
            'Descrizione': '',
            'Importo': '',
            'Piattaforma': '',
            'Note': ''
        });

        // Dettaglio entrate
        csvData.push({
            'Data': '',
            'Descrizione': 'DETTAGLIO ENTRATE',
            'Importo': '',
            'Piattaforma': '',
            'Note': ''
        });

        revenueData.forEach(entry => {
            csvData.push({
                'Data': DateUtils.formatDate(entry.date),
                'Descrizione': entry.videoTitle || 'Revenue generica',
                'Importo': entry.amount.toFixed(2),
                'Piattaforma': entry.platform,
                'Note': entry.notes || ''
            });
        });

        return csvData;
    }

    /**
     * Genera report performance
     */
    generatePerformanceReport(period) {
        const videoData = StorageUtils.load('mbt_videos_data', []);
        const revenueData = this.getRevenueDataForPeriod(period);
        const analytics = Analytics ? Analytics.analytics : {};

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Performance Report - ${this.getPeriodLabel(period)}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2ea043; padding-bottom: 20px; }
                .section { margin-bottom: 30px; }
                .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                .metric-card { padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; }
                .metric-value { font-size: 24px; font-weight: bold; color: #2ea043; }
                .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                .table th { background: #f8f9fa; font-weight: 600; }
                .performance-high { color: #2ea043; font-weight: 600; }
                .performance-medium { color: #d29922; font-weight: 600; }
                .performance-low { color: #da3633; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 Performance Report</h1>
                <p>Periodo: ${this.getPeriodLabel(period)}</p>
                <p>Generato il: ${DateUtils.formatDate(new Date())}</p>
            </div>

            <div class="section">
                <h2>Overview Metriche</h2>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value">${videoData.length}</div>
                        <div class="metric-label">Video Totali</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${NumberUtils.formatCurrency(revenueData.reduce((sum, r) => sum + r.amount, 0))}</div>
                        <div class="metric-label">Revenue Periodo</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${videoData.reduce((sum, v) => sum + (v.views || 0), 0).toLocaleString()}</div>
                        <div class="metric-label">Views Totali</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${(videoData.reduce((sum, v) => sum + (v.ctr || 0), 0) / videoData.length || 0).toFixed(1)}%</div>
                        <div class="metric-label">CTR Medio</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Top Performing Videos</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Titolo</th>
                            <th>Categoria</th>
                            <th>Revenue</th>
                            <th>Views</th>
                            <th>CTR</th>
                            <th>Performance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${videoData
                .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
                .slice(0, 10)
                .map(video => `
                                <tr>
                                    <td>${video.title}</td>
                                    <td>${video.category}</td>
                                    <td>${NumberUtils.formatCurrency(video.totalRevenue || 0)}</td>
                                    <td>${(video.views || 0).toLocaleString()}</td>
                                    <td>${video.ctr || 0}%</td>
                                    <td class="performance-${video.performanceLevel || 'low'}">${(video.performanceLevel || 'low').toUpperCase()}</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2>Revenue per Piattaforma</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Piattaforma</th>
                            <th>Revenue</th>
                            <th>Entrate</th>
                            <th>Media per Entrata</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(revenueData.reduce((acc, r) => {
                    if (!acc[r.platform]) acc[r.platform] = { total: 0, count: 0 };
                    acc[r.platform].total += r.amount;
                    acc[r.platform].count++;
                    return acc;
                }, {})).map(([platform, data]) => `
                            <tr>
                                <td>${platform}</td>
                                <td>${NumberUtils.formatCurrency(data.total)}</td>
                                <td>${data.count}</td>
                                <td>${NumberUtils.formatCurrency(data.total / data.count)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
        `;

        return html;
    }

    /**
     * Genera executive report
     */
    generateExecutiveReport(period) {
        const settings = DB.getSettings();
        const pivaStatus = DB.checkPivaStatus();
        const monthlyGoals = DB.checkMonthlyGoals();
        const revenueData = this.getRevenueDataForPeriod(period);
        const videoData = StorageUtils.load('mbt_videos_data', []);

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Executive Summary - ${this.getPeriodLabel(period)}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 40px; }
                .header h1 { color: #2ea043; font-size: 28px; margin-bottom: 10px; }
                .executive-summary { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px; border-radius: 12px; margin-bottom: 40px; }
                .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin: 30px 0; }
                .kpi-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                .kpi-value { font-size: 32px; font-weight: bold; margin-bottom: 8px; }
                .kpi-value.success { color: #2ea043; }
                .kpi-value.warning { color: #d29922; }
                .kpi-value.danger { color: #da3633; }
                .kpi-label { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                .insights { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; }
                .insight-item { margin: 15px 0; padding: 15px; border-left: 4px solid #2ea043; background: #f8f9fa; }
                .section { margin: 30px 0; }
                .section h3 { color: #2ea043; border-bottom: 2px solid #2ea043; padding-bottom: 10px; }
                .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; }
                .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>👔 Executive Summary</h1>
                <p><strong>Periodo:</strong> ${this.getPeriodLabel(period)}</p>
                <p>Generato il: ${DateUtils.formatDate(new Date())}</p>
            </div>

            <div class="executive-summary">
                <h2>📈 Panoramica Business</h2>
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-value ${monthlyGoals.achieved ? 'success' : 'warning'}">${NumberUtils.formatCurrency(monthlyGoals.currentRevenue)}</div>
                        <div class="kpi-label">Revenue Mensile</div>
                        <small>${monthlyGoals.percentage.toFixed(1)}% dell'obiettivo</small>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-value ${pivaStatus.percentage >= 80 ? 'danger' : 'success'}">${pivaStatus.percentage.toFixed(1)}%</div>
                        <div class="kpi-label">Soglia P.IVA</div>
                        <small>${NumberUtils.formatCurrency(pivaStatus.currentRevenue)} / ${NumberUtils.formatCurrency(pivaStatus.threshold)}</small>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-value success">${videoData.length}</div>
                        <div class="kpi-label">Video Totali</div>
                        <small>${NumberUtils.formatCurrency(revenueData.reduce((sum, r) => sum + r.amount, 0) / videoData.length || 0)} per video</small>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>🎯 Key Performance Indicators</h3>
                <div class="insights">
                    <div class="insight-item">
                        <strong>Performance Content:</strong> 
                        ${videoData.filter(v => (v.performanceLevel || 'low') === 'high').length} video high-performance, 
                        ${videoData.filter(v => (v.performanceLevel || 'low') === 'low').length} necessitano ottimizzazione
                    </div>
                    
                    <div class="insight-item">
                        <strong>Diversificazione Revenue:</strong> 
                        ${Object.keys(revenueData.reduce((acc, r) => { acc[r.platform] = true; return acc; }, {})).length} piattaforme attive
                    </div>
                    
                    <div class="insight-item">
                        <strong>Crescita Trend:</strong> 
                        ${monthlyGoals.currentRevenue > settings.monthlyTarget ? 'Obiettivo superato ✅' : 'In corso verso obiettivo 📈'}
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>💡 Strategic Insights</h3>
                <div class="recommendations">
                    <h4>Raccomandazioni Strategiche:</h4>
                    <ul>
                        ${pivaStatus.percentage >= 80 ?
                '<li><strong>URGENTE:</strong> Preparare apertura P.IVA - soglia quasi raggiunta</li>' :
                '<li>✅ Situazione P.IVA sotto controllo</li>'}
                        
                        ${monthlyGoals.achieved ?
                '<li>🎯 Obiettivo mensile raggiunto - considera incremento target</li>' :
                '<li>📈 Focus su incremento revenue per raggiungere obiettivo mensile</li>'}
                            
                        <li>🎵 Categoria migliore: ${this.getBestCategory(videoData)} - incrementa produzione</li>
                        
                        <li>🔄 Platform mix: ${this.getPlatformRecommendation(revenueData)}</li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <h3>📊 Revenue Breakdown</h3>
                <p><strong>Totale Periodo:</strong> ${NumberUtils.formatCurrency(revenueData.reduce((sum, r) => sum + r.amount, 0))}</p>
                <p><strong>Media per Video:</strong> ${NumberUtils.formatCurrency((revenueData.reduce((sum, r) => sum + r.amount, 0)) / videoData.length || 0)}</p>
                <p><strong>Projection Anno:</strong> ${NumberUtils.formatCurrency(monthlyGoals.currentRevenue * 12)}</p>
            </div>

            <div class="footer">
                <p>Report generato automaticamente da Music Business Tracker</p>
                <p>Per informazioni dettagliate, consulta i report specifici</p>
            </div>
        </body>
        </html>
        `;

        return html;
    }

    /**
     * Ottieni migliore categoria
     */
    getBestCategory(videoData) {
        const categoryRevenue = {};
        videoData.forEach(video => {
            const category = video.category || 'Other';
            if (!categoryRevenue[category]) categoryRevenue[category] = 0;
            categoryRevenue[category] += video.totalRevenue || 0;
        });

        return Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    }

    /**
     * Ottieni raccomandazione piattaforma
     */
    getPlatformRecommendation(revenueData) {
        const platforms = Object.keys(revenueData.reduce((acc, r) => { acc[r.platform] = true; return acc; }, {}));

        if (platforms.length < 3) {
            return 'Considera diversificazione su più piattaforme';
        }

        const platformRevenue = revenueData.reduce((acc, r) => {
            if (!acc[r.platform]) acc[r.platform] = 0;
            acc[r.platform] += r.amount;
            return acc;
        }, {});

        const topPlatform = Object.entries(platformRevenue).sort((a, b) => b[1] - a[1])[0];
        const topPercentage = (topPlatform[1] / Object.values(platformRevenue).reduce((sum, v) => sum + v, 0)) * 100;

        if (topPercentage > 70) {
            return `Dipendenza alta da ${topPlatform[0]} (${topPercentage.toFixed(1)}%) - diversifica`;
        }

        return 'Buona diversificazione piattaforme';
    }

    /**
     * Ottieni dati revenue per periodo
     */
    getRevenueDataForPeriod(period) {
        const allRevenue = DB.getAllRevenue();
        const now = new Date();

        switch (period) {
            case 'current_month':
                return DB.getCurrentMonthRevenue();

            case 'last_month':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                return DB.getRevenueByDateRange(lastMonth, lastMonthEnd);

            case 'current_quarter':
                const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                return DB.getRevenueByDateRange(quarterStart, now);

            case 'current_year':
                return DB.getCurrentYearRevenue();

            default:
                return allRevenue;
        }
    }

    /**
     * Ottieni label periodo
     */
    getPeriodLabel(period) {
        const labels = {
            current_month: 'Mese Corrente',
            last_month: 'Mese Scorso',
            current_quarter: 'Trimestre Corrente',
            current_year: 'Anno Corrente',
            custom: 'Periodo Personalizzato'
        };
        return labels[period] || period;
    }

    /**
     * Ottieni label frequenza
     */
    getFrequencyLabel(frequency) {
        const labels = {
            daily: 'Giornaliero',
            weekly: 'Settimanale',
            monthly: 'Mensile',
            quarterly: 'Trimestrale',
            annual: 'Annuale'
        };
        return labels[frequency] || frequency;
    }

    /**
     * Download report
     */
    downloadReport(data, filename, format) {
        switch (format.toLowerCase()) {
            case 'csv':
                ExportUtils.exportCSV(data, filename);
                break;

            case 'html':
                const blob = new Blob([data], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                break;

            case 'json':
                ExportUtils.exportJSON(data, filename);
                break;

            default:
                NotificationUtils.error('Formato non supportato');
        }
    }

    /**
     * Calcola prossima esecuzione
     */
    calculateNextRun(report) {
        const now = new Date();
        const lastRun = report.lastRun ? new Date(report.lastRun) : now;

        switch (report.frequency) {
            case 'daily':
                return new Date(lastRun.getTime() + 24 * 60 * 60 * 1000);
            case 'weekly':
                return new Date(lastRun.getTime() + 7 * 24 * 60 * 60 * 1000);
            case 'monthly':
                const nextMonth = new Date(lastRun);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                return nextMonth;
            case 'quarterly':
                const nextQuarter = new Date(lastRun);
                nextQuarter.setMonth(nextQuarter.getMonth() + 3);
                return nextQuarter;
            case 'annual':
                const nextYear = new Date(lastRun);
                nextYear.setFullYear(nextYear.getFullYear() + 1);
                return nextYear;
            default:
                return now;
        }
    }

    /**
     * Mostra modal schedule
     */
    showScheduleModal() {
        const modal = document.getElementById('modal-container');
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <i class="fas fa-clock"></i>
                        Programma Report Automatico
                    </h3>
                    <button class="modal-close" onclick="this.closest('.modal-container').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="scheduleReportForm">
                        <div class="form-group">
                            <label class="form-label">Nome Report</label>
                            <input type="text" class="form-input" name="name" placeholder="Report Mensile Commercialista" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Tipo Report</label>
                                <select class="form-select" name="type" required>
                                    <option value="">Seleziona tipo</option>
                                    ${Object.entries(this.reportTypes).map(([key, name]) => `
                                        <option value="${key}">${name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Frequenza</label>
                                <select class="form-select" name="frequency" required>
                                    <option value="monthly">Mensile</option>
                                    <option value="weekly">Settimanale</option>
                                    <option value="quarterly">Trimestrale</option>
                                    <option value="annual">Annuale</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Formato</label>
                                <select class="form-select" name="format" required>
                                    <option value="csv">CSV</option>
                                    <option value="pdf">PDF</option>
                                    <option value="html">HTML</option>
                                    <option value="json">JSON</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Email (opzionale)</label>
                            <input type="email" class="form-input" name="email" placeholder="commercialista@email.com">
                            <small class="form-help">Se specificato, il report sarà inviato via email</small>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" 
                            onclick="this.closest('.modal-container').classList.remove('active')">
                        Annulla
                    </button>
                    <button type="submit" class="btn-primary" onclick="Reports.saveScheduledReport(event)">
                        <i class="fas fa-save"></i> Programma Report
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    /**
     * Salva report schedulato
     */
    saveScheduledReport(event) {
        event.preventDefault();

        const form = document.getElementById('scheduleReportForm');
        if (!form) return;

        const formData = new FormData(form);
        const reportData = {
            id: generateId(),
            name: formData.get('name'),
            type: formData.get('type'),
            frequency: formData.get('frequency'),
            format: formData.get('format'),
            email: formData.get('email'),
            createdAt: new Date().toISOString(),
            lastRun: null,
            enabled: true
        };

        this.scheduledReports.push(reportData);

        if (StorageUtils.save('mbt_scheduled_reports', this.scheduledReports)) {
            document.getElementById('modal-container').classList.remove('active');
            this.render();
            NotificationUtils.success('Report programmato con successo');
        }
    }

    /**
     * Elimina report schedulato
     */
    deleteScheduledReport(id) {
        if (confirm('Sei sicuro di voler eliminare questo report programmato?')) {
            this.scheduledReports = this.scheduledReports.filter(r => r.id !== id);
            StorageUtils.save('mbt_scheduled_reports', this.scheduledReports);
            this.render();
            NotificationUtils.success('Report programmato eliminato');
        }
    }

    /**
     * Esegui report schedulato
     */
    runScheduledReport(id) {
        const report = this.scheduledReports.find(r => r.id === id);
        if (!report) return;

        try {
            // Aggiorna ultimo run
            report.lastRun = new Date().toISOString();
            StorageUtils.save('mbt_scheduled_reports', this.scheduledReports);

            // Genera report
            this.generateQuickReport(`${report.type}_current`);

            NotificationUtils.success(`Report "${report.name}" eseguito`);
            this.render();
        } catch (error) {
            handleError(error, 'Errore esecuzione report schedulato');
        }
    }

    /**
     * Aggiorna opzioni report
     */
    updateReportOptions() {
        const reportType = document.getElementById('reportTypeSelect').value;
        const sectionsContainer = document.getElementById('reportSections');
        const periodSelect = document.getElementById('periodSelect');
        const formatSelect = document.getElementById('formatSelect');

        if (!reportType || !sectionsContainer) return;

        const template = this.templates[reportType];
        if (!template) return;

        // Aggiorna formati disponibili
        formatSelect.innerHTML = template.formats.map(format =>
            `<option value="${format.toLowerCase()}">${format}</option>`
        ).join('');

        // Mostra sezioni disponibili
        sectionsContainer.innerHTML = `
            <div class="form-group">
                <label class="form-label">Sezioni da Includere</label>
                <div class="checkbox-grid">
                    ${template.sections.map(section => `
                        <label class="checkbox-label">
                            <input type="checkbox" name="sections" value="${section}" checked>
                            ${this.getSectionLabel(section)}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        // Mostra/nascondi periodo personalizzato
        periodSelect.addEventListener('change', (e) => {
            const customRow = document.getElementById('customPeriodRow');
            if (customRow) {
                customRow.style.display = e.target.value === 'custom' ? 'flex' : 'none';
            }
        });
    }

    /**
     * Bind eventi
     */
    bindEvents() {
        // Form submit per report generator
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'reportGeneratorForm') {
                e.preventDefault();
                this.generateCustomReport(e.target);
            }
        });

        // Aggiorna opzioni quando cambia tipo report
        document.addEventListener('change', (e) => {
            if (e.target.id === 'reportTypeSelect') {
                this.updateReportOptions();
            }
        });
    }

    /**
     * Genera report personalizzato
     */
    generateCustomReport(form) {
        try {
            const formData = new FormData(form);
            const reportType = formData.get('reportType');
            const period = formData.get('period');
            const format = formData.get('format');

            if (!reportType || !period || !format) {
                NotificationUtils.error('Compila tutti i campi obbligatori');
                return;
            }

            // Genera report in base al tipo
            let reportData, filename;

            switch (reportType) {
                case 'commercialista':
                    reportData = this.generateCommercialistaReport(period);
                    filename = `commercialista-${period}-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.${format}`;
                    break;

                case 'performance':
                    reportData = this.generatePerformanceReport(period);
                    filename = `performance-${period}-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.${format}`;
                    break;

                case 'executive':
                    reportData = this.generateExecutiveReport(period);
                    filename = `executive-${period}-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.${format}`;
                    break;

                default:
                    throw new Error('Tipo report non supportato');
            }

            this.downloadReport(reportData, filename, format);
            NotificationUtils.success('Report generato con successo');

        } catch (error) {
            handleError(error, 'Errore generazione report personalizzato');
        }
    }

    /**
     * Render errore
     */
    renderError() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--accent-danger); margin-bottom: 1rem;"></i>
                    <h3>Errore Caricamento Reports</h3>
                    <p class="text-muted">Si è verificato un errore durante il caricamento dei reports.</p>
                    <button class="btn-primary" onclick="Reports.render()">
                        <i class="fas fa-refresh"></i> Riprova
                    </button>
                </div>
            </div>
        `;
    }
}

// CSS aggiuntivo per reports components
const reportsCSS = `
<style>
.quick-reports-section,
.report-generator-section,
.scheduled-reports-section,
.report-templates-section {
    margin-bottom: var(--spacing-xl);
}

.quick-reports-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
}

.quick-report-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    transition: var(--transition-fast);
}

.quick-report-item:hover {
    background-color: var(--bg-hover);
}

.quick-report-icon {
    width: 60px;
    height: 60px;
    background-color: var(--accent-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
}

.quick-report-content {
    flex: 1;
}

.quick-report-content h4 {
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
}

.quick-report-content p {
    margin-bottom: var(--spacing-md);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.custom-period {
    display: none;
}

.custom-period.visible {
    display: flex;
}

.checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-sm);
    cursor: pointer;
    padding: var(--spacing-xs);
}

.scheduled-reports-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.scheduled-report-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    border-left: 4px solid var(--accent-primary);
}

.report-info {
    flex: 1;
}

.report-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.report-details {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-sm);
}

.report-type,
.report-frequency,
.report-format {
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--bg-primary);
    border-radius: 4px;
    color: var(--text-secondary);
}

.report-schedule {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
}

.report-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-lg);
}

.template-card {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    padding: var(--spacing-lg);
    transition: var(--transition-fast);
}

.template-card:hover {
    border-color: var(--accent-primary);
    transform: translateY(-2px);
}

.template-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
}

.template-header h4 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.template-formats {
    display: flex;
    gap: var(--spacing-xs);
}

.format-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--accent-primary);
    color: white;
    border-radius: 4px;
    font-size: var(--font-size-sm);
    font-weight: 500;
}

.template-description {
    margin-bottom: var(--spacing-md);
}

.template-description p {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.template-sections {
    margin-bottom: var(--spacing-lg);
}

.template-sections strong {
    color: var(--text-primary);
}

.template-sections ul {
    margin-top: var(--spacing-sm);
    padding-left: var(--spacing-lg);
}

.template-sections li {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xs);
}

.template-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
}

.empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);
}

.empty-state i {
    font-size: 3rem;
    color: var(--text-muted);
    margin-bottom: var(--spacing-lg);
}

.empty-state h4 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

@media (max-width: 768px) {
    .quick-reports-grid {
        grid-template-columns: 1fr;
    }
    
    .templates-grid {
        grid-template-columns: 1fr;
    }
    
    .scheduled-report-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
    }
    
    .report-actions {
        width: 100%;
        justify-content: center;
    }
    
    .checkbox-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', reportsCSS);

// Inizializza reports manager globale
const Reports = new ReportsManager();

// Export per uso globale
window.Reports = Reports;