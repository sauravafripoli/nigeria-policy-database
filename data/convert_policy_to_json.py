#!/usr/bin/env python3
"""
Policy Database - CSV to JSON Converter
Converts policy CSV to JSON format with automatic stakeholder linking
"""

import os
import csv
import json
import re
from pathlib import Path
from datetime import datetime

# Base directory
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
OUTPUT_DIR = BASE_DIR / 'policy-database' / 'data' / 'processed'

# CSV file
POLICY_CSV = 'Version 1_Database_Comprehensive List of all Stakeholders.xlsx - Mineral Policy Database.csv'

# Stakeholder abbreviations for automatic linking
STAKEHOLDER_ABBREVIATIONS = {
    'MMSD': ['Mining Cadastre Office', 'MMSD'],
    'NGSA': ['Nigerian Geological Survey Agency', 'NGSA'],
    'MCO': ['Mining Cadastre Office', 'MCO', 'Cadastre'],
    'NEITI': ['Nigeria Extractive Industries Transparency Initiative', 'NEITI'],
    'FMEP': ['Federal Ministry of Environment', 'FMEP'],
    'FMST': ['Federal Ministry of Solid Minerals Development', 'FMST'],
    'NASRDA': ['National Space Research and Development Agency', 'NASRDA'],
    'SON': ['Standards Organisation of Nigeria', 'SON'],
    'NESREA': ['National Environmental Standards and Regulations Enforcement Agency', 'NESREA'],
    'SEC': ['Securities and Exchange Commission', 'SEC'],
    'EFCC': ['Economic and Financial Crimes Commission', 'EFCC'],
    'NSIA': ['Nigeria Sovereign Investment Authority', 'NSIA'],
    'NCS': ['Nigeria Customs Service', 'NCS'],
    'CBN': ['Central Bank of Nigeria', 'CBN'],
    'NBET': ['National Board for Environmental Technology', 'NBET'],
    'FIRS': ['Federal Inland Revenue Service', 'FIRS']
}


def generate_slug(text):
    """Generate URL-friendly slug"""
    if not text:
        return ''
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text


def generate_id(name, year, row_number):
    """Generate unique policy ID"""
    name_slug = generate_slug(name)[:15]
    year_str = str(year)[:4] if year else '0000'
    return f"policy-{year_str}-{name_slug}-{row_number:03d}"


def extract_stakeholders(text):
    """Extract stakeholder abbreviations from text"""
    if not text:
        return []
    
    stakeholders = []
    text_upper = text.upper()
    
    for abbr, variants in STAKEHOLDER_ABBREVIATIONS.items():
        for variant in variants:
            if variant.upper() in text_upper:
                if abbr not in stakeholders:
                    stakeholders.append(abbr)
                break
    
    return stakeholders


def parse_year(year_str):
    """Parse year from string"""
    if not year_str:
        return None
    
    try:
        # Remove any non-digit characters
        year_str = re.sub(r'[^\d]', '', str(year_str))
        if year_str:
            year = int(year_str)
            if 1900 <= year <= 2100:
                return year
    except (ValueError, TypeError):
        pass
    
    return None


def clean_multiline_text(text):
    """Clean and normalize multiline text"""
    if not text:
        return ''
    
    # Replace newlines with spaces
    text = text.replace('\n', ' ').replace('\r', ' ')
    
    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


def split_list_items(text, delimiter=';'):
    """Split text into list items - handles semicolons, newlines, or commas"""
    if not text:
        return []
    
    # Don't clean multiline text if we want to preserve newlines as separators
    # First try splitting by newlines (most common in stakeholder fields)
    if '\n' in text:
        items = [item.strip() for item in text.split('\n') if item.strip()]
        if items:  # If we got results, return them
            return items
    
    # If no newlines, try semicolons
    if delimiter in text:
        items = [item.strip() for item in text.split(delimiter) if item.strip()]
        if items:
            return items
    
    # If no delimiters found, return the whole text as single item
    text_cleaned = text.strip()
    return [text_cleaned] if text_cleaned else []


def load_stakeholder_database():
    """Load all stakeholders from the mining database"""
    # Path to mining database all stakeholders file
    mining_db_path = BASE_DIR / 'mining-database' / 'data' / 'processed'
    all_stakeholders_file = mining_db_path / 'all_stakeholders.json'
    
    if not all_stakeholders_file.exists():
        print(f"Warning: Stakeholder database not found at {all_stakeholders_file}")
        return []
    
    try:
        with open(all_stakeholders_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Extract stakeholders array from the structure
            stakeholders = data.get('stakeholders', [])
        print(f"Loaded {len(stakeholders)} stakeholders from mining database")
        return stakeholders
    except Exception as e:
        print(f"Error loading stakeholder database: {e}")
        return []


def normalize_name(name):
    """Normalize stakeholder name for matching"""
    if not name:
        return ''
    # Convert to lowercase, remove extra spaces, remove punctuation
    name = name.lower().strip()
    name = re.sub(r'[^\w\s]', '', name)  # Remove punctuation
    name = re.sub(r'\s+', ' ', name)  # Collapse spaces
    return name


def find_stakeholder_match(policy_stakeholder_name, stakeholder_database):
    """Find matching stakeholder in database by name (fuzzy match)"""
    if not policy_stakeholder_name:
        return None
    
    policy_name_normalized = normalize_name(policy_stakeholder_name)
    
    # Try exact match first
    for stakeholder in stakeholder_database:
        stakeholder_name_normalized = normalize_name(stakeholder.get('name', ''))
        if policy_name_normalized == stakeholder_name_normalized:
            return stakeholder
    
    # Try partial match (policy name contains stakeholder name or vice versa)
    for stakeholder in stakeholder_database:
        stakeholder_name_normalized = normalize_name(stakeholder.get('name', ''))
        
        # Skip very short names to avoid false matches
        if len(stakeholder_name_normalized) < 4:
            continue
            
        if (stakeholder_name_normalized in policy_name_normalized or 
            policy_name_normalized in stakeholder_name_normalized):
            return stakeholder
    
    return None


def find_stakeholders_by_category(policy_stakeholder_name, stakeholder_database):
    """Find all stakeholders matching a category name"""
    if not policy_stakeholder_name:
        return []
    
    policy_name_normalized = normalize_name(policy_stakeholder_name)
    matches = []
    
    # Category mapping
    category_keywords = {
        'federal government': ['Federal Government'],
        'state government': ['State Agencies', 'State Companies'],
        'mining companies': ['Mining Companies'],
        'investors': ['Mining Companies'],
        'communities': ['Civil Society', 'Associations'],
        'local communities': ['Civil Society', 'Associations'],
        'environmental agencies': ['Federal Government'],  # Filter by NESREA, FMEP, etc.
        'miners': ['Artisanal Miners'],
        'artisanal miners': ['Artisanal Miners'],
        'asm': ['Artisanal Miners'],
        'ngos': ['NGOs'],
        'civil society': ['Civil Society'],  # Separated from NGOs
        'donors': ['Donors'],
        'universities': ['Universities'],
        'training': ['Training Institutes']
    }
    
    # Check if the policy stakeholder matches a category keyword
    for keyword, categories in category_keywords.items():
        if keyword in policy_name_normalized:
            # Get all stakeholders in those categories
            for stakeholder in stakeholder_database:
                if stakeholder.get('category') in categories:
                    # Additional filtering for environmental agencies
                    if 'environmental' in policy_name_normalized:
                        stakeholder_name = normalize_name(stakeholder.get('name', ''))
                        if any(term in stakeholder_name for term in ['environmental', 'nesrea', 'environment']):
                            matches.append(stakeholder)
                    else:
                        matches.append(stakeholder)
            break
    
    return matches


def link_policies_to_stakeholders(policies, stakeholder_database):
    """Link policies to stakeholders and create bidirectional references"""
    
    # Map stakeholder IDs to their policies
    stakeholder_to_policies = {}
    
    for policy in policies:
        linked_stakeholder_ids = []
        linked_stakeholder_details = []
        
        for stakeholder_name in policy.get('linkedStakeholders', []):
            # Try specific name match first
            match = find_stakeholder_match(stakeholder_name, stakeholder_database)
            
            if match:
                stakeholder_id = match.get('id')
                if stakeholder_id and stakeholder_id not in linked_stakeholder_ids:
                    linked_stakeholder_ids.append(stakeholder_id)
                    linked_stakeholder_details.append({
                        'id': stakeholder_id,
                        'name': match.get('name', ''),
                        'category': match.get('category', ''),
                        'type': match.get('type', '')
                    })
                    
                    # Track reverse mapping (stakeholder -> policies)
                    if stakeholder_id not in stakeholder_to_policies:
                        stakeholder_to_policies[stakeholder_id] = []
                    
                    stakeholder_to_policies[stakeholder_id].append({
                        'policyName': policy['policyName'],
                        'policyFamily': policy.get('policyFamily', ''),
                        'policyType': policy.get('policyType', ''),
                        'yearIntroduced': policy.get('yearIntroduced', ''),
                        'status': policy.get('status', '')
                    })
            else:
                # Try category-based matching
                category_matches = find_stakeholders_by_category(stakeholder_name, stakeholder_database)
                
                for match in category_matches:  # Link all matching stakeholders
                    stakeholder_id = match.get('id')
                    if stakeholder_id and stakeholder_id not in linked_stakeholder_ids:
                        linked_stakeholder_ids.append(stakeholder_id)
                        linked_stakeholder_details.append({
                            'id': stakeholder_id,
                            'name': match.get('name', ''),
                            'category': match.get('category', ''),
                            'type': match.get('type', '')
                        })
                        
                        # Track reverse mapping (stakeholder -> policies)
                        if stakeholder_id not in stakeholder_to_policies:
                            stakeholder_to_policies[stakeholder_id] = []
                        
                        stakeholder_to_policies[stakeholder_id].append({
                            'policyName': policy['policyName'],
                            'policyFamily': policy.get('policyFamily', ''),
                            'policyType': policy.get('policyType', ''),
                            'yearIntroduced': policy.get('yearIntroduced', ''),
                            'status': policy.get('status', '')
                        })
        
        # Add linked stakeholder information to policy
        policy['linkedStakeholderIds'] = linked_stakeholder_ids
        policy['linkedStakeholderProfiles'] = linked_stakeholder_details
    
    return stakeholder_to_policies


def process_policy_csv():
    """Process the policy CSV file - 17 fields only, camelCase"""
    policies = []
    
    filepath = DATA_DIR / POLICY_CSV
    
    if not filepath.exists():
        print(f"✗ Error: Policy CSV not found at {filepath}")
        return []
    
    print(f"Processing: {POLICY_CSV}")
    print()
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            # Read with cleaned column names (strip spaces)
            reader = csv.DictReader(f)
            reader.fieldnames = [name.strip() for name in reader.fieldnames]
            
            for row_number, row in enumerate(reader, 1):
                # Skip empty rows
                if not any(row.values()):
                    continue
                
                # Extract policy name
                name = row.get('Policy  Name', '').strip()
                if not name:
                    continue
                
                # Extract stakeholders from the CSV field and split by newlines
                stakeholders_raw = row.get('Stakeholders Impacted by the Policy', '').strip()
                stakeholders_list = split_list_items(stakeholders_raw, delimiter=';')
                
                # Extract value chain stages and split by newlines
                value_chain_raw = row.get('Value Chain Stage', '').strip()
                value_chain_list = split_list_items(value_chain_raw, delimiter=';')
                
                # Build policy object - ONLY 17 CSV fields in camelCase
                policy = {
                    'policyName': name,
                    'policyFamily': row.get('Policy Family / Cluster', '').strip(),
                    'policyType': row.get('Policy Type', '').strip(),
                    'yearIntroduced': row.get('Year Introduced', '').strip(),
                    'status': row.get('Status', '').strip(),
                    'jurisdiction': row.get('Jurisdiction', '').strip(),
                    'policySummary': clean_multiline_text(row.get('Policy Summary', '')),
                    'institutionalResponsibility': row.get('Institutional Responsibility', '').strip(),
                    'valueChainStage': value_chain_list,
                    'esgElements': row.get('ESG / Due Diligence Elements', '').strip(),
                    'governanceIssues': row.get('Governance & Political Economy Issues', '').strip(),
                    'implementationChallenges': row.get('Implementation Challenges', '').strip(),
                    'stakeholdersImpacted': stakeholders_raw,
                    'linkedStakeholders': stakeholders_list,
                    'reformPriority': row.get('Reform Priority', '').strip(),
                    'links': row.get('Links', '').strip(),
                    'sourceType': row.get('Source Type', '').strip(),
                    'lastVerified': row.get('Last Verified', '').strip()
                }
                
                policies.append(policy)
                
                # Print progress
                stakeholder_info = f" → {len(stakeholders_list)} stakeholders" if stakeholders_list else ""
                print(f"  ✓ [{row_number:2d}] {name[:50]}{stakeholder_info}")
        
        return policies
        
    except Exception as e:
        print(f"✗ Error processing CSV: {e}")
        import traceback
        traceback.print_exc()
        return []


def generate_statistics(policies):
    """Generate statistics from policies"""
    stats = {
        'byFamily': {},
        'byType': {},
        'byYear': {},
        'byStatus': {},
        'byJurisdiction': {},
        'byStakeholder': {},
        'totalPolicies': len(policies),
        'policiesWithStakeholders': 0
    }
    
    for policy in policies:
        # Count by family
        family = policy['policyFamily'] or 'Uncategorized'
        stats['byFamily'][family] = stats['byFamily'].get(family, 0) + 1
        
        # Count by type
        ptype = policy['policyType'] or 'Uncategorized'
        stats['byType'][ptype] = stats['byType'].get(ptype, 0) + 1
        
        # Count by year
        year = policy['yearIntroduced'] or 'Unknown'
        stats['byYear'][year] = stats['byYear'].get(year, 0) + 1
        
        # Count by status
        status = policy['status'] or 'Unknown'
        stats['byStatus'][status] = stats['byStatus'].get(status, 0) + 1
        
        # Count by jurisdiction
        jurisdiction = policy['jurisdiction'] or 'Unknown'
        stats['byJurisdiction'][jurisdiction] = stats['byJurisdiction'].get(jurisdiction, 0) + 1
        
        # Count by stakeholder
        if policy['linkedStakeholders']:
            stats['policiesWithStakeholders'] += 1
            for stakeholder in policy['linkedStakeholders']:
                stats['byStakeholder'][stakeholder] = stats['byStakeholder'].get(stakeholder, 0) + 1
    
    return stats


def generate_stakeholder_links(policies):
    """Generate reverse index: stakeholder -> policies"""
    stakeholder_links = {}
    
    for policy in policies:
        for stakeholder in policy['linkedStakeholders']:
            if stakeholder not in stakeholder_links:
                stakeholder_links[stakeholder] = []
            
            stakeholder_links[stakeholder].append({
                'policyName': policy['policyName'],
                'yearIntroduced': policy['yearIntroduced'],
                'policyType': policy['policyType'],
                'status': policy['status']
            })
    
    # Sort policies by year for each stakeholder
    for stakeholder in stakeholder_links:
        stakeholder_links[stakeholder].sort(key=lambda x: x['yearIntroduced'] or '', reverse=True)
    
    return stakeholder_links


def main():
    """Main processing function"""
    print("=" * 70)
    print("Policy Database - CSV to JSON Converter with Stakeholder Linking")
    print("=" * 70)
    print()
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load stakeholder database
    print("Loading stakeholder database...")
    stakeholder_database = load_stakeholder_database()
    print()
    
    # Process CSV
    policies = process_policy_csv()
    
    if not policies:
        print("\n✗ No policies processed. Exiting.")
        return
    
    print()
    print("-" * 70)
    
    # Link policies to stakeholders
    print("Linking policies to stakeholders...")
    policy_stakeholder_map = link_policies_to_stakeholders(policies, stakeholder_database)
    
    # Count successful links
    total_links = sum(len(policy.get('linkedStakeholderIds', [])) for policy in policies)
    print(f"✓ Created {total_links} policy-stakeholder links")
    print()
    
    # Generate statistics
    stats = generate_statistics(policies)
    
    # Generate stakeholder links (text-based, for backward compatibility)
    stakeholder_links = generate_stakeholder_links(policies)
    
    # Save master policies file
    master_data = {
        'metadata': {
            'totalPolicies': len(policies),
            'policiesWithStakeholders': stats['policiesWithStakeholders'],
            'uniqueStakeholders': len(stakeholder_links),
            'linkedToDatabase': total_links,
            'lastUpdated': datetime.now().strftime('%Y-%m-%d'),
            'source': 'Mining Policy Database CSV Import'
        },
        'statistics': stats,
        'policies': policies
    }
    
    master_file = OUTPUT_DIR / 'policies.json'
    with open(master_file, 'w', encoding='utf-8') as f:
        json.dump(master_data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved master file: policies.json")
    
    # Save policy-to-stakeholder database mapping
    db_mapping_file = OUTPUT_DIR / 'policy_to_stakeholder_database.json'
    with open(db_mapping_file, 'w', encoding='utf-8') as f:
        json.dump({
            'metadata': {
                'description': 'Maps stakeholder database IDs to related policies',
                'totalStakeholders': len(policy_stakeholder_map),
                'totalLinks': total_links,
                'lastUpdated': datetime.now().strftime('%Y-%m-%d')
            },
            'stakeholderPolicies': policy_stakeholder_map
        }, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved database mapping: policy_to_stakeholder_database.json")
    
    # Save stakeholder links file (text-based, for backward compatibility)
    stakeholder_file = OUTPUT_DIR / 'policy_stakeholder_links.json'
    with open(stakeholder_file, 'w', encoding='utf-8') as f:
        json.dump({
            'metadata': {
                'totalStakeholders': len(stakeholder_links),
                'totalPolicies': len(policies),
                'lastUpdated': datetime.now().strftime('%Y-%m-%d')
            },
            'links': stakeholder_links
        }, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved stakeholder links: policy_stakeholder_links.json")
    
    # Save statistics file
    stats_file = OUTPUT_DIR / 'policy_statistics.json'
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump({
            'metadata': {
                'generatedAt': datetime.now().isoformat(),
                'totalPolicies': len(policies)
            },
            'statistics': stats
        }, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved statistics: policy_statistics.json")
    
    print()
    print("=" * 70)
    print("Processing Complete!")
    print("=" * 70)
    print(f"Total policies:              {len(policies)}")
    print(f"Policies with stakeholders:  {stats['policiesWithStakeholders']}")
    print(f"Unique stakeholders linked:  {len(stakeholder_links)}")
    print()
    print("Statistics:")
    print(f"  Policy families:  {len(stats['byFamily'])}")
    print(f"  Policy types:     {len(stats['byType'])}")
    print(f"  Years covered:    {len(stats['byYear'])}")
    print(f"  Status types:     {len(stats['byStatus'])}")
    print()
    print(f"Output location: {OUTPUT_DIR}")
    print()
    print("Files created:")
    print("  1. policies.json                    (Master file with all policies)")
    print("  2. policy_stakeholder_links.json    (Reverse index: stakeholder → policies)")
    print("  3. policy_statistics.json           (Statistics and analytics)")
    print()
    
    # Show top stakeholders by policy count
    if stakeholder_links:
        print("Top Stakeholders by Policy Count:")
        sorted_stakeholders = sorted(stakeholder_links.items(), 
                                     key=lambda x: len(x[1]), reverse=True)
        for stakeholder, policy_list in sorted_stakeholders[:10]:
            print(f"  {stakeholder:15s} → {len(policy_list)} policies")
        print()


if __name__ == '__main__':
    main()
