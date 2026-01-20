"""Configuration for the Life Dashboard backend processing."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env.local in project root
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env.local')

# Paths
OBSIDIAN_VAULT_PATH = os.getenv('OBSIDIAN_VAULT_PATH', '')
DATA_DIR = project_root / 'data'

# API Keys
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', '')
GITHUB_USERNAME = 'SamPlayz6'

# Processing settings
DAYS_TO_LOOK_BACK = 14  # How many days of notes to process

# Your values (used in Claude analysis)
YOUR_VALUES = [
    "Enjoying life",
    "Being good to people",
    "Physical development through movement",
    "Innovation and building things",
    "Travel and new experiences",
    "Learning (especially Japanese)",
]

# Quadrant definitions
QUADRANTS = {
    'relationships': {
        'name': 'Relationships',
        'color': '#FF6B6B',
        'tags': ['relationships', 'friends', 'family', 'social', 'connection'],
    },
    'parkour': {
        'name': 'Parkour',
        'color': '#4ECDC4',
        'tags': ['parkour', 'training', 'movement', 'fitness', 'exercise'],
    },
    'work': {
        'name': 'Work & Innovation',
        'color': '#9B59B6',
        'tags': ['work', 'startup', 'coding', 'project', 'ignite', 'development'],
    },
    'travel': {
        'name': 'Travel & Adventure',
        'color': '#F9CA24',
        'tags': ['travel', 'trip', 'adventure', 'japan', 'japanese', 'language'],
    },
}
