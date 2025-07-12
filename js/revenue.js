/**
 * MUSIC BUSINESS TRACKER - REVENUE MODULE
 * Complete revenue management with CRUD operations, filtering, and export
 */

class RevenueModule {
    constructor() {
        this.isInitialized = false;
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalItems = 0;
        this.sortBy = 'date';
        this.sortOrder = 'desc';
        this.filters = {
            search: '',
            platform: '',
            dateRange: '',
            category: '',
            minAmount: '',
            maxAmount: ''
        };
        this.selectedItems = new Set();
        this.revenueData = [];
        this.platforms = ['YouTube AdSense', 'YouTube Music', 'Spotify', 'Apple Music', 'Amazon Music', 'Altri'];
        this.categories = ['Video Revenue', 'Streaming', 'Licensing', 'Sponsorship', 'Merchandise', 'Altri'];
    }

    /**
     * Initialize revenue module
     */
    async init() {
        if (this.isInitialized) return;

        console.log('💰 Initializing Revenue Module...');

        try {
            // Build revenue UI
            await this.buildRevenueUI();

            // Load revenue data
            await this.loadRevenueData();

            // Setup event listeners
            this.setupEventListeners();

            // Render initial data
            this.renderRevenueTable();
            this.updateStats();

            this.isInitialized = true;
            console.log('✅ Revenue Module initialized');

        } catch (error) {
            console.error('❌ Revenue initialization failed:', error);
            this.showError('Errore inizializzazione modulo revenue');
        }
    }

    /**
     * Build revenue UI
     */
    async buildRevenueUI() {
        const container = document.getElementById('revenue-section');
        if (!container) return;

        container.innerHTML = `
            <div class="revenue-container">
                <!-- Revenue Header -->
                <div class="revenue-header">
                    <div>
                        <h2 class="revenue-title">Gestione Entrate</h2>
                        <p class="revenue-subtitle">Traccia e analizza tutte le tue entrate musicali</p>
                    </div>
                    <div class="revenue-stats">
                        <div class="revenue-stat">
                            <span class="revenue-stat-value" id="total-revenue">€0.00</span>
                            <span class="revenue-stat-label">Totale</span>
                        </div>
                        <div class="revenue-stat">
                            <span class="revenue-stat-value" id="month-revenue">€0.00</span>
                            <span class="revenue-stat-label">Questo Mese</span>
                        </div>
                        <div class="revenue-stat">
                            <span class="revenue-stat-value" id="avg-revenue">€0.00</span>
                            <span class="revenue-stat-label">Media Mensile</span>
                        </div>
                    </div>
                </div>
                
                <!-- Revenue Toolbar -->
                <div class="revenue-toolbar">
                    <div class="toolbar-left">
                        <div class="search-container">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" class="search-input" placeholder="Cerca entrate..." id="search-input">
                        </div>
                        
                        <div class="filter-dropdown" id="platform-filter">
                            <button class="filter-btn">
                                <i class="fas fa-filter"></i>
                                <span>Piattaforma</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="filter-dropdown-menu">
                                <div class="filter-option" data-value="">Tutte le piattaforme</div>
                                ${this.platforms.map(platform => `
                                    <div class="filter-option" data-value="${platform}">${platform}</div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="filter-dropdown" id="date-filter">
                            <button class="filter-btn">
                                <i class="fas fa-calendar"></i>
                                <span>Periodo</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="filter-dropdown-menu">
                                <div class="filter-option" data-value="">Tutti i periodi</div>
                                <div class="filter-option" data-value="today">Oggi</div>
                                <div class="filter-option" data-value="week">Questa settimana</div>
                                <div class="filter-option" data-value="month">Questo mese</div>
                                <div class="filter-option" data-value="quarter">Questo trimestre</div>
                                <div class="filter-option" data-value="year">Quest'anno</div>
                            </div>
                        </div>
                        
                        <div class="filter-dropdown" id="category-filter">
                            <button class="filter-btn">
                                <i class="fas fa-tag"></i>
                                <span>Categoria</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="filter-dropdown-menu">
                                <div class="filter-option" data-value="">Tutte le categorie</div>
                                ${this.categories.map(category => `
                                    <div class="filter-option" data-value="${category}">${category}</div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="toolbar-right">
                        <button class="btn-secondary" onclick="RevenueModule.clearFilters()">
                            <i class="fas fa-times"></i>
                            Pulisci Filtri
                        </button>
                        <button class="btn-secondary" onclick="RevenueModule.exportCSV()">
                            <i class="fas fa-download"></i>
                            Export CSV
                        </button>
                        <button class="btn-primary" onclick="RevenueModule.openAddModal()">
                            <i class="fas fa-plus"></i>
                            Aggiungi Entrata
                        </button>
                    </div>
                </div>
                
                <!-- Bulk Actions Bar -->
                <div class="bulk-actions" id="bulk-actions">
                    <span class="bulk-info"><span id="selected-count">0</span> elementi selezionati</span>
                    <div class="bulk-actions-buttons">
                        <button class="bulk-btn" onclick="RevenueModule.bulkExport()">
                            <i class="fas fa-download"></i>
                            Export Selezionati
                        </button>
                        <button class="bulk-btn" onclick="RevenueModule.bulkEdit()">
                            <i class="fas fa-edit"></i>
                            Modifica Categoria
                        </button>
                        <button class="bulk-btn danger" onclick="RevenueModule.bulkDelete()">
                            <i class="fas fa-trash"></i>
                            Elimina Selezionati
                        </button>
                    </div>
                </div>
                
                <!-- Revenue Table -->
                <div class="revenue-table-container">
                    <table class="revenue-table">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" class="revenue-checkbox" id="select-all">
                                </th>
                                <th class="sortable" data-sort="date">
                                    Data
                                    <i class="fas fa-sort sort-icon"></i>
                                </th>
                                <th class="sortable" data-sort="platform">
                                    Piattaforma
                                    <i class="fas fa-sort sort-icon"></i>
                                </th>
                                <th class="sortable" data-sort="amount">
                                    Importo
                                    <i class="fas fa-sort sort-icon"></i>
                                </th>
                                <th class="sortable" data-sort="category">
                                    Categoria
                                    <i class="fas fa-sort sort-icon"></i>
                                </th>
                                <th>Video/Track</th>
                                <th>Note</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="revenue-table-body">
                            <!-- Table rows will be inserted here -->
                        </tbody>
                    </table>
                </div>
                
                <!-- Empty State -->
                <div class="revenue-empty" id="revenue-empty" style="display: none;">
                    <div class="empty-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3 class="empty-title">Nessuna entrata trovata</h3>
                    <p class="empty-description">
                        Non hai ancora aggiunto nessuna entrata o i filtri applicati non restituiscono risultati.
                        <br>Inizia aggiungendo la tua prima entrata musicale!
                    </p>
                    <button class="btn-primary" onclick="RevenueModule.openAddModal()">
                        <i class="fas fa-plus"></i>
                        Aggiungi Prima Entrata
                    </button>
                </div>
                
                <!-- Pagination -->
                <div class="pagination-container" id="pagination-container">
                    <div class="pagination-info">
                        Mostrando <span id="items-start">0</span>-<span id="items-end">0</span> di <span id="items-total">0</span> entrate
                    </div>
                    <div class="pagination-controls" id="pagination-controls">
                        <!-- Pagination buttons will be inserted here -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load revenue data from database
     */
    async loadRevenueData() {
        try {
            this.revenueData = await window.DB.getAll('revenue');
            this.totalItems = this.revenueData.length;
            console.log(`📊 Loaded ${this.totalItems} revenue entries`);
        } catch (error) {
            console.error('❌ Failed to load revenue data:', error);
            this.revenueData = [];
            this.totalItems = 0;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', window.Utils.debounce((e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.renderRevenueTable();
            }, 300));
        }

        // Filter dropdowns
        document.addEventListener('click', (e) => {
            // Toggle dropdown
            if (e.target.closest('.filter-btn')) {
                const dropdown = e.target.closest('.filter-dropdown');
                const isActive = dropdown.classList.contains('active');

                // Close all dropdowns
                document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('active'));

                // Toggle current dropdown
                if (!isActive) {
                    dropdown.classList.add('active');
                }
                return;
            }

            // Select filter option
            if (e.target.closest('.filter-option')) {
                const option = e.target.closest('.filter-option');
                const dropdown = option.closest('.filter-dropdown');
                const filterType = dropdown.id.replace('-filter', '');
                const value = option.dataset.value;

                // Update filter
                this.filters[filterType === 'date' ? 'dateRange' : filterType] = value;

                // Update button text
                const btn = dropdown.querySelector('.filter-btn span');
                btn.textContent = option.textContent;

                // Close dropdown
                dropdown.classList.remove('active');

                // Reset page and re-render
                this.currentPage = 1;
                this.renderRevenueTable();
                return;
            }

            // Close dropdowns if clicked outside
            if (!e.target.closest('.filter-dropdown')) {
                document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('active'));
            }

            // Table sorting
            if (e.target.closest('.sortable')) {
                const th = e.target.closest('.sortable');
                const newSortBy = th.dataset.sort;

                if (this.sortBy === newSortBy) {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortBy = newSortBy;
                    this.sortOrder = 'desc';
                }

                this.renderRevenueTable();
                return;
            }

            // Select all checkbox
            if (e.target.id === 'select-all') {
                this.toggleSelectAll(e.target.checked);
                return;
            }

            // Individual checkboxes
            if (e.target.classList.contains('revenue-checkbox') && e.target.id !== 'select-all') {
                this.toggleSelectItem(e.target.dataset.id, e.target.checked);
                return;
            }

            // Action buttons
            if (e.target.closest('.action-btn')) {
                const btn = e.target.closest('.action-btn');
                const action = btn.classList.contains('edit') ? 'edit' :
                    btn.classList.contains('delete') ? 'delete' : 'duplicate';
                const id = btn.dataset.id;

                this.handleRowAction(action, id);
                return;
            }

            // Pagination buttons
            if (e.target.closest('.pagination-btn')) {
                const btn = e.target.closest('.pagination-btn');
                const page = parseInt(btn.dataset.page);
                if (!isNaN(page)) {
                    this.currentPage = page;
                    this.renderRevenueTable();
                }
                return;
            }
        });
    }

    /**
     * Filter and sort revenue data
     */
    getFilteredData() {
        let filtered = [...this.revenueData];

        // Apply search filter
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(item =>
                item.platform.toLowerCase().includes(search) ||
                (item.notes && item.notes.toLowerCase().includes(search)) ||
                (item.videoId && item.videoId.toLowerCase().includes(search)) ||
                item.category.toLowerCase().includes(search)
            );
        }

        // Apply platform filter
        if (this.filters.platform) {
            filtered = filtered.filter(item => item.platform === this.filters.platform);
        }

        // Apply category filter
        if (this.filters.category) {
            filtered = filtered.filter(item => item.category === this.filters.category);
        }

        // Apply date range filter
        if (this.filters.dateRange) {
            const range = window.Utils.getDateRange(this.filters.dateRange);
            filtered = filtered.filter(item =>
                window.Utils.isDateInRange(item.date, range)
            );
        }

        // Apply amount filters
        if (this.filters.minAmount) {
            const min = parseFloat(this.filters.minAmount);
            filtered = filtered.filter(item => item.amount >= min);
        }

        if (this.filters.maxAmount) {
            const max = parseFloat(this.filters.maxAmount);
            filtered = filtered.filter(item => item.amount <= max);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[this.sortBy];
            let bVal = b[this.sortBy];

            // Handle different data types
            if (this.sortBy === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (this.sortBy === 'amount') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }

            if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }

    /**
     * Render revenue table
     */
    renderRevenueTable() {
        const filteredData = this.getFilteredData();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);

        const tbody = document.getElementById('revenue-table-body');
        const emptyState = document.getElementById('revenue-empty');
        const tableContainer = document.querySelector('.revenue-table-container');

        if (pageData.length === 0) {
            tableContainer.style.display = 'none';
            emptyState.style.display = 'block';
            this.renderPagination(0, 0);
            return;
        }

        tableContainer.style.display = 'block';
        emptyState.style.display = 'none';

        tbody.innerHTML = pageData.map(item => `
            <tr>
                <td>
                    <input type="checkbox" class="revenue-checkbox" data-id="${item.id}" 
                           ${this.selectedItems.has(item.id) ? 'checked' : ''}>
                </td>
                <td class="revenue-date">${window.Utils.formatDate(item.date)}</td>
                <td class="revenue-platform">
                    <div class="platform-icon ${this.getPlatformClass(item.platform)}">
                        <i class="${window.Utils.getPlatformIcon(item.platform)}"></i>
                    </div>
                    ${item.platform}
                </td>
                <td class="revenue-amount">${window.Utils.formatCurrency(item.amount)}</td>
                <td>
                    <span class="revenue-category">${item.category}</span>
                </td>
                <td class="revenue-notes">${item.videoId || '-'}</td>
                <td class="revenue-notes">${window.Utils.truncate(item.notes || '', 30)}</td>
                <td class="revenue-actions">
                    <button class="action-btn edit" data-id="${item.id}" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn duplicate" data-id="${item.id}" title="Duplica">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn delete" data-id="${item.id}" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        this.renderPagination(filteredData.length, startIndex);
        this.updateSortIcons();
        this.updateBulkActions();
    }

    /**
     * Get platform CSS class
     */
    getPlatformClass(platform) {
        const platformMap = {
            'YouTube AdSense': 'platform-youtube',
            'YouTube Music': 'platform-youtube',
            'Spotify': 'platform-spotify',
            'Apple Music': 'platform-apple',
            'Amazon Music': 'platform-amazon'
        };
        return platformMap[platform] || 'platform-other';
    }

    /**
     * Update sort icons
     */
    updateSortIcons() {
        // Reset all sort icons
        document.querySelectorAll('.sort-icon').forEach(icon => {
            icon.className = 'fas fa-sort sort-icon';
        });

        // Update active sort icon
        const activeTh = document.querySelector(`[data-sort="${this.sortBy}"]`);
        if (activeTh) {
            const icon = activeTh.querySelector('.sort-icon');
            icon.className = `fas fa-sort-${this.sortOrder === 'asc' ? 'up' : 'down'} sort-icon`;
            activeTh.classList.add('sorted');
        }
    }

    /**
     * Render pagination
     */
    renderPagination(totalFiltered, startIndex) {
        const totalPages = Math.ceil(totalFiltered / this.itemsPerPage);
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalFiltered);

        // Update pagination info
        document.getElementById('items-start').textContent = totalFiltered > 0 ? startIndex + 1 : 0;
        document.getElementById('items-end').textContent = endIndex;
        document.getElementById('items-total').textContent = totalFiltered;

        // Generate pagination buttons
        const paginationControls = document.getElementById('pagination-controls');
        if (totalPages <= 1) {
            paginationControls.innerHTML = '';
            return;
        }

        let buttons = [];

        // Previous button
        buttons.push(`
            <button class="pagination-btn" data-page="${this.currentPage - 1}" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `);

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            buttons.push(`<button class="pagination-btn" data-page="1">1</button>`);
            if (startPage > 2) {
                buttons.push(`<span style="color: var(--text-muted); padding: 0 8px;">...</span>`);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(`
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(`<span style="color: var(--text-muted); padding: 0 8px;">...</span>`);
            }
            buttons.push(`<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`);
        }

        // Next button
        buttons.push(`
            <button class="pagination-btn" data-page="${this.currentPage + 1}" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `);

        paginationControls.innerHTML = buttons.join('');
    }

    /**
     * Update statistics
     */
    updateStats() {
        const totalRevenue = this.revenueData.reduce((sum, item) => sum + item.amount, 0);

        // Month revenue
        const monthRange = window.Utils.getDateRange('month');
        const monthRevenue = this.revenueData
            .filter(item => window.Utils.isDateInRange(item.date, monthRange))
            .reduce((sum, item) => sum + item.amount, 0);

        // Average monthly revenue (last 12 months)
        const yearRange = window.Utils.getDateRange('year');
        const yearRevenue = this.revenueData
            .filter(item => window.Utils.isDateInRange(item.date, yearRange))
            .reduce((sum, item) => sum + item.amount, 0);
        const avgMonthly = yearRevenue / 12;

        // Update UI
        document.getElementById('total-revenue').textContent = window.Utils.formatCurrency(totalRevenue);
        document.getElementById('month-revenue').textContent = window.Utils.formatCurrency(monthRevenue);
        document.getElementById('avg-revenue').textContent = window.Utils.formatCurrency(avgMonthly);
    }

    /**
     * Handle select all checkbox
     */
    toggleSelectAll(checked) {
        const filteredData = this.getFilteredData();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);

        pageData.forEach(item => {
            if (checked) {
                this.selectedItems.add(item.id);
            } else {
                this.selectedItems.delete(item.id);
            }
        });

        // Update individual checkboxes
        document.querySelectorAll('.revenue-checkbox:not(#select-all)').forEach(checkbox => {
            checkbox.checked = checked;
        });

        this.updateBulkActions();
    }

    /**
     * Handle individual item selection
     */
    toggleSelectItem(id, checked) {
        if (checked) {
            this.selectedItems.add(id);
        } else {
            this.selectedItems.delete(id);
        }

        // Update select all checkbox
        const totalCheckboxes = document.querySelectorAll('.revenue-checkbox:not(#select-all)').length;
        const checkedCheckboxes = document.querySelectorAll('.revenue-checkbox:not(#select-all):checked').length;
        const selectAllCheckbox = document.getElementById('select-all');

        if (selectAllCheckbox) {
            selectAllCheckbox.checked = totalCheckboxes > 0 && checkedCheckboxes === totalCheckboxes;
            selectAllCheckbox.indeterminate = checkedCheckboxes > 0 && checkedCheckboxes < totalCheckboxes;
        }

        this.updateBulkActions();
    }

    /**
     * Update bulk actions visibility
     */
    updateBulkActions() {
        const bulkActions = document.getElementById('bulk-actions');
        const selectedCount = document.getElementById('selected-count');

        if (this.selectedItems.size > 0) {
            bulkActions.classList.add('active');
            selectedCount.textContent = this.selectedItems.size;
        } else {
            bulkActions.classList.remove('active');
        }
    }

    /**
     * Handle row actions
     */
    async handleRowAction(action, id) {
        const item = this.revenueData.find(r => r.id === id);
        if (!item) return;

        switch (action) {
            case 'edit':
                this.openEditModal(item);
                break;
            case 'duplicate':
                this.duplicateRevenue(item);
                break;
            case 'delete':
                this.deleteRevenue(id);
                break;
        }
    }

    /**
     * Open add revenue modal
     */
    static openAddModal() {
        const instance = window.RevenueModule;
        if (instance) {
            instance.openRevenueModal();
        }
    }

    /**
     * Open revenue modal (add or edit)
     */
    openRevenueModal(editItem = null) {
        const isEdit = !!editItem;
        const modalHtml = `
            <div class="revenue-modal">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'Modifica Entrata' : 'Aggiungi Entrata'}</h3>
                    <button class="modal-close" onclick="window.App.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="revenue-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label required">Data</label>
                                <input type="date" class="form-input" id="revenue-date" required
                                       value="${editItem ? editItem.date : new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">Piattaforma</label>
                                <select class="form-select" id="revenue-platform" required>
                                    <option value="">Seleziona piattaforma</option>
                                    ${this.platforms.map(platform => `
                                        <option value="${platform}" ${editItem && editItem.platform === platform ? 'selected' : ''}>
                                            ${platform}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">Importo</label>
                                <div class="amount-input-container">
                                    <span class="currency-symbol">€</span>
                                    <input type="number" class="form-input amount-input" id="revenue-amount" 
                                           step="0.01" min="0" required placeholder="0.00"
                                           value="${editItem ? editItem.amount : ''}">
                                </div>
                                <div class="form-help">Inserisci l'importo in euro</div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Categoria</label>
                                <select class="form-select" id="revenue-category">
                                    ${this.categories.map(category => `
                                        <option value="${category}" ${editItem && editItem.category === category ? 'selected' : ''}>
                                            ${category}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Video/Track ID</label>
                                <input type="text" class="form-input" id="revenue-video-id" 
                                       placeholder="es. ABC123XYZ (opzionale)"
                                       value="${editItem ? editItem.videoId || '' : ''}">
                                <div class="form-help">ID del video YouTube o identificativo del brano</div>
                            </div>
                            
                            <div class="form-group full-width">
                                <label class="form-label">Note</label>
                                <textarea class="form-textarea" id="revenue-notes" 
                                          placeholder="Note aggiuntive (opzionale)">${editItem ? editItem.notes || '' : ''}</textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-cancel" onclick="window.App.closeModal()">
                        Annulla
                    </button>
                    <button type="submit" class="btn-save" onclick="RevenueModule.saveRevenue('${editItem ? editItem.id : ''}')">
                        ${isEdit ? 'Aggiorna' : 'Salva'}
                    </button>
                </div>
            </div>
        `;

        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = modalHtml;
        modalContainer.classList.add('active');

        // Focus first input
        setTimeout(() => {
            document.getElementById('revenue-date').focus();
        }, 100);
    }

    /**
     * Open edit modal
     */
    openEditModal(item) {
        this.openRevenueModal(item);
    }

    /**
     * Save revenue entry
     */
    static async saveRevenue(editId = '') {
        const instance = window.RevenueModule;
        if (!instance) return;

        const form = document.getElementById('revenue-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = {
            date: document.getElementById('revenue-date').value,
            platform: document.getElementById('revenue-platform').value,
            amount: parseFloat(document.getElementById('revenue-amount').value),
            category: document.getElementById('revenue-category').value || 'Altri',
            videoId: document.getElementById('revenue-video-id').value.trim(),
            notes: document.getElementById('revenue-notes').value.trim(),
            currency: '€'
        };

        try {
            if (editId) {
                // Update existing
                await window.DB.update('revenue', editId, data);
                window.App.showNotification('Entrata aggiornata con successo!', 'success');
            } else {
                // Create new
                await window.DB.create('revenue', data);
                window.App.showNotification('Entrata aggiunta con successo!', 'success');
            }

            // Refresh data and close modal
            await instance.loadRevenueData();
            instance.renderRevenueTable();
            instance.updateStats();
            window.App.closeModal();

            // Trigger global data update event
            window.dispatchEvent(new CustomEvent('dataUpdated'));

        } catch (error) {
            console.error('❌ Failed to save revenue:', error);
            window.App.showNotification('Errore nel salvare l\'entrata', 'error');
        }
    }

    /**
     * Duplicate revenue entry
     */
    async duplicateRevenue(item) {
        const duplicateData = {
            ...item,
            date: new Date().toISOString().split('T')[0], // Today's date
            notes: (item.notes || '') + ' (copia)'
        };

        delete duplicateData.id;
        delete duplicateData.createdAt;
        delete duplicateData.updatedAt;

        try {
            await window.DB.create('revenue', duplicateData);
            await this.loadRevenueData();
            this.renderRevenueTable();
            this.updateStats();

            window.App.showNotification('Entrata duplicata con successo!', 'success');
            window.dispatchEvent(new CustomEvent('dataUpdated'));

        } catch (error) {
            console.error('❌ Failed to duplicate revenue:', error);
            window.App.showNotification('Errore nella duplicazione', 'error');
        }
    }

    /**
     * Delete revenue entry
     */
    async deleteRevenue(id) {
        if (!confirm('Sei sicuro di voler eliminare questa entrata? L\'azione non può essere annullata.')) {
            return;
        }

        try {
            await window.DB.delete('revenue', id);
            await this.loadRevenueData();
            this.renderRevenueTable();
            this.updateStats();

            // Remove from selected items
            this.selectedItems.delete(id);
            this.updateBulkActions();

            window.App.showNotification('Entrata eliminata con successo!', 'success');
            window.dispatchEvent(new CustomEvent('dataUpdated'));

        } catch (error) {
            console.error('❌ Failed to delete revenue:', error);
            window.App.showNotification('Errore nell\'eliminazione', 'error');
        }
    }

    /**
     * Clear all filters
     */
    static clearFilters() {
        const instance = window.RevenueModule;
        if (!instance) return;

        // Reset filters
        instance.filters = {
            search: '',
            platform: '',
            dateRange: '',
            category: '',
            minAmount: '',
            maxAmount: ''
        };

        // Reset UI
        document.getElementById('search-input').value = '';
        document.querySelectorAll('.filter-btn span').forEach((span, index) => {
            const texts = ['Piattaforma', 'Periodo', 'Categoria'];
            span.textContent = texts[index] || 'Filtro';
        });

        // Reset page and re-render
        instance.currentPage = 1;
        instance.renderRevenueTable();
    }

    /**
     * Export CSV
     */
    static exportCSV() {
        const instance = window.RevenueModule;
        if (!instance) return;

        const data = instance.getFilteredData();
        if (data.length === 0) {
            window.App.showNotification('Nessun dato da esportare', 'warning');
            return;
        }

        const csvData = data.map(item => ({
            'Data': window.Utils.formatDate(item.date),
            'Piattaforma': item.platform,
            'Importo': item.amount,
            'Valuta': item.currency || '€',
            'Categoria': item.category,
            'Video/Track ID': item.videoId || '',
            'Note': item.notes || ''
        }));

        const filename = `revenue-export-${new Date().toISOString().split('T')[0]}.csv`;
        window.Utils.downloadCSV(csvData, filename);

        window.App.showNotification('Export CSV completato!', 'success');
    }

    /**
     * Bulk operations
     */
    static bulkExport() {
        const instance = window.RevenueModule;
        if (!instance || instance.selectedItems.size === 0) return;

        const selectedData = instance.revenueData.filter(item =>
            instance.selectedItems.has(item.id)
        );

        const csvData = selectedData.map(item => ({
            'Data': window.Utils.formatDate(item.date),
            'Piattaforma': item.platform,
            'Importo': item.amount,
            'Valuta': item.currency || '€',
            'Categoria': item.category,
            'Video/Track ID': item.videoId || '',
            'Note': item.notes || ''
        }));

        const filename = `revenue-selected-${new Date().toISOString().split('T')[0]}.csv`;
        window.Utils.downloadCSV(csvData, filename);

        window.App.showNotification(`Export di ${selectedData.length} entrate completato!`, 'success');
    }

    static bulkEdit() {
        // TODO: Implement bulk edit functionality
        window.App.showNotification('Modifica multipla in arrivo!', 'info');
    }

    static async bulkDelete() {
        const instance = window.RevenueModule;
        if (!instance || instance.selectedItems.size === 0) return;

        const count = instance.selectedItems.size;
        if (!confirm(`Sei sicuro di voler eliminare ${count} entrate selezionate? L'azione non può essere annullata.`)) {
            return;
        }

        try {
            // Delete selected items
            for (const id of instance.selectedItems) {
                await window.DB.delete('revenue', id);
            }

            // Clear selection and refresh
            instance.selectedItems.clear();
            await instance.loadRevenueData();
            instance.renderRevenueTable();
            instance.updateStats();
            instance.updateBulkActions();

            window.App.showNotification(`${count} entrate eliminate con successo!`, 'success');
            window.dispatchEvent(new CustomEvent('dataUpdated'));

        } catch (error) {
            console.error('❌ Failed to bulk delete:', error);
            window.App.showNotification('Errore nell\'eliminazione multipla', 'error');
        }
    }

    /**
     * Utility functions
     */
    showError(message) {
        if (window.App) {
            window.App.showNotification(message, 'error');
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.selectedItems.clear();
        this.isInitialized = false;
    }
}

// Create global instance
window.RevenueModule = new RevenueModule();

// Auto-initialize when navigating to revenue section
document.addEventListener('DOMContentLoaded', () => {
    if (window.App?.currentSection === 'revenue') {
        window.RevenueModule.init();
    }
});