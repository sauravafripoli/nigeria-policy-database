/**
 * Mining Stakeholder Database - D3.js Map
 * Main map implementation with Nigeria boundaries and stakeholder markers
 */

// Global variables
let mapInstance = null;
let allStakeholders = [];
let filteredStakeholders = [];

// Color scale for categories
const categoryColors = {
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

/**
 * Main Mining Map Class
 */
class MiningMap {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = d3.select(containerId);
        this.width = 1000;
        this.height = 700;
        this.svg = null;
        this.projection = null;
        this.path = null;
        this.zoom = null;
        this.stakeholderData = [];
        
        this.init();
    }
    
    async init() {
        console.log('Initializing map...');
        
        // Create SVG
        this.setupSVG();
        
        // Load data first (needed for projection setup)
        await this.loadData();
        
        // Setup projection (after data is loaded)
        this.setupProjection();
        
        // Render map
        this.renderMap();
        
        // Setup interactions
        this.setupInteractions();
        
        // Hide loading indicator
        d3.select('#map-loading').style('display', 'none');
        
        console.log('Map initialized successfully!');
    }
    
    setupSVG() {
        // Get actual container dimensions
        const containerNode = document.querySelector(this.containerId);
        if (containerNode) {
            this.width = containerNode.clientWidth;
            this.height = containerNode.clientHeight;
        }
        
        this.svg = this.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .style('background', '#f8f9fa');
        
        // Create groups for layers
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');
        this.statesGroup = this.mapGroup.append('g').attr('class', 'states-group');
        this.markersGroup = this.mapGroup.append('g').attr('class', 'markers-group');
    }
    
    setupProjection() {
        // Standard Nigeria-specific Mercator projection for WGS84 coordinates
        this.projection = d3.geoMercator()
            .center([8.0, 9.5]) // Center of Nigeria
            .scale(3200)
            .translate([this.width / 2, this.height / 2]);
        
        this.path = d3.geoPath().projection(this.projection);
    }
    
    async loadData() {
        try {
            console.log('Loading data...');
            
            // Get data URL from container element
            const container = document.querySelector('#map-container');
            const dataUrl = container.dataset.jsonUrl;
            
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
            
            // Load Nigeria map (simplified GeoJSON)
            // For now, we'll create a simple placeholder
            // You can replace this with actual Nigeria GeoJSON
            this.nigeriaMap = await this.createNigeriaMapData();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError(error.message);
        }
    }
    
    async createNigeriaMapData() {
        // Try loading TopoJSON with world countries
        const container = document.querySelector('#map-container');
        const topojsonUrl = container.dataset.topojsonUrl;
        
        if (topojsonUrl && typeof topojson !== 'undefined') {
            try {
                console.log('Loading TopoJSON from:', topojsonUrl);
                const response = await fetch(topojsonUrl);
                const world = await response.json();
                
                // Find Nigeria in the TopoJSON (ISO code: NGA or 566)
                // Convert TopoJSON to GeoJSON and filter for Nigeria
                const countries = topojson.feature(world, world.objects.countries);
                const nigeria = {
                    type: 'FeatureCollection',
                    features: countries.features.filter(d => 
                        d.properties.name === 'Nigeria' || 
                        d.id === '566' || 
                        d.id === 566
                    )
                };
                
                if (nigeria.features.length > 0) {
                    console.log('Nigeria map loaded successfully');
                    return nigeria;
                }
            } catch (error) {
                console.warn('Failed to load TopoJSON:', error);
            }
        }
        
        // Try loading GeoJSON
        const geojsonUrl = container.dataset.geojsonUrl;
        if (geojsonUrl) {
            try {
                console.log('Loading GeoJSON from:', geojsonUrl);
                const response = await fetch(geojsonUrl);
                const geojson = await response.json();
                return geojson;
            } catch (error) {
                console.warn('Failed to load GeoJSON, falling back to centroids:', error);
            }
        }
        
        // Fallback: use centroids if GeoJSON not available
        const centroidsUrl = container.dataset.centroidsUrl;
        
        if (!centroidsUrl) {
            throw new Error('No map data source configured');
        }
        
        console.log('Fetching centroids from:', centroidsUrl);
        
        const centroidsResponse = await fetch(centroidsUrl);
        const centroidsData = await centroidsResponse.json();
        const centroids = centroidsData.centroids;
        
        const features = Object.entries(centroids).map(([name, data]) => ({
            type: 'Feature',
            properties: { name: name },
            geometry: {
                type: 'Point',
                coordinates: [data.lng, data.lat]
            }
        }));
        
        return {
            type: 'FeatureCollection',
            features: features
        };
    }
    
    renderMap() {
        const self = this;
        
        console.log('Rendering map with', this.nigeriaMap.features.length, 'features');
        
        // Create path generator for polygons
        const path = d3.geoPath().projection(this.projection);
        
        // Check if we have polygon or point data
        const hasPolygons = this.nigeriaMap.features.some(f => 
            f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
        );
        
        console.log('Has polygons:', hasPolygons);
        
        if (hasPolygons) {
            // Draw country/state boundaries as polygons
            const paths = this.statesGroup.selectAll('path.boundary')
                .data(this.nigeriaMap.features)
                .enter()
                .append('path')
                .attr('class', 'boundary')
                .attr('d', path)
                .attr('fill', '#f0f4ff')
                .attr('stroke', '#4f46e5')
                .attr('stroke-width', 2)
                .attr('opacity', 0.5)
                .on('mouseover', function(event, d) {
                    d3.select(this)
                        .attr('fill', '#e0e7ff')
                        .attr('opacity', 0.7);
                })
                .on('mouseout', function(event, d) {
                    d3.select(this)
                        .attr('fill', '#f0f4ff')
                        .attr('opacity', 0.5);
                });
            
            // Add country/state labels
            this.statesGroup.selectAll('text.boundary-label')
                .data(this.nigeriaMap.features)
                .enter()
                .append('text')
                .attr('class', 'boundary-label')
                .attr('transform', d => {
                    const centroid = path.centroid(d);
                    return `translate(${centroid[0]}, ${centroid[1]})`;
                })
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', '#4f46e5')
                .attr('opacity', 0.8)
                .style('pointer-events', 'none')
                .text(d => d.properties.name || 'Nigeria');
        } else {
            // Draw state boundaries as circles (fallback)
            this.statesGroup.selectAll('circle.state-marker')
                .data(this.nigeriaMap.features)
                .enter()
                .append('circle')
                .attr('class', 'state-marker')
                .attr('cx', d => this.projection(d.geometry.coordinates)[0])
                .attr('cy', d => this.projection(d.geometry.coordinates)[1])
                .attr('r', 15)
                .attr('fill', '#e0e7ff')
                .attr('stroke', '#cbd5e1')
                .attr('stroke-width', 1)
                .attr('opacity', 0.3);
            
            // Add state labels
            this.statesGroup.selectAll('text.state-label')
                .data(this.nigeriaMap.features)
                .enter()
                .append('text')
                .attr('class', 'state-label')
                .attr('x', d => this.projection(d.geometry.coordinates)[0])
                .attr('y', d => this.projection(d.geometry.coordinates)[1] + 25)
                .attr('text-anchor', 'middle')
                .attr('font-size', '9px')
                .attr('fill', '#64748b')
                .attr('opacity', 0.6)
                .text(d => d.properties.name);
        }
        
        // Render stakeholders
        this.renderStakeholders();
        
        // Generate legend
        this.generateLegend();
    }
    
    renderStakeholders() {
        const self = this;
        
        // Remove existing markers
        this.markersGroup.selectAll('circle.stakeholder').remove();
        
        // Filter data
        const data = filteredStakeholders.length > 0 ? filteredStakeholders : this.stakeholderData;
        
        console.log(`Rendering ${data.length} stakeholders`);
        
        // Draw stakeholder markers
        const markers = this.markersGroup.selectAll('circle.stakeholder')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'stakeholder')
            .attr('cx', d => {
                const coords = this.projection(d.location.coordinates);
                return coords ? coords[0] : 0;
            })
            .attr('cy', d => {
                const coords = this.projection(d.location.coordinates);
                return coords ? coords[1] : 0;
            })
            .attr('r', 0)
            .attr('fill', d => categoryColors[d.category] || '#6b7280')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('opacity', 0.85)
            .on('mouseover', function(event, d) {
                self.showTooltip(event, d);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 8)
                    .attr('stroke-width', 3);
            })
            .on('mouseout', function(event, d) {
                self.hideTooltip();
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 5)
                    .attr('stroke-width', 2);
            })
            .on('click', (event, d) => this.showDetail(d));
        
        // Animate entrance
        markers.transition()
            .duration(800)
            .delay((d, i) => i * 2)
            .attr('r', 5);
    }
    
    setupInteractions() {
        const self = this;
        
        // Zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                this.mapGroup.attr('transform', event.transform);
            });
        
        this.svg.call(this.zoom);
        
        // Zoom buttons
        d3.select('#zoom-in').on('click', () => {
            this.svg.transition().call(this.zoom.scaleBy, 1.5);
        });
        
        d3.select('#zoom-out').on('click', () => {
            this.svg.transition().call(this.zoom.scaleBy, 0.75);
        });
        
        d3.select('#reset-view').on('click', () => {
            this.svg.transition().call(this.zoom.transform, d3.zoomIdentity);
        });
    }
    
    showTooltip(event, d) {
        const tooltip = d3.select('#tooltip');
        
        tooltip
            .style('display', 'block')
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 15) + 'px')
            .html(`
                <h4>${d.name}</h4>
                <p><strong>Category:</strong> ${d.category}</p>
                <p><strong>State:</strong> ${d.location.state}</p>
                <p><strong>Type:</strong> ${d.type}</p>
                ${d.contact.person ? `<p><strong>Contact:</strong> ${d.contact.person}</p>` : ''}
            `);
    }
    
    hideTooltip() {
        d3.select('#tooltip').style('display', 'none');
    }
    
    showDetail(d) {
        console.log('Show detail for:', d);
        
        const modal = d3.select('#detail-modal');
        const modalBody = d3.select('#modal-body');
        
        modalBody.html(`
            <h2>${d.name}</h2>
            <div class="detail-grid">
                <div class="detail-section">
                    <h3>Basic Information</h3>
                    <p><strong>Category:</strong> ${d.category}</p>
                    <p><strong>Type:</strong> ${d.type}</p>
                    <p><strong>State:</strong> ${d.location.state}</p>
                    ${d.location.lga ? `<p><strong>LGA:</strong> ${d.location.lga}</p>` : ''}
                    ${d.location.zone ? `<p><strong>Zone:</strong> ${d.location.zone}</p>` : ''}
                </div>
                
                <div class="detail-section">
                    <h3>Contact Information</h3>
                    ${d.contact.person ? `<p><strong>Contact Person:</strong> ${d.contact.person}</p>` : ''}
                    ${d.contact.position ? `<p><strong>Position:</strong> ${d.contact.position}</p>` : ''}
                    ${d.contact.email ? `<p><strong>Email:</strong> <a href="mailto:${d.contact.email}">${d.contact.email}</a></p>` : ''}
                    ${d.contact.phone ? `<p><strong>Phone:</strong> ${d.contact.phone}</p>` : ''}
                    ${d.contact.address ? `<p><strong>Address:</strong> ${d.contact.address}</p>` : ''}
                </div>
                
                ${d.description ? `
                <div class="detail-section">
                    <h3>Description</h3>
                    <p>${d.description}</p>
                </div>
                ` : ''}
                
                ${d.website ? `
                <div class="detail-section">
                    <h3>Website</h3>
                    <p><a href="${d.website}" target="_blank">${d.website}</a></p>
                </div>
                ` : ''}
            </div>
        `);
        
        modal.style('display', 'flex');
        
        // Close modal
        d3.select('.modal-close').on('click', () => {
            modal.style('display', 'none');
        });
        
        modal.on('click', function(event) {
            if (event.target === this) {
                modal.style('display', 'none');
            }
        });
    }
    
    generateLegend() {
        const legendItems = d3.select('#legend-items');
        legendItems.html('');
        
        const categories = [...new Set(this.stakeholderData.map(d => d.category))];
        
        categories.forEach(category => {
            const item = legendItems.append('div')
                .attr('class', 'legend-item')
                .style('cursor', 'pointer')
                .on('click', () => this.filterByCategory(category));
            
            item.append('div')
                .attr('class', 'legend-color')
                .style('background-color', categoryColors[category] || '#6b7280');
            
            item.append('span')
                .text(category)
                .style('font-size', '12px');
        });
    }
    
    updateStats(metadata, statistics) {
        if (metadata) {
            d3.select('#stat-total').text(metadata.totalStakeholders || 0);
            d3.select('#stat-categories').text(metadata.categories || 0);
            d3.select('#stat-states').text(metadata.states || 0);
            d3.select('#count-all').text(metadata.totalStakeholders || 0);
        }
        
        if (statistics && statistics.byCategory) {
            Object.entries(statistics.byCategory).forEach(([category, count]) => {
                const slug = category.toLowerCase().replace(/\s+/g, '-');
                d3.select(`#count-${slug}`).text(count);
            });
        }
    }
    
    filterByCategory(category) {
        console.log('Filter by category:', category);
        
        if (category === 'all') {
            filteredStakeholders = allStakeholders;
        } else {
            filteredStakeholders = allStakeholders.filter(d => d.category === category);
        }
        
        this.renderStakeholders();
        d3.select('#stat-showing').text(filteredStakeholders.length);
        
        // Update table
        if (window.updateTable) {
            window.updateTable(filteredStakeholders);
        }
    }
    
    showError(message) {
        const container = d3.select(this.containerId);
        container.html(`
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
        `);
        
        d3.select('#map-loading').style('display', 'none');
    }
}

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing map...');
    mapInstance = new MiningMap('#map-container');
    window.miningMap = mapInstance;
});
