<?php
/**
 * Policy Database Component
 * Component for displaying mining policies and regulations
 * 
 * @package GetSimple
 * @subpackage Nigeria-Theme
 * @status Coming Soon
 */

if(!defined('IN_GS')){ die('you cannot load this page directly.'); }
?>

<style>
.coming-soon {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 20px;
}

.coming-soon-content {
    max-width: 600px;
}

.coming-soon h1 {
    font-size: 3rem;
    color: #ffc03c;
    margin-bottom: 20px;
}

.coming-soon p {
    font-size: 1.25rem;
    color: #6b7280;
    margin-bottom: 30px;
}

.coming-soon .features {
    background: #f9fafb;
    border-radius: 12px;
    padding: 30px;
    margin-top: 40px;
    text-align: left;
}

.coming-soon .features h3 {
    color: #374151;
    margin-bottom: 20px;
}

.coming-soon .features ul {
    list-style: none;
    padding: 0;
}

.coming-soon .features li {
    padding: 10px 0;
    color: #6b7280;
}

.coming-soon .features li:before {
    content: "✓ ";
    color: #16a34a;
    font-weight: bold;
    margin-right: 10px;
}
</style>

<div class="coming-soon">
    <div class="coming-soon-content">
        <h1>📋 Policy Database</h1>
        <p>The Mining Policy Database is currently under development and will be available soon.</p>
        
        <div class="features">
            <h3>Planned Features:</h3>
            <ul>
                <li>Comprehensive collection of mining policies and regulations</li>
                <li>Search and filter by policy type, year, and status</li>
                <li>Link policies to relevant stakeholders</li>
                <li>Policy timeline and historical tracking</li>
                <li>Document repository with downloadable PDFs</li>
                <li>Policy impact analysis and visualizations</li>
            </ul>
        </div>
        
        <p style="margin-top: 30px;">
            <a href="<?php get_site_url(); ?>stakeholders" style="color: #ffc03c; text-decoration: underline;">
                ← Back to Stakeholder Database
            </a>
        </p>
    </div>
</div>
