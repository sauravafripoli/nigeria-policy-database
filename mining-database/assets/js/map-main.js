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
        
        // Create marker cluster group
        this.markersLayer = L.markerClusterGroup({
            maxClusterRadius: 60,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            disableClusteringAtZoom: 14,  // Keep clustering longer to avoid overlap
            spiderfyDistanceMultiplier: 1.2,  // Spread pins out more naturally
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                let size = 'small';
                let className = 'marker-cluster-small';
                
                if (count > 50) {
                    size = 'large';
                    className = 'marker-cluster-large';
                } else if (count > 20) {
                    size = 'medium';
                    className = 'marker-cluster-medium';
                }
                
                return L.divIcon({
                    html: `<div><span>${count}</span></div>`,
                    className: `marker-cluster ${className}`,
                    iconSize: L.point(32, 32)
                });
            }
        }).addTo(this.leafletMap);
        
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
            
            // Load policy database links
            await this.loadPolicyLinks();
            
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }
    
    async loadPolicyLinks() {
        try {
            console.log('Loading policy database links...');
            
            // Try to load policy-stakeholder mapping
            const policyLinksUrl = '/nigeria/theme/nigeria/policy-database/data/processed/policy_to_stakeholder_database.json';
            const response = await fetch(policyLinksUrl);
            
            if (!response.ok) {
                console.log('Policy links not available yet');
                this.policyLinks = {};
                return;
            }
            
            const data = await response.json();
            // Extract the stakeholderPolicies mapping
            this.policyLinks = data.stakeholderPolicies || {};
            const totalLinks = Object.keys(this.policyLinks).length;
            console.log(`Loaded policy links for ${totalLinks} stakeholders`);
            
        } catch (error) {
            console.log('Could not load policy links:', error.message);
            this.policyLinks = {};
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
            
            let [lng, lat] = stakeholder.location.coordinates;
            
            // If coordinates are 0 or missing, use center of Nigeria with small random offset
            if (!lat || !lng || (lat === 0 && lng === 0)) {
                // Center of Nigeria with random offset (±0.5 degrees ~ 55km radius)
                const offsetLat = (Math.random() - 0.5) * 1.0;  // Random offset ±0.5 degrees
                const offsetLng = (Math.random() - 0.5) * 1.0;
                lat = 9.0820 + offsetLat;   // Center of Nigeria latitude
                lng = 8.6753 + offsetLng;   // Center of Nigeria longitude
            }
            
            // Create custom pin marker icon
            const markerColor = categoryColors[stakeholder.category] || '#6b7280';
            const customIcon = L.divIcon({
                className: 'custom-marker-icon',
                html: `<div class="marker-pin" style="background-color: ${markerColor};">
                          <div class="marker-pin-dot"></div>
                       </div>`,
                iconSize: [16, 22],
                iconAnchor: [8, 22],
                popupAnchor: [0, -22]
            });
            
            const marker = L.marker([lat, lng], {
                icon: customIcon
            });
            
            // Store stakeholder ID on marker for easy identification
            marker.stakeholderId = stakeholder.id;
            
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
                ${stakeholder.description || stakeholder.mandate ? `
                <div class="detail-section">
                    <h3>📝 Mandate / Description</h3>
                    <p>${stakeholder.description || stakeholder.mandate}</p>
                </div>
                ` : ''}
                
                <!-- Functions -->
                ${stakeholder.summaryFunctions || stakeholder.functions ? `
                <div class="detail-section">
                    <h3>⚙️ Functions</h3>
                    <p>${stakeholder.summaryFunctions || stakeholder.functions}</p>
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
                ${stakeholder.thematicFocus || stakeholder.mineralFocus || stakeholder.mineralCommodities || stakeholder.equipment || stakeholder.scale || stakeholder.companySize || stakeholder.levelScope || stakeholder.formalInformal ? `
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
                    ${stakeholder.levelScope ? `
                    <div class="detail-row">
                        <span class="detail-label">Level/Scope:</span>
                        <span class="detail-value">${stakeholder.levelScope}</span>
                    </div>
                    ` : ''}
                    ${stakeholder.companySize ? `
                    <div class="detail-row">
                        <span class="detail-label">Company Size:</span>
                        <span class="detail-value">${stakeholder.companySize}</span>
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
            
            <!-- Related Policies Section -->
            ${this.renderRelatedPolicies(stakeholder)}
            
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
    
    renderRelatedPolicies(stakeholder) {
        // Check if stakeholder has related policies
        if (!stakeholder.relatedPolicies || stakeholder.relatedPolicies.length === 0) {
            return '';
        }
        
        const policies = stakeholder.relatedPolicies;
        const count = policies.length;
        
        let html = `
            <div class="detail-section related-policies-section">
                <h3>📄 Related Policies (${count})</h3>
                <div class="policy-profiles-grid">
        `;
        
        policies.forEach(policy => {
            html += `
                <div class="policy-profile-card">
                    <a href="/nigeria/index.php?id=policies&policy=${encodeURIComponent(policy.policyName)}" 
                       class="policy-profile-name">
                        ${policy.policyName}
                    </a>
                    <div class="policy-profile-meta">
                        ${policy.policyType ? `<span class="policy-meta-badge">${policy.policyType}</span>` : ''}
                        ${policy.yearIntroduced ? `<span class="policy-meta-badge">${policy.yearIntroduced}</span>` : ''}
                        ${policy.status ? `<span class="policy-meta-badge">${policy.status}</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="view-all-link">
                    <a href="/nigeria/index.php?id=policies">
                        🔗 View All Policies →
                    </a>
                </div>
            </div>
        `;
        
        return html;
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
    
    highlightStakeholder(stakeholderId) {
        console.log('Highlighting stakeholder:', stakeholderId);
        
        // Find the stakeholder in our data
        const stakeholder = this.stakeholderData.find(s => s.id === stakeholderId);
        
        if (!stakeholder) {
            console.warn('Stakeholder not found:', stakeholderId);
            return;
        }
        
        // Show the detail modal
        this.showDetail(stakeholder);
        
        // Also try to focus the marker on the map if it exists
        if (this.markers[stakeholderId]) {
            const marker = this.markers[stakeholderId];
            
            // Get marker position
            const latLng = marker.getLatLng();
            
            // Pan to marker with zoom
            this.leafletMap.setView(latLng, 10, {
                animate: true,
                duration: 1
            });
            
            // Open popup after a short delay
            setTimeout(() => {
                marker.openPopup();
            }, 500);
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
        
        // Get coordinates
        let lat = stakeholder.location.coordinates[1];
        let lng = stakeholder.location.coordinates[0];
        
        // If coordinates are 0 or missing, use center of Nigeria
        if (!lat || !lng || (lat === 0 && lng === 0)) {
            lat = 9.0820;
            lng = 8.6753;
        }
        
        // Zoom to level 16 to break clusters
        this.leafletMap.setView([lat, lng], 16, {
            animate: true,
            duration: 1.0
        });
        
        // Find and open the marker popup by stakeholder ID
        setTimeout(() => {
            let found = false;
            
            this.markersLayer.eachLayer((layer) => {
                // Check if this marker has the matching stakeholder ID
                if (layer.stakeholderId && layer.stakeholderId === stakeholderId) {
                    // Re-center on exact marker location (in case it was spiderfied)
                    this.leafletMap.setView(layer.getLatLng(), 16, {
                        animate: false
                    });
                    
                    // Open the popup
                    setTimeout(() => {
                        layer.openPopup();
                    }, 100);
                    
                    found = true;
                    return;
                }
            });
            
            if (!found) {
                console.log('Marker not found for stakeholder ID:', stakeholderId);
            }
        }, 1000);
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
        
        // Get category slug for syncing with pills
        const categorySlugMap = {
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
        
        // Single select behavior - uncheck all, then check only this one
        const categoryCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"][data-category]');
        const targetCheckbox = Array.from(categoryCheckboxes).find(cb => cb.value === category);
        
        if (targetCheckbox) {
            // Check if this category is already the only one selected
            const isOnlySelected = targetCheckbox.checked && 
                Array.from(categoryCheckboxes).filter(cb => cb.checked).length === 1;
            
            if (isOnlySelected) {
                // If clicking the only selected category, select all
                categoryCheckboxes.forEach(cb => cb.checked = true);
                
                // Activate all pills
                const allPills = document.querySelectorAll('.category-pills .pill');
                allPills.forEach(p => p.classList.add('active'));
            } else {
                // Uncheck all others, check only this one
                categoryCheckboxes.forEach(cb => cb.checked = (cb === targetCheckbox));
                
                // Update pills - deactivate all, activate only this one
                const allPills = document.querySelectorAll('.category-pills .pill');
                allPills.forEach(p => p.classList.remove('active'));
                
                const categorySlug = categorySlugMap[category];
                if (categorySlug) {
                    const pill = document.querySelector(`.category-pills .pill[data-category="${categorySlug}"]`);
                    if (pill) {
                        pill.classList.add('active');
                    }
                }
            }
            
            // Update filters and apply
            if (window.updateCategoryFilters) {
                window.updateCategoryFilters();
            }
            if (window.applyFilters) {
                window.applyFilters();
            }
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
    
    // Check for URL parameter to highlight a specific stakeholder
    const urlParams = new URLSearchParams(window.location.search);
    const highlightId = urlParams.get('highlight');
    
    if (highlightId) {
        console.log('Highlight parameter detected:', highlightId);
        // Wait for map to fully initialize before highlighting
        setTimeout(() => {
            mapInstance.highlightStakeholder(highlightId);
        }, 1000);
    }
});
