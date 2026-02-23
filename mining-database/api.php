<?php
/**
 * Mining Stakeholder Database - API Endpoint
 * Serves JSON data for the frontend application
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Get action parameter
$action = $_GET['action'] ?? 'getAll';

// Data file path
$dataFile = __DIR__ . '/data/processed/all_stakeholders.json';

// Check if data exists
if (!file_exists($dataFile)) {
    http_response_code(404);
    echo json_encode([
        'error' => 'Data not found',
        'message' => 'Please process the CSV files first',
        'processorUrl' => '/nigeria/admin/process-mining-data.php'
    ]);
    exit;
}

// Load data
$jsonData = file_get_contents($dataFile);
$data = json_decode($jsonData, true);

// Handle different actions
switch ($action) {
    case 'getAll':
        // Return all stakeholders
        echo json_encode($data);
        break;
    
    case 'getByCategory':
        $category = $_GET['category'] ?? '';
        if ($category) {
            $filtered = array_filter($data['stakeholders'], function($s) use ($category) {
                return $s['category'] === $category;
            });
            echo json_encode([
                'metadata' => $data['metadata'],
                'stakeholders' => array_values($filtered)
            ]);
        } else {
            echo json_encode(['error' => 'Category parameter required']);
        }
        break;
    
    case 'getByState':
        $state = $_GET['state'] ?? '';
        if ($state) {
            $filtered = array_filter($data['stakeholders'], function($s) use ($state) {
                return $s['location']['state'] === $state;
            });
            echo json_encode([
                'metadata' => $data['metadata'],
                'stakeholders' => array_values($filtered)
            ]);
        } else {
            echo json_encode(['error' => 'State parameter required']);
        }
        break;
    
    case 'getById':
        $id = $_GET['id'] ?? '';
        if ($id) {
            $found = null;
            foreach ($data['stakeholders'] as $s) {
                if ($s['id'] === $id) {
                    $found = $s;
                    break;
                }
            }
            if ($found) {
                echo json_encode($found);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Stakeholder not found']);
            }
        } else {
            echo json_encode(['error' => 'ID parameter required']);
        }
        break;
    
    case 'getStats':
        // Return only metadata and statistics
        echo json_encode([
            'metadata' => $data['metadata'],
            'statistics' => $data['statistics']
        ]);
        break;
    
    case 'search':
        $query = strtolower($_GET['q'] ?? '');
        if ($query) {
            $filtered = array_filter($data['stakeholders'], function($s) use ($query) {
                return (
                    stripos($s['name'], $query) !== false ||
                    stripos($s['category'], $query) !== false ||
                    stripos($s['location']['state'], $query) !== false ||
                    stripos($s['type'], $query) !== false
                );
            });
            echo json_encode([
                'query' => $query,
                'count' => count($filtered),
                'stakeholders' => array_values($filtered)
            ]);
        } else {
            echo json_encode(['error' => 'Query parameter (q) required']);
        }
        break;
    
    default:
        http_response_code(400);
        echo json_encode([
            'error' => 'Invalid action',
            'availableActions' => [
                'getAll',
                'getByCategory',
                'getByState',
                'getById',
                'getStats',
                'search'
            ]
        ]);
}
?>
