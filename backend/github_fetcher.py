"""Fetch GitHub activity for life dashboard analysis."""

import requests
from datetime import datetime, timedelta
from typing import Optional

from config import GITHUB_TOKEN, GITHUB_USERNAME, DAYS_TO_LOOK_BACK


def get_github_events(username: str = GITHUB_USERNAME, days: int = DAYS_TO_LOOK_BACK) -> list[dict]:
    """
    Fetch recent GitHub events for a user.

    Args:
        username: GitHub username
        days: Number of days to look back

    Returns:
        list: Recent GitHub events
    """
    headers = {}
    if GITHUB_TOKEN:
        headers['Authorization'] = f'token {GITHUB_TOKEN}'
        headers['Accept'] = 'application/vnd.github.v3+json'

    url = f'https://api.github.com/users/{username}/events/public'

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        events = response.json()

        # Filter to recent events
        cutoff = datetime.now() - timedelta(days=days)
        recent_events = []

        for event in events:
            event_time = datetime.fromisoformat(event['created_at'].replace('Z', '+00:00'))
            if event_time.replace(tzinfo=None) >= cutoff:
                recent_events.append(event)

        return recent_events
    except Exception as e:
        print(f"Error fetching GitHub events: {e}")
        return []


def get_commit_count(events: list[dict]) -> int:
    """Count total commits from push events."""
    count = 0
    for event in events:
        if event['type'] == 'PushEvent':
            count += len(event.get('payload', {}).get('commits', []))
    return count


def get_active_repos(events: list[dict]) -> list[str]:
    """Get list of repositories with activity."""
    repos = set()
    for event in events:
        repo = event.get('repo', {}).get('name', '')
        if repo:
            # Remove username prefix
            repos.add(repo.split('/')[-1])
    return sorted(repos)


def get_commit_messages(events: list[dict], limit: int = 10) -> list[str]:
    """Extract recent commit messages."""
    messages = []
    for event in events:
        if event['type'] == 'PushEvent':
            for commit in event.get('payload', {}).get('commits', []):
                messages.append(commit.get('message', ''))
                if len(messages) >= limit:
                    return messages
    return messages


def calculate_coding_streak(events: list[dict]) -> int:
    """
    Calculate the current coding streak (consecutive days with commits).
    """
    if not events:
        return 0

    # Get unique dates with activity
    activity_dates = set()
    for event in events:
        if event['type'] == 'PushEvent':
            date = datetime.fromisoformat(event['created_at'].replace('Z', '+00:00')).date()
            activity_dates.add(date)

    if not activity_dates:
        return 0

    # Count streak from today backwards
    today = datetime.now().date()
    streak = 0
    current_date = today

    while current_date in activity_dates or (current_date == today and today not in activity_dates):
        if current_date in activity_dates:
            streak += 1
        elif current_date != today:
            break
        current_date -= timedelta(days=1)

    return streak


def get_github_summary() -> dict:
    """
    Get a complete summary of GitHub activity for analysis.

    Returns:
        dict: Summary of GitHub activity
    """
    events = get_github_events()

    if not events:
        return {
            'has_activity': False,
            'commits': 0,
            'repos': [],
            'streak': 0,
            'recent_messages': [],
            'events_count': 0,
        }

    return {
        'has_activity': True,
        'commits': get_commit_count(events),
        'repos': get_active_repos(events),
        'streak': calculate_coding_streak(events),
        'recent_messages': get_commit_messages(events),
        'events_count': len(events),
    }


if __name__ == '__main__':
    # Test the fetcher
    print(f"Fetching GitHub activity for {GITHUB_USERNAME}...")
    summary = get_github_summary()
    print(f"Activity found: {summary['has_activity']}")
    print(f"Commits: {summary['commits']}")
    print(f"Active repos: {summary['repos']}")
    print(f"Current streak: {summary['streak']} days")
    print(f"Recent messages: {summary['recent_messages'][:3]}")
