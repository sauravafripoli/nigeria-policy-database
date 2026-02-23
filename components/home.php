<?php
/**
 * Home Component
 * Landing page for Nigeria Mining Hub
 */

if(!defined('IN_GS')){ die('you cannot load this page directly.'); }
?>

<style>
.home-hero {
    background: linear-gradient(135deg, #ffc03c 0%, #d97706 100%);
    color: white;
    padding: 100px 20px;
    text-align: center;
}

.home-hero h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 20px;
}

.home-hero p {
    font-size: 1.5rem;
    margin-bottom: 40px;
    opacity: 0.9;
}

.feature-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    padding: 60px 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.feature-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.15);
}

.feature-card h3 {
    color: #ffc03c;
    font-size: 1.5rem;
    margin-bottom: 15px;
}

.feature-card p {
    color: #6b7280;
    line-height: 1.6;
}

.btn-primary {
    background: #ffc03c;
    color: white;
    padding: 15px 40px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    display: inline-block;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: #d97706;
    color: white;
}
</style>

<!-- Hero Section -->
<section class="home-hero">
    <div class="container">
        <h1>Nigeria Mining Hub</h1>
        <p>Your comprehensive resource for mining sector information in Nigeria</p>
        <a href="<?php get_site_url(); ?>index.php?id=stakeholders" class="btn-primary">
            Explore Stakeholder Database →
        </a>
    </div>
</section>

<!-- Feature Cards -->
<section class="feature-cards">
    
    <!-- Stakeholder Database -->
    <div class="feature-card">
        <h3>🗺️ Stakeholder Database</h3>
        <p>Interactive map and directory of over 500+ stakeholders across 14 categories in Nigeria's mining sector.</p>
        <a href="<?php get_site_url(); ?>index.php?id=stakeholders" class="btn-primary" style="margin-top: 20px; padding: 10px 20px; font-size: 14px;">
            View Database
        </a>
    </div>
    
    <!-- Policy Database (Coming Soon) -->
    <div class="feature-card" style="opacity: 0.6;">
        <h3>📋 Policy Database</h3>
        <p>Comprehensive collection of mining policies, regulations, and frameworks governing Nigeria's mineral sector.</p>
        <span style="color: #9ca3af; font-size: 14px; margin-top: 20px; display: inline-block;">Coming Soon</span>
    </div>
    
    <!-- Analytics (Coming Soon) -->
    <div class="feature-card" style="opacity: 0.6;">
        <h3>📊 Analytics Dashboard</h3>
        <p>Data-driven insights and visualizations on mining sector trends, stakeholder distribution, and policy impacts.</p>
        <span style="color: #9ca3af; font-size: 14px; margin-top: 20px; display: inline-block;">Coming Soon</span>
    </div>
    
</section>

<!-- About Section -->
<section style="background: #f9fafb; padding: 60px 20px;">
    <div class="container" style="max-width: 800px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 30px;">About This Platform</h2>
        <p style="line-height: 1.8; color: #4b5563; text-align: center;">
            The Nigeria Mining Hub is a comprehensive digital platform designed to provide 
            transparent access to information about stakeholders, policies, and developments 
            in Nigeria's mining sector. Our goal is to facilitate collaboration, investment, 
            and sustainable development in the industry.
        </p>
    </div>
</section>

<!-- Quick Stats -->
<?php
$dataPath = GSTHEMESPATH . 'nigeria/mining-database/data/processed/all_stakeholders.json';
if (file_exists($dataPath)) {
    $data = json_decode(file_get_contents($dataPath), true);
    $metadata = $data['metadata'] ?? null;
    
    if ($metadata):
?>
<section style="padding: 60px 20px;">
    <div class="container" style="max-width: 1000px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 40px;">Database Overview</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px;">
            <div style="text-align: center;">
                <div style="font-size: 3rem; font-weight: 700; color: #ffc03c;">
                    <?php echo $metadata['totalStakeholders']; ?>
                </div>
                <div style="color: #6b7280; margin-top: 10px;">Total Stakeholders</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 3rem; font-weight: 700; color: #ffc03c;">
                    <?php echo $metadata['categories']; ?>
                </div>
                <div style="color: #6b7280; margin-top: 10px;">Categories</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 3rem; font-weight: 700; color: #ffc03c;">
                    <?php echo $metadata['states']; ?>
                </div>
                <div style="color: #6b7280; margin-top: 10px;">States Covered</div>
            </div>
        </div>
    </div>
</section>
<?php 
    endif;
}
?>
