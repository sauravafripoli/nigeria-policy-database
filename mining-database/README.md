# Mining Stakeholder Database - Setup Guide

## 🎯 Phase 1: Initial Setup Complete!

You've successfully created the foundation for the Mining Stakeholder Database. Here's what has been built:

### ✅ What's Ready

1. **Data Structure**
   - ✅ Nigeria state centroids JSON with all 37 states
   - ✅ Data processing script for CSV imports

2. **Main Application**
   - ✅ Main index page with hero section
   - ✅ Filter sidebar with search and category filters
   - ✅ Data table component with pagination
   - ✅ Complete CSS styling (nanoblue.org inspired)

3. **JavaScript Components**
   - ✅ D3.js map implementation
   - ✅ Filter logic with real-time updates
   - ✅ Table rendering with sort/pagination
   - ✅ Export to CSV functionality

---

## 🚀 Next Steps

### Step 1: Process Your CSV Data

**Action:** Run the data processor to convert your 18 CSV files to JSON format.

**How to do it:**

1. Open your browser and navigate to:
   ```
   http://localhost:8888/nigeria/admin/process-mining-data.php
   ```
   (Adjust port if MAMP uses different port)

2. The script will:
   - Parse all 18 CSV files
   - Add geocoding using state centroids
   - Generate JSON files for D3.js
   - Create master `all_stakeholders.json`

3. You should see output like:
   ```
   Processing: Federal Government
   ✓ Processed 42 records
   
   Processing: Mining Companies
   ✓ Processed 120 records
   
   ... etc
   
   Processing Complete!
   Total stakeholders processed: 547
   ```

**Expected Output Location:**
```
theme/nigeria/mining-database/data/processed/
├── all_stakeholders.json        (Master file with all data)
├── federal-government.json
├── mining-companies.json
├── state-agencies.json
... (one file per category)
```

---

### Step 2: View the Database

After processing data, navigate to:
```
http://localhost:8888/nigeria/theme/nigeria/mining-database/
```

You should see:
- ✅ Hero section with category pills
- ✅ Interactive map with stakeholder markers
- ✅ Filter sidebar
- ✅ Data table below map

---

### Step 3: Get Nigeria GeoJSON (Optional - For Better Map)

Currently, the map uses a simplified placeholder. For production:

**Option A: Download Nigeria GeoJSON**
```bash
# Visit: https://github.com/deldersveld/topojson
# Download: nigeria-states.json
# Place in: theme/nigeria/data/maps/nigeria-states.json
```

**Option B: Use existing centroids (already working)**
The map will work fine with state centroids for Phase 1.

---

## 🎨 Features Available

### Map Features
- ✅ Zoom in/out/reset controls
- ✅ Hover tooltips showing stakeholder info
- ✅ Click markers for detailed view
- ✅ Color-coded by category
- ✅ Legend showing all categories

### Filter Features
- ✅ Search by name/location
- ✅ Filter by state (dropdown with all 37 states)
- ✅ Filter by category (checkboxes)
- ✅ Filter by geopolitical zone
- ✅ Reset filters button
- ✅ Live statistics

### Table Features
- ✅ Sortable columns (name, category, state)
- ✅ Pagination (25 per page)
- ✅ Grid/table view toggle
- ✅ "View on Map" button
- ✅ "Details" button for full info

### Export Features
- ✅ Export filtered data to CSV
- ✅ Includes all fields

---

## 🔧 Troubleshooting

### Issue: "Data Not Processed Yet" message

**Solution:** Run the data processor:
```
http://localhost:8888/nigeria/admin/process-mining-data.php
```

### Issue: Map not showing

**Check:**
1. Browser console for errors (F12 → Console tab)
2. Verify JSON file exists: `theme/nigeria/mining-database/data/processed/all_stakeholders.json`
3. Check MAMP is running
4. Verify D3.js loads (check Network tab in browser dev tools)

### Issue: CSV columns don't match

**Solution:** The processor tries to auto-detect columns. If it fails:
1. Open `admin/process-mining-data.php`
2. Edit the `extractField()` method
3. Add your specific column names to the array

Example:
```php
$name = $this->extractField($row, [
    'name',           // existing
    'organization',   // existing
    'your_column_name' // ADD YOUR COLUMN NAME HERE
]);
```

---

## 📁 File Structure Reference

```
nigeria/
├── admin/
│   └── process-mining-data.php          [DATA PROCESSOR]
│
├── theme/nigeria/
│   ├── data/
│   │   ├── nigeria-centroids.json       [STATE COORDINATES]
│   │   └── Version 1_Database...*.csv   [YOUR 18 CSV FILES]
│   │
│   └── mining-database/
│       ├── index.php                    [MAIN PAGE]
│       │
│       ├── components/
│       │   ├── filter-sidebar.php       [FILTER UI]
│       │   └── data-table.php           [TABLE UI]
│       │
│       ├── assets/
│       │   ├── css/
│       │   │   └── mining-db.css        [STYLES]
│       │   └── js/
│       │       ├── map-main.js          [D3 MAP]
│       │       ├── filters.js           [FILTER LOGIC]
│       │       └── table.js             [TABLE LOGIC]
│       │
│       └── data/processed/
│           └── all_stakeholders.json    [GENERATED DATA]
```

---

## 🎯 Phase 1 Testing Checklist

Once data is processed, test these features:

### Map Testing
- [ ] Map loads and displays Nigeria
- [ ] Stakeholder markers appear
- [ ] Hover shows tooltip
- [ ] Click marker opens detail modal
- [ ] Zoom in/out works
- [ ] Reset view button works
- [ ] Legend displays all categories

### Filter Testing
- [ ] Search box filters stakeholders
- [ ] State dropdown filters correctly
- [ ] Category checkboxes work
- [ ] Category pills update view
- [ ] Reset filters button works
- [ ] Statistics update correctly

### Table Testing
- [ ] Table shows data
- [ ] Sort by name/category/state works
- [ ] Pagination works
- [ ] "View on Map" scrolls to map
- [ ] "Details" opens modal
- [ ] Grid view toggle works

### Export Testing
- [ ] Export button downloads CSV
- [ ] CSV contains all visible data
- [ ] CSV opens correctly in Excel

---

## 📊 Expected Results

After processing, you should have approximately:
- **Total Stakeholders:** 500-700 (depending on CSV data)
- **Categories:** 14
- **States Covered:** 30-37
- **File Size:** all_stakeholders.json ~2-5MB

---

## 🎨 Customization Options

### Change Colors
Edit `assets/css/mining-db.css`:
```css
:root {
    --primary-blue: #2563eb;    /* Change hero color */
    --primary-red: #dc2626;     /* Change accent color */
}
```

### Adjust Map Position
Edit `assets/js/map-main.js`:
```javascript
this.projection = d3.geoMercator()
    .center([8.0, 9.5])  // [longitude, latitude] - adjust these
    .scale(3200);        // Zoom level - increase to zoom in
```

### Change Items Per Page
Edit `assets/js/table.js`:
```javascript
let itemsPerPage = 25;  // Change to 50, 100, etc.
```

---

## 🚀 Phase 2 Preview

After Phase 1 is working, we can add:
- 📍 Real Nigeria GeoJSON boundaries
- 🗺️ Mineral belts overlay
- 🔗 Policy database integration
- 📈 Analytics dashboard
- 👤 User authentication
- 📱 Mobile app version

---

## 🆘 Need Help?

### Quick Commands

**Start MAMP:**
```bash
# Open MAMP application
# Click "Start Servers"
```

**View Logs:**
```bash
# MAMP logs are in:
/Applications/MAMP/logs/
```

**Check PHP Errors:**
Add to `gsconfig.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

---

## ✅ Success Indicators

You'll know Phase 1 is working when:
1. ✅ Data processor shows "Processing Complete"
2. ✅ Map displays with colored markers
3. ✅ Clicking a marker shows stakeholder details
4. ✅ Filters update the map and table
5. ✅ Export downloads a valid CSV file

---

**Ready to process your data?**

Navigate to: `http://localhost:8888/nigeria/admin/process-mining-data.php`

Good luck! 🎉
