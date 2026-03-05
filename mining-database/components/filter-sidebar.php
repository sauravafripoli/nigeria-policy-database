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
        <div class="custom-state-dropdown" id="state-dropdown">
            <div class="custom-state-trigger" id="state-trigger">
                <span id="state-display">All States (37)</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 8L2 4h8z"/>
                </svg>
            </div>
            <div class="custom-state-menu" id="state-menu">
                <div class="state-option" data-value="all">
                    <input type="checkbox" id="state-all" checked>
                    <label for="state-all">All States (37)</label>
                </div>
                <div class="state-group">
                    <div class="state-group-label">North Central</div>
                    <div class="state-option" data-value="FCT"><input type="checkbox" id="state-fct"><label for="state-fct">FCT Abuja</label></div>
                    <div class="state-option" data-value="Benue"><input type="checkbox" id="state-benue"><label for="state-benue">Benue</label></div>
                    <div class="state-option" data-value="Kogi"><input type="checkbox" id="state-kogi"><label for="state-kogi">Kogi</label></div>
                    <div class="state-option" data-value="Kwara"><input type="checkbox" id="state-kwara"><label for="state-kwara">Kwara</label></div>
                    <div class="state-option" data-value="Nasarawa"><input type="checkbox" id="state-nasarawa"><label for="state-nasarawa">Nasarawa</label></div>
                    <div class="state-option" data-value="Niger"><input type="checkbox" id="state-niger"><label for="state-niger">Niger</label></div>
                    <div class="state-option" data-value="Plateau"><input type="checkbox" id="state-plateau"><label for="state-plateau">Plateau</label></div>
                </div>
                <div class="state-group">
                    <div class="state-group-label">North East</div>
                    <div class="state-option" data-value="Adamawa"><input type="checkbox" id="state-adamawa"><label for="state-adamawa">Adamawa</label></div>
                    <div class="state-option" data-value="Bauchi"><input type="checkbox" id="state-bauchi"><label for="state-bauchi">Bauchi</label></div>
                    <div class="state-option" data-value="Borno"><input type="checkbox" id="state-borno"><label for="state-borno">Borno</label></div>
                    <div class="state-option" data-value="Gombe"><input type="checkbox" id="state-gombe"><label for="state-gombe">Gombe</label></div>
                    <div class="state-option" data-value="Taraba"><input type="checkbox" id="state-taraba"><label for="state-taraba">Taraba</label></div>
                    <div class="state-option" data-value="Yobe"><input type="checkbox" id="state-yobe"><label for="state-yobe">Yobe</label></div>
                </div>
                <div class="state-group">
                    <div class="state-group-label">North West</div>
                    <div class="state-option" data-value="Jigawa"><input type="checkbox" id="state-jigawa"><label for="state-jigawa">Jigawa</label></div>
                    <div class="state-option" data-value="Kaduna"><input type="checkbox" id="state-kaduna"><label for="state-kaduna">Kaduna</label></div>
                    <div class="state-option" data-value="Kano"><input type="checkbox" id="state-kano"><label for="state-kano">Kano</label></div>
                    <div class="state-option" data-value="Katsina"><input type="checkbox" id="state-katsina"><label for="state-katsina">Katsina</label></div>
                    <div class="state-option" data-value="Kebbi"><input type="checkbox" id="state-kebbi"><label for="state-kebbi">Kebbi</label></div>
                    <div class="state-option" data-value="Sokoto"><input type="checkbox" id="state-sokoto"><label for="state-sokoto">Sokoto</label></div>
                    <div class="state-option" data-value="Zamfara"><input type="checkbox" id="state-zamfara"><label for="state-zamfara">Zamfara</label></div>
                </div>
                <div class="state-group">
                    <div class="state-group-label">South East</div>
                    <div class="state-option" data-value="Abia"><input type="checkbox" id="state-abia"><label for="state-abia">Abia</label></div>
                    <div class="state-option" data-value="Anambra"><input type="checkbox" id="state-anambra"><label for="state-anambra">Anambra</label></div>
                    <div class="state-option" data-value="Ebonyi"><input type="checkbox" id="state-ebonyi"><label for="state-ebonyi">Ebonyi</label></div>
                    <div class="state-option" data-value="Enugu"><input type="checkbox" id="state-enugu"><label for="state-enugu">Enugu</label></div>
                    <div class="state-option" data-value="Imo"><input type="checkbox" id="state-imo"><label for="state-imo">Imo</label></div>
                </div>
                <div class="state-group">
                    <div class="state-group-label">South South</div>
                    <div class="state-option" data-value="Akwa Ibom"><input type="checkbox" id="state-akwa"><label for="state-akwa">Akwa Ibom</label></div>
                    <div class="state-option" data-value="Bayelsa"><input type="checkbox" id="state-bayelsa"><label for="state-bayelsa">Bayelsa</label></div>
                    <div class="state-option" data-value="Cross River"><input type="checkbox" id="state-cross"><label for="state-cross">Cross River</label></div>
                    <div class="state-option" data-value="Delta"><input type="checkbox" id="state-delta"><label for="state-delta">Delta</label></div>
                    <div class="state-option" data-value="Edo"><input type="checkbox" id="state-edo"><label for="state-edo">Edo</label></div>
                    <div class="state-option" data-value="Rivers"><input type="checkbox" id="state-rivers"><label for="state-rivers">Rivers</label></div>
                </div>
                <div class="state-group">
                    <div class="state-group-label">South West</div>
                    <div class="state-option" data-value="Ekiti"><input type="checkbox" id="state-ekiti"><label for="state-ekiti">Ekiti</label></div>
                    <div class="state-option" data-value="Lagos"><input type="checkbox" id="state-lagos"><label for="state-lagos">Lagos</label></div>
                    <div class="state-option" data-value="Ogun"><input type="checkbox" id="state-ogun"><label for="state-ogun">Ogun</label></div>
                    <div class="state-option" data-value="Ondo"><input type="checkbox" id="state-ondo"><label for="state-ondo">Ondo</label></div>
                    <div class="state-option" data-value="Osun"><input type="checkbox" id="state-osun"><label for="state-osun">Osun</label></div>
                    <div class="state-option" data-value="Oyo"><input type="checkbox" id="state-oyo"><label for="state-oyo">Oyo</label></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Category Filter -->
    <div class="filter-group">
        <label>Categories</label>
        <div class="category-filter-controls">
            <button type="button" class="btn-select-all" onclick="selectAllCategories()">Select All</button>
            <button type="button" class="btn-clear-all" onclick="clearAllCategories()">Clear All</button>
        </div>
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
