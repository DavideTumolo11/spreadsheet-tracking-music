/**
 * ⚙️ MUSIC BUSINESS TRACKER - SETTINGS.JS
 * Gestione impostazioni essenziali
 */

class SettingsManager {
    constructor() {
        this.container = null;
        this.currentSettings = {};
        this.init();
    }

    /**
     * Inizializza settings manager
     */
    init() {
        this.container = document.getElementById('settings-content');
        if (!this.container) {
            console.error('Container settings non trovato');
            return;
        }

        this.loadSettings();
        this.render();
        this.bindEvents();
    }

    /**
     * Carica settings correnti
     */
    loadSettings() {
        this.currentSettings = DB.getSettings();
    }

    /**
     * Render completo sezione settings
     */
    render() {
        if (!this.container) return;

        try {
            this.container.innerHTML = `
                <!-- ⚙️ IMPOSTAZIONI BUSINESS -->
                <div class="settings-section">
                    ${this.renderBusinessSettings()}
                </div>

                <!-- 📊 INFO SISTEMA -->
                <div class="settings-section">
                    ${this.renderSystemInfo()}
                </div>

                <!-- 💾 GESTIONE DATI -->
                <div class="settings-section">
                    ${this.renderDataManagement()}
                </div>

                <!-- ⚠️ ZONA PERICOLO -->
                <div class="settings-section danger-zone">
                    ${this.renderDangerZone()}
                </div>
            `;

            this.bindFormEvents();
        } catch (error) {
            handleError(error, 'Errore rendering settings');
            this.renderError();
        }
    }

    /**
     * Render impostazioni business
     */
    renderBusinessSettings() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-cog"></i>
                        Impostazioni Business
                    </h3>
                </div>
                <div class="card-body">
                    <form id="businessSettingsForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    Soglia P.IVA (€) *
                                    <span class="form-help">Limite annuale prima dell'obbligo P.IVA</span>
                                </label>
                                <input type="number" class="form-input" name="pivaThreshold" 
                                       value="${this.currentSettings.pivaThreshold}" 
                                       min="1000" max="100000" step="100" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">
                                    Obiettivo Mensile (€) *
                                    <span class="form-help">Target revenue mensile personale</span>
                                </label>
                                <input type="number" class="form-input" name="monthlyTarget" 
                                       value="${this.currentSettings.monthlyTarget}" 
                                       min="10" max="10000" step="5" required>
                            </div>
                        </div>

                        <div class="settings-info">
                            <div class="info-item">
                                <strong>Stato P.IVA attuale:</strong>
                                ${this.renderPivaStatus()}
                            </div>
                            <div class="info-item">
                                <strong>Progresso obiettivo mensile:</strong>
                                ${this.renderMonthlyProgress()}
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="Settings.resetBusinessSettings()">
                                <i class="fas fa-undo"></i> Reset Default
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> Salva Impostazioni
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Render stato P.IVA
     */
    renderPivaStatus() {
        const pivaStatus = DB.checkPivaStatus();
        const percentage = pivaStatus.percentage.toFixed(1);

        let statusClass = 'success';
        let statusIcon = 'check-circle';
        let statusText = 'Sotto soglia';

        if (pivaStatus.percentage >= 90) {
            statusClass = 'danger';
            statusIcon = 'exclamation-triangle';
            statusText = 'CRITICO - P.IVA richiesta';
        } else if (pivaStatus.percentage >= 80) {
            statusClass = 'warning';
            statusIcon = 'exclamation-triangle';
            statusText = 'Attenzione - Vicino alla soglia';
        }

        return `
            <span class="status-badge status-${statusClass}">
                <i class="fas fa-${statusIcon}"></i>
                ${NumberUtils.formatCurrency(pivaStatus.currentRevenue)} / ${NumberUtils.formatCurrency(pivaStatus.threshold)} 
                (${percentage}%) - ${statusText}
            </span>
        `;
    }

    /**
     * Render progresso obiettivo mensile
     */
    renderMonthlyProgress() {
        const monthlyGoals = DB.checkMonthlyGoals();
        const percentage = monthlyGoals.percentage.toFixed(1);

        let statusClass = monthlyGoals.achieved ? 'success' : 'info';
        let statusIcon = monthlyGoals.achieved ? 'check-circle' : 'target';
        let statusText = monthlyGoals.achieved ? 'Obiettivo raggiunto!' : 'In corso';

        return `
            <span class="status-badge status-${statusClass}">
                <i class="fas fa-${statusIcon}"></i>
                ${NumberUtils.formatCurrency(monthlyGoals.currentRevenue)} / ${NumberUtils.formatCurrency(monthlyGoals.target)} 
                (${percentage}%) - ${statusText}
            </span>
        `;
    }

    /**
     * Render info sistema
     */
    renderSystemInfo() {
        const metadata = StorageUtils.load('mbt_metadata', {});
        const storageSize = StorageUtils.getStorageSize();
        const revenueCount = DB.getAllRevenue().length;

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-info-circle"></i>
                        Informazioni Sistema
                    </h3>
                </div>
                <div class="card-body">
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Versione App</div>
                            <div class="info-value">v${metadata.version || '1.0.0'}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Creata il</div>
                            <div class="info-value">${metadata.createdAt ? DateUtils.formatDate(metadata.createdAt) : 'N/A'}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Ultimo accesso</div>
                            <div class="info-value">${metadata.lastAccess ? DateUtils.formatDate(metadata.lastAccess) : 'N/A'}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Ultimo backup</div>
                            <div class="info-value">${metadata.lastBackup ? DateUtils.formatDate(metadata.lastBackup) : 'Mai effettuato'}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Entrate totali</div>
                            <div class="info-value">${revenueCount} record</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Storage utilizzato</div>
                            <div class="info-value">${(storageSize / 1024).toFixed(1)} KB</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render gestione dati
     */
    renderDataManagement() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-database"></i>
                        Gestione Dati
                    </h3>
                </div>
                <div class="card-body">
                    <div class="data-actions">
                        <div class="action-group">
                            <h4>Backup & Export</h4>
                            <p class="text-muted">Crea backup dei tuoi dati per sicurezza</p>
                            <div class="action-buttons">
                                <button class="btn-primary" onclick="Settings.createBackup()">
                                    <i class="fas fa-download"></i> Crea Backup Completo
                                </button>
                                <button class="btn-secondary" onclick="Revenue.exportCSV()">
                                    <i class="fas fa-file-csv"></i> Export CSV Revenue
                                </button>
                            </div>
                        </div>

                        <div class="action-group">
                            <h4>Ripristino Dati</h4>
                            <p class="text-muted">Ripristina da backup precedente</p>
                            <div class="action-buttons">
                                <input type="file" id="backupFile" accept=".json" style="display: none;" 
                                       onchange="Settings.handleBackupFile(this)">
                                <button class="btn-secondary" onclick="document.getElementById('backupFile').click()">
                                    <i class="fas fa-upload"></i> Carica Backup
                                </button>
                            </div>
                        </div>

                        <div class="action-group">
                            <h4>Ottimizzazione</h4>
                            <p class="text-muted">Pulisci cache e ottimizza performance</p>
                            <div class="action-buttons">
                                <button class="btn-secondary" onclick="Settings.clearCache()">
                                    <i class="fas fa-broom"></i> Pulisci Cache
                                </button>
                                <button class="btn-secondary" onclick="Settings.compactData()">
                                    <i class="fas fa-compress"></i> Compatta Dati
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render zona pericolo
     */
    renderDangerZone() {
        return `
            <div class="card danger-card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        Zona Pericolo
                    </h3>
                </div>
                <div class="card-body">
                    <div class="danger-actions">
                        <div class="danger-item">
                            <div class="danger-info">
                                <h4>Reset Impostazioni</h4>
                                <p>Ripristina tutte le impostazioni ai valori di default</p>
                            </div>
                            <button class="btn-warning" onclick="Settings.resetAllSettings()">
                                <i class="fas fa-undo"></i> Reset Settings
                            </button>
                        </div>

                        <div class="danger-item">
                            <div class="danger-info">
                                <h4>Cancella Tutti i Dati</h4>
                                <p><strong>ATTENZIONE:</strong> Questa azione eliminerà permanentemente tutti i dati revenue. Non è reversibile.</p>
                            </div>
                            <button class="btn-danger" onclick="Settings.deleteAllData()">
                                <i class="fas fa-trash-alt"></i> Elimina Tutto
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Salva impostazioni business
     */
    saveBusinessSettings(formData) {
        try {
            const newSettings = {
                pivaThreshold: NumberUtils.parseNumber(formData.get('pivaThreshold')),
                monthlyTarget: NumberUtils.parseNumber(formData.get('monthlyTarget'))
            };

            // Validazione
            if (newSettings.pivaThreshold < 1000 || newSettings.pivaThreshold > 100000) {
                throw new Error('Soglia P.IVA deve essere tra 1.000€ e 100.000€');
            }

            if (newSettings.monthlyTarget < 10 || newSettings.monthlyTarget > 10000) {
                throw new Error('Obiettivo mensile deve essere tra 10€ e 10.000€');
            }

            const result = DB.updateSettings(newSettings);
            if (result) {
                this.currentSettings = result;
                this.render();
                return true;
            }

            return false;
        } catch (error) {
            handleError(error, 'Errore salvataggio impostazioni');
            return false;
        }
    }

    /**
     * Reset impostazioni business a default
     */
    resetBusinessSettings() {
        if (confirm('Ripristinare le impostazioni business ai valori di default?')) {
            const defaultSettings = {
                pivaThreshold: 5000,
                monthlyTarget: 165
            };

            const result = DB.updateSettings(defaultSettings);
            if (result) {
                this.currentSettings = result;
                this.render();
            }
        }
    }

    /**
     * Crea backup completo
     */
    createBackup() {
        try {
            const backup = DB.createBackup();
            if (backup) {
                // Aggiorna info sistema dopo backup
                setTimeout(() => this.render(), 1000);
            }
        } catch (error) {
            handleError(error, 'Errore creazione backup');
        }
    }

    /**
     * Gestisce file backup caricato
     */
    handleBackupFile(input) {
        const file = input.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            NotificationUtils.error('Seleziona un file backup JSON valido');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                this.restoreFromBackup(backupData);
            } catch (error) {
                handleError(error, 'File backup non valido');
            }
        };

        reader.readAsText(file);
        input.value = ''; // Reset input
    }

    /**
     * Ripristina da backup
     */
    restoreFromBackup(backupData) {
        const success = DB.restoreFromBackup(backupData);
        if (success) {
            this.loadSettings();
            this.render();
        }
    }

    /**
     * Pulisci cache
     */
    clearCache() {
        try {
            DB.clearCache();
            NotificationUtils.success('Cache pulita con successo');
        } catch (error) {
            handleError(error, 'Errore pulizia cache');
        }
    }

    /**
     * Compatta dati (placeholder per future ottimizzazioni)
     */
    compactData() {
        try {
            // Per ora solo pulizia cache
            DB.clearCache();
            NotificationUtils.success('Dati compattati con successo');

            // Aggiorna info sistema
            setTimeout(() => this.render(), 500);
        } catch (error) {
            handleError(error, 'Errore compattazione dati');
        }
    }

    /**
     * Reset tutte le impostazioni
     */
    resetAllSettings() {
        const confirmText = 'RESET';
        const userInput = prompt(
            `ATTENZIONE: Questa azione ripristinerà tutte le impostazioni ai valori di default.\n\n` +
            `Digita "${confirmText}" per confermare:`
        );

        if (userInput === confirmText) {
            try {
                // Reset a valori default
                const defaultSettings = {
                    pivaThreshold: 5000,
                    monthlyTarget: 165,
                    currency: 'EUR',
                    dateFormat: 'DD/MM/YYYY',
                    theme: 'dark'
                };

                StorageUtils.save('mbt_settings', defaultSettings);
                this.loadSettings();
                this.render();

                NotificationUtils.success('Impostazioni ripristinate ai valori default');
            } catch (error) {
                handleError(error, 'Errore reset impostazioni');
            }
        } else if (userInput !== null) {
            NotificationUtils.warning('Reset annullato - testo di conferma errato');
        }
    }

    /**
     * Elimina tutti i dati
     */
    deleteAllData() {
        const confirmText = 'ELIMINA TUTTO';
        const userInput = prompt(
            `⚠️ PERICOLO: QUESTA AZIONE ELIMINERÀ PERMANENTEMENTE TUTTI I DATI ⚠️\n\n` +
            `Tutti i dati revenue, impostazioni e metadati saranno cancellati.\n` +
            `Questa operazione NON È REVERSIBILE.\n\n` +
            `Se sei sicuro, digita "${confirmText}" per procedere:`
        );

        if (userInput === confirmText) {
            const finalConfirm = confirm(
                'ULTIMA CONFERMA: Sei assolutamente sicuro di voler eliminare tutti i dati?\n\n' +
                'Questa azione è IRREVERSIBILE.'
            );

            if (finalConfirm) {
                try {
                    // Elimina tutti i dati
                    StorageUtils.remove('mbt_revenue_data');
                    StorageUtils.remove('mbt_settings');
                    StorageUtils.remove('mbt_metadata');

                    NotificationUtils.success('Tutti i dati sono stati eliminati');

                    // Ricarica pagina per re-inizializzare
                    setTimeout(() => window.location.reload(), 2000);
                } catch (error) {
                    handleError(error, 'Errore eliminazione dati');
                }
            }
        } else if (userInput !== null) {
            NotificationUtils.warning('Eliminazione annullata - testo di conferma errato');
        }
    }

    /**
     * Bind eventi
     */
    bindEvents() {
        // Eventi già gestiti nei bind specifici
    }

    /**
     * Bind eventi form
     */
    bindFormEvents() {
        const businessForm = document.getElementById('businessSettingsForm');
        if (businessForm) {
            businessForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(businessForm);
                this.saveBusinessSettings(formData);
            });
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
                    <h3>Errore Caricamento Impostazioni</h3>
                    <p class="text-muted">Si è verificato un errore durante il caricamento delle impostazioni.</p>
                    <button class="btn-primary" onclick="Settings.render()">
                        <i class="fas fa-refresh"></i> Riprova
                    </button>
                </div>
            </div>
        `;
    }
}

// CSS aggiuntivo per settings components
const settingsCSS = `
<style>
.settings-section {
    margin-bottom: var(--spacing-xl);
}

.form-help {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    margin-top: var(--spacing-xs);
    font-weight: normal;
}

.settings-info {
    margin: var(--spacing-lg) 0;
    padding: var(--spacing-md);
    background-color: var(--bg-tertiary);
    border-radius: 6px;
}

.info-item {
    margin-bottom: var(--spacing-sm);
}

.info-item:last-child {
    margin-bottom: 0;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 4px;
    font-size: var(--font-size-sm);
    font-weight: 500;
}

.status-badge.status-success {
    background-color: rgba(46, 160, 67, 0.1);
    color: var(--accent-primary);
}

.status-badge.status-warning {
    background-color: rgba(210, 153, 34, 0.1);
    color: var(--accent-warning);
}

.status-badge.status-danger {
    background-color: rgba(218, 54, 51, 0.1);
    color: var(--accent-danger);
}

.status-badge.status-info {
    background-color: rgba(47, 129, 247, 0.1);
    color: var(--accent-info);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-secondary);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
}

.info-item {
    text-align: center;
}

.info-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
}

.info-value {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--text-primary);
}

.data-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}

.action-group h4 {
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
}

.action-group p {
    margin-bottom: var(--spacing-md);
}

.action-buttons {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.danger-zone .card {
    border-color: var(--accent-danger);
}

.danger-card .card-header {
    background-color: rgba(218, 54, 51, 0.1);
    border-bottom-color: var(--accent-danger);
}

.danger-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.danger-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
}

.danger-info h4 {
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
}

.danger-info p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.btn-warning {
    background-color: var(--accent-warning);
    color: white;
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: 6px;
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.btn-warning:hover {
    background-color: #b8860b;
}

@media (max-width: 768px) {
    .form-actions {
        flex-direction: column;
    }
    
    .info-grid {
        grid-template-columns: 1fr 1fr;
    }
    
    .action-buttons {
        flex-direction: column;
    }
    
    .danger-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
    }
    
    .danger-item button {
        width: 100%;
        justify-content: center;
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', settingsCSS);

// Inizializza settings manager globale
const Settings = new SettingsManager();

// Export per uso globale
window.Settings = Settings;