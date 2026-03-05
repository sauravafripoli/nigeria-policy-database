<?php if (!defined('IN_GS')) { die('you cannot load this page directly.'); }
/****************************************************
*
* @File: 	footer.inc.php
* @Package:	APRI Theme
* @Action:	APRI header theme for microsites and minipages
*
*****************************************************/
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta property="og:title" content="<?php get_page_clean_title(); ?>">
		<meta property="og:description" content="">
		<meta property="og:image" content="https://afripoli.org/event/data/uploads/event_2558944.png"> <!-- replacing this event png with the right png -->
		<meta property="og:url" content="https://afripoli.org/projects/greentech">
		<meta property="og:type" content="map">
		<!-- Twitter Card metadata for sharing on Twitter -->
		<meta name="twitter:card" content="summary_large_image">
		<meta name="twitter:title" content="<?php get_page_clean_title(); ?>">
		<meta name="twitter:description" content="Explore Africa Climate Policy Map">
		<meta name="twitter:image" content="https://afripoli.org/event/data/uploads/event_2558944.png"> <!-- replacing this with the right png -->
		<meta name="twitter:url" content="https://afripoli.org/projects/greentech">
		<meta name="twitter:site" content="@APRI_Africa">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		<title><?php get_page_clean_title(); ?> - <?php get_site_name(); ?></title>
		<meta name="robots" content="index, follow">
		<link rel="shortcut icon" type="image/png" href="//afripoli.org/uploads/logo/logo_60a657d21d6f4.png"/>
		<!--New apri font -->
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
		
		<!-- Old webfont -->
		<link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese" rel="stylesheet">
        
        <!-- Leaflet CSS for map rendering -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        
        <!-- Leaflet MarkerCluster CSS -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
        
        <!-- D3.js for data visualization and filters -->
        <script src="https://d3js.org/d3.v7.min.js"></script>
		
		<!-- APRI web assets (b5 and plugins) -->
		<link href="https://afripoli.org/assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
		<link href="https://afripoli.org/assets/themes/magazine/css/plugins-2.4.min.css" rel="stylesheet">
		<!-- APRI core style (lite version) -->
		<link rel="stylesheet" type="text/css" href="<?php get_theme_url(); ?>/assets/css/style-lite.css?v=<?php echo get_site_version(); ?>">
		
		<!-- map style -->
		<link rel="stylesheet" type="text/css" href="<?php get_theme_url(); ?>/assets/css/custom.css" />
	</head>
	<?php get_header(); ?>
	
	<body>
		<header id="header" class="header-area border-bottom">
			<div class="header-bottom-wrap header-sticky">
				<div class="container-xl">
					<div class="row">
						<div class="col-lg-12">
							<div class="header position-relative">
								<div class="header__logo">
									<a href="https://afripoli.org">
										<img src="https://afripoli.org/uploads/logo/logo_60a2eb206046f.svg" alt="logo" class="img-fluid">
									</a>
								</div>
								<div class="header-midle-box">
									<div class="header-bottom-wrap d-md-block d-none">
										<div class="header-bottom-inner">
											<div class="header-bottom-left-wrap">
												<div class="header__navigation d-none d-xl-block">
													<nav class="navigation-menu primary--menu">
														<ul>
															<li class="has-children has-children--multilevel-submenu">
																<a href="#" class="fw-semibold">
																	<span>Programs</span>
																</a>
																<ul class="submenu">
																	<li><a href="https://afripoli.org/climate-agenda"><span>Africa's Climate Agenda</span></a></li>
																	<li><a href="https://afripoli.org/economy-finance-society"><span>Economy &amp; Society</span></a></li>
																	<li><a href="https://afripoli.org/geopolitics-and-geoeconomics"><span>Geopolitics &amp; Geoeconomics</span></a></li>
																	<li><a href="https://afripoli.org/climate-transitions"><span>Climate Transitions</span></a></li>
																	<li><a href="https://afripoli.org/just-technology-transition"><span>Just Green Technology Transition</span></a></li>
																	<li><a href="https://afripoli.org/africas-digital-agenda"><span>Africa’s Digital Agenda</span></a></li>
																</ul>
															</li>
															<!-- others -->
															<li class="has-children has-children--multilevel-submenu">
																<a href="#" class="fw-semibold">
																	<span>Analysis</span>
																</a>
																<ul class="submenu">
																	<li><a href="https://afripoli.org/analysis/policy-brief"><span>Policy Briefs</span></a></li>
																	<li><a href="https://afripoli.org/analysis/policy-paper"><span>Policy Paper</span></a></li>
																	<li><a href="https://afripoli.org/analysis/commentary"><span>Commentaries</span></a></li>
																	<li><a href="https://afripoli.org/analysis/short-analysis"><span>Short Analyses</span></a></li>
																	<li><a href="/analysis/reports"><span>Reports</span></a></li>
																	<li><a href="https://afripoli.org/analysis/briefing-note"><span>Briefing Notes</span></a></li>
																	<li><a href="https://afripoli.org/analysis/expert-interview"><span>Expert Interviews</span></a></li>
																</ul>
															</li>
															<li class="has-children has-children--multilevel-submenu">
																<a href="#" class="fw-semibold">
																	<span>Projects</span>
																</a>
																<ul class="submenu">
																	<li><a href="https://afripoli.org/projects/climate-adaptation/"><span>Climate Adaptation</span></a></li>
																	<li><a href="https://afripoli.org/projects/climate-finance"><span>Climate Finance</span></a></li>
																	<li><a href="https://afripoli.org/projects/green-minerals"><span>Green Transition Minerals</span></a></li>
																	<li><a href="https://afripoli.org/projects/green-technology"><span>Green Technology</span></a></li>
																	<li><a href="https://afripoli.org/projects/glossary"><span>Jargon Explained</span></a></li>
																	<li><a href="https://afripoli.org/projects/youth-resilience"><span>Youth Resilience</span></a></li>
																</ul>
															</li>
															<li>
																<a href="https://afripoli.org/team" class="fw-semibold">
																	<span> Experts</span>
																</a>
															</li>
															<li>
																<a href="https://afripoli.org/events" class="fw-semibold">
																	<span> Events</span>
																</a>
															</li>
															<li class="has-children has-children--multilevel-submenu">
																<a href="#" class="fw-semibold">
																	<span>About</span>
																</a>
																<ul class="submenu">
																	<li>
																		<a href="https://afripoli.org/about">
																			<span>About APRI</span>
																		</a>
																	</li>
																	<li>
																		<a href="https://afripoli.org/annual-report">
																			<span>Annual Report</span>
																		</a>
																	</li>
																	<li>
																		<a href="https://afripoli.org/advisory-board">
																			<span>Advisory Board</span>
																		</a>
																	</li>
																	<li>
																		<a href="https://afripoli.org/opportunities">
																			<span>Opportunities</span>
																		</a>
																	</li>
																</ul>
															</li>
														</ul>
													</nav>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="header-right">
									<div class="header-search-form-two">
										<form action="#" class="search-form-top-active">
											<div class="search-icon" id="search-overlay-trigger">
												<a href="#" aria-label="Open Search Overlay"><i class="bi bi-search"></i></a>
											</div>
										</form>
									</div>
									<div class="mobile-navigation-icon d-block d-xl-none me-2" id="mobile-menu-trigger">
										<i></i>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>