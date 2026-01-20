"""Manage reading and writing JSON data files."""

import json
from pathlib import Path
from datetime import datetime
from typing import Any

from config import DATA_DIR


def read_json(filename: str) -> Any:
    """Read a JSON file from the data directory."""
    file_path = DATA_DIR / filename
    if not file_path.exists():
        return None
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def write_json(filename: str, data: Any) -> None:
    """Write data to a JSON file in the data directory."""
    file_path = DATA_DIR / filename
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_quadrants() -> dict:
    """Get the current quadrants data."""
    return read_json('quadrants.json') or {}


def update_quadrants(quadrants: dict) -> None:
    """Update the quadrants data."""
    write_json('quadrants.json', quadrants)


def get_right_now() -> dict:
    """Get the current 'right now' snapshot."""
    return read_json('right_now.json') or {}


def update_right_now(data: dict) -> None:
    """Update the 'right now' snapshot."""
    write_json('right_now.json', data)


def get_timeline() -> list:
    """Get the timeline entries."""
    return read_json('timeline.json') or []


def add_timeline_entries(entries: list) -> None:
    """Add new entries to the timeline."""
    timeline = get_timeline()

    # Avoid duplicates by checking IDs
    existing_ids = {e['id'] for e in timeline}
    new_entries = [e for e in entries if e['id'] not in existing_ids]

    timeline.extend(new_entries)

    # Sort by date descending
    timeline.sort(key=lambda x: x['date'], reverse=True)

    write_json('timeline.json', timeline)


def get_goals() -> dict:
    """Get the goals data."""
    return read_json('goals.json') or {'nearFuture': [], 'farFuture': []}


def update_goals(goals: dict) -> None:
    """Update the goals data."""
    write_json('goals.json', goals)


def get_inspiration() -> list:
    """Get inspiration items."""
    return read_json('inspiration.json') or []


def add_inspiration_items(items: list) -> None:
    """Add new inspiration items."""
    inspiration = get_inspiration()
    existing_ids = {i['id'] for i in inspiration}
    new_items = [i for i in items if i['id'] not in existing_ids]
    inspiration.extend(new_items)
    write_json('inspiration.json', inspiration)


def get_metadata() -> dict:
    """Get processing metadata."""
    return read_json('metadata.json') or {
        'lastProcessed': None,
        'lastNoteScanned': None,
        'totalEntriesProcessed': 0,
        'version': '1.0.0',
    }


def update_metadata(metadata: dict) -> None:
    """Update processing metadata."""
    write_json('metadata.json', metadata)


def get_manual_entries() -> list:
    """Get manual entries pending processing."""
    return read_json('manual_entries.json') or []


def mark_manual_entries_processed(entry_ids: list) -> None:
    """Mark manual entries as processed."""
    entries = get_manual_entries()
    for entry in entries:
        if entry['id'] in entry_ids:
            entry['processed'] = True
    write_json('manual_entries.json', entries)


def clear_processed_manual_entries() -> None:
    """Remove processed manual entries."""
    entries = get_manual_entries()
    unprocessed = [e for e in entries if not e.get('processed', False)]
    write_json('manual_entries.json', unprocessed)


if __name__ == '__main__':
    # Test the data manager
    print(f"Data directory: {DATA_DIR}")
    print(f"Quadrants: {list(get_quadrants().keys())}")
    print(f"Timeline entries: {len(get_timeline())}")
    print(f"Metadata: {get_metadata()}")
