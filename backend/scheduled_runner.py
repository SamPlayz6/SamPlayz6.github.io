#!/usr/bin/env python3
"""
Scheduled runner for Life Dashboard processing.

This script can be run:
1. Manually: python scheduled_runner.py
2. Windows Task Scheduler: Create a task that runs this script bi-weekly
3. Cron (WSL/Linux): 0 9 1,15 * * /path/to/python /path/to/scheduled_runner.py

The script will:
- Run the main processing pipeline
- Log results to a file
- Send a notification if configured
"""

import logging
import sys
from datetime import datetime
from pathlib import Path

# Set up logging
log_dir = Path(__file__).parent.parent / 'data' / 'logs'
log_dir.mkdir(exist_ok=True)

log_file = log_dir / f'processing_{datetime.now().strftime("%Y-%m-%d_%H-%M")}.log'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


def run_processing():
    """Run the main processing pipeline."""
    logger.info("=" * 50)
    logger.info("Starting Life Dashboard bi-weekly processing")
    logger.info("=" * 50)

    try:
        # Import and run main processing
        from main import main
        success = main()

        if success:
            logger.info("Processing completed successfully!")
            return True
        else:
            logger.error("Processing failed - check logs for details")
            return False

    except Exception as e:
        logger.exception(f"Critical error during processing: {e}")
        return False


def check_last_run():
    """Check when the last successful run was."""
    metadata_file = Path(__file__).parent.parent / 'data' / 'metadata.json'

    if metadata_file.exists():
        import json
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
            last_run = metadata.get('lastProcessed')
            if last_run:
                logger.info(f"Last successful run: {last_run}")
                return last_run
    return None


def main():
    """Main entry point."""
    logger.info(f"Script started at {datetime.now().isoformat()}")

    # Check last run
    last_run = check_last_run()

    # Run processing
    success = run_processing()

    # Summary
    if success:
        logger.info("=" * 50)
        logger.info("SUMMARY: Processing completed successfully")
        logger.info(f"Log saved to: {log_file}")
        logger.info("=" * 50)
    else:
        logger.error("=" * 50)
        logger.error("SUMMARY: Processing failed")
        logger.error(f"Check log file: {log_file}")
        logger.error("=" * 50)

    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
