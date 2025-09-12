// Blog data storage
let blogs = {
    'system-design': [],
    'azure-integration': [],
    'admin': []
};

// Comments storage
let comments = {};

// Analytics storage
let analytics = {
    pageViews: 0,
    blogViews: {},
    userInteractions: [],
    sessionStart: new Date().toISOString(),
    totalSessions: 0,
    activeVisitors: 0,
    visitorHistory: [],
    peakVisitors: 0,
    currentVisitors: []
};

// Owner verification settings
const OWNER_CONFIG = {
    // Password will be retrieved from environment or use fallback
    secretKey: "hks-perspective-owner-2025",
    allowedIPs: [], // Add your IP addresses here if needed
    sessionTimeout: 30 * 60 * 1000 // 30 minutes
};

// Get owner password from configuration or use fallback
function getOwnerPassword() {
    // Try to get from configuration file first
    if (typeof window !== 'undefined' && window.BLOG_CONFIG && window.BLOG_CONFIG.OWNER_PASSWORD) {
        return window.BLOG_CONFIG.OWNER_PASSWORD;
    }
    
    // Fallback to dynamic password if no config
    return generateOwnerPassword();
}

// Generate a dynamic password based on current date and secret key
function generateOwnerPassword() {
    const today = new Date();
    const dateString = today.getFullYear() + 
                      String(today.getMonth() + 1).padStart(2, '0') + 
                      String(today.getDate()).padStart(2, '0');
    
    // Create a simple hash-like password that changes daily
    const baseString = "HK" + dateString + "Analytics";
    return baseString;
}

// Check for owner using multiple secure methods
function checkForOwnerElement() {
    // Method 1: Check for a specific URL parameter (only you know)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('owner') === 'hk2025') {
        return true;
    }
    
    // Method 2: Check for a specific localStorage key (only you know)
    if (localStorage.getItem('hks-owner-key') === 'verified-2025') {
        return true;
    }
    
    // Method 3: Check for a specific combination of conditions
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    // Only works at specific times (you know the pattern)
    if (currentHour === 9 && currentMinute >= 0 && currentMinute <= 5) {
        return true;
    }
    
    return false;
}

// Analytics Functions
function initAnalytics() {
    // Load analytics data from localStorage
    const savedAnalytics = localStorage.getItem('hks-perspective-analytics');
    if (savedAnalytics) {
        analytics = JSON.parse(savedAnalytics);
    }
    
    // Track page view
    analytics.pageViews++;
    analytics.totalSessions++;
    
    // Track session start
    analytics.sessionStart = new Date().toISOString();
    
    // Track visitor
    trackVisitor();
    
    // Save analytics
    saveAnalytics();
    
    // Track user interactions
    trackUserInteractions();
    
    // Start visitor monitoring
    startVisitorMonitoring();
}

function saveAnalytics() {
    localStorage.setItem('hks-perspective-analytics', JSON.stringify(analytics));
}

function trackVisitor() {
    const visitorId = generateVisitorId();
    const now = Date.now();
    
    // Add visitor to current visitors
    analytics.currentVisitors.push({
        id: visitorId,
        joinTime: now,
        lastActivity: now
    });
    
    // Update active visitor count
    analytics.activeVisitors = analytics.currentVisitors.length;
    
    // Update peak visitors
    if (analytics.activeVisitors > analytics.peakVisitors) {
        analytics.peakVisitors = analytics.activeVisitors;
    }
    
    // Add to visitor history
    analytics.visitorHistory.push({
        timestamp: now,
        activeVisitors: analytics.activeVisitors,
        action: 'join'
    });
    
    // Add some sample data for demonstration if no history exists
    if (analytics.visitorHistory.length === 1) {
        // Add a few sample data points to show the graph
        const sampleData = [
            { timestamp: now - 300000, activeVisitors: 0, action: 'sample' },
            { timestamp: now - 240000, activeVisitors: 1, action: 'sample' },
            { timestamp: now - 180000, activeVisitors: 2, action: 'sample' },
            { timestamp: now - 120000, activeVisitors: 1, action: 'sample' },
            { timestamp: now - 60000, activeVisitors: 3, action: 'sample' }
        ];
        analytics.visitorHistory = [...sampleData, ...analytics.visitorHistory];
    }
    
    // Keep only last 100 history entries
    if (analytics.visitorHistory.length > 100) {
        analytics.visitorHistory = analytics.visitorHistory.slice(-100);
    }
    
    // Store visitor ID for this session
    sessionStorage.setItem('hks-visitor-id', visitorId);
    
    saveAnalytics();
}

function generateVisitorId() {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function startVisitorMonitoring() {
    // Update visitor activity every 30 seconds
    setInterval(updateVisitorActivity, 30000);
    
    // Clean up inactive visitors every 2 minutes
    setInterval(cleanupInactiveVisitors, 120000);
    
    // Track page unload
    window.addEventListener('beforeunload', handleVisitorLeave);
}

function updateVisitorActivity() {
    const visitorId = sessionStorage.getItem('hks-visitor-id');
    if (visitorId) {
        const visitor = analytics.currentVisitors.find(v => v.id === visitorId);
        if (visitor) {
            visitor.lastActivity = Date.now();
            saveAnalytics();
        }
    }
}

function cleanupInactiveVisitors() {
    const now = Date.now();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    
    const activeVisitors = analytics.currentVisitors.filter(visitor => {
        return (now - visitor.lastActivity) < inactiveThreshold;
    });
    
    const removedCount = analytics.currentVisitors.length - activeVisitors.length;
    
    if (removedCount > 0) {
        analytics.currentVisitors = activeVisitors;
        analytics.activeVisitors = analytics.currentVisitors.length;
        
        // Add to visitor history
        analytics.visitorHistory.push({
            timestamp: now,
            activeVisitors: analytics.activeVisitors,
            action: 'cleanup',
            removedCount: removedCount
        });
        
        saveAnalytics();
    }
}

function handleVisitorLeave() {
    const visitorId = sessionStorage.getItem('hks-visitor-id');
    if (visitorId) {
        // Remove visitor from current visitors
        analytics.currentVisitors = analytics.currentVisitors.filter(v => v.id !== visitorId);
        analytics.activeVisitors = analytics.currentVisitors.length;
        
        // Add to visitor history
        analytics.visitorHistory.push({
            timestamp: Date.now(),
            activeVisitors: analytics.activeVisitors,
            action: 'leave'
        });
        
        saveAnalytics();
    }
}

function trackBlogView(category, blogId) {
    const blogKey = `${category}-${blogId}`;
    if (!analytics.blogViews[blogKey]) {
        analytics.blogViews[blogKey] = {
            views: 0,
            title: '',
            category: category,
            firstViewed: new Date().toISOString(),
            lastViewed: new Date().toISOString()
        };
    }
    
    analytics.blogViews[blogKey].views++;
    analytics.blogViews[blogKey].lastViewed = new Date().toISOString();
    
    // Get blog title if available
    const blog = blogs[category]?.find(b => b.id === blogId);
    if (blog) {
        analytics.blogViews[blogKey].title = blog.title;
    }
    
    saveAnalytics();
}

function trackUserInteraction(action, details = {}) {
    const interaction = {
        timestamp: new Date().toISOString(),
        action: action,
        details: details,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    analytics.userInteractions.push(interaction);
    
    // Keep only last 100 interactions to prevent storage bloat
    if (analytics.userInteractions.length > 100) {
        analytics.userInteractions = analytics.userInteractions.slice(-100);
    }
    
    saveAnalytics();
}

function trackUserInteractions() {
    // Track clicks on category cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
            const category = e.currentTarget.onclick.toString().match(/openPopup\('([^']+)'\)/)?.[1];
            if (category) {
                trackUserInteraction('category_click', { category: category });
            }
        });
    });
    
    // Track blog post views
    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn-success') && e.target.textContent === 'View') {
            const onclick = e.target.getAttribute('onclick');
            const match = onclick.match(/viewBlog\('([^']+)',\s*(\d+)\)/);
            if (match) {
                const [, category, blogId] = match;
                trackBlogView(category, parseInt(blogId));
                trackUserInteraction('blog_view', { category: category, blogId: parseInt(blogId) });
            }
        }
    });
    
    // Track form submissions
    document.addEventListener('click', (e) => {
        if (e.target.textContent === 'Save Blog') {
            const onclick = e.target.getAttribute('onclick');
            const match = onclick.match(/saveBlog\('([^']+)'\)/);
            if (match) {
                trackUserInteraction('blog_save', { category: match[1] });
            }
        }
    });
}

function verifyOwner() {
    // Check if user has valid owner session
    const ownerSession = localStorage.getItem('hks-owner-session');
    if (ownerSession) {
        const sessionData = JSON.parse(ownerSession);
        const now = Date.now();
        
        // Check if session is still valid (within timeout period)
        if (now - sessionData.timestamp < OWNER_CONFIG.sessionTimeout) {
            return true; // Valid session, allow access
        } else {
            // Session expired, remove it
            localStorage.removeItem('hks-owner-session');
        }
    }
    
    // Method 1: Check for hidden owner element (most secure)
    if (checkForOwnerElement()) {
        // Create owner session
        const sessionData = {
            timestamp: Date.now(),
            verified: true
        };
        localStorage.setItem('hks-owner-session', JSON.stringify(sessionData));
        return true;
    }
    
    // Method 2: Environment password verification (fallback)
    const currentPassword = getOwnerPassword();
    const ownerPassword = prompt("🔐 Enter owner password to access analytics:\n\nPassword: " + currentPassword);
    if (!ownerPassword) {
        return false;
    }
    
    if (ownerPassword === currentPassword) {
        // Create owner session
        const sessionData = {
            timestamp: Date.now(),
            verified: true
        };
        localStorage.setItem('hks-owner-session', JSON.stringify(sessionData));
        return true;
    } else {
        alert("❌ Access denied. Only the blog owner can view analytics.");
        return false;
    }
}

function showAnalytics() {
    // Check if user is owner with multiple verification methods
    if (!verifyOwner()) {
        return;
    }
    
    // Calculate some basic stats
    const totalBlogViews = Object.values(analytics.blogViews).reduce((sum, blog) => sum + blog.views, 0);
    const mostViewedBlog = Object.entries(analytics.blogViews)
        .sort(([,a], [,b]) => b.views - a.views)[0];
    
    const recentInteractions = analytics.userInteractions.slice(-10);
    
    // Create analytics modal
    const modal = document.createElement('div');
    modal.className = 'analytics-modal';
    modal.innerHTML = `
        <div class="analytics-content">
            <div class="analytics-header">
                <h2>📊 Blog Analytics Dashboard</h2>
                <button class="close-btn" onclick="closeAnalyticsModal()">&times;</button>
            </div>
            <div class="analytics-stats">
                <div class="stat-card live-visitors">
                    <h3 id="live-visitor-count">${analytics.activeVisitors}</h3>
                    <p>Live Visitors</p>
                    <div class="visitor-indicator">
                        <div class="pulse-dot"></div>
                        <span>Online Now</span>
                    </div>
                </div>
                <div class="stat-card">
                    <h3>${analytics.peakVisitors}</h3>
                    <p>Peak Visitors</p>
                </div>
                <div class="stat-card">
                    <h3>${analytics.pageViews}</h3>
                    <p>Total Page Views</p>
                </div>
                <div class="stat-card">
                    <h3>${analytics.totalSessions}</h3>
                    <p>Total Sessions</p>
                </div>
            </div>
            <div class="visitor-graph-section">
                <h3>📈 Live Visitor Activity</h3>
                <div class="visitor-graph-container">
                    <canvas id="visitor-graph" width="800" height="200"></canvas>
                </div>
                <div class="graph-controls">
                    <button class="btn btn-small" onclick="updateVisitorGraph()">Refresh Graph</button>
                    <span class="graph-info">Updates every 30 seconds</span>
                </div>
            </div>
            <div class="analytics-sections">
                <div class="analytics-section">
                    <h3>Most Viewed Blogs</h3>
                    <div class="blog-stats-list">
                        ${Object.entries(analytics.blogViews)
                            .sort(([,a], [,b]) => b.views - a.views)
                            .slice(0, 5)
                            .map(([key, blog]) => `
                                <div class="blog-stat-item">
                                    <span class="blog-title">${blog.title || 'Untitled'}</span>
                                    <span class="blog-views">${blog.views} views</span>
                                </div>
                            `).join('')}
                    </div>
                </div>
                <div class="analytics-section">
                    <h3>Recent Activity</h3>
                    <div class="activity-list">
                        ${recentInteractions.map(interaction => `
                            <div class="activity-item">
                                <span class="activity-time">${new Date(interaction.timestamp).toLocaleString()}</span>
                                <span class="activity-action">${interaction.action.replace('_', ' ')}</span>
                                ${interaction.details.category ? `<span class="activity-details">(${interaction.details.category})</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="analytics-actions">
                <button class="btn" onclick="exportAnalytics()">Export Data</button>
                <button class="btn btn-danger" onclick="clearAnalytics()">Clear Analytics</button>
                <button class="btn btn-secondary" onclick="logoutOwner(); closeAnalyticsModal();">Logout Owner</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize the visitor graph
    setTimeout(() => {
        drawVisitorGraph();
        startGraphUpdates();
    }, 100);
}

function closeAnalyticsModal() {
    const modal = document.querySelector('.analytics-modal');
    if (modal) {
        modal.remove();
    }
}

function exportAnalytics() {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blog-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function clearAnalytics() {
    if (confirm('Are you sure you want to clear all analytics data?')) {
        analytics = {
            pageViews: 0,
            blogViews: {},
            userInteractions: [],
            sessionStart: new Date().toISOString(),
            totalSessions: 0
        };
        saveAnalytics();
        closeAnalyticsModal();
        showAnalytics(); // Refresh the modal
    }
}

function logoutOwner() {
    localStorage.removeItem('hks-owner-session');
    alert('✅ Owner session ended. You will need to re-enter the password next time.');
}

function drawVisitorGraph() {
    const canvas = document.getElementById('visitor-graph');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Get recent visitor history (last 20 data points)
    const recentHistory = analytics.visitorHistory.slice(-20);
    
    // Always draw the graph, even with no data
    if (recentHistory.length === 0) {
        // Draw empty graph with baseline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw empty state text
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for visitor data...', width / 2, height / 2 - 20);
        ctx.fillText('Open multiple tabs to test!', width / 2, height / 2 + 10);
        return;
    }
    
    // Find max visitors for scaling
    const maxVisitors = Math.max(...recentHistory.map(h => h.activeVisitors), 1);
    
    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        
        // Draw labels
        ctx.fillStyle = '#999';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round((maxVisitors / 5) * (5 - i)).toString(), -10, y + 4);
    }
    
    // Draw visitor line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    recentHistory.forEach((point, index) => {
        const x = (width / (recentHistory.length - 1)) * index;
        const y = height - (point.activeVisitors / maxVisitors) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#ffffff';
    recentHistory.forEach((point, index) => {
        const x = (width / (recentHistory.length - 1)) * index;
        const y = height - (point.activeVisitors / maxVisitors) * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw visitor count on hover
        if (index === recentHistory.length - 1) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(point.activeVisitors.toString(), x, y - 10);
        }
    });
    
    // Draw time labels
    ctx.fillStyle = '#999';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    recentHistory.forEach((point, index) => {
        if (index % 3 === 0) { // Show every 3rd label
            const x = (width / (recentHistory.length - 1)) * index;
            const time = new Date(point.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            ctx.fillText(time, x, height + 15);
        }
    });
}

function updateVisitorGraph() {
    // Update live visitor count
    const liveCountElement = document.getElementById('live-visitor-count');
    if (liveCountElement) {
        liveCountElement.textContent = analytics.activeVisitors;
    }
    
    // Redraw graph
    drawVisitorGraph();
}

function startGraphUpdates() {
    // Update graph every 30 seconds
    setInterval(() => {
        if (document.querySelector('.analytics-modal')) {
            updateVisitorGraph();
        }
    }, 30000);
}

// Load blogs from localStorage on page load
function loadBlogs() {
    const savedBlogs = localStorage.getItem('hks-perspective-blogs');
    if (savedBlogs) {
        blogs = JSON.parse(savedBlogs);
        updateBlogLists();
    } else {
        // Initialize with the Azure Conditional Access blog post
        blogs = {
            'system-design': [],
            'azure-integration': [
                {
                    id: Date.now(),
                    title: "Extending M365 Security: How Azure Conditional Access Protects Your Entire Cloud Infrastructure",
                    content: `# Extending M365 Security: How Azure Conditional Access Protects Your Entire Cloud Infrastructure

In my previous post on [M365 Security Best Practices](), we explored the foundational security measures that protect your Microsoft 365 environment. Today, we're taking that security foundation and extending it across your entire cloud infrastructure using Azure Conditional Access—the unified security gatekeeper that brings Zero Trust principles to both M365 and Azure services.

## The Problem: Fragmented Cloud Security

Modern organizations face a critical challenge: as they adopt cloud services, their security posture often becomes fragmented. You might have robust M365 security policies, but what about your Azure VMs, storage accounts, or web applications? Traditional perimeter-based security models fall short in a world where users access resources from anywhere, on any device.

**The reality:** A single compromised credential can provide access to your entire cloud estate if not properly protected.

## What is Azure Conditional Access?

Azure Conditional Access is Microsoft's cloud-based access control solution that uses IF-THEN statements to enforce security policies. Think of it as a smart security guard that evaluates every access request based on:

- **Who** is trying to access (user identity)
- **What** they're trying to access (cloud app or resource)
- **Where** they're accessing from (location)
- **When** they're accessing (time-based policies)
- **How** they're accessing (device compliance, risk level)

## The Power of Conditional Access: Beyond M365

While Conditional Access policies can protect M365 services, their true power lies in extending security across your entire Azure ecosystem:

### Protecting Azure Resources
- **Virtual Machines:** Require MFA for RDP/SSH access to production VMs
- **Storage Accounts:** Block access from untrusted locations to sensitive data
- **Web Applications:** Enforce device compliance for internal applications
- **Azure SQL Databases:** Require hybrid Azure AD join for database access

### Real-World Scenarios

**Scenario 1: Production VM Access**
\`\`\`
IF user is accessing Azure VM
AND location is not "Trusted Corporate Network"
THEN require MFA + device compliance
\`\`\`

**Scenario 2: Sensitive Data Protection**
\`\`\`
IF user is accessing Storage Account with "confidential" tag
AND device is not compliant
THEN block access
\`\`\`

## Essential Conditional Access Policies for Unified Security

### 1. Require MFA for All Users (High-Risk Scenarios)
**Policy Name:** "Require MFA for High-Risk Sign-ins"
- **Users:** All users
- **Cloud Apps:** All cloud apps
- **Conditions:** Sign-in risk = Medium or High
- **Access Controls:** Require MFA

### 2. Block Legacy Authentication
**Policy Name:** "Block Legacy Auth Protocols"
- **Users:** All users
- **Cloud Apps:** All cloud apps
- **Client Apps:** Exchange ActiveSync, Other clients
- **Access Controls:** Block

### 3. Require Device Compliance
**Policy Name:** "Require Compliant Devices for Azure Resources"
- **Users:** All users
- **Cloud Apps:** Azure services (VMs, Storage, etc.)
- **Device State:** Require device to be marked as compliant
- **Access Controls:** Grant access

### 4. Location-Based Policies
**Policy Name:** "Block Access from Untrusted Locations"
- **Users:** All users
- **Cloud Apps:** All cloud apps
- **Locations:** Exclude trusted locations
- **Access Controls:** Block

### 5. High-Risk User Protection
**Policy Name:** "High-Risk Users - Require MFA"
- **Users:** High-risk users (from Identity Protection)
- **Cloud Apps:** All cloud apps
- **Access Controls:** Require MFA

## Implementation Best Practices

### Start with Report-Only Mode
Always test your policies in report-only mode first. This allows you to:
- Monitor policy impact without affecting users
- Identify potential issues before enforcement
- Gather data on policy effectiveness

### Emergency Access Accounts
Create at least two emergency access accounts that are:
- Excluded from all Conditional Access policies
- Used only for emergency scenarios
- Monitored and audited regularly

### Naming Conventions
Use clear, descriptive names for your policies:
- \`CA-001-Require-MFA-High-Risk-Users\`
- \`CA-002-Block-Legacy-Authentication\`
- \`CA-003-Require-Compliant-Devices-Azure\`

### Policy Hierarchy
Organize policies by priority:
1. **Block policies** (highest priority)
2. **High-risk user policies**
3. **Location-based policies**
4. **Device compliance policies**
5. **MFA requirements**

## Common Challenges and Solutions

### Challenge 1: User Experience Impact
**Problem:** Users complain about frequent MFA prompts
**Solution:** 
- Use trusted locations for corporate networks
- Implement risk-based policies instead of blanket MFA
- Communicate changes clearly to users

### Challenge 2: Troubleshooting Access Issues
**Problem:** Users can't access resources after policy changes
**Solution:**
- Use the Conditional Access insights workbook
- Check the sign-in logs for policy evaluation details
- Test with report-only mode first

### Challenge 3: Policy Complexity
**Problem:** Too many policies creating conflicts
**Solution:**
- Start with 3-5 essential policies
- Use groups to target specific user sets
- Regularly review and consolidate policies

## Quick Wins: Policies You Can Implement Today

### 1. Block Legacy Authentication (5 minutes)
This single policy can prevent 99% of password spray attacks.

### 2. Require MFA for Admins (10 minutes)
Protect your most privileged accounts immediately.

### 3. Block Access from High-Risk Countries (15 minutes)
If you don't have international users, block access from countries you don't operate in.

## Monitoring and Maintenance

### Regular Reviews
- **Monthly:** Review policy effectiveness and user impact
- **Quarterly:** Audit emergency access accounts
- **Annually:** Complete policy review and optimization

### Key Metrics to Track
- Policy hit rates
- User experience impact
- Security incidents prevented
- False positive rates

## The Zero Trust Advantage

Conditional Access is the cornerstone of a Zero Trust security model because it:

1. **Never Trusts, Always Verifies:** Every access request is evaluated
2. **Assumes Breach:** Policies protect against compromised credentials
3. **Uses Least Privilege:** Users only get access they need, when they need it
4. **Provides Visibility:** Complete audit trail of all access decisions

## Conclusion

Azure Conditional Access transforms your security posture from reactive to proactive. By extending the security principles we established in M365 across your entire Azure infrastructure, you create a unified, intelligent security layer that adapts to threats and protects your most valuable assets.

The journey from fragmented security to unified protection starts with a single policy. Begin with blocking legacy authentication, then gradually build your policy framework. Remember: security is not a destination, but a continuous journey of improvement.

## What's Next?

In our next post, we'll dive deeper into Azure Identity Protection and how it works with Conditional Access to provide intelligent, risk-based security decisions. We'll also explore advanced scenarios like protecting hybrid environments and implementing just-in-time access.

---

**Have you implemented Conditional Access policies in your environment? What challenges have you faced, and what successes can you share? Let me know in the comments below!**

*Ready to take your cloud security to the next level? Start with one policy today and build from there. Your future self (and your security team) will thank you.*`,
                    date: new Date().toLocaleDateString(),
                    category: 'azure-integration'
                }
            ],
            'admin': []
        };
        saveBlogs();
        updateBlogLists();
    }
    
    // Load comments
    const savedComments = localStorage.getItem('hks-perspective-comments');
    if (savedComments) {
        comments = JSON.parse(savedComments);
    }
}

// Save blogs to localStorage
function saveBlogs() {
    localStorage.setItem('hks-perspective-blogs', JSON.stringify(blogs));
}

// Save comments to localStorage
function saveComments() {
    localStorage.setItem('hks-perspective-comments', JSON.stringify(comments));
}


// Open popup
function openPopup(category) {
    const popup = document.getElementById(category + '-popup');
    popup.style.display = 'block';
    popup.classList.add('show');
    updateBlogList(category);
}

// Close popup
function closePopup(category) {
    const popup = document.getElementById(category + '-popup');
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 600);
}

// Save blog
async function saveBlog(category) {
    const title = document.getElementById(category + '-title').value.trim();
    const content = document.getElementById(category + '-content').value.trim();
    const imageInput = document.getElementById(category + '-image');

    if (!title || !content) {
        alert('Please fill in both title and content!');
        return;
    }

    let imageFilename = null;
    
    // Handle image upload if present and image input exists
    if (imageInput && imageInput.files && imageInput.files[0]) {
        try {
            const blogId = window.editingBlogId || Date.now();
            imageFilename = await saveImageToStorage(imageInput.files[0], category, blogId);
        } catch (error) {
            alert('Error uploading image: ' + error.message);
            return;
        }
    }

    // Check if we're editing an existing blog
    if (window.editingBlogId && window.editingCategory === category) {
        // Update existing blog
        const blogIndex = blogs[category].findIndex(b => b.id === window.editingBlogId);
        if (blogIndex !== -1) {
            blogs[category][blogIndex].title = title;
            blogs[category][blogIndex].content = content;
            blogs[category][blogIndex].date = new Date().toLocaleDateString();
            if (imageFilename) {
                blogs[category][blogIndex].image = imageFilename;
            }
            saveBlogs();
            updateBlogList(category);
            clearForm(category);
            alert('Blog updated successfully!');
            
            // Clear editing state
            window.editingBlogId = null;
            window.editingCategory = null;
            return;
        }
    }

    // Create new blog
    const blog = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleDateString(),
        category: category
    };

    if (imageFilename) {
        blog.image = imageFilename;
    }

    blogs[category].push(blog);
    saveBlogs();
    updateBlogList(category);
    clearForm(category);
    alert('Blog saved successfully!');
}

// Clear form
function clearForm(category) {
    document.getElementById(category + '-title').value = '';
    document.getElementById(category + '-content').value = '';
    
    // Clear image input and preview if they exist
    const imageInput = document.getElementById(category + '-image');
    const imagePreview = document.getElementById(category + '-image-preview');
    
    if (imageInput) {
        imageInput.value = '';
    }
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }
    
    // Clear editing state
    window.editingBlogId = null;
    window.editingCategory = null;
}

// Update blog list for specific category
function updateBlogList(category) {
    const blogList = document.getElementById(category + '-blog-list');
    blogList.innerHTML = '';

    if (blogs[category].length === 0) {
        blogList.innerHTML = '<li style="text-align: center; color: #a0a0a0; padding: 20px;">No blogs yet. Start writing!</li>';
        return;
    }

    blogs[category].forEach(blog => {
        const li = document.createElement('li');
        li.className = 'blog-item';
        const blogId = `${category}-${blog.id}`;
        const commentCount = comments[blogId] ? comments[blogId].length : 0;
        
        const imageHtml = blog.image ? `<div class="blog-image"><img src="${getImageData(blog.image)}" alt="${blog.title}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"></div>` : '';
        
        li.innerHTML = `
            <div class="blog-content">
                ${imageHtml}
                <div class="blog-title">${blog.title}</div>
                <div style="font-size: 0.8rem; color: #a0a0a0;">Created: ${blog.date}</div>
                <div class="blog-stats">
                    <span class="comment-count" onclick="showComments('${category}', ${blog.id})">
                        <i class="fas fa-comment" style="color: #3498db; margin-right: 5px;"></i>
                        ${commentCount}
                    </span>
                </div>
            </div>
            <div class="blog-actions">
                <button class="btn btn-small btn-success" onclick="viewBlog('${category}', ${blog.id})">View</button>
                <button class="btn btn-small btn-primary" onclick="editBlog('${category}', ${blog.id})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteBlog('${category}', ${blog.id})">Delete</button>
            </div>
        `;
        blogList.appendChild(li);
    });
}

// Update all blog lists
function updateBlogLists() {
    Object.keys(blogs).forEach(category => {
        updateBlogList(category);
    });
}

// View blog
function viewBlog(category, blogId) {
    // Open blog in new page
    window.open(`blog-view.html?category=${category}&id=${blogId}`, '_blank');
}

// Delete blog
function deleteBlog(category, blogId) {
    if (confirm('Are you sure you want to delete this blog?')) {
        blogs[category] = blogs[category].filter(b => b.id !== blogId);
        const blogKey = `${category}-${blogId}`;
        delete comments[blogKey];
        saveBlogs();
        saveComments();
        updateBlogList(category);
    }
}

// Edit blog
function editBlog(category, blogId) {
    const blog = blogs[category].find(b => b.id === blogId);
    if (blog) {
        // Store the blog ID being edited
        window.editingBlogId = blogId;
        window.editingCategory = category;
        
        document.getElementById(category + '-title').value = blog.title;
        document.getElementById(category + '-content').value = blog.content;
        
        // Handle image preview if blog has an image
        if (blog.image) {
            const imageData = getImageData(blog.image);
            if (imageData) {
                document.getElementById(category + '-image-preview').innerHTML = '<img src="' + imageData + '" alt="Current image">';
            }
        } else {
            document.getElementById(category + '-image-preview').innerHTML = '';
        }
        
        // Scroll to top of form
        document.querySelector('.blog-editor').scrollIntoView({ behavior: 'smooth' });
    }
}


// Show comments
function showComments(category, blogId) {
    const blogKey = `${category}-${blogId}`;
    const blog = blogs[category].find(b => b.id === blogId);
    
    if (!blog) return;
    
    // Create comment modal
    const modal = document.createElement('div');
    modal.className = 'comment-modal';
    modal.innerHTML = `
        <div class="comment-content">
            <div class="comment-header">
                <h3>Comments for: ${blog.title}</h3>
                <button class="close-btn" onclick="closeCommentModal()">&times;</button>
            </div>
            <div class="comment-list" id="comment-list-${blogKey}"></div>
            <div class="add-comment">
                <textarea id="new-comment-${blogKey}" placeholder="Write your comment..." rows="3"></textarea>
                <button class="btn" onclick="addComment('${category}', ${blogId})">Add Comment</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    loadComments(category, blogId);
}

// Load comments
function loadComments(category, blogId) {
    const blogKey = `${category}-${blogId}`;
    const commentList = document.getElementById(`comment-list-${blogKey}`);
    
    if (!comments[blogKey] || comments[blogKey].length === 0) {
        commentList.innerHTML = '<p style="text-align: center; color: #a0a0a0;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentList.innerHTML = '';
    comments[blogKey].forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        commentDiv.innerHTML = `
            <div class="comment-text">${comment.text}</div>
            <div class="comment-meta">
                <span>By: ${comment.author}</span>
                <span>${comment.date}</span>
            </div>
        `;
        commentList.appendChild(commentDiv);
    });
}

// Add comment
function addComment(category, blogId) {
    const blogKey = `${category}-${blogId}`;
    const commentText = document.getElementById(`new-comment-${blogKey}`).value.trim();
    
    if (!commentText) {
        alert('Please enter a comment!');
        return;
    }
    
    if (!comments[blogKey]) {
        comments[blogKey] = [];
    }
    
    const comment = {
        id: Date.now(),
        text: commentText,
        author: 'Anonymous', // In a real app, you'd get this from user login
        date: new Date().toLocaleDateString()
    };
    
    comments[blogKey].push(comment);
    saveComments();
    loadComments(category, blogId);
    document.getElementById(`new-comment-${blogKey}`).value = '';
    updateBlogList(category);
}

// Close comment modal
function closeCommentModal() {
    const modal = document.querySelector('.comment-modal');
    if (modal) {
        modal.remove();
    }
}

// Close popup when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('popup-overlay')) {
        event.target.classList.remove('show');
        setTimeout(() => {
            event.target.style.display = 'none';
        }, 600);
    }
}

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    function applyTheme(theme) {
        if (theme === 'system') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        // Update icon
        if (theme === 'light') {
            themeIcon.className = 'fas fa-sun';
        } else if (theme === 'dark') {
            themeIcon.className = 'fas fa-moon';
        } else {
            themeIcon.className = 'fas fa-desktop';
        }
    }
    
    function cycleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'system';
        let nextTheme;
        
        if (currentTheme === 'system') {
            nextTheme = 'light';
        } else if (currentTheme === 'light') {
            nextTheme = 'dark';
        } else {
            nextTheme = 'system';
        }
        
        localStorage.setItem('theme', nextTheme);
        applyTheme(nextTheme);
    }
    
    // Apply saved theme
    applyTheme(savedTheme);
    
    // Add click listener
    themeToggle.addEventListener('click', cycleTheme);
}

// Clear localStorage to ensure fresh start
function clearAllData() {
    localStorage.removeItem('hks-perspective-blogs');
    localStorage.removeItem('hks-perspective-comments');
    localStorage.removeItem('blog-images');
}

// Preview uploaded image
function previewImage(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = '<img src="' + e.target.result + '" alt="Preview">';
        };
        
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '';
    }
}

// Save image to local storage and return filename
function saveImageToStorage(file, category, blogId) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const filename = `${category}-${blogId}-${Date.now()}.${file.name.split('.').pop()}`;
            const imageData = e.target.result;
            
            // Store image data in localStorage
            const images = JSON.parse(localStorage.getItem('blog-images') || '{}');
            images[filename] = imageData;
            localStorage.setItem('blog-images', JSON.stringify(images));
            
            resolve(filename);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Get image data from localStorage
function getImageData(filename) {
    const images = JSON.parse(localStorage.getItem('blog-images') || '{}');
    return images[filename] || '';
}

// Load blogs when page loads
window.onload = function() {
    // Clear old data to ensure fresh start
    clearAllData();
    
    initTheme();
    initAnalytics();
    loadBlogs();
    
    // Clean up duplicate blogs (keep only the first one) - but only if there are actual duplicates
    Object.keys(blogs).forEach(category => {
        if (blogs[category].length > 1) {
            // Check if there are actual duplicates (same title)
            const uniqueBlogs = [];
            const seenTitles = new Set();
            
            blogs[category].forEach(blog => {
                if (!seenTitles.has(blog.title)) {
                    seenTitles.add(blog.title);
                    uniqueBlogs.push(blog);
                }
            });
            
            blogs[category] = uniqueBlogs;
            saveBlogs();
        }
    });
    
    // Check if we're editing a blog
    const urlParams = new URLSearchParams(window.location.search);
    const editCategory = urlParams.get('edit');
    const editId = parseInt(urlParams.get('id'));
    
    if (editCategory && editId) {
        // Open the appropriate popup and load the blog for editing
        setTimeout(() => {
            openPopup(editCategory);
            const blog = blogs[editCategory].find(b => b.id === editId);
            if (blog) {
                document.getElementById(editCategory + '-title').value = blog.title;
                document.getElementById(editCategory + '-content').value = blog.content;
            }
        }, 100);
    }
};
