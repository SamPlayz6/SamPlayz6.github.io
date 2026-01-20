"""Read and parse notes from an Obsidian vault."""

import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Generator
import frontmatter

from config import OBSIDIAN_VAULT_PATH, DAYS_TO_LOOK_BACK


def get_recent_notes(days: int = DAYS_TO_LOOK_BACK) -> Generator[dict, None, None]:
    """
    Scan the Obsidian vault for notes modified in the last N days.

    Yields:
        dict: Note data including path, content, frontmatter, and modification time
    """
    vault_path = Path(OBSIDIAN_VAULT_PATH)

    if not vault_path.exists():
        print(f"Warning: Obsidian vault not found at {vault_path}")
        return

    cutoff_date = datetime.now() - timedelta(days=days)

    # Walk through all markdown files
    for root, dirs, files in os.walk(vault_path):
        # Skip hidden directories and Obsidian config
        dirs[:] = [d for d in dirs if not d.startswith('.')]

        for file in files:
            if not file.endswith('.md'):
                continue

            file_path = Path(root) / file

            # Check modification time
            mod_time = datetime.fromtimestamp(file_path.stat().st_mtime)
            if mod_time < cutoff_date:
                continue

            try:
                # Parse the note
                note = frontmatter.load(file_path)

                yield {
                    'path': str(file_path),
                    'filename': file,
                    'content': note.content,
                    'frontmatter': dict(note.metadata),
                    'modified': mod_time.isoformat(),
                }
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                continue


def extract_tags(note: dict) -> list[str]:
    """Extract tags from a note (from frontmatter and inline tags)."""
    tags = []

    # From frontmatter
    fm = note.get('frontmatter', {})
    if 'tags' in fm:
        fm_tags = fm['tags']
        if isinstance(fm_tags, list):
            tags.extend(fm_tags)
        elif isinstance(fm_tags, str):
            tags.append(fm_tags)

    # From content (inline tags like #tag)
    import re
    content = note.get('content', '')
    inline_tags = re.findall(r'#(\w+)', content)
    tags.extend(inline_tags)

    return list(set(tag.lower() for tag in tags))


def extract_people(content: str) -> list[str]:
    """
    Extract people mentions from note content.
    Looks for patterns like @Name or [[Name]] (Obsidian links).
    """
    import re

    people = []

    # @mentions
    at_mentions = re.findall(r'@(\w+)', content)
    people.extend(at_mentions)

    # [[Wikilinks]] that look like names (capitalized, not too long)
    wikilinks = re.findall(r'\[\[([^\]]+)\]\]', content)
    for link in wikilinks:
        # Simple heuristic: if it's 1-3 words, all capitalized first letters, it might be a name
        words = link.split()
        if 1 <= len(words) <= 3 and all(w[0].isupper() for w in words if w):
            people.append(link)

    return list(set(people))


def categorize_note(note: dict) -> str | None:
    """
    Determine which quadrant a note belongs to based on tags.
    Returns the quadrant key or None if uncategorized.
    """
    from config import QUADRANTS

    tags = set(extract_tags(note))

    for quadrant_key, quadrant_info in QUADRANTS.items():
        quadrant_tags = set(tag.lower() for tag in quadrant_info['tags'])
        if tags & quadrant_tags:  # If there's any overlap
            return quadrant_key

    return None


def get_notes_summary() -> dict:
    """
    Get a summary of recent notes for analysis.

    Returns:
        dict: Summary including all notes text, categorized notes, and metadata
    """
    notes = list(get_recent_notes())

    if not notes:
        return {
            'total_notes': 0,
            'notes': [],
            'by_category': {},
            'all_people': [],
            'all_tags': [],
        }

    all_people = []
    all_tags = []
    by_category = {'relationships': [], 'parkour': [], 'work': [], 'travel': [], 'uncategorized': []}

    for note in notes:
        tags = extract_tags(note)
        people = extract_people(note['content'])
        category = categorize_note(note)

        note['extracted_tags'] = tags
        note['extracted_people'] = people
        note['category'] = category

        all_tags.extend(tags)
        all_people.extend(people)

        if category:
            by_category[category].append(note)
        else:
            by_category['uncategorized'].append(note)

    return {
        'total_notes': len(notes),
        'notes': notes,
        'by_category': by_category,
        'all_people': list(set(all_people)),
        'all_tags': list(set(all_tags)),
    }


if __name__ == '__main__':
    # Test the reader
    print(f"Scanning vault at: {OBSIDIAN_VAULT_PATH}")
    summary = get_notes_summary()
    print(f"Found {summary['total_notes']} recent notes")
    print(f"People mentioned: {summary['all_people']}")
    print(f"Tags found: {summary['all_tags']}")
    for category, notes in summary['by_category'].items():
        print(f"  {category}: {len(notes)} notes")
