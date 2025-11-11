const AWS = require('aws-sdk');

// ===================================================================
// 🔒 SAFETY NOTICE: READ-ONLY ANALYSIS SCRIPT
// ===================================================================
// This script ONLY READS data from the database for analysis.
// NO database modifications are performed.
// Operations used: dynamo.scan() ONLY
// Safe operations: Read, analyze, console output
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

const getRows = async TableName => {
  console.log('� Downloading database snapshot...');
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
  
  console.log(`\n✅ Download complete: ${scanResults.length} total records\n`);
  
  return scanResults.reduce((f, c) => {
    f[c._id] = c;
    return f;
  }, {});
};

const analyzeData = async () => {
  console.log('🔍 AppMapDB Data Analysis - READ ONLY');
  console.log('=====================================');
  console.log('🔒 SAFETY: This script only reads data, no modifications are made');
  console.log('=====================================\n');
  
  const apps = await getRows(TableName);
  const allRecords = Object.values(apps);
  
  console.log(`📊 TOTAL RECORDS IN DATABASE: ${allRecords.length}\n`);
  
  // Filter out draft and deleted records (same logic as useAppTableData)
  const validRecords = allRecords.filter(app => 
    app.draft !== true && 
    app.delete !== true
  );
  
  console.log(`📋 Valid Records (not draft/deleted): ${validRecords.length}`);
  
  // Apply the EXACT same logic as useAppTableData.tsx
  const data = validRecords.map(app => ({
    _id: app._id,
    created: app.created,
    approved: app.approved,
    groupId: isEmpty(app.groupId) ? app._id : app.groupId,
    name: app.name,
    fullApp: app // Store full app for reference
  }));
  
  const groupIds = data.map(r => r.groupId).filter(onlyUnique);
  console.log(`🔗 Unique Groups (by groupId): ${groupIds.length}`);
  
  let recordsToKeep = [];
  let recordsToRemove = [];
  let approvedAppsCount = 0;
  let groupsWithNoApproved = 0;
  let newerUnapprovedRecords = [];
  
  // STEP 1: Process each group using EXACT logic from useAppTableData.tsx (for WEBSITE DISPLAY)
  const filteredData = groupIds.map(gId => {
    // For each group id find the most recently created
    const groupMembers = data.filter(r => r.groupId === gId);
    const sortedAsc = groupMembers.sort((a, b) => b.created - a.created); // Sort by newest first
    
    let newest = sortedAsc[0]; // Set the newest record, regardless of approval status
    
    // Search all records from newest down to find the newest approved entry
    for (let i = 0; i < sortedAsc.length; i++) {
      if (sortedAsc[i].approved === true) {
        newest = sortedAsc[i];
        break;
      }
    }
    
    // Keep the record that shows on website
    recordsToKeep.push(newest);
    
    // Count approved apps that would show on website
    if (newest.approved === true) {
      approvedAppsCount++;
    } else {
      groupsWithNoApproved++;
    }
    
    return newest;
  });
  
  // STEP 2: Keep ALL unapproved records for PENDING TAB (usePendingAppData logic)
  // The pending tab shows ALL unapproved records, not just website display records
  const allUnapprovedRecords = data.filter(record => record.approved !== true);
  console.log(`⏳ Total unapproved records in database: ${allUnapprovedRecords.length}`);
  
  // STEP 3: Keep records that serve as groupId references (preserve app history relationships)
  // Find all unique groupIds that other records reference
  const referencedGroupIds = new Set();
  data.forEach(record => {
    referencedGroupIds.add(record.groupId);
  });
  
  // Keep any record whose _id is used as a groupId by other records
  // This ensures app history dialog can find the "parent" record
  let relationshipRecordsAdded = 0;
  data.forEach(record => {
    if (referencedGroupIds.has(record._id)) {
      const alreadyAdded = recordsToKeep.some(existing => existing._id === record._id);
      if (!alreadyAdded) {
        recordsToKeep.push(record);
        relationshipRecordsAdded++;
      }
    }
  });

  // STEP 4: Determine what can be removed (old approved records that don't break relationships)
  const allApprovedRecords = data.filter(record => record.approved === true);
  allApprovedRecords.forEach(record => {
    const isKept = recordsToKeep.some(existing => existing._id === record._id);
    if (!isKept) {
      recordsToRemove.push(record);
    }
  });
  
  console.log(`\n📈 WEBSITE DISPLAY ANALYSIS (Exact useAppTableData Logic):`);
  console.log(`========================================================`);
  console.log(`✅ Apps that would show on website: ${filteredData.length}`);
  console.log(`✅ Of these, approved apps: ${approvedAppsCount}`);
  console.log(`⚠️  Groups with no approved records (showing newest): ${groupsWithNoApproved}`);
  
  console.log(`\n📊 DATABASE CLEANUP ANALYSIS:`);
  console.log(`============================`);
  console.log(`📋 Records to keep (website display): ${groupIds.length}`);
  console.log(`📋 Records to keep (unapproved for pending tab): ${allUnapprovedRecords.length}`);
  console.log(`📋 Records to keep (relationship preservation): ${relationshipRecordsAdded}`);
  console.log(`📋 Total records to keep: ${recordsToKeep.length}`);
  console.log(`🗑️  Records that can be safely removed: ${recordsToRemove.length}`);
  console.log(`📉 Potential space savings: ${((recordsToRemove.length / allRecords.length) * 100).toFixed(1)}%`);
  
  console.log(`\n🔍 RECONCILIATION BREAKDOWN:`);
  console.log(`===========================`);
  console.log(`🌐 Website shows: ${approvedAppsCount} approved apps`);
  console.log(`🌐 Website shows: ${groupsWithNoApproved} unapproved apps (no approved version exists)`);
  console.log(`🌐 Total website apps: ${groupIds.length}`);
  console.log(`⏳ All unapproved records kept for pending tab: ${allUnapprovedRecords.length}`);
  console.log(`🔗 Relationship records preserved for app history: ${relationshipRecordsAdded}`);
  console.log(`🗂️  Old approved records (safe to remove): ${recordsToRemove.length}`);
  
  // Additional detailed analysis
  const totalApprovedRecords = validRecords.filter(app => app.approved === true).length;
  const oldApprovedRecords = recordsToRemove.filter(r => r.approved === true);
  const oldUnapprovedRecords = recordsToRemove.filter(r => r.approved !== true);
  
  console.log(`\n🔍 DETAILED BREAKDOWN:`);
  console.log(`=====================`);
  console.log(`📊 All approved records in database: ${totalApprovedRecords}`);
  console.log(`📊 Old approved records to remove: ${oldApprovedRecords.length}`);
  console.log(`📊 Newest approved records to keep: ${totalApprovedRecords - oldApprovedRecords.length}`);
  console.log(`📊 All unapproved records to keep: ${allUnapprovedRecords.length}`);
  
  // Calculate total pending approval records (for admin pending tab comparison)
  const pendingApprovalRecords = recordsToKeep.filter(record => 
    record.approved !== true && 
    record.draft !== true && 
    record.delete !== true
  );
  
  console.log(`\n🔍 ADMIN PENDING APPROVAL TAB COMPARISON:`);
  console.log(`=======================================`);
  console.log(`⏳ Total pending approval records to keep: ${pendingApprovalRecords.length}`);
  console.log(`   (This should match your admin pending tab count of 317)`);
  
  // Show examples of newer unapproved records that will be kept
  if (newerUnapprovedRecords.length > 0) {
    console.log(`\n📝 EXAMPLES OF NEWER UNAPPROVED RECORDS (KEPT SAFE):`);
    console.log(`==================================================`);
    newerUnapprovedRecords.slice(0, 5).forEach((record, index) => {
      const createdDate = new Date(record.created).toLocaleDateString();
      console.log(`   ${index + 1}. "${record.name || 'Unknown'}" - Created: ${createdDate} (Newer than approved version)`);
    });
    if (newerUnapprovedRecords.length > 5) {
      console.log(`   ... and ${newerUnapprovedRecords.length - 5} more newer unapproved records`);
    }
  }
  let groupsWithMultipleRecords = 0;
  let groupsWithMultipleApproved = 0;
  let largestGroupSize = 0;
  let largestGroupId = null;
  
  groupIds.forEach(gId => {
    const groupMembers = data.filter(r => r.groupId === gId);
    const approvedInGroup = groupMembers.filter(app => app.approved === true);
    
    if (groupMembers.length > 1) {
      groupsWithMultipleRecords++;
    }
    
    if (approvedInGroup.length > 1) {
      groupsWithMultipleApproved++;
    }
    
    if (groupMembers.length > largestGroupSize) {
      largestGroupSize = groupMembers.length;
      largestGroupId = gId;
    }
  });
  
  console.log(`\n📊 Group Statistics:`);
  console.log(`===================`);
  console.log(`🔢 Total unique groups: ${groupIds.length}`);
  console.log(`🔢 Groups with multiple records: ${groupsWithMultipleRecords}`);
  console.log(`🔢 Groups with multiple approved versions: ${groupsWithMultipleApproved}`);
  console.log(`🏆 Largest group size: ${largestGroupSize} records`);
  
  if (largestGroupId) {
    const exampleApp = data.find(r => r.groupId === largestGroupId);
    console.log(`📱 Largest group: "${exampleApp?.name || 'Unknown'}" (groupId: ${largestGroupId})`);
  }
  
  // Show examples of what would be removed
  if (recordsToRemove.length > 0) {
    console.log(`\n🗂️  EXAMPLES OF RECORDS TO REMOVE (first 10):`);
    console.log(`===========================================`);
    recordsToRemove.slice(0, 10).forEach((record, index) => {
      const createdDate = new Date(record.created).toLocaleDateString();
      const status = record.approved ? 'APPROVED (OLD)' : 'NOT APPROVED (OLD)';
      console.log(`   ${index + 1}. "${record.name || 'Unknown'}" - ${status} (Created: ${createdDate})`);
    });
    if (recordsToRemove.length > 10) {
      console.log(`   ... and ${recordsToRemove.length - 10} more old records`);
    }
    
    console.log(`\n   📊 Breakdown of records to remove:`);
    console.log(`      🗑️  Old approved records: ${oldApprovedRecords.length}`);
    console.log(`      🗑️  Old unapproved records: ${oldUnapprovedRecords.length}`);
  }
  
  console.log(`\n💡 VERIFICATION SUMMARY:`);
  console.log(`=======================`);
  console.log(`🌐 Check your website - it should show ${approvedAppsCount} approved apps`);
  console.log(`🌐 Website also shows ${groupsWithNoApproved} unapproved apps (no approved version exists)`);
  console.log(`📊 Database contains ${allRecords.length} total records`);
  console.log(`📋 Will keep ${recordsToKeep.length} records total:`);
  console.log(`   - ${filteredData.length} records for website display (one per app)`);
  console.log(`   - ${newerUnapprovedRecords.length} newer unapproved records (pending approval)`);
  console.log(`🗑️  Can safely remove ${recordsToRemove.length} old/duplicate records:`);
  console.log(`   - ${oldApprovedRecords.length} old approved versions`);
  console.log(`   - ${oldUnapprovedRecords.length} old unapproved versions`);
  console.log(`💾 This would reduce database size by ${((recordsToRemove.length / allRecords.length) * 100).toFixed(1)}%`);
  console.log(`⚡ Final database would have ${recordsToKeep.length} records`);
  
  return {
    totalRecords: allRecords.length,
    validRecords: validRecords.length,
    uniqueGroups: groupIds.length,
    approvedAppsShownOnWebsite: approvedAppsCount,
    unapprovedAppsShownOnWebsite: groupsWithNoApproved,
    totalAppsShownOnWebsite: filteredData.length,
    newerUnapprovedRecordsKept: newerUnapprovedRecords.length,
    totalRecordsToKeep: recordsToKeep.length,
    totalRecordsToRemove: recordsToRemove.length,
    oldApprovedRecordsToRemove: oldApprovedRecords.length,
    oldUnapprovedRecordsToRemove: oldUnapprovedRecords.length,
    spaceSavingsPercent: ((recordsToRemove.length / allRecords.length) * 100).toFixed(1),
    groupsWithNoApproved: groupsWithNoApproved
  };
};

// Run the analysis
analyzeData().catch(console.error);