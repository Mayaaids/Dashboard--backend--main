// F1 Live Registration Dashboard - Main Logic

class F1Dashboard {
    constructor() {
        this.data = [];
        this.previousData = [];
        this.eventStats = {};
        this.chart = null;
        this.lastUpdateTime = null;
        this.eventGrowthRates = {};
        this.headers = [];
        this.detailsShowAll = false;

        this.init();
    }

    init() {
        this.updateTimestamp();
        this.initChart();
        this.startAutoRefresh();
        this.updateConnectionStatus('connecting');

        // Wire event details modal controls
        const backdrop = document.getElementById('eventDetailsBackdrop');
        const closeBtn = document.getElementById('eventDetailsClose');
        const toggleBtn = document.getElementById('eventDetailsToggle');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.hideEventDetails());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideEventDetails());
        }
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.detailsShowAll = !this.detailsShowAll;
                toggleBtn.classList.toggle('active', this.detailsShowAll);
                toggleBtn.textContent = this.detailsShowAll ? 'SHOW LESS' : 'SHOW ALL';

                // Re-render if modal is open
                const modal = document.getElementById('eventDetailsModal');
                if (modal && modal.classList.contains('open')) {
                    const currentTitle = document.getElementById('eventDetailsTitle')?.textContent || '';
                    const eventName = currentTitle.trim();
                    // Stored title is uppercased; find matching key case-insensitively
                    const match = Object.keys(this.eventStats).find(k => k.toUpperCase() === eventName);
                    if (match) this.showEventDetails(match);
                }
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideEventDetails();
            }
        });

        // Initial data load
        this.fetchData();

        // Update timestamp every second
        setInterval(() => this.updateTimestamp(), 1000);
    }

    async fetchData() {
        try {
            // Fetch live data from Google Sheets via backend Excel endpoint
            const response = await fetch(`${CONFIG.BACKEND_URL}/api/register/excel`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
                this.previousData = [...this.data];
                // Backend already maps each row so that `event` is the cleaned sheet/tab name
                this.data = result.data;
                this.processData();
                this.updateConnectionStatus('connected');
            } else {
                throw new Error('Invalid data format from backend');
            }
        } catch (error) {
            console.error('Error fetching data from backend:', error);
            this.updateConnectionStatus('error');
            // Do NOT load demo data here; we only want real events from the sheet
        }
    }

loadDemoData() {
    // Demo data for testing when API is not configured
    const demoEvents = ['Hackathon', 'Code Sprint', 'AI Challenge', 'Web Dev', 'Mobile App'];
    const demoColleges = ['MIT', 'Stanford', 'Harvard', 'Berkeley', 'Caltech'];
    const demoNames = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sarah Williams', 'Mike Brown'];

    this.data = [];
    for (let i = 0; i < 50; i++) {
        this.data.push({
            id: i + 1,
            timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            name: demoNames[Math.floor(Math.random() * demoNames.length)],
            college: demoColleges[Math.floor(Math.random() * demoColleges.length)],
            event: demoEvents[Math.floor(Math.random() * demoEvents.length)]
        });
    }

    this.processData();
    this.updateConnectionStatus('connected');
}

processData() {
    // Calculate event-wise statistics
    const newEventStats = {};
    const currentTime = Date.now();

    this.data.forEach(participant => {
        const eventName = participant.event.trim() || 'Unknown';

        if (!newEventStats[eventName]) {
            newEventStats[eventName] = {
                name: eventName,
                count: 0,
                participants: []
            };
        }

        newEventStats[eventName].count++;
        newEventStats[eventName].participants.push(participant);
    });

    // Calculate growth rates
    if (this.lastUpdateTime) {
        const timeDiff = (currentTime - this.lastUpdateTime) / 60000; // minutes
        Object.keys(newEventStats).forEach(eventName => {
            const oldCount = this.eventStats[eventName]?.count || 0;
            const newCount = newEventStats[eventName].count;
            const growth = newCount - oldCount;
            const growthRate = timeDiff > 0 ? (growth / timeDiff).toFixed(1) : 0;

            this.eventGrowthRates[eventName] = {
                growth: growth,
                rate: parseFloat(growthRate)
            };
        });
    }

    this.eventStats = newEventStats;
    this.lastUpdateTime = currentTime;

    // Update UI
    this.updateTotalCounter();
    this.updateEventCards();
    this.updateRecentTicker();
    this.updateChart();
}

updateTotalCounter() {
    const totalElement = document.getElementById('totalCounter');
    const newTotal = this.data.length;
    const oldTotal = parseInt(totalElement.textContent) || 0;

    if (newTotal !== oldTotal) {
        totalElement.classList.add('updating');
        totalElement.textContent = newTotal.toLocaleString();

        setTimeout(() => {
            totalElement.classList.remove('updating');
        }, 500);
    } else {
        totalElement.textContent = newTotal.toLocaleString();
    }
}

updateEventCards() {
    const eventsGrid = document.getElementById('eventsGrid');
    const totalParticipants = this.data.length;

    // Sort events by count (descending)
    const sortedEvents = Object.values(this.eventStats).sort((a, b) => b.count - a.count);

    eventsGrid.innerHTML = '';

    sortedEvents.forEach(event => {
        const percentage = totalParticipants > 0
            ? ((event.count / totalParticipants) * 100).toFixed(1)
            : 0;

        const growthInfo = this.eventGrowthRates[event.name] || { growth: 0, rate: 0 };

        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
                <div class="event-header">
                    <div class="event-name">${event.name}</div>
                    <div class="event-count" data-count="${event.count}">${event.count}</div>
                </div>
                <div class="event-stats">
                    <div class="event-percentage">
                        <span>Contribution</span>
                        <span class="percentage-value">${percentage}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percentage}%"></div>
                    </div>
                    ${growthInfo.growth > 0 ? `
                        <div class="event-percentage" style="margin-top: 8px; font-size: 12px;">
                            <span style="color: var(--f1-neon-green);">+${growthInfo.growth} recent</span>
                        </div>
                    ` : ''}
                </div>
            `;

        eventsGrid.appendChild(card);

        // On click, show full details from the sheet for this event
        card.addEventListener('click', () => {
            this.showEventDetails(event.name);
        });

        // Animate count update
        const countElement = card.querySelector('.event-count');
        if (growthInfo.growth > 0) {
            countElement.classList.add('updating');
            setTimeout(() => {
                countElement.classList.remove('updating');
            }, 500);
        }
    });
}

updateRecentTicker() {
    const ticker = document.getElementById('recentTicker');

    // Get last 20 registrations
    const recent = this.data.slice(-20).reverse();

    ticker.innerHTML = '';

    recent.forEach(participant => {
        const item = document.createElement('div');
        item.className = 'ticker-item';

        const timeAgo = this.getTimeAgo(participant.timestamp);

        // Show event name only (no participant names)
        item.innerHTML = `
                <span class="ticker-name">${participant.event}</span>
                <span class="ticker-time">${timeAgo}</span>
            `;

        ticker.appendChild(item);
    });

    // Clone for seamless scrolling
    const clone = ticker.cloneNode(true);
    ticker.parentNode.appendChild(clone);
}

getTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';

    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
}

initChart() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Participants',
                data: [],
                backgroundColor: 'rgba(225, 6, 0, 0.8)',
                borderColor: 'rgba(255, 24, 1, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#888',
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#888',
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

updateChart() {
    if (!this.chart) return;

    const sortedEvents = Object.values(this.eventStats).sort((a, b) => b.count - a.count);

    this.chart.data.labels = sortedEvents.map(e => e.name);
    this.chart.data.datasets[0].data = sortedEvents.map(e => e.count);
    this.chart.update('none'); // 'none' for instant update without animation
}

showEventDetails(eventName) {
    const modal = document.getElementById('eventDetailsModal');
    const titleEl = document.getElementById('eventDetailsTitle');
    const subtitleEl = document.getElementById('eventDetailsSubtitle');
    const headRow = document.getElementById('eventDetailsTableHeadRow');
    const tbody = document.getElementById('eventDetailsTableBody');

    if (!modal || !tbody || !headRow) return;

    const eventData = this.eventStats[eventName];
    if (!eventData) return;

    // Set header texts
    if (titleEl) {
        titleEl.textContent = eventName.toUpperCase();
    }
    if (subtitleEl) {
        subtitleEl.textContent = `${eventData.count} participant${eventData.count !== 1 ? 's' : ''}`;
    }

    const headers = (this.headers && this.headers.length > 0) ? this.headers : [];
    const nameIdx = CONFIG?.COLUMNS?.NAME ?? 1;
    const collegeIdx = CONFIG?.COLUMNS?.COLLEGE ?? 2;
    const timestampIdx = CONFIG?.COLUMNS?.TIMESTAMP ?? 0;

    let paymentIdx = null;
    if (typeof CONFIG?.PAYMENT_INDEX === 'number') {
        paymentIdx = CONFIG.PAYMENT_INDEX;
    } else if (headers.length > 0 && CONFIG?.PAYMENT_HEADER_MATCH) {
        const re = CONFIG.PAYMENT_HEADER_MATCH;
        const found = headers.findIndex(h => re.test(String(h || '')));
        if (found >= 0) paymentIdx = found;
    }

    // Default: a clean list view (Name, College, Payment, Timestamp)
    const compactColumns = [
        { label: 'Name', idx: nameIdx },
        { label: 'College', idx: collegeIdx },
        ...(paymentIdx !== null ? [{ label: 'Payment', idx: paymentIdx }] : [{ label: 'Payment', idx: null }]),
        { label: 'Timestamp', idx: timestampIdx }
    ];

    // Header
    headRow.innerHTML = '<th>#</th>';
    if (this.detailsShowAll) {
        headers.forEach((h, idx) => {
            const th = document.createElement('th');
            th.textContent = (h && String(h).trim().length > 0) ? h : `COL ${idx + 1}`;
            headRow.appendChild(th);
        });
    } else {
        compactColumns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.label;
            headRow.appendChild(th);
        });
    }

    // Fill rows
    tbody.innerHTML = '';
    eventData.participants.forEach((p, idx) => {
        const tr = document.createElement('tr');
        const raw = Array.isArray(p.raw) ? p.raw : [];
        tr.innerHTML = `<td>${idx + 1}</td>`;
        if (this.detailsShowAll) {
            headers.forEach((_, colIdx) => {
                const td = document.createElement('td');
                const val = raw[colIdx];
                td.textContent = (val === undefined || val === null || String(val).trim() === '') ? '-' : String(val);
                tr.appendChild(td);
            });
        } else {
            compactColumns.forEach(col => {
                const td = document.createElement('td');
                if (col.idx === null) {
                    td.textContent = '-';
                } else {
                    const val = raw[col.idx];
                    td.textContent = (val === undefined || val === null || String(val).trim() === '') ? '-' : String(val);
                }
                tr.appendChild(td);
            });
        }
        tbody.appendChild(tr);
    });

    modal.classList.add('open');
}

hideEventDetails() {
    const modal = document.getElementById('eventDetailsModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

updateTimestamp() {
    const timestampElement = document.getElementById('timestamp');
    if (timestampElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timestampElement.textContent = timeString;
    }
}

updateConnectionStatus(status) {
    const statusElement = document.getElementById('connectionStatus');
    if (!statusElement) return;

    statusElement.className = `connection-status ${status}`;

    const statusText = statusElement.querySelector('.status-text');
    if (statusText) {
        switch (status) {
            case 'connected':
                statusText.textContent = 'CONNECTED';
                break;
            case 'connecting':
                statusText.textContent = 'CONNECTING...';
                break;
            case 'error':
                statusText.textContent = 'CONNECTION ERROR';
                break;
        }
    }
}

startAutoRefresh() {
    setInterval(() => {
        this.fetchData();
    }, CONFIG.REFRESH_INTERVAL);
}
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new F1Dashboard();
});
