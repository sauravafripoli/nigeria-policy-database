/**
 * Policy Database - Main JavaScript
 * Handles data loading, filtering, searching, and display
 */

// Global state
const PolicyDB = {
    allPolicies: [],
    filteredPolicies: [],
    currentPage: 1,
    itemsPerPage: 20,
    viewMode: 'table', // 'table' or 'cards'
    sortBy: 'name',
    sortOrder: 'asc',
    filters: {
        search: '',
        family: 'all',
        type: 'all',
        status: 'all',
        jurisdiction: 'all',
        valueChain: 'all',
        reformPriority: 'all'
    },
    stakeholderLinks: null
};

/**
 * Initialize the policy database
 */
async function initPolicyDatabase() {
    console.log('Initializing Policy Database...');
    
    try {
        // Load policy data (from Python converter)
        // Use base path if available (from PHP template), otherwise use relative path
        const basePath = typeof POLICY_DB_BASE_PATH !== 'undefined' ? POLICY_DB_BASE_PATH : '';
        const dataUrl = basePath + 'data/processed/policies.json';
        
        console.log('Fetching policy data from:', dataUrl);
        const response = await fetch(dataUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        PolicyDB.allPolicies = data.policies || [];
        PolicyDB.filteredPolicies = [...PolicyDB.allPolicies];
        
        console.log(`Loaded ${PolicyDB.allPolicies.length} policies from Python converter`);
        
        // Load stakeholder links
        try {
            const linksResponse = await fetch(basePath + 'data/processed/policy_stakeholder_links.json');
            PolicyDB.stakeholderLinks = await linksResponse.json();
        } catch (err) {
            console.warn('Stakeholder links not available:', err);
        }
        
        // Update statistics
        updateStatistics(data.statistics);
        
        // Initialize filters
        populateFilterOptions();
        
        // Render initial view
        renderPolicies();
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error loading policy data:', error);
        showError('Failed to load policy data. Please process the data first.');
    }
}

/**
 * Update statistics display
 */
function updateStatistics(stats) {
    if (!stats) return;
    
    // Update using Python data structure
    const totalPolicies = PolicyDB.allPolicies.length;
    const uniqueStakeholders = Object.keys(stats.byStakeholder || {}).length;
    const policiesWithStakeholders = stats.policiesWithStakeholders || 0;
    const policyTypes = Object.keys(stats.byType || {}).length;
    
    // Update DOM elements (these are already set by PHP, but update if needed)
    const totalPoliciesEl = document.getElementById('total-policies');
    const totalStakeholdersEl = document.getElementById('total-stakeholders');
    const linkedPoliciesEl = document.getElementById('linked-policies');
    const policyTypesEl = document.getElementById('policy-types');
    
    if (totalPoliciesEl) totalPoliciesEl.textContent = totalPolicies;
    if (totalStakeholdersEl) totalStakeholdersEl.textContent = uniqueStakeholders;
    if (linkedPoliciesEl) linkedPoliciesEl.textContent = policiesWithStakeholders;
    if (policyTypesEl) policyTypesEl.textContent = policyTypes;
}

/**
 * Populate filter dropdown options
 */
function populateFilterOptions() {
    const families = new Set();
    const types = new Set();
    const statuses = new Set();
    const jurisdictions = new Set();
    const valueChains = new Set();
    const priorities = new Set();
    
    PolicyDB.allPolicies.forEach(policy => {
        if (policy.policyFamily) families.add(policy.policyFamily);
        if (policy.policyType) types.add(policy.policyType);
        if (policy.status) statuses.add(policy.status);
        if (policy.jurisdiction) jurisdictions.add(policy.jurisdiction);
        if (policy.valueChainStage) valueChains.add(policy.valueChainStage);
        if (policy.reformPriority) priorities.add(policy.reformPriority);
    });
    
    populateSelect('filter-family', Array.from(families).sort());
    populateSelect('filter-type', Array.from(types).sort());
    populateSelect('filter-status', Array.from(statuses).sort());
    populateSelect('filter-jurisdiction', Array.from(jurisdictions).sort());
    populateSelect('filter-valuechain', Array.from(valueChains).sort());
    populateSelect('filter-priority', Array.from(priorities).sort());
}

/**
 * Populate a select dropdown
 */
function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option.toLowerCase().replace(/\s+/g, '-');
        optionEl.textContent = option;
        select.appendChild(optionEl);
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter selects
    const filterIds = ['filter-family', 'filter-type', 'filter-status', 
                       'filter-jurisdiction', 'filter-valuechain', 'filter-priority'];
    
    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', handleFilterChange);
        }
    });
    
    // Reset button
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Export button
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    
    // View toggle buttons
    const tableViewBtn = document.getElementById('view-table');
    const cardsViewBtn = document.getElementById('view-cards');
    
    if (tableViewBtn) {
        tableViewBtn.addEventListener('click', () => setViewMode('table'));
    }
    if (cardsViewBtn) {
        cardsViewBtn.addEventListener('click', () => setViewMode('cards'));
    }
    
    // Modal close
    const modal = document.getElementById('policy-modal');
    const closeBtn = document.getElementById('modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal());
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
}

/**
 * Handle search input
 */
function handleSearch(e) {
    PolicyDB.filters.search = e.target.value.toLowerCase();
    applyFilters();
}

/**
 * Handle filter change
 */
function handleFilterChange(e) {
    const filterId = e.target.id.replace('filter-', '');
    PolicyDB.filters[filterId] = e.target.value;
    applyFilters();
}

/**
 * Apply all filters
 */
function applyFilters() {
    PolicyDB.filteredPolicies = PolicyDB.allPolicies.filter(policy => {
        // Search filter
        if (PolicyDB.filters.search) {
            const searchLower = PolicyDB.filters.search;
            const searchableText = [
                policy.policyName,
                policy.policySummary,
                policy.institutionalResponsibility,
                policy.stakeholdersImpacted
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchLower)) {
                return false;
            }
        }
        
        // Family filter
        if (PolicyDB.filters.family !== 'all') {
            const familySlug = policy.policyFamily.toLowerCase().replace(/\s+/g, '-');
            if (familySlug !== PolicyDB.filters.family) return false;
        }
        
        // Type filter
        if (PolicyDB.filters.type !== 'all') {
            const typeSlug = policy.policyType.toLowerCase().replace(/\s+/g, '-');
            if (typeSlug !== PolicyDB.filters.type) return false;
        }
        
        // Status filter
        if (PolicyDB.filters.status !== 'all') {
            const statusSlug = policy.status.toLowerCase().replace(/\s+/g, '-');
            if (statusSlug !== PolicyDB.filters.status) return false;
        }
        
        // Jurisdiction filter
        if (PolicyDB.filters.jurisdiction !== 'all') {
            const jurisdictionSlug = policy.jurisdiction.toLowerCase().replace(/\s+/g, '-');
            if (jurisdictionSlug !== PolicyDB.filters.jurisdiction) return false;
        }
        
        // Value chain filter
        if (PolicyDB.filters.valueChain !== 'all') {
            const vcSlug = policy.valueChainStage.toLowerCase().replace(/\s+/g, '-');
            if (!vcSlug.includes(PolicyDB.filters.valueChain)) return false;
        }
        
        // Reform priority filter
        if (PolicyDB.filters.reformPriority !== 'all') {
            const prioritySlug = policy.reformPriority.toLowerCase().replace(/\s+/g, '-');
            if (prioritySlug !== PolicyDB.filters.reformPriority) return false;
        }
        
        return true;
    });
    
    // Reset to page 1
    PolicyDB.currentPage = 1;
    
    // Re-render
    renderPolicies();
}

/**
 * Reset all filters
 */
function resetFilters() {
    PolicyDB.filters = {
        search: '',
        family: 'all',
        type: 'all',
        status: 'all',
        jurisdiction: 'all',
        valueChain: 'all',
        reformPriority: 'all'
    };
    
    // Reset UI
    document.getElementById('search-input').value = '';
    document.getElementById('filter-family').value = 'all';
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-status').value = 'all';
    document.getElementById('filter-jurisdiction').value = 'all';
    document.getElementById('filter-valuechain').value = 'all';
    document.getElementById('filter-priority').value = 'all';
    
    applyFilters();
}

/**
 * Set view mode
 */
function setViewMode(mode) {
    PolicyDB.viewMode = mode;
    
    // Update button states
    document.getElementById('view-table').classList.toggle('active', mode === 'table');
    document.getElementById('view-cards').classList.toggle('active', mode === 'cards');
    
    renderPolicies();
}

/**
 * Render policies based on current view mode
 */
function renderPolicies() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${PolicyDB.filteredPolicies.length} of ${PolicyDB.allPolicies.length} policies`;
    }
    
    if (PolicyDB.viewMode === 'table') {
        renderTableView();
    } else {
        renderCardsView();
    }
    
    renderPagination();
}

/**
 * Render table view
 */
function renderTableView() {
    const container = document.getElementById('policies-display');
    if (!container) return;
    
    // Get paginated data
    const start = (PolicyDB.currentPage - 1) * PolicyDB.itemsPerPage;
    const end = start + PolicyDB.itemsPerPage;
    const pagePolicies = PolicyDB.filteredPolicies.slice(start, end);
    
    if (pagePolicies.length === 0) {
        container.innerHTML = '<div class="text-center" style="padding: 60px;">No policies found matching your criteria.</div>';
        return;
    }
    
    let html = `
        <table class="policies-table">
            <thead>
                <tr>
                    <th onclick="sortTable('policyName')">Policy Name <span class="sort-icon">⇅</span></th>
                    <th onclick="sortTable('policyFamily')">Family <span class="sort-icon">⇅</span></th>
                    <th onclick="sortTable('yearIntroduced')">Year <span class="sort-icon">⇅</span></th>
                    <th onclick="sortTable('status')">Status <span class="sort-icon">⇅</span></th>
                    <th onclick="sortTable('reformPriority')">Priority <span class="sort-icon">⇅</span></th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    pagePolicies.forEach((policy, index) => {
        html += `
            <tr>
                <td><span class="policy-name">${formatValue(policy.policyName)}</span></td>
                <td>${formatValue(policy.policyFamily)}</td>
                <td>${formatValue(policy.yearIntroduced)}</td>
                <td><span class="policy-badge badge-${getPriorityClass(policy.status)}">${formatValue(policy.status)}</span></td>
                <td><span class="policy-badge badge-${getPriorityClass(policy.reformPriority)}">${formatValue(policy.reformPriority)}</span></td>
                <td>
                    <button class="btn-view-details" onclick="showPolicyDetails(${index})">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Render cards view
 */
function renderCardsView() {
    const container = document.getElementById('policies-display');
    if (!container) return;
    
    // Get paginated data
    const start = (PolicyDB.currentPage - 1) * PolicyDB.itemsPerPage;
    const end = start + PolicyDB.itemsPerPage;
    const pagePolicies = PolicyDB.filteredPolicies.slice(start, end);
    
    if (pagePolicies.length === 0) {
        container.innerHTML = '<div class="text-center" style="padding: 60px;">No policies found matching your criteria.</div>';
        return;
    }
    
    let html = '<div class="policies-grid">';
    
    pagePolicies.forEach((policy, index) => {
        const linkedCount = policy.linkedStakeholders?.length || 0;
        
        html += `
            <div class="policy-card" onclick="showPolicyDetails(${index})">
                <div class="policy-card-header">
                    <h3 class="policy-card-title">${formatValue(policy.policyName)}</h3>
                    <div class="policy-card-meta">
                        <span class="policy-badge badge-${getPriorityClass(policy.status)}">${formatValue(policy.status)}</span>
                        <span class="policy-badge badge-${getPriorityClass(policy.reformPriority)}">${formatValue(policy.reformPriority)}</span>
                        <span class="policy-badge">${formatValue(policy.yearIntroduced)}</span>
                    </div>
                </div>
                <div class="policy-card-summary">
                    ${formatValue(policy.policySummary, 'No summary available').substring(0, 200)}${policy.policySummary?.length > 200 ? '...' : ''}
                </div>
                <div class="policy-card-footer">
                    <span class="stakeholder-count">
                        🔗 ${linkedCount} stakeholder${linkedCount !== 1 ? 's' : ''}
                    </span>
                    <span style="color: #d97706; font-weight: 600;">View Details →</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Render pagination
 */
function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const totalPages = Math.ceil(PolicyDB.filteredPolicies.length / PolicyDB.itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = `
        <button class="page-btn" onclick="changePage(${PolicyDB.currentPage - 1})" ${PolicyDB.currentPage === 1 ? 'disabled' : ''}>
            ← Previous
        </button>
    `;
    
    // Show page numbers (max 7)
    const startPage = Math.max(1, PolicyDB.currentPage - 3);
    const endPage = Math.min(totalPages, PolicyDB.currentPage + 3);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="page-btn ${i === PolicyDB.currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    html += `
        <button class="page-btn" onclick="changePage(${PolicyDB.currentPage + 1})" ${PolicyDB.currentPage === totalPages ? 'disabled' : ''}>
            Next →
        </button>
    `;
    
    container.innerHTML = html;
}

/**
 * Change page
 */
function changePage(page) {
    const totalPages = Math.ceil(PolicyDB.filteredPolicies.length / PolicyDB.itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    PolicyDB.currentPage = page;
    renderPolicies();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Sort table
 */
function sortTable(column) {
    if (PolicyDB.sortBy === column) {
        PolicyDB.sortOrder = PolicyDB.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        PolicyDB.sortBy = column;
        PolicyDB.sortOrder = 'asc';
    }
    
    PolicyDB.filteredPolicies.sort((a, b) => {
        let aVal = a[column] || '';
        let bVal = b[column] || '';
        
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        
        if (PolicyDB.sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    renderPolicies();
}

/**
 * Show policy details in modal
 */
function showPolicyDetails(index) {
    const start = (PolicyDB.currentPage - 1) * PolicyDB.itemsPerPage;
    const policy = PolicyDB.filteredPolicies[start + index];
    if (!policy) return;
    
    const modal = document.getElementById('policy-modal');
    const modalContent = document.getElementById('modal-body');
    
    let html = `
        <div class="modal-header">
            <h2>${formatValue(policy.policyName)}</h2>
            <div class="modal-meta">
                <span class="policy-badge badge-${getPriorityClass(policy.status)}">${formatValue(policy.status)}</span>
                <span class="policy-badge">${formatValue(policy.policyFamily)}</span>
                <span class="policy-badge">${formatValue(policy.yearIntroduced)}</span>
                <span class="policy-badge badge-${getPriorityClass(policy.reformPriority)}">Priority: ${formatValue(policy.reformPriority)}</span>
            </div>
        </div>
        <div class="modal-body">
    `;
    
    // Summary
    if (policy.policySummary) {
        html += `
            <div class="detail-section">
                <h3>Policy Summary</h3>
                <p>${formatValue(policy.policySummary)}</p>
            </div>
        `;
    }
    
    // Institutional Responsibility
    if (policy.institutionalResponsibility) {
        html += `
            <div class="detail-section">
                <h3>Institutional Responsibility</h3>
                <p>${formatValue(policy.institutionalResponsibility)}</p>
            </div>
        `;
    }
    
    // Value Chain Stage
    if (policy.valueChainStage) {
        html += `
            <div class="detail-section">
                <h3>Value Chain Stage</h3>
                <p>${formatValue(policy.valueChainStage)}</p>
            </div>
        `;
    }
    
    // ESG Elements
    if (policy.esgElements) {
        html += `
            <div class="detail-section">
                <h3>ESG / Due Diligence Elements</h3>
                <p>${formatValue(policy.esgElements)}</p>
            </div>
        `;
    }
    
    // Governance Issues
    if (policy.governanceIssues) {
        html += `
            <div class="detail-section">
                <h3>Governance & Political Economy Issues</h3>
                <p>${formatValue(policy.governanceIssues)}</p>
            </div>
        `;
    }
    
    // Implementation Challenges
    if (policy.implementationChallenges) {
        html += `
            <div class="detail-section">
                <h3>Implementation Challenges</h3>
                <p>${formatValue(policy.implementationChallenges)}</p>
            </div>
        `;
    }
    
    // Stakeholders Impacted
    if (policy.stakeholdersImpacted) {
        html += `
            <div class="detail-section">
                <h3>Stakeholders Impacted</h3>
                <p>${formatValue(policy.stakeholdersImpacted)}</p>
            </div>
        `;
    }
    
    // Linked Stakeholders
    if (policy.linkedStakeholders && policy.linkedStakeholders.length > 0) {
        html += `
            <div class="detail-section">
                <h3>Linked Stakeholders (${policy.linkedStakeholders.length})</h3>
                <div class="stakeholders-list">
        `;
        
        policy.linkedStakeholders.forEach(stakeholder => {
            html += `
                <div class="stakeholder-item">
                    <span class="stakeholder-name">${formatValue(stakeholder)}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
    }
    
    // External Links
    if (policy.links) {
        html += `
            <div class="detail-section">
                <h3>External Resources</h3>
                <div class="external-links">
                    <a href="${formatValue(policy.links)}" target="_blank" class="external-link">🔗 ${formatValue(policy.links)}</a>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('policy-modal');
    modal.classList.remove('active');
}

/**
 * Export to CSV
 */
function exportToCSV() {
    const headers = ['Policy Name', 'Family', 'Type', 'Year', 'Status', 'Jurisdiction', 'Reform Priority', 'Summary'];
    const rows = [headers];
    
    PolicyDB.filteredPolicies.forEach(policy => {
        rows.push([
            policy.name,
            policy.family,
            policy.type,
            policy.year,
            policy.status,
            policy.jurisdiction,
            policy.reformPriority,
            policy.summary
        ]);
    });
    
    const csvContent = rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nigeria-mining-policies-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

/**
 * Utility: Get CSS class for priority/status
 */
function getPriorityClass(value) {
    const val = String(value).toLowerCase();
    if (val.includes('high')) return 'high';
    if (val.includes('medium')) return 'medium';
    if (val.includes('low')) return 'low';
    if (val.includes('active') || val.includes('force')) return 'active';
    if (val.includes('draft')) return 'draft';
    return '';
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Utility: Format value (handle null, undefined, empty strings)
 */
function formatValue(value, placeholder = '—') {
    if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
        return placeholder;
    }
    return escapeHtml(value);
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show error message
 */
function showError(message) {
    const container = document.getElementById('policies-display');
    if (container) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <strong>Error:</strong> ${escapeHtml(message)}
                <p>Please run the data processor: <a href="/nigeria/admin/process-policy-data.php">Process Policy Data</a></p>
            </div>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initPolicyDatabase);
