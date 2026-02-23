/**
 * Mining Stakeholder Database - Hybrid Leaflet + D3.js Map
 * Uses Leaflet for geographic rendering and D3.js for data management/filters
 */

// Global variables (D3.js manages data)
let mapInstance = null;
let allStakeholders = [];
let filteredStakeholders = [];

// Color scale for categories
const categoryColors = {
    'Federal Government': '#ffc03c',        // Primary yellow
    'State Agencies': '#d97706',            // Amber
    'MMSD Offices': '#f59e0b',              // Lighter amber
    'Mining Companies': '#dc2626',          // Red
    'Mining Consultancies': '#ef4444',      // Light red
    'Artisanal Miners': '#f97316',          // Orange
    'Associations': '#0891b2',              // Cyan
    'State Companies': '#8b5cf6',           // Purple
    'Infrastructure': '#64748b',            // Slate gray
    'NGOs': '#16a34a',                      // Green
    'Civil Society': '#22c55e',             // Light green
    'Donors': '#9333ea',                    // Violet
    'Training Institutes': '#eab308',       // Yellow
    'Universities': '#ea580c'               // Deep orange
};

/**
 * Hybrid Mining Map Class
 * Combines Leaflet (geographic map) + D3.js (data management)
 */
class MiningMap {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.querySelector(containerId);
        this.leafletMap = null;
        this.markersLayer = null;
        this.statesLayer = null;
        this.markers = {};
        this.stakeholderData = [];
        
        this.init();
    }
    
    async init() {
        console.log('Initializing hybrid Leaflet + D3.js map...');
        
        try {
            // Load data first
            await this.loadData();
            
            // Setup Leaflet map
            this.setupLeafletMap();
            
            // Load Nigeria states
            await this.loadNigeriaStates();
            
            // Render stakeholder markers
            this.renderStakeholders();
            
            // Setup interactions
            this.setupInteractions();
            
            // Generate legend
            this.generateLegend();
            
            // Hide loading indicator
            document.getElementById('map-loading').style.display = 'none';
            
            console.log('Hybrid map initialized successfully!');
        } catch (error) {
            console.error('Error initializing map:', error);
            this.showError(error.message);
        }
    }
    
    setupLeafletMap() {
        console.log('Setting up Leaflet map...');
        
        // Initialize Leaflet map
        this.leafletMap = L.map(this.container, {
            center: [9.082, 8.675], // Center of Nigeria
            zoom: 6,
            minZoom: 5,
            maxZoom: 18,
            zoomControl: true
        });
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.leafletMap);
        
        // Create layer groups
        this.statesLayer = L.layerGroup().addTo(this.leafletMap);
        this.markersLayer = L.layerGroup().addTo(this.leafletMap);
        
        console.log('Leaflet map setup complete');
    }
    
    async loadData() {
        try {
            console.log('Loading stakeholder data...');
            
            // Get data URL from container element
            const dataUrl = this.container.dataset.jsonUrl;
            
            if (!dataUrl) {
                throw new Error('Data URL not configured');
            }
            
            console.log('Fetching from:', dataUrl);
            
            // Load stakeholder data
            const response = await fetch(dataUrl);
            
            if (!response.ok) {
                throw new Error('Data not found. Please process the CSV files first.');
            }
            
            const data = await response.json();
            this.stakeholderData = data.stakeholders || [];
            allStakeholders = this.stakeholderData;
            filteredStakeholders = this.stakeholderData;
            
            console.log(`Loaded ${this.stakeholderData.length} stakeholders`);
            
            // Update UI with stats
            this.updateStats(data.metadata, data.statistics);
            
            // Update category counts
            this.updateCategoryCounts();
            
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }
    
    async loadNigeriaStates() {
        try {
            console.log('Loading Nigeria state boundaries...');
            
            // Try loading GeoJSON
            const geojsonUrl = this.container.dataset.geojsonUrl;
            
            if (geojsonUrl) {
                const response = await fetch(geojsonUrl);
                const geojson = await response.json();
                
                console.log('Loaded GeoJSON with', geojson.features.length, 'states');
                
                // Note: State circles removed for cleaner map view
                // Just load the data without rendering circles
                
                return;
            }
            
            // Fallback to centroids
            const centroidsUrl = this.container.dataset.centroidsUrl;
            
            if (centroidsUrl) {
                console.log('Fetching centroids from:', centroidsUrl);
                
                const response = await fetch(centroidsUrl);
                const data = await response.json();
                
                // Note: State circles removed for cleaner map view
                // Data loaded but not rendered
            }
            
        } catch (error) {
            console.warn('Failed to load state boundaries:', error);
        }
    }
    
    renderStakeholders() {
        console.log('Rendering stakeholders...');
        
        // Clear existing markers
        this.markersLayer.clearLayers();
        this.markers = {};
        
        // Use filtered data (even if empty!)
        // Don't fall back to all data when filtered result is empty
        const data = filteredStakeholders;
        
        console.log(`Rendering ${data.length} stakeholders`);
        
        // If no data, just return (empty map)
        if (data.length === 0) {
            console.log('No stakeholders to render after filtering');
            return;
        }
        
        // Create markers for each stakeholder
        data.forEach((stakeholder, index) => {
            if (!stakeholder.location || !stakeholder.location.coordinates) {
                return;
            }
            
            const [lng, lat] = stakeholder.location.coordinates;
            
            if (!lat || !lng) {
                return;
            }
            
            // Create circle marker
            const marker = L.circleMarker([lat, lng], {
                radius: 6,
                fillColor: categoryColors[stakeholder.category] || '#6b7280',
                color: '#ffffff',
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.85
            });
            
            // Add popup with stakeholder info
            marker.bindPopup(this.createPopupContent(stakeholder), {
                maxWidth: 300,
                className: 'stakeholder-popup'
            });
            
            // Add tooltip on hover
            marker.bindTooltip(stakeholder.name, {
                permanent: false,
                direction: 'top',
                offset: [0, -5]
            });
            
            // Add click handler
            marker.on('click', () => {
                this.showDetail(stakeholder);
            });
            
            // Animate entrance
            setTimeout(() => {
                marker.addTo(this.markersLayer);
            }, index * 2);
            
            // Store marker reference
            this.markers[stakeholder.name] = marker;
        });
        
        console.log(`Added ${Object.keys(this.markers).length} markers to map`);
    }
    
    createPopupContent(stakeholder) {
        return `
            <div class="stakeholder-popup-content">
                <h4 style="margin: 0 0 8px 0; color: ${categoryColors[stakeholder.category] || '#333'};">
                    ${stakeholder.name}
                </h4>
                <p style="margin: 4px 0;"><strong>Category:</strong> ${stakeholder.category}</p>
                <p style="margin: 4px 0;"><strong>State:</strong> ${stakeholder.location.state}</p>
                <p style="margin: 4px 0;"><strong>Type:</strong> ${stakeholder.type}</p>
                ${stakeholder.contact.person ? `<p style="margin: 4px 0;"><strong>Contact:</strong> ${stakeholder.contact.person}</p>` : ''}
                <button onclick="window.miningMap.showDetail(${JSON.stringify(stakeholder).replace(/"/g, '&quot;')})" 
                        style="margin-top: 8px; padding: 4px 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    View Details
                </button>
            </div>
        `;
    }
    
    setupInteractions() {
        console.log('Setting up map interactions...');
        
        // Zoom buttons (if they exist)
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const resetBtn = document.getElementById('reset-view');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.leafletMap.zoomIn();
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.leafletMap.zoomOut();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.leafletMap.setView([9.082, 8.675], 6);
            });
        }
    }
    
    showDetail(stakeholder) {
        console.log('Show detail for:', stakeholder);
        
        const modal = document.getElementById('detail-modal');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalBody) {
            console.warn('Modal elements not found');
            return;
        }
        
        // Get category color
        const categoryColor = categoryColors[stakeholder.category] || '#6b7280';
        
        modalBody.innerHTML = `
            <h2>${stakeholder.name}</h2>
            <span class="modal-category-badge" style="background: ${categoryColor};">
                ${stakeholder.category}
            </span>
            
            <div class="detail-grid">
                <!-- Basic Information -->
                <div class="detail-section">
                    <h3>📋 Basic Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${stakeholder.type}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Category:</span>
                        <span class="detail-value">${stakeholder.category}</span>
                    </div>
                    ${stakeholder.id ? `
                    <div class="detail-row">
                        <span class="detail-label">ID:</span>
                        <span class="detail-value">${stakeholder.id}</span>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Location Information -->
                <div class="detail-section">
                    <h3>📍 Location</h3>
                    <div class="detail-row">
                        <span class="detail-label">State:</span>
                        <span class="detail-value">${stakeholder.location.state}</span>
                    </div>
                    ${stakeholder.location.city ? `
                    <div class="detail-row">
                        <span class="detail-label">City:</span>
                        <span class="detail-value">${stakeholder.location.city}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.location.lga ? `
                    <div class="detail-row">
                        <span class="detail-label">LGA:</span>
                        <span class="detail-value">${stakeholder.location.lga}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.location.zone ? `
                    <div class="detail-row">
                        <span class="detail-label">Zone:</span>
                        <span class="detail-value">${stakeholder.location.zone}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.location.coordinates ? `
                    <div class="detail-row">
                        <span class="detail-label">Coordinates:</span>
                        <span class="detail-value">${stakeholder.location.coordinates[1].toFixed(4)}, ${stakeholder.location.coordinates[0].toFixed(4)}</span>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Contact Information -->
                ${stakeholder.contact && (stakeholder.contact.person || stakeholder.contact.email || stakeholder.contact.phone || stakeholder.contact.address) ? `
                <div class="detail-section">
                    <h3>📞 Contact Information</h3>
                    ${stakeholder.contact.person ? `
                    <div class="detail-row">
                        <span class="detail-label">Contact Person:</span>
                        <span class="detail-value">${stakeholder.contact.person}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.contact.position ? `
                    <div class="detail-row">
                        <span class="detail-label">Position:</span>
                        <span class="detail-value">${stakeholder.contact.position}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.contact.email ? `
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">
                            <a href="mailto:${stakeholder.contact.email}">${stakeholder.contact.email}</a>
                        </span>
                    </div>
                    ` : ''}
                    ${stakeholder.contact.phone ? `
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">
                            <a href="tel:${stakeholder.contact.phone}">${stakeholder.contact.phone}</a>
                        </span>
                    </div>
                    ` : ''}
                    ${stakeholder.contact.address ? `
                    <div class="detail-row">
                        <span class="detail-label">Address:</span>
                        <span class="detail-value">${stakeholder.contact.address}</span>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                <!-- Description / Mandate -->
                ${stakeholder.description ? `
                <div class="detail-section">
                    <h3>📝 Mandate / Description</h3>
                    <p>${stakeholder.description}</p>
                </div>
                ` : ''}
                
                <!-- Summary Functions -->
                ${stakeholder.summaryFunctions ? `
                <div class="detail-section">
                    <h3>⚙️ Functions</h3>
                    <p>${stakeholder.summaryFunctions}</p>
                </div>
                ` : ''}
                
                <!-- Value Chain Role -->
                ${stakeholder.valueChainRole ? `
                <div class="detail-section">
                    <h3>⛓️ Value Chain Role</h3>
                    <p>${stakeholder.valueChainRole}</p>
                </div>
                ` : ''}
                
                <!-- Jurisdiction -->
                ${stakeholder.jurisdiction ? `
                <div class="detail-section">
                    <h3>⚖️ Jurisdiction</h3>
                    <p>${stakeholder.jurisdiction}</p>
                </div>
                ` : ''}
                
                <!-- Operational Details -->
                ${stakeholder.thematicFocus || stakeholder.mineralFocus || stakeholder.mineralCommodities || stakeholder.equipment || stakeholder.scale || stakeholder.companySize || stakeholder.level || stakeholder.formalInformal ? `
                <div class="detail-section">
                    <h3>🏢 Operational Details</h3>
                    ${stakeholder.thematicFocus ? `
                    <div class="detail-row">
                        <span class="detail-label">Thematic Focus:</span>
                        <span class="detail-value">${stakeholder.thematicFocus}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.mineralFocus ? `
                    <div class="detail-row">
                        <span class="detail-label">Mineral Focus:</span>
                        <span class="detail-value">${stakeholder.mineralFocus}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.mineralCommodities ? `
                    <div class="detail-row">
                        <span class="detail-label">Mineral Commodities:</span>
                        <span class="detail-value">${stakeholder.mineralCommodities}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.equipment ? `
                    <div class="detail-row">
                        <span class="detail-label">Equipment/Services:</span>
                        <span class="detail-value">${stakeholder.equipment}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.scale ? `
                    <div class="detail-row">
                        <span class="detail-label">Scale:</span>
                        <span class="detail-value">${stakeholder.scale}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.companySize ? `
                    <div class="detail-row">
                        <span class="detail-label">Company Size:</span>
                        <span class="detail-value">${stakeholder.companySize}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.level ? `
                    <div class="detail-row">
                        <span class="detail-label">Level:</span>
                        <span class="detail-value">${stakeholder.level}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.formalInformal ? `
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${stakeholder.formalInformal}</span>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                <!-- Projects & Programmes -->
                ${stakeholder.currentProjects || stakeholder.keyProjects || stakeholder.programmes ? `
                <div class="detail-section">
                    <h3>🚀 Projects & Programmes</h3>
                    ${stakeholder.currentProjects ? `
                    <div class="detail-row">
                        <span class="detail-label">Current Projects:</span>
                        <span class="detail-value">${stakeholder.currentProjects}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.keyProjects ? `
                    <div class="detail-row">
                        <span class="detail-label">Key Projects:</span>
                        <span class="detail-value">${stakeholder.keyProjects}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.programmes ? `
                    <div class="detail-row">
                        <span class="detail-label">Programmes:</span>
                        <span class="detail-value">${stakeholder.programmes}</span>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                <!-- Influence Level -->
                ${stakeholder.influenceLevel ? `
                <div class="detail-section">
                    <h3>📊 Influence Level</h3>
                    <p>${stakeholder.influenceLevel}</p>
                </div>
                ` : ''}
                
                <!-- Additional Information -->
                ${stakeholder.website || stakeholder.acronym || stakeholder.relevantDepartments || stakeholder.officeAddress || stakeholder.notes ? `
                <div class="detail-section">
                    <h3>🌐 Additional Information</h3>
                    ${stakeholder.acronym ? `
                    <div class="detail-row">
                        <span class="detail-label">Acronym:</span>
                        <span class="detail-value">${stakeholder.acronym}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.website ? `
                    <div class="detail-row">
                        <span class="detail-label">Website:</span>
                        <span class="detail-value">
                            <a href="${stakeholder.website}" target="_blank" rel="noopener noreferrer">${stakeholder.website}</a>
                        </span>
                    </div>
                    ` : ''}
                    ${stakeholder.relevantDepartments ? `
                    <div class="detail-row">
                        <span class="detail-label">Relevant Departments:</span>
                        <span class="detail-value">${stakeholder.relevantDepartments}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.officeAddress ? `
                    <div class="detail-row">
                        <span class="detail-label">Office Address:</span>
                        <span class="detail-value">${stakeholder.officeAddress}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.notes ? `
                    <div class="detail-row">
                        <span class="detail-label">Notes:</span>
                        <span class="detail-value">${stakeholder.notes}</span>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
            
            <!-- Action Buttons -->
            <div class="detail-actions">
                <button class="btn-detail btn-detail-primary" onclick="window.miningMap.closeModal(); setTimeout(() => { window.miningMap.viewStakeholderOnMap('${stakeholder.id}'); }, 300);">
                    📍 View on Map
                </button>
                ${stakeholder.contact.email ? `
                <a href="mailto:${stakeholder.contact.email}" class="btn-detail btn-detail-secondary">
                    ✉️ Send Email
                </a>
                ` : ''}
                <button class="btn-detail btn-detail-secondary" onclick="window.miningMap.closeModal()">
                    ✕ Close
                </button>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Close modal handlers
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal();
        }
        
        modal.onclick = (event) => {
            if (event.target === modal) {
                this.closeModal();
            }
        };
        
        // Add escape key listener
        this.escapeKeyHandler = (event) => {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        };
        document.addEventListener('keydown', this.escapeKeyHandler);
    }
    
    closeModal() {
        const modal = document.getElementById('detail-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Remove escape key listener
        if (this.escapeKeyHandler) {
            document.removeEventListener('keydown', this.escapeKeyHandler);
            this.escapeKeyHandler = null;
        }
    }
    
    viewStakeholderOnMap(stakeholderId) {
        // Find the stakeholder
        const stakeholder = this.stakeholderData.find(s => s.id === stakeholderId);
        if (!stakeholder) {
            console.error('Stakeholder not found:', stakeholderId);
            return;
        }
        
        // Scroll to map
        const mapSection = document.getElementById('map-section');
        if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Pan to marker location and zoom in
        const lat = stakeholder.location.coordinates[1];
        const lng = stakeholder.location.coordinates[0];
        this.leafletMap.setView([lat, lng], 10, {
            animate: true,
            duration: 1.0
        });
        
        // Find and open the marker popup
        setTimeout(() => {
            this.markersLayer.eachLayer((layer) => {
                if (layer.feature && layer.feature.properties.id === stakeholderId) {
                    layer.openPopup();
                }
            });
        }, 500);
    }
    
    generateLegend() {
        const legendItems = document.getElementById('legend-items');
        
        if (!legendItems) {
            return;
        }
        
        legendItems.innerHTML = '';
        
        const categories = [...new Set(this.stakeholderData.map(d => d.category))];
        
        categories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.style.cursor = 'pointer';
            item.onclick = () => this.filterByCategory(category);
            
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = categoryColors[category] || '#6b7280';
            
            const label = document.createElement('span');
            label.textContent = category;
            label.style.fontSize = '12px';
            
            item.appendChild(colorBox);
            item.appendChild(label);
            legendItems.appendChild(item);
        });
    }
    
    updateStats(metadata, statistics) {
        if (metadata) {
            const statTotal = document.getElementById('stat-total');
            const statCategories = document.getElementById('stat-categories');
            const statStates = document.getElementById('stat-states');
            const countAll = document.getElementById('count-all');
            
            if (statTotal) statTotal.textContent = metadata.totalStakeholders || 0;
            if (statCategories) statCategories.textContent = metadata.categories || 0;
            if (statStates) statStates.textContent = metadata.states || 0;
            if (countAll) countAll.textContent = metadata.totalStakeholders || 0;
        }
        
        if (statistics && statistics.byCategory) {
            Object.entries(statistics.byCategory).forEach(([category, count]) => {
                const slug = category.toLowerCase().replace(/\s+/g, '-');
                const countElement = document.getElementById(`count-${slug}`);
                if (countElement) {
                    countElement.textContent = count;
                }
            });
        }
    }
    
    updateCategoryCounts() {
        console.log('Updating category counts...');
        
        // Count stakeholders by category
        const categoryCounts = {};
        
        this.stakeholderData.forEach(stakeholder => {
            const category = stakeholder.category;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        console.log('Category counts:', categoryCounts);
        
        // Update sidebar checkbox counts
        const sidebarMapping = {
            'Federal Government': 'check-count-federal',
            'State Agencies': 'check-count-state',
            'MMSD Offices': 'check-count-mmsd',
            'Mining Companies': 'check-count-mining',
            'Mining Consultancies': 'check-count-consultancies',
            'Artisanal Miners': 'check-count-artisanal',
            'Associations': 'check-count-associations',
            'State Companies': 'check-count-state-companies',
            'Infrastructure': 'check-count-infrastructure',
            'NGOs': 'check-count-ngos',
            'Civil Society': 'check-count-civil',
            'Donors': 'check-count-donors',
            'Universities': 'check-count-universities',
            'Training Institutes': 'check-count-training'
        };
        
        Object.entries(sidebarMapping).forEach(([category, elementId]) => {
            const countElement = document.getElementById(elementId);
            if (countElement) {
                const count = categoryCounts[category] || 0;
                countElement.textContent = count;
            }
        });
        
        // Update hero pill counts
        const heroPillMapping = {
            'Federal Government': 'count-federal',
            'State Agencies': 'count-state',
            'MMSD Offices': 'count-mmsd',
            'Mining Companies': 'count-mining',
            'Mining Consultancies': 'count-consultancies',
            'Artisanal Miners': 'count-artisanal',
            'Associations': 'count-associations',
            'State Companies': 'count-state-companies',
            'Infrastructure': 'count-infrastructure',
            'NGOs': 'count-ngos',
            'Civil Society': 'count-civil',
            'Donors': 'count-donors',
            'Universities': 'count-universities',
            'Training Institutes': 'count-training'
        };
        
        Object.entries(heroPillMapping).forEach(([category, elementId]) => {
            const countElement = document.getElementById(elementId);
            if (countElement) {
                const count = categoryCounts[category] || 0;
                countElement.textContent = count;
            }
        });
    }
    
    filterByCategory(category) {
        console.log('Filter by category:', category);
        
        if (category === 'all') {
            filteredStakeholders = allStakeholders;
        } else {
            filteredStakeholders = allStakeholders.filter(d => d.category === category);
        }
        
        this.renderStakeholders();
        
        const statShowing = document.getElementById('stat-showing');
        if (statShowing) {
            statShowing.textContent = filteredStakeholders.length;
        }
        
        // Update table if function exists
        if (window.updateTable) {
            window.updateTable(filteredStakeholders);
        }
    }
    
    // Public method to update markers (called by filters.js)
    updateMarkers() {
        console.log('Updating markers from filter...');
        this.renderStakeholders();
    }
    
    showError(message) {
        this.container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #dc2626;">
                <h3>Error Loading Map</h3>
                <p>${message}</p>
                <p style="margin-top: 20px;">
                    <a href="/nigeria/admin/process-mining-data.php" 
                       style="color: #2563eb; text-decoration: underline;">
                        Process Data Now
                    </a>
                </p>
            </div>
        `;
        
        const loadingElement = document.getElementById('map-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing hybrid map...');
    mapInstance = new MiningMap('#map-container');
    window.miningMap = mapInstance;
});
