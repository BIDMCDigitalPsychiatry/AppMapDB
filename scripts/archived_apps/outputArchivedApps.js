const AWS = require('aws-sdk');
const fs = require('fs');

// Configuration flags
const enableLocalDb = false; // Set to false to always download fresh data, true to use cached file if available

// ===================================================================
// 🔒 SAFETY NOTICE: READ-ONLY ANALYSIS SCRIPT
// ===================================================================
// This script ONLY READS data from the database for analysis.
// NO database modifications are performed.
// Operations used: dynamo.scan() ONLY
// Safe operations: Read, analyze, console output, CSV export
// ===================================================================

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:d6802415-4c63-433c-92f5-4a5c05756abe'
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = 'applications';

function isEmpty(str) {
  return !str || 0 === str.length;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

/**
 * Get all rows from DynamoDB table with progress indicator, or from cached file
 */
const getRows = async TableName => {
  const today = new Date().toISOString().split('T')[0];
  const dbFilename = `database_dump_${today}.json`;
  
  // Check if today's database dump already exists (only if local DB is enabled)
  if (enableLocalDb && fs.existsSync(dbFilename)) {
    console.log(`📁 Found existing database dump: ${dbFilename}`);
    console.log('📥 Loading data from cached file instead of downloading...');
    
    try {
      const fileContent = fs.readFileSync(dbFilename, 'utf8');
      const allRecords = JSON.parse(fileContent);
      console.log(`✅ Loaded ${allRecords.length} records from cached file\n`);
      
      // Convert array back to object format expected by the rest of the script
      return allRecords.reduce((f, c) => {
        f[c._id] = c;
        return f;
      }, {});
    } catch (error) {
      console.log(`❌ Error reading cached file: ${error.message}`);
      console.log('📥 Falling back to downloading from database...\n');
      // Continue with normal database download if file read fails
    }
  } else if (!enableLocalDb) {
    console.log('🔄 Local DB caching is disabled - downloading fresh data from database...\n');
  }
  
  console.log('📥 Downloading database snapshot...');
  let scanResults = [];
  let items;
  var params = {
    TableName,
    ExclusiveStartKey: undefined
  };
  
  do {
    items = await dynamo.scan(params).promise();
    items.Items.forEach(i => scanResults.push(i));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
    process.stdout.write(`\r   Downloaded ${scanResults.length} records...`);
  } while (typeof items.LastEvaluatedKey != 'undefined');
  
  console.log(`\n✅ Download complete: ${scanResults.length} total records`);
  
  // Save the downloaded data as JSON for future use
  console.log(`💾 Saving database dump as ${dbFilename} for future use...`);
  const dbJson = JSON.stringify(scanResults, null, 2);
  await fs.writeFileSync(dbFilename, dbJson);
  console.log(`✅ Database cached to: ${dbFilename}\n`);
  
  return scanResults.reduce((f, c) => {
    f[c._id] = c;
    return f;
  }, {});
};

/**
 * Generate CSV from data array
 */
const getCsv = (data, columns) => {
  var csv = '';
  data.forEach((row, i) => {
    if (i === 0) {
      csv += columns.map(name => `"${name ?? ''}"`).join(',') + '\r\n';
    }

    var rowData = row.getExportValues ? row.getExportValues() : row;

    csv +=
      columns
        .map(name => {
          var cell = (typeof (rowData[name] === 'object') ? JSON.stringify(rowData[name]) : rowData[name]) ?? '';
          const formatted = isEmpty(cell) ? cell : cell.replace(/["]+/g, ''); // Remove all double quotes
          return isEmpty(cell) ? '""' : `"${formatted}"`; // Wrap all values in double quotes to support commas within value
        })
        .join(',') + '\r\n';
  });
  return csv;
};

/**
 * Format date for display
 */
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Get app name using the same logic as the frontend
 */
const getAppName = (app) => {
  const androidStore = app?.androidStore;
  const appleStore = app?.appleStore;
  return !isEmpty(app?.name)
    ? app.name
    : androidStore && !isEmpty(androidStore.title)
    ? androidStore.title
    : appleStore && !isEmpty(appleStore.title)
    ? appleStore.title
    : app?.name || 'Unknown App';
};

/**
 * Get app company using the same logic as the frontend
 */
const getAppCompany = (app) => {
  const androidStore = app?.androidStore;
  const appleStore = app?.appleStore;
  return !isEmpty(app?.company)
    ? app.company
    : androidStore && !isEmpty(androidStore.developer)
    ? androidStore.developer
    : appleStore && !isEmpty(appleStore.developer)
    ? appleStore.developer
    : app?.company || '';
};

/**
 * Get app description for export (mimics getExportValues from selectors)
 */
const getAppDescription = (app) => {
  return app?.description || 
         app?.androidStore?.description || 
         app?.appleStore?.description || 
         app?.shortDescription || '';
};

/**
 * Main processing function
 */
async function processArchivedApps() {
  console.log('🗃️  AppMapDB Archived Apps Analysis - READ ONLY');
  console.log('=============================================');
  console.log('🔒 SAFETY: This script only reads data, no modifications are made');
  console.log('=============================================\n');

  const allRows = await getRows(TableName);
  const allRecords = Object.values(allRows);
  console.log(`📊 TOTAL RECORDS IN DATABASE: ${allRecords.length}\n`);

  // Apply EXACT same logic as useAppTableData.tsx for website display - filter out draft and deleted records
  const validRecords = allRecords.filter(app => 
    app.draft !== true && 
    app.delete !== true
  );
  
  console.log(`📋 Valid Records for website display (not draft/deleted): ${validRecords.length}`);

  // For archive analysis, we need to include ALL non-draft records (including deleted ones)
  // This allows us to find apps that had approved versions which were later deleted
  const recordsForArchiveAnalysis = allRecords.filter(app => 
    app.draft !== true // Only exclude drafts, include deleted records for analysis
  );
  
  console.log(`📋 Records for archive analysis (not draft, includes deleted): ${recordsForArchiveAnalysis.length}`);

  // Apply the EXACT same logic as useAppTableData.tsx for website grouping (non-deleted records)
  const data = validRecords.map(app => ({
    _id: app._id,
    created: app.created,
    approved: app.approved,
    groupId: isEmpty(app.groupId) ? app._id : app.groupId,
    name: app.name,
    fullApp: app // Store full app for reference
  }));
  
  // Also create data for archive analysis (includes deleted records)
  const allDataForArchiveAnalysis = recordsForArchiveAnalysis.map(app => ({
    _id: app._id,
    created: app.created,
    approved: app.approved,
    deleted: app.delete === true,
    groupId: isEmpty(app.groupId) ? app._id : app.groupId,
    name: app.name,
    fullApp: app // Store full app for reference
  }));
  
  // Get unique groups from ALL records (including deleted) for complete archive analysis
  const allGroupIds = allDataForArchiveAnalysis.map(r => r.groupId).filter(onlyUnique);
  console.log(`🔗 Total Unique Groups (including deleted records): ${allGroupIds.length}`);
  
  // Get unique groups from VISIBLE records only (what shows on website)  
  const visibleGroupIds = data.map(r => r.groupId).filter(onlyUnique);
  console.log(`🔗 Unique Groups visible on website: ${visibleGroupIds.length}`);

  const archivedApps = [];
  const neverApprovedApps = [];
  const approvedApps = [];
  let totalAppsOnWebsite = 0;
  let approvedAppsOnWebsite = 0;
  let archivedAppsOnWebsite = 0;
  let completelyDeletedApps = 0;

  // Process each group using EXACT logic from useAppTableData.tsx
  console.log('\n🔍 Analyzing app groups for archive status...');
  
  // Now analyze ALL groups (including those that are completely deleted)
  allGroupIds.forEach(gId => {
    
    // Get ALL records for this group (including deleted ones) for archive analysis
    const allGroupMembers = allDataForArchiveAnalysis.filter(r => r.groupId === gId);
    
    // Get visible records for this group (for website display logic)
    const visibleGroupMembers = data.filter(r => r.groupId === gId);
    
    // Determine what shows on the website for this app
    let whatShowsOnWebsite = null;
    let isArchivedFromWebsite = false;
    let isCompletelyDeleted = false;
    
    if (visibleGroupMembers.length > 0) {
      // App has visible (non-deleted) records - apply normal website logic
      totalAppsOnWebsite++;
      
      const sortedAsc = visibleGroupMembers.sort((a, b) => b.created - a.created); // Sort by newest first
      let newest = sortedAsc[0]; // Set the newest record, regardless of approval status
      
      // Search all records from newest down to find the newest approved entry
      for (let i = 0; i < sortedAsc.length; i++) {
        if (sortedAsc[i].approved === true) {
          newest = sortedAsc[i];
          break;
        }
      }
      
      whatShowsOnWebsite = newest;
      isArchivedFromWebsite = newest.approved !== true;
      
      // Count what actually shows on website
      if (newest.approved === true) {
        approvedAppsOnWebsite++;
        
        // This is an approved app - add to approved apps list
        const representativeApp = newest.fullApp;
        const earliestRating = allGroupMembers.reduce((earliest, current) => {
          if (!earliest.created || (current.created && current.created < earliest.created)) {
            return current;
          }
          return earliest;
        }, {});
        
        approvedApps.push({
          groupId: gId,
          _id: newest._id,
          appName: getAppName(representativeApp),
          company: getAppCompany(representativeApp),
          description: getAppDescription(representativeApp),
          totalRatings: allGroupMembers.length,
          totalVisibleRatings: visibleGroupMembers.length,
          pendingRatings: allGroupMembers.filter(r => r.approved !== true && r.deleted !== true).length,
          approvedNotDeletedRatings: allGroupMembers.filter(r => r.approved === true && r.deleted !== true).length,
          approvedRatingsCount: allGroupMembers.filter(r => r.approved === true).length,
          unapprovedRatingsCount: allGroupMembers.filter(r => r.approved !== true).length,
          deletedRatingsCount: allGroupMembers.filter(r => r.deleted === true).length,
          originallyAdded: formatDate(earliestRating.created),
          approvedDate: formatDate(newest.created),
          lastModified: formatDate(allGroupMembers.sort((a, b) => b.created - a.created)[0].created),
          platforms: representativeApp.platforms ? representativeApp.platforms.join(', ') : '',
          costs: representativeApp.costs ? representativeApp.costs.join(', ') : '',
          functionalities: representativeApp.functionalities ? representativeApp.functionalities.join(', ') : '',
          features: representativeApp.features ? representativeApp.features.join(', ') : '',
          inputs: representativeApp.inputs ? representativeApp.inputs.join(', ') : '',
          outputs: representativeApp.outputs ? representativeApp.outputs.join(', ') : '',
          conditions: representativeApp.conditions ? representativeApp.conditions.join(', ') : '',
          privacies: representativeApp.privacies ? representativeApp.privacies.join(', ') : '',
          uses: representativeApp.uses ? representativeApp.uses.join(', ') : '',
          clinicalFoundations: representativeApp.clinicalFoundations ? representativeApp.clinicalFoundations.join(', ') : '',
          developerTypes: representativeApp.developerTypes ? representativeApp.developerTypes.join(', ') : '',
          engagements: representativeApp.engagements ? representativeApp.engagements.join(', ') : '',
          categories: representativeApp.categories ? representativeApp.categories.join(', ') : '',
          iosLink: representativeApp.iosLink || '',
          androidLink: representativeApp.androidLink || '',
          webLink: representativeApp.webLink || '',
          originalCreatorEmail: earliestRating.fullApp?.email || '',
          approvedByEmail: newest.fullApp?.email || '',
          created: earliestRating.created,
          updated: allGroupMembers.sort((a, b) => b.created - a.created)[0].created
        });
        
      } else {
        archivedAppsOnWebsite++;
      }
      
    } else {
      // App has NO visible records (all deleted) - this doesn't show on website at all
      isCompletelyDeleted = true;
      completelyDeletedApps++;
      // Don't count in totalAppsOnWebsite since it doesn't show on website
    }
    
    // Determine if there were EVER any approved versions (including deleted ones)
    const hasEverHadApprovedVersion = allGroupMembers.some(member => member.approved === true);
    
    // If an app has deleted records, it means those records existed and were available at some point,
    // which implies they were approved before being deleted. Apps should only be "never approved" 
    // if they have NO deleted records AND no approved records.
    const hasDeletedRecords = allGroupMembers.some(member => member.deleted === true);
    
    // An app should be considered as having had approved versions if:
    // 1. It has records explicitly marked as approved, OR
    // 2. It has deleted records (implies they were approved before deletion)
    const shouldBeConsideredArchived = hasEverHadApprovedVersion || hasDeletedRecords;
    
    // An app is considered "archived" ONLY if:
    // 1. It had approved versions in the past AND now shows unapproved version on website, OR 
    // 2. It had approved versions in the past AND all records are now deleted, OR
    // 3. It has deleted records (implying previous approval)
    const isActuallyArchived = shouldBeConsideredArchived && (isArchivedFromWebsite || isCompletelyDeleted);
    
    // Track never-approved apps (apps that show on website but have never had approved versions)
    if ((isArchivedFromWebsite || isCompletelyDeleted) && !shouldBeConsideredArchived) {
      // This is a never-approved app
      const representativeApp = (whatShowsOnWebsite && whatShowsOnWebsite.fullApp) || 
                               allGroupMembers.sort((a, b) => b.created - a.created)[0].fullApp;
      
      const earliestRating = allGroupMembers.reduce((earliest, current) => {
        if (!earliest.created || (current.created && current.created < earliest.created)) {
          return current;
        }
        return earliest;
      }, {});
      
      const latestRating = allGroupMembers.sort((a, b) => b.created - a.created)[0];

      neverApprovedApps.push({
        groupId: gId,
        _id: (whatShowsOnWebsite && whatShowsOnWebsite._id) || latestRating._id,
        appName: getAppName(representativeApp),
        company: getAppCompany(representativeApp),
        description: getAppDescription(representativeApp),
        totalRatings: allGroupMembers.length,
        totalVisibleRatings: visibleGroupMembers.length,
        pendingRatings: allGroupMembers.filter(r => r.approved !== true && r.deleted !== true).length,
        approvedNotDeletedRatings: allGroupMembers.filter(r => r.approved === true && r.deleted !== true).length,
        originallyAdded: formatDate(earliestRating.created),
        lastModified: formatDate(latestRating.created),
        deletedRatingsCount: allGroupMembers.filter(r => r.deleted === true).length,
        isCompletelyDeleted: isCompletelyDeleted,
        status: isCompletelyDeleted ? 'Completely Deleted' : 'Shows Unapproved Version',
        platforms: representativeApp.platforms ? representativeApp.platforms.join(', ') : '',
        costs: representativeApp.costs ? representativeApp.costs.join(', ') : '',
        functionalities: representativeApp.functionalities ? representativeApp.functionalities.join(', ') : '',
        features: representativeApp.features ? representativeApp.features.join(', ') : '',
        inputs: representativeApp.inputs ? representativeApp.inputs.join(', ') : '',
        outputs: representativeApp.outputs ? representativeApp.outputs.join(', ') : '',
        conditions: representativeApp.conditions ? representativeApp.conditions.join(', ') : '',
        privacies: representativeApp.privacies ? representativeApp.privacies.join(', ') : '',
        uses: representativeApp.uses ? representativeApp.uses.join(', ') : '',
        clinicalFoundations: representativeApp.clinicalFoundations ? representativeApp.clinicalFoundations.join(', ') : '',
        developerTypes: representativeApp.developerTypes ? representativeApp.developerTypes.join(', ') : '',
        engagements: representativeApp.engagements ? representativeApp.engagements.join(', ') : '',
        categories: representativeApp.categories ? representativeApp.categories.join(', ') : '',
        iosLink: representativeApp.iosLink || '',
        androidLink: representativeApp.androidLink || '',
        webLink: representativeApp.webLink || '',
        originalCreatorEmail: earliestRating.fullApp?.email || '',
        lastModifiedByEmail: latestRating.fullApp?.email || '',
        created: earliestRating.created,
        updated: latestRating.created
      });
    }
    
    if (isActuallyArchived) {

      // Find the earliest created date (when app was originally added)
      const earliestRating = allGroupMembers.reduce((earliest, current) => {
        if (!earliest.created || (current.created && current.created < earliest.created)) {
          return current;
        }
        return earliest;
      }, {});

      // Find the latest date when app became archived
      let latestArchiveAction;
      
      if (visibleGroupMembers.length === 0) {
        // All records deleted - find the most recently deleted approved record
        const deletedApproved = allGroupMembers.filter(r => r.deleted && r.approved);
        const deletedAny = allGroupMembers.filter(r => r.deleted);
        latestArchiveAction = (deletedApproved.length > 0 ? deletedApproved : deletedAny)
          .sort((a, b) => b.created - a.created)[0] || allGroupMembers[0];
      } else if (hasEverHadApprovedVersion) {
        // Has visible records but showing unapproved - find when became archived
        const approvedVersions = allGroupMembers.filter(r => r.approved === true);
        const lastApprovedDeleted = approvedVersions.filter(r => r.deleted).sort((a, b) => b.created - a.created)[0];
        const latestUnapproved = allGroupMembers.filter(r => r.approved !== true).sort((a, b) => b.created - a.created)[0];
        
        latestArchiveAction = lastApprovedDeleted || latestUnapproved || whatShowsOnWebsite;
      } else {
        // Never had approved version
        latestArchiveAction = allGroupMembers.filter(r => r.approved !== true).sort((a, b) => b.created - a.created)[0] || allGroupMembers[0];
      }

      // Get app details from the representative app
      const representativeApp = (whatShowsOnWebsite && whatShowsOnWebsite.fullApp) || latestArchiveAction.fullApp;

      archivedApps.push({
        groupId: gId,
        _id: (whatShowsOnWebsite && whatShowsOnWebsite._id) || latestArchiveAction._id,
        appName: getAppName(representativeApp),
        company: getAppCompany(representativeApp),
        description: getAppDescription(representativeApp),
        totalRatings: allGroupMembers.length,
        totalVisibleRatings: visibleGroupMembers.length,
        pendingRatings: allGroupMembers.filter(r => r.approved !== true && r.deleted !== true).length,
        approvedNotDeletedRatings: allGroupMembers.filter(r => r.approved === true && r.deleted !== true).length,
        originallyAdded: formatDate(earliestRating.created),
        dateArchived: formatDate(latestArchiveAction.created),
        approvedRatingsCount: allGroupMembers.filter(r => r.approved === true).length,
        unapprovedRatingsCount: allGroupMembers.filter(r => r.approved !== true).length,
        deletedRatingsCount: allGroupMembers.filter(r => r.deleted === true).length,
        hasEverHadApprovedVersion: shouldBeConsideredArchived,
        archiveReason: hasEverHadApprovedVersion 
          ? 'Previously had approved versions that were removed/deleted or superseded by newer unapproved versions'
          : hasDeletedRecords 
          ? 'Has deleted records - implies previous approval before deletion'
          : 'Previously approved but current approval status unclear',
        platforms: representativeApp.platforms ? representativeApp.platforms.join(', ') : '',
        costs: representativeApp.costs ? representativeApp.costs.join(', ') : '',
        functionalities: representativeApp.functionalities ? representativeApp.functionalities.join(', ') : '',
        features: representativeApp.features ? representativeApp.features.join(', ') : '',
        inputs: representativeApp.inputs ? representativeApp.inputs.join(', ') : '',
        outputs: representativeApp.outputs ? representativeApp.outputs.join(', ') : '',
        conditions: representativeApp.conditions ? representativeApp.conditions.join(', ') : '',
        privacies: representativeApp.privacies ? representativeApp.privacies.join(', ') : '',
        uses: representativeApp.uses ? representativeApp.uses.join(', ') : '',
        clinicalFoundations: representativeApp.clinicalFoundations ? representativeApp.clinicalFoundations.join(', ') : '',
        developerTypes: representativeApp.developerTypes ? representativeApp.developerTypes.join(', ') : '',
        engagements: representativeApp.engagements ? representativeApp.engagements.join(', ') : '',
        categories: representativeApp.categories ? representativeApp.categories.join(', ') : '',
        iosLink: representativeApp.iosLink || '',
        androidLink: representativeApp.androidLink || '',
        webLink: representativeApp.webLink || '',
        originalCreatorEmail: earliestRating.fullApp?.email || '',
        lastModifiedByEmail: latestArchiveAction.fullApp?.email || '',
        created: earliestRating.created,
        updated: latestArchiveAction.created
      });
    }
  });

  // Sort by date archived (most recent first)
  archivedApps.sort((a, b) => {
    const dateA = new Date(a.dateArchived || '1970-01-01');
    const dateB = new Date(b.dateArchived || '1970-01-01');
    return dateB - dateA;
  });

  // Sort approved apps by approval date (most recent first)
  approvedApps.sort((a, b) => {
    const dateA = new Date(a.approvedDate || '1970-01-01');
    const dateB = new Date(b.approvedDate || '1970-01-01');
    return dateB - dateA;
  });

  // Output detailed analysis to console
  console.log('\n📊 ARCHIVED APPS ANALYSIS RESULTS');
  console.log('=================================');
  console.log(`🌐 Total apps that show on website: ${totalAppsOnWebsite}`);
  console.log(`✅ Apps showing approved versions: ${approvedAppsOnWebsite}`);
  console.log(`🗃️  Apps showing unapproved versions (archived): ${archivedAppsOnWebsite}`);
  console.log(`🗑️  Apps completely deleted (not on website): ${completelyDeletedApps}`);
  console.log(`📉 Percentage of website apps that are archived: ${totalAppsOnWebsite > 0 ? ((archivedAppsOnWebsite / totalAppsOnWebsite) * 100).toFixed(1) : 0}%`);
  
  const totalArchivedForAnalysis = archivedApps.length;
  
  console.log(`\n✅ APPROVED APPS (${approvedApps.length} total):`);
  console.log(`=========================================`);
  console.log(`🎉 Apps currently showing approved versions on website: ${approvedApps.length}`);
  
  console.log(`\n🔍 ARCHIVED APPS (${totalArchivedForAnalysis} total):`);
  console.log(`===============================================`);
  console.log(`🗃️  Apps that previously had approved versions but are now archived: ${totalArchivedForAnalysis}`);
  
  console.log(`\n📝 NEVER-APPROVED APPS (${neverApprovedApps.length} total):`);
  console.log(`=============================================`);
  console.log(`❌ Apps that have never had any approved versions: ${neverApprovedApps.length}`);
  const neverApprovedVisible = neverApprovedApps.filter(app => !app.isCompletelyDeleted).length;
  const neverApprovedDeleted = neverApprovedApps.filter(app => app.isCompletelyDeleted).length;
  console.log(`   - Showing unapproved versions on website: ${neverApprovedVisible}`);
  console.log(`   - Completely deleted: ${neverApprovedDeleted}`);
  
  console.log('\n✅ TOP 10 MOST RECENTLY APPROVED APPS:');
  console.log('=====================================');
  
  approvedApps.slice(0, 10).forEach((app, index) => {
    console.log(`${index + 1}. ✅ "${app.appName}" - Approved: ${app.approvedDate}`);
    console.log(`      Total ratings: ${app.totalRatings} (${app.approvedRatingsCount} approved, ${app.unapprovedRatingsCount} unapproved, ${app.deletedRatingsCount} deleted)`);
    console.log(`      Company: ${app.company || 'Not specified'}`);
  });
  
  if (approvedApps.length > 10) {
    console.log(`   ... and ${approvedApps.length - 10} more approved apps`);
  }
  
  console.log('\n🏆 TOP 10 MOST RECENTLY ARCHIVED APPS:');
  console.log('=====================================');
  
  archivedApps.slice(0, 10).forEach((app, index) => {
    console.log(`${index + 1}. 🗃️ "${app.appName}" - Archived: ${app.dateArchived}`);
    console.log(`      Total ratings: ${app.totalRatings} (${app.approvedRatingsCount} approved, ${app.unapprovedRatingsCount} unapproved, ${app.deletedRatingsCount} deleted)`);
    console.log(`      Reason: ${app.archiveReason}`);
  });
  
  if (archivedApps.length > 10) {
    console.log(`   ... and ${archivedApps.length - 10} more archived apps`);
  }
  
  // Sort never-approved apps by date added (most recent first)
  neverApprovedApps.sort((a, b) => {
    const dateA = new Date(a.originallyAdded || '1970-01-01');
    const dateB = new Date(b.originallyAdded || '1970-01-01');
    return dateB - dateA;
  });
  
  if (neverApprovedApps.length > 0) {
    console.log('\n❌ TOP 10 MOST RECENTLY ADDED NEVER-APPROVED APPS:');
    console.log('==================================================');
    
    neverApprovedApps.slice(0, 10).forEach((app, index) => {
      console.log(`${index + 1}. ❌ "${app.appName}" - Added: ${app.originallyAdded}`);
      console.log(`      Total ratings: ${app.totalRatings} (all unapproved, ${app.deletedRatingsCount} deleted)`);
      console.log(`      Status: ${app.status}`);
    });
    
    if (neverApprovedApps.length > 10) {
      console.log(`   ... and ${neverApprovedApps.length - 10} more never-approved apps`);
    }
  }

  // Generate CSV with comprehensive columns (matching exportTableCsv structure)
  const columns = [
    'groupId',
    '_id',
    'appName',
    'company', 
    'description',
    'originallyAdded',
    'dateArchived',
    'totalRatings',
    'totalVisibleRatings',
    'pendingRatings',
    'approvedNotDeletedRatings',
    'approvedRatingsCount',
    'unapprovedRatingsCount',
    'deletedRatingsCount',
    'hasEverHadApprovedVersion',
    'archiveReason',
    'platforms',
    'costs',
    'functionalities',
    'features',
    'inputs',
    'outputs',
    'conditions',
    'privacies',
    'uses',
    'clinicalFoundations',
    'developerTypes',
    'engagements',
    'categories',
    'iosLink',
    'androidLink', 
    'webLink',
    'originalCreatorEmail',
    'lastModifiedByEmail',
    'created',
    'updated'
  ];

  const csv = getCsv(archivedApps, columns);
  const filename = `archived_apps_${new Date().toISOString().split('T')[0]}.csv`;
  
  // Generate CSV for approved apps with comprehensive columns
  const approvedColumns = [
    'groupId',
    '_id',
    'appName',
    'company', 
    'description',
    'originallyAdded',
    'approvedDate',
    'lastModified',
    'totalRatings',
    'totalVisibleRatings',
    'pendingRatings',
    'approvedNotDeletedRatings',
    'approvedRatingsCount',
    'unapprovedRatingsCount',
    'deletedRatingsCount',
    'platforms',
    'costs',
    'functionalities',
    'features',
    'inputs',
    'outputs',
    'conditions',
    'privacies',
    'uses',
    'clinicalFoundations',
    'developerTypes',
    'engagements',
    'categories',
    'iosLink',
    'androidLink', 
    'webLink',
    'originalCreatorEmail',
    'approvedByEmail',
    'created',
    'updated'
  ];

  const approvedCsv = getCsv(approvedApps, approvedColumns);
  const approvedFilename = `approved_apps_${new Date().toISOString().split('T')[0]}.csv`;
  
  // Generate CSV for never-approved apps with similar columns
  const neverApprovedColumns = [
    'groupId',
    '_id',
    'appName',
    'company', 
    'description',
    'originallyAdded',
    'lastModified',
    'totalRatings',
    'totalVisibleRatings',
    'pendingRatings',
    'approvedNotDeletedRatings',
    'deletedRatingsCount',
    'isCompletelyDeleted',
    'status',
    'platforms',
    'costs',
    'functionalities',
    'features',
    'inputs',
    'outputs',
    'conditions',
    'privacies',
    'uses',
    'clinicalFoundations',
    'developerTypes',
    'engagements',
    'categories',
    'iosLink',
    'androidLink', 
    'webLink',
    'originalCreatorEmail',
    'lastModifiedByEmail',
    'created',
    'updated'
  ];

  const neverApprovedCsv = getCsv(neverApprovedApps, neverApprovedColumns);
  const neverApprovedFilename = `never_approved_apps_${new Date().toISOString().split('T')[0]}.csv`;
  
  console.log(`\n💾 EXPORTING RESULTS:`);
  console.log(`====================`);
  console.log(`📄 Writing ${approvedFilename}...`);
  await fs.writeFileSync(approvedFilename, approvedCsv);
  console.log(`✅ Done! Exported ${approvedApps.length} approved apps to ${approvedFilename}`);
  
  console.log(`📄 Writing ${filename}...`);
  await fs.writeFileSync(filename, csv);
  console.log(`✅ Done! Exported ${archivedApps.length} archived apps to ${filename}`);
  
  console.log(`📄 Writing ${neverApprovedFilename}...`);
  await fs.writeFileSync(neverApprovedFilename, neverApprovedCsv);
  console.log(`✅ Done! Exported ${neverApprovedApps.length} never-approved apps to ${neverApprovedFilename}`);
  
  // Also save detailed analysis data as JSON for debugging
  const analysisFilename = `archived_apps_analysis_${new Date().toISOString().split('T')[0]}.json`;
  const analysisData = {
    metadata: {
      totalRecords: allRecords.length,
      validRecords: validRecords.length,
      uniqueGroups: allGroupIds.length,
      totalAppsOnWebsite: totalAppsOnWebsite,
      approvedAppsOnWebsite: approvedAppsOnWebsite,
      archivedAppsOnWebsite: archivedAppsOnWebsite,
      completelyDeletedApps: completelyDeletedApps,
      totalApprovedApps: approvedApps.length,
      totalArchivedForAnalysis: archivedApps.length,
      totalNeverApprovedApps: neverApprovedApps.length,
      generatedAt: new Date().toISOString()
    },
    approvedApps: approvedApps,
    archivedApps: archivedApps,
    neverApprovedApps: neverApprovedApps,
    // Sample of non-archived apps for comparison
    sampleApprovedApps: visibleGroupIds.slice(0, 10).map(gId => {
      const groupMembers = data.filter(r => r.groupId === gId);
      const allGroupMembers = allDataForArchiveAnalysis.filter(r => r.groupId === gId);
      const sortedAsc = groupMembers.sort((a, b) => b.created - a.created);
      let newest = sortedAsc[0];
      
      for (let i = 0; i < sortedAsc.length; i++) {
        if (sortedAsc[i].approved === true) {
          newest = sortedAsc[i];
          break;
        }
      }
      
      return {
        groupId: gId,
        isArchived: newest.approved !== true,
        whatShowsOnWebsite: {
          _id: newest._id,
          approved: newest.approved,
          name: getAppName(newest.fullApp)
        },
        allRecordsInGroup: allGroupMembers.map(m => ({
          _id: m._id,
          approved: m.approved,
          deleted: m.deleted,
          created: formatDate(m.created),
          name: getAppName(m.fullApp)
        }))
      };
    })
  };
  
  const analysisJson = JSON.stringify(analysisData, null, 2);
  await fs.writeFileSync(analysisFilename, analysisJson);
  console.log(`📊 Analysis data saved to: ${analysisFilename}`);
  
  const dbFilename = `database_dump_${new Date().toISOString().split('T')[0]}.json`;
  
  console.log(`\n💡 VERIFICATION SUMMARY:`);
  console.log(`=======================`);
  console.log(`🌐 Check your website - it should show ${approvedAppsOnWebsite} approved apps`);
  console.log(`🌐 Website also shows ${archivedAppsOnWebsite} unapproved apps (archived - no approved version visible)`);
  console.log(`📊 Database contains ${allRecords.length} total records`);
  console.log(`📋 Shows ${totalAppsOnWebsite} unique apps on website (${approvedAppsOnWebsite} approved + ${archivedAppsOnWebsite} archived)`);
  console.log(`�️  ${completelyDeletedApps} apps are completely deleted (not visible on website)`);
  console.log(`📈 ${totalAppsOnWebsite > 0 ? ((archivedAppsOnWebsite / totalAppsOnWebsite) * 100).toFixed(1) : 0}% of website apps are showing archived versions`);
  
  console.log(`\n📁 FILES GENERATED:`);
  console.log(`==================`);
  console.log(`📄 Approved Apps CSV: ${approvedFilename} (${approvedApps.length} records)`);
  console.log(`📄 Archived Apps CSV: ${filename} (${archivedApps.length} records)`);
  console.log(`📄 Never-Approved Apps CSV: ${neverApprovedFilename} (${neverApprovedApps.length} records)`);
  console.log(`📊 Analysis JSON: ${analysisFilename}`);
  console.log(`💾 Full Database: ${dbFilename}`);
  
  console.log(`\n🧮 CSV FILES SUMMARY:`);
  console.log(`=====================`);
  console.log(`✅ Approved Apps: ${approvedApps.length} records`);
  console.log(`🗃️  Archived Apps: ${archivedApps.length} records`);
  console.log(`❌ Never-Approved Apps: ${neverApprovedApps.length} records`);
  console.log(`🗑️  Completely Deleted Apps: ${completelyDeletedApps} (included in other categories)`);
  console.log(`📊 Total Categorized: ${approvedApps.length + archivedApps.length + neverApprovedApps.length}`);
  console.log(`🌐 Apps on Website: ${totalAppsOnWebsite} (${approvedApps.length} approved + ${archivedAppsOnWebsite} showing unapproved)`);
  
  // Verification math
  const totalCategorized = approvedApps.length + archivedApps.length + neverApprovedApps.length;
  const expectedTotal = allGroupIds.length;
  if (totalCategorized === expectedTotal) {
    console.log(`✅ Verification: All ${expectedTotal} app groups properly categorized`);
  } else {
    console.log(`❌ Warning: Categorized ${totalCategorized} but expected ${expectedTotal} app groups`);
  }
  
  return {
    totalRecords: allRecords.length,
    validRecords: validRecords.length,
    uniqueGroups: allGroupIds.length,
    totalAppsOnWebsite: totalAppsOnWebsite,
    approvedAppsOnWebsite: approvedAppsOnWebsite,
    archivedAppsOnWebsite: archivedAppsOnWebsite,
    completelyDeletedApps: completelyDeletedApps,
    totalApprovedApps: approvedApps.length,
    totalArchivedForAnalysis: archivedApps.length,
    totalNeverApprovedApps: neverApprovedApps.length,
    approvedFilename,
    filename,
    neverApprovedFilename,
    analysisFilename,
    dbFilename,
    approvedApps,
    archivedApps,
    neverApprovedApps
  };
}

// Main execution
(async function main() {
  try {
    console.log('🚀 Starting archived apps analysis...\n');
    const result = await processArchivedApps();
    console.log('\n🎉 Script completed successfully!');
    console.log(`📁 Results saved to: ${result.filename}`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running script:', error);
    process.exit(1);
  }
})();