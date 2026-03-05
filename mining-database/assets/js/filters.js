/**
 * Mining Stakeholder Database - Filter Logic
 * Handles all filter interactions and data filtering
 */

// Active filters
let activeFilters = {
    search: '',
    states: [],
    categories: []
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
    
    // Custom state dropdown
    const stateTrigger = document.getElementById('state-trigger');
    const stateMenu = document.getElementById('state-menu');
    const stateDropdown = document.getElementById('state-dropdown');
    
    if (stateTrigger && stateMenu) {
        // Toggle dropdown
        stateTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            stateDropdown.classList.toggle('open');
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!stateDropdown.contains(e.target)) {
                stateDropdown.classList.remove('open');
            }
        });
        
        // Handle checkbox changes
        const stateCheckboxes = stateMenu.querySelectorAll('input[type="checkbox"]');
        const allCheckbox = document.getElementById('state-all');
        
        stateCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.id === 'state-all') {
                    // If "All" is checked, uncheck others
                    if (checkbox.checked) {
                        stateCheckboxes.forEach(cb => {
                            if (cb !== checkbox) cb.checked = false;
                        });
                    }
                } else {
                    // If any specific state is checked, uncheck "All"
                    if (checkbox.checked && allCheckbox) {
                        allCheckbox.checked = false;
                    }
                }
                
                updateStateFilter();
            });
        });
        
        // Make zone labels clickable to toggle all states in that zone
        const zoneLabels = stateMenu.querySelectorAll('.state-group-label');
        zoneLabels.forEach(label => {
            label.addEventListener('click', (e) => {
                e.stopPropagation();
                const stateGroup = label.parentElement;
                const stateOptions = stateGroup.querySelectorAll('.state-option input[type="checkbox"]');
                
                // Check if all states in this zone are currently selected
                const allChecked = Array.from(stateOptions).every(cb => cb.checked);
                
                // Uncheck "All States" if checked
                if (allCheckbox) allCheckbox.checked = false;
                
                // Toggle: if all checked, uncheck all; if not all checked, check all
                stateOptions.forEach(cb => cb.checked = !allChecked);
                
                updateStateFilter();
            });
        });
    }
    
    function updateStateFilter() {
        const stateCheckboxes = document.querySelectorAll('#state-menu input[type="checkbox"]:checked');
        const allCheckbox = document.getElementById('state-all');
        const stateDisplay = document.getElementById('state-display');
        
        if (allCheckbox && allCheckbox.checked) {
            activeFilters.states = [];
            stateDisplay.textContent = 'All States (37)';
        } else {
            const selectedStates = Array.from(stateCheckboxes)
                .map(cb => cb.parentElement.dataset.value)
                .filter(val => val && val !== 'all');
            
            activeFilters.states = selectedStates;
            
            const count = selectedStates.length;
            if (count === 0) {
                stateDisplay.textContent = 'Select states...';
            } else if (count === 1) {
                stateDisplay.textContent = selectedStates[0];
            } else {
                stateDisplay.textContent = `${count} states selected`;
            }
        }
        
        applyFilters();
    }
    
    // Category checkboxes
    const categoryCheckboxes = document.querySelectorAll('#category-checkboxes input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateCategoryFilters();
            syncPillsWithCheckboxes();
            applyFilters();
        });
    });
    
    // Function to sync hero pills with sidebar checkboxes
    function syncPillsWithCheckboxes() {
        const categoryMap = {
            'Federal Government': 'federal-government',
            'State Agencies': 'state-agencies',
            'MMSD Offices': 'mmsd-offices',
            'Mining Companies': 'mining-companies',
            'Mining Consultancies': 'mining-consultancies',
            'Artisanal Miners': 'artisanal-miners',
            'Associations': 'associations',
            'State Companies': 'state-companies',
            'Infrastructure': 'infrastructure',
            'NGOs': 'ngos',
            'Civil Society': 'civil-society',
            'Donors': 'donors',
            'Universities': 'universities',
            'Training Institutes': 'training-institutes'
        };
        
        // Update each pill based on checkbox state
        categoryCheckboxes.forEach(checkbox => {
            const categorySlug = categoryMap[checkbox.value];
            if (categorySlug) {
                const pill = document.querySelector(`.category-pills .pill[data-category="${categorySlug}"]`);
                if (pill) {
                    pill.classList.toggle('active', checkbox.checked);
                }
            }
        });
        
        // Update "All" pill - active if all checkboxes are checked
        const allChecked = Array.from(categoryCheckboxes).every(cb => cb.checked);
        const allPill = document.querySelector('.category-pills .pill[data-category="all"]');
        if (allPill) {
            allPill.classList.toggle('active', allChecked);
        }
    }
    
    // Category pills (multi-select with toggle)
    const categoryPills = document.querySelectorAll('.category-pills .pill');
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const categorySlug = pill.dataset.category;
            
            console.log('Pill clicked:', categorySlug);
            
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
            
            // Handle "All" pill
            if (categorySlug === 'all') {
                const isActive = pill.classList.contains('active');
                
                if (isActive) {
                    // Deselect all - uncheck all and remove active from all pills
                    categoryCheckboxes.forEach(cb => cb.checked = false);
                    categoryPills.forEach(p => p.classList.remove('active'));
                } else {
                    // Select all - check all and make all pills active
                    categoryCheckboxes.forEach(cb => cb.checked = true);
                    categoryPills.forEach(p => p.classList.add('active'));
                }
                
                updateCategoryFilters();
            } else {
                // Toggle individual category
                const categoryName = categoryMap[categorySlug];
                
                if (categoryName) {
                    const checkbox = Array.from(categoryCheckboxes).find(cb => cb.value === categoryName);
                    
                    if (checkbox) {
                        // Toggle checkbox and pill state
                        checkbox.checked = !checkbox.checked;
                        pill.classList.toggle('active');
                        
                        // Check if all checkboxes are now checked
                        const allChecked = Array.from(categoryCheckboxes).every(cb => cb.checked);
                        const allPill = document.querySelector('.category-pills .pill[data-category="all"]');
                        
                        if (allChecked) {
                            // If all are checked, activate "All" pill
                            if (allPill) allPill.classList.add('active');
                        } else {
                            // If not all are checked, deactivate "All" pill
                            if (allPill) allPill.classList.remove('active');
                        }
                    }
                    
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

// Make updateCategoryFilters available globally for map legend
window.updateCategoryFilters = updateCategoryFilters;
window.applyFilters = applyFilters;

function updateCategoryFilters() {
    const checkboxes = document.querySelectorAll('#category-checkboxes input[type="checkbox"]:checked');
    activeFilters.categories = Array.from(checkboxes).map(cb => cb.value);
    console.log('Category filters updated:', activeFilters.categories);
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
    
    // State filter (multi-select)
    if (activeFilters.states.length > 0) {
        filtered = filtered.filter(s => activeFilters.states.includes(s.location.state));
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
        states: [],
        categories: []
    };
    
    // Reset UI
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    // Reset custom state dropdown
    const stateCheckboxes = document.querySelectorAll('#state-menu input[type="checkbox"]');
    stateCheckboxes.forEach(cb => cb.checked = false);
    const allCheckbox = document.getElementById('state-all');
    if (allCheckbox) allCheckbox.checked = true;
    if (typeof updateStateFilter === 'function') updateStateFilter();
    
    // Check all checkboxes
    const allCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    allCheckboxes.forEach(cb => cb.checked = true);
    
    // Update category filters array after checking all
    updateCategoryFilters();
    
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
    csv += `"Website: https://afripoli.org/"\n`;
    csv += `"Contact: office@afripoli.org"\n`;
    csv += '"\n';
    
    // Active filters info
    const activeFiltersList = [];
    if (activeFilters.search) activeFiltersList.push(`Search: "${activeFilters.search}"`);
    if (activeFilters.states.length > 0) activeFiltersList.push(`States: ${activeFilters.states.join(', ')}`);
    if (activeFilters.categories.length > 0) activeFiltersList.push(`Categories: ${activeFilters.categories.join(', ')}`);
    
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
        'State',
        'Mandate/Description',
        'Website'
    ];
    
    csv += headers.join(',') + '\n';
    
    data.forEach(s => {
        const row = [
            `"${s.name.replace(/"/g, '""')}"`,
            `"${s.category}"`,
            `"${s.location.state}"`,
            `"${(s.description || '').replace(/"/g, '""')}"`,
            `"${s.website || ''}"`
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
    csv += '"  Email: office@afripoli.org"\n';
    csv += '"  Website: https://afripoli.org/"\n';
    csv += '"  Phone: +49 30-33909525"\n';
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

// Category filter helper functions
function selectAllCategories() {
    const categoryCheckboxes = document.querySelectorAll('#category-checkboxes input[type="checkbox"]');
    categoryCheckboxes.forEach(cb => cb.checked = true);
    
    // Activate all pills
    const categoryPills = document.querySelectorAll('.category-pills .pill');
    categoryPills.forEach(p => p.classList.add('active'));
    
    updateCategoryFilters();
    applyFilters();
}

function clearAllCategories() {
    const categoryCheckboxes = document.querySelectorAll('#category-checkboxes input[type="checkbox"]');
    categoryCheckboxes.forEach(cb => cb.checked = false);
    
    // Deactivate all pills
    const categoryPills = document.querySelectorAll('.category-pills .pill');
    categoryPills.forEach(p => p.classList.remove('active'));
    
    updateCategoryFilters();
    applyFilters();
}

// Make functions available globally
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.exportToCSV = exportToCSV;
window.selectAllCategories = selectAllCategories;
window.clearAllCategories = clearAllCategories;
