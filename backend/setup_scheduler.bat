@echo off
REM Setup Windows Task Scheduler for Life Dashboard bi-weekly processing
REM Run this script as Administrator to create the scheduled task

echo Setting up Life Dashboard bi-weekly processing...

REM Get the current directory
set SCRIPT_DIR=%~dp0
set PYTHON_SCRIPT=%SCRIPT_DIR%scheduled_runner.py

REM Create the scheduled task
REM Runs every 2 weeks on Monday at 9 AM
schtasks /create /tn "LifeDashboard-BiWeekly" /tr "python \"%PYTHON_SCRIPT%\"" /sc weekly /mo 2 /d MON /st 09:00 /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Task "LifeDashboard-BiWeekly" has been created.
    echo It will run every 2 weeks on Monday at 9 AM.
    echo.
    echo To view or modify: Open Task Scheduler and look for "LifeDashboard-BiWeekly"
    echo To run manually: schtasks /run /tn "LifeDashboard-BiWeekly"
    echo To delete: schtasks /delete /tn "LifeDashboard-BiWeekly" /f
) else (
    echo.
    echo FAILED to create the scheduled task.
    echo Make sure you're running this script as Administrator.
)

pause
