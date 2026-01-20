"""Read and parse notes from an Obsidian vault."""

import os
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Generator
import frontmatter

from config import OBSIDIAN_VAULT_PATH, DAYS_TO_LOOK_BACK


def get_journal_entries(days: int = DAYS_TO_LOOK_BACK) -> list[dict]:
    """
    Get recent journal entries from the _Journal folder.
    These are prioritized for mood/thought tracking.
    """
    vault_path = Path(OBSIDIAN_VAULT_PATH)
    journal_path = vault_path / "_Journal"

    if not journal_path.exists():
        print(f"Warning: Journal folder not found at {journal_path}")
        return []

    entries = []
    cutoff_date = datetime.now() - timedelta(days=days)

    for file in journal_path.glob("*.md"):
        try:
            mod_time = datetime.fromtimestamp(file.stat().st_mtime)

            # Parse filename as date (YYYY-MM-DD.md format)
            date_match = re.match(r'(\d{4}-\d{2}-\d{2})\.md', file.name)
            entry_date = None
            if date_match:
                try:
                    entry_date = datetime.strptime(date_match.group(1), '%Y-%m-%d')
                except ValueError:
                    entry_date = mod_time
            else:
                entry_date = mod_time

            # Include if recently modified OR if the entry date is recent
            if mod_time < cutoff_date and (entry_date is None or entry_date < cutoff_date):
                continue

            note = frontmatter.load(file)

            entries.append({
                'path': str(file),
                'filename': file.name,
                'content': note.content,
                'frontmatter': dict(note.metadata),
                'modified': mod_time.isoformat(),
                'entry_date': entry_date.isoformat() if entry_date else mod_time.isoformat(),
                'is_journal': True,
                'source': 'journal',
            })
        except Exception as e:
            print(f"Error reading journal {file}: {e}")
            continue

    # Sort by entry date, most recent first
    entries.sort(key=lambda x: x['entry_date'], reverse=True)
    return entries


def get_recent_notes(days: int = DAYS_TO_LOOK_BACK) -> Generator[dict, None, None]:
    """
    Scan the Obsidian vault for notes modified in the last N days.
    Excludes _Journal folder (handled separately).

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
        # Skip hidden directories, Obsidian config, and _Journal (handled separately)
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != '_Journal']

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
                    'is_journal': False,
                    'source': 'notes',
                }
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                continue


def get_all_notes_for_initial_scan() -> list[dict]:
    """
    Get ALL notes in the vault for initial data extraction.
    Used for the one-time comprehensive scan.
    Returns notes sorted by modification time (most recent first).
    """
    vault_path = Path(OBSIDIAN_VAULT_PATH)

    if not vault_path.exists():
        print(f"Warning: Obsidian vault not found at {vault_path}")
        return []

    all_notes = []

    for root, dirs, files in os.walk(vault_path):
        # Skip hidden directories and Obsidian config
        dirs[:] = [d for d in dirs if not d.startswith('.')]

        for file in files:
            if not file.endswith('.md'):
                continue

            file_path = Path(root) / file

            try:
                mod_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                note = frontmatter.load(file_path)

                # Determine source
                is_journal = '_Journal' in str(file_path)
                is_area = '_Areas' in str(file_path)

                all_notes.append({
                    'path': str(file_path),
                    'filename': file,
                    'content': note.content,
                    'frontmatter': dict(note.metadata),
                    'modified': mod_time.isoformat(),
                    'is_journal': is_journal,
                    'is_area': is_area,
                    'source': 'journal' if is_journal else ('area' if is_area else 'notes'),
                })
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                continue

    # Sort by modification time, most recent first
    all_notes.sort(key=lambda x: x['modified'], reverse=True)
    return all_notes


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
    content = note.get('content', '')
    inline_tags = re.findall(r'#(\w+)', content)
    tags.extend(inline_tags)

    return list(set(tag.lower() for tag in tags))


def extract_people(content: str) -> list[str]:
    """
    Extract people mentions from note content.
    Looks for patterns like @Name or [[Name]] (Obsidian links).
    Also looks for common name patterns in Sam's notes.
    """
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

    # Known people patterns from Sam's notes
    known_patterns = [
        r'\b(Ula|Ulka)\b',
        r'\b(Damien|Eamon|Marco|James|Micheal|Tom|Kay|Ruth|Killian|Jayden)\b',
        r'\b(Sam O\'Neill)\b',
    ]
    for pattern in known_patterns:
        matches = re.findall(pattern, content)
        people.extend(matches)

    return list(set(people))


def categorize_note(note: dict) -> str | None:
    """
    Determine which quadrant a note belongs to based on content keywords.
    Uses a smarter content-based approach since Sam doesn't use explicit tags.
    Returns the quadrant key or None if uncategorized.
    """
    content = note.get('content', '').lower()
    filename = note.get('filename', '').lower()

    # Keyword-based categorization
    quadrant_keywords = {
        'work': [
            'startup', 'maupka', 'ignite', 'company', 'business', 'pilot',
            'customers', 'product', 'building', 'coding', 'enterprise',
            'funding', 'grant', 'revenue', 'marketing', 'sales', 'investor',
            'tyndall', 'research', 'argyou', 'edtech', 'teacher', 'student'
        ],
        'parkour': [
            'parkour', 'training', 'vaults', 'kong', 'handspring', 'movement',
            'exercise', 'workout', 'calisthenics', 'fitness', 'dive roll',
            'turn vault', 'helicoptero', 'planche', 'pullup', 'pistol squat'
        ],
        'relationships': [
            'ula', 'ulka', 'friends', 'family', 'social', 'lunch with',
            'meeting with', 'talked to', 'couple', 'relationship'
        ],
        'travel': [
            'japan', 'japanese', 'tokyo', 'mext', 'travel', 'trip',
            'abroad', 'language learning', 'n2', 'n3', 'anki', 'japanese language'
        ],
    }

    scores = {key: 0 for key in quadrant_keywords}

    for quadrant, keywords in quadrant_keywords.items():
        for keyword in keywords:
            if keyword in content or keyword in filename:
                scores[quadrant] += 1

    # Return quadrant with highest score if above threshold
    max_quadrant = max(scores, key=scores.get)
    if scores[max_quadrant] >= 2:
        return max_quadrant

    return None


def analyze_mood_from_journal(content: str) -> dict:
    """
    Extract mood indicators from journal content.
    Returns mood analysis dict.
    """
    content_lower = content.lower()

    # Positive indicators
    positive_words = [
        'excited', 'great', 'amazing', 'happy', 'good', 'fantastic',
        'love', 'awesome', 'wonderful', 'progress', 'success', 'achieved',
        'fun', 'enjoying', 'productive'
    ]

    # Negative/stress indicators
    stress_words = [
        'worried', 'stressed', 'anxious', 'overwhelmed', 'tired',
        'frustrated', 'stuck', 'difficult', 'hard', 'problem',
        'behind', 'overdoing', 'burned', 'struggle'
    ]

    # Balance indicators
    balance_words = [
        'balance', 'rest', 'chill', 'relax', 'break', 'free time',
        'living', 'enjoying life'
    ]

    positive_count = sum(1 for word in positive_words if word in content_lower)
    stress_count = sum(1 for word in stress_words if word in content_lower)
    balance_count = sum(1 for word in balance_words if word in content_lower)

    # Calculate mood score (-1 to 1)
    total = positive_count + stress_count + 1  # +1 to avoid division by zero
    mood_score = (positive_count - stress_count) / total

    if mood_score > 0.3:
        mood = 'energized'
    elif mood_score < -0.3:
        mood = 'stressed'
    else:
        mood = 'balanced'

    return {
        'mood': mood,
        'mood_score': round(mood_score, 2),
        'positive_signals': positive_count,
        'stress_signals': stress_count,
        'balance_signals': balance_count,
    }


def get_notes_summary() -> dict:
    """
    Get a summary of recent notes for analysis.
    Combines journal entries and other notes, prioritizing journals.

    Returns:
        dict: Summary including all notes text, categorized notes, and metadata
    """
    # Get journal entries first (high priority)
    journal_entries = get_journal_entries()

    # Get other recent notes
    other_notes = list(get_recent_notes())

    # Combine with journals first
    all_notes = journal_entries + other_notes

    if not all_notes:
        return {
            'total_notes': 0,
            'journal_entries': 0,
            'other_notes': 0,
            'notes': [],
            'by_category': {},
            'all_people': [],
            'all_tags': [],
            'mood_analysis': None,
        }

    all_people = []
    all_tags = []
    by_category = {'relationships': [], 'parkour': [], 'work': [], 'travel': [], 'uncategorized': []}

    # Analyze mood from recent journals
    mood_analysis = None
    if journal_entries:
        combined_journal_content = '\n'.join(j['content'] for j in journal_entries[:5])
        mood_analysis = analyze_mood_from_journal(combined_journal_content)

    for note in all_notes:
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
        'total_notes': len(all_notes),
        'journal_entries': len(journal_entries),
        'other_notes': len(other_notes),
        'notes': all_notes,
        'by_category': by_category,
        'all_people': list(set(all_people)),
        'all_tags': list(set(all_tags)),
        'mood_analysis': mood_analysis,
    }


if __name__ == '__main__':
    # Test the reader
    print(f"Scanning vault at: {OBSIDIAN_VAULT_PATH}")
    summary = get_notes_summary()
    print(f"Found {summary['total_notes']} recent notes")
    print(f"  - Journal entries: {summary['journal_entries']}")
    print(f"  - Other notes: {summary['other_notes']}")
    print(f"People mentioned: {summary['all_people']}")
    print(f"Tags found: {summary['all_tags']}")
    if summary['mood_analysis']:
        print(f"Mood analysis: {summary['mood_analysis']}")
    for category, notes in summary['by_category'].items():
        print(f"  {category}: {len(notes)} notes")
