/**
 * MUSIC BUSINESS TRACKER - REVENUE MODULE
 * Advanced Revenue Management with Tables, Filters, Statistics
 */

class RevenueModule {
    constructor() {
        this.container = document.getElementById('revenueContent');
        this.currentData = [];
        this.filteredData = [];
        this.sortColumn = 'date';
        this.sortDirection = 'desc';
        this.currentFilters = {
            platform: '',
            dateFrom: '',
            dateTo: '',
            amountMin: '',
            amountMax: '',
            search: ''
        };

        this.init();
    }

    /**
     * Initialize revenue module
     */
    async init() {
        try {
            console.log('🚀 Initializing Revenue Module...');

            if (!this.container) {
                throw new Error('Revenue container not found');
            }

            // Create revenue layout
            await this.createRevenueLayout();

            // Load and display data
            await this.loadRevenueData();

            // Setup event listeners
            this.setupEventListeners();

            console.log('✅ Revenue Module initialized');

        } catch (error) {
            console.error('❌ Revenue initialization failed:', error);
            this.showError('Errore caricamento modulo entrate');
        }
    }

    /**
     * Create revenue layout
     */
    async createRevenueLayout() {
        const revenueHTML = `
            <div class="revenue-layout">
                <!-- Revenue Header & Stats -->
                <div class="revenue-header">
                    <div class="revenue-stats-grid">
                        <!-- Total Revenue Card -->
                        <div class="stats-card total-card">
                            <div class="stats-icon">
                                <i class="fas fa-euro-sign"></i>
                            </div>
                            <div class="stats-content">
                                <div class="stats-value" id="totalRevenue">€0.00</div>
                                <div class="stats-label">Revenue Totale</div>
                                <div class="stats-period" id="totalPeriod">Tutti i tempi</div>
                            </div>
                        </div>
                        
                        <!-- Monthly Revenue Card -->
                        <div class="stats-card monthly-card">
                            <div class="stats-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="stats-content">
                                <div class="stats-value" id="monthlyRevenue">€0.00</div>
                                <div class="stats-label">Questo Mese</div>
                                <div class="stats-growth" id="monthlyGrowth">+0%</div>
                            </div>
                        </div>
                        
                        <!-- Best Platform Card -->
                        <div class="stats-card platform-card">
                            <div class="stats-icon">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <div class="stats-content">
                                <div class="stats-value" id="bestPlatform">-</div>
                                <div class="stats-label">Top Platform</div>
                                <div class="stats-amount" id="bestPlatformAmount">€0.00</div>
                            </div>
                        </div>
                        
                        <!-- Average Revenue Card -->
                        <div class="stats-card average-card">
                            <div class="stats-icon">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                            <div class="stats-content">
                                <div class="stats-value" id="averageRevenue">€0.00</div>
                                <div class="stats-label">Media Entrata</div>
                                <div class="stats-count" id="totalEntries">0 entrate</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Filters & Actions -->
                <div class="revenue-controls">
                    <div class="filters-section">
                        <div class="filters-row">
                            <div class="filter-group">
                                <label class="filter-label">Cerca:</label>
                                <input type="text" id="searchFilter" class="filter-input" 
                                       placeholder="Cerca in descrizione, note...">
                            </div>
                            
                            <div class="filter-group">
                                <label class="filter-label">Piattaforma:</label>
                                <select id="platformFilter" class="filter-select">
                                    <option value="">Tutte le piattaforme</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label class="filter-label">Da:</label>
                                <input type="date" id="dateFromFilter" class="filter-input">
                            </div>
                            
                            <div class="filter-group">
                                <label class="filter-label">A:</label>
                                <input type="date" id="dateToFilter" class="filter-input">
                            </div>
                            
                            <div class="filter-group">
                                <label class="filter-label">Importo:</label>
                                <div class="amount-range">
                                    <input type="number" id="amountMinFilter" class="filter-input small" 
                                           placeholder="Min €" step="0.01">
                                    <span class="range-separator">-</span>
                                    <input type="number" id="amountMaxFilter" class="filter-input small" 
                                           placeholder="Max €" step="0.01">
                                </div>
                            </div>
                        </div>
                        
                        <div class="filters-actions">
                            <button class="btn btn-outline btn-sm" id="clearFiltersBtn">
                                <i class="fas fa-times"></i>
                                Pulisci Filtri
                            </button>
                            <button class="btn btn-primary btn-sm" id="addRevenueBtn">
                                <i class="fas fa-plus"></i>
                                Aggiungi Entrata
                            </button>
                            <button class="btn btn-secondary btn-sm" id="exportRevenueBtn">
                                <i class="fas fa-download"></i>
                                Export CSV
                            </button>
                            <button class="btn btn-secondary btn-sm" id="importRevenueBtn">
                                <i class="fas fa-upload"></i>
                                Import CSV
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Revenue Table -->
                <div class="revenue-table-section">
                    <div class="table-header">
                        <div class="table-info">
                            <span class="results-count" id="resultsCount">0 entrate</span>
                            <span class="results-total" id="resultsTotal">€0.00 totale</span>
                        </div>
                        <div class="table-actions">
                            <div class="bulk-actions hidden" id="bulkActions">
                                <span class="selected-count" id="selectedCount">0 selezionate</span>
                                <button class="btn btn-error btn-sm" id="deleteBulkBtn">
                                    <i class="fas fa-trash"></i>
                                    Elimina
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table class="revenue-table" id="revenueTable">
                            <thead>
                                <tr>
                                    <th class="checkbox-col">
                                        <input type="checkbox" id="selectAllCheckbox">
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
                                    <th class="sortable" data-sort="description">
                                        Descrizione
                                        <i class="fas fa-sort sort-icon"></i>
                                    </th>
                                    <th>Note</th>
                                    <th class="actions-col">Azioni</th>
                                </tr>
                            </thead>
                            <tbody id="revenueTableBody">
                                <!-- Data will be populated here -->
                            </tbody>
                        </table>
                        
                        <div class="table-empty hidden" id="tableEmpty">
                            <div class="empty-icon">
                                <i class="fas fa-euro-sign"></i>
                            </div>
                            <div class="empty-message">
                                <h3>Nessuna entrata trovata</h3>
                                <p>Aggiungi la tua prima entrata o modifica i filtri di ricerca.</p>
                                <button class="btn btn-primary" id="addFirstRevenueBtn">
                                    <i class="fas fa-plus"></i>
                                    Aggiungi Prima Entrata
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Hidden file input for import -->
            <input type="file" id="csvFileInput" accept=".csv" class="hidden">
        `;

        this.container.innerHTML = revenueHTML;
    }

    /**
     * Load revenue data and populate table
     */
    async loadRevenueData() {
        try {
            // Get all revenue data
            this.currentData = await window.musicDB.getAllRevenue();

            // Sort by date (newest first)
            this.currentData.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Apply current filters
            this.applyFilters();

            // Update statistics
            this.updateStatistics();

            // Populate platform filter
            this.populatePlatformFilter();

            // Render table
            this.renderTable();

        } catch (error) {
            console.error('❌ Error loading revenue data:', error);
            this.showError('Errore caricamento dati entrate');
        }
    }

    /**
     * Update statistics cards
     */
    updateStatistics() {
        const totalRevenue = this.currentData.reduce((sum, item) => sum + item.amount, 0);
        const monthlyData = this.getMonthlyData();
        const platformStats = this.getPlatformStatistics();

        // Total Revenue
        document.getElementById('totalRevenue').textContent = `€${totalRevenue.toFixed(2)}`;
        document.getElementById('totalPeriod').textContent = `${this.currentData.length} entrate`;

        // Monthly Revenue
        document.getElementById('monthlyRevenue').textContent = `€${monthlyData.current.toFixed(2)}`;
        const monthlyGrowth = monthlyData.previous > 0 ?
            ((monthlyData.current - monthlyData.previous) / monthlyData.previous * 100) : 0;
        const growthElement = document.getElementById('monthlyGrowth');
        growthElement.textContent = `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`;
        growthElement.className = `stats-growth ${monthlyGrowth >= 0 ? 'positive' : 'negative'}`;

        // Best Platform
        const bestPlatform = platformStats.length > 0 ? platformStats[0] : null;
        document.getElementById('bestPlatform').textContent = bestPlatform ? bestPlatform.platform : '-';
        document.getElementById('bestPlatformAmount').textContent = bestPlatform ? `€${bestPlatform.total.toFixed(2)}` : '€0.00';

        // Average Revenue
        const avgRevenue = this.currentData.length > 0 ? totalRevenue / this.currentData.length : 0;
        document.getElementById('averageRevenue').textContent = `€${avgRevenue.toFixed(2)}`;
        document.getElementById('totalEntries').textContent = `${this.currentData.length} entrate`;
    }

    /**
     * Get monthly revenue data for comparison
     */
    getMonthlyData() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthData = this.currentData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });

        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const previousMonthData = this.currentData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getMonth() === previousMonth && itemDate.getFullYear() === previousYear;
        });

        return {
            current: currentMonthData.reduce((sum, item) => sum + item.amount, 0),
            previous: previousMonthData.reduce((sum, item) => sum + item.amount, 0)
        };
    }

    /**
     * Get platform statistics
     */
    getPlatformStatistics() {
        const platforms = {};

        this.currentData.forEach(item => {
            if (!platforms[item.platform]) {
                platforms[item.platform] = { platform: item.platform, total: 0, count: 0 };
            }
            platforms[item.platform].total += item.amount;
            platforms[item.platform].count += 1;
        });

        return Object.values(platforms).sort((a, b) => b.total - a.total);
    }

    /**
     * Populate platform filter dropdown
     */
    populatePlatformFilter() {
        const platformFilter = document.getElementById('platformFilter');
        const platforms = [...new Set(this.currentData.map(item => item.platform))].sort();

        // Clear existing options except the first one
        platformFilter.innerHTML = '<option value="">Tutte le piattaforme</option>';

        // Add platform options
        platforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform;
            platformFilter.appendChild(option);
        });
    }

    /**
     * Apply filters to data
     */
    applyFilters() {
        this.filteredData = this.currentData.filter(item => {
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchText = `${item.description || ''} ${item.notes || ''}`.toLowerCase();
                if (!searchText.includes(searchTerm)) return false;
            }

            // Platform filter
            if (this.currentFilters.platform && item.platform !== this.currentFilters.platform) {
                return false;
            }

            // Date range filter
            if (this.currentFilters.dateFrom) {
                if (new Date(item.date) < new Date(this.currentFilters.dateFrom)) return false;
            }
            if (this.currentFilters.dateTo) {
                if (new Date(item.date) > new Date(this.currentFilters.dateTo)) return false;
            }

            // Amount range filter
            if (this.currentFilters.amountMin !== '' && item.amount < parseFloat(this.currentFilters.amountMin)) {
                return false;
            }
            if (this.currentFilters.amountMax !== '' && item.amount > parseFloat(this.currentFilters.amountMax)) {
                return false;
            }

            return true;
        });

        // Apply sorting
        this.sortData();

        // Update results info
        this.updateResultsInfo();
    }

    /**
     * Sort filtered data
     */
    sortData() {
        this.filteredData.sort((a, b) => {
            let valueA = a[this.sortColumn];
            let valueB = b[this.sortColumn];

            // Handle different data types
            if (this.sortColumn === 'date') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            } else if (this.sortColumn === 'amount') {
                valueA = parseFloat(valueA);
                valueB = parseFloat(valueB);
            } else if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Update results information
     */
    updateResultsInfo() {
        const resultsCount = document.getElementById('resultsCount');
        const resultsTotal = document.getElementById('resultsTotal');

        const count = this.filteredData.length;
        const total = this.filteredData.reduce((sum, item) => sum + item.amount, 0);

        if (resultsCount) {
            resultsCount.textContent = `${count} ${count === 1 ? 'entrata' : 'entrate'}`;
        }
        if (resultsTotal) {
            resultsTotal.textContent = `€${total.toFixed(2)} totale`;
        }
    }

    /**
     * Render revenue table
     */
    renderTable() {
        const tableBody = document.getElementById('revenueTableBody');
        const tableEmpty = document.getElementById('tableEmpty');
        const table = document.getElementById('revenueTable');

        if (!tableBody) return;

        // Show/hide empty state
        if (this.filteredData.length === 0) {
            table.classList.add('hidden');
            tableEmpty.classList.remove('hidden');
            return;
        }

        table.classList.remove('hidden');
        tableEmpty.classList.add('hidden');

        // Generate table rows
        const rows = this.filteredData.map(item => `
            <tr data-id="${item.id}">
                <td class="checkbox-col">
                    <input type="checkbox" class="row-checkbox" value="${item.id}">
                </td>
                <td class="date-col">
                    <span class="date-display">${this.formatDate(item.date)}</span>
                </td>
                <td class="platform-col">
                    <span class="platform-badge platform-${this.getPlatformClass(item.platform)}">
                        ${item.platform}
                    </span>
                </td>
                <td class="amount-col">
                    <span class="amount-display">€${item.amount.toFixed(2)}</span>
                </td>
                <td class="description-col">
                    <span class="description-text">${item.description || '-'}</span>
                </td>
                <td class="notes-col">
                    <span class="notes-text">${this.truncateText(item.notes || '-', 50)}</span>
                </td>
                <td class="actions-col">
                    <div class="action-buttons">
                        <button class="btn-icon edit-btn" onclick="revenueModule.editRevenue('${item.id}')" 
                                title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-btn" onclick="revenueModule.deleteRevenue('${item.id}')" 
                                title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = rows;

        // Update sort indicators
        this.updateSortIndicators();
    }

    /**
     * Update sort indicators in table headers
     */
    updateSortIndicators() {
        const headers = document.querySelectorAll('.sortable');
        headers.forEach(header => {
            const icon = header.querySelector('.sort-icon');
            const column = header.getAttribute('data-sort');

            if (column === this.sortColumn) {
                icon.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'} sort-icon active`;
            } else {
                icon.className = 'fas fa-sort sort-icon';
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter inputs
        document.getElementById('searchFilter').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.applyFilters();
            this.renderTable();
        });

        document.getElementById('platformFilter').addEventListener('change', (e) => {
            this.currentFilters.platform = e.target.value;
            this.applyFilters();
            this.renderTable();
        });

        document.getElementById('dateFromFilter').addEventListener('change', (e) => {
            this.currentFilters.dateFrom = e.target.value;
            this.applyFilters();
            this.renderTable();
        });

        document.getElementById('dateToFilter').addEventListener('change', (e) => {
            this.currentFilters.dateTo = e.target.value;
            this.applyFilters();
            this.renderTable();
        });

        document.getElementById('amountMinFilter').addEventListener('input', (e) => {
            this.currentFilters.amountMin = e.target.value;
            this.applyFilters();
            this.renderTable();
        });

        document.getElementById('amountMaxFilter').addEventListener('input', (e) => {
            this.currentFilters.amountMax = e.target.value;
            this.applyFilters();
            this.renderTable();
        });

        // Action buttons
        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        document.getElementById('addRevenueBtn').addEventListener('click', () => {
            this.openAddRevenueModal();
        });

        document.getElementById('addFirstRevenueBtn').addEventListener('click', () => {
            this.openAddRevenueModal();
        });

        document.getElementById('exportRevenueBtn').addEventListener('click', () => {
            this.exportCSV();
        });

        document.getElementById('importRevenueBtn').addEventListener('click', () => {
            this.importCSV();
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
                this.renderTable();
            });
        });

        // Select all checkbox
        document.getElementById('selectAllCheckbox').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        // Bulk delete
        document.getElementById('deleteBulkBtn').addEventListener('click', () => {
            this.deleteBulkRevenue();
        });

        // File input for import
        document.getElementById('csvFileInput').addEventListener('change', (e) => {
            this.handleFileImport(e.target.files[0]);
        });

        // Row checkbox delegation
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-checkbox')) {
                this.updateBulkActions();
            }
        });
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = {
            platform: '',
            dateFrom: '',
            dateTo: '',
            amountMin: '',
            amountMax: '',
            search: ''
        };

        // Reset form inputs
        document.getElementById('searchFilter').value = '';
        document.getElementById('platformFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        document.getElementById('amountMinFilter').value = '';
        document.getElementById('amountMaxFilter').value = '';

        // Apply filters and re-render
        this.applyFilters();
        this.renderTable();

        window.showToast('Filtri puliti', 'info');
    }

    /**
     * Open add revenue modal
     */
    openAddRevenueModal() {
        if (window.musicApp && window.musicApp.openAddRevenueModal) {
            window.musicApp.openAddRevenueModal();
        }
    }

    /**
     * Edit revenue entry
     */
    async editRevenue(id) {
        try {
            const revenue = this.currentData.find(item => item.id == id);
            if (!revenue) {
                throw new Error('Entrata non trovata');
            }

            // Open edit modal with prefilled data
            const formHTML = `
                <form id="editRevenueForm" class="form">
                    <div class="form-group">
                        <label for="editRevenueDate" class="form-label">Data *</label>
                        <input type="date" id="editRevenueDate" class="form-input" required 
                               value="${revenue.date}">
                    </div>
                    <div class="form-group">
                        <label for="editRevenuePlatform" class="form-label">Piattaforma *</label>
                        <select id="editRevenuePlatform" class="form-select" required>
                            <option value="">Seleziona piattaforma</option>
                            <option value="YouTube AdSense" ${revenue.platform === 'YouTube AdSense' ? 'selected' : ''}>YouTube AdSense</option>
                            <option value="YouTube Music" ${revenue.platform === 'YouTube Music' ? 'selected' : ''}>YouTube Music</option>
                            <option value="Spotify" ${revenue.platform === 'Spotify' ? 'selected' : ''}>Spotify</option>
                            <option value="Apple Music" ${revenue.platform === 'Apple Music' ? 'selected' : ''}>Apple Music</option>
                            <option value="Amazon Music" ${revenue.platform === 'Amazon Music' ? 'selected' : ''}>Amazon Music</option>
                            <option value="Deezer" ${revenue.platform === 'Deezer' ? 'selected' : ''}>Deezer</option>
                            <option value="Tidal" ${revenue.platform === 'Tidal' ? 'selected' : ''}>Tidal</option>
                            <option value="Altri" ${revenue.platform === 'Altri' ? 'selected' : ''}>Altri</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editRevenueAmount" class="form-label">Importo (€) *</label>
                        <input type="number" id="editRevenueAmount" class="form-input" 
                               step="0.01" min="0" required value="${revenue.amount}">
                    </div>
                    <div class="form-group">
                        <label for="editRevenueDescription" class="form-label">Descrizione</label>
                        <input type="text" id="editRevenueDescription" class="form-input" 
                               value="${revenue.description || ''}" placeholder="Descrizione entrata">
                    </div>
                    <div class="form-group">
                        <label for="editRevenueNotes" class="form-label">Note</label>
                        <textarea id="editRevenueNotes" class="form-textarea" 
                                  placeholder="Note aggiuntive...">${revenue.notes || ''}</textarea>
                    </div>
                </form>
            `;

            if (window.musicApp && window.musicApp.openModal) {
                window.musicApp.openModal('Modifica Entrata', formHTML, () => this.submitEditRevenue(id));
            }

        } catch (error) {
            console.error('❌ Error editing revenue:', error);
            window.showToast(`Errore: ${error.message}`, 'error');
        }
    }

    /**
     * Submit edit revenue form
     */
    async submitEditRevenue(id) {
        try {
            const updateData = {
                date: document.getElementById('editRevenueDate').value,
                platform: document.getElementById('editRevenuePlatform').value,
                amount: parseFloat(document.getElementById('editRevenueAmount').value),
                description: document.getElementById('editRevenueDescription').value,
                notes: document.getElementById('editRevenueNotes').value
            };

            // Validate required fields
            if (!updateData.date || !updateData.platform || !updateData.amount) {
                throw new Error('Compilare tutti i campi obbligatori');
            }

            // Update in database
            await window.musicDB.updateRevenue(id, updateData);

            // Refresh data and UI
            await this.refresh();

            window.showToast('Entrata aggiornata con successo!', 'success');

        } catch (error) {
            console.error('❌ Error updating revenue:', error);
            window.showToast(`Errore: ${error.message}`, 'error');
        }
    }

    /**
     * Delete revenue entry
     */
    async deleteRevenue(id) {
        try {
            const revenue = this.currentData.find(item => item.id == id);
            if (!revenue) {
                throw new Error('Entrata non trovata');
            }

            const confirmed = confirm(
                `Eliminare l'entrata di €${revenue.amount.toFixed(2)} da ${revenue.platform}?`
            );

            if (!confirmed) return;

            // Delete from database
            await window.musicDB.deleteRevenue(id);

            // Refresh data and UI
            await this.refresh();

            window.showToast('Entrata eliminata con successo!', 'success');

        } catch (error) {
            console.error('❌ Error deleting revenue:', error);
            window.showToast(`Errore: ${error.message}`, 'error');
        }
    }

    /**
     * Toggle select all checkboxes
     */
    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateBulkActions();
    }

    /**
     * Update bulk actions visibility
     */
    updateBulkActions() {
        const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');

        if (selectedCheckboxes.length > 0) {
            bulkActions.classList.remove('hidden');
            selectedCount.textContent = `${selectedCheckboxes.length} selezionate`;
        } else {
            bulkActions.classList.add('hidden');
        }
    }

    /**
     * Delete selected revenue entries in bulk
     */
    async deleteBulkRevenue() {
        try {
            const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
            const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);

            if (selectedIds.length === 0) {
                window.showToast('Nessuna entrata selezionata', 'warning');
                return;
            }

            const confirmed = confirm(
                `Eliminare ${selectedIds.length} entrate selezionate? Questa azione non può essere annullata.`
            );

            if (!confirmed) return;

            // Delete all selected entries
            for (const id of selectedIds) {
                await window.musicDB.deleteRevenue(id);
            }

            // Refresh data and UI
            await this.refresh();

            window.showToast(`${selectedIds.length} entrate eliminate con successo!`, 'success');

        } catch (error) {
            console.error('❌ Error bulk deleting revenue:', error);
            window.showToast(`Errore: ${error.message}`, 'error');
        }
    }

    /**
     * Export revenue data to CSV
     */
    async exportCSV() {
        try {
            const data = this.filteredData.length > 0 ? this.filteredData : this.currentData;

            if (data.length === 0) {
                window.showToast('Nessun dato da esportare', 'warning');
                return;
            }

            // Create CSV content
            const headers = ['Data', 'Piattaforma', 'Importo', 'Descrizione', 'Note'];
            const rows = data.map(item => [
                item.date,
                item.platform,
                item.amount.toFixed(2),
                `"${(item.description || '').replace(/"/g, '""')}"`,
                `"${(item.notes || '').replace(/"/g, '""')}"`
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `revenue-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            window.showToast(`${data.length} entrate esportate con successo!`, 'success');

        } catch (error) {
            console.error('❌ Error exporting CSV:', error);
            window.showToast('Errore durante l\'export', 'error');
        }
    }

    /**
     * Import revenue data from CSV
     */
    importCSV() {
        const fileInput = document.getElementById('csvFileInput');
        fileInput.click();
    }

    /**
     * Handle CSV file import
     */
    async handleFileImport(file) {
        if (!file) return;

        try {
            const text = await this.readFileAsText(file);
            const lines = text.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                throw new Error('File CSV vuoto o formato non valido');
            }

            // Parse CSV (simple parsing, assumes comma-separated)
            const data = [];
            const headers = lines[0].split(',').map(h => h.trim());

            // Validate headers
            const requiredHeaders = ['Data', 'Piattaforma', 'Importo'];
            const hasRequiredHeaders = requiredHeaders.every(header =>
                headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
            );

            if (!hasRequiredHeaders) {
                throw new Error('File CSV deve contenere almeno: Data, Piattaforma, Importo');
            }

            // Parse data rows
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                if (values.length >= 3) {
                    const revenueItem = {
                        date: values[0],
                        platform: values[1],
                        amount: parseFloat(values[2]),
                        description: values[3] || '',
                        notes: values[4] || ''
                    };

                    // Validate data
                    if (revenueItem.date && revenueItem.platform && !isNaN(revenueItem.amount)) {
                        data.push(revenueItem);
                    }
                }
            }

            if (data.length === 0) {
                throw new Error('Nessun dato valido trovato nel file CSV');
            }

            // Confirm import
            const confirmed = confirm(
                `Importare ${data.length} entrate dal file CSV? Questa operazione aggiungerà nuove entrate ai dati esistenti.`
            );

            if (!confirmed) return;

            // Import data
            let imported = 0;
            for (const item of data) {
                try {
                    await window.musicDB.addRevenue(item);
                    imported++;
                } catch (error) {
                    console.warn('Skipped invalid item:', item, error);
                }
            }

            // Refresh data
            await this.refresh();

            window.showToast(`${imported} entrate importate con successo!`, 'success');

        } catch (error) {
            console.error('❌ Error importing CSV:', error);
            window.showToast(`Errore import: ${error.message}`, 'error');
        }

        // Reset file input
        document.getElementById('csvFileInput').value = '';
    }

    /**
     * Read file as text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Errore lettura file'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * Parse CSV line (handles quotes)
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result.map(item => item.replace(/^"|"$/g, ''));
    }

    /**
     * Refresh revenue module
     */
    async refresh() {
        try {
            await this.loadRevenueData();
        } catch (error) {
            console.error('❌ Error refreshing revenue module:', error);
        }
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Get platform CSS class
     */
    getPlatformClass(platform) {
        const platformMap = {
            'YouTube AdSense': 'youtube',
            'YouTube Music': 'youtube-music',
            'Spotify': 'spotify',
            'Apple Music': 'apple',
            'Amazon Music': 'amazon',
            'Deezer': 'deezer',
            'Tidal': 'tidal'
        };
        return platformMap[platform] || 'other';
    }

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
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
                        <h3>Errore Revenue Module</h3>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="revenueModule.refresh()">
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
window.RevenueModule = RevenueModule;