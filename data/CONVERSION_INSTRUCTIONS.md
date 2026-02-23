# Data Conversion Instructions

## Step 1: Run the Python Conversion Script

Navigate to the data directory and run the conversion script:

```bash
cd /Applications/MAMP/htdocs/nigeria/theme/nigeria/data
python3 convert_to_json.py
```

## What This Does:

The script will:
1. Read all 18 CSV files from the current directory
2. Parse each file and extract stakeholder information
3. Geocode stakeholders using Nigeria state centroids
4. Generate JSON files for each category
5. Create a master `all_stakeholders.json` file

## Expected Output:

```
============================================================
Mining Stakeholder Database - CSV to JSON Converter
============================================================

  Processing: Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Federal Government.csv
    ✓ Processed 8 records
  Processing: Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Mining Company.csv
    ✓ Processed 120 records
  ... (continues for all files)

============================================================
Processing Complete!
============================================================
Total stakeholders: 547
Categories: 14
States covered: 37

Output location: /Applications/MAMP/htdocs/nigeria/theme/nigeria/mining-database/data/processed/

Files created:
  - all_stakeholders.json (master file)
  - federal-government.json
  - mining-companies.json
  - state-agencies.json
  ... etc
```

## Output Location:

All JSON files will be created in:
```
/Applications/MAMP/htdocs/nigeria/theme/nigeria/mining-database/data/processed/
```

## Step 2: View the Website

After running the conversion script, visit:

```
http://localhost:8888/nigeria/index.php?id=stakeholders
```

Or create a GetSimple page with slug `stakeholders` or `mining-database`

## Troubleshooting:

### Python not found:
```bash
# Check Python version
python3 --version

# If not installed, install via Homebrew:
brew install python3
```

### Permission denied:
```bash
chmod +x convert_to_json.py
python3 convert_to_json.py
```

### Module not found:
The script uses only built-in Python modules (csv, json, os, pathlib, re), so no pip install needed.

## File Structure After Conversion:

```
nigeria/theme/nigeria/
├── data/
│   ├── convert_to_json.py          ← Conversion script
│   ├── nigeria-centroids.json
│   └── *.csv (18 CSV files)
│
├── mining-database/
│   └── data/processed/
│       ├── all_stakeholders.json   ← Master file (ALL data)
│       ├── federal-government.json
│       ├── mining-companies.json
│       └── ... (one per category)
│
├── components/
│   ├── mining-database.php         ← Main component
│   ├── home.php
│   └── policy-database.php
│
└── template.php                    ← Entry point
```

## Next Steps:

1. ✅ Run Python script
2. ✅ Verify JSON files created
3. ✅ Create GetSimple page with slug "stakeholders"
4. ✅ View the interactive database!
