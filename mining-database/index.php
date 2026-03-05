<?php
/**
 * Mining Stakeholder Database - Main Page
 * Interactive map and directory of mining sector stakeholders in Nigeria
 */

// GetSimple CMS integration
if (!defined('IN_GS')) {
    define('IN_GS', TRUE);
}

// Load GetSimple configuration if available
$gsConfigPath = '../../../gsconfig.php';
if (file_exists($gsConfigPath)) {
    include($gsConfigPath);
}

// Set theme path
$themePath = '/nigeria/theme/nigeria/mining-database/';
$dataPath = $themePath . 'data/processed/all_stakeholders.json';

// Check if data exists
$dataExists = file_exists(__DIR__ . '/data/processed/all_stakeholders.json');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nigeria Mining Stakeholder Database</title>
    
    <!-- Styles -->
    <link rel="stylesheet" href="assets/css/mining-db.css">
    
    <!-- D3.js -->
    <script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
    
    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h1>Nigeria Mining Stakeholder Database</h1>
            <p>Comprehensive directory of stakeholders in Nigeria's mining sector</p>
            
            <?php if (!$dataExists): ?>
            <div class="alert alert-warning">
                <strong>⚠ Data Not Processed Yet</strong>
                <p>Please run the data processor first: <a href="/nigeria/admin/process-mining-data.php" style="color: white; text-decoration: underline;">Process Data</a></p>
            </div>
            <?php endif; ?>
            
            <!-- Category Pills -->
            <div class="category-pills" id="category-pills">
                <button class="pill active" data-category="all">
                    All Stakeholders <span class="count" id="count-all">0</span>
                </button>
                <button class="pill" data-category="federal-government">
                    Federal Government <span class="count" id="count-federal">0</span>
                </button>
                <button class="pill" data-category="state-agencies">
                    State Agencies <span class="count" id="count-state">0</span>
                </button>
                <button class="pill" data-category="mmsd-offices">
                    MMSD Offices <span class="count" id="count-mmsd">0</span>
                </button>
                <button class="pill" data-category="mining-companies">
                    Mining Companies <span class="count" id="count-mining">0</span>
                </button>
                <button class="pill" data-category="mining-consultancies">
                    Mining Consultancies <span class="count" id="count-consultancies">0</span>
                </button>
                <button class="pill" data-category="artisanal-miners">
                    Artisanal Miners <span class="count" id="count-artisanal">0</span>
                </button>
                <button class="pill" data-category="associations">
                    Associations <span class="count" id="count-associations">0</span>
                </button>
                <button class="pill" data-category="state-companies">
                    State Companies <span class="count" id="count-state-companies">0</span>
                </button>
                <button class="pill" data-category="infrastructure">
                    Infrastructure <span class="count" id="count-infrastructure">0</span>
                </button>
                <button class="pill" data-category="ngos">
                    NGOs <span class="count" id="count-ngos">0</span>
                </button>
                <button class="pill" data-category="civil-society">
                    Civil Society <span class="count" id="count-civil">0</span>
                </button>
                <button class="pill" data-category="donors">
                    Donors <span class="count" id="count-donors">0</span>
                </button>
                <button class="pill" data-category="training-institutes">
                    Training Institutes <span class="count" id="count-training">0</span>
                </button>
                <button class="pill" data-category="universities">
                    Universities <span class="count" id="count-universities">0</span>
                </button>
            </div>
        </div>
    </section>
    
    <!-- Main Content -->
    <section class="main-content">
        <div class="container">
            <div class="grid">
                
                <!-- Filter Sidebar -->
                <aside class="filter-sidebar">
                    <?php include('components/filter-sidebar.php'); ?>
                </aside>
                
                <!-- Map Container -->
                <div class="map-wrapper">
                    <div id="map-container"></div>
                    
                    <!-- Map Controls -->
                    <div class="map-controls">
                        <button id="zoom-in" title="Zoom In">+</button>
                        <button id="zoom-out" title="Zoom Out">−</button>
                        <button id="reset-view" title="Reset View">⟲</button>
                    </div>
                    
                    <!-- Legend -->
                    <div class="map-legend" id="map-legend">
                        <h4>Legend</h4>
                        <div id="legend-items"></div>
                    </div>
                    
                    <!-- Loading indicator -->
                    <div id="map-loading" class="map-loading">
                        <div class="spinner"></div>
                        <p>Loading map data...</p>
                    </div>
                </div>
                
            </div>
        </div>
    </section>
    
    <!-- Data Table Section -->
    <section class="data-section">
        <div class="container">
            <h2>Stakeholder Directory</h2>
            <div id="data-table-container">
                <?php include('components/data-table.php'); ?>
            </div>
        </div>
    </section>
    
    <!-- Tooltip (hidden by default) -->
    <div id="tooltip" style="display: none;"></div>
    
    <!-- Detail Modal -->
    <div id="detail-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <div id="modal-body"></div>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="assets/js/map-main.js"></script>
    <script src="assets/js/filters.js"></script>
    <script src="assets/js/table.js"></script>
    
</body>
</html>
