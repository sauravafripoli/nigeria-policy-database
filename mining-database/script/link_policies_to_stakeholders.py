#!/usr/bin/env python3
"""
Link Policies to Stakeholders
Maps policies from policy-stakeholder links to individual stakeholders based on their categories.
"""

import json
import sys
from pathlib import Path

# Category mapping from stakeholder categories to policy link categories
CATEGORY_MAPPING = {
    'Federal Government': ['Federal Government', 'Federal govt, private sector, downstream producers', 'Government, companies, civil society'],
    'State Agencies': ['State Governments', 'local communities, state agencies', 'Investors, NGSA, state govts', 'States, communities, ASM', 'Communities, companies, state govts'],
    'MMSD Offices': ['Federal Government', 'Communities, miners, regulators'],
    'Mining Companies': ['Mining Companies and Investors', 'Investors, Mining Companies, ASM,', 'Federal govt, private sector, downstream producers', 'Investors, MDAs, communities', 'Communities, companies, state govts'],
    'Mining Consultancies': ['Mining Companies and Investors', 'Investors, Mining Companies, ASM,', 'Researchers, investors, states'],
    'Artisanal Miners': ['Miners and Artisanal Miners', 'Investors, Mining Companies, ASM,', 'ASM miners, communities, security agencies', 'States, communities, ASM'],
    'Associations': ['Mining Companies and Investors', 'Investors, MDAs, communities', 'Government, companies, civil society'],
    'State Companies': ['State Governments', 'Federal govt, private sector, downstream producers', 'Communities, companies, state govts'],
    'Infrastructure': ['Federal govt, private sector, downstream producers', 'Investors, MDAs, communities'],
    'NGOs': ['Local Communities', 'Communities, miners, regulators', 'Government, companies, civil society', 'Communities, companies, state govts'],
    'Civil Society': ['Local Communities', 'Communities, miners, regulators', 'Government, companies, civil society', 'ASM miners, communities, security agencies'],
    'Donors': ['Investors, MDAs, communities', 'Government, companies, civil society'],
    'Training Institutes': ['Researchers, investors, states', 'Investors, MDAs, communities'],
    'Universities': ['Researchers, investors, states', 'Investors, MDAs, communities']
}

def load_json(file_path):
    """Load JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, file_path):
    """Save JSON file."""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_policies_for_category(category, policy_links):
    """Get all policies applicable to a stakeholder category."""
    policies = []
    
    # Get matching policy link categories for this stakeholder category
    matching_categories = CATEGORY_MAPPING.get(category, [])
    
    # Collect all policies from matching categories
    for link_category in matching_categories:
        if link_category in policy_links['links']:
            policies.extend(policy_links['links'][link_category])
    
    # Remove duplicates based on policy name
    unique_policies = []
    seen_names = set()
    for policy in policies:
        if policy['policyName'] not in seen_names:
            unique_policies.append(policy)
            seen_names.add(policy['policyName'])
    
    return unique_policies

def main():
    # Define paths
    base_dir = Path(__file__).parent.parent
    stakeholders_file = base_dir / 'data' / 'processed' / 'all_stakeholders.json'
    policy_links_file = base_dir.parent / 'policy-database' / 'data' / 'processed' / 'policy_stakeholder_links.json'
    output_file = base_dir / 'data' / 'processed' / 'all_stakeholders.json'
    
    print(f"Loading stakeholders from: {stakeholders_file}")
    print(f"Loading policy links from: {policy_links_file}")
    
    # Load data
    stakeholders_data = load_json(stakeholders_file)
    policy_links = load_json(policy_links_file)
    
    # Process each stakeholder
    total_stakeholders = len(stakeholders_data['stakeholders'])
    stakeholders_with_policies = 0
    total_policy_links = 0
    
    for stakeholder in stakeholders_data['stakeholders']:
        category = stakeholder.get('category', '')
        
        # Get applicable policies for this category
        policies = get_policies_for_category(category, policy_links)
        
        if policies:
            stakeholder['relatedPolicies'] = policies
            stakeholders_with_policies += 1
            total_policy_links += len(policies)
        else:
            stakeholder['relatedPolicies'] = []
    
    # Update metadata
    stakeholders_data['metadata']['lastUpdated'] = '2026-03-11'
    stakeholders_data['metadata']['totalPolicyLinks'] = total_policy_links
    
    # Save updated data
    save_json(stakeholders_data, output_file)
    
    print(f"\n✅ Policy linking complete!")
    print(f"📊 Statistics:")
    print(f"   - Total stakeholders: {total_stakeholders}")
    print(f"   - Stakeholders with policies: {stakeholders_with_policies}")
    print(f"   - Total policy links created: {total_policy_links}")
    print(f"   - Average policies per stakeholder: {total_policy_links / total_stakeholders:.1f}")
    print(f"\n💾 Updated file saved to: {output_file}")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
