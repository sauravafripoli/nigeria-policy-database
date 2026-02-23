<?php if(!defined('IN_GS')){ die('you cannot load this page directly.'); }
/**
 * Nigeria Mining Hub Theme Template
 * 
 * @package GetSimple
 * @subpackage Nigeria-Theme
 */

// Include APRI header with navigation
include('header.inc.php');

// Get current page slug to determine which component to load
$current_page = return_page_slug();

?>

<!-- Main Content Wrapper -->
<div class="main-content-wrapper">
    
    <?php
    /**
     * COMPONENT ROUTING
     * Load different components based on page slug
     */
    
    switch($current_page) {
        
        // Mining Stakeholder Database
        case 'mining-database':
        case 'stakeholders':
            include('components/mining-database.php');
            break;
        
        // Policy Database (future)
        case 'policies':
        case 'policy-database':
            include('components/policy-database.php');
            break;
        
        // About/Home page (future)
        case 'index':
        case 'home':
        default:
            include('components/home.php');
            break;
    }
    ?>
    
</div>
<!-- End Main Content Wrapper -->

<?php
// Include APRI footer with social links and organizational info
include('footer.inc.php');
?>

