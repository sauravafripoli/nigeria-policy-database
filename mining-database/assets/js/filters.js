/**
 * Mining Stakeholder Database - Filter Logic
 * Handles all filter interactions and data filtering
 */

// Active filters
let activeFilters = {
    search: '',
    state: 'all',
    categories: [],
    zones: []
};

// Initialize filters
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
});

function initializeFilters() {
    console.log('Initializing filters...');
    
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            activeFilters.search = e.target.value.toLowerCase();
            applyFilters();
        }, 300));
    }
    
    // State filter
    const stateFilter = document.getElementById('state-filter');
    if (stateFilter) {
        stateFilter.addEventListener('change', (e) => {
            activeFilters.state = e.target.value;
            applyFilters();
        });
    }
    
    // Category checkboxes
    const categoryCheckboxes = document.querySelectorAll('#category-checkboxes input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateCategoryFilters();
            applyFilters();
        });
    });
    
    // Zone checkboxes
    const zoneCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"][value*="North"], .filter-group input[type="checkbox"][value*="South"]');
    zoneCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateZoneFilters();
            applyFilters();
        });
    });
    
    // Category pills
    const categoryPills = document.querySelectorAll('.category-pills .pill');
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const categorySlug = pill.dataset.category;
            
            console.log('Pill clicked:', categorySlug);
            
            // Update active state
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            // Map slug to actual category name
            const categoryMap = {
                'all': 'all',
                'federal-government': 'Federal Government',
                'state-agencies': 'State Agencies',
                'mmsd-offices': 'MMSD Offices',
                'mining-companies': 'Mining Companies',
                'mining-consultancies': 'Mining Consultancies',
                'consultancies': 'Mining Consultancies',
                'artisanal-miners': 'Artisanal Miners',
                'associations': 'Associations',
                'state-companies': 'State Companies',
                'infrastructure': 'Infrastructure',
                'ngos': 'NGOs',
                'civil-society': 'Civil Society',
                'donors': 'Donors',
                'universities': 'Universities',
                'training-institutes': 'Training Institutes'
            };
            
            // Apply filter
            if (categorySlug === 'all') {
                // Check all checkboxes
                categoryCheckboxes.forEach(cb => cb.checked = true);
                updateCategoryFilters();
            } else {
                const categoryName = categoryMap[categorySlug];
                
                if (categoryName) {
                    // Update checkboxes - uncheck all, then check only the selected one
                    categoryCheckboxes.forEach(cb => {
                        cb.checked = cb.value === categoryName;
                    });
                    updateCategoryFilters();
                } else {
                    console.warn('Unknown category slug:', categorySlug);
                }
            }
            
            applyFilters();
        });
    });
    
    // Reset filters button
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
}

function updateCategoryFilters() {
    const checkboxes = document.querySelectorAll('#category-checkboxes input[type="checkbox"]:checked');
    activeFilters.categories = Array.from(checkboxes).map(cb => cb.value);
    console.log('Category filters updated:', activeFilters.categories);
}

function updateZoneFilters() {
    const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"][value*="North"]:checked, .filter-group input[type="checkbox"][value*="South"]:checked');
    activeFilters.zones = Array.from(checkboxes).map(cb => cb.value);
}

function applyFilters() {
    console.log('Applying filters:', activeFilters);
    
    let filtered = [...allStakeholders];
    
    // Search filter
    if (activeFilters.search) {
        filtered = filtered.filter(s => {
            const searchText = activeFilters.search;
            return (
                s.name.toLowerCase().includes(searchText) ||
                s.category.toLowerCase().includes(searchText) ||
                s.location.state.toLowerCase().includes(searchText) ||
                (s.location.lga && s.location.lga.toLowerCase().includes(searchText)) ||
                (s.type && s.type.toLowerCase().includes(searchText))
            );
        });
    }
    
    // State filter
    if (activeFilters.state !== 'all') {
        filtered = filtered.filter(s => s.location.state === activeFilters.state);
    }
    
    // Category filter - FIXED: Handle empty array correctly
    const allCategoryCheckboxes = document.querySelectorAll('#category-checkboxes input[type="checkbox"]');
    const checkedCategoryCheckboxes = document.querySelectorAll('#category-checkboxes input[type="checkbox"]:checked');
    
    // If NO categories are checked (and we have category checkboxes), show nothing
    if (allCategoryCheckboxes.length > 0 && checkedCategoryCheckboxes.length === 0) {
        filtered = []; // Show no results when all categories unchecked
    } else if (activeFilters.categories.length > 0) {
        // If some categories are checked, filter by those
        filtered = filtered.filter(s => activeFilters.categories.includes(s.category));
    }
    // If all categories checked or no category filter exists, show all (filtered by other filters)
    
    // Zone filter
    if (activeFilters.zones.length > 0) {
        filtered = filtered.filter(s => activeFilters.zones.includes(s.location.zone));
    }
    
    // Update global filtered data
    filteredStakeholders = filtered;
    
    console.log(`Filtered down to ${filtered.length} stakeholders`);
    
    // Update UI
    updateFilteredCount(filtered.length);
    
    // Update map
    if (window.miningMap) {
        window.miningMap.renderStakeholders();
    }
    
    // Update table
    if (window.updateTable) {
        window.updateTable(filtered);
    }
}

function updateFilteredCount(count) {
    const statShowing = document.getElementById('stat-showing');
    if (statShowing) {
        statShowing.textContent = count;
    }
    
    const tableShowing = document.getElementById('table-showing');
    if (tableShowing) {
        tableShowing.textContent = `Showing ${count} stakeholder${count !== 1 ? 's' : ''}`;
    }
}

function resetFilters() {
    console.log('Resetting filters...');
    
    // Reset filter state
    activeFilters = {
        search: '',
        state: 'all',
        categories: [],
        zones: []
    };
    
    // Reset UI
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    const stateFilter = document.getElementById('state-filter');
    if (stateFilter) stateFilter.value = 'all';
    
    // Check all checkboxes
    const allCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    allCheckboxes.forEach(cb => cb.checked = true);
    
    // Update category filters array after checking all
    updateCategoryFilters();
    updateZoneFilters();
    
    // Reset category pills
    const categoryPills = document.querySelectorAll('.category-pills .pill');
    categoryPills.forEach(p => p.classList.remove('active'));
    document.querySelector('.category-pills .pill[data-category="all"]')?.classList.add('active');
    
    // Apply filters
    applyFilters();
}

function exportToCSV() {
    console.log('Exporting to CSV...');
    
    // Use filteredStakeholders directly - respect the user's filters
    // If they filtered to empty results, tell them rather than exporting all
    const data = filteredStakeholders;
    
    if (data.length === 0) {
        alert('No data to export. Please adjust your filters to include stakeholders.');
        return;
    }
    
    // Get current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Build CSV with APRI branding header
    let csv = '';
    
    // === HEADER SECTION ===
    csv += '"AFRICA POLICY RESEARCH INSTITUTE (APRI)"\n';
    csv += '"Nigeria Mining Stakeholder Database"\n';
    csv += '"\n';
    csv += `"Report Generated: ${dateStr} at ${timeStr}"\n`;
    csv += `"Total Records: ${data.length} stakeholders"\n`;
    csv += `"Website: https://apri.africa"\n`;
    csv += `"Contact: info@apri.africa"\n`;
    csv += '"\n';
    
    // Active filters info
    const activeFiltersList = [];
    if (activeFilters.search) activeFiltersList.push(`Search: "${activeFilters.search}"`);
    if (activeFilters.state !== 'all') activeFiltersList.push(`State: ${activeFilters.state}`);
    if (activeFilters.categories.length > 0) activeFiltersList.push(`Categories: ${activeFilters.categories.join(', ')}`);
    if (activeFilters.zones.length > 0) activeFiltersList.push(`Zones: ${activeFilters.zones.join(', ')}`);
    
    if (activeFiltersList.length > 0) {
        csv += '"Active Filters:"\n';
        activeFiltersList.forEach(filter => {
            csv += `"  - ${filter}"\n`;
        });
        csv += '"\n';
    }
    
    csv += '"\n';
    csv += '"==========================================="\n';
    csv += '"\n';
    
    // === DATA SECTION ===
    const headers = [
        'Name',
        'Category',
        'Type',
        'State',
        'LGA',
        'Zone',
        'Contact Person',
        'Position',
        'Email',
        'Phone',
        'Address',
        'Website',
        'Description'
    ];
    
    csv += headers.join(',') + '\n';
    
    data.forEach(s => {
        const row = [
            `"${s.name.replace(/"/g, '""')}"`,
            `"${s.category}"`,
            `"${s.type}"`,
            `"${s.location.state}"`,
            `"${s.location.lga || ''}"`,
            `"${s.location.zone || ''}"`,
            `"${s.contact.person || ''}"`,
            `"${s.contact.position || ''}"`,
            `"${s.contact.email || ''}"`,
            `"${s.contact.phone || ''}"`,
            `"${(s.contact.address || '').replace(/"/g, '""')}"`,
            `"${s.website || ''}"`,
            `"${(s.description || '').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
    });
    
    // === FOOTER SECTION ===
    csv += '\n';
    csv += '"==========================================="\n';
    csv += '"\n';
    csv += '"COPYRIGHT & TERMS OF USE"\n';
    csv += `"© ${now.getFullYear()} Africa Policy Research Institute (APRI). All rights reserved."\n`;
    csv += '"\n';
    csv += '"This data is provided for research and informational purposes only."\n';
    csv += '"Redistribution or commercial use requires written permission from APRI."\n';
    csv += '"\n';
    csv += '"For inquiries, partnerships, or data licensing:"\n';
    csv += '"  Email: info@apri.africa"\n';
    csv += '"  Website: https://apri.africa"\n';
    csv += '"  Phone: +234 XXX XXX XXXX"\n';
    csv += '"\n';
    csv += '"Data Source: Nigeria Mining Stakeholder Database"\n';
    csv += '"Maintained by: Africa Policy Research Institute"\n';
    csv += `"Last Updated: ${dateStr}"\n`;
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `APRI-Mining-Stakeholders-${now.toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Exported ${data.length} records with APRI branding`);
}

// Utility: Debounce function
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

// Make functions available globally
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.exportToCSV = exportToCSV;
