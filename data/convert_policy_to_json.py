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
    """Split text into list items"""
    if not text:
        return []
    
    # Clean the text first
    text = clean_multiline_text(text)
    
    # Split by delimiter
    items = [item.strip() for item in text.split(delimiter) if item.strip()]
    
    return items


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
                
                # Extract stakeholders from the CSV field and split by semicolon
                stakeholders_raw = row.get('Stakeholders Impacted by the Policy', '').strip()
                stakeholders_list = split_list_items(stakeholders_raw, delimiter=';')
                
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
                    'valueChainStage': row.get('Value Chain Stage', '').strip(),
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
    print("Policy Database - CSV to JSON Converter")
    print("=" * 70)
    print()
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Process CSV
    policies = process_policy_csv()
    
    if not policies:
        print("\n✗ No policies processed. Exiting.")
        return
    
    print()
    print("-" * 70)
    
    # Generate statistics
    stats = generate_statistics(policies)
    
    # Generate stakeholder links
    stakeholder_links = generate_stakeholder_links(policies)
    
    # Save master policies file
    master_data = {
        'metadata': {
            'totalPolicies': len(policies),
            'policiesWithStakeholders': stats['policiesWithStakeholders'],
            'uniqueStakeholders': len(stakeholder_links),
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
    
    # Save stakeholder links file
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
