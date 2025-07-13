/**
 * 💰 MUSIC BUSINESS TRACKER - REVENUE.JS
 * Gestione completa delle entrate revenue
 */

class RevenueManager {
    constructor() {
        this.container = null;
        this.currentData = [];
        this.filteredData = [];
        this.filters = {
            dateFrom: '',
            dateTo: '',
            platform: '',
            amountMin: '',
            amountMax: '',
            search: ''
        };
        this.sortConfig = {
            field: 'date',
            direction: 'desc'
        };
        this.selectedItems = new Set();
        this.init();
    }

    /**
     * Inizializza revenue manager
     */
    init() {
        this.container = document.getElementById('revenue-content');
        if (!this.container) {
            console.error('Container revenue non trovato');
            return;
        }

        this.loadData();
        this.render();
        this.bindEvents();
    }

    /**
     * Carica dati dal database
     */
    loadData() {
        this.currentData = DB.getAllRevenue();
        this.applyFilters();
    }

    /**
     * Render completo sezione revenue
     */
    render() {
        if (!this.container) return;

        try {
            this.container.innerHTML = `
                <!-- 🔍 FILTRI E CONTROLLI -->
                <div class="revenue-controls">
                    ${this.renderFilters()}
                    ${this.renderActions()}
                </div>

                <!-- 📊 STATISTICHE PERIODO -->
                <div class="revenue-stats">
                    ${this.renderPeriodStats()}
                </div>

                <!-- 📋 TABELLA ENTRATE -->
                <div class="revenue-table-container">
                    ${this.renderTable()}
                </div>

                <!-- 📄 PAGINATION -->
                <div class="revenue-pagination">
                    ${this.renderPagination()}
                </div>
            `;

            this.bindTableEvents();
        } catch (error) {
            handleError(error, 'Errore rendering revenue');
            this.renderError();
        }
    }

    /**
     * Render filtri
     */
    renderFilters() {
        const platforms = [...new Set(this.currentData.map(item => item.platform))];

        return `
            <div class="filters-section">
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
                               id="searchFilter" placeholder="Video, note..." value="${this.filters.search}">
                    </div>
                </div>
                
                <div class="filters-row">
                    <div class="filter-group">
                        <label class="filter-label">Importo min (€)</label>
                        <input type="number" class="form-input filter-input" 
                               id="amountMin" step="0.01" placeholder="0.00" value="${this.filters.amountMin}">
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">Importo max (€)</label>
                        <input type="number" class="form-input filter-input" 
                               id="amountMax" step="0.01" placeholder="1000.00" value="${this.filters.amountMax}">
                    </div>
                    
                    <div class="filter-actions">
                        <button class="btn-primary" onclick="Revenue.applyFilters()">
                            <i class="fas fa-search"></i> Applica
                        </button>
                        <button class="btn-secondary" onclick="Revenue.clearFilters()">
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
                    <span class="selected-count">${selectedCount} elementi selezionati</span>
                    <button class="btn-secondary btn-sm" onclick="Revenue.exportSelected()">
                        <i class="fas fa-download"></i> Esporta Selezionati
                    </button>
                    <button class="btn-danger btn-sm" onclick="Revenue.deleteSelected()">
                        <i class="fas fa-trash"></i> Elimina Selezionati
                    </button>
                </div>
                
                <div class="main-actions">
                    <button class="btn-secondary" onclick="Revenue.exportCSV()">
                        <i class="fas fa-file-csv"></i> Export CSV
                    </button>
                    <button class="btn-secondary" onclick="Revenue.exportJSON()">
                        <i class="fas fa-file-code"></i> Export JSON
                    </button>
                    <button class="btn-primary" onclick="Revenue.showAddModal()">
                        <i class="fas fa-plus"></i> Aggiungi Entrata
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render statistiche periodo
     */
    renderPeriodStats() {
        const total = this.filteredData.reduce((sum, item) => sum + item.amount, 0);
        const count = this.filteredData.length;
        const average = count > 0 ? total / count : 0;

        // Raggruppa per piattaforma
        const byPlatform = {};
        this.filteredData.forEach(item => {
            if (!byPlatform[item.platform]) {
                byPlatform[item.platform] = { count: 0, total: 0 };
            }
            byPlatform[item.platform].count++;
            byPlatform[item.platform].total += item.amount;
        });

        const topPlatform = Object.entries(byPlatform)
            .sort((a, b) => b[1].total - a[1].total)[0];

        return `
            <div class="period-stats">
                <div class="stat-item">
                    <div class="stat-value">${NumberUtils.formatCurrency(total)}</div>
                    <div class="stat-label">Totale Periodo</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-value">${count}</div>
                    <div class="stat-label">Entrate</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-value">${NumberUtils.formatCurrency(average)}</div>
                    <div class="stat-label">Media per Entrata</div>
                </div>
                
                ${topPlatform ? `
                    <div class="stat-item">
                        <div class="stat-value">${topPlatform[0]}</div>
                        <div class="stat-label">Top Piattaforma</div>
                        <div class="stat-detail">${NumberUtils.formatCurrency(topPlatform[1].total)}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render tabella entrate
     */
    renderTable() {
        if (this.filteredData.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>Nessuna entrata trovata</h3>
                    <p>Non ci sono entrate che corrispondono ai filtri attuali.</p>
                    <button class="btn-primary" onclick="Revenue.showAddModal()">
                        <i class="fas fa-plus"></i> Aggiungi Prima Entrata
                    </button>
                </div>
            `;
        }

        return `
            <div class="table-container">
                <table class="table revenue-table">
                    <thead>
                        <tr>
                            <th class="select-col">
                                <input type="checkbox" id="selectAll" onchange="Revenue.toggleSelectAll(this.checked)">
                            </th>
                            <th class="sortable ${this.sortConfig.field === 'date' ? 'sorted ' + this.sortConfig.direction : ''}" 
                                data-field="date">
                                Data <i class="fas fa-sort"></i>
                            </th>
                            <th class="sortable ${this.sortConfig.field === 'platform' ? 'sorted ' + this.sortConfig.direction : ''}" 
                                data-field="platform">
                                Piattaforma <i class="fas fa-sort"></i>
                            </th>
                            <th class="sortable ${this.sortConfig.field === 'amount' ? 'sorted ' + this.sortConfig.direction : ''}" 
                                data-field="amount">
                                Importo <i class="fas fa-sort"></i>
                            </th>
                            <th>Video/Track</th>
                            <th>Note</th>
                            <th class="actions-col">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredData.map(item => this.renderTableRow(item)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Render singola riga tabella
     */
    renderTableRow(item) {
        const isSelected = this.selectedItems.has(item.id);

        return `
            <tr class="revenue-row ${isSelected ? 'selected' : ''}" data-id="${item.id}">
                <td class="select-col">
                    <input type="checkbox" class="row-select" value="${item.id}" 
                           ${isSelected ? 'checked' : ''} onchange="Revenue.toggleSelect('${item.id}', this.checked)">
                </td>
                <td class="date-col">
                    <span class="date-value">${DateUtils.formatDate(item.date)}</span>
                </td>
                <td class="platform-col">
                    <span class="platform-badge">${item.platform}</span>
                </td>
                <td class="amount-col">
                    <span class="amount-value">${NumberUtils.formatCurrency(item.amount)}</span>
                </td>
                <td class="video-col">
                    <span class="video-title" title="${item.videoTitle || ''}">${item.videoTitle || '-'}</span>
                </td>
                <td class="notes-col">
                    <span class="notes-text" title="${item.notes || ''}">${item.notes || '-'}</span>
                </td>
                <td class="actions-col">
                    <div class="row-actions">
                        <button class="btn-icon" onclick="Revenue.showEditModal('${item.id}')" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="Revenue.deleteItem('${item.id}')" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Render pagination (se necessaria)
     */
    renderPagination() {
        // Per ora pagination semplice, implementabile in futuro
        return `
            <div class="pagination-info">
                Visualizzati ${this.filteredData.length} di ${this.currentData.length} elementi
            </div>
        `;
    }

    /**
     * Applica filtri ai dati
     */
    applyFilters() {
        // Leggi valori filtri dal DOM se esistono
        if (this.container) {
            this.filters.dateFrom = document.getElementById('dateFrom')?.value || '';
            this.filters.dateTo = document.getElementById('dateTo')?.value || '';
            this.filters.platform = document.getElementById('platformFilter')?.value || '';
            this.filters.search = document.getElementById('searchFilter')?.value || '';
            this.filters.amountMin = document.getElementById('amountMin')?.value || '';
            this.filters.amountMax = document.getElementById('amountMax')?.value || '';
        }

        this.filteredData = this.currentData.filter(item => {
            // Filtro data
            if (this.filters.dateFrom && item.date < this.filters.dateFrom) return false;
            if (this.filters.dateTo && item.date > this.filters.dateTo) return false;

            // Filtro piattaforma
            if (this.filters.platform && item.platform !== this.filters.platform) return false;

            // Filtro importo
            if (this.filters.amountMin && item.amount < NumberUtils.parseNumber(this.filters.amountMin)) return false;
            if (this.filters.amountMax && item.amount > NumberUtils.parseNumber(this.filters.amountMax)) return false;

            // Filtro ricerca (video title + notes)
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const searchText = `${item.videoTitle || ''} ${item.notes || ''}`.toLowerCase();
                if (!searchText.includes(searchTerm)) return false;
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

            // Gestione valori speciali
            if (this.sortConfig.field === 'amount') {
                aVal = NumberUtils.parseNumber(aVal);
                bVal = NumberUtils.parseNumber(bVal);
            } else if (this.sortConfig.field === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
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
            dateFrom: '',
            dateTo: '',
            platform: '',
            amountMin: '',
            amountMax: '',
            search: ''
        };

        this.applyFilters();
        this.render();
    }

    /**
     * Cambia ordinamento
     */
    setSorting(field) {
        if (this.sortConfig.field === field) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.field = field;
            this.sortConfig.direction = 'asc';
        }

        this.applySorting();
        this.render();
    }

    /**
     * Toggle selezione elemento
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
     * Toggle seleziona tutti
     */
    toggleSelectAll(selected) {
        this.selectedItems.clear();

        if (selected) {
            this.filteredData.forEach(item => {
                this.selectedItems.add(item.id);
            });
        }

        this.render();
    }

    /**
     * Aggiorna azioni bulk
     */
    updateBulkActions() {
        const bulkActions = document.querySelector('.bulk-actions');
        const selectedCount = document.querySelector('.selected-count');

        if (bulkActions && selectedCount) {
            selectedCount.textContent = `${this.selectedItems.size} elementi selezionati`;
            bulkActions.classList.toggle('visible', this.selectedItems.size > 0);
        }
    }

    /**
     * Mostra modal aggiungi
     */
    showAddModal() {
        this.showRevenueModal();
    }

    /**
     * Mostra modal modifica
     */
    showEditModal(id) {
        const item = DB.getRevenueById(id);
        if (!item) {
            NotificationUtils.error('Entrata non trovata');
            return;
        }

        this.showRevenueModal(item);
    }

    /**
     * Mostra modal revenue (add/edit)
     */
    showRevenueModal(item = null) {
        const isEdit = !!item;
        const modal = document.getElementById('modal-container');
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i>
                        ${isEdit ? 'Modifica Entrata' : 'Aggiungi Nuova Entrata'}
                    </h3>
                    <button class="modal-close" onclick="this.closest('.modal-container').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="revenueForm">
                        ${isEdit ? `<input type="hidden" name="id" value="${item.id}">` : ''}
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Data *</label>
                                <input type="date" class="form-input" name="date" 
                                       value="${isEdit ? DateUtils.formatDateForInput(item.date) : DateUtils.formatDateForInput(new Date())}" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Importo (€) *</label>
                                <input type="number" class="form-input" name="amount" 
                                       step="0.01" min="0" placeholder="0.00" 
                                       value="${isEdit ? item.amount : ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Piattaforma *</label>
                            <select class="form-select" name="platform" required>
                                <option value="">Seleziona piattaforma</option>
                                <option value="YouTube AdSense" ${isEdit && item.platform === 'YouTube AdSense' ? 'selected' : ''}>YouTube AdSense</option>
                                <option value="YouTube Music" ${isEdit && item.platform === 'YouTube Music' ? 'selected' : ''}>YouTube Music</option>
                                <option value="Spotify" ${isEdit && item.platform === 'Spotify' ? 'selected' : ''}>Spotify</option>
                                <option value="Apple Music" ${isEdit && item.platform === 'Apple Music' ? 'selected' : ''}>Apple Music</option>
                                <option value="Amazon Music" ${isEdit && item.platform === 'Amazon Music' ? 'selected' : ''}>Amazon Music</option>
                                <option value="Deezer" ${isEdit && item.platform === 'Deezer' ? 'selected' : ''}>Deezer</option>
                                <option value="Tidal" ${isEdit && item.platform === 'Tidal' ? 'selected' : ''}>Tidal</option>
                                <option value="Altre piattaforme" ${isEdit && item.platform === 'Altre piattaforme' ? 'selected' : ''}>Altre piattaforme</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Video/Track</label>
                            <input type="text" class="form-input" name="videoTitle" 
                                   placeholder="Titolo del video o traccia" 
                                   value="${isEdit ? item.videoTitle || '' : ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Note</label>
                            <textarea class="form-textarea" name="notes" 
                                      placeholder="Note aggiuntive...">${isEdit ? item.notes || '' : ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" 
                            onclick="this.closest('.modal-container').classList.remove('active')">
                        Annulla
                    </button>
                    <button type="submit" class="btn-primary" 
                            onclick="Revenue.submitForm(event, ${isEdit})">
                        <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> 
                        ${isEdit ? 'Salva Modifiche' : 'Aggiungi Entrata'}
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    /**
     * Submit form revenue
     */
    submitForm(event, isEdit = false) {
        event.preventDefault();

        const form = document.getElementById('revenueForm');
        if (!form) return;

        const formData = new FormData(form);
        const revenueData = {
            date: formData.get('date'),
            platform: formData.get('platform'),
            amount: formData.get('amount'),
            videoTitle: formData.get('videoTitle'),
            notes: formData.get('notes')
        };

        let result;
        if (isEdit) {
            const id = formData.get('id');
            result = DB.updateRevenue(id, revenueData);
        } else {
            result = DB.addRevenue(revenueData);
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
     * Elimina elemento singolo
     */
    deleteItem(id) {
        const item = DB.getRevenueById(id);
        if (!item) return;

        if (confirm(`Sei sicuro di voler eliminare l'entrata di ${NumberUtils.formatCurrency(item.amount)} da ${item.platform}?`)) {
            const result = DB.deleteRevenue(id);
            if (result) {
                this.selectedItems.delete(id);
                this.loadData();
                this.render();
            }
        }
    }

    /**
     * Elimina elementi selezionati
     */
    deleteSelected() {
        if (this.selectedItems.size === 0) return;

        if (confirm(`Sei sicuro di voler eliminare ${this.selectedItems.size} entrate selezionate?`)) {
            let deletedCount = 0;

            this.selectedItems.forEach(id => {
                if (DB.deleteRevenue(id)) {
                    deletedCount++;
                }
            });

            this.selectedItems.clear();
            this.loadData();
            this.render();

            NotificationUtils.success(`${deletedCount} entrate eliminate`);
        }
    }

    /**
     * Export CSV
     */
    exportCSV() {
        const headers = ['Data', 'Piattaforma', 'Importo', 'Video/Track', 'Note'];
        const csvData = this.filteredData.map(item => ({
            'Data': DateUtils.formatDate(item.date),
            'Piattaforma': item.platform,
            'Importo': item.amount,
            'Video/Track': item.videoTitle || '',
            'Note': item.notes || ''
        }));

        const filename = `revenue-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.csv`;
        ExportUtils.exportCSV(csvData, filename, headers);
    }

    /**
     * Export JSON
     */
    exportJSON() {
        const filename = `revenue-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.json`;
        ExportUtils.exportJSON(this.filteredData, filename);
    }

    /**
     * Export elementi selezionati
     */
    exportSelected() {
        if (this.selectedItems.size === 0) {
            NotificationUtils.warning('Nessun elemento selezionato');
            return;
        }

        const selectedData = this.filteredData.filter(item => this.selectedItems.has(item.id));
        const filename = `revenue-selected-${DateUtils.formatDate(new Date()).replace(/\//g, '-')}.json`;
        ExportUtils.exportJSON(selectedData, filename);
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
     * Bind eventi tabella
     */
    bindTableEvents() {
        // Ordinamento colonne
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const field = header.dataset.field;
                this.setSorting(field);
            });
        });
    }

    /**
     * Render errore
     */
    renderError() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--accent-danger); margin-bottom: 1rem;"></i>
                    <h3>Errore Caricamento Revenue</h3>
                    <p class="text-muted">Si è verificato un errore durante il caricamento dei dati.</p>
                    <button class="btn-primary" onclick="Revenue.render()">
                        <i class="fas fa-refresh"></i> Riprova
                    </button>
                </div>
            </div>
        `;
    }
}

// CSS aggiuntivo per revenue components
const revenueCSS = `
<style>
.revenue-controls {
    margin-bottom: var(--spacing-xl);
}

.filters-section {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
}

.filters-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    align-items: end;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.filter-label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--text-primary);
}

.filter-actions {
    display: flex;
    gap: var(--spacing-sm);
}

.actions-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
}

.bulk-actions {
    display: none;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--bg-tertiary);
    border-radius: 6px;
}

.bulk-actions.visible {
    display: flex;
}

.selected-count {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.main-actions {
    display: flex;
    gap: var(--spacing-md);
}

.btn-sm {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
}

.revenue-stats {
    margin-bottom: var(--spacing-lg);
}

.period-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
}

.stat-item {
    text-align: center;
}

.stat-item .stat-value {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--accent-primary);
    display: block;
    margin-bottom: var(--spacing-xs);
}

.stat-item .stat-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-item .stat-detail {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    margin-top: var(--spacing-xs);
}

.revenue-table-container {
    margin-bottom: var(--spacing-lg);
}

.revenue-table {
    width: 100%;
}

.revenue-table th.sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
}

.revenue-table th.sortable:hover {
    background-color: var(--bg-hover);
}

.revenue-table th.sortable.sorted.asc i::before {
    content: "\\f0de";
}

.revenue-table th.sortable.sorted.desc i::before {
    content: "\\f0dd";
}

.revenue-table th.select-col,
.revenue-table td.select-col {
    width: 40px;
    text-align: center;
}

.revenue-table th.actions-col,
.revenue-table td.actions-col {
    width: 100px;
    text-align: center;
}

.revenue-row.selected {
    background-color: rgba(46, 160, 67, 0.1);
}

.platform-badge {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--bg-tertiary);
    border-radius: 4px;
    font-size: var(--font-size-sm);
    font-weight: 500;
}

.amount-value {
    font-weight: 600;
    color: var(--accent-primary);
}

.video-title,
.notes-text {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
}

.row-actions {
    display: flex;
    gap: var(--spacing-xs);
    justify-content: center;
}

.btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition-fast);
}

.btn-icon:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
}

.btn-icon.btn-danger:hover {
    background-color: var(--accent-danger);
    color: white;
}

.empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);
}

.empty-state i {
    font-size: 4rem;
    color: var(--text-muted);
    margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

.pagination-info {
    text-align: center;
    padding: var(--spacing-md);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
}

@media (max-width: 768px) {
    .filters-row {
        grid-template-columns: 1fr;
    }
    
    .actions-section {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
    }
    
    .bulk-actions {
        order: 2;
    }
    
    .main-actions {
        order: 1;
        justify-content: center;
    }
    
    .period-stats {
        grid-template-columns: 1fr 1fr;
    }
    
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .revenue-table {
        font-size: var(--font-size-sm);
    }
    
    .video-title,
    .notes-text {
        max-width: 120px;
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', revenueCSS);

// Inizializza revenue manager globale
const Revenue = new RevenueManager();

// Export per uso globale
window.Revenue = Revenue;