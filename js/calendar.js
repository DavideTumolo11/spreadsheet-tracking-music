/**
 * MUSIC BUSINESS TRACKER - CALENDAR MODULE V2
 * Full Screen, Complete CRUD, Google Calendar Ready
 */

class CalendarModule {
    constructor() {
        this.container = document.getElementById('calendarContent');
        this.currentDate = new Date();
        this.currentView = 'month';
        this.events = [];
        this.selectedDate = null;

        this.init();
    }

    /**
     * Initialize Calendar Module
     */
    async init() {
        try {
            console.log('🔄 Initializing Calendar Module V2...');

            await this.loadEvents();
            await this.render();
            this.setupEventListeners();
            this.renderCalendar();

            console.log('✅ Calendar Module V2 initialized');
        } catch (error) {
            console.error('❌ Error initializing Calendar:', error);
            this.showError('Errore caricamento Calendar');
        }
    }

    /**
     * Load events from localStorage
     */
    async loadEvents() {
        try {
            const savedEvents = localStorage.getItem('musicBusiness_calendarEvents');
            if (savedEvents) {
                this.events = JSON.parse(savedEvents);
            } else {
                // Create sample events if none exist
                this.createSampleEvents();
                this.saveEvents();
            }
        } catch (error) {
            console.error('Error loading events:', error);
            this.events = [];
        }
    }

    /**
     * Create sample events
     */
    createSampleEvents() {
        const today = new Date();
        this.events = [
            {
                id: 'evt_' + Date.now(),
                title: 'Upload: Nuovo Beat Lofi',
                type: 'video',
                date: this.formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
                time: '18:00',
                description: 'Pubblicazione nuovo beat per studio',
                status: 'scheduled'
            },
            {
                id: 'evt_' + (Date.now() + 1),
                title: 'Editing Video Promozionale',
                type: 'task',
                date: this.formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
                time: '10:00',
                description: 'Completare editing per campagna social',
                status: 'pending'
            },
            {
                id: 'evt_' + (Date.now() + 2),
                title: 'Meeting con Collaboratore',
                type: 'meeting',
                date: this.formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
                time: '15:30',
                description: 'Discussione nuovi progetti',
                status: 'confirmed'
            }
        ];
    }

    /**
     * Render Calendar Interface - FULL SCREEN
     */
    async render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="calendar-fullscreen">
                <!-- Calendar Header -->
                <div class="calendar-header-full">
                    <div class="calendar-nav">
                        <button class="nav-btn" id="prevMonth">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h1 class="current-month" id="currentMonth">${this.formatMonthYear(this.currentDate)}</h1>
                        <button class="nav-btn" id="nextMonth">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    
                    <div class="calendar-actions">
                        <button class="btn btn-outline" id="todayBtn">
                            <i class="fas fa-calendar-day"></i>
                            Oggi
                        </button>
                        <button class="btn btn-secondary" id="addRevenueBtn">
                            <i class="fas fa-euro-sign"></i>
                            Aggiungi Entrata
                        </button>
                        <button class="btn btn-outline" id="exportDataBtn">
                            <i class="fas fa-download"></i>
                            Export Dati
                        </button>
                        <button class="btn btn-primary" id="addEventBtn">
                            <i class="fas fa-plus"></i>
                            Nuovo Evento
                        </button>
                    </div>
                </div>

                <!-- Calendar Grid - FULL SIZE -->
                <div class="calendar-main-full">
                    <!-- Days Header -->
                    <div class="calendar-days-header">
                        <div class="day-name">Domenica</div>
                        <div class="day-name">Lunedì</div>
                        <div class="day-name">Martedì</div>
                        <div class="day-name">Mercoledì</div>
                        <div class="day-name">Giovedì</div>
                        <div class="day-name">Venerdì</div>
                        <div class="day-name">Sabato</div>
                    </div>
                    
                    <!-- Calendar Days Grid -->
                    <div class="calendar-grid-full" id="calendarGrid">
                        <!-- Calendar days will be rendered here -->
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="calendar-quick-stats">
                    <div class="quick-stat">
                        <span class="stat-number" id="eventsThisMonth">0</span>
                        <span class="stat-label">Eventi questo mese</span>
                    </div>
                    <div class="quick-stat">
                        <span class="stat-number" id="upcomingEvents">0</span>
                        <span class="stat-label">Prossimi eventi</span>
                    </div>
                    <div class="quick-stat">
                        <span class="stat-number" id="completedEvents">0</span>
                        <span class="stat-label">Eventi completati</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup Event Listeners
     */
    setupEventListeners() {
        // Navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        document.getElementById('todayBtn').addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });

        // Add event
        document.getElementById('addEventBtn').addEventListener('click', () => {
            this.openEventModal();
        });

        // Add revenue - redirect to revenue page
        document.getElementById('addRevenueBtn').addEventListener('click', () => {
            if (window.musicApp && window.musicApp.navigateToPage) {
                window.musicApp.navigateToPage('revenue');
                // Show add revenue modal after navigation
                setTimeout(() => {
                    if (window.revenueModule && window.revenueModule.openAddRevenueModal) {
                        window.revenueModule.openAddRevenueModal();
                    }
                }, 500);
            } else {
                // Fallback: direct navigation
                window.location.hash = '#revenue';
                this.showToast('Vai alla sezione Revenue per aggiungere entrate', 'info');
            }
        });

        // Export data
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportCalendarData();
        });

        // Global click handler for closing modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
    }

    /**
     * Render Calendar Grid - FULL SCREEN
     */
    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        if (!grid) return;

        // Update month display
        document.getElementById('currentMonth').textContent = this.formatMonthYear(this.currentDate);

        // Get calendar data
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

        const today = new Date();
        let html = '';

        // Generate 6 weeks (42 days)
        for (let week = 0; week < 6; week++) {
            html += '<div class="calendar-week-row">';

            for (let day = 0; day < 7; day++) {
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + (week * 7) + day);

                const dayNumber = cellDate.getDate();
                const isCurrentMonth = cellDate.getMonth() === this.currentDate.getMonth();
                const isToday = this.isSameDay(cellDate, today);
                const dayEvents = this.getEventsForDate(this.formatDate(cellDate));

                let cellClass = 'calendar-day-cell';
                if (!isCurrentMonth) cellClass += ' other-month';
                if (isToday) cellClass += ' today';
                if (dayEvents.length > 0) cellClass += ' has-events';

                html += `<div class="${cellClass}" data-date="${this.formatDate(cellDate)}">
                    <div class="day-number">${dayNumber}</div>
                    <div class="day-events">`;

                // Show events (max 3 visible)
                dayEvents.slice(0, 3).forEach(event => {
                    html += `<div class="event-item ${event.type}" data-event-id="${event.id}">
                        <span class="event-time">${event.time}</span>
                        <span class="event-title">${this.truncateText(event.title, 20)}</span>
                    </div>`;
                });

                if (dayEvents.length > 3) {
                    html += `<div class="more-events">+${dayEvents.length - 3} altri</div>`;
                }

                html += `</div></div>`;
            }
            html += '</div>';
        }

        grid.innerHTML = html;

        // Add click listeners
        this.addCalendarListeners();
        this.updateQuickStats();
    }

    /**
     * Add click listeners to calendar
     */
    addCalendarListeners() {
        // Day cell clicks
        document.querySelectorAll('.calendar-day-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (!e.target.closest('.event-item')) {
                    const date = cell.dataset.date;
                    this.selectedDate = date;
                    this.openEventModal(null, date);
                }
            });
        });

        // Event item clicks
        document.querySelectorAll('.event-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = item.dataset.eventId;
                this.openEventDetails(eventId);
            });
        });
    }

    /**
     * Open Event Modal
     */
    openEventModal(eventId = null, date = null) {
        const isEdit = !!eventId;
        const event = isEdit ? this.events.find(e => e.id === eventId) : null;
        const modalDate = date || (event ? event.date : this.formatDate(new Date()));

        const modalHTML = `
            <div class="modal-overlay" id="eventModal">
                <div class="modal event-modal-large">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Modifica Evento' : 'Nuovo Evento'}</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="eventForm" class="event-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Titolo *</label>
                                    <input type="text" id="eventTitle" class="form-input" 
                                           value="${event ? event.title : ''}" required>
                                </div>

                                <div class="form-group">
                                    <label>Tipo</label>
                                    <select id="eventType" class="form-input">
                                        <option value="video" ${event?.type === 'video' ? 'selected' : ''}>📹 Video Upload</option>
                                        <option value="task" ${event?.type === 'task' ? 'selected' : ''}>📋 Task</option>
                                        <option value="meeting" ${event?.type === 'meeting' ? 'selected' : ''}>👥 Meeting</option>
                                        <option value="deadline" ${event?.type === 'deadline' ? 'selected' : ''}>⏰ Deadline</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>Data *</label>
                                    <input type="date" id="eventDate" class="form-input" 
                                           value="${modalDate}" required>
                                </div>

                                <div class="form-group">
                                    <label>Ora *</label>
                                    <input type="time" id="eventTime" class="form-input" 
                                           value="${event ? event.time : '09:00'}" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Descrizione</label>
                                <textarea id="eventDescription" class="form-input" rows="3" 
                                          placeholder="Aggiungi dettagli...">${event ? event.description || '' : ''}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Status</label>
                                <select id="eventStatus" class="form-input">
                                    <option value="scheduled" ${event?.status === 'scheduled' ? 'selected' : ''}>📅 Programmato</option>
                                    <option value="pending" ${event?.status === 'pending' ? 'selected' : ''}>⏳ In Attesa</option>
                                    <option value="confirmed" ${event?.status === 'confirmed' ? 'selected' : ''}>✅ Confermato</option>
                                    <option value="completed" ${event?.status === 'completed' ? 'selected' : ''}>🎉 Completato</option>
                                    <option value="cancelled" ${event?.status === 'cancelled' ? 'selected' : ''}>❌ Annullato</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        ${isEdit ? `<button type="button" class="btn btn-error" onclick="window.calendarModule.deleteEvent('${eventId}')">
                            <i class="fas fa-trash"></i> Elimina
                        </button>` : ''}
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="window.calendarModule.saveEvent('${eventId || ''}')">
                            <i class="fas fa-save"></i> ${isEdit ? 'Aggiorna' : 'Salva'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        window.calendarModule = this; // Make accessible for onclick handlers
    }

    /**
     * Open Event Details
     */
    openEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const modalHTML = `
            <div class="modal-overlay" id="eventDetailsModal">
                <div class="modal event-details-modal">
                    <div class="modal-header">
                        <h3>${event.title}</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="event-details">
                            <div class="detail-row">
                                <span class="detail-label">Tipo:</span>
                                <span class="detail-value">
                                    <span class="event-type-badge ${event.type}">
                                        ${this.getTypeIcon(event.type)} ${this.getTypeLabel(event.type)}
                                    </span>
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Data:</span>
                                <span class="detail-value">${this.formatDateFull(new Date(event.date))}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Ora:</span>
                                <span class="detail-value">${event.time}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Status:</span>
                                <span class="detail-value">
                                    <span class="status-badge ${event.status}">
                                        ${this.getStatusLabel(event.status)}
                                    </span>
                                </span>
                            </div>
                            ${event.description ? `
                                <div class="detail-row">
                                    <span class="detail-label">Descrizione:</span>
                                    <span class="detail-value">${event.description}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" onclick="window.calendarModule.openEventModal('${event.id}')">
                            <i class="fas fa-edit"></i> Modifica
                        </button>
                        <button type="button" class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Chiudi</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Save Event
     */
    saveEvent(eventId = '') {
        const form = document.getElementById('eventForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const eventData = {
            title: document.getElementById('eventTitle').value.trim(),
            type: document.getElementById('eventType').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            description: document.getElementById('eventDescription').value.trim(),
            status: document.getElementById('eventStatus').value
        };

        if (eventId) {
            // Update existing event
            const eventIndex = this.events.findIndex(e => e.id === eventId);
            if (eventIndex !== -1) {
                this.events[eventIndex] = { ...this.events[eventIndex], ...eventData };
                this.showToast('Evento aggiornato con successo!', 'success');
            }
        } else {
            // Create new event
            const newEvent = {
                id: 'evt_' + Date.now(),
                ...eventData
            };
            this.events.push(newEvent);
            this.showToast('Evento creato con successo!', 'success');
        }

        this.saveEvents();
        this.renderCalendar();
        this.closeModal();
    }

    /**
     * Delete Event
     */
    deleteEvent(eventId) {
        if (confirm('Sei sicuro di voler eliminare questo evento?')) {
            this.events = this.events.filter(e => e.id !== eventId);
            this.saveEvents();
            this.renderCalendar();
            this.closeModal();
            this.showToast('Evento eliminato!', 'success');
        }
    }

    /**
     * Save events to localStorage
     */
    saveEvents() {
        try {
            localStorage.setItem('musicBusiness_calendarEvents', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error saving events:', error);
            this.showToast('Errore durante il salvataggio', 'error');
        }
    }

    /**
     * Update quick stats
     */
    updateQuickStats() {
        const now = new Date();
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();

        // Events this month
        const eventsThisMonth = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        }).length;

        // Upcoming events (next 7 days)
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingEvents = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= nextWeek;
        }).length;

        // Completed events this month
        const completedEvents = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return event.status === 'completed' &&
                eventDate.getMonth() === currentMonth &&
                eventDate.getFullYear() === currentYear;
        }).length;

        // Update UI
        document.getElementById('eventsThisMonth').textContent = eventsThisMonth;
        document.getElementById('upcomingEvents').textContent = upcomingEvents;
        document.getElementById('completedEvents').textContent = completedEvents;
    }

    /**
     * Close modal
     */
    closeModal() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.remove());
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * Get events for specific date
     */
    getEventsForDate(date) {
        return this.events.filter(event => event.date === date);
    }

    /**
     * Check if two dates are the same day
     */
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    /**
     * Format date as YYYY-MM-DD
     */
    formatDate(date) {
        return date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
    }

    /**
     * Format month and year
     */
    formatMonthYear(date) {
        return date.toLocaleDateString('it-IT', {
            month: 'long',
            year: 'numeric'
        });
    }

    /**
     * Format date full
     */
    formatDateFull(date) {
        return date.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Truncate text
     */
    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * Get type icon
     */
    getTypeIcon(type) {
        const icons = {
            video: '📹',
            task: '📋',
            meeting: '👥',
            deadline: '⏰'
        };
        return icons[type] || '📅';
    }

    /**
     * Get type label
     */
    getTypeLabel(type) {
        const labels = {
            video: 'Video Upload',
            task: 'Task',
            meeting: 'Meeting',
            deadline: 'Deadline'
        };
        return labels[type] || type;
    }

    /**
     * Get status label
     */
    getStatusLabel(status) {
        const labels = {
            scheduled: 'Programmato',
            pending: 'In Attesa',
            confirmed: 'Confermato',
            completed: 'Completato',
            cancelled: 'Annullato'
        };
        return labels[status] || status;
    }

    /**
     * Export calendar data
     */
    async exportCalendarData() {
        try {
            const exportData = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                events: this.events,
                settings: {
                    exportType: 'calendar',
                    totalEvents: this.events.length
                }
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `calendar-events-${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);

            this.showToast('📅 Eventi calendar esportati!', 'success');
        } catch (error) {
            console.error('Error exporting calendar data:', error);
            this.showToast('❌ Errore durante l\'export', 'error');
        }
    }
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Errore Calendar</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Ricarica Pagina
                    </button>
                </div>
            `;
        }
    }

    /**
     * Refresh calendar
     */
    async refresh() {
        await this.loadEvents();
        this.renderCalendar();
    }

    /**
     * Destroy calendar
     */
    destroy() {
        this.events = [];
        this.closeModal();
    }
}

// Initialize Calendar Module
window.CalendarModule = CalendarModule;