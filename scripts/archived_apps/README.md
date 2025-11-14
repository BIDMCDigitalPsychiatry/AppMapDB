# Archived Apps Analysis

This folder contains the archived apps analysis script and all related generated files.

## Main Script
- `outputArchivedApps.js` - Main script for analyzing archived, approved, and never-approved apps

## Generated Files

### CSV Files (Data Exports)
- `approved_apps_[date].csv` - Apps currently showing approved versions on website
- `archived_apps_[date].csv` - Apps that previously had approved versions but are now archived. If an app is marked as archived, it is considered to be previously approved at one point.  The approved field can be set or unset when a user archives a record, so this field is un-reliable in determining the previously approved status.
- `never_approved_apps_[date].csv` - Apps that have never had any approved versions

### Analysis Files
- `archived_apps_analysis_[date].json` - Comprehensive analysis data with metadata and app details
- `database_dump_[date].json` - Complete database snapshot (cached for performance)

## Usage

To run the analysis:

```bash
cd scripts/archived_apps
node outputArchivedApps.js
```

## Features

- **Smart Caching**: Uses cached database dumps to improve performance on subsequent runs
- **Three-way Categorization**: Separates apps into approved, archived, and never-approved
- **Comprehensive Reporting**: Generates detailed CSV files and analysis JSON
- **Data Verification**: Mathematical verification ensures all apps are properly categorized

## Output Summary

The script generates:
1. Console summary with counts and top 10 lists for each category
2. Three CSV files for different app categories
3. JSON analysis file with detailed metadata
4. Database dump for caching (reused if run same day)

## Safety

This is a **READ-ONLY** script that only analyzes data and generates reports. No database modifications are performed.
