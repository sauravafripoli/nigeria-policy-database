<div class="table-controls">
    <div class="table-header">
        <div class="table-info">
            <span id="table-showing">Showing 0 stakeholders</span>
        </div>
        <div class="table-actions">
            <button class="btn-icon" id="view-grid" title="Grid View">
                <svg width="20" height="20" fill="currentColor">
                    <rect x="2" y="2" width="7" height="7"/>
                    <rect x="11" y="2" width="7" height="7"/>
                    <rect x="2" y="11" width="7" height="7"/>
                    <rect x="11" y="11" width="7" height="7"/>
                </svg>
            </button>
            <button class="btn-icon active" id="view-table" title="Table View">
                <svg width="20" height="20" fill="currentColor">
                    <rect x="2" y="3" width="16" height="2"/>
                    <rect x="2" y="9" width="16" height="2"/>
                    <rect x="2" y="15" width="16" height="2"/>
                </svg>
            </button>
        </div>
    </div>
</div>

<!-- Table View -->
<div id="table-view" class="table-container">
    <table class="data-table">
        <thead>
            <tr>
                <th class="sortable" data-sort="name">
                    Name 
                    <span class="sort-icon">↕</span>
                </th>
                <th class="sortable" data-sort="category">
                    Category
                    <span class="sort-icon">↕</span>
                </th>
                <th class="sortable" data-sort="state">
                    State
                    <span class="sort-icon">↕</span>
                </th>
                <th>Contact</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="table-body">
            <tr>
                <td colspan="5" class="no-data">
                    <div class="empty-state">
                        <svg width="64" height="64" fill="#d1d5db" style="margin-bottom: 16px;">
                            <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
                            <text x="32" y="40" text-anchor="middle" font-size="32" fill="currentColor">?</text>
                        </svg>
                        <p>Loading stakeholder data...</p>
                        <small>If this persists, please process the data first</small>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
    
    <!-- Pagination -->
    <div class="pagination" id="pagination">
        <button class="page-btn" id="prev-page" disabled>← Previous</button>
        <span class="page-info" id="page-info">Page 1 of 1</span>
        <button class="page-btn" id="next-page" disabled>Next →</button>
    </div>
</div>

<!-- Grid View (alternative view) -->
<div id="grid-view" class="grid-container" style="display: none;">
    <div id="grid-items" class="stakeholder-grid">
        <!-- Grid items will be populated by JavaScript -->
    </div>
</div>

<style>
/* Table Styles */
.table-controls {
    margin-bottom: 20px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
}

.table-info {
    font-size: 14px;
    color: #6b7280;
}

.table-actions {
    display: flex;
    gap: 8px;
}

.btn-icon {
    background: white;
    border: 1px solid #e5e7eb;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: #f9fafb;
}

.btn-icon.active {
    background: #ffc03c;
    border-color: #ffc03c;
}

.btn-icon.active svg {
    fill: white;
}

.table-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.data-table th {
    padding: 16px;
    text-align: left;
    font-weight: 600;
    font-size: 13px;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.data-table th.sortable {
    cursor: pointer;
    user-select: none;
}

.data-table th.sortable:hover {
    background: #f3f4f6;
}

.sort-icon {
    margin-left: 4px;
    opacity: 0.4;
}

.data-table tbody tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.2s;
}

.data-table tbody tr:hover {
    background: #f9fafb;
}

.data-table td {
    padding: 16px;
    font-size: 14px;
    color: #374151;
}

.category-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    background: #e0e7ff;
    color: #3730a3;
}

.state-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    background: #f3f4f6;
    color: #4b5563;
}

.contact-info {
    font-size: 13px;
    line-height: 1.5;
}

.contact-info div {
    margin-bottom: 2px;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-sm:hover {
    background: #f9fafb;
    border-color: #ffc03c;
    color: #ffc03c;
}

.btn-primary-sm {
    background: #ffc03c;
    color: white;
    border-color: #ffc03c;
}

.btn-primary-sm:hover {
    background: #d97706;
}

.no-data {
    text-align: center;
    padding: 60px 20px !important;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.empty-state p {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 8px 0;
}

.empty-state small {
    font-size: 13px;
    color: #9ca3af;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
}

.page-btn {
    padding: 8px 16px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #ffc03c;
    color: #ffc03c;
}

.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.page-info {
    font-size: 14px;
    color: #6b7280;
}

/* Grid View */
.stakeholder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px 0;
}

.stakeholder-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s;
    cursor: pointer;
}

.stakeholder-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
}

.stakeholder-card h3 {
    font-size: 16px;
    margin: 0 0 8px 0;
    color: #111827;
}

.stakeholder-card .category {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 12px;
}

.stakeholder-card .location {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 12px;
}
</style>
