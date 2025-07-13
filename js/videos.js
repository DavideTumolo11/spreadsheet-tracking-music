/**
 * 📹 MUSIC BUSINESS TRACKER - VIDEOS.JS
 * Gestione completa video e performance tracking
 */

class VideosManager {
    constructor() {
        this.container = null;
        this.currentData = [];
        this.filteredData = [];
        this.filters = {
            category: '',
            dateFrom: '',
            dateTo: '',
            platform: '',
            search: '',
            performance: '' // high, medium, low
        };
        this.sortConfig = {
            field: 'publishDate',
            direction: 'desc'
        };
        this.selectedItems = new Set();
        this.categories = ['Study', 'Sleep', 'Work', 'Ambient', 'Seasonal'];
        this.init();
    }

    /**
     * Inizializza videos manager
     */
    init() {
        this.container = document.getElementById('videos-content');
        if (!this.container) {
            console.error('Container videos non trovato');
            return;
        }

        this.loadData();
        this.render();
        this.bindEvents();
    }

    /**
     * Carica dati video dal database
     */
    loadData() {
        // Carica video dal localStorage
        this.currentData = StorageUtils.load('mbt_videos_data', []);
        this.calculatePerformanceMetrics();
        this.applyFilters();
    }

    /**
     * Calcola metriche performance automatiche
     */
    calculatePerformanceMetrics() {
        this.currentData.forEach(video => {
            // Calcola revenue totale per video
            const videoRevenue = DB.getAllRevenue().filter(r =>
                r.videoTitle && r.videoTitle.toLowerCase().includes(video.title.toLowerCase())
            );

            video.totalRevenue = videoRevenue.reduce((sum, r) => sum + r.amount, 0);
            video.revenueEntries = videoRevenue.length;

            // Calcola metriche derivate
            video.revenuePerView = video.views > 0 ? video.totalRevenue / video.views * 1000 : 0; // per 1000 views
            video.roi = video.productionCost > 0 ? (video.totalRevenue / video.productionCost) * 100 : 0;

            // Determina performance level
            video.performanceLevel = this.calculatePerformanceLevel(video);
        });
    }

    /**
     * Calcola livello performance
     */
    calculatePerformanceLevel(video) {
        let score = 0;

        // CTR scoring (peso 30%)
        if (video.ctr >= 4) score += 30;
        else if (video.ctr >= 3) score += 20;
        else if (video.ctr >= 2) score += 10;

        // Retention scoring (peso 30%)
        if (video.retention >= 60) score += 30;
        else if (video.retention >= 45) score += 20;
        else if (video.retention >= 30) score += 10;

        // Revenue per view scoring (peso 40%)
        if (video.revenuePerView >= 5) score += 40;
        else if (video.revenuePerView >= 3) score += 25;
        else if (video.revenuePerView >= 1) score += 15;

        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    /**
     * Render completo sezione videos
     */
    render() {
        if (!this.container) return;

        try {
            this.container.innerHTML = `
                <!-- 🔍 FILTRI E CONTROLLI -->
                <div class="videos-controls">
                    ${this.renderFilters()}
                    ${this.renderActions()}
                </div>

                <!-- 📊 STATISTICHE PERFORMANCE -->
                <div class="videos-stats">
                    ${this.renderPerformanceStats()}
                </div>

                <!-- 📋 GRID/TABELLA VIDEO -->
                <div class="videos-content-area">
                    ${this.renderVideosGrid()}
                </div>

                <!-- 📄 PAGINATION -->
                <div class="videos-pagination">
                    ${this.renderPagination()}
                </div>
            `;

            this.bindVideoEvents();
        } catch (error) {
            handleError(error, 'Errore rendering videos');
            this.renderError();
        }
    }

    /**
     * Render filtri
     */
    renderFilters() {
        const platforms = [...new Set(this.currentData.flatMap(v => v.platforms || []))];

        return `
            <div class="filters-section">
                <div class="filters-row">
                    <div class="filter-group">
                        <label class="filter-label">Categoria</label>
                        <select class="form-select filter-input" id="categoryFilter">
                            <option value="">Tutte le categorie</option>
                            ${this.categories.map(cat => `
                                <option value="${cat}" ${this.filters.category === cat ? 'selected' : ''}>
                                    ${cat}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">Performance</label>
                        <select class="form-select filter-input" id="performanceFilter">
                            <option value="">Tutte</option>
                            <option value="high" ${this.filters.performance === 'high' ? 'selected' : ''}>High Performance</option>
                            <option value="medium" ${this.filters.performance === 'medium' ? 'selected' : ''}>Medium Performance</option>
                            <option value="low" ${this.filters.performance === 'low' ? 'selected' : ''}>Low Performance</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">Piattaforma</label>
                        <select class="form-select filter-input" id="platformFilter">
                            <option value="">Tutte le piattaforme</option>
                            ${platforms.map(platform => `
                                <option value="${platform}" ${this.filters.platform === platform ? 'selected' : ''}>
                                    ${platform}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">Ricerca</label>
                        <input type="text" class="form-input filter-input" 
                               id="searchFilter" placeholder="Titolo video..." value="${this.filters.search}">
                    </div>
                </div>
                
                <div class="filters-row">
                    <div class="filter-group">
                        <label class="filter-label">Da</label>
                        <input type="date" class="form-input filter-input" 
                               id="dateFrom" value="${this.filters.dateFrom}">
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">A</label>
                        <input type="date" class="form-input filter-input" 
                               id="dateTo" value="${this.filters.dateTo}">
                    </div>
                    
                    <div class="filter-actions">
                        <button class="btn-primary" onclick="Videos.applyFilters()">
                            <i class="fas fa-search"></i> Applica
                        </button>
                        <button class="btn-secondary" onclick="Videos.clearFilters()">
                            <i class="fas fa-times"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render azioni principali
     */
    renderActions() {
        const selectedCount = this.selectedItems.size;

        return `
            <div class="actions-section">
                <div class="bulk-actions ${selectedCount > 0 ? 'visible' : ''}">
                    <span class="selected-count">${selectedCount} video selezionati</span>
                    <button class="btn-secondary btn-sm" onclick="Videos.bulkUpdateCategory()">
                        <i class="fas fa-tags"></i> Cambia Categoria
                    </button>
                    <button class="btn-danger btn-sm" onclick="Videos.deleteSelected()">
                        <i class="fas fa-trash"></i> Elimina Selezionati
                    </button>
                </div>
                
                <div class="main-actions">
                    <button class="btn-secondary" onclick="Videos.exportData()">
                        <i class="fas fa-file-export"></i> Export Data
                    </button>
                    <button class="btn-secondary" onclick="Videos.syncWithRevenue()">
                        <i class="fas fa-sync"></i> Sync Revenue
                    </button>
                    <button class="btn-primary" onclick="Videos.showAddModal()">
                        <i class="fas fa-plus"></i> Aggiungi Video
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render statistiche performance
     */
    renderPerformanceStats() {
        const stats = this.calculateStats();

        return `
            <div class="performance-stats">
                <div class="stat-card high-performance">
                    <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.highPerformance}</div>
                        <div class="stat-label">High Performance</div>
                        <div class="stat-detail">${stats.highPerformanceRevenue}</div>
                    </div>
                </div>
                
                <div class="stat-card medium-performance">
                    <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.mediumPerformance}</div>
                        <div class="stat-label">Medium Performance</div>
                        <div class="stat-detail">${stats.mediumPerformanceRevenue}</div>
                    </div>
                </div>
                
                <div class="stat-card low-performance">
                    <div class="stat-icon"><i class="fas fa-chart-line-down"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.lowPerformance}</div>
                        <div class="stat-label">Low Performance</div>
                        <div class="stat-detail">${stats.lowPerformanceRevenue}</div>
                    </div>
                </div>
                
                <div class="stat-card total-stats">
                    <div class="stat-icon"><i class="fas fa-video"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.totalVideos}</div>
                        <div class="stat-label">Video Totali</div>
                        <div class="stat-detail">${stats.totalRevenue}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Calcola statistiche
     */
    calculateStats() {
        const high = this.filteredData.filter(v => v.performanceLevel === 'high');
        const medium = this.filteredData.filter(v => v.performanceLevel === 'medium');
        const low = this.filteredData.filter(v => v.performanceLevel === 'low');

        const totalRevenue = this.filteredData.reduce((sum, v) => sum + v.totalRevenue, 0);
        const highRevenue = high.reduce((sum, v) => sum + v.totalRevenue, 0);
        const mediumRevenue = medium.reduce((sum, v) => sum + v.totalRevenue, 0);
        const lowRevenue = low.reduce((sum, v) => sum + v.totalRevenue, 0);

        return {
            totalVideos: this.filteredData.length,
            totalRevenue: NumberUtils.formatCurrency(totalRevenue),
            highPerformance: high.length,
            highPerformanceRevenue: NumberUtils.formatCurrency(highRevenue),
            mediumPerformance: medium.length,
            mediumPerformanceRevenue: NumberUtils.formatCurrency(mediumRevenue),
            lowPerformance: low.length,
            lowPerformanceRevenue: NumberUtils.formatCurrency(lowRevenue)
        };
    }

    /**
     * Render grid video
     */
    renderVideosGrid() {
        if (this.filteredData.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-video"></i>
                    <h3>Nessun video trovato</h3>
                    <p>Non ci sono video che corrispondono ai filtri attuali.</p>
                    <button class="btn-primary" onclick="Videos.showAddModal()">
                        <i class="fas fa-plus"></i> Aggiungi Primo Video
                    </button>
                </div>
            `;
        }

        return `
            <div class="videos-grid">
                ${this.filteredData.map(video => this.renderVideoCard(video)).join('')}
            </div>
        `;
    }

    /**
     * Render singola card video
     */
    renderVideoCard(video) {
        const isSelected = this.selectedItems.has(video.id);
        const performanceClass = `performance-${video.performanceLevel}`;

        return `
            <div class="video-card ${performanceClass} ${isSelected ? 'selected' : ''}" data-id="${video.id}">
                <div class="video-header">
                    <input type="checkbox" class="video-select" value="${video.id}" 
                           ${isSelected ? 'checked' : ''} onchange="Videos.toggleSelect('${video.id}', this.checked)">
                    <div class="video-performance">
                        <span class="performance-badge performance-${video.performanceLevel}">
                            ${video.performanceLevel.toUpperCase()}
                        </span>
                    </div>
                </div>
                
                <div class="video-thumbnail">
                    ${video.thumbnailUrl ?
                `<img src="${video.thumbnailUrl}" alt="${video.title}">` :
                `<div class="thumbnail-placeholder"><i class="fas fa-video"></i></div>`
            }
                </div>
                
                <div class="video-content">
                    <h3 class="video-title" title="${video.title}">${video.title}</h3>
                    
                    <div class="video-meta">
                        <span class="video-category">${video.category}</span>
                        <span class="video-date">${DateUtils.formatDate(video.publishDate)}</span>
                        <span class="video-duration">${video.duration || 'N/A'}</span>
                    </div>
                    
                    <div class="video-metrics">
                        <div class="metric">
                            <i class="fas fa-eye"></i>
                            <span>${NumberUtils.formatNumber(video.views || 0)}</span>
                        </div>
                        <div class="metric">
                            <i class="fas fa-mouse-pointer"></i>
                            <span>${video.ctr || 0}%</span>
                        </div>
                        <div class="metric">
                            <i class="fas fa-clock"></i>
                            <span>${video.retention || 0}%</span>
                        </div>
                        <div class="metric revenue">
                            <i class="fas fa-euro-sign"></i>
                            <span>${NumberUtils.formatCurrency(video.totalRevenue)}</span>
                        </div>
                    </div>
                    
                    <div class="video-platforms">
                        ${(video.platforms || []).map(platform => `
                            <span class="platform-tag">${platform}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="video-actions">
                    <button class="btn-icon" onclick="Videos.showEditModal('${video.id}')" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="Videos.showPerformanceModal('${video.id}')" title="Performance">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    ${video.youtubeUrl ? `
                        <a href="${video.youtubeUrl}" target="_blank" class="btn-icon" title="Apri YouTube">
                            <i class="fab fa-youtube"></i>
                        </a>
                    ` : ''}
                    <button class="btn-icon btn-danger" onclick="Videos.deleteVideo('${video.id}')" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Applica filtri
     */
    applyFilters() {
        // Leggi valori filtri dal DOM se esistono
        if (this.container) {
            this.filters.category = document.getElementById('categoryFilter')?.value || '';
            this.filters.performance = document.getElementById('performanceFilter')?.value || '';
            this.filters.platform = document.getElementById('platformFilter')?.value || '';
            this.filters.search = document.getElementById('searchFilter')?.value || '';
            this.filters.dateFrom = document.getElementById('dateFrom')?.value || '';
            this.filters.dateTo = document.getElementById('dateTo')?.value || '';
        }

        this.filteredData = this.currentData.filter(video => {
            // Filtro categoria
            if (this.filters.category && video.category !== this.filters.category) return false;

            // Filtro performance
            if (this.filters.performance && video.performanceLevel !== this.filters.performance) return false;

            // Filtro piattaforma
            if (this.filters.platform && !video.platforms?.includes(this.filters.platform)) return false;

            // Filtro data
            if (this.filters.dateFrom && video.publishDate < this.filters.dateFrom) return false;
            if (this.filters.dateTo && video.publishDate > this.filters.dateTo) return false;

            // Filtro ricerca
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                if (!video.title.toLowerCase().includes(searchTerm)) return false;
            }

            return true;
        });

        this.applySorting();
    }

    /**
     * Applica ordinamento
     */
    applySorting() {
        this.filteredData.sort((a, b) => {
            let aVal = a[this.sortConfig.field];
            let bVal = b[this.sortConfig.field];

            if (this.sortConfig.field === 'publishDate') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (['views', 'ctr', 'retention', 'totalRevenue'].includes(this.sortConfig.field)) {
                aVal = NumberUtils.parseNumber(aVal);
                bVal = NumberUtils.parseNumber(bVal);
            } else {
                aVal = (aVal || '').toString().toLowerCase();
                bVal = (bVal || '').toString().toLowerCase();
            }

            let result = 0;
            if (aVal < bVal) result = -1;
            else if (aVal > bVal) result = 1;

            return this.sortConfig.direction === 'desc' ? -result : result;
        });
    }

    /**
     * Pulisce filtri
     */
    clearFilters() {
        this.filters = {
            category: '',
            dateFrom: '',
            dateTo: '',
            platform: '',
            search: '',
            performance: ''
        };

        this.applyFilters();
        this.render();
    }

    /**
     * Toggle selezione video
     */
    toggleSelect(id, selected) {
        if (selected) {
            this.selectedItems.add(id);
        } else {
            this.selectedItems.delete(id);
        }

        this.updateBulkActions();
    }

    /**
     * Aggiorna azioni bulk
     */
    updateBulkActions() {
        const bulkActions = document.querySelector('.bulk-actions');
        const selectedCount = document.querySelector('.selected-count');

        if (bulkActions && selectedCount) {
            selectedCount.textContent = `${this.selectedItems.size} video selezionati`;
            bulkActions.classList.toggle('visible', this.selectedItems.size > 0);
        }
    }

    /**
     * Mostra modal aggiungi video
     */
    showAddModal() {
        this.showVideoModal();
    }

    /**
     * Mostra modal modifica video
     */
    showEditModal(id) {
        const video = this.currentData.find(v => v.id === id);
        if (!video) {
            NotificationUtils.error('Video non trovato');
            return;
        }

        this.showVideoModal(video);
    }

    /**
     * Mostra modal video (add/edit)
     */
    showVideoModal(video = null) {
        const isEdit = !!video;
        const modal = document.getElementById('modal-container');
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal modal-large">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i>
                        ${isEdit ? 'Modifica Video' : 'Aggiungi Nuovo Video'}
                    </h3>
                    <button class="modal-close" onclick="this.closest('.modal-container').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="videoForm">
                        ${isEdit ? `<input type="hidden" name="id" value="${video.id}">` : ''}
                        
                        <!-- Informazioni Base -->
                        <div class="form-section">
                            <h4>Informazioni Base</h4>
                            
                            <div class="form-group">
                                <label class="form-label">Titolo Video *</label>
                                <input type="text" class="form-input" name="title" 
                                       placeholder="Deep Focus Study Music • 2 Hours" 
                                       value="${isEdit ? video.title : ''}" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Categoria *</label>
                                    <select class="form-select" name="category" required>
                                        <option value="">Seleziona categoria</option>
                                        ${this.categories.map(cat => `
                                            <option value="${cat}" ${isEdit && video.category === cat ? 'selected' : ''}>
                                                ${cat}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Data Pubblicazione *</label>
                                    <input type="date" class="form-input" name="publishDate" 
                                           value="${isEdit ? DateUtils.formatDateForInput(video.publishDate) : DateUtils.formatDateForInput(new Date())}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Durata</label>
                                    <input type="text" class="form-input" name="duration" 
                                           placeholder="2 ore, 120 minuti" 
                                           value="${isEdit ? video.duration || '' : ''}">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Performance Metrics -->
                        <div class="form-section">
                            <h4>Metriche Performance</h4>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Visualizzazioni</label>
                                    <input type="number" class="form-input" name="views" 
                                           min="0" placeholder="0" 
                                           value="${isEdit ? video.views || '' : ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">CTR (%)</label>
                                    <input type="number" class="form-input" name="ctr" 
                                           step="0.1" min="0" max="100" placeholder="4.2" 
                                           value="${isEdit ? video.ctr || '' : ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Retention (%)</label>
                                    <input type="number" class="form-input" name="retention" 
                                           step="0.1" min="0" max="100" placeholder="67" 
                                           value="${isEdit ? video.retention || '' : ''}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Likes</label>
                                    <input type="number" class="form-input" name="likes" 
                                           min="0" placeholder="187" 
                                           value="${isEdit ? video.likes || '' : ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Commenti</label>
                                    <input type="number" class="form-input" name="comments" 
                                           min="0" placeholder="23" 
                                           value="${isEdit ? video.comments || '' : ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Costo Produzione (€)</label>
                                    <input type="number" class="form-input" name="productionCost" 
                                           step="0.01" min="0" placeholder="2.00" 
                                           value="${isEdit ? video.productionCost || '' : ''}">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Piattaforme e Links -->
                        <div class="form-section">
                            <h4>Piattaforme e Links</h4>
                            
                            <div class="form-group">
                                <label class="form-label">Piattaforme</label>
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="platforms" value="YouTube" 
                                               ${isEdit && video.platforms?.includes('YouTube') ? 'checked' : ''}>
                                        YouTube
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="platforms" value="Spotify" 
                                               ${isEdit && video.platforms?.includes('Spotify') ? 'checked' : ''}>
                                        Spotify
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="platforms" value="Apple Music" 
                                               ${isEdit && video.platforms?.includes('Apple Music') ? 'checked' : ''}>
                                        Apple Music
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="platforms" value="Amazon Music" 
                                               ${isEdit && video.platforms?.includes('Amazon Music') ? 'checked' : ''}>
                                        Amazon Music
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">URL YouTube</label>
                                    <input type="url" class="form-input" name="youtubeUrl" 
                                           placeholder="https://youtube.com/watch?v=..." 
                                           value="${isEdit ? video.youtubeUrl || '' : ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">URL Thumbnail</label>
                                    <input type="url" class="form-input" name="thumbnailUrl" 
                                           placeholder="https://..." 
                                           value="${isEdit ? video.thumbnailUrl || '' : ''}">
                                </div>
                            </div>
                        </div>
                        
                        <!-- SEO e Keywords -->
                        <div class="form-section">
                            <h4>SEO e Keywords</h4>
                            
                            <div class="form-group">
                                <label class="form-label">Keywords</label>
                                <input type="text" class="form-input" name="keywords" 
                                       placeholder="study music, focus, concentration (separati da virgola)" 
                                       value="${isEdit ? (video.keywords || []).join(', ') : ''}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Note</label>
                                <textarea class="form-textarea" name="notes" 
                                          placeholder="Note aggiuntive, strategie, risultati...">${isEdit ? video.notes || '' : ''}</textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" 
                            onclick="this.closest('.modal-container').classList.remove('active')">
                        Annulla
                    </button>
                    <button type="submit" class="btn-primary" 
                            onclick="Videos.submitForm(event, ${isEdit})">
                        <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> 
                        ${isEdit ? 'Salva Modifiche' : 'Aggiungi Video'}
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    /**
     * Submit form video
     */
    submitForm(event, isEdit = false) {
        event.preventDefault();

        const form = document.getElementById('videoForm');
        if (!form) return;

        const formData = new FormData(form);

        // Raccogli piattaforme selezionate
        const platforms = [];
        form.querySelectorAll('input[name="platforms"]:checked').forEach(checkbox => {
            platforms.push(checkbox.value);
        });

        // Processa keywords
        const keywordsString = formData.get('keywords') || '';
        const keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k.length > 0);

        const videoData = {
            title: formData.get('title'),
            category: formData.get('category'),
            publishDate: formData.get('publishDate'),
            duration: formData.get('duration'),
            views: NumberUtils.parseNumber(formData.get('views')),
            ctr: NumberUtils.parseNumber(formData.get('ctr')),
            retention: NumberUtils.parseNumber(formData.get('retention')),
            likes: NumberUtils.parseNumber(formData.get('likes')),
            comments: NumberUtils.parseNumber(formData.get('comments')),
            productionCost: NumberUtils.parseNumber(formData.get('productionCost')),
            platforms: platforms,
            youtubeUrl: formData.get('youtubeUrl'),
            thumbnailUrl: formData.get('thumbnailUrl'),
            keywords: keywords,
            notes: formData.get('notes')
        };

        let result;
        if (isEdit) {
            const id = formData.get('id');
            result = this.updateVideo(id, videoData);
        } else {
            result = this.addVideo(videoData);
        }

        if (result) {
            // Chiudi modal
            document.getElementById('modal-container').classList.remove('active');

            // Ricarica dati e refresh
            this.loadData();
            this.render();
        }
    }

    /**
     * Aggiungi nuovo video
     */
    addVideo(videoData) {
        try {
            // Validazione
            if (!ValidationUtils.isNonEmptyString(videoData.title)) {
                throw new Error('Titolo video obbligatorio');
            }
            if (!ValidationUtils.isNonEmptyString(videoData.category)) {
                throw new Error('Categoria obbligatoria');
            }
            if (!ValidationUtils.isValidDate(videoData.publishDate)) {
                throw new Error('Data pubblicazione non valida');
            }

            // Genera ID e metadati
            videoData.id = generateId();
            videoData.createdAt = new Date().toISOString();
            videoData.updatedAt = new Date().toISOString();

            // Aggiungi ai dati correnti
            this.currentData.push(videoData);

            // Salva nel localStorage
            if (StorageUtils.save('mbt_videos_data', this.currentData)) {
                NotificationUtils.success(`Video "${videoData.title}" aggiunto`);
                return videoData;
            }

            throw new Error('Errore nel salvataggio');
        } catch (error) {
            handleError(error, 'Errore aggiunta video');
            return null;
        }
    }

    /**
     * Aggiorna video esistente
     */
    updateVideo(id, updateData) {
        try {
            const index = this.currentData.findIndex(v => v.id === id);
            if (index === -1) {
                throw new Error('Video non trovato');
            }

            // Aggiorna record
            const updatedVideo = {
                ...this.currentData[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            this.currentData[index] = updatedVideo;

            // Salva
            if (StorageUtils.save('mbt_videos_data', this.currentData)) {
                NotificationUtils.success('Video aggiornato');
                return updatedVideo;
            }

            throw new Error('Errore nel salvataggio');
        } catch (error) {
            handleError(error, 'Errore aggiornamento video');
            return null;
        }
    }

    /**
     * Elimina video
     */
    deleteVideo(id) {
        const video = this.currentData.find(v => v.id === id);
        if (!video) return;

        if (confirm(`Sei sicuro di voler eliminare il video "${video.title}"?`)) {
            try {
                const index = this.currentData.findIndex(v => v.id === id);
                this.currentData.splice(index, 1);

                if (StorageUtils.save('mbt_videos_data', this.currentData)) {
                    this.selectedItems.delete(id);
                    this.loadData();
                    this.render();
                    NotificationUtils.success('Video eliminato');
                }
            } catch (error) {
                handleError(error, 'Errore eliminazione video');
            }
        }
    }

    /**
     * Elimina video selezionati
     */
    deleteSelected() {
        if (this.selectedItems.size === 0) return;

        if (confirm(`Sei sicuro di voler eliminare ${this.selectedItems.size} video selezionati?`)) {
            let deletedCount = 0;

            this.selectedItems.forEach(id => {
                const index = this.currentData.findIndex(v => v.id === id);
                if (index !== -1) {
                    this.currentData.splice(index, 1);
                    deletedCount++;
                }
            });

            if (StorageUtils.save('mbt_videos_data', this.currentData)) {
                this.selectedItems.clear();
                this.loadData();
                this.render();
                NotificationUtils.success(`${deletedCount} video eliminati`);
            }
        }
    }

    /**
     * Mostra modal performance dettagliata
     */
    showPerformanceModal(id) {
        const video = this.currentData.find(v => v.id === id);
        if (!video) return;

        const modal = document.getElementById('modal-container');
        if (!modal) return;

        // Calcola revenue collegata
        const relatedRevenue = DB.getAllRevenue().filter(r =>
            r.videoTitle && r.videoTitle.toLowerCase().includes(video.title.toLowerCase())
        );

        modal.innerHTML = `
            <div class="modal modal-large">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <i class="fas fa-chart-line"></i>
                        Performance: ${video.title}
                    </h3>
                    <button class="modal-close" onclick="this.closest('.modal-container').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="performance-overview">
                        <div class="performance-score">
                            <div class="score-badge performance-${video.performanceLevel}">
                                ${video.performanceLevel.toUpperCase()} PERFORMANCE
                            </div>
                        </div>
                        
                        <div class="metrics-grid">
                            <div class="metric-card">
                                <div class="metric-label">Visualizzazioni</div>
                                <div class="metric-value">${NumberUtils.formatNumber(video.views || 0)}</div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-label">CTR</div>
                                <div class="metric-value">${video.ctr || 0}%</div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-label">Retention</div>
                                <div class="metric-value">${video.retention || 0}%</div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-label">Revenue Totale</div>
                                <div class="metric-value">${NumberUtils.formatCurrency(video.totalRevenue)}</div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-label">Revenue per 1000 Views</div>
                                <div class="metric-value">${NumberUtils.formatCurrency(video.revenuePerView)}</div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-label">ROI</div>
                                <div class="metric-value">${video.roi ? video.roi.toFixed(1) + '%' : 'N/A'}</div>
                            </div>
                        </div>
                        
                        ${relatedRevenue.length > 0 ? `
                            <div class="revenue-breakdown">
                                <h4>Revenue Breakdown</h4>
                                <div class="revenue-list">
                                    ${relatedRevenue.map(r => `
                                        <div class="revenue-item">
                                            <span class="revenue-date">${DateUtils.formatDate(r.date)}</span>
                                            <span class="revenue-platform">${r.platform}</span>
                                            <span class="revenue-amount">${NumberUtils.formatCurrency(r.amount)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" 
                            onclick="this.closest('.modal-container').classList.remove('active')">
                        Chiudi
                    </button>
                    <button type="button" class="btn-primary" 
                            onclick="Videos.showEditModal('${video.id}')">
                        <i class="fas fa-edit"></i> Modifica Video
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    /**
     * Bulk update categoria
     */
    bulkUpdateCategory() {
        if (this.selectedItems.size === 0) return;

        const newCategory = prompt(
            'Seleziona nuova categoria:\n' +
            this.categories.map((cat, i) => `${i + 1}. ${cat}`).join('\n') +
            '\n\nInserisci il numero della categoria:'
        );

        const categoryIndex = parseInt(newCategory) - 1;
        if (categoryIndex >= 0 && categoryIndex < this.categories.length) {
            const selectedCategory = this.categories[categoryIndex];

            this.selectedItems.forEach(id => {
                const video = this.currentData.find(v => v.id === id);
                if (video) {
                    video.category = selectedCategory;
                    video.updatedAt = new Date().toISOString();
                }
            });

            if (StorageUtils.save('mbt_videos_data', this.currentData)) {
                this.selectedItems.clear();
                this.loadData();
                this.render();
                NotificationUtils.success(`Categoria aggiornata a "${selectedCategory}"`);
            }
        }
    }

    /**
     * Sincronizza con revenue
     */
    syncWithRevenue() {
        try {
            this.calculatePerformanceMetrics();

            if (StorageUtils.save('mbt_videos_data', this.currentData)) {
                this.render();
                NotificationUtils.success('Sincronizzazione completata');
            }
        } catch (error) {
            handleError(error, 'Errore sincronizzazione');
        }
    }

    /**
     * Export dati video
     */
    exportData() {
        const exportData = this.filteredData.map(video => ({
            'Titolo': video.title,
            'Categoria': video.category,
            'Data Pubblicazione': DateUtils.formatDate(video.publishDate),
            'Durata': video.duration || '',
            'Visualizzazioni': video.views || 0,
            'CTR (%)': video.ctr || 0,
            'Retention (%)': video.retention || 0,
            'Likes': video.likes || 0,
            'Commenti': video.comments || 0,
            'Revenue Totale': video.totalRevenue,
            'Revenue per 1000 Views': video.revenuePerView.toFixed(2),
            'ROI (%)': video.roi ? video.roi.toFixed(1) : '',
            'Performance Level': video.performanceLevel,
            'Piattaforme': (video.platforms || []).join(', '),
            'URL YouTube': video.youtubeUrl || '',
            'Keywords': (video.keywords || []).join(', '),
            'Note': video.notes || ''
        }));

        const filename = `videos-export-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.csv`;
        ExportUtils.exportCSV(exportData, filename);
    }

    /**
     * Render pagination
     */
    renderPagination() {
        return `
            <div class="pagination-info">
                Visualizzati ${this.filteredData.length} di ${this.currentData.length} video
            </div>
        `;
    }

    /**
     * Bind eventi
     */
    bindEvents() {
        // Filtri real-time
        document.addEventListener('input', debounce((e) => {
            if (e.target.classList.contains('filter-input')) {
                this.applyFilters();
                this.render();
            }
        }, 300));
    }

    /**
     * Bind eventi video specifici
     */
    bindVideoEvents() {
        // Eventi gestiti tramite onclick inline per semplicità
    }

    /**
     * Render errore
     */
    renderError() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--accent-danger); margin-bottom: 1rem;"></i>
                    <h3>Errore Caricamento Video</h3>
                    <p class="text-muted">Si è verificato un errore durante il caricamento dei video.</p>
                    <button class="btn-primary" onclick="Videos.render()">
                        <i class="fas fa-refresh"></i> Riprova
                    </button>
                </div>
            </div>
        `;
    }
}

// CSS aggiuntivo per video components
const videosCSS = `
<style>
.videos-controls {
    margin-bottom: var(--spacing-xl);
}

.performance-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.stat-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
}

.stat-card.high-performance {
    border-left: 4px solid var(--accent-primary);
}

.stat-card.medium-performance {
    border-left: 4px solid var(--accent-warning);
}

.stat-card.low-performance {
    border-left: 4px solid var(--accent-danger);
}

.stat-icon {
    font-size: var(--font-size-xl);
    width: 48px;
    text-align: center;
}

.stat-card.high-performance .stat-icon {
    color: var(--accent-primary);
}

.stat-card.medium-performance .stat-icon {
    color: var(--accent-warning);
}

.stat-card.low-performance .stat-icon {
    color: var(--accent-danger);
}

.stat-content {
    flex: 1;
}

.stat-content .stat-value {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
    display: block;
    margin-bottom: var(--spacing-xs);
}

.stat-content .stat-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--spacing-xs);
}

.stat-content .stat-detail {
    font-size: var(--font-size-sm);
    color: var(--accent-primary);
    font-weight: 600;
}

.videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--spacing-lg);
}

.video-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    overflow: hidden;
    transition: var(--transition-fast);
    position: relative;
}

.video-card:hover {
    border-color: var(--accent-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-card.selected {
    border-color: var(--accent-primary);
    background-color: rgba(46, 160, 67, 0.05);
}

.video-card.performance-high {
    border-left: 4px solid var(--accent-primary);
}

.video-card.performance-medium {
    border-left: 4px solid var(--accent-warning);
}

.video-card.performance-low {
    border-left: 4px solid var(--accent-danger);
}

.video-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm);
    background-color: var(--bg-tertiary);
}

.video-performance {
    margin-left: auto;
}

.performance-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 4px;
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
}

.performance-badge.performance-high {
    background-color: rgba(46, 160, 67, 0.1);
    color: var(--accent-primary);
}

.performance-badge.performance-medium {
    background-color: rgba(210, 153, 34, 0.1);
    color: var(--accent-warning);
}

.performance-badge.performance-low {
    background-color: rgba(218, 54, 51, 0.1);
    color: var(--accent-danger);
}

.video-thumbnail {
    height: 120px;
    background-color: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.video-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.thumbnail-placeholder {
    color: var(--text-muted);
    font-size: 2rem;
}

.video-content {
    padding: var(--spacing-md);
}

.video-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
}

.video-meta {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.video-category {
    background-color: var(--bg-tertiary);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 4px;
    font-weight: 500;
}

.video-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.metric {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.metric.revenue {
    color: var(--accent-primary);
    font-weight: 600;
}

.video-platforms {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
}

.platform-tag {
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--bg-tertiary);
    border-radius: 4px;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.video-actions {
    display: flex;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border-top: 1px solid var(--border-secondary);
}

.modal-large {
    max-width: 800px;
    width: 95%;
}

.form-section {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-secondary);
}

.form-section:last-child {
    border-bottom: none;
}

.form-section h4 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-lg);
}

.checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-sm);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-sm);
    cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
    margin: 0;
}

.performance-overview {
    text-align: center;
}

.performance-score {
    margin-bottom: var(--spacing-xl);
}

.score-badge {
    display: inline-block;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: 8px;
    font-size: var(--font-size-lg);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.metric-card {
    text-align: center;
    padding: var(--spacing-lg);
    background-color: var(--bg-tertiary);
    border-radius: 6px;
}

.metric-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
}

.metric-value {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
}

.revenue-breakdown {
    text-align: left;
}

.revenue-breakdown h4 {
    margin-bottom: var(--spacing-md);
    color: var(--text-primary);
}

.revenue-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.revenue-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm);
    background-color: var(--bg-tertiary);
    border-radius: 4px;
}

.revenue-date {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.revenue-platform {
    font-size: var(--font-size-sm);
    color: var(--text-primary);
}

.revenue-amount {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--accent-primary);
}

@media (max-width: 768px) {
    .videos-grid {
        grid-template-columns: 1fr;
    }
    
    .performance-stats {
        grid-template-columns: 1fr;
    }
    
    .video-metrics {
        grid-template-columns: 1fr;
    }
    
    .metrics-grid {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', videosCSS);

// Inizializza videos manager globale
const Videos = new VideosManager();

// Export per uso globale
window.Videos = Videos;