const fs = require('fs');
const path = require('path');

/**
 * Validation script to check for overlaps between approved, archived, and never-approved app lists
 */

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  
  const appNameIndex = headers.indexOf('appName');
  const groupIdIndex = headers.indexOf('groupId');
  
  if (appNameIndex === -1) {
    console.log(`❌ appName column not found in ${filePath}`);
    return [];
  }
  
  if (groupIdIndex === -1) {
    console.log(`❌ groupId column not found in ${filePath}`);
    return [];
  }
  
  const apps = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
    if (values[appNameIndex] && values[appNameIndex].trim() && values[groupIdIndex]) {
      apps.push({
        appName: values[appNameIndex].trim(),
        groupId: values[groupIdIndex].trim(),
        line: i + 1
      });
    }
  }
  
  return apps;
}

function validateAppLists() {
  console.log('🔍 Validating app list segregation...\n');
  
  // Get today's date for file naming
  const today = new Date().toISOString().split('T')[0];
  
  // Load all three CSV files
  const approvedApps = parseCsv(`approved_apps_${today}.csv`);
  const archivedApps = parseCsv(`archived_apps_${today}.csv`);
  const neverApprovedApps = parseCsv(`never_approved_apps_${today}.csv`);
  
  console.log(`📊 Loaded data:`);
  console.log(`   Approved apps: ${approvedApps.length}`);
  console.log(`   Archived apps: ${archivedApps.length}`);
  console.log(`   Never-approved apps: ${neverApprovedApps.length}\n`);
  
  // Create sets for efficient lookup using GROUP IDs (not app names)
  const approvedGroupIds = new Set(approvedApps.map(app => app.groupId));
  const archivedGroupIds = new Set(archivedApps.map(app => app.groupId));
  const neverApprovedGroupIds = new Set(neverApprovedApps.map(app => app.groupId));
  
  let hasOverlap = false;
  
  // Check for overlaps between approved and archived (by Group ID)
  console.log('🔍 Checking approved vs archived apps (by Group ID)...');
  const approvedInArchived = [...approvedGroupIds].filter(id => archivedGroupIds.has(id));
  
  if (approvedInArchived.length > 0) {
    hasOverlap = true;
    console.log(`❌ Found ${approvedInArchived.length} Group IDs that appear in BOTH approved and archived lists:`);
    approvedInArchived.forEach(groupId => {
      const approvedApp = approvedApps.find(app => app.groupId === groupId);
      const archivedApp = archivedApps.find(app => app.groupId === groupId);
      console.log(`   - GroupID: ${groupId}`);
      console.log(`     Approved: "${approvedApp?.appName}"`);
      console.log(`     Archived: "${archivedApp?.appName}"`);
    });
  }
  
  // Check for overlaps between approved and never-approved (by Group ID)
  console.log('\n🔍 Checking approved vs never-approved apps (by Group ID)...');
  const approvedInNeverApproved = [...approvedGroupIds].filter(id => neverApprovedGroupIds.has(id));
  
  if (approvedInNeverApproved.length > 0) {
    hasOverlap = true;
    console.log(`❌ Found ${approvedInNeverApproved.length} Group IDs that appear in BOTH approved and never-approved lists:`);
    approvedInNeverApproved.forEach(groupId => {
      const approvedApp = approvedApps.find(app => app.groupId === groupId);
      const neverApprovedApp = neverApprovedApps.find(app => app.groupId === groupId);
      console.log(`   - GroupID: ${groupId}`);
      console.log(`     Approved: "${approvedApp?.appName}"`);
      console.log(`     Never-Approved: "${neverApprovedApp?.appName}"`);
    });
  }
  
  // Check for overlaps between archived and never-approved (by Group ID)
  console.log('\n🔍 Checking archived vs never-approved apps (by Group ID)...');
  const archivedInNeverApproved = [...archivedGroupIds].filter(id => neverApprovedGroupIds.has(id));
  
  if (archivedInNeverApproved.length > 0) {
    hasOverlap = true;
    console.log(`❌ Found ${archivedInNeverApproved.length} Group IDs that appear in BOTH archived and never-approved lists:`);
    archivedInNeverApproved.forEach(groupId => {
      const archivedApp = archivedApps.find(app => app.groupId === groupId);
      const neverApprovedApp = neverApprovedApps.find(app => app.groupId === groupId);
      console.log(`   - GroupID: ${groupId}`);
      console.log(`     Archived: "${archivedApp?.appName}"`);
      console.log(`     Never-Approved: "${neverApprovedApp?.appName}"`);
    });
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  if (!hasOverlap) {
    console.log('✅ VALIDATION PASSED: No overlaps found between any app lists!');
    console.log('   - Each Group ID appears in exactly one list');
    console.log('   - Perfect app segregation by Group ID');
  } else {
    console.log('❌ VALIDATION FAILED: Overlaps found between app lists!');
    console.log('   Please review the categorization logic in outputArchivedApps.js');
  }
  console.log('='.repeat(60));
  
  // Check totals using Group IDs
  const totalUniqueGroupIds = new Set([...approvedGroupIds, ...archivedGroupIds, ...neverApprovedGroupIds]).size;
  const totalAppsInLists = approvedApps.length + archivedApps.length + neverApprovedApps.length;
  
  console.log(`\n📊 Summary Statistics:`);
  console.log(`   Total unique Group IDs across all lists: ${totalUniqueGroupIds}`);
  console.log(`   Total apps in all lists combined: ${totalAppsInLists}`);
  
  if (totalUniqueGroupIds === totalAppsInLists) {
    console.log('✅ Perfect segregation: Each Group ID appears in exactly one list');
  } else {
    console.log(`❌ Segregation issue: ${totalAppsInLists - totalUniqueGroupIds} duplicate Group ID entries detected`);
  }
  
  // Show apps with duplicate names but different group IDs
  console.log(`\n🔍 Checking for apps with same name but different Group IDs...`);
  const allApps = [...approvedApps, ...archivedApps, ...neverApprovedApps];
  const appNameGroups = {};
  
  allApps.forEach(app => {
    if (!appNameGroups[app.appName]) {
      appNameGroups[app.appName] = [];
    }
    appNameGroups[app.appName].push(app.groupId);
  });
  
  const duplicateNames = Object.entries(appNameGroups)
    .filter(([name, groupIds]) => new Set(groupIds).size > 1)
    .map(([name, groupIds]) => ({ name, uniqueGroupIds: [...new Set(groupIds)] }));
  
  if (duplicateNames.length > 0) {
    console.log(`⚠️  Found ${duplicateNames.length} app names that appear with multiple Group IDs:`);
    duplicateNames.forEach(({ name, uniqueGroupIds }) => {
      console.log(`   - "${name}": ${uniqueGroupIds.length} different Group IDs`);
      uniqueGroupIds.forEach(groupId => {
        const app = allApps.find(app => app.appName === name && app.groupId === groupId);
        const listType = approvedGroupIds.has(groupId) ? 'Approved' : 
                        archivedGroupIds.has(groupId) ? 'Archived' : 'Never-Approved';
        console.log(`     ${groupId} (${listType})`);
      });
    });
    console.log(`\n💡 This is expected behavior - same app names can have different Group IDs`);
  } else {
    console.log('✅ All app names have unique Group IDs');
  }
}

// Run the validation
validateAppLists();