<?php
/**
 * Policy Database - Main Page
 * Interactive directory of mining policies and regulations in Nigeria
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

// Set paths
$themePath = '/nigeria/theme/nigeria/policy-database/';
$dataPath = __DIR__ . '/data/processed/all_policies.json';

// Check if data exists
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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nigeria Mining Policy Database</title>
    
    <!-- Styles -->
    <link rel="stylesheet" href="assets/css/policy-db.css">
</head>
<body>
    
    <!-- Hero Section -->
    <section class="policy-hero">
        <div class="container">
            <h1>Nigeria Mining Policy Database</h1>
            <p>Comprehensive collection of mining policies, regulations, and governance frameworks</p>
        </div>
    </section>
    
    <?php if (!$dataExists): ?>
    <!-- Data Not Processed Warning -->
    <div class="container">
        <div class="alert alert-warning" style="margin-top: 30px;">
            <strong>⚠ Data Not Processed Yet</strong>
            <p>Please run the policy data processor first: <a href="/nigeria/admin/process-policy-data.php" style="color: #d97706; text-decoration: underline;">Process Policy Data</a></p>
        </div>
    </div>
    <?php else: ?>
    
    <!-- Statistics Bar -->
    <section class="stats-bar">
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-number" id="total-policies">
                    <?php echo $metadata['totalPolicies'] ?? 0; ?>
                </span>
                <span class="stat-label">Total Policies</span>
            </div>
            <div class="stat-item">
                <span class="stat-number" id="total-families">
                    <?php echo $metadata['policyFamilies'] ?? 0; ?>
                </span>
                <span class="stat-label">Policy Families</span>
            </div>
            <div class="stat-item">
                <span class="stat-number" id="linked-policies">
                    <?php echo $statistics['linkedPolicies'] ?? 0; ?>
                </span>
                <span class="stat-label">Linked to Stakeholders</span>
            </div>
            <div class="stat-item">
                <span class="stat-number" id="high-priority">
                    <?php echo $statistics['byReformPriority']['High'] ?? 0; ?>
                </span>
                <span class="stat-label">High Priority Reforms</span>
            </div>
        </div>
    </section>
    
    <div class="container">
        
        <!-- Search & Filters -->
        <section class="search-filter-section">
            <div class="search-box">
                <input 
                    type="text" 
                    id="search-input" 
                    class="search-input" 
                    placeholder="Search policies by name, summary, stakeholders..."
                >
                <button class="btn-search" onclick="applyFilters()">🔍 Search</button>
            </div>
            
            <div class="filters-grid">
                <div class="filter-group">
                    <label for="filter-family">Policy Family</label>
                    <select id="filter-family" class="filter-select">
                        <option value="all">All Families</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="filter-type">Policy Type</label>
                    <select id="filter-type" class="filter-select">
                        <option value="all">All Types</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="filter-status">Status</label>
                    <select id="filter-status" class="filter-select">
                        <option value="all">All Statuses</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="filter-jurisdiction">Jurisdiction</label>
                    <select id="filter-jurisdiction" class="filter-select">
                        <option value="all">All Jurisdictions</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="filter-valuechain">Value Chain</label>
                    <select id="filter-valuechain" class="filter-select">
                        <option value="all">All Stages</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="filter-priority">Reform Priority</label>
                    <select id="filter-priority" class="filter-select">
                        <option value="all">All Priorities</option>
                    </select>
                </div>
            </div>
            
            <div class="filter-actions">
                <button id="btn-reset" class="btn-reset">🔄 Reset Filters</button>
                <button id="btn-export" class="btn-export">📥 Export to CSV</button>
            </div>
        </section>
        
        <!-- Policies Display -->
        <section class="policies-container">
            <div class="policies-header">
                <div>
                    <h2>Policies</h2>
                    <p id="results-count" style="color: #6b7280; margin-top: 5px;">Loading...</p>
                </div>
                <div class="view-toggle">
                    <button id="view-table" class="view-btn active">📋 Table</button>
                    <button id="view-cards" class="view-btn">🗂️ Cards</button>
                </div>
            </div>
            
            <div id="policies-display">
                <div class="loading">Loading policies</div>
            </div>
            
            <div id="pagination" class="pagination"></div>
        </section>
        
    </div>
    
    <?php endif; ?>
    
    <!-- Policy Detail Modal -->
    <div id="policy-modal" class="modal">
        <div class="modal-content">
            <button id="modal-close" class="modal-close">&times;</button>
            <div id="modal-body"></div>
        </div>
    </div>
    
    <!-- JavaScript -->
    <script src="assets/js/policy-main.js"></script>
    
</body>
</html>
