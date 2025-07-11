/**
 * MUSIC BUSINESS TRACKER - VIDEOS MODULE
 * Video Management, Performance Analytics, SEO Tracking
 */

class VideosModule {
    constructor() {
        this.container = document.getElementById('videosContent');
        this.currentData = [];
        this.filteredData = [];
        this.sortColumn = 'publishDate';
        this.sortDirection = 'desc';
        this.currentFilters = {
            niche: '',
            dateFrom: '',
            dateTo: '',
            viewsMin: '',
            viewsMax: '',
            search: '',
            status: ''
        };
        this.viewMode = 'table';

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Videos Module...');

            if (!this.container) {
                throw new Error('Videos container not found');
            }

            await this.createVideosLayout();
            await this.loadVideosData();
            this.setupEventListeners();

            console.log('✅ Videos Module initialized');

        } catch (error) {
            console.error('❌ Videos initialization failed:', error);
            this.showError('Errore caricamento modulo video');
        }
    }

    async createVideosLayout() {
        const videosHTML = `
            <div class="videos-layout">
                <div class="videos-header">
                    <div class="videos-stats-grid">
                        <div class="video-stats-card total-card">
                            <div class="stats-icon">
                                <i class="fas fa-video"></i>
                            </div>
                            <div class="stats-content">
                                <div class="stats-value" id="totalVideos">0</div>
                                <div class="stats-label">Video Totali</div>
                                <div class="stats-period" id="totalDuration">0h totali</div>
                            </div>
                        </div>
                        
                        <div class="video-stats-card views-card">
                            <div class="stats-icon">
                                <i class="fas fa-eye"></i>
                            </div>
                            <div class="stats-content">
                                <div class="stats-value" id="totalViews">0</div>
                                <div class="stats-label">Visualizzazioni</div>
                                <div class="stats-growth" id="viewsGrowth">+0%</div>
                            </div>
                        </div>
                        
                        <div class="video-stats-card ctr-card">
                            <div class="stats-icon">
                                <i class="fas fa-mouse-pointer"></i>
                            </div>
                            <div class="stats-content">
                                <div class="stats-value" id="averageCTR">0%</div>
                                <div class="stats-label">CTR Medio</div>
                                <div class="stats-target" id="ctrTarget">Target: 4%</div>
                            </div>
                        </div>
                        
                        <div class="video-stats-card performer-card">
                            <div class="stats-icon">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <div class="stats-content">
                                <div class="stats-value" id="bestPerformer">-</div>
                                <div class="stats-label">Top Video</div>
                                <div class="stats-amount" id="bestPerformerViews">0 views</div>
                            </div>
                        </div>
                        
                        <div class="video-stats-card revenue-card">
                            <div class="stats-icon">
                                <i class="fas fa-euro-sign"></i>
                            </div>
                            <div class="stats-content">
                                <div class="stats-value" id="totalVideoRevenue">€0.00</div>
                                <div class="stats-label">Revenue Video</div>
                                <div class="stats-average" id="avgRevenuePerVideo">€0/video</div>
                            </div>
                        </div>
                        
                        <div class="video-stats-card retention-card">
                            <div class="stats-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="stats-content">
                                <div class="stats-value" id="averageRetention">0%</div>
                                <div class="stats-label">Retention Media</div>
                                <div class="stats-target" id="retentionTarget">Target: 60%</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="videos-controls">
                    <div class="controls-header">
                        <div class="view-controls">
                            <span class="view-label">Vista:</span>
                            <div class="view-toggle">
                                <button class="view-btn active" data-view="table" id="tableViewBtn">
                                    <i class="fas fa-table"></i>
                                    Tabella
                                </button>
                                <button class="view-btn" data-view="cards" id="cardsViewBtn">
                                    <i class="fas fa-th-large"></i>
                                    Cards
                                </button>
                            </div>
                        </div>
                        
                        <div class="quick-actions">
                            <button class="btn btn-secondary btn-sm" id="analyticsBtn">
                                <i class="fas fa-chart-bar"></i>
                                Analytics
                            </button>
                            <button class="btn btn-primary btn-sm" id="addVideoBtn">
                                <i class="fas fa-plus"></i>
                                Aggiungi Video
                            </button>
                        </div>
                    </div>
                    
                    <div class="filters-section">
                        <div class="filters-row">
                            <div class="filter-group">
                                <label class="filter-label">Cerca:</label>
                                <input type="text" id="searchFilter" class="filter-input" 
                                       placeholder="Titolo, keywords...">
                            </div>
                            
                            <div class="filter-group">
                                <label class="filter-label">Nicchia:</label>
                                <select id="nicheFilter" class="filter-select">
                                    <option value="">Tutte le nicchie</option>
                                    <option value="Study/Focus">Study/Focus</option>
                                    <option value="Sleep/Relaxation">Sleep/Relaxation</option>
                                    <option value="Work/Background">Work/Background</option>
                                    <option value="Ambient/Nature">Ambient/Nature</option>
                                    <option value="Seasonal/Mood">Seasonal/Mood</option>
                                    <option value="Altri">Altri</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label class="filter-label">Status:</label>
                                <select id="statusFilter" class="filter-select">
                                    <option value="">Tutti gli stati</option>
                                    <option value="published">Pubblicato</option>
                                    <option value="scheduled">Schedulato</option>
                                    <option value="draft">Bozza</option>
                                    <option value="private">Privato</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label class="filter-label">Periodo:</label>
                                <div class="date-range">
                                    <input type="date" id="dateFromFilter" class="filter-input small">
                                    <span class="range-separator">-</span>
                                    <input type="date" id="dateToFilter" class="filter-input small">
                                </div>
                            </div>
                            
                            <div class="filter-group">
                                <label class="filter-label">Visualizzazioni:</label>
                                <div class="views-range">
                                    <input type="number" id="viewsMinFilter" class="filter-input small" 
                                           placeholder="Min" min="0">
                                    <span class="range-separator">-</span>
                                    <input type="number" id="viewsMaxFilter" class="filter-input small" 
                                           placeholder="Max" min="0">
                                </div>
                            </div>
                        </div>
                        
                        <div class="filters-actions">
                            <button class="btn btn-outline btn-sm" id="clearFiltersBtn">
                                <i class="fas fa-times"></i>
                                Pulisci Filtri
                            </button>
                            <button class="btn btn-secondary btn-sm" id="exportVideosBtn">
                                <i class="fas fa-download"></i>
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="videos-content-area">
                    <div class="videos-table-view" id="videosTableView">
                        <div class="table-header">
                            <div class="table-info">
                                <span class="results-count" id="resultsCount">0 video</span>
                                <span class="results-views" id="resultsViews">0 views totali</span>
                            </div>
                        </div>
                        
                        <div class="table-container">
                            <table class="videos-table" id="videosTable">
                                <thead>
                                    <tr>
                                        <th class="sortable" data-sort="publishDate">
                                            Data
                                            <i class="fas fa-sort sort-icon"></i>
                                        </th>
                                        <th class="sortable" data-sort="title">
                                            Titolo
                                            <i class="fas fa-sort sort-icon"></i>
                                        </th>
                                        <th class="sortable" data-sort="niche">
                                            Nicchia
                                            <i class="fas fa-sort sort-icon"></i>
                                        </th>
                                        <th class="sortable" data-sort="views">
                                            Views
                                            <i class="fas fa-sort sort-icon"></i>
                                        </th>
                                        <th class="sortable" data-sort="ctr">
                                            CTR
                                            <i class="fas fa-sort sort-icon"></i>
                                        </th>
                                        <th class="sortable" data-sort="revenue">
                                            Revenue
                                            <i class="fas fa-sort sort-icon"></i>
                                        </th>
                                        <th>Status</th>
                                        <th class="actions-col">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody id="videosTableBody">
                                </tbody>
                            </table>
                            
                            <div class="table-empty hidden" id="tableEmpty">
                                <div class="empty-icon">
                                    <i class="fas fa-video"></i>
                                </div>
                                <div class="empty-message">
                                    <h3>Nessun video trovato</h3>
                                    <p>Aggiungi il tuo primo video o modifica i filtri di ricerca.</p>
                                    <button class="btn btn-primary" id="addFirstVideoBtn">
                                        <i class="fas fa-plus"></i>
                                        Aggiungi Primo Video
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="videos-cards-view hidden" id="videosCardsView">
                        <div class="videos-cards-grid" id="videosCardsGrid">
                        </div>
                        
                        <div class="cards-empty hidden" id="cardsEmpty">
                            <div class="empty-icon">
                                <i class="fas fa-video"></i>
                            </div>
                            <div class="empty-message">
                                <h3>Nessun video trovato</h3>
                                <p>Aggiungi il tuo primo video o modifica i filtri di ricerca.</p>
                                <button class="btn btn-primary" id="addFirstVideoCardBtn">
                                    <i class="fas fa-plus"></i>
                                    Aggiungi Primo Video
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = videosHTML;
    }

    async loadVideosData() {
        try {
            this.currentData = await window.musicDB.getAllVideos();
            this.currentData.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

            this.applyFilters();
            this.updateStatistics();
            this.renderCurrentView();

        } catch (error) {
            console.error('❌ Error loading videos data:', error);
            this.showError('Errore caricamento dati video');
        }
    }

    updateStatistics() {
        const totalVideos = this.currentData.length;
        const totalViews = this.currentData.reduce((sum, video) => sum + (video.views || 0), 0);
        const totalDuration = this.currentData.reduce((sum, video) => sum + (video.duration || 0), 0);
        const totalRevenue = this.currentData.reduce((sum, video) => sum + (video.revenue || 0), 0);

        const avgCTR = totalVideos > 0 ?
            this.currentData.reduce((sum, video) => sum + (video.ctr || 0), 0) / totalVideos : 0;
        const avgRetention = totalVideos > 0 ?
            this.currentData.reduce((sum, video) => sum + (video.retention || 0), 0) / totalVideos : 0;
        const avgRevenuePerVideo = totalVideos > 0 ? totalRevenue / totalVideos : 0;

        const bestPerformer = this.currentData.reduce((best, video) =>
            (video.views || 0) > (best.views || 0) ? video : best, { views: 0, title: '-' });

        document.getElementById('totalVideos').textContent = totalVideos.toString();
        document.getElementById('totalDuration').textContent = Math.round(totalDuration / 60) + 'h totali';

        document.getElementById('totalViews').textContent = totalViews.toLocaleString();
        document.getElementById('viewsGrowth').textContent = '+0%';

        document.getElementById('averageCTR').textContent = avgCTR.toFixed(1) + '%';
        const ctrTarget = document.getElementById('ctrTarget');
        if (avgCTR >= 4) {
            ctrTarget.textContent = '✅ Target raggiunto';
            ctrTarget.className = 'stats-target success';
        } else {
            ctrTarget.textContent = 'Target: 4%';
            ctrTarget.className = 'stats-target';
        }

        const titleToShow = bestPerformer.title.length > 20 ?
            bestPerformer.title.substring(0, 20) + '...' : bestPerformer.title;
        document.getElementById('bestPerformer').textContent = titleToShow;
        document.getElementById('bestPerformerViews').textContent =
            (bestPerformer.views || 0).toLocaleString() + ' views';

        document.getElementById('totalVideoRevenue').textContent = '€' + totalRevenue.toFixed(2);
        document.getElementById('avgRevenuePerVideo').textContent = '€' + avgRevenuePerVideo.toFixed(2) + '/video';

        document.getElementById('averageRetention').textContent = avgRetention.toFixed(1) + '%';
        const retentionTarget = document.getElementById('retentionTarget');
        if (avgRetention >= 60) {
            retentionTarget.textContent = '✅ Target raggiunto';
            retentionTarget.className = 'stats-target success';
        } else {
            retentionTarget.textContent = 'Target: 60%';
            retentionTarget.className = 'stats-target';
        }
    }

    applyFilters() {
        this.filteredData = this.currentData.filter(video => {
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchText = (video.title || '') + ' ' + (video.description || '');
                if (!searchText.toLowerCase().includes(searchTerm)) return false;
            }

            if (this.currentFilters.niche && video.niche !== this.currentFilters.niche) {
                return false;
            }

            if (this.currentFilters.status && video.status !== this.currentFilters.status) {
                return false;
            }

            if (this.currentFilters.dateFrom) {
                if (new Date(video.publishDate) < new Date(this.currentFilters.dateFrom)) return false;
            }
            if (this.currentFilters.dateTo) {
                if (new Date(video.publishDate) > new Date(this.currentFilters.dateTo)) return false;
            }

            if (this.currentFilters.viewsMin !== '' && (video.views || 0) < parseInt(this.currentFilters.viewsMin)) {
                return false;
            }
            if (this.currentFilters.viewsMax !== '' && (video.views || 0) > parseInt(this.currentFilters.viewsMax)) {
                return false;
            }

            return true;
        });

        this.sortData();
        this.updateResultsInfo();
    }

    sortData() {
        this.filteredData.sort((a, b) => {
            let valueA = a[this.sortColumn];
            let valueB = b[this.sortColumn];

            if (this.sortColumn === 'publishDate') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            } else if (['views', 'ctr', 'retention', 'revenue', 'duration'].includes(this.sortColumn)) {
                valueA = parseFloat(valueA) || 0;
                valueB = parseFloat(valueB) || 0;
            } else if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    updateResultsInfo() {
        const resultsCount = document.getElementById('resultsCount');
        const resultsViews = document.getElementById('resultsViews');

        const count = this.filteredData.length;
        const totalViews = this.filteredData.reduce((sum, video) => sum + (video.views || 0), 0);

        if (resultsCount) {
            resultsCount.textContent = count + ' video';
        }
        if (resultsViews) {
            resultsViews.textContent = totalViews.toLocaleString() + ' views totali';
        }
    }

    renderCurrentView() {
        if (this.viewMode === 'table') {
            this.renderTableView();
        } else {
            this.renderCardsView();
        }
    }

    renderTableView() {
        const tableBody = document.getElementById('videosTableBody');
        const tableEmpty = document.getElementById('tableEmpty');
        const table = document.getElementById('videosTable');

        if (!tableBody) return;

        if (this.filteredData.length === 0) {
            table.classList.add('hidden');
            tableEmpty.classList.remove('hidden');
            return;
        }

        table.classList.remove('hidden');
        tableEmpty.classList.add('hidden');

        const rows = this.filteredData.map(video => {
            const videoId = video.id;
            const youtubeLink = video.youtubeUrl ?
                '<a href="' + video.youtubeUrl + '" target="_blank" class="youtube-link" title="Apri su YouTube"><i class="fab fa-youtube"></i></a>' : '';

            return '<tr data-id="' + videoId + '">' +
                '<td class="date-col"><span class="date-display">' + this.formatDate(video.publishDate) + '</span></td>' +
                '<td class="title-col">' +
                '<div class="video-title-info">' +
                '<span class="video-title">' + this.truncateText(video.title, 40) + '</span>' +
                youtubeLink +
                '</div>' +
                (video.duration ? '<span class="video-duration">' + video.duration + ' min</span>' : '') +
                '</td>' +
                '<td class="niche-col"><span class="niche-badge niche-' + this.getNicheClass(video.niche) + '">' + video.niche + '</span></td>' +
                '<td class="views-col"><span class="views-display">' + (video.views || 0).toLocaleString() + '</span></td>' +
                '<td class="ctr-col"><span class="ctr-display ' + this.getCTRClass(video.ctr) + '">' + (video.ctr || 0).toFixed(1) + '%</span></td>' +
                '<td class="revenue-col"><span class="revenue-display">€' + (video.revenue || 0).toFixed(2) + '</span></td>' +
                '<td class="status-col"><span class="status-badge status-' + (video.status || 'published') + '">' + this.formatStatus(video.status) + '</span></td>' +
                '<td class="actions-col">' +
                '<div class="action-buttons">' +
                '<button class="btn-icon view-btn" onclick="videosModule.viewVideo(\'' + videoId + '\')" title="Visualizza dettagli">' +
                '<i class="fas fa-eye"></i>' +
                '</button>' +
                '<button class="btn-icon edit-btn" onclick="videosModule.editVideo(\'' + videoId + '\')" title="Modifica">' +
                '<i class="fas fa-edit"></i>' +
                '</button>' +
                '<button class="btn-icon delete-btn" onclick="videosModule.deleteVideo(\'' + videoId + '\')" title="Elimina">' +
                '<i class="fas fa-trash"></i>' +
                '</button>' +
                '</div>' +
                '</td>' +
                '</tr>';
        }).join('');

        tableBody.innerHTML = rows;
        this.updateSortIndicators();
    }

    renderCardsView() {
        const cardsGrid = document.getElementById('videosCardsGrid');
        const cardsEmpty = document.getElementById('cardsEmpty');

        if (!cardsGrid) return;

        if (this.filteredData.length === 0) {
            cardsGrid.classList.add('hidden');
            cardsEmpty.classList.remove('hidden');
            return;
        }

        cardsGrid.classList.remove('hidden');
        cardsEmpty.classList.add('hidden');

        const cards = this.filteredData.map(video => {
            const videoId = video.id;
            const youtubeLink = video.youtubeUrl ?
                '<a href="' + video.youtubeUrl + '" target="_blank" class="btn-icon youtube-btn" title="YouTube"><i class="fab fa-youtube"></i></a>' : '';

            return '<div class="video-card" data-id="' + videoId + '">' +
                '<div class="video-card-header">' +
                '<div class="video-info">' +
                '<h3 class="video-card-title" title="' + video.title + '">' + this.truncateText(video.title, 50) + '</h3>' +
                '<div class="video-meta">' +
                '<span class="publish-date">' + this.formatDate(video.publishDate) + '</span>' +
                '<span class="niche-badge niche-' + this.getNicheClass(video.niche) + '">' + video.niche + '</span>' +
                '</div>' +
                '</div>' +
                '<div class="video-actions">' +
                '<button class="btn-icon view-btn" onclick="videosModule.viewVideo(\'' + videoId + '\')" title="Dettagli">' +
                '<i class="fas fa-eye"></i>' +
                '</button>' +
                youtubeLink +
                '</div>' +
                '</div>' +

                '<div class="video-metrics">' +
                '<div class="metric-item">' +
                '<div class="metric-value">' + (video.views || 0).toLocaleString() + '</div>' +
                '<div class="metric-label">Views</div>' +
                '</div>' +
                '<div class="metric-item">' +
                '<div class="metric-value ' + this.getCTRClass(video.ctr) + '">' + (video.ctr || 0).toFixed(1) + '%</div>' +
                '<div class="metric-label">CTR</div>' +
                '</div>' +
                '<div class="metric-item">' +
                '<div class="metric-value ' + this.getRetentionClass(video.retention) + '">' + (video.retention || 0).toFixed(1) + '%</div>' +
                '<div class="metric-label">Retention</div>' +
                '</div>' +
                '<div class="metric-item">' +
                '<div class="metric-value">€' + (video.revenue || 0).toFixed(2) + '</div>' +
                '<div class="metric-label">Revenue</div>' +
                '</div>' +
                '</div>' +

                '<div class="video-card-footer">' +
                '<div class="video-status">' +
                '<span class="status-badge status-' + (video.status || 'published') + '">' + this.formatStatus(video.status) + '</span>' +
                (video.duration ? '<span class="duration-info">' + video.duration + ' min</span>' : '') +
                '</div>' +
                '<div class="card-actions">' +
                '<button class="btn btn-outline btn-sm" onclick="videosModule.editVideo(\'' + videoId + '\')">' +
                '<i class="fas fa-edit"></i> Modifica' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
        }).join('');

        cardsGrid.innerHTML = cards;
    }

    updateSortIndicators() {
        const headers = document.querySelectorAll('.sortable');
        headers.forEach(header => {
            const icon = header.querySelector('.sort-icon');
            const column = header.getAttribute('data-sort');

            if (column === this.sortColumn) {
                icon.className = 'fas fa-sort-' + (this.sortDirection === 'asc' ? 'up' : 'down') + ' sort-icon active';
            } else {
                icon.className = 'fas fa-sort sort-icon';
            }
        });
    }

    setupEventListeners() {
        // View mode toggle
        document.getElementById('tableViewBtn').addEventListener('click', () => {
            this.switchView('table');
        });

        document.getElementById('cardsViewBtn').addEventListener('click', () => {
            this.switchView('cards');
        });

        // Filter inputs
        document.getElementById('searchFilter').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.applyFilters();
            this.renderCurrentView();
        });

        document.getElementById('nicheFilter').addEventListener('change', (e) => {
            this.currentFilters.niche = e.target.value;
            this.applyFilters();
            this.renderCurrentView();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.applyFilters();
            this.renderCurrentView();
        });

        document.getElementById('dateFromFilter').addEventListener('change', (e) => {
            this.currentFilters.dateFrom = e.target.value;
            this.applyFilters();
            this.renderCurrentView();
        });

        document.getElementById('dateToFilter').addEventListener('change', (e) => {
            this.currentFilters.dateTo = e.target.value;
            this.applyFilters();
            this.renderCurrentView();
        });

        document.getElementById('viewsMinFilter').addEventListener('input', (e) => {
            this.currentFilters.viewsMin = e.target.value;
            this.applyFilters();
            this.renderCurrentView();
        });

        document.getElementById('viewsMaxFilter').addEventListener('input', (e) => {
            this.currentFilters.viewsMax = e.target.value;
            this.applyFilters();
            this.renderCurrentView();
        });

        // Action buttons
        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        document.getElementById('addVideoBtn').addEventListener('click', () => {
            this.openAddVideoModal();
        });

        document.getElementById('addFirstVideoBtn').addEventListener('click', () => {
            this.openAddVideoModal();
        });

        document.getElementById('addFirstVideoCardBtn').addEventListener('click', () => {
            this.openAddVideoModal();
        });

        document.getElementById('exportVideosBtn').addEventListener('click', () => {
            this.exportCSV();
        });

        document.getElementById('analyticsBtn').addEventListener('click', () => {
            this.openAnalytics();
        });

        // Table sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.getAttribute('data-sort');
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'desc';
                }
                this.applyFilters();
                this.renderCurrentView();
            });
        });
    }

    switchView(viewMode) {
        this.viewMode = viewMode;

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(viewMode + 'ViewBtn').classList.add('active');

        const tableView = document.getElementById('videosTableView');
        const cardsView = document.getElementById('videosCardsView');

        if (viewMode === 'table') {
            tableView.classList.remove('hidden');
            cardsView.classList.add('hidden');
        } else {
            tableView.classList.add('hidden');
            cardsView.classList.remove('hidden');
        }

        this.renderCurrentView();
    }

    clearFilters() {
        this.currentFilters = {
            niche: '',
            dateFrom: '',
            dateTo: '',
            viewsMin: '',
            viewsMax: '',
            search: '',
            status: ''
        };

        document.getElementById('searchFilter').value = '';
        document.getElementById('nicheFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        document.getElementById('viewsMinFilter').value = '';
        document.getElementById('viewsMaxFilter').value = '';

        this.applyFilters();
        this.renderCurrentView();

        window.showToast('Filtri puliti', 'info');
    }

    openAddVideoModal() {
        if (window.musicApp && window.musicApp.openAddVideoModal) {
            window.musicApp.openAddVideoModal();
        }
    }

    async viewVideo(id) {
        try {
            const video = this.currentData.find(item => item.id == id);
            if (!video) {
                throw new Error('Video non trovato');
            }

            const youtubeLink = video.youtubeUrl ?
                '<a href="' + video.youtubeUrl + '" target="_blank" class="youtube-link-large"><i class="fab fa-youtube"></i> Apri su YouTube</a>' : '';

            const keywordsSection = video.keywords && video.keywords.length > 0 ?
                '<div class="detail-section">' +
                '<h4>Keywords</h4>' +
                '<div class="keywords-list">' +
                video.keywords.map(keyword => '<span class="keyword-tag">' + keyword + '</span>').join('') +
                '</div>' +
                '</div>' : '';

            const descriptionSection = video.description ?
                '<div class="detail-section">' +
                '<h4>Descrizione</h4>' +
                '<p class="video-description">' + video.description + '</p>' +
                '</div>' : '';

            const detailHTML = '<div class="video-detail-view">' +
                '<div class="detail-header">' +
                '<h3 class="detail-title">' + video.title + '</h3>' +
                youtubeLink +
                '</div>' +

                '<div class="detail-content">' +
                '<div class="detail-section">' +
                '<h4>Informazioni Base</h4>' +
                '<div class="detail-grid">' +
                '<div class="detail-item">' +
                '<span class="detail-label">Data Pubblicazione:</span>' +
                '<span class="detail-value">' + this.formatDate(video.publishDate) + '</span>' +
                '</div>' +
                '<div class="detail-item">' +
                '<span class="detail-label">Nicchia:</span>' +
                '<span class="detail-value">' + video.niche + '</span>' +
                '</div>' +
                '<div class="detail-item">' +
                '<span class="detail-label">Durata:</span>' +
                '<span class="detail-value">' + (video.duration || 0) + ' minuti</span>' +
                '</div>' +
                '<div class="detail-item">' +
                '<span class="detail-label">Status:</span>' +
                '<span class="detail-value">' + this.formatStatus(video.status) + '</span>' +
                '</div>' +
                '</div>' +
                '</div>' +

                '<div class="detail-section">' +
                '<h4>Performance Metrics</h4>' +
                '<div class="metrics-grid">' +
                '<div class="metric-card">' +
                '<div class="metric-number">' + (video.views || 0).toLocaleString() + '</div>' +
                '<div class="metric-label">Visualizzazioni</div>' +
                '</div>' +
                '<div class="metric-card">' +
                '<div class="metric-number">' + (video.ctr || 0).toFixed(1) + '%</div>' +
                '<div class="metric-label">CTR</div>' +
                '</div>' +
                '<div class="metric-card">' +
                '<div class="metric-number">' + (video.retention || 0).toFixed(1) + '%</div>' +
                '<div class="metric-label">Retention</div>' +
                '</div>' +
                '<div class="metric-card">' +
                '<div class="metric-number">€' + (video.revenue || 0).toFixed(2) + '</div>' +
                '<div class="metric-label">Revenue</div>' +
                '</div>' +
                '<div class="metric-card">' +
                '<div class="metric-number">' + (video.likes || 0) + '</div>' +
                '<div class="metric-label">Likes</div>' +
                '</div>' +
                '<div class="metric-card">' +
                '<div class="metric-number">' + (video.comments || 0) + '</div>' +
                '<div class="metric-label">Commenti</div>' +
                '</div>' +
                '</div>' +
                '</div>' +

                descriptionSection +
                keywordsSection +
                '</div>' +
                '</div>';

            if (window.musicApp && window.musicApp.openModal) {
                window.musicApp.openModal('Dettagli Video', detailHTML, null);
            }

        } catch (error) {
            console.error('❌ Error viewing video:', error);
            window.showToast('Errore: ' + error.message, 'error');
        }
    }

    async editVideo(id) {
        try {
            const video = this.currentData.find(item => item.id == id);
            if (!video) {
                throw new Error('Video non trovato');
            }

            const formHTML = '<form id="editVideoForm" class="form">' +
                '<div class="form-row">' +
                '<div class="form-group">' +
                '<label for="editVideoTitle" class="form-label">Titolo Video *</label>' +
                '<input type="text" id="editVideoTitle" class="form-input" required value="' + video.title + '">' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="editVideoDate" class="form-label">Data Pubblicazione *</label>' +
                '<input type="date" id="editVideoDate" class="form-input" required value="' + video.publishDate + '">' +
                '</div>' +
                '</div>' +

                '<div class="form-row">' +
                '<div class="form-group">' +
                '<label for="editVideoNiche" class="form-label">Nicchia *</label>' +
                '<select id="editVideoNiche" class="form-select" required>' +
                '<option value="Study/Focus"' + (video.niche === 'Study/Focus' ? ' selected' : '') + '>Study/Focus</option>' +
                '<option value="Sleep/Relaxation"' + (video.niche === 'Sleep/Relaxation' ? ' selected' : '') + '>Sleep/Relaxation</option>' +
                '<option value="Work/Background"' + (video.niche === 'Work/Background' ? ' selected' : '') + '>Work/Background</option>' +
                '<option value="Ambient/Nature"' + (video.niche === 'Ambient/Nature' ? ' selected' : '') + '>Ambient/Nature</option>' +
                '<option value="Seasonal/Mood"' + (video.niche === 'Seasonal/Mood' ? ' selected' : '') + '>Seasonal/Mood</option>' +
                '<option value="Altri"' + (video.niche === 'Altri' ? ' selected' : '') + '>Altri</option>' +
                '</select>' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="editVideoStatus" class="form-label">Status</label>' +
                '<select id="editVideoStatus" class="form-select">' +
                '<option value="published"' + (video.status === 'published' ? ' selected' : '') + '>Pubblicato</option>' +
                '<option value="scheduled"' + (video.status === 'scheduled' ? ' selected' : '') + '>Schedulato</option>' +
                '<option value="draft"' + (video.status === 'draft' ? ' selected' : '') + '>Bozza</option>' +
                '<option value="private"' + (video.status === 'private' ? ' selected' : '') + '>Privato</option>' +
                '</select>' +
                '</div>' +
                '</div>' +

                '<div class="form-row">' +
                '<div class="form-group">' +
                '<label for="editVideoDuration" class="form-label">Durata (minuti)</label>' +
                '<input type="number" id="editVideoDuration" class="form-input" min="1" value="' + (video.duration || '') + '">' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="editVideoUrl" class="form-label">URL YouTube</label>' +
                '<input type="url" id="editVideoUrl" class="form-input" value="' + (video.youtubeUrl || '') + '">' +
                '</div>' +
                '</div>' +

                '<div class="form-section">' +
                '<h4>Performance Metrics</h4>' +
                '<div class="form-row">' +
                '<div class="form-group">' +
                '<label for="editVideoViews" class="form-label">Visualizzazioni</label>' +
                '<input type="number" id="editVideoViews" class="form-input" min="0" value="' + (video.views || 0) + '">' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="editVideoCTR" class="form-label">CTR (%)</label>' +
                '<input type="number" id="editVideoCTR" class="form-input" step="0.1" min="0" max="100" value="' + (video.ctr || 0) + '">' +
                '</div>' +
                '</div>' +
                '<div class="form-row">' +
                '<div class="form-group">' +
                '<label for="editVideoRetention" class="form-label">Retention (%)</label>' +
                '<input type="number" id="editVideoRetention" class="form-input" step="0.1" min="0" max="100" value="' + (video.retention || 0) + '">' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="editVideoRevenue" class="form-label">Revenue (€)</label>' +
                '<input type="number" id="editVideoRevenue" class="form-input" step="0.01" min="0" value="' + (video.revenue || 0) + '">' +
                '</div>' +
                '</div>' +
                '<div class="form-row">' +
                '<div class="form-group">' +
                '<label for="editVideoLikes" class="form-label">Likes</label>' +
                '<input type="number" id="editVideoLikes" class="form-input" min="0" value="' + (video.likes || 0) + '">' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="editVideoComments" class="form-label">Commenti</label>' +
                '<input type="number" id="editVideoComments" class="form-input" min="0" value="' + (video.comments || 0) + '">' +
                '</div>' +
                '</div>' +
                '</div>' +

                '<div class="form-group">' +
                '<label for="editVideoDescription" class="form-label">Descrizione</label>' +
                '<textarea id="editVideoDescription" class="form-textarea" placeholder="Descrizione del video...">' + (video.description || '') + '</textarea>' +
                '</div>' +

                '<div class="form-group">' +
                '<label for="editVideoKeywords" class="form-label">Keywords (separate da virgola)</label>' +
                '<input type="text" id="editVideoKeywords" class="form-input" value="' + ((video.keywords || []).join(', ')) + '" placeholder="study music, focus, concentration">' +
                '</div>' +
                '</form>';

            if (window.musicApp && window.musicApp.openModal) {
                window.musicApp.openModal('Modifica Video', formHTML, () => this.submitEditVideo(id));
            }

        } catch (error) {
            console.error('❌ Error editing video:', error);
            window.showToast('Errore: ' + error.message, 'error');
        }
    }

    async submitEditVideo(id) {
        try {
            const updateData = {
                title: document.getElementById('editVideoTitle').value,
                publishDate: document.getElementById('editVideoDate').value,
                niche: document.getElementById('editVideoNiche').value,
                status: document.getElementById('editVideoStatus').value,
                duration: parseInt(document.getElementById('editVideoDuration').value) || null,
                youtubeUrl: document.getElementById('editVideoUrl').value,
                views: parseInt(document.getElementById('editVideoViews').value) || 0,
                ctr: parseFloat(document.getElementById('editVideoCTR').value) || 0,
                retention: parseFloat(document.getElementById('editVideoRetention').value) || 0,
                revenue: parseFloat(document.getElementById('editVideoRevenue').value) || 0,
                likes: parseInt(document.getElementById('editVideoLikes').value) || 0,
                comments: parseInt(document.getElementById('editVideoComments').value) || 0,
                description: document.getElementById('editVideoDescription').value,
                keywords: document.getElementById('editVideoKeywords').value
                    .split(',').map(k => k.trim()).filter(k => k)
            };

            if (!updateData.title || !updateData.publishDate || !updateData.niche) {
                throw new Error('Compilare tutti i campi obbligatori');
            }

            await window.musicDB.updateVideo(id, updateData);
            await this.refresh();

            window.showToast('Video aggiornato con successo!', 'success');

        } catch (error) {
            console.error('❌ Error updating video:', error);
            window.showToast('Errore: ' + error.message, 'error');
        }
    }

    async deleteVideo(id) {
        try {
            const video = this.currentData.find(item => item.id == id);
            if (!video) {
                throw new Error('Video non trovato');
            }

            const confirmed = confirm('Eliminare il video "' + video.title + '"? Questa azione non può essere annullata.');

            if (!confirmed) return;

            await window.musicDB.deleteVideo(id);
            await this.refresh();

            window.showToast('Video eliminato con successo!', 'success');

        } catch (error) {
            console.error('❌ Error deleting video:', error);
            window.showToast('Errore: ' + error.message, 'error');
        }
    }

    async exportCSV() {
        try {
            const data = this.filteredData.length > 0 ? this.filteredData : this.currentData;

            if (data.length === 0) {
                window.showToast('Nessun dato da esportare', 'warning');
                return;
            }

            const headers = ['Data', 'Titolo', 'Nicchia', 'Durata', 'Views', 'CTR', 'Retention', 'Revenue', 'Status', 'URL'];
            const rows = data.map(video => [
                video.publishDate,
                '"' + (video.title || '').replace(/"/g, '""') + '"',
                video.niche,
                video.duration || 0,
                video.views || 0,
                video.ctr || 0,
                video.retention || 0,
                (video.revenue || 0).toFixed(2),
                video.status || 'published',
                video.youtubeUrl || ''
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'videos-export-' + new Date().toISOString().split('T')[0] + '.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            window.showToast(data.length + ' video esportati con successo!', 'success');

        } catch (error) {
            console.error('❌ Error exporting CSV:', error);
            window.showToast('Errore durante export', 'error');
        }
    }

    openAnalytics() {
        if (window.musicApp && window.musicApp.navigateToPage) {
            window.musicApp.navigateToPage('analytics');
        }
    }

    async refresh() {
        try {
            await this.loadVideosData();
        } catch (error) {
            console.error('❌ Error refreshing videos module:', error);
        }
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    getNicheClass(niche) {
        const nicheMap = {
            'Study/Focus': 'study',
            'Sleep/Relaxation': 'sleep',
            'Work/Background': 'work',
            'Ambient/Nature': 'ambient',
            'Seasonal/Mood': 'seasonal'
        };
        return nicheMap[niche] || 'other';
    }

    getCTRClass(ctr) {
        if (ctr >= 4) return 'metric-excellent';
        if (ctr >= 3) return 'metric-good';
        if (ctr >= 2) return 'metric-average';
        return 'metric-poor';
    }

    getRetentionClass(retention) {
        if (retention >= 60) return 'metric-excellent';
        if (retention >= 50) return 'metric-good';
        if (retention >= 40) return 'metric-average';
        return 'metric-poor';
    }

    formatStatus(status) {
        const statusMap = {
            'published': 'Pubblicato',
            'scheduled': 'Schedulato',
            'draft': 'Bozza',
            'private': 'Privato'
        };
        return statusMap[status] || 'Pubblicato';
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text || '';
        return text.substring(0, maxLength - 3) + '...';
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = '<div class="error-state">' +
                '<div class="error-icon">' +
                '<i class="fas fa-exclamation-triangle"></i>' +
                '</div>' +
                '<div class="error-message">' +
                '<h3>Errore Videos Module</h3>' +
                '<p>' + message + '</p>' +
                '<button class="btn btn-primary" onclick="videosModule.refresh()">' +
                '<i class="fas fa-sync-alt"></i> Riprova' +
                '</button>' +
                '</div>' +
                '</div>';
        }
    }
}

// Global export
window.VideosModule = VideosModule;