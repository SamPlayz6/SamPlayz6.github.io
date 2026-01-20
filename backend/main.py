#!/usr/bin/env python3
"""
Life Dashboard Processing Script

This script:
1. Scans your Obsidian vault for recent notes
2. Fetches your GitHub activity
3. Processes manual entries
4. Sends everything to Claude for analysis
5. Updates the JSON data files
6. Optionally commits and pushes changes

Run this bi-weekly (or whenever you want fresh data).
"""

import argparse
from datetime import datetime
import subprocess
import sys

from config import DATA_DIR, DAYS_TO_LOOK_BACK
from obsidian_reader import get_notes_summary
from github_fetcher import get_github_summary
from claude_analyzer import analyze_life_data, validate_analysis
from data_manager import (
    get_quadrants,
    update_quadrants,
    get_right_now,
    update_right_now,
    add_timeline_entries,
    get_manual_entries,
    mark_manual_entries_processed,
    get_metadata,
    update_metadata,
    get_goals,
    update_goals,
    add_inspiration_items,
)


def process_life_data(days: int = DAYS_TO_LOOK_BACK, dry_run: bool = False) -> bool:
    """
    Main processing function.

    Args:
        days: Number of days to look back
        dry_run: If True, don't write any files

    Returns:
        bool: True if successful
    """
    print(f"\n{'='*50}")
    print(f"Life Dashboard Processing - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"Looking back {days} days")
    print(f"{'='*50}\n")

    # Step 1: Gather data
    print("Step 1: Gathering data...")

    print("  - Scanning Obsidian vault...")
    notes_summary = get_notes_summary()
    print(f"    Found {notes_summary['total_notes']} recent notes")

    print("  - Fetching GitHub activity...")
    github_summary = get_github_summary()
    print(f"    Found {github_summary.get('commits', 0)} commits")

    print("  - Loading manual entries...")
    manual_entries = get_manual_entries()
    unprocessed = [e for e in manual_entries if not e.get('processed', False)]
    print(f"    Found {len(unprocessed)} unprocessed entries")

    print("  - Loading current quadrants...")
    current_quadrants = get_quadrants()
    print(f"    Loaded {len(current_quadrants)} quadrants")

    # Step 2: Analyze with Claude
    print("\nStep 2: Analyzing with Claude...")
    analysis = analyze_life_data(
        notes_summary,
        github_summary,
        unprocessed,
        current_quadrants,
        days
    )

    if not analysis:
        print("  ERROR: Analysis failed!")
        return False

    if not validate_analysis(analysis):
        print("  ERROR: Analysis validation failed!")
        return False

    print("  Analysis complete!")

    # Step 3: Update data files
    if dry_run:
        print("\nStep 3: DRY RUN - not updating files")
        print(f"  Would add {len(analysis.get('timeline_entries', []))} timeline entries")
        print(f"  Would update right_now with: {analysis['right_now'].get('summary', '')[:50]}...")
        return True

    print("\nStep 3: Updating data files...")

    # Update timeline
    timeline_entries = analysis.get('timeline_entries', [])
    if timeline_entries:
        print(f"  - Adding {len(timeline_entries)} timeline entries...")
        add_timeline_entries(timeline_entries)

    # Update quadrants
    quadrant_updates = analysis.get('quadrant_updates', {})
    if quadrant_updates:
        print("  - Updating quadrants...")
        for key, updates in quadrant_updates.items():
            if key in current_quadrants:
                current_quadrants[key].update(updates)
        update_quadrants(current_quadrants)

    # Update right_now
    right_now = analysis.get('right_now', {})
    if right_now:
        print("  - Updating right_now snapshot...")
        right_now['weekOf'] = datetime.now().strftime('%Y-%m-%d')
        right_now['lastUpdated'] = datetime.now().isoformat()
        right_now['quadrantStatuses'] = {
            k: v.get('status', 'needs_attention')
            for k, v in quadrant_updates.items()
        }
        update_right_now(right_now)

    # Update goals if extracted
    extracted_goals = analysis.get('extracted_goals', [])
    if extracted_goals:
        print(f"  - Processing {len(extracted_goals)} extracted goals...")
        current_goals = get_goals()
        for goal in extracted_goals:
            if goal.get('timeframe') == 'far':
                # Check if already exists
                if not any(g['text'] == goal['text'] for g in current_goals['farFuture']):
                    current_goals['farFuture'].append({
                        'id': goal['id'],
                        'text': goal['text'],
                        'category': goal.get('category'),
                        'completed': False,
                        'createdAt': datetime.now().strftime('%Y-%m-%d'),
                    })
            else:
                if not any(g['text'] == goal['text'] for g in current_goals['nearFuture']):
                    current_goals['nearFuture'].append({
                        'id': goal['id'],
                        'text': goal['text'],
                        'category': goal.get('category'),
                        'completed': False,
                        'progress': 0,
                        'createdAt': datetime.now().strftime('%Y-%m-%d'),
                    })
        update_goals(current_goals)

    # Add inspiration items
    inspiration_items = analysis.get('extracted_inspiration', [])
    if inspiration_items:
        print(f"  - Adding {len(inspiration_items)} inspiration items...")
        for item in inspiration_items:
            item['addedAt'] = datetime.now().strftime('%Y-%m-%d')
        add_inspiration_items(inspiration_items)

    # Mark manual entries as processed
    if unprocessed:
        print("  - Marking manual entries as processed...")
        mark_manual_entries_processed([e['id'] for e in unprocessed])

    # Update metadata
    print("  - Updating metadata...")
    metadata = get_metadata()
    metadata['lastProcessed'] = datetime.now().isoformat()
    metadata['totalEntriesProcessed'] = metadata.get('totalEntriesProcessed', 0) + len(timeline_entries)
    update_metadata(metadata)

    print("\nProcessing complete!")
    return True


def git_commit_and_push():
    """Commit changes and push to remote."""
    try:
        print("\nCommitting changes to git...")

        # Add data files
        subprocess.run(['git', 'add', 'data/'], check=True, cwd=DATA_DIR.parent)

        # Commit
        commit_message = f"Update life dashboard data - {datetime.now().strftime('%Y-%m-%d')}"
        subprocess.run(
            ['git', 'commit', '-m', commit_message],
            check=True,
            cwd=DATA_DIR.parent
        )

        print("Changes committed!")

        # Push (optional)
        # subprocess.run(['git', 'push'], check=True, cwd=DATA_DIR.parent)
        # print("Changes pushed!")

    except subprocess.CalledProcessError as e:
        print(f"Git operation failed: {e}")


def main():
    parser = argparse.ArgumentParser(description='Process life dashboard data')
    parser.add_argument(
        '--days',
        type=int,
        default=DAYS_TO_LOOK_BACK,
        help=f'Number of days to look back (default: {DAYS_TO_LOOK_BACK})'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Run analysis but don\'t update files'
    )
    parser.add_argument(
        '--commit',
        action='store_true',
        help='Commit changes to git after processing'
    )

    args = parser.parse_args()

    success = process_life_data(days=args.days, dry_run=args.dry_run)

    if success and args.commit and not args.dry_run:
        git_commit_and_push()

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
