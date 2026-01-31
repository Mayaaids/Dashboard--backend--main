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
        this.isFetching = false;  // Prevent concurrent requests

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

        this.fetchData();
        setInterval(() => this.updateTimestamp(), 1000);
        // Auto-refresh every 30 seconds with debouncing
        setInterval(() => {
            if (!this.isFetching) this.fetchData();
        }, CONFIG.REFRESH_INTERVAL);
    }

    async fetchData() {
        // Prevent concurrent requests
        if (this.isFetching) return;
        this.isFetching = true;

        try {
            // Fetch analytics data (total, events, participants)
            const analyticsEndpoint = `${CONFIG.BACKEND_URL}/api/register/analytics`;
            console.log('Fetching analytics from:', analyticsEndpoint);
            
            const response = await fetch(analyticsEndpoint);
            console.log('Response status:', response.status);

            if (response && response.ok) {
                const result = await response.json();
                console.log('Analytics received:', {
                    totalParticipants: result.totalParticipants,
                    eventCount: result.events ? result.events.length : 0
                });

                if (result.success && result.events) {
                    this.previousData = [...this.data];
                    
                    // Flatten events into individual participant records for compatibility
                    this.data = [];
                    result.events.forEach(event => {
                        if (event.participants && Array.isArray(event.participants)) {
                            event.participants.forEach(p => {
                                this.data.push({
                                    name: p.name || 'N/A',
                                    email: p.email || 'N/A',
                                    college: p.college || 'N/A',
                                    team: p.team || 'N/A',
                                    event: event.name,
                                    timestamp: p.timestamp || new Date().toISOString(),
                                    teamLeader: p.teamLeader || p.name || 'N/A',
                                    teamLeaderEmail: p.teamLeaderEmail || p.email || 'N/A'
                                });
                            });
                        }
                    });

                    this.analyticsData = result; // Store full analytics data
                    this.processData();
                    this.updateConnectionStatus('connected');
                } else {
                    console.warn('Invalid analytics response format');
                }
            } else {
                console.warn('Analytics fetch failed');
            }
        } catch (error) {
            console.error('Error in fetchData:', error);
            this.updateConnectionStatus('error');
        } finally {
            this.isFetching = false;
        }
    }

    loadDemoData() {
        const demoEvents = ['Hackathon', 'Code Sprint', 'AI Challenge', 'Web Dev', 'Mobile App'];
        const demoColleges = ['MIT', 'Stanford', 'Harvard', 'Berkeley', 'Caltech'];
        const demoNames = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sarah Williams', 'Mike Brown'];

        this.data = [];
        for (let i = 0; i < 50; i++) {
            const name = demoNames[Math.floor(Math.random() * demoNames.length)];
            const college = demoColleges[Math.floor(Math.random() * demoColleges.length)];
            const event = demoEvents[Math.floor(Math.random() * demoEvents.length)];
            const ts = new Date(Date.now() - Math.random() * 3600000).toISOString();

            this.data.push({
                id: i + 1,
                timestamp: ts,
                name: name,
                email: `${name.replace(/\s+/g,'').toLowerCase()}@example.com`,
                team: event,
                event: event,
                college: college,
                raw: [name, `${name.replace(/\s+/g,'').toLowerCase()}@example.com`, event, event, college, ts]
            });
        }

        this.processData();
        this.updateConnectionStatus('connected');
    }

    processData() {
        const newEventStats = {};
        const currentTime = Date.now();

        // Group STRICTLY by event name (which we map from the sheet/tab name in the backend)
        this.data.forEach(participant => {
            const eventName = (participant.event && String(participant.event).trim().length > 0)
                ? String(participant.event).trim()
                : 'Unknown Event';

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

        if (this.lastUpdateTime) {
            const timeDiff = (currentTime - this.lastUpdateTime) / 60000;
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
        const leaderboard = document.getElementById('leaderboard');
        const totalParticipants = this.data.length;
        
        // Sort events by participant count in DESCENDING order
        const sortedEvents = Object.values(this.eventStats)
            .sort((a, b) => b.count - a.count);

        // Use card container styling
        leaderboard.classList.add('team-card-container');
        leaderboard.innerHTML = '';

        sortedEvents.forEach((event, index) => {
            const percentage = totalParticipants > 0
                ? ((event.count / totalParticipants) * 100)
                : 0;

            const card = document.createElement('div');
            card.className = 'team-card';

            // Normalize event name by removing common prefixes
            const rawName = event.name || 'Unknown Event';
            const normalized = String(rawName)
                .replace(/^(Event|Workshop|Category)\s*[-–:\s]+/i, '')
                .replace(/^"|"$/g, '')
                .trim();

            // Display: Event Name (Count)
            const combinedTitle = `${normalized}`;

            card.innerHTML = `
                <div class="team-card-top">
                    <div class="team-card-title">${combinedTitle}</div>
                    <div class="team-card-count">${event.count}</div>
                </div>
                <div class="team-card-bar"><div class="team-card-bar-fill" style="width:${Math.max(2, percentage)}%"></div></div>
            `;

            leaderboard.appendChild(card);

            // Make clickable to show event details
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                this.showEventDetails(event.name);
            });
        });
    }

    updateRecentTicker() {
        const ticker = document.getElementById('recentTicker');
        
        // Show only the TOP 10 MOST RECENT registrations for looping ticker
        const recent = this.data.slice(-10).reverse();

        ticker.innerHTML = '';

        recent.forEach(participant => {
            const item = document.createElement('div');
            item.className = 'ticker-item';

            // Display format: "Event Name • Leader Name • College"
            const eventName = participant.event || 'Unknown Event';
            const leaderName = participant.teamLeader || participant.name || 'N/A';
            const college = participant.college || 'N/A';

            // Format: EVENT • LEADER • COLLEGE
            item.innerHTML = `
                <span class="ticker-label">📊 </span>
                <span class="ticker-event">${eventName}</span>
                <span class="ticker-separator"> • </span>
                <span class="ticker-leader">${leaderName}</span>
                <span class="ticker-separator"> • </span>
                <span class="ticker-college">${college}</span>
            `;

            ticker.appendChild(item);
        });

        // Keep only one clone to enable smooth looping
        const existingClone = ticker.parentNode.querySelector('.ticker-clone');
        if (existingClone) existingClone.remove();
        const clone = ticker.cloneNode(true);
        clone.classList.add('ticker-clone');
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
        this.chart.update('none');
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

        // Update modal title and subtitle
        if (titleEl) {
            titleEl.textContent = eventName.toUpperCase();
        }
        if (subtitleEl) {
            subtitleEl.textContent = `${eventData.count} participant${eventData.count !== 1 ? 's' : ''}`;
        }

        // Set table headers: #, Team Leader Name, Email, College
        headRow.innerHTML = '<th>#</th><th>LEADER NAME</th><th>EMAIL</th><th>COLLEGE</th>';

        // Populate table rows with participant details
        tbody.innerHTML = '';
        let rowNum = 1;
        
        eventData.participants.forEach(p => {
            const tr = document.createElement('tr');
            
            // Row number
            const tdNum = document.createElement('td');
            tdNum.textContent = rowNum++;
            tdNum.style.fontWeight = 'bold';
            tr.appendChild(tdNum);

            // Team Leader Name
            const tdLeader = document.createElement('td');
            tdLeader.textContent = p.teamLeader || p.name || 'N/A';
            tr.appendChild(tdLeader);

            // Email
            const tdEmail = document.createElement('td');
            tdEmail.textContent = p.teamLeaderEmail || p.email || 'N/A';
            tdEmail.style.fontSize = '0.9em';
            tr.appendChild(tdEmail);

            // College
            const tdCollege = document.createElement('td');
            tdCollege.textContent = p.college || 'N/A';
            tr.appendChild(tdCollege);

            tbody.appendChild(tr);
        });

        // Open modal
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

document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new F1Dashboard();
});

// Registration modal handlers
F1Dashboard.prototype.openRegistrationModal = function() {
    const modal = document.getElementById('registrationModal');
    const backdrop = document.getElementById('registrationBackdrop');
    const eventSelect = document.getElementById('regEvent');
    if (!modal) return;

    // Populate event list
    eventSelect.innerHTML = '<option value="">-- Select Event --</option>';
    const keys = Object.keys(this.eventStats).sort((a,b)=> this.eventStats[b].count - this.eventStats[a].count);
    keys.forEach(k => {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = `${k} (${this.eventStats[k].count})`;
        eventSelect.appendChild(opt);
    });

    modal.classList.add('open');
    if (backdrop) backdrop.addEventListener('click', () => modal.classList.remove('open'), { once: true });
};

F1Dashboard.prototype.closeRegistrationModal = function() {
    const modal = document.getElementById('registrationModal');
    if (modal) modal.classList.remove('open');
};

F1Dashboard.prototype.handleRegistrationSubmit = async function() {
    const name = document.getElementById('regName').value.trim();
    const college = document.getElementById('regCollege').value.trim();
    const eventVal = document.getElementById('regEvent').value;
    const payment = document.getElementById('regPayment').value.trim();
    const msg = document.getElementById('registrationMsg');

    if (!name || !eventVal) {
        if (msg) msg.textContent = 'Please fill Name and select Event';
        return;
    }

    try {
        const payload = { name, college, event: eventVal, team: eventVal, payment };
        const res = await fetch(`${CONFIG.BACKEND_URL}/api/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const j = await res.json();
        if (res.ok) {
            if (msg) msg.textContent = 'Registered successfully';
            // Refresh data
            await this.fetchData();
            setTimeout(() => this.closeRegistrationModal(), 800);
        } else {
            if (msg) msg.textContent = j.message || 'Registration failed';
        }
    } catch (err) {
        if (msg) msg.textContent = 'Network error';
    }
};

// Delete a single record from event details table
F1Dashboard.prototype.deleteRecord = async function(recordId, rowElement) {
    if (!confirm('Delete this registration?')) return;
    try {
        const res = await fetch(`${CONFIG.BACKEND_URL}/api/register/delete/${encodeURIComponent(recordId)}`, { method: 'DELETE' });
        const j = await res.json();
        if (res.ok && j.success) {
            // remove row from DOM
            if (rowElement && rowElement.parentNode) rowElement.parentNode.removeChild(rowElement);
            // refresh data
            await this.fetchData();
        } else {
            alert('Delete failed');
        }
    } catch (err) {
        alert('Delete error');
    }
};

// Wire registration modal buttons globally
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'registrationSubmit') {
        window.dashboard.handleRegistrationSubmit();
    }
    if (e.target && (e.target.id === 'registrationClose' || e.target.id === 'registrationCancel')) {
        window.dashboard.closeRegistrationModal();
    }
});
