/**
 * MUSIC BUSINESS TRACKER - UTILITY FUNCTIONS
 * Common utility functions used across the application
 */

window.Utils = {

    // ===== DATE & TIME UTILITIES =====

    /**
     * Format date to Italian locale
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);
        const options = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            medium: { day: '2-digit', month: 'short', year: 'numeric' },
            long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        };

        return d.toLocaleDateString('it-IT', options[format] || options.short);
    },

    /**
     * Get relative time (es: "2 ore fa", "3 giorni fa")
     */
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 60) return 'Adesso';
        if (minutes < 60) return `${minutes} minuto${minutes > 1 ? 'i' : ''} fa`;
        if (hours < 24) return `${hours} ora${hours > 1 ? 'e' : ''} fa`;
        if (days < 7) return `${days} giorno${days > 1 ? 'i' : ''} fa`;
        if (weeks < 4) return `${weeks} settimana${weeks > 1 ? 'e' : ''} fa`;
        if (months < 12) return `${months} mese${months > 1 ? 'i' : ''} fa`;
        return `${years} anno${years > 1 ? 'i' : ''} fa`;
    },

    /**
     * Get date range for specific period
     */
    getDateRange(period) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (period) {
            case 'today':
                return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };

            case 'yesterday':
                const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                return { start: yesterday, end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1) };

            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
                return { start: weekStart, end: now };

            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                return { start: monthStart, end: now };

            case 'quarter':
                const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
                const quarterStart = new Date(today.getFullYear(), quarterMonth, 1);
                return { start: quarterStart, end: now };

            case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                return { start: yearStart, end: now };

            case 'last7days':
                const last7 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                return { start: last7, end: now };

            case 'last30days':
                const last30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                return { start: last30, end: now };

            default:
                return { start: today, end: now };
        }
    },

    /**
     * Check if date is in range
     */
    isDateInRange(date, range) {
        const d = new Date(date);
        return d >= range.start && d <= range.end;
    },

    // ===== NUMBER & CURRENCY UTILITIES =====

    /**
     * Format currency
     */
    formatCurrency(amount, currency = '€', decimals = 2) {
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: currency === '€' ? 'EUR' : currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },

    /**
     * Format number with thousands separator
     */
    formatNumber(number, decimals = 0) {
        return new Intl.NumberFormat('it-IT', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number || 0);
    },

    /**
     * Format percentage
     */
    formatPercentage(value, decimals = 1) {
        return new Intl.NumberFormat('it-IT', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format((value || 0) / 100);
    },

    /**
     * Calculate percentage change
     */
    calculatePercentageChange(oldValue, newValue) {
        if (!oldValue || oldValue === 0) return newValue > 0 ? 100 : 0;
        return ((newValue - oldValue) / oldValue) * 100;
    },

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Generate color based on value (for charts)
     */
    getColorByValue(value, min = 0, max = 100) {
        const percentage = (value - min) / (max - min);
        const hue = percentage * 120; // 0 = red, 120 = green
        return `hsl(${hue}, 70%, 50%)`;
    },

    // ===== STRING UTILITIES =====

    /**
     * Capitalize first letter
     */
    capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
    },

    /**
     * Convert to title case
     */
    toTitleCase(str) {
        return str ? str.replace(/\w\S*/g, txt =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        ) : '';
    },

    /**
     * Generate slug from string
     */
    slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Truncate string
     */
    truncate(str, length = 50, suffix = '...') {
        if (!str || str.length <= length) return str;
        return str.substring(0, length).trim() + suffix;
    },

    /**
     * Extract hashtags from text
     */
    extractHashtags(text) {
        if (!text) return [];
        const matches = text.match(/#[\w]+/g);
        return matches ? matches.map(tag => tag.substring(1)) : [];
    },

    /**
     * Clean and validate email
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Generate random string
     */
    randomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // ===== ARRAY & OBJECT UTILITIES =====

    /**
     * Group array by property
     */
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    },

    /**
     * Sort array by multiple fields
     */
    sortBy(array, ...fields) {
        return array.sort((a, b) => {
            for (let field of fields) {
                let dir = 1;
                if (field.startsWith('-')) {
                    dir = -1;
                    field = field.substring(1);
                }

                if (a[field] < b[field]) return -1 * dir;
                if (a[field] > b[field]) return 1 * dir;
            }
            return 0;
        });
    },

    /**
     * Get unique values from array
     */
    unique(array, key = null) {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        }
        return [...new Set(array)];
    },

    /**
     * Deep clone object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
    },

    /**
     * Merge objects deeply
     */
    deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.deepMerge(target, ...sources);
    },

    /**
     * Check if value is object
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    /**
     * Get nested property safely
     */
    getNestedProperty(obj, path, defaultValue = null) {
        const keys = path.split('.');
        let result = obj;

        for (let key of keys) {
            if (result === null || result === undefined || !(key in result)) {
                return defaultValue;
            }
            result = result[key];
        }

        return result;
    },

    /**
     * Set nested property
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = obj;

        for (let key of keys) {
            if (!(key in current) || !this.isObject(current[key])) {
                current[key] = {};
            }
            current = current[key];
        }

        current[lastKey] = value;
        return obj;
    },

    // ===== VALIDATION UTILITIES =====

    /**
     * Validate required fields
     */
    validateRequired(data, fields) {
        const errors = [];
        fields.forEach(field => {
            if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
                errors.push(`${field} è obbligatorio`);
            }
        });
        return errors;
    },

    /**
     * Validate number range
     */
    validateRange(value, min, max, fieldName = 'Valore') {
        const num = parseFloat(value);
        if (isNaN(num)) return `${fieldName} deve essere un numero`;
        if (num < min) return `${fieldName} deve essere almeno ${min}`;
        if (num > max) return `${fieldName} non può superare ${max}`;
        return null;
    },

    /**
     * Validate date
     */
    validateDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    },

    /**
     * Sanitize input for XSS prevention
     */
    sanitizeInput(str) {
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    // ===== FILE & EXPORT UTILITIES =====

    /**
     * Download data as JSON file
     */
    downloadJSON(data, filename = 'data.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    },

    /**
     * Download data as CSV file
     */
    downloadCSV(data, filename = 'data.csv', headers = null) {
        if (!data.length) return;

        const csvHeaders = headers || Object.keys(data[0]);
        const csvContent = [
            csvHeaders.join(','),
            ...data.map(row =>
                csvHeaders.map(header => {
                    let value = row[header] || '';
                    // Escape quotes and wrap in quotes if contains comma
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        value = '"' + value.replace(/"/g, '""') + '"';
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadBlob(blob, filename);
    },

    /**
     * Download blob as file
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Read file as text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    },

    /**
     * Parse CSV content
     */
    parseCSV(csvContent, hasHeaders = true) {
        const lines = csvContent.trim().split('\n');
        const headers = hasHeaders ? lines.shift().split(',') : null;

        return lines.map(line => {
            const values = line.split(',').map(value => {
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    return value.slice(1, -1).replace(/""/g, '"');
                }
                return value;
            });

            if (headers) {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header.trim()] = values[index] || '';
                });
                return obj;
            }

            return values;
        });
    },

    // ===== DOM UTILITIES =====

    /**
     * Create DOM element with attributes
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return element;
    },

    /**
     * Animate element using CSS transitions
     */
    animate(element, properties, duration = 300) {
        return new Promise(resolve => {
            const originalTransition = element.style.transition;
            element.style.transition = `all ${duration}ms ease`;

            Object.keys(properties).forEach(prop => {
                element.style[prop] = properties[prop];
            });

            setTimeout(() => {
                element.style.transition = originalTransition;
                resolve();
            }, duration);
        });
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    },

    /**
     * Debounce function execution
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function execution
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // ===== LOCAL STORAGE UTILITIES =====

    /**
     * Safe localStorage setItem
     */
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },

    /**
     * Safe localStorage getItem
     */
    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Clear localStorage with confirmation
     */
    clearLocalStorage(confirm = true) {
        if (confirm && !window.confirm('Sei sicuro di voler cancellare tutti i dati locali?')) {
            return false;
        }

        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    },

    // ===== CHART UTILITIES =====

    /**
     * Generate chart colors
     */
    generateChartColors(count, opacity = 1) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 360 / count) % 360;
            colors.push(`hsla(${hue}, 70%, 50%, ${opacity})`);
        }
        return colors;
    },

    /**
     * Get chart theme colors
     */
    getChartTheme() {
        return {
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            gridColor: 'rgba(100, 116, 139, 0.3)',
            textColor: '#f8fafc'
        };
    },

    /**
     * Format chart data for time series
     */
    formatTimeSeriesData(data, dateField, valueField) {
        return data
            .sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]))
            .map(item => ({
                x: item[dateField],
                y: item[valueField]
            }));
    },

    // ===== ANALYTICS UTILITIES =====

    /**
     * Calculate growth rate
     */
    calculateGrowthRate(currentValue, previousValue) {
        if (!previousValue || previousValue === 0) {
            return currentValue > 0 ? 100 : 0;
        }
        return ((currentValue - previousValue) / previousValue) * 100;
    },

    /**
     * Calculate moving average
     */
    calculateMovingAverage(data, period) {
        const result = [];
        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const average = slice.reduce((sum, val) => sum + val, 0) / period;
            result.push(average);
        }
        return result;
    },

    /**
     * Calculate trend
     */
    calculateTrend(data) {
        if (data.length < 2) return 'stable';

        const first = data[0];
        const last = data[data.length - 1];
        const growth = this.calculateGrowthRate(last, first);

        if (growth > 5) return 'up';
        if (growth < -5) return 'down';
        return 'stable';
    },

    /**
     * Get trend icon
     */
    getTrendIcon(trend) {
        const icons = {
            up: 'fa-arrow-up',
            down: 'fa-arrow-down',
            stable: 'fa-minus'
        };
        return icons[trend] || icons.stable;
    },

    /**
     * Get trend color
     */
    getTrendColor(trend) {
        const colors = {
            up: 'var(--accent-green)',
            down: 'var(--accent-red)',
            stable: 'var(--text-muted)'
        };
        return colors[trend] || colors.stable;
    },

    // ===== ERROR HANDLING =====

    /**
     * Handle async operations with error catching
     */
    async handleAsync(asyncFn, errorMessage = 'Operazione fallita') {
        try {
            return await asyncFn();
        } catch (error) {
            console.error(errorMessage, error);
            if (window.App) {
                window.App.showNotification(errorMessage, 'error');
            }
            throw error;
        }
    },

    /**
     * Retry async operation
     */
    async retry(asyncFn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await asyncFn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    },

    // ===== PLATFORM SPECIFIC UTILITIES =====

    /**
     * Get platform icon
     */
    getPlatformIcon(platform) {
        const icons = {
            'youtube': 'fab fa-youtube',
            'spotify': 'fab fa-spotify',
            'apple': 'fab fa-apple',
            'amazon': 'fab fa-amazon',
            'soundcloud': 'fab fa-soundcloud',
            'bandcamp': 'fas fa-music',
            'distrokid': 'fas fa-compact-disc',
            'other': 'fas fa-globe'
        };

        const key = platform.toLowerCase();
        return icons[key] || icons.other;
    },

    /**
     * Get platform color
     */
    getPlatformColor(platform) {
        const colors = {
            'youtube': '#FF0000',
            'spotify': '#1DB954',
            'apple': '#000000',
            'amazon': '#FF9900',
            'soundcloud': '#FF3300',
            'bandcamp': '#629AA0',
            'distrokid': '#7B68EE',
            'other': '#6B7280'
        };

        const key = platform.toLowerCase();
        return colors[key] || colors.other;
    },

    /**
     * Format YouTube URL
     */
    formatYouTubeURL(videoId) {
        if (!videoId) return '';
        if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
            return videoId;
        }
        return `https://www.youtube.com/watch?v=${videoId}`;
    },

    /**
     * Extract YouTube video ID
     */
    extractYouTubeId(url) {
        if (!url) return '';
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : url;
    }
};

// Make utils available globally
window.Utils = window.Utils;