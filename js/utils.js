/**
 * 🛠️ MUSIC BUSINESS TRACKER - UTILS.JS
 * Funzioni di utilità essenziali per l'app
 */

// === DATE UTILITIES ===
const DateUtils = {
    /**
     * Formatta data in formato italiano DD/MM/YYYY
     */
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    },

    /**
     * Formatta data per input HTML (YYYY-MM-DD)
     */
    formatDateForInput(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Ottiene data corrente formattata
     */
    getCurrentDate() {
        return this.formatDate(new Date());
    },

    /**
     * Ottiene inizio mese corrente
     */
    getCurrentMonthStart() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    },

    /**
     * Ottiene fine mese corrente
     */
    getCurrentMonthEnd() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    },

    /**
     * Converte stringa data italiana in oggetto Date
     */
    parseItalianDate(dateString) {
        if (!dateString) return null;
        const parts = dateString.split('/');
        if (parts.length !== 3) return null;
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
};

// === NUMBER UTILITIES ===
const NumberUtils = {
    /**
     * Formatta numero come valuta euro
     */
    formatCurrency(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) return '€0,00';
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Formatta numero come percentuale
     */
    formatPercentage(value, decimals = 1) {
        if (value === null || value === undefined || isNaN(value)) return '0%';
        return new Intl.NumberFormat('it-IT', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value / 100);
    },

    /**
     * Formatta numero con separatori migliaia
     */
    formatNumber(number, decimals = 0) {
        if (number === null || number === undefined || isNaN(number)) return '0';
        return new Intl.NumberFormat('it-IT', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    },

    /**
     * Calcola variazione percentuale
     */
    calculatePercentageChange(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    },

    /**
     * Converte stringa in numero pulito
     */
    parseNumber(value) {
        if (typeof value === 'number') return value;
        if (typeof value !== 'string') return 0;

        // Rimuove simboli valuta e spazi
        const cleaned = value.replace(/[€$£,\s]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
};

// === LOCALSTORAGE UTILITIES ===
const StorageUtils = {
    /**
     * Verifica se localStorage è disponibile e funzionante
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('LocalStorage non disponibile:', error);
            return false;
        }
    },

    /**
     * Salva dati nel localStorage con gestione errori
     */
    save(key, data) {
        try {
            if (!this.isAvailable()) {
                console.error('LocalStorage non disponibile');
                return false;
            }

            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            console.error('Errore salvataggio localStorage:', error);
            if (typeof NotificationUtils !== 'undefined') {
                NotificationUtils.show('Errore nel salvataggio dati', 'error');
            }
            return false;
        }
    },

    /**
     * Carica dati dal localStorage
     */
    load(key, defaultValue = null) {
        try {
            if (!this.isAvailable()) {
                return defaultValue;
            }

            const data = localStorage.getItem(key);
            if (data === null) return defaultValue;
            return JSON.parse(data);
        } catch (error) {
            console.error('Errore caricamento localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Rimuove chiave dal localStorage
     */
    remove(key) {
        try {
            if (!this.isAvailable()) {
                return false;
            }

            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Errore rimozione localStorage:', error);
            return false;
        }
    },

    /**
     * Verifica se chiave esiste
     */
    exists(key) {
        if (!this.isAvailable()) {
            return false;
        }
        return localStorage.getItem(key) !== null;
    },

    /**
     * Ottiene dimensione storage utilizzata
     */
    getStorageSize() {
        if (!this.isAvailable()) {
            return 0;
        }

        let total = 0;
        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
        } catch (error) {
            console.error('Errore calcolo dimensione storage:', error);
        }
        return total;
    }
};

// === NOTIFICATION SYSTEM ===
const NotificationUtils = {
    /**
     * Mostra notifica
     */
    show(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notifications');
        if (!container) {
            console.log(`Notification (${type}): ${message}`);
            return;
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icon = this.getIcon(type);
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto-remove dopo duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    },

    /**
     * Ottiene icona per tipo notifica
     */
    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    /**
     * Shortcuts per tipi specifici
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// === VALIDATION UTILITIES ===
const ValidationUtils = {
    /**
     * Valida email
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Valida numero
     */
    isValidNumber(value) {
        return !isNaN(value) && isFinite(value);
    },

    /**
     * Valida data
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },

    /**
     * Valida campo obbligatorio
     */
    isRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    /**
     * Valida importo positivo
     */
    isPositiveAmount(amount) {
        const num = NumberUtils.parseNumber(amount);
        return this.isValidNumber(num) && num > 0;
    },

    /**
     * Valida stringa non vuota
     */
    isNonEmptyString(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }
};

// === EXPORT UTILITIES ===
const ExportUtils = {
    /**
     * Esporta dati come JSON
     */
    exportJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        this.downloadFile(jsonStr, filename, 'application/json');
    },

    /**
     * Esporta dati come CSV
     */
    exportCSV(data, filename, headers) {
        if (!Array.isArray(data) || data.length === 0) {
            if (typeof NotificationUtils !== 'undefined') {
                NotificationUtils.warning('Nessun dato da esportare');
            }
            return;
        }

        let csv = '';

        // Headers
        if (headers && Array.isArray(headers)) {
            csv += headers.join(',') + '\n';
        } else {
            csv += Object.keys(data[0]).join(',') + '\n';
        }

        // Data rows
        data.forEach(row => {
            const values = Object.values(row).map(value => {
                // Gestione valori con virgole o virgolette
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            });
            csv += values.join(',') + '\n';
        });

        this.downloadFile(csv, filename, 'text/csv');
    },

    /**
     * Download file helper
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        
        if (typeof NotificationUtils !== 'undefined') {
            NotificationUtils.success(`File ${filename} scaricato con successo`);
        }
    }
};

// === DOM UTILITIES ===
const DOMUtils = {
    /**
     * Crea elemento con attributi
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });

        if (content) {
            element.textContent = content;
        }

        return element;
    },

    /**
     * Svuota contenuto elemento
     */
    clearElement(element) {
        if (element) {
            element.innerHTML = '';
        }
    },

    /**
     * Mostra/nascondi elemento
     */
    toggleElement(element, show) {
        if (!element) return;

        if (show === undefined) {
            show = element.style.display === 'none';
        }

        element.style.display = show ? 'block' : 'none';
    },

    /**
     * Scroll smooth verso elemento
     */
    scrollToElement(element, offset = 0) {
        if (!element) return;

        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
};

// === UTILITY FUNCTIONS GLOBALI ===

/**
 * Debounce function per limitare chiamate frequenti
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Genera ID unico
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Copia testo negli appunti
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        if (typeof NotificationUtils !== 'undefined') {
            NotificationUtils.success('Copiato negli appunti');
        }
        return true;
    } catch (error) {
        console.error('Errore copia clipboard:', error);
        if (typeof NotificationUtils !== 'undefined') {
            NotificationUtils.error('Errore nella copia');
        }
        return false;
    }
}

/**
 * Gestione errori globale
 */
function handleError(error, message = 'Si è verificato un errore') {
    console.error('Errore applicazione:', error);
    if (typeof NotificationUtils !== 'undefined') {
        NotificationUtils.error(message);
    }
}

// === EXPORT PER USO GLOBALE ===
window.DateUtils = DateUtils;
window.NumberUtils = NumberUtils;
window.StorageUtils = StorageUtils;
window.NotificationUtils = NotificationUtils;
window.ValidationUtils = ValidationUtils;
window.ExportUtils = ExportUtils;
window.DOMUtils = DOMUtils;
window.debounce = debounce;
window.generateId = generateId;
window.copyToClipboard = copyToClipboard;
window.handleError = handleError;
