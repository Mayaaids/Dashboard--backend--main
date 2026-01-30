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
            // Try to fetch from Google Sheets first
            const excelEndpoint = `${CONFIG.BACKEND_URL}/api/register/excel`;
            console.log('Fetching from:', excelEndpoint);
            
            let response;
            try {
                response = await fetch(excelEndpoint);
                console.log('Response status:', response.status);
            } catch (fetchErr) {
                console.error('Fetch error:', fetchErr);
                response = null;
            }

            let result = null;
            
            if (response && response.ok) {
                try {
                    result = await response.json();
                    console.log('Data received:', result.data ? `${result.data.length} records` : 'No data in response');
                } catch (parseErr) {
                    console.error('JSON parse error:', parseErr);
                }
            } else if (response) {
                console.warn('Response not ok, status:', response.status);
            }

            // Handle Google Sheets data format
            if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
                console.log('Processing Google Sheets data...');
                this.previousData = [...this.data];
                this.data = result.data;
                // Ensure headers are available (backend doesn't always send headers)
                this.headers = result.headers && Array.isArray(result.headers) && result.headers.length > 0
                    ? result.headers
                    : (CONFIG.HEADERS || []);
                this.processData();
                this.updateConnectionStatus('connected');
            } else {
                console.warn('No valid data received from backend; leaving existing data unchanged');
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
        const sortedEvents = Object.values(this.eventStats).sort((a, b) => b.count - a.count);

        // Use card container styling
        leaderboard.classList.add('team-card-container');
        leaderboard.innerHTML = '';

        sortedEvents.forEach((event, index) => {
            const percentage = totalParticipants > 0
                ? ((event.count / totalParticipants) * 100)
                : 0;

            const card = document.createElement('div');
            card.className = 'team-card';

            // Ensure the card title shows the Event name (fallback to participant.event if needed)
            const displayTitle = (event.name && String(event.name).trim().length > 0)
                ? event.name
                : (event.participants && event.participants[0] && event.participants[0].event) ? event.participants[0].event : 'Unknown Event';

            const metaText = (event.participants && event.participants.length > 0)
                ? (event.participants[0].event || event.participants[0].sheet || '')
                : '';

            // Normalize event name by removing common prefixes like "Event - ", "Workshop - "
            const rawName = (event.name && String(event.name).trim().length > 0)
                ? event.name
                : (event.participants && event.participants[0] && event.participants[0].event) ? event.participants[0].event : 'Unknown Event';

            const normalized = String(rawName)
                .replace(/^(Event|Workshop|Category)\s*[-–:\s]+/i, '')
                .replace(/^"|"$/g, '')
                .trim();

            const combinedTitle = `${normalized} ${event.count}`;

            card.innerHTML = `
                <div class="team-card-top">
                    <div class="team-card-title">${combinedTitle}</div>
                </div>
                <div class="team-card-meta">${metaText}</div>
                <div class="team-card-bar"><div class="team-card-bar-fill" style="width:${Math.max(2, percentage)}%"></div></div>
            `;

            leaderboard.appendChild(card);

            card.addEventListener('click', () => {
                this.showEventDetails(event.name);
            });
        });
    }

    updateRecentTicker() {
        const ticker = document.getElementById('recentTicker');
        // Show only the 10 most recent event names for looping ticker
        const recent = this.data.slice(-10).reverse();

        ticker.innerHTML = '';

        recent.forEach(participant => {
            const item = document.createElement('div');
            item.className = 'ticker-item';

            const raw = Array.isArray(participant.raw) ? participant.raw : [];
            // Prefer leader name in ticker only if a leader-name column exists
            const headers = (this.headers && this.headers.length > 0) ? this.headers : [];
            const leaderNameIdx = headers.findIndex(h => /team\s*leader|leader\s*name|captain|contact\s*name/i.test(String(h || '')));
            const leaderName = (leaderNameIdx >= 0 && raw[leaderNameIdx]) ? String(raw[leaderNameIdx]) : '';
            const eventName = participant.event || raw[2] || raw[0] || '-';

            // For ticker we show event name only; but ensure leader names won't be needed here.
            item.innerHTML = `
                <span class="ticker-event">${eventName}</span>
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

        if (titleEl) {
            titleEl.textContent = eventName.toUpperCase();
        }
        if (subtitleEl) {
            subtitleEl.textContent = `${eventData.count} participant${eventData.count !== 1 ? 's' : ''}`;
        }

        const headers = (this.headers && this.headers.length > 0) ? this.headers : [];
        const nameIdx = CONFIG?.COLUMNS?.NAME ?? 0;
        const emailIdx = CONFIG?.COLUMNS?.EMAIL ?? 1;
        const teamIdx = CONFIG?.COLUMNS?.TEAM ?? 2;
        const collegeIdx = CONFIG?.COLUMNS?.COLLEGE ?? 3;
        const timestampIdx = CONFIG?.COLUMNS?.TIMESTAMP ?? 5;

        // Prefer explicit team-leader columns when present in headers
        const leaderNameIdx = headers.findIndex(h => /team\s*leader|leader\s*name|captain|contact\s*name/i.test(String(h || '')));
        const leaderEmailIdx = headers.findIndex(h => /leader.*email|team.*email|captain.*email|contact.*email|email.*leader/i.test(String(h || '')));

        let paymentIdx = null;
        if (typeof CONFIG?.PAYMENT_INDEX === 'number') {
            paymentIdx = CONFIG.PAYMENT_INDEX;
        } else if (headers.length > 0 && CONFIG?.PAYMENT_HEADER_MATCH) {
            const re = CONFIG.PAYMENT_HEADER_MATCH;
            const found = headers.findIndex(h => re.test(String(h || '')));
            if (found >= 0) paymentIdx = found;
        }

        // If there's no leader-name header, infer the most likely name column
        let inferredNameIdx = -1;
        if (leaderNameIdx < 0 && eventData.participants && eventData.participants.length > 0) {
            const nameRegex = /^[A-Za-z][A-Za-z\s.'-]{1,}$/;
            const emailRegex = /@/;
            const maxCols = Math.max(...eventData.participants.map(p => (Array.isArray(p.raw) ? p.raw.length : 0)) , 0);
            const counts = new Array(maxCols).fill(0);

            eventData.participants.forEach(p => {
                const raw = Array.isArray(p.raw) ? p.raw : [];
                for (let c = 0; c < maxCols; c++) {
                    const v = String(raw[c] || '').trim();
                    if (!v) continue;
                    if (emailRegex.test(v)) continue; // skip emails
                    if (nameRegex.test(v) && v.split(' ').length >= 2) counts[c]++;
                }
            });

            let bestIdx = -1, bestCount = 0;
            counts.forEach((cnt, idx) => {
                if (cnt > bestCount) { bestCount = cnt; bestIdx = idx; }
            });
            if (bestCount > 0) inferredNameIdx = bestIdx;
        }

        // Compact view: show Name, Email, College (Team column removed)
        const compactColumns = [
            { label: 'Name', idx: nameIdx },
            { label: 'Email', idx: emailIdx },
            { label: 'College', idx: collegeIdx }
        ];

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
                // Render compact columns: Name, Team, Email, College
                // Name
                const nameTd = document.createElement('td');
                // Team leader name preference: check common leader properties first,
                // then explicit leader column, then participant `name`, then raw name column
                const leaderProps = [p.teamLeader, p.team_leader, p.leaderName, p.leader_name, p.captain, p.captainName, p.captain_name, p.contact_name];
                const leaderFromProps = leaderProps.find(v => v && String(v).trim().length > 0);
                // Prefer explicit leader column first for every team tab, then inferredNameIdx, then leader props, then p.name
                const fromLeaderCol = (leaderNameIdx >= 0 && raw[leaderNameIdx] && String(raw[leaderNameIdx]).trim().length > 0) ? String(raw[leaderNameIdx]) : '';
                const fromInferred = (inferredNameIdx >= 0 && raw[inferredNameIdx] && String(raw[inferredNameIdx]).trim().length > 0) ? String(raw[inferredNameIdx]) : '';
                const displayName = fromLeaderCol || fromInferred || leaderFromProps || (p.name && String(p.name).trim().length > 0 ? p.name : (raw[nameIdx] || '-'));
                nameTd.textContent = displayName;
                tr.appendChild(nameTd);

                // Email
                const emailTd = document.createElement('td');
                // Team leader email preference: check common leader email properties, then explicit leader email column, then participant.email, then raw email column
                const leaderEmailProps = [p.teamLeaderEmail, p.team_leader_email, p.leaderEmail, p.leader_email, p.captainEmail, p.captain_email, p.contact_email];
                const leaderEmailFromProps = leaderEmailProps.find(v => v && String(v).trim().length > 0);
                const displayEmail = leaderEmailFromProps
                    || (leaderEmailIdx >= 0 ? (raw[leaderEmailIdx] || '') : '')
                    || (p.email && String(p.email).trim().length > 0 ? p.email : '')
                    || (raw[emailIdx] || '-');
                emailTd.textContent = displayEmail;
                tr.appendChild(emailTd);

                // College
                const collegeTd = document.createElement('td');
                const displayCollege = (p.college && String(p.college).trim().length > 0) ? p.college : (raw[collegeIdx] || '-');
                collegeTd.textContent = displayCollege;
                tr.appendChild(collegeTd);
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
