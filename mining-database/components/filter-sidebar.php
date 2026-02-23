<div class="filter-panel">
    
    <!-- Search -->
    <div class="filter-group">
        <label for="search-input">
            <svg width="16" height="16" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 5px;">
                <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
                <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
            Search Stakeholders
        </label>
        <input type="text" 
               id="search-input" 
               placeholder="Type name, location..."
               class="search-box">
        <small class="help-text">Search by name, state, or category</small>
    </div>
    
    <!-- State Filter -->
    <div class="filter-group">
        <label for="state-filter">Filter by State</label>
        <select id="state-filter" class="filter-select">
            <option value="all">All States (37)</option>
            <optgroup label="North Central">
                <option value="FCT">FCT Abuja</option>
                <option value="Benue">Benue</option>
                <option value="Kogi">Kogi</option>
                <option value="Kwara">Kwara</option>
                <option value="Nasarawa">Nasarawa</option>
                <option value="Niger">Niger</option>
                <option value="Plateau">Plateau</option>
            </optgroup>
            <optgroup label="North East">
                <option value="Adamawa">Adamawa</option>
                <option value="Bauchi">Bauchi</option>
                <option value="Borno">Borno</option>
                <option value="Gombe">Gombe</option>
                <option value="Taraba">Taraba</option>
                <option value="Yobe">Yobe</option>
            </optgroup>
            <optgroup label="North West">
                <option value="Jigawa">Jigawa</option>
                <option value="Kaduna">Kaduna</option>
                <option value="Kano">Kano</option>
                <option value="Katsina">Katsina</option>
                <option value="Kebbi">Kebbi</option>
                <option value="Sokoto">Sokoto</option>
                <option value="Zamfara">Zamfara</option>
            </optgroup>
            <optgroup label="South East">
                <option value="Abia">Abia</option>
                <option value="Anambra">Anambra</option>
                <option value="Ebonyi">Ebonyi</option>
                <option value="Enugu">Enugu</option>
                <option value="Imo">Imo</option>
            </optgroup>
            <optgroup label="South South">
                <option value="Akwa Ibom">Akwa Ibom</option>
                <option value="Bayelsa">Bayelsa</option>
                <option value="Cross River">Cross River</option>
                <option value="Delta">Delta</option>
                <option value="Edo">Edo</option>
                <option value="Rivers">Rivers</option>
            </optgroup>
            <optgroup label="South West">
                <option value="Ekiti">Ekiti</option>
                <option value="Lagos">Lagos</option>
                <option value="Ogun">Ogun</option>
                <option value="Ondo">Ondo</option>
                <option value="Osun">Osun</option>
                <option value="Oyo">Oyo</option>
            </optgroup>
        </select>
    </div>
    
    <!-- Category Filter -->
    <div class="filter-group">
        <label>Categories</label>
        <div class="checkbox-group" id="category-checkboxes">
            <label>
                <input type="checkbox" value="Federal Government" checked data-category="federal-government">
                <span class="checkbox-label">Federal Government</span>
                <span class="count" id="check-count-federal">0</span>
            </label>
            <label>
                <input type="checkbox" value="State Agencies" checked data-category="state-agencies">
                <span class="checkbox-label">State Agencies</span>
                <span class="count" id="check-count-state">0</span>
            </label>
            <label>
                <input type="checkbox" value="MMSD Offices" checked data-category="mmsd-offices">
                <span class="checkbox-label">MMSD Offices</span>
                <span class="count" id="check-count-mmsd">0</span>
            </label>
            <label>
                <input type="checkbox" value="Mining Companies" checked data-category="mining-companies">
                <span class="checkbox-label">Mining Companies</span>
                <span class="count" id="check-count-mining">0</span>
            </label>
            <label>
                <input type="checkbox" value="Mining Consultancies" checked data-category="mining-consultancies">
                <span class="checkbox-label">Consultancies</span>
                <span class="count" id="check-count-consultancies">0</span>
            </label>
            <label>
                <input type="checkbox" value="Artisanal Miners" checked data-category="artisanal-miners">
                <span class="checkbox-label">Artisanal Miners</span>
                <span class="count" id="check-count-artisanal">0</span>
            </label>
            <label>
                <input type="checkbox" value="Associations" checked data-category="associations">
                <span class="checkbox-label">Associations</span>
                <span class="count" id="check-count-associations">0</span>
            </label>
            <label>
                <input type="checkbox" value="State Companies" checked data-category="state-companies">
                <span class="checkbox-label">State Companies</span>
                <span class="count" id="check-count-state-companies">0</span>
            </label>
            <label>
                <input type="checkbox" value="Infrastructure" checked data-category="infrastructure">
                <span class="checkbox-label">Infrastructure</span>
                <span class="count" id="check-count-infrastructure">0</span>
            </label>
            <label>
                <input type="checkbox" value="NGOs" checked data-category="ngos">
                <span class="checkbox-label">NGOs</span>
                <span class="count" id="check-count-ngos">0</span>
            </label>
            <label>
                <input type="checkbox" value="Civil Society" checked data-category="civil-society">
                <span class="checkbox-label">Civil Society</span>
                <span class="count" id="check-count-civil">0</span>
            </label>
            <label>
                <input type="checkbox" value="Donors" checked data-category="donors">
                <span class="checkbox-label">Donors</span>
                <span class="count" id="check-count-donors">0</span>
            </label>
            <label>
                <input type="checkbox" value="Universities" checked data-category="universities">
                <span class="checkbox-label">Universities</span>
                <span class="count" id="check-count-universities">0</span>
            </label>
            <label>
                <input type="checkbox" value="Training Institutes" checked data-category="training-institutes">
                <span class="checkbox-label">Training Institutes</span>
                <span class="count" id="check-count-training">0</span>
            </label>
        </div>
    </div>
    
    <!-- Zone Filter -->
    <div class="filter-group">
        <label>Geopolitical Zone</label>
        <div class="checkbox-group">
            <label>
                <input type="checkbox" value="North Central" checked>
                <span class="checkbox-label">North Central</span>
            </label>
            <label>
                <input type="checkbox" value="North East" checked>
                <span class="checkbox-label">North East</span>
            </label>
            <label>
                <input type="checkbox" value="North West" checked>
                <span class="checkbox-label">North West</span>
            </label>
            <label>
                <input type="checkbox" value="South East" checked>
                <span class="checkbox-label">South East</span>
            </label>
            <label>
                <input type="checkbox" value="South South" checked>
                <span class="checkbox-label">South South</span>
            </label>
            <label>
                <input type="checkbox" value="South West" checked>
                <span class="checkbox-label">South West</span>
            </label>
        </div>
    </div>
    
    <!-- Stats Box -->
    <div class="stats-box">
        <h4>Database Stats</h4>
        <div class="stat-item">
            <span class="stat-label">Total Stakeholders</span>
            <span class="stat-value" id="stat-total">0</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Categories</span>
            <span class="stat-value" id="stat-categories">0</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">States Covered</span>
            <span class="stat-value" id="stat-states">0</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Showing</span>
            <span class="stat-value" id="stat-showing">0</span>
        </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="filter-actions">
        <button class="btn-secondary" id="reset-filters">Reset Filters</button>
        <button class="btn-export" id="export-data">
            <svg width="14" height="14" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 5px;">
                <path d="M7 1v10M3 7l4 4 4-4M1 13h12" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            Export CSV
        </button>
    </div>
    
</div>

<style>
.help-text {
    display: block;
    font-size: 11px;
    color: #6b7280;
    margin-top: 4px;
}
</style>
