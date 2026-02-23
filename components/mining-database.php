<?php
/**
 * Mining Stakeholder Database Component
 * Main component for displaying the interactive stakeholder database
 */

if(!defined('IN_GS')){ die('you cannot load this page directly.'); }

// Check if data has been processed
$dataPath = GSTHEMESPATH . 'nigeria/mining-database/data/processed/all_stakeholders.json';
$dataExists = file_exists($dataPath);

// Load metadata if data exists
$metadata = null;
$statistics = null;
if ($dataExists) {
    $jsonData = file_get_contents($dataPath);
    $data = json_decode($jsonData, true);
    $metadata = $data['metadata'] ?? null;
    $statistics = $data['statistics'] ?? null;
}
?>

<!-- Mining Stakeholder Database CSS -->
<link rel="stylesheet" href="<?php get_theme_url(); ?>/mining-database/assets/css/mining-db.css">

<!-- Hero Section -->
<section class="hero">
    <div class="container">
        <h1>Nigeria Mining Stakeholder Database</h1>
        <p>Comprehensive directory of stakeholders in Nigeria's mining sector</p>
        
        <?php if (!$dataExists): ?>
        <div class="alert alert-warning">
            <strong>⚠ Data Not Processed Yet</strong>
            <p>Please run the data conversion script to generate the database.</p>
            <p><code>python3 data/convert_to_json.py</code></p>
        </div>
        <?php endif; ?>
        
        <!-- Category Pills -->
        <div class="category-pills" id="category-pills">
            <button class="pill active" data-category="all">
                All Stakeholders <span class="count" id="count-all"><?php echo $metadata ? $metadata['totalStakeholders'] : 0; ?></span>
            </button>
            <?php if ($statistics && isset($statistics['byCategory'])): ?>
                <?php foreach ($statistics['byCategory'] as $category => $count): 
                    $slug = strtolower(str_replace(' ', '-', $category));
                ?>
                <button class="pill" data-category="<?php echo $slug; ?>">
                    <?php echo $category; ?> <span class="count"><?php echo $count; ?></span>
                </button>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</section>

<!-- Main Content -->
<section class="main-content">
    <div class="container">
        <div class="grid">
            
            <!-- Filter Sidebar -->
            <aside class="filter-sidebar">
                <?php include(GSTHEMESPATH . 'nigeria/mining-database/components/filter-sidebar.php'); ?>
            </aside>
            
            <!-- Main Content Column -->
            <div class="main-column">
                <!-- Map Container -->
                <div class="map-wrapper">
                    <div id="map-container" 
                         data-json-url="<?php echo get_theme_url(); ?>/mining-database/data/processed/all_stakeholders.json"
                         data-centroids-url="<?php echo get_theme_url(); ?>/data/nigeria-centroids.json"
                         data-geojson-url="<?php echo get_theme_url(); ?>/data/nigeria-states.geojson"></div>
                    
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
                    <?php if ($dataExists): ?>
                    <div id="map-loading" class="map-loading">
                        <div class="spinner"></div>
                        <p>Loading map data...</p>
                    </div>
                    <?php endif; ?>
                </div>
                
                <!-- Data Table Below Map -->
                <div class="table-wrapper">
                    <h2>Stakeholder Directory</h2>
                    <div id="data-table-container">
                        <?php include(GSTHEMESPATH . 'nigeria/mining-database/components/data-table.php'); ?>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
</section>

<!-- Remove the separate data-section -->

<!-- Tooltip (hidden by default) -->
<div id="tooltip" style="display: none;"></div>

<!-- Detail Modal -->
<div id="detail-modal" class="modal" style="display: none;">
    <div class="modal-content">
        <span class="modal-close">&times;</span>
        <div id="modal-body"></div>
    </div>
</div>

<!-- Mining Database JavaScript -->
<script src="<?php get_theme_url(); ?>/mining-database/assets/js/map-main.js"></script>
<script src="<?php get_theme_url(); ?>/mining-database/assets/js/filters.js"></script>
<script src="<?php get_theme_url(); ?>/mining-database/assets/js/table.js"></script>
