/**
 * Mining Stakeholder Database - Table Logic
 * Handles data table rendering, sorting, and pagination
 */

// Table state
let currentPage = 1;
let itemsPerPage = 25;
let sortColumn = 'name';
let sortDirection = 'asc';
let currentView = 'table'; // 'table' or 'grid'

// Initialize table
document.addEventListener('DOMContentLoaded', () => {
    initializeTable();
});

function initializeTable() {
    console.log('Initializing table...');
    
    // View toggle buttons
    const gridViewBtn = document.getElementById('view-grid');
    const tableViewBtn = document.getElementById('view-table');
    
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => {
            currentView = 'grid';
            gridViewBtn.classList.add('active');
            tableViewBtn.classList.remove('active');
            toggleView();
        });
    }
    
    if (tableViewBtn) {
        tableViewBtn.addEventListener('click', () => {
            currentView = 'table';
            tableViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            toggleView();
        });
    }
    
    // Sort headers
    const sortableHeaders = document.querySelectorAll('.data-table th.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            handleSort(column);
        });
    });
    
    // Pagination buttons
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateTable(filteredStakeholders);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredStakeholders.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updateTable(filteredStakeholders);
            }
        });
    }
}

function toggleView() {
    const tableView = document.getElementById('table-view');
    const gridView = document.getElementById('grid-view');
    
    if (currentView === 'grid') {
        tableView.style.display = 'none';
        gridView.style.display = 'block';
        renderGridView(filteredStakeholders);
    } else {
        tableView.style.display = 'block';
        gridView.style.display = 'none';
        updateTable(filteredStakeholders);
    }
}

function updateTable(data) {
    console.log(`Updating table with ${data.length} records`);
    
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    
    // Sort data
    const sorted = sortData(data);
    
    // Paginate
    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = sorted.slice(start, end);
    
    // Clear table
    tbody.innerHTML = '';
    
    // Render rows
    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">
                    <div class="empty-state">
                        <svg width="64" height="64" fill="#d1d5db" style="margin-bottom: 16px;">
                            <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
                            <text x="32" y="40" text-anchor="middle" font-size="32" fill="currentColor">∅</text>
                        </svg>
                        <p>No stakeholders found</p>
                        <small>Try adjusting your filters</small>
                    </div>
                </td>
            </tr>
        `;
    } else {
        pageData.forEach(stakeholder => {
            const row = createTableRow(stakeholder);
            tbody.appendChild(row);
        });
    }
    
    // Update pagination
    updatePagination(data.length, totalPages);
}

function createTableRow(s) {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td>
            <strong>${s.name}</strong>
            ${s.type ? `<br><small style="color: #6b7280;">${s.type}</small>` : ''}
        </td>
        <td>
            <span class="category-badge" style="background: ${getCategoryColor(s.category)}20; color: ${getCategoryColor(s.category)};">
                ${s.category}
            </span>
        </td>
        <td>
            <span class="state-badge">${s.location.state}</span>
            ${s.location.zone ? `<br><small style="color: #9ca3af;">${s.location.zone}</small>` : ''}
        </td>
        <td>
            <div class="contact-info">
                ${s.contact.person ? `<div><strong>${s.contact.person}</strong></div>` : ''}
                ${s.contact.email ? `<div><a href="mailto:${s.contact.email}" style="color: #2563eb; text-decoration: none;">${s.contact.email}</a></div>` : ''}
                ${s.contact.phone ? `<div>${s.contact.phone}</div>` : ''}
            </div>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn-sm btn-primary-sm" onclick="viewOnMap('${s.id}')">
                    View on Map
                </button>
                <button class="btn-sm" onclick="viewDetail('${s.id}')">
                    Details
                </button>
            </div>
        </td>
    `;
    
    return tr;
}

function renderGridView(data) {
    const gridItems = document.getElementById('grid-items');
    if (!gridItems) return;
    
    gridItems.innerHTML = '';
    
    const sorted = sortData(data);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = sorted.slice(start, end);
    
    if (pageData.length === 0) {
        gridItems.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <p style="color: #6b7280;">No stakeholders found</p>
            </div>
        `;
    } else {
        pageData.forEach(stakeholder => {
            const card = createGridCard(stakeholder);
            gridItems.appendChild(card);
        });
    }
    
    updatePagination(data.length, Math.ceil(data.length / itemsPerPage));
}

function createGridCard(s) {
    const card = document.createElement('div');
    card.className = 'stakeholder-card';
    card.onclick = () => viewDetail(s.id);
    
    card.innerHTML = `
        <h3>${s.name}</h3>
        <div class="category" style="color: ${getCategoryColor(s.category)};">
            ${s.category}
        </div>
        <div class="location">
            📍 ${s.location.state}${s.location.lga ? `, ${s.location.lga}` : ''}
        </div>
        ${s.contact.person ? `<div style="font-size: 13px; color: #6b7280;">Contact: ${s.contact.person}</div>` : ''}
        ${s.contact.email ? `<div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">${s.contact.email}</div>` : ''}
    `;
    
    return card;
}

function sortData(data) {
    return [...data].sort((a, b) => {
        let aVal, bVal;
        
        switch (sortColumn) {
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
            case 'category':
                aVal = a.category.toLowerCase();
                bVal = b.category.toLowerCase();
                break;
            case 'state':
                aVal = a.location.state.toLowerCase();
                bVal = b.location.state.toLowerCase();
                break;
            default:
                return 0;
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

function handleSort(column) {
    if (sortColumn === column) {
        // Toggle direction
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // Update sort icons
    document.querySelectorAll('.data-table th .sort-icon').forEach(icon => {
        icon.textContent = '↕';
        icon.style.opacity = '0.4';
    });
    
    const activeHeader = document.querySelector(`.data-table th[data-sort="${column}"] .sort-icon`);
    if (activeHeader) {
        activeHeader.textContent = sortDirection === 'asc' ? '↑' : '↓';
        activeHeader.style.opacity = '1';
    }
    
    updateTable(filteredStakeholders);
}

function updatePagination(totalItems, totalPages) {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

function getCategoryColor(category) {
    const colors = {
        'Federal Government': '#2563eb',
        'State Agencies': '#4f46e5',
        'MMSD Offices': '#6366f1',
        'Mining Companies': '#dc2626',
        'Mining Consultancies': '#ef4444',
        'Artisanal Miners': '#f97316',
        'Associations': '#0891b2',
        'State Companies': '#8b5cf6',
        'Infrastructure': '#64748b',
        'NGOs': '#16a34a',
        'Civil Society': '#22c55e',
        'Donors': '#9333ea',
        'Training Institutes': '#eab308',
        'Universities': '#ea580c'
    };
    
    return colors[category] || '#6b7280';
}

function viewOnMap(id) {
    const stakeholder = allStakeholders.find(s => s.id === id);
    
    if (!stakeholder) {
        console.warn('Stakeholder not found:', id);
        return;
    }
    
    // Scroll to map
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Highlight marker on map and open popup
    if (window.miningMap && stakeholder.location && stakeholder.location.coordinates) {
        let [lng, lat] = stakeholder.location.coordinates;
        
        // If coordinates are 0 or missing, use center of Nigeria (same logic as map)
        if (!lat || !lng || (lat === 0 && lng === 0)) {
            lat = 9.0820;  // Center of Nigeria latitude
            lng = 8.6753;  // Center of Nigeria longitude
        }
        
        // Pan to marker
        window.miningMap.leafletMap.setView([lat, lng], 10, {
            animate: true,
            duration: 1
        });
        
        // Find and open the marker popup
        // For unknown locations, search within a larger radius since they're randomly placed
        const searchRadius = (lat === 9.0820 && lng === 8.6753) ? 1.0 : 0.001;
        
        setTimeout(() => {
            let found = false;
            window.miningMap.markersLayer.eachLayer((layer) => {
                if (layer.getLatLng && layer.getPopup) {
                    const markerLatLng = layer.getLatLng();
                    if (Math.abs(markerLatLng.lat - lat) < searchRadius && Math.abs(markerLatLng.lng - lng) < searchRadius) {
                        // For multiple matches (unknown locations), check if it's the right stakeholder by name
                        const popupContent = layer.getPopup().getContent();
                        if (popupContent.includes(stakeholder.name)) {
                            layer.openPopup();
                            found = true;
                        }
                    }
                }
            });
            
            if (!found) {
                console.log('Marker not found for stakeholder:', stakeholder.name);
            }
        }, 500);
    }
    
    console.log('View on map:', stakeholder.name);
}

function viewDetail(id) {
    const stakeholder = allStakeholders.find(s => s.id === id);
    if (stakeholder && window.miningMap) {
        window.miningMap.showDetail(stakeholder);
    }
}

// Make functions available globally
window.updateTable = updateTable;
window.viewOnMap = viewOnMap;
window.viewDetail = viewDetail;
