<?php
/**
 * Policy Database API Endpoint
 * Provides JSON data for policy database queries
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Load data (from Python converter)
$dataPath = __DIR__ . '/data/processed/policies.json';
$linksPath = __DIR__ . '/data/processed/policy_stakeholder_links.json';

if (!file_exists($dataPath)) {
    http_response_code(404);
    echo json_encode([
        'error' => 'Policy data not found',
        'message' => 'Please run the Python converter: python3 convert_policy_to_json.py'
    ]);
    exit;
}

$data = json_decode(file_get_contents($dataPath), true);
$links = file_exists($linksPath) ? json_decode(file_get_contents($linksPath), true) : null;

// Get query parameters
$action = $_GET['action'] ?? 'all';
$policyId = $_GET['policy_id'] ?? null;
$stakeholderId = $_GET['stakeholder_id'] ?? null;
$family = $_GET['family'] ?? null;
$status = $_GET['status'] ?? null;
$search = $_GET['search'] ?? null;

// Process request
switch ($action) {
    case 'all':
        // Return all policies
        echo json_encode($data);
        break;
    
    case 'policy':
        // Get single policy by ID
        if (!$policyId) {
            http_response_code(400);
            echo json_encode(['error' => 'policy_id parameter required']);
            exit;
        }
        
        $policy = null;
        foreach ($data['policies'] as $p) {
            if ($p['id'] === $policyId) {
                $policy = $p;
                break;
            }
        }
        
        if ($policy) {
            echo json_encode($policy);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Policy not found']);
        }
        break;
    
    case 'by_stakeholder':
        // Get policies linked to a specific stakeholder
        if (!$stakeholderId || !$links) {
            http_response_code(400);
            echo json_encode(['error' => 'stakeholder_id parameter required or links not available']);
            exit;
        }
        
        // Python converter uses 'links' structure
        $stakeholderPolicies = $links['links'][$stakeholderId] ?? [];
        
        // Get full policy data
        $fullPolicies = [];
        foreach ($data['policies'] as $policy) {
            foreach ($stakeholderPolicies as $sp) {
                if ($policy['id'] === $sp['id']) {
                    $fullPolicies[] = $policy;
                    break;
                }
            }
        }
        
        echo json_encode([
            'stakeholder_id' => $stakeholderId,
            'count' => count($fullPolicies),
            'policies' => $fullPolicies
        ]);
        break;
    
    case 'filter':
        // Filter policies by criteria
        $filtered = $data['policies'];
        
        // Apply family filter
        if ($family && $family !== 'all') {
            $filtered = array_filter($filtered, function($p) use ($family) {
                return strtolower(str_replace(' ', '-', $p['family'])) === $family;
            });
        }
        
        // Apply status filter
        if ($status && $status !== 'all') {
            $filtered = array_filter($filtered, function($p) use ($status) {
                return strtolower(str_replace(' ', '-', $p['status'])) === $status;
            });
        }
        
        // Apply search filter
        if ($search) {
            $searchLower = strtolower($search);
            $filtered = array_filter($filtered, function($p) use ($searchLower) {
                $searchable = strtolower(
                    $p['name'] . ' ' . 
                    $p['summary'] . ' ' . 
                    $p['institutionalResponsibility'] . ' ' . 
                    $p['stakeholdersImpacted']
                );
                return strpos($searchable, $searchLower) !== false;
            });
        }
        
        echo json_encode([
            'count' => count($filtered),
            'policies' => array_values($filtered)
        ]);
        break;
    
    case 'statistics':
        // Return just statistics
        echo json_encode([
            'metadata' => $data['metadata'],
            'statistics' => $data['statistics']
        ]);
        break;
    
    case 'families':
        // Return list of policy families
        $families = array_keys($data['statistics']['byFamily']);
        echo json_encode([
            'count' => count($families),
            'families' => $families
        ]);
        break;
    
    case 'links':
        // Return policy-stakeholder links
        if ($links) {
            echo json_encode($links);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Links not available']);
        }
        break;
    
    default:
        http_response_code(400);
        echo json_encode([
            'error' => 'Invalid action',
            'available_actions' => [
                'all' => 'Get all policies',
                'policy' => 'Get single policy (requires policy_id)',
                'by_stakeholder' => 'Get policies for stakeholder (requires stakeholder_id)',
                'filter' => 'Filter policies (optional: family, status, search)',
                'statistics' => 'Get statistics only',
                'families' => 'Get list of policy families',
                'links' => 'Get policy-stakeholder links'
            ]
        ]);
}
?>
