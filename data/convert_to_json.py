#!/usr/bin/env python3
"""
Mining Stakeholder Database - CSV to JSON Converter
Converts all CSV files to JSON format with geocoding using state centroids
"""

import os
import csv
import json
import re
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
OUTPUT_DIR = BASE_DIR / 'mining-database' / 'data' / 'processed'

# CSV file mapping to categories
CSV_MAPPING = {
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Federal Government.csv': 'Federal Government',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - State Agency .csv': 'State Agencies',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - MMSD Zonal & State Offices.csv': 'MMSD Offices',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Mining Company.csv': 'Mining Companies',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Mining Consultancies.csv': 'Mining Consultancies',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Artisanal & Small scale Miners.csv': 'Artisanal Miners',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Mining & Geoscience Association.csv': 'Associations',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - State-owned Companies.csv': 'State Companies',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Infrastructure and Supply Chain.csv': 'Infrastructure',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - NGOs.csv': 'NGOs',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Civil Society Organisations.csv': 'Civil Society',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Donors.csv': 'Donors',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Training Institutes.csv': 'Training Institutes',
    'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Universities with Mining Depts.csv': 'Universities'
}

# Nigeria state centroids
CENTROIDS = {
    "Abia": {"lat": 5.4527, "lng": 7.5248, "zone": "South East"},
    "Adamawa": {"lat": 9.3265, "lng": 12.3984, "zone": "North East"},
    "Akwa Ibom": {"lat": 4.9057, "lng": 7.8537, "zone": "South South"},
    "Anambra": {"lat": 6.2209, "lng": 6.9370, "zone": "South East"},
    "Bauchi": {"lat": 10.3158, "lng": 9.8442, "zone": "North East"},
    "Bayelsa": {"lat": 4.7719, "lng": 6.0699, "zone": "South South"},
    "Benue": {"lat": 7.3364, "lng": 8.7423, "zone": "North Central"},
    "Borno": {"lat": 11.8846, "lng": 13.1519, "zone": "North East"},
    "Cross River": {"lat": 5.8738, "lng": 8.5981, "zone": "South South"},
    "Delta": {"lat": 5.6812, "lng": 5.9154, "zone": "South South"},
    "Ebonyi": {"lat": 6.2649, "lng": 8.0137, "zone": "South East"},
    "Edo": {"lat": 6.6345, "lng": 5.9348, "zone": "South South"},
    "Ekiti": {"lat": 7.7190, "lng": 5.3110, "zone": "South West"},
    "Enugu": {"lat": 6.5324, "lng": 7.4380, "zone": "South East"},
    "FCT": {"lat": 9.0765, "lng": 7.3986, "zone": "North Central"},
    "Gombe": {"lat": 10.2897, "lng": 11.1679, "zone": "North East"},
    "Imo": {"lat": 5.5720, "lng": 7.0588, "zone": "South East"},
    "Jigawa": {"lat": 12.2284, "lng": 9.5616, "zone": "North West"},
    "Kaduna": {"lat": 10.5264, "lng": 7.4388, "zone": "North West"},
    "Kano": {"lat": 12.0022, "lng": 8.5920, "zone": "North West"},
    "Katsina": {"lat": 12.9908, "lng": 7.6177, "zone": "North West"},
    "Kebbi": {"lat": 11.4965, "lng": 4.1989, "zone": "North West"},
    "Kogi": {"lat": 7.7333, "lng": 6.6950, "zone": "North Central"},
    "Kwara": {"lat": 8.9670, "lng": 4.3790, "zone": "North Central"},
    "Lagos": {"lat": 6.5244, "lng": 3.3792, "zone": "South West"},
    "Nasarawa": {"lat": 8.4909, "lng": 8.1985, "zone": "North Central"},
    "Niger": {"lat": 9.9308, "lng": 5.5978, "zone": "North Central"},
    "Ogun": {"lat": 6.9978, "lng": 3.4770, "zone": "South West"},
    "Ondo": {"lat": 6.9149, "lng": 5.1478, "zone": "South West"},
    "Osun": {"lat": 7.5629, "lng": 4.5200, "zone": "South West"},
    "Oyo": {"lat": 8.1574, "lng": 3.6187, "zone": "South West"},
    "Plateau": {"lat": 9.2182, "lng": 9.5179, "zone": "North Central"},
    "Rivers": {"lat": 4.8396, "lng": 6.9115, "zone": "South South"},
    "Sokoto": {"lat": 13.0622, "lng": 5.2339, "zone": "North West"},
    "Taraba": {"lat": 7.9999, "lng": 10.7738, "zone": "North East"},
    "Yobe": {"lat": 12.2939, "lng": 11.9660, "zone": "North East"},
    "Zamfara": {"lat": 12.1223, "lng": 6.2240, "zone": "North West"}
}


def normalize_state_name(state):
    """Normalize state name variations"""
    if not state:
        return ''
    
    state = state.strip()
    
    # Common variations
    state_map = {
        'fct': 'FCT',
        'abuja': 'FCT',
        'federal capital territory': 'FCT',
        'akwa ibom': 'Akwa Ibom',
        'cross river': 'Cross River',
    }
    
    state_lower = state.lower()
    if state_lower in state_map:
        return state_map[state_lower]
    
    # Check if state exists in centroids
    for state_name in CENTROIDS.keys():
        if state_name.lower() == state_lower:
            return state_name
    
    # Return title case version
    return state.title()


def extract_state_from_location(location_str):
    """Extract state from location string"""
    if not location_str:
        return ''
    
    # Try to find state in parentheses
    match = re.search(r'\(([^)]+)\)', location_str)
    if match:
        potential_state = match.group(1)
        normalized = normalize_state_name(potential_state)
        if normalized in CENTROIDS:
            return normalized
    
    # Try direct match
    normalized = normalize_state_name(location_str)
    if normalized in CENTROIDS:
        return normalized
    
    # Check if any state name is in the string
    for state_name in CENTROIDS.keys():
        if state_name.lower() in location_str.lower():
            return state_name
    
    return ''


def get_coordinates(state, row_number):
    """Get coordinates with offset to prevent overlap"""
    if not state or state not in CENTROIDS:
        # Default to center of Nigeria
        return [7.5, 9.0]
    
    centroid = CENTROIDS[state]
    
    # Add small pseudo-random offset based on row number
    offset_lng = ((row_number * 7) % 20 - 10) * 0.01
    offset_lat = ((row_number * 13) % 20 - 10) * 0.01
    
    return [
        centroid['lng'] + offset_lng,
        centroid['lat'] + offset_lat
    ]


def generate_slug(text):
    """Generate URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text


def generate_id(category, name, row_number):
    """Generate unique ID"""
    prefix = generate_slug(category)[:5]
    name_slug = generate_slug(name)[:10]
    return f"{prefix}-{name_slug}-{row_number:03d}"


def process_csv(filepath, category):
    """Process individual CSV file"""
    stakeholders = []
    
    print(f"  Processing: {os.path.basename(filepath)}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row_number, row in enumerate(reader, 1):
                # Skip empty rows
                if not any(row.values()):
                    continue
                
                # Extract name (try multiple column names)
                name = (row.get('Name of Institution') or 
                       row.get('Name of Organisation') or
                       row.get('Name') or 
                       row.get('Organization') or 
                       row.get('Organisation') or
                       row.get('Organisation Name') or 
                       row.get('Company') or 
                       row.get('Company Name') or
                       row.get('Donor Name') or
                       row.get('NGO Name') or
                       row.get('Agency Name') or
                       row.get('Zone / State Office') or '').strip()
                
                if not name:
                    continue
                
                # Extract location (try multiple column names and formats)
                location_str = (row.get('Location') or 
                              row.get('State/City') or 
                              row.get('State') or '').strip()
                
                # Parse "City, State" or "City, State State" format
                city = ''
                state = ''
                
                if location_str:
                    # Split by comma
                    parts = [p.strip() for p in location_str.split(',')]
                    if len(parts) >= 2:
                        city = parts[0]
                        # Second part might be "Ondo State" or just "Ondo"
                        state_part = parts[1].replace(' State', '').strip()
                        state = extract_state_from_location(state_part)
                    elif len(parts) == 1:
                        # Just one part, try to extract state
                        state = extract_state_from_location(parts[0])
                
                # Get coordinates
                coordinates = get_coordinates(state, row_number)
                
                # Build stakeholder object with all available fields
                stakeholder = {
                    'id': generate_id(category, name, row_number),
                    'name': name,
                    'slug': generate_slug(name),
                    'category': category,
                    'type': (row.get('Stakeholder Type') or 
                            row.get('Type') or 'Other').strip(),
                    'contact': {
                        'person': '',
                        'position': '',
                        'email': '',
                        'phone': '',
                        'address': row.get('Address', '').strip()
                    },
                    'location': {
                        'city': city,
                        'state': state or 'Unknown',
                        'lga': '',
                        'zone': CENTROIDS.get(state, {}).get('zone', 'Unknown'),
                        'coordinates': coordinates,
                        'coordinateType': 'centroid'
                    },
                    'description': (row.get('Mandate') or 
                                  row.get('Functions') or 
                                  row.get('Description') or '').strip(),
                    'website': row.get('Website', '').strip(),
                    'acronym': (row.get('Acronym') or row.get('Acronyms', '')).strip(),
                    'valueChainRole': (row.get('Value Chain Role') or 
                                      row.get('VALUE CHAIN ROLE') or 
                                      row.get('Role / Relevance to Mineral Value Chain & Governance') or
                                      row.get('Role in Mineral Value Chain / Governance', '')).strip(),
                    'jurisdiction': row.get('Jurisdiction', '').strip(),
                    'influenceLevel': row.get('Influence Level', '').strip(),
                    'dateAdded': '2026-01-29'
                }
                
                # Add optional fields only if they have values
                optional_fields = {
                    'summaryFunctions': row.get('Summary Functions', '').strip(),
                    'thematicFocus': row.get('Thematic Focus', '').strip(),
                    'mineralFocus': row.get('Mineral Focus', '').strip(),
                    'scale': row.get('Scale', '').strip(),
                    'companySize': row.get('Company Size', '').strip(),
                    'mineralCommodities': row.get('Mineral Commodities', '').strip(),
                    'equipment': row.get('Equipment/Services', '').strip(),
                    'programmes': row.get('Programmes', '').strip(),
                    'keyProjects': row.get('Key Projects', '').strip(),
                    'currentProjects': (row.get('Current Critical Mineral Project') or 
                                      row.get('Current Projects/Presence', '')).strip(),
                    'relevantDepartments': row.get('Relevant Departments', '').strip(),
                    'level': row.get('Level', '').strip(),
                    'formalInformal': row.get('Formal/Informal', '').strip(),
                    'notes': row.get('Notes', '').strip(),
                    'officeAddress': row.get('Office Address', '').strip()
                }
                
                # Only add optional fields if they have content
                for key, value in optional_fields.items():
                    if value:
                        stakeholder[key] = value
                
                stakeholders.append(stakeholder)
        
        print(f"    ✓ Processed {len(stakeholders)} records")
        return stakeholders
        
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return []


def main():
    """Main processing function"""
    print("=" * 60)
    print("Mining Stakeholder Database - CSV to JSON Converter")
    print("=" * 60)
    print()
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    all_stakeholders = []
    category_stats = {}
    state_stats = {}
    
    # Process each CSV file
    for filename, category in CSV_MAPPING.items():
        filepath = DATA_DIR / filename
        
        if not filepath.exists():
            print(f"  ⚠ File not found: {filename}")
            continue
        
        stakeholders = process_csv(filepath, category)
        
        if stakeholders:
            all_stakeholders.extend(stakeholders)
            category_stats[category] = len(stakeholders)
            
            # Update state stats
            for s in stakeholders:
                state = s['location']['state']
                state_stats[state] = state_stats.get(state, 0) + 1
            
            # Save individual category file
            category_file = OUTPUT_DIR / f"{generate_slug(category)}.json"
            with open(category_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'category': category,
                    'count': len(stakeholders),
                    'lastUpdated': '2026-01-29',
                    'stakeholders': stakeholders
                }, f, indent=2, ensure_ascii=False)
    
    # Save master file
    master_data = {
        'metadata': {
            'totalStakeholders': len(all_stakeholders),
            'categories': len(category_stats),
            'states': len(state_stats),
            'lastUpdated': '2026-01-29',
            'source': 'Mining Stakeholder Database CSV Import'
        },
        'statistics': {
            'byCategory': category_stats,
            'byState': state_stats
        },
        'stakeholders': all_stakeholders
    }
    
    master_file = OUTPUT_DIR / 'all_stakeholders.json'
    with open(master_file, 'w', encoding='utf-8') as f:
        json.dump(master_data, f, indent=2, ensure_ascii=False)
    
    print()
    print("=" * 60)
    print("Processing Complete!")
    print("=" * 60)
    print(f"Total stakeholders: {len(all_stakeholders)}")
    print(f"Categories: {len(category_stats)}")
    print(f"States covered: {len(state_stats)}")
    print(f"\nOutput location: {OUTPUT_DIR}")
    print()
    print("Files created:")
    print(f"  - all_stakeholders.json (master file)")
    for category in category_stats.keys():
        print(f"  - {generate_slug(category)}.json")
    print()


if __name__ == '__main__':
    main()
